# Phased Build Plan

Status: active operating roadmap.

This file tells future AI sessions where to start, where to stop, and what evidence is required before moving forward.

For *what to do in this session*, read `docs/CURRENT_STATE.md` first. This file is the roadmap. `CURRENT_STATE.md` is the living snapshot. If they disagree about the immediate next step, `CURRENT_STATE.md` wins, then update this file in the same change.

## Current Phase

Current recommended phase: **Phase 5.5 Android client proof in progress; Phase 6 remains blocked.** Architecture drafts are RFC-0004, RFC-0005, and RFC-0006. Next product work is the offline native Compose proof and public review, not a backend, recovery implementation, or CIE integration.

Phase 5 draft exists at `docs/RFC-0004-EVERCOMMONS-ARCHITECTURE.md`. Android client stack: `docs/RFC-0005-ANDROID-CLIENT-STACK.md`. Production auth/recovery architecture: `docs/RFC-0006-AUTH-RECOVERY.md`. Public review: https://github.com/VoxonLabs/evercommons/issues/1. No D1, R2, Stream, public accounts, or uploads are enabled. Recovery after device loss is not implemented.

Strategic sequencing: Shield architecture, auth/recovery requirements, provider-adapter boundaries, and extraction readiness come before any EverCommons public accounts, uploads, or pilot work. That does not authorize provider integration or recovery code in the planning repo.

## Phase Rules

- Each phase has a start condition, work scope, stop gate, and evidence.
- Do not skip gates because the idea feels exciting.
- If a gate cannot be met with zero-cost tools, pause and document the blocker.
- If a phase introduces personal data, public accounts, media uploads, CDN delivery, payments, ads, minors, identity proofing, or private messaging, require threat modeling first.
- If a phase changes product boundaries, Shield, identity, authentication, recovery, providers, repos, data stores, APIs, deployments, or future apps, apply `docs/ARCHITECTURE_GOVERNANCE.md` before implementation.
- If a task is broad, strategic, UI/product, investor-facing, or asks AI to work autonomously, apply `docs/AUTONOMOUS_EXECUTION_RULES.md` and turn it into a bounded task packet before implementation.
- Rules may be changed when a safer architecture requires it, but the change must include rationale, sources where needed, risks, and a new stop gate.
- Every phase ends with a handoff note: what changed, what was verified, what risks remain, and what the next model should do.

## Cross-Phase Architecture Gate

Before coding beyond local proofs, answer:

- Which bounded context owns this: Shield, EverCommons app, media, Android, VoxonLabs site, infrastructure, or a future app?
- Does it need a separate repo, deploy lifecycle, secrets, database, API, SDK, review surface, or legal/privacy boundary?
- What data does it introduce, and can it be minimized?
- What standard or maintained library should be used instead of custom security logic?
- What tests, CI, review, and public documentation must exist before merge?

If the answer is unclear, stop at an RFC, ADR, threat model, or public review issue.

## Phase 0: Public Proof and Governance Baseline

Status: mostly complete.

Start condition:

- Domain exists.
- GitHub organization/repo exists.
- Zero-cost static hosting is acceptable.

Work scope:

- Parent VoxonLabs homepage.
- EverCommons static page.
- Security, contribution, conduct, brand, partner, outreach, and launch docs.
- Cloudflare Pages deployment.
- Email routing plan without paid mailboxes.

Stop gate:

- Public site is live.
- No analytics, third-party forms, public accounts, uploads, ads, payouts, or identity collection.
- Security reporting text does not claim a mailbox before it exists.

Evidence:

- `https://voxonlabs.com/`
- `https://evercommons.voxonlabs.com/`
- `README.md`
- `SECURITY.md`

## Phase 1: Shield Protocol Design and Local Proof

Status: local proof complete; still mock-only.

Start condition:

- `docs/RFC-0002-VOXON-SHIELD.md` exists.
- AI/session has read `docs/ENGINEERING_SECURITY_BASELINE.md`.

Work scope:

- Draft Shield assertion schema.
- Define forbidden identity fields.
- Define issuer, audience, subject, expiry, key ID, and claim rules.
- Build a local mock issuer only. No real ID provider.
- Build a local verifier example that rejects wrong issuer, audience, expiry, signature, or forbidden claims.
- Document key rotation assumptions.
- Document pairwise pseudonym derivation at a high level without inventing cryptography.

Stop gate:

- A local app can verify a signed test assertion.
- The app never receives name, date of birth, address, document number, selfie, or provider packet.
- Tests cover acceptance and rejection cases.
- No production identity proofing exists.

