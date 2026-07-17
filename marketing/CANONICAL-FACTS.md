# CANONICAL FACTS — r5tools.io marketing source of truth

**Reconciled:** 2026-07-17
**Source of truth files:** `/Users/evanjones/claudecode/r5tools/r5tools-landing/index.html`, `/Users/evanjones/claudecode/r5tools/r5tools-landing/refer.html`, `/Users/evanjones/claudecode/r5tools/LWS_Access_Codes/codes.json`, `/Users/evanjones/claudecode/r5tools/LWS_Access_Codes/server.py`, `/Users/evanjones/claudecode/r5tools/r5tools-landing/marketing/producthunt/press-kit/README.md`

If a marketing asset contradicts anything here, the asset is wrong.

---

## Pricing tiers (LIVE on r5tools.io/index.html)

| Tier | Price | Tier code / notes | What it unlocks |
|---|---|---|---|
| **FREE — WARZONE 2007** | $0 | Code: `RONY-FREE` (server tier `free-warzone`, warzone 2007). Distributed to RONY alliance + KR speakers Evan has personally invited. Works from ANY warzone in practice. | Full suite, 90-day cookie, all 7 languages, Discord PNG export |
| **PERSONAL** | $10 one-time | Stripe: `https://buy.stripe.com/3cI8wO8g13vf0DY39A6c001`. Server tier `paid-personal`. | Full suite for one player, 90 days per device, includes Roster Extractor standard |
| **ALLIANCE BUNDLE** | $50 one-time | Contact `hello@r5tools.io`. Server tier `alliance-bundle`. | Full suite for the whole alliance, 90 days per device (R5 shares the code with all members) |
| **FOUNDING ALLIANCE** | $30 one-time (first 10 alliances ONLY; then $50) | Stripe: `https://buy.stripe.com/7sY3cubsdd5PgCW8tU6c002`. Server tier `alliance-founding` / `alliance-bundle-founding`. FOUNDING_CAP=100 in server, but the marketing frame is "first 10". | Same as Alliance Bundle + LIFETIME access to every new tool Evan ships forever |
| **ROSTER EXTRACTOR PREMIUM** | +$5 add-on | Add-on to Personal or Alliance tier. | Second-pass Claude audit for guaranteed 94/94 roster accuracy |
| **LIFETIME (hidden SKU)** | $20 one-time | Server env `STRIPE_PRICE_LIFETIME`. NOT surfaced as a pricing card on index.html. Referenced only in the unlock banner line 373. | Personal-scope lifetime unlock — do NOT market as alliance-wide. |

**Founding-tier framing note:** The Founding tier headline uses "$30 · FIRST 10 ONLY" in every language on index.html and in the founding-scarcity widget. The server-side cap (`FOUNDING_CAP=100`) is a different, larger safety net. Marketing copy should say **"first 10 alliances"** — do NOT invent alternate numbers.

**"$20 lifetime unlock" nuance:** A `$20 one-time lifetime unlock` SKU exists in `LWS_Access_Codes/server.py` (env var `STRIPE_PRICE_LIFETIME`, line 58 comment). The unlock banner on index.html (line 373) references it: "paid $20 lifetime unlock." BUT the visible pricing cards on index.html show `$10 Personal / $50 Alliance / $30 Alliance Founding` — no $20 tier card. The $20 lifetime SKU is a hidden/back-channel tier not marketed on the pricing grid. **For marketing purposes, do NOT promote `$20 lifetime` unless we surface it as a visible tier on index.html.** Any TikTok/ad copy pitching `$20 lifetime` as if it's a shared alliance-wide code is doubly wrong: (a) it's not a visible tier, (b) the "one R5 pays, whole alliance unlocks" model is Alliance Bundle ($50) or Alliance Founding ($30), NOT the $20 Personal-lifetime SKU.

---

## Active access codes

| Code | Tier | Purpose | Status |
|---|---|---|---|
| `RONY-FREE` | `free-warzone` (warzone 2007) | **PRIMARY free code** — RONY alliance + KR speakers Evan invited. Promoted in ALL UI copy from 2026-07-17 onward. | ACTIVE — promote everywhere |
| `WARZONE-2007-FREE` | `free-warzone` (warzone 2007) | Grandfathered legacy code. Existing cookies keep working. DO NOT PROMOTE. Anyone visiting fresh gets pointed at `RONY-FREE`. Deletable ~Oct 2026 when cookies expire. | ACTIVE but hidden — DO NOT PROMOTE |
| `HIVE-KR-ALLIANCE-2026` | `free-warzone` (no warzone restriction) | Legacy demo code inherited from Alliance_Hive_Grid_Manager. Kept alive indefinitely. | ACTIVE but not promoted |
| `KR-FRIENDS` | `paid-personal` | Hand-minted for excited Korean-speaking R5s Evan has relationships with. Same as $10 Personal — every tool unlocked for 90 days. Use sparingly. | ACTIVE, manual-issue only |

