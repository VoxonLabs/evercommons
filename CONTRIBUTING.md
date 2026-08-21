# Contributing

EverCommons is pre-alpha. The useful contribution style right now is small, finite, and reviewable.

## Good First Contributions

- Review the founding charter for unclear commitments.
- Review `docs/RFC-0002-VOXON-SHIELD.md` and the local proof in `shield/` for identity, authentication, pseudonymity, and safety risks.
- Review `docs/RFC-0004-EVERCOMMONS-ARCHITECTURE.md` for backend, feed, media integration, cost, and lock-in risks.
- Run `cd shield && npm test` after assertion-schema changes.
- Improve the static site for accessibility, responsive layout, or copy clarity.
- Draft issue templates for creator interviews, infrastructure requests, and privacy review.
- Create a threat-model checklist for signed uploads and quota abuse.
- Translate public-facing copy with terminology notes.
- Prototype one flow: onboarding, feed, upload stub, creator dashboard, report/appeal, or "why this ad" in `evercommons/prototype/`.

## Working Rules

- Be specific about the problem you are solving.
- Do not imply official partnership or endorsement without written approval.
- Do not add third-party analytics, pixels, or behavioural tracking.
- Keep zero-cost defaults unless a paid dependency is explicitly approved.
- Prefer portable static assets and open formats.
- Document tradeoffs in plain language.

## Decision Standard

Every public promise should become:

1. An operating rule.
2. A measurable signal.
3. A decision gate.

If a promise cannot be measured, funded, or kept, it should remain an open question rather than a public claim.
