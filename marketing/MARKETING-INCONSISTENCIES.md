# MARKETING INCONSISTENCIES REPORT

Generated 2026-07-17. Source of truth: [`CANONICAL-FACTS.md`](CANONICAL-FACTS.md).

Two sections:
1. **Auto-fixed** — mismatches that were safe to string-replace and have been corrected.
2. **Manual — copy needs rewrite** — mismatches where the copy is designed around the wrong number and needs a human/agent rewrite rather than a token swap.

---

## 1. Auto-fixed (33 fixes across 11 files)

Format: `path:line — before → after`. All applied.

### Tool count: `8` → `11`

| File | Line | Before | After |
|---|---|---|---|
| `x-twitter.md` | 25 | `Built 8 tools that make…` (+ 8-tool list) | `Built 11 tools…` (+ 11-tool list w/ Profile Studio, VS Days, KB Chat) |
| `x-twitter.md` | 165 | `That's the suite. 8 tools` | `That's the suite. 11 tools` |
| `x-twitter.md` | 217 | `r5tools.io — 8 planning tools` | `r5tools.io — 11 planning tools` |
| `x-twitter.md` | 456 | `r5tools.io — 8 planning tools` | `r5tools.io — 11 planning tools` |
| `x-twitter.md` | 471 | `built by an active R5, 8 tools —` (+ 8 names) | `built by an active R5, 11 tools —` (+ 11 names) |
| `paid-ads.md` | 60 | `— 8 tools, 7 languages, …` (D1 89 chars) | `— 11 tools, 7 languages, …` (90 chars — still under Google Ads 90-char limit) |
| `paid-ads.md` | 67 | `H2: 8 LWS Planning Tools (22)` | `H2: 11 LWS Planning Tools (21)` |
| `paid-ads.md` | 147 | `랜딩, 열지도, 석탄, 동결, 로스터 — 8개 도구, 7개 언어` | `— 11개 도구, 7개 언어` |
| `paid-ads.md` | 154 | `H2: LWS 계획 도구 8개 (10)` | `H2: LWS 계획 도구 11개 (11)` |
| `paid-ads.md` | 251 | `r5tools.io ships 8 planning tools` | `r5tools.io ships 11 planning tools` |
| `paid-ads.md` | 266 | `8 tools. 7 languages. One-time payment.` | `11 tools. 7 languages. One-time payment.` |
| `paid-ads.md` | 347 | `one CSV upload, 8 planning tools consume it` | `one CSV upload, 11 planning tools consume it` |
| `paid-ads.md` | 402 | `Sub: Stop. Here are 8 tools that fix it.` | `Sub: Stop. Here are 11 tools that fix it.` |
| `paid-ads.md` | 410 | `Sub: Try this instead. 8 tools, …` | `Sub: Try this instead. 11 tools, …` |
| `kr-posts.md` | 4 | `Access code: RONY-FREE (unlocks all 8 tools, no expiry)` | `… all 11 tools, no expiry` |
| `kr-posts.md` | 38, 49, 81, 94, 104, 138, 142, 240 | `도구 8종` (Korean "8 tools" count) — 8 instances | `도구 11종` |
| `kr-posts.md` | 195, 222, 324 | `8개 도구` — 3 instances | `11개 도구` |
| `kr-posts.md` | 405, 415 | `도구 8개` in DM templates | `도구 11개` |
| `discord/community-server-setup.md` | 194 | `RONY-FREE unlocks all 8 tools with full functionality` | `… all 11 tools …` |
| `discord/launch-posts.md` | 107 | `계획 도구 8종 만들었습니다` | `계획 도구 11종 만들었습니다` |
| `discord/launch-posts.md` | 109 | `결국 8개가 됐고` | `결국 11개가 됐고` |
| `SEND-TODAY/twitter-launch-thread/00-post-in-order.md` | 16 | `Built 8 tools that make…` (+ 8 tool list) | `Built 11 tools…` (+ 11-tool list) |
| `SEND-TODAY/twitter-launch-thread/00-post-in-order.md` | 180 | `That's the suite. 8 tools` | `That's the suite. 11 tools` |
| `SEND-TODAY/twitter-launch-thread/kr-translation-thread.md` | 17 | `도구 8종 만들었습니다` (+ 8-tool list) | `도구 11종 만들었습니다` (+ 11-tool list) |
| `SEND-TODAY/twitter-launch-thread/kr-translation-thread.md` | 183 | `도구 8개, 7개 언어` | `도구 11개, 7개 언어` |
| `SEND-TODAY/twitter-launch-thread/posting-day-checklist.md` | 37 | `저희가 만든 도구 8종 스레드` | `도구 11종 스레드` |
| `SEND-TODAY/twitter-launch-thread/fallback-single-post.md` | 18, 36, 68 | Multiple 8-tool references in Variant A, B, and follow-up | Updated to 11 tools with trailing "+ more" to preserve char limits; follow-up expanded to 11 tool names |
| `SEND-TODAY/twitter-schedule.csv` | 2 | `x-twitter.md line 25 (Built 8 tools…)` | `Built 11 tools…` |
| `SEND-TODAY/SEND-EMAIL-TEMPLATES.md` | 257, 270, 278, 333, 344, 516 | Multiple 도구 8종 / 도구 8개 / 8 tools references | All updated to 11 |

