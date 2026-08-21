# RFC-0003: Media and CDN Security Architecture

Status: draft.

EverCommons is media-heavy by design. That makes media handling one of the highest-risk parts of the whole project.

## Local stub status

An in-memory fake-file pipeline exists at `evercommons/media/`. Public uploads stay disabled. The kill switch defaults to on.

Run:

```bash
cd evercommons/media
npm test
```

The stub:

- Rejects unauthenticated slots, bad types, size/duration overflow, and quota exhaustion.
- Stores raw bytes only in private zones.
- Publishes processed derivatives only, and only after a moderator action.
- Records a CDN purge log on deletion. There is no real CDN.

It does not decode real images or video, strip real EXIF, or talk to Cloudflare.

The rule is simple:

```text
No public uploads until media security, moderation, storage, CDN, deletion, and cost controls are designed and tested.
```

Do not treat media as "just files on a CDN." User uploads can carry malware, parser exploits, illegal material, personal data, copyright risk, harassment evidence, tracking pixels, decompression bombs, cost attacks, and cache-poisoning risk.

## Design Goal

Build a media pipeline where:

- Raw uploads are never served directly to users.
- Raw uploads are private, quarantined, and short-retained.
- Public media is a processed derivative with safe metadata.
- Upload and viewing paths are separated.
- CDN cache behavior is explicit and revocable.
- Moderation, deletion, appeals, and legal review are part of the architecture.
- Cost abuse is treated as a security problem.

## Core Architecture

```text
User
  |
  | 1. request upload slot
  v
App API / Shield policy check
  |
  | 2. short-lived one-time upload URL
  v
Private intake bucket / upload provider
  |
  | 3. quarantine record
  v
Validation and scanning worker
  |
  | 4. transcode / resize / strip metadata
  v
Processed media bucket
  |
  | 5. moderation state controls publication
  v
CDN delivery domain
  |
  | 6. public or signed delivery URL
  v
Viewer
```

## Storage Zones

Use separate zones, buckets, or providers for different trust levels.

```text
intake-private      raw upload, temporary, never public
processing-private  worker/transcode workspace
media-public        approved derivatives only
media-restricted    private or followers-only derivatives
moderation-private  reports, hashes, review evidence, appeals
backup-private      encrypted backup where needed
```

The exact provider can change. The trust boundary must not.

## Upload Rules

Uploads require:

- Authenticated user or controlled pilot identity.
- App policy check before upload slot creation.
- Per-user, per-IP, per-device/session, and per-cohort quotas.
- Short-lived upload URL.
- One upload URL per intended object.
- Maximum file size before upload.
- Maximum decoded size after processing.
- Allowed media type list.
- Server-side content sniffing, not trust in `Content-Type`.
- Generated object IDs, never user filenames.
- No executable content.
- No archives in the social MVP.
- No public read access to raw uploads.

Cloudflare Images direct creator uploads and Cloudflare Stream direct upload URLs may be useful later because they avoid exposing API keys to clients. Cloudflare R2 presigned URLs may also be useful for direct object upload, but presigned URLs are bearer tokens and must be short-lived and scoped.

## Validation Rules

Each uploaded file must pass:

- Extension allowlist.
- MIME sniffing.
- Magic-number/file-signature validation.
- Size limit.
- Decode test.
- Metadata stripping.
- Re-encoding into known safe output formats.
- Malware scan or provider scan where available.
- Abuse-risk checks appropriate to the pilot scope.

Never trust:

- Original filename.
- Client-provided MIME type.
- Client-provided dimensions.
- Client-provided duration.
- Client-provided metadata.
- Client-side moderation labels.

## Image Pipeline

Version 1 image direction:

```text
raw image -> private intake -> validate -> strip EXIF/GPS -> resize variants -> re-encode -> publish derivative
```

Allowed derivatives should be predictable:

```text
thumbnail
feed
profile
full-width
```

Do not serve the original upload as the public asset by default.

Images must strip GPS, camera serials, editing history, and other metadata unless a future product explicitly needs a narrow field.

## Video Pipeline

Version 1 video direction:

```text
raw video -> private intake -> validate -> transcode -> thumbnail -> captions workflow -> publish adaptive derivative
```

Video adds higher cost and higher abuse risk than images. Before public video upload:

- Measure cost per upload minute.
- Measure cost per watch minute.
- Add duration and resolution limits.
- Add transcoding failure handling.
- Add queue backpressure.
- Add moderation queue.
- Add takedown path.
- Add reprocessing path when policy changes.

Cloudflare Stream may be evaluated for a future pilot because it provides upload, encoding, adaptive delivery, and signed viewing primitives. It is not automatically approved because pricing, lock-in, moderation, deletion, analytics, and export must be reviewed first.

## CDN Delivery Rules

Use a dedicated media domain, for example:

```text
media.evercommons.voxonlabs.com
```

Delivery rules:

- No cookies on media domain unless absolutely required.
- No app sessions on media domain.
- Strong `Content-Type`.
- `X-Content-Type-Options: nosniff`.
- CSP on app pages restricts media sources explicitly.
- Public content uses immutable derived URLs where safe.
- Restricted content uses signed URLs or a Worker authorization layer.
- Cache keys must not include private tokens in a way that leaks access.
- Takedown/deletion must purge or invalidate affected CDN objects.
- `r2.dev` or development object URLs are not production delivery paths.

Do not serve raw uploads through the same hostname as the app.

## Access Modes

Media should have explicit access modes:

