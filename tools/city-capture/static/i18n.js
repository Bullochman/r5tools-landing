/*
 * LWS City / Dig-Site Capture Planner — i18n dictionary.
 *
 * Every user-visible string flows through here. No hardcoded English in the DOM.
 *
 * KR terminology sourced from:
 *   - LWS_Knowledge_Base/kb/06-season-2-frozen.md  (KR ↔ EN table)
 *   - LWS_Knowledge_Base/kb/15-glossary.md         (unified glossary)
 */
(function (global) {
  'use strict';

  var I18N = {
    en: {
      // ---- header / brand ----
      brand: 'R5TOOLS.IO',
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
      capacityCitiesHelp: 'Max 6 cities per alliance',
      capacityDigsHelp: 'Max 4 dig sites per alliance',
      exportHeading: 'Export',


      // ---- main title / lede ----
      title: 'City / Dig-Site Capture Planner',
      lede: 'Season 2 territory planner. Pick which of the 6 cities and 4 dig-sites your alliance captures on each day of Weeks 1–4, factoring city temperature bonuses (+5 °C at L1 → +60 °C at L6) and the 36-hour post-capture protection window.',

      // ---- capacity ----
      capacityCities: 'Cities captured',
      capacityDigs: 'Dig sites captured',
      capacityCitiesHelp: 'Max 6 cities per alliance',
      capacityDigsHelp: 'Max 4 dig sites per alliance',
      captureCounterLabel: 'Captures used today',
      captureCounterMax: 'of 2 max',

      // ---- priority queue ----
      queueHeading: 'Priority queue',
      queueEmpty: 'No candidates loaded yet. Paste candidate coordinates below or upload your scouted list.',
      thPriority: 'Priority',
      thType: 'Type',
      thCoord: 'Coordinate',
      thTargetLevel: 'Target L',
      thHeatDelta: 'Heat Δ',
      thSoilPerHr: 'Soil/hr',
      thUnlock: 'Unlocks',
      thNotes: 'Notes',
      typeCity: 'City',
      typeDig: 'Dig',

      // ---- protection timers ----
      protectionHeading: 'Post-capture protection (36 h)',
      protectionEmpty: 'No captured territories yet. Once you capture, the 36-hour shield countdown appears here.',
      protectionExpires: 'expires in',
      protectionExpired: 'expired — rally-vulnerable',
      protectionExpiringSoon: 'expiring soon',

      // ---- buttons ----
      importRoster: 'Import roster CSV',
      importCandidates: 'Import candidates',
      exportPng: 'Export PNG roadmap',
      exportCsv: 'Export CSV queue',
      exportJson: 'Export JSON queue',
      copyDiscord: 'Copy Discord summary',
      openHeatSim: 'Open Heat Simulator on target',
      rank: 'Rank candidates',
      addCandidate: 'Add candidate',

      // ---- roster panel ----
      rosterHeading: 'Alliance roster',
      rosterEmpty: 'No roster loaded. Upload your alliance CSV (same format as Hive Grid Manager).',
      rosterExposed: 'freeze-exposed',
      rosterCovered: 'covered',

      // ---- hive center ----
      hiveCenterHeading: 'Hive center coordinate',
      hiveCenterHelp: 'Alliance Furnace location (used for adjacency + proximity scoring)',
      hiveCenterX: 'X',
      hiveCenterY: 'Y',

      // ---- week / day picker ----
      weekPickerHeading: 'Season timeline',
      week: 'Week',
      day: 'Day',
      unlockSchedule: 'Unlock schedule',
      unlockL1: 'L1 Village — W1 D3+12h',
      unlockL2: 'L2 Town — W1 D6+12h',
      unlockL3: 'L3 — W2 D3+12h',
      unlockL4: 'L4 — W2 D6+12h',
      unlockL5: 'L5 — W3 D3+12h',
      unlockL6: 'L6 — W3 D6+12h',
      unlockL7: 'L7 (Capitol-tier) — W4 D7+12h',

      // ---- adjacency rule note ----
      adjacencyRule: 'Rule: first capture MUST be a L1 dig site. Every subsequent capture must be adjacent to owned territory.',

      // ---- unlock timeline (Gantt) ----
      timelineHeading: 'Unlock timeline',
      timelineHelp: 'Each city / dig-site level unlocks at a fixed offset from your warzone\'s Season 2 start. The gold marker is now (or projected if start-date not yet set).',
      timelineStartLabel: 'Season 2 start date (server time)',
      timelineStartHelp: 'Auto-filled from your warzone. Override if your warzone announced a different date/time.',
      timelineNoStart: 'No season-2 start date set for this warzone yet — using today as an illustrative anchor. Set it above to lock the timeline to your server.',
      timelineTickWeek: 'Wk',
      timelineNow: 'NOW',
      timelineUnlocksAt: 'unlocks',
      timelineOpensIn: 'opens in',
      timelineAlreadyOpen: 'already open',

      // ---- resistance table ----
      resHeading: 'Resistance targets (rally sizing)',
      resHelp: 'Total troop power the alliance rally must project to cap out damage on the city / dig-site. Feeds the Rally Squad Recommender below.',
      resThLevel: 'Level',
      resThName: 'Name',
      resThResistance: 'Resistance',
      resThHeat: 'Heat bonus',
      resThUnlock: 'Unlock',
      resL1Name: 'L1 Village',
      resL2Name: 'L2 Town',
      resL3Name: 'L3 City',
      resL4Name: 'L4 City',
      resL5Name: 'L5 City',
      resL6Name: 'L6 City',
      resL7Name: 'L7 Capitol',
      resUnknown: 'unpublished',

      // ---- cadence tracker ----
      cadenceHeading: 'Capture cadence',
      cadenceCitiesLeft: 'Cities open',
      cadenceCitiesLeftSub: 'until 6-city cap',
      cadenceDigsLeft: 'Dig sites open',
      cadenceDigsLeftSub: 'until 4-dig cap',
      cadenceTodayLeft: 'Captures left today',
      cadenceTodayLeftSub: 'alliance is capped at 2 stronghold + 2 city declarations / day',
      cadenceAllFull: 'CAP HIT',
      cadenceNoneToday: 'DAY DONE',

      // ---- rally squad recommender ----
      rallyHeading: 'Rally squad recommender',
      rallyHelp: 'Paste your alliance top-10 (or however many) members\' power values, one per line (name,power  or just power). Tool suggests smallest squad that meets each level\'s resistance.',
      rallyExamplePlaceholder: 'Kayla,142000000\nEvan,138500000\nJohn,120000000\nRony,115000000\n... (one per line)',
      rallyLevelPickerLabel: 'Target level',
      rallyResultHeading: 'Suggested squad',
      rallyIncluded: 'included',
      rallyOfTarget: 'of target',
      rallyMet: 'target MET',
      rallyShort: 'target SHORT',
      rallyNoRoster: 'Paste roster above and click "Suggest squad" to see the recommended lineup for each level.',
      rallyBtnSuggest: 'Suggest squad',
      rallyRosterCount: 'members loaded',
      rallyEmptyRoster: 'No members parsed. One per line, format: name,power (comma-separated) or just power number.',
      rallyAllLevelsHeading: 'Recommended squads (all unlocked levels)',

      // ---- KB citation ----
      kbCite: 'Numbers sourced from LWS Knowledge Base',

      // ---- footer ----
      footerCred: 'Powered by the LWS Knowledge Base',
      footerLink: 'r5tools.io',

      // ---- gate messages ----
      gateLoading: 'Checking access…',
      gateBlocked: 'This tool requires an Alliance Access Code. Unlocking…',

      // ---- S1 Crimson Plague (no-content fallback, i18n-keyed) ----
      s1FallbackTitle: "City capture doesn't apply to Season 1 Crimson Plague",
      s1FallbackBody: 'Season 1 is Doomsday-cycle PvE on the Land of Fog and Rain — cities reset with the weekly Doomsday cycle and there is no per-alliance capture cap. Switch to Season 2, 3, 4, 5, or 6 above to use the planner.',

      // ---- Season 7 placeholder (unified copy — mirrored across all 6 static tools) ----
      s7ComingTitle: 'Season 7 launches ~August 2026',
      s7ComingBody: 'Full tool support arrives when Anthropic publishes S7 mechanics (usually 1-2 weeks before launch). Track updates at r5tools.io.',
      s7ComingTracker: 'Track: r5tools.io',

      // ---- S3 Golden Kingdom ----
      s3Lede: 'Season 3 Golden Kingdom — 8 cities + 8 Digging Strongholds per alliance on the 13×13 desert map. Spice 100/hr (L1 Village) → 600/hr (L6 Square of Judgment). Spice Wars Wed/Sat W4-8, up to 30% plunder cap.',
      s3AcRangeWarn: 'AC range gate: every base must stay inside 5-tile Alliance Center range or Large Sandworms teleport it out (Sandworm Crisis W1-2).',
      s3SpiceWarsBanner: 'Spice Wars overlay — Wed/Sat W4-8. Capitol +10M Spice, Cannon +5M Spice, up to 30% plunder cap.',
      s3DigPriority: 'Prioritize Digging Strongholds — Mithril fuels Desert Protectors during Spice Wars.',
      thSpicePerHr: 'Spice/hr',
      s3PyramidWar: 'W4D6: Pyramid War begins (Capitol/Great Pyramid contestable, delayed +36h).',

      // ---- S4 Evernight Isle ----
      s4Lede: 'Season 4 Evernight Isle — 6 cities + 6 Digging Strongholds per alliance (24 total cities L1-L6 on the map). Copper 100/hr (L1) → 600/hr (L6). 11-tile min spacing between neighboring Alliance Centers.',
      s4BloodNightWarn: 'Blood Night Descend: 3× daily at 02:30 / 10:30 / 18:30 server (30 min each). Drains +18k power/min. Do NOT capture during blood-night windows.',
      s4CopperWarsWarn: 'Copper Wars — Wed/Sat W4-7, 8 rounds. 24h declaration window per round. Max 3 attackers per target, 15% plunder cap per round.',
      s4DigPriority: 'Digging Strongholds produce Stone (100-200/hr). Prioritize for Optoelectronic Lab + Lighthouse upgrades.',
      thCopperPerHr: 'Copper/hr',
      s4AcSpacingWarn: 'AC 11-tile spacing rule — verify your Alliance Center is at least 11 tiles from neighboring alliance ACs.',

      // ---- S5 Wild West (Bank mode) ----
      s5Title: 'Bank Stronghold Capture Planner',
      s5Lede: 'Season 5 Wild West — 2 Bank captures/day on Wed+Sat only. Default 4 Bank max, +1 per city controlled up to 12 max. Sundays are Truce Day.',
      s5CapacityBanks: 'Banks captured',
      s5CapacityBanksHelp: 'Max 4 Banks (default) → up to 12 with 8 cities controlled',
      s5CapacityDeposits: 'CrystalGold deposits',
      s5CapacityDepositsHelp: '3 deposits/day, up to 15 simultaneous (5-day terms)',
      s5WarWindowWarn: 'War windows: Wed + Sat only. 3 fixed war slots/day (1h each, 7h apart). Alliance Safe Time disables 1 slot for 7-15h.',
      s5TruceDayWarn: 'Sunday = Truce Day. No Bank captures.',
      s5UnlockL1: 'L1-6 Banks — Week 1',
      s5UnlockL7: 'L7-10 Banks — Week 4 (L10 requires 39,900 Virus Resistance)',
      s5HighNoon: 'High Noon: 15,000 CrystalGold/day cap from W3',
      s5InterestUnknown: 'Interest rate: unpublished (KB open question)',
      thCrystalgoldInterest: 'CG interest',
      s5NoProtection: 'Next war window',
      s5NoProtectionEmpty: 'No captures yet. Next Wed/Sat war window shows here.',

      // ---- S6 Shadow Rainforest (Altar mode) ----
      s6Title: 'Altar Conquest Planner',
      s6Lede: 'Season 6 Shadow Rainforest — 5 Altars in the Great River central zone. Hold max 3 simultaneously. Open Tuesdays only.',
      s6AltarCobra: 'Cobra Altar — Recruiter role → Cobra Barrier (alliance shield)',
      s6AltarEcho: 'Echo Altar — Muse role → Night Army summon',
      s6AltarGust: 'Gust Altar — Warlord role → Serpent Breath (contamination attack)',
      s6AltarFeather: 'Feather Altar — Butler role → Feather Lightning strike',
      s6AltarTreehaven: 'Treehaven Altar — Alliance Leader role → Reset skill cooldowns',
      s6MaxHeldBadge: 'Max 3 held simultaneously',
      s6TuesdayWarn: 'Altars open TUESDAYS ONLY. Unoccupied = highest progress at timer end wins. Occupied = exactly 100% completion required.',
      s6SteppingStoneWarn: 'Altars CANNOT be used as stepping stones — they are isolated capturable nodes only.',
      s6SanctuaryWarn: 'Sanctuary timer buffed to 20 min (of 60-min attack window). Plan around it.',
      s6CityDestructionWarn: 'S6 city captures are PERMANENT. Attacker +50% IP, defender -100% IP. Destroyed cities don\'t count vs your cap.',
      s6PactHint: 'Same-faction alliances: 7-day pacts, 200 members, prevent City Destruction.',
      thAllianceSkill: 'Alliance Skill',
      s6NextWindow: 'Next Tuesday altar window',
    },

    ko: {
      brand: 'R5TOOLS.IO',
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
      capacityCitiesHelp: '얼라이언스당 최대 6개 도시',
      capacityDigsHelp: '얼라이언스당 최대 4개 채굴지',
      exportHeading: '내보내기',


      title: '도시 / 발굴지 점령 플래너',
      lede: '시즌 2 영토 플래너. 도시 6개 + 채굴장 4개 중 어떤 곳을 1~4주차 각 날짜에 점령할지 계획하세요. 도시 온도 보너스(L1 +5°C → L6 +60°C)와 점령 후 36시간 보호 창을 반영합니다.',

      capacityCities: '점령한 도시',
      capacityDigs: '점령한 채굴장',
      capacityCitiesHelp: '연맹당 최대 6개 도시',
      capacityDigsHelp: '연맹당 최대 4개 채굴장',
      captureCounterLabel: '오늘 사용한 점령',
      captureCounterMax: '/ 최대 2회',

      queueHeading: '우선순위 큐',
      queueEmpty: '아직 후보가 없습니다. 아래에 후보 좌표를 붙여넣거나 정찰 목록을 업로드하세요.',
      thPriority: '우선순위',
      thType: '유형',
      thCoord: '좌표',
      thTargetLevel: '목표 레벨',
      thHeatDelta: '온도 Δ',
      thSoilPerHr: '희토/시간',
      thUnlock: '개방',
      thNotes: '메모',
      typeCity: '도시',
      typeDig: '채굴장',

      protectionHeading: '점령 후 보호 (36시간)',
      protectionEmpty: '아직 점령한 영토가 없습니다. 점령 시 36시간 보호막 카운트다운이 여기에 표시됩니다.',
      protectionExpires: '만료까지',
      protectionExpired: '만료됨 — 집결 취약',
      protectionExpiringSoon: '곧 만료',

      importRoster: '연맹원 CSV 가져오기',
      importCandidates: '후보 가져오기',
      exportPng: 'PNG 로드맵 내보내기',
      exportCsv: 'CSV 큐 내보내기',
      exportJson: 'JSON 큐 내보내기',
      copyDiscord: '디스코드 요약 복사',
      openHeatSim: '목표 좌표로 히트 시뮬레이터 열기',
      rank: '후보 순위 매기기',
      addCandidate: '후보 추가',

      rosterHeading: '연맹원 명단',
      rosterEmpty: '명단이 로드되지 않았습니다. 연맹 CSV를 업로드하세요 (하이브 그리드 매니저와 동일 형식).',
      rosterExposed: '동결 노출',
      rosterCovered: '보호됨',

      hiveCenterHeading: '연맹 중심 좌표',
      hiveCenterHelp: '동맹 화로 위치 (인접성 + 근접성 점수 계산에 사용)',
      hiveCenterX: 'X',
      hiveCenterY: 'Y',

      weekPickerHeading: '시즌 타임라인',
      week: '주차',
      day: '일차',
      unlockSchedule: '개방 일정',
      unlockL1: 'L1 마을 — 1주 3일차+12h',
      unlockL2: 'L2 도시 — 1주 6일차+12h',
      unlockL3: 'L3 — 2주 3일차+12h',
      unlockL4: 'L4 — 2주 6일차+12h',
      unlockL5: 'L5 — 3주 3일차+12h',
      unlockL6: 'L6 — 3주 6일차+12h',
      unlockL7: 'L7 (수도급) — 4주 7일차+12h',

      adjacencyRule: '규칙: 첫 번째 점령은 반드시 L1 채굴장이어야 합니다. 이후 모든 점령은 소유 영토에 인접해야 합니다.',

      // ---- unlock timeline (Gantt) ----
      timelineHeading: '개방 타임라인',
      timelineHelp: '각 도시 / 채굴장 레벨은 워존의 시즌 2 시작 시각에서 고정된 오프셋으로 개방됩니다. 금색 마커는 현재 (또는 시작일이 아직 설정되지 않은 경우 예상 위치)입니다.',
      timelineStartLabel: '시즌 2 시작 (서버 시간)',
      timelineStartHelp: '워존에서 자동 입력됩니다. 다른 날짜/시간이 발표되었으면 재정의하세요.',
      timelineNoStart: '이 워존의 시즌 2 시작 날짜가 아직 설정되지 않았습니다 — 참고용으로 오늘을 기준점으로 사용합니다. 위에서 설정하여 서버에 맞게 고정하세요.',
      timelineTickWeek: '주',
      timelineNow: '지금',
      timelineUnlocksAt: '개방',
      timelineOpensIn: '개방까지',
      timelineAlreadyOpen: '이미 개방됨',

      // ---- resistance table ----
      resHeading: '저항력 목표 (집결 규모)',
      resHelp: '도시 / 채굴장에 최대 피해를 주기 위해 연맹 집결이 투사해야 할 총 병력 전투력. 아래의 집결 스쿼드 추천기에 입력됩니다.',
      resThLevel: '레벨',
      resThName: '이름',
      resThResistance: '저항력',
      resThHeat: '온도 보너스',
      resThUnlock: '개방',
      resL1Name: 'L1 마을',
      resL2Name: 'L2 도시',
      resL3Name: 'L3 도시',
      resL4Name: 'L4 도시',
      resL5Name: 'L5 도시',
      resL6Name: 'L6 도시',
      resL7Name: 'L7 수도',
      resUnknown: '미공개',

      // ---- cadence tracker ----
      cadenceHeading: '점령 케이던스',
      cadenceCitiesLeft: '가능한 도시',
      cadenceCitiesLeftSub: '6개 상한까지',
      cadenceDigsLeft: '가능한 채굴장',
      cadenceDigsLeftSub: '4개 상한까지',
      cadenceTodayLeft: '오늘 남은 점령',
      cadenceTodayLeftSub: '연맹 상한: 요새 2회 + 도시 선언 2회 / 일',
      cadenceAllFull: '상한 도달',
      cadenceNoneToday: '오늘 종료',

      // ---- rally squad recommender ----
      rallyHeading: '집결 스쿼드 추천',
      rallyHelp: '연맹 상위 10명(또는 원하는 수)의 전투력을 한 줄에 하나씩 붙여넣으세요 (이름,전투력 또는 전투력만). 각 레벨 저항력을 충족하는 최소 스쿼드를 제안합니다.',
      rallyExamplePlaceholder: '카일라,142000000\n에반,138500000\n존,120000000\n로니,115000000\n... (한 줄에 하나씩)',
      rallyLevelPickerLabel: '목표 레벨',
      rallyResultHeading: '추천 스쿼드',
      rallyIncluded: '포함',
      rallyOfTarget: '목표 대비',
      rallyMet: '목표 달성',
      rallyShort: '목표 미달',
      rallyNoRoster: '위에 명단을 붙여넣고 "스쿼드 제안"을 클릭하면 각 레벨별 추천 라인업이 표시됩니다.',
      rallyBtnSuggest: '스쿼드 제안',
      rallyRosterCount: '명 로드됨',
      rallyEmptyRoster: '파싱된 인원이 없습니다. 한 줄에 하나씩, 형식: 이름,전투력 (쉼표 구분) 또는 전투력 숫자만.',
      rallyAllLevelsHeading: '추천 스쿼드 (개방된 모든 레벨)',

      kbCite: 'LWS 지식 베이스 출처',

      footerCred: 'LWS 지식 베이스에서 지원',
      footerLink: 'r5tools.io',

      gateLoading: '접근 권한 확인 중…',
      gateBlocked: '이 도구는 연맹 액세스 코드가 필요합니다. 잠금 해제 중…',

      // ---- S1 Crimson Plague (no-content fallback) ----
      s1FallbackTitle: '도시 점령은 시즌 1 크림슨 페스트에는 적용되지 않습니다',
      s1FallbackBody: '시즌 1은 안개와 비의 땅에서 진행되는 둠스데이 사이클 PvE입니다 — 도시는 주간 둠스데이 사이클과 함께 리셋되며 연맹당 점령 제한이 없습니다. 시즌 2, 3, 4, 5, 6으로 전환하여 플래너를 사용하세요.',

      // ---- Season 7 placeholder (unified copy — mirrored across all 6 static tools) ----
      s7ComingTitle: '시즌 7 출시 예정 — 2026년 8월경',
      s7ComingBody: 'Anthropic이 시즌 7 메커니즘을 공개하면 (보통 출시 1-2주 전) 전체 도구 지원이 시작됩니다. 업데이트는 r5tools.io에서 확인하세요.',
      s7ComingTracker: '추적: r5tools.io',

      // ---- S3 Golden Kingdom ----
      s3Lede: '시즌 3 골든 킹덤 — 13×13 사막 맵에서 연맹당 도시 8개 + 발굴 요새 8개. 스파이스 시간당 100 (L1 마을) → 600 (L6 심판의 광장). 스파이스 워: 수/토 4~8주차, 최대 약탈 30%.',
      s3AcRangeWarn: 'AC 범위 경고: 모든 기지는 연맹 센터 5칸 반경 내에 있어야 합니다. 벗어나면 샌드웜 크라이시스(1~2주차)에 텔레포트됩니다.',
      s3SpiceWarsBanner: '스파이스 워 오버레이 — 수/토 4~8주차. 캐피톨 +1000만 스파이스, 대포 +500만, 최대 30% 약탈.',
      s3DigPriority: '발굴 요새 우선 — 미스릴로 스파이스 워 중 사막 수호자를 유지하세요.',
      thSpicePerHr: '스파이스/시간',
      s3PyramidWar: '4주 6일차: 피라미드 전쟁 시작 (캐피톨/대피라미드 쟁탈, +36시간 지연).',

      // ---- S4 Evernight Isle ----
      s4Lede: '시즌 4 에버나이트 아일 — 연맹당 도시 6개 + 발굴 요새 6개 (맵 전체 도시 24개, L1~L6). 구리 시간당 100 (L1) → 600 (L6). 연맹 센터 간 최소 11칸 간격.',
      s4BloodNightWarn: '블러드 나이트 강림: 서버 시간 02:30 / 10:30 / 18:30 일일 3회 (각 30분). 전투력 분당 18,000 소모. 블러드 나이트 창 중에는 점령 금지.',
      s4CopperWarsWarn: '구리 전쟁 — 수/토 4~7주차, 총 8라운드. 라운드당 24시간 선언 창. 대상당 공격자 최대 3명, 라운드당 약탈 15% 상한.',
      s4DigPriority: '발굴 요새는 석재 생산 (시간당 100-200). 옵토일렉트로닉 랩 + 등대 업그레이드용으로 우선 확보.',
      thCopperPerHr: '구리/시간',
      s4AcSpacingWarn: 'AC 11칸 간격 규칙 — 이웃 연맹 AC로부터 11칸 이상 떨어져 있는지 확인하세요.',

      // ---- S5 Wild West (Bank mode) ----
      s5Title: '은행 요새 점령 플래너',
      s5Lede: '시즌 5 와일드 웨스트 — 수/토에만 하루 은행 2개 점령. 기본 최대 4개, 도시 1개당 +1 최대 12개. 일요일은 휴전일.',
      s5CapacityBanks: '점령한 은행',
      s5CapacityBanksHelp: '기본 최대 4개 → 도시 8개 보유 시 최대 12개',
      s5CapacityDeposits: '크리스탈골드 예치',
      s5CapacityDepositsHelp: '일일 3회 예치, 최대 15개 동시 (각 5일 만기)',
      s5WarWindowWarn: '전쟁 창: 수/토만. 하루 3개 고정 슬롯 (각 1시간, 7시간 간격). 연맹 세이프 타임은 1개 슬롯을 7~15시간 무효화합니다.',
      s5TruceDayWarn: '일요일 = 휴전일. 은행 점령 불가.',
      s5UnlockL1: 'L1~6 은행 — 1주차',
      s5UnlockL7: 'L7~10 은행 — 4주차 (L10은 바이러스 저항력 39,900 필요)',
      s5HighNoon: '하이눈: 3주차부터 하루 크리스탈골드 15,000 상한',
      s5InterestUnknown: '이자율: 미공개 (KB 미해결 질문)',
      thCrystalgoldInterest: 'CG 이자',
      s5NoProtection: '다음 전쟁 창',
      s5NoProtectionEmpty: '점령 없음. 다음 수/토 전쟁 창이 여기 표시됩니다.',

      // ---- S6 Shadow Rainforest (Altar mode) ----
      s6Title: '제단 정복 플래너',
      s6Lede: '시즌 6 섀도우 레인포레스트 — 그레이트 리버 중앙 지대에 제단 5개. 동시 최대 3개 보유. 화요일에만 개방.',
      s6AltarCobra: '코브라 제단 — 리크루터 역할 → 코브라 배리어 (연맹 방패)',
      s6AltarEcho: '에코 제단 — 뮤즈 역할 → 밤의 군단 소환',
      s6AltarGust: '거스트 제단 — 워로드 역할 → 서펜트 브레스 (오염 공격)',
      s6AltarFeather: '페더 제단 — 버틀러 역할 → 페더 라이트닝 스트라이크',
      s6AltarTreehaven: '트리헤이븐 제단 — 연맹장 역할 → 스킬 쿨다운 초기화',
      s6MaxHeldBadge: '동시 최대 3개 보유',
      s6TuesdayWarn: '제단은 화요일에만 개방. 미점거 = 타이머 종료 시 진행률 최고 승리. 점거 상태 = 정확히 100% 완료 필요.',
      s6SteppingStoneWarn: '제단은 디딤돌로 사용 불가 — 독립된 점령 노드입니다.',
      s6SanctuaryWarn: '성역 타이머 20분으로 강화 (60분 공격 창 중). 계획에 반영하세요.',
      s6CityDestructionWarn: '시즌 6 도시 점령은 영구적. 공격자 IP +50%, 방어자 IP -100%. 파괴된 도시는 상한에 포함되지 않음.',
      s6PactHint: '동일 진영 연맹: 7일 협정, 최대 200명, 도시 파괴 방지.',
      thAllianceSkill: '연맹 스킬',
      s6NextWindow: '다음 화요일 제단 창',
    },
  };

  // ---- language detection + apply ----

  function detectLang() {
    var stored = null;
    try { stored = localStorage.getItem('lws_lang'); } catch (e) { /* private mode */ }
    if (stored === 'en' || stored === 'ko') return stored;
    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return nav.startsWith('ko') ? 'ko' : 'en';
  }

  var current = detectLang();

  function t(key) {
    var dict = I18N[current] || I18N.en;
    return dict[key] !== undefined ? dict[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
  }

  function apply() {
    document.documentElement.lang = current;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var val = t(key);
      if (val !== undefined) el.placeholder = val;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      var val = t(key);
      if (val !== undefined) el.title = val;
    });
  }

  function toggle() {
    current = (current === 'en') ? 'ko' : 'en';
    try { localStorage.setItem('lws_lang', current); } catch (e) { /* ignore */ }
    apply();
  }

  global.LWSi18n = {
    t: t,
    apply: apply,
    toggle: toggle,
    lang: function () { return current; },
    dict: I18N,
  };
})(window);
