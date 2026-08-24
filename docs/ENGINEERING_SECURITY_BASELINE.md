# Engineering and Security Baseline

Status: required baseline for future work.

This file defines the minimum engineering and security behavior for VoxonLabs, Voxon Shield, EverCommons, and future products.

## Source Standards

Use these as the default references and re-check them when starting security-sensitive work:

- CISA Secure by Design and Secure by Default guidance: https://www.cisa.gov/securebydesign
- CISA/FBI Product Security Bad Practices: https://www.cisa.gov/news-events/alerts/2025/01/17/cisa-and-fbi-release-updated-guidance-product-security-bad-practices
- NIST Secure Software Development Framework, SP 800-218: https://csrc.nist.gov/pubs/sp/800/218/final
- NIST Privacy Framework: https://www.nist.gov/privacy-framework
- NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework
- OWASP Application Security Verification Standard 5.0: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Software Assurance Maturity Model: https://owasp.org/www-project-samm/
- OWASP Top 10 2025: https://owasp.org/Top10/
- OWASP GenAI LLM Top 10: https://genai.owasp.org/initiatives/top-10-for-llm-and-genai/
- OWASP Agentic Skills Top 10: https://owasp.org/www-project-agentic-skills-top-10/
- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- OWASP Content Security Policy Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- EDPB Guidelines 4/2019 on Article 25, Data Protection by Design and by Default: https://www.edpb.europa.eu/documents/guideline/guidelines-42019-on-article-25-data-protection-by-design-and-by-default_en
- European Commission data protection by design/default summary: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en
- FTC Bringing Dark Patterns to Light: https://www.ftc.gov/reports/bringing-dark-patterns-light
- Minimum Viable Secure Product: https://mvsp.dev/
- OpenSSF Scorecard: https://github.com/ossf/scorecard-action
- SLSA supply-chain framework: https://slsa.dev/
- NIST Digital Identity Guidelines, SP 800-63-4: https://pages.nist.gov/800-63-4/
- W3C WebAuthn Level 3: https://www.w3.org/TR/webauthn-3/
- W3C Verifiable Credentials Data Model 2.0: https://www.w3.org/TR/vc-data-model/
- OpenID for Verifiable Presentations 1.0: https://openid.net/specs/openid-4-verifiable-presentations-1_0.html

## Security Philosophy

Security is a product requirement, not an optional feature.

Default stance:

- Secure by default.
- Privacy by default.
- Minimal data by default.
- Open review by default.
- Zero-cost by default while early.
- No production launch before threat modeling.

If security conflicts with speed, protect users first and document the tradeoff.

## Architecture and Quality Governance

Use `docs/ARCHITECTURE_GOVERNANCE.md` before material implementation.

Every non-trivial change must have a clear answer for:

- which bounded context owns the change
- which data and secrets it introduces
- which repo/deploy/database/API boundary it crosses
- which standards or maintained libraries it relies on
- which abuse case and failure path matter most
- which automated checks and human review are required

If a rule in this repository blocks a safer architecture, update the rule with rationale, sources, and stop gates. Do not work around the rule silently.

Public repositories should look intentional: clear status, setup, phase gates, tests, security policy, no secrets, no production-looking dead code, and no unsupported partnership or safety claims.

## Data Classification

Treat these as highly sensitive:

- Government ID, passport, national ID, driver's license.
- Date of birth.
- Address.
- Selfie, biometric data, face match data.
- Phone number and email when tied to identity proofing.
- Payment, payout, tax, fraud, and creator revenue data.
- Private messages.
- Minors' data.
- Moderation reports and appeal evidence.
- Session tokens, secrets, API keys, build tokens, provider webhooks.
- Raw user uploads, processed private media, EXIF/GPS metadata, thumbnails for private media, and moderation evidence.

Application databases should not store raw identity documents or provider packets.

## Secrets Rule

Never commit secrets.

Never paste secrets into:

- GitHub issues.
- Public docs.
- Chat transcripts.
- Screenshots.
- Logs.
- Static sites.

If a secret appears publicly, assume it is compromised and rotate it.

