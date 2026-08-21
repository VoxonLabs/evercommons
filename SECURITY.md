# Security Policy

EverCommons is pre-alpha and does not yet operate public user accounts, uploads, ads, payouts, or production infrastructure.

## Current Scope

In scope:

- Static site files in `evercommons/`.
- Public documentation and repository configuration.
- Any future prototype code once added to this repository.

Out of scope:

- The `voxonlabs.com` domain until this repository is actually deployed there.
- Third-party services not configured in this repository.
- The founding blueprint PDF as an archival planning document.

## Reporting

Until a dedicated security contact exists, report issues privately to the project owner through an existing private channel. Do not publish exploit details before the maintainer has had a reasonable chance to respond.

When a dedicated mailbox is configured, update this file with:

```text
security@voxonlabs.com
```

## Data Principles

- Do not add third-party behavioural analytics.
- Do not collect personal data unless the product function requires it.
- Do not keep raw operational events longer than needed.
- Do not use private messages or non-public media for model training.
- Treat public upload, payout, advertising, and moderation systems as security-critical.

## Before Public Accounts

The project needs at least:

- Threat model for auth, upload, media processing, ads, moderation, and ledgers.
- Backup and restore test.
- Export and deletion test.
- Abuse-rate limits and quota controls.
- Incident response checklist.
- Dependency review.