### Tier misattribution: Alliance Bundle vs Alliance Founding

| File | Line | Before | After |
|---|---|---|---|
| `r5-outreach.md` | 74 | `Alliance Bundle $30 covers your whole alliance forever (first 10 alliances — will go to $50 after)` | `Alliance Founding $30 covers your whole alliance forever (first 10 alliances only — base Alliance Bundle is $50 after)` (renamed tier to canonical name; $30 IS Founding, not base Bundle) |

### Deprecated code correction

| File | Line | Before | After |
|---|---|---|---|
| `SEND-TODAY/ATTRIBUTION-CODES.md` | 50 | `WARZONE-2007-FREE \| Planned - WZ 2007 all-alliance code…` | `WARZONE-2007-FREE \| DEPRECATED - grandfathered legacy code (existing cookies still work). DO NOT PROMOTE …` |

---

## 2. Manual — copy needs rewrite (6 files flagged, NOT modified)

These files have mismatches embedded in the pitch itself. A pure string-swap would break the argument structure. Route to a copywriting agent.

### `hero-variant-a.html`
- **Issue:** Headline CTA is `Stop losing events — $30 for the whole alliance →`. Body copy calls out "Eight tools." The `$30` is unqualified — reads as if base Alliance is $30, which is misleading (base is $50; $30 is Founding tier, first 10 alliances only).
- **Fix needed:** Rewrite the CTA to either (a) add "(Founding, first 10)" qualifier, OR (b) change to `$50 for the whole alliance →`. Update "Eight tools" → "Eleven tools" (also affects the KR translation `8개의 도구` at line 61).
- **Affected i18n keys:** `heroA_Cta1`, `heroA_Body` (EN + KR).

### `hero-variant-b.html`
- **Issue:** Title says "8 tools", body says "8 planners", CTA says "See all 8 tools →". Headline says "$30 for your whole alliance." Body says "$30 unlocks the whole alliance ... (Founding pricing, first 100 alliances)" — the "first 100" number contradicts index.html which says "first 10 alliances."
- **Fix needed:** (1) Bump all tool counts 8 → 11 (title, body, CTA button, KR variants). If listing tool names, add Profile Studio, VS Days, KB Chat. (2) Resolve "first 100" vs "first 10" — canonical index.html copy says first 10; server config `FOUNDING_CAP=100`. Match the marketing frame in index.html: `first 10`. (3) Either qualify the $30 as Founding OR update to base $50.
- **Affected i18n keys:** `heroB_Title`, `heroB_Body`, `heroB_Cta1` (EN + KR).

### `hero-variant-c.html`
- **Issue:** "8 planners" (should be 11). "First 100 alliances" (contradicts index.html "first 10"). "$30 lifetime instead of $50/season, forever" — the "$50/season" framing is wrong: the base Alliance Bundle is $50 ONE-TIME, not per-season.
- **Fix needed:** (1) 8 → 11 planners. (2) Reconcile 100 vs 10 alliances number with the rest of the site — index.html uses "first 10", server allows 100. (3) Correct the pricing frame — `$50 one-time` not `$50/season`.
- **Affected i18n keys:** `heroC_Body` (EN + KR), founding-counter widget text.

