# Architecture Governance and Quality Gates

Status: required operating rule.

This file exists to stop VoxonLabs from becoming a collection of unreviewed prototypes. Future AI sessions and human contributors must use it when deciding whether to code, split a repo, add a service, choose an identity provider, or start a new app.

## Living Rules

The rules in this repository are safety defaults, not immutable law.

If an existing rule blocks a safer, simpler, more mature architecture, update the rule in the same change instead of working around it silently. The update must include:

- the reason the old rule is insufficient
- the safer replacement rule
- the risk created by the change
- the smallest evidence needed before implementation
- primary-source links when the decision depends on current standards, vendors, law, security, identity, privacy, or cost

Do not use "the user asked" as the only justification for a high-risk change.

## Architecture Decision Protocol

Before material implementation, answer these questions in the docs, issue, PR, or final handoff:

1. What boundary is being changed: VoxonLabs site, Shield, EverCommons app, media, Android, infrastructure, or a future app?
2. What data does it introduce, retain, expose, or delete?
3. Does it touch identity, authentication, authorization, recovery, media upload, moderation, payments, ads, minors, private messaging, or public deployment?
4. Does it need its own repo, deploy lifecycle, secrets, database, API, SDK, review surface, or legal/privacy boundary?
5. What existing standard, maintained framework, or reviewed library should be used instead of custom logic?
6. What abuse case, failure mode, and recovery path must be designed before launch?
7. What automated checks and human review are required before merge?
8. What is explicitly not being promised?

If the answer is unclear for a safety-sensitive area, stop at an RFC or threat model. Do not improvise production code.

## Autonomous Work Contract

For broad, strategic, UI/product, investor-facing, or autonomous-work requests, use `docs/AUTONOMOUS_EXECUTION_RULES.md` before coding.

Every autonomous implementation task must be packeted with:

- goal
- affected boundary
- data and secrets introduced or touched
- source standards or research required
- stop gates
- acceptance criteria
- verification evidence
- handoff update

If the task cannot be packeted, the correct output is an RFC, ADR, threat model, review issue, or blocking question. It is not a generated code dump.

## Strategic Sequencing Rule

Current architecture order:

1. Keep the VoxonLabs public site honest and static while governance matures.
2. Finish Shield architecture review, authentication boundaries, provider-adapter rules, recovery requirements, and extraction readiness before EverCommons moves toward public accounts or uploads.
3. Keep EverCommons as a prototype until Shield, media/CDN, moderation, privacy/legal, and quality gates pass.
4. Contact reviewers before sponsors, sponsors before launch claims, and legal/privacy reviewers before any pilot with accounts, uploads, identity proofing, payments, minors, or private messaging.

"Finish Shield" means reviewed and extractable boundaries first. It does not mean implementing recovery, CIE, SPID, EUDI Wallet, passport vendors, age estimation, public accounts, or a global unique-human system in this planning repo.

## Cryptographic Agility Rule

VoxonLabs should be ready for post-quantum cryptography without pretending the early proof is already quantum-safe.

Before production-bound cryptography, identity, recovery, media storage, backups, or long-lived secrets, the design must include:

- a cryptographic inventory
- algorithm and key-rotation agility
- explicit token/key versioning
- retention analysis for "harvest now, decrypt later" risk
- maintained libraries or platform cryptography only
- a rollback and migration path
- a clear statement of which parts are classical, hybrid post-quantum, or post-quantum

Use NIST-standardized PQC only through reviewed protocols, maintained libraries, and platform support. Do not invent custom post-quantum identity, recovery, anonymous credential, zero-knowledge, or "one human" cryptography.

Shield impact:

- Local ES256 JWT assertions remain mock-only local proof.
- Production Shield must preserve issuer, audience, `kid`, expiry, and key-rotation metadata so signing algorithms can change later.
- WebAuthn/passkey cryptography follows the WebAuthn/FIDO/platform ecosystem; VoxonLabs must not fork it or replace it with a custom authenticator protocol.
- PQC work is a Shield/infrastructure review item, not an EverCommons feature.

## Professional Product Gate

Investor-visible maturity comes from evidence, not from making prototypes look like production.

Before a UI or product proof is called ready for review:

- the primary workflow is usable, not just illustrated
- proof/prototype/local-mock/offline-proof labels are visible and true
- mobile and desktop views were checked
- accessibility basics were checked against WCAG 2.2
- loading, empty, error, disabled, success, and destructive-action states exist where the flow can reach them
- privacy choices, deletion, reporting, appeal, unsubscribe, and cancellation are not dark patterns
- third-party scripts, analytics, pixels, and tracking remain absent unless explicitly approved after privacy review
- public copy avoids launch, partnership, foundation, certification, bot-free, safety, or performance claims that do not have evidence

