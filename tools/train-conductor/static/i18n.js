// LWS Train Conductor Picker — i18n dictionary + runtime.
//
// KR terminology aligned with the LWS suite (formal register: 습니다 / 합니다).
// Every visible string in index.html has a data-i18n attribute — no hardcoded
// English/Korean strings in the DOM.

(function () {
  'use strict';

  var I18N = {
    en: {
      brandSub: 'LWS Suite',
      langToggle: '한국어',

      // Suite nav
      suiteNavPart: 'Part of the ',
      suiteNavToolkit: ' Last War: Survival alliance toolkit — ',
      navLanding: 'Landing',
      navHeat: 'Heat',
      navFreeze: 'Freeze',
      navCoal: 'Coal',
      navCity: 'City',
      navTimeline: 'Timeline',
      navHive: 'Hive',
      navProfile: 'Profile',
      navVsDays: 'VS Days',
      betaFeedbackPill: '🚧 BETA · Feedback',

      // Footer
      footerCred: 'Fair random-pick for alliance trains — LWS Suite',
      footerHome: 'r5tools.io',

      // Page
      title: 'Train Conductor Picker',
      lede: "Alliance trains keep dice-rolling for a conductor without checking who's actually eligible. Load your roster, filter down to who qualifies (rank, HQ level, power, titles, opt-outs), then let the tool fair-random-pick the conductor from that eligible pool. Rotation history is stored locally so nobody gets stuck conducting three trains in a row.",

      // Roster card
      rosterHeading: 'Alliance roster',
      rosterSource: 'Source',
      srcPreset: 'Preset',
      srcPaste: 'Paste CSV',
      srcUpload: 'Upload CSV',
      rosterPreset: 'Preset roster',
      loadBtn: 'Load',
      pasteLabel: 'Paste CSV rows (name,rank,hq_level,power,notes)',
      uploadLabel: 'Upload a CSV file',
      noRoster: 'No roster loaded yet.',
      rosterLoaded: '{n} members loaded from {src}',
      loadFailed: 'Load failed: {err}',

      // Filter card
      filterHeading: 'Eligibility filters',
      filterDesc: 'R5 picks the criteria. The tool only rolls from members that match every filter below.',
      filterRank: 'Rank',
      filterHq: 'Min HQ level',
      filterPower: 'Min total power (millions)',
      filterTitles: 'Titles (any of)',
      titleNone: 'no title',
      filterExclude: 'Manual exclusions (one name per line — opt-outs, shielded, etc.)',
      skipRecent: "Prefer members who haven't conducted recently",
      eligibleCount: '{n} eligible · of {m} total',

      // Roll
      rollBtn: '🎲 Roll the Conductor',
      revealSpinning: 'Rolling…',
      revealWinner: "This train's conductor:",
      backupsLabel: 'Backups:',
      rerollBtn: 'Re-roll',
      confirmBtn: 'Record this conductor',
      copyBtn: 'Copy result',
      copied: 'Copied!',
      confirmed: 'Recorded to history.',
      noEligible: 'No eligible members with current filters. Loosen the criteria.',

      // Audit info
      auditRolledFrom: 'Rolled from {n} eligible members',
      auditFilters: 'Filters: rank {ranks} · HQ {hq}+ · power {power}M+ · {titles}',
      auditTitlesAny: 'any title',
      auditBias: 'Skip-recent bias: {on}',
      auditOn: 'ON',
      auditOff: 'OFF',
      auditTs: 'Rolled at {t}',

      // History
      historyHeading: 'Rotation history',
      historyDesc: "Locally stored on this device — the last conductors picked, most recent first. Used by the \"prefer members who haven't conducted recently\" bias.",
      historyEmpty: 'No conductors recorded yet.',
      historyClear: 'Clear history',
      historyExport: 'Export CSV',
      historyConfirmClear: 'Clear all rotation history?',
      pickIndex: '{n} picks ago',
      pickToday: 'today',
      pickYesterday: 'yesterday',
      pickDaysAgo: '{n}d ago',

      // Titles (well-known)
      title_recruiter: 'recruiter',
      title_butler: 'butler',
      title_muse: 'muse',
      title_cavalry: 'cavalry',
      title_scientist: 'scientist',
      title_farmer: 'farmer',
      title_builder: 'builder',
      title_strategist: 'strategist',
    },

    ko: {
      brandSub: 'LWS 도구 모음',
      langToggle: 'English',

      // Suite nav
      suiteNavPart: '',
      suiteNavToolkit: ' Last War 도구 모음 — ',
      navLanding: '착지',
      navHeat: '온도',
      navFreeze: '결빙',
      navCoal: '석탄',
      navCity: '도시',
      navTimeline: '시즌',
      navHive: '하이브',
      navProfile: '프로필',
      navVsDays: 'VS 데이',
      betaFeedbackPill: '🚧 베타 · 피드백',

      // Footer
      footerCred: '트레인 컨덕터 공정 뽑기 — LWS Suite',
      footerHome: 'r5tools.io',

      // Page
      title: '트레인 컨덕터 뽑기',
      lede: '얼라이언스 트레인은 자격을 확인하지 않고 컨덕터를 주사위로 뽑는 경우가 많습니다. 명단을 불러오고 자격 조건(계급, HQ 레벨, 전투력, 칭호, 제외 대상)으로 필터링한 뒤, 자격을 갖춘 인원 중에서 공정하게 랜덤으로 컨덕터를 뽑습니다. 로테이션 이력은 로컬에 저장되어 같은 사람이 연속으로 컨덕터가 되지 않도록 합니다.',

      // Roster card
      rosterHeading: '얼라이언스 명단',
      rosterSource: '입력 방식',
      srcPreset: '샘플 명단',
      srcPaste: 'CSV 붙여넣기',
      srcUpload: 'CSV 업로드',
      rosterPreset: '샘플 명단',
      loadBtn: '불러오기',
      pasteLabel: 'CSV 행을 붙여넣으세요 (name,rank,hq_level,power,notes)',
      uploadLabel: 'CSV 파일 업로드',
      noRoster: '아직 명단이 없습니다.',
      rosterLoaded: '{src}에서 {n}명 로드됨',
      loadFailed: '불러오기 실패: {err}',

      // Filter card
      filterHeading: '자격 필터',
      filterDesc: 'R5가 조건을 선택합니다. 아래 모든 필터를 만족하는 멤버 중에서만 뽑기가 진행됩니다.',
      filterRank: '계급',
      filterHq: '최소 HQ 레벨',
      filterPower: '최소 전투력 (백만)',
      filterTitles: '칭호 (아무거나)',
      titleNone: '칭호 없음',
      filterExclude: '수동 제외 목록 (한 줄에 이름 하나 — 쉴드 중, 불참자 등)',
      skipRecent: '최근에 컨덕한 멤버 제외',
      eligibleCount: '{n}명 자격 · 총 {m}명 중',

      // Roll
      rollBtn: '🎲 컨덕터 뽑기',
      revealSpinning: '뽑는 중…',
      revealWinner: '이번 트레인의 컨덕터:',
      backupsLabel: '대체 후보:',
      rerollBtn: '다시 뽑기',
      confirmBtn: '이 컨덕터 기록',
      copyBtn: '결과 복사',
      copied: '복사됨!',
      confirmed: '이력에 기록되었습니다.',
      noEligible: '현재 필터로 자격이 있는 멤버가 없습니다. 조건을 완화하세요.',

      // Audit info
      auditRolledFrom: '자격 있는 {n}명 중에서 뽑음',
      auditFilters: '필터: 계급 {ranks} · HQ {hq}+ · 전투력 {power}M+ · {titles}',
      auditTitlesAny: '모든 칭호',
      auditBias: '최근 제외 편향: {on}',
      auditOn: '켜짐',
      auditOff: '꺼짐',
      auditTs: '뽑은 시각: {t}',

      // History
      historyHeading: '로테이션 이력',
      historyDesc: '이 기기에 로컬 저장 — 최근에 뽑힌 컨덕터들, 최신 순. "최근에 컨덕한 멤버 제외" 옵션이 이 이력을 사용합니다.',
      historyEmpty: '아직 기록된 컨덕터가 없습니다.',
      historyClear: '이력 지우기',
      historyExport: 'CSV 내보내기',
      historyConfirmClear: '전체 로테이션 이력을 지우시겠습니까?',
      pickIndex: '{n}번 전',
      pickToday: '오늘',
      pickYesterday: '어제',
      pickDaysAgo: '{n}일 전',

      title_recruiter: '리크루터',
      title_butler: '집사',
      title_muse: '뮤즈',
      title_cavalry: '기병',
      title_scientist: '과학자',
      title_farmer: '농부',
      title_builder: '건축가',
      title_strategist: '전략가',
    },
  };

  function getLang() {
    try {
      var s = localStorage.getItem('lws_lang');
      if (s === 'ko' || s === 'en') return s;
    } catch (e) {}
    return (navigator.language || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  }

  function setLang(lang) {
    try { localStorage.setItem('lws_lang', lang); } catch (e) {}
    apply();
  }

  function t(key, vars) {
    var lang = getLang();
    var s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    if (vars) {
      for (var k in vars) {
        s = s.split('{' + k + '}').join(vars[k]);
      }
    }
    return s;
  }

  function apply() {
    var lang = getLang();
    document.documentElement.lang = lang;
    var nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach(function (n) {
      var key = n.getAttribute('data-i18n');
      n.textContent = t(key);
    });
    var phs = document.querySelectorAll('[data-i18n-placeholder]');
    phs.forEach(function (n) {
      var key = n.getAttribute('data-i18n-placeholder');
      n.setAttribute('placeholder', t(key));
    });
    // Fire custom event so page JS can re-render dynamic strings.
    try { window.dispatchEvent(new CustomEvent('lws:lang-changed', { detail: { lang: lang } })); } catch (e) {}
  }

  window.LWS_I18N = { t: t, getLang: getLang, setLang: setLang, apply: apply };

  document.addEventListener('DOMContentLoaded', function () {
    apply();
    var toggle = document.getElementById('langToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        setLang(getLang() === 'ko' ? 'en' : 'ko');
      });
    }
  });
})();
