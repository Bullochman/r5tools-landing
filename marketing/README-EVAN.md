# r5tools.io — Marketing Loop Recap (wake-up brief)

_Written 2026-07-17 ~10:00Z at end of the 2-hour silent-execution loop._

---

## 1. TL;DR

In ~2 hours, r5tools.io went from "hero page + a few tools" to a full launch stack: **706-page EN SEO farm + 690-page KR mirror (1,398-URL sitemap w/ hreflang)**, a **viral referral system** (25% first-year rev share, ledger + Stripe hook), a **7-email drip in EN+KR** with opt-in and unsubscribe, a **founding-100 scarcity widget** on every page tied to a real live count endpoint, **analytics** (Plausible + GA4 injected into 1,389 pages, server-side conversion events), a **ProductHunt press kit + launch-day playbook** targeting Tue **2026-07-28**, and ready-to-post packs for X/Reddit/Discord/TikTok/YouTube/KR. **Nothing is deployed yet** — both repos have uncommitted changes and Railway needs env vars set. Do the 12 things in section 3, in order.

## 2. Everything that shipped

### SEO
- 706 EN pages: `buildings/ heroes/ guides/ events/ seasons/ warzones/ glossary/`
- 690 KR pages: `ko/buildings/`, `ko/heroes/`, etc. (glossary-substituted, not full LLM)
- `sitemap.xml` (1,398 URLs, hreflang triads), `robots.txt`
- Generators: `build_seo_pages.py`, `kr_translate_pages.py`, `kr_translator.py` (LLM path — unused, ready if `ANTHROPIC_API_KEY` added)
- Verification: `screenshots/seo-verify/` (5 spot-checks)

### EN/KR landing + conversion
- Hero A/B: `marketing/hero-variant-a.html` (problem-first), `-b.html` (specific-number), `-c.html` (social-proof) + `marketing/ab-hero-switcher.js`
- Conversion audit: `marketing/conversion-audit.md`
- Lead magnet: `marketing/lead-magnets/season-2-landing-cheat-sheet.pdf` (+ `-ko.pdf`), landing `cheat-sheet.html` (+ `ko/cheat-sheet.html`), `build_cheatsheet.py`

### Referral / affiliate
- Repo `LWS_Access_Codes/`: `server.py` (+330 lines, 6 endpoints), `unlock.html` extended
- Landing: `refer.html` (EN) — **KR `ko/refer.html` NOT built**
- `?ref=` attribution snippet on landing `index.html`
- Idempotent Stripe hook, Discord firehose notify, tunable `REV_SHARE_PCT`

### Email drip
- `marketing/emails/en/day00…day07-*.md` (7 emails) + `marketing/emails/ko/…` (7 mirrored)
- `marketing/emails/send_drip.py` (stdlib, cron-driven: `0 * * * *`)
- `server.py` endpoints: `/api/drip/subscribe`, `/api/drip/unsubscribe` (HMAC + RFC 8058)
- Opt-in field in `unlock.html` EN+KR

### Founding-tier scarcity
- `founding-widget.js` on 1,391 pages
- `GET /api/founding-count` (CORS, 60s cache, dedupe)
- `waitlist.html` (EN) + `ko/waitlist.html`
- `FOUNDING_CAP` env, tag/discord fields in drip subscribe
- Widget builder: `build_founding_widget_inject.py`

### Analytics
- `analytics.js` + `analytics-config.js` injected into 1,389 pages
- Plausible primary, GA4 secondary (PostHog wired-off)
- Server-side conversion events on `checkout.session.completed` → Plausible Events API + GA4 Measurement Protocol (survives ad-blockers)
- Injector: `build_analytics_inject.py`; setup guide: `marketing/analytics-setup.md`

