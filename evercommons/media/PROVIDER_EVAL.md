# Cloudflare media provider evaluation

Status: not approved. Local stub only. Figures checked 21 August 2026 from Cloudflare docs.

## R2

- Docs: https://developers.cloudflare.com/r2/pricing/
- Free tier (Standard): 10 GB-month storage, 1 million Class A, 10 million Class B, egress from R2 billed as free.
- Public buckets make objects internet-readable. Raw intake must not use a public bucket.
- Presigned URLs are bearer tokens and must be short-lived.
- Custom-domain cache can serve deleted objects until purge. Deletion without cache purge is incomplete.
- Fit for a later private intake / derivative store if buckets stay private and purge is tested. Not enabled.

## Images

- Docs: https://developers.cloudflare.com/images/pricing/
- Free plan: transformations of images stored elsewhere (5,000 unique transformations / month). Storage inside Images is a paid plan.
- Direct creator upload can avoid putting API keys in browsers, but storage/delivery pricing and lock-in still need a cost model.
- Not approved. Do not turn on Images storage for this project yet.

## Stream

- Docs: https://developers.cloudflare.com/stream/pricing/ (updated 21 Apr 2026)
- Storage prepaid about $5 / 1,000 minutes stored. Delivery about $1 / 1,000 minutes delivered. Ingress/encoding described as free.
- Max file size 30 GB. Easy to exceed a zero-cost pilot with a few long videos.
- Signed viewing exists, which matches restricted delivery, but cost and lock-in are high for a 100-user adult pilot.
- Not approved.

## Current recommendation

Keep the in-memory stub. Do not create R2 public buckets, Images storage, or Stream keys. Revisit R2 private buckets only after quotas, purge tests, and a written cost cap for a closed pilot.
