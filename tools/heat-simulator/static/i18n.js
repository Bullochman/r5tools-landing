/* LWS Heat Simulator — i18n
 *
 * KR-first: browser-language auto-detected; toggle pill in top-right.
 * Every visible string comes through I18N[lang][key]. No hardcoded strings in DOM.
 *
 * KR terminology sourced from:
 *   - [[15-glossary]]  (LWS_Knowledge_Base/kb/15-glossary.md)
 *   - [[06-season-2-frozen]] KR-EN table (temperature, furnace, blizzard, freeze)
 *
 * If you add a string key here, add it in BOTH en and ko.
 */

(function (global) {
  'use strict';

  const I18N = {
    en: {
      // ---- header / brand
      brandSub: 'LWS Suite · Heat Simulator',
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


      // ---- app titles
      appTitle: 'Heat Simulator',
      appTagline: 'Season 2 (Polar Storm) temperature overlay + freeze-risk planner. Paints the map with the seven ambient bands (-15 °C to -80 °C), overlays furnaces + cities, flags freeze-risk bases.',

      // ---- panels
      mapPanelTitle: 'Warzone Heat Map',
      controlsPanelTitle: 'Controls',
      readoutPanelTitle: 'Readout',
      freezeListTitle: 'Freeze-Risk Roster',

      // ---- controls
      capitolLabel: 'Capitol (x, y)',
      furnaceLabel: 'Alliance Furnace',
      furnacePlaceholder: 'x, y, level',
      furnaceHint: 'R4/R5 deploys on L1 territory Day 1 (KB [[06-season-2-frozen]])',
      cityLabel: 'Cities',
      cityHint: 'Level 1 = +5 °C · Level 6 = +60 °C',
      blizzardLabel: 'Cold-wave week',
      blizzardNone: 'None',
      blizzardW1:  'Wk 1 (-20 °C baseline)',
      blizzardW2:  'Wk 2 (-30 °C)',
      blizzardW3:  'Wk 3 (-50 °C)',
      blizzardW4:  'Wk 4 (-70 °C · Rare Soil War)',
      blizzardW5:  'Wk 5 (-90 °C · Nuclear Furnace)',
      blizzardW6:  'Wk 6 (-110 °C · Glacieradons)',
      blizzardW7:  'Wk 7-8 (-130 °C · siege)',
      // legacy keys kept for older cached copy — not referenced by new UI
      blizzardW12: 'Week 1-2 (-30 °C) [deprecated]',
      s2WeekStripLabel: 'Polar Storm cold-wave curve',
      s2WeekStripBadge: '7-band verified · KB',
      s2WeekStripHint: 'Highlighted band = current season week',
      freezeCurveTitle: 'Alliance freeze-risk across the season',
      freezeCurveHint: '% of loaded roster below freeze threshold (-20 °C sustained 5 min) per season week, using the verified 7-band Polar Storm cold-wave curve. Upload a roster to populate.',
      lookupLabel: 'Lookup coord',
      lookupPlaceholder: 'e.g. 342, 118',
      lookupBtn: 'Compute',

      // ---- roster
      rosterUploadBtn: 'Upload roster CSV',
      rosterFormatHint: 'Columns: name, rank, hq_level, total_power, notes, x, y — matches Hive Grid Manager',
      exportPngBtn: 'Export PNG',
      exportCsvBtn: 'Export CSV',

      // ---- readout
      ambient: 'Ambient',
      blizzardDrop: 'Blizzard drop',
      bonusTotal: 'Bonus stack',
      current: 'Current temp',
      freezeThreshold: 'Freeze threshold',
      freezeRisk: 'Freeze risk',
      status: 'Status',
      statusFrozen: 'FROZEN',
      statusSafe: 'safe',

      // ---- KB-gap warning
      kbGapBadge: 'KB gap',
      furnaceRadiusWarn: 'Alliance Furnace tile radius per level is a KB gap — the drawn ring is a placeholder (see docs/kb-refs.md).',

      // ---- season-agnostic fallback (generic — still used if season id is unrecognized)
      noHeatTitle: "Heat mechanics don't apply this season",
      noHeatBody: 'This tool visualises Season 2 (Polar Storm) thermal bands. The current warzone/season has no temperature system — switch warzone or override the season via the selector above to plan for a frozen season.',
      noHeatFreezeList: 'Freeze-risk list is Season-2-only. No thermal drop on this season.',

      // ---- per-season app titles / taglines (title & description override at render time)
      appTitle_s2: 'Heat Simulator',
      appTagline_s2: 'Season 2 (Polar Storm) temperature overlay + freeze-risk planner. Paints the map with the seven ambient bands (-15 °C to -80 °C), overlays furnaces + cities, flags freeze-risk bases.',
      appTitle_s4: 'Night Simulator',
      appTagline_s4: 'Season 4 (Evernight Isle) Blood Night planner. Shows the 3 daily Blood Night windows (02:30 / 10:30 / 18:30 server), power drain per window, Lighthouse + Divine Tree VR mitigation, and per-week Blood Night stage.',

      // ---- per-season placeholder copy (S1 / S3 / S5 / S6 / S7)
      noHeatTitle_s1: 'Crimson Plague has no thermal system',
      noHeatBody_s1: "Season 1's environmental pressure is the virus-stack + Doomsday cycle, not temperature. Stacks accumulate through Corruptor NPC encounters and PvP hits regardless of Virus Resistance (VR) — reaching 100 stacks locks rally/teleport/relocate. VRI (Virus Resistance Institute, L1-L30, max +10,000 VR) is the ONLY meaningful building-source of resistance. No cold/heat bands to render. Use the Season Timeline tool for Doomsday cycles + VR grind sequencing, the Freeze-Risk Dashboard (S1 mode) for per-member virus-stack tracking, or override to S2 above to plan a frozen season. (KB05 §16.3)",
      noHeatCta_s1: 'For live S1 planning: Season Timeline → Doomsday cycles · Freeze-Risk Dashboard → virus-stack tracker. (KB05 §16.3)',
      noHeatTitle_s3: 'Golden Kingdom has no thermal grid',
      noHeatBody_s3: "Season 3's environmental hazard is Sandworm teleport-out: Large Sandworms (14-day Sandworm Crisis event W1-W2) teleport any base outside the Alliance Center 5×5 range to a random map cell. Curse Resistance gates PvE damage (up to 99.9% penalty if under-resisted; capped by Curse Research Lab L30). No temperature bands to render. See the City Capture Planner (S3 mode) for AC-anchored placement, or override to S2 above for freeze planning. (KB07 §34-95, §761-886)",
      noHeatCta_s3: 'Live S3 tools: City Capture Planner (S3 mode) → AC-anchored placement · Season Timeline → Sandworm Crisis + Spice Wars sequencing. (KB07 §761-886)',
      noHeatTitle_s5: 'Wild West has no environmental hazard',
      noHeatBody_s5: "Season 5 replaces thermal and fog hazards with the Alliance Safe Time system: R5 sets a 7-15h immunity window that turns off 1 of 3 daily war slots on Wed + Sat war days. Sunday is a full Truce Day. Bank Strongholds only contest during war windows (2 city captures/war day = max 4/week). L10 Bank Strongholds unlock W4 and require 39,900 Virus Resistance. See the (upcoming) Safe Time Scheduler + Bank Ledger sibling tools, or override to S2 above for freeze planning. (KB07 §241-253)",
      noHeatCta_s5: 'Live S5 tools: Season Timeline → Bank Strongholds L1-L10 unlock schedule · Coal Burn (S5 variant) → CrystalGold deposit planner. (KB07 §226-273)',
      noHeatTitle_s6: 'Shadow Rainforest has no thermal grid',
      noHeatBody_s6: "Season 6's environmental factor is shared fog visibility — clustered same-faction allies see farther than spread-out ones (exact radius unpublished, tracked as KB open question). The bigger risk is permanent City Destruction: attackers gain +50% Influence Points, defenders lose 100%, and the city cannot be rebuilt. Altar windows open Tuesdays only, hold max 3. Faction assignment (Deepwood/Wetland) locks at start. See the (upcoming) Altar Conquest Planner sibling tool, or override to S2 above for freeze planning. (KB07 §277-360)",
      noHeatCta_s6: 'Live S6 tools: Season Timeline → Awakening rotation W1 Kimberly / W3 D.Va / W6 Tesla · Coal Burn (S6 variant) → Hero Awakening Shard Planner. (KB07 §325-360)',
      kbGapFogBadge: 'KB gap: fog radius / duration / visibility formula not yet sourced. Speculative mentions only.',

      // ---- Season 7 placeholder (unified copy — no per-tool variant work)
      noHeatTitle_s7: 'Season 7 launches ~August 2026',
      noHeatBody_s7: "Full tool support arrives when First Fun publishes S7's mechanics. Two YouTube signals from ~2026-07-09 and ~2026-07-13 confirm launch this August, but the actual leak was pulled within 24 hours before being indexed. No theme, hero rotation, resource list, or map layout is confirmed as of 2026-07-15. Pattern-inference from S3-S6: 2-week pre-season + 8-week main; Hero Awakening rotation W1/W3/W6 (F2P-only per permanent monetization shift); faction system likely retained. Track updates via r5tools.io.",
      s7ComingTracker: 'Track: r5tools.io',

      // ---- Season 4: Blood Night controls / readout
      mapPanelTitle_s4: 'Blood Night Clock',
      nightPhaseLabel: 'Blood Night stage',
      nightPhaseOff: 'Off (day)',
      nightPhaseStage1: 'Stage 1 · W1 · Night Parade of 100 Oni',
      nightPhaseStage2: 'Stage 2 · W2 · Wandering Oniwagon Invasion',
      nightPhaseStage3: 'Stage 3 · W3-7 · Doomsday Crisis / Oni Legions',
      nightPhaseStage4: 'Stage 4 · W8 · Towards the Light',
      lighthouseLabel: 'Lighthouse level (L1-L4)',
      divineTreeLabel: 'Divine Tree active',
      nextWindow: 'Next Blood Night window',
      powerDrain: 'Power drain / window',
      vrMitigation: 'Your VR mitigation',
      stageDebuffWarn: 'Stage 3 warning: triggering Oni Summon applies +500 Commander Durability Damage debuff.',
      footerCred_s4: 'Data source: LWS Knowledge Base · Season 4 (Evernight Isle) · Blood Night Descend',

      // ---- footer
      footerCred: 'Data source: LWS Knowledge Base · Season 2 (Polar Storm)',
      footerHome: 'r5tools.io',

      // ---- placeholders / errors
      msgUploaded: 'Roster uploaded — {n} members loaded.',
      msgUploadFailed: 'Upload failed. Check CSV format.',
      msgNoRoster: 'No roster loaded. Upload a CSV or paste a coord.',
      msgNetworkErr: "Couldn't reach the server.",
    },

    ko: {
      // ---- header / brand
      brandSub: 'LWS 스위트 · 히트 시뮬레이터',
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


      // ---- app titles
      appTitle: '히트 시뮬레이터',
      appTagline: '시즌 2 (폴라 스톰) 온도 오버레이 + 냉동 위험 플래너. 지도에 7개 온도대(-15 °C ~ -80 °C)를 표시하고 화로와 도시를 겹쳐, 냉동 위험이 있는 기지를 표시합니다.',

      // ---- panels
      mapPanelTitle: '워존 열지도',
      controlsPanelTitle: '컨트롤',
      readoutPanelTitle: '결과',
      freezeListTitle: '냉동 위험 명단',

      // ---- controls
      capitolLabel: '수도 (x, y)',
      furnaceLabel: '연맹 화로',
      furnacePlaceholder: 'x, y, 레벨',
      furnaceHint: 'R4/R5가 1일차에 Lv1 영토에 배치 (KB [[06-season-2-frozen]])',
      cityLabel: '도시',
      cityHint: '레벨 1 = +5 °C · 레벨 6 = +60 °C',
      blizzardLabel: '한파 주차',
      blizzardW1: '1주차 (-20 °C 기본)',
      blizzardW2: '2주차 (-30 °C)',
      blizzardW5: '5주차 (-90 °C · 핵화로)',
      blizzardW6: '6주차 (-110 °C · 빙하돈)',
      blizzardW7: '7-8주차 (-130 °C · 공성)',
      s2WeekStripLabel: '폴라 스톰 한파 곡선',
      s2WeekStripBadge: '7단계 검증됨 · KB',
      s2WeekStripHint: '강조 표시된 구간 = 현재 시즌 주차',
      freezeCurveTitle: '시즌별 연맹 동결 위험도',
      freezeCurveHint: '검증된 7단계 폴라 스톰 한파 곡선을 사용한 주차별 명단 동결 임계값(-20 °C 5분 지속) 이하 비율. 명단을 업로드하면 표시됩니다.',
      _blizzardLabelOld: '눈보라',
      blizzardNone: '없음',
      blizzardW12: '1-2주차 (-30 °C)',
      blizzardW3:  '3주차 (-50 °C)',
      blizzardW4:  '4주차+ (-70 °C, 희토 전쟁)',
      lookupLabel: '좌표 조회',
      lookupPlaceholder: '예: 342, 118',
      lookupBtn: '계산',

      // ---- roster
      rosterUploadBtn: '연맹 명단 CSV 업로드',
      rosterFormatHint: '열: name, rank, hq_level, total_power, notes, x, y — 하이브 그리드 매니저와 동일',
      exportPngBtn: 'PNG 내보내기',
      exportCsvBtn: 'CSV 내보내기',

      // ---- readout
      ambient: '지면 온도',
      blizzardDrop: '눈보라 하락',
      bonusTotal: '보너스 합계',
      current: '현재 온도',
      freezeThreshold: '냉동 임계값',
      freezeRisk: '냉동 위험',
      status: '상태',
      statusFrozen: '냉동',
      statusSafe: '안전',

      // ---- KB-gap warning
      kbGapBadge: 'KB 누락',
      furnaceRadiusWarn: '연맹 화로 레벨별 타일 반경은 KB에 없는 값입니다 — 표시된 원은 임시 값입니다 (docs/kb-refs.md 참조).',

      // ---- season-agnostic fallback (generic — still used if season id is unrecognized)
      noHeatTitle: '이번 시즌에는 온도 시스템이 적용되지 않습니다',
      noHeatBody: '이 도구는 시즌 2(폴라 스톰)의 온도대를 시각화합니다. 현재 전쟁구역/시즌에는 온도 시스템이 없습니다 — 위 선택기에서 전쟁구역을 바꾸거나 시즌을 재정의해 냉동 시즌을 계획해 보세요.',
      noHeatFreezeList: '냉동 위험 명단은 시즌 2 전용입니다. 이번 시즌은 온도 하락이 없습니다.',

      // ---- per-season app titles / taglines
      appTitle_s2: '히트 시뮬레이터',
      appTagline_s2: '시즌 2 (폴라 스톰) 온도 오버레이 + 냉동 위험 플래너. 지도에 7개 온도대(-15 °C ~ -80 °C)를 표시하고 화로와 도시를 겹쳐, 냉동 위험이 있는 기지를 표시합니다.',
      appTitle_s4: '나이트 시뮬레이터',
      appTagline_s4: '시즌 4 (에버나잇 아일) 블러드 나이트 플래너. 하루 3번의 블러드 나이트 시간대(서버 시간 02:30 / 10:30 / 18:30), 시간대별 전력 소모, 등대 + 디바인 트리 바이러스 저항 완화, 주차별 블러드 나이트 단계를 표시합니다.',

      // ---- per-season placeholder copy (S1 / S3 / S5 / S6 / S7)
      noHeatTitle_s1: '크림슨 플레이그는 온도 시스템이 없습니다',
      noHeatBody_s1: '시즌 1의 환경 압박은 온도가 아닌 바이러스 스택 + 둠스데이 사이클입니다. 스택은 커럽터 NPC 전투와 PvP 피격 시 바이러스 저항력(VR)과 무관하게 누적 — 100 스택 도달 시 집결/순간이동/재배치 잠금. VRI(바이러스 저항 연구소, L1-L30, 최대 +10,000 VR)가 유일하게 유의미한 건물 저항 소스입니다. 렌더링할 냉/열 온도대 없음. S1 계획은 시즌 타임라인 도구로 둠스데이 사이클 + VR 그라인드 순서를 확인하거나, 냉동 위험 대시보드(S1 모드)로 멤버별 바이러스 스택을 추적하거나, 위에서 S2로 재정의해 냉동 시즌을 계획하세요. (KB05 §16.3)',
      noHeatCta_s1: '실시간 S1 계획: 시즌 타임라인 → 둠스데이 사이클 · 냉동 위험 대시보드 → 바이러스 스택 추적. (KB05 §16.3)',
      noHeatTitle_s3: '골든 킹덤은 온도 시스템 대신 저주 저항력을 사용합니다',
      noHeatBody_s3: '시즌 3의 환경 위험은 모래벌레 텔레포트입니다. 대형 모래벌레(W1-W2 14일 샌드웜 크라이시스 이벤트)는 얼라이언스 센터 5×5 범위 밖의 기지를 무작위 좌표로 순간이동시킵니다. 저주 저항력이 PvE 데미지 게이트(저항 부족 시 최대 99.9% 감소, 저주 연구실 L30 상한). 온도대 없음. AC 앵커 배치는 도시 점령 플래너(S3 모드), 냉동 시즌 계획은 위에서 S2로 재정의하세요. (KB07 §34-95, §761-886)',
      noHeatCta_s3: '실시간 S3 도구: 도시 점령 플래너(S3 모드) → AC 앵커 배치 · 시즌 타임라인 → 샌드웜 크라이시스 + 향신료 전쟁 순서. (KB07 §761-886)',
      noHeatTitle_s5: '와일드 웨스트는 환경 위험이 없습니다',
      noHeatBody_s5: '시즌 5는 온도·안개 대신 얼라이언스 세이프 타임 시스템을 사용합니다. R5가 설정하는 7-15시간 면역 창구가 수/토 전쟁일의 3개 전쟁 슬롯 중 하나를 꺼둡니다. 일요일은 완전 정전일(Truce Day). 은행 요새는 전쟁 창구 중에만 경쟁(전쟁일당 2회 도시 점령 = 주당 최대 4회). L10 뱅크 스트롱홀드는 W4 개방, 39,900 바이러스 저항력 필요. (예정) 세이프 타임 스케줄러 + 뱅크 원장 도구 참조, 또는 위에서 S2로 재정의하세요. (KB07 §241-253)',
      noHeatCta_s5: '실시간 S5 도구: 시즌 타임라인 → 뱅크 스트롱홀드 L1-L10 개방 스케줄 · 석탄 소모(S5 변형) → 크리스탈골드 예치 플래너. (KB07 §226-273)',
      noHeatTitle_s6: '섀도우 레인포레스트는 온도 시스템이 없습니다',
      noHeatBody_s6: '시즌 6의 환경 요소는 공유 안개 시야입니다(팩션 아군 밀집 시 시야 확장, 정확한 반경은 KB 미공개). 더 큰 위험은 영구 도시 파괴: 공격자 +50% 영향력 포인트, 방어자 -100% IP, 재건 불가. 제단은 화요일만 개방, 최대 3개 보유. 팩션 배정(딥우드/웻랜드)은 시작 시점에 고정. (예정) 제단 정복 플래너 참조, 또는 위에서 S2로 재정의하세요. (KB07 §277-360)',
      noHeatCta_s6: '실시간 S6 도구: 시즌 타임라인 → 각성 로테이션 W1 킴벌리 / W3 D.Va / W6 테슬라 · 석탄 소모(S6 변형) → 영웅 각성 조각 플래너. (KB07 §325-360)',
      kbGapFogBadge: 'KB 누락: 안개 반경 / 지속시간 / 시야 공식은 아직 확보되지 않았습니다. 추측성 언급만 존재합니다.',

      // ---- Season 7 placeholder (unified copy — no per-tool variant work)
      noHeatTitle_s7: '시즌 7 출시 예정 — 2026년 8월경',
      noHeatBody_s7: 'S7 메커니즘이 공개되면 도구 지원이 시작됩니다. YouTube 신호 2건(2026-07-09, 2026-07-13)이 8월 출시를 확인했지만 실제 유출은 24시간 이내 삭제. 2026-07-15 기준 테마·영웅 로테이션·자원·지도 미확정. S3-S6 패턴 추정: 2주 사전 시즌 + 8주 본 시즌 · 영웅 각성 W1/W3/W6(영구 무과금) · 팩션 유지 예상. 업데이트는 r5tools.io에서 확인하세요.',
      s7ComingTracker: '추적: r5tools.io',

      // ---- Season 4: Blood Night controls / readout
      mapPanelTitle_s4: '블러드 나이트 시계',
      nightPhaseLabel: '블러드 나이트 단계',
      nightPhaseOff: '꺼짐 (낮)',
      nightPhaseStage1: '1단계 · 1주차 · 백귀야행',
      nightPhaseStage2: '2단계 · 2주차 · 방황하는 오니와곤 침공',
      nightPhaseStage3: '3단계 · 3-7주차 · 둠스데이 위기 / 오니 군단',
      nightPhaseStage4: '4단계 · 8주차 · 빛을 향하여',
      lighthouseLabel: '등대 레벨 (L1-L4)',
      divineTreeLabel: '디바인 트리 활성',
      nextWindow: '다음 블러드 나이트 시간대',
      powerDrain: '시간대당 전력 소모',
      vrMitigation: '바이러스 저항 완화',
      stageDebuffWarn: '3단계 경고: 오니 소환 발동 시 지휘관 내구도 데미지 +500 디버프가 적용됩니다.',
      footerCred_s4: '데이터 출처: LWS 지식 베이스 · 시즌 4 (에버나잇 아일) · 블러드 나이트 강림',

      // ---- footer
      footerCred: '데이터 출처: LWS 지식 베이스 · 시즌 2 (폴라 스톰)',
      footerHome: 'r5tools.io',

      // ---- placeholders / errors
      msgUploaded: '명단 업로드 완료 — {n}명 로드됨.',
      msgUploadFailed: '업로드 실패. CSV 형식을 확인하세요.',
      msgNoRoster: '로드된 명단이 없습니다. CSV를 업로드하거나 좌표를 붙여넣으세요.',
      msgNetworkErr: '서버에 연결할 수 없습니다.',
    },
  };

  // ---- runtime ----

  let currentLang = (function () {
    try {
      const stored = localStorage.getItem('lws_lang');
      if (stored === 'en' || stored === 'ko') return stored;
    } catch (e) { /* private mode */ }
    return (navigator.language || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  })();

  function t(key, vars) {
    const dict = I18N[currentLang] || I18N.en;
    let s = dict[key];
    if (s === undefined) s = I18N.en[key] || key;
    if (vars) {
      for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
    }
    return s;
  }

  function apply(root) {
    root = root || document;
    root.documentElement && (root.documentElement.lang = currentLang);
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val !== undefined) el.textContent = val;
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val !== undefined) el.placeholder = val;
    });
    root.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-title');
      const val = t(key);
      if (val !== undefined) el.title = val;
    });
  }

  function setLang(lang) {
    currentLang = (lang === 'ko') ? 'ko' : 'en';
    apply(document);
    // Persist to BOTH the tool-local key (legacy) and the suite-shared key so
    // that switching language here carries over to sibling tools.
    try { localStorage.setItem('lws_heat_lang', currentLang); } catch (_) {}
    try { localStorage.setItem('lws_lang', currentLang); } catch (_) {}
    try { window.dispatchEvent(new CustomEvent('lws:lang-changed', { detail: { lang: currentLang } })); } catch (_) {}
    // Fire an event so app.js can re-render dynamic labels
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: currentLang } }));
  }

  function toggle() {
    setLang(currentLang === 'en' ? 'ko' : 'en');
  }

  function init() {
    // Prefer the shared lws_lang preference first, then the legacy tool-local
    // key, then browser default.
    try {
      const shared = localStorage.getItem('lws_lang');
      if (shared === 'ko' || shared === 'en') currentLang = shared;
      else {
        const saved = localStorage.getItem('lws_heat_lang');
        if (saved === 'ko' || saved === 'en') currentLang = saved;
      }
    } catch (_) {}
    apply(document);
    const toggleBtn = document.getElementById('langToggle');
    if (toggleBtn) toggleBtn.addEventListener('click', toggle);
  }

  global.I18N = {
    t: t,
    apply: apply,
    setLang: setLang,
    toggle: toggle,
    init: init,
    get lang() { return currentLang; },
    // expose dict for debugging in dev console
    _dict: I18N,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
