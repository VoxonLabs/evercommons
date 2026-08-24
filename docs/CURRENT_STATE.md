# Current State

Living snapshot for every AI session. Read this before planning. Update it before finishing.

Last updated: 2026-08-25

## Phase

**Phase 5.5 Android client proof in progress. Phase 6 remains blocked.**

Roadmap: `docs/PHASED_BUILD_PLAN.md`. If this file and the roadmap disagree about *what to do now*, this file wins, then update the roadmap in the same change.

## What is true

- Public proof sites and governance docs exist. No public accounts, uploads, ads, payouts, or identity provider.
- Shield is a **local mock** in `shield/`. Login and assertions are separate. `POST /api/recovery` returns **501** on purpose.
- EverCommons web UX is a **prototype** in `evercommons/prototype/`. Upload stays disabled.
- Media pipeline is a **local stub** with the kill switch on.
- Architecture drafts: RFC-0004 (app), RFC-0005 (Android), RFC-0006 (auth/recovery). RFC-0006 does **not** authorize recovery code or CIE/SPID/EUDI integration.
- Android offline proof source exists in `android/`. Local `:app:assembleDebug` passes. It has no network client, no dangerous permissions, no accounts, no uploads, and no production signing.
- Shield stays in this repo until `docs/SHIELD_EXTRACTION_CHECKLIST.md` fires. Do not create `VoxonLabs/voxon-shield` for optics.
- First automated watcher: `.github/workflows/proof-checks.yml`.
- Autonomous execution rules now live in `docs/AUTONOMOUS_EXECUTION_RULES.md` and are wired into `AGENTS.md`, `docs/ARCHITECTURE_GOVERNANCE.md`, `docs/ENGINEERING_SECURITY_BASELINE.md`, `docs/PHASED_BUILD_PLAN.md`, `docs/AI_SESSION_HANDOFF.md`, `.cursor/rules/`, and the PR template. Broad, strategic, UI/product, investor-facing, or autonomous-work requests must become bounded task packets before coding.
- Cryptographic agility and post-quantum readiness are now governance requirements. Future production-bound identity, recovery, media storage, backups, secrets, and long-lived encrypted data need a crypto inventory, algorithm/key agility, and NIST PQC research before implementation. Do not hand-roll post-quantum cryptography.
- OmniAuth was cloned to `/tmp/OmniAuth` and evaluated in `docs/OMNIAUTH_EVALUATION.md`. Decision: reference material only; do not import it into Shield or EverCommons. Low-risk prototype hardening was applied in the clone, but remaining mobile audit risk requires a deliberate React Native upgrade.
- Recovery, public accounts, and provider login are **not implemented**.

## Working tree

Clean as of this handoff.

The previous dirty work was saved as separate commits:

1. `8ebbb63` — governance, recovery gates, Shield extraction, CI, Dependabot, review templates.
2. `a51430c` — Android offline proof, RFC-0005, Android deploy exclusions.
3. `65153bd` — creator archive bridge architecture and disabled prototype UI.

Do not recreate a mixed dirty tree. Future work should still keep architecture, Android, and prototype/product changes separate.

## Next safe step

If the user names a task, run it through the stop gates in `AGENTS.md`, then do that task.

If the user says **continue**, **let's do it**, or is vague:

1. Check GitHub Actions for `proof-checks.yml` after push and fix only failures inside the current proof scope.
2. If an Android emulator/device is available, run connected Android UI tests and Macrobenchmark harness checks, then record results.
3. Do not start Phase 6.
4. Do not implement recovery, CIE/SPID login, public accounts, uploads, or a Shield repo split.
5. Do not add product scope to the Android proof (no network, no dangerous permissions, no uploads).

## Do not do next

- Recovery protocol or `/api/recovery` other than 501
- CIE, SPID, EUDI Wallet, or any provider as EverCommons login
- Public accounts, public uploads, CDN, DMs, ads, payouts, minors
- New Shield GitHub repo
- Backend (D1, R2, Stream, production API)
- Signal/Instagram-class performance claims without a mid-range physical device
- Custom cryptography, custom post-quantum identity, quantum-safe claims without evidence, or experimental PQC packages in production
- One giant commit of Android + Shield + prototype + docs

## Checks

```bash
cd shield && npm test
node --test evercommons/prototype/check.test.js
cd evercommons/media && npm test
cd android && ./gradlew :app:assembleDebug
```

Android needs `JAVA_HOME`, `ANDROID_HOME`, and `ANDROID_SDK_ROOT` set locally. Use `GRADLE_USER_HOME=/tmp/voxon-gradle` in restricted environments. Android connected UI and benchmark tests need an emulator/device. Emulator timings are not smoothness evidence.

## Last handoff

Autonomous execution governance was added so future AI sessions convert broad ambition into bounded task packets with acceptance criteria, professional UI/UX evidence, security/privacy stop gates, outreach timing, and current-source research. Shield/identity foundations should be reviewed and made extractable before EverCommons moves toward public accounts, uploads, or pilot work.

Post-quantum note: quantum-safe migration is a real future requirement, but the safe current action is crypto-agility, inventory, key/token versioning, and standards tracking. Do not implement custom PQC, custom passkeys, or quantum-safe identity claims in this planning repo.

Verified this session:

- `cd shield && npm test` passed when run with localhost bind permission. The sandbox-only run failed with `listen EPERM: operation not permitted 127.0.0.1`, not a product test failure.
- `node --test evercommons/prototype/check.test.js` passed.
- `cd evercommons/media && npm test` passed.
- `cd android && GRADLE_USER_HOME=/tmp/voxon-gradle ./gradlew :app:assembleDebug` passed with local Java/Android SDK environment.

Dirty clusters were cleaned into separate commits. The repository should now be easier for a reviewer or fresh AI session to inspect.

OmniAuth handoff: the clone at `/tmp/OmniAuth` has local hardening changes for server-issued one-time challenges, replay rejection, safer PQC prototype wording, native password-retention cleanup, and mobile dependency reductions. It remains outside Voxon and must stay reference-only unless a future RFC, license review, cryptographic review, and Shield threat model approve a specific reuse path.