### Social / distribution packs
- `marketing/x-twitter.md` — 12-tweet launch thread, 30-day calendar, reply templates
- `marketing/reddit-posts.md` — 30KB, subreddit-mapped
- `marketing/kr-posts.md` — KR forums + KakaoTalk hooks
- `marketing/youtube-outreach.md` — 34KB creator list + scripts
- `marketing/r5-outreach.md` — cold outreach for R5 recruits
- `marketing/how-to-find-r5s.md`, `marketing/warzone-tracking.csv`
- `marketing/discord/` — outreach, community server setup, launch posts, bot spec
- `marketing/tiktok/` — 10 scripts, KR adapter, posting strategy, voiceover tips
- `marketing/paid-ads.md` — Meta/Reddit/YouTube ad copy + budget guide

### Launch prep
- `marketing/producthunt/` — launch brief, gallery plan, hunter outreach, day-of checklist, press-kit/ + `press-kit.zip`, follow-on-launches 90-day plan
- `marketing/SEND-TODAY/` — `reddit-targets.csv`, `r5-peer-targets.csv`, `youtube-targets.csv`, `kr-targets.csv`, `twitter-launch-thread/00-post-in-order.md` + 10 media assets

## 3. Do these things IN THIS ORDER

1. `cd ~/claudecode/r5tools/LWS_Access_Codes && git status` — review the referral/drip/founding-count server changes, then `git commit -am "ship: referral + drip + founding-count endpoints"` and `git push`. Railway auto-deploys.
2. In Railway dashboard for `lws-access-codes`, set env vars: `ADMIN_TOKEN`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SERVER_SECRET`, `REV_SHARE_PCT=0.25`, `FOUNDING_CAP=100`, `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`, `PLAUSIBLE_API_KEY`. Redeploy.
3. `cd ~/claudecode/r5tools/r5tools-landing && git add -A && git commit -m "ship: SEO farm (EN+KR) + hero variants + widgets + analytics" && git push`. GH Pages auto-deploys.
4. Create Plausible account, add both domains (`r5tools.io`, `access-codes.r5tools.io`), paste site ID into `analytics-config.js`, commit + push again.
5. Create GA4 property, grab Measurement ID + API secret, paste into `analytics-config.js` + set the two env vars in Railway.
6. Google Search Console: verify `r5tools.io` (DNS TXT), submit `https://r5tools.io/sitemap.xml`. Same for Bing Webmaster.
7. Test the referral flow end-to-end: mint a code at `access-codes.r5tools.io/support-admin.html`, hit `r5tools.io/?ref=YOURCODE`, buy through Stripe test mode, confirm ledger row + Discord ping.
8. Test the drip: subscribe your own email at `/unlock.html`, confirm `day00-welcome` fires; run `python3 marketing/emails/send_drip.py --dry-run` to verify SMTP.
9. Open `marketing/SEND-TODAY/twitter-launch-thread/00-post-in-order.md` — post the 12-tweet thread via Typefully (or manually). Fix the 3 `.TODO` media assets (mosaic, roster-video, hive-grid overlay) OR post without them.
10. Post the 5 items in `marketing/SEND-TODAY/reddit-targets.csv` using drafts from `marketing/reddit-posts.md` — space them 30+ min apart, don't karma-farm.
11. Set your PH launch alarm for **Tue 2026-07-28, 12:01 AM PT** — work `marketing/producthunt/launch-day-checklist.md` from T-14d today.
12. Build `ko/refer.html` (KR referral page is missing — copy `refer.html`, run through glossary or hand-translate) so the KR funnel doesn't dead-end.

## 4. Costs incurred / to incur

- **Incurred: $0.** No paid services touched during the build.
- **To incur:**
  - Plausible: $9/mo starter after 30-day free trial (both domains fit on starter).
  - GA4: free.
  - SMTP: whatever you already pay (Postmark / SES / Fastmail SMTP creds go into Railway env).
  - Ad spend: your discretion — `marketing/paid-ads.md` recommends starting at $10/day on Meta before scaling.

## 5. What was NOT done (honest flags)

