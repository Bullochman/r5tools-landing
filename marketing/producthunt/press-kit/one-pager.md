# r5tools.io — One-Page Briefing

> Print this or export to PDF via `pandoc one-pager.md -o one-pager.pdf --pdf-engine=xelatex` for a leave-behind at meetings / hunter DMs.

---

## What it is

**r5tools.io** is an 11-tool alliance planning suite for the mobile strategy game **Last War: Survival** (~100M downloads globally, top-10 grossing mobile strategy title). Built for **R5s** — the top-rank leader of a 100-player in-game alliance — and their officer teams.

## Why it exists

Last War: Survival's competitive mode runs 8-week seasons where 100-player alliances fight over territory, resource nodes, and structures called "Warzones." A single bad landing plan on Day 1 (which physical tiles each of the 100 members lands on) can cost the alliance the season. Most R5s coordinate this in a Google Sheet, a Discord pin, or a group chat. Across a 6- to 12-language alliance (common in the Korean/Asian warzones), the group chat approach breaks down.

r5tools.io replaces the group chat with real planning software.

## The 11 tools

| Tool | What it does |
|---|---|
| **Roster Extractor** | R5 records a 90-second phone video of the in-game member list scrolling. Claude Sonnet 4.6 vision extracts all 100 rows to CSV in 2 minutes. Second-pass audit verifies power/HQ/rank. |
| **Season 2 Landing Planner** | Assigns every member a Day-1 landing tile by rank tier, factoring HQ level, rally-leader placement, and Alliance Furnace warm-zone coverage. |
| **Hive Grid Manager** | 3×3 Marshall's Guard and 21×21 Military Stronghold formation planner. Drag-and-drop, corner-anchored ring algorithm, PNG export for Discord. |
| **Heat Simulator** | Overlays the 7 concentric temperature bands (-15 → -80 °C) on alliance territory. Blizzard mode for Weeks 3-4 planning. |
| **Freeze Risk Dashboard** | Live per-member risk board: "Frozen in 3 min", "Furnace deploy needed", "Coal below 12h". The R5's Season 2 daily driver. |
| **Coal Burn Calculator** | Per-member coal budget for the Week-4 -70 °C blizzard, factoring Alliance Furnace + Home Heating Furnace overdrive stacking. |
| **City Capture Scheduler** | Which of the 6 cities + 4 dig-sites to prioritize, factoring the +5 → +60 °C bonus curve and the 36-hour post-capture protection window. |
| **Season Timeline** | T-minus countdown + alliance-wide prep checklist, iCal export. |
| **VS Days Tracker** | The 6-day Alliance Duel scoring calculator + "today is X, do this" banner. |
| **Profile Studio** | In-browser Discord avatar generator with rank badge + season frost. |
| **KB Chat** | 9,700-line LWS knowledge base as a chatbot (multi-season, S1-S7). |

## Distinctions

- **Korean-first design.** Every string on the site was written for Korean R5s first, translated to English second. Every other LWS tool is EN-first with KR bolted on.
- **7 languages.** KR / EN / ES / PT / JA / DE / FR — one toggle, per-language SEO-indexed pages.
- **1,396 SEO reference pages.** The tools double as a wiki: 706 English + 690 Korean pages covering every hero, building, event, and guide.
- **Real free tier.** Warzone 2007 alliances use code `RONY-FREE` and get the entire suite. No card, no email, no gated features.
- **Solo build.** One maker (Evan Jones, R5). No studio, no VC. Ships new features hourly during peak weeks.

## Pricing

| Tier | Price | Includes |
|---|---|---|
| **Free — Warzone 2007** | $0 | Full suite. Code `RONY-FREE`. |
| **Personal** | $10 one-time | Full suite for one player, 90-day device cookie. |
| **Alliance Bundle** | $50 one-time | Full suite for the whole alliance. R5 shares the code with all 100 members. |
| **Roster Extractor Premium** | +$5 | Second-pass Claude audit for guaranteed 94/94 roster accuracy. |

Payments via Stripe. No subscriptions.

## Numbers (verified 2026-07-17)

- **11 tools live**
- **7 languages supported**
- **1,396 SEO reference pages** indexed
- **~100 players / alliance** — the design constant
- **~2 min** — end-to-end time for the Roster Extractor pipeline (video → CSV)
- **94/94** — Roster Extractor Premium accuracy target (guaranteed)

## Founder

**Evan Jones** · Solo developer · R5 of RONY / TINO in Warzone 2007. Full-time software developer by day; r5tools.io is a nights-and-weekends project.

- Email: **evanjones@mdr.net**
- Discord: **[EVAN-DISCORD]** *(fill in before external distribution)*
- Web: **https://r5tools.io**

## The story in 3 sentences

Evan lost a Season 2 LWS campaign because his 100-player alliance was coordinating landing coordinates through an auto-translated Google Sheet. He spent 3 months building r5tools.io — starting with a Claude-vision pipeline that turns a 90-second phone video of the in-game roster into a clean CSV, and adding one tool per week from there. It's now the planning stack his own alliance uses, and it's free for his warzone because those are his neighbors.

## Editorial contact

Available for interviews, product demos, and pipeline walkthroughs. Reply to `evanjones@mdr.net` or DM on Discord. Fastest response on Discord.
