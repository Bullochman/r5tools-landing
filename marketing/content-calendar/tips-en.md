# r5tools.io — 30-Day Tool-Tip Content Bank (EN)

**Owner:** Evan Jones (R5, RONY, WZ 2007)
**Draft date:** 2026-07-17
**Voice:** R5-to-R5, no corporate tone, no emojis in X/Reddit bodies. TikTok overlays may use emojis.
**Sources:** every claim traces to a KB article in `/Users/evanjones/claudecode/r5tools/LWS_Knowledge_Base/kb/`.
**X char discipline:** every X body verified ≤ 275 chars (leaves room for URL + newline). r5tools.io is 12 chars.
**Tool naming reminder:** r5tools has 11 tools — Landing Planner, Heat Simulator, Coal Burn Calculator, Freeze Risk Dashboard, Roster Extractor, City Capture Planner, Season Timeline, Hive Grid Manager, Profile Studio, VS Days Planner, KB Chat.

---

## Tip 1 — The 2-tile gap is the whole game

**Body (X, 275 char):** Stronghold defense rule almost nobody enforces: 2-tile empty gap between every pair of alliance bases, in every direction, between every ring. A 3x3 gap anywhere = a free teleport pad for the enemy. Ring 1 corners always occupied. r5tools.io
**Body (Reddit, 500 char):** The single stronghold defense rule that separates the alliances that hold and the ones that get farmed: 2-tile empty gap between every pair of alliance bases, in every direction, AND between every ring. Corners always occupied. Any 3x3 unoccupied square anywhere in the hive is a teleport landing pad for an enemy. The rule sounds obvious. Actually enforcing it across 100 members with different power levels is where hives fall apart. Landing Planner at r5tools.io generates the coords for you.
**Body (Discord, 100 char):** 3x3 gap = free enemy teleport pad. Landing Planner enforces 2-tile pitch. r5tools.io
**Body (TikTok overlay, 80 char):** A 3x3 gap in your hive is a teleport pad. Every time.
**KB source:** `kb/08-alliance-systems.md` lines 234-250 (Military Stronghold hive shape, 2-tile gap rule).
**Best day/time to post:** Sunday 7:00 PM CT (R5s planning Monday reset).
**Related tool:** Landing Planner.

---

## Tip 2 — -20 for 5 minutes and you're locked out

**Body (X, 275 char):** Season 2 freeze rule: base temp under -20C for 5 continuous minutes = Frozen. No rally. No teleport. No relocation. No shield inside Contaminated Land. Thaw takes the same 5 min back above -20C. Plan heat before blizzards, not during. r5tools.io
**Body (Reddit, 500 char):** Season 2 freeze rule everyone misquotes: your base temp has to be below -20C for 5 continuous minutes to enter Frozen state. Not instant. But once frozen: no rally, no teleport, no relocation, and no shield inside a Warlord Missile Contaminated Land zone. Thaw takes the same 5 minutes back above -20C. Your High-Heat Furnace + Alliance Furnace radius + city bonus stack additively. Run the math before the -70C Week 4 blizzard, not during it. Freeze Risk Dashboard on r5tools.io flags the reds.
**Body (Discord, 100 char):** Frozen = 5 continuous min under -20C. Not instant. Freeze Risk Dashboard flags reds.
**Body (TikTok overlay, 80 char):** -20C x 5 min = you cannot rally, teleport, or shield.
**KB source:** `kb/06-season-2-frozen.md` lines 52-73 (Freezing threshold + Defrost).
**Best day/time to post:** Tuesday 8:00 PM CT (day before Wed Rare Soil War round).
**Related tool:** Freeze Risk Dashboard.

---

## Tip 3 — L20 Alliance Furnace burns 1,440 coal/min

**Body (X, 275 char):** Coal reality nobody checks: L20 Alliance Furnace burns 1,440 coal/min normal, 5,760/min overdrive. During a Week 4 -70C blizzard, HHF + AF both running overdrive across 50 members is a 20-40x multiplier on your alliance reserve. r5tools.io does the math. 
**Body (Reddit, 500 char):** Coal budget the average R5 gets wrong by an order of magnitude: L20 Alliance Furnace alone burns 1,440 coal/min normal, 5,760/min in overdrive. Then add every member's High-Heat Furnace running overdrive during a Week 4 -70C blizzard. That is 20-40x your default daily burn rate. Members can donate up to 50 times per day to the AF, but 50 donations x 100 members is not enough if you have not stockpiled. Coal Burn Calculator on r5tools.io takes your roster and gives you the Week 4 reserve target in one screen.
**Body (Discord, 100 char):** L20 AF = 1,440 coal/min normal, 5,760/min OD. Coal Burn Calc solves it.
**Body (TikTok overlay, 80 char):** Your L20 furnace eats 5,760 coal per MINUTE in overdrive.
**KB source:** `kb/06-season-2-frozen.md` lines 117-121, 445-455 (Alliance Furnace L20 stats + donation cap).
**Best day/time to post:** Wednesday 7:30 PM CT (during Rare Soil War prep).
**Related tool:** Coal Burn Calculator.

---

## Tip 4 — Kill your Wanderer AFTER the map transition

