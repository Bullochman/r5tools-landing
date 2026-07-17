/*
 * in-app-nudge.js — client-side conversion nudge for r5tools.io.
 *
 * Reads pending nudges for the current visitor from
 *   GET https://access-codes.r5tools.io/api/nudge/pending
 * and, if any match, shows a small dismissible bottom-right toast.
 *
 * Also runs a lightweight LOCAL rule engine so nudges can fire even
 * before the server has produced a pending entry — for example, the
 * "you've used N tools this session" toast fires without any server
 * roundtrip once the session hits the threshold, and only later gets
 * corroborated by the trigger_engine's server-side match.
 *
 * INJECTION
 * Injected on:
 *   - /index.html
 *   - /refer.html
 *   - /unlock.html (LWS_Access_Codes host)
 *   - any /*.html that already imports analytics.js
 *
 * Injection is handled by build_analytics_inject.py — add
 *   inject_script("automation/conversion-nudges/in-app-nudge.js")
 * to the list in that script if not already there.
 *
 * INTEGRATION WITH analytics.js
 * Requires window.r5t.track — loaded from analytics.js. All shown/
 * clicked/dismissed events go through the unified analytics façade so
 * they land in Plausible + GA4 like every other r5tools event.
 *
 * EVENTS FIRED
 *   nudge_shown      — {trigger_id, source: 'server'|'local'}
 *   nudge_clicked    — {trigger_id, cta_url}
 *   nudge_dismissed  — {trigger_id, dismiss_source: 'x'|'auto'}
 *
 * LOCAL RULES (mirror of the server trigger definitions — kept intentionally
 * small; server is source of truth for anything requiring cross-session data)
 *   high_usage_local  — 5+ tool page-views this session (sessionStorage-backed)
 *   pricing_view_local — pricing section viewed but no purchase_click in same session
 *
 * QUIET HOURS
 * Same defaults as the server (10 PM - 8 AM in the visitor's local tz).
 * Never override server 'suppress' flag.
 */
