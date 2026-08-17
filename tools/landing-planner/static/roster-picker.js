(function () {
  var ROSTERS = [];  // demo/sample presets removed — tools start empty

  // ---- i18n (mirrors the shared `lws_lang` preference set by sibling tools)
  function _getLang() {
    try {
      var s = localStorage.getItem('lws_lang');
      if (s === 'ko' || s === 'en') return s;
    } catch (e) { /* private mode */ }
    return (navigator.language || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  }
  var _STR = {
    en: {
      rosterLabel: 'Roster:',
      loadBtn: 'Load',
      loading: 'loading…',
      membersLoaded: '{n} members loaded',
      membersFromExtractor: '{n} members loaded from Roster Extractor',
      loadFailed: 'load failed: ',
    },
    ko: {
      rosterLabel: '명단:',
      loadBtn: '불러오기',
      loading: '불러오는 중…',
      membersLoaded: '{n}명 로드됨',
      membersFromExtractor: 'Roster Extractor에서 {n}명 로드됨',
      loadFailed: '불러오기 실패: ',
    },
  };
  function _t(key, vars) {
    var lang = _getLang();
    var s = (_STR[lang] && _STR[lang][key]) || _STR.en[key] || key;
    if (vars) for (var k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
  }

  function parseCsv(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (!lines.length) return [];
    var headers = lines[0].split(',').map(function (h) { return h.trim().toLowerCase().replace(/["']/g, ''); });
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var cells = lines[i].split(',');
      var r = {};
      for (var j = 0; j < headers.length; j++) {
        r[headers[j]] = (cells[j] || '').trim().replace(/^["']|["']$/g, '');
      }
      rows.push(r);
    }
    return rows;
  }

  function render(container) {
    if (!ROSTERS.length) return;  // nothing to pick — skip the picker UI
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0';
    var label = document.createElement('label');
    label.textContent = _t('rosterLabel');
    label.style.cssText = 'color:var(--fg-muted,#9aa0a6);font-size:13px';
    var sel = document.createElement('select');
    sel.id = 'lws-roster-select';
    sel.style.cssText = 'padding:6px 10px;background:#0d1424;color:#eee;border:1px solid #2a3444;border-radius:4px;font-size:13px';
    ROSTERS.forEach(function (r) {
      var opt = document.createElement('option');
      opt.value = r.url;
      opt.textContent = r.label;
      if (r.isDefault) opt.selected = true;
      sel.appendChild(opt);
    });
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = _t('loadBtn');
    btn.style.cssText = 'padding:6px 12px;background:#c9a961;color:#0a0e1a;border:none;border-radius:4px;font-weight:600;cursor:pointer;font-size:13px';
    btn.addEventListener('click', function () { load(sel.value); });
    var status = document.createElement('span');
    status.id = 'lws-roster-status';
    status.style.cssText = 'color:#9aa0a6;font-size:12px;margin-left:8px';
    wrap.appendChild(label);
    wrap.appendChild(sel);
    wrap.appendChild(btn);
    wrap.appendChild(status);
    container.appendChild(wrap);
  }

  function load(url) {
    var status = document.getElementById('lws-roster-status');
    if (status) status.textContent = _t('loading');
    return fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (t) {
        var rows = parseCsv(t);
        if (status) status.textContent = _t('membersLoaded', { n: rows.length });
        var name = url.split('/').pop().replace('.csv', '');
        if (typeof window.__lwsRosterLoaded === 'function') {
          window.__lwsRosterLoaded(rows, name);
        }
        window.dispatchEvent(new CustomEvent('lws:roster-loaded', { detail: { rows: rows, name: name } }));
        return rows;
      })
      .catch(function (e) {
        if (status) status.textContent = _t('loadFailed') + e.message;
      });
  }

  window.LWSRosterPicker = {
    render: render,
    load: load,
    parseCsv: parseCsv,
    rosters: ROSTERS
  };

  // Cross-origin carry-through from Roster Extractor: read #roster=<url-encoded-csv>&name=<url-encoded>
  // from window.location.hash. If present, use it INSTEAD of the default preset roster.
  function tryLoadFromHash() {
    try {
      var h = window.location.hash || '';
      if (h.indexOf('roster=') === -1) return null;
      var params = {};
      h.replace(/^#/, '').split('&').forEach(function (kv) {
        var eq = kv.indexOf('=');
        if (eq === -1) return;
        params[kv.slice(0, eq)] = decodeURIComponent(kv.slice(eq + 1));
      });
      if (!params.roster) return null;
      var rows = parseCsv(params.roster);
      var name = params.name || 'Roster Extractor';
      var status = document.getElementById('lws-roster-status');
      if (status) status.textContent = _t('membersFromExtractor', { n: rows.length });
      if (typeof window.__lwsRosterLoaded === 'function') {
        window.__lwsRosterLoaded(rows, name);
      }
      window.dispatchEvent(new CustomEvent('lws:roster-loaded', { detail: { rows: rows, name: name, source: 'roster-extractor' } }));
      // Show a small banner acknowledging the imported roster
      try {
        var banner = document.createElement('div');
        banner.style.cssText = 'padding:10px 14px;margin:8px 0;background:rgba(201,169,97,0.10);border:1px solid rgba(201,169,97,0.35);border-radius:6px;color:#c9a961;font-size:13px;display:flex;justify-content:space-between;align-items:center;gap:8px';
        banner.innerHTML = '<span>✨ Loaded <strong>' + rows.length + '</strong> members from Roster Extractor — ' + name.replace(/</g, '&lt;') + '</span><button type="button" style="background:none;border:1px solid rgba(201,169,97,0.4);color:#c9a961;padding:4px 10px;border-radius:4px;font-size:12px;cursor:pointer">Dismiss</button>';
        banner.querySelector('button').addEventListener('click', function () { banner.remove(); });
        var mount = document.getElementById('lws-roster-picker');
        if (mount) mount.parentNode.insertBefore(banner, mount);
        else document.body.insertBefore(banner, document.body.firstChild);
      } catch (e) { /* non-fatal */ }
      // Clear the hash so a refresh doesn't re-import (avoids stale-data confusion)
      try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
      return rows;
    } catch (e) { return null; }
  }

  // ── Live-roster preferred loader (v0.5) ────────────────────────────────
  // If the URL hash carries #alliance_sig=X OR localStorage has
  // `lws_last_alliance_sig`, fetch the current alliance-editable roster from
  // roster.r5tools.io and use that instead of the CSV preset. Responses are
  // cached in localStorage for 5 min per signature to avoid repeated fetches
  // when the user reloads the page.
  var LIVE_ROSTER_ORIGIN = 'https://roster.r5tools.io';
  var LIVE_CACHE_TTL_MS = 5 * 60 * 1000;

  function _sigFromHashOrStorage() {
    try {
      var h = window.location.hash || '';
      if (h.indexOf('alliance_sig=') !== -1) {
        var params = {};
        h.replace(/^#/, '').split('&').forEach(function (kv) {
          var eq = kv.indexOf('=');
          if (eq === -1) return;
          params[kv.slice(0, eq)] = decodeURIComponent(kv.slice(eq + 1));
        });
        if (params.alliance_sig && /^[a-f0-9]{4,32}$/.test(params.alliance_sig)) {
          try { localStorage.setItem('lws_last_alliance_sig', params.alliance_sig); } catch (e) {}
          return params.alliance_sig;
        }
      }
      var stored = localStorage.getItem('lws_last_alliance_sig');
      if (stored && /^[a-f0-9]{4,32}$/.test(stored)) return stored;
    } catch (e) {}
    return null;
  }

  function _cachedLiveRoster(sig) {
    try {
      var raw = localStorage.getItem('lws_live_roster_cache_' + sig);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (!entry || !entry.fetched_at) return null;
      if (Date.now() - entry.fetched_at > LIVE_CACHE_TTL_MS) return null;
      return entry.data;
    } catch (e) { return null; }
  }

  function _cacheLiveRoster(sig, data) {
    try {
      localStorage.setItem('lws_live_roster_cache_' + sig, JSON.stringify({
        fetched_at: Date.now(), data: data,
      }));
    } catch (e) {}
  }

  function _humanRelTime(iso) {
    if (!iso) return '';
    var then = new Date(iso).getTime();
    if (!isFinite(then)) return '';
    var diff = Math.max(0, (Date.now() - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.round(diff / 60) + 'm ago';
    if (diff < 86400) return Math.round(diff / 3600) + 'h ago';
    return Math.round(diff / 86400) + 'd ago';
  }

  function _dispatchLive(members, meta) {
    var rows = members.map(function (m) {
      return {
        rank:  String(m.rank || 'R1').toUpperCase(),
        name:  String(m.name || ''),
        hq:    m.hq == null ? '' : String(m.hq),
        power: String(m.power || ''),
        notes: String(m.notes || ''),
      };
    });
    var name = meta.alliance_name || ('Live Roster · ' + meta.alliance_signature);
    if (typeof window.__lwsRosterLoaded === 'function') {
      window.__lwsRosterLoaded(rows, name);
    }
    window.dispatchEvent(new CustomEvent('lws:roster-loaded', {
      detail: { rows: rows, name: name, source: 'live-roster',
                alliance_signature: meta.alliance_signature,
                last_edited_at: meta.last_edited_at,
                last_edited_by: meta.last_edited_by,
                edit_count: meta.edit_count },
    }));
    // Banner
    try {
      var banner = document.createElement('div');
      banner.style.cssText = 'padding:10px 14px;margin:8px 0;background:rgba(138,224,163,0.10);border:1px solid rgba(138,224,163,0.35);border-radius:6px;color:#8ae0a3;font-size:13px;display:flex;justify-content:space-between;align-items:center;gap:8px';
      var edited = meta.last_edited_at
        ? ('last edited ' + _humanRelTime(meta.last_edited_at) + (meta.last_edited_by ? (' by ' + String(meta.last_edited_by).replace(/</g, '&lt;')) : ''))
        : 'seeded from snapshot';
      banner.innerHTML = '<span>🔄 Loaded <strong>live roster</strong> — ' + rows.length + ' members · ' + edited + '</span>'
        + '<a href="https://roster.r5tools.io/#live" target="_blank" rel="noopener" style="color:#8ae0a3;border:1px solid rgba(138,224,163,0.35);padding:4px 10px;border-radius:4px;font-size:12px;text-decoration:none">Edit ↗</a>';
      var mount = document.getElementById('lws-roster-picker');
      if (mount) mount.parentNode.insertBefore(banner, mount);
      else document.body.insertBefore(banner, document.body.firstChild);
    } catch (e) {}
  }

  function tryLoadFromLiveRoster() {
    var sig = _sigFromHashOrStorage();
    if (!sig) return null;
    // Serve cached response synchronously first; refresh in the background.
    var cached = _cachedLiveRoster(sig);
    var status = document.getElementById('lws-roster-status');
    if (status) status.textContent = 'loading live roster…';
    if (cached && cached.members && cached.members.length) {
      _dispatchLive(cached.members, {
        alliance_signature: sig,
        alliance_name:      cached.alliance_name,
        last_edited_at:     cached.last_edited_at,
        last_edited_by:     cached.last_edited_by,
        edit_count:         cached.edit_count,
      });
    }
    // Refresh from network (returns a Promise but we don't block on it).
    fetch(LIVE_ROSTER_ORIGIN + '/api/live-roster?sig=' + encodeURIComponent(sig))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.members || !data.members.length) {
          if (!cached && status) status.textContent = 'no live roster; falling back to preset';
          return;
        }
        _cacheLiveRoster(sig, data);
        // Only dispatch a second time if the network response differs from what
        // we already rendered from cache — avoids flashing the banner twice.
        var cachedCount = (cached && cached.members) ? cached.members.length : -1;
        if (cachedCount !== data.members.length
            || (cached && cached.last_edited_at) !== data.last_edited_at) {
          _dispatchLive(data.members, {
            alliance_signature: sig,
            alliance_name:      data.alliance_name,
            last_edited_at:     data.last_edited_at,
            last_edited_by:     data.last_edited_by,
            edit_count:         data.edit_count,
          });
        }
      })
      .catch(function () { /* silent; presets still load if this fails */ });
    // Return truthy if we already had a cached copy — caller uses this to skip
    // default-preset autoload. If no cache but network is inflight, still
    // return truthy so we don't stomp the live roster with a preset.
    return true;
  }

  // ---- Canonical roster auto-import (LW Atlas + your upload, merged) --------
  // Every tool auto-loads YOUR ONE alliance's roster. Identity is set once
  // (?warzone=&alliance= from the hub, remembered in shared localStorage) and
  // every tool on this domain reads it. No demo, no dropdown, no re-upload.
  var CANON_ORIGIN = 'https://access-codes.r5tools.io';
  function _myCode() {
    try {
      if (window.LWSAccessCodes && typeof LWSAccessCodes.code === 'function') {
        var c = LWSAccessCodes.code(); if (c) return c;
      }
    } catch (e) {}
    try { return localStorage.getItem('lws_unlock_code') || ''; } catch (e) { return ''; }
  }
  function _myAlliance() {
    try {
      var q = new URLSearchParams(window.location.search);
      var wz = q.get('warzone'), tag = q.get('alliance');
      if (wz && tag) {
        localStorage.setItem('lws_my_warzone', wz);
        localStorage.setItem('lws_my_alliance', tag);
      }
      wz = wz || localStorage.getItem('lws_my_warzone');
      tag = tag || localStorage.getItem('lws_my_alliance');
      if (wz && tag) return { warzone: wz, alliance: tag };
    } catch (e) {}
    return null;
  }
  function tryLoadCanonical() {
    var me = _myAlliance();
    if (!me) return false;
    var code = _myCode();
    var status = document.getElementById('lws-roster-status');
    if (status) status.textContent = 'loading your roster…';
    var url = CANON_ORIGIN + '/api/warzone/' + encodeURIComponent(me.warzone) +
      '/alliance/' + encodeURIComponent(me.alliance) + '/canonical-roster' +
      (code ? '?code=' + encodeURIComponent(code) : '');
    fetch(url, { credentials: 'include' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.members || !d.members.length) { if (status) status.textContent = ''; return; }
        var rows = d.members.map(function (m) {
          var notes = m.notes || '';
          if (m.x != null && notes.indexOf('@') === -1) notes = (notes + ' @' + m.x + ',' + m.y).trim();
          var hq = m.hq == null ? '' : String(m.hq);
          var pw = m.power == null ? '' : String(m.power);
          // Emit every key alias tools read (some use hq_level/total_power).
          return { rank: String(m.rank || 'R1').toUpperCase(), name: String(m.name || ''),
                   hq: hq, hq_level: hq, power: pw, total_power: pw, notes: notes,
                   x: m.x, y: m.y };
        });
        var name = me.alliance + ' · WZ ' + me.warzone;
        if (typeof window.__lwsRosterLoaded === 'function') window.__lwsRosterLoaded(rows, name);
        window.dispatchEvent(new CustomEvent('lws:roster-loaded', { detail: { rows: rows, name: name, source: 'canonical' } }));
        try {
          var banner = document.createElement('div');
          banner.style.cssText = 'padding:10px 14px;margin:8px 0;background:rgba(138,224,163,0.10);border:1px solid rgba(138,224,163,0.35);border-radius:6px;color:#8ae0a3;font-size:13px';
          banner.innerHTML = '\uD83D\uDEF0\uFE0F Auto-loaded <strong>' + name + '</strong> \u2014 ' + rows.length + ' members'
            + (d.has_upload ? ' (LW Atlas + your upload)' : ' (LW Atlas)')
            + (d.upload_updated_at ? ' \u00B7 as of ' + String(d.upload_updated_at).slice(0, 10) : '');
          document.body.insertBefore(banner, document.body.firstChild);
        } catch (e) {}
      })
      .catch(function () { if (status) status.textContent = ''; });
    return true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var mount = document.getElementById('lws-roster-picker');
    if (mount) render(mount);
    // Priority: your canonical roster (LW Atlas + upload) > legacy live roster
    // > hash CSV. No demo fallback.
    if (tryLoadCanonical()) return;
    if (tryLoadFromLiveRoster()) return;
    if (tryLoadFromHash()) return;
  });
})();
