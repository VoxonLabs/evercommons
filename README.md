# VoxonLabs / EverCommons

Zero-cost starter workspace for **VoxonLabs** public-interest systems.

**EverCommons** is application #1. **Voxon Shield** is the proposed reusable trust, identity, authentication, and safety layer underneath EverCommons and future VoxonLabs applications.

## Recommended public path

Use the domain you already own:

```text
https://voxonlabs.com
https://evercommons.voxonlabs.com
```

This keeps **VoxonLabs** as the parent lab/studio identity and **EverCommons** as the first application and movement brand.

## What is here

- `AGENTS.md` - required operating protocol for future AI coding sessions.
- `docs/CURRENT_STATE.md` - living snapshot: phase, next safe step, blockers. Read this first in every new session.
- `.cursor/rules/` - always-on Cursor rules for the session loop and stop gates.
- `evercommons/` - static EverCommons campaign site; no build step, backend, or paid service required.
- `evercommons/prototype/` - clickable Social UX shell. No real accounts or uploads.
- `evercommons/media/` - local media pipeline stub. Kill switch on. No public storage.
- `index.html` - VoxonLabs parent homepage.
- `join.html` - public intake page for contributors, creators, organizations, universities and reviewers.
- `support.html` - support and future donation-readiness page.
- `_headers` - Cloudflare Pages static hosting rules.
- `docs/MANIFESTO.md` - short public manifesto.
- `docs/FOUNDING_CHARTER.md` - initial mission and governance commitments.
- `docs/PARTNER_CHARTER.md` - rules for sponsors, infrastructure providers, and partners.
- `docs/RFC-0001-MVP.md` - first product scope and exclusions.
- `docs/RFC-0002-VOXON-SHIELD.md` - first architecture for the reusable Shield assertion layer.
- `shield/` - local mock-only Shield issuer, verifier, assertion schema, and tests. Not a production identity system.
- `docs/RFC-0003-MEDIA-CDN-SECURITY.md` - media upload, processing, storage, CDN, moderation, and cost-abuse architecture.
- `docs/RFC-0004-EVERCOMMONS-ARCHITECTURE.md` - EverCommons technical architecture draft. No launch date.
- `docs/RFC-0005-ANDROID-CLIENT-STACK.md` - Android-first client stack. Offline proof only.
- `android/` - offline Jetpack Compose vertical slice. No accounts, uploads, or network.
- `docs/RFC-0006-AUTH-RECOVERY.md` - production authentication, recovery, and identity-assurance architecture. Not implemented.
- `docs/SHIELD_EXTRACTION_CHECKLIST.md` - when Shield should become its own repo, and why it should not yet.
- `docs/PHASED_BUILD_PLAN.md` - start/stop roadmap for future work.
- `docs/ENGINEERING_SECURITY_BASELINE.md` - security, privacy, UX, dependency, and deployment baseline.
- `docs/REPOSITORY_STRATEGY.md` - repo/server separation rules for Shield, EverCommons, and future apps.
- `docs/ARCHITECTURE_GOVERNANCE.md` - architecture decision protocol, Shield provider-adapter rules, and quality watcher gates.
- `docs/AUTONOMOUS_EXECUTION_RULES.md` - task-packet, UI/UX, security, privacy, outreach, and AI-autonomy rules for mature execution.
- `docs/AI_SESSION_HANDOFF.md` - pasteable prompt for continuing in a fresh AI session.
- `docs/BRAND_ARCHITECTURE.md` - naming, domain, and foundation timing decision.
- `docs/COMMONS_RULES.md` - future compatibility standard for public-interest projects.
- `docs/LAUNCH_CHECKLIST.md` - Cloudflare Pages launch steps.
- `docs/OUTREACH.md` - first public outreach copy.
- `.github/ISSUE_TEMPLATE/` - zero-cost GitHub issue intake.
- `.github/workflows/proof-checks.yml` - CI for Shield, prototype, and media local proofs.
- `CODE_OF_CONDUCT.md` - contributor behavior baseline.
- `SECURITY.md` - security reporting and data-handling baseline.
- `CONTRIBUTING.md` - how early contributors can help.

