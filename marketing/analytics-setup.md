# Analytics Setup — r5tools.io

Two-part instrumentation:

- **Client-side (browser)**: Plausible (cookieless, primary) + GA4 (secondary, feeds Google Ads). PostHog wired but off by default.
- **Server-side**: Plausible Events API + GA4 Measurement Protocol posted from the Stripe webhook handler in `LWS_Access_Codes/server.py`, so paid conversions still land in analytics even when the buyer is running an ad-blocker.

All snippets are injected into every `.html` under `r5tools-landing/` (except `404.html`) by `build_analytics_inject.py`. The snippet reads its config at runtime from `/analytics-config.js` — so if you rotate a Measurement ID, you edit **one** file and re-deploy. No re-injection needed.

---

## Step 1 — Create Plausible

1. Sign up at https://plausible.io (self-hosted works too; adjust `plausibleScriptUrl` and `plausibleApiUrl` in `analytics-config.js` if you go that route).
2. Add site → domain `r5tools.io`. Plausible identifies the site by domain, so there's no key to copy.
3. In site settings, enable **Outbound link clicks** and **Custom events** (already covered by the `script.outbound-links.tagged-events.js` variant we ship).
4. (Optional but recommended) Also add `access-codes.r5tools.io` as a **second** Plausible site — the LWS_Access_Codes `unlock.html` reports to that domain separately, since its funnel is different (form_submitted → success). If you'd rather fold both into r5tools.io, edit `LWS_Access_Codes/unlock.html`'s inline analytics block and remove the `cfg.plausibleDomain = "access-codes.r5tools.io";` line.

**Copy back:** nothing — `plausibleDomain` in `analytics-config.js` should stay as `"r5tools.io"`.

---

## Step 2 — Create GA4 property (needed for Google Ads reporting)

1. https://analytics.google.com → Admin → Create → Property → name it "r5tools.io".
2. Add a **Web** data stream → URL `https://r5tools.io/` → Stream name "r5tools.io site".
3. Copy the **Measurement ID** (format `G-XXXXXXXXXX`).
4. In the same stream, scroll to **Measurement Protocol API secrets** → click Create → nickname "server-side" → copy the `api_secret` value.

**Copy back:**

Edit `/Users/evanjones/claudecode/r5tools/r5tools-landing/analytics-config.js`:

```js
ga4MeasurementId: "G-XXXXXXXXXX",   // paste yours
```

Edit `LWS_Access_Codes/.env` (create if missing):

```bash
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=<your api_secret>
PLAUSIBLE_DOMAIN=r5tools.io
```

Then redeploy the access-codes server (Railway).

---

## Step 3 — Deploy the client change

The injector has already run once (1,386 HTML files instrumented). If you regenerate SEO pages via `build_seo_pages.py` or KR pages via `kr_translate_pages.py`, the analytics block is included natively — no follow-up needed. For any other manually-edited page or new HTML file, re-run:

```bash
cd ~/claudecode/r5tools/r5tools-landing
python3 build_analytics_inject.py
git add -A && git commit -m "analytics: refresh injection" && git push
```

GitHub Pages picks up the push automatically (~30–90s).

To strip everything (rollback):

```bash
python3 build_analytics_inject.py --strip
```

---

## Step 4 — (Optional) PostHog

Only worth wiring if you want session replays or full funnel analysis beyond what Plausible offers. To turn on:

1. Sign up at https://posthog.com → new project → copy the **Project API key** (starts `phc_...`).
2. In `analytics-config.js`:

```js
posthogEnabled: true,
posthogProjectKey: "phc_XXXXXXXXXX",
```

3. Add the PostHog script include yourself (the injector doesn't auto-add it — keep the surface area small until you're sure). Simplest: paste into `/analytics.js` right before the closing IIFE, gated on `CFG.posthogEnabled`.

---

## Step 5 — Verify events fire

Open https://r5tools.io/?ref=R5-TESTCODE-XX in your browser. In DevTools Console:

```js
// 1. Confirm config loaded and referral captured
window.R5T_ANALYTICS               // -> should show your config object
window.r5t.ref                     // -> "R5-TESTCODE-XX"
document.cookie                    // -> should include lws_ref=R5-TESTCODE-XX

// 2. Manually fire an event and watch the network tab
window.r5t.track("test_event", { source: "console" })
// You should see:
//   POST https://plausible.io/api/event  (200)
//   POST https://www.google-analytics.com/g/collect?...  (204, GA4 auto-batch)

// 3. Toggle debug mode locally
window.R5T_ANALYTICS.debug = true
window.r5t.track("test_event", { source: "console" })
// Now every call also console.info()s.
```

Then in the Plausible dashboard, filter by "Custom event = test_event" — it should appear within ~30s. In GA4, use **DebugView** (Admin → DebugView), enable "Debug mode" in GA Debugger extension, then repeat — events appear in real time.

For **server-side conversions**: fire a $0.50 Stripe test-mode charge through your test payment link. Within 10s the Stripe webhook logs should show `_send_analytics_conversion` triggered, and both Plausible (with `revenue=0.5` and `props.source=stripe`) and GA4 (event `unlock_success` in DebugView) should show the conversion.

---

## Event catalogue

Events you can filter/segment by (all auto-tagged with `ref=<code>|direct`):

| Event | Fires on | Props |
|---|---|---|
| `page_view` | Auto (Plausible + GA4) | (default) |
| `referral_attributed` | Landing with `?ref=CODE` | `code`, `path` |
| `outbound_click` | Any external `<a>` click | `url`, `host`, `text` |
| `refer_page_view` | `/refer.html` render | `state` = `logged_in` / `logged_out`, `code` |
| `refer_copy_code` | Copy code or copy link button on /refer | `kind` (`code`\|`link`), `code` |
| `refer_share_click` | Discord/X/Reddit/카톡/native share buttons | `channel`, `code` |
| `unlock_form_submitted` | `/unlock` code-entry form submit | `has_email`, `lang` |
| `unlock_success` | Client (redeem OK / paid panel shown) AND server (Stripe webhook) | `tier`, `source` (`code`\|`stripe`), `gross_cents` (server only) |
| `unlock_failed` | Invalid code entered | `reason` |

---

## Files

| File | Purpose |
|---|---|
| `analytics-config.js` | Public config — Evan fills placeholders |
| `analytics.js` | Runtime façade: `window.r5t.track()`, referral capture, outbound-click tagging |
| `build_analytics_inject.py` | Idempotent injector; walks every `.html` under `r5tools-landing/` |
| `LWS_Access_Codes/unlock.html` | Manually instrumented (form_submitted, unlock_success client) |
| `LWS_Access_Codes/server.py` | Server-side beacon `_send_analytics_conversion()` fires from `checkout.session.completed` |
| `r5tools-landing/refer.html` | Manually instrumented (page_view state, copy events, share_click by channel) |
