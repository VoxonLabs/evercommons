# Current State

Living snapshot for every AI session. Read this before planning. Update it before finishing.

Last updated: 2026-08-24

## Phase

**Phase 5.5 Android client proof in progress. Phase 6 remains blocked.**

Roadmap: `docs/PHASED_BUILD_PLAN.md`. If this file and the roadmap disagree about *what to do now*, this file wins, then update the roadmap in the same change.

## What is true

- Public proof sites and governance docs exist. No public accounts, uploads, ads, payouts, or identity provider.
- Shield is a **local mock** in `shield/`. Login and assertions are separate. `POST /api/recovery` returns **501** on purpose.
- EverCommons web UX is a **prototype** in `evercommons/prototype/`. Upload stays disabled.
- Media pipeline is a **local stub** with the kill switch on.
- Architecture drafts: RFC-0004 (app), RFC-0005 (Android), RFC-0006 (auth/recovery). RFC-0006 does **not** authorize recovery code or CIE/SPID/EUDI integration.
- Shield stays in this repo until `docs/SHIELD_EXTRACTION_CHECKLIST.md` fires. Do not create `VoxonLabs/voxon-shield` for optics.
- First automated watcher: `.github/workflows/proof-checks.yml`.
- Autonomous execution rules now live in `docs/AUTONOMOUS_EXECUTION_RULES.md` and are wired into `AGENTS.md`, `docs/ARCHITECTURE_GOVERNANCE.md`, `docs/ENGINEERING_SECURITY_BASELINE.md`, `docs/PHASED_BUILD_PLAN.md`, `docs/AI_SESSION_HANDOFF.md`, `.cursor/rules/`, and the PR template. Broad, strategic, UI/product, investor-facing, or autonomous-work requests must become bounded task packets before coding.
- Recovery, public accounts, and provider login are **not implemented**.

## Uncommitted clusters

The working tree is mixed. Do **not** commit it as one vague change. If the user asks to save, use these clusters:

1. **Continuity and architecture** — `AGENTS.md`, `.cursor/rules/`, `docs/CURRENT_STATE.md`, `docs/ARCHITECTURE_GOVERNANCE.md`, `docs/AUTONOMOUS_EXECUTION_RULES.md`, `docs/RFC-0006-AUTH-RECOVERY.md`, `docs/SHIELD_EXTRACTION_CHECKLIST.md`, CI/Dependabot, related README/governance/handoff/RFC-0002 edits, site links to RFC-0006.
2. **Android offline proof** — `android/`, `docs/RFC-0005-ANDROID-CLIENT-STACK.md`, Android bits of gitignore/docs/site, not prototype upload UI.
3. **Prototype / campaign copy** — `evercommons/prototype/*` and leftover campaign HTML only if those diffs are intentional and still proof-only.

Never mix those three in one commit.

## Next safe step

If the user names a task, run it through the stop gates in `AGENTS.md`, then do that task.

If the user says **continue**, **let's do it**, or is vague:

1. Offer to commit the uncommitted work in the three clusters above (do not dump them together).
2. Do not start Phase 6.
3. Do not implement recovery, CIE/SPID login, public accounts, uploads, or a Shield repo split.
4. Do not add product scope to the Android proof (no network, no dangerous permissions, no uploads).

## Do not do next

- Recovery protocol or `/api/recovery` other than 501
- CIE, SPID, EUDI Wallet, or any provider as EverCommons login
- Public accounts, public uploads, CDN, DMs, ads, payouts, minors
- New Shield GitHub repo
- Backend (D1, R2, Stream, production API)
- Signal/Instagram-class performance claims without a mid-range physical device
- One giant commit of Android + Shield + prototype + docs

## Checks

```bash
cd shield && npm test
node --test evercommons/prototype/check.test.js
cd evercommons/media && npm test
```

Android UI tests need an emulator/device. Emulator timings are not smoothness evidence.

## Last handoff

Autonomous execution governance was added so future AI sessions convert broad ambition into bounded task packets with acceptance criteria, professional UI/UX evidence, security/privacy stop gates, outreach timing, and current-source research. Shield/identity foundations should be reviewed and made extractable before EverCommons moves toward public accounts, uploads, or pilot work.

Verified this session:

- `cd shield && npm test` passed when run with localhost bind permission. The sandbox-only run failed with `listen EPERM: operation not permitted 127.0.0.1`, not a product test failure.
- `node --test evercommons/prototype/check.test.js` passed.
- `cd evercommons/media && npm test` passed.

The working tree is still mixed; if saving, keep continuity/architecture, Android offline proof, and prototype/campaign changes as separate commits.
