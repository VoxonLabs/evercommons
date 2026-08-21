import { createLocalJWKSet, decodeProtectedHeader, jwtVerify } from "jose";
import { assertAllowedClaimSet } from "./claims.js";
import {
  ASSERTION_TYP,
  CLOCK_TOLERANCE_SECONDS,
  FORBIDDEN_HEADER_PARAMS,
  ISSUER,
  MAX_TTL_SECONDS,
  SIGNING_ALG,
} from "./constants.js";
import { ShieldError } from "./errors.js";
import { toPublicJwks } from "./keys.js";
import { evaluatePolicy } from "./policy.js";

/**
 * @param {unknown} error
 * @returns {ShieldError}
 */
function wrapJoseError(error) {
  const name = error?.constructor?.name ?? "";
  const claim = error?.claim;
  if (name === "JWTExpired" || claim === "exp") {
    return new ShieldError("EXPIRED", "Assertion has expired.", { cause: error });
  }
  if (claim === "iss") {
    return new ShieldError("INVALID_ISSUER", "iss does not match Shield.", { cause: error });
  }
  if (claim === "aud") {
    return new ShieldError("INVALID_AUDIENCE", "aud does not match this application.", {
      cause: error,
    });
  }
  if (name === "JWSSignatureVerificationFailed") {
    return new ShieldError("INVALID_SIGNATURE", "Assertion signature is invalid.", {
      cause: error,
    });
  }
  if (name === "JWKSNoMatchingKey") {
    return new ShieldError("UNKNOWN_KEY", "No verification key matched kid.", { cause: error });
  }
  return new ShieldError("VERIFICATION_FAILED", error?.message ?? "Assertion verification failed.", {
    cause: error,
  });
}

/**
 * @param {Record<string, unknown>} header
 */
function assertProtectedHeader(header) {
  for (const param of FORBIDDEN_HEADER_PARAMS) {
    if (header[param] !== undefined) {
      throw new ShieldError(
        "INVALID_HEADER",
        `Header parameter ${param} is not allowed. Use a local JWKS bound to the issuer.`,
      );
    }
  }
  if (header.alg !== SIGNING_ALG) {
    throw new ShieldError("INVALID_HEADER", `alg must be ${SIGNING_ALG}.`);
  }
  if (typeof header.kid !== "string" || header.kid.length === 0) {
    throw new ShieldError("INVALID_HEADER", "kid is required for key rotation.");
  }
  if (typeof header.typ !== "string") {
    throw new ShieldError("INVALID_HEADER", "typ is required.");
  }
  const typ = header.typ.toLowerCase().replace(/^application\//, "");
  if (typ !== ASSERTION_TYP) {
    throw new ShieldError("INVALID_HEADER", `typ must be ${ASSERTION_TYP}.`);
  }
}

/**
 * Verify a compact Shield assertion for one application audience.
 *
 * Cryptographic checks use `jose` (RFC 7519 / RFC 8725). Shield-specific
 * checks then reject forbidden identity fields and unexpected claims.
 *
 * @param {{
 *   assertion: string,
 *   audience: string,
 *   keyring: object,
 *   policy?: { id: string, audience: string, required: Record<string, boolean> },
 *   now?: Date,
 * }} input
 */
export async function verifyAssertion({ assertion, audience, keyring, policy, now }) {
  if (typeof assertion !== "string" || assertion.length === 0) {
    throw new ShieldError("VERIFICATION_FAILED", "assertion is required.");
  }
  if (typeof audience !== "string" || audience.length === 0) {
    throw new ShieldError("VERIFICATION_FAILED", "audience is required.");
  }

  let header;
  try {
    header = decodeProtectedHeader(assertion);
  } catch (error) {
    throw new ShieldError("INVALID_HEADER", "Assertion header is not a compact JWS.", {
      cause: error,
    });
  }
  assertProtectedHeader(header);

  const JWKS = createLocalJWKSet(toPublicJwks(keyring));
  const currentEpoch = now ? Math.floor(now.getTime() / 1000) : undefined;

  let verified;
  try {
    verified = await jwtVerify(assertion, JWKS, {
      issuer: ISSUER,
      audience,
      algorithms: [SIGNING_ALG],
      typ: ASSERTION_TYP,
      maxTokenAge: `${MAX_TTL_SECONDS}s`,
      clockTolerance: CLOCK_TOLERANCE_SECONDS,
      currentDate: now,
    });
  } catch (error) {
    throw wrapJoseError(error);
  }

  const payload = verified.payload;
  assertAllowedClaimSet(payload);

  if (payload.iss !== ISSUER) {
    throw new ShieldError("INVALID_ISSUER", "iss does not match Shield.");
  }
  if (payload.aud !== audience) {
    throw new ShieldError("INVALID_AUDIENCE", "aud does not match this application.");
  }

  if (policy) {
    evaluatePolicy(payload, policy);
  }

  return {
    header: verified.protectedHeader,
    payload,
    subject: payload.sub,
    claims: payload.claims,
    currentEpoch,
  };
}