**Body (X, 275 char):** Season 2 Day 1 trap: kill your highest-level Wanderer before the map transition and the coal reward pays out in the old economy. Community reports a level 180 Wanderer paying ~200,000 coal AFTER transition. Stack radar missions instead. r5tools.io
**Body (Reddit, 500 char):** Season 2 Day 1 gotcha the tutorial does not tell you: the first-kill coal reward on Wanderers and Doom Walkers only pays out AFTER the map transitions to winter. Kill a level 180 Wanderer 20 minutes before transition, you get generic loot. Kill it 20 minutes after, community reports ~200,000 coal from that single kill. Stack radar missions pre-season so you can clear them all Day 1 for guaranteed coal. Season Timeline on r5tools.io flags the transition window per warzone.
**Body (Discord, 100 char):** DO NOT kill your top Wanderer before the S2 map transition. ~200k coal at stake.
**Body (TikTok overlay, 80 char):** Save your L180 Wanderer for AFTER the map flips. 200k coal.
**KB source:** `kb/06-season-2-frozen.md` lines 31, 147 (Day-1 checklist item 1).
**Best day/time to post:** Sunday 9:00 AM CT (pre-season prep window).
**Related tool:** Season Timeline.

---

## Tip 5 — The rally leader IS the rally

**Body (X, 275 char):** Rally rule everyone thinks they know: leader's hero levels, research, gear, drone, and season stats apply to EVERY joiner's troops. Joiner's own gear does not apply. Pick your rally leader by combat sheet, not march size. r5tools.io Roster Extractor sorts by it.
**Body (Reddit, 500 char):** Rally mechanic the losing alliance ignores: the rally leader's hero levels, tech research, gear, drone buffs, and season-specific stats apply to every joiner's troops. Your joiners' own gear does NOT apply. A maxed player joining a weak leader downgrades their contribution. A warm-body R1 joining your titled R4 leader is a full-strength contribution to the rally. Choose leaders by combat rating, not by march size. Roster Extractor on r5tools.io gives you a sortable roster in 2 minutes so you know who your real rally leaders are.
**Body (Discord, 100 char):** Rally leader's stats apply to every joiner. Pick by combat sheet, not march size.
**Body (TikTok overlay, 80 char):** Your rally is only as strong as its LEADER.
**KB source:** `kb/04-squads-combat.md` lines 205-213 (rally leader stat replacement).
**Best day/time to post:** Friday 6:30 PM CT (before Saturday Enemy Buster).
**Related tool:** Roster Extractor.

---

## Tip 6 — Enemy Buster kills score 5x

**Body (X, 275 char):** VS Days scoring lever most alliances underplay: Saturday Enemy Buster gives 5x point multiplier for kills against the paired duel alliance vs any other kill. Day 6 alone is 4 VPs of the 7 needed to win the week. Shield up early, kill smart. r5tools.io
**Body (Reddit, 500 char):** VS Days scoring math that flips lost weeks: Saturday Enemy Buster has a 5x point multiplier for troop kills against your paired duel alliance vs killing any other alliance's troops. Day 6 alone is worth 4 of the 13 total VPs, and 7 wins the week. Winning Saturday plus 3 of Days 2-5 flips a losing week from a losing week to a win. Shield up before the daily reset because any offensive action drops your shield. VS Days Planner on r5tools.io lays out the multiplier windows so you kill inside them, not before.
**Body (Discord, 100 char):** Sat Enemy Buster kills = 5x vs paired alliance. Day 6 alone worth 4 of 7 VPs.
**Body (TikTok overlay, 80 char):** Saturday Enemy Buster kills score 5x. Skip Mon-Fri, still win.
**KB source:** `kb/08-alliance-systems.md` lines 157-167 (VS Days VP table + 5x multiplier).
**Best day/time to post:** Friday 8:00 PM CT (24h before Enemy Buster).
**Related tool:** VS Days Planner.

---

## Tip 7 — Titled R4 = +5%, untitled R4 = +2.5%

