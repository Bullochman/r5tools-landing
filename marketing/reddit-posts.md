# r/LastWarSurvival — 5-post authority campaign

Five value-first posts for r/LastWarSurvival. Every post has to land as a helpful reference on its own — the r5tools.io mention is a one-line footer, never the point of the post. Sub culture there is math-heavy, First Fun-skeptical, and generous to R5s who show their work.

---

## Posting schedule

Spaced Mon / Wed / Fri / Sun / Tue so the account doesn't trigger spam heuristics. Keep at least 36h between posts. If any single post gets flagged or removed, add 3 days before the next one.

| Day | Post | Slot | Rationale |
|---|---|---|---|
| **Mon** | Post 1 — Blizzard coal burn math | Warm-up | Math/table post, pure value, low-CTA. Establishes the account as "R5 who does spreadsheets." |
| **Wed** | Post 2 — VS Days points cheat sheet | Reference | Reference-post that gets saved. Long tail — people re-open on Fridays for training multiplier planning. |
| **Fri** | Post 3 — Warlord Missile blast radius correction | Myth-buster | Fri PM is heavy-traffic and the "actually the wiki is wrong" hook drives strong engagement. This is the account's mic-drop. |
| **Sun** | Post 4 — Roster Extractor free tool | Direct promo | Most promotional post. Only fires after 3 authority-building posts. Sunday evening is prep-for-VS-week traffic. |
| **Tue** | Post 5 — Week 5 RSW guide | Timely | Timely — hits before Wednesday RSW window. Sends the last soft signal that r5tools.io is your suite. |

