// LWS Coal Burn Calculator — i18n dictionary + runtime.
//
// KR terminology sourced from:
//   - [[06-season-2-frozen]] KR ↔ EN table (석탄, 고열 화로, 오버드라이브, 눈보라, 얼음 상태...)
//   - [[15-glossary]] (fallbacks for terms not season-specific)
//
// Rule: every visible string in index.html has a data-i18n or data-i18n-placeholder
// attribute. No hardcoded English/Korean in the DOM.

(function () {
  'use strict';

  var I18N = {
    en: {
      // Chrome
      brandSub: 'LWS Suite',
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

      // Page
      title: 'Coal Burn Calculator',
      lede: 'How much Coal does every member need stockpiled to survive the Week-4 -70 °C blizzard with the High-Heat Furnace in Overdrive for the full 3-hour window? Answer it before the storm — not after, when teleport, rally, and relocation are all disabled.',

      // Single-member card
      singleHeading: 'Single member',
      singleDesc: 'Enter your High-Heat Furnace level and current coal. Get a green / yellow / red verdict.',
      furnaceLevel: 'Furnace level',
      furnaceLevelHint: '1 – 30',
      coalStock: 'Coal in stock',
      coalStockHint: 'Your current stockpile',
      duration: 'Blizzard duration (hours)',
      durationHint: 'Default 3 (Week 1-4+)',
      blizzardDrop: 'Blizzard drop (°C)',
      blizzardDropHint: 'W1-2: -30 · W3: -50 · W4+: -70',
      overdrive: 'Overdrive (4× burn)',
      overdriveHint: 'Recommended for -70 °C',
      calculate: 'Calculate',
      reset: 'Reset',

      // Single-member result
      verdictGreen: 'GREEN — you have enough coal',
      verdictYellow: 'YELLOW — cutting it close',
      verdictRed: 'RED — you will freeze mid-blizzard',
      resFurnaceLevel: 'Furnace level',
      resBurnPerMin: 'Burn rate',
      resNeed: 'Coal needed',
      resStock: 'You have',
      resDelta: 'Delta',
      unitPerMin: 'coal / min',
      unitCoal: 'coal',
      estimate: '± estimate',
      estimateNote: 'Per-level burn rate L2–L29 is not yet KB-verified — v0.1 linearly interpolates between L1 and L30 anchors. Cross-check against your in-game meter before betting your alliance on this number.',

      // Batch card
      batchHeading: 'Batch (R5 mode)',
      batchDesc: 'Paste your alliance roster CSV. Columns: name,rank,hq_level,total_power,notes,furnace_level,coal_stock. First row = headers. Same CSV format as the Hive Planner + extra furnace_level and coal_stock columns.',
      batchPlaceholder: 'name,rank,hq_level,total_power,notes,furnace_level,coal_stock\nEvan,R5,30,120000000,,28,180000\nBrittany,R4,29,95000000,,24,120000\n...',
      batchRun: 'Run batch',
      batchExportCsv: 'Export CSV',
      batchExportPng: 'Export PNG',
      batchExportHelp: 'Alliance-help text',

      // Batch table
      colName: 'Name',
      colRank: 'Rank',
      colLevel: 'Furnace',
      colStock: 'Stock',
      colNeed: 'Need',
      colDelta: 'Delta',
      colStatus: 'Status',

      // Summary
      summaryOf: 'of',
      summaryShort: 'members short',
      summaryDeficit: 'Total deficit:',
      summaryReady: 'Every listed member has enough coal.',

      // Season-inactive banner
      inactiveHeading: "Coal burn doesn't apply this season",
      inactiveHint: 'Switch the warzone selector above to a warzone running Season 2 Polar Storm, or use the change link to override the season for planning.',

      // Errors
      errFurnaceRange: 'Furnace level must be 1–30.',
      errCoalNegative: 'Coal stockpile cannot be negative.',
      errDuration: 'Duration must be a positive number.',
      errBatchEmpty: 'Paste at least one member row.',
      errBatchHeaders: "Missing required column. Need 'name', 'furnace_level', 'coal_stock' at minimum.",
      errNetwork: "Couldn't reach the server. Try again in a moment.",

      // Season-variant banner (shown when non-S2 but a variant is implemented)
      variantBannerPrefix: 'Planning for',
      variantBannerConnector: '—',

      // ---- S1 Crimson Plague (placeholder-only, KB-cited) ----
      s1PlaceholderTitle: "Season 1 doesn't use resource-window budgeting",
      s1PlaceholderBody: "Crimson Plague has no ambient-cost mechanic like Season 2 coal. Its resource pressure is Virus Resistance for Corruptor fights (KB [[05-season-1-crimson-plague]] §16.3), which isn't a stockpile metric. For S1 planning, use the Season Timeline for Doomsday cycles or the (upcoming) Corruptor VR calculator.",
      s1CtaTimeline: 'Use the Season Timeline for Doomsday cycles + VR grind sequencing (KB [[05-season-1-crimson-plague]] §16.3).',
      s1VriCap: 'Grind VRI (Virus Resistance Institute) to L30 for max +10,000 VR — the ONLY meaningful S1 resistance source (KB [[05-season-1-crimson-plague]] §5, §16.3).',
      s1DoomsdayCadence: 'Doomsday cycle repeats every 7 days across the 48-day (8-week) season — plan Corruptor pushes off the KB05 §16.8 schedule.',

      // ---- S3 Golden Kingdom — Spice Budget Calculator ----
      s3ToolTitle: 'Spice Budget Calculator',
      s3Lede: 'How much Spice will your alliance have banked by Capitol War (W7D7)? Factors in city production 100–600/hr by level (KB [[07-future-seasons]] §S3), Spice Wars plunder exposure (30% steal cap per battle), and Capitol/Cannon bonuses (+10M / +5M).',
      s3CityCount: 'Cities held',
      s3CityCountHint: '0 – 8 (per alliance cap)',
      s3AvgLevel: 'Avg. city level',
      s3AvgLevelHint: '1 – 6',
      s3SpiceStock: 'Spice in stock',
      s3SpiceStockHint: 'Your current stockpile',
      s3DaysToCapitol: 'Days to Capitol War',
      s3DaysToCapitolHint: 'W7D7 = end target',
      s3DefensiveMode: 'Show plunder exposure (30% per Spice War)',
      s3DefensiveModeHint: 'Keep stockpile ≤ target × 1.43 so 30% loss still leaves target intact.',
      s3TargetLabel: 'Target Spice at W7D7 Capitol War',
      s3ProductionRateHint: 'L1 100/hr · L2 200 · L3 300 · L4 400 · L5 500 · L6 600 · +10M Capitol capture · +5M per Cannon (KB [[07-future-seasons]] §765–810)',
      s3PlunderWarn: 'Each Spice War round can steal up to 30% of your unbanked Spice. Keep buffer ≥ target × 1.43 so a 30% loss still leaves target intact.',

      // ---- S4 Evernight Isle — Copper Stockpile Planner ----
      s4ToolTitle: 'Copper Stockpile Planner',
      s4Lede: 'How much Copper will you finish Season 4 with? Factors in production 100–600/hr by city level (KB [[07-future-seasons]] §S4), Copper Wars 15%-cap plunder exposure across up to 8 rounds (W4–W7 Wed/Sat), and ranking-group tier prediction.',
      s4CopperCities: 'Copper cities held (max 6)',
      s4CopperCitiesHint: '0 – 6',
      s4AvgCityLevel: 'Avg. city level',
      s4AvgCityLevelHint: '1 – 6',
      s4DigStrongholds: 'Digging Strongholds held (max 6)',
      s4DigStrongholdsHint: 'Stone side-loop 100–200/hr',
      s4AvgStrongholdLevel: 'Avg. Stronghold level',
      s4AvgStrongholdLevelHint: '1 – 6',
      s4CopperStock: 'Copper in stock',
      s4CopperStockHint: 'Your current stockpile',
      s4DaysRemaining: 'Days remaining',
      s4DaysRemainingHint: 'to end of season',
      s4WarsMode: 'Show Copper Wars plunder exposure (15% cap/round × 8 rounds)',
      s4BloodNightHint: 'Blood Night reminder: 3× 30-min windows/day drain 18k power/min (~1.62M/day)',
      s4RankingTierHint: 'W4 Copper Ranking Group 1 = top 10 alliances → narrows to 3 by W7 (KB [[07-future-seasons]] §189–196).',
      s4StoneWarehouseHint: 'Stone Warehouse produces 40,320/hr constant — a Copper side-income floor even during war windows (KB [[07-future-seasons]] §S4).',

      // ---- S5 Wild West — Bank & CrystalGold Planner ----
      s5ToolTitle: 'Bank & CrystalGold Planner',
      s5Lede: 'How much CrystalGold will your alliance finish Season 5 with? Factors in Bank capture cadence (2/day, Wed+Sat only), deposit math (up to 15 × 5-day terms), and the High Noon 15k/day cap from Week 3.',
      s5BanksHeld: 'Banks held (max 4, up to 12 with cities)',
      s5BanksHeldHint: 'Default cap 4; +1 per city, max 12',
      s5CitiesHeld: 'Cities held (each unlocks +1 Bank cap)',
      s5CitiesHeldHint: '0 – 8',
      s5CrystalGoldStock: 'CrystalGold in stock',
      s5CrystalGoldStockHint: 'Your current stockpile',
      s5ActiveDeposits: 'Active deposits (max 15)',
      s5ActiveDepositsHint: '5-day terms, 3/day cap',
      s5InterestRate: 'Interest rate per 5-day term (%)',
      s5InterestUnverified: 'Interest rate is NOT published in KB — enter your server\'s observed rate. Default 5% is a placeholder.',
      s5DaysRemaining: 'Days remaining',
      s5DaysRemainingHint: 'to end of season',
      s5TargetL10: 'Targeting L10 Banks (needs 39,900 Virus Resistance)',

      // ---- S6 Shadow Rainforest — Hero Awakening Shard Planner ----
      s6ToolTitle: 'Hero Awakening Shard Planner',
      s6Lede: 'Will you fully Awaken your target hero this Season 6? Bundles are permanently removed mid-season (KB [[07-future-seasons]] §S6) — this is F2P-shard math only. Unlock = 50 shards. Full 3-star = 1,190 shards (50 + 130 + 330 + 680).',
      s6TargetHero: 'Target hero (rotation: W1 Kimberly, W3 D.Va, W6 Tesla)',
      s6TargetHeroHint: 'Awakening rotation is fixed per season',
      s6CurrentShards: 'Current named-hero shards',
      s6CurrentShardsHint: 'From event drops, quests, milestones',
      s6WeeklyDropRate: 'Estimated shards/week (F2P — enter your server\'s rate)',
      s6WeeklyDropRateHint: 'KB doesn\'t publish this — observed rate only',
      s6WeeksRemaining: 'Weeks remaining',
      s6WeeksRemainingHint: 'to season end',
      s6DropRateUnverified: 'F2P shard drop rate isn\'t published in KB — enter your server\'s observed rate.',
      s6ThresholdUnlock: 'Unlock: 50 shards',
      s6ThresholdStar1: '1★: +130 (180 total)',
      s6ThresholdStar2: '2★: +330 (510 total)',
      s6ThresholdStar3: '3★: +680 (1,190 total)',
      s6PackRemovalCompensation: 'Refund from bundle removal: 200 Exclusive Weapon Shards + 1,000 Valor Badges delivered to inbox (KB [[07-future-seasons]] §335).',
      s6GlobalExpeditionHint: 'Global Expedition rounds run 14 days each on W2/W4/W6 — the three biggest free-shard drops of the season (KB [[07-future-seasons]] §S6).',
      s6AwakeningRotationHint: 'Awakening rotation locked to season week: W1 Kimberly (Attack passive per KB v1.3 correction) · W3 D.Va · W6 Tesla (KB v1.3 correction from prior W5).',

      // ---- S7 Placeholder (mechanics unpublished) ----
      s7ComingTitle: 'Season 7 launches ~August 2026',
      s7ComingBody: "Full tool support arrives when First Fun publishes S7's mechanics. Until then, no map, no resource system, no hero rotation, no faction structure is confirmed. Track updates via r5tools.io.",
      s7ComingTracker: 'Track: r5tools.io',

      // ---- Coal sources panel (KB [[17-seasons-catalog]] §118-127) ----
      sourcesHeading: 'Coal sources (Season 2)',
      sourcesDesc: 'Estimated daily coal yield per source — all 9 KB-verified. Edit any row to match your alliance’s actual pace; the 56-day budget chart below updates as you type.',
      srcColSource: 'Source',
      srcColDaily: 'Est. coal / day',
      srcColOn: 'Enabled',
      srcColNote: 'KB note',
      srcReset: 'Reset defaults',
      srcAvgDaily: 'avg. coal/day (windowed)',
      srcOneShot: 'one-shot Day 1',
      srcPolarZombies: 'Polar Zombies first-blood',
      srcPolarZombiesNote: 'Wk1 Day 1, one-shot. ~200K reported for L180 Wanderer.',
      srcSeasonQuests: 'Season Quests',
      srcSeasonQuestsNote: 'Steady drip across all 8 weeks.',
      srcDigSite: 'Dig Site production',
      srcDigSiteNote: 'Owned dig sites 2,736 – 3,456/hr (L1–L6). Starts Day 3 (L1 unlock).',
      srcHeroReturn: 'Hero’s Return tickets',
      srcHeroReturnNote: 'Save tickets from S1 → spend Days 1-7.',
      srcSupplyCollect: 'Supply Collections',
      srcSupplyCollectNote: 'Temp-gated at 0°C spawn; follow reclaim order path.',
      srcDistressed: 'Distressed Survivor',
      srcDistressedNote: 'Radar tasks. Stack radars pre-season.',
      srcPolarDishes: 'Polar Dishes event',
      srcPolarDishesNote: 'Wk 2, up to 650K max (65 × 10K per meal-match). ~92K/day × 7 days.',
      srcPasses: 'Weekly + Battle Pass',
      srcPassesNote: 'Exchange currencies for coal packs.',
      srcCoalPacks: 'Coal packs (paid)',
      srcCoalPacksNote: 'Set your monthly spend estimate here.',

      // ---- Titanium Alloy Factory subsection ----
      alloyHeading: 'Titanium Alloy Factory economy',
      alloyDesc: 'Factory 1 is available at S2 start. Level 15 on Factory N unlocks Factory N+1 — chain up to 4 free; Factory 5 requires the Weekly Pass. Each factory produces a flat +720 titanium/hr per level (L30 max = 21,600/hr).',
      alloyColFactory: 'Factory',
      alloyColUnlock: 'Unlock trigger',
      alloyColOutput: 'Output at L15',
      alloyColCoalCost: 'Coal cost L1→L15',
      alloyColNotes: 'Notes',
      alloyFactory: 'Factory',
      alloyUnlockF1: 'Available at S2 start',
      alloyNotesF1: 'Build immediately Day 1. Cascade priority #1.',
      alloyUnlockF2: 'Factory 1 hits L15',
      alloyNotesF2: 'Unlocks Day 2–3 with cascading upgrades.',
      alloyUnlockF3: 'Factory 2 hits L15',
      alloyNotesF3: 'Third free slot — unlocks by Day 4–5.',
      alloyUnlockF4: 'Factory 3 hits L15',
      alloyNotesF4: 'Fourth (and last free) slot.',
      alloyUnlockF5: 'Weekly Pass purchase',
      alloyNotesF5: 'Paid-only. Persistence across weeks unverified (open KB question).',
      alloySequenceHeading: 'Recommended factory sequence (first 7 days)',
      alloySeqDay1: 'Day 1: Build Factory 1. Begin upgrading toward L15. Turn on “auto-activate in blizzard” on HHF.',
      alloySeqDay2: 'Day 2: Factory 1 approaches L10–L12. Start stacking coal from Season Quests + Hero’s Return tickets.',
      alloySeqDay3: 'Day 3: Factory 1 hits L15 → build Factory 2. Capture first L1 dig site (per adjacency rule).',
      alloySeqDay4: 'Day 4: Push Factory 2 to L10+. Do NOT overspend coal — the HHF also needs fuel.',
      alloySeqDay5: 'Day 5: Factory 2 hits L15 → build Factory 3. Dig site coal income (2,736/hr L1) offsets factory drain.',
      alloySeqDay6: 'Day 6: Push Factory 3 to L10+. Prepare for Polar Dishes event opening Day 8.',
      alloySeqDay7: 'Day 7: Factory 3 hits L15 → build Factory 4. Full 4-factory cascade unlocked; total output +14.4K/hr in raw titanium at L15 each.',
      alloyTotalCoal: 'Cascade-to-L15 across 4 free factories costs roughly ~330K coal in factory upgrades alone — before feeding the furnace.',

      // ---- 56-day coal budget chart ----
      budgetHeading: '56-day coal budget projection',
      budgetDesc: 'Starting from your current stockpile, tracks projected daily reserve across the full 8-week season. Adjusts for High-Heat Furnace burn, Alliance Furnace level, and enabled coal sources. If the line crosses zero, that’s the day your alliance runs cold — plan replenishment before then.',
      allianceFurnaceLevel: 'Alliance Furnace level',
      allianceFurnaceLevelHint: '1 – 20 (auto-upgrades on Rare Soil)',
      afHoursPerDay: 'AF hours active / day',
      afHoursPerDayHint: 'Alliance-wide burn window (blizzards + prep)',
      hhfHoursPerDay: 'HHF hours active / day',
      hhfHoursPerDayHint: 'Personal furnace uptime (normal mode)',
      hhfOverdriveHoursPerDay: 'HHF overdrive hours / day',
      hhfOverdriveHoursPerDayHint: 'Blizzard windows only',
      budgetChartTitle: 'Projected coal reserve, Days 1–56',
      budgetChartX: 'Day of season',
      budgetChartY: 'Coal reserve',
      budgetRunOutPrefix: 'Alliance runs cold on Day',
      budgetRunOutSuffix: 'increase income sources or reduce furnace uptime before then.',
      budgetSurplusPrefix: 'Season ends with surplus of',
      budgetSurplusSuffix: 'coal. You’re safe.',
      budgetNote: 'Model: daily reserve[t] = reserve[t-1] + Σ(enabled sources) − personal_burn − alliance_burn_share − factory_upgrade_avg. Alliance burn share = per-furnace-hourly × hours × 1 (single member’s contribution to alliance donations, capped 50/day/member per KB [[06-season-2-frozen]] §120).',
    },
    ko: {
      // Chrome
      brandSub: 'LWS 스위트',
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

      // Page
      title: '석탄 소모 계산기',
      lede: '4주차 -70 °C 눈보라를 고열 화로 오버드라이브로 3시간 동안 버티려면 각 멤버가 얼마나 많은 석탄을 비축해야 할까요? 순간이동·집결·재배치가 모두 막히는 폭풍 중이 아니라, 폭풍 전에 답을 확인하세요.',

      // Single-member card
      singleHeading: '개인 (단일 멤버)',
      singleDesc: '고열 화로 레벨과 현재 석탄량을 입력하세요. 초록 / 노랑 / 빨강으로 판정합니다.',
      furnaceLevel: '화로 레벨',
      furnaceLevelHint: '1 – 30',
      coalStock: '보유 석탄',
      coalStockHint: '현재 비축량',
      duration: '눈보라 지속 시간 (시간)',
      durationHint: '기본 3시간 (1-4주차 이상)',
      blizzardDrop: '눈보라 온도 강하 (°C)',
      blizzardDropHint: '1-2주: -30 · 3주: -50 · 4주 이상: -70',
      overdrive: '오버드라이브 (4배 연소)',
      overdriveHint: '-70 °C 시 권장',
      calculate: '계산',
      reset: '초기화',

      // Single-member result
      verdictGreen: '초록 — 석탄이 충분합니다',
      verdictYellow: '노랑 — 아슬아슬합니다',
      verdictRed: '빨강 — 눈보라 중에 얼어붙습니다',
      resFurnaceLevel: '화로 레벨',
      resBurnPerMin: '연소율',
      resNeed: '필요 석탄',
      resStock: '보유량',
      resDelta: '차이',
      unitPerMin: '석탄 / 분',
      unitCoal: '석탄',
      estimate: '± 추정',
      estimateNote: '레벨 2–29의 석탄 소모율은 아직 지식 베이스에서 검증되지 않았습니다 — v0.1은 L1과 L30 기준값 사이를 선형 보간합니다. 연맹 전략을 결정하기 전에 인게임 수치와 대조해 확인하세요.',

      // Batch card
      batchHeading: '일괄 처리 (R5 모드)',
      batchDesc: '연맹 명단 CSV를 붙여넣으세요. 컬럼: name,rank,hq_level,total_power,notes,furnace_level,coal_stock. 첫 행은 헤더. 하이브 플래너와 동일한 CSV 형식에 furnace_level·coal_stock 컬럼이 추가됩니다.',
      batchPlaceholder: 'name,rank,hq_level,total_power,notes,furnace_level,coal_stock\nEvan,R5,30,120000000,,28,180000\nBrittany,R4,29,95000000,,24,120000\n...',
      batchRun: '일괄 계산',
      batchExportCsv: 'CSV 내보내기',
      batchExportPng: 'PNG 내보내기',
      batchExportHelp: '동맹 지원 요청 텍스트',

      // Batch table
      colName: '이름',
      colRank: '계급',
      colLevel: '화로',
      colStock: '보유',
      colNeed: '필요',
      colDelta: '차이',
      colStatus: '상태',

      // Summary
      summaryOf: '중',
      summaryShort: '명이 부족',
      summaryDeficit: '총 부족량:',
      summaryReady: '모든 멤버의 석탄이 충분합니다.',

      // Season-inactive banner
      inactiveHeading: '이번 시즌에는 석탄 소모 계산이 적용되지 않습니다',
      inactiveHint: '위 전쟁구역 선택기를 시즌 2 폴라 스톰이 진행 중인 전쟁구역으로 전환하거나, "change" 링크로 시즌 오버라이드를 지정해 계획을 세우세요.',

      // Errors
      errFurnaceRange: '화로 레벨은 1–30 사이여야 합니다.',
      errCoalNegative: '석탄 비축량은 음수일 수 없습니다.',
      errDuration: '지속 시간은 양수여야 합니다.',
      errBatchEmpty: '최소 한 명의 멤버를 붙여넣으세요.',
      errBatchHeaders: "필수 컬럼이 없습니다. 최소한 'name', 'furnace_level', 'coal_stock'이 필요합니다.",
      errNetwork: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',

      // Season-variant banner
      variantBannerPrefix: '계획 시즌:',
      variantBannerConnector: '—',

      // ---- S1 Crimson Plague (placeholder-only, KB-cited) ----
      s1PlaceholderTitle: '시즌 1은 자원-창구 예산 계산이 필요하지 않습니다',
      s1PlaceholderBody: '크림슨 플레이그는 시즌 2 석탄처럼 지속 소모 메커니즘이 없습니다. 자원 압박은 커럽터 전투를 위한 바이러스 저항력이며 (KB [[05-season-1-crimson-plague]] §16.3), 이는 비축 지표가 아닙니다. S1 계획에는 시즌 타임라인 또는 향후 커럽터 VR 계산기를 사용하세요.',
      s1CtaTimeline: '둠스데이 사이클 + VR 그라인드 순서는 시즌 타임라인 도구를 사용하세요 (KB [[05-season-1-crimson-plague]] §16.3).',
      s1VriCap: 'VRI (바이러스 저항 연구소)를 L30까지 육성 시 최대 +10,000 VR — S1 유일한 유의미 저항 소스 (KB [[05-season-1-crimson-plague]] §5, §16.3).',
      s1DoomsdayCadence: '둠스데이 사이클은 48일(8주) 시즌 내내 7일 주기로 반복 — 커럽터 푸시는 KB05 §16.8 스케줄에 맞춰 계획하세요.',

      // ---- S3 Golden Kingdom ----
      s3ToolTitle: '향신료 예산 계산기',
      s3Lede: '카피톨 전쟁(W7D7)까지 연맹은 얼마나 많은 향신료를 확보할까요? 도시 등급별 시간당 생산량 100–600 (KB [[07-future-seasons]] §S3), 향신료 전쟁 약탈 노출 (전투당 30% 상한), 카피톨/캐논 보너스(+10M/+5M)를 반영합니다.',
      s3CityCount: '보유 도시 수',
      s3CityCountHint: '0 – 8 (연맹 상한)',
      s3AvgLevel: '평균 도시 등급',
      s3AvgLevelHint: '1 – 6',
      s3SpiceStock: '보유 향신료',
      s3SpiceStockHint: '현재 비축량',
      s3DaysToCapitol: '카피톨 전쟁까지 남은 일수',
      s3DaysToCapitolHint: 'W7D7 = 목표일',
      s3DefensiveMode: '약탈 노출 표시 (향신료 전쟁당 30%)',
      s3DefensiveModeHint: '비축량을 목표 × 1.43 이하로 유지하면 30% 손실 후에도 목표 유지.',
      s3TargetLabel: 'W7D7 카피톨 전쟁 시점 목표 향신료',
      s3ProductionRateHint: 'L1 시간당 100 · L2 200 · L3 300 · L4 400 · L5 500 · L6 600 · 수도 점령 +1000만 · 캐논당 +500만 (KB [[07-future-seasons]] §765–810)',
      s3PlunderWarn: '각 향신료 전쟁 라운드는 미예치 향신료의 최대 30%를 약탈. 30% 손실 후에도 목표 유지하려면 완충 = 목표 × 1.43 이상.',

      // ---- S4 Evernight Isle ----
      s4ToolTitle: '코퍼 비축 계획기',
      s4Lede: '시즌 4가 끝날 때 코퍼는 얼마나 남을까요? 도시 등급별 시간당 100–600 생산 (KB [[07-future-seasons]] §S4), 코퍼 전쟁 최대 8라운드(W4–W7 수/토)의 15% 상한 약탈 노출, 순위 그룹 티어 예측을 반영합니다.',
      s4CopperCities: '보유 코퍼 도시 (최대 6)',
      s4CopperCitiesHint: '0 – 6',
      s4AvgCityLevel: '평균 도시 등급',
      s4AvgCityLevelHint: '1 – 6',
      s4DigStrongholds: '보유 굴착 요새 (최대 6)',
      s4DigStrongholdsHint: '스톤 부수적 100–200/시',
      s4AvgStrongholdLevel: '평균 요새 등급',
      s4AvgStrongholdLevelHint: '1 – 6',
      s4CopperStock: '보유 코퍼',
      s4CopperStockHint: '현재 비축량',
      s4DaysRemaining: '남은 일수',
      s4DaysRemainingHint: '시즌 종료까지',
      s4WarsMode: '코퍼 전쟁 약탈 노출 표시 (라운드당 15% 상한 × 8라운드)',
      s4BloodNightHint: '블러드 나이트 알림: 일 3회 30분 창에서 분당 18k 파워 소모 (~일 162만)',
      s4RankingTierHint: 'W4 코퍼 랭킹 1그룹 = 상위 10 연맹 → W7까지 3개로 축소 (KB [[07-future-seasons]] §189–196).',
      s4StoneWarehouseHint: '돌 창고는 시간당 40,320 상시 생산 — 전쟁 창구 중에도 코퍼 부수입 최저 보장 (KB [[07-future-seasons]] §S4).',

      // ---- S5 Wild West ----
      s5ToolTitle: '은행 & 크리스탈골드 계획기',
      s5Lede: '시즌 5 종료 시 연맹의 크리스탈골드는 얼마일까요? 은행 점령 리듬(일 2회, 수/토만), 예치 계산(최대 15개 × 5일), 3주차부터 하이 눈 일일 15k 상한을 반영합니다.',
      s5BanksHeld: '보유 은행 (기본 4, 도시 포함 최대 12)',
      s5BanksHeldHint: '기본 상한 4; 도시당 +1, 최대 12',
      s5CitiesHeld: '보유 도시 (각 은행 상한 +1 해금)',
      s5CitiesHeldHint: '0 – 8',
      s5CrystalGoldStock: '보유 크리스탈골드',
      s5CrystalGoldStockHint: '현재 비축량',
      s5ActiveDeposits: '활성 예치 (최대 15)',
      s5ActiveDepositsHint: '5일 기간, 일 3개 상한',
      s5InterestRate: '5일 기간당 이자율 (%)',
      s5InterestUnverified: '이자율은 지식 베이스에 미공개 — 서버의 관측치를 입력하세요. 기본 5%는 임시값.',
      s5DaysRemaining: '남은 일수',
      s5DaysRemainingHint: '시즌 종료까지',
      s5TargetL10: 'L10 은행 목표 (바이러스 저항력 39,900 필요)',

      // ---- S6 Shadow Rainforest ----
      s6ToolTitle: '영웅 각성 조각 계획기',
      s6Lede: '이번 시즌 6에 목표 영웅을 완전히 각성시킬 수 있을까요? 각성 번들이 시즌 중반 영구 삭제되었습니다 (KB [[07-future-seasons]] §S6) — 무과금 조각 계산만 가능합니다. 해금 = 50 조각. 3성 완성 = 1,190 조각 (50 + 130 + 330 + 680).',
      s6TargetHero: '목표 영웅 (로테이션: W1 킴벌리, W3 D.Va, W6 테슬라)',
      s6TargetHeroHint: '각성 로테이션은 시즌별 고정',
      s6CurrentShards: '현재 지정 영웅 조각',
      s6CurrentShardsHint: '이벤트 드랍/퀘스트/마일스톤',
      s6WeeklyDropRate: '주당 예상 조각 (무과금 — 서버 관측치 입력)',
      s6WeeklyDropRateHint: '지식 베이스에 미공개 — 관측치만',
      s6WeeksRemaining: '남은 주 수',
      s6WeeksRemainingHint: '시즌 종료까지',
      s6DropRateUnverified: '무과금 조각 드랍률은 지식 베이스에 미공개 — 서버 관측치를 입력하세요.',
      s6ThresholdUnlock: '해금: 50 조각',
      s6ThresholdStar1: '1★: +130 (누적 180)',
      s6ThresholdStar2: '2★: +330 (누적 510)',
      s6ThresholdStar3: '3★: +680 (누적 1,190)',
      s6PackRemovalCompensation: '번들 삭제 보상: 전용 무기 조각 200 + 발러 뱃지 1,000 (수신함 지급, KB [[07-future-seasons]] §335).',
      s6GlobalExpeditionHint: '글로벌 원정은 W2/W4/W6 각 14일씩 — 시즌 최대 무과금 조각 드롭 3회 (KB [[07-future-seasons]] §S6).',
      s6AwakeningRotationHint: '각성 로테이션은 시즌 주차별 고정: W1 킴벌리 (KB v1.3 수정: 공격 패시브) · W3 D.Va · W6 테슬라 (KB v1.3에서 W5 → W6 수정).',

      // ---- S7 Placeholder (메커니즘 미공개) ----
      s7ComingTitle: '시즌 7 출시 예정 — 2026년 8월경',
      s7ComingBody: 'S7 메커니즘이 공개되면 도구 지원이 시작됩니다. 현재는 지도·자원·영웅 로테이션·팩션 구조 모두 미확정입니다. 업데이트는 r5tools.io에서 확인하세요.',
      s7ComingTracker: '추적: r5tools.io',

      // ---- 석탄 획득처 (KB [[17-seasons-catalog]] §118-127) ----
      sourcesHeading: '석탄 획득처 (시즌 2)',
      sourcesDesc: '획득처별 일일 예상 석탄량 — 9개 모두 지식 베이스에서 검증. 각 행은 편집 가능하며, 아래 56일 예산 차트가 실시간으로 갱신됩니다.',
      srcColSource: '획득처',
      srcColDaily: '일일 석탄 예상',
      srcColOn: '사용',
      srcColNote: 'KB 노트',
      srcReset: '기본값 복원',
      srcAvgDaily: '평균 석탄/일 (기간 반영)',
      srcOneShot: 'Day 1 일회성',
      srcPolarZombies: '북극 좀비 첫 처치',
      srcPolarZombiesNote: '1주차 1일, 일회성. L180 방랑자 기준 ~20만 보고됨.',
      srcSeasonQuests: '시즌 퀘스트',
      srcSeasonQuestsNote: '8주 내내 꾸준한 적립.',
      srcDigSie: '채굴장 생산',
      srcDigSite: '채굴장 생산',
      srcDigSiteNote: '보유 채굴장 2,736–3,456/hr (L1–L6). 3일차부터 (L1 오픈).',
      srcHeroReturn: '영웅 복귀권',
      srcHeroReturnNote: 'S1에서 아껴둔 티켓 → 1-7일 사이 사용.',
      srcSupplyCollect: '보급 수집',
      srcSupplyCollectNote: '0°C 이하 온도에서 스폰. 회수 순서대로 진행.',
      srcDistressed: '조난자 신호',
      srcDistressedNote: '레이더 임무. 시즌 시작 전 레이더 대기시켜두세요.',
      srcPolarDishes: '북극 요리 이벤트',
      srcPolarDishesNote: '2주차, 최대 65만 (65 × 10K 매칭 보상). 7일간 ~9.2만/일.',
      srcPasses: '주간 + 배틀 패스',
      srcPassesNote: '패스 화폐를 석탄 팩으로 교환.',
      srcCoalPacks: '석탄 팩 (유료)',
      srcCoalPacksNote: '월별 지출 예상액을 입력하세요.',

      // ---- 티타늄 합금 공장 ----
      alloyHeading: '티타늄 합금 공장 경제',
      alloyDesc: '공장 1은 S2 시작 시 사용 가능. 공장 N이 L15에 도달하면 공장 N+1 언락 — 무료로 4개까지 체인 확장; 공장 5는 주간 패스 필요. 각 공장은 레벨당 +720 티타늄/hr 정률 생산 (L30 최대 = 21,600/hr).',
      alloyColFactory: '공장',
      alloyColUnlock: '언락 조건',
      alloyColOutput: 'L15 생산량',
      alloyColCoalCost: '석탄 비용 L1→L15',
      alloyColNotes: '비고',
      alloyFactory: '공장',
      alloyUnlockF1: 'S2 시작 시 사용 가능',
      alloyUnlockF2: '공장 1이 L15 달성',
      alloyUnlockF3: '공장 2가 L15 달성',
      alloyUnlockF4: '공장 3이 L15 달성',
      alloyUnlockF5: '주간 패스 구매',
      alloyNotesF1: '1일차 즉시 건설. 캐스케이드 우선순위 1위.',
      alloyNotesF2: '캐스케이드 업그레이드로 2–3일차에 언락.',
      alloyNotesF3: '세 번째 무료 슬롯 — 4–5일차 언락.',
      alloyNotesF4: '네 번째 (마지막 무료) 슬롯.',
      alloyNotesF5: '유료 전용. 주간 지속 여부는 미검증 (KB 오픈 질문).',
      alloySequenceHeading: '권장 공장 순서 (첫 7일)',
      alloySeqDay1: '1일: 공장 1 건설. L15 방향으로 업그레이드 시작. HHF “눈보라 자동 활성화” 켜기.',
      alloySeqDay2: '2일: 공장 1을 L10-L12까지. 시즌 퀘스트 + 영웅 복귀권으로 석탄 축적 시작.',
      alloySeqDay3: '3일: 공장 1이 L15 → 공장 2 건설. 첫 L1 채굴장 확보 (인접 규칙 준수).',
      alloySeqDay4: '4일: 공장 2를 L10+까지. 석탄 과소비 주의 — HHF도 연료가 필요합니다.',
      alloySeqDay5: '5일: 공장 2가 L15 → 공장 3 건설. 채굴장 석탄 수입 (L1 2,736/hr) 이 공장 소모를 상쇄.',
      alloySeqDay6: '6일: 공장 3을 L10+까지. 8일차 개막 북극 요리 이벤트 대비.',
      alloySeqDay7: '7일: 공장 3이 L15 → 공장 4 건설. 4공장 캐스케이드 완성; 각 L15 기준 원 티타늄 +14.4K/hr.',
      alloyTotalCoal: '무료 4공장 L15까지의 캐스케이드는 공장 업그레이드에만 약 33만 석탄 필요 — 화로 연료는 별도.',

      // ---- 56일 석탄 예산 차트 ----
      budgetHeading: '56일 석탄 예산 예측',
      budgetDesc: '현재 보유량부터 시작해 8주 시즌 전체의 일별 예상 잔량을 추적합니다. 고열 화로 소모, 연맹 화로 레벨, 활성화된 획득처를 반영. 선이 0 아래로 내려가면 그 날 연맹의 석탄이 바닥 — 그 전에 보충 계획을 세우세요.',
      allianceFurnaceLevel: '연맹 화로 레벨',
      allianceFurnaceLevelHint: '1 – 20 (레어 소일로 자동 승급)',
      afHoursPerDay: '연맹 화로 하루 가동 시간',
      afHoursPerDayHint: '연맹 전체 소모 창구 (눈보라 + 준비)',
      hhfHoursPerDay: 'HHF 하루 가동 시간',
      hhfHoursPerDayHint: '개인 화로 가동 시간 (일반 모드)',
      hhfOverdriveHoursPerDay: 'HHF 오버드라이브 시간 / 일',
      hhfOverdriveHoursPerDayHint: '눈보라 창구 전용',
      budgetChartTitle: '예상 석탄 잔량, 1-56일차',
      budgetChartX: '시즌 일차',
      budgetChartY: '석탄 잔량',
      budgetRunOutPrefix: '연맹 석탄 고갈 예정일:',
      budgetRunOutSuffix: '그 전에 획득처를 늘리거나 화로 가동 시간을 줄이세요.',
      budgetSurplusPrefix: '시즌 종료 시 잉여:',
      budgetSurplusSuffix: '석탄. 안전 범위입니다.',
      budgetNote: '모델: 일별 잔량[t] = 잔량[t-1] + Σ(활성 획득처) − 개인 소모 − 연맹 소모 몫 − 공장 업그레이드 평균. 연맹 소모 몫 = 화로당 시간별 × 시간 × 1 (개인 기여, 하루 50 기부 제한 KB [[06-season-2-frozen]] §120).',
    },
  };

  var initialLang = (function () {
    try {
      var stored = localStorage.getItem('lws_lang');
      if (stored === 'en' || stored === 'ko') return stored;
    } catch (e) { /* private mode */ }
    return (navigator.language || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  })();

  window.LWSI18N = {
    dict: I18N,
    lang: initialLang,

    t: function (key) {
      var d = I18N[this.lang] || I18N.en;
      if (d[key] !== undefined) return d[key];
      if (I18N.en[key] !== undefined) return I18N.en[key];
      return key;
    },

    apply: function () {
      var self = this;
      document.documentElement.lang = self.lang;
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var k = el.getAttribute('data-i18n');
        el.textContent = self.t(k);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
        var k = el.getAttribute('data-i18n-placeholder');
        el.placeholder = self.t(k);
      });
      document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
        var k = el.getAttribute('data-i18n-title');
        el.title = self.t(k);
      });
    },

    toggle: function () {
      this.lang = (this.lang === 'en') ? 'ko' : 'en';
      try { localStorage.setItem('lws_lang', this.lang); } catch (e) { /* ignore */ }
      try { window.dispatchEvent(new CustomEvent('lws:lang-changed', { detail: { lang: this.lang } })); } catch (e) { /* ignore */ }
      this.apply();
    },
  };
})();
