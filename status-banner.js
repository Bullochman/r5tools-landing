/* status-banner.js — site-wide honest status notice.
 *
 * 2026-11-05: LW Atlas (r5tools' upstream live-data source) took their public
 * API offline, so the tools can only show older cached data until we restore a
 * feed. Rather than pretend everything's live, we tell users the truth and the
 * plan (r5tools is building its own data collection). Remove this <script>
 * include (or set window.R5_STATUS_OFF = true before it) once live data is back.
 */
(function () {
  if (window.R5_STATUS_OFF) return;
  try { if (sessionStorage.getItem('r5_status_dismissed') === '2026-11-05') return; } catch (e) {}

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
    '🛠️ <b>Live data temporarily paused.</b> Our upstream map-data source ' +
    '(LW Atlas) took its public API offline, so the tools may show older numbers ' +
    'for now. We’re building <b>r5tools’ own data collection</b> so the ' +
    'intel comes back stronger — and never depends on one source again. ' +
    'Thanks for your patience. — Evan' +
    '<button class="x" aria-label="Dismiss">×</button>';

  function mount() {
    if (document.querySelector('.r5status')) return;
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector('.x').onclick = function () {
      try { sessionStorage.setItem('r5_status_dismissed', '2026-11-05'); } catch (e) {}
      bar.remove();
    };
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