- **`ko/index.html` is still a 136-line SEO dump, not a hero page.** Highest KR conversion ROI left untouched (agent respected no-touch-live-hero rule). Do this next session.
- **`ko/refer.html` does not exist.** KR referral funnel dead-ends. See action item 12.
- **`SEASON2-EARLY` code was referenced in the prompt but doesn't exist in `codes.json`.** All hero variants and emails use `RONY-FREE` only. If you want SEASON2-EARLY, mint it in the admin panel.
- **KR body prose is glossary-substituted, NOT full LLM translation.** Titles, meta, glossary terms are Korean; article bodies are English with a "자동 번역되었습니다" pill. `kr_translator.py` LLM upgrade path exists — add `ANTHROPIC_API_KEY` and re-run to get real translations.
- **3 Twitter media assets are still `.TODO` placeholders** (mosaic, roster-video, hive-grid). Thread will post fine without them but engagement will suffer.
- **Discord bot** — spec only, no code. Deferred to 100-paying-alliance milestone; use Zapier + manual embeds for now.
- **KR TikTok scripts are briefing-only.** Explicit hand-off to a native KR speaker — romanized scripts would tank credibility.
- **Live-site pricing/tool-count discrepancy:** ProductHunt brief says $50 alliance + 11 tools (matches live site). Some earlier prompt copy said $30/8 tools. If you change the site, PH brief needs re-syncing.
- **Nothing is git-pushed.** Both repos are dirty. Nothing is deployed. See section 3.
- **No parallel audit agent landed** — I verified key paths myself; no `AUDIT.md` exists.

## 6. Loop metadata

- Start: 2026-07-17T08:17Z (original mandate in `LWS_Alliance_Ops_Center` session)
- Crash: ~08:31Z
- Recovery start: 08:34Z (this session)
- End: ~10:00Z
- Total agents dispatched: **16** (6 pre-crash + 6 Batch 3 + 6 Batch 4 + Batch 5 count TBD)
- Total files created/modified: ~1,400 (SEO farm) + ~50 marketing docs + server changes
- Session file: `~/.claude/projects/-Users-evanjones-claudecode-r5tools/3745b795-3b48-469c-9646-13e4c7b5dc21.jsonl`
- Prior source session: `~/.claude/projects/-Users-evanjones-claudecode-LWS-Alliance-Ops-Center/51319a14-2d0b-4f7b-a810-d537410311af.jsonl`
- Recovery timeline: `.session-recovery/2h-marketing-loop.md`

## 7. Where to find everything

`~/claudecode/r5tools/r5tools-landing/` — the site repo (GH Pages, `r5tools.io`)
`~/claudecode/r5tools/LWS_Access_Codes/` — the auth/referral/drip server (Railway, `access-codes.r5tools.io`)

Inside `r5tools-landing/marketing/`:

- `SEND-TODAY/` — post these first (Twitter thread + Reddit/YouTube/KR/R5-peer target CSVs)
- `discord/` — outreach list, launch posts, community server setup, bot spec
- `emails/` — `en/`, `ko/`, `send_drip.py`
- `lead-magnets/` — Season 2 cheat sheet PDF (EN+KR) + generator
- `producthunt/` — launch brief, checklist, gallery, hunter outreach, press-kit + zip, follow-on launches
- `tiktok/` — 10 scripts, KR adapter, posting strategy, voiceover tips
- Root files: `x-twitter.md`, `reddit-posts.md`, `kr-posts.md`, `youtube-outreach.md`, `paid-ads.md`, `r5-outreach.md`, `how-to-find-r5s.md`, `warzone-tracking.csv`, `conversion-audit.md`, `analytics-setup.md`, `hero-variant-{a,b,c}.html`, `ab-hero-switcher.js`, `founding-scarcity-widget.html`

Inside `r5tools-landing/` root:

- `sitemap.xml` (1,398 URLs), `robots.txt`, `analytics.js`, `analytics-config.js`, `founding-widget.js`, `refer.html`, `waitlist.html`, `cheat-sheet.html`
- `ko/` — Korean mirror (missing `refer.html`)
- `screenshots/seo-verify/` — spot-check screenshots
- Generators: `build_seo_pages.py`, `kr_translate_pages.py`, `build_analytics_inject.py`, `build_founding_widget_inject.py`