(function () {
  "use strict";

  var API_BASE = (window.R5T_ANALYTICS && window.R5T_ANALYTICS.accessCodesApi)
    || "https://access-codes.r5tools.io";
  var PENDING_ENDPOINT = API_BASE + "/api/nudge/pending";

  var QUIET_START = 22;  // 10 PM local
  var QUIET_END = 8;     // 8 AM local
  var SESSION_KEY = "r5t_nudge_session";
  var DISMISSED_KEY = "r5t_nudge_dismissed";
  var MIN_MS_BETWEEN_NUDGES = 60 * 60 * 1000;  // 1 hour client-side floor

  function log() {
    if (window.R5T_ANALYTICS && window.R5T_ANALYTICS.debug && window.console) {
      console.info.apply(console, ["[r5t-nudge]"].concat([].slice.call(arguments)));
    }
  }

  function isQuietHours() {
    var h = new Date().getHours();
    if (QUIET_START <= QUIET_END) return h >= QUIET_START && h < QUIET_END;
    return h >= QUIET_START || h < QUIET_END;
  }

  // Persisted per-tab session tally (survives navigation, not tab close).
  function readSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : { tools: [], events: {}, lastShownAt: 0 };
    } catch (e) {
      return { tools: [], events: {}, lastShownAt: 0 };
    }
  }
  function writeSession(s) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
  }

  // Persisted dismissal list — don't show the same trigger again for 7 days.
  function readDismissed() {
    try {
      var raw = localStorage.getItem(DISMISSED_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function writeDismissed(d) {
    try { localStorage.setItem(DISMISSED_KEY, JSON.stringify(d)); } catch (e) {}
  }
  function isDismissed(triggerId) {
    var d = readDismissed();
    var t = d[triggerId];
    if (!t) return false;
    // 7-day suppression per trigger
    return (Date.now() - t) < 7 * 24 * 60 * 60 * 1000;
  }
  function markDismissed(triggerId) {
    var d = readDismissed();
    d[triggerId] = Date.now();
    writeDismissed(d);
  }

  // Recognize a tool page — matches the analytics tool-name heuristic on the server.
  function currentTool() {
    var host = location.hostname;
    if (host.endsWith(".r5tools.io")) return host.split(".")[0];
    var m = /lws-([a-z-]+?)-static/.exec(location.pathname);
    return m ? m[1] : "";
  }

  // Track session-scope tool visits + events.
  function tickSession() {
    var s = readSession();
    var t = currentTool();
    if (t && s.tools.indexOf(t) === -1) s.tools.push(t);
    writeSession(s);
    return s;
  }

  function recordEvent(eventName) {
    var s = readSession();
    s.events[eventName] = (s.events[eventName] || 0) + 1;
    writeSession(s);
  }

  // ----- toast UI -----

  function ensureStyles() {
    if (document.getElementById("r5t-nudge-style")) return;
    var st = document.createElement("style");
    st.id = "r5t-nudge-style";
    st.textContent = [
      "#r5t-nudge{position:fixed;bottom:20px;right:20px;max-width:340px;",
      "background:#141821;color:#e6eaf0;border:1px solid #2a3038;border-radius:10px;",
      "font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;",
      "box-shadow:0 8px 24px rgba(0,0,0,.35);z-index:2147483000;padding:14px 16px 12px;",
      "opacity:0;transform:translateY(12px);transition:opacity .25s ease, transform .25s ease;}",
      "#r5t-nudge.show{opacity:1;transform:translateY(0);}",
      "#r5t-nudge .r5t-nudge-close{position:absolute;top:6px;right:8px;background:none;border:0;color:#7a808a;",
      "font-size:18px;cursor:pointer;padding:2px 6px;border-radius:4px;}",
      "#r5t-nudge .r5t-nudge-close:hover{color:#e6eaf0;background:#1e232c;}",
      "#r5t-nudge .r5t-nudge-body{padding-right:16px;}",
      "#r5t-nudge .r5t-nudge-cta{display:inline-block;margin-top:10px;padding:7px 14px;",
      "background:#c9a961;color:#0f1116;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;}",
      "#r5t-nudge .r5t-nudge-cta:hover{background:#d9ba71;}",
      "@media (max-width:520px){#r5t-nudge{left:12px;right:12px;bottom:12px;max-width:none;}}"
    ].join("");
    document.head.appendChild(st);
  }

  function showToast(nudge) {
    if (isQuietHours()) { log("suppressed: quiet hours"); return; }
    if (isDismissed(nudge.trigger_id)) { log("suppressed: dismissed", nudge.trigger_id); return; }
    var s = readSession();
    if (Date.now() - s.lastShownAt < MIN_MS_BETWEEN_NUDGES) { log("suppressed: rate limit"); return; }
    if (document.getElementById("r5t-nudge")) return;  // already visible

    ensureStyles();
    var wrap = document.createElement("div");
    wrap.id = "r5t-nudge";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-live", "polite");
    var text = String(nudge.toast_text || nudge.subject || "").slice(0, 260);
    var cta = String(nudge.cta_url || "https://r5tools.io/");
    var ctaLabel = nudge.cta_label || "Learn more";

    wrap.innerHTML = ""
      + '<button class="r5t-nudge-close" aria-label="Dismiss">&times;</button>'
      + '<div class="r5t-nudge-body">' + escapeHtml(text) + '</div>'
      + '<a class="r5t-nudge-cta" href="' + escapeAttr(cta) + '">' + escapeHtml(ctaLabel) + ' &rarr;</a>';

    document.body.appendChild(wrap);
    // fade in on next frame
    requestAnimationFrame(function () { wrap.classList.add("show"); });

    s.lastShownAt = Date.now();
    writeSession(s);
    track("nudge_shown", { trigger_id: nudge.trigger_id, source: nudge.source || "server" });

    wrap.querySelector(".r5t-nudge-close").addEventListener("click", function () {
      dismiss(nudge, "x");
    });
    wrap.querySelector(".r5t-nudge-cta").addEventListener("click", function () {
      track("nudge_clicked", { trigger_id: nudge.trigger_id, cta_url: cta });
      // let the navigation happen
    });

    // auto-dismiss after 45s so we don't stack up if user is browsing
    setTimeout(function () {
      if (document.getElementById("r5t-nudge") === wrap) dismiss(nudge, "auto");
    }, 45000);
  }

  function dismiss(nudge, source) {
    var el = document.getElementById("r5t-nudge");
    if (el) {
      el.classList.remove("show");
      setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 250);
    }
    markDismissed(nudge.trigger_id);
    track("nudge_dismissed", { trigger_id: nudge.trigger_id, dismiss_source: source });
  }

  function track(name, props) {
    if (window.r5t && typeof window.r5t.track === "function") {
      window.r5t.track(name, props);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/'/g, "&#39;"); }

  // ----- server-driven pending fetch -----

  function fetchPending() {
    // The server identifies the visitor by the lws_unlock_code cookie
    // (already set by LWS_Access_Codes.gate()) — no email leak to client.
    fetch(PENDING_ENDPOINT, { credentials: "include", cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : { pending: [] }; })
      .then(function (data) {
        var list = (data && data.pending) || [];
        if (!list.length) return;
        // Only show the first non-dismissed one.
        for (var i = 0; i < list.length; i++) {
          if (!isDismissed(list[i].trigger_id)) {
            showToast(Object.assign({ source: "server" }, list[i]));
            return;
          }
        }
      })
      .catch(function () { /* silent — nudges are non-critical */ });
  }

  // ----- local rules -----

  function evaluateLocalRules() {
    var s = readSession();

    // high_usage_local — 5+ unique tools this session
    if (s.tools.length >= 5 && !isDismissed("high_usage_local")) {
      showToast({
        trigger_id: "high_usage_local",
        source: "local",
        toast_text: "You've hit 5+ tools this session. The full paid suite is a one-time $30 unlock — no subscription.",
        cta_url: "https://r5tools.io/#pricing",
        cta_label: "See pricing"
      });
      return;
    }

    // pricing_view_local — viewed pricing section, no purchase click this session
    if (s.events.pricing_page_view && !s.events.purchase_click && !isDismissed("pricing_view_local")) {
      // only fire after they've bounced somewhere else — not on the pricing page itself
      if (!/pricing/i.test(location.hash) && !/#pricing/.test(location.href)) {
        showToast({
          trigger_id: "pricing_view_local",
          source: "local",
          toast_text: "Still deciding on paid? Free tier works forever. When you're ready — $30 one-time, no subscription.",
          cta_url: "https://r5tools.io/#pricing",
          cta_label: "Review pricing"
        });
      }
    }
  }

  // ----- pricing intersection observer -----
  // Fires pricing_page_view when the pricing section actually enters the viewport
  // (so time on page + intent are both real).

  function watchPricingSection() {
    var el = document.getElementById("pricing") || document.querySelector("[data-section='pricing']");
    if (!el || !("IntersectionObserver" in window)) return;
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting && !seen) {
          seen = true;
          recordEvent("pricing_page_view");
          track("pricing_page_view", { path: location.pathname });
          io.disconnect();
        }
      }
    }, { threshold: 0.5 });
    io.observe(el);
  }

  function watchPurchaseClicks() {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (/checkout\.stripe|buy\.stripe|\/checkout\b/.test(href)) {
        recordEvent("purchase_click");
      }
    }, { capture: true, passive: true });
  }

  // ----- bootstrap -----

  function init() {
    // Skip if the user has explicitly opted out via the drip unsubscribe.
    try {
      if (document.cookie.indexOf("r5t_nudges_off=1") !== -1) return;
    } catch (e) {}

    tickSession();
    watchPricingSection();
    watchPurchaseClicks();

    // Small delay so we don't beat analytics.js to the punch.
    setTimeout(function () {
      fetchPending();
      // Local rules run again after a short delay to give session tally time to reflect this pageload.
      setTimeout(evaluateLocalRules, 1500);
    }, 800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
