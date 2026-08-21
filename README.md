# VoxonLabs / EverCommons

Zero-cost starter workspace for **VoxonLabs** public-interest systems.

**EverCommons** is application #1. **Voxon Shield** is the proposed reusable trust, identity, authentication, and safety layer underneath EverCommons and future VoxonLabs applications.

## Recommended public path

Use the domain you already own:

```text
https://voxonlabs.com
https://evercommons.voxonlabs.com
```

This keeps **VoxonLabs** as the parent lab/studio identity and **EverCommons** as the first project and movement brand.

## What is here

- `evercommons/` - static EverCommons campaign site; no build step, backend, or paid service required.
- `index.html` - VoxonLabs parent homepage.
- `join.html` - public intake page for contributors, creators, organizations, universities and reviewers.
- `support.html` - support and future donation-readiness page.
- `_headers` - Cloudflare Pages static hosting rules.
- `docs/MANIFESTO.md` - short public manifesto.
- `docs/FOUNDING_CHARTER.md` - initial mission and governance commitments.
- `docs/PARTNER_CHARTER.md` - rules for sponsors, infrastructure providers, and partners.
- `docs/RFC-0001-MVP.md` - first product scope and exclusions.
- `docs/RFC-0002-VOXON-SHIELD.md` - first architecture for the reusable Shield assertion layer.
- `docs/BRAND_ARCHITECTURE.md` - naming, domain, and foundation timing decision.
- `docs/COMMONS_RULES.md` - future compatibility standard for public-interest projects.
- `docs/LAUNCH_CHECKLIST.md` - Cloudflare Pages launch steps.
- `docs/OUTREACH.md` - first public outreach copy.
- `.github/ISSUE_TEMPLATE/` - zero-cost GitHub issue intake.
- `CODE_OF_CONDUCT.md` - contributor behavior baseline.
- `SECURITY.md` - security reporting and data-handling baseline.
- `CONTRIBUTING.md` - how early contributors can help.

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

Pre-alpha public proof. No user accounts, no public uploads, no ads, no payouts, no identity provider, and no foundation entity yet.