`SEASON2-EARLY` — **does NOT exist** in `codes.json`. Any marketing that references it is wrong.
`LWS-EARLY` / `LWS-BETA` — do not exist.

---

## Tool count

**Live tools featured on index.html tool grid:** **10**
1. Alliance Hive Grid Manager — hive.r5tools.io
2. Landing Planner — bullochman.github.io/lws-landing-planner-static/
3. Heat Simulator — bullochman.github.io/lws-heat-simulator-static/
4. Freeze-Risk Dashboard — bullochman.github.io/lws-freeze-risk-static/
5. Coal Burn Calculator — bullochman.github.io/lws-coal-burn-static/
6. City / Dig-Site Capture Planner — bullochman.github.io/lws-city-capture-static/
7. Season Timeline — bullochman.github.io/lws-season-timeline-static/
8. Profile Studio — bullochman.github.io/lws-profile-studio-static/
9. VS Days Optimizer — bullochman.github.io/lws-vs-days-static/
10. Roster Extractor (FLAGSHIP) — roster.r5tools.io

**Total shipped tools including KB Chat:** **11** (KB Chat lives at chat.r5tools.io but is NOT displayed as a card on index.html — it's referenced in tooltip text and press-kit copy.)

**Canonical marketing number:** Use **"11 tools"** in press/PR/PH copy (matches press-kit/README.md and one-pager.md). Use **"10 tools"** or explicitly list them ONLY if the copy is walking through the visible index.html tool grid. The ProductHunt launch-brief explicitly notes the "8 tools" number in that file was a deliberately-conservative tagline — that's a strategic choice for the PH launch only, not truth.

**"8 tools" is WRONG** except in `producthunt/launch-brief.md` where it's explicitly documented as a strategic under-promise for the PH tagline. Everywhere else, use 11.

---

## Canonical URLs

| Purpose | URL |
|---|---|
| Main site | https://r5tools.io/ |
| Unlock / sign-in | https://access-codes.r5tools.io/ |
| Referral program page | https://r5tools.io/refer.html |
| Waitlist | https://r5tools.io/waitlist.html |
| Roadmap (public, auto-generated from AI recommendations) | https://r5tools.io/roadmap.html |
| Status | https://r5tools.io/status.html |
| Cheat sheet (S2 landing) | https://r5tools.io/cheat-sheet.html |
| Leaderboard | https://r5tools.io/leaderboard.html |
| Privacy / Terms | https://r5tools.io/privacy.html · /terms.html |
| Personal $10 Stripe | https://buy.stripe.com/3cI8wO8g13vf0DY39A6c001 |
| Alliance Founding $30 Stripe | https://buy.stripe.com/7sY3cubsdd5PgCW8tU6c002 |
| Alliance Bundle $50 | mailto hello@r5tools.io (no direct Stripe link — email flow) |
| Hive tool | https://hive.r5tools.io/ |
| Roster Extractor | https://roster.r5tools.io/ |
| KB Chat | https://chat.r5tools.io/ |
| GitHub Pages tool base | https://bullochman.github.io/lws-*-static/ |
| Admin support ticket dashboard | https://access-codes.r5tools.io/support/recommendations |

---

## Languages

7 total, in this canonical order: **Korean (한국어) · English · Spanish · Portuguese · Japanese · German · French**
Locale codes: `ko · en · es · pt · ja · de · fr`
**KR is primary** — every string is written for Korean R5s first, English second.

---

## Contact

- **Email:** evanjones@mdr.net (private) OR `hello@r5tools.io` (public)
- **Discord:** `[EVAN-DISCORD]` — placeholder in press kit, fill in before external distribution
- **Alliance:** RONY / TINO, Warzone 2007 (Korean-dominant)

---

## Numbers verified 2026-07-17

- **11 tools live**
- **7 languages supported**
- **1,396 SEO reference pages** (706 English + 690 Korean)
- **~100 players / alliance** — design constant
- **~2 min** — end-to-end Roster Extractor pipeline (video → CSV)
- **94/94** — Roster Extractor Premium accuracy target
- **~$0.45** — Anthropic API cost per 3-min Roster video
- **90 days** — device cookie lifetime for paid tiers
