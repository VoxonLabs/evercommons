# RFC-0004: EverCommons Technical Architecture

Status: draft for public review. Not a build commitment and not a launch date.

EverCommons Social is application #1 on Voxon Shield. This RFC describes how a **closed 100-user adult pilot** could be assembled without locking the project into one vendor, one server, or one surveillance-shaped data model.

It does **not** authorize:

- public accounts
- public uploads
- production databases
- paid Cloudflare Images storage or Stream
- a launch date

Local evidence already exists: Shield assertions (`shield/`), localhost passkeys (`shield/src/passkeys/`), a clickable UX shell (`evercommons/prototype/`), and an in-memory media stub (`evercommons/media/`). Recovery after device loss remains unimplemented on purpose.

## 1. Repo split decision

Keep the current `VoxonLabs/evercommons` repository as the public proof and prototype monorepo until a split trigger fires.

That matches `docs/REPOSITORY_STRATEGY.md`. There is still no production user data, no production secrets in Git, and no public package.

Do **not** create empty product repositories now.

Logical modules inside this repo today:

```text
/                       VoxonLabs static site
evercommons/            campaign site, UX prototype, media stub
shield/                 local assertion + passkey proof
docs/                   RFCs and operating rules
```

Split later, in this order, only when the trigger is real:

| Future repo | Trigger |
| --- | --- |
| `VoxonLabs/voxon-shield` | Shield has its own HTTPS API, JWKS, secrets, or deploy |
| `VoxonLabs/evercommons` product app | EverCommons has a production API, database, or user sessions |
| `VoxonLabs/evercommons-media` | Real buckets, queues, or transcode workers exist |
| `VoxonLabs/voxonlabs-site` | Parent site deploy/lifecycle diverges from the product |

EverCommons must not import Shield internals or share a Shield database. Media zones must not live in the application database.

## 2. System shape

```text
Browser (passkey session)
    |
    |  audience = evercommons
    v
EverCommons API  ----Shield---->  short-lived assertion
    |                             (pairwise sub, derived booleans)
    +--> social graph / feed store
    +--> media pipeline (private intake -> derivative -> policy)
    +--> moderation / report / appeal
    +--> capacity / cost ledger
```

Login proves continuity. A Shield assertion proves derived adult-human eligibility. They stay separate HTTP steps, as in the localhost prototype.

The application primary key for a person is the pairwise `sub` for audience `evercommons`, not an email, phone, or global VoxonLabs ID.

## 3. Bounded contexts

| Context | Owns | Must not own |
| --- | --- | --- |
| Shield | Assertions, passkeys, pairwise `sub`, revocation | EverCommons posts, follows, media bytes |
| App API | Handles, profiles, graph, post metadata, sessions for this app | Raw identity documents, raw uploads |
| Media | Bytes, zones, transcode, purge | Social graph, Shield keys |
| Safety | Reports, appeals, block/mute, explicit defaults | A global trust score |
| Capacity | Quotas, kill switch, cost samples | User tracking graphs |
| Creator ledger | Shadow revenue, sponsor disclosure | Live payouts or tax IDs in v1 |

## 4. App backend (pilot)

For a 100-user invite-only adult pilot, prefer a small explicit API over a distributed microservice farm.

Minimum API groups:

- Session: passkey login via Shield, logout, CSRF, expiry
- Me: handle, profile, export, delete
- Graph: follow, unfollow, block, mute
- Feed: following, latest, discovery
- Posts: metadata create after media is `ready_private` or later
- Reports / appeals
- Creator shadow stats
- Capacity dashboard (public, non-personal)

Authorization is server-side. Every mutating route answers: subject, audience `evercommons`, action, policy, and a loggable non-sensitive outcome.

Input is validated at the API. SQL is parameterized. Cookies are host-only, `Secure`, `HttpOnly`, `SameSite` as designed in a later production-session review. Localhost prototype cookies must not be reused on `voxonlabs.com`.

No private messaging. No live streaming. No password-first login.

## 5. Feed

Pilot scale is small enough for **query-on-read**:

- Following: posts from accounts the subject follows, `created_at` descending
- Latest: all eligible published posts, `created_at` descending
- Discovery: published posts plus labeled contextual sponsor cards; ranking rules must be public text, not a hidden engagement model

Discovery must not use Shield claims beyond eligibility, must not use other apps' data, and must not build a hidden behavioral profile.

