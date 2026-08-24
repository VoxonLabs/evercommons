# Performance measurement gates (offline proof)

Status: harness verified on emulator. Emulator numbers are **not** production claims.

## Budgets (from Android docs)

| Metric | Target | Source |
| --- | --- | --- |
| Frame time @ 60 fps | under 16 ms | https://developer.android.com/topic/performance/vitals/render |
| Frozen frame | never above 700 ms | same |
| Startup / scroll | Macrobenchmark on release-like builds | https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview |
| First-launch paths | Baseline Profiles for critical journeys | https://developer.android.com/topic/performance/baselineprofiles/overview |

## Modules

- `:app` UI tests: navigation, disabled upload/archive gates, archive badge, safety controls
- `:benchmark` Macrobenchmark: cold startup, feed scroll after continue (`connectedBenchmarkReleaseAndroidTest`)
- `:benchmark` BaselineProfileGenerator: onboarding → feed → profile (`connectedNonMinifiedReleaseAndroidTest`)

## Commands

```bash
source ~/Android/env.sh
cd android
./gradlew :app:connectedDebugAndroidTest
./gradlew :benchmark:connectedBenchmarkReleaseAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.voxonlabs.evercommons.benchmark.StartupAndScrollBenchmark
./gradlew :benchmark:connectedNonMinifiedReleaseAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.voxonlabs.evercommons.benchmark.BaselineProfileGenerator
./gradlew :benchmark:collectNonMinifiedReleaseBaselineProfile \
  :app:copyReleaseBaselineProfileIntoSrc
```

Generated profiles land in `app/src/release/generated/baselineProfiles/` (gitignored `*.txt`; see README there).

## Emulator suppression

This proof sets `androidx.benchmark.suppressErrors=EMULATOR` so the Macrobenchmark harness can run on the local AVD. That flag is for **functional verification of the harness**, not for accepting emulator timings as product evidence.

## Harness sample (Pixel_8_API_35 emulator only — not a smoothness claim)

| Benchmark | Metric | Sample |
| --- | --- | --- |
| coldStartup | timeToInitialDisplayMs median | ~692 ms |
| feedScrollAfterContinue | frameDurationCpuMs P50 / P90 | ~76 / ~99 ms |

These exceed the 16 ms @ 60 fps budget on the emulator, as expected. Re-measure on a mid-range physical device before any product performance claim.

## Claim rule

Do **not** claim Signal/Instagram-class smoothness until a mid-range physical device reports startup, frame timing, and scroll metrics against the budgets above. Emulator results only prove the harness runs.

## Local signing note

The `release` build type in this proof is signed with the debug keystore so Macrobenchmark and Baseline Profile APKs can install. Do not treat that as a Play Store signing key.
