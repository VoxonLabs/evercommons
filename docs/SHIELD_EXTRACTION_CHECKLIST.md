# Shield extraction checklist

Status: working rule. Do not create `VoxonLabs/voxon-shield` until a split trigger fires.

This is the concrete answer to "shouldn't Shield be another repo?" Yes, that is the target. No, not today. The local mock in `shield/` stays in this planning repo while it remains mock-only. Splitting now would add an empty public surface without secrets, CI, or a real API, which looks busier rather than more mature.

This checklist applies to Voxon Shield, the identity/assertion boundary. It does not apply to `shield-vault`, the separate password manager repository.

Use this file with `docs/REPOSITORY_STRATEGY.md` and `docs/ARCHITECTURE_GOVERNANCE.md`.

## Do not split yet

Keep Shield here while **all** of these remain true:

- No production HTTPS Shield API
- No JWKS or `/.well-known` endpoint
- No long-lived signing keys
- No provider adapter (CIE, SPID, EUDI Wallet, mDL, passport, age estimation, passkey provider)
- No Shield database
- No recovery process
- No public SDK/package release
- No Shield deployment or secrets
- `shield/` still has no dependency on EverCommons product data, UI, social graph, or app policy

Current state matches this list. The mock issuer/verifier and localhost passkeys are local proofs, not a service.

## Split when any of these becomes true

Create `VoxonLabs/voxon-shield` (and later `VoxonLabs/shield-js` only if an SDK is actually published) when **any** of these fires:

- A production or staging Shield HTTPS API
- JWKS, signing keys, or a key-management process
- A provider adapter
- A recovery process or recovery-code store
- A Shield database or session store beyond in-memory localhost
- A public SDK or package
- Its own deploy lifecycle, secrets, or on-call boundary
- A security review surface that should block unrelated EverCommons product work

Android Play signing is **not** a Shield split trigger. That belongs to a future `evercommons-android` split.

## Before creating the new repo

Do these in the current tree first. Do not copy a messy mock into a new public repo.

- [ ] `shield/` imports nothing from `evercommons/`, `android/`, or site HTML
- [ ] EverCommons and future apps would consume Shield only through an API or SDK, not by importing issuer internals
- [ ] Assertion schema, forbidden claims, and pairwise-subject rules are documented
- [ ] README states mock vs production honestly
- [ ] `SECURITY.md` and a vulnerability reporting path exist for the Shield repo
- [ ] Threat model or RFC covers assertions, auth, recovery, and providers (`docs/RFC-0002-VOXON-SHIELD.md`, `docs/RFC-0006-AUTH-RECOVERY.md`)
- [ ] CI runs Shield tests
- [ ] Secret scanning and dependency alerts are planned
- [ ] No production keys, `.env`, or provider credentials are in Git
- [ ] Data inventory is written if any user, identity, or recovery data will be stored
- [ ] Ownership, issue labels, and stop gates are written
- [ ] Extraction does not copy EverCommons feed, media, moderation, or social graph data

## What moves vs what stays

| Moves to `voxon-shield` when the trigger fires | Stays in this planning repo until then |
| --- | --- |
| Production Shield API, policy engine, adapters, JWKS, recovery policy | Local mock under `shield/` |
| Shield threat models that describe the live service | Campaign site, RFCs, and review issues |
| Later: `shield-js` if a real package is published | EverCommons prototype, media stub, Android offline proof |

After the split:

- Separate deployment, secrets, database, logs, and abuse/incident scope
- EverCommons holds only audience-scoped assertions and app data
- No shared user database across apps
- Provider packets never leave Shield

## What not to do

- Do not create empty product repositories for optics
- Do not put CIE/SPID login in EverCommons "because Italy"
- Do not share pairwise subjects, moderation decisions, or social graphs across apps
- Do not treat this checklist as permission to implement recovery or providers

## Review question

Every Shield-related review must still ask:

> Is Shield still modular enough to extract without copying EverCommons product data, UI, social graph, or app policy?

If the answer is no, stop and repair the boundary here. Do not split.
