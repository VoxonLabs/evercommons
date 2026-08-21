# Media threat model (local stub)

Status: working threat model for the in-memory stub. Not a production launch review.

Sources: RFC-0003, OWASP File Upload Cheat Sheet, this stub's tests.

## Upload

| Threat | Mitigation in this stub |
| --- | --- |
| Unauthenticated upload | Slot requires `userId` |
| Trusting filename / MIME | Filename discarded; magic-number sniff must match claimed type |
| Executable or archive upload | Allowlist jpeg/png/webp/mp4 only |
| Oversize / zip bomb | Size and decoded-size caps; no archives |
| Quota / cost exhaustion | Per-user daily quota, project daily cap, kill switch default on |
| Slot reuse | One-time slot, 60s expiry |

## Processing

| Threat | Mitigation in this stub |
| --- | --- |
| Serving the original | Public zone rejects `kind: raw` |
| Parser exploits | No real image/video parser yet. Production must re-encode with maintained tools, not this stub |
| Metadata leak | Derivative is a synthetic buffer labeled metadata-stripped; real EXIF stripping is still to be implemented with a maintained library |

## Delivery

| Threat | Mitigation in this stub |
| --- | --- |
| App and media on one host | Public URL is a reserved media hostname, not implemented as a server |
| Session cookies on media | No cookies in the stub |
| Restricted content on public CDN | `restricted` and `blocked` remove public objects; CDN allowed only for published/restricted states, and restricted is not copied to `media-public` |

## Deletion and takedown

| Threat | Mitigation in this stub |
| --- | --- |
| Delete misses derivatives | Delete removes raw, restricted derivatives, and public copies |
| CDN keeps a stale object | `purgeLog` records media-domain keys. No real CDN yet, so purge is an assertion hook |
| Moderator evidence exposed | Reports go to `moderation-private` only |

## Cost abuse

| Threat | Mitigation in this stub |
| --- | --- |
| Unlimited transcode | Project daily cap and kill switch |
| Video duration attack | Claimed duration cap for mp4; real duration must be measured after a real decoder exists |

## Out of scope here

- Real Cloudflare buckets or Stream
- Malware scanning vendors
- Legal preservation holds
- Child-safety specialist workflows (requires legal review before any public upload)
