import { randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { assertDerivedClaims, normalizeDerivedClaims } from "./claims.js";
import {
  ASSERTION_TYP,
  DEFAULT_TTL_SECONDS,
  ISSUER,
  MAX_TTL_SECONDS,
  SIGNING_ALG,
} from "./constants.js";
import { ShieldError } from "./errors.js";
import { derivePairwiseSubject } from "./ppid.js";

function toUnixSeconds(date) {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Issue a short-lived signed Shield assertion for one audience.
 * Local mock only: no identity provider, no HTTP, no production keys.
 *
 * @param {{
 *   keyring: { current: { kid: string, privateKey: CryptoKey }, salt: Buffer },
 *   audience: string,
 *   localAccountId: string,
 *   claims: { verified_human: boolean, age_over_18: boolean, account_eligible: boolean },
 *   ttlSeconds?: number,
 *   now?: Date,
 * }} input
 */
export async function issueAssertion({
  keyring,
  audience,
  localAccountId,
  claims,
  ttlSeconds = DEFAULT_TTL_SECONDS,
  now = new Date(),
}) {
  if (!keyring?.current?.privateKey || !keyring?.current?.kid) {
    throw new ShieldError("INVALID_KEYRING", "A current signing key is required.");
  }
  if (typeof audience !== "string" || audience.length === 0) {
    throw new ShieldError("INVALID_CLAIMS", "audience is required.");
  }
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > MAX_TTL_SECONDS) {
    throw new ShieldError(
      "INVALID_CLAIMS",
      `ttlSeconds must be an integer between 1 and ${MAX_TTL_SECONDS}.`,
    );
  }

  assertDerivedClaims(claims);

  const issuedAt = toUnixSeconds(now);
  const expiresAt = issuedAt + ttlSeconds;
  const subject = derivePairwiseSubject({
    sectorIdentifier: audience,
    localAccountId,
    salt: keyring.salt,
  });

  const payload = {
    claims: normalizeDerivedClaims(claims),
  };

  const assertion = await new SignJWT(payload)
    .setProtectedHeader({
      alg: SIGNING_ALG,
      kid: keyring.current.kid,
      typ: ASSERTION_TYP,
    })
    .setIssuer(ISSUER)
    .setAudience(audience)
    .setSubject(subject)
    .setJti(randomUUID())
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(keyring.current.privateKey);

  return {
    assertion_type: "application/jwt",
    expires_in: ttlSeconds,
    assertion,
    subject,
  };
}
