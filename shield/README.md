# Voxon Shield local proof

Status: mock-only local prototype. Not a production identity system.

This is Voxon Shield, a future identity/assertion boundary for applications. It is not Shield Vault, the separate password manager project.

This directory is the Phase 1 evidence for `docs/RFC-0002-VOXON-SHIELD.md`: a signed assertion schema, a local mock issuer, and a verifier that accepts only the right issuer, audience, signature, expiry, and derived claims.

EverCommons never receives name, date of birth, address, document numbers, selfies, or provider packets. If those fields appear, verification fails.

## Still mock-only

- No HTTP server, JWKS URL, or `/.well-known` endpoint for production.
- No real identity provider, document check, or age-assurance vendor.
- No production signing keys. Tests generate ephemeral ES256 keys in memory.
- No device-loss recovery, attestation policy, or uniqueness/"one human" solution.
- A localhost passkey prototype exists (`npm run passkeys`). It is not a public account system.
- The issuer string `https://shield.voxonlabs.com` is a name used in tokens. It is not a live Shield API.
- Pairwise subjects use the OpenID Connect Core 1.0 §8.1 SHA-256 example. The sector identifier here is the application audience, not a production `sector_identifier_uri`.

Do not deploy this as an identity service.

## Run

Node.js 20.19+ is required.

```bash
cd shield
npm install
npm test
npm run demo
npm run passkeys
```

`npm test` is the stop-gate check. `npm run demo` prints one accepted EverCommons payload and shows that a dating-audience assertion is rejected by the EverCommons verifier.

`npm run passkeys` starts a localhost-only page at `http://localhost:8787`. Open it on `localhost`, not a LAN IP. Register a passkey, sign in, then request a Shield assertion as a separate step. Recovery is intentionally unimplemented.

## What the verifier checks

1. Compact JWS with `typ: voxon-shield+jwt` and `alg: ES256` only.
2. `kid` present; `jku`, `x5u`, `jwk`, and `x5c` headers rejected (RFC 8725 §3.10).
3. Signature against the local JWKS bound to issuer `https://shield.voxonlabs.com`.
4. `aud` matches the calling application. Cross-app reuse fails.
5. `exp` / `iat` lifetime at most 300 seconds.
6. `sub` is a `ppid_` pairwise value, not an email or name.
7. Payload contains only approved derived booleans under `claims`.
8. Forbidden identity field names are rejected even if the signature is valid.
9. Optional EverCommons adult policy requires `verified_human`, `age_over_18`, and `account_eligible` to be true.

Signing uses the maintained [`jose`](https://github.com/panva/jose) library (v6). This prototype does not implement JWT cryptography itself.

## Key rotation assumption

JWKS can hold the current signing key plus previous public keys.

1. Publish the new public key in JWKS before using it to sign.
2. Start signing new assertions with the new `kid`.
3. Keep the old public key until every assertion signed with it has expired (here, at least 300 seconds).
4. Then retire the old key. Verifiers must fail `kid` values that are no longer in JWKS.

This follows RFC 7517 key sets plus common JWKS overlap practice. There is no remote JWKS fetch in this mock; the verifier uses an in-memory keyring.

## Pairwise subjects

Same local Shield account + same application audience => same `sub`.
Same local Shield account + different audience => different `sub`.

Applications do not receive a list of other apps a person uses. This mock does not solve Sybil resistance or cross-device uniqueness.

## Layout

```text
schema/assertion.schema.json   JWT Claims Set schema
src/issuer.js                  local mock issuer
src/verifier.js                EverCommons-style verifier
src/ppid.js                    pairwise subject helper
src/keys.js                    ES256 keyring and JWKS
src/passkeys/                  localhost passkey prototype
docs/PASSKEY_THREAT_MODEL.md   recovery/CSRF/origin assumptions and hard-part stop
test/local-proof.test.js       assertion accept and reject cases
test/passkeys.test.js          origin, CSRF, session, assertion separation
```

## Sources

- RFC 7519 JSON Web Token: https://www.rfc-editor.org/rfc/rfc7519
- RFC 7517 JSON Web Key: https://www.rfc-editor.org/rfc/rfc7517
- RFC 8725 JWT Best Current Practices: https://www.rfc-editor.org/rfc/rfc8725
- OpenID Connect Core 1.0 §8.1 Pairwise Identifier Algorithm: https://openid.net/specs/openid-connect-core-1_0.html#PairwiseAlg
- jose v6: https://github.com/panva/jose
- SimpleWebAuthn 13.x: https://simplewebauthn.dev/docs/packages/server
- W3C WebAuthn Level 3 CR (26 May 2026): https://www.w3.org/TR/2026/CR-webauthn-3-20260526/
- NIST SP 800-63-4 derived attributes such as older than 18: https://pages.nist.gov/800-63-4/sp800-63.html
