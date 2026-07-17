# r5tools Cross-Tool Backlink Audit

Date: 2026-07-17
Scope: every `LWS_*` and `lws-*-static` directory under `/Users/evanjones/claudecode/r5tools/` that ships an `index.html` as its main tool. Excluded per spec: `r5tools-landing/`, `LWS_Access_Codes/`, `LWS_Knowledge_Base/`. Also excluded (no `index.html` / not a user-facing tool): `LWS_Alliance_Ops_Center/` (shared JS library area), `LWS_Seasons/` (data library).

## Audit table

Legend (per feature):
- `nav`: visible `<a href="https://r5tools.io">` anchor in the header/nav area of the page
- `foot`: link to `https://r5tools.io` (root) inside a `<footer>` element OR a functional footer div (e.g., `.footer-note`)
- `attr`: explicit "Part of the r5tools.io suite" (or equivalent) attribution text — strict prose match
- `lang`: interactive EN↔KR toggle (button or select bound to a switcher)
- `anlx`: r5tools.io Plausible/GA4 analytics snippet (via `build_analytics_inject.py` marker `r5tools:analytics`) or equivalent
- `ref`: `?ref=` URL param captured in JS (URLSearchParams / persisted to localStorage / posted with events)

Values: Y / N. `Y*` = present but weak (see notes column).

| Tool | nav | foot | attr | lang | anlx | ref | Notes |
|---|---|---|---|---|---|---|---|
| LWS_City_Capture_Planner       | Y | Y  | N | Y | N | N | Footer link is plain "r5tools.io", no "suite" wording |
| LWS_Coal_Burn_Calculator       | Y | Y  | N | Y | N | N | Brand strip says "LWS Suite" (not "part of r5tools.io") |
| LWS_Freeze_Risk_Dashboard      | N | N -> **Y (auto-added)** | Y (auto) | Y | N | N | Header brand was plain text; no r5tools anchor at all; auto-footer injected |
| LWS_Heat_Simulator             | Y | Y  | N | Y | N | N | |
| LWS_KB_Chat                    | Y | Y  | **Y** | Y | N | N | Only tool with explicit "Part of the R5TOOLS.IO suite" prose |
| LWS_Landing_Planner            | Y | Y  | N | Y | N | N | Footer: "All tools · r5tools.io" |
| LWS_Profile_Studio             | Y | Y  | N | Y | N | N | Nav mentions other subdomains but no "suite" prose |
| LWS_Roster_Extractor           | Y | Y  | N | Y | N | **Y** | Only tool that captures `?ref=` (via LWSTrack) |
| LWS_Season_Timeline            | Y | Y  | N | Y | N | N | |
| LWS_VS_Days                    | Y | Y* | N | Y | N | N | Uses `.footer-note` div, not `<footer>` — link present |
| lws-city-capture-static        | Y | Y  | N | Y | N | N | |
| lws-coal-burn-static           | Y | Y  | N | Y | N | N | |
| lws-freeze-risk-static         | Y | N -> **Y (auto-added)** | Y (auto) | Y | N | N | Same missing-footer bug as LWS_Freeze_Risk_Dashboard; auto-fixed |
| lws-heat-simulator-static      | Y | Y  | N | Y | N | N | |
| lws-hive-static                | Y | N -> **Y (auto-added)** | Y (auto) | Y | N | N | Massive tool, had nav suite strip but no footer at all; auto-footer injected |
| lws-landing-planner-static     | Y | Y  | N | Y | N | N | |
| lws-season-timeline-static     | Y | Y  | N | Y | N | N | |

## Ranked highest-impact fixes (top 3)

