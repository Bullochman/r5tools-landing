/*
 * cookie-consent.js — minimal, EEA/UK-only cookie banner for r5tools.io.
 *
 * Loads AFTER analytics-config.js and BEFORE analytics.js on pages where cookie
 * consent matters (all of them, since the banner shows only when needed).
 *
 * Design goals:
 *   - Show only for EEA/UK visitors (or when FORCE_COOKIE_CONSENT=true for QA).
 *     Region is detected server-side via a Cloudflare Worker that echoes
 *     CF-IPCountry into <meta name="cf-country" content="XX"> at the top of every
 *     page. Falls back to the browser locale if the meta is missing.
 *   - Present TWO choices only: Accept | Reject. No dark patterns, no
 *     "manage 812 vendors" pop-ups. Rejection is one click.
 *   - REJECT disables GA4 completely. Plausible keeps running because it is
 *     cookieless and processes no personal data.
 *   - Consent state stored in localStorage under lws_cookie_consent = "accept" | "reject".
 *   - Multi-lingual — reads document.documentElement.lang and picks the right
 *     copy. Falls back to English.
 *
 * Wire-up:
 *   1. In build_analytics_inject.py, insert BEFORE the GA4 bootstrap:
 *          <script src="/cookie-consent.js"></script>
 *      and gate the GA4 bootstrap on:
 *          if (window.LWS_CONSENT === "reject") return;
 *   2. To force the banner during QA, set window.FORCE_COOKIE_CONSENT = true
 *      in the browser console or via ?force_consent=1 querystring.
 *
 * Compliance notes:
 *   - GDPR / ePrivacy: EEA/UK visitors must give affirmative consent BEFORE
 *     any non-strictly-necessary cookie is set. GA4's client_id in localStorage
 *     is arguably not a cookie, but the safer read is that it still requires
 *     consent because it's used for behavioral tracking. We gate it.
 *   - The lws_ref (referral) cookie is treated as strictly necessary for
 *     the referral/attribution service you EXPLICITLY clicked into, so it
 *     is set even on reject. If you want it gated too, flip STRICT_REF below.
 *   - CCPA: no gating needed for California unless the site "sells" or "shares"
 *     data (we don't). We still show the banner globally when FORCE=true
 *     for QA.
 */
