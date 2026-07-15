(function () {
  'use strict';

  var CDN_BASE = window.LWS_SEASONS_URL || 'https://seasons.r5tools.io';
  var LS_KEY_WARZONE = 'lws_current_warzone';
  var LS_KEY_OVERRIDE = 'lws_season_override';
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

  var cache = { seasons: null, warzones: null, loadedAt: 0 };

  function loadJson(url) {
    return fetch(url, { credentials: 'omit' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' fetching ' + url);
      return r.json();
    });
  }

  function loadAll() {
    if (cache.seasons && cache.warzones && (Date.now() - cache.loadedAt) < 300000) {
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

  function getStoredWarzone() {
    return localStorage.getItem(LS_KEY_WARZONE) || null;
  }
  function setStoredWarzone(id) {
    if (id) localStorage.setItem(LS_KEY_WARZONE, String(id));
    else localStorage.removeItem(LS_KEY_WARZONE);
  }
  function getStoredOverride() {
    var v = localStorage.getItem(LS_KEY_OVERRIDE);
    return v ? JSON.parse(v) : null;
  }
  function setStoredOverride(seasonId, week) {
    if (seasonId) localStorage.setItem(LS_KEY_OVERRIDE, JSON.stringify({ seasonId: seasonId, week: week || null }));
    else localStorage.removeItem(LS_KEY_OVERRIDE);
  }

  function resolveContext() {
    return loadAll().then(function (data) {
      var wzId = getStoredWarzone() || data.warzones.default_warzone_if_unknown;
      var override = getStoredOverride();
      var wz = data.warzones.warzones[wzId] || null;
      var seasonId = (override && override.seasonId) || (wz && wz.current_season_id) || 's2-polar-storm';
      var week = (override && override.week) || (wz && wz.season_week) || 1;
      var season = data.seasons.seasons[seasonId] || null;
      return {
        warzone: wz,
        warzone_id: wzId,
        season: season,
        season_id: seasonId,
        week: week,
        is_override: !!override,
        raw: data
      };
    });
  }

  function renderWarzoneSelector(mount, opts) {
    opts = opts || {};
    return loadAll().then(function (data) {
      var known = Object.keys(data.warzones.warzones);
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
        cache.loadedAt = 0;
        window.dispatchEvent(new CustomEvent('lws:warzone-changed', { detail: { warzone_id: input.value.trim() } }));
        if (typeof opts.onChange === 'function') opts.onChange(input.value.trim());
      });
      var seasonBadge = document.createElement('span');
      seasonBadge.style.cssText = 'padding:2px 8px;background:rgba(201,169,97,0.14);color:#c9a961;border-radius:10px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.06em';
      resolveContext().then(function (ctx) {
        var seasonName = (ctx.season && ctx.season.name && ctx.season.name.en) || ctx.season_id;
        seasonBadge.textContent = seasonName + ' · Wk ' + ctx.week + (ctx.is_override ? ' (override)' : '');
      });
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
          var newSeasonId = prompt('Set season (options: ' + data.warzones.season_id_options.join(', ') + ')', getStoredOverride() ? getStoredOverride().seasonId : '');
          if (newSeasonId === null) return;
          if (!newSeasonId.trim()) { setStoredOverride(null); }
          else { var wk = prompt('Set week (1-8)', '1'); setStoredOverride(newSeasonId.trim(), parseInt(wk || '1', 10)); }
          window.dispatchEvent(new CustomEvent('lws:warzone-changed', { detail: { warzone_id: input.value.trim() } }));
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
    setWarzone: setStoredWarzone,
    getWarzone: getStoredWarzone,
    setOverride: setStoredOverride,
    getOverride: getStoredOverride,
    renderSelector: renderWarzoneSelector,
    version: '0.1.0'
  };

  document.addEventListener('DOMContentLoaded', function () {
    var mount = document.getElementById('lws-warzone-selector');
    if (mount) renderWarzoneSelector(mount);
  });
})();
