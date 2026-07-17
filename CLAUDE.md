# CLAUDE.md — r5tools-landing

The marketing site + SEO farm + i18n + funnel infrastructure for **r5tools.io**.

- **Repo:** `https://github.com/Bullochman/r5tools-landing`
- **Deploy:** GitHub Pages via `CNAME` file → `r5tools.io`
- **Domain:** `r5tools.io` — bought 2026-07-14 via **GoDaddy** (1-yr, Full Domain Protection)
- **DNS:** **Cloudflare Free** — zone ID `ebcd9f429baad546709cf73c96f19d73` (ACTIVE), NS = `molly.ns.cloudflare.com` + `pablo.ns.cloudflare.com`. GoDaddy is registrar only.
- **Email:** LIVE via Cloudflare Email Routing → `evan@ hello@ support@ press@ hunters@ abuse@ postmaster@ r5tools.io` all forward to `bullochman0@gmail.com`. Automation at `../automation/email-routing/setup_cloudflare_email.py`.
- **HTTPS:** Let's Encrypt cert via GH Pages — was slow to provision (>30h from initial CNAME); check `curl -sI https://r5tools.io/` before assuming HTTPS is live.
- **Sibling backend:** `../LWS_Access_Codes/` deploys to `access-codes.r5tools.io` (Railway) and handles unlock codes, referral system, drip campaign, founding cap, Stripe webhooks

Any change here that references an API call presumes `LWS_Access_Codes/server.py` is live.

---

## What's in this directory

### Public HTML (deploys to r5tools.io)
| Path | Purpose |
|---|---|
| `index.html` | Hero landing (EN, 175KB) — the CURRENTLY LIVE hero. Do NOT edit; use A/B variants in `marketing/hero-variant-*.html` |
| `ko/index.html` | KR hero (rebuilt 2026-07-17 → 699 lines, native 존댓말 register) |
| `ja/index.html` | JP hero (in progress) |
| `pt/index.html` | PT-BR hero (in progress) |
| `es/index.html` | ES-LatAm hero (in progress) |
| `refer.html` | Referral dashboard (per-user unique code + share buttons + earnings) |
| `waitlist.html` | Waitlist form when Founding tier closes |
| `cheat-sheet.html` | Season 2 Landing Cheat Sheet lead-magnet landing |
| `faq.html` | Support FAQ (20 Q&A across 6 categories) |
| `privacy.html` `terms.html` `refund.html` `trust.html` | Legal pack |
| `waitlist.html`, `newsletter-signup.html` | Email capture |
| `blog/` | Blog posts + RSS feed |
| `screenshots/` | Tool screenshots for social/gallery |

