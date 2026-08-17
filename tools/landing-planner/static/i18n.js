/* LWS Landing Planner — i18n dictionary
 *
 * Korean-first. Every visible string appears in both `en` and `ko`. No hardcoded
 * English is allowed in the DOM; every user-visible text goes through
 * data-i18n / data-i18n-placeholder attributes and lookup below.
 *
 * KR terminology sourced from LWS_Knowledge_Base/kb/15-glossary.md and
 * per-article KR-EN tables:
 *   - Landing / drop:     랜딩, 착륙, 낙하 (colloquial ко-carry from S1 discourse)
 *   - Alliance Furnace:   동맹 화로 / 연맹 용광로 (KB [[06-season-2-frozen]])
 *   - Hive:               벌집 (KB [[08-alliance-systems]])
 *   - Rally leader:       집결 리더 / 리더 (KB [[04-squads-combat]])
 *   - Freeze / frozen:    냉동 / 얼음 상태 (KB [[06-season-2-frozen]])
 *   - Anchor coord:       기준 좌표 / 앵커
 *   - Season 2:           시즌 2 / 폴라 스톰
 */

(function (global) {
  var I18N = {
    en: {
      // Header + brand
      brand:               'R5TOOLS.IO',
      brandSub:            'LWS Suite',
      toolName:            'Landing Planner',
      toolTagline:         'Season-2 Day-1 teleport coordinator',
      langToggle:          '한국어',
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


      // Anchor section
      anchorHeading:       'Day-1 Anchor',
      anchorSub:           'Where the Alliance Furnace will be placed. Corner tiles (-15 °C) are safest; every band inward drops ~15 °C.',
      anchorXLabel:        'Anchor X (0–1200)',
      anchorYLabel:        'Anchor Y (0–1200)',
      furnaceLevelLabel:   'Alliance Furnace level (1–20)',
      warzoneLabel:        'Warzone / server (optional)',
      metricAmbient:       'Ambient temp',
      metricFurnaceBonus:  'Furnace bonus',
      metricEffective:     'Inside-radius temp',
      metricMembers:       'Members placed',

      // Roster section
      rosterHeading:       'Alliance Roster',
      rosterSub:           'Upload CSV (columns: name, rank, hq_level, power, notes). Same format as the Hive Grid Manager — one CSV works across every LWS tool.',
      rosterUploadBtn:     'Upload CSV',
      rosterLoadSample:    'Load sample roster',
      rosterCount:         'members loaded',

      // Assignments section
      assignHeading:       'Landing Assignments',
      assignSub:           'Highest-rank / highest-power members go inside the Alliance Furnace heat radius. R1–R2 spread outward on the defensive ring.',
      assignBtn:           'Assign landing tiles',
      colName:             'Name',
      colRank:             'Rank',
      colHQ:               'HQ',
      colPower:            'Power',
      colCoord:            'Coord (X, Y)',
      colDelta:            'Δ from anchor',
      colRing:             'Ring',
      colTemp:             'Tile °C',
      colRisk:             'Freeze risk',
      riskSafe:            'Safe',
      riskWarn:            'Watch',
      riskDanger:          'Danger',

      // Preview + export
      previewHeading:      'Landing Preview',
      previewSub:          'Visual layout of the assigned tiles around the anchor. Discord-ready PNG export ships in v1.1.',
      exportPngBtn:        'Export PNG (Discord)',
      exportCsvBtn:        'Export CSV',
      exportJsonBtn:       'Export JSON',
      exportShareBtn:      'Copy Discord share block',

      // Preview controls (zoom presets + thermal overlay + style picker)
      zoomWorld:           'World',
      zoomR5:              'R5 overview',
      zoomArrival:         'Arrival',
      thermalToggle:       'Thermal Map',
      styleLabel:          'Style',
      styleSchematic:      'Schematic',
      styleRealistic:      'Realistic',

      // Warnings + status
      warnTitle:           'Data caveats',
      warnFurnaceRadius:   'Alliance Furnace tile radius is a KB gap (open question #1). The safe zone shown here uses a placeholder value; verify in-game before locking a plan.',
      warnAnchorRange:     'Anchor coordinates must be integers in 0–1200.',
      warnNoRoster:        'Upload a roster CSV or load the sample to continue.',

      // Footer
      footerCred:          'Powered by the LWS Knowledge Base',
      footerBackLink:      'All tools · r5tools.io',

      // Access-codes gate
      gateBlockedTitle:    'Alliance Access Code required',
      gateBlockedBody:     'Unlock once with your alliance code to use every LWS tool for 90 days.',
      gateBlockedBtn:      'Enter code →',

      // ---- Season-agnostic UI chrome ----
      formationPickerLabel: 'Formation',
      seasonBannerTitle:    'Season notes',
      unresolvedTitle:      'Season not yet documented',
      unresolvedBody:       'This tool has no landing plan for the currently selected season. Falling back to the Season-2 4-ring pattern for reference — verify in-game before use.',

      // ---- Season 7 placeholder (unified copy — mirrored across all 6 static tools) ----
      s7ComingTitle:        'Season 7 launches ~August 2026',
      s7ComingBody:         'Full tool support arrives when Anthropic publishes S7 mechanics (usually 1-2 weeks before launch). Track updates at r5tools.io.',
      s7ComingTracker:      'Track: r5tools.io',

      // ---- S1 — Crimson Plague ----
      s1_toolTagline:          'Season-1 Day-1 Military Stronghold coordinator',
      s1_anchorHeading:        'Day-1 Anchor · Military Stronghold',
      s1_anchorSub:            "Where your captured Military Stronghold sits (21x21, guarded by Corruptor NPC). Rally leaders in Ring 1 must clear the Stronghold's Virus Resistance gate — otherwise rallies deal ~0 damage.",
      s1_strongholdLevelLabel: 'Stronghold level captured (L1-L6)',
      s1_metricVrTarget:       'Ring-1 VR target',
      s1_metricCorruptorLevel: 'Corruptor virus level',
      s1_metricLeaderCoverage: 'Rally leaders VR-cleared',
      s1_colVrGate:            'VR gate',
      s1_vrGatePass:           'Pass',
      s1_vrGateWarn:           'Close',
      s1_vrGateFail:           'Fail — 0 dmg',
      s1_warnLeaderVrOnly:     "Season 1 rule: only the rally leader's Virus Resistance is checked. Under-resisted leaders → rally deals ~0 damage. Reserve Ring 1 for VRI-maxed R5/R4.",

      // ---- S3 — Golden Kingdom ----
      s3_toolTagline:       'Season-3 Alliance Center placement + Sandworm range planner',
      s3_anchorHeading:     'Day-1 Anchor · Alliance Center (5x5)',
      s3_anchorSub:         'Where the Alliance Center will be placed. Every member base MUST stay inside AC range — Large Sandworms teleport out-of-range bases to random map locations.',
      s3_acLevelLabel:      'Alliance Center level (1-15)',
      s3_metricAcRange:     'AC range radius (tiles)',
      s3_metricCurseGate:   'Curse Resistance gate',
      s3_metricInRange:     'Bases in AC range',
      s3_colSandwormRange:  'Sandworm range',
      s3_sandwormIn:        'In-range',
      s3_sandwormOut:       'OUT — teleport risk',
      s3_warnSandworm:      'S3 hard rule: every base must be inside Alliance Center range. Large Sandworms teleport out-of-range bases to random map locations.',
      s3_warnCurseGate:     'Ring 1 rally leaders should have Curse Research Lab L30 (up to 99.9% damage reduction) before Spice Wars W4.',

      // ---- S4 — Evernight Isle ----
      s4_toolTagline:            'Season-4 Alliance Center + Lighthouse landing coordinator',
      s4_anchorHeading:          'Day-1 Anchor · Alliance Center + Secondaries',
      s4_anchorSub:              'AC 5x5 + 3 secondary buildings (Stone/Oil/Magatama Warehouses) as one 11-tile cluster. Min 11-tile spacing to any neighboring alliance\'s AC.',
      s4_neighborAcLabel:        'Nearest neighbor AC coord (optional)',
      s4_optoLabLabel:           'Optoelectronic Lab level (1-35)',
      s4_metricLighthouseBonus:  'Lighthouse VR bonus (warzone-wide)',
      s4_metricBloodNightDrain:  'Blood Night power drain per window',
      s4_metricAcSpacing:        'AC spacing to neighbor',
      s4_colBloodNight:          'Blood Night power',
      s4_bloodNightOk:           'Coverable',
      s4_bloodNightRisk:         'Under-power',
      s4_warnSpacing:            'Minimum 11-tile spacing center-to-center between your AC and neighboring alliance ACs.',
      s4_warnCopperWars:         'Copper Wars declaration range shrinks weekly W4->W7 (10 -> 6 -> 3 -> 3 sectors). Tighten hive footprint as season progresses.',
      s4_factionLocked:          'Faction locked at W3 D3 (Faction Awards)',

      // ---- S5 — Wild West / Octagon Clash ----
      s5_toolTagline:        'Season-5 Octagon Clash landing zone advisor',
      s5_anchorHeading:      'Landing Octant · 9x Merged Map',
      s5_anchorSub:          'S5 has no environmental anchor — pick your alliance\'s spawn octant on the 8-warzone merged map. Bank Strongholds are captured, not placed.',
      s5_bankTargetLabel:    'Target Bank Stronghold level (L1-10)',
      s5_metricBankHoldings: 'Bank holdings cap',
      s5_metricVrGate:       'VR gate for target Bank',
      s5_metricSafeTime:     'Alliance Safe Time (h)',
      s5_metricWarSlots:     'Daily war slots active',
      s5_safeTimeLabel:      'Alliance Safe Time hours (7-15)',
      s5_colBankFit:         'Bank readiness',
      s5_bankReady:          'Ready',
      s5_bankVrShort:        'VR short',
      s5_warnMergedMap:      'Octagon Clash: 8 warzones share one 9x map. Bank Strongholds are captured mid-season — this tool clusters your alliance around your spawn octant.',
      s5_warnBankVr:         'L10 Bank Strongholds require 39900 Virus Resistance. L7-10 unlock at W4.',
      s5_warnBankSpeculative:'Bank Stronghold tile footprint is not published. Formation uses S1\'s 21x21 by analogy — verify in-game.',

      // ---- S6 — Shadow Rainforest ----
      s6_toolTagline:        'Season-6 Mega-Hive + Faction Pact placement',
      s6_anchorHeading:      'Day-1 Anchor · Alliance Assembly Point',
      s6_anchorSub:          'R5-set flag on the mirror-symmetric 8+1 mega-map. No environmental anchor — pick placement based on faction strategic zone.',
      s6_factionLabel:       'Faction',
      s6_factionDeepwood:    'Deepwood (stag)',
      s6_factionWetland:     'Wetland (crocodile)',
      s6_factionGreatRiver:  'Great River (neutral)',
      s6_subAlliancesLabel:  'Sub-alliance count (1-6, mega-hive only)',
      s6_metricAltarsHeld:   'Altars held (max 3 of 5)',
      s6_metricPactDuration: 'Pact duration (days)',
      s6_metricSanctuary:    'Sanctuary timer',
      s6_colFactionPact:     'Faction / pact',
      s6_pactMember:         'Pact ally',
      s6_warnCityDestruction:'S6: City Destruction is PERMANENT. Attacker +50% IP, defender -100% IP. No rebuild.',
      s6_warnMegaHive:       'Mega-Hive supports up to 6 sub-alliances layered across 8 rings. Each sub-alliance internally runs its own MG 3x3 or Stronghold 21x21.',
      s6_warnAltars:         '5 Altars in the Central Zone. Open Tuesdays only. Hold max 3 simultaneously. 100% capture required on an occupied altar.',
    },

    ko: {
      // Header + brand
      brand:               'R5TOOLS.IO',
      brandSub:            'LWS 스위트',
      toolName:            '랜딩 플래너',
      toolTagline:         '시즌 2 첫날 순간이동 코디네이터',
      langToggle:          'EN',
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


      // Anchor section
      anchorHeading:       '첫날 앵커 좌표',
      anchorSub:           '동맹 화로를 배치할 위치입니다. 코너 타일(-15 °C)이 가장 안전하며, 안쪽으로 갈수록 약 15 °C씩 낮아집니다.',
      anchorXLabel:        '앵커 X (0–1200)',
      anchorYLabel:        '앵커 Y (0–1200)',
      furnaceLevelLabel:   '동맹 화로 레벨 (1–20)',
      warzoneLabel:        '워존 / 서버 (선택)',
      metricAmbient:       '지면 온도',
      metricFurnaceBonus:  '화로 보너스',
      metricEffective:     '반경 내 온도',
      metricMembers:       '배치된 인원',

      // Roster section
      rosterHeading:       '연맹 명단',
      rosterSub:           'CSV 업로드 (열: name, rank, hq_level, power, notes). 하이브 그리드 매니저와 동일한 형식 — 하나의 CSV가 모든 LWS 도구에서 작동합니다.',
      rosterUploadBtn:     'CSV 업로드',
      rosterLoadSample:    '샘플 명단 불러오기',
      rosterCount:         '명 로드됨',

      // Assignments section
      assignHeading:       '착륙 배치',
      assignSub:           '가장 높은 랭크 / 파워의 멤버가 동맹 화로 열 반경 안에 배치됩니다. R1–R2는 방어 링 바깥으로 배치됩니다.',
      assignBtn:           '착륙 타일 할당',
      colName:             '이름',
      colRank:             '랭크',
      colHQ:               'HQ',
      colPower:            '파워',
      colCoord:            '좌표 (X, Y)',
      colDelta:            '앵커 기준 Δ',
      colRing:             '링',
      colTemp:             '타일 °C',
      colRisk:             '냉동 위험',
      riskSafe:            '안전',
      riskWarn:            '주의',
      riskDanger:          '위험',

      // Preview + export
      previewHeading:      '착륙 미리보기',
      previewSub:          '앵커 주변에 할당된 타일의 시각적 레이아웃. Discord용 PNG 내보내기는 v1.1에서 제공됩니다.',
      exportPngBtn:        'PNG 내보내기 (Discord)',
      exportCsvBtn:        'CSV 내보내기',
      exportJsonBtn:       'JSON 내보내기',
      exportShareBtn:      'Discord 공유 블록 복사',

      // Preview controls (zoom presets + thermal overlay + style picker)
      zoomWorld:           '세계 줌',
      zoomR5:              'R5 줌',
      zoomArrival:         '도착 줌',
      thermalToggle:       '열 지도',
      styleLabel:          '스타일',
      styleSchematic:      '개략도',
      styleRealistic:      '사실적',

      // Warnings + status
      warnTitle:           '데이터 유의사항',
      warnFurnaceRadius:   '동맹 화로 타일 반경은 KB 미확정 항목입니다(공개 질문 #1). 여기 표시된 안전 구역은 임시 값이며, 계획을 확정하기 전에 게임 내에서 확인하세요.',
      warnAnchorRange:     '앵커 좌표는 0–1200 범위의 정수여야 합니다.',
      warnNoRoster:        '계속하려면 명단 CSV를 업로드하거나 샘플을 불러오세요.',

      // Footer
      footerCred:          'LWS 지식 베이스에서 지원',
      footerBackLink:      '모든 도구 · r5tools.io',

      // Access-codes gate
      gateBlockedTitle:    '연맹 액세스 코드 필요',
      gateBlockedBody:     '연맹 코드로 한 번 잠금 해제하면 90일 동안 모든 LWS 도구를 사용할 수 있습니다.',
      gateBlockedBtn:      '코드 입력 →',

      // ---- Season-agnostic UI chrome ----
      formationPickerLabel: '진영 (Formation)',
      seasonBannerTitle:    '시즌 유의사항',
      unresolvedTitle:      '아직 문서화되지 않은 시즌',
      unresolvedBody:       '현재 선택한 시즌에 대한 랜딩 플랜이 없습니다. 참고용으로 시즌 2의 4링 패턴을 표시하지만, 사용 전 인게임에서 확인하세요.',

      // ---- Season 7 placeholder (unified copy — mirrored across all 6 static tools) ----
      s7ComingTitle:        '시즌 7 출시 예정 — 2026년 8월경',
      s7ComingBody:         'Anthropic이 시즌 7 메커니즘을 공개하면 (보통 출시 1-2주 전) 전체 도구 지원이 시작됩니다. 업데이트는 r5tools.io에서 확인하세요.',
      s7ComingTracker:      '추적: r5tools.io',

      // ---- S1 — Crimson Plague ----
      s1_toolTagline:          '시즌 1 첫날 군사 요새 코디네이터',
      s1_anchorHeading:        '첫날 앵커 · 군사 요새',
      s1_anchorSub:            '점령한 군사 요새 위치 (21x21, 커럽터 NPC 수호). 링 1의 집결 리더는 요새의 바이러스 저항 게이트를 통과해야 함 — 미통과 시 집결 데미지 = 0.',
      s1_strongholdLevelLabel: '점령한 요새 레벨 (L1-L6)',
      s1_metricVrTarget:       '링 1 VR 목표',
      s1_metricCorruptorLevel: '커럽터 바이러스 레벨',
      s1_metricLeaderCoverage: 'VR 통과한 집결 리더 수',
      s1_colVrGate:            'VR 게이트',
      s1_vrGatePass:           '통과',
      s1_vrGateWarn:           '근접',
      s1_vrGateFail:           '실패 — 0 데미지',
      s1_warnLeaderVrOnly:     '시즌 1 규칙: 집결 리더의 바이러스 저항만 체크됨. VR 미달 리더 → 집결 데미지 = 0. 링 1은 VRI 만렙 R5/R4 전용.',

      // ---- S3 — Golden Kingdom ----
      s3_toolTagline:       '시즌 3 얼라이언스 센터 배치 + 모래벌레 사거리 플래너',
      s3_anchorHeading:     '첫날 앵커 · 얼라이언스 센터 (5x5)',
      s3_anchorSub:         '얼라이언스 센터를 배치할 위치. 모든 기지는 AC 범위 안에 있어야 함 — 대형 모래벌레가 범위 밖 기지를 무작위 위치로 순간이동시킴.',
      s3_acLevelLabel:      '얼라이언스 센터 레벨 (1-15)',
      s3_metricAcRange:     'AC 범위 반경 (타일)',
      s3_metricCurseGate:   '저주 저항 게이트',
      s3_metricInRange:     'AC 범위 내 기지',
      s3_colSandwormRange:  '모래벌레 사거리',
      s3_sandwormIn:        '범위 내',
      s3_sandwormOut:       '범위 밖 — 순간이동 위험',
      s3_warnSandworm:      'S3 필수 규칙: 모든 기지는 얼라이언스 센터 범위 안에 있어야 함. 모래벌레가 범위 밖 기지를 무작위 위치로 순간이동시킴.',
      s3_warnCurseGate:     '링 1 집회 리더는 향신료 전쟁 4주 이전까지 저주 연구실 L30 (최대 99.9% 데미지 감소) 확보 권장.',

      // ---- S4 — Evernight Isle ----
      s4_toolTagline:            '시즌 4 얼라이언스 센터 + 등대 착륙 코디네이터',
      s4_anchorHeading:          '첫날 앵커 · AC + 보조 건물',
      s4_anchorSub:              'AC 5x5 + 보조 건물 3개 (돌·기름·마가타마 창고) 11타일 클러스터. 인접 동맹 AC와 최소 11타일 간격.',
      s4_neighborAcLabel:        '가장 가까운 이웃 AC 좌표 (선택)',
      s4_optoLabLabel:           '광전기 실험실 레벨 (1-35)',
      s4_metricLighthouseBonus:  '등대 VR 보너스 (전쟁구역 공용)',
      s4_metricBloodNightDrain:  '블러드 나이트 창당 전력 소모',
      s4_metricAcSpacing:        '이웃과의 AC 간격',
      s4_colBloodNight:          '블러드 나이트 전력',
      s4_bloodNightOk:           '감당 가능',
      s4_bloodNightRisk:         '전력 부족',
      s4_warnSpacing:            '얼라이언스 센터 간 최소 11타일 중심-대-중심 간격.',
      s4_warnCopperWars:         '코퍼 전쟁 선언 범위는 매주 좁아짐 (4주->7주, 10->6->3->3). 시즌 진행에 따라 벌집을 조이세요.',
      s4_factionLocked:          '팩션은 W3 D3 (팩션 어워드)에 확정',

      // ---- S5 — Wild West / Octagon Clash ----
      s5_toolTagline:        '시즌 5 옥타곤 클래시 착륙 지역 어드바이저',
      s5_anchorHeading:      '착륙 옥탄트 · 9배 통합 지도',
      s5_anchorSub:          '시즌 5는 환경 앵커 없음 — 8개 전쟁구역 통합 지도에서 스폰 옥탄트 선택. 은행 요새는 점령 대상.',
      s5_bankTargetLabel:    '목표 은행 요새 레벨 (L1-10)',
      s5_metricBankHoldings: '은행 보유 상한',
      s5_metricVrGate:       '목표 은행용 VR 게이트',
      s5_metricSafeTime:     '얼라이언스 세이프 타임 (h)',
      s5_metricWarSlots:     '활성 일일 전쟁 슬롯',
      s5_safeTimeLabel:      '얼라이언스 세이프 타임 시간 (7-15)',
      s5_colBankFit:         '은행 대응',
      s5_bankReady:          '가능',
      s5_bankVrShort:        'VR 부족',
      s5_warnMergedMap:      '옥타곤 클래시: 8개 전쟁구역이 9배 지도 공유. 은행 요새는 시즌 중 점령 — 이 도구는 스폰 옥탄트 주변 배치용.',
      s5_warnBankVr:         'L10 은행 요새는 바이러스 저항 39900 필요. L7-10은 4주 개방.',
      s5_warnBankSpeculative:'은행 요새 타일 크기 미공개. 프리셋은 S1의 21x21 근거 추정 — 인게임 확인 필요.',

      // ---- S6 — Shadow Rainforest ----
      s6_toolTagline:        '시즌 6 메가하이브 + 팩션 조약 배치',
      s6_anchorHeading:      '첫날 앵커 · 얼라이언스 집결 지점',
      s6_anchorSub:          '완전 대칭 8+1 메가맵의 R5 설정 깃발. 환경 앵커 없음 — 팩션 전략 지역 기준 배치.',
      s6_factionLabel:       '팩션',
      s6_factionDeepwood:    '딥우드 (수사슴)',
      s6_factionWetland:     '웨틀랜드 (악어)',
      s6_factionGreatRiver:  '그레이트 리버 (중립)',
      s6_subAlliancesLabel:  '서브 동맹 수 (1-6, 메가하이브 전용)',
      s6_metricAltarsHeld:   '보유 제단 (5개 중 최대 3)',
      s6_metricPactDuration: '조약 기간 (일)',
      s6_metricSanctuary:    '성역 타이머',
      s6_colFactionPact:     '팩션 / 조약',
      s6_pactMember:         '조약 동맹',
      s6_warnCityDestruction:'시즌 6: 도시 파괴는 영구. 공격자 +50% IP, 방어자 -100% IP. 재건 불가.',
      s6_warnMegaHive:       '메가하이브는 최대 6개 서브 동맹을 8개 링에 배치 지원. 각 서브 동맹은 내부적으로 MG 3x3 또는 요새 21x21 운용.',
      s6_warnAltars:         '중앙 지역 5개 제단. 화요일만 개방. 최대 3개 동시 보유. 점령된 제단은 100% 점령 필요.',
    },
  };

  var state = {
    lang: (function () {
      try {
        var stored = localStorage.getItem('lws_lang');
        if (stored === 'en' || stored === 'ko') return stored;
      } catch (e) { /* private mode */ }
      return (navigator.language || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';
    })(),
    listeners: [],
  };

  function t(key) {
    var dict = I18N[state.lang] || I18N.en;
    return dict[key] != null ? dict[key] : (I18N.en[key] || key);
  }

  function apply(root) {
    root = root || document;
    root.documentElement && (root.documentElement.lang = state.lang);
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    root.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    state.listeners.forEach(function (fn) { try { fn(state.lang); } catch (e) {} });
  }

  function setLang(l) {
    if (l !== 'en' && l !== 'ko') return;
    state.lang = l;
    try { localStorage.setItem('lws_lang', l); } catch (e) { /* ignore */ }
    try { window.dispatchEvent(new CustomEvent('lws:lang-changed', { detail: { lang: l } })); } catch (e) { /* ignore */ }
    apply();
  }

  function toggle() {
    setLang(state.lang === 'en' ? 'ko' : 'en');
  }

  function onChange(fn) { state.listeners.push(fn); }
  function currentLang() { return state.lang; }

  global.LWSi18n = { t: t, apply: apply, setLang: setLang, toggle: toggle, onChange: onChange, lang: currentLang };
})(window);