1. **Analytics injection across all 17 tools.** Zero tools currently emit any Plausible/GA4 events to the r5tools.io property. This is the #1 attribution gap — we have no idea which tool a visitor came from, how long they stayed, or whether they clicked back to r5tools.io. Blast radius: the entire funnel is invisible. Fix requires per-tool decision on which analytics domain to send to (single r5tools.io property with cross-domain, or per-subdomain properties). Deferred from auto-fix because the current `build_analytics_inject.py` writes root-relative script paths (`/analytics-config.js`, `/analytics.js`) that only resolve under `r5tools-landing/`, and the tools are served from their own domains (hive.r5tools.io, roster.r5tools.io, bullochman.github.io/lws-*-static, railway apps). Need either (a) fully-qualified `https://r5tools.io/analytics.js` URLs with CORS, or (b) per-tool copies of the two JS files.
2. **`?ref=` referral-code capture across 16 of 17 tools.** Only `LWS_Roster_Extractor` captures the `ref` param (it pulls in `LWSTrack` via `static/lws-track.js`). Every other tool loses attribution when a promoter links to `https://coal.r5tools.io/?ref=EVAN123` — the code never gets persisted or posted. The `shared/lws-track.js` snippet in `LWS_Alliance_Ops_Center/shared/` already exists and does exactly this; just needs a `<script src="...lws-track.js" defer></script>` include in the head of each tool. NOT auto-added per spec (per-tool understanding required — where to host the shared file, CORS, versioning).
3. **Explicit "Part of the r5tools.io suite" prose in nav or footer of the 3 auto-fixed tools + the 13 tools with weak/no attribution.** Auto-footer added to 3 tools contributes attribution prose ("← r5tools.io suite"), but the other 13 still just have a bare "r5tools.io" link with no context. Only `LWS_KB_Chat` explicitly reads "Part of the R5TOOLS.IO suite". Marginal SEO/attribution boost — a visitor scanning any tool should immediately understand it's part of a suite (drives cross-tool discovery). Low risk to add uniformly; defer to a copy pass.

## Auto-fix summary

- Injected the spec's minimal footer (idempotent, guarded by `<!-- r5tools-suite-footer -->` marker) into:
  - `/Users/evanjones/claudecode/r5tools/LWS_Freeze_Risk_Dashboard/index.html`
  - `/Users/evanjones/claudecode/r5tools/lws-freeze-risk-static/index.html`
  - `/Users/evanjones/claudecode/r5tools/lws-hive-static/index.html`
- The other 14 tools already had a working r5tools.io link inside their `<footer>` / `.footer-note` element and were left untouched.
- Analytics injection: **not performed on any tool**. Reason: `build_analytics_inject.py` walks files under `r5tools-landing/` and emits root-relative `/analytics-config.js` and `/analytics.js` script tags. Those resolve only when served from `r5tools.io`. Running the script with `--path` on an external tool would inject 404-ing script tags on subdomains like `hive.r5tools.io`, `coal.r5tools.io`, `bullochman.github.io/lws-*-static`. Fixing this properly is beyond "low-risk gap" — it needs a decision about whether to serve the analytics files from `r5tools.io` with CORS, or to bundle copies inside each tool. Left as MANUAL work.
- Referral capture: not auto-added per spec.

## Report

- **Tools audited:** 17
- **Tools with all 5 features (nav + footer + lang + analytics + ref):** 0
- **Tools with 4 of 5:** 1 (`LWS_Roster_Extractor` — missing analytics only)
- **Tools with 3 of 5 (nav + footer + lang):** 16
- **Tools auto-fixed (footer added):** 3
- **Tools still needing MANUAL work:**
  - **All 17** need analytics wired up to r5tools.io Plausible/GA4
  - **16 of 17** need `?ref=` capture (all except `LWS_Roster_Extractor`)
  - **13 of 17** would benefit from explicit "Part of the r5tools.io suite" attribution prose (all except `LWS_KB_Chat` and the 3 that just received the auto-footer with "← r5tools.io suite" text)

**Nothing functional was modified.** Only the footer HTML element was added as a staged addition on the 3 tools missing a homepage backlink.
