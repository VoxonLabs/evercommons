# Repository and Server Strategy

Status: working rule.

Do not make one giant repo and one giant server for every VoxonLabs idea.

The current `VoxonLabs/evercommons` repository is an early public proof and planning repo. It can hold static docs while the architecture is still forming. It should not become the permanent home for every product.

## Target Repository Shape

When real code begins, split by product and responsibility:

```text
VoxonLabs/voxonlabs-site       parent homepage and public docs
VoxonLabs/voxon-shield         Shield API, policy engine, core service
VoxonLabs/shield-js            JavaScript/TypeScript SDK, if needed
VoxonLabs/evercommons          EverCommons product app
VoxonLabs/evercommons-api      optional backend if separated from app repo
VoxonLabs/evercommons-media    optional media pipeline if separated from app repo
VoxonLabs/evercommons-infra    optional infrastructure-as-code
VoxonLabs/<future-app>         each future app gets its own repo
```

Do not create all of these immediately. Split when a real boundary exists.

## Split Triggers

Create a separate repo when a component has any of these:

- Its own deployment lifecycle.
- Its own secrets.
- Its own database.
- Its own public API.
- Its own media pipeline, CDN, bucket, queue, or processing workers.
- Its own SDK/package release.
- Its own security review surface.
- Its own issue roadmap.
- Its own team or contributor group.
- Its own legal/privacy policy boundary.

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

Shield must not expose:

- A person's raw identity documents to applications.
- A list of all apps a person uses.
- One global social-credit score.
- Cross-app behavioral profiles.
- Raw provider packets unless a narrow internal audit process requires temporary handling.

## Application Boundary

EverCommons is the Instagram-like application concept. Future dating, forum, news, campaign, or sustainability apps should be separate applications.

Applications can depend on Shield through APIs or SDKs, but they should not import Shield internals or share Shield databases.

## Monorepo Exception

A monorepo is acceptable only for early prototypes when:

- There is no production user data.
- No secrets are needed.
- No public package is released.
- The boundary is documented.
- Splitting later is cheap.

Once real accounts, uploads, payments, identity verification, or production APIs exist, prefer separate repos.

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
