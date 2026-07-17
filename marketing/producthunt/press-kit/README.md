# r5tools.io Press Kit

Everything a journalist, blogger, PH hunter, YouTuber, or newsletter writer needs to cover r5tools.io in a single folder. Copy the whole folder or link individual assets — everything here is licensed for editorial use.

**Owner contact:** Evan Jones · **evanjones@mdr.net** · Discord: **[EVAN-DISCORD]** *(replace with your handle: e.g. `evanjonesr5#1234` — do NOT publish before filling this in)*

---

## What's in this folder

| File | Purpose |
|---|---|
| `logo-square.svg` | 512×512 square lockup with R5 badge over concentric rings + wordmark. For app tile / avatar placements. |
| `logo-horizontal.svg` | 900×220 horizontal lockup with badge on left, "R5TOOLS.IO" wordmark + tagline. For article headers, banner placements. |
| `01-homepage.png` | Full-page homepage screenshot (1554×982, 154 KB). The canonical hero image if only one is needed. |
| `landing-planner.png` | Season 2 Landing Planner tool screenshot. Best single-tool visual for illustrating "what the product does." |
| `freeze-risk.png` | Freeze Risk Dashboard tool screenshot. Best for "live in-season" angle. |
| `bio.md` | Short + long author bio + one-line product description. |
| `one-pager.md` | Complete product briefing sheet — print/export to PDF as needed. |
| `README.md` | This file. |

---

## SVG logo rendering notes

Both SVGs use the site's canonical brand colors:
- Background navy: `#0a0e1a`
- Accent gold: `#c9a961`
- Text bright: `#e8ebf3`
- Text muted: `#8892a6`

Fonts fall back through the Apple/Microsoft system-font stack; SVG renders identically on macOS, iOS, Windows, and modern Linux. **Do not** rasterize to PNG for editorial use — the SVG is sharper on retina displays and PH's OG image renderer handles SVG cleanly.

If you need PNG versions:
```bash
# From this folder
brew install librsvg  # if not installed
rsvg-convert -w 1024 logo-square.svg -o logo-square-1024.png
rsvg-convert -w 1200 logo-horizontal.svg -o logo-horizontal-1200.png
```

---

## Higher-resolution screenshots

The 3 screenshots in this folder are 700-1600 px wide — fine for web/social. For print or 4K editorial, source the originals:

- `~/claudecode/r5tools/r5tools-landing/screenshots/` — 6 tool screenshots at native resolution
- `~/claudecode/r5tools/r5tools-landing/screenshots/seo-verify/` — 5 SEO-page + homepage screenshots at full-page height

All screenshots are cleared for editorial use — no PII, no other users' data.

---

## One-line summaries (pick the one that fits your headline space)

- **Ultra-short (30 chars):** LWS alliance planning tools
- **Short (60 chars):** r5tools.io — alliance suite for Last War: Survival, by an R5
- **Medium (140 chars):** Solo-built suite of 11 planning tools for Last War: Survival alliances. Video-to-roster in 2 min, freeze-risk board, landing planner.
- **Long (260 chars):** r5tools.io is an 11-tool suite for planning Last War: Survival alliance seasons, built solo by an R5 in a Korean-dominant warzone. Includes Claude-vision roster extraction, Season 2 landing planner, freeze-risk dashboard, coal budget calculator, hive formation planner. Free tier for Warzone 2007.

---

## Product facts (drop directly into an article — all verified as of 2026-07-17)

- **Launched:** April 2026 (private beta), July 2026 (public + PH launch)
- **Maker:** Evan Jones · solo · R5 in RONY / TINO alliance · Warzone 2007
- **Tool count:** 11 tools (Roster Extractor, Season 2 Landing Planner, Hive Grid Manager, Heat Simulator, Freeze Risk Dashboard, Coal Burn Calculator, City Capture Scheduler, Season Timeline, VS Days Tracker, Profile Studio, KB Chat)
- **Languages:** 7 (Korean, English, Spanish, Portuguese, Japanese, German, French)
- **SEO pages:** 1,396 total (706 English + 690 Korean) — the tools double as a wiki
- **Pricing:** Free for Warzone 2007 (code `RONY-FREE`); $10 personal one-time (any warzone); $50 alliance bundle one-time (shared by all members)
- **Tech stack:** Static site + subdomain tools · Claude Sonnet 4.6 vision (Roster Extractor) · ffmpeg for frame extraction · Stripe for payments
- **Distinction:** the only LWS toolkit designed KR-first — every other tool in the category is EN-first with translation slapped on

---

## Do NOT

- Publish the Discord handle `[EVAN-DISCORD]` verbatim — replace with the real handle first.
- Modify the logo colors or the concentric-ring composition (it echoes the game's thermal map — semantically load-bearing).
- Show the `RONY-FREE` code alongside a claim like "unlimited free access for everyone" — the code is warzone-specific and misrepresenting it kills the value.
- Refer to r5tools.io as "AI-powered" or "revolutionary" — the maker asks that this kind of language stay out of coverage; R5s see through it and it hurts the pitch.
