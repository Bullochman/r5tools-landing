/* feature-poll.js — floating "vote on what's next" widget for paid users.
 *
 * Drop-in usage on any r5tools.io page:
 *   <script src="/feature-poll.js" defer></script>
 *
 * Renders a small floating ballot-box icon in the bottom-left of the
 * viewport. Click opens a modal showing 5 candidate features with
 * 👍/👎 buttons. Votes POST to https://access-codes.r5tools.io/api/feedback/vote
 * (endpoint shipped in commit 7f5ddfb — paid-tier gated).
 *
 * Free-tier or logged-out users see a friendly upgrade prompt instead.
 * Dismissed state persists to localStorage for 30 days.
 */
(function () {
  'use strict';
  if (window.__LWS_FEATURE_POLL_MOUNTED__) return;
  window.__LWS_FEATURE_POLL_MOUNTED__ = true;

  var API_BASE = 'https://access-codes.r5tools.io';
  var DISMISS_KEY = 'lws_feature_poll_dismissed';
  var VOTES_KEY = 'lws_feature_poll_local_votes';

  // ── Candidate features — pulled from the current .session-recovery/ideas/ backlog.
  // Add/remove entries here as the roadmap evolves. Server just records votes
  // by feature_id — leaderboard rendering is data-driven from this list.
  var FEATURES = [
    { id: 'coordination-directory',    label: 'Alliance Coordination Directory',      hint: 'Opt-in R5-to-R5 handshake to find allies in your warzone.' },
    { id: 'alliance-list-extraction',  label: 'Cross-warzone Alliance List OCR',      hint: 'Upload a video of your top-30 warzone alliances → structured DB.' },
    { id: 'realistic-map-render',      label: 'Realistic in-game map render',         hint: 'Replace the abstract dots with actual biome-band terrain + isometric HQs.' },
    { id: 'roster-line-charts',        label: 'Per-member power trend line charts',   hint: 'Track every member\'s power growth across snapshots.' },
    { id: 'discord-bot-integration',   label: 'Discord bot — push tool exports',      hint: 'One-click post of Landing / Hive / Timeline PNGs to your alliance channel.' },
    { id: 'multi-timezone-ical',       label: 'Multi-timezone iCal calendar export',  hint: 'Apple / Google / Outlook feeds with your warzone\'s event schedule.' },
    { id: 'alliance-flag-generator',   label: 'Alliance flag PNG generator',          hint: 'Custom banner for Discord / tool headers.' },
  ];

  function dismissedUntil() {
    try { return parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10) || 0; } catch (e) { return 0; }
  }
  function setDismissed(days) {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + days * 86400 * 1000)); } catch (e) {}
  }
  function getLocalVotes() {
    try { return JSON.parse(localStorage.getItem(VOTES_KEY) || '{}'); } catch (e) { return {}; }
  }
  function setLocalVote(featureId, vote) {
    var v = getLocalVotes(); v[featureId] = vote;
    try { localStorage.setItem(VOTES_KEY, JSON.stringify(v)); } catch (e) {}
  }

  function pickLang() {
    try {
      var stored = localStorage.getItem('lang') || localStorage.getItem('lws_lang');
      if (stored === 'kr' || stored === 'ko') return 'kr';
    } catch (e) {}
    var nav = (navigator.language || 'en').toLowerCase();
    return (nav.indexOf('ko') === 0 || nav.indexOf('kr') === 0) ? 'kr' : 'en';
  }

  var I18N = {
    en: {
      fab: '🗳️ Vote', title: 'Help shape what ships next',
      subtitle: 'Paid-tier perk — your votes prioritize the r5tools.io roadmap.',
      login: 'Sign in as a paid user to vote →',
      free: 'You\'re on the free tier. Upgrade to unlock voting on new features.',
      dismiss: 'Not now',
      done: 'Vote recorded ✓',
    },
    kr: {
      fab: '🗳️ 투표', title: '다음에 나올 기능을 정해주세요',
      subtitle: '유료 회원 전용 — 여러분의 투표가 r5tools.io 로드맵의 우선순위를 결정합니다.',
      login: '유료 회원으로 로그인하여 투표 →',
      free: '무료 등급입니다. 새 기능 투표를 활성화하려면 업그레이드하세요.',
      dismiss: '나중에',
      done: '투표 완료 ✓',
    },
  };
  var lang = pickLang();
  var t = I18N[lang];

  function makeFab() {
    if (Date.now() < dismissedUntil()) return;
    var fab = document.createElement('button');
    fab.id = 'lws-poll-fab';
    fab.textContent = t.fab;
    fab.style.cssText = [
      'position:fixed', 'bottom:20px', 'left:20px', 'z-index:9997',
      'background:linear-gradient(135deg,rgba(201,169,97,0.95),rgba(201,169,97,0.75))',
      'color:#0a0e1a', 'border:1px solid rgba(201,169,97,0.7)',
      'border-radius:22px', 'padding:9px 16px', 'font-size:12px',
      'font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans KR",sans-serif',
      'font-weight:700', 'letter-spacing:0.03em', 'cursor:pointer',
      'box-shadow:0 6px 18px rgba(0,0,0,0.35)', 'transition:transform 0.12s',
    ].join(';');
    fab.addEventListener('mouseenter', function () { fab.style.transform = 'translateY(-2px)'; });
    fab.addEventListener('mouseleave', function () { fab.style.transform = 'translateY(0)'; });
    fab.addEventListener('click', openModal);
    document.body.appendChild(fab);
  }

  function openModal() {
    var overlay = document.createElement('div');
    overlay.id = 'lws-poll-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(4,7,15,0.72);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans KR",sans-serif';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:#0d1424;border:1px solid rgba(201,169,97,0.35);border-radius:10px;padding:22px 24px;width:calc(100% - 32px);max-width:520px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.6);color:#e6e8ee';

    var title = document.createElement('h3');
    title.textContent = t.title;
    title.style.cssText = 'margin:0 0 4px;font-size:16px;font-weight:600;color:#c9a961;letter-spacing:0.02em';
    modal.appendChild(title);
    var sub = document.createElement('p');
    sub.textContent = t.subtitle;
    sub.style.cssText = 'margin:0 0 16px;font-size:12px;color:#7a8290;line-height:1.5';
    modal.appendChild(sub);

    var list = document.createElement('div');
    var localVotes = getLocalVotes();
    FEATURES.forEach(function (f) {
      var row = document.createElement('div');
      row.style.cssText = 'padding:10px 0;border-top:1px solid #1a2436;display:flex;align-items:flex-start;gap:12px';

      var body = document.createElement('div');
      body.style.cssText = 'flex:1';
      body.innerHTML = '<div style="color:#e6e8ee;font-size:13.5px;font-weight:600;margin-bottom:2px">' + f.label + '</div>' +
                       '<div style="color:#7a8290;font-size:12px;line-height:1.45">' + f.hint + '</div>';

      var actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:4px;flex-shrink:0';
      function mkVoteBtn(vote, glyph) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = glyph;
        var isActive = localVotes[f.id] === vote;
        b.style.cssText = 'width:36px;height:32px;background:' + (isActive ? 'rgba(201,169,97,0.25)' : 'transparent') + ';color:' + (isActive ? '#c9a961' : '#a8b0c0') + ';border:1px solid ' + (isActive ? 'rgba(201,169,97,0.55)' : '#2a3444') + ';border-radius:5px;font-size:15px;cursor:pointer;transition:background 0.1s';
        b.addEventListener('click', function () { submitVote(f.id, vote, b, actions, row); });
        return b;
      }
      actions.appendChild(mkVoteBtn(1,  '👍'));
      actions.appendChild(mkVoteBtn(-1, '👎'));

      row.appendChild(body);
      row.appendChild(actions);
      list.appendChild(row);
    });
    modal.appendChild(list);

    var footer = document.createElement('div');
    footer.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:14px;border-top:1px solid #1a2436';
    var dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.textContent = t.dismiss;
    dismissBtn.style.cssText = 'padding:7px 12px;background:transparent;color:#7a8290;border:1px solid #2a3444;border-radius:5px;font-family:inherit;font-size:12px;cursor:pointer';
    dismissBtn.addEventListener('click', function () { setDismissed(30); close(); var fab = document.getElementById('lws-poll-fab'); if (fab) fab.remove(); });
    footer.appendChild(dismissBtn);
    var msg = document.createElement('div');
    msg.id = 'lws-poll-msg';
    msg.style.cssText = 'font-size:11.5px;color:#7a8290';
    footer.appendChild(msg);
    modal.appendChild(footer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    function onKey(e) { if (e.key === 'Escape') close(); }
    function close() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); document.removeEventListener('keydown', onKey); }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);
  }

  function submitVote(featureId, vote, clickedBtn, actions, row) {
    var msg = document.getElementById('lws-poll-msg');
    if (msg) msg.textContent = '...';
    fetch(API_BASE + '/api/feedback/vote', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature_id: featureId, vote: vote }),
    }).then(function (r) { return r.json().then(function (d) { return { status: r.status, body: d }; }); })
      .then(function (resp) {
        if (resp.status === 403) {
          if (msg) msg.innerHTML = '<span style="color:#e0c080">' + t.free + ' <a href="https://r5tools.io/#pricing" style="color:#c9a961">Upgrade</a></span>';
        } else if (resp.status === 401) {
          if (msg) msg.innerHTML = '<span style="color:#e0c080">' + t.login + '</span>';
        } else if (resp.body && resp.body.ok) {
          setLocalVote(featureId, vote);
          // Repaint the row's buttons to reflect new state
          Array.prototype.forEach.call(actions.querySelectorAll('button'), function (b) {
            b.style.background = 'transparent'; b.style.color = '#a8b0c0'; b.style.border = '1px solid #2a3444';
          });
          clickedBtn.style.background = 'rgba(201,169,97,0.25)';
          clickedBtn.style.color = '#c9a961';
          clickedBtn.style.border = '1px solid rgba(201,169,97,0.55)';
          if (msg) msg.innerHTML = '<span style="color:#8ae0a3">' + t.done + '</span>';
        } else {
          if (msg) msg.innerHTML = '<span style="color:#e08a8a">Error</span>';
        }
      })
      .catch(function () { if (msg) msg.innerHTML = '<span style="color:#e08a8a">Network error</span>'; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', makeFab, { once: true });
  } else {
    makeFab();
  }
})();
