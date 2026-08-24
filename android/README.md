# EverCommons Android offline proof

Status: local offline vertical slice for RFC-0005. Not a Play Store app.

## What this is

A Jetpack Compose prototype of the EverCommons Social screens (onboarding, feed, upload stub, profile, report, safety, creator, capacity).

## Hard limits

- No network client
- No dangerous permissions
- No passkeys, uploads, archive unpack, or camera
- No analytics or push
- No production signing / Play Console

## Setup

1. Install Android Studio Quail 3 (user-local: `~/android-studio`).
2. Use Temurin JDK 17 for Gradle (`~/.jdks/temurin-17`). Studio's bundled JBR 25 is for the IDE only.
3. Point SDK at `~/Android/Sdk` via `android/local.properties` (gitignored).
4. Load environment helpers:

```bash
source ~/Android/env.sh
cd android
./gradlew :app:assembleDebug
```

See also `PERFORMANCE.md` for Macrobenchmark and Baseline Profile gates.

## Emulator

```bash
source ~/Android/env.sh
emulator -avd Pixel_8_API_35 -netdelay none -netspeed full &
./gradlew :app:installDebug
adb shell am start -n com.voxonlabs.evercommons.proof/.MainActivity
```

## Tests

UI / accessibility (debug):

```bash
./gradlew :app:connectedDebugAndroidTest
```

Macrobenchmark (release-like `benchmarkRelease`; prefer a real device):

```bash
./gradlew :benchmark:connectedBenchmarkReleaseAndroidTest
```

Baseline Profile generation and collect into `app/src/release/generated/baselineProfiles/`:

```bash
./gradlew :benchmark:connectedNonMinifiedReleaseAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.voxonlabs.evercommons.benchmark.BaselineProfileGenerator
./gradlew :benchmark:collectNonMinifiedReleaseBaselineProfile \
  :app:copyReleaseBaselineProfileIntoSrc
```

Emulator numbers are functional only. Do not claim Signal/Instagram-class smoothness without a mid-range physical device.

Release builds in this proof use the **debug keystore** only so instrumentation can install them. That is not a production Play signing key.

## Deploy packaging

Never include this folder in Cloudflare Pages bundles. See `docs/LAUNCH_CHECKLIST.md`.
