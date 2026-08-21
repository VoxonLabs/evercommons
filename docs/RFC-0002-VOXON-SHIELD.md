# RFC-0002: Voxon Shield Architecture

Status: draft.

Voxon Shield is a working name for the reusable trust, identity, authentication, and safety layer underneath VoxonLabs applications. It is not a final brand or legal claim.

The architectural pivot is simple:

```text
VoxonLabs          parent lab and steward
Voxon Shield      reusable trust and safety layer
EverCommons       application #1 built on the layer
Future apps       dating, forums, verified knowledge, campaigns, and other tools
```

EverCommons should not be the architecture. It should be the first application that proves the architecture can work.

## First Milestone

A web application can ask Shield:

```text
Is this user a verified adult human?
```

Shield returns a short-lived, cryptographically signed yes/no assertion:

```json
{
  "iss": "https://shield.voxonlabs.com",
  "aud": "evercommons",
  "sub": "ppid_8ac93f...",
  "claims": {
    "verified_human": true,
    "age_over_18": true,
    "account_eligible": true
  },
  "iat": 1787328000,
  "exp": 1787328300
}
```

The application does not receive:

```text
name
date of birth
passport number
address
document image
selfie
verification-provider packet
```

If the application cannot leak those fields, the privacy boundary is much stronger than a policy promise.

## High-Level Architecture

```text
APPLICATIONS

EverCommons     Dating      Forum      Verified knowledge      Other
     |            |           |               |                  |
     +------------+-----------+---------------+------------------+
                              |
                      SHIELD API / SDK
                              |
                        POLICY ENGINE
                              |
          +-------------------+-------------------+
          |                   |                   |
          v                   v                   v
   IDENTITY PROOFING         AUTH               SAFETY
   age                       passkeys           anti-spam
   human                     devices            abuse controls
   uniqueness                sessions           messaging controls
   assurance                 recovery           content policy
          |
          v
   EXTERNAL PROOF PROVIDERS / WALLETS / GOVERNMENT ID SYSTEMS

Only minimal assertions leave Shield.
```

## Design Commitments

### 1. Shield answers questions, not identity-record requests

Applications should ask narrowly scoped policy questions:

```text
verified_human?
age_over_18?
eligible_for_this_app?
allowed_to_message?
rate_limit_exceeded?
```

They should not ask for raw identity records. The API shape should make that impossible for normal application integrations.

### 2. Every application receives a different pseudonymous subject

The same person must not appear as the same internal user across unrelated applications.

```text
Actual person
     |
     +-- EverCommons -> ppid_b81e...
     +-- Dating      -> ppid_279a...
     +-- Forum       -> ppid_f190...
```

Applications must not have an endpoint that reveals what other services a person uses. Pairwise pseudonyms reduce database-joining risk if an application is breached.

### 3. Verification is separate from authentication

Verification establishes facts:

```text
real human
age requirement met
assurance level met
uniqueness check passed
```

Authentication establishes continuity:

```text
same account holder returning today
```

The default authentication direction should be passkeys/WebAuthn, not passwords as the primary long-term system. ID proofing should establish trust only when needed; it should not become the login ritual.

### 4. Identity providers stay outside the application boundary

The application should route the user to a Shield-controlled verification session. The external provider returns a signed result to Shield, not to the application.

Shield then strips the result to the minimal facts the application is allowed to know.

Version 1 may need provider receipts and operational metadata for audit and fraud handling. It should still avoid retaining raw document images or full provider packets unless a narrow legal and security review explicitly justifies it.

### 5. The credential is the valuable object

After verification, Shield should maintain or issue a minimal human credential:

```text
verified_human      true
age_requirement     18+
verification_level  strong
issued              2026-08-21
expires             2027-08-21
```

The long-term direction should let the holder present credentials without every application contacting an identity database.

### 6. Credential technology stays pluggable

The policy API should not care which credential format supplied a fact.

```text
Credential engine
     |
     +-- W3C Verifiable Credentials 2.0
     +-- OpenID for Verifiable Presentations
     +-- SD-JWT VC
     +-- future zero-knowledge or anonymous credential systems
```

Do not invent custom cryptography. Compose reviewed standards and invite cryptographers, privacy engineers, and security researchers to attack the design early.

### 7. Assertions are short-lived and audience-scoped

An assertion issued for EverCommons must not be reusable by a dating app, forum, or third-party verifier.

Minimum assertion rules:

- Signed by Shield.
- Scoped to one audience.
- Expires quickly.
- Contains only approved derived claims.
- Uses a pairwise pseudonymous subject.
- Includes key identifiers and metadata needed for verification and rotation.
- Excludes raw identity attributes.

### 8. "One human" is the hard research problem

The system wants all four:

```text
real person
controlled number of identities
no central identity database
no cross-application tracking
```

