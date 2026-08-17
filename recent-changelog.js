/* recent-changelog.js — floating "recently shipped" pill in the bottom-right.
 *
 * Hover / click reveals a scrollable list of the last ~40 improvements shipped
 * to r5tools.io. Social proof that the tool is actively maintained.
 *
 * Data is inline (no fetch) so the reveal is instant. Update the CHANGES
 * array as new features ship — the widget rebuilds on next page load.
 */
(function () {
  'use strict';
  if (window.__LWS_CHANGELOG_MOUNTED__) return;
  window.__LWS_CHANGELOG_MOUNTED__ = true;

  var CHANGES = [
    // Most recent at the top. Group by date, one line per shipment.
    { date: '2026-08-17', tag: 'FEAT',  label: 'NEW: Live Roster & Player Finder (/live-roster.html) — pick any scanned warzone, get its full alliance rosters (every member, HQ, in-game rank, exact coordinates) with no video upload. Search any player by name for their coords. Export canonical CSV straight into Landing Planner / Hive / Freeze' },
    { date: '2026-08-17', tag: 'DATA',  label: 'Rosters now scraped live from lwatlas map scans (refreshes ~daily) — the member-list video upload is now an optional fallback, only needed for warzones lwatlas has not scanned yet' },
    { date: '2026-08-17', tag: 'DATA',  label: 'Warzone directory: KvK cohorts added — each warzone now shows its 8-warzone KvK bracket (⚔ shared center server, hover for all 8 members). 1,312 brackets live; filter the API with ?kvk=<center>' },
    { date: '2026-08-17', tag: 'DATA',  label: 'Warzone directory refreshed from lwatlas: 2,304 warzones (13 new servers), fresh season windows (W2007 confirmed S2 live 07-27 → 09-21), per-warzone season start/end dates now in the API + CSV' },
    { date: '2026-07-27', tag: 'FIX',   label: 'Dashboard CONTEXT strip: fixed Day counter (was computing from calendar launch, actual Day-N-of-season starts at 02:00 UTC on 07-27 — the day AFTER the 07-26 season open). Consolidated 5 chips into 3 — "Wk N · Day N" as one chip, "Season: Season 2: Polar Storm" shortened to "S2 · Polar Storm"' },
    { date: '2026-07-27', tag: 'FIX',   label: 'Dashboard: unlocked users with no roster yet now see "You\'re unlocked ✓ — upload your roster" instead of the misleading "Unlock a code to see your alliance context" empty state' },
    { date: '2026-07-27', tag: 'FIX',   label: 'Dashboard CONTEXT strip no longer shows "Season: [object Object]" — season name now resolves to string per UI language' },
    { date: '2026-07-27', tag: 'DATA',  label: 'Warzone directory: 2,290 of 2,292 now lwatlas-sourced (was 944) — legacy inference nearly eliminated, S7 catalog surfaced (667 warzones)' },
    { date: '2026-07-27', tag: 'FIX',   label: 'Warzone parser now falls through current > upcoming > last_completed season fields (was only checking current, mislabeling 1,347 warzones)' },
    { date: '2026-07-27', tag: 'UX',    label: 'Unlocked users no longer see "Unlock the suite" / "Try free demo" / pricing tiers / founding-scarcity pill / "ask your R5" nudges anywhere' },
    { date: '2026-07-27', tag: 'UX',    label: 'Homepage nav swaps "Unlock the suite" → "✓ Dashboard" pill for unlocked users' },
    { date: '2026-07-27', tag: 'UX',    label: 'Homepage hero CTAs swap to direct "Open Roster Extractor →" + "Open Hive Manager →" when unlocked' },
    { date: '2026-07-27', tag: 'FIX',   label: 'Founding-scarcity floating pill (r5t-founding) correctly hidden for unlocked users — no more overlap with Ask chat button' },
    { date: '2026-07-27', tag: 'SEO',   label: '21 new SEO pages: warzone-2007 + S2 KvK-bracket warzones (was 404 on the flagship warzone)' },

    { date: '2026-07-26', tag: 'FIX',   label: 'Roster Extractor: owner + paid-scout tiers added to TIER_CAPS + PAID_TIERS (owner uploads were 429ing with tier=unknown)' },
    { date: '2026-07-26', tag: 'FEAT',  label: 'Roster Extractor: reference screenshots above each uploader (Member List vs Warzone Alliance List) with cross-tool "wrong screen?" redirect' },
    { date: '2026-07-26', tag: 'FEAT',  label: 'Roster Extractor: canonical CSV export in snake_case — one CSV now works cleanly across every sibling tool without hand-editing headers' },
    { date: '2026-07-26', tag: 'FEAT',  label: 'Landing Planner + Train Conductor parsers accept both `power` and `total_power` header variants — any LWS-tool CSV loads' },
    { date: '2026-07-26', tag: 'FEAT',  label: 'Redaviatrix upgraded to Scout Premium (999 uploads/mo) + Trusted Contributor as first-paying-customer treatment' },
    { date: '2026-07-26', tag: 'UX',    label: 'Landing Planner + Hive + Train Conductor: killed the Moonpetal demo auto-load universally — every visitor starts on their own empty state' },
    { date: '2026-07-26', tag: 'UX',    label: 'Landing Planner empty-state banner with "upload your CSV or extract from Roster Extractor →" prompt when no roster loaded' },
    { date: '2026-07-26', tag: 'FIX',   label: 'Unlock page "Tier:" field no longer blank — i18n was destroying the child <code> element (moved data-i18n to sibling span)' },
    { date: '2026-07-26', tag: 'FIX',   label: 'Unlock page shows human-readable tier names ("Scout Premium ⭐" / "Founding Alliance" / "Owner") instead of raw slugs' },
    { date: '2026-07-26', tag: 'FIX',   label: 'Cookie SameSite Lax → None+Secure so cross-site tools recognize unlock (fixed "seeing register prompts when already unlocked")' },
    { date: '2026-07-26', tag: 'FIX',   label: 'Homepage recognizes unlocked users on load — yellow "Enter code" banner swaps to green "✓ You are unlocked — {tier}" welcome-back banner' },
    { date: '2026-07-26', tag: 'FIX',   label: 'Roster Extractor: persistent orange "Redeem your access code first" overlay when no cookie — dropzone disabled, no more flash-modal that reverts too fast to read' },
    { date: '2026-07-26', tag: 'FIX',   label: 'Roster Extractor: network failure returns user to upload UI (was stuck on the failure screen with CSV button hidden)' },
    { date: '2026-07-26', tag: 'FIX',   label: 'Roster Extractor: reference images no longer lazy-loaded — Chrome was refusing to trigger loads even when in viewport' },

    { date: '2026-07-19', tag: 'SMTP', label: 'Resend + Railway + r5tools.io DKIM/SPF verified — buyers auto-emailed within 30s of paying' },
    { date: '2026-07-19', tag: 'DATA',  label: 'Warzone DB: 206 real entries across 4 documented Transfer Groups (1981-2044 = W2007 group)' },
    { date: '2026-07-19', tag: 'DATA',  label: 'S1-S5 all seasons confirmed via 3-vote adversarial verification (Crimson Plague / Polar Storm / Golden Kingdom / Evernight Isle / Wild West)' },
    { date: '2026-07-19', tag: 'FEAT',  label: 'Interactive 56-day Timeline with 5-season tabs on the landing hero — drag, scroll, hover any day for details' },
    { date: '2026-07-19', tag: 'FEAT',  label: 'Warzone picker with searchable list + "+ Add your warzone" contribute form (crowdsourced DB)' },
    { date: '2026-07-19', tag: 'FEAT',  label: 'Alliance List OCR pipeline (v1) — video → structured cross-warzone alliance directory' },
    { date: '2026-07-19', tag: 'FEAT',  label: 'Alliance Coordination Directory + R5-of-record claim system' },
    { date: '2026-07-19', tag: 'FEAT',  label: 'Alliance Flag PNG generator (6 themes, keyword emblem parser)' },
    { date: '2026-07-19', tag: 'FEAT',  label: 'Landing Planner hover tooltips with member name + connector line to floating card' },
    { date: '2026-07-19', tag: 'FEAT',  label: 'Landing Planner zoom presets (World / R5 overview / Arrival) + Thermal Map toggle with pulsing danger tiles' },
    { date: '2026-07-19', tag: 'FEAT',  label: 'Roster staleness widget — nudges alliance to refresh every 48h + auto-rotates suggested uploader' },
    { date: '2026-07-19', tag: 'FEAT',  label: 'Feature poll for paid users — vote 👍/👎 on 7 roadmap candidates' },
    { date: '2026-07-19', tag: 'FEAT',  label: 'Countdown banner retargeted to Warzone 2007 S2 launch (2026-07-26)' },
    { date: '2026-07-19', tag: 'FIX',   label: 'RONY-FREE placeholder leak removed everywhere (no more broadcasting the free code)' },
    { date: '2026-07-19', tag: 'FIX',   label: 'Season selector modal replaces ugly native prompt() dialog across 8 static tools' },
    { date: '2026-07-19', tag: 'FIX',   label: 'Corrected S2 temperature curve to 7-band progression (-20 → -130°C)' },
    { date: '2026-07-19', tag: 'FIX',   label: 'S2 diagram cards no longer stretch — dead space between Thermal / Warlord / Megahive fixed' },
    { date: '2026-07-19', tag: 'FIX',   label: '"Premium spawn spots" explanation added — full 2-tile gap rule spelled out' },
    { date: '2026-07-19', tag: 'FIX',   label: 'Landing Planner hover glow + connector line alignment' },
    { date: '2026-07-19', tag: 'FIX',   label: 'Sign out button added to unlock page (clears cookies + reloads)' },
    { date: '2026-07-19', tag: 'FIX',   label: 'CSV/JSON export locked down in Roster Extractor (protects extraction pipeline IP)' },
    { date: '2026-07-19', tag: 'FIX',   label: 'Moonpetal Circle fictional demo replaces real Tino alliance fixture (doxing risk killed)' },
    { date: '2026-07-19', tag: 'FIX',   label: 'HEAD method now returns 200 (was 501) — SEO crawlers + monitors get proper responses' },
    { date: '2026-07-19', tag: 'KB',    label: 'kb/16-map-dimensions.md written — verified tile math (1200×1200 map, HQ=2×2, 4 hive layouts)' },
    { date: '2026-07-19', tag: 'KB',    label: 'kb/17-seasons-catalog.md — adversarially-verified S1-S5 names + Polar Dishes + Titanium Alloy + coal sources' },
    { date: '2026-07-19', tag: 'RESEARCH', label: 'Deep research pass #1 — Polar Storm palette + 24 screenshot URLs sourced' },
    { date: '2026-07-19', tag: 'RESEARCH', label: 'Deep research pass #2 — S4 Evernight Isle + S5 Wild West confirmed 3-0' },
    { date: '2026-07-19', tag: 'RESEARCH', label: 'Deep research pass #3 — Arms Race schedule + VS Days rotation + Black Market corrected to 28-day seasonal' },
    { date: '2026-07-19', tag: 'RESEARCH', label: 'Warzone list research — ~2,400 total warzones, 64-wide Transfer Groups, highest #2847 live' },
    { date: '2026-07-19', tag: 'API',   label: 'POST /api/feedback/vote — paid-tier feature poll endpoint' },
    { date: '2026-07-19', tag: 'API',   label: 'POST /api/warzone/contribute — crowdsource per-warzone season data' },
    { date: '2026-07-19', tag: 'API',   label: '8 endpoints for Coordination Directory + R5 claim' },
    { date: '2026-07-19', tag: 'API',   label: '4 endpoints for Alliance List cross-warzone extraction' },
    { date: '2026-07-19', tag: 'API',   label: 'GET /api/live-roster returns roster_freshness state + suggested uploader' },
    { date: '2026-07-18', tag: 'FEAT',  label: 'Redaviatrix — first Founding buyer at $30, code hand-delivered' },
    { date: '2026-07-17', tag: 'MARK',  label: '2h marketing loop: 1,400-URL SEO farm + KR/JP/PT/ES i18n + drip campaign' },
    { date: '2026-07-15', tag: 'MARK',  label: 'SEO farm scaffolding' },
    { date: '2026-07-14', tag: 'KB',    label: 'LWS Knowledge Base — 15 reference articles' },
  ];

  var TAG_COLORS = {
    FEAT:     '#8ae0a3',
    FIX:      '#e0c080',
    API:      '#7dd8f0',
    KB:       '#c9a961',
    RESEARCH: '#a78bfa',
    DATA:     '#5fd66b',
    SMTP:     '#f39c3b',
    MARK:     '#e08a8a',
  };

  function pickLang() {
    try {
      var stored = localStorage.getItem('lang') || localStorage.getItem('lws_lang');
      if (stored === 'kr' || stored === 'ko') return 'kr';
    } catch (e) {}
    var nav = (navigator.language || 'en').toLowerCase();
    return (nav.indexOf('ko') === 0 || nav.indexOf('kr') === 0) ? 'kr' : 'en';
  }
  var lang = pickLang();
  var pillLabel = lang === 'kr' ? '🔥 최근 업데이트' : '🔥 recently shipped';
  var titleLabel = lang === 'kr' ? '최근 배포 이력' : 'Recent deploys';
  var subLabel = lang === 'kr' ? 'r5tools.io는 매일 개선되고 있습니다.' : 'r5tools.io ships improvements daily.';

  function mount() {
    var pill = document.createElement('div');
    pill.id = 'lws-changelog-pill';
    pill.textContent = pillLabel;
    pill.setAttribute('role', 'button');
    pill.setAttribute('tabindex', '0');
    pill.style.cssText = [
      'position:fixed', 'bottom:20px', 'right:20px', 'z-index:9996',
      'background:rgba(13,20,36,0.92)', 'backdrop-filter:blur(6px)',
      'color:#c9a961', 'border:1px solid rgba(201,169,97,0.35)',
      'border-radius:22px', 'padding:8px 14px', 'font-size:11.5px',
      'font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans KR",sans-serif',
      'font-weight:600', 'letter-spacing:0.04em', 'cursor:pointer',
      'box-shadow:0 4px 14px rgba(0,0,0,0.3)', 'user-select:none',
      'transition:background 0.15s,border-color 0.15s,transform 0.12s',
    ].join(';');
    pill.addEventListener('mouseenter', function () { pill.style.background = 'rgba(201,169,97,0.18)'; pill.style.borderColor = 'rgba(201,169,97,0.7)'; pill.style.transform = 'translateY(-2px)'; showPanel(); });
    pill.addEventListener('mouseleave', function () { pill.style.background = 'rgba(13,20,36,0.92)'; pill.style.borderColor = 'rgba(201,169,97,0.35)'; pill.style.transform = 'translateY(0)'; scheduleHide(); });
    pill.addEventListener('click', function () { showPanel(true); });
    pill.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPanel(true); } });
    document.body.appendChild(pill);
  }

  var hideTimer = null;
  var panel = null;
  var pinned = false;

  function scheduleHide() {
    if (pinned) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { if (panel && !pinned) { panel.style.opacity = '0'; panel.style.pointerEvents = 'none'; } }, 250);
  }

  function showPanel(pinIt) {
    if (pinIt) pinned = true;
    clearTimeout(hideTimer);
    if (!panel) buildPanel();
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
  }

  function buildPanel() {
    panel = document.createElement('div');
    panel.id = 'lws-changelog-panel';
    panel.style.cssText = [
      'position:fixed', 'bottom:64px', 'right:20px', 'z-index:9996',
      'background:rgba(13,20,36,0.98)', 'backdrop-filter:blur(10px)',
      'border:1px solid rgba(201,169,97,0.4)', 'border-radius:10px',
      'padding:16px 18px', 'width:calc(100% - 40px)', 'max-width:460px',
      'max-height:70vh', 'overflow-y:auto',
      'color:#e6e8ee', 'font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans KR",sans-serif',
      'box-shadow:0 12px 40px rgba(0,0,0,0.6)', 'opacity:0', 'pointer-events:none',
      'transition:opacity 0.15s',
    ].join(';');
    panel.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    panel.addEventListener('mouseleave', function () { scheduleHide(); });

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.08)';
    header.innerHTML = '<div><div style="color:#c9a961;font-size:14px;font-weight:700;letter-spacing:0.02em">' + titleLabel + '</div><div style="color:#7a8290;font-size:11px;margin-top:2px">' + subLabel + '</div></div>';
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.style.cssText = 'background:transparent;color:#7a8290;border:none;font-size:22px;line-height:1;cursor:pointer;padding:0 4px;font-family:inherit';
    closeBtn.addEventListener('click', function () { pinned = false; panel.style.opacity = '0'; panel.style.pointerEvents = 'none'; });
    header.appendChild(closeBtn);
    panel.appendChild(header);

    var list = document.createElement('div');
    list.style.cssText = 'margin-top:10px;display:flex;flex-direction:column;gap:6px';
    var lastDate = '';
    CHANGES.forEach(function (c) {
      if (c.date !== lastDate) {
        var d = document.createElement('div');
        d.textContent = c.date;
        d.style.cssText = 'color:#7a8290;font-size:10.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:0.04em;text-transform:uppercase;margin:8px 0 2px';
        list.appendChild(d);
        lastDate = c.date;
      }
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:8px;align-items:flex-start;padding:4px 0';
      var color = TAG_COLORS[c.tag] || '#a8b0c0';
      row.innerHTML =
        '<span style="min-width:64px;font-size:9.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:' + color + ';background:' + color + '22;padding:2px 6px;border-radius:3px;letter-spacing:0.05em;font-weight:700;text-align:center">' + c.tag + '</span>' +
        '<span style="flex:1;color:#c8ccd6;font-size:12.5px;line-height:1.45">' + c.label + '</span>';
      list.appendChild(row);
    });
    panel.appendChild(list);

    var footer = document.createElement('div');
    footer.style.cssText = 'margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);color:#7a8290;font-size:10.5px;line-height:1.5';
    footer.innerHTML = (lang === 'kr'
      ? '변경사항은 CHANGES 배열에 있습니다 (recent-changelog.js). 다음 페이지 로드 시 갱신됩니다.'
      : 'New shipments append to the CHANGES array in <code style="color:#c9a961">recent-changelog.js</code>. Widget rebuilds on next page load.'
    );
    panel.appendChild(footer);

    document.body.appendChild(panel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
