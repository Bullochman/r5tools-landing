---
title: "The Season 2 landing coordinates every R5 gets wrong"
date: 2026-07-20
lang: en
slug: landing-coords-r5s-miss
author: "Evan @ r5tools"
description: "Everyone thinks the map corner is the safe landing spot. It's actually the second-worst tile for week-3 Warlord Missile pressure. Here's the coordinate math with charts."
seo_keywords:
  - "last war season 2 landing coordinates"
  - "lws hive landing"
  - "season 2 corner landing"
  - "alliance furnace placement lws"
tags:
  - season-2
  - landing
  - hive
  - warlord-missile
  - alliance-strategy
hero_cta: landing
---

There's a piece of Last War conventional wisdom that goes: "Land in the corner. Corners are cold but safe."

The first half is true — corners are the warmest tiles on the S2 map at around -15°C ambient, versus -80°C at the Capitol. The second half is where I want to push back. **Corners are the second-worst tiles for week-3 onward** once Warlord Missiles start dropping and Rare Soil War kicks off. Alliances that plan their landing around week-1 ambient temperature keep dying in week 4 to a threat that's obvious in retrospect.

Let me show the math.

## The corner myth, restated properly

Season 2 drops every alliance as a hive to a corner or edge tile on Day 1. This is a **server-side scheduled transition** — you don't pick it, it happens on the season-open rotation. The R5 then has a small window to reposition the hive using the free Assembly Point trick before the hive settles.

The reason people say "stay in the corner" is temperature. The concentric temperature grid puts warmer tiles on the outside and the coldest tile at the Capitol center. Corners see:

- **-15 °C ambient** in the outer band
- **~15 °C temperature drop per band moving inward**
- **60+ tiles of runway** before you hit the Capitol's -80 °C core

So the argument goes: land corner, build heat, survive week 1, worry about the rest later.

The argument breaks in week 3 for three specific reasons.

## Reason 1: Warlord Missile blast geometry

Every Warlord Missile has a **25×25 tile blast radius** centered on the target Alliance Furnace. Bases inside that 625-tile grid get randomly teleported across the map on impact — not defeated, but scattered. If your hive is packed inside 15×15 tiles around the Furnace (typical for a 50-member alliance), **your entire hive is inside the blast footprint**.

Corner placement is fine while nobody can reach you. Once week-3 Warlord unlocks and enemy alliances start looking for targets, the corner becomes a *predictable* target. Every scouting alliance runs the same query: "where are the hives that haven't relocated since day 1?" The corner-parked hive shows up in that query 100% of the time.

Non-corner hives that have moved twice by week 3 are much harder to pre-target because the scout can't be sure the coords they saw on day 5 are still current on day 15.

## Reason 2: Rare Soil War proximity

The Rare Soil War in week 4 requires alliances to reach and hold **Level 4+ cities**. Level-1 through Level-3 cities are distributed across the outer half of the map; **Level 4+ cities cluster toward the mid-ring and inner-ring bands**.

A corner-parked hive at coordinates roughly (10, 10) on a 100×100 map has a march distance of **~50-60 tiles** to reach the closest L4+ city cluster. A mid-outer-ring hive at (30, 45) has a march distance of **~15-20 tiles** to the same cluster.

March distance is the *actual* metric that decides who wins the Rare Soil War. Alliances that landed in the corner for week-1 warmth are burning march speed buffs and hero rally windows just getting to the fight. Alliances that landed pragmatically at ~30 tiles from the Capitol are already there.

## Reason 3: The "second-warm" band trick

The map temperature grid is not perfectly concentric. Between the -15 °C outer band and the -30 °C second band, there's a transition zone where per-tile ambient is closer to **-20 to -22 °C**. This zone is:

- **Warm enough that Alliance Furnace L1-L3 covers the freeze threshold** (Alliance Furnace L1 = +3°C, L3 = ~+6°C; add L5 High-Heat Furnace personal heat = +8°C activation; total ~+14°C, comfortably above -20°C).
- **10-15 tiles closer to the Rare Soil War zone** than the corner.
- **Not on any pre-scouted "predictable corner" list** because most alliances still land corners.

