# RFC-0006: Production Authentication, Recovery, and Identity Assurance

Status: draft architecture. Not an implementation authorization. Not a launch date. Not a uniqueness or "one human" claim.

This is the production-auth RFC required by Phase 2 before any real recovery code. It records the locked layered model, why a single-phone passkey is not a mature account system, and which questions still need a high-reasoning security review.

It does **not** authorize:

- public accounts
- production recovery endpoints
- CIE, SPID, EUDI Wallet, mobile driver's license, passport, or age-estimation integration
- recovery codes in product code
- a global unique-human registry
- a launch date

Local evidence already exists: mock Shield assertions in `shield/`, a localhost passkey prototype in `shield/src/passkeys/`, and a threat model that returns HTTP 501 on `POST /api/recovery` on purpose. That 501 remains correct until this RFC is reviewed and a later implementation RFC is approved.

Related: `docs/RFC-0002-VOXON-SHIELD.md`, `docs/ARCHITECTURE_GOVERNANCE.md`, `docs/SHIELD_EXTRACTION_CHECKLIST.md`, `shield/docs/PASSKEY_THREAT_MODEL.md`.

## 1. Why this RFC exists

A passkey on one phone is phishing-resistant login. It is not a mature account system.

Without a written design, the next incident is predictable:

- the user gets a new phone and is locked out
- support is asked to "just reset the account"
- a government ID is bolted onto every login "to stop bots"
- EverCommons starts storing identity documents
- future VoxonLabs apps inherit the same shortcut

Those outcomes violate Shield's application boundary. This RFC exists so the public architecture states the mature shape before anyone codes it.

## 2. Three different problems

Do not collapse these into one flow.

| Problem | Question being answered | What must not be used as the answer |
| --- | --- | --- |
| Authentication | Is this the same continuing account session? | Government identity, email magic links, SMS, or security questions as the daily login |
| Verification | Is a derived fact true right now for this app? Adult, human, organization, eligibility | Raw CIE/SPID/passport packets in EverCommons |
| Recovery | Can continuity be restored after authenticator loss without handing the account to an attacker? | Support-agent resets, passwords-by-the-back-door, or "show your ID to customer service" |

Anti-abuse is a fourth layer: rate limits, invites, quotas, reports, moderation, and appeals. Government identity is not an anti-bot product.

## 3. Locked layered model

Changing this table requires updating this RFC and `docs/ARCHITECTURE_GOVERNANCE.md` in the same change.

| Layer | Role | Rule |
| --- | --- | --- |
| Low-risk access | Public pages, campaign site, local prototypes, read-only browsing | No identity proof. Do not invent identity friction to look serious. |
| Normal account | Day-to-day login on phones and laptops | Passkeys/WebAuthn. Prefer syncable passkeys for public usability. Encourage at least one additional authenticator. Allow optional hardware security keys. |
| Shield verification | Adult, human, organization, eligibility, or higher-risk capability | Occasional provider-backed or wallet-backed proof **into Shield**. Shield emits short-lived, audience-scoped minimal assertions. Apps never receive raw provider data. |
| Recovery | Device loss, passkey loss, suspicious authenticator change | Separate threat model. Must include notification, cooldown or review where appropriate, session revocation, and abuse tests. Not implemented. |
| Anti-abuse | Bots, spam farms, account farms, upload/cost abuse | Rate limits, invite/capacity gates, upload quotas, app-local risk controls, reports, moderation, appeals. Do not require CIE, SPID, EUDI Wallet, or any government identity on every login. |

CIE, SPID, eIDAS / EUDI wallets, mobile driver's licenses, passport vendors, age-estimation vendors, passkey providers, and future credential wallets are **Shield provider adapters**. They are not EverCommons login screens and not the global identity architecture.

A provider that works in Italy is not a global solution. The global strategy is multiple adapters plus a no-provider path for low-risk features.

## 4. Multi-device login

Users must be able to sign in from more than one device without treating every new device as account recovery.

