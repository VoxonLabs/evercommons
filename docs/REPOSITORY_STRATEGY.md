# Repository and Server Strategy

Status: working rule.

Do not make one giant repo and one giant server for every VoxonLabs idea.

The current `VoxonLabs/evercommons` repository is an early public proof and planning repo. It can hold static docs while the architecture is still forming. It should not become the permanent home for every product.

Use `docs/ARCHITECTURE_GOVERNANCE.md` for the decision protocol. The goal is not to create many empty repositories for optics. The goal is to split when a boundary becomes real, keep the split cheap, and make the public architecture understandable before trust-sensitive code exists.

## Target Repository Shape

When real code begins, split by product and responsibility:

```text
VoxonLabs/voxonlabs-site       parent homepage and public docs
VoxonLabs/voxon-shield         Shield API, policy engine, core service
VoxonLabs/shield-js            JavaScript/TypeScript SDK, if needed
VoxonLabs/evercommons          EverCommons product app
VoxonLabs/evercommons-android  optional native Android client when split triggers fire
VoxonLabs/evercommons-api      optional backend if separated from app repo
VoxonLabs/evercommons-media    optional media pipeline if separated from app repo
VoxonLabs/evercommons-infra    optional infrastructure-as-code
VoxonLabs/<future-app>         each future app gets its own repo
```

Do not create all of these immediately. Split when a real boundary exists.

Early Android proof may live under `android/` in the planning monorepo (RFC-0005) until Play signing, secrets, or a separate CI lifecycle appears.

Shield is the highest-priority future split. Keep the local mock in this planning repo only while it remains mock-only. Prepare extraction before Shield gains any production provider adapter, HTTPS API, JWKS endpoint, signing key, database, recovery process, SDK release, or deployment.

## Split Triggers

Create a separate repo when a component has any of these:

- Its own deployment lifecycle.
- Its own secrets.
- Its own database.
- Its own public API.
- Its own media pipeline, CDN, bucket, queue, or processing workers.
- Its own mobile client store listing, signing keys, or release track.
- Its own SDK/package release.
- Its own security review surface.
- Its own issue roadmap.
- Its own team or contributor group.
- Its own legal/privacy policy boundary.
- Its own architecture governance or quality gate that should block unrelated product work.

## Extraction Readiness

Before moving code into a separate repo, prepare:

- README with status, scope, non-goals, and local setup.
- Security policy and vulnerability reporting path.
- Threat model or RFC for the repo's risky surface.
- CI for tests and build.
- Dependency and secret scanning plan.
- Ownership and issue labels.
- Deployment and rollback notes if it deploys.
- Data inventory if it stores user, identity, media, moderation, payment, or operational data.

Do not split by copying messy code into a new public repo. First make the module boundary boring and documented.

For Shield specifically, use the go/no-go list in `docs/SHIELD_EXTRACTION_CHECKLIST.md`. Do not create `VoxonLabs/voxon-shield` while the mock remains local-only.

## Server and Data Boundaries

Each production app should have separate:

- Hosting/deployment project.
- Environment variables and secrets.
- Database or storage namespace.
- Backups.
- Logs.
- Rate limits.
- Abuse policy.
- Incident response scope.

Shared infrastructure is allowed only when it does not merge user data or security boundaries.

## Shield Boundary

Voxon Shield is shared infrastructure, but it must not become a surveillance hub.

Shield can provide:

- Signed minimal assertions.
- Pairwise pseudonymous subjects.
- App-scoped policy decisions.
- Revocation signals.
- Authentication/session primitives where appropriate.
- Provider adapters for CIE, SPID, eIDAS wallets, mobile driver's licenses, passport vendors, age-estimation vendors, passkey providers, or future credential wallets when reviewed.
- Recovery policy and authenticator lifecycle rules when reviewed.

Shield must not expose:

- A person's raw identity documents to applications.
- A list of all apps a person uses.
- One global social-credit score.
- Cross-app behavioral profiles.
- Raw provider packets unless a narrow internal audit process requires temporary handling.
- A provider-specific identifier as a shared VoxonLabs user ID.

Shield provider adapters must normalize evidence into internal policy decisions and minimal app assertions. CIE is an example of a possible adapter, not the global identity strategy.

## Application Boundary

EverCommons is the Instagram-like application concept. Future dating, forum, news, campaign, or sustainability apps should be separate applications.

Applications can depend on Shield through APIs or SDKs, but they should not import Shield internals or share Shield databases.

Each application decides only which Shield claims it needs and how app-local policy consumes them. It must not know which provider produced the evidence unless a narrow, documented safety/legal reason requires that metadata.

## Future App Boundary

Before creating product code for a future app, write an app brief or RFC covering:

- unmet need and why VoxonLabs should build it
- user group and excluded users
- data inventory
- Shield claims needed, if any
- safety and abuse model
- moderation and appeal model
- repo/deploy boundary
- zero-cost or approved-cost plan
- stop gate

Future apps must not reuse EverCommons user data, social graph, moderation decisions, or pairwise subjects. Shared code is acceptable only as a package or API that does not merge user data or policy boundaries.

## Monorepo Exception

A monorepo is acceptable only for early prototypes when:

- There is no production user data.
- No secrets are needed.
- No public package is released.
- The boundary is documented.
- Splitting later is cheap.

Once real accounts, uploads, payments, identity verification, or production APIs exist, prefer separate repos.

Before public collaboration grows around any real product repo, add a quality watcher: CI, branch protection or repository rules, PR review, code scanning where supported, secret scanning where available, dependency alerts, and supply-chain review for public repos.

## Naming Rule

Use working names until trademark and entity review are complete.

Avoid claiming:

- Foundation exists.
- Official partner exists.
- Certification exists.
- Compatibility mark exists.

Use language like:

```text
working name
draft standard
public proof
inspired by public lessons
no endorsement implied
```
