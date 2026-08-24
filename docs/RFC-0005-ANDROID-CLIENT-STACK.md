# RFC-0005: Android Client Stack

Status: accepted for an offline native proof. Not a launch date. Not a Play Store commitment.

This RFC locks the **first production-bound client** for EverCommons Social: native Android. The HTML/JavaScript shell in `evercommons/prototype/` remains a disposable interaction specification and campaign proof. It is not the production app.

It does **not** authorize:

- public accounts
- public uploads
- Play Console publishing
- production signing keys
- analytics or push providers
- iOS builds (no Mac/Xcode in the current workstation)
- a launch date

## 1. Decision

| Choice | Decision | Why |
| --- | --- | --- |
| First closed-pilot client | Native Android: Kotlin + Jetpack Compose | Google recommends Compose for modern Android UI; Views are maintenance-mode. Media, passkeys, and profiling stay on platform APIs. |
| Rejected for production client | React Native, Flutter, PWA-as-app | Viable elsewhere; not chosen for the first media-heavy, accessibility-sensitive pilot. |
| Web surfaces | Campaign site + clickable prototype only | Marketing and UX review stay static. |
| iOS | Deferred | No Mac. When iOS starts: SwiftUI UI + optional Kotlin Multiplatform for **business logic only**. |
| Shared UI across platforms | Not now | Prefer native UI quality over shared-UI frameworks. |

Sources:

- Jetpack Compose (recommended toolkit): https://developer.android.com/compose
- Android is Compose-first: https://developer.android.com/develop/ui/compose/first
- Kotlin Multiplatform (business logic, Android + iOS): https://developer.android.com/kotlin/multiplatform
- Now in Android reference app: https://github.com/android/nowinandroid

## 2. Client architecture

```text
Android app (Kotlin + Compose)
    |
    |  HTTPS JSON API (future)
    |  audience = evercommons
    v
EverCommons API  ----Shield---->  short-lived assertion
    |                             (pairwise sub, derived booleans)
    +--> social graph / feed store
    +--> media pipeline
    +--> moderation / report / appeal
    +--> capacity / cost ledger
```

The browser prototype is **not** in this path. Passkey login and Shield assertions stay separate steps, as in RFC-0002 / RFC-0004.

### Stack (locked for the Android proof)

| Layer | Choice |
| --- | --- |
| UI | Jetpack Compose + Material 3 |
| Navigation | Single-activity Navigation Compose |
| Architecture | Unidirectional data flow; ViewModel; coroutines / Flow |
| Local source of truth (future) | Room for relational data; DataStore for small preferences |
| Auth (future, not in offline proof) | Credential Manager passkeys |
| Media pick (future) | System Photo Picker first; no broad storage permission |
| Playback (future) | Media3 ExoPlayer |
| Durable uploads (future) | WorkManager |
| Direct capture (future) | CameraX only after explicit approval |

### Offline proof constraints

The `android/` module in this repo is an **offline vertical slice**:

- Local fixture feed only
- No network
- No passkey registration
- No file picking, archive unpack, uploads, or camera
- No analytics, notifications, or production persistence
- No dangerous permissions in the manifest

## 3. Portable server boundaries

Lock **contracts**, not vendors:

| Boundary | Portable rule | Deferred selection |
| --- | --- | --- |
| API | HTTPS JSON / OpenAPI | Workers vs VM |
| Domain/service code | TypeScript compatible with standard runtimes | Runtime host |
| App SQL | Ordinary relational schemas | D1 vs Postgres |
| Objects | S3-compatible APIs; private intake zones | R2 vs other S3 |
| Media processing | Isolated maintained encoders | Exact binary / host |

Do not open D1, R2, Stream, or Images storage until Phase 6 gates pass.

## 4. Performance budgets

Smoothness is measured, not claimed.

| Metric | Target | Source |
| --- | --- | --- |
| Frame budget (60 fps) | Under 16 ms per frame | https://developer.android.com/topic/performance/vitals/render |
| Frozen frames | Never above 700 ms | Same |
| Startup / scroll | Measure with Macrobenchmark on release-like builds | https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview |
| First-launch paths | Ship Baseline Profiles when critical journeys exist | https://developer.android.com/topic/performance/baselineprofiles/overview |

Emulator checks are functional only. A real mid-range Android device is required before claiming Signal/Instagram-class smoothness.

## 5. Repo placement

Keep the Android proof under `android/` in this monorepo until a split trigger fires (own secrets, Play signing, separate CI, or production API).

Future split candidate: `VoxonLabs/evercommons-android` when the app has its own deploy lifecycle.

Static Pages deploys must **exclude** `android/` (Gradle caches, APKs, local SDK paths). See `docs/LAUNCH_CHECKLIST.md`.

## 6. Explicit non-promises

- No Play Store listing
- No claim that native equals production-ready auth
- No claim that recovery is designed
- No iOS timeline
- No uniqueness / “one human” claim

## 7. Build order

1. Document this RFC and link it from the roadmap.
2. Install Android Studio + SDK + one AVD on Linux.
3. Scaffold the offline Compose proof with disabled gates.
4. Add Compose UI tests and Macrobenchmark / Baseline Profile modules.
5. Do not enable accounts, uploads, or network until Phase 6 gates pass.

## References

- `docs/RFC-0001-MVP.md`
- `docs/RFC-0004-EVERCOMMONS-ARCHITECTURE.md`
- `docs/REPOSITORY_STRATEGY.md`
- `docs/ENGINEERING_SECURITY_BASELINE.md`
- `evercommons/prototype/` (interaction specification only)
- Credential Manager: https://developer.android.com/identity/credential-manager
- Photo Picker: https://developer.android.com/training/data-storage/shared/photopicker
- Media3 ExoPlayer: https://developer.android.com/media/media3/exoplayer
- WorkManager: https://developer.android.com/develop/background-work/background-tasks/persistent
- CameraX: https://developer.android.com/media/camera/camerax
