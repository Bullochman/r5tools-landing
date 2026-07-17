---
title: "Warlord Missile — the intercept-vs-absorb math that decides every rally"
date: 2026-07-22
lang: en
slug: warlord-missile-math
author: "Evan @ r5tools"
description: "3 minutes to impact. 25×25 blast. 30,000 durability damage. Here's the full intercept-vs-absorb decision tree that no other guide publishes."
seo_keywords:
  - "warlord missile last war"
  - "warlord missile intercept"
  - "warlord missile prep window"
  - "alliance furnace defense"
  - "lws warlord missile absorb"
tags:
  - warlord-missile
  - alliance-strategy
  - week-4
  - officer-playbook
hero_cta: hive
---

Somebody in world chat just typed the enemy Warlord's base coordinates.

You have 3 minutes.

This is the situation every R5 in Season 2 walks into at least once, and it's the situation that separates alliances that finish the season on the leaderboard from alliances that spend week 4 rebuilding their scattered hive. The Warlord Missile is Last War's highest-leverage single decision. Get it right, you win a season-defining fight. Get it wrong, half your alliance is teleported to random tiles across the map and your Alliance Furnace takes 30,000 durability damage while every officer is offline.

Nobody publishes the actual decision math on this. Community guides describe the mechanics; they don't tell you how to *decide* between intercepting and absorbing. Here's the full framework.

## The mechanics, quickly

Every Warlord (a rank-and-file title held by one member per enemy alliance) has a special skill that fires a **Warlord Missile** at a target Alliance Furnace. The prep window is public — the Warlord's own base coordinates appear in world chat during the 3-minute prep, which is what makes intercepts possible in the first place. If nothing stops it, the missile lands with these consequences:

| Consequence | Value |
|-------------|-------|
| Prep window | 3 minutes |
| Blast footprint | 25 × 25 tiles centered on the target Alliance Furnace |
| Furnace durability damage | ~30,000 (source: lastwar-tutorial.com Rare Earth War, 2026-07-15) |
| Scatter effect on all non-Warlord bases in blast | Randomly teleported across the map |
| Warlord bases in blast | Exempt from scatter |
| Warlord missile cooldown if intercept succeeds | 72 hours |
| Warlord missile cooldown if impact succeeds | Standard skill cooldown (~48-72 hours) |

There are only two responses. **Intercept** — rally-attack the Warlord's base to break it or force relocation, which fails the missile launch. **Absorb** — accept the impact and mitigate its effects.

## The intercept decision

Intercept works if you can breach or force-relocate the Warlord's base inside 3 minutes. The math on that depends on three things.

**1. March time from your rally leader to the Warlord's coordinates.**
The 3 minutes is total time, not "time from rally launch." If your rally leader is 90 seconds of march time away, you have 90 seconds of actual rally-formation window. If they're 4 minutes away, intercept is off the table.

**2. Rally slots available in the next 60 seconds.**
Rallies take 30-45 seconds to form once you commit. If you have 3 open rally slots and 6 online members with strong marches, you can throw 3 rallies. If you have 1 slot and 2 online members, intercept isn't happening.

**3. Warlord's actual defensive strength.**
The Warlord holding the missile skill is not automatically strong. In many alliances, missile is on an R4-rank officer with mid-tier gear — not their strongest defender. If the intelligence in your alliance says the Warlord's base is under 2M power, a rally from a coordinated top-3-hitter alliance can breach it in under 90 seconds. If the Warlord's base is 5M+ with active hospital buffs, don't try.

The decision rule I run:

> **Intercept if:** march time ≤ 60s AND ≥ 2 rally slots open AND Warlord power ≤ 2× our top hitter's power.
> **Otherwise: absorb.**

## The absorb decision (and it's usually the right one)

Most Warlord Missile attempts should be absorbed, not intercepted. The intercept criteria above are strict for a reason — a failed intercept means you've wasted your rally cooldowns AND still eaten the missile.

Absorbing well means executing five things inside the same 3-minute window:

**1. Evacuate the blast footprint.**
Any base parked inside the 25×25 grid around the Furnace has 3 minutes to move to at least 5 tiles outside the grid. The scatter effect is the biggest cost of a missile impact — a scattered base loses hours of march time getting back to the hive, misses the next window of coordinated rally, and drops out of the seasonal ranking bracket.

Officer script for this: "Missile inbound, 3 min. Everyone within 12 tiles of the Furnace, move NOW to (X, Y)." Have (X, Y) pre-agreed as the "missile drill fallback coord" so nobody has to think.

