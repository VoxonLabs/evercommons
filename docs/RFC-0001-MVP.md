# RFC-0001: EverCommons Social MVP

Status: draft.

## Summary

Build one excellent open-source photo/video social pilot before expanding into messaging, federation, live streaming, AI, news, dating, campaigns, or other products.

EverCommons Social is the first product concept: profiles, posts, short video, creator pages, following feeds, transparent discovery, and safety controls. It should solve the familiar photo/video social use case without copying a surveillance business model.

The MVP should prove a narrow claim: a useful social product can combine mainstream-quality experience, privacy-preserving monetization, open governance, creator economics, contributor recognition, capacity-gated growth, replaceable infrastructure, and a reusable trust layer that does not expose raw identity data to the application.

## Initial Audience

- Creators willing to cross-post original short videos.
- Privacy-conscious users who still expect polished design and performance.
- Open-source contributors across engineering, design, safety, accessibility, translation, and operations.
- Ethical advertisers and sponsors willing to test contextual campaigns.
- Infrastructure providers willing to support measured pilot capacity without ownership or lock-in.

## MVP Capabilities

- Accounts: passkey-first (Android Credential Manager when native), profile, recovery, export, and deletion. Email is not the preferred primary factor.
- Client: Android-first native app (Kotlin + Jetpack Compose) for the closed pilot; web remains campaign + prototype (RFC-0005). iOS deferred until Mac/Xcode is available.
- Shield assertions: verified adult human status should be consumed as a minimal signed assertion, not as raw identity-provider data.
- Creator onboarding & transition bridge: curated archive import (e.g. from GDPR/DMA export files or device storage) for top showcase posts during onboarding and a rate-limited 90-day transition window to support creator habit formation.
- Video & media: vertical upload, processing, adaptive playback, captions, thumbnails, rights metadata, and optional historical archive engagement badges (display-only provenance labels with strict feed neutrality).
- Social graph: follow, unfollow, profile, native likes, comments, blocks, and mutes.
- Feeds: following, chronological, and one transparent discovery feed (isolated from external historical metrics).
- Creator & business tools: analytics, revenue shadow ledger, export, sponsorship disclosure, and direct-sold contextual sponsor cards with visible labels, "why this ad" explanations, and Shield-verified organization assertions.
- Safety: report, block, mute, explicit-content controls, moderation queue, decision reasons, appeals, and transparency notes.
- Capacity: waitlist, invite cohorts, public capacity dashboard, and growth gates.
- Transparency: public status, costs, provider concentration, and allocation dashboard.

## Explicit Exclusions

- No live streaming.
- No private messaging.
- No commercial music catalog.
- No minors in the first public pilot.
- No raw passport, document image, selfie, date of birth, or address storage in the EverCommons application.
- No automated live scraping, mirroring, or continuous syncing with external social networks.
- No merging of third-party historical metrics into native EverCommons likes, reactions, or feed ranking algorithms.
- No cryptocurrency or token.
- No global federation write path.
- No attempt to train a frontier foundation model.

## Alpha Gates

The project should not accept public uploads at uncontrolled scale until these are ready:

- Stable upload, transcode, playback, and backup restore.
- Media/CDN threat model, private raw uploads, processed derivatives, deletion/purge test, upload quotas, and cost-abuse controls.
- Report handling, appeals, moderation coverage, and incident playbook.
- Data inventory, retention controls, export, deletion, and privacy review.
- Realistic cost-per-watch-minute and cost-per-upload measurements.
- Rights-clean creator content and cross-posting workflow.
- At least two viable infrastructure paths or a tested migration plan.
- Terms, privacy notice, DSA/GDPR process, tax/payment advice, and content-rights advice suitable for launch scope.

## First 30 Days

1. Publish the manifesto, founding charter, partner charter, contribution guide, security policy, and code of conduct.
2. Launch a static campaign page at `voxonlabs.com/evercommons` on Cloudflare Pages.
3. Publish this RFC and invite issue-based review.
4. Create a clickable prototype for onboarding, feed, upload, creator dashboard, "why this ad", and capacity dashboard.
5. Recruit five founding contributors through GitHub issue templates for finite work.
6. Interview ten creators and five potential advertisers.
7. Prepare one measured infrastructure request for a 100-user pilot.
8. Keep EverCommons as a working name pending formal clearance.
