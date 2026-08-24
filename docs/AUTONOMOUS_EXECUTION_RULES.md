# Autonomous Execution Rules

Status: required operating rule for AI-assisted and autonomous work.

This file turns the VoxonLabs vision into executable discipline. It exists to prevent impressive-looking but weak work: broad generated code dumps, unsafe identity shortcuts, vague UI, hidden tracking, fake maturity, and unfinished handoffs.

Use it with `AGENTS.md`, `docs/CURRENT_STATE.md`, `docs/ARCHITECTURE_GOVERNANCE.md`, and `docs/ENGINEERING_SECURITY_BASELINE.md`.

## Operating Decision

Build the trust layer before the social product grows.

For the current roadmap this means:

- Finish Shield architecture review, authentication boundaries, provider-adapter rules, recovery requirements, and extraction readiness before EverCommons moves toward public accounts or uploads.
- "Finish Shield" does not mean implementing CIE, SPID, EUDI Wallet, recovery codes, or production identity proofing now. It means making the boundary reviewed, testable, extractable, and hard to misuse.
- EverCommons remains a prototype until Shield, media/CDN, moderation, privacy/legal, and quality gates are ready.
- The VoxonLabs public site must stay honest: public proof, pre-alpha, no partnership, foundation, certification, launch, user-count, or safety claims that are not true.
- Future apps wait until Shield boundaries and app-brief rules are strong enough to keep data, moderation, identity, and deployment separate.

## Task Packet Rule

An AI agent must not start material work from a vague ambition. Convert the request into a bounded task packet first, either in the issue, docs, PR, or handoff.

Each task packet needs:

- Goal: what user-visible or reviewer-visible outcome will exist.
- Boundary: VoxonLabs site, Shield, EverCommons, media, Android, infrastructure, docs, or future app.
- Data and secrets: what is introduced, retained, exposed, deleted, or logged.
- Source standard or research: which current guidance applies, and whether browsing is required.
- Stop gates: what must not be touched in this task.
- Acceptance criteria: observable behavior or document state required before done.
- Verification: exact command, screenshot, manual check, or review evidence.
- Handoff: `docs/CURRENT_STATE.md` update and any next safe step.

If a task cannot be packeted safely, stop at an RFC, ADR, threat model, review issue, or question. Do not code around the ambiguity.

## Definition of Done

A task is not done because files changed.

It is done only when:

- The intended artifact works or the intended rule is clearly written.
- The smallest meaningful tests, build, lint, or manual checks were run.
- Visible UI changes were checked on mobile and desktop, with no text overlap or broken states.
- Security-sensitive behavior has negative tests or a written reason why no code was implemented.
- Docs and public labels still match reality.
- No forbidden scope was introduced: accounts, uploads, provider login, recovery, paid services, analytics, ads, DMs, minors, or shared cross-app user data.
- `docs/CURRENT_STATE.md` records what changed, what was verified, what remains blocked, and the next safe step.
- `git status --short` is understood before any commit.
- No dev server is left running.

## Professional UI/UX Gate

VoxonLabs products should look intentionally designed, not AI-generated for appearance only.

For any visible UI change:

- Build the actual usable workflow first, not a marketing shell.
- Define the primary user task and keep the first screen useful for that task.
- Use consistent layout, spacing, typography, color, and component patterns. Add a small design system or tokens before creating many one-off styles.
- Support mobile and desktop viewports. Check at least one narrow mobile size and one desktop size before handoff.
- Verify text fits its containers, controls remain reachable, and page sections do not overlap.
- Include loading, empty, error, disabled, success, and destructive-action states where the flow can reach them.
- Meet WCAG 2.2 as the accessibility baseline: semantic structure, keyboard access, visible focus, labels, contrast, reduced-motion handling where motion exists, and touch targets appropriate for mobile.
- Do not use dark patterns. Consent, privacy choices, reporting, appeal, deletion, and unsubscribe/cancel flows must be clear and not harder than the action that created the state.
- Do not add third-party tracking, analytics, pixels, or embedded scripts without explicit approval and privacy review.
- Do not claim performance, accessibility, safety, or moderation quality without test evidence.

For investor or public-review readiness, a UI proof should have screenshots or manual viewport notes, clear proof/prototype labels, and a short explanation of what is intentionally disabled.

## Security and Privacy Gate

Before collecting personal data, enabling accounts, uploads, payments, private messaging, minors support, identity proofing, or production deployment, write the relevant threat model and data inventory.

The inventory must answer:

- What data is collected and why.
- Whether the feature can work without that data.
- Where the data is stored and who can access it.
- Retention, deletion, export, and appeal paths.
- Logs and analytics, including what is deliberately not logged.
- Cross-border, vendor, and processor boundaries if any vendor is involved.
- Abuse cases, denial-of-service and cost-abuse cases, and incident response path.

Default decisions:

- No raw identity documents in application databases.
- No raw user uploads in public CDN paths.
- No cross-app user database, social graph, moderation profile, or global trust score.
- No government identity at the front door for low-risk features.
- No password-first recovery shortcut.
- No SMS as a primary security factor.
- No custom cryptography, identity proofing, media parsing, or payment handling.
- No unsupported compliance, certification, or bot-free claims.

