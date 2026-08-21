import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { randomBytes } from "node:crypto";
import { RP_NAME } from "./config.js";

function demoHandle() {
  return `demo-${randomBytes(4).toString("hex")}`;
}

/**
 * Passkey registration options. Discoverable credential (resident key)
 * per SimpleWebAuthn passkeys guidance. Attestation is none — attestation
 * policy is a later hard review, not this prototype.
 *
 * @see https://simplewebauthn.dev/docs/advanced/passkeys
 */
export async function createRegistrationOptions({ rpID, store, session, now }) {
  const handle = demoHandle();
  const userID = randomBytes(32);
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userName: handle,
    userDisplayName: "Local demo handle",
    userID,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
    excludeCredentials: [],
  });

  store.putChallenge(
    session.id,
    options.challenge,
    {
      type: "registration",
      handle,
      webauthnUserID: options.user.id,
    },
    now,
  );

  return options;
}

export async function finishRegistration({
  rpID,
  origin,
  store,
  session,
  response,
  now,
}) {
  const pending = store.consumeChallenge(session.id, now);
  if (!pending || pending.type !== "registration") {
    throw Object.assign(new Error("No registration challenge is pending."), {
      code: "NO_CHALLENGE",
    });
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: pending.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw Object.assign(new Error("Registration could not be verified."), {
      code: "NOT_VERIFIED",
    });
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;
  const user = store.createUser({
    handle: pending.handle,
    webauthnUserID: pending.webauthnUserID,
  });

  store.savePasskey({
    id: credential.id,
    publicKey: credential.publicKey,
    counter: credential.counter,
    transports: credential.transports,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
    localAccountId: user.localAccountId,
    webauthnUserID: pending.webauthnUserID,
  });

  store.authenticateSession(session.id, user.localAccountId, now);
  return { user, credentialId: credential.id };
}

export async function createAuthenticationOptions({ rpID, store, session, now }) {
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: [],
  });
  store.putChallenge(session.id, options.challenge, { type: "authentication" }, now);
  return options;
}

export async function finishAuthentication({
  rpID,
  origin,
  store,
  session,
  response,
  now,
}) {
  const pending = store.consumeChallenge(session.id, now);
  if (!pending || pending.type !== "authentication") {
    throw Object.assign(new Error("No authentication challenge is pending."), {
      code: "NO_CHALLENGE",
    });
  }

  const passkey = store.getPasskey(response.id);
  if (!passkey) {
    throw Object.assign(new Error("Passkey is not recognized by this local mock."), {
      code: "UNKNOWN_PASSKEY",
    });
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: pending.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
    credential: {
      id: passkey.id,
      publicKey: passkey.publicKey,
      counter: passkey.counter,
      transports: passkey.transports,
    },
  });

  if (!verification.verified) {
    throw Object.assign(new Error("Authentication could not be verified."), {
      code: "NOT_VERIFIED",
    });
  }

  passkey.counter = verification.authenticationInfo.newCounter;
  store.authenticateSession(session.id, passkey.localAccountId, now);
  return { user: store.getUser(passkey.localAccountId), credentialId: passkey.id };
}
