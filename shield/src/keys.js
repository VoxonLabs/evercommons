import { randomBytes } from "node:crypto";
import { calculateJwkThumbprint, exportJWK, generateKeyPair, importJWK } from "jose";
import { SIGNING_ALG } from "./constants.js";

/**
 * Create an ES256 signing key. Private material stays in the local keyring.
 *
 * @param {{ kid?: string }} [options]
 */
export async function createSigningKey(options = {}) {
  const { publicKey, privateKey } = await generateKeyPair(SIGNING_ALG, {
    extractable: true,
  });
  const publicJwk = await exportJWK(publicKey);
  const privateJwk = await exportJWK(privateKey);
  const kid = options.kid ?? (await calculateJwkThumbprint(publicJwk, "sha256"));

  Object.assign(publicJwk, { kid, use: "sig", alg: SIGNING_ALG });
  Object.assign(privateJwk, { kid, use: "sig", alg: SIGNING_ALG });

  return {
    kid,
    alg: SIGNING_ALG,
    publicJwk,
    privateJwk,
    publicKey,
    privateKey,
  };
}

export function createMockSalt() {
  return randomBytes(32);
}

/**
 * Local keyring: current signing key plus previous keys still in JWKS.
 * This is the rotation overlap window from RFC 7517 / common JWKS practice.
 */
export async function createKeyring() {
  const current = await createSigningKey();
  return {
    current,
    previous: [],
    salt: createMockSalt(),
  };
}

/**
 * Publish the new key, start signing with it, and keep the old public key
 * available so in-flight assertions can still verify until they expire.
 *
 * @param {{ current: object, previous: object[], salt: Buffer }} keyring
 */
export async function rotateSigningKey(keyring) {
  keyring.previous.unshift(keyring.current);
  keyring.current = await createSigningKey();
  return keyring.current;
}

/**
 * Drop retired keys after the max assertion TTL has passed.
 *
 * @param {{ previous: object[] }} keyring
 * @param {string} [kid]
 */
export function retirePreviousKeys(keyring, kid) {
  if (kid) {
    keyring.previous = keyring.previous.filter((key) => key.kid !== kid);
    return;
  }
  keyring.previous = [];
}

/**
 * @param {{ current: { publicJwk: object }, previous: { publicJwk: object }[] }} keyring
 */
export function toPublicJwks(keyring) {
  return {
    keys: [keyring.current.publicJwk, ...keyring.previous.map((key) => key.publicJwk)],
  };
}

/**
 * @param {object} jwk
 */
export async function importPrivateSigningKey(jwk) {
  return importJWK(jwk, SIGNING_ALG);
}
