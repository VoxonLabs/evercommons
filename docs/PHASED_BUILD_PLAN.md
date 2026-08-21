# Phased Build Plan

Status: active operating roadmap.

This file tells future AI sessions where to start, where to stop, and what evidence is required before moving forward.

## Current Phase

Current recommended phase: **Phase 4 - media/CDN local stubs**, still no public uploads.

Phase 3 clickable UX exists at `evercommons/prototype/`. Phase 1–2 Shield work remains mock-only. Recovery after device loss is not implemented.

## Phase Rules

- Each phase has a start condition, work scope, stop gate, and evidence.
- Do not skip gates because the idea feels exciting.
- If a gate cannot be met with zero-cost tools, pause and document the blocker.
- If a phase introduces personal data, public accounts, media uploads, CDN delivery, payments, ads, minors, identity proofing, or private messaging, require threat modeling first.
- Every phase ends with a handoff note: what changed, what was verified, what risks remain, and what the next model should do.

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

Stop gate:

- Local passkey registration/login works in a prototype.
- No password-first system is introduced without explicit approval.
- Recovery, device loss, session expiry, CSRF, and origin-bound assumptions are documented.

Evidence:

- `shield/src/passkeys/` localhost server using SimpleWebAuthn 13.x.
- `shield/docs/PASSKEY_THREAT_MODEL.md`
- `cd shield && npm test` includes origin, CSRF, session, and assertion-separation cases.
- `/api/recovery` returns 501 on purpose.

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

Status: RFC exists. Next work is threat-model detail and local stubs, not public uploads.

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

Status: blocked until Phase 1, Phase 3, and Phase 4 gates pass.

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

Stop gate:

- Repos have clear ownership, README, security policy, local setup, CI, and deployment docs.
- No production database is shared across unrelated apps.

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

Stop gate:

- Separate repo and deployment plan.
- Separate app policy.
- App-specific safety model.
- No shared global trust score.