Looking early is acceptable. Looking careless or pretending to be production is not.

## Modularity Defaults

VoxonLabs is the parent lab. Shield is shared trust infrastructure. EverCommons is one application. Future apps are separate products.

Default boundaries:

- Shield owns authentication primitives, minimal assertions, provider adapters, pairwise subjects, app-scoped policy, revocation signals, and recovery policy.
- Applications own their product data, UI, app-specific policy, social graph, content, moderation records, and user-visible workflows.
- Media systems own bytes, processing, storage zones, purge, and cost controls.
- Future apps own their own repos, policies, data stores, abuse models, and deployment lifecycles when real product work begins.

Applications may depend on Shield through APIs or SDKs. They must not import Shield internals, share Shield databases, or receive raw identity-provider packets.

## Shield Provider Rule

CIE, SPID, eIDAS wallets, mobile driver's licenses, passport vendors, age-estimation vendors, passkey providers, and future credential wallets are examples of possible providers. None of them is the architecture.

Shield must be designed around a provider-adapter interface:

```text
provider evidence -> Shield adapter -> internal review/policy -> minimal app assertion
```

Applications receive only derived, app-scoped facts such as:

```text
verified_human
age_over_18
account_eligible
organization_verified
assurance_level
proof_fresh_until
```

Applications must not receive:

```text
name
date_of_birth
fiscal_number
address
document_number
document_image
selfie
provider_packet
other_apps_used
global_trust_score
```

Provider choices must stay replaceable by country, device ecosystem, assurance need, cost, and legal availability. A provider that works in Italy is not a global solution. A global user strategy must support multiple providers and a no-provider path for low-risk app features.

Do not invent identity proofing, biometric matching, anonymous credentials, or "one human" cryptography. Use reviewed standards and providers, then minimize what leaves Shield.

## Authentication and Recovery Rule

Passkeys/WebAuthn remain the preferred authentication direction, but "one passkey on one phone" is not a mature account system.

Locked plan: use progressive access, not identity-at-the-front-door.

| Layer | Role | Rule |
| --- | --- | --- |
| Low-risk access | Read-only, browsing, public pages, low-risk prototype flows | No identity proof required. Do not create artificial identity friction. |
| Normal account | Day-to-day login on phones and laptops | Use passkeys/WebAuthn for phishing-resistant session authentication. Prefer syncable passkeys for broad public usability, encourage at least one additional authenticator, and allow optional hardware security keys. |
| Shield verification | Adult, human, organization, eligibility, or higher-risk capability checks | Use occasional provider-backed or wallet-backed proof into Shield. Shield emits short-lived, audience-scoped minimal assertions. Apps never receive raw provider data. |
| Recovery | Device loss, passkey loss, suspicious authenticator changes | Requires a written threat model before Phase 6. Recovery must include notification, cooldown or review where appropriate, session revocation, and abuse testing. |
| Anti-abuse | Bots, spam farms, account farms, upload/cost abuse, reports | Use rate limits, invite/capacity gates, upload quotas, app-local risk controls, reports, moderation, and appeals. Do not use government identity on every login. |

Before public accounts, Shield must define:

- synced passkey policy
- device-bound passkey policy
- registering at least one additional authenticator
- optional hardware security key support
- session expiry and revocation
- lost-device reporting
- authenticator invalidation after loss, theft, or compromise
- recovery codes or other recovery options, stored safely
- repeated proofing path for accounts that used stronger verification
- notification and appeal path for recovery events
- abuse tests for account takeover and denial of recovery

Recovery must not quietly reintroduce password-first login, SMS as the primary security factor, security questions, or support-agent social engineering.

Production-auth detail, still not implemented: `docs/RFC-0006-AUTH-RECOVERY.md`. Shield split timing: `docs/SHIELD_EXTRACTION_CHECKLIST.md`.

Authentication proves continuity. Verification proves derived facts. Recovery tries to restore continuity without turning Shield into a cross-app identity dossier. Keep these separate.

Device attestation may be evaluated only for narrow abuse cases after privacy review. It must not become default fingerprinting, a hidden eligibility filter, or a reason to exclude users on older or lower-cost devices without a documented safety need.

## Quality Watcher

Every real repo should have a routine automated watcher before it looks mature in public.

The watcher is a process, not a new product. Do not build a separate AI auditor app yet. Start with review issues, PR gates, automated checks, security review, and clear ownership.

Minimum local gate before handoff:

