import {
  ALLOWED_DERIVED_CLAIMS,
  ALLOWED_TOP_LEVEL_CLAIMS,
  FORBIDDEN_CLAIM_NAMES,
  MAX_TTL_SECONDS,
  SUBJECT_PATTERN,
} from "./constants.js";
import { ShieldError } from "./errors.js";

const forbiddenNames = new Set(FORBIDDEN_CLAIM_NAMES);
const allowedTopLevel = new Set(ALLOWED_TOP_LEVEL_CLAIMS);
const allowedDerived = new Set(ALLOWED_DERIVED_CLAIMS);

/**
 * @param {unknown} value
 * @param {string[]} [found]
 * @returns {string[]}
 */
export function findForbiddenClaimNames(value, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      findForbiddenClaimNames(item, found);
    }
    return found;
  }

  if (!value || typeof value !== "object") {
    return found;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (forbiddenNames.has(key) && !found.includes(key)) {
      found.push(key);
    }
    findForbiddenClaimNames(nested, found);
  }

  return found;
}

/**
 * @param {Record<string, unknown>} payload
 */
export function assertAllowedClaimSet(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ShieldError("INVALID_CLAIMS", "Assertion payload must be an object.");
  }

  const forbidden = findForbiddenClaimNames(payload);
  if (forbidden.length > 0) {
    throw new ShieldError(
      "FORBIDDEN_CLAIM",
      `Assertion contains forbidden identity fields: ${forbidden.join(", ")}.`,
    );
  }

  for (const key of Object.keys(payload)) {
    if (!allowedTopLevel.has(key)) {
      throw new ShieldError("INVALID_CLAIMS", `Unexpected top-level claim: ${key}.`);
    }
  }

  if (typeof payload.iss !== "string" || payload.iss.length === 0) {
    throw new ShieldError("INVALID_CLAIMS", "iss must be a non-empty string.");
  }
  if (typeof payload.aud !== "string" || payload.aud.length === 0) {
    throw new ShieldError("INVALID_CLAIMS", "aud must be a single non-empty string.");
  }
  if (Array.isArray(payload.aud)) {
    throw new ShieldError("INVALID_CLAIMS", "aud must not be an array.");
  }
  if (typeof payload.sub !== "string" || !SUBJECT_PATTERN.test(payload.sub)) {
    throw new ShieldError("INVALID_CLAIMS", "sub must be a pairwise ppid_ value.");
  }
  if (typeof payload.jti !== "string" || payload.jti.length < 16) {
    throw new ShieldError("INVALID_CLAIMS", "jti must be a unique string of at least 16 characters.");
  }
  if (!Number.isInteger(payload.iat) || payload.iat < 0) {
    throw new ShieldError("INVALID_CLAIMS", "iat must be a Unix timestamp in seconds.");
  }
  if (!Number.isInteger(payload.exp) || payload.exp < 0) {
    throw new ShieldError("INVALID_CLAIMS", "exp must be a Unix timestamp in seconds.");
  }
  if (payload.nbf !== undefined && (!Number.isInteger(payload.nbf) || payload.nbf < 0)) {
    throw new ShieldError("INVALID_CLAIMS", "nbf must be a Unix timestamp in seconds.");
  }
  if (payload.exp <= payload.iat) {
    throw new ShieldError("INVALID_CLAIMS", "exp must be after iat.");
  }
  if (payload.exp - payload.iat > MAX_TTL_SECONDS) {
    throw new ShieldError(
      "INVALID_CLAIMS",
      `Assertion lifetime ${payload.exp - payload.iat}s exceeds max TTL of ${MAX_TTL_SECONDS}s.`,
    );
  }

  assertDerivedClaims(payload.claims);
}

/**
 * @param {unknown} claims
 */
export function assertDerivedClaims(claims) {
  if (!claims || typeof claims !== "object" || Array.isArray(claims)) {
    throw new ShieldError("INVALID_CLAIMS", "claims must be an object of derived booleans.");
  }

  for (const key of Object.keys(claims)) {
    if (!allowedDerived.has(key)) {
      throw new ShieldError("INVALID_CLAIMS", `Unexpected derived claim: ${key}.`);
    }
    if (typeof claims[key] !== "boolean") {
      throw new ShieldError("INVALID_CLAIMS", `Derived claim ${key} must be a boolean.`);
    }
  }

  for (const required of ALLOWED_DERIVED_CLAIMS) {
    if (typeof claims[required] !== "boolean") {
      throw new ShieldError("INVALID_CLAIMS", `Missing required derived claim: ${required}.`);
    }
  }
}

/**
 * @param {Record<string, boolean>} claims
 */
export function normalizeDerivedClaims(claims) {
  assertDerivedClaims(claims);
  return {
    verified_human: claims.verified_human,
    age_over_18: claims.age_over_18,
    account_eligible: claims.account_eligible,
  };
}
