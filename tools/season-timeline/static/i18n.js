/**
 * LWS Season Timeline — i18n dictionary (EN + KR).
 *
 * KR-first: every visible string in index.html renders through this dictionary via
 * data-i18n / data-i18n-placeholder attributes. Do NOT hardcode English in the DOM.
 *
 * KR terminology sourced from:
 *   - LWS_Knowledge_Base/kb/15-glossary.md (canonical KR ↔ EN table)
 *   - LWS_Knowledge_Base/kb/06-season-2-frozen.md (season-specific vocab)
 *   - LWS_Knowledge_Base/kb/09-events.md (event stack)
 *   - LWS_Knowledge_Base/kb/10-economy.md (speedup / resource save-up vocab)
 *
 * When a term is missing from the glossary, cite the namu.wiki / DCInside source in a comment.
 */
(function (global) {
  'use strict';

  var I18N = {
    en: {
      // ---- Chrome ----
      brand: 'R5TOOLS.IO',
      brandSub: 'LWS Suite',
      toolName: 'Season Timeline',
      langToggle: '한국어',
      // ---- shared suite-nav (r5tools.io toolkit strip) ----
      suiteNavPart: 'Part of the ',
      suiteNavToolkit: ' Last War: Survival alliance toolkit — ',
      navLanding: 'Landing',
      navHeat: 'Heat',
      navFreeze: 'Freeze',
      navCoal: 'Coal',
      navCity: 'City',
      navTimeline: 'Timeline',
      navHive: 'Hive',
      navRoster: 'Roster',
      navProfile: 'Profile',
      navVsDays: 'VS Days',
      betaFeedbackPill: '🚧 BETA · Feedback',

      footerCred: 'Powered by the LWS Knowledge Base',
      footerHome: 'r5tools.io',

      // ---- Header ----
      // KB: [[06-season-2-frozen]] — the tool anchors to Season 2 (Polar Storm / Frozen)
      title: 'Season 2 Timeline · Polar Storm',
      subtitle: 'T-minus countdown + prep checklist for the whole alliance.',

      // ---- Config panel ----
      configHeading: 'Alliance Setup',
      configSeasonStart: 'Season 2 start (server time)',
      configSeasonStartHint: 'When does your warzone\'s Season 2 map transition happen? Community reports ~13:00 server time for many warzones — ask your R5 for the exact minute.',
      configAllianceName: 'Alliance name',
      configAllianceTag: 'Alliance tag',
      configWarzone: 'Warzone (optional)',
      configSave: 'Save',
      configSaved: 'Saved.',

      // ---- Countdown ----
      countdownLabel: 'Until Season 2 launch',
      countdownUntil: 'Until',                              // v0.4: prefix built from LWSSeasons.name
      countdownDay: 'd',
      countdownHour: 'h',
      countdownMin: 'm',
      countdownSec: 's',
      countdownPreseason: 'Pre-season',
      countdownLive: 'LIVE — Season 2 is running',
      countdownTPlus: 'Day',
      configSeasonStartShort: 'start (server time)',        // v0.4: appended to "<Season Name>"

      // ---- v0.4 placeholders (shown when a season has no timeline milestones yet) ----
      placeholderInSeasonTitle: 'Timeline coming soon',
      placeholderInSeasonBody: 'This season doesn\'t have per-week milestones in the LWS Knowledge Base yet. Pre-season prep tasks still apply.',

      // ---- v0.5 Season 7 placeholder (real KB-cited copy, not a generic stub) ----
      // KB: kb/07-future-seasons.md — S7 confirmed launch ~August 2026 via YouTube signals
      // 2026-07-09 + 2026-07-13; actual leak pulled within 24h. No mechanics confirmed as of 2026-07-15.
      s7ComingTitle: 'Season 7 launches ~August 2026',
      s7ComingBody: 'Full timeline support arrives when First Fun publishes S7\'s mechanics. Two YouTube signals from ~2026-07-09 and ~2026-07-13 confirm launch this August, but the actual leak was pulled within 24 hours before being indexed. No theme, hero rotation, resource list, or map layout is confirmed as of 2026-07-15. Pattern-inference from S3–S6: 2-week pre-season + 8-week main season; Hero Awakening rotation W1/W3/W6 (F2P-only per permanent monetization shift mid-S6); faction system likely retained; T12 troops possible at celebration week (overdue by community consensus — Whiteout Survival shipped T12 April 27, 2026). Pre-season universal prep still applies — see tasks below. Track: r5tools.io',
      s7ComingCountdown: 'S7 Countdown (estimated)',

      // ---- Category legend ----
      catEconomy: 'Economy',
      catMilitary: 'Military',
      catSpatial: 'Spatial / prep',
      catEvent: 'Event day',

      // ---- Timeline / Gantt ----
      timelineHeading: 'Timeline',
      timelineTaskCol: 'Task',
      timelineDayCol: 'Day',
      timelineCategoryCol: 'Category',
      timelineDoneCol: 'Done',

      // ---- Per-member viewer (v0.3) ----
      viewerLabel: 'Viewing tasks for:',
      viewerSyncSyncing: 'Syncing...',
      viewerSyncSaved: 'Saved · synced',
      viewerSyncLocal: 'Saved locally (offline)',
      viewerNoMember: 'Import a roster first, then pick a member to track their tasks.',

      // ---- Task labels — pre-season (T-minus) ----
      // Every task cites the KB article that justifies it.
      taskSaveSpeedupsTitle: 'Save all speedups',
      // KB: [[10-economy]] speedups score double when timed to Arms Race phase overlap
      taskSaveSpeedupsBody: 'Stop spending Construction / Research / Training speedups. Universal too. They will double-score on Day 1 during the first Arms Race phase overlap.',
      taskFinishHqTitle: 'Finish HQ upgrade before launch',
      // KB: [[06-season-2-frozen]] High-Heat Furnace requires HQ 30
      taskFinishHqBody: 'Any HQ upgrade started after launch is coal you can\'t spend on furnaces. Aim to have your target HQ level (25 min, 30 for High-Heat Furnace) locked in.',
      taskStopBoxesTitle: 'Stop opening resource boxes',
      // KB: [[10-economy]] "do not open resource chests unless you are about to spend the resources" — exposed pool is raidable
      taskStopBoxesBody: 'Resources from opened chests land in the exposed pool. Hold every box until Day 1 so the influx feeds furnace + factory builds inside the season, not raiders in the off-season.',
      taskTrainTroopsTitle: 'Top up troop training',
      // KB: [[09-events]] Fri Total Mobilization × Arms Race Unit Progression = waterfall training
      taskTrainTroopsBody: 'Fill barracks / missile / aircraft queues so completions land inside a Day-1 Arms Race Unit Progression phase for the double-score.',
      taskChooseCoordsTitle: 'Pick landing coordinates',
      // KB: [[06-season-2-frozen]] outer corners = -15 °C ambient, safest; center = -80 °C
      // Retained for backward compatibility with any deep-links; UNIVERSAL_TASKS now uses ...Generic below.
      taskChooseCoordsBody: 'Agree with R5 where the hive lands. Corners are warmest (-15 °C ambient); anywhere inside the -50 °C ring needs Alliance Furnace coverage from hour one.',
      // Season-agnostic body — used by UNIVERSAL_TASKS (each per-season block adds its own specific coord task)
      taskChooseCoordsBodyGeneric: 'Agree with R5 where the hive lands. Landing choice depends on season — see season-specific coord task below.',
      taskStackRadarTitle: 'Stack radar missions',
      // KB: [[06-season-2-frozen]] Day-1 priority list — stack radar tasks pre-season for guaranteed coal
      taskStackRadarBody: 'Do not clear radar missions before the season opens. They cash out on Day 1 for guaranteed Coal rewards.',
      taskAllianceHelpTitle: 'Wake the roster',
      // KB: [[06-season-2-frozen]] Alliance Furnace needs ~20 reinforcements to activate on Day 1
      taskAllianceHelpBody: 'Confirm 20+ members will be online at the map transition. Alliance Furnace needs ~20 reinforcements to activate; short of that, the hive spends hour 1 frozen instead of building.',

      // ---- Task labels — Day 1 ----
      taskD1RelocateTitle: 'Day 1 · Relocate the hive if needed',
      // KB: [[06-season-2-frozen]] free alliance-relocation trick — shift Assembly Point, members teleport free
      taskD1RelocateBody: 'If the drop is crowded or hostile, use the Assembly Point free-relocation trick to move the whole hive without personal teleports.',
      taskD1PlaceAFTitle: 'Day 1 · Place Alliance Furnace',
      // KB: [[06-season-2-frozen]] R4/R5 places on Level-1 territory, 20 reinforcements to activate, no build delay
      taskD1PlaceAFBody: 'R4/R5 drops the Alliance Furnace on a Level-1 territory at the hive center. Garrison 20+ reinforcements to activate — no build-time delay after activation.',
      taskD1HighHeatTitle: 'Day 1 · Build your High-Heat Furnace',
      // KB: [[06-season-2-frozen]] L1 = +5.5 °C / +8 °C OD; VR curve starts at 100
      taskD1HighHeatBody: 'Every member with HQ 30 builds their personal High-Heat Furnace. L1 gives +5.5 °C activation / +8 °C overdrive and 100 Virus Resistance.',
      taskD1TitaniumTitle: 'Day 1 · Build Titanium Alloy Factory #1',
      // KB: [[06-season-2-frozen]] +720 titanium/hr per level; Factory 2 unlocks at L15 of #1
      taskD1TitaniumBody: 'Factory #1 unlocks the +720 titanium/hr baseline. Push it to L15 to unlock Factory #2 — that\'s the first-two-week priority.',
      taskD1BlizzardToggleTitle: 'Day 1 · Enable "auto-activate in blizzard"',
      // KB: [[06-season-2-frozen]] High-Heat Furnace auto-blizzard toggle — recommended Day 1
      taskD1BlizzardToggleBody: 'Flip the auto-activate-in-blizzard toggle on your High-Heat Furnace. Wk1–2 blizzards drop -30 °C on top of ambient; Wk4 hits -70 °C.',
      taskD1WandererTitle: 'Day 1 · Save Doom Walker first-kill for post-transition',
      // KB: [[06-season-2-frozen]] Wanderer coal reward only pays out post-map-transition; L180 = ~200k coal
      taskD1WandererBody: 'Do NOT kill the highest-level Doom Walker before the map transitions. The coal reward only pays out post-transition — a L180 kill is worth ~200,000 coal.',

      // ---- Task labels — In-season (Week 1-8) ----
      // KB: [[06-season-2-frozen]] cities table — L1 unlock W1 day 3+12h
      taskW1CityTitle: 'Wk 1 day 3 · L1 city (Village) unlocks',
      taskW1CityBody: 'Village captures open. First seasonal capture MUST be a Level-1 Dig Site; from there every capture must be adjacent to existing alliance territory.',
      // KB: [[06-season-2-frozen]] Wk3 Faction Awards event — vote Rebels vs Gendarmerie
      taskW3FactionTitle: 'Wk 3 · Faction Awards vote',
      taskW3FactionBody: 'Warzones vote themselves into Rebels or Gendarmerie. 8 warzones split 4-and-4. This decides who you fight for the rest of the season.',
      // KB: [[06-season-2-frozen]] Wk4 -70 °C blizzard runs concurrently with Rare Soil War opening
      taskW4RareSoilTitle: 'Wk 4 · Rare Soil War prep',
      taskW4RareSoilBody: 'The -70 °C blizzard runs concurrently with the Rare Soil War opening. Alliance Furnace and every personal furnace need overdrive coal budgeted for Wed + Sat war windows.',
      // KB: [[06-season-2-frozen]] Warlord Missile 25×25 tiles — park 5 tiles from own furnace
      taskW4MissileTitle: 'Wk 4 · Park 5 tiles from your Alliance Furnace',
      taskW4MissileBody: 'Warlord Missile blast radius is 25×25 tiles and creates Contaminated Land (no shields) for 1 hour. Reposition your own base at least 5 tiles from the Alliance Furnace before Wk4.',

      // ---- Wk 5-8 in-season tasks (KB: [[06-season-2-frozen]] end-game phase) ----
      taskW5SoilRoundTitle: 'Wk 5 · Rare Soil War round (twice-weekly ongoing)',
      taskW5SoilRoundBody: 'Rare Soil War rounds run Wed + Sat through end of season. Alliance Furnace + all personal furnaces on overdrive during war windows. Coordinate defense rotation among R4s.',
      taskW5GroupingTPTitle: 'Wk 5 · Coordinate cross-server Grouping Teleport',
      taskW5GroupingTPBody: 'Free Grouping Teleport (available from Wk 3) is the vehicle for cross-server attacks + retreats. R5 decides which server hops are worth the 5-min cooldown; announce in Discord Wed morning before the war round.',
      taskW6GlacieradonTitle: 'Wk 6 · Glacieradon boss tracker',
      taskW6GlacieradonBody: 'Four Glacieradon spawn and march toward the Nuclear Furnace at map center. They can be attacked only when passing through cities — daily attempt limits. Assign one R4 to publish daily boss-position updates.',
      taskW7SiegePrepTitle: 'Wk 7 · Nuclear Furnace siege prep',
      taskW7SiegePrepBody: 'End-game reward flow around the Nuclear Furnace siege is a KB open question — mechanics not fully documented. Prep: pool coordinated rally speedups, refill hospitals, healing supply on standby.',
      taskW8NuclearSiegeTitle: 'Wk 8 · Nuclear Furnace / Capitol siege push',
      taskW8NuclearSiegeBody: 'Final boss cycle. All hands: Glacieradon burn-down, Capitol contest, final Rare Soil deposit. KB gap: exact reward-flow mechanics unpublished — verify in-game and share to alliance chat.',

      // ============================================================
      // ---- Season 1 (Crimson Plague) task labels ----
      // KB: kb/05-season-1-crimson-plague.md §5, §7, §14, §16.1-16.8
      // ============================================================
      taskS1D3CornerTitle: 'Pick corner-warzone landing near a friendly Stronghold',
      taskS1D3CornerBody: 'S1 requires connected Stronghold chain (§7) to declare on Cities. Corner cells are the safest wall to defend.',
      taskS1D1VriTitle: 'Day 1 · Rush Virus Research Institute L1',
      taskS1D1VriBody: 'VRI is the only meaningful Virus Resistance source (+10,000 max at L30). Under-VR damage collapses 60-99%. Start immediately.',
      taskS1D1ProteinTitle: 'Day 1 · Activate Protein Farm',
      taskS1D1ProteinBody: 'Primary seasonal food source; unlocks at season start alongside VRI (§16.1).',
      taskS1W1D3L1CitiesTitle: 'Wk 1 D3 · Level-1 Cities unlock',
      taskS1W1D3L1CitiesBody: 'Genetic Recombination event opens same day (§16.1). First city captures require Stronghold adjacency.',
      taskS1W1D4KimberlyTitle: 'Wk 1 D4 · Kimberly Rocket Shadow weapon unlocks',
      taskS1W1D4KimberlyBody: 'Tier-5 Kimberly required to equip. Exclusive Weapon 7-day battle pass; save shards.',
      taskS1W2VrTargetTitle: 'Wk 2 · Hit VR target 1,500-2,000 for Stronghold captures',
      taskS1W2VrTargetBody: 'Rally leaders MUST meet the Stronghold VR gate (§5) or the rally deals ~0 damage. Farm accounts front, VR-stacked leaders behind.',
      taskS1W2L2CitiesTitle: 'Wk 2 D3 · Level-2 Cities unlock',
      taskS1W2L2CitiesBody: 'Adjacency chain via owned Strongholds required (§16.1).',
      taskS1W2CorruptorTitle: 'Wk 2 · Prep Corruptor kill squads',
      taskS1W2CorruptorBody: 'Each Military Stronghold has a Corruptor NPC that auto-infects regardless of VR (§16.8). Use tank-frontline formation.',
      taskS1W3D2WarzoneExpTitle: 'Wk 3 D2 · Warzone Expedition opens',
      taskS1W3D2WarzoneExpBody: 'Place up to 4 outposts on foreign warzones (max 1 per warzone). Outposts unlock at Stronghold levels 2/4/6/8.',
      taskS1W3MilitaryBasesTitle: 'Wk 3 · Military Bases unlock',
      taskS1W3MilitaryBasesBody: 'Alongside Warzone Expedition (§16.1). Secure adjacent territory for outpost placement.',
      taskS1W4WarzoneDeclarationTitle: 'Wk 4 D1 · Warzone Declaration mission',
      taskS1W4WarzoneDeclarationBody: 'Warzone Duel bonus: alliances with >=1M Alliance Influence Points participating receive bonus rewards (§16.6).',
      taskS1W4CityOfApocalypseTitle: 'Wk 4 D4 · City of Apocalypse mission',
      taskS1W4CityOfApocalypseBody: 'Capitol capture window opens Day 28. Level-7 super-capitol at map center.',
      taskS1W4BuilderOptoutTitle: 'Wk 4 · Builder Alliance opt-out window',
      taskS1W4BuilderOptoutBody: 'Weeks 4-7 (§14). Small alliances can permanently switch to Builder mode for stable construction rewards.',
      taskS1W4RainTitle: 'Wk 4 · Rain-phase weather applies infection accelerant',
      taskS1W4RainBody: 'Boost VR before engaging infected zombies or Doom Elite (§7).',
      taskS1W5InfiniteOctagonR1Title: 'Wk 5 · Infinite Octagon Round 1',
      taskS1W5InfiniteOctagonR1Body: 'Flagship cross-server tournament (§12/§16.7). Coordinate rally leaders + tier-appropriate squads.',
      taskS1W6InfiniteOctagonR2Title: 'Wk 6 · Infinite Octagon Round 2',
      taskS1W6InfiniteOctagonR2Body: 'Second tournament round.',
      taskS1W7InfiniteOctagonR3Title: 'Wk 7 · Infinite Octagon Round 3',
      taskS1W7InfiniteOctagonR3Body: 'Final tournament stage.',
      taskS1W8SeasonEndTitle: 'Wk 8 · Season end approaches (Day 48)',
      taskS1W8SeasonEndBody: 'Doomsday cycle continues weekly through end of season. Pool speedups for final city holds.',

      // ============================================================
      // ---- Season 3 (Golden Kingdom) task labels ----
      // KB: kb/07-future-seasons.md §765-870
      // ============================================================
      taskS3PreSaveStaminaTitle: 'Save stamina 3 weeks pre-season',
      taskS3PreSaveStaminaBody: 'Front-load greenification and seasonal contributions when the map opens (community-guide staple).',
      taskS3PreChooseCoordsTitle: 'Pick landing coords near Alliance Center range',
      taskS3PreChooseCoordsBody: 'S3 anchor = Alliance Center 5x5. Every base MUST stay inside AC range or Large Sandworms teleport you out.',
      taskS3D1ProtectorsFieldTitle: 'Day 1 · Level Protector\'s Field to 10 only',
      taskS3D1ProtectorsFieldBody: 'L11+ demands Mithril and Sacred Water needed elsewhere. Stop at L10 initially.',
      taskS3D1CrlTitle: 'Day 1 · Start Curse Research Lab',
      taskS3D1CrlBody: 'Max L30 unlocks Legendary Hero Badge for Scarlett UR ascension in W3. Highest single-building priority of the season.',
      taskS3D1BlessingFountainTitle: 'Day 1 · Blessing Fountain unlocks',
      taskS3D1BlessingFountainBody: 'Max L30. Provides Curse Resistance buff.',
      taskS3D2AcRepairTitle: 'Day 2 · R4/R5 initiate Alliance Center repairs',
      taskS3D2AcRepairBody: 'Every base MUST stay inside AC range for Sandworm protection.',
      taskS3W1D4MarshallTitle: 'Wk 1 D4 · Marshall weapon 7-day battle pass',
      taskS3W1D4MarshallBody: 'Tier-5 Marshall to equip; 70 shards in pass, 50 for activation.',
      taskS3W2D1OasisTitle: 'Wk 2 D1 · Oasis Project greenification launches',
      taskS3W2D1OasisBody: 'Individual leaderboard + warzone chest (100k tiles). Archaeology & Digging opens through W8.',
      taskS3W2ReturnDeadTitle: 'Wk 2 D1 · Return of the Dead 19-day event',
      taskS3W2ReturnDeadBody: 'Desert Bosses attack ACs every Tue+Fri at 11:30 server. 30 waves, 1-min intervals. Failure damages AC.',
      taskS3W2HeroSwapTitle: 'Wk 2 D2 · Hero Swap Event',
      taskS3W2HeroSwapBody: '2 tickets to swap XP+stars between UR heroes. Wall of Honor unchanged.',
      taskS3W3FactionAwardsTitle: 'Wk 3 D1 · Faction Awards resolve',
      taskS3W3FactionAwardsBody: 'Top 2 warzones = Scarlet Legion vs Golden Tribe leaders. Sets factions for rest of season.',
      taskS3W3ScarlettUrTitle: 'Wk 3 D1 · Scarlett UR promotion opens',
      taskS3W3ScarlettUrBody: 'Requires Scarlett 5-star + Legendary Hero Badge (CRL L30). Warzone chest: donate 5M coins.',
      taskS3W3SchuylerTitle: 'Wk 3 D4 · Schuyler weapon battle pass opens',
      taskS3W3SchuylerBody: 'Tier-5 Schuyler; 70 shards / 50 for activation.',
      taskS3W4SpiceWarOpenTitle: 'Wk 4 D1 · Spice Wars begin',
      taskS3W4SpiceWarOpenBody: 'Wed+Sat battle windows through W8. Overlord Growth Handbook pass opens Day 1.',
      taskS3W4PyramidWarTitle: 'Wk 4 D6 · Pyramid War begins',
      taskS3W4PyramidWarBody: 'Capitol / Great Pyramid contestable via City Clash. Mission goal delayed 36h (D7 +12h).',
      taskS3W5OasisFreeTitle: 'Wk 5 · Oasis Project transitions to free expansion',
      taskS3W5OasisFreeBody: 'Regions >=80% threshold. Weeks 5-7 window for map-wide greenification.',
      taskS3W6McGregorTitle: 'Wk 6 · McGregor Exclusive Weapon battle pass opens',
      taskS3W6McGregorBody: 'Third and final S3 exclusive weapon.',
      taskS3W7FactionDuelTitle: 'Wk 7 D1-6 · Faction Duel Invasion Right Contest',
      taskS3W7FactionDuelBody: 'Faction with more Invasion Right at D6 end gains attack initiative at Capitol War.',
      taskS3W7CapitolWarTitle: 'Wk 7 D7 · Capitol War (Sun 12:00 server)',
      taskS3W7CapitolWarBody: 'Capitol = +10M Spice. Each Cannon = +5M Spice. All warzones lock at battle start.',
      taskS3W8FinalSpiceTitle: 'Wk 8 · Final Wed+Sat Spice War rounds',
      taskS3W8FinalSpiceBody: 'Season rankings finalize on total Spice. Off-season begins.',
      taskS3W4ProtectorBudgetTitle: 'Wk 4 · Reserve Desert Protectors for high-value fights',
      taskS3W4ProtectorBudgetBody: 'Use only on Digging Strongholds, Spice Wars, Trade Wars, Giant Sandworms. Burning on generic PvE is the single most-cited waste.',

      // ============================================================
      // ---- Season 4 (Evernight Isle) task labels ----
      // KB: kb/07-future-seasons.md §99-222
      // ============================================================
      taskS4PreChooseCoordsTitle: 'Pick landing coords with 11+ tile clearance',
      taskS4PreChooseCoordsBody: 'S4 anchor = Alliance Center + 3 secondary buildings. Minimum 11-tile spacing to neighbor AC.',
      taskS4D1OptoLabTitle: 'Day 1 · Start Optoelectronic Lab',
      taskS4D1OptoLabBody: 'Max L35. Unlocks Lighthouse generators at L1/L3/L10/L15. Analog to S3 CRL — grows Virus Resistance.',
      taskS4D1LighthouseTitle: 'Day 1 · Lighthouse L1 (+50 Virus Resistance)',
      taskS4D1LighthouseBody: 'L2 +150, L3 +250 (+3% Morale), L4 +250 (+5% Morale). L4 requires Opto Lab L20+.',
      taskS4W1BloodNightTitle: 'Wk 1 · Blood Night Descend Stage 1',
      taskS4W1BloodNightBody: '3x daily at 02:30/10:30/18:30 server, 30 min. Power drain +18k/min. First-kill rewards on world zombies drop Tactics Cards.',
      taskS4W1LuciusTitle: 'Wk 1 · Lucius Exclusive Weapon battle pass',
      taskS4W1LuciusBody: 'First S4 exclusive weapon.',
      taskS4W2BloodNight2Title: 'Wk 2 · Blood Night Stage 2 (Oniwagons)',
      taskS4W2BloodNight2Body: 'Oniwagons drop Parts Chests. Destroyed = spawns Kappa dropping epic Tactics Cards.',
      taskS4W2HunterTitle: 'Wk 2 · Blood Night Hunter mode',
      taskS4W2HunterBody: 'PvP during Blood Night. 3 breach opportunities before elimination. Teleport + shields disabled.',
      taskS4W2DivineTreeTitle: 'Wk 2 · Divine Tree charging',
      taskS4W2DivineTreeBody: 'Send Electricians. Once active: Fortune Slip Tue-Sat, complete all 5 elements for +250 VR during Blood Night.',
      taskS4W3SarahUrTitle: 'Wk 3 D1 · Sarah UR promotion',
      taskS4W3SarahUrBody: 'Legendary Hero Badge + Sarah 5-star. Post-UR resets to 3-star. Return to 5-star = 1,600 shards.',
      taskS4W3TradePostsTitle: 'Wk 3 D2 · Trade Posts unlock',
      taskS4W3TradePostsBody: 'Individual captures. Contests Tue+Fri 12:00 server (1h). No connected alliance territory required.',
      taskS4W3L5CitiesTitle: 'Wk 3 D3 · Level-5 cities unlock',
      taskS4W3L5CitiesBody: 'Mission goal delayed 12h.',
      taskS4W3AdamTitle: 'Wk 3 D4 · Adam Exclusive Weapon 7-day pass',
      taskS4W3AdamBody: '50 Adam named shards to activate; Adam 5-star required.',
      taskS4W3L6CitiesTitle: 'Wk 3 D6 · Level-6 cities unlock',
      taskS4W3L6CitiesBody: 'Mission goal delayed 12h. Highest city tier.',
      taskS4W3BloodNight3Title: 'Wk 3 · Blood Night Stage 3 (W3-W7)',
      taskS4W3BloodNight3Body: 'Doom Walkers spawn. Oni Summon profession attracts legions to your base but grants Base Corroded debuff (+500 Commander Durability damage).',
      taskS4W3HuntingOniTitle: 'Wk 3 · Hunting Oni event',
      taskS4W3HuntingOniBody: 'Warzone-wide goal: eliminate 100 Oni collectively for shared rewards.',
      taskS4W4CopperWarR1Title: 'Wk 4 · Copper Wars round 1 begins',
      taskS4W4CopperWarR1Body: '8 rounds W4-W7, Wed+Sat. Kage no Sato attacks W4, Koubutai defends; sides alternate.',
      taskS4W4CopperCapTitle: 'Wk 4 · Copper War plunder cap = 15%/round',
      taskS4W4CopperCapBody: 'Secondary buildings 3% each; AC = +6%. Max 3 attackers per target. NOT the 30% of S3 Spice Wars.',
      taskS4W6WilliamsTitle: 'Wk 6 · Williams Exclusive Weapon battle pass',
      taskS4W6WilliamsBody: 'Third and final S4 exclusive weapon.',
      taskS4W7CopperNarrowTitle: 'Wk 7 · Copper Ranking Group 1 narrows to 3 alliances',
      taskS4W7CopperNarrowBody: 'Was 10 at W4. Late-season matchmaking concentrates among top alliances.',
      taskS4W8HolyMountainTitle: 'Wk 8 · Blood Night Stage 4 (Towards the Light)',
      taskS4W8HolyMountainBody: 'Charge the Holy Mountain by killing Blood Night Zombies. Full charge permanently ends Blood Night for the warzone.',
      taskS4W8TransferSurgeTitle: 'Wk 8 D1 · Transfer Surge unlocks',
      taskS4W8TransferSurgeBody: 'Server-transfer feature runs 14 days into off-season.',
      taskS4W8T11Title: 'Wk 8 · T11 troop unlock prereqs',
      taskS4W8T11Body: 'HQ 27+, Barrack L35+, Armament Institute built, all 4 Armament Researches at 100%.',

      // ============================================================
      // ---- Season 5 (Wild West) task labels ----
      // KB: kb/07-future-seasons.md §226-273
      // ============================================================
      taskS5PreGoldProspectingTitle: 'Pre-season W2 Mon-Fri · Gold Prospecting mini-game',
      taskS5PreGoldProspectingBody: 'Top 100 players/warzone determine Area Selection priority. Grind for high placement.',
      taskS5PreAreaSelectionTitle: 'Pre-season W2 Tue-Sat · Area Selection',
      taskS5PreAreaSelectionBody: 'Warzones choose spawn locations by rank; presidents can swap positions until Sat lock. Coordinate with allied warzones.',
      taskS5PreCapitolConquestTitle: 'Pre-season W2 D6 · Capitol Conquest',
      taskS5PreCapitolConquestBody: 'All alliances compete for Capitol without adjacency requirement.',
      taskS5D1SafeTimeTitle: 'Day 1 · R5 sets Alliance Safe Time (7-15h)',
      taskS5D1SafeTimeBody: 'Disables 1 of the 3 daily war slots. Rotate to cover the roster\'s timezone. President-managed only.',
      taskS5D1CaffeineTitle: 'Day 1 · Start Caffeine Institute',
      taskS5D1CaffeineBody: 'Primary Virus Resistance building for S5 (analog to S3 CRL / S4 Opto Lab).',
      taskS5D1CoffeeFactoryTitle: 'Day 1 · Start Coffee Factory',
      taskS5D1CoffeeFactoryBody: 'Fuels Caffeine Institute upgrades.',
      taskS5D1TycoonSkinTitle: 'Day 1 · Equip Tycoon\'s Mansion HQ skin',
      taskS5D1TycoonSkinBody: 'From Season Pass. +5% Attack, plus HP/Defense bonuses.',
      taskS5W1BankL1Title: 'Wk 1 · Bank Strongholds L1-6 available',
      taskS5W1BankL1Body: 'Capture 2 Banks/day; default max holdings = 4.',
      taskS5W1FionaTitle: 'Wk 1 · Fiona Exclusive Weapon battle pass',
      taskS5W1FionaBody: 'Fiona gains +10% monster damage this season.',
      taskS5W1CrystalGoldTitle: 'Wk 1 · Start CrystalGold deposits',
      taskS5W1CrystalGoldBody: '3 deposits/day, up to 15 simultaneous 5-day terms. Interest-bearing.',
      taskS5W2TradeTrainTitle: 'Wk 2 · Trade Train unlocks',
      taskS5W2TradeTrainBody: 'Consign Whiskey for CrystalGold profit or raid competitors\' trades. Cross-alliance economic warfare.',
      taskS5W3HighNoonTitle: 'Wk 3 · High Noon daily CrystalGold cap = 15k',
      taskS5W3HighNoonBody: 'Monster damage bonus heroes (Venom/Fiona/Stetmann/Morrison) at +10%.',
      taskS5W3StetmannTitle: 'Wk 3 · Stetmann Exclusive Weapon battle pass',
      taskS5W3StetmannBody: 'Second S5 exclusive weapon.',
      taskS5W4BankL7Title: 'Wk 4 · Bank Strongholds L7-10 open',
      taskS5W4BankL7Body: 'L10 Bank requires 39,900 Virus Resistance. Grind Caffeine Institute BEFORE this week.',
      taskS5W4BankCapTitle: 'Wk 4 · Bank holdings cap can grow to 12',
      taskS5W4BankCapBody: '+1 per city controlled beyond default 4. Hoard cities early to unlock more Banks.',
      taskS5W4VenomUrTitle: 'Wk 4 · Venom UR upgrade window',
      taskS5W4VenomUrBody: 'Mason/Violet/Scarlett/Sarah retro UR paths also available in S5.',
      taskS5W6MorrisonTitle: 'Wk 6 · Morrison Exclusive Weapon battle pass',
      taskS5W6MorrisonBody: 'Third and final S5 exclusive weapon.',
      taskS5W7CityCapTitle: 'Wk 7 · Cities capturable Wed+Sat only',
      taskS5W7CityCapBody: '2 captures/war day = 4/week max. Plan war-slot coverage.',
      taskS5W8FinalWarTitle: 'Wk 8 Sat · Final war day',
      taskS5W8FinalWarBody: 'All hands for last Bank + City contests.',
      taskS5SundayTruceTitle: 'Sundays · Truce Day (every week)',
      taskS5SundayTruceBody: 'No Bank Strongholds can be taken. Rest, redeposit CrystalGold, plan next war window.',

      // ============================================================
      // ---- Season 6 (Shadow Rainforest) task labels ----
      // KB: kb/07-future-seasons.md §277-360
      // ============================================================
      taskS6PreFactionTitle: 'Pre-season W1 · Faction assignment (Deepwood vs Wetland)',
      taskS6PreFactionBody: 'Auto-groups 8 warzones into 2 groups of 4. Strongest warzone per group = Faction Leader. Coin toss decides. LOCKED for season — no re-pick.',
      taskS6PreRoleTitle: 'Pre-season · Pick alliance leadership role',
      taskS6PreRoleBody: 'Altar Skills lock to role: Cobra (Recruiter), Echo (Muse), Gust (Warlord), Feather (Butler), Treehaven (Alliance Leader).',
      taskS6D1FungusTitle: 'Day 1 · Start Fungus Institute (max L60)',
      taskS6D1FungusBody: 'Enhances Virus Resistance. Analog to S3 CRL / S4 Opto Lab / S5 Caffeine Institute.',
      taskS6D1SporeFactoryTitle: 'Day 1 · Start Spore Factory (max L30)',
      taskS6D1SporeFactoryBody: 'Produces Spores. Primary progression resource is Rainforest Mushrooms.',
      taskS6D1CityDestructionTitle: 'Day 1 · WARNING · Captured enemy cities are DESTROYED permanently',
      taskS6D1CityDestructionBody: 'Attackers +50% IP, defenders -100% IP (net 150% swing). Do NOT reflexively capture — this is a strategic weapon, not a rally objective.',
      taskS6W1KimberlyAwakeningTitle: 'Wk 1 · Kimberly Hero Awakening unlocks',
      taskS6W1KimberlyAwakeningBody: 'Requires Kimberly 5-star + Exclusive Weapon L20+ + 50 named Awakening Shards. Total to max: 680 shards.',
      taskS6W1BeneathSoloTitle: 'Wk 1 D2 · Beneath the Ruins Solo Mode',
      taskS6W1BeneathSoloBody: 'Descending platformer, 1 new stage/day. Rewards: Rainforest Mushrooms + season-exclusive gifts. Avoid Spike platforms at low HP.',
      taskS6W2BeneathDuelTitle: 'Wk 2 D1 · Beneath the Ruins Duel Mode',
      taskS6W2BeneathDuelBody: 'PvP descent. Entry: War Merit deposit up to 500 (1,500 with Season Skill). Reward up to 3,000 War Merit/match.',
      taskS6W2AltarsOpenTitle: 'Wk 2 D2 (Tue) · Altars open',
      taskS6W2AltarsOpenBody: '5 Altars total. Hold max 3 simultaneously. Occupied Altars require 100% completion; unoccupied need highest progress at timer end.',
      taskS6W2GeR1Title: 'Wk 2 · Global Expedition Round 1 (14 days)',
      taskS6W2GeR1Body: 'Named Awakening Shards drop at rank thresholds — one of the best free shard sources.',
      taskS6W2AlliancePactTitle: 'Wk 2 · Alliance Pact system live',
      taskS6W2AlliancePactBody: '7-day non-aggression treaties with same-faction alliances. Up to 200 members. Prevent City Destruction between pact members.',
      taskS6W3DvaAwakeningTitle: 'Wk 3 · D.Va Hero Awakening unlocks',
      taskS6W3DvaAwakeningBody: 'Same cost structure as Kimberly (50 unlock + 630 more for full max).',
      taskS6W4GeR2Title: 'Wk 4 · Global Expedition Round 2 (14 days)',
      taskS6W4GeR2Body: 'Second Awakening Shard drop window.',
      taskS6W4FactionTechTitle: 'Wk 4 · Faction Technology tree',
      taskS6W4FactionTechBody: 'Unlocks via Stronghold donations. Applies buffs to all faction members after individual contribution thresholds met.',
      taskS6W6TeslaAwakeningTitle: 'Wk 6 · Tesla Hero Awakening unlocks',
      taskS6W6TeslaAwakeningBody: 'Corrected 2026-07-15: was previously Wk 5 in early sources. Confirmed Wk 6 per Last War Handbook + LDShop.',
      taskS6W6GeR3Title: 'Wk 6 · Global Expedition Round 3 (14 days)',
      taskS6W6GeR3Body: 'Final GE round — last big free-shard window.',
      taskS6W7AncestralTitle: 'Wk 7 · Ancestral Temple / Faction Duel Finale',
      taskS6W7AncestralBody: 'All-out battle between Deepwood and Wetland for Ancestral Temple + Central Area. Winner: 30M Influence Points to faction ranking.',
      taskS6W7LockedTitle: 'Wk 7 · Positioning lockout warning',
      taskS6W7LockedBody: 'All commanders in your warzone are LOCKED to Ancestral Temple + designated Strategic Area once battle begins. Confirm positioning before lockout.',
      taskS6SanctuaryNerfTitle: 'Sanctuary timer doubled 10→20 min',
      taskS6SanctuaryNerfBody: 'Occupies 1/3 of the 60-min attack window. Plan attacks accordingly — significantly restricts strategic flexibility.',
      taskS6AwakeningShardsTitle: 'Awakening Bundles PERMANENTLY REMOVED mid-S6',
      taskS6AwakeningShardsBody: 'All Shards now from Battle Pass (70 named), Awakening Trial (10 free/hero), Global Expedition W2/W4/W6. Compensation: 200 Exclusive Weapon Shards + 1,000 Valor Badges (inbox).',

      // ---- Roster / grid ----
      rosterHeading: 'Roster · alliance-wide status',
      rosterImportCsv: 'Import roster CSV',
      rosterImportHint: 'Same CSV format as the Hive Grid Manager (name, rank, hq_level, total_power, notes).',
      rosterName: 'Name',
      rosterRank: 'Rank',
      rosterHq: 'HQ',
      rosterPower: 'Power',
      rosterProgress: 'Progress',
      rosterEmpty: 'No roster loaded yet. Import a CSV to see per-member task status.',

      // ---- Export ----
      exportHeading: 'Export',
      exportPng: 'PNG (Discord)',
      exportIcal: 'iCal (.ics)',
      exportCsv: 'CSV',
      exportJson: 'JSON',
      exportHint: 'PNG snapshot for your Discord announce channel; iCal for personal calendars; CSV/JSON for other LWS tools.',

      // ---- Gate ----
      gateChecking: 'Checking access code...',
      gateBlocked: 'Enter your Alliance Access Code to unlock this tool.',
      gateUnlock: 'Unlock',
    },

    ko: {
      // ---- Chrome ----
      brand: 'R5TOOLS.IO',
      brandSub: 'LWS 스위트',
      toolName: '시즌 타임라인',
      langToggle: 'EN',
      // ---- shared suite-nav (r5tools.io toolkit strip) ----
      suiteNavPart: '이 도구는 ',
      suiteNavToolkit: ' 라스트 워: 서바이벌 얼라이언스 툴킷의 일부입니다 — ',
      navLanding: '랜딩',
      navHeat: '히트',
      navFreeze: '동결',
      navCoal: '석탄',
      navCity: '도시',
      navTimeline: '타임라인',
      navHive: '벌집',
      navRoster: '명단',
      navProfile: '프로필',
      navVsDays: 'VS 데이',
      betaFeedbackPill: '🚧 베타 · 피드백',

      footerCred: 'LWS 지식 베이스에서 지원',
      footerHome: 'r5tools.io',

      // ---- Header ----
      // KB: [[15-glossary]] 폴라 스톰 / 얼음 시즌 / 프로즌 all in circulation for Season 2
      title: '시즌 2 타임라인 · 폴라 스톰',
      subtitle: '연맹 전체를 위한 T-마이너스 카운트다운 + 사전 준비 체크리스트.',

      // ---- Config panel ----
      configHeading: '연맹 설정',
      configSeasonStart: '시즌 2 시작 (서버 시간)',
      configSeasonStartHint: '당신 워존의 시즌 2 맵 전환은 언제입니까? 다수 워존이 서버 시간 ~13:00으로 보고됩니다 — 정확한 시간은 R5에게 문의하세요.',
      configAllianceName: '연맹 이름',
      configAllianceTag: '연맹 태그',
      configWarzone: '워존 (선택)',
      configSave: '저장',
      configSaved: '저장됨.',

      // ---- Countdown ----
      countdownLabel: '시즌 2 오픈까지',
      countdownUntil: '까지',                                // v0.4: suffix after "<Season Name>"
      countdownDay: '일',
      countdownHour: '시',
      countdownMin: '분',
      countdownSec: '초',
      countdownPreseason: '사전 시즌',
      countdownLive: '진행 중 — 시즌 2 오픈',
      countdownTPlus: '일차',
      configSeasonStartShort: '시작 (서버 시간)',            // v0.4: appended to "<시즌 이름>"

      // ---- v0.4 placeholders ----
      placeholderInSeasonTitle: '타임라인 준비 중',
      placeholderInSeasonBody: '이 시즌은 아직 LWS 지식 베이스에 주차별 마일스톤이 정리되지 않았습니다. 사전 시즌 준비 과제는 여전히 유효합니다.',

      // ---- v0.5 시즌 7 플레이스홀더 ----
      // KB: kb/07-future-seasons.md — S7 2026년 8월 출시 확정 (YouTube 2026-07-09, 07-13 신호)
      s7ComingTitle: '시즌 7 출시 예정 — 2026년 8월경',
      s7ComingBody: 'S7 메커니즘이 공개되면 타임라인 지원이 시작됩니다. YouTube 신호 2건(2026-07-09, 2026-07-13)이 8월 출시를 확인했지만 실제 유출은 24시간 이내 삭제되어 인덱싱 전에 사라졌습니다. 2026-07-15 기준 테마·영웅 로테이션·자원·지도 미확정. S3–S6 패턴 추정: 2주 사전 시즌 + 8주 본 시즌 · 영웅 각성 W1/W3/W6 (S6 중반부터 영구 무과금 전환) · 팩션 시스템 유지 예상 · 축하 주간 T12 병력 가능성 (커뮤니티 여론 · Whiteout Survival 2026-04-27 T12 출시로 지연 인식). 아래 사전 시즌 만능 준비 과제는 여전히 유효. 추적: r5tools.io',
      s7ComingCountdown: 'S7 카운트다운 (추정)',

      // ---- Category legend ----
      catEconomy: '경제',
      catMilitary: '군사',
      catSpatial: '공간 / 배치',
      catEvent: '이벤트',

      // ---- Timeline / Gantt ----
      timelineHeading: '타임라인',
      timelineTaskCol: '과제',
      timelineDayCol: '날짜',
      timelineCategoryCol: '분류',
      timelineDoneCol: '완료',

      // ---- Per-member viewer (v0.3) ----
      viewerLabel: '멤버별 과제 보기:',
      viewerSyncSyncing: '동기화 중...',
      viewerSyncSaved: '저장 · 동기화 완료',
      viewerSyncLocal: '로컬 저장 (오프라인)',
      viewerNoMember: '로스터를 먼저 가져온 후 멤버를 선택해 과제를 추적하세요.',

      // ---- Pre-season tasks ----
      taskSaveSpeedupsTitle: '가속 아이템 저축',
      taskSaveSpeedupsBody: '건설 / 연구 / 훈련 가속을 사용하지 마세요. 만능 가속도 마찬가지. 시즌 첫날 무기고 확장 페이즈에 완료를 맞추면 점수가 두 배로 들어옵니다.',
      taskFinishHqTitle: '오픈 전에 본부 업그레이드 완료',
      taskFinishHqBody: '오픈 후 시작하는 본부 업그레이드는 화로에 쓸 석탄을 소모합니다. 목표 본부 레벨(최소 25, 고열 화로용 30)을 미리 확보하세요.',
      taskStopBoxesTitle: '자원 상자 개봉 금지',
      taskStopBoxesBody: '개봉한 상자의 자원은 노출 창고로 갑니다. 시즌 첫날까지 모든 상자를 보관하세요 — 그래야 노출된 자원이 약탈자가 아닌 화로/공장에 흘러갑니다.',
      taskTrainTroopsTitle: '병력 훈련 큐 채우기',
      taskTrainTroopsBody: '병영 / 미사일 / 항공기 큐를 채워 첫날 무기고 확장 부대 훈련 페이즈에 완료가 떨어지도록 조정하세요 — 이중 점수.',
      taskChooseCoordsTitle: '착지 좌표 결정',
      taskChooseCoordsBody: 'R5와 하이브 착지 위치를 확정하세요. 모서리가 가장 따뜻하며(-15 °C 지면), -50 °C 링 안쪽은 첫 시간부터 동맹 화로 커버가 필수입니다.',
      // Season-agnostic body — used by UNIVERSAL_TASKS
      taskChooseCoordsBodyGeneric: 'R5와 벌집 착륙 지점 협의. 시즌별로 다름 — 아래 시즌별 좌표 태스크 참조.',
      taskStackRadarTitle: '레이더 미션 쌓기',
      taskStackRadarBody: '시즌 오픈 전에 레이더 미션을 클리어하지 마세요. 시즌 1일차에 확정 석탄 보상으로 정산됩니다.',
      taskAllianceHelpTitle: '연맹원 소집',
      taskAllianceHelpBody: '맵 전환 시각에 20명 이상이 접속 가능한지 확인. 동맹 화로 활성화에 증원 ~20명이 필요합니다 — 부족하면 하이브가 1시간을 얼음 상태로 소비합니다.',

      // ---- Day 1 ----
      taskD1RelocateTitle: '1일차 · 하이브 재배치',
      taskD1RelocateBody: '착지가 혼잡하거나 적대적이면, R5가 집결지를 이동시켜 개인 순간이동 소모 없이 하이브 전체를 옮기는 프리 재배치 기법을 사용하세요.',
      taskD1PlaceAFTitle: '1일차 · 동맹 화로 배치',
      taskD1PlaceAFBody: 'R4/R5가 하이브 중앙의 L1 영토에 동맹 화로를 배치. 증원 20명을 채우면 활성화 — 활성화 후 건설 딜레이 없음.',
      taskD1HighHeatTitle: '1일차 · 고열 화로 건설',
      taskD1HighHeatBody: '본부 30 이상의 모든 연맹원이 개인 고열 화로 건설. L1 기준 +5.5 °C 활성화 / +8 °C 과부하 · 바이러스 저항 100.',
      taskD1TitaniumTitle: '1일차 · 티타늄 합금 공장 1호 건설',
      taskD1TitaniumBody: '공장 1호가 +720 티타늄/시 기본치 해금. L15까지 올려 2호 공장 해금 — 초반 2주 최우선 과제.',
      taskD1BlizzardToggleTitle: '1일차 · "눈보라 자동 활성화" 켜기',
      taskD1BlizzardToggleBody: '고열 화로의 눈보라 자동 활성화 토글을 켜세요. 1-2주차 눈보라는 지면 온도 -30 °C 추가, 4주차는 -70 °C.',
      taskD1WandererTitle: '1일차 · 둠 워커 첫킬은 맵 전환 이후로',
      taskD1WandererBody: '맵 전환 전에 최고 레벨 둠 워커를 잡지 마세요. 석탄 보상은 전환 이후에만 정산됩니다 — L180 킬 = 약 200,000 석탄.',

      // ---- In-season ----
      taskW1CityTitle: '1주차 3일 · L1 도시(마을) 오픈',
      taskW1CityBody: '마을 점령 오픈. 시즌 첫 점령은 반드시 L1 채굴장이어야 하며, 이후 모든 점령은 기존 연맹 영토와 인접해야 합니다.',
      taskW3FactionTitle: '3주차 · 진영 시상식 투표',
      taskW3FactionBody: '워존이 반군 vs 헌병대로 나뉘어 투표. 8 워존이 4대4로 분할. 시즌 나머지 기간 상대가 결정됩니다.',
      taskW4RareSoilTitle: '4주차 · 희토 전쟁 준비',
      taskW4RareSoilBody: '-70 °C 눈보라와 희토 전쟁이 동시 진행. 동맹 화로 + 모든 개인 화로가 수요일/토요일 전쟁 창구용 과부하 석탄을 확보해야 합니다.',
      // ---- Wk 5-8 in-season tasks (KR) ----
      taskW5SoilRoundTitle: '5주차 · 희토 전쟁 라운드 (매주 2회 지속)',
      taskW5SoilRoundBody: '희토 전쟁이 시즌 종료까지 매주 수/토 진행됩니다. 동맹 화로 + 모든 개인 화로 과부하 유지. R4들 간 방어 로테이션 조율.',
      taskW5GroupingTPTitle: '5주차 · 크로스 서버 그룹 텔레포트 조율',
      taskW5GroupingTPBody: '3주차부터 사용 가능한 무료 그룹 텔레포트는 크로스 서버 공격/후퇴의 핵심입니다. 5분 재사용 대기시간을 감안하여 R5가 어떤 서버로 갈지 결정, 수요일 아침 디스코드 공지.',
      taskW6GlacieradonTitle: '6주차 · 글래시라돈 보스 추적',
      taskW6GlacieradonBody: '4마리의 글래시라돈이 스폰되어 맵 중심 핵심 화로로 진군합니다. 도시 통과 시에만 공격 가능 — 일일 시도 횟수 제한. R4 한 명에게 일일 보스 위치 공지 담당 지정.',
      taskW7SiegePrepTitle: '7주차 · 핵심 화로 공성전 준비',
      taskW7SiegePrepBody: '핵심 화로 공성전 보상 흐름은 KB 미해결 질문 — 메커니즘 문서화 부족. 준비: 조율된 집결 가속 아이템 풀링, 병원 재충전, 치유 물자 대기.',
      taskW8NuclearSiegeTitle: '8주차 · 핵심 화로 / 수도 공성전 최종 진격',
      taskW8NuclearSiegeBody: '최종 보스 사이클. 총력전: 글래시라돈 처치, 수도 쟁탈, 최종 희토 예치. KB 공백: 정확한 보상 메커니즘 미공개 — 인게임 확인 후 연맹 채팅에 공유.',
      taskW4MissileTitle: '4주차 · 동맹 화로에서 5칸 이상 이격',
      taskW4MissileBody: '워로드 미사일 폭발 반경 25×25 타일, 오염 지대(1시간, 방어막 불가) 생성. 4주차 전에 자기 기지를 동맹 화로에서 최소 5칸 이상 옮기세요.',

      // ============================================================
      // ---- 시즌 1 (Crimson Plague) 태스크 ----
      // KB: kb/05-season-1-crimson-plague.md
      // ============================================================
      taskS1D3CornerTitle: '우호 요새 인접한 코너 워존 착륙 선택',
      taskS1D3CornerBody: 'S1은 도시 선포에 요새 체인 연결 필요(§7). 코너 셀이 방어에 가장 안전.',
      taskS1D1VriTitle: '1일차 · 바이러스 연구소 L1 즉시 착수',
      taskS1D1VriBody: 'VRI가 유일한 유의미한 바이러스 저항 소스(L30 최대 +10,000). 저항 부족 시 데미지 60-99% 감소. 즉시 시작.',
      taskS1D1ProteinTitle: '1일차 · 프로틴 팜 활성화',
      taskS1D1ProteinBody: '시즌 시작과 함께 잠금해제되는 주요 시즌 식량 소스(§16.1).',
      taskS1W1D3L1CitiesTitle: '1주차 3일 · Lv1 도시 잠금해제',
      taskS1W1D3L1CitiesBody: '유전자 재조합 이벤트도 같은 날 오픈(§16.1). 첫 도시 점령은 요새 인접 필요.',
      taskS1W1D4KimberlyTitle: '1주차 4일 · 킴벌리 로켓 섀도우 무기 잠금해제',
      taskS1W1D4KimberlyBody: '킴벌리 Tier-5 필요. 전용무기 7일 배틀패스; 파편 저축.',
      taskS1W2VrTargetTitle: '2주차 · VR 1,500-2,000 목표 (요새 점령용)',
      taskS1W2VrTargetBody: '랠리 리더는 반드시 요새 VR 게이트 통과(§5). 미달 시 데미지 ~0. 파밍 계정 앞, VR 스택 리더 뒤.',
      taskS1W2L2CitiesTitle: '2주차 3일 · Lv2 도시 잠금해제',
      taskS1W2L2CitiesBody: '요새 인접 체인 필요(§16.1).',
      taskS1W2CorruptorTitle: '2주차 · 오염자 킬 스쿼드 준비',
      taskS1W2CorruptorBody: '각 요새의 오염자 NPC는 VR 무관하게 자동 감염(§16.8). 탱크 전선 편성 사용.',
      taskS1W3D2WarzoneExpTitle: '3주차 2일 · 워존 원정 오픈',
      taskS1W3D2WarzoneExpBody: '외부 워존에 최대 4개 전초기지(워존당 최대 1개). 요새 Lv 2/4/6/8에서 오픈.',
      taskS1W3MilitaryBasesTitle: '3주차 · 군사기지 잠금해제',
      taskS1W3MilitaryBasesBody: '워존 원정과 함께(§16.1). 전초기지 배치용 인접 지역 확보.',
      taskS1W4WarzoneDeclarationTitle: '4주차 1일 · 워존 선포 미션',
      taskS1W4WarzoneDeclarationBody: '워존 결투 보너스: 참여 동맹 영향력 100만 이상 시 추가 보상(§16.6).',
      taskS1W4CityOfApocalypseTitle: '4주차 4일 · 종말도시 미션',
      taskS1W4CityOfApocalypseBody: '28일차에 수도 점령 창 오픈. 맵 중앙의 Lv7 초-수도.',
      taskS1W4BuilderOptoutTitle: '4주차 · 건설 동맹 옵트아웃 창',
      taskS1W4BuilderOptoutBody: '4-7주차(§14). 소규모 동맹은 영구적으로 건설 모드 전환 가능(안정적 건설 보상).',
      taskS1W4RainTitle: '4주차 · 우기 감염 가속화',
      taskS1W4RainBody: '감염 좀비/둠 엘리트 교전 전 VR 강화(§7).',
      taskS1W5InfiniteOctagonR1Title: '5주차 · 무한 옥타곤 라운드 1',
      taskS1W5InfiniteOctagonR1Body: '간판 서버 간 토너먼트(§12/§16.7). 랠리 리더 + 티어별 스쿼드 조율.',
      taskS1W6InfiniteOctagonR2Title: '6주차 · 무한 옥타곤 라운드 2',
      taskS1W6InfiniteOctagonR2Body: '두번째 라운드.',
      taskS1W7InfiniteOctagonR3Title: '7주차 · 무한 옥타곤 라운드 3',
      taskS1W7InfiniteOctagonR3Body: '최종 토너먼트 단계.',
      taskS1W8SeasonEndTitle: '8주차 · 시즌 종료(48일차) 임박',
      taskS1W8SeasonEndBody: '둠스데이 사이클 시즌 종료까지 매주 계속. 최종 도시 방어용 가속 저축.',

      // ============================================================
      // ---- 시즌 3 (Golden Kingdom) 태스크 ----
      // KB: kb/07-future-seasons.md §765-870
      // ============================================================
      taskS3PreSaveStaminaTitle: '시즌 3주 전부터 스태미나 저축',
      taskS3PreSaveStaminaBody: '맵 오픈 시 녹지화 + 시즌 기여를 프론트로드(커뮤니티 가이드 필수).',
      taskS3PreChooseCoordsTitle: '동맹센터 범위 내 착륙 좌표 선택',
      taskS3PreChooseCoordsBody: 'S3 앵커 = 동맹센터 5x5. 모든 기지가 AC 범위 안에 있어야 함 (없으면 대형 샌드웜이 순간이동).',
      taskS3D1ProtectorsFieldTitle: '1일차 · 보호자 필드 초기 L10 까지만',
      taskS3D1ProtectorsFieldBody: 'L11+는 미스릴과 신성수 요구 (다른 곳에 필요). 초기 L10에서 정지.',
      taskS3D1CrlTitle: '1일차 · 저주 연구소(CRL) 착수',
      taskS3D1CrlBody: '최대 L30에서 전설 영웅 배지 언락 → 3주차 스칼렛 UR 승격. 시즌 최우선 건물.',
      taskS3D1BlessingFountainTitle: '1일차 · 축복의 샘 잠금해제',
      taskS3D1BlessingFountainBody: '최대 L30. 저주 저항 버프 제공.',
      taskS3D2AcRepairTitle: '2일차 · R4/R5 동맹센터 수리 착수',
      taskS3D2AcRepairBody: '샌드웜 방어를 위해 모든 기지가 AC 범위 안에 있어야 함.',
      taskS3W1D4MarshallTitle: '1주차 4일 · 마샬 무기 7일 배틀패스',
      taskS3W1D4MarshallBody: '마샬 Tier-5 필요; 패스 70 파편, 활성화 50.',
      taskS3W2D1OasisTitle: '2주차 1일 · 오아시스 프로젝트 녹지화 시작',
      taskS3W2D1OasisBody: '개인 리더보드 + 워존 상자(100k 타일). 고고학 & 발굴 8주차까지 오픈.',
      taskS3W2ReturnDeadTitle: '2주차 1일 · Return of the Dead 19일 이벤트',
      taskS3W2ReturnDeadBody: '화/금 서버 시각 11:30에 사막 보스가 AC 공격. 30 웨이브, 1분 간격. 실패 시 AC 손상.',
      taskS3W2HeroSwapTitle: '2주차 2일 · 영웅 교환 이벤트',
      taskS3W2HeroSwapBody: 'UR 영웅 XP+별 교환 티켓 2개. Wall of Honor 무관.',
      taskS3W3FactionAwardsTitle: '3주차 1일 · 팩션 어워즈 결정',
      taskS3W3FactionAwardsBody: '상위 2 워존 = Scarlet Legion vs Golden Tribe 리더. 남은 시즌 팩션 결정.',
      taskS3W3ScarlettUrTitle: '3주차 1일 · 스칼렛 UR 승격 오픈',
      taskS3W3ScarlettUrBody: '스칼렛 5성 + 전설 영웅 배지(CRL L30). 워존 상자: 500만 코인 기부.',
      taskS3W3SchuylerTitle: '3주차 4일 · 슈일러 무기 배틀패스 오픈',
      taskS3W3SchuylerBody: '슈일러 Tier-5; 70 파편 / 활성화 50.',
      taskS3W4SpiceWarOpenTitle: '4주차 1일 · Spice Wars 시작',
      taskS3W4SpiceWarOpenBody: '8주차까지 수/토 전투 시간. Overlord Growth Handbook 패스 1일차 오픈.',
      taskS3W4PyramidWarTitle: '4주차 6일 · Pyramid War 시작',
      taskS3W4PyramidWarBody: '수도/대피라미드 City Clash로 경합. 미션 목표 36h 지연(7일 +12h).',
      taskS3W5OasisFreeTitle: '5주차 · 오아시스 자유 확장 전환',
      taskS3W5OasisFreeBody: '지역 >=80% 임계값. 5-7주차 맵 전역 녹지화 창.',
      taskS3W6McGregorTitle: '6주차 · 맥그리거 전용 무기 배틀패스',
      taskS3W6McGregorBody: 'S3 세번째이자 마지막 전용 무기.',
      taskS3W7FactionDuelTitle: '7주차 1-6일 · Faction Duel 침공권 경합',
      taskS3W7FactionDuelBody: '6일차 종료 시 침공권 많은 팩션이 Capitol War 공격 이니셔티브 획득.',
      taskS3W7CapitolWarTitle: '7주차 7일 · Capitol War (일 12:00 서버)',
      taskS3W7CapitolWarBody: '수도 = +1000만 Spice. 캐논 각 = +500만 Spice. 전투 시작 시 모든 워존 락.',
      taskS3W8FinalSpiceTitle: '8주차 · 최종 수/토 Spice War 라운드',
      taskS3W8FinalSpiceBody: '총 Spice로 시즌 랭킹 결정. 오프시즌 시작.',
      taskS3W4ProtectorBudgetTitle: '4주차 · 사막 보호자 고가치 전투에만 사용',
      taskS3W4ProtectorBudgetBody: '발굴 요새, Spice Wars, Trade Wars, 대형 샌드웜에만 사용. 일반 PvE에 소비 = 가장 많이 지적되는 낭비.',

      // ============================================================
      // ---- 시즌 4 (Evernight Isle) 태스크 ----
      // KB: kb/07-future-seasons.md §99-222
      // ============================================================
      taskS4PreChooseCoordsTitle: '11+ 타일 여유 있는 착륙 좌표 선택',
      taskS4PreChooseCoordsBody: 'S4 앵커 = 동맹센터 + 부속 3건물. 이웃 AC 간 최소 11 타일 간격.',
      taskS4D1OptoLabTitle: '1일차 · 광전자 연구소 착수',
      taskS4D1OptoLabBody: '최대 L35. Lighthouse 발전기 L1/L3/L10/L15에서 언락. S3 CRL 대응 — VR 성장.',
      taskS4D1LighthouseTitle: '1일차 · Lighthouse L1 (+50 VR)',
      taskS4D1LighthouseBody: 'L2 +150, L3 +250 (+3% 사기), L4 +250 (+5% 사기). L4는 광전 L20+ 필요.',
      taskS4W1BloodNightTitle: '1주차 · Blood Night Descend Stage 1',
      taskS4W1BloodNightBody: '서버 02:30/10:30/18:30에 하루 3회, 30분. 파워 소모 +18k/분. 월드 좀비 첫킬 보상은 전술 카드 드롭.',
      taskS4W1LuciusTitle: '1주차 · Lucius 전용무기 배틀패스',
      taskS4W1LuciusBody: 'S4 첫번째 전용무기.',
      taskS4W2BloodNight2Title: '2주차 · Blood Night Stage 2 (오니와곤)',
      taskS4W2BloodNight2Body: '오니와곤이 부품 상자 드롭. 파괴 시 Kappa 스폰 → 에픽 전술 카드.',
      taskS4W2HunterTitle: '2주차 · Blood Night Hunter 모드',
      taskS4W2HunterBody: 'Blood Night 중 PvP. 탈락 전 3회 돌파 기회. 텔레포트+실드 비활성.',
      taskS4W2DivineTreeTitle: '2주차 · Divine Tree 충전',
      taskS4W2DivineTreeBody: '전기공 파견. 활성화 후: 화-토 Fortune Slip 뽑기, 5원소 완성 시 Blood Night 중 +250 VR.',
      taskS4W3SarahUrTitle: '3주차 1일 · Sarah UR 승격',
      taskS4W3SarahUrBody: '전설 영웅 배지 + Sarah 5성. UR 후 3성 리셋. 5성 복귀 = 1,600 파편.',
      taskS4W3TradePostsTitle: '3주차 2일 · 트레이드 포스트 언락',
      taskS4W3TradePostsBody: '개인 점령. 화+금 서버 12:00 경합(1시간). 연결된 동맹 영토 불필요.',
      taskS4W3L5CitiesTitle: '3주차 3일 · Lv5 도시 언락',
      taskS4W3L5CitiesBody: '미션 목표 12h 지연.',
      taskS4W3AdamTitle: '3주차 4일 · Adam 전용무기 7일 패스',
      taskS4W3AdamBody: '50 Adam 지정 파편으로 활성화; Adam 5성 필요.',
      taskS4W3L6CitiesTitle: '3주차 6일 · Lv6 도시 언락',
      taskS4W3L6CitiesBody: '미션 목표 12h 지연. 최고 도시 등급.',
      taskS4W3BloodNight3Title: '3주차 · Blood Night Stage 3 (3-7주차)',
      taskS4W3BloodNight3Body: '둠 워커 스폰. 오니 소환 프로페션이 군단을 기지로 유인 (하지만 Base Corroded 디버프 +500 커맨더 내구도 손상).',
      taskS4W3HuntingOniTitle: '3주차 · Hunting Oni 이벤트',
      taskS4W3HuntingOniBody: '워존 전체 목표: 오니 100마리 처치 → 공유 보상.',
      taskS4W4CopperWarR1Title: '4주차 · Copper Wars 라운드 1 시작',
      taskS4W4CopperWarR1Body: '4-7주차 8라운드, 수+토. Kage no Sato 4주차 공격, Koubutai 방어; 교대.',
      taskS4W4CopperCapTitle: '4주차 · Copper War 약탈 상한 = 15%/라운드',
      taskS4W4CopperCapBody: '부속 건물 각 3%; AC = +6%. 대상당 공격자 최대 3. S3 Spice Wars의 30%가 아님.',
      taskS4W6WilliamsTitle: '6주차 · Williams 전용무기 배틀패스',
      taskS4W6WilliamsBody: 'S4 세번째이자 마지막 전용무기.',
      taskS4W7CopperNarrowTitle: '7주차 · Copper 랭킹 그룹 1이 3동맹으로 축소',
      taskS4W7CopperNarrowBody: '4주차에는 10이었음. 후반 매치메이킹이 상위 동맹에 집중.',
      taskS4W8HolyMountainTitle: '8주차 · Blood Night Stage 4 (Towards the Light)',
      taskS4W8HolyMountainBody: 'Blood Night 좀비 처치로 성산 충전. 완충 시 워존 Blood Night 영구 종료.',
      taskS4W8TransferSurgeTitle: '8주차 1일 · 트랜스퍼 서지 언락',
      taskS4W8TransferSurgeBody: '서버 이전 기능; 오프시즌으로 14일 실행.',
      taskS4W8T11Title: '8주차 · T11 병력 언락 조건',
      taskS4W8T11Body: 'HQ 27+, 병영 L35+, Armament Institute 건설, Armament 연구 4개 모두 100%.',

      // ============================================================
      // ---- 시즌 5 (Wild West) 태스크 ----
      // KB: kb/07-future-seasons.md §226-273
      // ============================================================
      taskS5PreGoldProspectingTitle: '프리시즌 2주차 월-금 · Gold Prospecting',
      taskS5PreGoldProspectingBody: '워존별 상위 100 플레이어가 Area Selection 우선순위 결정. 상위 배치 목표.',
      taskS5PreAreaSelectionTitle: '프리시즌 2주차 화-토 · Area Selection',
      taskS5PreAreaSelectionBody: '워존이 랭크로 스폰 위치 선택; 대통령은 토요일 락 전까지 위치 스왑 가능. 동맹 워존과 조율.',
      taskS5PreCapitolConquestTitle: '프리시즌 2주차 6일 · Capitol Conquest',
      taskS5PreCapitolConquestBody: '모든 동맹이 인접 무관하게 수도 경합.',
      taskS5D1SafeTimeTitle: '1일차 · R5가 Alliance Safe Time 설정 (7-15h)',
      taskS5D1SafeTimeBody: '일일 3전쟁 슬롯 중 1개 비활성화. 로스터 타임존 커버로 로테이션. 대통령만 관리.',
      taskS5D1CaffeineTitle: '1일차 · Caffeine Institute 착수',
      taskS5D1CaffeineBody: 'S5 주요 VR 건물 (S3 CRL / S4 Opto Lab 대응).',
      taskS5D1CoffeeFactoryTitle: '1일차 · Coffee Factory 착수',
      taskS5D1CoffeeFactoryBody: 'Caffeine Institute 업그레이드 연료.',
      taskS5D1TycoonSkinTitle: '1일차 · Tycoon\'s Mansion HQ 스킨 장착',
      taskS5D1TycoonSkinBody: '시즌패스 제공. +5% 공격, HP/방어 보너스.',
      taskS5W1BankL1Title: '1주차 · Bank Strongholds L1-6 사용 가능',
      taskS5W1BankL1Body: '일일 2 Bank 점령; 기본 최대 보유 = 4.',
      taskS5W1FionaTitle: '1주차 · Fiona 전용무기 배틀패스',
      taskS5W1FionaBody: 'Fiona는 이번 시즌 몬스터 데미지 +10%.',
      taskS5W1CrystalGoldTitle: '1주차 · CrystalGold 예금 시작',
      taskS5W1CrystalGoldBody: '일일 3 예금, 동시 최대 15개 (5일 만기). 이자 발생.',
      taskS5W2TradeTrainTitle: '2주차 · Trade Train 언락',
      taskS5W2TradeTrainBody: '위스키 위탁 → CrystalGold 이익; 또는 경쟁자 거래 습격. 동맹 간 경제 전쟁.',
      taskS5W3HighNoonTitle: '3주차 · High Noon 일일 CrystalGold 상한 = 15k',
      taskS5W3HighNoonBody: '몬스터 데미지 보너스 영웅 (Venom/Fiona/Stetmann/Morrison) +10%.',
      taskS5W3StetmannTitle: '3주차 · Stetmann 전용무기 배틀패스',
      taskS5W3StetmannBody: 'S5 두번째 전용무기.',
      taskS5W4BankL7Title: '4주차 · Bank Strongholds L7-10 오픈',
      taskS5W4BankL7Body: 'L10 Bank는 39,900 VR 필요. 이 주 전에 Caffeine Institute 완성.',
      taskS5W4BankCapTitle: '4주차 · Bank 보유 상한 12까지 확장 가능',
      taskS5W4BankCapBody: '기본 4 이상 도시 하나당 +1. 초반에 도시 확보하여 더 많은 Bank 언락.',
      taskS5W4VenomUrTitle: '4주차 · Venom UR 업그레이드 창',
      taskS5W4VenomUrBody: 'S5는 Mason/Violet/Scarlett/Sarah 회고 UR 경로도 제공.',
      taskS5W6MorrisonTitle: '6주차 · Morrison 전용무기 배틀패스',
      taskS5W6MorrisonBody: 'S5 세번째이자 마지막 전용무기.',
      taskS5W7CityCapTitle: '7주차 · 도시는 수+토에만 점령 가능',
      taskS5W7CityCapBody: '전쟁일당 2 점령 = 주당 최대 4. 전쟁 슬롯 커버리지 계획.',
      taskS5W8FinalWarTitle: '8주차 토 · 최종 전쟁일',
      taskS5W8FinalWarBody: '마지막 Bank + City 경합에 총력.',
      taskS5SundayTruceTitle: '일요일 · 휴전일 (매주)',
      taskS5SundayTruceBody: 'Bank Stronghold 점령 불가. 휴식, CrystalGold 재예금, 다음 전쟁 창 계획.',

      // ============================================================
      // ---- 시즌 6 (Shadow Rainforest) 태스크 ----
      // KB: kb/07-future-seasons.md §277-360
      // ============================================================
      taskS6PreFactionTitle: '프리시즌 1주차 · 팩션 배정 (Deepwood vs Wetland)',
      taskS6PreFactionBody: '8 워존을 자동으로 2그룹 4개씩 편성. 그룹당 최강 워존 = 팩션 리더. 코인 토스로 결정. 시즌 락 — 재선택 불가.',
      taskS6PreRoleTitle: '프리시즌 · 동맹 리더십 역할 선택',
      taskS6PreRoleBody: '제단 스킬은 역할에 락: Cobra (Recruiter), Echo (Muse), Gust (Warlord), Feather (Butler), Treehaven (Alliance Leader).',
      taskS6D1FungusTitle: '1일차 · Fungus Institute 착수 (최대 L60)',
      taskS6D1FungusBody: 'VR 강화. S3 CRL / S4 Opto Lab / S5 Caffeine Institute 대응.',
      taskS6D1SporeFactoryTitle: '1일차 · Spore Factory 착수 (최대 L30)',
      taskS6D1SporeFactoryBody: 'Spore 생산. 주요 진행 자원은 Rainforest Mushrooms.',
      taskS6D1CityDestructionTitle: '1일차 · 경고 · 적 팩션 도시 점령 시 영구 파괴',
      taskS6D1CityDestructionBody: '공격자 +50% IP, 방어자 -100% IP (순 150% 스윙). 반사적으로 점령 금지 — 이는 랠리 목표가 아닌 전략 무기.',
      taskS6W1KimberlyAwakeningTitle: '1주차 · Kimberly 영웅 각성 언락',
      taskS6W1KimberlyAwakeningBody: 'Kimberly 5성 + 전용무기 L20+ + 지정 각성 파편 50개. 최대 총합: 680 파편.',
      taskS6W1BeneathSoloTitle: '1주차 2일 · Beneath the Ruins 솔로 모드',
      taskS6W1BeneathSoloBody: '하강 플랫포머. 하루 1스테이지. 보상: Rainforest Mushrooms + 시즌 전용 선물. 낮은 HP에서 Spike 플랫폼 회피.',
      taskS6W2BeneathDuelTitle: '2주차 1일 · Beneath the Ruins 듀얼 모드',
      taskS6W2BeneathDuelBody: 'PvP 하강. 참가: War Merit 예치 최대 500 (시즌 스킬 시 1,500). 보상: 경기당 최대 3,000 War Merit.',
      taskS6W2AltarsOpenTitle: '2주차 2일 (화) · 제단 오픈',
      taskS6W2AltarsOpenBody: '총 5제단. 동시 최대 3 유지. 점유된 제단은 100% 필요; 비점유는 타이머 종료 시 최고 진행도.',
      taskS6W2GeR1Title: '2주차 · Global Expedition 라운드 1 (14일)',
      taskS6W2GeR1Body: '랭크 임계값에서 지정 각성 파편 드롭 — 최고의 무료 파편 소스 중 하나.',
      taskS6W2AlliancePactTitle: '2주차 · Alliance Pact 시스템 가동',
      taskS6W2AlliancePactBody: '동일 팩션 동맹 간 7일 불가침 조약. 최대 200명. 조약 멤버 간 도시 파괴 방지.',
      taskS6W3DvaAwakeningTitle: '3주차 · D.Va 영웅 각성 언락',
      taskS6W3DvaAwakeningBody: 'Kimberly와 동일 비용 구조 (50 언락 + 최대까지 630).',
      taskS6W4GeR2Title: '4주차 · Global Expedition 라운드 2 (14일)',
      taskS6W4GeR2Body: '두번째 각성 파편 드롭 창.',
      taskS6W4FactionTechTitle: '4주차 · Faction Technology 트리',
      taskS6W4FactionTechBody: 'Stronghold 기부로 언락. 개인 기여 임계값 도달 후 모든 팩션 멤버에게 버프.',
      taskS6W6TeslaAwakeningTitle: '6주차 · Tesla 영웅 각성 언락',
      taskS6W6TeslaAwakeningBody: '2026-07-15 수정: 초기 5주차 표기는 오류. Last War Handbook + LDShop 기준 6주차 확정.',
      taskS6W6GeR3Title: '6주차 · Global Expedition 라운드 3 (14일)',
      taskS6W6GeR3Body: '최종 GE 라운드 — 마지막 대규모 무료 파편 창.',
      taskS6W7AncestralTitle: '7주차 · Ancestral Temple / Faction Duel 최종전',
      taskS6W7AncestralBody: 'Deepwood와 Wetland의 Ancestral Temple + 중앙 지역 전면전. 우승: 팩션 랭킹에 3천만 IP.',
      taskS6W7LockedTitle: '7주차 · 포지셔닝 락아웃 경고',
      taskS6W7LockedBody: '전투 시작 시 워존의 모든 커맨더가 Ancestral Temple + 지정 전략 지역에 락. 락아웃 전에 위치 확인.',
      taskS6SanctuaryNerfTitle: '생추어리 타이머 10→20분 두배 증가',
      taskS6SanctuaryNerfBody: '60분 공격 창의 1/3 차지. 공격 계획 조정 — 전략적 유연성 대폭 제한.',
      taskS6AwakeningShardsTitle: '각성 번들 mid-S6 영구 삭제',
      taskS6AwakeningShardsBody: '모든 파편은 이제 배틀패스(70 지정), Awakening Trial (영웅당 10 무료), Global Expedition W2/W4/W6에서만. 보상: 전용무기 파편 200 + Valor Badge 1,000 (인박스).',

      // ---- Roster ----
      rosterHeading: '연맹원 현황',
      rosterImportCsv: '연맹원 CSV 가져오기',
      rosterImportHint: '하이브 그리드 매니저와 동일한 CSV 형식(name, rank, hq_level, total_power, notes).',
      rosterName: '이름',
      rosterRank: '등급',
      rosterHq: '본부',
      rosterPower: '전투력',
      rosterProgress: '진행률',
      rosterEmpty: '아직 연맹원이 없습니다. CSV를 가져오면 개별 진행 상태가 표시됩니다.',

      // ---- Export ----
      exportHeading: '내보내기',
      exportPng: 'PNG (디스코드)',
      exportIcal: 'iCal (.ics)',
      exportCsv: 'CSV',
      exportJson: 'JSON',
      exportHint: '디스코드 공지용 PNG · 개인 캘린더용 iCal · 다른 LWS 도구용 CSV/JSON.',

      // ---- Gate ----
      gateChecking: '액세스 코드 확인 중...',
      gateBlocked: '연맹 액세스 코드를 입력하여 이 도구를 잠금 해제하세요.',
      gateUnlock: '잠금 해제',
    },
  };

  // ---- runtime ----

  var lang = (function () {
    var stored = null;
    try { stored = localStorage.getItem('lws_lang'); } catch (e) { /* private mode */ }
    if (stored === 'en' || stored === 'ko') return stored;
    return (navigator.language || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  })();

  function t(key) {
    var dict = I18N[lang] || I18N.en;
    return dict[key] || I18N.en[key] || key;
  }

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
  }

  function toggle() {
    lang = (lang === 'en') ? 'ko' : 'en';
    try { localStorage.setItem('lws_lang', lang); } catch (e) { /* private mode */ }
    apply();
    if (typeof global.onLangChange === 'function') global.onLangChange(lang);
  }

  function get() { return lang; }
  function set(newLang) {
    if (newLang !== 'en' && newLang !== 'ko') return;
    lang = newLang;
    try { localStorage.setItem('lws_lang', lang); } catch (e) { /* private mode */ }
    apply();
  }

  global.I18N = { t: t, apply: apply, toggle: toggle, get: get, set: set, dict: I18N };

  // Auto-apply on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})(window);
