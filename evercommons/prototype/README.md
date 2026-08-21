# EverCommons Social clickable prototype

Status: local/static UX shell. Not a product launch.

Open:

```text
evercommons/prototype/index.html
```

Or with a local server from the repo root:

```bash
python3 -m http.server 8080
```

Then visit `http://127.0.0.1:8080/evercommons/prototype/`

## What this is

A clickable path through onboarding, feed, upload stub, profile, report/appeal, explicit-content controls, creator dashboard, and capacity dashboard.

## What this is not

- No real accounts or emails.
- No file upload. The file input is disabled and the form cannot post.
- No database, no analytics, no third-party scripts.
- No private messages.
- Passkeys stay in `shield/` at `http://localhost:8787`. This shell does not collect a login.

## Safety copy

The banner states that nothing is created or uploaded. Upload, report, and appeal actions stay on-device and explain the later gates.