Use environment variables or platform secret stores for production. Keep `.env` local and ignored.

## Authentication

Preferred direction:

- Passkeys/WebAuthn for future user authentication.
- Multiple authenticator support, not a single-device-only account model.
- Recovery design before recovery code.
- Short-lived sessions.
- Secure cookies for browser sessions.
- Explicit recovery threat model before public launch.

Locked production direction:

- Use progressive access, not identity-at-the-front-door.
- Low-risk public/prototype use should not require identity proof.
- Normal accounts use passkeys/WebAuthn for day-to-day session authentication.
- Higher-risk actions request fresh Shield assertions.
- Recovery, creator/business capabilities, and strong eligibility checks require stronger review and slower paths.

Avoid:

- Password-first architecture unless explicitly approved.
- SMS as a primary security factor.
- Security questions.
- Knowledge-based identity proofing.
- Login flows that leak whether a person exists in another app.

Before public accounts, design and review:

- synced vs device-bound passkey policy
- second passkey / backup authenticator registration
- optional hardware security key support
- lost-device reporting
- authenticator invalidation after loss, theft, or compromise
- session revocation across devices
- recovery codes or alternative recovery, stored safely
- repeated proofing for stronger verified accounts
- recovery notifications and appeals
- negative tests for account takeover and denial-of-recovery abuse

Authentication proves continuity. Verification proves derived facts. Keep both separate from recovery.

Do not require government identity, EUDI Wallet, CIE, SPID, or any provider proof on every login. High-assurance proof should be occasional, scoped, and converted by Shield into minimal assertions.

Production-auth architecture, still not implemented: `docs/RFC-0006-AUTH-RECOVERY.md`.

## Identity Provider and Global User Rule

Shield must stay provider-agnostic.

CIE, SPID, eIDAS wallets, mobile driver's licenses, passport vendors, age-estimation vendors, passkey providers, and future credential wallets are possible Shield adapters. They are not the product architecture and must not be wired directly into EverCommons or future apps as the only identity path.

Provider adapters may process raw provider evidence inside Shield only under a written threat model, privacy review, retention rule, and audit boundary. Applications receive derived assertions only.

Do not promise global real-user enforcement, bot elimination, or "one human" uniqueness until the uniqueness, recovery, provider coverage, appeals, and privacy risks have been reviewed.

Anti-bot controls should start with rate limits, invite/capacity gates, quotas, reports, moderation, app-local risk controls, and appeals. Device attestation or provider proof may be added only for narrow, documented abuse cases after privacy review.

## Authorization

Access control must be enforced server-side.

Every API endpoint should answer:

- Who is the subject?
- What app/audience is this for?
- What action is requested?
- What policy allows or denies it?
- What evidence can be logged without exposing sensitive data?

No UI-only authorization.

## Shield Assertion Rules

Applications receive derived assertions, not identity records.

Allowed example claims:

```json
{
  "verified_human": true,
  "age_over_18": true,
  "account_eligible": true
}
```

Forbidden application fields:

```text
name
date_of_birth
passport_number
address
document_image
selfie
provider_packet
other_apps_used
global_trust_score
```

Assertions must be:

- Signed.
- Short-lived.
- Audience-scoped.
- Issuer-validated.
- Key-rotation aware.
- Pairwise pseudonymous per application.

## Web and API Baseline

For static sites:

- Content Security Policy.
- No analytics/pixels.
- No third-party scripts unless explicitly approved.
- No public forms that collect private data.
- Security headers in `_headers`.

For applications/APIs:

- Validate input at trusted service boundaries.
- Output encode by context.
- Use parameterized database queries.
- Enforce CSRF protections for cookie-authenticated writes.
- Rate limit authentication, upload, messaging, reporting, and expensive endpoints.
- Use least privilege for service credentials.
- Log security events without logging secrets or raw identity data.
- Return safe errors that do not leak internals.
- Add tests for authorization failures, invalid input, replay, expiry, and abuse limits.

## Media and CDN Baseline

User media is untrusted input.

Before public uploads:

- Read `docs/RFC-0003-MEDIA-CDN-SECURITY.md`.
- Keep raw uploads private.
- Store raw uploads outside public web/CDN paths.
- Generate object IDs server-side.
- Do not trust user filenames, extensions, MIME types, dimensions, duration, or metadata.
- Allow only required media types.
- Set upload size, decoded size, duration, and resolution limits.
- Strip EXIF/GPS/device metadata.
- Re-encode images and transcode videos before public delivery.
- Serve only processed derivatives publicly.
- Use a separate media domain from the application.
- Use signed URLs or authorization workers for restricted media.
- Make CDN purge/deletion testable.
- Add upload quotas, processing quotas, bandwidth caps, and kill switches.
- Keep moderation evidence private.

Do not enable public uploads until upload, processing, delivery, deletion, takedown, moderation, and cost-abuse controls have been tested.

## Dependency and Supply Chain Rule

Before adding dependencies:

- Prefer the existing stack.
- Check maintenance status and license.
- Avoid packages with unnecessary network, analytics, install scripts, or abandoned maintainers.
- Pin versions through lockfiles once package managers are introduced.
- Use automated dependency scanning when a package ecosystem exists.

Do not add a dependency for a small task the platform can do safely itself.

Do not hand-roll cryptography, authentication protocols, media parsers, payment handling, or identity proofing.

For real product repositories, add a watcher before public collaboration grows:

- CI for tests and builds.
- Branch protection or repository rules.
- Required PR review for protected branches.
- CodeQL or equivalent code scanning where supported.
- Secret scanning and push protection where available.
- Dependabot or equivalent dependency alerts.
- OpenSSF Scorecard or equivalent supply-chain review for public repos.

## UX Baseline

A product is not done until it is usable.

Minimum UX checks:

- Primary user task is clear on the first useful screen.
- Layout, spacing, typography, color, and controls follow consistent patterns.
- Works on mobile and desktop.
- Text does not overlap.
- Buttons and controls fit.
- Keyboard navigation is possible.
- Color contrast is readable.
- Loading, error, empty, and disabled states exist for real app flows.
- Success and destructive-action states exist where relevant.
- Destructive actions are clear and reversible where possible.
- Consent is specific, not bundled or confusing.
- Reporting, appeal, deletion, unsubscribe, and cancellation paths are not hidden or harder than the action that created the state.
- UI proof handoff includes screenshots or manual viewport notes when visible UI changes.

Use WCAG 2.2 as the accessibility baseline.

## AI Assistance Rule

AI-generated code must be reviewed like human code.

For broad, strategic, UI/product, investor-facing, or autonomous-work requests, apply `docs/AUTONOMOUS_EXECUTION_RULES.md`. The agent must turn the request into a bounded task packet with a goal, boundary, data/secrets, stop gates, acceptance criteria, verification, and handoff before implementation.

AI must not:

- Invent standards or compliance claims.
- Hide uncertainty.
- Add tracking.
- Add paid services without approval.
- Paste secrets into code or docs.
- Build security-sensitive code without tests.
- Modify unrelated files.
- Add dependencies, SDKs, providers, hosted services, or external scripts merely to move faster.
- Mark UI or product work done without mobile/desktop fit, accessibility basics, and visible flow states where applicable.
- Commit unrelated clusters together.

AI should:

- Research current guidance for unstable topics.
- State assumptions.
- Prefer small, reviewable changes.
- Explain risk.
- Leave a handoff.
- Leave working evidence: commands run, checks passed or failed, screenshots/manual viewport notes when UI changes, and `CURRENT_STATE.md` updated.

## Deployment Gate

Before production deployment:

- `git status --short` is understood.
- Only intended files are staged.
- Static deploy bundle excludes `.git`, `.env`, `.wrangler`, cache, and private files.
- Local checks pass.
- UI changes are previewed on desktop and mobile.
- Public links work.
- Security headers are present where applicable.

Do not deploy public-account, media upload/CDN, payment, identity, ad, DM, or minors functionality without a written threat model and explicit approval.