**Body (X, 275 char):** Marshal's Guard damage lever that costs zero: titled R4 rally = +5% alliance-wide, untitled R4 = +2.5%. R5 = +5%. Assigning a title costs nothing and takes 3 seconds. No serious alliance runs Marshal's Guard with an untitled R4 leading a rally. r5tools.io
**Body (Reddit, 500 char):** Marshal's Guard damage buff that costs zero and half of alliances still miss: titled R4 rally = +5% damage to that rally. Untitled R4 = +2.5%. R5 = +5%. Assigning one of the four titles (Warlord, Recruiter, Muse, Butler) costs nothing and takes 3 seconds. The Season 6 alliance skills are gated to titled R4s anyway. Rotate titles between your reliable-online R4s before every Marshal's Guard. Hive Grid Manager on r5tools.io tracks which of your R4s hold which title so you never miss.
**Body (Discord, 100 char):** Titled R4 rally = +5%. Untitled = +2.5%. Titles cost zero. Assign before MG.
**Body (TikTok overlay, 80 char):** Untitled R4 = you leave 2.5% damage on the table. Every rally.
**KB source:** `kb/08-alliance-systems.md` lines 188-197 (Marshal's Guard damage buffs).
**Best day/time to post:** Monday 6:00 PM CT (weekly Marshal's Guard cadence prep).
**Related tool:** Hive Grid Manager.

---

## Tip 8 — Warlord Missile: you have 3 minutes

**Body (X, 275 char):** Warlord Missile survival window: 3 minutes from launch to impact. Enemy Warlord's base coordinates broadcast to entire server during those 3 min. Rally-attack it. Base relocates or breaches = missile fails + 72h skill cooldown. Do not just absorb. r5tools.io
**Body (Reddit, 500 char):** Warlord Missile play everyone treats as unavoidable but is not: 3-minute prep window between launch and impact. During those 3 minutes the enemy Warlord's own base coordinates are public in world chat. Rally-attack them. If the Warlord's base moves (voluntarily to dodge or forced by breach) the missile launch fails and their missile skill enters a 72-hour cooldown. Do not just eat the 25x25 random-teleport ping. Set up the intercept rally captain roster in advance. Hive Grid Manager on r5tools.io tracks your Warlord + shadow Warlord rotation.
**Body (Discord, 100 char):** 3 min to intercept Warlord Missile. Breach the Warlord = 72h cooldown.
**Body (TikTok overlay, 80 char):** Warlord Missile? You have 3 minutes. Rally the Warlord's base.
**KB source:** `kb/06-season-2-frozen.md` lines 221-238 (Warlord Missile + intercept + failed launch definition).
**Best day/time to post:** Tuesday 7:00 PM CT (before Wed war round).
**Related tool:** Hive Grid Manager.

---

## Tip 9 — City tile snaps to -10C on capture

**Body (X, 275 char):** Season 2 capture bonus most planners miss: a newly captured city snaps its tile to -10C. Warm island in the frost. Combine with the L6 city +60C heat bonus and the tile is habitable regardless of ambient zone. r5tools.io respects the 2/day cap.
**Body (Reddit, 500 char):** Season 2 city capture bonus half of R5s do not know about: a newly captured city snaps its tile temperature up to -10C, immediately, no matter what zone it sits in. Combine that with the L6 city heat bonus of +60C and you can hold habitable tiles anywhere on the map including Zone 7 (ambient -80C at the Capitol). Cap is 6 cities per alliance, 2 captures per day, 36-hour post-capture protection. Only L6 cities unlock Capitol fighting. City Capture Planner on r5tools.io schedules captures around the daily 2 cap.
**Body (Discord, 100 char):** New city tile snaps to -10C. L6 city adds +60C. Warm islands anywhere.
**Body (TikTok overlay, 80 char):** New city = auto -10C tile. Warm island in the freeze.
**KB source:** `kb/06-season-2-frozen.md` lines 155-167, 473-482 (city heat bonus + snap to -10C).
**Best day/time to post:** Thursday 7:00 PM CT (mid-week capture planning).
**Related tool:** City Capture Planner.

---

## Tip 10 — Rare Soil ranking is cumulative, not end-state

**Body (X, 275 char):** Season 2 ranking mechanic that changes everything: end-of-season rank is based on TOTAL Rare Soil accumulated across the season, not what you control on the last day. A Week 1 L2 dig site out-earns a Week 6 city. Capture early, hold forever. r5tools.io
**Body (Reddit, 500 card):** Season 2 ranking rule that changes your whole strategy: alliance rank at season end is based on total Rare Soil accumulated across the entire season, not what territory you hold on the last day. A Level 2 dig site captured Week 1 accumulates more Rare Soil over 48 days than a Level 5 city captured Week 6. Week-1 speed matters more than late-season power spikes. The alliance that captures its first L1 Dig Site in Hour 12 of Day 1 out-accumulates the alliance that spends Week 1 optimizing. Season Timeline on r5tools.io tracks your accumulation curve.
**Body (Discord, 100 char):** Rare Soil rank is TOTAL accumulated, not end-state. Week 1 capture > Week 6 capture.
**Body (TikTok overlay, 80 char):** Capture Week 1. Hold forever. Rank is cumulative.
**KB source:** `kb/06-season-2-frozen.md` lines 285-295 (Rare Soil ranking cumulative).
**Best day/time to post:** Saturday 10:00 AM CT (weekend planning window).
**Related tool:** Season Timeline.

---

## Tip 11 — RPS: Aircraft > Tank > Missile > Aircraft

**Body (X, 275 char):** RPS half the new R5s still get wrong. Aircraft beats Tank. Tank beats Missile. Missile beats Aircraft. Winner deals +20%, takes -20%. Everything downstream — formation, gear, weapons, drone chips — is type-locked. Mono squads dominate for a reason. r5tools.io
**Body (Reddit, 500 char):** Rock-paper-scissors correction because one tutorial source in the wild has it inverted: Aircraft beats Tank. Tank beats Missile. Missile beats Aircraft. Each counter gives +20% damage dealt and -20% damage taken in the winning matchup. Everything downstream — formation bonuses (+20% at 5-mono), gear sets, Exclusive Weapons, drone Skill Chips, Special Forces research — is troop-type locked. Mixing types does not just cost the +20% formation bonus, it wastes every type-locked investment you stacked on that squad.
**Body (Discord, 100 char):** Aircraft > Tank > Missile > Aircraft. +20/-20 per counter. Mono for a reason.
**Body (TikTok overlay, 80 char):** Aircraft beats Tank. Tank beats Missile. Missile beats Air.
**KB source:** `kb/04-squads-combat.md` lines 20-36 (RPS triangle + counter numbers).
**Best day/time to post:** Sunday 4:00 PM CT (chill weekend re-education post).
**Related tool:** Profile Studio (squad builder).

---

## Tip 12 — 15/50/28 is not a hospital, it is a graveyard

**Body (X, 275 char):** Wounded math that permakills your troops: hospital fills first, then Emergency Center absorbs floor(overflow x 0.40) at L20+, everything else is dead permanent. Hospital slots free but EC over cap = still killed. Upgrade EC before you need it. r5tools.io
**Body (Reddit, 500 char):** Wounded math that quietly permakills your alliance: hospital fills first with min(casualties, hospital_free). Overflow goes to Emergency Center at fainted-unit ratio 0.21 at L1, 0.40 at L20+. Anything past EC cap is permanently killed. Critical trap: even if hospital has free slots, once EC overflows the excess is killed. Not backfilled. That fainted-unit-ratio jump from 0.21 to 0.40 is ~90% more rescued troops per overflowing battle. Upgrade EC before Week 4 Rare Soil War, not during.
**Body (Discord, 100 char):** EC at L20+ = 0.40 rescue ratio. Overflow past EC = permakill. Upgrade early.
**Body (TikTok overlay, 80 char):** Emergency Center at L1 = 21%. At L20 = 40%. Upgrade it.
**KB source:** `kb/04-squads-combat.md` lines 264-292 (wounded/fainted/killed math + EC ratio).
**Best day/time to post:** Wednesday 6:30 PM CT (mid-week PvE prep).
**Related tool:** Profile Studio.

---

## Tip 13 — 5 tiles from the Alliance Furnace

**Body (X, 275 char):** Rare Soil War defensive rule most alliances break: park every base at least 5 tiles from the Alliance Furnace. Warlord Missile blast is 25x25 tiles centered on the furnace. Every base inside gets random-teleported across the map on impact. r5tools.io
**Body (Reddit, 500 char):** Rare Soil War defensive rule most alliances break out of laziness: park every base at least 5 tiles from the Alliance Furnace. Warlord Missile blast is a 25x25 tile Contaminated Land centered on the furnace. Every base inside the blast on impact gets forcibly random-teleported across the map, except the Warlord's own base. Shields are blocked inside the Contaminated Land for the full 1-hour duration. If the missile lands during a blizzard, teleported bases can freeze immediately at their random landing tile. Landing Planner on r5tools.io enforces the 5-tile perimeter automatically.
**Body (Discord, 100 char):** 5 tiles minimum from AF. 25x25 blast evicts everyone inside on impact.
**Body (TikTok overlay, 80 char):** Park 5 tiles from the furnace. Or get evicted.
**KB source:** `kb/06-season-2-frozen.md` lines 225-240 (25x25 blast + 5-tile positioning rule).
**Best day/time to post:** Tuesday 6:00 PM CT (Wed war round day prep).
**Related tool:** Landing Planner.

---

## Tip 14 — VS Day + Arms Race = double-dip

**Body (X, 275 char):** VS Days scoring lever every top alliance uses: each daily theme has a matching Arms Race phase. Time your speedups so a single build completion scores in BOTH events at once. Not optional at the top of the leaderboard. r5tools.io VS Days Planner aligns them.
**Body (Reddit, 500 char):** VS Days scoring lever every top alliance uses and every mid-tier alliance ignores: each of the 6 VS Day themes has a matching Arms Race phase during the same day. Time your speedups, training, research, or radar missions so a single action scores in BOTH events at once. Radar Training day on Monday + Arms Race radar phase = double-dip. Total Mobilization Friday + Arms Race Unit Progression = double-dip. First 5 minutes after daily reset score nothing; wait for the countdown before dumping speedups.
**Body (Discord, 100 char):** Every VS Day has an Arms Race match. Time speedups to double-dip both.
**Body (TikTok overlay, 80 char):** VS Day + Arms Race = one action, two scores.
**KB source:** `kb/08-alliance-systems.md` lines 144-170 + `kb/09-events.md` line 74 (VS+AR overlap).
**Best day/time to post:** Sunday 6:00 PM CT (Monday reset planning).
**Related tool:** VS Days Planner.

---

## Tip 15 — 30 gold donations per day, one every 20 min

**Body (X, 275 char):** Daily habit that quietly builds your account: 30 coin donations to alliance tech per day, 1 regenerates every 20 min. Recommended tech gets +20% points (60 EXP vs 50). This is the single largest hero-shard drip for F2P. Every day. Every login. r5tools.io
**Body (Reddit, 500 char):** Daily habit that quietly builds your F2P account: 30 coin donations per day to alliance tech, 1 regenerates every 20 minutes. If R5 flags a Recommended tech, donations there earn +20% (60 EXP + 60 contribution points vs the standard 50). Contribution points feed the Alliance Store; 5x universal Legendary hero shards for 15,000 points each every week is the single largest hero-shard drip for F2P accounts. Leaving your 30/30 counter full for hours is wasted potential. Set an alarm every 10 hours to clear the cap.
**Body (Discord, 100 char):** 30 gold donations/day. 20-min regen. Recommended tech = +20% points.
**Body (TikTok overlay, 80 char):** 30 gold donations per day. Every day. No exceptions.
**KB source:** `kb/08-alliance-systems.md` lines 50-52, 96-102 (donation cap + Alliance Store priority).
**Best day/time to post:** Monday 12:00 PM CT (start-of-week habit reinforcement).
**Related tool:** Roster Extractor (contribution tracking).

---

## Tip 16 — KR Rare Soil War Combat opens 12:30 SERVER time

**Body (X, 275 char):** Rare Soil War timing KR alliances need to nail: Combat opens 12:30 SERVER time on Wed and Sat. KR warzones often on KST (UTC+9), so 12:30 KST = 03:30 UTC. NA/EU R5s targeting KR opponents: your prime time is their overnight. r5tools.io
**Body (Reddit, 500 char):** Rare Soil War timing that trips new R5s and matters double for KR alliances: Combat Stage opens at 12:30 SERVER time on Wednesday and Saturday of every war week (Weeks 4-7). Prep is 12:00-12:30. Combat is 12:30-13:10 max. Warzone server-time is regional and set when the warzone was created, not R5-configurable in Season 2 (the Alliance Safe Time feature is Season 5+ only). KR warzones commonly sit on KST (UTC+9) so 12:30 server = 03:30 UTC = 22:30 CT. Pre-plan rally captains via r5tools.io.
**Body (Discord, 100 char):** RSW Combat opens 12:30 SERVER time Wed+Sat. KR warzones often KST.
**Body (TikTok overlay, 80 char):** RSW Combat = 12:30 SERVER time. Every Wed + Sat.
**KB source:** `kb/06-season-2-frozen.md` lines 245-265 (RSW timing conventions + server-time offset).
**Best day/time to post:** Monday 9:00 PM CT (KR morning, EN evening dual-hit).
**Related tool:** Season Timeline.

---

## Tip 17 — KR jargon your alliance chat should know

**Body (X, 275 char):** KR alliance jargon that gets lost in translation: 벨튀 (bell-ring-and-run) = one throwaway rally to bait a recapture. 스왑 = allies trading captured cities to double-lock 36h protection. 나프 (NAP) = alliance non-aggression pact. All standard KR meta. r5tools.io
**Body (Reddit, 500 char):** KR alliance jargon that has no clean EN equivalent so it gets lost in cross-warzone play: 벨튀 (bell-ring-and-run) = attacking a stronghold with one march and immediately withdrawing so the defender successfully defends, used to bait a recapture. 스왑 (swap) = allied players trading captured cities to lock the 36h protection on both. 나프 (NAP) = Non-Aggression Pact; NAP20 = top 20 alliances on the server all agreed. 깔개 = a top-tier dominator player. Learn these and your KR opponent respects you.
**Body (Discord, 100 char):** 벨튀 = bait rally. 스왑 = protection trade. 나프 = NAP. KR meta terms.
**Body (TikTok overlay, 80 char):** 벨튀. 스왑. 나프. KR alliance jargon.
**KB source:** `kb/15-glossary.md` lines 113-118, 143-144 (community jargon block).
**Best day/time to post:** Saturday 8:00 PM CT (weekend crossover content).
**Related tool:** KB Chat.

---

## Tip 18 — Furnace radius is a SQUARE, not a circle

**Body (X, 275 char):** Alliance Furnace radius is a SQUARE, not a circle. Every base inside receives the full heat bonus regardless of position within the zone. Corners of the square are just as warm as the center tile. Plan your rings on square math, not distance-from-center. r5tools.io
**Body (Reddit, 500 char):** Alliance Furnace radius is a SQUARE area, not a circle. Every base whose tile falls inside the square receives the full heat bonus regardless of position within the zone. Corners of the square are equally warm as the center tile. This changes hive planning: you do not want a circular pack around the furnace, you want a square lattice with bases at the corners of the coverage zone getting full benefit. The exact tile-radius by AF level is undocumented (open question in the KB) but square coverage geometry is confirmed. Heat Simulator on r5tools.io models it.
**Body (Discord, 100 char):** AF radius = SQUARE, not circle. Corner tiles = full heat. Plan lattice, not pack.
**Body (TikTok overlay, 80 char):** Furnace radius = SQUARE. Corners get full heat.
**KB source:** `kb/06-season-2-frozen.md` line 121 (Alliance Furnace radius is square).
**Best day/time to post:** Wednesday 7:00 PM CT (mid-week hive planning).
**Related tool:** Heat Simulator.

---

## Tip 19 — Rally leader temperature applies to whole rally

**Body (X, 275 char):** Season 2 rally mechanic that lets low-power members attack deep cold zones: the leader's temperature bonus applies to every rally member. A leader with a stacked HHF + city bonus can pull cold-weak members into Zone 7 attacks. r5tools.io Roster Extractor sorts by heat.
**Body (Reddit, 500 char):** Season 2 rally mechanic almost nobody uses: when initiating a group attack, ALL rally members receive the leader's temperature bonus. Lower-power members with weak HHF stacks can participate in operations deep in the frozen center (Zone 6-7, ambient -70C to -80C) as long as the rally leader has enough stacked heat. This is exactly parallel to the leader's combat stats applying to joiners' troops. Pick your deep-freeze rally leaders by combat sheet AND heat stack, not just combat. Roster Extractor on r5tools.io lets you sort by both.
**Body (Discord, 100 char):** Leader's heat bonus applies to whole rally. Deep-freeze attacks unlock this way.
**Body (TikTok overlay, 80 char):** Rally leader = heat leader. Whole rally gets the bonus.
**KB source:** `kb/06-season-2-frozen.md` line 367 (rally leader temp bonus applies to all members).
**Best day/time to post:** Thursday 8:00 PM CT (Fri Total Mobilization prep).
**Related tool:** Roster Extractor.

---

## Tip 20 — R4 title cap: 8, then 10 at Gift L10

**Body (X, 275 char):** R4 cap detail R5s new to Season 6 miss: default cap is 8 R4s, rising to 10 once Alliance Gift Level hits 10. Each of the 4 titles (Warlord, Recruiter, Muse, Butler) gates one S6 alliance skill. Extra R4s = shadow-Warlord rotation for 72h missile cooldown. r5tools.io
**Body (Reddit, 500 char):** R4 cap detail R5s promoted since Season 6 sometimes miss: default R4 cap is 8. It rises to 10 once Alliance Gift Level reaches 10. Each of the 4 titles (Warlord, Recruiter, Muse, Butler) gates exactly one alliance skill in Season 6 (Serpent Breath, Snake Barrier, Night Army, Thunder Feathers). The 5-10 extra untitled R4 slots are for shadow-title rotation: to fire a Warlord Missile every Wed AND every Sat in Season 2 with a 72h skill cooldown you need at least 2 R4s who can hold the Warlord title on rotation. Plan the ministry roster ahead. Hive Grid Manager on r5tools.io tags each R4 with their title.
**Body (Discord, 100 char):** R4 cap: 8 default, 10 at Gift L10. Shadow-Warlord needs the extra slots.
**Body (TikTok overlay, 80 char):** 8 R4 slots. 10 at Gift L10. Shadow Warlord needs the room.
**KB source:** `kb/08-alliance-systems.md` lines 20-22, 79-90, 279-292 (R4 cap + S6 titles + shadow Warlord).
**Best day/time to post:** Monday 8:00 PM CT (start-of-week R5 planning).
**Related tool:** Hive Grid Manager.

---

## Tip 21 — 3-min rally minimum in Marshal's Guard

**Body (X, 275 char):** Marshal's Guard rule half of new members break: rallies in this event must be 3 minutes only. 1-min quick rallies and solo attacks do NOT score. Auto-fill kicks in at 30 sec remaining. Stagger new rallies 30 sec apart in the first 5 min. r5tools.io
**Body (Reddit, 500 char):** Marshal's Guard rally rule half of new members break: rallies must be 3 minutes only. 1-minute quick rallies and solo attacks do NOT score in this event. One personal rally at a time, unlimited joins on others. Auto-fill kicks in at the 30-second remaining mark, pulling offline members' garrisoned troops so long as they are already garrisoned in the alliance. Cadence: stagger new rally starts ~30 seconds apart during the first 5 minutes so you build a continuous join pipeline. When a march returns, immediately join the rally with the shortest remaining timer.
**Body (Discord, 100 char):** MG rallies MUST be 3 min. 1-min = zero score. Stagger starts 30s apart.
**Body (TikTok overlay, 80 char):** MG rally = 3 min only. 1-min = zero points.
**KB source:** `kb/08-alliance-systems.md` lines 183-197 (Marshal's Guard rally rules).
**Best day/time to post:** Wednesday 5:00 PM CT (typical MG cadence day).
**Related tool:** Hive Grid Manager.

---

## Tip 22 — Hospital + Emergency Center are INDEPENDENT caps

**Body (X, 275 char):** Hidden mechanic even veteran R5s misplay: Hospital and Emergency Center caps do NOT backfill each other. Even if Hospital has free slots, once EC overflows the excess is permakilled. Not moved to Hospital. Track both caps before every big engagement. r5tools.io
**Body (Reddit, 500 char):** Hidden mechanic even 6-month veterans get wrong: Hospital and Emergency Center capacity caps are INDEPENDENT. When a battle exceeds Hospital free capacity, the overflow goes to Emergency Center at floor(overflow x fainted_unit_ratio). If EC is also full, the excess is permanently killed. Even if Hospital still had free slots. The game does not backfill EC overflow into Hospital vacancy. Read this again if you have never heard it. Every big engagement should include a Hospital+EC capacity check before you send. Profile Studio on r5tools.io tracks both caps.
**Body (Discord, 100 char):** Hospital + EC caps do NOT backfill. Free Hospital slots do not save EC overflow.
**Body (TikTok overlay, 80 char):** Hospital + EC don't share slots. Overflow = dead.
**KB source:** `kb/04-squads-combat.md` lines 281-292 (Critical: Hospital + EC caps independent).
**Best day/time to post:** Thursday 7:30 PM CT (before Fri/Sat combat days).
**Related tool:** Profile Studio.

---

## Tip 23 — First S2 capture MUST be an L1 Dig Site

**Body (X, 275 char):** Season 2 adjacency rule nobody warns you about: your alliance's FIRST territory capture must be a Level 1 Dig Site. Every subsequent capture must be adjacent to existing alliance territory. Skip Day 1 = your outward expansion pattern is locked wrong. r5tools.io
**Body (Reddit, 500 char):** Season 2 adjacency rule that gets buried in every tutorial: your alliance's FIRST territory capture in the season MUST be a Level 1 Dig Site. From there, every subsequent capture must be adjacent to existing alliance territory. This drives the expanding-outward-from-the-corner pattern the whole map develops in Week 1. If you skip Day 1 or fumble the L1 Dig Site capture, your outward expansion pattern is locked wrong for the rest of the season. Do not let this be Day 1 item that slips. City Capture Planner on r5tools.io enforces the adjacency chain.
**Body (Discord, 100 char):** First S2 capture MUST be L1 Dig Site. Adjacency chain locks after that.
**Body (TikTok overlay, 80 char):** Day 1: L1 Dig Site. Or your whole hive expansion breaks.
**KB source:** `kb/06-season-2-frozen.md` lines 36, 182 (adjacency rule).
**Best day/time to post:** Saturday 3:00 PM CT (pre-season Day 1 prep).
**Related tool:** City Capture Planner.

---

## Tip 24 — VIP 6 unlocks the permanent 2nd builder

**Body (X, 275 char):** VIP progression milestone that pays back 10x: VIP 6 unlocks the permanent second builder queue. Everything downstream — HQ upgrades, Barracks, Alliance Center — cuts in half. VIP 8 adds the Shirley march-size passive. Push to VIP 6 before spending anywhere else. r5tools.io
**Body (Reddit, 500 char):** VIP progression milestone that pays back 10x: VIP 6 unlocks the permanent second builder queue. Everything downstream (HQ upgrades, Barracks, Alliance Center, Emergency Center) cuts in half from that point forward. VIP 8 unlocks the Shirley survivor with the +20% food/iron/gold production passive, only survivor with a direct march-size buff. VIP 18 grants +12.5% hero HP/ATK/DEF and a custom base skin at 50M cumulative points. If you are budget-limited, push VIP 6 before spending anywhere else. Compounds every day for the rest of your account life.
**Body (Discord, 100 char):** VIP 6 = permanent 2nd builder. Payoff compounds daily. Push here first.
**Body (TikTok overlay, 80 char):** VIP 6 = 2nd builder forever. Best VIP milestone.
**KB source:** `kb/10-economy.md` lines 59-62 + `kb/15-glossary.md` line 151 (VIP milestones).
**Best day/time to post:** Sunday 2:00 PM CT (weekend account planning).
**Related tool:** Profile Studio.

---

## Tip 25 — Coin Vault protects at threshold, not %

**Body (X, 275 char):** Warehouse mechanic nobody explains right: your Coin Vault protects a FIXED THRESHOLD, not a percentage. Anything at or below = unraidable. Anything above = exposed to plunder. Chest opens dump into unprotected balance. Keep resources IN chests until you spend. r5tools.io
**Body (Reddit, 500 char):** Warehouse mechanic every new R5 gets wrong: your Coin Vault, Food Warehouse, and Iron Warehouse each protect a FIXED THRESHOLD quantity per level, not a percentage. Anything at or below the threshold is 100% unraidable. Anything above is exposed and plundered proportionally to attacker load capacity and your exposed ratio. Critical: opening resource chests, event mail claims, and quest rewards deposit directly to the UNPROTECTED balance. Do not open resource chests unless you are about to spend the resources on an upgrade queue, training batch, or healing wave. Chests are safe extended storage.
**Body (Discord, 100 char):** Warehouse = fixed threshold, not %. Never open chests until you spend.
**Body (TikTok overlay, 80 char):** Never open resource chests until you spend. They ARE the vault.
**KB source:** `kb/10-economy.md` lines 89-103 (warehouse threshold + chest safety).
**Best day/time to post:** Monday 5:30 PM CT (start-of-week resource habit).
**Related tool:** Profile Studio.

---

## Tip 26 — Faction rotation swaps attacker/defender every week

**Body (X, 275 char):** Rare Soil War faction schedule most R5s do not memorize: Rebels attack Wed / defend Sat in Week 4, then flip to defend Wed / attack Sat in Week 5. Alternates weekly through Week 7. Warlord Missile budget = 1 per week per Warlord, respect 72h cooldown. r5tools.io
**Body (Reddit, 500 char):** Rare Soil War faction schedule most R5s look up week-of when they should be planning off it. Rebels attack Wed / defend Sat in Week 4. Gendarmerie flips to attack Wed / defend Sat in Week 5. Rebels back to Wed attack / Sat defend in Week 6 (Showdown, 30% plunder). Gendarmerie again in Week 7. Every alliance fights exactly one attack round and one defense round per week. Warlord Missile budget = 1 per week per Warlord officer with the 72h skill cooldown; shadow-Warlord rotation gets you Wed AND Sat launches. Season Timeline on r5tools.io shows your faction's schedule.
**Body (Discord, 100 char):** Faction attack/defend flips weekly Wk 4-7. Rebels Wed attack in Wk4+Wk6.
**Body (TikTok overlay, 80 char):** Rebels attack Wed. Then defend Wed. Then attack. Track it.
**KB source:** `kb/06-season-2-frozen.md` lines 270-283 (faction rotation table + weekly cycle).
**Best day/time to post:** Monday 8:30 PM CT (KR morning + start-of-week war planning).
**Related tool:** Season Timeline.

---

## Tip 27 — Alliance Help ladder tops at 300 helps/day

**Body (X, 275 char):** Alliance Help task ladder ends at 300 cumulative helps in one day. Contribution-points cap is at or above 300. Tap every teammate's help button every login. Alliance Center L35 = 23 slots per project. Free speedup you already unlocked. r5tools.io
**Body (Reddit, 500 char):** Alliance Help ladder detail hidden inside the daily task list: 10 / 50 / 100 / 200 / 300 cumulative helps unlock progressive rewards. The 300-help tier is the top rung, meaning the daily contribution-points cap sits at or above 300 helps. Every help = the greater of 0.5% of remaining time or 60 seconds off a teammate's queue. Alliance Center L35 (Age of Oil) unlocks 23 help slots per project. A full 100-member alliance can drain 30+ helps within seconds of a queue start; on a multi-day HQ upgrade this saves hours per day of your teammates' time. Free.
**Body (Discord, 100 char):** Alliance Help caps 300/day. Every login tap all your teammates.
**Body (TikTok overlay, 80 char):** 300 helps per day. Free speedup for everyone.
**KB source:** `kb/08-alliance-systems.md` lines 61-67, 114-126 (help mechanics + L35 slots).
**Best day/time to post:** Tuesday 12:00 PM CT (lunchtime daily-habit reminder).
**Related tool:** Roster Extractor.

---

## Tip 28 — Nuclear Furnace opens Week 5, 10 contributions/day

**Body (X, 275 char):** Season 2 endgame most alliances underprep for: Nuclear Furnace reactivation opens Week 5, 7 days long. Warzone-collective 100% activation bar. 10 contributions/day/player at 5 stamina each. 4 Glacieradon bosses walk in and eat 1% activation every 4 hours. r5tools.io
**Body (Reddit, 500 char):** Season 2 endgame most alliances underprep for because the KB is Week 4 obsessed: Nuclear Furnace reactivation opens Week 5, Day 1, runs 7 days. Warzone-collective goal to hit 100% activation on a shared bar. Per-player contribution: 5 stamina each, 10 contributions/day cap. 4 Glacieradon bosses spawn one per map corner over 4 consecutive days and each walks -1% activation every 4 hours while marching. Bosses only attackable while passing through a city (10 stamina/attack, 5/day/player). Cross-warzone leaderboard determines final rewards. Season Timeline flags it.
**Body (Discord, 100 char):** Nuclear Furnace = Week 5. 10 contribs/day. Glacieradon eats 1% per 4h.
**Body (TikTok overlay, 80 char):** Week 5 = Nuclear Furnace. 10 contribs/day. Or lose rewards.
**KB source:** `kb/06-season-2-frozen.md` lines 297-325 (Week 5 endgame + Glacieradon).
**Best day/time to post:** Thursday 6:00 PM CT (mid-season planning window).
**Related tool:** Season Timeline.

---

## Tip 29 — Ally spy plane thaws you

**Body (X, 275 char):** Frozen and out of coal? Alliance-mate flies a spy plane with heating over your tile. Raises local temp, defrosts you in 5 min. Do NOT push past +38C — heat damage starts at +40C. Save your alliance the rescue by pre-stacking coal. r5tools.io
**Body (Reddit, 500 char):** Frozen with no coal and no way to relocate (relocation is disabled while Frozen)? Your alliance-mate can fly a spy plane with heating enabled over your tile to raise your local temperature and defrost you. Takes the same 5 min above -20C to thaw. Safe ally-heating ceiling is roughly +38C; fire damage risk begins around +40C, so do not push over-heat. This is the primary rescue method when a member's own coal has run out. Best practice: pre-stack coal so you never need the rescue. Freeze Risk Dashboard on r5tools.io flags reds before they need it.
**Body (Discord, 100 char):** Frozen + no coal? Ally spy plane rescues you. Stop at +38C.
**Body (TikTok overlay, 80 char):** Frozen? Ally spy plane = rescue. +38C max.
**KB source:** `kb/06-season-2-frozen.md` lines 67-73 (defrost methods + safe ceiling).
**Best day/time to post:** Wednesday 8:30 PM CT (mid-week Season 2 survival tip).
**Related tool:** Freeze Risk Dashboard.

---

## Tip 30 — Assembly Point placement is a war-round asset

**Body (X, 275 char):** R5 setup call that saves your Rare Soil War: place the Assembly Point NEAR the Alliance Furnace but OUTSIDE the 25x25 blast radius. Evicted defenders auto-teleport back via the flag, land safe, shield up, and re-reinforce the furnace under fire. r5tools.io
**Body (Reddit, 500 char):** R5 setup call that saves your Rare Soil War: place the Alliance Assembly Point marker NEAR the Alliance Furnace but OUTSIDE the 25x25 Warlord Missile blast radius. When a missile impacts and evicts your defenders to random map tiles, they use the Alliance Teleport item to snap back to the tile closest to the Assembly Point. If the AP is inside the blast, Contaminated Land blocks re-shielding for 1 hour and your defenders cannot safely reload. If the AP is outside the blast, they land safe, shield up, and teleport back into reinforcement position. Landing Planner on r5tools.io models it.
**Body (Discord, 100 char):** Assembly Point = outside 25x25 blast. Or your evicted defenders die on landing.
**Body (TikTok overlay, 80 char):** Assembly Point OUTSIDE the missile blast. Non-negotiable.
**KB source:** `kb/06-season-2-frozen.md` lines 240, 252 (Assembly Point placement + missile blast).
**Best day/time to post:** Tuesday 9:00 PM CT (pre-Wed war round R5 checklist).
**Related tool:** Landing Planner.

---

## Verification notes

**X char count discipline:** every X body above measured ≤ 275 chars in draft. Add ~15 chars for URL when scheduling; final tweet-composer will report actual live count. Bodies use straight ASCII quotes; do not smart-quote before posting.

**KB source-line policy:** every claim traces to a specific `kb/*.md` file + line range. When posting, if a number gets challenged in replies, refer commenter to the KB article — do not defend a number without the source citation.

**Tone reminder:** "R5-to-R5" means: peer voice, first-person plural sometimes ("we won"), no marketing "empower your alliance" phrasing. If a draft above sounds like a product landing page it should be rewritten before it goes live.
