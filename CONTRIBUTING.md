# Contributing

EverCommons is pre-alpha. The useful contribution style right now is small, finite, and reviewable.

## Good First Contributions

- Review the founding charter for unclear commitments.
- Review `docs/RFC-0002-VOXON-SHIELD.md` and the local proof in `shield/` for identity, authentication, pseudonymity, and safety risks.
- Review `docs/RFC-0004-EVERCOMMONS-ARCHITECTURE.md` for backend, feed, media integration, cost, and lock-in risks.
- Review `docs/RFC-0005-ANDROID-CLIENT-STACK.md` and the offline Compose proof under `android/`.
- Review `docs/RFC-0006-AUTH-RECOVERY.md` for multi-device login, recovery, and provider-adapter risks. Do not implement recovery from that review.
- Run `cd shield && npm test` after assertion-schema changes.
- Improve the static site for accessibility, responsive layout, or copy clarity.
- Draft issue templates for creator interviews, infrastructure requests, and privacy review.
- Create a threat-model checklist for signed uploads and quota abuse.
- Translate public-facing copy with terminology notes.
- Prototype one flow: onboarding, feed, upload stub, creator dashboard, report/appeal, or "why this ad" in `evercommons/prototype/`.

## Working Rules

- Be specific about the problem you are solving.
- Label the work honestly as public proof, local mock, prototype, offline proof, or production-bound.
- Do not imply official partnership or endorsement without written approval.
- Do not add third-party analytics, pixels, or behavioural tracking.
- Do not add secrets, production identity, public uploads, payments, ads, private messaging, minors support, or provider integrations without the required RFC/threat model and approval.
- Keep zero-cost defaults unless a paid dependency is explicitly approved.
- Prefer portable static assets and open formats.
- Document tradeoffs in plain language.
- Keep commits and pull requests intentional. Do not hide unrelated docs, prototype, Android, Shield, and media changes in one vague change.

## Review Gates

Before opening or merging a meaningful change:

- Use the PR template.
- Check `docs/ARCHITECTURE_GOVERNANCE.md`.
- Update `docs/CURRENT_STATE.md` if the change moves the phase, next step, or blockers.
- Open or reference an architecture-review issue when boundaries, providers, identity, recovery, media, repos, or future apps are affected.
- Ask whether Shield remains modular enough to extract without EverCommons product data, UI, social graph, or app policy.
- Run the smallest meaningful tests or explain why the change is docs-only.
- Keep production claims out of mocks, prototypes, and offline proofs.

The watcher is process: issue review, PR review, security baseline, automated checks, and security review where available. Do not build a separate AI auditor product for this stage.

## Decision Standard

Every public promise should become:

1. An operating rule.
2. A measurable signal.
3. A decision gate.

If a promise cannot be measured, funded, or kept, it should remain an open question rather than a public claim.