### SEO farm (1,398 URLs total in sitemap.xml)
| Dir | Count | Priority |
|---|---|---|
| `seasons/` | 8 EN + 8 KR | 0.9 |
| `heroes/` | 32 EN + 32 KR | 0.8 |
| `buildings/` | 29 EN + 29 KR | 0.8 |
| `events/` | 42 EN + 42 KR | 0.7 |
| `warzones/` | 121 EN + 121 KR | 0.6 |
| `guides/` | 49 EN + 49 KR | 0.7 |
| `glossary/` | 408 EN + 408 KR | 0.5 |
| `ko/*` | mirror of above (690 pages) | (hreflang'd back) |
| Core | homepage, refer, waitlist, cheat-sheet, faq, legal | 0.9-1.0 |

**Builders:**
- `build_seo_pages.py` (82KB, 1663 lines) — generates all EN pages from `LWS_Knowledge_Base/` markdown
- `kr_translate_pages.py` — glossary-driven KR translator (no API key needed)
- `kr_translator.py` — LLM-based translator (needs `ANTHROPIC_API_KEY`, layers on top of glossary-substituted pages for full-body prose)

### `marketing/` — every marketing artifact
| Sub | What |
|---|---|
| `reddit-posts.md`, `youtube-outreach.md`, `kr-posts.md`, `r5-outreach.md`, `paid-ads.md`, `warzone-tracking.csv`, `how-to-find-r5s.md` | Batch 1 outreach copy |
| `x-twitter.md` | 12-tweet launch thread + 30-day calendar + hashtag whitelist |
| `discord/` | Server outreach list (16 servers, verified invites for top 5) + launch posts EN+KR + community server setup + bot spec |
| `producthunt/` | Launch brief + gallery plan + hunter outreach (5 hunters, real names) + launch-day checklist + press-kit + follow-on 90-day launch cadence |
| `tiktok/` | 10 scripts + posting strategy + voiceover tips + KR adapter |
| `emails/` | 7-day drip (EN + KR) + `send_drip.py` (SMTP + HMAC unsub) |
| `lead-magnets/` | Season 2 cheat-sheet PDF (EN 42KB + KR 74KB) + `build_cheatsheet.py` |
| `hero-variant-{a,b,c}.html` | 3 hero A/B variants + `ab-hero-switcher.js` |
| `analytics-setup.md`, `conversion-audit.md`, `CWV-CHECKLIST.md`, `INTERNAL-LINKING-AUDIT.md`, `CROSS-TOOL-AUDIT.md` | Audit reports |
| `CANONICAL-FACTS.md` | **Single source of truth** for pricing + tool count + active codes. Read this before writing any marketing copy. |
| `MARKETING-INCONSISTENCIES.md` | Files flagged for manual copy rewrite |
| `SEND-TODAY/` | Per-channel CSVs (121 outreach targets) + copy-paste-ready launch tweet thread + master checklist |
| `content-calendar/` | 30 tool tips EN+KR + schedule.csv (30 days) |
| `support/` | FAQ pages + discord-bot-corpus.json |
| `README-EVAN.md` | Evan's morning-read summary + prioritized action list |
| `AUDIT.md` | File-existence audit across all batches |
| `launch-ready.zip` | 1.34MB packaged launch pack |

### `automation/` — auto-running infrastructure
| Sub | What | Runs |
|---|---|---|
| `sitemap-ping/` | IndexNow + Google/Bing/GSC pings | Daily 08:00 UTC + post-build hook |
| `screenshots/` | Playwright weekly snapshot (26 targets) + diff detection + `screenshots-gallery.md` regen | Sunday 04:00 UTC |
| `typefully/` | X/Twitter scheduler for launch thread + 30-day calendar via Typefully API | One-shot + weekly re-run |
| `discord-bot/` | Slash-commanded scheduled poster (`/r5t schedule|list|cancel`), safety guardrails against ToS | Systemd on Lightsail (shares box with MaKayla) |
| `discord-community-bootstrap/` | Setup script for Evan's own r5tools community server (channels, roles, welcome flow, verify flow, content seeder) | One-shot |
| `conversion-nudges/` | Trigger-based free-to-paid email nudges (6 triggers, 12 templates EN+KR) | Hourly cron |
| `blog/` | Markdown → HTML builder + RSS feed + weekly newsletter digest + cross-post automation | Sunday 10 AM CT |
| `testimonials/` | Capture flow + moderator CLI + inject-to-heroes | Nightly |
| `scripts/seo/` | Schema.org injectors, related-blocks, robots tuning | Idempotent on-demand |

### Analytics wiring
- **Plausible** (primary, cookieless): domain-based, no key required
- **GA4** (secondary): `analytics-config.js` holds the `G-XXXXXXXXXX` measurement ID Evan fills in
- **PostHog** (wired but off): activate when session replay / multi-step funnels needed
- Analytics block idempotently injected via `build_analytics_inject.py` — marker `<!-- r5tools:analytics v1 START/END -->`
- Server-side conversion events fire from `LWS_Access_Codes/server.py` Stripe webhook → Plausible Events API + GA4 Measurement Protocol (survives ad-blockers)

### Founding scarcity widget
- `founding-widget.js` (3.7KB gzipped) injected on **1,391 pages** via `build_founding_widget_inject.py`
- Fetches `https://access-codes.r5tools.io/api/founding-count` every 5 min
- Displays real count (never inflates); states: normal / red at <20 left / "closed — waitlist open" / "0/100 — be the first"
- Session-dismissible; EN + KR strings; auto-detects language

---

## Deployment

```
git add . && git commit -m "..." && git push
# → GitHub Pages auto-deploys within ~60s
```

Post-deploy verification: `curl -sI https://r5tools.io/ | head -3` should return HTTP 200.

For the access-codes server changes (in `../LWS_Access_Codes/`):
```
cd ../LWS_Access_Codes && git add . && git commit && git push
# → Railway auto-deploys via Docker
```

Env vars Railway needs (from AUDIT.md):
- **Required for full functionality:** `SERVER_SECRET`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_LIVE_KEY`, `STRIPE_PRICE_LIFETIME`, `SMTP_HOST/USER/PASS/FROM`
- **Optional:** `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`, `DISCORD_WEBHOOK_URL`, `INDEXNOW_KEY=4a6027c1ce623eed56161f394d06d9d2`, `ADMIN_TOKEN`, `TYPEFULLY_API_KEY`, `DISCORD_BOT_TOKEN`
- **Safe defaults:** `FOUNDING_CAP=100`, `REV_SHARE_PCT=25`

---

## Voice & Style Rules

- **R5-to-R5** — Evan is an active R5 in Warzone 2007, not a marketing team. Every doc reads as a fellow player talking, not a corporation.
- **No emojis in body copy** (X, Reddit, emails). Emojis fine in text overlays (TikTok), UI (site copy), and Discord.
- **Cite the KB** — every claim (coal-burn numbers, freeze thresholds, blast radii) must trace to `LWS_Knowledge_Base/kb/*.md`.
- **No fabrication** — never invent alliance names, R5 handles, warzone numbers, or testimonials.
- **KR-first** — highest-paying demographic gets equal treatment on every page.
- **Under-promise / over-deliver** — "8 tools" was a marketing shorthand; actual is 11.

---

## Recent notable changes

- 2026-07-17: 2h marketing loop — 30+ parallel agents, 1,400 URL sitemap, EN+KR full, JP/PT/ES in progress, full automation infra shipped. See `.session-recovery/2h-marketing-loop.md`.
- 2026-07-14 to 07-16: Initial SEO farm + core site + LWS_Access_Codes scaffolding

Update this file at natural breakpoints.