**Peak posting window** for r/LastWarSurvival: **8:00-10:00 PM ET** on all days (US alliances plan for tomorrow's reset, KR alliance members are in morning coffee window at UTC+9). Tuesday post shifts earlier — **6:30 PM ET** — because RSW-planning readers are pre-Wednesday-reset.

**Account hygiene:**
- Comment on 3-5 other threads in the sub between each post (genuine help, no self-links).
- If a mod DMs about promo — respond quickly, acknowledge, ask which posts are OK. Mods here are reasonable if you're not spamming.
- Never crosspost between LWS subs on the same day.

---

## Post 1 — Blizzard coal burn math (MONDAY)

**Title:** I did the math on Week 4 blizzard coal burn and half the R5s in my warzone are stockpiling wrong

**Flair:** Guide

**Body:**

TL;DR at the bottom if you want to skip the math. But the math is the point.

Season 2 Week 4 is when the blizzards go from "annoying" to "your alliance freezes if you didn't prep." Ambient drops to around -30°C on the map, blizzards spike **-15°C to -50°C on top of that** depending on severity, and freeze threshold is **-70°C**. So the moderate blizzards start putting members in freeze range and the severe ones absolutely torch anyone outside a furnace radius.

The part everyone gets wrong is the **coal burn during overdrive**. Alliance Furnace overdrive is a 3-hour window where you burn ~4x the normal rate to keep the extended radius warm during the worst blizzard. Home Heating Furnace has its own overdrive on top of that.

Here's what I actually pulled from testing + community data (KB-cross-referenced):

**Alliance Furnace burn (approx, at L20+):**
| Furnace level | Normal burn (coal/min) | Overdrive burn (coal/min) | 3h overdrive total |
|---|---|---|---|
| L15 | ~140 | ~560 | ~101k |
| L20 | ~240 | ~960 | **~173k** |
| L25 | ~340 | ~1360 | ~245k |

(L1-L19 the burn ramps but the exact per-level curve isn't public. Best guess is roughly linear from ~40/min at L10 to ~240/min at L20 for normal burn.)

**Home Heating Furnace (personal, per member):**
- L30 normal: ~240 coal/min
- L30 overdrive: ~960 coal/min (4x multiplier same as AF)
- 3h overdrive per member: ~173k coal

So for a 50-member alliance where everyone's HHF hits overdrive at the same time during a severe blizzard, you're looking at **~8.6M coal drained across the alliance in one 3-hour window**, plus the ~173k on the AF itself.

**Where R5s go wrong:**

1. They stockpile based on "normal" coal burn — assume 6h of normal, ignore the fact that overdrive can chain across a bad blizzard cluster.
2. They budget AF-only and forget that HHFs also overdrive — the alliance total is dominated by personal furnaces, not the AF.
3. They forget Week 4 is when blizzard severity distribution shifts. Weeks 2-3 are mostly mild-moderate (-15 to -30). Week 4 you start seeing multiple severe (-50°C drop) blizzards per week.

**Practical rule I use in my alliance:**

Stockpile enough for **3 severe blizzards per member across the week** as your minimum. That's about 520k coal per member if HHF is L30. Add a **1.5M coal AF reserve** for the shared overdrive budget. So a 50-member alliance wants ~27M coal in reserve going into Week 4, not the ~10M most R5s think.

**Warlord Missile overhead:**

Also don't forget: 25×25 blast radius, 3-min prep window, if you park inside AF radius (5-tile buffer) you're going to eat missile splash on the AF too. Missile damage doesn't drain coal but wounded troops eat food, which pulls resources from coal spend. Include it in the plan.

TL;DR: **HHF overdrive dominates alliance-wide burn, not AF. Budget 173k coal per member per severe-blizzard overdrive event, not the ~40k you'd expect from normal-burn math.**

If you want a calculator that does this for your specific furnace level and alliance size, I built one at **r5tools.io/coal** (free with code `RONY-FREE`). No login, no email, just plug in your numbers.

Happy to answer questions on the math in the comments — if your numbers are different from mine I want to hear about it, this stuff is hard to nail down from testing alone.

---

**Best time to post:** Monday 8:30 PM ET

**Response strategy — anticipated comments:**

1. **"Your L15 numbers are wrong, I burn ~180/min not 140."** → Great, KB numbers are approximations from community testing. Ask for their FL/HQ and what their reading source is (in-game coal reserve delta over 10 min is the cleanest test). Update the table in a stickied comment if enough people converge on a different number. Own being wrong.

2. **"Overdrive isn't 4x, it's more like 3.5x."** → Same as above — say "you might be right, the KB reference I have says ~4x but that's derived from ratio-testing not published. Do you have a source or a test log?" Never dig in on a specific number when the community has better data.

3. **"You forgot to mention Warlord Missile pings-away when parked inside furnace radius"** → Yes! Great catch. Reply with the ping-away mechanic: missiles retarget to closest legal outside-tile if you're inside a friendly furnace. Doesn't help if the whole hive is in radius but does help edge cases. Add to reply, not to post.

4. **"How do I check my furnace level?"** → Zero-judgment answer. Tap the AF → info tab. HHF is in your city view, ground floor. Point them to /r/LastWarSurvival wiki if they want a walkthrough.

5. **"You just want us to click your link."** → Respond honestly: "Fair. Numbers stand on their own — read the post, don't click anything. If you want a calc later the link is there." Don't get defensive, don't over-explain. Downvotes from cynics are fine; the math post still helps everyone else.

---

## Post 2 — VS Days points cheat sheet (WEDNESDAY)

**Title:** VS Days points cheat sheet (updated July 2026) — which day is actually worth chasing

**Flair:** Resource

**Body:**

Every week half my alliance chat asks "wait what day is training worth 4x again." So I made the cheat sheet. Sharing because I'm tired of pasting it into Discord.

**VS Days = 6-day event, resets weekly. Each day scores different actions. Personal + alliance rankings both matter.**

| Day | Focus | What scores | Multipliers |
|---|---|---|---|
| **Mon — Radar Missions** | Complete radar quests | 1 VP per completion + gathering bonus | Radar refresh gems: **2x on Mon only** |
| **Tue — Growth Day** | Building upgrades, tech research, gear crafting | 1 VP per upgrade + power-gain bonus | Tech research: **1.5x speed** |
| **Wed — Rare Soil War** | RSW captures, digging, hero gear enhancement | 1 VP per capture, 2 VP per RSW hold, hero gear = 3 VP | RSW soil yield: **1.5x** |
| **Thu — Hero Day** | Hero recruitment, awakening, EXP, gear | 1 VP per recruit, 2 VP per awakening stage, 3 VP per gear upgrade | Hero EXP: **2x** |
| **Fri — Training Day** | Troop training + healing | 1 VP per 1000 troops trained, 2 VP per 5000 healed | Training speed: **4x** (yes, four) |
| **Sat — Score Day / Enemy Buster** | Kills, dig steals, city captures | 2 VP per T10 kill, 3 VP per T11 kill, 4 VP per city hold-hour | Attack: **+15%**, kill points count double at server war time |

**The 4x Friday multiplier is the single biggest lever in the week.** If you have any troop-training reserve at all, dump it Friday and you get 4x the speed-up value. The typical planning mistake is to train troops throughout the week and be "caught up" by Friday — you leave a lot of value on the table. Better plan: hoard training queue Mon-Thu, blast Friday.

**Saturday's 4 VP per city hold-hour** is why alliance city holds matter for VS. If you cap a L4 city Saturday morning and hold 12h, that's 48 VP for the alliance, plus kill points from anyone trying to take it back. This is why cities you'd normally trade for peace should be held aggressively on Saturday.

**The math on daily VP targets:**

- Personal top-10 in warzone: ~50k VP for the week is a rough floor. Not per day — for the week.
- Alliance top-3: needs ~1.5M VP alliance-wide across 6 days.
- Personal MVP (top 1 in alliance): usually 8-15k VP is enough in a mid-tier alliance.

**Where R5s waste VP:**

1. **Wednesday research on Tuesday.** If you have a tech ready to research, wait until Tuesday morning — 1 VP per completion + the 1.5x speed multiplier means it finishes earlier and you can chain a second research.
2. **Hero gear upgrades on random days.** Save for Wednesday (3 VP per upgrade). Wednesday RSW + hero gear = double-dip.
3. **Training in trickle across the week.** As above — hoard for Friday.
4. **Saturday city drops** because "we don't want to fight." VS Day scoring is why you take the fight. Even losing a Saturday city battle after 6h hold is +24 VP.

**The one everyone forgets:** **radar refresh gems are 2x on Monday only.** If you're going to refresh, do it Monday. Nobody remembers this.

---

If you want a live tracker that carries these tips into your actual VS week (Discord-ready PNG export at end of week), I built one at **r5tools.io** — free with `RONY-FREE`. But honestly this table alone is 80% of the value. Save it and reference during planning.

If your alliance's VS scoring is different from what I described, drop it in comments — some servers have slightly different point values (esp. for T-tier kills on Saturday). Would love to normalize the sheet.

---

**Best time to post:** Wednesday 8:30 PM ET (Wednesday is RSW day so LWS traffic is elevated all evening)

**Response strategy — anticipated comments:**

1. **"My server gives 3 VP per T11 kill not 3, and 2 per T10."** → Point value drift by server is real. Ask which server they're on and note in a top comment "some servers report X — the above is what I see in warzone 2007." Don't correct anyone whose numbers are close.

2. **"Where did you get the 4x training multiplier from?"** → Cite the KB — Friday training bonus is baseline VS Days mechanics, confirmed across multiple community sources. Offer to link the exact KB section if they DM. Never say "trust me" — always offer a source.

3. **"What about Alliance Duel scoring?"** → Alliance Duel is a separate weekly event that overlaps VS on some servers. Reply: "Great question, Alliance Duel is a different event — separate cheat sheet coming. Short version: top-32 warzone gate exists (many R5s don't know), and the scoring is heavier on kills than VS." Signals you have more content coming.

4. **"Is there a mobile-friendly version of this?"** → Yes — the r5tools.io VS tracker renders on phones. Answer honestly, don't push, just note.

5. **"You forgot [random VS mechanic]"** → Genuinely thank them, add to reply, edit post with credit. This is how you build authority — you don't have to know everything, you have to be receptive when corrected.

---

## Post 3 — Warlord Missile blast radius (FRIDAY)

**Title:** Warlord Missile blast radius is 25×25 tiles, NOT 15×15 — the wiki is wrong and it changes your hive layout

**Flair:** Discussion

**Body:**

Half the alliance-planning content out there uses 15×15 or 20×20 for the Warlord Missile blast. I've tested this three times and cross-referenced with three community sources and **it's 25×25 tiles centered on the target**. That's a 12-tile radius from center in every direction, meaning a single missile covers **625 tiles**. This matters a lot for hive layouts.

**The actual mechanic:**

1. Warlord fires a missile at a designated tile (or coord picked by AI targeting).
2. **3-minute prep window** — a warning shows on the map. Everyone inside the 25×25 zone has 3 minutes to move.
3. If you're still in the blast at detonation: heavy troop wounds + city damage. **Not lethal** if you're inside a friendly Alliance Furnace radius (missiles ping-away to closest legal outside-tile if AF is protecting you — this is the load-bearing edge case).
4. Missiles come in clusters — usually 3-5 per Warlord event, staggered.

**Why 25×25 vs 15×15 matters for your hive:**

Take a tight-hive layout: 5×5 MG blocks packed close together to minimize walk-back time. Great for defense response. If the whole tight-hive fits in a 15×15 (which it does — 3x3 grid of 5×5 MGs is exactly 15×15) then one missile eats the entire alliance. **In the actual 25×25 mechanic, that same one missile ALSO catches the 5 tiles of buffer you thought were safe on every side.**

Megahive is the opposite tradeoff: 8-ring spread cluster, ~40+ tiles across. Missiles catch a much smaller fraction of the alliance per hit, but your walk-back times are 2-3x longer for rally response.

**The tight-hive math (assuming 25×25 blast, 3 missiles per event):**
- 3 missiles × 625 tiles = 1875 tile-hits
- Tight-hive (3x3 grid of 5x5 = 15×15 footprint = 225 tiles) fits entirely inside blast
- Overlap between missile targets = typically 30-60% → effective hits ~1100-1300 unique tiles
- If your hive is 225 tiles, 100% of it eats blast damage on all 3 missiles → severe alliance-wide wounds

**The megahive math (same 3 missiles):**
- 3 missiles × 625 = 1875 tile-hits
- Megahive spread footprint = ~2000+ tiles
- Effective coverage of alliance = maybe 40-60% per missile → 60-80% of the alliance eats some blast, but each individual member sees maybe 1 missile average, not 3

**Practical decision framework:**

- **Solo warzone, low-threat neighbors:** tight-hive is fine. Missile events are rare and you eat the loss.
- **Contested warzone with active Warlord neighbors:** megahive. The walk-back time cost is worth the missile-damage insurance.
- **Preparing for Cross-Server War:** definitely megahive — missiles cluster during CSW and tight-hive alliances are missile-food.

**The ping-away mechanic that nobody mentions:**

If your city is inside a **friendly** Alliance Furnace radius when the missile lands, the missile retargets to the closest legal tile outside the AF radius. In practice this means placing your hive so that the AF radius covers ALL member cities is a partial missile-defense (you eat the 3-min warning, but the actual detonation shifts). Not a complete defense — if the whole cluster is inside AF radius, the missile picks a tile just outside the ring, which still catches your outermost members.

**The 3-min prep window is where most alliances lose members.** People are logged out, don't see the ping, don't move. Set up a Discord bot that pings when a Warlord is spotted in your warzone. Buys you the response time.

**Sources on 25×25:** community-tested by three separate posters (linked below in comments) + KB reference article on Season 2 mechanics. If you've tested and got a different number I'd love to see it.

---

If you want a visualizer that shows missile blast overlay on your hive layout, r5tools.io has one — free, no signup. But the mechanic write-up above is the important part. The visualizer just shows you the blast on your own coords.

**Bottom line:** if you were laying out your hive based on 15×15, add 5 tiles of buffer to every edge. Or go megahive. Either way, don't get caught with the wrong assumption.

---

**Best time to post:** Friday 8:30 PM ET

**Response strategy — anticipated comments:**

1. **"I tested and it's 20×20 not 25×25."** → Ask for their test method. Community consensus varies between 20 and 25 tiles depending on how you measure (edge-to-edge vs radius from center vs "did this tile take damage"). Reply with all three interpretations. This is genuinely fuzzy territory — own that.

2. **"Ping-away is only for T3+ AF, not any level."** → Investigate before responding. Reply: "Interesting, I thought it worked at any AF level. Let me check the KB and get back to you." Then check and follow up. Being wrong publicly is fine if you correct it — being wrong and stubborn is what loses the sub's trust.

3. **"Megahive is bad because of Nuclear Furnace requirement in W6."** → Great point — the Nuclear Furnace mid-season change alters the calculus. Add a follow-up comment: "Yeah, W6+ Nuclear Furnace changes the ring math, this analysis is mostly W1-W5. Post-Nuclear the trade shifts back toward tighter clusters because the extended radius negates some of the walk-back cost."

4. **"How do I know if a Warlord is targeting me?"** → Ping shows on map, but you need to be looking. Discord bots exist that poll warzone events. Answer helpfully, don't pitch anything.

5. **"You're just trying to get us on your site."** → "Fair. Post stands on its own — read the mechanics, ignore the link. If you want a visualizer later it's there. If not, you know the 25×25 rule now, which is the actual value."

---

## Post 4 — Roster Extractor free tool (SUNDAY)

**Title:** Free tool I built: alliance video → CSV roster in 2 minutes (Claude vision, costs me $0.45/scan so free tier is limited)

**Flair:** Tool

**Body:**

Backstory: my alliance has 94 members. Every planning cycle — new season, RSW comp, hive re-layout — I need the roster in a spreadsheet. Rank, HQ level, total power, name. In-game there is no export button. So I was manually typing it out. Multiple hours per pass.

I got fed up and built this: **upload a screen recording of you scrolling through your alliance member list, get back a CSV**.

**The flow:**

1. Open Last War → Alliance → Members list
2. Start screen recording (iOS: swipe down, screen record button. Android: same rough gesture)
3. **Start recording BEFORE you scroll** — the first frame needs to catch R5 crown + Warlord sword
4. Scroll slowly, ~2 seconds per screen. 94 members = ~90 second video.
5. Stop recording, upload to the tool
6. Wait ~90 seconds while ffmpeg extracts frames + Claude reads them
7. Get a table you can edit + a CSV/JSON download

**What the extraction table looks like:**

```
Rank  | Name              | HQ | Power     | Notes
R5    | TINO              | 35 | 61.2M     |
R4    | KIWI              | 35 | 58.4M     | Warlord
R4    | RONY              | 34 | 52.1M     |
R4    | THOR G            | 33 | 44.7M     |
R3    | ...               | .. | ...       |
```

You can edit any cell before downloading. Rank sorts happen automatically. Duplicates from Unicode name variants (Đ / Ð / D) get deduped via NFKD normalization.

**Honest limitations:**

- Fast scrolling = missed rows. Scroll slowly.
- Vacant slots get filtered out (they'd otherwise show up as blank rows).
- HQ level capped at 35 (that's the max — any OCR output above 35 gets clamped).
- Two similar names + same power = likely a duplicate, gets merged. Rarely wrong but check the diff.
- On a fast-scrolled 94-member video I get ~85-93% accuracy first pass. On a slow scroll it's ~95-98%.

**Cost transparency:**

Each extraction runs the video through Claude Sonnet 4.6 vision. At my current frame sampling (1 frame every 2 seconds), a 90-second video costs me about **$0.45 in Anthropic API fees per extraction**. That's why the free tier is limited — I'd bankrupt myself if I gave unlimited free scans. Free code `RONY-FREE` gives you **3 extractions per month**. After that it's a $10 unlock for unlimited use.

I'm also testing a **$5 premium tier** where a second Claude pass reviews and corrects your extraction (real 98%+ accuracy). Not live yet — probably next week.

**Version history saved:**

New in v0.2: it stores your roster history. Upload the same alliance twice a month and you get a Chart.js line chart of power gain per member over time. Great for R4 promotion decisions ("who's actually growing?"). Backup button lets you download all snapshots as JSON in case Railway's ephemeral disk wipes (which it does periodically on the free tier).

**Where the code lives:** it's on my GitHub, MIT licensed, run it locally if you want.

Try it: **roster.r5tools.io**. Free code `RONY-FREE`. No signup, no email, just upload.

Happy to answer questions on the flow, cost model, or extraction quality. If your roster comes out garbage on first try I'll dig into the video with you — I want this tool to actually work for people.

---

**Best time to post:** Sunday 8:00 PM ET (Sunday evening = weekly alliance-planning window, this is exactly when someone wants a fresh roster CSV)

**Response strategy — anticipated comments:**

1. **"Why not just use screenshots not video?"** → Video is way easier to record than 20 screenshots. Also ffmpeg handles frame extraction cleanly. That said — screenshot support is on the roadmap for people who prefer it. Ask if that would unblock them.

2. **"How do I know you're not stealing my roster data?"** → Legitimate question. Answer honestly: the video gets uploaded to my Railway server, ffmpeg-processed, frames get sent to Anthropic's API, then the server deletes the video + frames when the extraction completes. Roster data is stored in a SQLite DB only if you click "Save Snapshot." Otherwise it's ephemeral. Source is public, they can verify.

3. **"$10 unlock is a lot for a free game."** → Fair. Explain the free tier gives 3 extractions per month which is enough for most alliances (roster doesn't change that fast). The $10 is for people who want to track weekly or process multiple alliances (scouts, meta-observers).

4. **"Does this work with KR names / non-Latin scripts?"** → Yes — tested with KR names, JP, CN. NFKD dedup handles Unicode variants. If a specific script fails, DM me a sample and I'll debug.

5. **"What if the video has a UI popup covering members?"** → Extraction skips those frames. If a popup covers members for the whole video, redo the recording without the popup. Not user-friendly but honest.

6. **"This is pretty cool, actually."** → Say thanks. Don't overplay. Move on.

7. **"Are you Anthropic-affiliated?"** → No. I'm an R5 who happens to use their API for this tool. Full transparency.

---

## Post 5 — Week 5 RSW alliance guide (TUESDAY)

**Title:** Week 5 Rare Soil War — what changes vs Week 4 and why alliance timing suddenly matters more

**Flair:** Guide

**Body:**

Wednesday is RSW day so this is timely. If your alliance treats Week 5 RSW the same way you treated Week 4, you're leaving a lot of soil on the table. Here's what changes and how to prep.

**Recap on RSW basics:**

- Rare Soil War fires **Wednesdays** during S2 (some servers Wed+Sat, most just Wed)
- Rare Soil tiles spawn on the map with tiered yields
- You dig them for personal + alliance points
- **Blizzard-and-plunder mechanic:** blizzards can freeze rare soil tiles mid-dig, and enemy alliances can plunder frozen digs
- Weekly-refreshed high-tier tile count (T5, T6, T7 tiles increase in count as the season progresses)

**What's different in Week 5:**

**1. T6 tile count doubles.**

Weeks 1-4 have a small number of T6 tiles per warzone (~4-6). Week 5 that jumps to ~10-12. This changes the alliance strategy — Weeks 1-4 you're contesting a few T6 tiles hard, Week 5+ you're spread thinner but every alliance has one.

**2. Blizzard severity ramps.**

Week 5 blizzards are more likely to be moderate-to-severe (-30 to -50°C). A frozen T6 dig sitting in a severe blizzard zone is a plunder target. Alliance ministers need to actively monitor frozen digs and pull members off before enemy rallies land.

**3. Alliance point weight shifts.**

Personal RSW scoring stays roughly the same but **alliance-wide RSW ranking weight in the seasonal event scoring goes up** in Week 5 as the season heads toward Week 6-8 climax. If your alliance is bottom-half in the warzone RSW ranking, Week 5 is when you close the gap or fall out of top-3 contention.

**4. VS Days Wednesday scoring stacks.**

Wed RSW happens ON Wed VS Day. RSW captures = 1 VP, RSW holds = 2 VP, and hero gear upgrades (also 3 VP) can be timed with your soil-yield bonus (1.5x). So the R5s doing weekly planning are staging hero gear materials Mon-Tue and blowing them on RSW day for triple-dip.

**Actionable prep for Wednesday:**

**Monday-Tuesday:**
- Confirm which of your R4s can lead rallies during the RSW window (2h window typically)
- Assign digging priority: R4s and top-power R3s on T6 tiles, mid-power on T5, lower-power on T4
- Pre-position: members should move within walking distance of their assigned tile-tier before Wednesday morning
- Stockpile healing speedups — you WILL get plundered on at least one dig

**Wednesday morning:**
- Alliance-wide ping 30 min before RSW window
- Assign scouts to watch enemy alliance moves (which of their R4s are moving = which tile they're going for)
- If freeze forecasts show severe blizzard within 30 min of a dig start, DON'T start that dig (or start on the tile-edge so you can walk back to warmth)

**During RSW:**
- Rally leaders monitor Discord/in-game chat for freeze warnings
- Pull members off frozen digs BEFORE enemy rally lands (5 min warning is usually enough)
- Chain digs: as soon as one member finishes their dig, next member rotates in on the same tile if it's still yielding

**Wednesday evening:**
- Log alliance points, note who over/under-performed
- Adjust Week 6 assignments if RSW roles need reshuffling

**The alliance-timing lever:**

Most alliances treat RSW as "everyone go dig, good luck." The alliances that top-3 in seasonal RSW ranking assign roles ahead of time and coordinate the freeze pull-offs. Your R4 minister slots (Strategy, Interior, Security) matter here — Strategy minister gets a rally-marching-speed bonus that's load-bearing for time-sensitive dig defenses.

**One thing to fix if you haven't:**

Every alliance should have a **tile-assignment sheet** for RSW. Not a Discord message, an actual sheet. Names → tile-tier → coord range. Members check the sheet before the window opens and know where to march. Cuts response time in half.

---

If you don't have a tool for tile assignments, I built a Landing Planner at **r5tools.io** that does rank-tier ring assignment (R5+titled-R4 to inner rings for rally coordination, R3s on outer for digging, etc.) — free with `RONY-FREE`. But even a Google Sheet works. The point is you write it down before Wednesday.

Good luck tomorrow. Drop your RSW results in comments Wed evening — always curious how other alliances are doing.

---

**Best time to post:** Tuesday 6:30 PM ET (earlier than the other posts — this needs to hit the pre-Wednesday-planning window)

**Response strategy — anticipated comments:**

1. **"Our warzone has RSW on Wed AND Sat, is Sat different?"** → Yes — Sat RSW usually has slightly reduced yields but longer window. Not all warzones run Sat RSW. Check with your warzone's veteran R5s.

2. **"How do you actually pull members off a dig before enemy rally lands?"** → In-game: tap the tile, tap "Cancel dig," troops walk back. 5-min buffer is usually enough. If enemy rally is <3 min out, too late — you eat it.

3. **"What if my alliance is 20 members, not 50, do we even bother with RSW?"** → Absolutely. Small-alliance RSW is different — you focus 1-2 T6 tiles hard rather than spreading. Personal rankings still count. Actually more manageable coordination.

4. **"You said 'blizzard-and-plunder' — where's that in the KB?"** → It's the S2 RSW mechanic where blizzards freeze active digs and enemy alliances can plunder the frozen state. Reddit posts + community wiki cover it. Happy to link sources.

5. **"Do titled R4 ministers actually matter for RSW?"** → Strategy minister's march-speed bonus can be the difference between reaching a plundered dig in time or not. Interior minister's construction speedup doesn't matter for RSW day but matters for the coal reserves you burn recovering wounded troops. Yes, it matters.

6. **"Landing Planner works for RSW tile assignment or just hive layout?"** → Primarily hive layout, but the rank-ring output translates cleanly (R5+R4 to high-tier tile assignments, R3s to mid-tier). Not perfect for RSW-specific use but the ring output is a starting point. Working on a dedicated RSW tile-assigner next.

---

## Cross-post etiquette + follow-through

- **Do not crosspost these to other LWS-adjacent subs.** r/LastWarSurvival mods are watchful for the same content in multiple subs.
- **Do reply to every top-level comment for 24h after posting.** Sub culture rewards responsiveness. Silence looks like drive-by promo.
- **Do keep the `RONY-FREE` code active and honored.** If someone DMs saying it doesn't work, respond fast and unblock them.
- **Don't post 5 in a row and disappear.** Between posts, comment genuinely on 3-5 other threads. Answer questions on other people's math. Be the R5 who happens to run a tool suite, not the tool suite that pretends to be an R5.

If a post underperforms (< 20 upvotes in first 6h), don't repost. Move on, try a different angle next week.

If a post overperforms (100+ upvotes, mod-flaired), reply on your own post with an update or a follow-up mini-guide 48h later. Keeps it in the sub's recent-activity feed longer.

**Author note for Evan:** the sub is helpful and math-heavy but hostile to anything that reads as a sales pitch. The math has to be right, the tone has to be conversational-R5, and the CTA has to be a footer not a headline. If you feel weird posting any one of these — trust that instinct and rework it. Better to skip a week than to burn the account.