## Autonomous AI Risk Locks

Autonomy is useful only when it is bounded.

AI agents must not:

- Expand a task into a new product, provider integration, repo split, paid service, public launch, or legal commitment.
- Add dependencies, SDKs, hosted services, analytics, or external scripts because they are convenient.
- Claim checks passed without running them.
- Hide uncertainty, invent standards, or write fake compliance language.
- Stage or commit unrelated clusters together.
- Rewrite product strategy during implementation without updating the governing docs and stop gates.
- Use generated UI or code that cannot be explained, tested, and maintained.
- Treat model output, generated screenshots, or mocked data as user evidence.
- Make partnership, foundation, endorsement, or security-review claims before written evidence exists.

AI agents should:

- Prefer small, complete vertical slices over broad partial scaffolds.
- Research current primary sources for security, identity, privacy, law, vendors, payments, media, deployment, and AI-agent risks.
- Record assumptions and sources in docs or handoff.
- Ask only when the answer blocks safe progress.
- Leave the repository easier for the next senior reviewer to inspect.

## Research Backlog

Research is required before these workstreams move beyond local proofs:

1. Shield authentication and recovery: NIST SP 800-63-4, WebAuthn, passkeys, FIDO guidance, account recovery abuse, authenticator lifecycle, and session revocation.
2. Shield provider adapters: EUDI Wallet, CIE, SPID, mobile driver's licenses, age-estimation vendors, passport vendors, jurisdiction coverage, retention, legal basis, and fallback paths.
3. Privacy and legal: GDPR data protection by design/default, DPIA triggers, privacy notice, terms, processor agreements, data export/deletion, and transparency duties.
4. Media and CDN: upload threat model, private intake, re-encoding, metadata stripping, moderation evidence, takedown, deletion, purge, cost abuse, and vendor lock-in.
5. Moderation and safety: reporting, appeal, reviewer safety, evidence retention, illegal content workflows, transparency notes, and abuse of reporting.
6. Professional UI/UX: WCAG 2.2, mobile ergonomics, dark-pattern avoidance, consent clarity, safety UX, and accessibility testing.
7. Supply chain and repo operations: branch protection or repository rules, CodeQL, secret scanning and push protection, Dependabot, OpenSSF Scorecard, SLSA/provenance, dependency license and maintenance review.
8. Outreach, funding, and partnerships: who can be contacted, what can be claimed, what evidence they need, and which conversations create legal, privacy, or reputational obligations.

## Outreach Timing

Do not ask people to trust a system before the proof matches the request.

Suggested order:

1. Now: ask security, privacy, accessibility, open-source governance, and architecture reviewers to review the public proof and RFCs. Ask for critique, not endorsement.
2. After Shield architecture review: contact WebAuthn/passkey, privacy engineering, cryptography, and digital identity experts for focused review of Shield boundaries and recovery assumptions.
3. After media/CDN threat model: contact infrastructure providers or sponsors about zero-cost or cost-capped options. Do not accept lock-in before deletion, export, abuse, and cost controls are documented.
4. After UI proof has mobile/desktop evidence: contact creators, community advisors, civil-society groups, and potential early users for usability feedback. Keep uploads and accounts disabled.
5. Before any closed pilot: get legal/privacy review, moderation coverage, incident response, data export/deletion, recovery readiness, and abuse testing in place.
6. Before investor conversations that imply product readiness: make the repo clean, phase labels honest, checks reproducible, roadmap gated, risks explicit, and no public claims beyond evidence.

## Source References

Use current primary sources and re-check them when a workstream starts:

- CISA Secure by Design: https://www.cisa.gov/securebydesign
- CISA/FBI Product Security Bad Practices: https://www.cisa.gov/news-events/alerts/2025/01/17/cisa-and-fbi-release-updated-guidance-product-security-bad-practices
- NIST SSDF SP 800-218: https://csrc.nist.gov/pubs/sp/800/218/final
- NIST Privacy Framework: https://www.nist.gov/privacy-framework
- NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework
- NIST Digital Identity Guidelines SP 800-63-4: https://pages.nist.gov/800-63-4/
- W3C WebAuthn Level 3: https://www.w3.org/TR/webauthn-3/
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- EDPB Guidelines 4/2019 on Article 25: https://www.edpb.europa.eu/documents/guideline/guidelines-42019-on-article-25-data-protection-by-design-and-by-default_en
- European Commission data protection by design/default summary: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- OWASP SAMM: https://owasp.org/www-project-samm/
- OWASP GenAI LLM Top 10: https://genai.owasp.org/initiatives/top-10-for-llm-and-genai/
- OWASP Agentic Skills Top 10: https://owasp.org/www-project-agentic-skills-top-10/
- FTC Bringing Dark Patterns to Light: https://www.ftc.gov/reports/bringing-dark-patterns-light
- MVSP: https://mvsp.dev/
- OpenSSF Scorecard: https://github.com/ossf/scorecard-action
- SLSA: https://slsa.dev/