Those requirements conflict. Version 1 may need a verification authority to keep a privacy-preserving uniqueness representation. The long-term research objective is stronger:

```text
Shield can determine that a person has already been verified without needing to know who that person is.
```

This is where blinded credentials, anonymous credentials, zero-knowledge proofs, oblivious identifiers, and hardware-backed credentials may matter later.

### 9. Bot protection must not become surveillance

Identity proofing raises the cost of Sybil attacks, but it does not eliminate compromised accounts, human spam farms, malware, paid manipulation, or automated browser control.

Shield safety controls can include:

- Rate enforcement.
- Abuse throttles.
- App-local reputation signals.
- Messaging limits.
- Recovery risk handling.
- Moderation reasons and appeals.

They should not become a cross-app surveillance profile. Avoid persistent device fingerprinting, indefinite IP history, and hidden behavioral dossiers across applications.

### 10. Safety is modular

Shield Core:

- Human verification.
- Age assurance.
- Authentication.
- Pairwise pseudonyms.
- Uniqueness controls.
- Trust assertions.
- Revocation.

Shield Safety Modules:

- Anti-spam.
- Anti-scam.
- Messaging safety.
- Sexual-content policy.
- Dating safety.
- Harassment controls.
- Rate and abuse protection.

EverCommons might require:

```text
verified_human      required
adult               required for first pilot
explicit_content    blocked or tightly controlled
spam_protection     strict
direct_messages     disabled at MVP
```

Another application may have a different policy profile.

### 11. No global social-credit score

Shield should not expose a shared score like:

```text
trust_score = 73
```

That creates dangerous incentives and makes one app's conflict follow a person everywhere.

Use scoped states instead:

```text
verified_human = true
age_18_plus = true
evercommons_access = allowed
dating_access = suspended
forum_posting = rate_limited
```

Serious restrictions need reasons, expiration rules, review, and appeals. Protection includes protecting people from the platform itself.

### 12. Security transparency is part of the protocol

The Shield design should publish:

- Threat model.
- Data inventory.
- Assertion schema.
- Key rotation plan.
- Provider boundary.
- Logging and retention rules.
- Revocation and appeals process.
- Security reporting process.
- Independent review issues and outcomes.

The protocol should be open enough that researchers can inspect what applications receive and what Shield refuses to disclose.

## Minimal API Shape

This is illustrative, not an implementation commitment.

```http
POST /v1/assertions
Content-Type: application/json
Authorization: Bearer <application token>
```

```json
{
  "audience": "evercommons",
  "requested_claims": ["verified_human", "age_over_18", "account_eligible"],
  "policy": "evercommons-alpha-adult"
}
```

Response:

```json
{
  "assertion_type": "application/jwt",
  "expires_in": 300,
  "assertion": "<signed compact assertion>"
}
```

Public verification material:

```text
GET /.well-known/voxon-shield.json
GET /jwks.json
```

## MVP Build Order

1. Publish this architecture RFC and invite privacy/security review.
2. Draft the assertion schema and forbidden-claims list.
3. Build a local mock issuer that signs test assertions for EverCommons.
4. Build an EverCommons verifier example that accepts only the right issuer, audience, signature, expiry, and claims.
5. Add a passkey/WebAuthn prototype for returning users.
6. Define provider-adapter interfaces without choosing a paid provider.
7. Write a data-retention and logging threat model.
8. Review the uniqueness problem separately before promising "one human" at scale.

## Open Questions

- Which legal basis and jurisdictional rules apply to age assurance?
- Which first proof provider can be used without storing raw ID documents?
- How should revocation work without enabling cross-app tracking?
- How much app-local abuse context can be processed without becoming surveillance?
- What is the appeal process for automated or provider-driven denials?
- Which parts should become a separate package or repository once code begins?

## Standards References

- NIST SP 800-63-4 Digital Identity Guidelines, final publication dated August 1, 2025: https://www.nist.gov/publications/nist-sp-800-63-4-digital-identity-guidelines
- NIST SP 800-63-4 online glossary for derived attribute values, including "older than 18": https://pages.nist.gov/800-63-4/sp800-63.html
- W3C WebAuthn Level 3 publication history, Candidate Recommendation Snapshot dated May 26, 2026: https://www.w3.org/standards/history/webauthn-3/
- W3C Verifiable Credentials 2.0 Recommendation announcement dated May 15, 2025: https://www.w3.org/news/2025/the-verifiable-credentials-2-0-family-of-specifications-is-now-a-w3c-recommendation/
- OpenID for Verifiable Presentations 1.0, final specification dated July 9, 2025: https://openid.net/specs/openid-4-verifiable-presentations-1_0.html
- SD-JWT VC draft-ietf-oauth-sd-jwt-vc-17, active Internet-Draft dated July 6, 2026: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-sd-jwt-vc-17
