# Passkey prototype threat model

Status: local prototype notes. Not a production launch review.

This file documents the Phase 2 assumptions for `shield/src/passkeys/`. It is evidence for the stop gate, not a claim that authentication is safe to ship.

## What this prototype is

A localhost-only passkey register/login loop using:

- W3C WebAuthn Level 3 Candidate Recommendation, 26 May 2026: https://www.w3.org/TR/2026/CR-webauthn-3-20260526/
- SimpleWebAuthn server 13.3.2 and browser 13.3.0
- SimpleWebAuthn passkeys options: https://simplewebauthn.dev/docs/advanced/passkeys
- Origin `http://localhost:<port>`, RP ID `localhost` (valid per WebAuthn because the host is `localhost`)

Login and Shield verification stay separate:

1. Passkey ceremony proves continuity of a local handle.
2. A later `/v1/assertions` call, which requires that session, mints a short-lived derived JWT.
3. Logging in does not put name, date of birth, or other identity fields in the session.

There are no passwords, SMS codes, or security questions.

## Assumptions that are true only on localhost

| Topic | Local prototype | Production must not copy blindly |
| --- | --- | --- |
| Origin | Exact match to `http://localhost:<port>` | HTTPS origin, pinned RP ID, no LAN IP HTTP |
| RP ID | `localhost` | Final public domain chosen before first real registration. Passkeys are bound to that RP ID. |
| Cookies | `HttpOnly` + `SameSite=Lax`, `Secure` off because this is HTTP localhost | `__Host-` prefix, `Secure`, `SameSite` policy for the real site, cookie domain none |
| CSRF | Origin check plus double-submit `X-CSRF-Token` | Review with reverse proxies, CORS, and cross-subdomain cookies |
| Session | 15 minutes, in memory, wiped on restart | Server-side store, rotation, revocation, idle timeout |
| Users | Opaque `demo-` handles, no email | Minimize identifiers; do not leak whether a handle exists in another VoxonLabs app |
| Attestation | `attestationType: "none"` | Authenticator policy is unreviewed |
| User verification | Preferred, not required at verify time | High-assurance flows may require UV; that is a product/legal choice |
| Storage | Process memory | Separate Shield database; no application DB of raw authenticator attestation |

## Session expiry

Sessions last 900 seconds. Expired session IDs are deleted with their challenges. This is a local timeout, not a production session design. CSRF tokens are bound to the session and expire with it.

## CSRF

State-changing POSTs require:

1. `Origin` exactly equal to the configured local origin.
2. `X-CSRF-Token` equal to the session CSRF secret.

GET does not change state. The browser bundle is served locally, not from a CDN.

## Origin binding

WebAuthn credentials are scoped to RP ID `localhost`. The server also checks the HTTP `Origin` on ceremony POSTs via SimpleWebAuthn `expectedOrigin` / `expectedRPID`. A token or cookie from this prototype must never be accepted on `voxonlabs.com` or `evercommons.voxonlabs.com`.

Do not open this server on `0.0.0.0` or a LAN IP. Those origins are not secure contexts for WebAuthn.

## What is still mock-only

- No public accounts.
- No production cookies or HTTPS.
- No identity provider.
- No recovery.
- No attestation allowlist.
- In-memory users disappear when the process exits.

## HARD PART — stop here and use a high-reasoning model

Do not implement the following in this repo until a stronger security review has written an approved design. These are the production-auth problems, not leftover chores.

1. **Device-loss recovery.** Synced platform passkeys, a second registered passkey, backup authenticators, and account recovery all create new unlinkable-identity and social-engineering risks. A wrong recovery path reintroduces passwords, email magic links, or SMS. This prototype returns HTTP 501 on `/api/recovery` on purpose.

2. **Attestation and authenticator trust.** `direct` attestation, manufacturer allowlists, and enterprise authenticator policy can deanonymize devices and lock out users. Do not turn attestation on as a default.

3. **Synced vs device-bound passkeys.** Multi-device credentials help after phone loss and also mean the cloud vendor can restore the credential. High-assurance adult checks may need a different policy than consumer login. That tradeoff is not decided here.

4. **Production session security.** Cookie prefixes, CSRF with reverse proxies, WebSocket/cookie scope, session fixation after registration, and logout across devices.

5. **Cross-device / hybrid (QR) flows.** Different origin and transport assumptions. Easy to get RP ID wrong.

6. **Username enumeration and cross-app correlation.** Identifier-first login can leak whether a person has an EverCommons handle. Shield pairwise IDs must not become a global join key through recovery or support tools.

7. **Cloned-authenticator / counter anomalies.** Signature counters are stored, but the response to a decreasing counter is a security-operations decision.

8. **Combining recovery with Shield assertions.** Recovery that proves "same human" without linking applications is the uniqueness research problem from RFC-0002. It is not solved by adding a backup code.

If the next task is any item in this list, switch to a high-reasoning model and start from this file plus `docs/RFC-0002-VOXON-SHIELD.md`. Do not invent a recovery protocol in a thin pass.

## Sources

- W3C WebAuthn Level 3 CR, 26 May 2026: https://www.w3.org/TR/2026/CR-webauthn-3-20260526/
- Chromium notes on origins that support WebAuthn: https://chromium.googlesource.com/chromium/src/+/main/content/browser/webauth/origins.md
- SimpleWebAuthn server docs: https://simplewebauthn.dev/docs/packages/server
- SimpleWebAuthn passkeys guide: https://simplewebauthn.dev/docs/advanced/passkeys
- RFC 8725 JWT BCP remains in force for the separate assertion token: https://www.rfc-editor.org/rfc/rfc8725