- relevant tests pass
- lint or formatting runs where the stack has it
- changed docs match the behavior
- `git status --short` is understood
- `docs/CURRENT_STATE.md` is updated so the next session can continue
- UI changes are checked on mobile and desktop
- security-sensitive changes include negative tests
- new dependencies have license, maintenance, and necessity reviewed

Minimum GitHub gate before real product work:

- branch protection or repository rules
- required PR review for protected branches
- CI for tests and build
- CodeQL or equivalent code scanning where the language is supported
- secret scanning and push protection where available
- Dependabot or equivalent dependency update alerts
- OpenSSF Scorecard or equivalent supply-chain review for public repos
- PR template that asks about data, boundaries, tests, docs, and stop gates
- automated code/security review, such as Bugbot or another reviewer, where available
- an architecture-review issue for changes that affect Shield, EverCommons architecture, media, recovery, identity, providers, or future apps

The watcher should block obvious mistakes. It does not replace architecture review, privacy review, security review, moderation planning, or legal review.

This planning repo's first automated watcher is `.github/workflows/proof-checks.yml` (Shield tests, prototype checks, media stub tests). Branch protection, CodeQL, and secret scanning still require GitHub repository settings and are not claimed as complete.

Every Shield-related review must ask: "Is Shield still modular enough to extract into its own repo without copying EverCommons product data, UI, social graph, or app policy?"

## Public Cleanliness Rule

Assume researchers, contributors, users, and critics will inspect the repository.

A messy working tree can create a bad first impression. That is a presentation and hygiene problem, not proof that the architecture is wrong. Fix it with honest labels, intentional commits, and clear stop gates. Do not rewrite the project into a fake polished platform.

Public repos should make the architecture obvious:

- clear README status
- local setup instructions
- current phase and stop gates
- documented boundaries
- proof vs product labels for each major module
- no secrets or private files
- no dead production-looking code
- no misleading launch, partnership, foundation, certification, or safety claims
- no huge unreviewed generated code dumps
- no "temporary" identity, media, or payment shortcuts
- no mixed commit that hides unrelated docs, prototype, Android, Shield, and media changes behind one vague message

Looking small is acceptable. Looking careless is not.

Default labels:

- `public proof`: static public site and planning material
- `local mock`: Shield issuer/verifier and any provider-free identity code
- `prototype`: browser UX shell or disposable interaction demo
- `offline proof`: Android code without network, accounts, uploads, signing, or store release
- `production-bound`: code that is intended to survive into a pilot, only after gates are met

When a directory changes status, update its README or governing RFC in the same change.

## Future App Rule

Do not start a future app because it is exciting.

Before a future app gets product code, write a short app brief:

- unmet need
- why VoxonLabs should build instead of support an existing project
- user group and excluded users
- data inventory
- Shield claims needed, if any
- safety and abuse model
- moderation and appeal model
- repo/deploy boundary
- zero-cost or approved-cost plan
- stop gate

Future apps must not reuse EverCommons data, social graph, moderation state, or user identifiers. Shield assertions remain audience-scoped.

## Stop Gates

Stop at architecture docs and ask for stronger review before:

- production identity proofing
- production account recovery
- public accounts
- public uploads or CDN delivery
- private messaging
- minors support
- payments, payouts, tax, or ads
- global "one human" uniqueness claims
- creating a shared user database across apps
- choosing a paid or legally constrained identity provider

## Source Standards

Use these as baseline references and re-check them before implementation:

- CISA Secure by Design: https://www.cisa.gov/securebydesign
- NIST SP 800-218 Secure Software Development Framework: https://csrc.nist.gov/pubs/sp/800/218/final
- NIST SP 800-63-4 Digital Identity Guidelines: https://pages.nist.gov/800-63-4/
- NIST SP 800-63B Authentication and Authenticator Management: https://pages.nist.gov/800-63-4/sp800-63b.html
- NIST Post-Quantum Cryptography: https://www.nist.gov/pqc
- NIST FIPS 203, 204, and 205 post-quantum standards: https://csrc.nist.gov/News/2024/postquantum-cryptography-fips-approved
- NIST IR 8547, Transition to Post-Quantum Cryptography Standards: https://csrc.nist.gov/pubs/ir/8547/ipd
- W3C WebAuthn Level 3: https://www.w3.org/TR/webauthn-3/
- W3C Verifiable Credentials Data Model 2.0: https://www.w3.org/TR/vc-data-model/
- OpenID for Verifiable Presentations 1.0: https://openid.net/specs/openid-4-verifiable-presentations-1_0.html
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- OpenSSF Scorecard: https://github.com/ossf/scorecard-action
