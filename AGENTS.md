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

1. Read `docs/CURRENT_STATE.md` first. It is the living snapshot of phase, next safe step, blockers, and uncommitted clusters.
2. Read `README.md`.
3. Read `docs/PHASED_BUILD_PLAN.md`.
4. Read `docs/ENGINEERING_SECURITY_BASELINE.md`.
5. Read `docs/REPOSITORY_STRATEGY.md`.
6. Read `docs/ARCHITECTURE_GOVERNANCE.md`.
7. Read `docs/AUTONOMOUS_EXECUTION_RULES.md` when the task is broad, strategic, UI/product, investor-facing, or asks an AI to work autonomously.
8. Read the specific RFC or file related to the task.
9. Run `git status --short`.
10. State the current phase, the **Next safe step**, and any blocking question.

If `docs/CURRENT_STATE.md` and `docs/PHASED_BUILD_PLAN.md` disagree about what to do *now*, `CURRENT_STATE.md` wins. Update the phased plan in the same change if the phase actually moved.

Do not jump directly into coding if the phase, repo boundary, or safety risk is unclear.

## Session Loop

Every session is one cycle. Finish the cycle. Do not leave the next model to reconstruct state from chat.

1. **Orient** using the start sequence. `CURRENT_STATE.md` is "where we are." The phased plan is the roadmap.
2. **Choose one step.** If the user names a task, run it through the stop gates. If the user says "continue", "let's do it", or is vague, execute the **Next safe step** in `docs/CURRENT_STATE.md`. Do not invent a more exciting step.
3. **Research** when the step is security, identity, recovery, media, vendors, law, or paid services.
4. **Implement** only that step. Keep the diff narrow. Do not mix Android, Shield, prototype, and docs in one vague change.
5. **Verify** with the smallest meaningful checks listed in `CURRENT_STATE.md` or the relevant module README.
6. **Write forward.** Update `docs/CURRENT_STATE.md` in the same change: what is now true, what was verified, the next safe step, and any new blocker.
7. **Handoff** in the finish format below. Commit, push, or deploy only when the user asks, using the commit clusters in `CURRENT_STATE.md`.

An unfinished session that does not update `CURRENT_STATE.md` is a continuity failure.

## Autonomous Execution Rule

For broad, strategic, UI/product, investor-facing, or autonomous-work requests, apply `docs/AUTONOMOUS_EXECUTION_RULES.md` before implementation.

The short version:

- Turn vague ambition into one bounded task packet with goal, boundary, data/secrets, source standards, stop gates, acceptance criteria, verification, and handoff.
- Prefer small complete vertical slices over broad partial scaffolds.
- Do not mark work done until the artifact works or the rule is clearly written, checks were run, docs match reality, and `CURRENT_STATE.md` is updated.
- For visible UI, require mobile and desktop fit, accessibility baseline, real flow states, and no dark-pattern consent or privacy choices.
- For investor/public-readiness work, make status labels, stop gates, evidence, and risks obvious. Looking early is acceptable; looking careless is not.
- For AI-agent risks, prevent excessive agency: no new provider, paid service, repo split, launch claim, partnership claim, dependency, tracking, recovery, identity proofing, uploads, or public accounts unless the governing docs explicitly allow it.

## Architecture Decision Rule

The rules in this repository are living safety defaults. If a rule is too weak, outdated, or blocks a safer architecture, update the rule with a clear rationale instead of silently working around it.

Before material implementation, use `docs/ARCHITECTURE_GOVERNANCE.md` to identify:

- the product boundary being changed
- data introduced or exposed
- repo, deployment, secret, database, API, SDK, and legal/privacy boundaries
- standards or maintained libraries to use
- abuse cases, recovery paths, and stop gates
- automated checks and human review needed

If those answers are not clear, stop at an RFC, ADR, threat model, or review issue.

## Research Rule

Research before acting when the task involves:

