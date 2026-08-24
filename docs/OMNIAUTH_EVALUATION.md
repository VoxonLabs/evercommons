# OmniAuth Evaluation

Last updated: 2026-08-24

## Decision

OmniAuth is **reference material only**. Do not import it into Voxon Shield, EverCommons, or any production-bound Voxon repo as a dependency.

The repository is useful for studying PQC prototype structure, vault terminology, challenge-response tests, and risk language. It is not a safe foundation for Shield because it is explicitly experimental, unaudited, custom authentication/cryptography work with licensing and platform-risk questions.

## Why It Is Not A Shield Dependency

- It explores custom post-quantum authentication instead of using WebAuthn/passkeys as the normal low-risk login foundation.
- It contains experimental PQC and ZK flows that need specialist cryptographic review before any production use.
- It mixes open and proprietary areas, so code reuse needs legal/license review before copying anything.
- It stores identity-adjacent data and credential rotation concepts that do not match Voxon's data-minimization rules.
- Its mobile stack currently depends on an older React Native toolchain with remaining high npm audit findings.

## What Was Useful

- One-time challenge-response belongs in the server verifier path, not only in a demo test.
- Prototype security claims must stay precise: "PQC prototype" is acceptable; "quantum-proof identity" is not.
- Passwords should be passed only for the active cryptographic operation and not retained in native module fields.
- Dependency risk has to be treated as product risk, even for prototypes.

## Risk Fixes Applied In The Clone

The working clone at `/tmp/OmniAuth` was patched with:

- `POST /api/v1/challenge` for server-issued, short-lived challenges.
- One-time challenge consumption in `POST /api/v1/verify`, with replay rejection.
- A request body size cap on verification input.
- Backend replay tests for successful verification, bad signatures, and rejected replay.
- Removal of unused retained password fields in Android and iOS native modules.
- Mobile copy changed from broad quantum-proof claims to PQC prototype language.
- Mobile npm lockfile updated with non-breaking advisory fixes plus explicit overrides for vulnerable transitive tooling packages where a patched version exists.
- Mobile React Native patched from `0.73.4` to `0.73.11`, reducing remaining audit findings without a platform major-version jump.

## Remaining OmniAuth Risks

- It is still experimental and unaudited. Do not present it as production security.
- Remaining mobile audit findings require a deliberate React Native major upgrade, not a blind `npm audit fix --force`.
- ZK setup, proof lifecycle, verifier key handling, recovery, device binding, enrollment, and abuse controls need separate threat models.
- No Voxon code should depend on it until Shield has an approved RFC, threat model, dependency review, and external security review.

## Allowed Future Use

- Use it as a comparison point while writing Shield RFCs or threat models.
- Borrow ideas only as design notes, not copied implementation.
- If any code reuse is proposed, stop first for license review, cryptography review, and an ADR.