Fan-out-on-write is optional later if following graphs grow. Do not introduce a recommendation vendor.

## 6. Upload integration

Uploads stay behind the media kill switch.

Happy path for a future closed pilot, not for today:

1. Passkey session exists.
2. EverCommons verifies a fresh Shield assertion (`verified_human`, `age_over_18`, `account_eligible`).
3. Capacity service allows an upload slot (user quota, project cap, kill switch).
4. Media service issues a one-time private intake slot. Object IDs are server-generated.
5. Client uploads to private intake only. Filename and client MIME are untrusted.
6. Pipeline validates magic numbers, size, and duration caps, then writes a derivative.
7. State moves to `pending_review`. Nothing is on a public CDN yet.
8. A moderator (or an explicit closed-pilot auto-publish policy, if later approved) may publish the **derivative** only.

The local stub in `evercommons/media/` already encodes this state machine. Do not skip it.

## 7. Media processing and storage

Processing must re-encode with maintained tools. The current stub does not decode real media and must not be used as a production parser.

Storage zones remain those in RFC-0003. Raw bytes never share a public bucket or the app hostname.

Two storage paths must stay viable (RFC-0001 alpha gate):

| Path | Objects | Notes |
| --- | --- | --- |
| A. Cloudflare R2 private buckets | Intake and derivatives | Free-tier 10 GB Standard, no R2 egress fee per [R2 pricing](https://developers.cloudflare.com/r2/pricing/). Public buckets are forbidden for raw intake. Cache purge is mandatory on delete. |
| B. Other S3-compatible private store | Same zone names | Portable backup if Cloudflare concentration is too high |

Cloudflare Images storage and Stream are **not** the default. Stream bills stored and delivered minutes ([Stream pricing](https://developers.cloudflare.com/stream/pricing/), updated 21 Apr 2026). Images storage is a paid plan ([Images pricing](https://developers.cloudflare.com/images/pricing/)). Either can be revisited with a written cost cap; neither is approved here.

## 8. Moderation, reporting, export, deletion

Pilot moderation is human-in-the-loop. Automation may assist later; it must not be claimed as sufficient.

States follow RFC-0003 / `evercommons/media/src/states.js`. Reports and appeals need a reason, an actor role, and an expiry or review deadline. Evidence stays in `moderation-private`.

Export for a user:

- profile and handle
- follows / blocks / mutes
- post metadata and derivative IDs they own
- not other people's private media
- not Shield provider packets

Deletion:

- app rows for that subject
- raw and derivative objects they own
- CDN purge keys
- backups according to a published retention rule (not instant-global unless proven)

Account deletion is a product action plus a media purge, not a UI toggle.

## 9. Cost architecture

Cost is a security control.

- Kill switch defaults on until a closed pilot is explicitly opened
- Per-user daily upload quota
- Project daily upload cap
- Duration and resolution caps before any real transcoder
- Public capacity dashboard with sample-then-measured cost per upload and per watch-minute
- No Stream-by-default, because delivery minutes can dominate a tiny budget

A 100-user pilot should be able to halt uploads without taking down the static campaign site.

## 10. Infrastructure comparison (no selection yet)

Checked 21 Aug 2026 from vendor docs. Re-check before spending money or enabling a database.

| Option | Role | Cost snapshot | Lock-in / portability | Verdict for now |
| --- | --- | --- | --- | --- |
| Cloudflare Pages | Static site (already live) | Zero-cost static | Low if the site stays files | Keep |
| Local Node stubs | Shield, media, UX | Zero | None | Keep until a closed pilot is approved |
| Cloudflare D1 | Possible app SQL | Workers Free: 5 GB, 5M rows read / 100k rows written **per day** ([D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), 21 Apr 2026) | SQL is relatively portable if schemas stay ordinary | Candidate for a later closed pilot, not enabled |
| Cloudflare R2 private | Object zones | 10 GB-month free Standard | S3 API helps exit | Candidate; public buckets forbidden for intake |
| Cloudflare Workers | API | Re-check [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) before pilot | Worker-specific APIs can lock logic | Candidate only with a portable core |
| Postgres + S3-compatible on a small VM | Alternate path | Usually low-cost, not always free | High portability | Required alternative path; not provisioned |
| Cloudflare Stream / Images storage | Media SaaS | Paid dimensions | High | Not approved |

Do not put production user data in D1 or R2 until threat models for the closed pilot are accepted and secrets are outside Git.

## 11. Threat models

These are architecture-level. They do not replace a closed-pilot review.

### 11.1 Upload abuse

Attacker floods slots, sends polyglots, posts malware, or steals another user's slot.

Controls: kill switch, authn, Shield eligibility, one-time slots, magic-number sniff, size/duration caps, quotas, private intake, no public raw, moderator publish, tests in `evercommons/media/test/pipeline.test.js`.

Residual: real decoders can still be exploited; production must use maintained transcoders, not the stub.

### 11.2 Moderation abuse

Attacker mass-reports rivals, moderator collusion, leaked evidence, or revenge appeals.

Controls: report rate limits (to be implemented with the API), reasons required, evidence in `moderation-private`, human review in pilot, appeals with expiry, no global score, no cross-app punishment.

Residual: a 100-user pilot still needs coverage hours. If coverage is missing, keep the kill switch on.

### 11.3 Account abuse

Stolen passkey, enumeration, fake handles, using EverCommons `sub` to join other apps.

Controls: pairwise `sub`, audience-scoped assertions, no email/phone required in the app DB, no identifier-first login that leaks other VoxonLabs apps, short-lived sessions, recovery **not** implemented until a high-reasoning review.

Residual: device-loss recovery is an open high-risk design. Do not ship public accounts without it or an explicit "no recovery" warning that is honest.

### 11.4 Cost abuse

Attacker forces transcode, bandwidth, or storage spend.

Controls: quotas, project cap, duration/resolution limits, kill switch, capacity dashboard, reject Stream as default, measure before opening video.

Residual: a misconfigured public R2 bucket or a cache that never purges can still cost reputation even if R2 egress is free.

## 12. Security baseline map

| Baseline rule | Planned control |
| --- | --- |
| Minimize personal data | Pairwise `sub`, no ID documents in app DB, discard filenames |
| No third-party tracking | No pixels; contextual ads only; public ranking text |
| No raw identity documents in app DB | Shield boundary |
| No secrets in Git | `.env` ignored; no production keys yet |
| Passkeys over passwords | Shield localhost prototype; production recovery still open |
| Server-side ACL | API policy checks; UI prototype is not authorization |
| Validate at trusted boundary | Media stub + future API validation |
| Maintained libraries, not custom crypto | `jose`, SimpleWebAuthn; future transcode via maintained encoders |
| Threat model before public accounts/uploads | This RFC + RFC-0002 + RFC-0003; public uploads still off |
| Never serve raw uploads on public CDN | Media zones + tests |
| Reasoned, appealable safety | Report/appeal states; no global score |

WCAG 2.2 remains the UX baseline for any future app UI.

## 13. Explicit non-promises

- No public alpha date
- No "we are live for uploads"
- No official Cloudflare partnership
- No claim that D1 or R2 is selected
- No claim that uniqueness / "one human" is solved
- No claim that recovery is designed

## 14. Build order after this RFC

1. Public architecture review (this RFC + GitHub issue)
2. Do not open D1/R2/Stream
3. Optional: portable schema sketches in-repo, still empty of user data
4. Closed adult pilot remains Phase 6 and stays blocked on recovery, legal/privacy review, and tested media purge

## Open questions

- Recovery after device loss (high-reasoning review; `shield/docs/PASSKEY_THREAT_MODEL.md`)
- Which of path A or path B is used for the first closed pilot
- Who staffs human moderation for 100 users
- Legal basis and process for illegal-content preservation

## References

- `docs/RFC-0001-MVP.md`
- `docs/RFC-0002-VOXON-SHIELD.md`
- `docs/RFC-0003-MEDIA-CDN-SECURITY.md`
- `docs/ENGINEERING_SECURITY_BASELINE.md`
- `docs/REPOSITORY_STRATEGY.md`
- `evercommons/media/THREAT_MODEL.md`
- `evercommons/media/PROVIDER_EVAL.md`
- Cloudflare D1 pricing (21 Apr 2026): https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Cloudflare Stream pricing (21 Apr 2026): https://developers.cloudflare.com/stream/pricing/
- Cloudflare Images pricing: https://developers.cloudflare.com/images/pricing/
- Cloudflare Workers pricing (re-check before pilot): https://developers.cloudflare.com/workers/platform/pricing/
- OWASP ASVS 5.0: https://owasp.org/www-project-application-security-verification-standard/
- CISA Secure by Design: https://www.cisa.gov/securebydesign
