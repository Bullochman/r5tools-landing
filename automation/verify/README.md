# Dashboard verification harness

Headless Playwright sweep that clicks every tab in r5tools.io/dashboard and
confirms each tool auto-loads the roster, season auto-derives, and there are
zero bullochman.github.io links. Does NOT touch your real Chrome.

Run:
    npx playwright install chromium   # once
    node verify-dashboard.js

Uses cookie lws_unlock_code=RONY-FREE + localStorage warzone=2007/alliance=RONY.
All-green output = every tool panel loads the 96-member RONY roster.
