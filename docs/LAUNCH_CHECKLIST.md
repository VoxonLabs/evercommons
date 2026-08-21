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
- Cloudflare Pages rules in `_headers` and `_redirects`
- Public docs in `docs/`
- GitHub issue templates in `.github/ISSUE_TEMPLATE/`
- Contribution, security, and conduct policies

## 3. Connect Cloudflare Pages

In Cloudflare Pages, connect the GitHub repository and use:

```text
Framework preset: None
Build command: empty
Build output directory: /
Production branch: main
```

This project does not need a package manager, build command, server, database, analytics, or paid service.

## 4. Attach the Domain

Preferred public URL:

```text
https://voxonlabs.com/evercommons/
```

If Cloudflare Pages requires a project subdomain first, launch there temporarily and attach the custom domain after DNS is ready.

If the domain apex already serves another site, keep EverCommons as a path or use a subdomain such as:

```text
https://evercommons.voxonlabs.com/
```

Do not buy another domain for this phase.

## 5. Verify Production

After deployment, check:

- `/` routes to `/evercommons/`
- `/evercommons/` loads CSS and JavaScript
- GitHub issue links open the intended templates
- Docs links open correctly from the deployed site
- No analytics, pixels, tracking scripts, paid dependencies, or third-party forms are present
- Public copy says EverCommons is a working name pending formal clearance

## 6. First Public Post

Use restrained wording:

```text
EverCommons is a pre-alpha public proof for a digital commons that gives back: open source, privacy-preserving, creator-aware, and capacity-gated.

The first product concept is EverCommons Social: an open photo/video network with privacy defaults, explicit-content controls, transparent discovery, and no surveillance business model. The first step is not a giant social network. It is a small public proof, a founding charter, and a GitHub issue-based call for creators, contributors, privacy reviewers, and infrastructure supporters.

Built by VoxonLabs. Working name pending formal clearance.
```

Avoid:

- "Foundation" unless a legal foundation exists
- "Official partner" unless a signed agreement exists
- "Public alpha" until public accounts and uploads are actually ready
- "Payouts" until tax, KYC, fraud, reserve, and accounting controls exist
