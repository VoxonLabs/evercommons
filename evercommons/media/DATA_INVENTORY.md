# Media data inventory

Status: local stub inventory. Not a production record of user data.

| Data | Zone | Sensitivity | Public? | Retention in this stub |
| --- | --- | --- | --- | --- |
| Raw upload bytes | intake-private, processing-private | Untrusted, may contain malware, EXIF/GPS, illegal material | No | Until delete/purge |
| Original filename | discarded | May contain personal data | No | Not stored |
| Client MIME / size / duration | slot metadata only, untrusted | Low | No | Slot lifetime 60s |
| Generated object ID | all records | Internal | Derivative URL id only after publish | Until purge |
| Processed derivative bytes | media-restricted, then media-public if published | Still untrusted until policy says otherwise | Only after moderator publish | Until delete/purge |
| Report/appeal evidence | moderation-private | High | No | Until policy says otherwise |
| Quota counters | memory | Operational | No | Calendar day |
| Purge log keys | memory | Operational | No | Process lifetime |
| Backup copies | backup-private (empty in stub) | High if used | No | Not written yet |

The EverCommons application must not store identity documents or Shield provider packets in any media zone.
