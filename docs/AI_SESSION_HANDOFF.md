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
- Architecture and quality gates are governed by docs/ARCHITECTURE_GOVERNANCE.md.
- Broad, strategic, UI/product, investor-facing, and autonomous-work requests are governed by docs/AUTONOMOUS_EXECUTION_RULES.md.

Before coding, read these files in order:
1. AGENTS.md
2. docs/CURRENT_STATE.md
3. README.md
4. docs/PHASED_BUILD_PLAN.md
5. docs/ENGINEERING_SECURITY_BASELINE.md
6. docs/REPOSITORY_STRATEGY.md
7. docs/ARCHITECTURE_GOVERNANCE.md
8. docs/AUTONOMOUS_EXECUTION_RULES.md for broad, strategic, UI/product, investor-facing, or autonomous-work requests.
9. docs/RFC-0002-VOXON-SHIELD.md
10. shield/README.md if the request touches Shield assertions, issuer, verifier, pairwise subjects, or passkeys.
11. shield/docs/PASSKEY_THREAT_MODEL.md and docs/RFC-0006-AUTH-RECOVERY.md if the request touches recovery, device loss, attestation, provider adapters, or production sessions. If the task is to implement any of those, stop and use a high-reasoning model. RFC-0006 is architecture only.
12. docs/RFC-0003-MEDIA-CDN-SECURITY.md and evercommons/media/ if the request touches uploads, media, storage, or CDN.
13. docs/RFC-0004-EVERCOMMONS-ARCHITECTURE.md if the request touches the EverCommons backend, feed, cost, or repo split.
14. docs/RFC-0005-ANDROID-CLIENT-STACK.md and android/ if the request touches the native Android client, Compose, or mobile performance.
15. The specific files related to my request.

Your first answer must not jump directly into coding. First tell me:
- Current phase
- Next safe step from docs/CURRENT_STATE.md
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
- Turn broad work into a task packet with goal, boundary, data/secrets, source standards, stop gates, acceptance criteria, verification, and handoff before coding.
- Do not add tracking, raw identity collection, public uploads, payments, ads, private messaging, minors support, or production identity proofing without threat modeling and approval.
- Prefer passkeys/WebAuthn over passwords for future auth.
- Do not treat one phone passkey as a mature account system. Recovery, multiple authenticators, session revocation, and abuse tests need a reviewed design before public accounts.
- Keep Shield provider-agnostic. CIE, SPID, eIDAS wallets, mobile driver's licenses, passport vendors, age-estimation vendors, passkey providers, and future wallets are adapters, not the architecture.
- Locked auth plan: low-risk access should not require identity proof; passkeys handle normal login; Shield assertions handle higher-risk capabilities; recovery is separate; anti-abuse uses layered controls, not government ID on every login. See docs/RFC-0006-AUTH-RECOVERY.md. Do not implement recovery from that RFC.
- Use the architecture decision protocol before changing repo, deploy, data, API, identity, recovery, media, moderation, payment, or future-app boundaries. Shield split timing is docs/SHIELD_EXTRACTION_CHECKLIST.md.
- Do not invent cryptography or compliance claims.
- Build real usable product steps, validate them, update docs/CURRENT_STATE.md, and leave a handoff. For visible UI, check mobile and desktop, accessibility basics, flow states, text fit, and dark-pattern risks.
```

## Short Continuation Prompt

Use this when the model already has the repo open:

```text
Continue VoxonLabs from AGENTS.md. Read docs/CURRENT_STATE.md first, identify the current phase from docs/PHASED_BUILD_PLAN.md, read docs/ARCHITECTURE_GOVERNANCE.md, read docs/AUTONOMOUS_EXECUTION_RULES.md for broad/strategic/UI/autonomous work, inspect git status, research anything current/security-sensitive from primary sources, then execute the Next safe step in docs/CURRENT_STATE.md unless I named a different task. Update docs/CURRENT_STATE.md before you finish. Do not skip stop gates.
```

## Expected Model Behavior

A good model should:

- Read before acting.
- Tell you if your requested next step is unsafe or too early.
- Suggest a safer smaller milestone.
- Keep Shield, apps, media, and future products modular.
- Research current standards or providers when needed.
- Implement the agreed change, or the Next safe step in docs/CURRENT_STATE.md if the request is vague.
- Run checks.
- Update docs/CURRENT_STATE.md before finishing.
- Commit/push/deploy only when asked, in the clusters listed in CURRENT_STATE.md.
- End with a concise handoff.

A weak model should:

- Avoid security-sensitive implementation.
- Draft a plan and ask for stronger review.
- Not pretend to know current standards.