This is the landing zone we recommend for any alliance building for the full 4-week season instead of optimizing for week 1.

## The four landing archetypes

Based on hive layouts we've observed across ~30 alliances, most Season 2 hives fall into one of four patterns.

| Archetype | Coord band | Week-1 comfort | Week-3 targeting | Week-4 march to L4+ | Verdict |
|-----------|-----------|----------------|------------------|--------------------|---------|
| **Corner-camp** | (5-15, 5-15) | Excellent | High (predictable) | 50-60 tiles | Trap. Fine for week 1, dies week 3-4. |
| **Second-band** | (18-30, 18-30) | Good | Medium | 20-30 tiles | Recommended for most alliances. |
| **Aggressive mid** | (35-45, 35-45) | Fair (-30°C ambient) | Low (moving target) | 5-15 tiles | For alliances with L15+ High-Heat Furnaces and 300k+ average coal reserves. |
| **Capitol-adjacent** | (48-52, 48-52) | Punishing (-70°C base) | Very low | 0-5 tiles | Do not attempt unless you're a top-10 alliance with 20+ L30 High-Heat Furnaces. |

The distribution of what we've *actually seen*:

- **Corner-camp: ~55% of alliances.** The default.
- **Second-band: ~25%.**
- **Aggressive mid: ~15%.**
- **Capitol-adjacent: ~5%,** mostly top-100 KR alliances.

Second-band alliances are the ones we see holding rank in week 4. Corner-camp alliances are the ones we see rank-dropping between week 2 and week 4 because they can't reach the fight.

## What the Landing Planner does

The [Landing Planner](https://bullochman.github.io/lws-landing-planner-static/) takes your alliance's:

- Member count and average power (from a Roster Extractor CSV).
- Average High-Heat Furnace level (single input).
- Alliance Furnace deployment level target (usually L1 on day 1, project to L8 by week 3).

...and outputs recommended landing coordinates with a heat map, a march-distance calculation to the nearest L4+ city cluster, and the Warlord Missile blast footprint. You can drag the proposed Furnace tile around and see the numbers update live.

The tool defaults to recommending second-band placement unless your alliance's average power crosses a threshold where aggressive-mid becomes viable.

**[Open the Landing Planner →](https://bullochman.github.io/lws-landing-planner-static/)**

## What to try in your alliance this week

If you're pre-season, or if your warzone hasn't hit the S2 transition yet:

1. **Run the Landing Planner** with your current roster and average furnace levels. See where it recommends.
2. **Compare to your officers' gut instinct.** If everyone said "corner" and the tool says (24, 27), have the discussion.
3. **Screenshot the recommendation with the Warlord Missile blast overlay on.** Post it in the officer channel so everyone can see the 25×25 footprint before day 1.
4. **Set an Assembly Point candidate location within 3 tiles of the recommended Furnace tile,** so members have a return anchor if a missile scatters them.

If your warzone has already opened S2 and you're corner-camped:

1. **Do the relocation math now.** Alliance Furnace can be relocated at significant resource cost, and members can teleport for free via the Assembly Point trick. The window to move without losing captured cities is usually days 5-8.
2. **If you can't move the whole hive, at least stagger the outer ring 2-3 tiles further out** so a Warlord Missile centered on the Furnace catches only part of the hive.

The pattern to internalize: **temperature is a week-1 problem. Positioning is a week-3-and-4 problem. Optimize for the harder problem.**

---

## Sources

- [Coal budget calculator guide](/guides/coal-budget-calculator-guide.html) — Warlord Missile 25×25 mechanics, 3-minute prep window, 30k durability damage.
- [Alliance furnace guide](/guides/alliance-furnace-guide.html) — Day-1 deployment on L1 territory, reinforcement gate, relocation cost.
- [Season 2 Frozen mechanics](/seasons/season-2-frozen.html) — concentric temperature bands, freeze threshold, blizzard schedule.
- lastwar-tutorial.com teleporter/Assembly Point guide, retrieved 2026-07-14 — free hive-relocation trick via Assembly Point shift.
- lastwar-guide.org Season 2 Week 4 preview, retrieved 2026-07-15 — Rare Soil War L4+ city distribution.
