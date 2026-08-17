# lws-hive-static

Static GH Pages build of **Alliance Hive Grid Manager** — the LWS alliance
hive-placement planner (Marshall's Guard 10×10 grid + Military Stronghold
4-ring layout for Season-2-ready hives).

Server logic (originally Python `http.server`) is ported to
`static/fake-server.js`, which monkey-patches `window.fetch` to intercept
every `/api/*` route the client makes. State persists in browser
`localStorage['hivegrid_state']`.

- **Live URL:** https://bullochman.github.io/lws-hive-static/
- **Full-stack version:** [Bullochman/hivegrid](https://github.com/Bullochman/hivegrid) (Python + Railway + Stripe + per-alliance JSON on disk)
- **Suite home:** https://r5tools.io

## What lives here

- `index.html` — the client (identical to `Alliance_Hive_Grid_Manager/hive_app.html` except for the fake-server `<script>` include + suite-nav strip)
- `static/fake-server.js` — JS port of `hive_server.py` route handlers
- `README.md` — this file

## Trade-offs vs the full-stack version

| | Static (this repo) | Full-stack |
|---|---|---|
| Persistence | Browser `localStorage` only | Server-side JSON, shared across devices |
| License unlock | Hardcoded demo key `HIVE-KR-ALLIANCE-2026` accepted | Stripe webhook mints per-purchase keys |
| Feedback | Queued to `localStorage['hivegrid_feedback']` | POSTed to server + persisted to `feedback.json` |
| Stats | Stub (`{visitors: 0, unlocks: 0}`) | Real access log at `/stats` |
| Cost | Free (GH Pages) | Railway ~$5/mo |
| Cross-device sync | No | Yes |

Everything else — MG mode, Stronghold mode, 4-ring auto-placement algorithm,
CSV import/export, rank-tier sorting, drag-to-move, layout switching — works
identically because the client HTML is unchanged.
