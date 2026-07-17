---
title: "Launching r5tools — why we stopped running our alliance on a Google Sheet"
date: 2026-07-17
lang: en
slug: launching-r5tools
author: "Evan @ r5tools"
description: "Our WZ 2007 alliance was burning 3-4 hours per season on landing coordination inside a Google Sheet. So I built the whole planning suite in a month. Here's what shipped."
seo_keywords:
  - "r5tools"
  - "last war alliance tools"
  - "lws season 2 tools"
  - "r5 planning suite"
tags:
  - founding-story
  - alliance-strategy
  - tool-walkthrough
hero_cta: unlock
---

Our alliance officers spent the first three days of Season 2 in a shared Google Sheet.

Landing coordinates in column B. Coal reserves in column D. A "who has an active High-Heat Furnace at L20 or above" tab that Nikki manually updated every time somebody dinged. Five formatting styles because three of us kept re-doing the conditional formatting on top of each other. A `#coordination` Discord channel that scrolled faster than anyone could read.

At the end of week one I sat down and added up the officer-hours. Just landing planning — deciding who parks where relative to the Alliance Furnace, who's in Warlord Missile blast range, who anchors the outer ring. **11 hours of R4/R5 time across four officers**, most of it re-doing math because someone had updated their gear or someone new had joined.

Eleven hours. For one map transition. In one week.

That's when r5tools started.

## What r5tools is

A suite of small, focused planners for *Last War: Survival* alliances. Each tool does one thing well and shares zero state with the others — you can use just the Landing Planner and ignore everything else, or run the whole stack. Nothing is a "platform." Everything is a tool.

The current suite:

| Tool | What it replaces | Time saved per season |
|------|-----------------|-----------------------|
| **Roster Extractor** | Manually typing 50 alliance members into a Google Sheet | 2-3 hours |
| **Landing Planner** | The "who parks where" coordinate sheet | 3-4 hours |
| **Heat Simulator** | Guessing which stacks freeze in a blizzard | 1-2 hours |
| **Freeze-Risk Dashboard** | Watching Discord after every blizzard for "who died" reports | 1 hour |
| **Coal Burn Calculator** | The overdrive-window guesswork that decides your week-3 reserves | 2 hours |
| **Hive Planner** | The graph-paper drawing of hive formations | 1 hour |
| **City Capture Planner** | The Excel-tab tracking captured-vs-defensible cities | 1 hour |
| **Season Timeline** | The pinned Discord message that goes out of date week 2 | ongoing |

The math on my alliance alone: **10-14 officer-hours saved per season** just from the tools I'd built before day one of S2. The rest of the season I kept building because every gap I found was a gap another alliance was going to hit too.

## The rule I set for every tool

**No tool ships until it saves an officer at least 30 minutes on its first use.**

That's why some things that "should" be in the suite aren't. There's no in-game overlay. No auto-attack scripts. No coordination-bot that DMs your officers. Those are all interesting problems, but none of them save an R5 30 minutes the first time they touch them.

Instead every tool starts from the specific manual thing you were doing yesterday, and cuts it to the smallest number of clicks I can defend.

The Roster Extractor is the clearest example. Everyone knows the problem: your alliance list lives in-game, there's no export, there's no API, and you need it in a spreadsheet to plan anything. Every alliance solves this by typing. **Screen-record the list on your phone, drop the video in, get a clean CSV in 90 seconds.** That's the whole tool. It does nothing else. It never will.

The Coal Burn Calculator is another one. Sites publish coal-per-minute numbers. Nobody publishes the *reserve* you need to survive a specific blizzard schedule given your specific Alliance Furnace level and overdrive discipline. That's the calculation R5s actually need. So that's what the tool does. The math lives in the [coal budget calculator guide](/guides/coal-budget-calculator-guide.html); the tool just applies it to your inputs.

## What this blog is

Same rule as the tools: nothing gets published unless it saves an R5 time or wins them a fight.

You will see:

- **Weekly meta reads.** What actually changed in the current season week. Which mechanics are newly load-bearing. Where alliances are getting caught.
- **Event breakdowns.** VS Days, Rare Soil War, Blood Night, hero drops — the scoring math and the actual decisions that move the leaderboard.
- **Composite case studies.** How three-to-five alliances handled the same problem, anonymized, with numbers.
- **Tool walkthroughs.** Screen-recording an R5 using the tools in-context, not a marketing "features" list.

You will not see:

- "10 tips for R5 leaders" listicles.
- Screenshots that dox real players.
- Anything sourced from vibes.

Every claim in every post traces back to either the [LWS Knowledge Base](/glossary/) (which is a versioned, sourced reference we keep in the repo) or a specific observable event the author witnessed and can name. If we can't source it, we don't publish it.

## Founding pricing — why it exists and how long

The tools are free to use with a Warzone 2007 unlock code (which is public in our Discord). For everyone else, the pricing is:

- **$10 lifetime** for an individual R5 who wants everything.
- **$50 alliance bundle** for R5s who want to unlock the whole officer group at once.

The first **100 alliances** to unlock get "Founding" pricing — the same as launch pricing, but locked in for the life of the account. The floating badge on the corner of every page shows the count. It ticks down in real time.

Why 100? Because that's roughly how many R5s I can personally reply to in Discord if something breaks. Once the founding tier fills, the price and the support model both level up, and the badge switches to a waitlist.

## What's next

The immediate roadmap, in order of ship date:

1. **Season 2 week-2 audit.** A post on what actually happened week one of S2 across the alliances I can see — what worked, what got destroyed, what everyone underestimated.
2. **Warlord Missile deep-dive.** The math for intercepting a missile in the 3-minute prep window versus absorbing it. Nobody has published this well.
3. **Hero drop template.** When the next hero drops, a 24-hour turnaround post on the day-1 build, gear priorities, and shred value.

Every post ends up here, in the RSS feed, and in the weekly digest that goes out Sundays 10 AM Central to anyone on the newsletter.

## What I'm asking

**Try one tool.** Even just the Roster Extractor. If it saves you the 90 seconds it promises, come back for the Landing Planner. If it doesn't, tell me why in Discord — I can only fix what I know about.

And if you're an R5 who runs a spreadsheet-heavy alliance, join the newsletter below. That's where I'll post the weekly meta reads and any new tools I ship. One email per week, one click to unsubscribe, never a marketing blast.

Good hunting.

Evan
R5 · RONY · WZ 2007

---

## Sources

- [Coal budget calculator guide](/guides/coal-budget-calculator-guide.html) — coal-per-minute and reserve math.
- [Alliance furnace guide](/guides/alliance-furnace-guide.html) — L20 output and coal consumption.
- [Roster Extractor](https://roster.r5tools.io/) · [Landing Planner](https://bullochman.github.io/lws-landing-planner-static/) · [Heat Simulator](https://bullochman.github.io/lws-heat-simulator-static/) · [Freeze-Risk Dashboard](https://bullochman.github.io/lws-freeze-risk-static/) · [Coal Burn Calculator](https://bullochman.github.io/lws-coal-burn-static/) · [Hive Planner](https://hive.r5tools.io/) · [City Capture Planner](https://bullochman.github.io/lws-city-capture-static/) · [Season Timeline](https://bullochman.github.io/lws-season-timeline-static/).