Evidence:

- `docs/RFC-0002-VOXON-SHIELD.md` updated.
- `shield/schema/assertion.schema.json`
- `shield/src/issuer.js` and `shield/src/verifier.js`
- `cd shield && npm test` passing.
- `shield/README.md` handoff listing exactly what is still mock-only.

## Phase 2: Shield Authentication Prototype

Status: local passkey prototype complete; recovery not implemented.

Work scope:

- Research current WebAuthn/passkey implementation options.
- Create a passkey prototype for local development.
- Keep verification separate from login.
- Add recovery threat model before public use.
- Lock the progressive access model: low-risk access without identity proof, passkeys for normal login, Shield assertions for higher-risk capabilities, separate recovery design, and layered anti-abuse controls.
- Define a future production-auth RFC before any real recovery code, including multi-authenticator support, synced vs device-bound passkeys, hardware security keys, recovery codes or alternatives, repeated proofing, notifications, session revocation, and abuse tests.
- Treat CIE, SPID, eIDAS wallets, mobile driver's licenses, passport vendors, age-estimation vendors, passkey providers, and future credential wallets as optional Shield provider adapters, not as app-level login shortcuts.

Stop gate:

- Local passkey registration/login works in a prototype.
- No password-first system is introduced without explicit approval.
- Recovery, device loss, session expiry, CSRF, and origin-bound assumptions are documented.
- No production recovery or provider integration exists without a reviewed Shield RFC and privacy/security review.
- No government identity, EUDI Wallet, CIE, SPID, provider proof, or device attestation is required on every login.

Evidence:

- `shield/src/passkeys/` localhost server using SimpleWebAuthn 13.x.
- `shield/docs/PASSKEY_THREAT_MODEL.md`
- `cd shield && npm test` includes origin, CSRF, session, and assertion-separation cases.
- `/api/recovery` returns 501 on purpose.
- `docs/ARCHITECTURE_GOVERNANCE.md` governs future provider and recovery choices.
- `docs/RFC-0006-AUTH-RECOVERY.md` is the production-auth architecture draft. It does not authorize recovery code.

## Phase 3: EverCommons UX Prototype

Status: local clickable prototype complete. No real accounts or uploads.

Work scope:

- Clickable product prototype for onboarding, feed, upload stub, profile, report/appeal, explicit-content controls, creator dashboard, and capacity dashboard.
- No public uploads.
- No real accounts.
- No database with personal data.

Stop gate:

- Desktop and mobile flows render correctly.
- Accessibility basics pass.
- Privacy and safety copy is clear.
- Users cannot upload real content or create production accounts.

Evidence:

- `evercommons/prototype/`
- `node --test evercommons/prototype/check.test.js`
- Upload control is disabled; no email/password fields.

## Phase 4: Media and CDN Security Architecture

Status: local stub complete. No public uploads. No Cloudflare media product enabled.

Work scope:

- Read and update `docs/RFC-0003-MEDIA-CDN-SECURITY.md`.
- Draft media data inventory.
- Draft upload, processing, CDN, deletion, moderation, and cost-abuse threat model.
- Define storage zones: intake, processing, public derivatives, restricted derivatives, moderation evidence, and backup.
- Evaluate Cloudflare R2, Images, and Stream against zero-cost/low-cost, security, export, deletion, and lock-in constraints.
- Build only local stubs. No public uploads.

Stop gate:

- Threat model exists.
- Raw uploads are designed as private/quarantined.
- Public media is designed as processed derivatives only.
- CDN purge/deletion path is defined.
- Upload quotas, cost caps, and kill switch are defined.
- Moderation/report/appeal state machine exists.
- No public upload path exists.

Evidence:

- `evercommons/media/`
- `cd evercommons/media && npm test`
- `evercommons/media/PROVIDER_EVAL.md` (providers not approved)

Work scope:

- Read and update `docs/RFC-0003-MEDIA-CDN-SECURITY.md`.
- Draft media data inventory.
- Draft upload, processing, CDN, deletion, moderation, and cost-abuse threat model.
- Define storage zones: intake, processing, public derivatives, restricted derivatives, moderation evidence, and backup.
- Evaluate Cloudflare R2, Images, and Stream against zero-cost/low-cost, security, export, deletion, and lock-in constraints.
- Build only local stubs. No public uploads.

Stop gate:

- Threat model exists.
- Raw uploads are designed as private/quarantined.
- Public media is designed as processed derivatives only.
- CDN purge/deletion path is defined.
- Upload quotas, cost caps, and kill switch are defined.
- Moderation/report/appeal state machine exists.
- No public upload path exists.

