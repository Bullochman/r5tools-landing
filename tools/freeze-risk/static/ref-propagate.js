/*
 * ref-propagate.js — cross-suite ?ref= attribution
 * Reads the lws_ref cookie (set by r5tools-landing when a user arrives via
 * ?ref=<CODE>) and decorates every outbound anchor to a sibling R5TOOLS
 * property so attribution survives the click. Also propagates the ref onto
 * the current URL via pushState so navigation within this tool preserves it.
 * Safe no-op when no cookie is set.
 */
(function () {
  'use strict';
  var HOSTS = [
    'https://r5tools.io/',
    'https://bullochman.github.io/',
    'https://roster.r5tools.io/',
    'https://hive.r5tools.io/',
    'https://chat.r5tools.io/',
    'https://access-codes.r5tools.io/'
  ];
  function readRef() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)lws_ref=([^;]+)/);
      if (m) return decodeURIComponent(m[1]);
    } catch (e) {}
    try {
      var q = new URLSearchParams(location.search).get('ref');
      if (q && /^[A-Za-z0-9_-]{3,64}$/.test(q)) return q;
    } catch (e) {}
    return null;
  }
  function isOutbound(href) {
    if (!href) return false;
    for (var i = 0; i < HOSTS.length; i++) if (href.indexOf(HOSTS[i]) === 0) return true;
    return false;
  }
  function decorate(a, ref) {
    try {
      var u = new URL(a.href);
      if (u.searchParams.get('ref')) return;
      u.searchParams.set('ref', ref);
      a.href = u.toString();
    } catch (e) {}
  }
  function sweep(ref) {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (isOutbound(links[i].href)) decorate(links[i], ref);
    }
  }
  function propagateOnCurrentUrl(ref) {
    try {
      var u = new URL(location.href);
      if (u.searchParams.get('ref')) return;
      u.searchParams.set('ref', ref);
      history.replaceState(history.state, '', u.toString());
    } catch (e) {}
  }
  function boot() {
    var ref = readRef();
    if (!ref) return;
    propagateOnCurrentUrl(ref);
    sweep(ref);
    try {
      var obs = new MutationObserver(function () { sweep(ref); });
      obs.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
