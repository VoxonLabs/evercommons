import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import test from "node:test";
import { SignJWT } from "jose";
import { findForbiddenClaimNames } from "../src/claims.js";
import {
  ASSERTION_TYP,
  EVERCOMMONS_ALPHA_ADULT_POLICY,
  ISSUER,
  SIGNING_ALG,
} from "../src/constants.js";
import { ShieldError } from "../src/errors.js";
import { issueAssertion } from "../src/issuer.js";
import { createKeyring, retirePreviousKeys, rotateSigningKey } from "../src/keys.js";
import { derivePairwiseSubject } from "../src/ppid.js";
import { verifyAssertion } from "../src/verifier.js";

const eligibleClaims = {
  verified_human: true,
  age_over_18: true,
  account_eligible: true,
};

function compactJwt(header, payload) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode(header)}.${encode(payload)}.`;
}

async function signArbitrary(keyring, payload, header = {}) {
  const issuedAt = payload.iat ?? Math.floor(Date.now() / 1000);
  const expiresAt = payload.exp ?? issuedAt + 300;
  const { iat, exp, nbf, iss, aud, sub, jti, ...rest } = payload;
  let token = new SignJWT(rest)
    .setProtectedHeader({
      alg: SIGNING_ALG,
      kid: keyring.current.kid,
      typ: ASSERTION_TYP,
      ...header,
    })
    .setIssuedAt(iat ?? issuedAt)
    .setExpirationTime(exp ?? expiresAt);

  if (iss !== undefined) token = token.setIssuer(iss);
  if (aud !== undefined) token = token.setAudience(aud);
  if (sub !== undefined) token = token.setSubject(sub);
  if (jti !== undefined) token = token.setJti(jti);
  if (nbf !== undefined) token = token.setNotBefore(nbf);

  return token.sign(keyring.current.privateKey);
}

async function validRawPayload(keyring, overrides = {}) {
  const iat = Math.floor(Date.now() / 1000);
  return {
    iss: ISSUER,
    aud: "evercommons",
    sub: derivePairwiseSubject({
      sectorIdentifier: "evercommons",
      localAccountId: "local-account-test-001",
      salt: keyring.salt,
    }),
    iat,
    exp: iat + 300,
    jti: "test-jti-1234567890",
    claims: { ...eligibleClaims },
    ...overrides,
  };
}

test("issuer mints a signed assertion that the verifier accepts", async () => {
  const keyring = await createKeyring();
  const issued = await issueAssertion({
    keyring,
    audience: "evercommons",
    localAccountId: "local-account-test-001",
    claims: eligibleClaims,
  });

  const verified = await verifyAssertion({
    assertion: issued.assertion,
    audience: "evercommons",
    keyring,
    policy: EVERCOMMONS_ALPHA_ADULT_POLICY,
  });

  assert.equal(verified.payload.iss, ISSUER);
  assert.equal(verified.payload.aud, "evercommons");
  assert.equal(verified.subject, issued.subject);
  assert.deepEqual(verified.claims, eligibleClaims);
  assert.equal(verified.payload.name, undefined);
  assert.equal(verified.payload.date_of_birth, undefined);
  assert.equal(verified.payload.address, undefined);
  assert.equal(verified.payload.selfie, undefined);
  assert.equal(verified.payload.provider_packet, undefined);
});

test("issuer refuses forbidden identity fields", async () => {
  const keyring = await createKeyring();
  await assert.rejects(
    () =>
      issueAssertion({
        keyring,
        audience: "evercommons",
        localAccountId: "local-account-test-001",
        claims: { ...eligibleClaims, name: "Ada" },
      }),
    (error) => error instanceof ShieldError && error.code === "INVALID_CLAIMS",
  );
});

test("verifier rejects the wrong issuer", async () => {
  const keyring = await createKeyring();
  const payload = await validRawPayload(keyring, { iss: "https://not-shield.example" });
  const assertion = await signArbitrary(keyring, payload);
  await assert.rejects(
    () => verifyAssertion({ assertion, audience: "evercommons", keyring }),
    (error) => error instanceof ShieldError && error.code === "INVALID_ISSUER",
  );
});

test("verifier rejects a cross-app audience", async () => {
  const keyring = await createKeyring();
  const issued = await issueAssertion({
    keyring,
    audience: "dating",
    localAccountId: "local-account-test-001",
    claims: eligibleClaims,
  });
  await assert.rejects(
    () =>
      verifyAssertion({
        assertion: issued.assertion,
        audience: "evercommons",
        keyring,
      }),
    (error) => error instanceof ShieldError && error.code === "INVALID_AUDIENCE",
  );
});

test("verifier rejects an expired assertion", async () => {
  const keyring = await createKeyring();
  const now = Math.floor(Date.now() / 1000);
  const payload = await validRawPayload(keyring, { iat: now - 120, exp: now - 30 });
  const assertion = await signArbitrary(keyring, payload);
  await assert.rejects(
    () => verifyAssertion({ assertion, audience: "evercommons", keyring }),
    (error) => error instanceof ShieldError && error.code === "EXPIRED",
  );
});

test("verifier rejects a tampered signature", async () => {
  const keyring = await createKeyring();
  const issued = await issueAssertion({
    keyring,
    audience: "evercommons",
    localAccountId: "local-account-test-001",
    claims: eligibleClaims,
  });
  const parts = issued.assertion.split(".");
  const sig = parts[2];
  const flipped = sig.startsWith("A") ? `B${sig.slice(1)}` : `A${sig.slice(1)}`;
  const tampered = `${parts[0]}.${parts[1]}.${flipped}`;
  await assert.rejects(
    () =>
      verifyAssertion({
        assertion: tampered,
        audience: "evercommons",
        keyring,
      }),
    (error) => error instanceof ShieldError && error.code === "INVALID_SIGNATURE",
  );
});

test("verifier rejects jku and embedded jwk headers", async () => {
  const keyring = await createKeyring();
  const payload = await validRawPayload(keyring);
  const assertion = await signArbitrary(keyring, payload, {
    jku: "https://attacker.example/jwks.json",
  });
  await assert.rejects(
    () => verifyAssertion({ assertion, audience: "evercommons", keyring }),
    (error) => error instanceof ShieldError && error.code === "INVALID_HEADER",
  );
});

test("verifier rejects forbidden identity claims after a valid signature", async () => {
  const keyring = await createKeyring();
  const payload = await validRawPayload(keyring, { name: "Ada Lovelace" });
  const assertion = await signArbitrary(keyring, payload);
  await assert.rejects(
    () => verifyAssertion({ assertion, audience: "evercommons", keyring }),
    (error) => error instanceof ShieldError && error.code === "FORBIDDEN_CLAIM",
  );
});

test("verifier rejects nested date_of_birth, selfie, and provider_packet", async () => {
  const keyring = await createKeyring();
  for (const forbidden of ["date_of_birth", "selfie", "provider_packet", "address"]) {
    const payload = await validRawPayload(keyring, {
      claims: { ...eligibleClaims, [forbidden]: "leaked" },
    });
    const assertion = await signArbitrary(keyring, payload);
    await assert.rejects(
      () => verifyAssertion({ assertion, audience: "evercommons", keyring }),
      (error) => error instanceof ShieldError && error.code === "FORBIDDEN_CLAIM",
    );
  }
});

test("verifier rejects alg none", async () => {
  const keyring = await createKeyring();
  const payload = await validRawPayload(keyring);
  const assertion = compactJwt({ alg: "none", typ: ASSERTION_TYP, kid: "none" }, payload);
  await assert.rejects(
    () => verifyAssertion({ assertion, audience: "evercommons", keyring }),
    (error) => error instanceof ShieldError,
  );
});

test("verifier rejects an unknown kid after the old key is retired", async () => {
  const keyring = await createKeyring();
  const issued = await issueAssertion({
    keyring,
    audience: "evercommons",
    localAccountId: "local-account-test-001",
    claims: eligibleClaims,
  });
  const oldKid = keyring.current.kid;
  await rotateSigningKey(keyring);
  retirePreviousKeys(keyring, oldKid);
  await assert.rejects(
    () =>
      verifyAssertion({
        assertion: issued.assertion,
        audience: "evercommons",
        keyring,
      }),
    (error) => error instanceof ShieldError && error.code === "UNKNOWN_KEY",
  );
});

test("verifier still accepts assertions during JWKS rotation overlap", async () => {
  const keyring = await createKeyring();
  const issued = await issueAssertion({
    keyring,
    audience: "evercommons",
    localAccountId: "local-account-test-001",
    claims: eligibleClaims,
  });
  await rotateSigningKey(keyring);
  const verified = await verifyAssertion({
    assertion: issued.assertion,
    audience: "evercommons",
    keyring,
  });
  assert.equal(verified.subject, issued.subject);
});

test("policy denies ineligible derived claims", async () => {
  const keyring = await createKeyring();
  const issued = await issueAssertion({
    keyring,
    audience: "evercommons",
    localAccountId: "local-account-test-001",
    claims: { verified_human: true, age_over_18: false, account_eligible: false },
  });
  await assert.rejects(
    () =>
      verifyAssertion({
        assertion: issued.assertion,
        audience: "evercommons",
        keyring,
        policy: EVERCOMMONS_ALPHA_ADULT_POLICY,
      }),
    (error) => error instanceof ShieldError && error.code === "POLICY_DENIED",
  );
});

test("pairwise subjects differ by audience and stay stable for the same pair", () => {
  const salt = Buffer.from("mock-shield-salt-not-for-production");
  const evercommonsA = derivePairwiseSubject({
    sectorIdentifier: "evercommons",
    localAccountId: "local-account-test-001",
    salt,
  });
  const evercommonsB = derivePairwiseSubject({
    sectorIdentifier: "evercommons",
    localAccountId: "local-account-test-001",
    salt,
  });
  const dating = derivePairwiseSubject({
    sectorIdentifier: "dating",
    localAccountId: "local-account-test-001",
    salt,
  });
  const otherPerson = derivePairwiseSubject({
    sectorIdentifier: "evercommons",
    localAccountId: "local-account-test-002",
    salt,
  });

  assert.equal(evercommonsA, evercommonsB);
  assert.notEqual(evercommonsA, dating);
  assert.notEqual(evercommonsA, otherPerson);
  assert.match(evercommonsA, /^ppid_[A-Za-z0-9_-]+$/);
});

test("forbidden-claim scanner finds nested identity fields", () => {
  assert.deepEqual(
    findForbiddenClaimNames({
      claims: { selfie: "raw", nested: { date_of_birth: "2000-01-01" } },
    }).sort(),
    ["date_of_birth", "selfie"],
  );
});
