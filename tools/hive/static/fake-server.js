/**
 * Fake-server shim for static GH Pages deploy of Alliance Hive Grid Manager.
 * Monkey-patches window.fetch to intercept every /api/* route the client hits,
 * with a JS port of hive_server.py's logic. State persists to localStorage.
 * Client HTML unchanged.
 *
 * Full-stack version: Bullochman/hivegrid (Python http.server + JSON on disk).
 */
(function () {
  'use strict';

  // ── Constants ────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'hivegrid_state';
  const FEEDBACK_KEY = 'hivegrid_feedback';
  const KR_ALLIANCE_KEY = 'HIVE-KR-ALLIANCE-2026';
  const HARDCODED_VALID_KEYS = new Set([
    KR_ALLIANCE_KEY,
    'HIVE-B820D1-CA0AA7',   // legacy paid customer key from source project's keys.json
  ]);

  // Schema-version tag written into every persisted cfg. Bumped 2026-07-20 when
  // the KB-canonical 2×2 HQ footprint replaced the buggy 3×3 assumption — every
  // stronghold slot coordinate saved under v1 is off-grid under v2 and must be
  // dropped so the auto-assign can re-place members on the corrected slot list.
  const SCHEMA_VERSION = 2;

  // Layout presets — mirror LAYOUT_PRESETS in hive_server.py
  //
  // Canonical tile math per LWS_Knowledge_Base/kb/16-map-dimensions.md
  // (2026-07-19, community-planner consensus verified against
  // cpt-hedge.com/maps/planner + lastwarhiveplanner.com):
  //   - Player HQ world-map footprint = 2×2 tiles (NOT 3×3 — that number
  //     refers to the internal base-view sub-grid)
  //   - Polar Storm hive gap = 2 tiles → pitch = 4 tiles (HQ 2 + gap 2)
  //   - Marshal's Guard hive: pack tight, 0-tile gap → pitch = 2 tiles
  //     (MG mode below uses a per-cell abstraction — grid.step encodes the
  //     tight MG pitch since one planner cell = one HQ)
  const LAYOUT_PRESETS = {
    mg: {
      label: "Marshall's Guard",
      short: 'MG',
      use_tile_coords: false,
      center_size: 1,
      grid_size: 10,
    },
    stronghold: {
      label: 'Military Stronghold',
      short: 'Stronghold',
      use_tile_coords: true,
      center_tiles: 21,
      // 2×2 HQ footprint per KB-canonical map math (was 3 pre-2026-07-20).
      // With pitch = member_size + gap_tiles = 4, a 21×21 furnace + 4 rings
      // yields 144 slots (Ring 1=24, R2=32, R3=40, R4=48) inside a ~54×54
      // tile footprint — comfortable for a full 100-member alliance.
      member_size: 2,
      gap_tiles: 2,
      max_rings: 4,
      center_size: 7,
      grid_size: 13,
    },
  };

  const CENTER_LABEL = {
    mg: { en: "Marshall's Guard", ko: '원수 근위대' },
    stronghold: { en: 'Military Stronghold', ko: '군사 요새' },
  };

  const ERROR_MSGS = {
    en: {
      invalid_move: 'Invalid move',
      into_center: 'Cannot move into {label}',
      name_required: 'Name required',
      cell_is_center: 'That cell is part of the {label}',
      invalid_key: 'Invalid key',
      xy_int: 'x and y must be integers',
      unknown_layout: 'Unknown layout: {mode}',
    },
    ko: {
      invalid_move: '잘못된 이동',
      into_center: '{label} 안으로 이동할 수 없습니다',
      name_required: '이름이 필요합니다',
      cell_is_center: '이 셀은 {label}의 일부입니다',
      invalid_key: '유효하지 않은 키',
      xy_int: 'x와 y는 정수여야 합니다',
      unknown_layout: '알 수 없는 배치: {mode}',
    },
  };

  const RANK_ORD = { R5: 0, R4: 1, R3: 2, R2: 3, R1: 4 };

  // ── Default config (mirrors hive_config.example.json) ────────────────────
  // grid.step is the MG-mode pitch (tiles per planner cell). Set to 2 to
  // match the KB-canonical 2×2 HQ footprint under a tight Marshal's Guard
  // pack (0-tile gap). Community consensus for a defensive standard-warzone
  // hive is 3-tile pitch (2 HQ + 1 gap); that variant lives on the
  // formation dropdown and only affects the label — the underlying MG
  // renderer still uses one cell per member.
  function defaultConfig() {
    return {
      alliance_name: '',
      unlocked: false,
      schema: SCHEMA_VERSION,
      mg: { x: 486, y: 432 },
      grid: { cols: 10, rows: 10, mg_col: 4, mg_row: 4, step: 2 },
      members: {},
      assignments: {},
    };
  }

  // ── State persistence ────────────────────────────────────────────────────
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const cfg = defaultConfig();
        return ensureLayout(cfg);
      }
      const cfg = JSON.parse(raw);
      // Schema migration: v1 saved stronghold assignments on the buggy 3×3
      // (5-tile-pitch) grid. Under v2 those coordinates no longer land on
      // valid slots, so purge them and force the grid.step down to the new
      // 2-tile MG pitch. Members + metadata are preserved so the user can
      // re-run ⚡ Auto-Assign after the reload.
      if (!cfg.schema || cfg.schema < SCHEMA_VERSION) {
        console.info('[fake-server] migrating hivegrid_state → schema v' + SCHEMA_VERSION + ' (KB-canonical 2×2 HQ footprint)');
        cfg.schema = SCHEMA_VERSION;
        cfg.assignments = {};                        // drop stale placements
        if (cfg.grid) cfg.grid.step = 2;             // MG-mode pitch → 2 tiles
      }
      const enforced = ensureLayout(cfg);
      // Evict orphan stronghold assignments (positions no longer valid)
      if (enforced.layout && enforced.layout.use_tile_coords) {
        const validKeys = new Set(
          strongholdSlotList().map((s) => `${s[0]},${s[1]}`)
        );
        for (const k of Object.keys(enforced.assignments)) {
          if (!validKeys.has(k)) delete enforced.assignments[k];
        }
      }
      return enforced;
    } catch (e) {
      console.warn('[fake-server] loadState failed, resetting:', e);
      const cfg = defaultConfig();
      return ensureLayout(cfg);
    }
  }

  function saveState(cfg) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    } catch (e) {
      console.error('[fake-server] saveState failed:', e);
    }
  }

  // ── Layout helpers (mirror _ensure_layout / _center_half / _is_center / _ring_dist) ──
  function ensureLayout(cfg) {
    if (!cfg.layout) cfg.layout = { mode: 'mg' };
    let mode = cfg.layout.mode || 'mg';
    if (!LAYOUT_PRESETS[mode]) {
      mode = 'mg';
      cfg.layout.mode = mode;
    }
    const preset = LAYOUT_PRESETS[mode];
    for (const k of Object.keys(preset)) {
      cfg.layout[k] = preset[k];
    }
    // Ensure grid + mg exist (defensive for stale localStorage). MG-mode
    // grid.step defaults to 2 (matches the KB-canonical 2×2 HQ footprint —
    // Marshal's Guard hive packs tight with no gap).
    if (!cfg.grid) cfg.grid = { cols: 10, rows: 10, mg_col: 4, mg_row: 4, step: 2 };
    if (!cfg.mg) cfg.mg = { x: 486, y: 432 };
    if (!cfg.members) cfg.members = {};
    if (!cfg.assignments) cfg.assignments = {};
    if (typeof cfg.alliance_name !== 'string') cfg.alliance_name = '';
    if (typeof cfg.unlocked !== 'boolean') cfg.unlocked = false;
    if (typeof cfg.schema !== 'number') cfg.schema = SCHEMA_VERSION;
    return cfg;
  }

  function isCenter(cfg, c, r) {
    const mode = cfg.layout.mode;
    const preset = LAYOUT_PRESETS[mode];
    if (!preset.use_tile_coords) {
      const g = cfg.grid;
      const h = (preset.center_size - 1) >> 1;
      return Math.abs(c - g.mg_col) <= h && Math.abs(r - g.mg_row) <= h;
    }
    // Stronghold: member footprint at (c,r) top-left overlaps [-half, +half] centre?
    // (Footprint is 2×2 tiles per KB — see LAYOUT_PRESETS.stronghold.)
    const half = (preset.center_tiles - 1) >> 1;
    const member = preset.member_size;
    return (
      c + member - 1 >= -half &&
      c <= half &&
      r + member - 1 >= -half &&
      r <= half
    );
  }

  function ringDist(cfg, c, r) {
    const mode = cfg.layout.mode;
    const preset = LAYOUT_PRESETS[mode];
    if (!preset.use_tile_coords) {
      const g = cfg.grid;
      const h = (preset.center_size - 1) >> 1;
      const cheb = Math.max(Math.abs(c - g.mg_col), Math.abs(r - g.mg_row));
      return Math.max(0, cheb - h);
    }
    const half = (preset.center_tiles - 1) >> 1;
    const member = preset.member_size;
    const pitch = member + preset.gap_tiles;
    const dxOuter = c < 0 ? Math.abs(c) + (member - 1) : Math.abs(c + member - 1);
    const dyOuter = r < 0 ? Math.abs(r) + (member - 1) : Math.abs(r + member - 1);
    const dOuter = Math.max(dxOuter, dyOuter);
    if (dOuter <= half) return 0;
    return Math.floor((dOuter - half - 1) / pitch) + 1;
  }

  // ── Stronghold slot enumeration (mirrors stronghold_slot_list) ──────────
  function strongholdSlotList(preset) {
    const p = preset || LAYOUT_PRESETS.stronghold;
    const half = (p.center_tiles - 1) >> 1;
    const member = p.member_size;
    const gap = p.gap_tiles;
    const pitch = member + gap;
    const slots = [];
    for (let r = 1; r <= p.max_rings; r++) {
      const inner = half + 1 + (r - 1) * pitch;
      const outer = inner + member - 1;
      const edgeFirst = -outer + pitch;
      const edgeLast = inner - member;
      let nInner = 0;
      if (edgeLast >= edgeFirst) {
        nInner = Math.floor((edgeLast - edgeFirst) / pitch) + 1;
      }
      // Four corners first
      slots.push([-outer, -outer, r]); // NW
      slots.push([inner, -outer, r]);  // NE
      slots.push([inner, inner, r]);   // SE
      slots.push([-outer, inner, r]);  // SW
      // Round-robin inner edges
      for (let i = 0; i < nInner; i++) {
        const halfIdx = Math.floor(i / 2);
        const fromFar = i % 2 === 1;
        const pos = fromFar ? (nInner - 1 - halfIdx) : halfIdx;
        const x = edgeFirst + pos * pitch;
        slots.push([x, -outer, r]); // N inner
        slots.push([inner, x, r]);  // E inner
        slots.push([x, inner, r]);  // S inner
        slots.push([-outer, x, r]); // W inner
      }
    }
    return slots;
  }

  // ── Error helpers ────────────────────────────────────────────────────────
  function currentLang(headers) {
    // Client always sends X-Hive-Lang; default en.
    let hl = '';
    if (headers) {
      if (typeof headers.get === 'function') {
        hl = (headers.get('X-Hive-Lang') || '').toLowerCase().trim();
      } else if (headers['X-Hive-Lang']) {
        hl = String(headers['X-Hive-Lang']).toLowerCase().trim();
      }
    }
    if (ERROR_MSGS[hl]) return hl;
    const nl = (navigator.language || 'en').toLowerCase();
    return nl.startsWith('ko') ? 'ko' : 'en';
  }

  function errMsg(lang, key, fmt) {
    const msg = (ERROR_MSGS[lang] && ERROR_MSGS[lang][key]) || ERROR_MSGS.en[key] || key;
    if (!fmt) return msg;
    return msg.replace(/\{(\w+)\}/g, (_, k) => (k in fmt ? fmt[k] : `{${k}}`));
  }

  function centerLabelFor(cfg, lang) {
    const mode = cfg.layout.mode;
    return (CENTER_LABEL[mode] && CENTER_LABEL[mode][lang]) || cfg.layout.short;
  }

  // ── Response helpers ─────────────────────────────────────────────────────
  function jsonResponse(obj, status) {
    return new Response(JSON.stringify(obj), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  // ── Power parser ─────────────────────────────────────────────────────────
  function parsePow(p) {
    if (p == null) return 0;
    const s = String(p).replace('M', '').trim();
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  // ── CSV parser (matches csv.DictReader semantics) ────────────────────────
  function parseCsv(text) {
    // Simple RFC-4180-ish parser: handles quoted fields with embedded commas + newlines + "" escape.
    const rows = [];
    let field = '';
    let row = [];
    let i = 0;
    let inQuotes = false;
    const n = text.length;
    while (i < n) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < n && text[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        field += ch;
        i++;
      } else {
        if (ch === '"') {
          inQuotes = true;
          i++;
        } else if (ch === ',') {
          row.push(field);
          field = '';
          i++;
        } else if (ch === '\r') {
          // consume \r or \r\n
          if (i + 1 < n && text[i + 1] === '\n') i++;
          row.push(field);
          rows.push(row);
          row = [];
          field = '';
          i++;
        } else if (ch === '\n') {
          row.push(field);
          rows.push(row);
          row = [];
          field = '';
          i++;
        } else {
          field += ch;
          i++;
        }
      }
    }
    // last field / row
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    if (rows.length === 0) return [];
    const header = rows[0].map((h) => String(h || '').trim().replace(/:$/, ''));
    const out = [];
    for (let r = 1; r < rows.length; r++) {
      const rec = rows[r];
      if (rec.length === 1 && rec[0] === '') continue;
      const obj = {};
      for (let c = 0; c < header.length; c++) {
        obj[header[c]] = rec[c] != null ? rec[c] : '';
      }
      out.push(obj);
    }
    return out;
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleConfig() {
    const cfg = loadState();
    return jsonResponse(cfg);
  }

  function handleStrongholdSlots() {
    const slots = strongholdSlotList();
    return jsonResponse({
      ok: true,
      preset: LAYOUT_PRESETS.stronghold,
      slots: slots.map((s) => ({ tx: s[0], ty: s[1], ring: s[2] })),
    });
  }

  function handleStats() {
    return jsonResponse({
      ok: true,
      total_loads: 0,
      days: {},
      recent: [],
      note: 'static build — no server stats',
    });
  }

  function handleMove(data, lang) {
    const cfg = loadState();
    const centerLabel = centerLabelFor(cfg, lang);
    const src = data.from || '';
    const dst = data.to || '';
    if (!src || !dst || src === dst) {
      return jsonResponse({ ok: false, error: errMsg(lang, 'invalid_move') });
    }
    const [sc, sr] = src.split(',').map((x) => parseInt(x, 10));
    const [dc, dr] = dst.split(',').map((x) => parseInt(x, 10));
    if (isCenter(cfg, sc, sr) || isCenter(cfg, dc, dr)) {
      return jsonResponse({
        ok: false,
        error: errMsg(lang, 'into_center', { label: centerLabel }),
      });
    }
    const nameSrc = cfg.assignments[src];
    const nameDst = cfg.assignments[dst];
    delete cfg.assignments[src];
    delete cfg.assignments[dst];
    if (nameSrc) cfg.assignments[dst] = nameSrc;
    if (nameDst) cfg.assignments[src] = nameDst;
    saveState(cfg);
    return jsonResponse({ ok: true, config: cfg });
  }

  function handleAssign(data, lang) {
    const cfg = loadState();
    const centerLabel = centerLabelFor(cfg, lang);
    const name = String(data.name || '').trim();
    const col = parseInt(data.col, 10) || 0;
    const row = parseInt(data.row, 10) || 0;
    if (!name) {
      return jsonResponse({ ok: false, error: errMsg(lang, 'name_required') });
    }
    if (isCenter(cfg, col, row)) {
      return jsonResponse({
        ok: false,
        error: errMsg(lang, 'cell_is_center', { label: centerLabel }),
      });
    }
    // Remove from old position
    for (const k of Object.keys(cfg.assignments)) {
      if (cfg.assignments[k] === name) {
        delete cfg.assignments[k];
        break;
      }
    }
    cfg.assignments[`${col},${row}`] = name;
    if (!cfg.members[name]) {
      cfg.members[name] = { rank: '', hq: null, power: null, notes: '' };
    }
    saveState(cfg);
    return jsonResponse({ ok: true, config: cfg });
  }

  function handleEdit(data, lang) {
    const cfg = loadState();
    const oldName = String(data.old_name || '').trim();
    const newName = String(data.name || '').trim();
    const rank = String(data.rank || '').trim();
    const pw = String(data.power || '').trim() || null;
    const note = String(data.notes || '').trim();
    let hq = null;
    if (data.hq != null && data.hq !== '') {
      const n = parseInt(data.hq, 10);
      hq = isNaN(n) ? null : n;
    }
    if (!newName) {
      return jsonResponse({ ok: false, error: errMsg(lang, 'name_required') });
    }
    // Current grid position of old member
    let posKey = null;
    for (const k of Object.keys(cfg.assignments)) {
      if (cfg.assignments[k] === oldName) {
        posKey = k;
        break;
      }
    }
    if (oldName && cfg.members[oldName]) {
      delete cfg.members[oldName];
    }
    cfg.members[newName] = { rank, hq, power: pw, notes: note };
    if (posKey && oldName !== newName) {
      cfg.assignments[posKey] = newName;
    }
    saveState(cfg);
    return jsonResponse({ ok: true, config: cfg });
  }

  function handleUnassign(data) {
    const cfg = loadState();
    const name = String(data.name || '').trim();
    for (const k of Object.keys(cfg.assignments)) {
      if (cfg.assignments[k] === name) {
        delete cfg.assignments[k];
        break;
      }
    }
    saveState(cfg);
    return jsonResponse({ ok: true, config: cfg });
  }

  function handleDelete(data) {
    const cfg = loadState();
    const name = String(data.name || '').trim();
    for (const k of Object.keys(cfg.assignments)) {
      if (cfg.assignments[k] === name) {
        delete cfg.assignments[k];
        break;
      }
    }
    delete cfg.members[name];
    saveState(cfg);
    return jsonResponse({ ok: true, config: cfg });
  }

  function handleSetName(data) {
    const cfg = loadState();
    cfg.alliance_name = String(data.alliance_name || '').trim();
    saveState(cfg);
    return jsonResponse({ ok: true, config: cfg });
  }

  function handleUnlock(data, lang) {
    const cfg = loadState();
    const key = String(data.key || '').trim().toUpperCase();
    if (HARDCODED_VALID_KEYS.has(key)) {
      cfg.unlocked = true;
      saveState(cfg);
      return jsonResponse({ ok: true, config: cfg });
    }
    return jsonResponse({ ok: false, error: errMsg(lang, 'invalid_key') });
  }

  function handleSetMg(data, lang) {
    const cfg = loadState();
    let nx, ny;
    try {
      nx = parseInt(data.x != null ? data.x : cfg.mg.x, 10);
      ny = parseInt(data.y != null ? data.y : cfg.mg.y, 10);
      if (isNaN(nx) || isNaN(ny)) throw new Error();
    } catch (e) {
      return jsonResponse({ ok: false, error: errMsg(lang, 'xy_int') });
    }
    cfg.mg.x = nx;
    cfg.mg.y = ny;
    saveState(cfg);
    return jsonResponse({ ok: true, config: cfg });
  }

  function handleFeedback(data) {
    const name = String(data.name || 'Anonymous').trim().slice(0, 60);
    const votes = (Array.isArray(data.votes) ? data.votes : [])
      .filter((v) => typeof v === 'string')
      .map((v) => String(v).slice(0, 40));
    const comment = String(data.comment || '').trim().slice(0, 500);
    const entry = { ts: Math.floor(Date.now() / 1000), name, votes, comment };
    let queue = [];
    try {
      const raw = localStorage.getItem(FEEDBACK_KEY);
      if (raw) queue = JSON.parse(raw);
      if (!Array.isArray(queue)) queue = [];
    } catch (e) {
      queue = [];
    }
    queue.push(entry);
    try {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('[fake-server] feedback save failed:', e);
    }
    console.log('[fake-server] feedback captured:', entry);
    return jsonResponse({ ok: true });
  }

  function handleClear(data) {
    const cfg = loadState();
    const mode = data.mode || 'assignments';
    cfg.assignments = {};
    if (mode === 'all') cfg.members = {};
    saveState(cfg);
    return jsonResponse({ ok: true, config: cfg });
  }

  function handleUploadCsv(data) {
    const cfg = loadState();
    const csvText = String(data.csv || '');
    const rows = parseCsv(csvText);
    let added = 0;
    let updated = 0;
    for (const row of rows) {
      const name = String(row.Member || row.Name || '').trim();
      if (!name) continue;
      const rank = String(row.Rank || '').trim();
      const hqRaw = String(row['HQ Level'] || row['HQ Lv.'] || '').trim();
      const power = String(row['Total Power'] || '').trim() || null;
      const notes = String(row.Notes || '').trim();
      let hq = null;
      if (hqRaw) {
        const n = parseInt(hqRaw, 10);
        hq = isNaN(n) ? null : n;
      }
      const entry = { rank, hq, power, notes };
      if (cfg.members[name]) {
        const prev = cfg.members[name];
        const roNew = RANK_ORD[rank] != null ? RANK_ORD[rank] : 5;
        const roPrev = RANK_ORD[prev.rank || ''] != null ? RANK_ORD[prev.rank || ''] : 5;
        if (
          roNew < roPrev ||
          (roNew === roPrev && parsePow(power) >= parsePow(prev.power))
        ) {
          cfg.members[name] = entry;
        }
        updated++;
      } else {
        cfg.members[name] = entry;
        added++;
      }
    }
    saveState(cfg);
    return jsonResponse({ ok: true, added, updated, config: cfg });
  }

  function handleSetLayout(data, lang) {
    const cfg = loadState();
    const mode = String(data.mode || '').trim().toLowerCase();
    if (!LAYOUT_PRESETS[mode]) {
      return jsonResponse({
        ok: false,
        error: errMsg(lang, 'unknown_layout', { mode }),
      });
    }
    const preset = LAYOUT_PRESETS[mode];
    const prevMode = (cfg.layout && cfg.layout.mode) || 'mg';
    cfg.layout = { mode };
    const newSize = preset.grid_size;
    cfg.grid.cols = newSize;
    cfg.grid.rows = newSize;
    cfg.grid.mg_col = Math.floor(newSize / 2);
    cfg.grid.mg_row = Math.floor(newSize / 2);
    // 2-tile pitch per KB-canonical 2×2 HQ footprint (was 3 pre-2026-07-20).
    cfg.grid.step = 2;
    ensureLayout(cfg);
    let evicted = 0;
    if (prevMode !== mode) {
      evicted = Object.keys(cfg.assignments).length;
      cfg.assignments = {};
    } else {
      for (const k of Object.keys(cfg.assignments)) {
        const parts = k.split(',');
        const c = parseInt(parts[0], 10);
        const r = parseInt(parts[1], 10);
        if (isNaN(c) || isNaN(r)) {
          delete cfg.assignments[k];
          evicted++;
          continue;
        }
        if (isCenter(cfg, c, r)) {
          delete cfg.assignments[k];
          evicted++;
        }
      }
    }
    saveState(cfg);
    return jsonResponse({ ok: true, evicted, config: cfg });
  }

  function handleAuto(data) {
    const cfg = loadState();
    const g = cfg.grid;
    const mc = g.mg_col;
    const mr = g.mg_row;

    const sortBy = String(data.sort_by || 'rank,power').trim();
    const fields = sortBy.split(',').map((s) => s.trim()).filter(Boolean);

    function makeKey(name) {
      const m = cfg.members[name] || {};
      const key = [];
      for (const f of fields) {
        if (f === 'rank') {
          key.push(RANK_ORD[m.rank || ''] != null ? RANK_ORD[m.rank || ''] : 5);
        } else if (f === 'hq') {
          const hq = parseInt(m.hq || 0, 10) || 0;
          key.push(-hq);
        } else if (f === 'power') {
          key.push(-parsePow(m.power));
        }
      }
      return key;
    }

    function cmpKey(a, b) {
      const ka = makeKey(a);
      const kb = makeKey(b);
      for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
        const av = ka[i] != null ? ka[i] : 0;
        const bv = kb[i] != null ? kb[i] : 0;
        if (av !== bv) return av - bv;
      }
      // tie-break by name for determinism (Python sort was stable on insertion order)
      return a < b ? -1 : a > b ? 1 : 0;
    }

    const assigned = new Set(Object.values(cfg.assignments));
    const unassigned = Object.keys(cfg.members).filter((n) => !assigned.has(n));

    let queue;
    if (fields.length && fields[0] === 'rank') {
      const r4r5 = unassigned
        .filter((n) => {
          const rk = (cfg.members[n] && cfg.members[n].rank) || '';
          return rk === 'R5' || rk === 'R4';
        })
        .sort(cmpKey);
      const r4r5Set = new Set(r4r5);
      const others = unassigned.filter((n) => !r4r5Set.has(n)).sort(cmpKey);
      queue = r4r5.concat(others);
    } else {
      queue = unassigned.slice().sort(cmpKey);
    }

    const mode = cfg.layout.mode;
    let placed = 0;
    if (LAYOUT_PRESETS[mode].use_tile_coords) {
      const empty = [];
      for (const [tx, ty] of strongholdSlotList()) {
        const k = `${tx},${ty}`;
        if (!cfg.assignments[k]) empty.push([tx, ty]);
      }
      const n = Math.min(queue.length, empty.length);
      for (let i = 0; i < n; i++) {
        const [tx, ty] = empty[i];
        cfg.assignments[`${tx},${ty}`] = queue[i];
        placed++;
      }
    } else {
      const empty = [];
      for (let c = 0; c < g.cols; c++) {
        for (let r = 0; r < g.rows; r++) {
          const k = `${c},${r}`;
          if (!cfg.assignments[k] && !(c === mc && r === mr)) {
            const dist = Math.max(Math.abs(c - mc), Math.abs(r - mr));
            const angle = Math.atan2(c - mc, -(r - mr));
            empty.push([dist, angle, c, r]);
          }
        }
      }
      empty.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3]);
      const n = Math.min(queue.length, empty.length);
      for (let i = 0; i < n; i++) {
        const [, , c, r] = empty[i];
        cfg.assignments[`${c},${r}`] = queue[i];
        placed++;
      }
    }
    saveState(cfg);
    return jsonResponse({ ok: true, placed, config: cfg });
  }

  function handleGetFeedback() {
    let data = [];
    try {
      const raw = localStorage.getItem(FEEDBACK_KEY);
      if (raw) data = JSON.parse(raw);
      if (!Array.isArray(data)) data = [];
    } catch (e) {
      data = [];
    }
    return jsonResponse({ ok: true, count: data.length, feedback: data });
  }

  // ── Fetch monkey-patch ───────────────────────────────────────────────────
  const realFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    // Only intercept same-origin /api/* calls (leave any external URLs alone)
    const isApi = url.startsWith('/api/') || url.indexOf(location.origin + '/api/') === 0;
    if (!isApi) return realFetch(input, init);

    const path = url.replace(location.origin, '').split('?')[0];
    const method = (init && init.method) || 'GET';
    const headers = (init && init.headers) || {};
    const lang = currentLang(headers);

    let body = {};
    if (init && init.body) {
      try {
        body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
      } catch (e) {
        body = {};
      }
    }

    try {
      // GET routes
      if (method === 'GET' || method === 'HEAD') {
        if (path === '/api/config') return handleConfig();
        if (path === '/api/stronghold-slots') return handleStrongholdSlots();
        if (path === '/api/stats') return handleStats();
        if (path === '/api/get-feedback') return handleGetFeedback();
      }
      // POST routes
      if (path === '/api/move') return handleMove(body, lang);
      if (path === '/api/assign') return handleAssign(body, lang);
      if (path === '/api/edit') return handleEdit(body, lang);
      if (path === '/api/unassign') return handleUnassign(body);
      if (path === '/api/delete') return handleDelete(body);
      if (path === '/api/set-name') return handleSetName(body);
      if (path === '/api/unlock') return handleUnlock(body, lang);
      if (path === '/api/set-mg') return handleSetMg(body, lang);
      if (path === '/api/feedback') return handleFeedback(body);
      if (path === '/api/clear') return handleClear(body);
      if (path === '/api/upload-csv') return handleUploadCsv(body);
      if (path === '/api/set-layout') return handleSetLayout(body, lang);
      if (path === '/api/auto') return handleAuto(body);
      // Unknown /api/*
      return jsonResponse({ ok: false, error: 'Not found (static build)' }, 404);
    } catch (e) {
      console.error('[fake-server] handler error for', path, e);
      return jsonResponse({ ok: false, error: String(e && e.message || e) }, 500);
    }
  };

  // Expose internals for debugging
  window.__HiveFakeServer = {
    loadState,
    saveState,
    defaultConfig,
    strongholdSlotList,
    ensureLayout,
    isCenter,
    ringDist,
    HARDCODED_VALID_KEYS,
  };
})();
