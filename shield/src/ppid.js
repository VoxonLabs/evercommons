import { createHash } from "node:crypto";
import { SUBJECT_PREFIX } from "./constants.js";
import { ShieldError } from "./errors.js";

/**
 * Derive a pairwise subject for one application audience.
 *
 * This follows OpenID Connect Core 1.0 §8.1 example method 1:
 * SHA-256(sector_identifier || local_account_id || salt).
 *
 * Local mock notes:
 * - The sector identifier is the application audience, not a production
 *   redirect_uri host / sector_identifier_uri.
 * - Naive concatenation can collide across (sector, account) pairs. This
 *   mock is only to prove different apps receive different subjects.
 * - The salt never leaves Shield. Applications only see the digest.
 *
 * @param {{
 *   sectorIdentifier: string,
 *   localAccountId: string,
 *   salt: Uint8Array | Buffer | string,
 * }} input
 * @returns {string}
 */
export function derivePairwiseSubject({ sectorIdentifier, localAccountId, salt }) {
  if (typeof sectorIdentifier !== "string" || sectorIdentifier.length === 0) {
    throw new ShieldError("INVALID_PPID", "sectorIdentifier is required.");
  }
  if (typeof localAccountId !== "string" || localAccountId.length === 0) {
    throw new ShieldError("INVALID_PPID", "localAccountId is required.");
  }
  if (localAccountId.includes("@") || localAccountId.includes(" ")) {
    throw new ShieldError(
      "INVALID_PPID",
      "localAccountId must be an opaque Shield-local identifier, not an email or name.",
    );
  }
  if (!salt || (typeof salt !== "string" && salt.length === 0)) {
    throw new ShieldError("INVALID_PPID", "A secret salt is required.");
  }

  const digest = createHash("sha256")
    .update(sectorIdentifier, "utf8")
    .update(localAccountId, "utf8")
    .update(salt)
    .digest("base64url");

  return `${SUBJECT_PREFIX}${digest}`;
}
