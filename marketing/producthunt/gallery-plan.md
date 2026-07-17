# ProductHunt Gallery Plan

**Requirement:** PH allows up to 8 gallery images; 5 is the sweet spot. First image is the hero (shows as the card preview on the feed). Minimum 1270×760, recommended 1600×900 or larger. PNG or JPG, under 3MB each.

**Source assets already on disk:**

- `../../../screenshots/seo-verify/01-homepage.png` (154 KB) — full-page rendered homepage
- `../../../screenshots/seo-verify/02-hero-scarlett.png` (253 KB) — hero detail page (Scarlett)
- `../../../screenshots/seo-verify/03-building-headquarters.png` (175 KB) — building detail (HQ)
- `../../../screenshots/seo-verify/04-warzone-1050.png` (202 KB) — warzone page (1050)
- `../../../screenshots/seo-verify/05-guide-vip-roi.png` (278 KB) — guide page (VIP ROI)
- `../../../screenshots/city-capture.png` (92 KB) — City Capture tool
- `../../../screenshots/coal-burn.png` (80 KB) — Coal Burn calculator
- `../../../screenshots/freeze-risk.png` (60 KB) — Freeze Risk dashboard
- `../../../screenshots/heat-simulator.png` (83 KB) — Heat Simulator
- `../../../screenshots/landing-planner.png` (85 KB) — Landing Planner
- `../../../screenshots/season-timeline.png` (59 KB) — Season Timeline

All 11 screenshots exist. Before upload, verify dimensions with `sips -g pixelWidth -g pixelHeight <file>` — anything under 1270 wide needs re-rendering at 2x.

---

## Image 1 — HERO (feed card preview)

**Purpose:** stop the scroll on PH's homepage feed. This is the *only* image most visitors see. It has to communicate "planning tools for a mobile game, made by a player" in under 2 seconds.

**Composition:**
- **Left 60%:** the r5tools.io homepage hero (crop from `01-homepage.png`) — the "Your alliance is planning Season 2 in a group chat. The winning alliances aren't." headline is doing the heavy lifting; keep it big and readable.
- **Right 40%:** a floating stack of 3 tool thumbnails at slight angles (Landing Planner + Freeze Risk + Coal Burn from the `screenshots/` dir), overlapping like a shuffled deck of cards.
- **Bottom-left corner:** small "Built by an R5, RONY / TINO, WZ 2007" tag, gold on dark.
- **No PH branding.** No "Launching on ProductHunt" watermark — those look desperate and PH doesn't require it.

**Dimensions:** 1600×900 (16:9) — safe across every PH placement.

**How to build it:** open Figma or Sketch → new 1600×900 frame → drop `01-homepage.png` on the left half, mask to fit → drop 3 tool PNGs stacked on the right at 8°/-6°/4° rotations → gold tag bottom-left → export PNG 2x.

**Filename:** `01-hero-1600x900.png`

