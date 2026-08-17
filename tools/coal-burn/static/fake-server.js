/**
 * Fake-server shim for GH Pages static deploy.
 *
 * The Coal Burn Calculator's client (index.html) calls /api/coal/single and
 * /api/coal/batch. On the full-stack version those are Python endpoints in
 * server.py. On GH Pages there's no server, so we monkey-patch window.fetch
 * to intercept those paths and compute the response locally in JS.
 *
 * v0.4 — Season-agnostic refactor:
 *   - Burn rates are no longer hardcoded. At boot we call LWSSeasons.loadAll()
 *     and read S2's mechanics_config for the AF (Alliance Furnace) and HHF
 *     (High-Heat / personal Home Heating Furnace) coal-per-min anchors:
 *       af_coal_per_min_l20.{normal,overdrive}
 *       hhf_coal_per_min_l30_approx.{normal,overdrive}
 *   - Overdrive multiplier is derived from the ratio, not hardcoded.
 *   - For non-S2 seasons we short-circuit /api/coal/* with an "inactive" result
 *     so the UI can render a "Coal doesn't apply this season" placeholder.
 *   - We listen for `lws:season-changed` and reset the cache so the next fetch
 *     picks up new context.
 */
(function () {
  'use strict';

  // ---- Season-derived config cache ----
  // Populated by loadSeasonConfig(); kept per-season-id so a season override
  // doesn't force a re-fetch on every request.
  var _cfgCache = {};      // seasonId -> { active, hhfL30Normal, hhfL1Normal, overdriveMul, seasonName, primaryResource }
  var _currentCtx = null;  // last resolved { seasonId, season }
  var _readyPromise = null;

  // Fallback anchors (used only if LWSSeasons is missing at boot — matches
  // the pre-refactor placeholders in server.py so behavior is unchanged when
  // the seasons lib fails to load).
  var FALLBACK_HHF_L1_NORMAL = 30;      // coal/min at L1
  var FALLBACK_HHF_L30_NORMAL = 450;    // coal/min at L30
  var FALLBACK_OVERDRIVE_MUL = 4;       // KB: [[06-season-2-frozen]]
  var SAFE_BUFFER_RATIO = 0.20;

  // Per-season "primary resource that replaces coal" — read from mechanics_config
  // where possible, else falls back to this map so the placeholder message
  // reads naturally.
  // v0.5 note: S1 changed from 'Virus Tokens' (event drops, not a stockpile
  // metric) to 'Virus Resistance' (actual S1 planning currency for Corruptor
  // fights, KB [[05-season-1-crimson-plague]] §16.3).
  var SEASON_PRIMARY_RESOURCE = {
    's1-crimson-plague': 'Virus Resistance',
    's3-golden-kingdom': 'Spice',
    's4-evernight-isle': 'Copper',
    's5-wild-west': 'CrystalGold',
    's6-shadow-rainforest': 'Awakening Shards',
    's7-unnamed': 'TBD',
    'pre-season': 'n/a',
    'off-season': 'n/a',
  };

  // Per-season variant registry. When the current season has an entry here,
  // the client swaps in a season-specific Single-mode form + math (via
  // buildVariantConfig). Seasons NOT in this table fall through to the plain
  // "inactive banner" placeholder (S1 stays banner-only, since Crimson Plague
  // has no per-member resource-window budget analog).
  //
  // Each entry describes the resource label + basic tool identity — full math
  // lives client-side in index.html's renderSeasonMode(), and the endpoints
  // route through inactiveVariantResult() below (single/batch return a
  // shape-compatible payload that the client renders differently).
  var SEASON_VARIANTS = {
    's3-golden-kingdom': {
      tool_title_key: 's3ToolTitle',
      lede_key: 's3Lede',
      primary_resource: 'Spice',
      variant_kind: 'stockpile-vs-window',
    },
    's4-evernight-isle': {
      tool_title_key: 's4ToolTitle',
      lede_key: 's4Lede',
      primary_resource: 'Copper',
      variant_kind: 'stockpile-vs-window',
    },
    's5-wild-west': {
      tool_title_key: 's5ToolTitle',
      lede_key: 's5Lede',
      primary_resource: 'CrystalGold',
      variant_kind: 'bank-interest',
    },
    's6-shadow-rainforest': {
      tool_title_key: 's6ToolTitle',
      lede_key: 's6Lede',
      primary_resource: 'Awakening Shards',
      variant_kind: 'awakening-shards',
    },
    // S1: intentionally no entry — the banner-only placeholder is more honest
    // than fake math. See per_season_plan → s1-crimson-plague.
  };

  function inferPrimaryResource(seasonId, mc) {
    // Direct-key preference so KB updates can override the fallback table.
    if (mc && (mc.primary_resource || mc.resource)) return mc.primary_resource || mc.resource;
    return SEASON_PRIMARY_RESOURCE[seasonId] || 'the season resource';
  }

  function buildS2Config(mc, seasonName) {
    // S2 Polar Storm — coal is the primary resource.
    // Anchor the personal-furnace L30 normal burn to HHF, then linearly
    // interpolate down to a "small" L1 anchor. We keep the ratio between
    // L1 and L30 the same as the historical placeholder (30 / 450 = 1/15)
    // so behavior at L1 is stable while the L30 value scales with KB updates.
    var hhf = (mc && mc.hhf_coal_per_min_l30_approx) || {};
    var hhfL30Normal = Number(hhf.normal) || FALLBACK_HHF_L30_NORMAL;
    var hhfL30Over = Number(hhf.overdrive) || (hhfL30Normal * FALLBACK_OVERDRIVE_MUL);
    var overdriveMul = hhfL30Normal > 0 ? (hhfL30Over / hhfL30Normal) : FALLBACK_OVERDRIVE_MUL;
    // Preserve historical L1/L30 shape (1:15) unless KB later publishes an L1.
    var hhfL1Normal = hhfL30Normal / 15.0;
    return {
      active: true,
      seasonName: seasonName,
      hhfL1Normal: hhfL1Normal,
      hhfL30Normal: hhfL30Normal,
      overdriveMul: overdriveMul,
      primaryResource: 'Coal',
    };
  }

  function buildInactiveConfig(seasonId, mc, seasonName) {
    var variant = SEASON_VARIANTS[seasonId] || null;
    return {
      active: false,
      seasonName: seasonName,
      primaryResource: (variant && variant.primary_resource) || inferPrimaryResource(seasonId, mc || {}),
      variant: variant,   // null for S1 (banner-only); object for S3-S6
    };
  }

  function loadSeasonConfig() {
    if (_readyPromise) return _readyPromise;
    if (!window.LWSSeasons || typeof window.LWSSeasons.resolve !== 'function') {
      // Seasons lib not present — fall back to fixed S2 behavior.
      _currentCtx = { seasonId: 's2-polar-storm', season: null };
      _cfgCache['s2-polar-storm'] = {
        active: true,
        seasonName: 'Season 2: Polar Storm',
        hhfL1Normal: FALLBACK_HHF_L1_NORMAL,
        hhfL30Normal: FALLBACK_HHF_L30_NORMAL,
        overdriveMul: FALLBACK_OVERDRIVE_MUL,
        primaryResource: 'Coal',
      };
      _readyPromise = Promise.resolve(_cfgCache['s2-polar-storm']);
      return _readyPromise;
    }
    _readyPromise = window.LWSSeasons.resolve().then(function (ctx) {
      _currentCtx = { seasonId: ctx.season_id, season: ctx.season };
      var seasonName = (ctx.season && ctx.season.name && ctx.season.name.en) || ctx.season_id;
      return window.LWSSeasons.getMechanicsConfig(ctx.season_id).then(function (mc) {
        var cfg = (ctx.season_id === 's2-polar-storm')
          ? buildS2Config(mc, seasonName)
          : buildInactiveConfig(ctx.season_id, mc, seasonName);
        _cfgCache[ctx.season_id] = cfg;
        return cfg;
      });
    }).catch(function () {
      // Any failure → assume S2 default with placeholders. Better than a
      // dead calculator.
      _cfgCache['s2-polar-storm'] = {
        active: true,
        seasonName: 'Season 2: Polar Storm',
        hhfL1Normal: FALLBACK_HHF_L1_NORMAL,
        hhfL30Normal: FALLBACK_HHF_L30_NORMAL,
        overdriveMul: FALLBACK_OVERDRIVE_MUL,
        primaryResource: 'Coal',
      };
      _currentCtx = { seasonId: 's2-polar-storm', season: null };
      return _cfgCache['s2-polar-storm'];
    });
    return _readyPromise;
  }

  // Invalidate when the LWSSeasons layer fires a change event.
  window.addEventListener('lws:season-changed', function () {
    _readyPromise = null;
    _cfgCache = {};
    _currentCtx = null;
  });

  // ---- Core math (now takes cfg as an argument) ----

  function personalBurnRate(cfg, level, overdrive) {
    var lvl = Math.max(1, Math.min(30, parseInt(level, 10) || 1));
    var frac = (lvl - 1) / 29;
    var normal = cfg.hhfL1Normal + frac * (cfg.hhfL30Normal - cfg.hhfL1Normal);
    return overdrive ? normal * cfg.overdriveMul : normal;
  }

  function coalNeeded(cfg, level, durationHours, overdrive) {
    return Math.round(personalBurnRate(cfg, level, overdrive) * 60 * parseFloat(durationHours));
  }

  function statusFor(need, stock) {
    if (need <= 0) return 'green';
    var ratio = (stock - need) / need;
    if (ratio >= SAFE_BUFFER_RATIO) return 'green';
    if (ratio >= 0) return 'yellow';
    return 'red';
  }

  function inactiveResult(cfg) {
    // Shape matches the "green" active response so the UI's renderer doesn't
    // NPE — but flagged with season_active:false so the client can swap in a
    // placeholder card.
    return {
      season_active: false,
      season_id: (_currentCtx && _currentCtx.seasonId) || null,
      season_name: cfg.seasonName,
      primary_resource: cfg.primaryResource,
      message: 'Coal burn only applies during Season 2 Polar Storm — this season uses ' + cfg.primaryResource + '.',
      furnace_level: 0,
      coal_stock: 0,
      duration_hours: 0,
      overdrive: false,
      burn_per_min: 0,
      coal_needed: 0,
      delta: 0,
      status: 'green',
      estimate: false,
    };
  }

  function evaluateSingle(cfg, furnaceLevel, coalStock, durationHours, overdrive) {
    if (!cfg.active) return inactiveResult(cfg);
    var lvl = parseInt(furnaceLevel, 10);
    var stock = parseInt(coalStock, 10);
    var hrs = parseFloat(durationHours);
    var od = !!overdrive;
    var need = coalNeeded(cfg, lvl, hrs, od);
    return {
      season_active: true,
      season_id: (_currentCtx && _currentCtx.seasonId) || 's2-polar-storm',
      season_name: cfg.seasonName,
      furnace_level: lvl,
      coal_stock: stock,
      duration_hours: hrs,
      overdrive: od,
      burn_per_min: Math.round(personalBurnRate(cfg, lvl, od) * 10) / 10,
      coal_needed: need,
      delta: stock - need,
      status: statusFor(need, stock),
      estimate: true,
    };
  }

  function evaluateBatch(cfg, members, durationHours, overdrive) {
    if (!cfg.active) {
      return {
        season_active: false,
        season_id: (_currentCtx && _currentCtx.seasonId) || null,
        season_name: cfg.seasonName,
        primary_resource: cfg.primaryResource,
        message: 'Coal burn only applies during Season 2 Polar Storm — this season uses ' + cfg.primaryResource + '.',
        results: [],
        summary: {
          season_active: false,
          member_count: 0, short_count: 0, total_deficit: 0,
          duration_hours: parseFloat(durationHours) || 0,
          overdrive: !!overdrive,
        },
      };
    }
    var results = [];
    var shortCount = 0;
    var totalDeficit = 0;
    (members || []).forEach(function (m) {
      try {
        var row = evaluateSingle(cfg, m.furnace_level || 1, m.coal_stock || 0, durationHours, overdrive);
        row.name = m.name || '';
        row.rank = m.rank || '';
        if (row.delta < 0) { shortCount++; totalDeficit += -row.delta; }
        results.push(row);
      } catch (e) { /* skip malformed row */ }
    });
    return {
      season_active: true,
      season_id: (_currentCtx && _currentCtx.seasonId) || 's2-polar-storm',
      season_name: cfg.seasonName,
      results: results,
      summary: {
        season_active: true,
        member_count: results.length,
        short_count: shortCount,
        total_deficit: totalDeficit,
        duration_hours: parseFloat(durationHours),
        overdrive: !!overdrive,
      },
    };
  }

  // ---- fetch monkey-patch ----
  var realFetch = window.fetch.bind(window);

  window.fetch = async function (input, init) {
    var url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith('/api/coal/')) {
      return realFetch(input, init);
    }
    var body = {};
    if (init && init.body) {
      try { body = JSON.parse(init.body); } catch (e) {}
    }
    var cfg = await loadSeasonConfig();
    var result;
    if (url === '/api/coal/single') {
      result = evaluateSingle(cfg, body.furnace_level, body.coal_stock, body.duration_hours, body.overdrive);
    } else if (url === '/api/coal/batch') {
      result = evaluateBatch(cfg, body.members, body.duration_hours, body.overdrive);
    } else if (url === '/api/coal/context') {
      // New helper — the UI polls this to decide whether to show the "inactive
      // season" banner, or swap in a per-season variant form. Not present on
      // the Python server, but a static-only affordance is fine since it's
      // read-only + derived from public data.
      result = {
        season_active: cfg.active,
        season_id: (_currentCtx && _currentCtx.seasonId) || null,
        season_name: cfg.seasonName,
        primary_resource: cfg.primaryResource,
        variant: cfg.variant || null,   // present for S3-S6; null for S1/S2/S7
      };
    } else {
      return new Response(JSON.stringify({ error: 'endpoint not found in static build' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify(result), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  };

  // Optional: expose the pure functions for debugging in devtools console
  window.__CoalBurn = {
    personalBurnRate: function (level, overdrive) {
      return loadSeasonConfig().then(function (cfg) {
        return cfg.active ? personalBurnRate(cfg, level, overdrive) : 0;
      });
    },
    loadSeasonConfig: loadSeasonConfig,
    getCurrentContext: function () { return _currentCtx; },
    statusFor: statusFor,
  };
})();
