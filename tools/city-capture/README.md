# lws-city-capture-static

Static-only build of [LWS City Capture Planner](https://github.com/Bullochman/lws-city-capture-planner) for GH Pages.

**Live at:** https://bullochman.github.io/lws-city-capture-static/

`fake-server.js` intercepts `/api/rank` with a full JS port of server.py's weighted-score algorithm + Wk.D capture-slot scheduler. All KB constants mirrored (city heat +5°C L1 → +60°C L6, soil per hr, unlock windows, 2 captures/day cap, 36h protection).