**If we skip Figma:** use `01-homepage.png` alone, letterboxed to 1600×900 with the dark navy background color (#0a0e1a from the site). Not as strong but ships today.

---

## Image 2 — Roster Extractor (the hook tool)

**Purpose:** the Roster Extractor is the single most talked-about feature (video → 100-player CSV in 2 min via Claude vision). If any tool converts a PH visitor to a signup, it's this one.

**Composition:**
- **Top half:** a two-panel before/after. LEFT: iPhone screenshot mockup of the in-game roster (scrolling members list — pull from any LWS gameplay screenshot online, or record one). RIGHT: the resulting CSV in a spreadsheet view.
- **Between them:** a big gold arrow with "90 sec video → 2 min processing → CSV of 100 players" as the caption.
- **Bottom:** a strip showing the actual Roster Extractor UI (need to capture — `roster.r5tools.io`).

**Dimensions:** 1600×900.

**Source screenshot needed:** capture `roster.r5tools.io` in a fresh Chrome window at 1600×900 viewport, upload sample video, screenshot mid-processing and post-completion states. Save as `roster-extractor-ui.png` in `screenshots/`.

**Filename:** `02-roster-extractor-1600x900.png`

---

## Image 3 — Landing Planner + Hive Grid (the "planning" tools)

**Purpose:** show the visual, spatial nature of the tools. LWS players understand landing coords and hive formations instantly; PH readers who don't play the game will still recognize "grid-based planning software" and get it.

**Composition:**
- **Left half:** `landing-planner.png` (already on disk) — the Season 2 landing tile assignment with the Alliance Furnace centered and rings around it.
- **Right half:** a Hive Grid Manager screenshot (need to capture from `hive.r5tools.io`) showing a 21×21 Military Stronghold formation with rank-tier auto-placement.
- **Top caption strip:** "Landing Planner + Hive Grid Manager — the two tools your R5 pulls up on Day 1."

**Dimensions:** 1600×900.

**Source screenshot needed:** capture `hive.r5tools.io` — load the demo grid, take screenshot at 1600×900. Save as `hive-grid-ui.png` in `screenshots/`.

**Filename:** `03-planners-1600x900.png`

---

## Image 4 — Freeze Risk + Coal Burn (the "in-season daily driver" tools)

**Purpose:** show the operational side. These tools get opened *during* the season, not before it. PH readers who scroll past the "planning" image might stop on the "live dashboard" image.

**Composition:**
- **Left half:** `freeze-risk.png` — the per-member risk board with "Frozen in 3 min" / "Furnace deploy needed" / "Coal below 12h" statuses in red/yellow/green.
- **Right half:** `coal-burn.png` — the per-member coal budget grid.
- **Bottom caption:** "Freeze Risk Dashboard + Coal Burn Calculator — what your R5 refreshes every 30 min during Weeks 3-4."

**Dimensions:** 1600×900.

**Source screenshots:** already on disk (`freeze-risk.png`, `coal-burn.png`).

**Filename:** `04-live-tools-1600x900.png`

---

## Image 5 — Pricing / CTA card

**Purpose:** the closer. Anyone who scrolls to image 5 is warm; hit them with pricing clarity + the free-code hook + a single next action.

**Composition:**
- **Three-column pricing card** matching the homepage's actual pricing layout:
  - **FREE — WARZONE 2007** · $0 · "Ask your R5 for the code" · code `RONY-FREE`
  - **PERSONAL** · $10 one-time · "Any alliance, any warzone"
  - **ALLIANCE BUNDLE** · $50 one-time · "R5 buys once, whole alliance forever"
- **Top of card:** "Try it free at r5tools.io — no login for the free tier"
- **Bottom-right:** small QR code linking to `https://r5tools.io/?utm_source=producthunt&utm_medium=gallery&utm_campaign=launch` (for the small percentage of PH viewers on desktop who'd scan from their phone — makes signup one tap).
- **Bottom-left:** "Built solo. No studio, no VC, no ads. — Evan, R5"

**Dimensions:** 1600×900.

**How to build it:** clone the pricing section from `index.html` in a browser, take a full-height screenshot of just that section, letterbox to 1600×900 with the site's dark navy. Overlay QR (generate at `qr-code-generator.com`) in the bottom-right corner. Add the "Built solo" tag.

**Filename:** `05-pricing-cta-1600x900.png`

---

## Optional bonus images (6-8) — only if you have time

- **Image 6 — SEO reach:** screenshot of one of the 1,396 SEO pages (use `02-hero-scarlett.png` or `05-guide-vip-roi.png`) with an overlay "706 English + 690 Korean reference pages — the tools double as a wiki."
- **Image 7 — Language toggle:** side-by-side of the homepage in EN and KR to prove the KR-first claim.
- **Image 8 — Discord export sample:** screenshot of one of the tools' PNG exports rendered in a mock Discord channel, showing that R5s can share planning outputs one-click into their alliance chat.

---

## Upload checklist

1. All 5 images exported to this folder (`marketing/producthunt/gallery/`) at 1600×900 minimum.
2. File sizes under 3 MB each — if any exceeds, run through `pngquant` or export as JPG at Q90.
3. Filenames prefixed 01- through 05- so PH's upload UI preserves order.
4. Preview each image at 400px width (the feed-card size) — if text is unreadable at that scale, redesign larger.
5. **Test the hero on mobile.** Open PH on your phone, imagine your image where the current #1 product's card is. If it doesn't feel like it stops the thumb-scroll, iterate.

---

## Screenshots that still need to be captured (T-6h checklist)

Two shots aren't on disk yet:
- `hive.r5tools.io` (for Image 3) — Hive Grid Manager UI at 1600×900 viewport
- `roster.r5tools.io` post-processing state (for Image 2) — CSV output view

Capture both with Chrome DevTools Device Toolbar set to 1600×900, save into `../../../screenshots/` as `hive-grid-ui.png` and `roster-extractor-ui.png`. Both take under 5 minutes total.