## Phase 5: EverCommons Technical Architecture

Status: architecture draft complete. No production backend, accounts, or uploads.

Work scope:

- Decide repo split for EverCommons product code.
- Draft app backend, feed, upload integration, media processing, storage, moderation, reporting, export, deletion, and cost architecture.
- Compare zero-cost and low-cost infrastructure options before choosing.
- Create threat models for upload abuse, moderation abuse, account abuse, and cost abuse.

Stop gate:

- Architecture review issue is public.
- Security baseline maps to planned controls.
- No irreversible vendor lock-in.
- No public launch date promised.

Evidence:

- `docs/RFC-0004-EVERCOMMONS-ARCHITECTURE.md`
- `.github/ISSUE_TEMPLATE/evercommons-architecture-review.yml`
- Public review: https://github.com/VoxonLabs/evercommons/issues/1

## Phase 5.5: Android Client Offline Proof

Status: unblocked for an offline native proof. No accounts, uploads, Play publishing, or production signing.

Start condition:

- RFC-0004 architecture draft exists.
- Linux workstation can run Android Studio / emulator (KVM).

Work scope:

- Accept RFC-0005 Android-first client stack.
- Install Android Studio + SDK + one AVD.
- Scaffold Jetpack Compose vertical slice from the web prototype screens.
- Keep network, passkeys, file pickers, uploads, camera, and analytics disabled.
- Add Compose UI tests and Macrobenchmark / Baseline Profile modules.
- Exclude `android/` from Cloudflare Pages deploy bundles.

Stop gate:

- Offline app builds and launches on emulator.
- No dangerous permissions; no network client.
- Upload and archive-import controls remain disabled.
- Performance measurement harness exists; Signal/Instagram-class claims require a real device later.
- Phase 6 remains blocked on recovery, legal/privacy, moderation coverage, and media/cost gates.

Evidence:

- `docs/RFC-0005-ANDROID-CLIENT-STACK.md`
- `android/` Compose proof
- Macrobenchmark / Baseline Profile modules under `android/`

## Phase 6: Closed Adult Pilot

Status: not ready.

Start condition:

- Threat models complete.
- Privacy notice and terms reviewed.
- Report/appeal flow exists.
- Data export/deletion path exists.
- Upload cost and abuse controls tested.
- Shield minimal assertion path is ready or the pilot avoids identity claims entirely.
- Media/CDN stop gate has passed if uploads are included.

Work scope:

- Small invitation-only adult test.
- Capacity-gated uploads.
- Manual moderation coverage.
- Incident response checklist.
- Public transparency notes.

Stop gate:

- Backup/restore tested.
- Abuse controls tested.
- Account deletion/export tested.
- Media deletion/CDN purge tested if uploads are included.
- Incident process tested.
- No minors, payouts, ads, DMs, or public scale.

## Phase 7: Separate Product Repositories

Status: future.

Start condition:

- Product code grows beyond static proof or needs its own secrets, CI, deploy, database, or issue lifecycle.

Work scope:

- Split into purpose-specific repositories according to `docs/REPOSITORY_STRATEGY.md`.
- Keep Voxon Shield separate from EverCommons.
- Give each application separate deployment, secrets, database boundary, and abuse policy.
- Prepare each repo with README, security policy, threat model or RFC, local setup, CI, branch protection or repository rules, code scanning where supported, secret scanning where available, and dependency alerts.
- Extract Shield first when its real boundary fires: HTTPS API, JWKS, signing keys, provider adapter, recovery process, SDK release, database, secrets, or deployment.

Stop gate:

- Repos have clear ownership, README, security policy, local setup, CI, and deployment docs.
- No production database is shared across unrelated apps.
- No messy prototype dump is copied into a new public repo without boundary cleanup.

## Phase 8: Future Applications

Status: ideas only.

Possible apps:

- Verified knowledge/news.
- Safer dating/meeting.
- Forums/communities.
- Campaign and sustainability tools.

Start condition:

- A real unmet need is documented.
- Existing healthy open-source or public-interest projects have been researched first.
- VoxonLabs can explain why it should build rather than support an existing project.
- Shield integration does not create cross-app tracking.
- A short app brief or RFC defines users, exclusions, data inventory, Shield claims, safety model, moderation/appeal model, repo/deploy boundary, cost plan, and stop gate.

Stop gate:

- Separate repo and deployment plan.
- Separate app policy.
- App-specific safety model.
- No shared global trust score.