```text
draft       uploader only
quarantine  system/reviewer only
private     uploader or authorized subjects only
unlisted    link access, if product needs it
public      approved for public CDN
blocked     never delivered
deleted     unavailable and scheduled for purge/retention cleanup
```

Access mode changes require authorization and audit logging.

## Moderation and Safety States

Media needs a reviewable state machine:

```text
uploaded
validating
quarantined
processing
ready_private
pending_review
published
reported
restricted
blocked
appealed
deleted
purged
```

Each state should define:

- Who can view it.
- Who can change it.
- Whether CDN delivery is allowed.
- Whether comments/discovery are allowed.
- Retention deadline.
- Appeal path.

## Explicit and Illegal Content Boundary

EverCommons has already committed to explicit-content controls and child-aware safety. Media architecture must support that commitment.

Before any public uploads:

- Define what content is disallowed.
- Define what content is age-restricted.
- Define who reviews reports.
- Define escalation for suspected illegal content.
- Define preservation rules for reports where legally required.
- Get specialist/legal review before handling child sexual abuse material or other legally sensitive content.

Do not make public claims that automated moderation can solve this alone.

## Cost Abuse Controls

Media can bankrupt a small project.

Controls required before upload pilots:

- Per-user upload quota.
- Per-user storage quota.
- Per-user bandwidth/watch quota or cohort cap.
- Max file size.
- Max duration.
- Max resolution.
- Max processing retries.
- Queue limits.
- Daily project-wide cost cap.
- Kill switch for uploads.
- Public capacity dashboard for pilot scale.

Cost controls are security controls.

## Privacy Rules

Media privacy requirements:

- Strip location and device metadata.
- Do not train models on non-public uploads.
- Do not expose raw moderation evidence publicly.
- Do not leak private media through thumbnails, previews, embeds, caches, logs, or referrers.
- Do not use third-party analysis services without a data-processing review.
- Keep logs useful but not invasive.

If a private media URL leaks, it should expire quickly or be revocable.

## Deletion and Takedown

Deletion must cover:

- Database record.
- Raw upload.
- Processed derivatives.
- Thumbnails.
- Captions.
- CDN cache.
- Search/discovery indexes.
- Backups according to published retention rules.
- Moderation/report copies according to legal and safety policy.

The product must distinguish:

```text
user deletion
moderation removal
legal takedown
account deletion
backup expiry
```

Do not promise instant global deletion unless the system can prove it.

## Observability Without Surveillance

Track operational health:

- Upload success/failure.
- Processing time.
- Queue depth.
- Storage use.
- Egress/bandwidth.
- Error rates.
- Takedown/purge latency.
- Abuse quota hits.

Avoid:

- Cross-site tracking.
- Ad-tech pixels.
- View histories retained forever.
- Device fingerprinting.
- Hidden behavioral profiles across applications.

## Provider Evaluation

No provider is approved by default.

Evaluate providers on:

- Free tier and realistic cost at pilot size.
- Egress pricing.
- Upload limits.
- Direct upload support.
- Private bucket support.
- Signed URL support.
- CDN purge/invalidation.
- Export/migration path.
- Region/data-processing terms.
- Security controls.
- Moderation support.
- Analytics privacy.
- Lock-in risk.

For Cloudflare, evaluate:

- R2 for object storage with private buckets and Workers access.
- Images for direct image upload and signed URL delivery.
- Stream for video upload, encoding, and signed viewing.
- Cache rules and cache-security features for media domains.

## MVP Build Order

1. Keep public uploads disabled. Still true.
2. Draft media data inventory. Done: `evercommons/media/DATA_INVENTORY.md`.
3. Draft threat model for upload, processing, delivery, deletion, and cost abuse. Done: `evercommons/media/THREAT_MODEL.md`.
4. Define media state machine. Done: `evercommons/media/src/states.js`.
5. Define storage zones and naming rules. Done: `evercommons/media/src/zones.js`.
6. Build a local-only upload stub with fake files and no public storage. Done: `evercommons/media/src/pipeline.js`.
7. Add tests for file type, size, state transitions, authorization, deletion, and CDN purge assumptions. Done: `evercommons/media/test/pipeline.test.js`.
8. Evaluate Cloudflare R2/Images/Stream against free/low-cost and lock-in constraints. Drafted, not approved: `evercommons/media/PROVIDER_EVAL.md`.
9. Only then build a closed pilot upload path. Not started.

## Stop Gate Before Public Uploads

Do not enable public uploads until all are true:

- Threat model complete.
- Upload quotas implemented.
- Raw uploads private.
- Public delivery uses processed derivatives only.
- Malware/content validation strategy documented.
- Metadata stripping implemented.
- Moderation/report/appeal flow ready.
- Takedown and deletion flow tested.
- CDN purge flow tested.
- Cost cap and upload kill switch ready.
- Privacy notice updated.
- Legal/specialist review complete for explicit and illegal content handling.

## Standards and Provider References

- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- OWASP Input Validation Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- OWASP Content Security Policy Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- Cloudflare R2 public buckets: https://developers.cloudflare.com/r2/buckets/public-buckets/
- Cloudflare R2 presigned URLs: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- Cloudflare R2 pricing, including free tier and egress note: https://developers.cloudflare.com/r2/pricing/
- Cloudflare Images pricing: https://developers.cloudflare.com/images/pricing/
- Cloudflare Stream pricing (updated 21 April 2026): https://developers.cloudflare.com/stream/pricing/
- Cloudflare Images direct creator uploads: https://developers.cloudflare.com/images/storage/upload-images/direct-creator-upload/
- Cloudflare Stream secure viewing: https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/
