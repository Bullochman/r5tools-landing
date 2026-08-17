/* LWS Freeze Risk Dashboard — i18n dictionary (EN + KR)
 *
 * Every visible string in index.html comes from here. Access via I18N[lang][key].
 * KR terminology sourced from:
 *   - LWS_Knowledge_Base/kb/15-glossary.md
 *   - LWS_Knowledge_Base/kb/06-season-2-frozen.md ("KR ↔ EN terminology" table)
 *
 * Add a new string by adding a key to BOTH en{} and ko{}. Never add English
 * fallback in the DOM — the whole tool must speak Korean if the user toggles.
 */

window.I18N = {
  en: {
    // brand / header
    brand: "R5TOOLS.IO",
    brandSub: "LWS Suite",
    title: "Freeze Risk Dashboard",
    subtitle: "Season 2 (Polar Storm) — live per-member freeze-risk board",
    langToggle: "한국어",

    // ---- shared suite-nav (r5tools.io toolkit strip) ----
    suiteNavPart: "Part of the ",
    suiteNavToolkit: " Last War: Survival alliance toolkit — ",
    navLanding: "Landing",
    navHeat: "Heat",
    navFreeze: "Freeze",
    navCoal: "Coal",
    navCity: "City",
    navTimeline: "Timeline",
    navHive: "Hive",
    navRoster: "Roster",
    navProfile: "Profile",
    navVsDays: "VS Days",
    betaFeedbackPill: "🚧 BETA · Feedback",
    fmpSeasonLoading: "SEASON —",
    fmpThresholdLoading: "Freeze threshold: — °C for — min",
    statMembers: "members",
    statFrozen: "frozen",
    statImminent: "imminent",
    statDanger: "danger",

    // alert banner
    alertCalm: "All members safe",
    alertWarnPre: "",
    alertWarnPost: " members in the danger zone (-10 to +10 °C)",
    alertCriticalPre: "",
    alertCriticalPost: " members will freeze in under 5 minutes",
    alertFrozenPre: "",
    alertFrozenPost: " members currently FROZEN — no rally, teleport, or relocation",

    // toolbar
    toolLoadDemo: "Load demo data",
    toolImportCsv: "Import roster CSV",
    toolExportPng: "Export PNG (Discord)",
    toolExportCsv: "Export CSV",
    toolExportJson: "Export JSON",
    toolSortBy: "Sort by",
    toolFilterBy: "Filter",
    sortStatus: "Status (worst first)",
    sortCoal: "Coal hours (lowest first)",
    sortRank: "Rank (R5 first)",
    sortName: "Name",
    filterAll: "All",
    filterFrozen: "Frozen only",
    filterAtRisk: "At risk (imminent + danger)",
    filterSafe: "Safe only",

    // grid columns
    colName: "Member",
    colRank: "Rank",
    colCoord: "Coord",
    colTemp: "Base Temp",
    colCountdown: "Freeze in",
    colCoal: "Coal hrs",
    colFurnace: "Furnace",
    colStatus: "Status",
    colActions: "Actions",

    // status badges
    statusSafe: "Safe",
    statusDanger: "Danger",
    statusImminent: "Imminent",
    statusFrozen: "Frozen",

    // furnace modes
    modeOff: "OFF",
    modeNormal: "NORMAL",
    modeOverdrive: "OVERDRIVE",

    // row actions
    actSeeMap: "See map",
    actSeeHeat: "See heat overlay",
    actEdit: "Edit",

    // empty state
    emptyTitle: "No roster loaded",
    emptyBody: "Import your alliance's roster CSV or click Load demo data to see the dashboard populate.",

    // countdown / units
    unitMin: "min",
    unitHr: "hr",
    unitSec: "sec",
    freezeNow: "NOW",
    coalDepleted: "depleted",

    // KB attribution notes shown in tooltips
    kbFreezeThreshold: "Frozen state = base temp < -20 °C for 5 continuous minutes (KB: Season 2)",
    kbOverdriveBurn: "Overdrive burns ~4× Normal coal rate (KB: Season 2, High-Heat Furnace)",

    // season-aware freeze-mechanics panel
    mechThreshold: "Freeze threshold",
    weekLabel: "Wk",
    noBlizzardsScheduled: "No blizzards on the schedule",
    noFreezeTitle: "No freeze mechanics this season",
    noFreezeBody: "This dashboard is Season-2-specific (Polar Storm). Switch back to Season 2 via the warzone selector to use it.",

    // ---- Per-season titles / subtitles (swapped by applySeasonHeader) ----
    titleS1: "Virus-Stack Risk Dashboard",
    subtitleS1: "Season 1 (Crimson Plague) — per-member RA Virus Stack meter",
    titleS4: "Blood Night Power-Drain Risk Dashboard",
    subtitleS4: "Season 4 (Evernight Isle) — 3×/day power-drain windows",
    titleS3: "Freeze Risk Dashboard",
    subtitleS3: "Season 3 (Golden Kingdom) — no per-member environmental risk",
    titleS5: "Freeze Risk Dashboard",
    subtitleS5: "Season 5 (Wild West) — no per-member environmental risk",
    titleS6: "Freeze Risk Dashboard",
    subtitleS6: "Season 6 (Shadow Rainforest) — no per-member environmental risk",

    // ---- Per-season inactive-copy for #noFreezeNotice ----
    noFreezeBody_s3: "Season 3 (Golden Kingdom) has no per-member environmental countdown. Sandworm Crisis is a warzone-scoped 14-day event (W1–2), and Curse Resistance is a rally-time modifier — not a per-base timer. See the Curse Immunity Tracker sibling tool instead.",
    noFreezeBody_s5: "Season 5 (Wild West) has no per-member environmental countdown. War days are Wed/Sat only, with R5-set Alliance Safe Time immunity (7–15 h) and a full Sunday Truce Day. See the Safe Time Scheduler sibling tool instead.",
    noFreezeBody_s6: "Season 6 (Shadow Rainforest) has no per-member environmental countdown. Risk shifts to permanent City Destruction (attacker +50% IP, defender -100%) and Tuesday-only Altar windows (max 3 held). See the Altar Conquest Planner + Beneath the Ruins Scheduler sibling tools instead.",

    // ---- S7 placeholder (universal across the 4-tool suite) ----
    titleS7: "Freeze Risk Dashboard",
    subtitleS7: "Season 7 — mechanics pending publication",
    s7ComingTitle: "Season 7 launches ~August 2026",
    s7ComingBody: "Full dashboard support arrives when First Fun publishes S7's mechanics. Until then, no environmental hazard, no per-member countdown, no resource system, and no hero rotation are confirmed. Two YouTube signals (2026-07-09, 2026-07-13) point to an August launch; the underlying leak was pulled within 24 h. S3–S6 pattern-inference suggests 2-week pre-season + 8-week main, Hero Awakening rotation W1 / W3 / W6, faction system retained, and a possible T12 troop tier at celebration week. Track updates via r5tools.io.",
    s7ComingTracker: "Track: r5tools.io",

    // ---- S1 virus-stack variant ----
    s1MechLabel: "SEASON 1 · CRIMSON PLAGUE",
    s1StackCap: "Virus Stack cap: 100 (Doomed at 100 — no rally / teleport / relocate)",
    s1DoomsdayCycle: "Doomsday cycle: 7-day rotation",
    s1CorruptorNote: "Corruptor infects on hit — Virus Resistance does not block it",
    s1BandSafe: "SAFE (stack 0–40)",
    s1BandDanger: "DANGER (stack 41–70)",
    s1BandImminent: "IMMINENT (stack 71–99)",
    s1BandDoomed: "DOOMED (stack 100)",
    s1ColVirusRes: "Virus Resistance",
    s1ColDoomedIn: "Doomed in",
    s1ColAntivirus: "Antivirus stock hrs",
    s1StubBanner: "S1 STUB · Per-member Virus-Stack compute is coming. This sprint surfaces the key S1 numbers; roster CSVs need a virus_stack column before the grid will populate.",
    s1BandThresholdWarning: "Virus Stack band thresholds (40 / 70 / 100) are r5tools.io tool-authored heuristics — KB05 §16.3 confirms only the Doomed = 100 endpoint (rally / teleport / relocate locked). Cross-check against your server's observed doom rate before triaging.",
    s1VriBuildingCta: "Grind VRI (Virus Research Institute) to L30 for +10,000 Virus Resistance — the ONLY meaningful S1 resistance source. Every other VR bump (research, hero passive) rounds to noise against a 100-stack Corruptor push (KB05 §16.3).",
    s1CorruptorAutoHint: "Corruptor NPCs auto-infect on any hit regardless of your VR total — VR only slows normal-mob transmission. Keep 6+ hours of antivirus stocked before Rain-phase to break the loop.",

    // ---- S4 Blood Night variant ----
    s4MechLabel: "SEASON 4 · EVERNIGHT ISLE",
    s4BloodNightHead: "Blood Night · 3× daily · 30 min · 18,000 power/min drain",
    s4Window1: "02:30",
    s4Window2: "10:30",
    s4Window3: "18:30",
    s4WindowNext: "NEXT",
    s4TimeToNext: "Time to next Blood Night",
    s4Stage1: "Stage 1 · Baseline (W1)",
    s4Stage2: "Stage 2 · Oniwagon (W2+)",
    s4Stage3: "Stage 3 · Hunting Oni (W3+)",
    s4Stage4: "Stage 4 · Towards the Light (W8)",
    s4BandSafe: "SAFE (buffer ≥ 30 min)",
    s4BandDanger: "DANGER (15–29 min)",
    s4BandImminent: "IMMINENT (5–14 min)",
    s4BandDrained: "DRAINED (< 5 min)",
    s4ColPowerReserve: "Power Reserve",
    s4ColBloodNightIn: "Blood Night in",
    s4ColDrainBuffer: "Drain buffer min",
    s4StubBanner: "S4 STUB · Per-member Blood Night power-drain compute is coming. This sprint surfaces the 3 daily windows + weekly stage; roster CSVs need a power_reserve column before the grid will populate.",
    s4LighthouseMitigationHint: "Lighthouse L1 / L2 / L3 / L4 grants +50 / +150 / +250 / +250 VR mitigation during Blood Night. L4 requires Optoelectronic Lab L20+ (KB07 §153–158). Prioritize the L20 Opto-Lab research chain in W1–2 or you'll cap at +250 total.",
    s4DivineTreeHint: "Divine Tree (unlocked via Fortune Slips post-activation) grants +250 VR during Blood Night, additive with Lighthouse — a maxed pair reaches +500 VR combined (KB07 §153–158). Keep at least one Fortune Slip in reserve for the Stage-3 Hunting Oni pivot.",
    s4DrainMathHint: "30-min window × 18,000 power/min = 540,000 power drained per Blood Night, or ~1.62M/day at full 3-window exposure. Buffer thresholds (30 / 15 / 5 min) below assume a rested Baseline Stage 1 defender; Stage-4 Towards the Light debuffs shrink these by ~30%.",

    // footer
    footerCred: "Powered by the LWS Knowledge Base",
    footerRelatedHead: "Related tools:",
    footerRelHive: "Hive Planner",
    footerRelHeat: "Heat Simulator",
    footerRelCoal: "Coal Burn Calculator",
    footerRelAccess: "Access Codes",
    footerRelDoomsday: "Doomsday Cycle Planner",
    footerRelBlood: "Blood Night Scheduler",
    footerRelCurse: "Curse Immunity Tracker",
    footerRelSafeTime: "Safe Time Scheduler",
    footerRelAltar: "Altar Conquest Planner",

    // first-blizzard warning banner (7h-after-launch)
    firstBlizzardBannerTitle: "First blizzard hits 7 hours after S2 launch",
    firstBlizzardBannerBody: "Be inside furnace radius by then — Alliance Furnace L1 gives every member in range +3°C, enough to survive the -20°C W1 blizzard.",
    firstBlizzardCountdownPreStart: "S2 launches in",
    firstBlizzardCountdownThenBlizz: "first blizzard",
    firstBlizzardCountdownLive: "First blizzard in",

    // blizzard countdown panel
    blizzardCountdownLabel: "Next blizzard",
    blizzardCountdownIn: "in",
    blizzardCountdownSeasonPre: "S2 launches in",
    blizzardCountdownSeasonElapsed: "S2 has been running",
    blizzardCountdownPeakPassed: "Wk 7 peak (-130°C) — passed",
    blizzardCountdownPostSeason: "All scheduled cold waves have fired. Nuclear Furnace phase.",
    blizzardCountdownNoDate: "Wk 4 Day 1 · -70°C (schedule only)",
    blizzardCountdownNoDateHint: "No season start date confirmed for this warzone. Countdown unlocks once contributed.",
    dayAbbr: "Day",

    // freeze-risk projection chart
    freezeProjectionLabel: "Freeze risk projection",
    freezeProjectionHint: "Weekly % of members at freeze risk — current vs. Alliance Furnace L20",
    freezeProjectionSeriesCurrent: "Current furnace + AF membership",
    freezeProjectionSeriesBest: "Alliance Furnace L20 (all members)",
    freezeProjectionYAxis: "% at freeze risk",
    freezeProjectionXAxis: "Season week",
    freezeProjectionEmpty: "No roster data",
    freezeProjectionFootnotePre: "Upgrading your Alliance Furnace to L20 saves ",
    freezeProjectionFootnotePost: "of the roster from Wk 7 peak freeze (-130°C).",
  },

  ko: {
    // brand / header
    brand: "R5TOOLS.IO",
    brandSub: "LWS 스위트",
    title: "동결 위험 대시보드",
    subtitle: "시즌 2 (폴라 스톰) — 멤버별 실시간 동결 위험 보드",
    langToggle: "EN",

    // ---- shared suite-nav (r5tools.io toolkit strip) ----
    suiteNavPart: "이 도구는 ",
    suiteNavToolkit: " 라스트 워: 서바이벌 얼라이언스 툴킷의 일부입니다 — ",
    navLanding: "랜딩",
    navHeat: "히트",
    navFreeze: "동결",
    navCoal: "석탄",
    navCity: "도시",
    navTimeline: "타임라인",
    navHive: "벌집",
    navRoster: "명단",
    navProfile: "프로필",
    navVsDays: "VS 데이",
    betaFeedbackPill: "🚧 베타 · 피드백",
    fmpSeasonLoading: "시즌 —",
    fmpThresholdLoading: "동결 임계값: — °C · — 분",
    statMembers: "명",
    statFrozen: "동결",
    statImminent: "임박",
    statDanger: "위험",

    // alert banner
    alertCalm: "전 멤버 안전",
    alertWarnPre: "",
    alertWarnPost: "명이 위험 구간 (-10 ~ +10 °C)에 있습니다",
    alertCriticalPre: "",
    alertCriticalPost: "명이 5분 이내에 얼음 상태에 진입합니다",
    alertFrozenPre: "",
    alertFrozenPost: "명이 현재 냉동 상태 — 집결/순간이동/재배치 불가",

    // toolbar
    toolLoadDemo: "데모 데이터 로드",
    toolImportCsv: "명부 CSV 가져오기",
    toolExportPng: "PNG 내보내기 (디스코드)",
    toolExportCsv: "CSV 내보내기",
    toolExportJson: "JSON 내보내기",
    toolSortBy: "정렬",
    toolFilterBy: "필터",
    sortStatus: "상태 (위험 먼저)",
    sortCoal: "석탄 시간 (적은 순)",
    sortRank: "등급 (R5 먼저)",
    sortName: "이름",
    filterAll: "전체",
    filterFrozen: "냉동만",
    filterAtRisk: "위험 (임박 + 위험)",
    filterSafe: "안전만",

    // grid columns
    colName: "멤버",
    colRank: "등급",
    colCoord: "좌표",
    colTemp: "기지 온도",
    colCountdown: "동결까지",
    colCoal: "석탄 시간",
    colFurnace: "화로",
    colStatus: "상태",
    colActions: "동작",

    // status badges (drawn from kb/06-season-2-frozen.md "KR ↔ EN terminology")
    statusSafe: "안전",
    statusDanger: "위험",
    statusImminent: "임박",
    statusFrozen: "냉동",   // KB 06-season-2-frozen: 얼음 상태 / 냉동

    // furnace modes (KB 06-season-2-frozen: 오버드라이브 / 과부하)
    modeOff: "꺼짐",
    modeNormal: "정상",
    modeOverdrive: "과부하",

    // row actions
    actSeeMap: "지도 보기",
    actSeeHeat: "열지도 보기",   // KB glossary: 열지도 = Thermal map
    actEdit: "편집",

    // empty state
    emptyTitle: "명부가 로드되지 않았습니다",
    emptyBody: "연맹 명부 CSV를 가져오거나 데모 데이터를 로드하여 대시보드를 확인하세요.",

    // countdown / units
    unitMin: "분",
    unitHr: "시간",
    unitSec: "초",
    freezeNow: "지금",
    coalDepleted: "고갈",

    // KB attribution notes shown in tooltips
    kbFreezeThreshold: "냉동 상태 = 기지 온도 < -20 °C 5분 연속 (KB: 시즌 2)",
    kbOverdriveBurn: "과부하는 정상 대비 약 4배 석탄 소모 (KB: 시즌 2, 고열 화로)",

    // season-aware freeze-mechanics panel
    mechThreshold: "동결 임계값",
    weekLabel: "주차",
    noBlizzardsScheduled: "예정된 블리자드 없음",
    noFreezeTitle: "이번 시즌은 동결 메커니즘이 없습니다",
    noFreezeBody: "이 대시보드는 시즌 2 (폴라 스톰) 전용입니다. 워존 선택기를 통해 시즌 2로 전환하세요.",

    // ---- Per-season titles / subtitles ----
    titleS1: "바이러스 스택 위험 대시보드",
    subtitleS1: "시즌 1 (크림슨 플레이그) — 멤버별 RA 바이러스 스택 미터",
    titleS4: "블러드 나이트 파워 드레인 위험 대시보드",
    subtitleS4: "시즌 4 (에버나이트 아일) — 하루 3회 파워 드레인 구간",
    titleS3: "동결 위험 대시보드",
    subtitleS3: "시즌 3 (골든 킹덤) — 멤버별 환경 위험 없음",
    titleS5: "동결 위험 대시보드",
    subtitleS5: "시즌 5 (와일드 웨스트) — 멤버별 환경 위험 없음",
    titleS6: "동결 위험 대시보드",
    subtitleS6: "시즌 6 (섀도우 레인포레스트) — 멤버별 환경 위험 없음",

    // ---- Per-season inactive-copy ----
    noFreezeBody_s3: "시즌 3 (골든 킹덤)에는 멤버별 환경 카운트다운이 없습니다. 샌드웜 크라이시스는 워존 단위 14일 이벤트(1–2주차)이며, 저주 저항은 집결 시점 모디파이어로 기지별 타이머가 아닙니다. 대신 저주 면역 트래커 도구를 사용하세요.",
    noFreezeBody_s5: "시즌 5 (와일드 웨스트)에는 멤버별 환경 카운트다운이 없습니다. 전쟁일은 수/토요일뿐이며, R5가 설정하는 연맹 안전 시간(7–15시간)과 일요일 완전 휴전일이 있습니다. 대신 안전 시간 스케줄러 도구를 사용하세요.",
    noFreezeBody_s6: "시즌 6 (섀도우 레인포레스트)에는 멤버별 환경 카운트다운이 없습니다. 위험은 영구 도시 파괴(공격자 +50% IP, 방어자 -100%)와 화요일 전용 제단(최대 3개 보유)으로 이동합니다. 대신 제단 정복 플래너 + 폐허 아래 스케줄러 도구를 사용하세요.",

    // ---- S7 placeholder ----
    titleS7: "동결 위험 대시보드",
    subtitleS7: "시즌 7 — 메커니즘 공개 대기 중",
    s7ComingTitle: "시즌 7 출시 예정 — 2026년 8월경",
    s7ComingBody: "First Fun이 시즌 7 메커니즘을 공개하면 전체 대시보드 지원이 시작됩니다. 그때까지 환경 위험, 멤버별 카운트다운, 자원 시스템, 영웅 로테이션 모두 미확정입니다. YouTube 신호 2건(2026-07-09, 2026-07-13)이 8월 출시를 시사했지만 실제 유출은 24시간 이내 삭제. 시즌 3–6 패턴 추정: 2주 사전 시즌 + 8주 본 시즌 · 영웅 각성 로테이션 1주차 / 3주차 / 6주차 · 팩션 시스템 유지 · 축하 주간 T12 병력 가능성. 업데이트는 r5tools.io에서 확인하세요.",
    s7ComingTracker: "추적: r5tools.io",

    // ---- S1 virus-stack variant ----
    s1MechLabel: "시즌 1 · 크림슨 플레이그",
    s1StackCap: "바이러스 스택 최대치: 100 (100 도달 시 파멸 — 집결/순간이동/재배치 불가)",
    s1DoomsdayCycle: "둠스데이 주기: 7일 순환",
    s1CorruptorNote: "커럽터는 피격 시 감염 — 바이러스 저항으로 차단 불가",
    s1BandSafe: "안전 (스택 0–40)",
    s1BandDanger: "위험 (스택 41–70)",
    s1BandImminent: "임박 (스택 71–99)",
    s1BandDoomed: "파멸 (스택 100)",
    s1ColVirusRes: "바이러스 저항",
    s1ColDoomedIn: "파멸까지",
    s1ColAntivirus: "백신 재고 시간",
    s1StubBanner: "시즌 1 스텁 · 멤버별 바이러스 스택 계산은 준비 중입니다. 이번 스프린트는 시즌 1 핵심 수치만 표시하며, 그리드 표시에는 명부 CSV에 virus_stack 컬럼이 필요합니다.",
    s1BandThresholdWarning: "바이러스 스택 구간 임계값 (40 / 70 / 100)은 r5tools.io 도구 자체 휴리스틱입니다 — KB05 §16.3은 파멸 = 100 지점만 확정 (집결 / 순간이동 / 재배치 잠금). 서버 관측 파멸 발생률과 대조 후 조치하세요.",
    s1VriBuildingCta: "VRI (바이러스 연구소)를 L30까지 육성 → +10,000 바이러스 저항 — 시즌 1에서 유일하게 유의미한 저항 소스입니다. 다른 저항 상승 (연구, 영웅 패시브)은 100 스택 커럽터 공세 앞에서 노이즈 수준 (KB05 §16.3).",
    s1CorruptorAutoHint: "커럽터 NPC는 VR 합계와 무관하게 피격 시 자동 감염 — VR은 일반 몹 전염 속도만 감소시킵니다. 우기 이전에 백신 6시간분 이상 확보하여 감염 루프를 끊으세요.",

    // ---- S4 Blood Night variant ----
    s4MechLabel: "시즌 4 · 에버나이트 아일",
    s4BloodNightHead: "블러드 나이트 · 하루 3회 · 30분 · 분당 18,000 파워 드레인",
    s4Window1: "02:30",
    s4Window2: "10:30",
    s4Window3: "18:30",
    s4WindowNext: "다음",
    s4TimeToNext: "다음 블러드 나이트까지",
    s4Stage1: "1단계 · 기본 (1주차)",
    s4Stage2: "2단계 · 오니와곤 (2주차+)",
    s4Stage3: "3단계 · 오니 사냥 (3주차+)",
    s4Stage4: "4단계 · 빛을 향해 (8주차)",
    s4BandSafe: "안전 (버퍼 ≥ 30분)",
    s4BandDanger: "위험 (15–29분)",
    s4BandImminent: "임박 (5–14분)",
    s4BandDrained: "고갈 (5분 미만)",
    s4ColPowerReserve: "파워 예비량",
    s4ColBloodNightIn: "블러드 나이트까지",
    s4ColDrainBuffer: "드레인 버퍼 분",
    s4StubBanner: "시즌 4 스텁 · 멤버별 블러드 나이트 파워 드레인 계산은 준비 중입니다. 이번 스프린트는 하루 3회 구간과 주간 단계만 표시하며, 그리드 표시에는 명부 CSV에 power_reserve 컬럼이 필요합니다.",
    s4LighthouseMitigationHint: "등대 L1 / L2 / L3 / L4는 블러드 나이트 중 +50 / +150 / +250 / +250 VR 완화. L4는 광전기 실험실 L20+ 필요 (KB07 §153–158). 1–2주차에 광전기 실험실 L20 연구 체인을 우선하지 않으면 총 +250에서 정체됩니다.",
    s4DivineTreeHint: "디바인 트리 (활성화 후 포춘 슬립으로 해금)는 블러드 나이트 중 +250 VR — 등대와 누적되어 최대 조합 시 +500 VR 도달 (KB07 §153–158). 3단계 오니 사냥 전환에 대비하여 포춘 슬립 최소 1개는 보유하세요.",
    s4DrainMathHint: "30분 구간 × 분당 18,000 파워 = 블러드 나이트 1회당 540,000 파워 소모, 하루 3회 완전 노출 시 약 162만/일. 아래 버퍼 임계값 (30 / 15 / 5분)은 휴식 상태 1단계 방어자 기준이며, 4단계 '빛을 향해' 디버프는 약 30% 축소시킵니다.",

    // footer
    footerCred: "LWS 지식 베이스 기반",
    footerRelatedHead: "관련 도구:",
    footerRelHive: "하이브 플래너",
    footerRelHeat: "히트 시뮬레이터",
    footerRelCoal: "석탄 소모 계산기",
    footerRelAccess: "액세스 코드",
    footerRelDoomsday: "둠스데이 주기 플래너",
    footerRelBlood: "블러드 나이트 스케줄러",
    footerRelCurse: "저주 면역 트래커",
    footerRelSafeTime: "안전 시간 스케줄러",
    footerRelAltar: "제단 정복 플래너",

    // first-blizzard warning banner (S2 시작 7시간 후 첫 블리자드)
    firstBlizzardBannerTitle: "S2 시작 7시간 후 첫 블리자드 발생",
    firstBlizzardBannerBody: "그 시점까지 화로 범위 안에 있어야 합니다 — 동맹 화로 L1은 범위 내 모든 멤버에게 +3°C를 제공하며, W1 블리자드 -20°C를 견디기에 충분합니다.",
    firstBlizzardCountdownPreStart: "S2 시작까지",
    firstBlizzardCountdownThenBlizz: "첫 블리자드",
    firstBlizzardCountdownLive: "첫 블리자드까지",

    // 블리자드 카운트다운 패널
    blizzardCountdownLabel: "다음 블리자드",
    blizzardCountdownIn: "남음",
    blizzardCountdownSeasonPre: "S2 시작까지",
    blizzardCountdownSeasonElapsed: "S2 경과 시간",
    blizzardCountdownPeakPassed: "7주차 최정점 (-130°C) — 지남",
    blizzardCountdownPostSeason: "예정된 모든 한파가 발생했습니다. 핵화로 단계입니다.",
    blizzardCountdownNoDate: "4주차 1일 · -70°C (일정만)",
    blizzardCountdownNoDateHint: "이 워존의 시즌 시작일이 확인되지 않았습니다. 데이터 기여 후 카운트다운이 활성화됩니다.",
    dayAbbr: "일",

    // 동결 위험 예측 차트
    freezeProjectionLabel: "동결 위험 예측",
    freezeProjectionHint: "주별 동결 위험 멤버 비율 — 현재 vs. 동맹 화로 L20",
    freezeProjectionSeriesCurrent: "현재 화로 + 동맹화로 범위",
    freezeProjectionSeriesBest: "동맹 화로 L20 (전 멤버)",
    freezeProjectionYAxis: "동결 위험 %",
    freezeProjectionXAxis: "시즌 주차",
    freezeProjectionEmpty: "명단 데이터 없음",
    freezeProjectionFootnotePre: "동맹 화로를 L20까지 업그레이드하면 7주차 최정점 동결(-130°C)에서 명단의 ",
    freezeProjectionFootnotePost: "를 구할 수 있습니다.",
  },
};

/* Language auto-detect + toggle helpers.
 * Same pattern as LWS_Access_Codes/unlock.html — Korean if browser is ko-*
 * otherwise English. Toggle pill in the top-right flips at any time. */

window.i18nDetectLang = function () {
  // Prefer the suite-shared `lws_lang` preference set by any sibling tool's
  // langToggle. Falls back to navigator.language.
  try {
    var stored = localStorage.getItem("lws_lang");
    if (stored === "en" || stored === "ko") return stored;
  } catch (e) { /* private mode */ }
  var l = (navigator.language || "en").toLowerCase();
  return l.startsWith("ko") ? "ko" : "en";
};

window.i18nApply = function (lang) {
  document.documentElement.lang = lang;
  var dict = window.I18N[lang] || window.I18N.en;
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    var key = el.getAttribute("data-i18n-placeholder");
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });
  document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
    var key = el.getAttribute("data-i18n-title");
    if (dict[key] !== undefined) el.title = dict[key];
  });
};
