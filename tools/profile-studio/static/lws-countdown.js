/* LWS Countdown Banner — shared across r5tools.io suite
 * Renders a slim horizontal strip above the suite-nav with a T-N countdown
 * to the next Season 2 milestone (extracted from LWSSeasons if available,
 * otherwise hardcoded fallback). Auto-updates every 60s.
 *
 * Auto-mount: script tag with `defer` will call init() on DOMContentLoaded.
 * Inserts the banner as the FIRST child of <body> so it sits above any
 * existing suite-nav strip.
 *
 * Dismissal: X button writes localStorage['lws_countdown_dismissed'] = <ISO-date>.
 * A different upcoming target (new milestone) will bring the banner back.
 */
(function () {
  'use strict';
  if (window.__LWS_COUNTDOWN_MOUNTED__) return;
  window.__LWS_COUNTDOWN_MOUNTED__ = true;

  // ----- Config -----
  var HARDCODED_TARGET = {
    // Season 2 Week 5 Day 3 — RSW Round (Wed+Sat rotation)
    // Fallback / landing target. Also matches user-supplied 2026-07-24 fallback.
    iso: '2026-07-24T00:00:00Z',
    warzone: '2007',
    labels: {
      en: 'S2 WEEK 5 · RARE SOIL WAR ROUND',
      kr: 'S2 5주차 · 희귀토양 전쟁 라운드'
    }
  };

  var UI = {
    en: { dismiss: 'Dismiss', days: 'DAYS', hours: 'HRS', mins: 'MIN', now: 'LIVE NOW', warzone: 'WARZONE' },
    kr: { dismiss: '닫기',   days: '일',   hours: '시간', mins: '분',  now: '진행 중', warzone: '워존' }
  };

  // ----- Utilities -----
  function pickLang() {
    try {
      var stored = localStorage.getItem('lang') || localStorage.getItem('lws_lang') || localStorage.getItem('r5tools_lang');
      if (stored === 'kr' || stored === 'ko') return 'kr';
      if (stored === 'en') return 'en';
    } catch (e) {}
    var nav = (navigator.language || 'en').toLowerCase();
    return (nav.indexOf('ko') === 0 || nav.indexOf('kr') === 0) ? 'kr' : 'en';
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function fmtCountdown(msLeft, lang) {
    var t = UI[lang];
    if (msLeft <= 0) return '⏳ ' + t.now;
    var secs = Math.floor(msLeft / 1000);
    var days = Math.floor(secs / 86400);
    var hrs  = Math.floor((secs % 86400) / 3600);
    var mins = Math.floor((secs % 3600) / 60);
    if (days >= 2) return '⏳ T-' + days + ' ' + t.days;
    if (days >= 1) return '⏳ T-1 ' + t.days + ' ' + pad2(hrs) + ':' + pad2(mins);
    return '⏳ T-' + pad2(hrs) + ':' + pad2(mins);
  }

  // ----- Target resolution -----
  function resolveTarget() {
    // Prefer LWSSeasons if present + resolved to S2, else hardcoded.
    try {
      if (window.LWSSeasons && typeof window.LWSSeasons.resolve === 'function') {
        var ctx = window.LWSSeasons.resolve();
        if (ctx && ctx.season && ctx.season.id === 's2-polar-storm' && ctx.season.start_date) {
          var start = new Date(ctx.season.start_date + 'T00:00:00Z');
          var milestones = (ctx.season.milestones || []).slice().sort(function (a, b) {
            var ax = (a.week - 1) * 7 + (a.day - 1);
            var bx = (b.week - 1) * 7 + (b.day - 1);
            return ax - bx;
          });
          var nowMs = Date.now();
          for (var i = 0; i < milestones.length; i++) {
            var m = milestones[i];
            var mDate = new Date(start.getTime() + ((m.week - 1) * 7 + (m.day - 1)) * 86400000);
            if (mDate.getTime() > nowMs - 6 * 3600 * 1000) {
              // "current" (started within 6h) still counts as upcoming/live
              var enLabel = (m.label && m.label.en) ? m.label.en : (m.event || 'Next milestone');
              var krLabel = (m.label && m.label.kr) ? m.label.kr : enLabel;
              return {
                iso: mDate.toISOString(),
                warzone: (ctx.warzone && (ctx.warzone.id || ctx.warzone.number)) || HARDCODED_TARGET.warzone,
                labels: {
                  en: 'S2 W' + m.week + ' · ' + enLabel.toUpperCase(),
                  kr: 'S2 ' + m.week + '주차 · ' + krLabel
                }
              };
            }
          }
        }
      }
    } catch (e) {
      // fall through to hardcoded
    }
    return HARDCODED_TARGET;
  }

  // ----- Rendering -----
  function styleSheet() {
    if (document.getElementById('lws-countdown-style')) return;
    var css = ''
      + '#lws-countdown-banner{'
      +   'display:flex;align-items:center;justify-content:center;gap:14px;'
      +   'width:100%;box-sizing:border-box;padding:6px 44px 6px 16px;'
      +   'background:#0a0e1a;color:#c9a961;'
      +   'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;'
      +   'font-size:11px;letter-spacing:.06em;text-transform:uppercase;'
      +   'border-bottom:1px solid rgba(201,161,97,.18);position:relative;z-index:900;'
      +   'line-height:1.4;text-align:center;'
      + '}'
      + '#lws-countdown-banner .lws-cd-t{color:#f4d68a;font-weight:600;}'
      + '#lws-countdown-banner .lws-cd-sep{opacity:.45;padding:0 2px;}'
      + '#lws-countdown-banner .lws-cd-wz{opacity:.7;}'
      + '#lws-countdown-banner .lws-cd-dismiss{'
      +   'position:absolute;top:50%;right:10px;transform:translateY(-50%);'
      +   'background:transparent;border:0;color:#c9a961;opacity:.55;cursor:pointer;'
      +   'font-size:14px;line-height:1;padding:4px 8px;border-radius:3px;'
      + '}'
      + '#lws-countdown-banner .lws-cd-dismiss:hover{opacity:1;background:rgba(201,161,97,.1);}'
      + '@media (max-width:520px){'
      +   '#lws-countdown-banner{font-size:10px;gap:8px;padding:6px 36px 6px 10px;}'
      +   '#lws-countdown-banner .lws-cd-wz{display:none;}'
      + '}';
    var el = document.createElement('style');
    el.id = 'lws-countdown-style';
    el.textContent = css;
    document.head.appendChild(el);
  }

  function build() {
    styleSheet();
    var target = resolveTarget();

    // Skip if dismissed for THIS target.
    try {
      var dismissed = localStorage.getItem('lws_countdown_dismissed');
      if (dismissed && dismissed === target.iso) return null;
    } catch (e) {}

    var banner = document.createElement('div');
    banner.id = 'lws-countdown-banner';
    banner.setAttribute('data-target', target.iso);

    var lang = pickLang();
    var tStrings = UI[lang];

    var t = document.createElement('span');
    t.className = 'lws-cd-t';
    banner.appendChild(t);

    var sep1 = document.createElement('span');
    sep1.className = 'lws-cd-sep';
    sep1.textContent = '·';
    banner.appendChild(sep1);

    var label = document.createElement('span');
    label.className = 'lws-cd-label';
    label.textContent = target.labels[lang] || target.labels.en;
    banner.appendChild(label);

    var sep2 = document.createElement('span');
    sep2.className = 'lws-cd-sep';
    sep2.textContent = '·';
    banner.appendChild(sep2);

    var wz = document.createElement('span');
    wz.className = 'lws-cd-wz';
    wz.textContent = tStrings.warzone + ' ' + target.warzone;
    banner.appendChild(wz);

    var btn = document.createElement('button');
    btn.className = 'lws-cd-dismiss';
    btn.type = 'button';
    btn.setAttribute('aria-label', tStrings.dismiss);
    btn.title = tStrings.dismiss;
    btn.textContent = '×';
    btn.addEventListener('click', function () {
      try { localStorage.setItem('lws_countdown_dismissed', target.iso); } catch (e) {}
      if (banner.parentNode) banner.parentNode.removeChild(banner);
      if (window.__lws_cd_timer) clearInterval(window.__lws_cd_timer);
    });
    banner.appendChild(btn);

    function tick() {
      var msLeft = new Date(target.iso).getTime() - Date.now();
      t.textContent = fmtCountdown(msLeft, lang);
      // Auto-remove & re-evaluate 6h after milestone passes
      if (msLeft < -6 * 3600 * 1000) {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
        if (window.__lws_cd_timer) clearInterval(window.__lws_cd_timer);
      }
    }
    tick();
    if (window.__lws_cd_timer) clearInterval(window.__lws_cd_timer);
    window.__lws_cd_timer = setInterval(tick, 60000);

    return banner;
  }

  function mount() {
    var banner = build();
    if (!banner) return;
    if (document.body.firstChild) {
      document.body.insertBefore(banner, document.body.firstChild);
    } else {
      document.body.appendChild(banner);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
