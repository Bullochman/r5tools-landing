# Core Web Vitals — sanity check & prioritized fixes

**Date:** 2026-07-17
**Scope:** r5tools-landing/ EN pages. KR pages inherit the same page shells so most findings apply to both — but KR-agent handles their layer.
**Method:** Static-analysis probe (`scripts/seo/cwv_probe.py`-equivalent one-off) + hand-inspection. No live Lighthouse run yet — do that in Chrome DevTools once robots.txt + sitemap changes are deployed and cache-flushed.

**Do NOT auto-fix.** All items below are flagged for Evan.

---

## Page-weight sample

| Page | HTML KB | Under 100 KB? | Imgs | Lazy-loaded imgs |
|---|---:|:---:|---:|---:|
| index.html | 174.7 | NO — inline CSS + inline copy | 0 | 0 |
| refer.html | 31.7 | yes | 0 | 0 |
| cheat-sheet.html | 22.3 | yes | 0 | 0 |
| leaderboard.html | 21.5 | yes | 0 | 0 |
| guides/how-to-plan-season-2-landing.html | 26.8 | yes | 0 | 0 |
| guides/coordinates-for-season-2-landing.html | 23.8 | yes | 0 | 0 |
| guides/alliance-furnace-guide.html | 26.8 | yes | 0 | 0 |
| heroes/adam.html | 30.1 | yes | 0 | 0 |
| events/arms-race.html | 20.9 | yes | 0 | 0 |
| glossary/1st.html | 12.2 | yes | 0 | 0 |

**Verdict on the "top 5 SEO pages under 100 KB HTML" ask:** 9 of 10 sampled pages are under 100 KB. Only `index.html` (174.7 KB) exceeds. That is our LCP problem.

## LCP (Largest Contentful Paint)

### index.html — 174.7 KB HTML dominated by inline CSS + copy

- The hero renders via CSS gradient + text — no `<img>` in the LCP element, so image lazy-loading is a non-issue here. The LCP element is likely the `<h1>` inside `.hero`.
- What is heavy: ~175 KB of HTML shipped in a single response, most of which is not needed above the fold. Pricing block, roadmap section, quotes, tool grid all load before First Contentful Paint completes.
- **Fix candidate (est. LCP -400 to -800 ms on mobile 4G):** move the `<style>` block into an external `home.css` file served with `Cache-Control: public, max-age=86400, immutable` and version-suffixed. Browser can start layout before the CSS finishes parsing; second visit gets it from disk cache.
- **Fix candidate (est. LCP -200 ms):** convert the 6 `.tool-thumb` background-image PNGs (60-92 KB each in `screenshots/`) to WebP. Total combined weight ~458 KB → ~180 KB. They're referenced via CSS `background-image` so lazy is trickier; wrap the tools grid in `content-visibility: auto` to defer offscreen paint.
- **Fix candidate (est. LCP negligible, INP -50 ms):** the founding-widget script (`/founding-widget.js`) is loaded `defer` — good. The Plausible + GA4 inline bootstraps are also non-blocking. No action needed on scripts.

### Guide pages — 20-30 KB HTML

- LCP is the `<h1>` (text). No hero image. Current TTFB drives LCP. If Vercel/Cloudflare cache hits, LCP is comfortably under 1.5 s.
- Above-the-fold `<nav class="suite-nav">` has 8 anchor tags → all render synchronously. No issue.
- **Non-issue confirmed:** hero image lazy-loading — there are no `<img>` tags on any sampled SEO page. Every visual is either an inline SVG favicon or a CSS background-image on later panels.

## CLS (Cumulative Layout Shift)

- `<script src="/analytics.js" defer>` — GOOD (deferred, no layout impact).
- `<script src="/founding-widget.js" defer>` — GOOD (deferred, but see below).
- The founding-widget renders a fixed-position pill in the bottom-right corner (`position:fixed`), so it does NOT push existing content. **CLS contribution: 0.**
- The `<script src="https://chat.r5tools.io/widget.js" defer>` on `index.html` — third-party. If the widget renders an on-page floater with a size we haven't reserved, it can cause CLS on first paint. **Recommend:** verify chat widget uses `position:fixed`. If it doesn't, reserve a 60x60 slot with `min-height` on its container.
- Google Fonts / Noto Sans KR — currently only in the CSS `font-family` fallback stack. Not loaded from a CDN. **Zero font-swap CLS risk.**
- No `<img>` without dimensions. No dynamically-injected banners.

**Overall CLS assessment:** very low. Best-in-class configuration.

## INP (Interaction to Next Paint)

Sampled interactions on `refer.html` and `unlock.html`:

- Copy referral code button — synchronous `navigator.clipboard.writeText()` + a class toggle. Fast (<50 ms).
- Language toggle on `index.html` — pure `<select>` + `location.assign`. No blocking JS.
- Waitlist form submit — POSTs to `/api/waitlist`. No spinner state during network I/O. **Recommend:** add optimistic UI state (button disable + "Saving…" label) inside 100 ms of click to keep INP under 200 ms perceived.

**Verdict:** INP is not the site's problem. Analytics + founding-widget are both `defer` and don't touch the main thread on hover/click paths.

## Top 5 CWV fixes — ranked by estimated impact

| # | Fix | Page(s) | Est. impact | Effort |
|---:|---|---|---|---|
| 1 | Extract `index.html` inline CSS to `home.css` with immutable cache headers | index.html | LCP -400 to -800 ms mobile, -200 ms desktop | 1 hr |
| 2 | Convert 6 tool-thumb PNGs (screenshots/*.png, 60-92 KB each) to WebP + serve `<picture>` fallback (need to refactor from CSS `background-image` to `<img>` first) | index.html | LCP -200 ms, transfer -280 KB | 2 hr |
| 3 | Wrap `.tools-grid` (below-fold) in `content-visibility: auto` + `contain-intrinsic-size: 400px` | index.html | LCP -100 ms, INP -30 ms | 15 min |
| 4 | Verify chat.r5tools.io widget uses `position:fixed` (not layout-affecting) — reserve slot if not | index.html | CLS -0.02 to -0.10 if currently affecting layout | 30 min |
| 5 | Add optimistic UI to waitlist + refer copy buttons (`aria-busy`, disable, 100 ms label update) | refer.html, unlock.html, waitlist.html | INP -100 ms perceived | 30 min |

## Not fixing (out of scope / low ROI)

- Font subsetting — we don't self-host fonts.
- Compression — Vercel auto-brotli. No action.
- HTTP/2 push / preload hints for CSS — CSS is inline (which is why #1 is the biggest win).
- Third-party script blocking — Plausible + GA4 are `defer`. No render blocking.

## Manual validation workflow (post-deploy)

1. Open Chrome DevTools → Lighthouse → mobile, throttled 4G, one run per key page:
   - `https://r5tools.io/`
   - `https://r5tools.io/refer.html`
   - `https://r5tools.io/guides/how-to-plan-season-2-landing.html`
   - `https://r5tools.io/glossary/tank.html`
   - `https://r5tools.io/warzones/warzone-1064.html`
2. Note LCP, CLS, INP, and total transfer. Log in a follow-up section here.
3. If any page misses the "Good" thresholds (LCP<2.5 s, CLS<0.1, INP<200 ms), file a fix ticket referencing the row above.

---

**Owner:** Evan (fixes are user-authored, per project rules — this doc is the queue, not the changelog).