## Licensing

Unless a file says otherwise:

- Software source code, scripts, schemas, tests, and configuration files are
  licensed under GNU Affero General Public License v3.0 only
  (`AGPL-3.0-only`). See `LICENSE`.
- Documentation, charters, RFCs, manifesto text, public research notes, and
  non-code public written materials are licensed under Creative Commons
  Attribution 4.0 International (`CC-BY-4.0`). See `LICENSE-DOCS`.
- Voxon Labs, VoxonLabs.com, EverCommons, Voxon Shield, logos, domain names,
  product names, visual identity, and trade dress are not licensed for reuse.
  See `TRADEMARKS.md`.

Commercial licensing and project contact: `https://VoxonLabs.com`.

## Local preview

Open this file directly in a browser:

```text
evercommons/index.html
```

For a local server:

```bash
python3 -m http.server 8080
```

Then visit:

```text
http://127.0.0.1:8080/evercommons/
http://127.0.0.1:8080/evercommons/prototype/
```

The Shield local proof is separate:

```bash
cd shield
npm install
npm test
```

Passkey localhost demo:

```bash
cd shield
npm run passkeys
```

Then open `http://localhost:8787`. Do not expose that server.

## Future AI Sessions

Start every AI/coding session with:

```text
Read AGENTS.md and docs/CURRENT_STATE.md first, then README.md, docs/PHASED_BUILD_PLAN.md, docs/ENGINEERING_SECURITY_BASELINE.md, docs/REPOSITORY_STRATEGY.md, docs/ARCHITECTURE_GOVERNANCE.md, docs/AUTONOMOUS_EXECUTION_RULES.md for broad/strategic/UI/autonomous work, and the relevant RFC before coding. Execute the Next safe step in docs/CURRENT_STATE.md unless the user named a different task. Update CURRENT_STATE.md before finishing.
```

For a copy/paste prompt, use:

```text
docs/AI_SESSION_HANDOFF.md
```

## Cloudflare Pages launch order

1. Publish this as a public GitHub repository.
2. Connect the repository to Cloudflare Pages.
3. Use these Cloudflare Pages settings for the VoxonLabs parent site:
   - Framework preset: `None`
   - Build command: empty
   - Build output directory: `/`
   - Production branch: `main`
4. Use a second Cloudflare Pages project for EverCommons if you want `evercommons.voxonlabs.com` to open the project directly:
   - Same repository
   - Framework preset: `None`
   - Build command: empty
   - Build output directory: `evercommons`
   - Production branch: `main`
5. Keep EverCommons available at `evercommons.voxonlabs.com` or `/evercommons/`.
6. Update the GitHub issue links if the public repository is not `VoxonLabs/evercommons`.
7. Keep EverCommons as the working public name until formal trademark and entity checks are complete.
8. Do not claim official partnerships until written agreements exist.

## Public intake

The static site links to GitHub issue templates under:

```text
https://github.com/VoxonLabs/evercommons
```

If the repository is published under another owner or name, update the links in `evercommons/index.html` and `.github/ISSUE_TEMPLATE/config.yml`.

## Current status

Pre-alpha public proof. No user accounts, no public uploads, no ads, no payouts, no identity provider, and no foundation entity yet. A local mock Shield issuer/verifier and a localhost passkey prototype exist in `shield/`. A clickable EverCommons UX shell exists at `evercommons/prototype/`. A local media stub exists at `evercommons/media/` with the upload kill switch on. Technical architecture is drafted in `docs/RFC-0004-EVERCOMMONS-ARCHITECTURE.md`. Android client stack is drafted in `docs/RFC-0005-ANDROID-CLIENT-STACK.md` with an offline Compose proof under `android/`. Production auth, recovery, and provider adapters are drafted in `docs/RFC-0006-AUTH-RECOVERY.md` and are not implemented; `POST /api/recovery` still returns 501. Shield stays in this repo until `docs/SHIELD_EXTRACTION_CHECKLIST.md` says otherwise. Public architecture review: https://github.com/VoxonLabs/evercommons/issues/1. No public launch date.
