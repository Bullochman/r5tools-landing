/**
 * LWS Track — tiny fire-and-forget client for the r5tools.io suite analytics firehose.
 *
 * Include this once per page:
 *   <script src="/static/lws-track.js"></script>
 *
 * Then call:
 *   LWSTrack.event('roster_extracted', 'roster', { member_count: 94 });
 *
 * That POSTs to https://access-codes.r5tools.io/api/track with credentials:'omit'
 * so no session cookie is attached — this is anonymous product analytics, not auth.
 *
 * On the tool's first page-load the helper auto-fires a "page_view" event with the
 * tool name derived from location.host (roster.r5tools.io -> "roster",
 * bullochman.github.io/lws-hive-static/ -> "hive"). Set window.LWS_TRACK_TOOL_NAME
 * before this script loads to override.
 *
 * All calls are fire-and-forget — network failures are swallowed and never surface
 * to the UI. The library adds ~2 KB uncompressed and does not depend on any lib.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------
  // REF CAPTURE (2026-07-17 launch add-on) — reads ?ref=<CODE>
  // from the URL, sets lws_ref cookie for .r5tools.io (30-day TTL,
  // first-touch wins), and fires a beacon so /api/track sees the click.
  // Works cross-tool because every LWS subdomain shares .r5tools.io.
  // GH Pages tools (bullochman.github.io/*) can't share the cookie
  // (different registrable domain) but still fire the tracking beacon.
  try {
    var _refParam = new URLSearchParams(location.search).get('ref');
    if (_refParam && /^[A-Za-z0-9_-]{3,64}$/.test(_refParam)) {
      var _existingRef = null;
      try {
        var _m = document.cookie.match(/(?:^|;\s*)lws_ref=([^;]+)/);
        if (_m) _existingRef = decodeURIComponent(_m[1]);
      } catch (e) {}
      if (!_existingRef || _existingRef === _refParam) {
        var _thirty = 30 * 24 * 60 * 60;
        var _isR5tools = (location.hostname === 'r5tools.io' || location.hostname.endsWith('.r5tools.io'));
        var _cookieAttrs = 'Max-Age=' + _thirty + '; Path=/; SameSite=Lax';
        if (_isR5tools) _cookieAttrs += '; Domain=.r5tools.io';
        try { document.cookie = 'lws_ref=' + encodeURIComponent(_refParam) + '; ' + _cookieAttrs; } catch (e) {}
      }
      // fire attribution beacon (fire-and-forget; ignore errors)
      try {
        var _p = JSON.stringify({ ref: _refParam, path: location.pathname, host: location.host });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('https://access-codes.r5tools.io/api/refer/attribute', new Blob([_p], {type: 'application/json'}));
        } else {
          fetch('https://access-codes.r5tools.io/api/refer/attribute', {
            method: 'POST', mode: 'no-cors', keepalive: true, credentials: 'omit',
            headers: {'Content-Type': 'application/json'}, body: _p
          }).catch(function(){});
        }
      } catch (e) {}
    }
  } catch (e) { /* URLSearchParams / cookie unsupported — skip */ }


  var ENDPOINT = (window.LWS_TRACK_ENDPOINT ||
                  'https://access-codes.r5tools.io/api/track');

  function _deriveToolName() {
    if (window.LWS_TRACK_TOOL_NAME) return String(window.LWS_TRACK_TOOL_NAME);
    try {
      var host = (location.host || '').toLowerCase();
      var path = (location.pathname || '').toLowerCase();
      if (host === 'r5tools.io' || host === 'www.r5tools.io') return 'landing';
      if (host.endsWith('.r5tools.io')) return host.split('.')[0];
      if (host.indexOf('bullochman.github.io') === 0) {
        var m = path.match(/lws-([a-z0-9-]+?)-static/);
        if (m) return m[1];
        return 'gh-pages';
      }
      if (host.indexOf('localhost') === 0 || host.indexOf('127.0.0.1') === 0) {
        return 'localhost';
      }
      return host;
    } catch (e) {
      return '';
    }
  }

  var DEFAULT_TOOL = _deriveToolName();

  function post(payload) {
    try {
      var body = JSON.stringify(payload);
      // Prefer sendBeacon — survives page-unload, fully async, doesn't block.
      if (navigator.sendBeacon) {
        try {
          var blob = new Blob([body], { type: 'application/json' });
          if (navigator.sendBeacon(ENDPOINT, blob)) return;
        } catch (e) { /* fall through */ }
      }
      // Fallback: fetch with keepalive so it survives page-navigate.
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        credentials: 'omit',
        keepalive: true,
        mode: 'cors',
      }).catch(function () { /* swallow */ });
    } catch (e) {
      /* swallow all */
    }
  }

  function event(eventName, tool, metadata) {
    if (!eventName) return;
    var payload = {
      event_name: String(eventName).slice(0, 60),
      tool: String(tool || DEFAULT_TOOL || '').slice(0, 80),
      metadata: metadata && typeof metadata === 'object' ? metadata : {},
    };
    post(payload);
  }

  // Public API.
  window.LWSTrack = {
    event: event,
    tool: DEFAULT_TOOL,
    endpoint: ENDPOINT,
  };

  // Auto-fire one page_view per tool load. Skips if the caller has explicitly
  // set window.LWS_TRACK_SKIP_AUTOVIEW = true (e.g. SPAs that call it manually
  // after their own router settles).
  if (!window.LWS_TRACK_SKIP_AUTOVIEW) {
    // Fire after DOMContentLoaded so we don't compete with critical-path work.
    var fireOnce = function () {
      try {
        event('page_view', DEFAULT_TOOL, {
          path: location.pathname || '/',
          lang: (document.documentElement && document.documentElement.lang) || '',
          referrer_host: (function () {
            try {
              var r = document.referrer || '';
              if (!r) return '';
              return new URL(r).host || '';
            } catch (e) { return ''; }
          })(),
        });
      } catch (e) { /* swallow */ }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fireOnce, { once: true });
    } else {
      fireOnce();
    }
  }
})();
