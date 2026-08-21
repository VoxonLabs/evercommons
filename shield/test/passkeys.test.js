import assert from "node:assert/strict";
import test from "node:test";
import { originAllowed } from "../src/passkeys/http.js";
import { startPasskeyServer } from "../src/passkeys/server.js";
import { MemoryStore } from "../src/passkeys/store.js";
import { createRegistrationOptions } from "../src/passkeys/ceremonies.js";
import { RP_ID } from "../src/passkeys/config.js";

async function withServer(run) {
  const started = await startPasskeyServer({ port: 0 });
  try {
    return await run(started);
  } finally {
    await started.close();
  }
}

function cookieHeader(session) {
  return `shield_session=${session.id}; shield_csrf=${session.csrfToken}`;
}

test("local pages and the browser library are served without a CDN", async () => {
  await withServer(async ({ baseUrl }) => {
    const page = await fetch(`${baseUrl}/`);
    const html = await page.text();
    assert.equal(page.status, 200);
    assert.match(html, /Local passkey prototype/);
    assert.match(html, /vendor\/simplewebauthn-browser\.js/);

    const vendor = await fetch(`${baseUrl}/vendor/simplewebauthn-browser.js`);
    const js = await vendor.text();
    assert.equal(vendor.status, 200);
    assert.match(js, /SimpleWebAuthnBrowser/);
  });
});

test("localhost origin matching is exact", () => {
  assert.equal(originAllowed("http://localhost:8787", "http://localhost:8787"), true);
  assert.equal(originAllowed("https://evil.example", "http://localhost:8787"), false);
  assert.equal(originAllowed(undefined, "http://localhost:8787"), false);
});

test("registration options are bound to localhost and consume a one-time challenge", async () => {
  const store = new MemoryStore();
  const session = store.createSession();
  const options = await createRegistrationOptions({
    rpID: RP_ID,
    store,
    session,
    now: new Date(),
  });
  assert.equal(options.rp.id, "localhost");
  assert.equal(typeof options.challenge, "string");
  assert.ok(options.challenge.length > 16);
  const first = store.consumeChallenge(session.id);
  const second = store.consumeChallenge(session.id);
  assert.equal(first.challenge, options.challenge);
  assert.equal(second, null);
});

test("cross-origin POSTs are rejected", async () => {
  await withServer(async ({ baseUrl, origin, store }) => {
    const session = store.createSession();
    const response = await fetch(`${baseUrl}/api/login/options`, {
      method: "POST",
      headers: {
        Origin: "https://attacker.example",
        "Content-Type": "application/json",
        "X-CSRF-Token": session.csrfToken,
        Cookie: cookieHeader(session),
      },
      body: "{}",
    });
    const body = await response.json();
    assert.equal(response.status, 403);
    assert.equal(body.code, "BAD_ORIGIN");
    assert.equal(origin.startsWith("http://localhost:"), true);
  });
});

test("CSRF mismatch is rejected", async () => {
  await withServer(async ({ baseUrl, origin, store }) => {
    const session = store.createSession();
    const response = await fetch(`${baseUrl}/api/login/options`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "X-CSRF-Token": "wrong-token",
        Cookie: cookieHeader(session),
      },
      body: "{}",
    });
    const body = await response.json();
    assert.equal(response.status, 403);
    assert.equal(body.code, "BAD_CSRF");
  });
});

test("Shield assertion requires a passkey session and does not leak identity fields", async () => {
  await withServer(async ({ baseUrl, origin, store }) => {
    const anonymous = store.createSession();
    const denied = await fetch(`${baseUrl}/v1/assertions`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "X-CSRF-Token": anonymous.csrfToken,
        Cookie: cookieHeader(anonymous),
      },
      body: "{}",
    });
    assert.equal(denied.status, 401);

    const user = store.createUser({
      handle: "demo-test",
      webauthnUserID: "webauthn-user-test",
    });
    const session = store.createSession({ localAccountId: user.localAccountId });
    const allowed = await fetch(`${baseUrl}/v1/assertions`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "X-CSRF-Token": session.csrfToken,
        Cookie: cookieHeader(session),
      },
      body: "{}",
    });
    const body = await allowed.json();
    assert.equal(allowed.status, 200);
    assert.equal(body.payload.aud, "evercommons");
    assert.deepEqual(body.payload.claims, {
      verified_human: true,
      age_over_18: true,
      account_eligible: true,
    });
    assert.equal(body.payload.name, undefined);
    assert.equal(body.payload.date_of_birth, undefined);
    assert.equal(body.payload.selfie, undefined);
    assert.match(body.payload.sub, /^ppid_/);
    assert.equal(body.note.includes("not a login session"), true);
  });
});

test("recovery is explicitly not implemented", async () => {
  await withServer(async ({ baseUrl }) => {
    const response = await fetch(`${baseUrl}/api/recovery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const body = await response.json();
    assert.equal(response.status, 501);
    assert.equal(body.code, "RECOVERY_NOT_IMPLEMENTED");
  });
});

test("expired sessions are dropped", () => {
  const store = new MemoryStore();
  const past = new Date(Date.now() - 60_000);
  const session = store.createSession({ now: past });
  session.expiresAt = past.getTime();
  assert.equal(store.getSession(session.id, new Date()), null);
});
