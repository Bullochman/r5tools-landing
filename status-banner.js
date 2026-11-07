/* status-banner.js — site-wide honest status notice.
 *
 * 2026-11-05: LW Atlas (r5tools' upstream live-data source) took their public
 * API offline (Oct 30), so the data tools can only show their last-known
 * (cached) values until we restore a feed. Rather than pretend everything's
 * live, we tell users the truth and the plan (r5tools is building its own data
 * collection).
 *
 * 2026-11-07: sharpened the copy (numbers are FROZEN at ~Oct 30, not just
 * "delayed"), bumped the dismissal key so the refreshed notice re-shows.
 *
 * Turn OFF when live data is back: remove this <script> include, or set
 * window.R5_STATUS_OFF = true before it loads.
 */
(function () {
  if (window.R5_STATUS_OFF) return;
  // Skip inside the dashboard iframes — the dashboard shows it once at the top.
  try { if (window.self !== window.top) return; } catch (e) {}
  var KEY = '2026-11-07'; // bump to re-show after dismissals
  try { if (sessionStorage.getItem('r5_status_dismissed') === KEY) return; } catch (e) {}

  var css = document.createElement('style');
  css.textContent = [
    '.r5status{position:relative;z-index:9999;background:linear-gradient(90deg,#3a2a12,#241a0c);',
    'border-bottom:1px solid #5a4420;color:#f0e2c4;font-family:-apple-system,"Segoe UI",Roboto,sans-serif;',
    'font-size:14px;line-height:1.5;padding:12px 44px 12px 18px;text-align:center}',
    '.r5status b{color:#f0d98a}',
    '.r5status a{color:#e6cf7a;text-decoration:underline}',
    '.r5status .x{position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;',
    'color:#c9b78a;font-size:20px;line-height:1;padding:4px;background:none;border:none}',
    '@media(max-width:640px){.r5status{font-size:13px;padding:11px 40px 11px 14px}}'
  ].join('');
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.className = 'r5status';
  bar.innerHTML =
    '🛠️ <b>Live intel is temporarily paused.</b> Our upstream data source ' +
    '(LW Atlas) shut down its public API on <b>Oct 30</b>, so power trends, ' +
    'rosters and map numbers are showing their <b>last-known values (~Oct 30)</b> ' +
    '— not live. We’re building <b>r5tools’ own data collection</b> so the intel ' +
    'comes back fresher than ever and never rides on one source again. ' +
    'Thanks for your patience. — Evan' +
    '<button class="x" aria-label="Dismiss">×</button>';

  function mount() {
    if (document.querySelector('.r5status')) return;
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector('.x').onclick = function () {
      try { sessionStorage.setItem('r5_status_dismissed', KEY); } catch (e) {}
      bar.remove();
    };
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
