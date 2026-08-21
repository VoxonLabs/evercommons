# Engineering and Security Baseline

Status: required baseline for future work.

This file defines the minimum engineering and security behavior for VoxonLabs, Voxon Shield, EverCommons, and future products.

## Source Standards

Use these as the default references and re-check them when starting security-sensitive work:

- CISA Secure by Design and Secure by Default guidance: https://www.cisa.gov/securebydesign
- NIST Secure Software Development Framework, SP 800-218: https://csrc.nist.gov/pubs/sp/800/218/final
- OWASP Application Security Verification Standard 5.0: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Top 10 2025: https://owasp.org/Top10/
- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- OWASP Content Security Policy Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- NIST Digital Identity Guidelines, SP 800-63-4: https://pages.nist.gov/800-63-4/
- W3C WebAuthn Level 3: https://www.w3.org/TR/webauthn-3/

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
- Short-lived sessions.
- Secure cookies for browser sessions.
- Explicit recovery threat model before public launch.

Avoid:

- Password-first architecture unless explicitly approved.
- SMS as a primary security factor.
- Security questions.
- Knowledge-based identity proofing.
- Login flows that leak whether a person exists in another app.

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

## UX Baseline

A product is not done until it is usable.

Minimum UX checks:

- Works on mobile and desktop.
- Text does not overlap.
- Buttons and controls fit.
- Keyboard navigation is possible.
- Color contrast is readable.
- Loading, error, empty, and disabled states exist for real app flows.
- Destructive actions are clear and reversible where possible.
- Consent is specific, not bundled or confusing.

Use WCAG 2.2 as the accessibility baseline.

## AI Assistance Rule

AI-generated code must be reviewed like human code.

AI must not:

- Invent standards or compliance claims.
- Hide uncertainty.
- Add tracking.
- Add paid services without approval.
- Paste secrets into code or docs.
- Build security-sensitive code without tests.
- Modify unrelated files.

AI should:

- Research current guidance for unstable topics.
- State assumptions.
- Prefer small, reviewable changes.
- Explain risk.
- Leave a handoff.

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
