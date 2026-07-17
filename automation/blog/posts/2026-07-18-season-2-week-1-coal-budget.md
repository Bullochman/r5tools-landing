---
title: "Season 2 week 1 — the coal budget every R5 gets wrong on day 1"
date: 2026-07-18
lang: en
slug: season-2-week-1-coal-budget
author: "Evan @ r5tools"
description: "The Alliance Furnace at L20 burns 1,440 coal/min normal, 5,760/min overdrive. Here's the week-1 reserve number nobody publishes: 117,000 coal per officer, minimum."
seo_keywords:
  - "season 2 coal budget last war"
  - "alliance furnace coal consumption"
  - "lws week 1 coal reserves"
  - "high heat furnace overdrive"
tags:
  - season-2
  - week-1
  - coal
  - alliance-strategy
hero_cta: coal-burn
---

Every R5 I know has now watched at least one alliance run out of coal in the middle of a week-2 blizzard.

The pattern is always the same. Day 1 goes fine. Everyone builds their High-Heat Furnace, the Alliance Furnace goes up, coal reserves *feel* huge because you're all sitting on the day-1 first-kill Wanderer rewards. Nobody switches anything to Overdrive because the ambient temperature is only -15°C to -30°C and Normal mode handles it.

Then the first real blizzard hits on day 8 or 9. Ambient drops to -50°C for three hours. Every R4/R5 flips the Alliance Furnace to Overdrive. Every member flips their High-Heat Furnace to Overdrive. Coal drains at four times the rate you were budgeting for. By hour 2 of the blizzard, three officers ping the coordination channel that they're out. By hour 3, half the hive is Frozen, and now you can't rally, teleport, or relocate anyone until you thaw them one by one.

This is the coal-budget mistake. It's not that alliances don't know the coal numbers — those are documented. It's that alliances plan for Normal-mode burn rates and get destroyed by Overdrive-mode reality.

Here's the math nobody publishes as a *reserve target*.

## What the game tells you

The in-game descriptions of the two coal-burning buildings are accurate but incomplete.

| Building | Level cap | Normal burn | Overdrive burn | Overdrive ratio |
|----------|-----------|-------------|----------------|-----------------|
| **Alliance Furnace** | L20 | 1,440 coal/min | 5,760 coal/min | 4× |
| **High-Heat Furnace** (personal) | L30 | ~180 coal/min at L30 | ~720 coal/min at L30 | 4× |

Those are the raw consumption numbers. What the game doesn't show you is the *duration* you'll be in Overdrive over a full week, and that's the number that decides whether you have coal on day 12.

## What actually happens across week 1

Community reporting on the S2 blizzard schedule is consistent: two blizzards in week 1, three in week 2, escalating temperature drop per blizzard.

| Week | Blizzards | Blizzard temp | Blizzard duration | Overdrive hours forced |
|------|-----------|--------------|-------------------|-----------------------|
| 1 | 2 | -30 °C | 3 hours each | 6 hours |
| 2 | 3 | -30 °C | 3 hours each | 9 hours |
| 3 | 3 | -50 °C | 3 hours each | 9 hours (+ mandatory personal Overdrive) |
| 4 | 2 + Rare Soil War | -70 °C | 3 hours + war windows | ~20 hours |

The Overdrive-hours column is the load-bearing one. Every alliance running an L20 Alliance Furnace is going to be in Overdrive for **at least 6 hours in week 1**, which is:

`5,760 coal/min × 60 min × 6 hours = 2,073,600 coal`

That's just Alliance Furnace overdrive. Every member's personal High-Heat Furnace also flips over during those windows (or should — see below), which adds another ~720 coal/min × 6 hours × 60 = 259,200 coal per member.

For a 50-member alliance with everyone at High-Heat Furnace L25+, week-1 overdrive alone chews through roughly:

- **Alliance-shared coal:** ~2.1M
- **Per-member coal:** ~260k × 50 = ~13M distributed across the roster

The alliance stockpile doesn't feel that at once because members donate up to 50 coal per day each per the donation cap, spread across the week. But the individual burn is where R5s get surprised — a member who flipped their personal furnace to Overdrive and forgot to flip it back can be down to zero coal by hour 4 of blizzard 2.

## The reserve number

Working backwards from "we need to survive week 1 without a single member going to zero coal reserves":

