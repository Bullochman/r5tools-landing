/* LWS Hive Grid Manager — i18n dictionary. Korean-first.
 *
 * Populated from the 122 data-i18n keys used in index.html.
 * EN values mirror the current HTML content (which renders in EN by default).
 * KO values come from the previously-inlined I18N.ko block in index.html.
 *
 * The hive tool has its own inline i18n system (I18N + applyI18n + setLang) that
 * predates the suite's canonical LWSi18n module. This file publishes the same
 * dict under the canonical LWSi18n shape so:
 *   1. Other suite tools can import/read hive's strings if needed
 *   2. Future refactors can drop the inline dict without breaking the toggle
 *   3. Automated audits stop flagging hive as missing i18n.js
 *
 * The inline hive I18N + applyI18n remain the primary source of truth at
 * runtime — the hive tool's own script wires the #lang-toggle button and
 * calls setLang() → applyI18n() → renderAll(). This external module exports
 * the same dict for symmetry with the rest of the suite (Landing Planner,
 * Roster Extractor, Heat Simulator, etc.).
 */

(function (global) {
  var I18N = {
    en: {
      langToggle: '한국어',
      alliance_hint: '← shown in PNG exports',
      alliance_label: 'ALLIANCE',
      alliance_placeholder: 'Enter alliance name…',
      alliance_title: 'Your alliance name — appears in PNG exports',
      betaFeedbackPill: '🚧 BETA · Feedback',
      btn_auto: '⚡ Auto-Assign',
      btn_auto_title: 'Auto-assign members to grid cells',
      btn_cancel: 'Cancel',
      btn_clear_grid: '🗑 Clear Grid',
      btn_clear_grid_title: 'Unassign everyone — keep member list',
      btn_csv_dl: '⬇ CSV',
      btn_csv_dl_title: 'Download current roster as CSV',
      btn_csv_up: '📂 Upload CSV',
      btn_csv_up_title: 'Upload a CSV to update member data',
      btn_delete: '🗑 Delete',
      btn_export_png: '📸 Export PNG',
      btn_export_png_title: 'Export grid as PNG image for Discord/WhatsApp',
      btn_reset_all: '💥 Reset All',
      btn_reset_all_title: 'Wipe everything and start fresh',
      btn_save: '💾 Save',
      btn_set_mg: '📍 Set MG Coords',
      btn_set_mg_title: 'Change the MG anchor coordinates',
      btn_unassign: '↩ Unassign',
      col_coord: 'COORD',
      col_hq: 'HQ LV.',
      col_name: 'NAME',
      col_notes: 'NOTES',
      col_num: '#',
      col_power: 'POWER',
      col_rank: 'RANK',
      col_ring: 'RING',
      connecting: 'Connecting to server…',
      csv_col_hq: '<code>HQ Level</code> &nbsp;or&nbsp; <code>HQ Lv.</code>',
      csv_col_member: '<code>Member</code> &nbsp;or&nbsp; <code>Name</code>',
      csv_col_notes: '<code>Notes</code> &nbsp;(optional)',
      csv_col_power: '<code>Total Power</code> &nbsp;→ e.g. <code>54.2M</code>',
      csv_col_rank: '<code>Rank</code> &nbsp;→ R5, R4, R3, R2, or R1',
      csv_heading: '📋 CSV FORMAT GUIDE',
      csv_intro: 'Upload a CSV with these exact columns (in any order):',
      csv_note1: 'Extra spaces are trimmed automatically. Duplicate names keep the highest rank row.',
      csv_protip: '💡 <em>Pro tip:</em> Have your leader read out each member\'s name, rank, HQ level, and power out loud while someone fills in the spreadsheet — takes about 5 minutes for a full alliance.',
      fb_comment_label: 'YOUR OWN IDEA OR COMMENT',
      fb_comment_placeholder: 'Describe your idea, report a bug, or just say hi…',
      fb_heading: '💡 SUGGESTIONS &amp; FEATURE REQUESTS',
      fb_name_label: 'YOUR NAME OR ALLIANCE TAG (optional)',
      fb_name_placeholder: 'e.g. KittyKitty [R10t]',
      fb_sub: 'Help shape the next version — vote for features you\'d use, or leave your own idea below.',
      fb_submit: '📨 Submit Feedback',
      fb_thanks: '✓ Thanks! Your feedback has been recorded.',
      fb_v_dash: 'Leader dashboard — upload once, every member sees it without editing',
      fb_v_event: 'Event-mode layouts (zombie surge corner, KvK rally point, war defense)',
      fb_v_form: 'Formation presets (circle, diamond, corner, zombie surge / KvK event layouts)',
      fb_v_history: 'Member power history tracker — watch the alliance grow over time',
      fb_v_mobile: 'Mobile-friendly view optimized for phones',
      fb_v_multi: 'Multi-hive / sub-alliance support (R1/R2 on a separate grid)',
      fb_v_ocr: 'Auto roster import from in-game screenshots (OCR)',
      fb_v_share: 'Read-only shareable link so the whole alliance can view the grid live',
      fb_v_swap: 'Smart swap suggestions — flag weak placements and recommend improvements',
      fb_votes_label: 'VOTE FOR FEATURES (check all that apply)',
      field_hq: 'HQ LEVEL',
      field_hq_placeholder: 'e.g. 25',
      field_name_placeholder: 'Enter name…',
      field_notes: 'NOTES',
      field_notes_placeholder: 'Optional…',
      field_player_name: 'PLAYER NAME',
      field_power: 'TOTAL POWER',
      field_power_placeholder: 'e.g. 45.2M',
      field_rank: 'RANK',
      fm_mg: '⚑ Marshall\'s Guard (2×2 HQ, tight pack)',
      fm_sh: '❄ Polar Storm / Military Stronghold (21×21 furnace, 2×2 HQs, 2-tile gaps)',
      formation: 'FORMATION',
      formation_title: 'Switch between Marshall\'s Guard hive (tight 2×2 HQ pack) and Military Stronghold (21×21 furnace, 2×2 HQs, 2-tile gaps, 4 rings)',
      mg_game_x: 'MG Game X',
      mg_game_y: 'MG Game Y',
      mg_modal_hint: 'Grid step is 2 tiles per cell (KB-canonical 2×2 HQ footprint). Changing the anchor shifts all coordinate labels.',
      mg_modal_title: '📍 Set Marshall\'s Guard Coordinates',
      modal_edit_member: 'Edit Member',
      navCity: 'City',
      navCoal: 'Coal',
      navFreeze: 'Freeze',
      navHeat: 'Heat',
      navLanding: 'Landing',
      navProfile: 'Profile',
      navRoster: 'Roster',
      navTimeline: 'Timeline',
      navVsDays: 'VS Days',
      rank_r5_leader: 'R5  (Leader)',
      rank_unknown: '— Unknown —',
      roster_heading: '▸ MEMBER ROSTER',
      s2_body: '<strong>Season 2 rewards alliances that land together.</strong> Every teleport needs a coordinate — argue about placement in the moment and half your alliance ends up scattered outside the Alliance Furnace, freezing, and unable to rally. Pre-plan every member\'s spot now, export a PNG, drop it in your Discord — everyone teleports to their assigned coord on day 1 and your hive is locked in before enemies can wedge a 3×3 city between you.',
      s2_dismiss: '✕ dismiss',
      s2_heading: '⏳ WHY THIS MATTERS FOR SEASON 2',
      sel_clear: '✕ Clear (Esc)',
      sh_banner: '🏰 <strong>MILITARY STRONGHOLD</strong> &nbsp;·&nbsp; 21×21 tile fortress &nbsp;·&nbsp; Each alliance member = 2×2 tile HQ, 2-tile gap between every member (4-tile pitch) &nbsp;·&nbsp; <span style="color:#ff8888">Ring 1 = strongest (against the mud)</span>',
      snagit_body: 'When you\'re gathering member names and stats from your in-game roster, a <strong>scrolling screenshot tool</strong> like <a href="https://www.techsmith.com/snagit.html" target="_blank" rel="noopener" style="color:#88ccff">Snagit</a> (Mac + Windows, ~$63 one-time) captures the entire alliance list in a single image instead of stitching together 6 screenshots. Pair it with this tool for a 5-minute alliance-wide setup. Free alternatives: <strong>ShareX</strong> (Windows), <strong>CleanShot X</strong> (Mac, has scrolling capture).',
      snagit_heading: '📸 CAPTURE THE WHOLE GAME SCREEN',
      sort_by: 'Sort by:',
      sort_hint: '— click Rank/HQ/Power/Notes cells below to edit inline',
      sort_hq: 'HQ Level only',
      sort_hq_power: 'HQ Level → Power',
      sort_name: '🔤 Name',
      sort_power: 'Power only',
      sort_power_short: '⚡ Power',
      sort_rank: '🏅 Rank',
      sort_rank_hq: 'Rank → HQ Level',
      sort_rank_hq_power: 'Rank → HQ → Power',
      sort_rank_power: 'Rank → Power',
      sort_ring: '📍 Ring',
      sort_title: 'Priority order for auto-assign',
      suiteNavPart: 'Part of the ',
      suiteNavToolkit: ' Last War: Survival alliance toolkit — ',
      tip_heading: '☕ TIP THE DEV',
      tip_line1: 'Saved you hours of chaos?<br>Buy me a coffee — or flex your whale status.',
      tip_qr_title: 'Scan or click to tip on Venmo',
      tip_venmo_hint: 'Scan the QR code with your Venmo app, or click it.<br>If prompted to confirm the recipient, the last 4 digits are <strong style="color:#44884a">0829</strong>.',
      title: '◈ LAST WAR SURVIVAL — ALLIANCE HIVE GRID ◈',
      unlock_body: 'Your grid, your alliance, your image. The free version is fully functional — auto-assign, drag-and-drop, CSV import, PNG export, everything. The $10 unlock removes the watermark from every PNG you export, so the screenshot you drop in Discord looks clean and professional. One-time payment. No subscription, no renewal, no account. Pay via Stripe, get your key by email instantly, paste it in and you\'re done.',
      unlock_btn: '💳 Get Your Key — $10',
      unlock_btn_apply: 'Unlock',
      unlock_footnote: 'Secure checkout via Stripe · Apple Pay &amp; card accepted · Instant key delivery by email',
      unlock_heading: '🔓 UNLOCK FULL VERSION — $10 ONE-TIME',
      unlock_placeholder: 'Paste your key here…',
    },

    ko: {
      langToggle: 'EN',
      alliance_hint: '← PNG 내보내기에 표시',
      alliance_label: '연맹',
      alliance_placeholder: '연맹 이름 입력…',
      alliance_title: '연맹 이름 — PNG 내보내기에 표시됩니다',
      betaFeedbackPill: '🚧 베타 · 피드백',
      btn_auto: '⚡ 자동 배치',
      btn_auto_title: '연맹원을 그리드 셀에 자동 배치',
      btn_cancel: '취소',
      btn_clear_grid: '🗑 배치 초기화',
      btn_clear_grid_title: '배치만 해제 — 명단은 유지',
      btn_csv_dl: '⬇ CSV',
      btn_csv_dl_title: '현재 명단을 CSV로 다운로드',
      btn_csv_up: '📂 CSV 업로드',
      btn_csv_up_title: 'CSV 파일로 연맹원 정보 업데이트',
      btn_delete: '🗑 삭제',
      btn_export_png: '📸 PNG 내보내기',
      btn_export_png_title: '디스코드/카톡용 PNG 이미지로 내보내기',
      btn_reset_all: '💥 전체 초기화',
      btn_reset_all_title: '모두 삭제하고 처음부터',
      btn_save: '💾 저장',
      btn_set_mg: '📍 MG 좌표 설정',
      btn_set_mg_title: 'MG 기준 좌표 변경',
      btn_unassign: '↩ 배치 해제',
      col_coord: '좌표',
      col_hq: '기지',
      col_name: '이름',
      col_notes: '메모',
      col_num: '#',
      col_power: '전투력',
      col_rank: '등급',
      col_ring: '링',
      connecting: '서버 연결 중…',
      csv_col_hq: '<code>HQ Level</code> &nbsp;또는&nbsp; <code>HQ Lv.</code>',
      csv_col_member: '<code>Member</code> &nbsp;또는&nbsp; <code>Name</code>',
      csv_col_notes: '<code>Notes</code> &nbsp;(선택)',
      csv_col_power: '<code>Total Power</code> &nbsp;→ 예: <code>54.2M</code>',
      csv_col_rank: '<code>Rank</code> &nbsp;→ R5, R4, R3, R2, 또는 R1',
      csv_heading: '📋 CSV 형식 안내',
      csv_intro: '아래 열 이름을 정확히 포함하여 CSV를 업로드하세요 (순서 무관):',
      csv_note1: '공백은 자동으로 제거됩니다. 중복 이름은 등급이 가장 높은 행이 유지됩니다.',
      csv_protip: '💡 <em>꿀팁:</em> 연맹장이 연맹원 이름, 등급, 기지 레벨, 전투력을 소리내어 읽고 다른 사람이 스프레드시트에 입력하면 — 전체 연맹 기준 5분이면 끝납니다.',
      fb_comment_label: '아이디어 또는 코멘트',
      fb_comment_placeholder: '아이디어 설명, 버그 신고, 인사 등…',
      fb_heading: '💡 건의사항 &amp; 기능 요청',
      fb_name_label: '이름 또는 연맹 태그 (선택)',
      fb_name_placeholder: '예: KittyKitty [R10t]',
      fb_sub: '다음 버전 형태를 도와주세요 — 원하는 기능에 투표하거나 아이디어를 남기세요.',
      fb_submit: '📨 피드백 제출',
      fb_thanks: '✓ 감사합니다! 피드백이 기록되었습니다.',
      fb_v_dash: '연맹장 대시보드 — 한 번 업로드하면 모든 연맹원이 편집 없이 보기',
      fb_v_event: '이벤트 모드 배치 (좀비 침공 코너, KvK 집결지, 전쟁 방어)',
      fb_v_form: '배치 프리셋 (원형, 다이아몬드, 코너, 좀비 침공/KvK 이벤트 배치)',
      fb_v_history: '연맹원 전투력 이력 추적 — 연맹 성장 과정 확인',
      fb_v_mobile: '휴대폰 최적화 모바일 뷰',
      fb_v_multi: '다중 벌집 / 서브연맹 지원 (R1/R2를 별도 그리드에)',
      fb_v_ocr: '인게임 스크린샷에서 명단 자동 가져오기 (OCR)',
      fb_v_share: '읽기 전용 공유 링크 — 연맹 전체가 실시간으로 그리드 보기',
      fb_v_swap: '스마트 교체 제안 — 약한 배치를 감지하고 개선 추천',
      fb_votes_label: '기능에 투표 (해당 항목 모두 선택)',
      field_hq: '기지 레벨',
      field_hq_placeholder: '예: 25',
      field_name_placeholder: '이름 입력…',
      field_notes: '메모',
      field_notes_placeholder: '선택 사항…',
      field_player_name: '플레이어 이름',
      field_power: '총 전투력',
      field_power_placeholder: '예: 45.2M',
      field_rank: '등급',
      fm_mg: '⚑ 원수 근위대 (2×2 기지, 밀집 배치)',
      fm_sh: '❄ 폴라 스톰 / 군사 요새 (21×21 화로, 2×2 기지, 2타일 간격)',
      formation: '배치 방식',
      formation_title: '원수 근위대 벌집(2×2 기지 밀집)과 군사 요새(21×21 화로, 2×2 기지, 2타일 간격, 4링) 사이 전환',
      mg_game_x: 'MG 게임 X',
      mg_game_y: 'MG 게임 Y',
      mg_modal_hint: '그리드 단위는 셀당 2타일입니다 (KB 정식 2×2 기지 발자국). 기준 좌표를 바꾸면 모든 좌표 라벨이 이동합니다.',
      mg_modal_title: '📍 원수 근위대 좌표 설정',
      modal_edit_member: '연맹원 편집',
      navCity: '도시',
      navCoal: '석탄',
      navFreeze: '동결',
      navHeat: '히트',
      navLanding: '랜딩',
      navProfile: '프로필',
      navRoster: '명단',
      navTimeline: '타임라인',
      navVsDays: 'VS 데이',
      rank_r5_leader: 'R5  (연맹장)',
      rank_unknown: '— 미지정 —',
      roster_heading: '▸ 연맹원 명단',
      s2_body: '<strong>시즌2는 같이 착지하는 연맹에게 유리합니다.</strong> 텔레포트마다 좌표가 필요한데, 착지 순간에 배치를 논의하면 절반은 연맹 화로 밖에 흩어져서 얼어붙고 집결도 못 합니다. 지금 미리 연맹원 전원의 자리를 정해두고, PNG로 내보내서 디스코드/카톡에 올리면 — 첫날 각자 지정된 좌표로 텔레포트, 적이 3×3 도시를 사이에 못 끼워 넣기 전에 벌집이 완성됩니다.',
      s2_dismiss: '✕ 닫기',
      s2_heading: '⏳ 시즌2에 왜 필요한가',
      sel_clear: '✕ 취소 (Esc)',
      sh_banner: '🏰 <strong>군사 요새</strong> &nbsp;·&nbsp; 21×21 타일 요새 &nbsp;·&nbsp; 연맹원 1인 = 2×2 타일 기지, 모든 연맹원 사이 2타일 간격 (4타일 피치) &nbsp;·&nbsp; <span style="color:#ff8888">1링 = 최강 (진흙 옆)</span>',
      snagit_body: '인게임 명단에서 연맹원 이름과 스탯을 정리할 때, <a href="https://www.techsmith.com/snagit.html" target="_blank" rel="noopener" style="color:#88ccff">Snagit</a>(맥+윈도우, 약 $63 일회성) 같은 <strong>스크롤 스크린샷 도구</strong>를 사용하면 6장의 스크린샷을 이어 붙이는 대신 전체 연맹원 목록을 한 장의 이미지로 캡처할 수 있습니다. 이 도구와 함께 사용하면 5분 안에 연맹 전체 설정이 가능합니다. 무료 대안: <strong>ShareX</strong>(윈도우), <strong>CleanShot X</strong>(맥, 스크롤 캡처 지원).',
      snagit_heading: '📸 게임 화면 전체 캡처',
      sort_by: '정렬:',
      sort_hint: '— 등급/기지/전투력/메모 셀을 클릭하여 즉시 편집',
      sort_hq: '기지 레벨만',
      sort_hq_power: '기지 레벨 → 전투력',
      sort_name: '🔤 이름',
      sort_power: '전투력만',
      sort_power_short: '⚡ 전투력',
      sort_rank: '🏅 등급',
      sort_rank_hq: '등급 → 기지 레벨',
      sort_rank_hq_power: '등급 → 기지 → 전투력',
      sort_rank_power: '등급 → 전투력',
      sort_ring: '📍 링',
      sort_title: '자동 배치 우선순위',
      suiteNavPart: '이 도구는 ',
      suiteNavToolkit: ' 라스트 워: 서바이벌 얼라이언스 툴킷의 일부입니다 — ',
      tip_heading: '☕ 개발자 후원',
      tip_line1: '많은 시간 아끼셨나요?<br>커피 한 잔 사주세요 — 고래님 인증도 환영.',
      tip_qr_title: 'Venmo에서 후원하려면 스캔 또는 클릭',
      tip_venmo_hint: 'Venmo 앱으로 QR 코드를 스캔하거나 클릭하세요.<br>수신자 확인 시 마지막 4자리는 <strong style="color:#44884a">0829</strong>입니다.',
      title: '◈ 라스트 워: 서바이벌 — 연맹 벌집 배치도 ◈',
      unlock_body: '당신의 그리드, 당신의 연맹, 당신의 이미지. 무료 버전도 완전히 작동합니다 — 자동 배치, 드래그 앤 드롭, CSV 가져오기, PNG 내보내기 모두. $10 잠금해제는 내보내는 모든 PNG에서 워터마크를 제거하여, 디스코드에 올리는 스크린샷이 깔끔하고 전문적으로 보이게 합니다. 일회성 결제. 구독 없음, 갱신 없음, 계정 없음. Stripe로 결제, 이메일로 즉시 키 수령, 붙여넣기 후 완료.',
      unlock_btn: '💳 키 받기 — $10',
      unlock_btn_apply: '잠금해제',
      unlock_footnote: 'Stripe 안전 결제 · Apple Pay &amp; 카드 지원 · 이메일로 즉시 키 전송',
      unlock_heading: '🔓 정식 버전 잠금해제 — $10 일회성',
      unlock_placeholder: '키를 여기에 붙여넣기…',
    },
  };

  var state = {
    lang: (function () {
      try {
        var stored = localStorage.getItem('lws_lang');
        if (stored === 'en' || stored === 'ko') return stored;
        // Legacy per-tool key from the inline hive i18n system.
        var legacy = localStorage.getItem('hiveLang');
        if (legacy === 'en' || legacy === 'ko') return legacy;
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
      var mode = el.getAttribute('data-i18n-mode') || 'text';
      if (mode === 'html') el.innerHTML = t(el.getAttribute('data-i18n'));
      else el.textContent = t(el.getAttribute('data-i18n'));
    });
    root.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
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
    try { localStorage.setItem('hiveLang', l); } catch (e) { /* mirror legacy key */ }
    try { window.dispatchEvent(new CustomEvent('lws:lang-changed', { detail: { lang: l } })); } catch (e) { /* ignore */ }
    apply();
  }

  function toggle() {
    setLang(state.lang === 'en' ? 'ko' : 'en');
  }

  function onChange(fn) { state.listeners.push(fn); }
  function currentLang() { return state.lang; }

  global.LWSi18n = global.LWSi18n || {
    t: t, apply: apply, setLang: setLang, toggle: toggle, onChange: onChange, lang: currentLang
  };
})(window);
