# VoxonLabs AI Operating Protocol

This file is for AI coding agents, assistants, and future fresh sessions. Read it before making plans or edits in this repository.

## Mission Boundary

VoxonLabs builds public-interest digital systems with open-source discipline, privacy by default, safety by design, zero-cost defaults while early, and transparent governance.

Current architecture:

```text
VoxonLabs       parent lab and public site
Voxon Shield   reusable trust, identity, auth, and safety layer
EverCommons    application #1, an open photo/video social product concept
Future apps    separate projects only when rules, safety, and capacity are ready
```

EverCommons is not the whole architecture. It is the first application built on the Shield model.

## Required Start Sequence

At the start of every session:

1. Read `README.md`.
2. Read `docs/PHASED_BUILD_PLAN.md`.
3. Read `docs/ENGINEERING_SECURITY_BASELINE.md`.
4. Read `docs/REPOSITORY_STRATEGY.md`.
5. Read the specific RFC or file related to the task.
6. Run `git status --short`.
7. State the current phase, the immediate goal, and any blocking question.

Do not jump directly into coding if the phase, repo boundary, or safety risk is unclear.

## Research Rule

Research before acting when the task involves:

- Security, identity, authentication, cryptography, safety, privacy, law, payments, children, moderation, deployment, DNS, email, external APIs, current standards, or paid vendors.
- Product choices that could cost money, lock the project into a provider, or expose users to risk.
- A claim that depends on current information.

Use primary sources where possible: official docs, standards bodies, project repositories, vendor docs, and authoritative security guidance. Summarize findings and include source links in docs or final notes.

Do not invent cryptography, legal advice, compliance claims, partnerships, or production safety guarantees.

## Question Rule

Ask questions only when the answer blocks safe progress.

Prefer one to three precise questions. If a reasonable safe default exists, state the assumption and continue.

Ask before:

- Adding a paid service or dependency.
- Creating accounts, changing DNS, changing email routing, or rotating secrets.
- Collecting personal data.
- Building identity proofing, payments, public uploads, ads, private messaging, or minors support.
- Making a public partnership, endorsement, foundation, or certification claim.

## Security-First Rules

Every product decision must pass these gates:

- Minimize personal data.
- No third-party tracking by default.
- No raw identity documents in application databases.
- No secrets in Git, issues, screenshots, docs, logs, or public chat.
- Passkeys/WebAuthn preferred over passwords for future authentication.
- Application access control is server-side, not UI-only.
- User input is validated at trusted service boundaries.
- Use maintained frameworks and libraries instead of custom security primitives.
- Publish threat models before public accounts, uploads, payments, ads, DMs, or identity proofing.
- Use reasoned, scoped, appealable safety decisions. No global social-credit score.

If a requested change weakens these rules, warn clearly and propose a safer path.

## UX and Product Rules

Build the actual usable product or prototype, not a marketing shell.

For frontend work:

- Prioritize speed, clarity, accessibility, and mobile fit.
- Follow WCAG 2.2 as the accessibility baseline.
- Test desktop and mobile viewports before calling work done.
- Avoid UI text that explains obvious controls.
- Avoid decorative complexity that hides the product.
- Keep flows efficient for repeated use.

For safety-sensitive products, UX must also protect users from dark patterns, confusing consent, unsafe defaults, and irreversible actions.

## Repo and Deployment Rules

The current repository is a zero-cost public proof and planning repo.

Do not put every future product into one repo or one server. Follow `docs/REPOSITORY_STRATEGY.md`.

Until Git-connected Cloudflare Pages is configured, production updates require:

```bash
npx wrangler pages deploy <clean-static-dir> --project-name voxonlabs-home --branch main
npx wrangler pages deploy <clean-evercommons-dir> --project-name evercommons-social --branch main
```

Deploy from a clean bundle, not the repository root. Do not upload `.git`, `.env`, `.wrangler`, local cache, or private files.

## Build/Validate/Finish Rule

For any implementation:

1. Inspect the relevant code and docs first.
2. Make narrowly scoped changes.
3. Run the smallest meaningful checks.
4. Add or update tests when behavior changes.
5. Preview UI changes in desktop and mobile if a frontend changes.
6. Commit only intended files.
7. Push and deploy only when requested or when this repo's live public proof must match the accepted change.
8. End with what changed, what was verified, what remains risky, and the next phase.

Never leave required dev servers running after the task.

## Stop Conditions

Stop and ask before continuing if:

- The task requires paid infrastructure and no free path is safe.
- A secret, token, private identity document, or private vulnerability appears in public context.
- The requested build would collect identity, child, payment, health, location, biometric, or intimate data without a threat model and legal/privacy review.
- The next step is a production launch with public accounts, uploads, DMs, identity verification, ads, payouts, or minors.
- The model cannot understand the security impact of the change.

For weak or uncertain models: do not implement security-sensitive code. Draft a plan, identify risks, and ask for a stronger review.

## Fresh Session Output Format

When a new AI session starts, respond in this structure before coding:

```text
Current phase:
Files read:
What I understand:
Blocking questions:
Research needed:
Proposed next actions:
Stop gate:
```

After finishing work, respond with:

```text
Changed:
Verified:
Published:
Risks / not done:
Next phase:
```
