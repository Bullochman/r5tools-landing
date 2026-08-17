/**
 * Fake-server shim for static GH Pages deploy of LWS Heat Simulator.
 * Intercepts /api/snapshot, /api/compute, /api/roster/upload.
 */
(function () {
  'use strict';

  const SNAPSHOT_PAYLOAD =
{"warzone": null, "capitol": {"x": 600, "y": 600}, "alliance_furnace": null, "cities": [], "roster": [], "blizzard": "none", "_constants": {"ambient_bands_c": [-15, -30, -40, -50, -60, -70, -80], "freeze_threshold_c": -20, "blizzard_drop_c": {"none": 0, "w1": 0, "w2": -10, "w3": -30, "w4": -50, "w5": -70, "w6": -90, "w7": -110, "w1_2": -10, "w4_plus": -50}, "cold_wave_min_c_by_week": {"1": -20, "2": -30, "3": -50, "4": -70, "5": -90, "6": -110, "7": -130, "8": -130}, "max_heat_sources_c": {"high_heat_furnace_l30_overdrive": 30, "alliance_furnace_l20_overdrive": 25, "captured_city_l6": 60, "tower_of_victory_l3": 5, "intensive_overload_research": 6, "village_station": 5, "engineer_firebomb_9x9_5min": 10}, "city_heat_by_level_c": {"1": 5, "2": 16, "3": 27, "4": 38, "5": 49, "6": 60}, "furnace_radius_l1_tiles": 4, "furnace_radius_l20_tiles": 12, "kb_gaps": [], "s4_blood_night": {"night_drain_per_min": 18000, "night_duration_min": 30, "night_windows_server": ["02:30", "10:30", "18:30"], "lighthouse_vr_by_level": [50, 150, 250, 250], "divine_tree_vr_during_night": 250, "optoelectronic_lab_max_level": 35}}};

  const STORAGE_KEY = 'lws.heat-simulator.cfg.v1';
  const AMBIENT_BANDS_C = SNAPSHOT_PAYLOAD._constants.ambient_bands_c;
  const FREEZE_THRESHOLD_C = SNAPSHOT_PAYLOAD._constants.freeze_threshold_c;
  const BLIZZARD_DROP_C = SNAPSHOT_PAYLOAD._constants.blizzard_drop_c;

  function ambientAt(x, y, capitol) {
    const cx = capitol.x, cy = capitol.y;
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const maxDist = Math.sqrt(cx*cx + cy*cy) || 1;
    const ratio = Math.max(0, Math.min(1, 1 - dist / maxDist));
    const idx = Math.min(AMBIENT_BANDS_C.length - 1, Math.floor(ratio * AMBIENT_BANDS_C.length));
    return AMBIENT_BANDS_C[idx];
  }
  function computeBaseTemp(x, y, cfg, bonuses, blizzard) {
    const amb = ambientAt(x, y, cfg.capitol || { x: 600, y: 600 });
    const biz = BLIZZARD_DROP_C[blizzard] || 0;
    const bonusTotal = Object.values(bonuses || {}).reduce((a, b) => a + b, 0);
    const current = amb + biz + bonusTotal;
    return {
      ambient: amb, blizzard_drop: biz, bonus_total: bonusTotal, current,
      frozen: current < FREEZE_THRESHOLD_C, freeze_threshold: FREEZE_THRESHOLD_C,
    };
  }
  function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',');
      const row = {};
      headers.forEach((h, j) => row[h] = (cells[j] || '').trim());
      for (const nc of ['hq_level', 'total_power', 'x', 'y']) {
        if (row[nc]) { const n = parseFloat(row[nc]); if (!isNaN(n)) row[nc] = n; }
      }
      if (row.name) out.push(row);
    }
    return out;
  }
  function loadCfg() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign({}, SNAPSHOT_PAYLOAD, JSON.parse(raw));
    } catch (e) {}
    return SNAPSHOT_PAYLOAD;
  }
  function saveCfg(cfg) {
    const { _constants, ...persistable } = cfg;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable)); } catch (e) {}
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    const method = (init && init.method) || 'GET';
    if (url === '/api/snapshot' && method === 'GET') {
      const cfg = loadCfg();
      cfg._constants = SNAPSHOT_PAYLOAD._constants;
      return new Response(JSON.stringify(cfg), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url === '/api/compute' && method === 'POST') {
      const body = init && init.body ? JSON.parse(init.body) : {};
      const cfg = loadCfg();
      const result = computeBaseTemp(body.x || 0, body.y || 0, cfg, body.bonuses, body.blizzard || 'none');
      return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url === '/api/roster/upload' && method === 'POST') {
      const body = init && init.body ? JSON.parse(init.body) : {};
      const roster = parseCsv(body.csv || '');
      const cfg = loadCfg();
      cfg.roster = roster;
      saveCfg(cfg);
      return new Response(JSON.stringify({ roster, count: roster.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return realFetch(input, init);
  };
})();
