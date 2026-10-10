/* upsell.js — smart paywall upsell for r5tools.
 *
 * Call r5Upsell(containerEl, warzone) from a tool's 403/locked handler. It
 * figures out WHY the user is locked and shows the right pitch:
 *   - has a free code for a DIFFERENT warzone  -> "unlock ANY warzone for $10"
 *     (this is the money moment: they're trying to scout/transfer/KvK off their
 *      home server, which is exactly what the paid tier is for)
 *   - no code at all -> redeem / free-for-your-warzone / $10 any-warzone
 * Self-contained styling so it drops into any tool page.
 */
(function () {
  var API = 'https://access-codes.r5tools.io';
  var BUY_PERSONAL = 'https://buy.stripe.com/3cI8wO8g13vf0DY39A6c001';   // $10 one-time, unlock any warzone
  var BUY_FOUNDING = 'https://buy.stripe.com/7sY3cubsdd5PgCW8tU6c002';   // $30 one-time, whole alliance (founding)
  var UNLOCK = 'https://access-codes.r5tools.io/unlock';

  function code() {
    try {
      var u = new URLSearchParams(location.search).get('code'); if (u) return u;
      if (window.LWSAccessCodes && LWSAccessCodes.code && LWSAccessCodes.code()) return LWSAccessCodes.code();
      return localStorage.getItem('lws_unlock_code') || '';
    } catch (e) { return ''; }
  }
  function esc(s){ var d=document.createElement('div'); d.textContent=(s==null?'':s); return d.innerHTML; }

  function css() {
    if (document.getElementById('r5up-css')) return;
    var s = document.createElement('style'); s.id = 'r5up-css';
    s.textContent = [
      '.r5up{max-width:520px;margin:18px auto;background:linear-gradient(180deg,#101a2e,#0d1424);border:1px solid #2a3654;border-radius:16px;padding:26px 24px;text-align:center;font-family:-apple-system,"Segoe UI",Roboto,sans-serif;color:#e7ecf5}',
      '.r5up .lock{font-size:34px;line-height:1}',
      '.r5up h3{font-size:20px;font-weight:800;margin:10px 0 6px;color:#e6cf7a}',
      '.r5up p{font-size:14px;color:#aab4c8;margin:0 0 6px;line-height:1.55}',
      '.r5up .wz{color:#e7ecf5;font-weight:700}',
      '.r5up ul{text-align:left;max-width:360px;margin:12px auto 16px;padding:0;list-style:none;font-size:13.5px;color:#aab4c8}',
      '.r5up li{margin:5px 0;padding-left:22px;position:relative}',
      '.r5up li:before{content:"→";position:absolute;left:0;color:#8ae0a3}',
      '.r5up .cta{display:inline-block;background:#c9a961;color:#1a1205;font-weight:800;font-size:15px;text-decoration:none;border-radius:10px;padding:12px 22px;margin:4px}',
      '.r5up .cta.ghost{background:transparent;color:#aab4c8;border:1px solid #2a3654;font-weight:600;font-size:13px;padding:10px 16px}',
      '.r5up .fine{font-size:12px;color:#68748e;margin-top:12px}',
      '.r5up .alt{font-size:12.5px;color:#8b96ab;margin-top:14px}',
      '.r5up .alt a{color:#c9a961}'
    ].join('');
    document.head.appendChild(s);
  }

  window.r5Upsell = function (container, warzone) {
    if (!container) return;
    css();
    var wz = warzone || (new URLSearchParams(location.search).get('warzone')) || 'this warzone';
    var c = code();

    function wrongWarzone(codeWz) {
      container.innerHTML =
        '<div class="r5up">' +
          '<div class="lock">🔒</div>' +
          '<h3>Your code only covers Warzone ' + esc(codeWz) + '</h3>' +
          '<p>You’re looking at <span class="wz">Warzone ' + esc(wz) + '</span>. Unlock <b>any</b> warzone for a one-time <b>$10</b> and this—plus every intel tool—works on every server:</p>' +
          '<ul>' +
            '<li>Scout a transfer target before you move</li>' +
            '<li>Track KvK / cross-server rivals’ rosters &amp; movements</li>' +
            '<li>Find free agents &amp; recruit anywhere</li>' +
            '<li>Run the Power Audit &amp; War-Buildup on any warzone</li>' +
          '</ul>' +
          '<a class="cta" href="' + BUY_PERSONAL + '" target="_top">Unlock any warzone — $10 →</a>' +
          '<div class="alt">Leading an alliance? <a href="' + BUY_FOUNDING + '" target="_top">Get the whole suite for your alliance ($30 one-time)</a></div>' +
          '<div class="fine">One-time payment, no subscription. Your code still works on Warzone ' + esc(codeWz) + ' for free.</div>' +
        '</div>';
    }
    function noCode() {
      container.innerHTML =
        '<div class="r5up">' +
          '<div class="lock">🔒</div>' +
          '<h3>Unlock the intel tools</h3>' +
          '<p><span class="wz">Free for your own warzone</span> — ask your R5 for the alliance code. Want <b>any</b> warzone (to scout transfers, KvK rivals, recruiting)? Unlock everything for a one-time <b>$10</b>.</p>' +
          '<a class="cta" href="' + BUY_PERSONAL + '" target="_top">Unlock any warzone — $10 →</a>' +
          '<a class="cta ghost" href="' + UNLOCK + '" target="_top">I have a code</a>' +
          '<div class="alt">R5s: <a href="' + BUY_FOUNDING + '" target="_top">unlock the whole suite for your alliance ($30)</a></div>' +
        '</div>';
    }
    function generic() {
      container.innerHTML =
        '<div class="r5up"><div class="lock">🔒</div><h3>Unlock to view this</h3>' +
        '<p>Redeem your access code to see this warzone’s intel.</p>' +
        '<a class="cta" href="' + UNLOCK + '" target="_top">Unlock →</a>' +
        '<a class="cta ghost" href="' + BUY_PERSONAL + '" target="_top">Unlock any warzone — $10</a></div>';
    }

    if (!c) { noCode(); return; }
    // We have a code but got locked — find out which warzone it covers.
    fetch(API + '/api/code-info?code=' + encodeURIComponent(c), { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.valid && !d.all_warzones && d.warzone != null && String(d.warzone) !== String(wz)) {
          wrongWarzone(d.warzone);
        } else { generic(); }
      })
      .catch(function () { generic(); });
  };

  // Auto-upgrade: every tool's 403 handler drops a <div class="locked">. Watch
  // for one and replace it with the smart upsell — so a single <script> include
  // per page turns the dull "redeem a code" wall into the $10-any-warzone pitch,
  // no per-page handler surgery.
  function pageWz() {
    try {
      return new URLSearchParams(location.search).get('warzone')
        || localStorage.getItem('lws_my_warzone') || '';
    } catch (e) { return ''; }
  }
  function upgrade(el) {
    if (!el || el.getAttribute('data-r5up') === '1') return;
    el.setAttribute('data-r5up', '1');
    window.r5Upsell(el, pageWz());
  }
  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.classList && root.classList.contains('locked')) { upgrade(root); return; }
    (root.querySelectorAll ? root.querySelectorAll('.locked') : []).forEach(upgrade);
  }
  function init() {
    scan(document.body);
    try {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) { m.addedNodes && m.addedNodes.forEach && m.addedNodes.forEach(scan); });
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