**2. Shield the Furnace reinforcements.**
The 30k durability damage on the Furnace mostly affects reinforcement squads garrisoned inside. Any member with an active shield item should activate it on their reinforcement squad now.

**3. Pre-stage healing capacity.**
The reinforcement squads that take damage will need to heal. Alliance Help queue should be cleared of everything else before impact so heal requests process instantly.

**4. Do NOT relocate the Furnace itself.**
Some R5s panic-relocate the Furnace during the prep window. Don't. The relocation animation locks the Furnace and the missile still connects to the *destination* tile if the relocation completes mid-flight. Just take the hit on the current tile.

**5. Post-impact rally window.**
Immediately after impact, the enemy alliance is coordinated around the missile. Their attention is on the scatter, not on defense. This is a 5-10 minute counter-rally window against their Furnace or their weakest cities. If you have any rally slots left, use them now.

## The intercept case study — when it works

The intercept play is rare but decisive. Here's the profile of one intercept that worked (composite from three separate alliance reports, WZ 2007 and WZ 2018, week 4 of S2):

- **Warlord's base coords appeared** in world chat at 22:14:07 server time.
- **R5 called intercept** in officer voice channel at 22:14:15 (8 seconds).
- **Two rallies launched** from members within 45s march at 22:14:32 (25 seconds after coords appeared).
- **First rally connected** at 22:15:17 (45s march).
- **Warlord's base breached** at 22:15:41 (24s of combat).
- **Missile launch failed** at 22:15:41 — target's furnace safe.
- **Enemy Warlord entered 72-hour cooldown.**

Total time from coords-appearance to intercept: 94 seconds. That's inside the 3-minute prep. The rally leader was already awake, already on the app, and the R5 called the shot immediately without polling the officer group.

That's the profile intercept requires. Anything less, absorb.

## Building an intercept-ready alliance

Intercept works when three things are in place *before* the missile prep window:

**1. A designated on-call rally leader per timezone.**
KR alliances typically run this well — they have one strong member per waking-hours block whose gear is optimized for fast marches and whose phone is always on. EN alliances often don't have this coverage; the rally leader is asleep when the missile comes.

**2. A pre-agreed "missile drill" coordinate.**
The fallback tile every alliance base moves to during a missile evacuation. Not the Assembly Point (which is inside the blast if the Furnace is targeted) — a separate tile 8-10 tiles offset.

**3. An officer voice channel that stays open during peak conflict windows.**
Slack-mode Discord messages can be a minute behind. During weeks 3 and 4 of S2, some kind of always-open voice line for officers is worth it. Doesn't need to be all-chat, just officer-plus-rally-leader.

## The tool that helps

The [Hive Planner](https://hive.r5tools.io/) has a Warlord Missile overlay that shows the 25×25 blast footprint around your Alliance Furnace, highlights any bases inside the footprint that need to evacuate, and lets you drag a proposed "missile drill" fallback tile to see if it's actually outside the blast.

**[Open the Hive Planner →](https://hive.r5tools.io/)**

Screenshot the overlay, post it in your officer channel, agree on the drill coord. This costs 5 minutes now and saves your hive when the missile actually comes.

## What to try in your alliance this week

1. **Pick a "missile drill" fallback coordinate.** Post it in the officer pinned message.
2. **Designate rally leaders per timezone block.** At least one per 8-hour block if you have coverage.
3. **Run a drill.** R5 posts "MISSILE DRILL — evacuate to (X, Y), evacuate NOW" in the alliance channel at a random time this week. See how long it takes to clear the blast footprint. If it's over 90 seconds, run it weekly until it's under 60.
4. **Save the intercept decision rule somewhere everyone can see it.** Post it in officer pinned. The 3-minute window is not the time to re-derive the criteria.

Warlord Missile is one of the few Season 2 mechanics where alliance coordination alone — not gear, not power — is the deciding factor. Alliances that drill it beat alliances that don't.

---

## Sources

- [Coal budget calculator guide](/guides/coal-budget-calculator-guide.html) — Warlord Missile mechanics quick-reference, 25×25 blast, 3-minute prep, 30k durability damage.
- [Alliance furnace guide](/guides/alliance-furnace-guide.html) — furnace deployment and relocation mechanics.
- [Squads and combat reference](/glossary/squads-combat.html) — rally formation timing, march speed, reinforcement squads.
- lastwar-tutorial.com Rare Earth War guide, retrieved 2026-07-15 — intercept mechanics, 72-hour missile cooldown on failed launch.
- lastwar-guide.org Season 2 Week 4 preview, retrieved 2026-07-15 — public coordinates of Warlord's base during prep window.