Current FIDO passkey guidance ([FIDO Alliance passkeys](https://fidoalliance.org/passkeys/), [W3C WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/)):

- A passkey is a FIDO credential. It may be **synced** across a user's devices by a passkey provider, or **device-bound** to one authenticator such as a hardware security key.
- Synced passkeys become available on other devices that use the same passkey provider account. That is how a laptop and a phone can both sign in after the first registration.
- Cross-device sign-in also exists via CTAP proximity (Bluetooth Low Energy) so a passkey on a nearby phone can authenticate a desktop session.
- If the new device is outside that provider ecosystem, the relying party may have to treat it as recovery rather than ordinary login.

Production policy for VoxonLabs, still not implemented:

1. Default consumer login should accept syncable platform passkeys. That is the usable multi-device path for most people.
2. During registration and in account settings, prompt to add a **second authenticator** (another device, another provider, or a hardware security key). One phone is not a backup.
3. Hardware security keys remain optional, not required, for ordinary accounts.
4. Hybrid / QR cross-device flows need their own origin and RP ID review. They are not enabled in the localhost prototype.
5. High-assurance flows may later require a device-bound authenticator. NIST SP 800-63B-4 says syncable authenticators **SHALL NOT** be used at AAL3 because the private key is exportable into a sync fabric.

Sources: [NIST SP 800-63B-4 AAL](https://pages.nist.gov/800-63-4/sp800-63b/aal/), [NIST syncable authenticators](https://pages.nist.gov/800-63-4/sp800-63b/syncable/).

Synced passkeys improve usability after phone loss **inside one provider account**. They also move recovery risk into Apple, Google, or another passkey provider. That is an accepted consumer tradeoff for ordinary login. It is not a substitute for Shield recovery policy, session revocation, or high-assurance proof.

## 5. Device-loss recovery

This section is requirements and threats, not a protocol. Do not implement it from this text.

### 5.1 What "lost the phone" actually means

| Failure | Typical first fix | Remaining hole |
| --- | --- | --- |
| Lost phone, passkeys synced, user can still open the provider account on another device | Sign in with the synced passkey | Provider-account takeover becomes VoxonLabs-account takeover |
| Lost phone, no other synced device, hardware key still held | Sign in with the hardware key, then register a new platform passkey | Users who never added the second key are locked out |
| Lost every authenticator | Account recovery | This is the high-risk path. It is also the path attackers want. |
| Stolen phone that is still unlocked, or whose passkey provider account is still open | Revoke sessions and authenticators | Needs a lost-device report that works without the stolen device |

NIST SP 800-63B-4 treats account recovery as restoring the ability to authenticate at a desired AAL after losing the authenticators needed for that AAL. Allowed method families are: repeating parts of identity proofing, using a prearranged recovery contact, or presenting recovery codes, possibly together with an authenticator that is still bound to the account. A recovery event **always** causes one or more notifications so the subscriber can detect fraud.

For accounts whose maximum AAL is AAL2, NIST requires one of:

- two recovery codes obtained from different methods in the set {saved, issued, recovery contacts}
- one recovery code from that set plus authentication with a single-factor authenticator already bound to the account
- repeated identity proofing, if the account was identity-proofed

NIST also says to bind multiple authenticators at AAL2 and above, notify the subscriber of recovery activity, and treat unauthorized access to a sync fabric as a first-class risk.

Sources: [NIST authenticator event management](https://pages.nist.gov/800-63-4/sp800-63b/events/), [NIST syncable authenticators](https://pages.nist.gov/800-63-4/sp800-63b/syncable/), [FIDO Alliance passkeys](https://fidoalliance.org/passkeys/).

FIDO's consumer guidance matches that shape: register more than one authenticator; use synced passkeys where the assurance level allows it; treat a hardware security key as a recovery credential when other devices are gone; otherwise the relying party runs its own recovery process. FIDO does not issue a master recovery key.

### 5.2 Requirements any later recovery design must meet

A future implementation RFC must satisfy all of these. Meeting them on paper is not permission to write recovery code.

1. Recovery is a Shield concern, not an EverCommons UI hack and not a shared "VoxonLabs user" reset.
2. Recovery is slower and noisier than login. Notification is mandatory. Cooldown or review is required where the remaining assurance is weak.
3. Successful recovery revokes existing sessions and can invalidate lost authenticators.
4. Recovery must be abuse-tested in both directions: account takeover and denial-of-recovery.
5. Recovery must not reintroduce password-first login, SMS as the primary factor, security questions, or support-agent document collection.
6. Recovery evidence that includes government identity or wallet proof is processed only inside Shield, then discarded or retained under a written retention rule. Applications receive a new session capability and, if needed, a fresh minimal assertion. They do not receive the proof packet.
7. Pairwise subjects stay pairwise. Recovery must not create a cross-app join key.
8. `POST /api/recovery` in the local prototype stays HTTP 501 until an implementation RFC is approved.

### 5.3 Open protocol questions

These are the hard parts. Do not invent answers in this planning repo. Use a high-reasoning review before any implementation RFC.

1. Exact recovery credential: issued recovery codes, a second passkey, a hardware key, re-proofing, or a combination. How codes are generated, stored, displayed, rotated, and rate-limited.
2. How a CIE/SPID/EUDI re-proofing event is bound to an existing pairwise account without storing a national ID or creating a global VoxonLabs identifier.
3. Synced vs device-bound policy for ordinary consumer accounts versus later high-assurance capabilities.
4. Cross-device session revocation and lost-device reporting when the user no longer has the old device.
5. Denial-of-recovery: an attacker who triggers recovery to lock out the real user.
6. Support-desk social engineering: there must be no human "reset this account" path that bypasses the protocol.
7. Legal and privacy review before any government-ID adapter, including data-minimization, retention, and jurisdiction limits.
8. The uniqueness / "one human" problem remains unsolved. CIE in Italy does not create a global uniqueness property, does not cover people without that credential, and must not be oversold as bot-proofing.

## 6. High-assurance proof is occasional, not login

Italy already has national electronic identification: CIE and SPID. They are used as identity providers for Italian EUDI Wallet / IT-Wallet PID issuance, with CieID at LoA High as the primary activation path and a Substantial plus MRTD fallback. That is identity proofing and wallet activation, not a social-app session.

Sources:

- [IT-Wallet credential issuance, high level](https://italia.github.io/eid-wallet-it-docs/versione-corrente/en/credential-issuance-high-level.html)
- [IT-Wallet Substantial + MRTD path](https://italia.github.io/eid-wallet-it-docs/versione-corrente/en/credential-issuance-l2plus.html)

Correct use inside VoxonLabs:

```text
provider evidence (CIE, SPID, EUDI Wallet, mDL, passport, ...)
        -> Shield adapter
        -> internal policy / review
        -> short-lived audience-scoped assertion
        -> EverCommons or a future app
```

Incorrect use:

```text
EverCommons login screen -> CIE / SPID -> app user record with fiscal number
```

Shield adapters may exist per country. EverCommons must keep working for low-risk features without any provider. No VoxonLabs application should know which provider produced the evidence unless a narrow, documented safety or legal reason requires that metadata.

This RFC does **not** select a CIE library, a SPID integrator, an age-estimation vendor, or a wallet implementation. Adapter work starts only after Shield is extractable (`docs/SHIELD_EXTRACTION_CHECKLIST.md`) and after privacy/security review.

## 7. Bots and "real users"

CIE will not make a social product bot-free. It will lock out people who do not have that credential, create a high-value identity dataset, and still miss farms that obtain credentials.

Anti-abuse for EverCommons starts with invite or capacity gates, upload and bandwidth quotas, rate limits, reports, moderation, appeals, app-local risk signals that are not a global trust score, and the media kill switches already specified.

Device attestation may be studied later for narrow abuse cases after privacy review. It must not become default fingerprinting or a hidden eligibility filter against older or lower-cost devices.

Do not promise global real-user enforcement, bot elimination, or "one human" uniqueness until uniqueness, recovery, provider coverage, appeals, and privacy risks have been reviewed. That review is not this RFC.

## 8. Threats this RFC is written against

| Threat | Why it matters | Current control |
| --- | --- | --- |
| Account takeover through recovery | Recovery is the path that bypasses the passkey | Recovery is 501; this RFC forbids informal resets |
| Denial of recovery | Attacker locks the real user out | Must be in the future abuse-test plan |
| Support social engineering | Humans override protocol | No support reset path |
| Provider lock-in | CIE-only or Apple-only login | Provider-agnostic adapters; no-provider low-risk path |
| Cross-app tracking | Recovery or proofing creates a global user id | Pairwise subjects; Shield/app data split |
| Identity dossier in the app DB | Raw CIE/SPID/passport data lands in EverCommons | Forbidden application fields in RFC-0002 |
| Sync-fabric takeover | Provider account reset yields every synced passkey | Second authenticator; notifications; later high-assurance bound keys |
| Looking serious by collecting ID | Public reviewers see government login on a prototype | Low-risk access has no identity proof |

## 9. Data minimization

Applications may receive only derived, audience-scoped facts such as `verified_human`, `age_over_18`, `account_eligible`, `organization_verified`, `assurance_level`, and `proof_fresh_until`.

Applications must not receive name, date of birth, fiscal number, address, document number, document image, selfie, provider packet, other apps used, or a global trust score.

Shield pairwise `sub` values are per application. Recovery and re-proofing must not mint a shared VoxonLabs user id.

## 10. Shield must stay extractable

Provider adapters, recovery, JWKS, signing keys, and production sessions all belong in Shield, not in EverCommons.

Do not add those capabilities in this monorepo as EverCommons features. When any of those boundaries become real, follow `docs/SHIELD_EXTRACTION_CHECKLIST.md` and `docs/REPOSITORY_STRATEGY.md`. Creating an empty `VoxonLabs/voxon-shield` repository now would look busier, not more mature.

Until extraction, the local mock in `shield/` must remain importable without EverCommons product data, UI, social graph, or app policy.

## 11. Watcher and review

Before public accounts, the quality watcher in `docs/ARCHITECTURE_GOVERNANCE.md` must include this RFC reviewed, an implementation RFC for recovery reviewed by a high-reasoning pass, negative tests for takeover and denial-of-recovery, CI and secret scanning on the repo that will hold production auth, no identity documents in application databases, and public wording that still says recovery is unimplemented until it is not.

This planning repo now runs `.github/workflows/proof-checks.yml` for existing local proofs. That is a hygiene gate, not production-auth evidence.

## 12. Explicit non-promises

- No claim that passkeys are implemented for the public product
- No claim that recovery is designed at protocol level
- No claim that CIE, SPID, or EUDI Wallet will be the login method
- No claim of eIDAS, NIST, or FIDO certification
- No claim that bots cannot exist
- No claim that one person has exactly one account worldwide
- No implementation of `/api/recovery` beyond HTTP 501

## 13. Stop gate

Stop and use a high-reasoning model before writing recovery code, storing recovery codes, integrating CIE, SPID, EUDI Wallet, mDL, passport, or age estimation, enabling public accounts, claiming uniqueness, or creating `VoxonLabs/voxon-shield` without a fired split trigger.

The next implementation step after this RFC is **review**, not code. Phase 6 stays blocked.

## 14. References

- W3C WebAuthn Level 3: https://www.w3.org/TR/webauthn-3/
- FIDO Alliance passkeys: https://fidoalliance.org/passkeys/
- NIST SP 800-63-4: https://pages.nist.gov/800-63-4/
- NIST SP 800-63B-4: https://pages.nist.gov/800-63-4/sp800-63b.html
- NIST authenticator events and recovery: https://pages.nist.gov/800-63-4/sp800-63b/events/
- NIST syncable authenticators: https://pages.nist.gov/800-63-4/sp800-63b/syncable/
- IT-Wallet PID issuance: https://italia.github.io/eid-wallet-it-docs/versione-corrente/en/credential-issuance-high-level.html
