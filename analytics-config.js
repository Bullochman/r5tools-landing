/*
 * analytics-config.js — single source of truth for r5tools.io analytics.
 *
 * Evan fills in these placeholder values ONCE, then re-runs
 *   python3 build_analytics_inject.py
 * to propagate the config across every page. All tracking code (Plausible,
 * GA4, custom events) reads from window.R5T_ANALYTICS at runtime, so the
 * injected snippets never need to be edited per-property.
 *
 * How to fill this in:
 *   1. Create a Plausible account at https://plausible.io  →  add site
 *      "r5tools.io"  →  copy the domain string it echoes back (should be
 *      literally "r5tools.io"). No script tag / no site ID needed —
 *      Plausible identifies sites by domain.
 *   2. Create a GA4 property in Google Analytics (Admin → Create Property)
 *      →  add a Web data stream for https://r5tools.io  →  copy the
 *      "Measurement ID" (looks like G-XXXXXXXXXX). Also, in Admin → Data
 *      Streams → your stream → Measurement Protocol API secrets, click
 *      "Create" and copy the api_secret. Paste the ID below and put the
 *      api_secret in LWS_Access_Codes/.env as GA4_API_SECRET (server-side).
 *   3. (Optional) PostHog — not wired by default. If we want session
 *      recording or funnel analysis, uncomment posthog block below and paste
 *      the project API key.
 *
 * IMPORTANT: All keys here are PUBLIC (they end up in every static HTML page).
 *   - Plausible domain — public, safe.
 *   - GA4 measurement ID — public, safe.
 *   - GA4 api_secret — SERVER-SIDE ONLY, do NOT put here (see .env).
 *   - PostHog project API key — public write-only key, safe.
 */
window.R5T_ANALYTICS = {
  /* Plausible ---------------------------------------------------- */
  // The exact domain Plausible knows the site as. Leave empty to disable Plausible.
  plausibleDomain: "r5tools.io",
  // Plausible script URL. Use the "outbound-links + file-downloads" variant
  // so warzone/discord clicks fire automatically without extra JS.
  plausibleScriptUrl: "https://plausible.io/js/script.outbound-links.tagged-events.js",
  // Custom Events endpoint used by r5t.track(). Leave as-is unless self-hosting.
  plausibleApiUrl: "https://plausible.io/api/event",

  /* GA4 ---------------------------------------------------------- */
  // Paste your GA4 Measurement ID here (G-XXXXXXXXXX). Empty = GA4 disabled.
  ga4MeasurementId: "",

  /* PostHog (optional, off by default) --------------------------- */
  posthogEnabled: false,
  posthogApiHost: "https://us.i.posthog.com",
  posthogProjectKey: "",

  /* Site defaults ------------------------------------------------ */
  // Cookie domain for the referral cookie (must match the server's setting).
  refCookieDomain: ".r5tools.io",
  refCookieName: "lws_ref",
  refCookieTtlDays: 30,

  // Turn every r5t.track() into a console.info() call for local debugging.
  debug: false,
};
