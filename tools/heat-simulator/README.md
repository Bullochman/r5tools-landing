# lws-heat-simulator-static

Static-only build of [LWS Heat Simulator](https://github.com/Bullochman/lws-heat-simulator) for GH Pages.

**Live at:** https://bullochman.github.io/lws-heat-simulator-static/

`fake-server.js` intercepts /api/snapshot (inlined config + KB constants), /api/compute (ports server.py's ambientAt + computeBaseTemp), /api/roster/upload (parses CSV client-side, persists to localStorage).
