/*
 * analytics.js — unified event façade for r5tools.io.
 *
 * Loads AFTER analytics-config.js. Exposes:
 *   window.r5t.track(eventName, props)       // fires to Plausible + GA4 (+ PostHog if on)
 *   window.r5t.setUserProperty(key, value)   // stores on window + emits to GA4/PostHog
 *   window.r5t.ref                            // current attributed referral code, or null
 *
 * Auto-fires on page load:
 *   - Plausible pageview (via its own script)
 *   - GA4 config + page_view (via gtag)
 *   - Referral capture: if URL has ?ref=<CODE>, sets lws_ref cookie (Domain=.r5tools.io,
 *     30-day TTL), fires 'referral_attributed' event, and calls the server
 *     /api/refer/attribute endpoint so click counter stays accurate.
 *   - Outbound-click auto-tagging: any external <a> gets clicked → outbound_click.
 *
 * Cookieless by default. Only cookie touched is lws_ref (Evan's existing
 * attribution cookie — not analytics-scoped).
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------
  // Storage-reset shim — bumps localStorage version so returning
  // visitors from before 2026-07-17 get a fresh state. Prevents
  // stale roster caches, stale referral codes, stale language pref
  // from colliding with the launch-week schema changes.
  var STORAGE_RESET_VERSION = "2026-07-17-launch";
  try {
    if (localStorage.getItem("lws_storage_version") !== STORAGE_RESET_VERSION) {
      var toClear = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf("lws_") === 0 || k.indexOf("r5t_") === 0 || k.indexOf("lwsRoster") === 0)) {
          if (k === "lws_lang") continue; // preserve language preference
          toClear.push(k);
        }
      }
      toClear.forEach(function(k){ try { localStorage.removeItem(k); } catch(e){} });
      localStorage.setItem("lws_storage_version", STORAGE_RESET_VERSION);
    }
  } catch(e) { /* private browsing or storage disabled - fine */ }

  var CFG = (window.R5T_ANALYTICS = window.R5T_ANALYTICS || {});
  var DEBUG = !!CFG.debug;
  function log() {
    if (DEBUG && window.console) console.info.apply(console, ["[r5t]"].concat([].slice.call(arguments)));
  }

  // ---------------------------------------------------------------
  // Referral capture (?ref=CODE → cookie + server ping)
  // ---------------------------------------------------------------
  function readCookie(name) {
    var m = document.cookie.match("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$1") + "=([^;]*)");
    return m ? decodeURIComponent(m[1]) : null;
  }
  function writeCookie(name, value, days, domain) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    var parts = [name + "=" + encodeURIComponent(value), "expires=" + d.toUTCString(), "path=/", "SameSite=Lax"];
    if (domain) parts.push("Domain=" + domain);
    if (location.protocol === "https:") parts.push("Secure");
    document.cookie = parts.join("; ");
  }

  function captureRefFromUrl() {
    var m = /[?&]ref=([A-Z0-9\-]{4,40})/i.exec(location.search);
    if (!m) return readCookie(CFG.refCookieName || "lws_ref");
    var code = m[1].toUpperCase();
    // Only overwrite if none set (first-touch attribution).
    var existing = readCookie(CFG.refCookieName || "lws_ref");
    if (!existing) {
      writeCookie(CFG.refCookieName || "lws_ref", code, CFG.refCookieTtlDays || 30, CFG.refCookieDomain || "");
      // Best-effort server ping for the click counter (fire-and-forget).
      try {
        fetch("https://access-codes.r5tools.io/api/refer/attribute", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code, landing: location.pathname }),
          keepalive: true,
        }).catch(function () {});
      } catch (e) {}
    }
    return code;
  }

  // ---------------------------------------------------------------
  // Plausible custom events
  // ---------------------------------------------------------------
  function plausible(eventName, props) {
    if (!CFG.plausibleDomain) return;
    // If the Plausible script already loaded, use its queue.
    if (typeof window.plausible === "function") {
      try {
        window.plausible(eventName, { props: props || {} });
        return;
      } catch (e) {}
    }
    // Fallback: direct beacon (only fires if script never loads / blocker).
    try {
      var body = JSON.stringify({
        name: eventName,
        url: location.href,
        domain: CFG.plausibleDomain,
        props: props || {},
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(CFG.plausibleApiUrl, body);
      } else {
        fetch(CFG.plausibleApiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: body,
          keepalive: true,
        }).catch(function () {});
      }
    } catch (e) {}
  }

  // ---------------------------------------------------------------
  // GA4 (via gtag global — bootstrapped by the injected snippet)
  // ---------------------------------------------------------------
  function ga4(eventName, props) {
    if (!CFG.ga4MeasurementId) return;
    if (typeof window.gtag !== "function") return;
    try {
      window.gtag("event", eventName, props || {});
    } catch (e) {}
  }

  // ---------------------------------------------------------------
  // PostHog (optional)
  // ---------------------------------------------------------------
  function posthogEvent(eventName, props) {
    if (!CFG.posthogEnabled) return;
    if (!window.posthog || typeof window.posthog.capture !== "function") return;
    try {
      window.posthog.capture(eventName, props || {});
    } catch (e) {}
  }

  // ---------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------
  var r5t = {
    ref: null,
    userProps: {},

    track: function (eventName, props) {
      props = props || {};
      // Always tag events with the attributed referral code (or 'direct').
      if (!("ref" in props)) props.ref = r5t.ref || "direct";
      log("track", eventName, props);
      plausible(eventName, props);
      ga4(eventName, props);
      posthogEvent(eventName, props);
    },

    setUserProperty: function (key, value) {
      r5t.userProps[key] = value;
      log("user_prop", key, value);
      if (typeof window.gtag === "function" && CFG.ga4MeasurementId) {
        try {
          var up = {};
          up[key] = value;
          window.gtag("set", "user_properties", up);
        } catch (e) {}
      }
      if (CFG.posthogEnabled && window.posthog && typeof window.posthog.people === "object") {
        try {
          var s = {};
          s[key] = value;
          window.posthog.people.set(s);
        } catch (e) {}
      }
    },
  };

  // ---------------------------------------------------------------
  // Bootstrap
  // ---------------------------------------------------------------
  r5t.ref = captureRefFromUrl();
  if (r5t.ref) {
    r5t.setUserProperty("ref_code", r5t.ref);
    // Fire once per session so we know a ref-landing happened even if the visitor bounces.
    r5t.track("referral_attributed", { code: r5t.ref, path: location.pathname });
  }

  // Auto-track outbound clicks. Plausible's outbound-links script covers most,
  // but we also mirror to GA4 with the destination host so ads reporting sees them.
  document.addEventListener(
    "click",
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!/^https?:/i.test(href)) return;
      try {
        var u = new URL(href);
        if (u.hostname && u.hostname !== location.hostname) {
          r5t.track("outbound_click", {
            url: href,
            host: u.hostname,
            text: (a.textContent || "").slice(0, 80).trim(),
          });
        }
      } catch (err) {}
    },
    { capture: true, passive: true }
  );

  window.r5t = r5t;
})();
