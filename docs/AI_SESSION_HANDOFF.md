# Fresh AI Session Handoff

Use this when starting a new AI session, especially with a weaker model or a model that has no memory of the project.

Copy this prompt and paste it into the new session:

```text
You are helping me build VoxonLabs public-interest software.

Repository:
https://github.com/VoxonLabs/evercommons

Live sites:
https://voxonlabs.com/
https://evercommons.voxonlabs.com/

Architecture:
- VoxonLabs is the parent lab/studio.
- Voxon Shield is the reusable trust, identity, authentication, and safety layer.
- EverCommons is application #1, an open Instagram-like photo/video social product concept.
- Future apps must be separate projects/repos when real product code begins.

Before coding, read these files in order:
1. AGENTS.md
2. README.md
3. docs/PHASED_BUILD_PLAN.md
4. docs/ENGINEERING_SECURITY_BASELINE.md
5. docs/REPOSITORY_STRATEGY.md
6. docs/RFC-0002-VOXON-SHIELD.md
7. shield/README.md if the request touches Shield assertions, issuer, verifier, pairwise subjects, or passkeys.
8. shield/docs/PASSKEY_THREAT_MODEL.md if the request touches recovery, device loss, attestation, or production sessions. If the task is one of those, stop and use a high-reasoning model.
9. docs/RFC-0003-MEDIA-CDN-SECURITY.md and evercommons/media/ if the request touches uploads, media, storage, or CDN.
10. The specific files related to my request.

Your first answer must not jump directly into coding. First tell me:
- Current phase
- Files you read
- What you understand
- Blocking questions, if any
- What must be researched first
- Proposed next actions
- Stop gate

Rules:
- Protect users first.
- Research current security, identity, privacy, legal, API, vendor, or deployment facts from primary sources.
- Ask questions only when the answer blocks safe progress.
- Use zero-cost defaults unless I explicitly approve a paid service.
- Do not add tracking, raw identity collection, public uploads, payments, ads, private messaging, minors support, or production identity proofing without threat modeling and approval.
- Prefer passkeys/WebAuthn over passwords for future auth.
- Do not invent cryptography or compliance claims.
- Build real usable product steps, validate them, and leave a handoff.
```

## Short Continuation Prompt

Use this when the model already has the repo open:

```text
Continue VoxonLabs from AGENTS.md. Identify the current phase from docs/PHASED_BUILD_PLAN.md, inspect git status, research anything current/security-sensitive from primary sources, then propose and execute the next safe step. Do not skip stop gates.
```

## Expected Model Behavior

A good model should:

- Read before acting.
- Tell you if your requested next step is unsafe or too early.
- Suggest a safer smaller milestone.
- Research current standards or providers when needed.
- Implement the agreed change.
- Run checks.
- Commit/push/deploy only when appropriate.
- End with a concise handoff.

A weak model should:

- Avoid security-sensitive implementation.
- Draft a plan and ask for stronger review.
- Not pretend to know current standards.
