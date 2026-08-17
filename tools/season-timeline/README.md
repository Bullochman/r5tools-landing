# lws-season-timeline-static

Static-only build of [LWS Season Timeline](https://github.com/Bullochman/lws-season-timeline) for GitHub Pages hosting.

**Live at:** https://bullochman.github.io/lws-season-timeline-static/ (planned custom domain: `timeline.r5tools.io`)

## What this is

The Season Timeline tool is a full-stack app (Python `http.server` + HTML). The main repo (`lws-season-timeline`) has real per-member task persistence via `/api/tasks`. This repo is a **stripped copy of just the client-side files**, deployed on GitHub Pages.

All state falls back to `localStorage` when the `/api/*` fetches 404 (which they do on GH Pages). The tool remains fully usable — you just lose cross-device sync.

## What works vs what doesn't

- ✅ T-minus countdown clock
- ✅ Season 2 prep task list (18 KB-cited tasks, T-12 → Wk4)
- ✅ Roster CSV import
- ✅ Per-member task ticks (persisted to `localStorage`)
- ✅ Roster progress bars
- ✅ EN + KR i18n toggle
- ✅ PNG / iCal / CSV / JSON export
- ⚠️ Cross-device sync (needs the full-stack version deployed to Railway)

## Where the real code lives

- Full-stack version: `Bullochman/lws-season-timeline` (private)
- Umbrella project: `Bullochman/lws-alliance-ops-center` (private)
- Landing page: `Bullochman/r5tools-landing` (public, LIVE at r5tools.io)

## Deployment

Push to `main` → GitHub Pages picks it up (~1-2 min build). If you're editing, keep client-only files here; server-side changes go to the main `lws-season-timeline` repo.
