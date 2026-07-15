/* LWS_Seasons/lib.js — client-side reader for the season-agnostic config.
 *
 * Loads seasons.json + warzones.json (from seasons.r5tools.io CDN with local
 * fallback to data/), resolves current warzone → current season → mechanics
 * config + milestones + i18n names.
 *
 * Public API on window.LWSSeasons:
 *
 *   resolve()                             → Promise<Context>
 *   loadAll()                             → Promise<{seasons, warzones}>
 *   getCurrent()                          → Promise<seasonDict>
 *   getNext()                             → Promise<seasonDict>
 *   getSeason(id)                         → Promise<seasonDict>
 *   getMilestonesForTool(seasonId, tool)  → Promise<[milestone]>
 *   getMechanicsConfig(seasonId)          → Promise<mechanicsConfigDict>
 *   setWarzone(id)  / getWarzone()
 *   setOverride(seasonId, week) / getOverride()
 *   renderSelector(mount, opts)           → Promise<HTMLElement>
 *
 * Context shape:
 *   { warzone, warzone_id, season, season_id, week, is_override, raw }
 *
 * Fires 'lws:warzone-changed' / 'lws:season-changed' custom events on window
 * whenever the resolved context changes. Tools should listen and re-render.
 */
(function () {
  'use strict';

  var CDN_BASE = window.LWS_SEASONS_URL || 'https://seasons.r5tools.io';
  var LS_KEY_WARZONE = 'lws_current_warzone';
  var LS_KEY_OVERRIDE = 'lws_season_override';

  var cache = { seasons: null, warzones: null, loadedAt: 0 };
  var CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  function loadJson(url) {
    return fetch(url, { credentials: 'omit' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' fetching ' + url);
      return r.json();
    });
  }

  function loadAll() {
    if (cache.seasons && cache.warzones && (Date.now() - cache.loadedAt) < CACHE_TTL_MS) {
      return Promise.resolve(cache);
    }
    return Promise.all([
      loadJson(CDN_BASE + '/seasons.json').catch(function () { return loadJson('data/seasons.json'); }),
      loadJson(CDN_BASE + '/warzones.json').catch(function () { return loadJson('data/warzones.json'); })
    ]).then(function (r) {
      cache.seasons = r[0]; cache.warzones = r[1]; cache.loadedAt = Date.now();
      return cache;
    });
  }

  function getStoredWarzone() { return localStorage.getItem(LS_KEY_WARZONE) || null; }
  function setStoredWarzone(id) {
    if (id) localStorage.setItem(LS_KEY_WARZONE, String(id));
    else localStorage.removeItem(LS_KEY_WARZONE);
    cache.loadedAt = 0;
  }
  function getStoredOverride() {
    var v = localStorage.getItem(LS_KEY_OVERRIDE);
    return v ? JSON.parse(v) : null;
  }
  function setStoredOverride(seasonId, week) {
    if (seasonId) {
      localStorage.setItem(LS_KEY_OVERRIDE, JSON.stringify({ seasonId: seasonId, week: week || null }));
    } else {
      localStorage.removeItem(LS_KEY_OVERRIDE);
    }
    cache.loadedAt = 0;
  }

  // Parse URL params for one-shot deep-linking (e.g. ?warzone=2007&season=s2-polar-storm&week=4).
  function parseUrlOverride() {
    try {
      var params = new URLSearchParams(window.location.search);
      var wz = params.get('warzone');
      var season = params.get('season');
      var week = params.get('week');
      return {
        warzone: wz || null,
        seasonId: season || null,
        week: week ? parseInt(week, 10) : null
      };
    } catch (e) {
      return { warzone: null, seasonId: null, week: null };
    }
  }

  function resolveContext() {
    return loadAll().then(function (data) {
      var url = parseUrlOverride();
      var override = getStoredOverride();
      var wzId = url.warzone || getStoredWarzone() || data.warzones.default_warzone_if_unknown;
      var wz = data.warzones.warzones[wzId] || null;
      var seasonId = url.seasonId
        || (override && override.seasonId)
        || (wz && wz.current_season_id)
        || data.seasons.current
        || 's2-polar-storm';
      var week = url.week
        || (override && override.week)
        || (wz && wz.season_week)
        || 1;
      var season = data.seasons.seasons[seasonId] || null;
      return {
        warzone: wz,
        warzone_id: wzId,
        season: season,
        season_id: seasonId,
        week: week,
        is_override: !!(override || url.seasonId),
        raw: data
      };
    });
  }

  function getCurrent() {
    return loadAll().then(function (data) {
      var id = data.seasons.current;
      return data.seasons.seasons[id];
    });
  }

  function getNext() {
    return loadAll().then(function (data) {
      var id = data.seasons.next;
      return id ? data.seasons.seasons[id] : null;
    });
  }

  function getSeason(id) {
    return loadAll().then(function (data) {
      return data.seasons.seasons[id] || null;
    });
  }

  function getMechanicsConfig(seasonId) {
    return getSeason(seasonId).then(function (s) {
      return (s && s.mechanics_config) || {};
    });
  }

  function getMilestonesForTool(seasonId, toolKey) {
    return getSeason(seasonId).then(function (s) {
      if (!s || !s.milestones) return [];
      if (!toolKey) return s.milestones;
      return s.milestones.filter(function (m) {
        // If a milestone has no `tools` list, it applies to all tools that season supports.
        if (!m.tools) return true;
        return m.tools.indexOf(toolKey) !== -1;
      });
    });
  }

  function toolApplies(seasonId, toolKey) {
    return getSeason(seasonId).then(function (s) {
      if (!s || !s.tools_that_apply) return false;
      return s.tools_that_apply.indexOf(toolKey) !== -1;
    });
  }

  // ---- Warzone / season selector UI ---------------------------------------

  function renderWarzoneSelector(mount, opts) {
    opts = opts || {};
    return loadAll().then(function (data) {
      var current = getStoredWarzone() || data.warzones.default_warzone_if_unknown;
      var wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:13px;color:#a8b0c0';

      var label = document.createElement('label');
      label.textContent = opts.labelText || 'Warzone:';
      label.style.color = '#7a8290';

      var input = document.createElement('input');
      input.type = 'text';
      input.value = current;
      input.placeholder = 'e.g. 2007';
      input.style.cssText = 'width:80px;padding:4px 8px;background:#0d1424;color:#eee;border:1px solid #2a3444;border-radius:4px;font-family:ui-monospace,monospace;font-size:13px';
      input.addEventListener('change', function () {
        setStoredWarzone(input.value.trim());
        window.dispatchEvent(new CustomEvent('lws:warzone-changed', { detail: { warzone_id: input.value.trim() } }));
        window.dispatchEvent(new CustomEvent('lws:season-changed'));
        if (typeof opts.onChange === 'function') opts.onChange(input.value.trim());
        refreshBadge();
      });

      var seasonBadge = document.createElement('span');
      seasonBadge.style.cssText = 'padding:2px 8px;background:rgba(201,169,97,0.14);color:#c9a961;border-radius:10px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.06em';

      function refreshBadge() {
        resolveContext().then(function (ctx) {
          var seasonName = (ctx.season && ctx.season.name && ctx.season.name.en) || ctx.season_id;
          seasonBadge.textContent = seasonName + ' · Wk ' + ctx.week + (ctx.is_override ? ' (override)' : '');
        });
      }
      refreshBadge();

      wrap.appendChild(label);
      wrap.appendChild(input);
      wrap.appendChild(seasonBadge);

      if (opts.showOverrideLink !== false) {
        var overrideBtn = document.createElement('a');
        overrideBtn.href = '#';
        overrideBtn.textContent = 'change';
        overrideBtn.style.cssText = 'color:#c9a961;text-decoration:none;font-size:11px;margin-left:4px';
        overrideBtn.addEventListener('click', function (e) {
          e.preventDefault();
          var opts_list = data.warzones.season_id_options || Object.keys(data.seasons.seasons);
          var current = getStoredOverride();
          var newSeasonId = prompt('Set season (options: ' + opts_list.join(', ') + ')', current ? current.seasonId : '');
          if (newSeasonId === null) return;
          if (!newSeasonId.trim()) {
            setStoredOverride(null);
          } else {
            var wk = prompt('Set week (1-8)', current && current.week ? String(current.week) : '1');
            setStoredOverride(newSeasonId.trim(), parseInt(wk || '1', 10));
          }
          window.dispatchEvent(new CustomEvent('lws:season-changed'));
          refreshBadge();
        });
        wrap.appendChild(overrideBtn);
      }
      mount.appendChild(wrap);
      return wrap;
    });
  }

  window.LWSSeasons = {
    resolve: resolveContext,
    loadAll: loadAll,
    getCurrent: getCurrent,
    getNext: getNext,
    getSeason: getSeason,
    getMechanicsConfig: getMechanicsConfig,
    getMilestonesForTool: getMilestonesForTool,
    toolApplies: toolApplies,
    setWarzone: setStoredWarzone,
    getWarzone: getStoredWarzone,
    setOverride: setStoredOverride,
    getOverride: getStoredOverride,
    renderSelector: renderWarzoneSelector,
    version: '0.2.0'
  };

  document.addEventListener('DOMContentLoaded', function () {
    var mount = document.getElementById('lws-warzone-selector');
    if (mount) renderWarzoneSelector(mount);
  });
})();
