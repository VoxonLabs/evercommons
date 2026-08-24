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
- Android offline proof source exists in `android/`. Local `:app:assembleDebug` passes. Connected Compose UI tests and the Macrobenchmark harness pass on the `Pixel_8_API_35` emulator. It has no network client, no dangerous permissions, no accounts, no uploads, and no production signing. Emulator timings are not smoothness evidence.
- Shield stays in this repo until `docs/SHIELD_EXTRACTION_CHECKLIST.md` fires. Do not create `VoxonLabs/voxon-shield` for optics.
- First automated watcher: `.github/workflows/proof-checks.yml`.
- Autonomous execution rules now live in `docs/AUTONOMOUS_EXECUTION_RULES.md` and are wired into `AGENTS.md`, `docs/ARCHITECTURE_GOVERNANCE.md`, `docs/ENGINEERING_SECURITY_BASELINE.md`, `docs/PHASED_BUILD_PLAN.md`, `docs/AI_SESSION_HANDOFF.md`, `.cursor/rules/`, and the PR template. Broad, strategic, UI/product, investor-facing, or autonomous-work requests must become bounded task packets before coding.
- Cryptographic agility and post-quantum readiness are now governance requirements. Future production-bound identity, recovery, media storage, backups, secrets, and long-lived encrypted data need a crypto inventory, algorithm/key agility, and NIST PQC research before implementation. Do not hand-roll post-quantum cryptography.
- OmniAuth was cloned to `/tmp/OmniAuth` and evaluated in `docs/OMNIAUTH_EVALUATION.md`. Decision: reference material only; do not import it into Shield or EverCommons. Low-risk prototype hardening was applied in the clone, but remaining mobile audit risk requires a deliberate React Native upgrade.
- Recovery, public accounts, and provider login are **not implemented**.
- Shield local proof uses `jose` 6.2.10. `proof-checks.yml` uses `actions/checkout@v7` and `actions/setup-node@v7`. Dependabot PRs #2 and #3 were closed as superseded; #4 is merged.

## Working tree

Clean as of this handoff.

This session's leftover notes were saved as separate commits (see log). Keep architecture, Android, and prototype/product changes separate.

## Next safe step

If the user names a task, run it through the stop gates in `AGENTS.md`, then do that task.

If the user says **continue**, **let's do it**, or is vague:

1. Inspect the open public architecture review at https://github.com/VoxonLabs/evercommons/issues/1. Summarize gaps against RFC-0004 / RFC-0005. Do not implement product scope from that issue.
2. Do not start Phase 6.
3. Do not implement recovery, CIE/SPID login, public accounts, uploads, or a Shield repo split.
4. Do not add product scope to the Android proof (no network, no dangerous permissions, no uploads).
5. Do not treat emulator Macrobenchmark numbers as smoothness evidence.

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

Android needs `source ~/Android/env.sh` (or equivalent `JAVA_HOME`, `ANDROID_HOME`, and `ANDROID_SDK_ROOT`). Use `GRADLE_USER_HOME=/tmp/voxon-gradle` in restricted environments. Connected UI and benchmark tests need an emulator or device: `./gradlew :app:connectedDebugAndroidTest` and `:benchmark:connectedBenchmarkReleaseAndroidTest`. Emulator timings are not smoothness evidence.

## Last handoff

Dependabot hygiene for the current proof watcher is done. `jose` 6.2.10 is on `main`. Checkout and setup-node were bumped to v7 in one workflow commit, not via the conflicting Dependabot PRs.

Verified this session:

- Merged https://github.com/VoxonLabs/evercommons/pull/4 — `48de30e` on `main`. Local `cd shield && npm test`: **23 passed**. CI on that push: success (https://github.com/VoxonLabs/evercommons/actions/runs/32789530626).
- Pushed `8e5c397` — `actions/checkout@v7` and `actions/setup-node@v7` together in `.github/workflows/proof-checks.yml`. CI: all three jobs success, including the v7 action steps (https://github.com/VoxonLabs/evercommons/actions/runs/32789562876).
- Closed #2 and #3 as superseded by `8e5c397`.
- Workflow still installs Node **20** for tests. No `pull_request_target`, no `registry-url`.

Session notes and emulator sample numbers were committed in separate clusters. Public architecture review issue #1 remains open. OmniAuth remains reference-only. Phase 6 remains blocked.
