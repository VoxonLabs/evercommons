import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import {
  CHALLENGE_TTL_SECONDS,
  SESSION_TTL_SECONDS,
} from "./config.js";

function nowMs(now) {
  return (now ?? new Date()).getTime();
}

export function randomToken() {
  return randomBytes(32).toString("base64url");
}

export function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export class MemoryStore {
  constructor() {
    this.users = new Map();
    this.passkeysById = new Map();
    this.sessions = new Map();
    this.challenges = new Map();
  }

  createUser({ handle, webauthnUserID }) {
    const localAccountId = randomUUID();
    const user = {
      localAccountId,
      handle,
      webauthnUserID,
      createdAt: Date.now(),
    };
    this.users.set(localAccountId, user);
    return user;
  }

  getUser(localAccountId) {
    return this.users.get(localAccountId) ?? null;
  }

  savePasskey(passkey) {
    this.passkeysById.set(passkey.id, passkey);
  }

  getPasskey(id) {
    return this.passkeysById.get(id) ?? null;
  }

  passkeysForUser(localAccountId) {
    return [...this.passkeysById.values()].filter(
      (passkey) => passkey.localAccountId === localAccountId,
    );
  }

  createSession({ localAccountId = null, csrfToken = randomToken(), now } = {}) {
    const id = randomToken();
    const createdAt = nowMs(now);
    const session = {
      id,
      localAccountId,
      csrfToken,
      createdAt,
      expiresAt: createdAt + SESSION_TTL_SECONDS * 1000,
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id, now) {
    if (!id) {
      return null;
    }
    const session = this.sessions.get(id);
    if (!session) {
      return null;
    }
    if (session.expiresAt <= nowMs(now)) {
      this.sessions.delete(id);
      this.challenges.delete(id);
      return null;
    }
    return session;
  }

  authenticateSession(sessionId, localAccountId, now) {
    const session = this.getSession(sessionId, now);
    if (!session) {
      return null;
    }
    session.localAccountId = localAccountId;
    session.expiresAt = nowMs(now) + SESSION_TTL_SECONDS * 1000;
    return session;
  }

  deleteSession(id) {
    this.sessions.delete(id);
    this.challenges.delete(id);
  }

  putChallenge(sessionId, challenge, extra = {}, now) {
    this.challenges.set(sessionId, {
      challenge,
      ...extra,
      expiresAt: nowMs(now) + CHALLENGE_TTL_SECONDS * 1000,
    });
  }

  consumeChallenge(sessionId, now) {
    const record = this.challenges.get(sessionId);
    this.challenges.delete(sessionId);
    if (!record) {
      return null;
    }
    if (record.expiresAt <= nowMs(now)) {
      return null;
    }
    return record;
  }
}
