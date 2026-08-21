# EverCommons media local stub

Status: local fake-file pipeline. Public uploads remain disabled.

This folder is Phase 4 evidence for `docs/RFC-0003-MEDIA-CDN-SECURITY.md`. It does not talk to R2, Images, Stream, or any CDN.

```bash
cd evercommons/media
npm test
```

Kill switch is **on** by default. Tests turn it off only to exercise fake JPEG/PNG/MP4 bytes in memory.

Raw objects stay in `intake-private` / `processing-private`. The public zone may hold processed derivatives only, and only after a moderator publish step.
