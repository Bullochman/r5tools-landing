// LWS Wave Attack Coordinator — i18n dictionary + runtime.
// Formal 존댓말 register throughout.

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
      navTrain: 'Train',
      navCity: 'City',
      navTimeline: 'Timeline',
      navHive: 'Hive',
      betaFeedbackPill: '🚧 BETA · Feedback',

      // Footer
      footerHome: 'r5tools.io',
      footerCred: 'Synchronized wave attacks for LWS alliances',

      // Titles
      title: 'Wave Attack Coordinator',
      createBadge: 'CREATE',
      joinBadge: 'JOIN',

      // CREATE mode
      createLede: "Set the impact time. Share the link. Every member enters their personal march time and gets their own click-send countdown. All marches converge on the target at the same second.",
      waveNameLabel: 'Wave name',
      impactTimeLabel: 'Target impact time (when marches LAND)',
      serverTimeToggle: 'Interpret as LWS server time (UTC) instead of my local time',
      sequenceLabel: 'Wave sequence (optional)',
      sequenceOf: 'of',
      notesLabel: 'Notes (optional)',
      generateBtn: 'Generate Wave URL',
      copyBtn: '📋 Copy',
      shareBtn: '📤 Share',
      previewBtn: 'Preview joiner view →',
      copiedMsg: 'Copied to clipboard',
      shareTextPrefix: 'Wave attack — sync your march send:',

      // JOIN mode
      impactAt: 'Impact at',
      marchTimeLabel: 'Your march time (seconds — from tap-send to army-arrives)',
      saveBtn: 'Save',
      marchHint: 'Check in-game rally screen. Persists on this device.',
      sendLabel: 'Send YOUR march at',
      cueHint: 'Audio + vibration cues at',
      enableAudio: '🔊 Enable audio',
      deviceOffsetLabel: 'Device:',
      deviceSyncing: 'syncing…',
      deviceOffsetMs: '{sign}{ms}ms',
      deviceOffsetUnk: 'offset unknown',
      fullscreenBtn: '⛶ Fullscreen',
      editMarchBtn: '✎ Edit march time',
      fireTitle: '🎯 FIRE',
      landsAt: 'Marches land at',
      resetBtn: '↻ Reset',
      newWaveBtn: '＋ Create next wave',
      go: 'GO',
      pastLabel: 'Wave has passed',
      badConfig: 'This wave link is invalid or corrupted.',
    },
    ko: {
      brandSub: 'LWS 도구모음',
      langToggle: 'English',

      suiteNavPart: '이 도구는 ',
      suiteNavToolkit: ' 라스트 워: 서바이벌 얼라이언스 툴킷의 일부입니다 — ',
      navLanding: '착지',
      navHeat: '히트',
      navTrain: '트레인',
      navCity: '도시',
      navTimeline: '타임라인',
      navHive: '벌집',
      betaFeedbackPill: '🚧 베타 · 피드백',

      footerHome: 'r5tools.io',
      footerCred: '얼라이언스 웨이브 공격 동기화',

      title: '웨이브 어택 코디네이터',
      createBadge: '생성',
      joinBadge: '참여',

      createLede: '착지 시각을 정하고 링크를 공유하세요. 각 멤버는 본인의 진군 시간을 입력하면 개인 발송 시각과 카운트다운을 자동으로 안내받습니다. 모든 진군이 같은 초에 목표 지점에 도착합니다.',
      waveNameLabel: '웨이브 이름',
      impactTimeLabel: '착지 시각 (진군이 도착하는 시점)',
      serverTimeToggle: '내 로컬 시간이 아닌 LWS 서버 시간(UTC)으로 해석합니다',
      sequenceLabel: '웨이브 순서 (선택)',
      sequenceOf: '중',
      notesLabel: '메모 (선택)',
      generateBtn: '웨이브 URL 생성',
      copyBtn: '📋 복사',
      shareBtn: '📤 공유',
      previewBtn: '참여자 화면 미리보기 →',
      copiedMsg: '클립보드에 복사되었습니다',
      shareTextPrefix: '웨이브 공격 — 진군 발송 시각을 동기화하세요:',

      impactAt: '착지 시각:',
      marchTimeLabel: '내 진군 시간 (초 — 발송부터 도착까지)',
      saveBtn: '저장',
      marchHint: '게임 내 집결 화면에서 확인하세요. 이 기기에 저장됩니다.',
      sendLabel: '내 발송 시각',
      cueHint: '소리 + 진동 안내 시점:',
      enableAudio: '🔊 소리 켜기',
      deviceOffsetLabel: '내 기기 시각 오차:',
      deviceSyncing: '동기화 중…',
      deviceOffsetMs: '{sign}{ms}ms',
      deviceOffsetUnk: '오차 확인 불가',
      fullscreenBtn: '⛶ 전체화면',
      editMarchBtn: '✎ 진군 시간 수정',
      fireTitle: '🎯 발사!',
      landsAt: '진군 착지 시각:',
      resetBtn: '↻ 초기화',
      newWaveBtn: '＋ 다음 웨이브 만들기',
      go: '발사!',
      pastLabel: '이미 지난 웨이브입니다',
      badConfig: '이 웨이브 링크는 유효하지 않거나 손상되었습니다.',
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
