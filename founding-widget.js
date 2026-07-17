/* founding-widget.js — floating scarcity badge for r5tools.io.
 *
 * Fetches /api/founding-count on page load and renders a small floating pill
 * (bottom-right on desktop, tap-to-open button on mobile) that shows how
 * many of the first 100 founding-tier alliance slots have been claimed.
 *
 * Auto-mount: script tag with `defer` calls init() on DOMContentLoaded.
 * Idempotent: window.__R5T_FOUNDING_MOUNTED__ guards duplicate mounts.
 *
 * Fires analytics events (if window.r5t.track exists):
 *   - founding_widget_view   (fired once per page when pill first renders)
 *   - founding_widget_click  (fired when user clicks the CTA link)
 *
 * Locale switching: chooses LOCALES.ko if <html lang="ko"> or the KR path
 * prefix (/ko/) is present; else LOCALES.en.
 *
 * Size budget: gzipped payload < 5 KB. All CSS injected via a single
 * <style> tag; no external assets. Runs fully after DOMContentLoaded so it
 * cannot block first paint (script uses `defer`).
 */
(function () {
  'use strict';
  if (window.__R5T_FOUNDING_MOUNTED__) return;
  window.__R5T_FOUNDING_MOUNTED__ = true;

  var API_URL = 'https://access-codes.r5tools.io/api/founding-count';
  // Local dev override — if the page is served from localhost, prefer the local server.
  if (/^(localhost|127\.0\.0\.1)/.test(location.hostname)) {
    API_URL = (location.protocol + '//' + location.hostname + ':8080/api/founding-count');
  }
  var UNLOCK_URL = 'https://access-codes.r5tools.io/unlock';
  var WAITLIST_URL = '/waitlist.html';

  var LOCALES = {
    en: {
      pill:     '🔥 {claimed} / {cap} alliances have claimed Founding pricing',
      pillLow:  'Only {remaining} Founding slots left',
      closed:   'Founding closed — waitlist open',
      claim:    'Claim yours',
      waitlist: 'Join waitlist',
      hide:     'Hide',
      openBtn:  '🔥 Founding',
      first:    '0 / {cap} — be the first to claim Founding',
    },
    ko: {
      pill:     '🔥 {cap}개 얼라이언스 중 {claimed}개가 파운딩 가격을 잠금 해제했습니다',
      pillLow:  '파운딩 슬롯 {remaining}개만 남았습니다',
      closed:   '파운딩 마감 — 대기자 명단 오픈',
      claim:    '지금 잠금 해제',
      waitlist: '대기자 등록',
      hide:     '닫기',
      openBtn:  '🔥 파운딩',
      first:    '0 / {cap} — 첫 번째 파운딩 얼라이언스가 되세요',
    },
  };

  function pickLang() {
    try {
      var docLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
      if (docLang.indexOf('ko') === 0 || docLang.indexOf('kr') === 0) return 'ko';
      if (location.pathname.indexOf('/ko/') === 0) return 'ko';
      var stored = localStorage.getItem('lang') || localStorage.getItem('lws_lang') || localStorage.getItem('r5tools_lang');
      if (stored === 'ko' || stored === 'kr') return 'ko';
    } catch (e) {}
    var nav = (navigator.language || 'en').toLowerCase();
    return (nav.indexOf('ko') === 0 || nav.indexOf('kr') === 0) ? 'ko' : 'en';
  }

  function fmt(template, vars) {
    return template.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
  }

  function track(name, props) {
    try { if (window.r5t && typeof window.r5t.track === 'function') window.r5t.track(name, props || {}); } catch (e) {}
  }

  function injectStyles() {
    if (document.getElementById('r5t-founding-styles')) return;
    var css = [
      '.r5t-founding{position:fixed;right:16px;bottom:16px;z-index:9998;',
      'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.35;}',
      '.r5t-founding-pill{background:#0d1424;border:1px solid rgba(201,169,97,0.42);',
      'color:#e6e8ee;border-radius:999px;padding:9px 14px;font-size:12.5px;',
      'box-shadow:0 6px 18px rgba(0,0,0,0.35);display:flex;align-items:center;gap:10px;',
      'max-width:340px;backdrop-filter:blur(6px);}',
      '.r5t-founding-pill.low{border-color:rgba(229,106,106,0.55);color:#ffbfbf;}',
      '.r5t-founding-pill.closed{border-color:rgba(122,130,144,0.4);color:#a8b0c0;}',
      '.r5t-founding-num{font-weight:700;color:#c9a961;font-variant-numeric:tabular-nums;}',
      '.r5t-founding-pill.low .r5t-founding-num{color:#ff9970;}',
      '.r5t-founding-cta{color:#c9a961;text-decoration:none;font-weight:600;',
      'border-left:1px solid rgba(255,255,255,0.1);padding-left:10px;white-space:nowrap;}',
      '.r5t-founding-cta:hover{color:#d9b871;}',
      '.r5t-founding-pill.low .r5t-founding-cta{color:#ff9970;}',
      '.r5t-founding-pill.low .r5t-founding-cta:hover{color:#ffb499;}',
      '.r5t-founding-close{background:none;border:0;color:#7a8290;cursor:pointer;',
      'font-size:14px;line-height:1;padding:0 0 0 4px;}',
      '.r5t-founding-close:hover{color:#e6e8ee;}',
      '.r5t-founding-open{position:fixed;right:14px;bottom:14px;z-index:9998;',
      'background:#0d1424;border:1px solid rgba(201,169,97,0.42);color:#c9a961;',
      'border-radius:999px;padding:8px 12px;font-size:12px;font-weight:600;',
      'cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.35);}',
      '.r5t-founding-open:hover{color:#d9b871;}',
      '@media (max-width:640px){.r5t-founding{display:none;}}',
      '@media (min-width:641px){.r5t-founding-open{display:none;}}',
      '.r5t-founding-pill.mobile-open{position:fixed;left:12px;right:12px;bottom:12px;max-width:none;}',
    ].join('');
    var s = document.createElement('style');
    s.id = 'r5t-founding-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function countUp(el, from, to, ms) {
    from = from | 0; to = to | 0; ms = ms || 900;
    if (from === to) { el.textContent = String(to); return; }
    var start = performance.now();
    function step(t) {
      var p = Math.min(1, (t - start) / ms);
      // Ease-out cubic.
      p = 1 - Math.pow(1 - p, 3);
      var v = Math.round(from + (to - from) * p);
      el.textContent = String(v);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function render(data) {
    injectStyles();
    var lang = pickLang();
    var t = LOCALES[lang] || LOCALES.en;
    var claimed = data.claimed | 0;
    var cap = data.cap | 0 || 100;
    var remaining = data.remaining != null ? (data.remaining | 0) : Math.max(0, cap - claimed);
    var closed = !!data.closed;
    var isLow = !closed && remaining < 20 && remaining > 0;
    var isFirst = claimed === 0 && !closed;

    var host = document.createElement('div');
    host.className = 'r5t-founding';

    var pill = document.createElement('div');
    pill.className = 'r5t-founding-pill' + (isLow ? ' low' : '') + (closed ? ' closed' : '');

    var label = document.createElement('span');
    if (closed) {
      label.textContent = t.closed;
    } else if (isFirst) {
      label.textContent = fmt(t.first, { cap: cap });
    } else if (isLow) {
      // Only N left — use a slot for the animated number.
      var pre = document.createElement('span');
      pre.textContent = t.pillLow.split('{remaining}')[0] || '';
      var num = document.createElement('span');
      num.className = 'r5t-founding-num';
      num.textContent = '0';
      var post = document.createElement('span');
      post.textContent = t.pillLow.split('{remaining}')[1] || '';
      label.appendChild(pre); label.appendChild(num); label.appendChild(post);
      // Animate.
      requestAnimationFrame(function () { countUp(num, 0, remaining); });
    } else {
      // Standard pill with animated claimed count.
      var partsA = t.pill.split('{claimed}');
      var preA = document.createElement('span'); preA.textContent = partsA[0];
      var numA = document.createElement('span');
      numA.className = 'r5t-founding-num';
      numA.textContent = '0';
      var restStr = (partsA[1] || '').replace('{cap}', String(cap));
      var postA = document.createElement('span'); postA.textContent = restStr;
      label.appendChild(preA); label.appendChild(numA); label.appendChild(postA);
      requestAnimationFrame(function () { countUp(numA, 0, claimed); });
    }
    pill.appendChild(label);

    // CTA
    var cta = document.createElement('a');
    cta.className = 'r5t-founding-cta';
    if (closed) {
      cta.href = WAITLIST_URL;
      cta.textContent = t.waitlist;
    } else {
      cta.href = UNLOCK_URL;
      cta.textContent = t.claim;
    }
    cta.addEventListener('click', function () {
      track('founding_widget_click', {
        claimed: claimed, cap: cap, remaining: remaining, closed: closed, target: cta.href,
      });
    });
    pill.appendChild(cta);

    // Close button
    var close = document.createElement('button');
    close.className = 'r5t-founding-close';
    close.setAttribute('aria-label', t.hide);
    close.textContent = '×';
    close.addEventListener('click', function () {
      try { sessionStorage.setItem('r5t_founding_hidden', '1'); } catch (e) {}
      host.style.display = 'none';
      if (openBtn) openBtn.style.display = '';
    });
    pill.appendChild(close);

    host.appendChild(pill);
    document.body.appendChild(host);

    // Mobile open button (hidden on desktop via CSS)
    var openBtn = document.createElement('button');
    openBtn.className = 'r5t-founding-open';
    openBtn.type = 'button';
    openBtn.textContent = t.openBtn;
    openBtn.addEventListener('click', function () {
      pill.classList.toggle('mobile-open');
      if (host.style.display === 'none') host.style.display = '';
      host.style.display = 'block';
    });
    document.body.appendChild(openBtn);

    // Fire view event once.
    track('founding_widget_view', {
      claimed: claimed, cap: cap, remaining: remaining, closed: closed,
    });
  }

  function init() {
    // Honor per-session dismissal.
    try { if (sessionStorage.getItem('r5t_founding_hidden') === '1') return; } catch (e) {}
    fetch(API_URL, { credentials: 'omit', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || typeof data.claimed !== 'number') return;
        render(data);
      })
      .catch(function () { /* silent — non-critical widget */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
