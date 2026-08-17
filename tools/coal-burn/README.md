# lws-coal-burn-static

Static-only build of [LWS Coal Burn Calculator](https://github.com/Bullochman/lws-coal-burn-calculator) for GitHub Pages.

**Live at:** https://bullochman.github.io/lws-coal-burn-static/

The full-stack version does the math in `server.py`. This build adds `static/fake-server.js` — a `window.fetch` monkey-patch that intercepts `/api/coal/*` calls and returns responses computed locally in JS. Tool client code is untouched. If you update math in server.py, mirror the change here.

KB placeholder: personal High-Heat Furnace burn rates (`PERSONAL_BURN_L1_NORMAL = 30 coal/min`, `L30 = 450 coal/min`, linear interp). Verify in-game before locking a coal budget.
