# Launch Checklist

Status: practical checklist for the first zero-cost public launch.

## 1. Create the GitHub Repository

Recommended repository:

```text
https://github.com/VoxonLabs/evercommons
```

If the repository uses a different owner or name, update:

- `evercommons/index.html`
- `.github/ISSUE_TEMPLATE/config.yml`
- this checklist

Use a public repository. Keep GitHub Issues enabled. Do not enable paid products.

## 2. Push the Current Files

Recommended first commit message:

```text
Initial EverCommons public proof
```

The repository should include:

- Static site in `evercommons/`
- Cloudflare Pages rules in `_headers`
- Public docs in `docs/`
- GitHub issue templates in `.github/ISSUE_TEMPLATE/`
- Contribution, security, and conduct policies

## 3. Connect Cloudflare Pages for VoxonLabs

In Cloudflare Pages, connect the GitHub repository for the parent site and use:

```text
Framework preset: None
Build command: empty
Build output directory: /
Production branch: main
```

This project does not need a package manager, build command, server, database, analytics, or paid service.

## 4. Connect Cloudflare Pages for EverCommons

If you want `evercommons.voxonlabs.com` to open the EverCommons page directly, create a second Cloudflare Pages project from the same repository:

```text
Framework preset: None
Build command: empty
Build output directory: evercommons
Production branch: main
Custom domain: evercommons.voxonlabs.com
```

This avoids making the parent VoxonLabs homepage and the EverCommons project fight over the same root path.

## 5. Attach the Domains

Preferred public URLs:

```text
https://voxonlabs.com/
https://evercommons.voxonlabs.com/
```

If Cloudflare Pages requires project subdomains first, launch there temporarily and attach custom domains after DNS is ready.

If the domain apex already serves another site, either keep the existing site until you are ready to move it or use:

```text
https://evercommons.voxonlabs.com/
```

Do not buy another domain for this phase.

## 6. Verify Production

After deployment, check:

- `voxonlabs.com` opens the VoxonLabs parent homepage
- `evercommons.voxonlabs.com` opens EverCommons directly if configured as a second Pages project
- `/evercommons/` loads CSS and JavaScript when served from the parent project
- GitHub issue links open the intended templates
- Docs links open correctly from the deployed site
- No analytics, pixels, tracking scripts, paid dependencies, or third-party forms are present
- Public copy says EverCommons is a working name pending formal clearance

## Current Direct-Deploy Note

The current zero-cost deployment can also be run by direct Wrangler uploads instead of Git-connected auto-deploys:

```bash
# Always deploy from a clean bundle. Exclude android/, .git, .env, .wrangler, node_modules, and local caches.
rsync -a --exclude '.git' --exclude '.env' --exclude '.env.*' --exclude '.wrangler' \
  --exclude 'node_modules' --exclude 'android' --exclude 'shield/.keys' --exclude '.cursor' \
  ./ /tmp/voxonlabs-home-bundle/
npx wrangler pages deploy /tmp/voxonlabs-home-bundle --project-name voxonlabs-home --branch main

rsync -a --exclude 'node_modules' --exclude '.wrangler' --exclude '.env' --exclude '.env.*' \
  evercommons/ /tmp/evercommons-bundle/
npx wrangler pages deploy /tmp/evercommons-bundle --project-name evercommons-social --branch main
```

Do not deploy the repository root with Gradle/`android/` artifacts included. Android sources are never part of the static sites.

If Cloudflare Pages is later connected to GitHub, keep the same output directories and let `main` deploy automatically. Until then, push to GitHub first, then run the direct deployments so production matches the repository.

## 7. First Public Post

Use restrained wording:

```text
EverCommons is a pre-alpha public proof for a digital commons that gives back: open source, privacy-preserving, creator-aware, and capacity-gated.

The first product concept is EverCommons Social: an open photo/video network with privacy defaults, explicit-content controls, transparent discovery, and no surveillance business model. The first trust-layer concept is Voxon Shield: a reusable way for applications to receive minimal signed assertions instead of raw identity data. The first step is not a giant social network. It is a small public proof, a founding charter, and a GitHub issue-based call for creators, contributors, privacy reviewers, and infrastructure supporters.

Built by VoxonLabs. Working name pending formal clearance.
```

Avoid:

- "Foundation" unless a legal foundation exists
- "Official partner" unless a signed agreement exists
- "Public alpha" until public accounts and uploads are actually ready
- "Payouts" until tax, KYC, fraud, reserve, and accounting controls exist