### `tiktok/scripts.md` — Script 7 ("$30 for your whole alliance…")
- **Issue:** Entire script is built around `$20 lifetime unlock` (line 187) and conflates it with alliance-wide sharing. Neither price tier is $20. Personal is $10 one-time; Alliance Bundle is $50 one-time; Alliance Founding is $30 one-time (first 10 only). The "one R5 pays $20, whole alliance unlocks" model matches Alliance Bundle ($50) or Alliance Founding ($30), NOT $20. Text overlays and CTAs also use `$20`.
- **Fix needed:** Full script rewrite. Decide which tier to pitch (Alliance Founding at $30 with scarcity hook, OR base Alliance Bundle at $50). Update: (a) VO hook, (b) 4-9s beat with pricing card, (c) 26-30s CTA overlay `$20 lifetime → whole alliance`, (d) all 5 text overlays.
- **Bonus:** the script says "7+ tools" at 14s overlay — bump to 11.

### `tiktok/kr-tiktok-adapter.md`
- **Issue:** Line 6 strategy note gives example KR hook "$20에 연맹 전체가 도구 사용" ($20 for whole alliance) as recommended pattern. $20 is not a real tier price. This is guidance for translator, not a script to send, but it teaches wrong pricing.
- **Fix needed:** Replace the example with a correct tier — either `$30에 연맹 전체` (Founding) or `$50에 연맹 전체` (base Alliance Bundle). Since it's an example of KR hook style, either works; pick whichever pairs with the actual pitch strategy for KR TikTok.

### `lead-magnets/build_cheatsheet.py`
- **Issue:** Lines 159 (KR translation dict) and 361 (English back-cover CTA text) both use `$30 for the whole alliance. Use code RONY-FREE for free access.` The `$30` here is unqualified — the PDF cheat sheet is a lead magnet that will be distributed AFTER the Founding-10 tier likely closes. Once Founding tier is filled, `$30` is no longer available and the sheet is factually wrong.
- **Fix needed:** Either (a) update to `$50 for the whole alliance` (base Alliance Bundle, always valid) OR (b) add Founding qualifier `$30 (Founding, first 10 alliances)`. Also update the KR translation dict entry on line 159 to match. If choosing (a), the KR string `얼라이언스 전체 $30` → `얼라이언스 전체 $50`.

### `kr-posts.md` — Q5 KR FAQ (line 366-367)
- **Issue:** Lists `WARZONE-2007-FREE` in a "coming soon warzone codes" section. Per canonical, `WARZONE-2007-FREE` is DEPRECATED (grandfathered, DO NOT PROMOTE). The list also promises "per-warzone codes issuable on request" — this is aspirational.
- **Fix needed:** Delete the `WARZONE-2007-FREE` bullet or rewrite to say "existing WARZONE-2007-FREE cookies still work but new users should use RONY-FREE." Consider whether the "per-warzone codes on request" promise is real — if so, keep; if not, delete.

---

## Additional observations (not requiring immediate action)

### Source-of-truth ambiguity in `index.html` itself
- Line 373 (unlock banner): says `$20 lifetime unlock`. Lines 986-994 (pricing card): Personal is `$10 one-time`. These conflict WITHIN the source of truth. `$10` matches the Stripe URL (`buy.stripe.com/3cI8wO8g13vf0DY39A6c001`) so `$10` is treated as canonical in `CANONICAL-FACTS.md`. The `$20 lifetime` in the banner is a bug in `index.html` — flag to Evan for a fix on the live page (out of scope for this marketing sweep since prompt says NOT to modify index.html).

### Server `FOUNDING_CAP=100` vs marketing "first 10"
- `LWS_Access_Codes/server.py` line 1132: `FOUNDING_CAP = int(os.environ.get("FOUNDING_CAP", "100"))`.
- `index.html` line 963 (all 7 languages): `FOUNDING ALLIANCE · FIRST 10 ONLY` and `Alliance Bundle at $30 instead of $50 while I onboard the first 10 alliances`.
- These are two different scarcity numbers. Marketing frame is "first 10" everywhere in index.html. Hero variants B and C reference "first 100" which matches the server cap but not the visible pricing card. Reconcile before shipping either hero variant.

### `producthunt/launch-brief.md` "8 tools" is intentional (leave)
- The PH launch brief line 15 explicitly documents: `the "8 tools" number is deliberately conservative — the suite ships 11 today but "8 tools" sets a lower expectation the visitor over-clears`. This is a strategic choice for the PH launch tagline only. NOT auto-fixed.

### `README-EVAN.md` line 98 mentions the discrepancy itself
- This is a meta-doc describing the very inconsistency this report resolves. Not a marketing asset. Left as-is.
