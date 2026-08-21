export const ISSUER = "https://shield.voxonlabs.com";
export const ASSERTION_TYP = "voxon-shield+jwt";
export const SIGNING_ALG = "ES256";
export const DEFAULT_AUDIENCE = "evercommons";
export const DEFAULT_TTL_SECONDS = 300;
export const MAX_TTL_SECONDS = 300;
export const CLOCK_TOLERANCE_SECONDS = 0;
export const SUBJECT_PREFIX = "ppid_";
export const SUBJECT_PATTERN = /^ppid_[A-Za-z0-9_-]{32,}$/;

export const ALLOWED_TOP_LEVEL_CLAIMS = Object.freeze([
  "iss",
  "aud",
  "sub",
  "iat",
  "nbf",
  "exp",
  "jti",
  "claims",
]);

export const ALLOWED_DERIVED_CLAIMS = Object.freeze([
  "verified_human",
  "age_over_18",
  "account_eligible",
]);

/** Baseline forbidden application fields, plus common identity leftovers. */
export const FORBIDDEN_CLAIM_NAMES = Object.freeze([
  "name",
  "given_name",
  "family_name",
  "middle_name",
  "nickname",
  "date_of_birth",
  "birthdate",
  "dob",
  "passport_number",
  "document_number",
  "address",
  "email",
  "phone_number",
  "picture",
  "document_image",
  "selfie",
  "provider_packet",
  "other_apps_used",
  "global_trust_score",
  "trust_score",
]);

export const FORBIDDEN_HEADER_PARAMS = Object.freeze(["jku", "x5u", "jwk", "x5c"]);

export const EVERCOMMONS_ALPHA_ADULT_POLICY = Object.freeze({
  id: "evercommons-alpha-adult",
  audience: "evercommons",
  required: Object.freeze({
    verified_human: true,
    age_over_18: true,
    account_eligible: true,
  }),
});
