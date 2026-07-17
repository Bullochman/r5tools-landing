# r5tools.io — Conversion Audit

Snapshot: 2026-07-17 · Season 2 · Week 3 · Polar Storm live
File audited: `/Users/evanjones/claudecode/r5tools/r5tools-landing/index.html` (2,183 lines, ~172 KB)
KR audited: `/Users/evanjones/claudecode/r5tools/r5tools-landing/ko/index.html` (136 lines, ~5.8 KB)

---

## 1. Current hero critique (what's shipping right now)

**Current H1:**
> Your alliance is planning Season 2 in a group chat. The winning alliances aren't.

**Current subhead:**
> *Last War: Survival* alliance tools that replace the Google Sheet: video-to-roster in 2 minutes, Season 2 landing plan by rank tier, freeze-risk dashboard, coal budget for the Week-4 blizzard, hive formations, city capture schedule. Built by an R5. English + Korean + 5 more languages. Discord PNG export on every tool.

**Current CTAs:**
- `See pricing →` (primary, gold button, anchors to #pricing)
- `Try Roster Extractor (free demo)` (secondary, ghost, opens roster.r5tools.io)

### What's working
- **Great hook.** "Planning Season 2 in a group chat" is specific, R5-native, and instantly triggers the "yeah that's us" reaction. Punches above its weight.
- **Concrete deliverables** in the subhead — 6 tool-name-drops with the specific job each does. Beats abstract benefits.
- **Trust signal is present** — "Built by an R5" appears in the subhead. Language count is a subtle "this is not vaporware."
- **Two-CTA structure is correct** — money-CTA + zero-risk-CTA. Standard SaaS pattern, works.
- **Season 2 badge above the H1** creates urgency (Week 3 of a live season). Time-boxed, credible.

### What's weak
- **H1 is too long for the phone.** At `font-size: 32px` on mobile (line 302), the two-line H1 wraps to 3–4 lines on 375px width. Kills above-the-fold real estate. The hero eats the entire fold on iPhone.
- **CTA doesn't tell you what happens next.** "See pricing →" is passive. Compare to "Unlock the whole alliance for $30" — same click, way more decision-forcing.
- **No number in the CTA.** Every hero A/B best-practice says: put the price or the outcome IN the primary CTA. Currently the R5 has to scroll to find out $30 is the number.
- **"Discord PNG export on every tool" is at the end of the subhead** — that's actually one of the strongest differentiators (it's how the tool spreads virally into an alliance's own chat). Buried.
- **No live proof.** The leaderboard callout is 2 sections below the hero — that "N alliances already ranked" number should be visible IN the hero, not after two scrolls.
- **Founding-tier scarcity is invisible.** The $30-instead-of-$50 offer is buried in a red banner deep in the pricing section (line ~929). Should be a fold-1 element.
- **KR treatment is a single line at the bottom.** For the highest-paying audience segment, one bilingual line ("워존 2007 무료") is too little. KR-specific value prop deserves a hero-level line, not a footnote.

---

## 2. Above-the-fold checklist

| Question | Verdict | Notes |
|---|---|---|
| Does H1 answer "what is this?" | Partial | Says "alliance is planning" but doesn't say "r5tools is planning tools." A first-time visitor sees the H1 alone doesn't know what the product is until they read the subhead. |
| Does H1 answer "why should I care?" | Yes | "The winning alliances aren't [planning in a group chat]" implies loss. Emotional. |
| Is the primary CTA above the fold on desktop (1440×900)? | Yes | ~600 px from top-of-page. Safe. |
| Is the primary CTA above the fold on mobile (iPhone 14, 390×844)? | **NO** | The header (60px) + Refer&Earn/Unlock buttons + language toggle + beta banner (~90px) + access-code banner (~120px) + hero badge (~40px) + wrapped 4-line H1 (~200px) + wrapped 6-line subhead (~180px) already exceeds 690px available viewport before the two CTAs render. R5 must scroll to see the primary CTA on any phone. This is the #1 conversion leak. |
| Scroll depth from landing → primary CTA (desktop)? | ~0 px | CTA is visible on load. |
| Scroll depth from landing → primary CTA (mobile 390×844)? | ~250-350 px scroll required | Kills the fold. |
| Is there a value prop the R5 can screenshot & DM to their R4? | Yes | The two-line H1 fits that use case. |

---

## 3. Trust signals

| Signal | Present? | Strength | Fix |
|---|---|---|---|
| "Built by an R5" | Yes | Weak — one line in subhead | Move to its own trust badge below H1: "Built by an active R5. Not a corporation. Not a chatbot." |
| Screenshots of the tools | Yes but not in hero | Weak in hero | `screenshots/` folder has 6 dashboard PNGs (city-capture, coal-burn, freeze-risk, heat-sim, landing-planner, season-timeline). Add a 3-up carousel below the CTAs. |
| GitHub link | **No** | Missing | Add a "Source on GitHub" secondary link (even if only the KB repo is public) — massive trust for the technical R5 audience who's been burned by closed-box Discord bots. |
| Testimonials | **No** | Missing | Placeholder needed: 1–3 R5 quotes with warzone number ("— R5 of Alliance ABC, WZ2007"). Even 1 real quote > 0. |
| Leaderboard proof (live count) | Yes but below fold | Medium | Bubble the "N alliances ranked" number UP into the hero itself. Currently ~2 scrolls down. |
| Founding tier / social proof of urgency | Below fold | Weak | See variant C + founding-scarcity-widget.html. |
| Actually-active Discord/community | **No** | Missing | Hero should show a Discord invite badge with member count. |
| Warzone-specific relevance | Yes | Strong | The warzone selector below the CTAs is a killer touch — makes the site feel personal per visitor. Keep. |

---

## 4. Friction: landing → tool actually working

Counted click paths from `r5tools.io` land → tool doing its job:

| Path | Clicks | Steps |
|---|---|---|
| Free demo (Roster Extractor) via hero secondary CTA | **2 clicks** | Land → click "Try Roster Extractor" → arrives at roster.r5tools.io → click "Extract" (in-app). Good. |
| Access-code redemption (Warzone 2007 member) | **4 clicks** | Land → click "Enter code" in access banner → arrive at access-codes.r5tools.io → paste code → click Redeem → THEN pick a tool → THEN use tool. Too many steps. |
| Full unlock purchase | **3 clicks** | Land → "See pricing" → scroll to pricing → click Stripe link → Stripe checkout → email verify → return to site → pick tool. High friction. |
| Any tool from the "tools" grid | **1 click if unlocked, ~5 if not** | Depends heavily on unlock state. Locked-state UX is a separate audit. |

**Recommendation:** Add a "Warzone 2007? Instant unlock" button in the access-code banner that auto-fills the RONY-FREE code and one-click redeems, dropping that path from 4 → 2 clicks.

---

## 5. KR parity check (`/ko/index.html`)

The current KR page **is not a hero-focused landing** — it's a bare-bones SEO index page. This is a serious gap given KR is stated as the highest-paying audience.

| Element | EN (`/index.html`) | KO (`/ko/index.html`) | Verdict |
|---|---|---|---|
| Hero H1 | Punchy, emotional ("planning in a group chat") | Just "R5TOOLS.IO — 한국어" | **NO PARITY** |
| Subhead value prop | Detailed, 6 tool name-drops | One sentence about the free code | **NO PARITY** |
| Primary CTA | "See pricing →" gold button | None. Only inline text links to each tool | **NO PARITY** |
| Season 2 urgency badge | Yes | **Missing** | Fix |
| Founding-tier scarcity | Yes (below fold) | **Missing** | Fix |
| Leaderboard proof | Yes | **Missing** | Fix |
| Screenshots | No (but implied via tool cards) | No | Tie |
| Access-code banner | Yes | Only inline mention | KO weaker |
| Testimonials placeholder | No | No | Tie |
| Language toggle | Yes (7 langs) | **Missing** — no way back to /en/ except a footer link | Fix |
| Warzone selector | Yes | **Missing** | Fix |
| Discord PNG export mention | Yes | **Missing** | Fix |
| Overall byte-weight | 172 KB | 5.8 KB | KO is drastically under-invested |

**Recommendation:** Port the entire EN hero + banners + why-R5-suite section to KO with translated copy. The current KO page reads like an sitemap dump. Given the KR-first strategy stated in the CLAUDE.md ("The KR alliance market is the primary audience"), KR should get the *first-class* landing, not the vestigial one. **This is the highest-leverage fix on the entire audit.**

---

## 6. Loading time / page weight

| Metric | Value | Cuttable? |
|---|---|---|
| index.html total | ~172 KB | Yes — see below |
| Inline `<style>` block | 11.3 KB | Extract to `/static/landing.css`, gzips + caches across pages. Saves ~9 KB on repeat views. |
| Inline i18n dictionary (7 languages × ~50 keys) | ~60 KB | Extract per-language into `/static/i18n/{lang}.json`, fetch only the active one. Saves ~50 KB for a single-language visitor. |
| Inline SVG diagrams (Season 2 viz block, 7 svgs) | ~35 KB | Move to `/static/s2-viz/*.svg` and `<img>`-load or `<use xlink:href>`. Also enables browser caching. Saves ~30 KB after first page. |
| data-i18n attributes | 137 occurrences | Not worth cutting individually. |
| External scripts | 2 (`lws-countdown.js`, `lws-track.js`) | Already deferred. Fine. |

**Total realistic cut:** ~90 KB (roughly half). Would drop the doc from 172 KB → ~85 KB, and drop repeat-view weight further via cache. **Not urgent** — page is fast enough, but flag for the next perf pass.

**Do NOT actually cut anything yet.** This is a per-project-instruction flag, not a directive. Cutting is a separate refactor because the inline i18n is currently what makes language switching instant with no network round-trip — a valuable UX property that needs deliberate preservation if we extract.

---

## 7. Recommended priority order for fixes

1. **Ship KR parity landing** (`/ko/index.html`) — highest ROI, largest audience gap.
2. **A/B test the 3 hero variants** — install `ab-hero-switcher.js`, share different `?variant=` URLs to different Discord/Reddit/YouTube channels for 2 weeks.
3. **Add live founding counter** to the hero — build the `/api/founding-count` endpoint on access-codes.r5tools.io first.
4. **Add screenshots carousel below hero CTAs** — the 6 PNGs in `/screenshots/` are ready.
5. **Add GitHub link + Discord invite badge** as hero-level trust signals.
6. **Fix mobile fold** — either shorten the H1 for mobile (`@media (max-width: 640px)` H1 override) or make the beta/access banners collapse to icons.
7. **One-click RONY-FREE redemption** — deep-link the access-code banner button to `access-codes.r5tools.io?code=RONY-FREE&auto=1` so Warzone 2007 members redeem in 1 click.
8. **Perf pass** — extract inline CSS/i18n/SVGs after everything else stabilizes.

---

## Files produced by this audit

| File | Purpose |
|---|---|
| `hero-variant-a.html` | Problem-first hero (drop-in replacement block) |
| `hero-variant-b.html` | Specific-number hero |
| `hero-variant-c.html` | Social-proof + scarcity hero |
| `ab-hero-switcher.js` | URL/cookie-driven A/B/C switcher with analytics |
| `founding-scarcity-widget.html` | Live counter for Founding tier claims (dep: server endpoint) |
| `conversion-audit.md` | This document |