(function () {
  "use strict";

  var STRICT_REF = false; // set true to also gate the referral cookie on reject
  var STORAGE_KEY = "lws_cookie_consent"; // "accept" | "reject"
  var BANNER_ID = "lws-cookie-banner";

  // ---------- Region detection --------------------------------------------
  function getCountry() {
    var meta = document.querySelector('meta[name="cf-country"]');
    if (meta && meta.content) return meta.content.toUpperCase();
    return "";
  }
  var EEA_UK = new Set([
    "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR","HU",
    "IE","IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK",
    "IS","LI","NO", // EEA non-EU
    "GB","CH", // UK + Switzerland (ePrivacy alignment)
  ]);
  function needsBanner() {
    if (window.FORCE_COOKIE_CONSENT === true) return true;
    if (/[?&]force_consent=1\b/.test(location.search)) return true;
    var c = getCountry();
    if (c && EEA_UK.has(c)) return true;
    // Fallback: no country header AND browser locale looks EU — err on the
    // safe side and show. This is a soft heuristic; the server-side header
    // is authoritative when present.
    if (!c) {
      var lang = (navigator.language || "").toLowerCase();
      var euLangs = ["de","fr","es","pt","it","nl","pl","sv","da","fi","el","cs","hu","ro","bg","hr","sk","sl","lt","lv","et","mt"];
      for (var i = 0; i < euLangs.length; i++) {
        if (lang.indexOf(euLangs[i]) === 0) return true;
      }
    }
    return false;
  }

  // ---------- Consent state ------------------------------------------------
  function readConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }
  function writeConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
    window.LWS_CONSENT = value;
    // Fire a custom event so late-loading scripts (analytics.js) can react.
    try {
      document.dispatchEvent(new CustomEvent("lws:consent", { detail: { value: value } }));
    } catch (e) {}
  }

  // ---------- Multi-lingual copy ------------------------------------------
  var COPY = {
    en: {
      body: "We use cookieless analytics (Plausible) and one optional cookie for Google Analytics. Your call.",
      accept: "Accept",
      reject: "Reject",
      more: "Details",
    },
    ko: {
      body: "쿠키 없는 분석(Plausible)과 Google Analytics용 선택적 쿠키 1개를 사용합니다. 선택은 당신의 몫입니다.",
      accept: "동의",
      reject: "거부",
      more: "자세히",
    },
    ja: {
      body: "クッキー不要の分析(Plausible)と、Google Analytics用の任意クッキー1つを使用します。あなたが決めてください。",
      accept: "同意",
      reject: "拒否",
      more: "詳細",
    },
    pt: {
      body: "Usamos análise sem cookies (Plausible) e um cookie opcional para o Google Analytics. A decisão é sua.",
      accept: "Aceitar",
      reject: "Rejeitar",
      more: "Detalhes",
    },
    es: {
      body: "Usamos análisis sin cookies (Plausible) y una cookie opcional para Google Analytics. Tú decides.",
      accept: "Aceptar",
      reject: "Rechazar",
      more: "Detalles",
    },
  };
  function pickCopy() {
    var lang = (document.documentElement.getAttribute("lang") || "en").slice(0, 2).toLowerCase();
    return COPY[lang] || COPY.en;
  }

  // ---------- Banner UI ---------------------------------------------------
  function renderBanner() {
    if (document.getElementById(BANNER_ID)) return;
    var copy = pickCopy();
    var el = document.createElement("div");
    el.id = BANNER_ID;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Cookie consent");
    el.style.cssText = [
      "position:fixed",
      "bottom:16px",
      "left:16px",
      "right:16px",
      "max-width:640px",
      "margin:0 auto",
      "z-index:2147483000",
      "background:#0d1424",
      "color:#e6e8ee",
      "border:1px solid rgba(201,169,97,0.35)",
      "border-radius:10px",
      "padding:14px 18px",
      "font:14px/1.5 system-ui,-apple-system,sans-serif",
      "box-shadow:0 4px 24px rgba(0,0,0,0.35)",
      "display:flex",
      "flex-wrap:wrap",
      "gap:10px",
      "align-items:center",
      "justify-content:space-between",
    ].join(";");
    el.innerHTML =
      '<div style="flex:1 1 260px;color:#a8b0c0;">' +
        escapeHtml(copy.body) +
        ' <a href="/privacy.html#cookies" style="color:#c9a961;">' + escapeHtml(copy.more) + '</a>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex:0 0 auto;">' +
        '<button type="button" data-act="reject" style="background:transparent;border:1px solid rgba(255,255,255,0.15);color:#e6e8ee;padding:8px 14px;border-radius:6px;cursor:pointer;font:inherit;">' + escapeHtml(copy.reject) + '</button>' +
        '<button type="button" data-act="accept" style="background:#c9a961;border:none;color:#0a0e1a;padding:8px 14px;border-radius:6px;cursor:pointer;font:inherit;font-weight:600;">' + escapeHtml(copy.accept) + '</button>' +
      '</div>';
    el.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.getAttribute) return;
      var act = t.getAttribute("data-act");
      if (!act) return;
      writeConsent(act);
      el.parentNode && el.parentNode.removeChild(el);
      // If accepted and GA4 not yet bootstrapped, trigger it lazily.
      if (act === "accept") loadGA4IfConfigured();
    });
    document.body.appendChild(el);
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }

  // ---------- Late-loading GA4 when user accepts --------------------------
  function loadGA4IfConfigured() {
    var cfg = window.R5T_ANALYTICS || {};
    var id = cfg.ga4MeasurementId || "";
    if (!id) return;
    if (window.gtag) return; // already loaded
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true, allow_google_signals: false });
  }

  // ---------- Bootstrap ---------------------------------------------------
  var stored = readConsent();
  if (stored === "accept" || stored === "reject") {
    window.LWS_CONSENT = stored;
    // Enforce reject: if analytics.js checks LWS_CONSENT before ga4() we're
    // already fine. Kill any lingering GA4 cookies just in case.
    if (stored === "reject") {
      try {
        document.cookie.split(";").forEach(function (c) {
          var name = c.split("=")[0].trim();
          if (/^_ga/.test(name) || name === "_gid" || name === "_gat") {
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=." + location.hostname.replace(/^www\./, "");
          }
        });
      } catch (e) {}
      if (STRICT_REF) {
        try {
          document.cookie = "lws_ref=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.r5tools.io";
        } catch (e) {}
      }
    }
    return;
  }

  // No stored consent — decide whether to prompt.
  if (!needsBanner()) {
    // Non-EEA visitor and not forced: treat as implicit accept (aligned with US norms).
    window.LWS_CONSENT = "accept";
    return;
  }

  // EEA/UK visitor with no stored consent: default to REJECT until they click.
  // This is the GDPR-safe posture — no non-essential cookies until affirmative
  // action. If they accept, GA4 loads lazily.
  window.LWS_CONSENT = "reject";
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderBanner);
  } else {
    renderBanner();
  }
})();