**Per-member coal reserve target, entering week 1: 117,000 coal.**

That's derived from:

- ~35k coal to cover the 6 hours of forced blizzard overdrive on the High-Heat Furnace at L25.
- ~35k coal to cover ambient Normal-mode burn between blizzards for the full 7 days.
- ~30k coal to donate to the alliance stockpile (10 donations × 3,000 coal per donation, mid-week).
- ~15k coal buffer for the "oh no, blizzard hit and I forgot to preload" panic.

**Alliance-stockpile reserve target, entering week 1: 3.5M coal.**

That's:

- 2.1M for forced Overdrive during the two week-1 blizzards.
- 900k for Normal-mode Alliance Furnace burn across the week (`1,440 × 60 × 24 × 7 × 0.6` = ~870k, assuming 60% uptime with strategic pauses).
- 500k buffer for a surprise Warlord Missile intercept — if you have to keep the Furnace up while under attack, you burn more.

## Why 117k surprises everyone

The **117k per-member reserve** is not a number the game publishes and not a number community guides publish, because it's a derived number — it requires assuming your High-Heat Furnace level, the S2 blizzard schedule, and the Overdrive discipline of the alliance.

But every alliance that survives week 1 without a Frozen-state cascade has *implicitly* hit something close to this number. Every alliance that goes into meltdown around day 9 was sitting somewhere around 50-70k per member coming in.

Get everyone to 117k on day 1. It sounds like overkill on day 1. On day 9, it's the reason your hive isn't grey-screened while the enemy alliance's Warlord Missile lands on your Furnace.

## How to hit the reserve number by day 1

Three levers, all published in the KB, none of them are secret:

**1. Stack radar missions pre-season.** Every uncleared radar mission is guaranteed coal on Day 1 once the map transitions to winter. If you have 20 radar missions stacked, that's ~40-60k coal per member the moment the season opens.

**2. Save your highest-level Wanderer / Doom Walker kill for post-transition.** The first-kill coal bonus for a L180 Wanderer paid ~200k coal in one community report. Killing it before the map transitions gives you Normal-mode resources, not seasonal Coal. Save it.

**3. Coal donations from the alliance stockpile.** R5/R4 can allocate a portion of the alliance stockpile as personal-donation rewards to under-provisioned members. This is a lever most alliances forget exists. Use it to top up anyone under 80k on day 3 or 4.

## The tool that does this for you

The [Coal Burn Calculator](https://bullochman.github.io/lws-coal-burn-static/) takes your Alliance Furnace level, your alliance size, and your average High-Heat Furnace level and outputs the reserve target for the current week of the season. It also flags which members are behind — plug in a Roster Extractor CSV and it colors the ones at risk.

**[Open the Coal Burn Calculator →](https://bullochman.github.io/lws-coal-burn-static/)**

Takes about 40 seconds. If your alliance is entering week 1 and any member shows under 80k, DM them today.

## What to try in your alliance this week

1. **Post the 117k reserve target in your officer channel.** Not the whole alliance channel — this is an officer coordination number, not a public one.
2. **Run the Coal Burn Calculator with your current roster CSV.** Flag every member under 80k.
3. **Turn on the "auto-activate in blizzard" toggle** on every member's High-Heat Furnace. This is the single lowest-cost fix for the "member was asleep during blizzard 2" problem.
4. **Reserve at least 500k coal in the alliance stockpile for Warlord Missile response.** Don't let it drain to Normal-mode burn only.
5. **Save at least one Wanderer kill for post-transition** if the season hasn't started yet in your warzone.

The pattern to internalize: coal reserves that look "fine" at ambient temperatures collapse in Overdrive. Plan for the Overdrive hours, not the ambient hours.

---

## Sources

- [Coal budget calculator guide](/guides/coal-budget-calculator-guide.html) — full L1-L20 output curves for both furnaces, blizzard temperature by week, and the Warlord Missile 25×25 blast mechanics.
- [Alliance furnace guide](/guides/alliance-furnace-guide.html) — L20 deployment, reinforcement gate, coal consumption.
- [Season 2 Frozen mechanics reference](/seasons/season-2-frozen.html) — the per-tile temperature system, freeze threshold, defrost mechanics.
- lastwartutorial.com S2 Ultimate Strategy Guide, retrieved 2026-07-14 — pre-season radar mission stacking, Wanderer kill timing.