- Security, identity, authentication, cryptography, media upload, CDN/storage, safety, privacy, law, payments, children, moderation, deployment, DNS, email, external APIs, current standards, or paid vendors.
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
- Enabling media upload, CDN delivery, storage buckets, or third-party media processing.
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
- Never serve raw user uploads as public CDN assets.
- Use reasoned, scoped, appealable safety decisions. No global social-credit score.
- Keep Shield provider-agnostic. CIE, SPID, eIDAS wallets, mobile driver's licenses, passport vendors, age-estimation vendors, passkey providers, and future wallets are possible adapters, not the architecture.
- Treat account recovery as a high-risk authentication design, not a small feature.
- Locked auth plan: low-risk access does not require identity proof; passkeys handle normal login; Shield assertions handle higher-risk capabilities; recovery is separate; anti-abuse uses layered controls, not government identity on every login. See `docs/RFC-0006-AUTH-RECOVERY.md`. Do not implement recovery from that RFC.

If a requested change weakens these rules, warn clearly and propose a safer path.

## Quality Watcher Rule

Build quality must be checked continuously, not patched at the end.

The watcher is process, not a separate app at this stage: architecture-review issues, PR review, security baseline, automated checks, and security review where available. This planning repo's first automated check is `.github/workflows/proof-checks.yml`.

Before finishing implementation, future sessions should confirm the relevant parts of the watcher from `docs/ARCHITECTURE_GOVERNANCE.md`:

- tests/build/lint or the smallest meaningful local equivalent
- docs updated to match behavior
- UI checked on mobile and desktop when visible UI changes
- security-sensitive changes include negative tests
- dependencies reviewed for necessity, maintenance, license, and lock-in
- public repo remains clear, modular, and honest about status
- changed areas are honestly labeled as public proof, local mock, prototype, offline proof, or production-bound
- Shield remains modular enough to extract without EverCommons product data, UI, social graph, or app policy

For real product repos, add CI, branch protection or repository rules, code scanning, secret scanning, dependency alerts, and supply-chain review before public collaboration grows.

## UX and Product Rules

Build the actual usable product or prototype, not a marketing shell.

For frontend work:

- Prioritize speed, clarity, accessibility, and mobile fit.
- Follow WCAG 2.2 as the accessibility baseline.
- Test desktop and mobile viewports before calling work done.
- Include loading, empty, error, disabled, success, and destructive-action states where the flow can reach them.
- Keep typography, spacing, color, and interaction patterns consistent enough that the UI looks designed, not generated file-by-file.
- Avoid UI text that explains obvious controls.
- Avoid decorative complexity that hides the product.
- Keep flows efficient for repeated use.
- Do not use dark patterns. Consent, reporting, appeal, deletion, unsubscribe, and cancellation paths must be clear and not harder than the action that created the state.

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

1. Inspect the relevant code and docs first, including `docs/CURRENT_STATE.md`.
2. Make narrowly scoped changes.
3. Run the smallest meaningful checks.
4. Re-check architecture boundaries if the change touches Shield, identity, media, app data, deployment, or future apps.
5. Add or update tests when behavior changes.
6. Preview UI changes in desktop and mobile if a frontend changes.
7. Update `docs/CURRENT_STATE.md` so the next session can continue without this chat.
8. Commit only intended files, and only when the user asks, in the clusters listed in `CURRENT_STATE.md`.
9. Push and deploy only when requested or when this repo's live public proof must match the accepted change.
10. End with what changed, what was verified, what remains risky, and the next phase.

Never leave required dev servers running after the task.

## Stop Conditions

Stop and ask before continuing if:

- The task requires paid infrastructure and no free path is safe.
- A secret, token, private identity document, or private vulnerability appears in public context.
- The requested build would collect identity, child, payment, health, location, biometric, or intimate data without a threat model and legal/privacy review.
- The next step is a production launch with public accounts, uploads, media CDN delivery, DMs, identity verification, ads, payouts, or minors.
- The next step is production account recovery, global "one human" uniqueness, or a provider-specific identity integration without an approved Shield design.
- A change would merge Shield and application data, create cross-app tracking, or make one future app share another app's user database.
- The model cannot understand the security impact of the change.

For weak or uncertain models: do not implement security-sensitive code. Draft a plan, identify risks, and ask for a stronger review.

## Fresh Session Output Format

When a new AI session starts, respond in this structure before coding:

```text
Current phase:
Next safe step (from docs/CURRENT_STATE.md):
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
CURRENT_STATE.md updated:
Risks / not done:
Next phase:
```
