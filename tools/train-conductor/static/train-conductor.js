/**
 * Train Conductor Picker — main app logic.
 *
 * Loads an alliance roster (preset CSV / paste / upload), applies R5-selected
 * eligibility filters (rank, HQ level, power, titles, manual exclusions),
 * and fair-random-picks a conductor from the eligible pool. Rotation history
 * is persisted in localStorage under LWS_TCP_HISTORY_KEY.
 */
(function () {
  'use strict';

  var HISTORY_KEY = 'lws_train_conductor_history';
  var HISTORY_MAX = 40;
  var WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  // ----- State ---------------------------------------------------------------
  var roster = [];             // Array<{name,rank,hq_level,power,notes,titles:[]}>
  var rosterSource = '';
  var lastRoll = null;         // { winner, backups, filters, ts }

  // ----- Helpers -------------------------------------------------------------
  function t(key, vars) {
    return (window.LWS_I18N && window.LWS_I18N.t)
      ? window.LWS_I18N.t(key, vars)
      : key;
  }

  function $(id) { return document.getElementById(id); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function parseCsv(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (!lines.length) return [];
    var headers = lines[0].split(',').map(function (h) {
      return h.trim().toLowerCase().replace(/["']/g, '');
    });
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      var cells = lines[i].split(',');
      var r = {};
      for (var j = 0; j < headers.length; j++) {
        r[headers[j]] = (cells[j] || '').trim().replace(/^["']|["']$/g, '');
      }
      // Skip completely empty rows
      if (!r.name) continue;
      rows.push(r);
    }
    return rows;
  }

  function normalizeMember(row) {
    var rank = String(row.rank || 'R1').toUpperCase().trim();
    var hq = parseInt(row.hq_level || row.hq || row['hq lv.'] || row['hq lv'] || '0', 10) || 0;
    var power = parseInt(String(row.power || row.total_power || row['total power'] || '0').replace(/[^0-9]/g, ''), 10) || 0;
    var notes = String(row.notes || '').trim();
    var titles = [];
    var noteParts = notes.split(/[;|,]/).map(function (s) { return s.trim(); });
    noteParts.forEach(function (p) {
      var m = /^titled?:(.+)$/i.exec(p);
      if (m) titles.push(m[1].trim().toLowerCase());
    });
    return {
      name: String(row.name).trim(),
      rank: rank,
      hq: hq,
      power: power,
      notes: notes,
      titles: titles,
    };
  }

  // ----- Roster loading ------------------------------------------------------
  function setRoster(rows, sourceLabel) {
    roster = rows.map(normalizeMember).filter(function (m) { return !!m.name; });
    rosterSource = sourceLabel || '';
    var status = $('roster-status');
    if (status) status.textContent = t('rosterLoaded', { n: roster.length, src: rosterSource });
    rebuildTitleChips();
    updateEligibleCount();
    var roll = $('roll-btn');
    if (roll) roll.disabled = roster.length === 0;
    try {
      if (window.LWSTrack) LWSTrack.event('roster_loaded', 'train-conductor', {
        source: rosterSource, count: roster.length,
      });
    } catch (e) {}
  }

  function loadPreset(url) {
    var status = $('roster-status');
    if (status) status.textContent = t('loadBtn') + '…';
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (txt) {
        var rows = parseCsv(txt);
        var lbl = url.split('/').pop().replace('.csv', '');
        setRoster(rows, lbl);
      })
      .catch(function (e) {
        if (status) status.textContent = t('loadFailed', { err: e.message });
      });
  }

  function loadPaste() {
    var txt = ($('paste-area').value || '').trim();
    if (!txt) return;
    try {
      var rows = parseCsv(txt);
      setRoster(rows, 'paste');
    } catch (e) {
      $('roster-status').textContent = t('loadFailed', { err: e.message });
    }
  }

  function loadUpload(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var rows = parseCsv(reader.result);
      setRoster(rows, file.name);
    };
    reader.onerror = function () {
      $('roster-status').textContent = t('loadFailed', { err: 'read error' });
    };
    reader.readAsText(file);
  }

  // ----- Title chips (built from roster) -------------------------------------
  var selectedTitles = {}; // { title: true } — default: all on
  var noneSelected = true;

  function rebuildTitleChips() {
    var container = $('title-chips');
    if (!container) return;
    // gather uniques
    var set = {};
    roster.forEach(function (m) { m.titles.forEach(function (tt) { set[tt] = true; }); });
    var titles = Object.keys(set).sort();
    // Preserve existing selections; default new titles to ON
    titles.forEach(function (tt) {
      if (!(tt in selectedTitles)) selectedTitles[tt] = true;
    });

    // Rebuild DOM. Include a synthetic "no title" chip.
    container.innerHTML = '';
    var none = document.createElement('span');
    none.className = 'chip' + (noneSelected ? ' on' : '');
    none.setAttribute('data-title', '__none__');
    none.textContent = t('titleNone');
    none.addEventListener('click', function () {
      noneSelected = !noneSelected;
      none.classList.toggle('on', noneSelected);
      updateEligibleCount();
    });
    container.appendChild(none);

    titles.forEach(function (tt) {
      var el = document.createElement('span');
      el.className = 'chip' + (selectedTitles[tt] ? ' on' : '');
      el.setAttribute('data-title', tt);
      el.textContent = tt;
      el.addEventListener('click', function () {
        selectedTitles[tt] = !selectedTitles[tt];
        el.classList.toggle('on', selectedTitles[tt]);
        updateEligibleCount();
      });
      container.appendChild(el);
    });
  }

  // ----- Filtering ----------------------------------------------------------
  function currentFilters() {
    var ranks = $$('#rank-chips .chip.on').map(function (c) { return c.getAttribute('data-rank'); });
    var hqMin = parseInt($('hq-min').value, 10) || 0;
    var powerMinM = parseFloat($('power-min').value) || 0;
    var powerMin = powerMinM * 1000000;
    var excludes = ($('manual-excludes').value || '')
      .split(/\r?\n/).map(function (s) { return s.trim().toLowerCase(); })
      .filter(Boolean);
    var titles = Object.keys(selectedTitles).filter(function (k) { return selectedTitles[k]; });
    var skipRecent = $('skip-recent').checked;
    return {
      ranks: ranks, hqMin: hqMin, powerMin: powerMin, powerMinM: powerMinM,
      excludes: excludes, titles: titles, allowNoTitle: noneSelected,
      skipRecent: skipRecent,
    };
  }

  function isEligible(member, f) {
    if (f.ranks.indexOf(member.rank) === -1) return false;
    if (member.hq < f.hqMin) return false;
    if (member.power < f.powerMin) return false;
    if (f.excludes.indexOf(member.name.toLowerCase()) !== -1) return false;
    // Titles: if member has no titles, allowed only if allowNoTitle
    if (!member.titles.length) {
      if (!f.allowNoTitle) return false;
    } else {
      // Must have at least one selected title
      var ok = member.titles.some(function (tt) { return f.titles.indexOf(tt) !== -1; });
      if (!ok) return false;
    }
    return true;
  }

  function updateEligibleCount() {
    var f = currentFilters();
    var eligible = roster.filter(function (m) { return isEligible(m, f); });
    var el = $('eligible-count');
    if (el) el.textContent = t('eligibleCount', { n: eligible.length, m: roster.length });
    var roll = $('roll-btn');
    if (roll) roll.disabled = eligible.length === 0;
    return eligible;
  }

  // ----- History -------------------------------------------------------------
  function loadHistory() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveHistory(arr) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, HISTORY_MAX))); } catch (e) {}
  }

  function addToHistory(entry) {
    var arr = loadHistory();
    arr.unshift(entry);
    saveHistory(arr);
    renderHistory();
  }

  function daysAgo(ts) {
    var diff = Date.now() - ts;
    var d = Math.floor(diff / (24 * 60 * 60 * 1000));
    return d;
  }

  function renderHistory() {
    var arr = loadHistory();
    var list = $('history-list');
    var empty = $('history-empty');
    if (!list || !empty) return;
    list.innerHTML = '';
    if (!arr.length) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    arr.forEach(function (entry, i) {
      var li = document.createElement('li');
      var left = document.createElement('span');
      left.className = 'hn';
      left.textContent = (i + 1) + '. ' + entry.name + ' (' + (entry.rank || '') + ')';
      var right = document.createElement('span');
      right.className = 'ht';
      var d = daysAgo(entry.ts);
      var ago;
      if (d <= 0) ago = t('pickToday');
      else if (d === 1) ago = t('pickYesterday');
      else ago = t('pickDaysAgo', { n: d });
      right.textContent = ago + ' · ' + t('pickIndex', { n: i + 1 });
      li.appendChild(left);
      li.appendChild(right);
      list.appendChild(li);
    });
  }

  function lastConductedAt(name) {
    var arr = loadHistory();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].name.toLowerCase() === name.toLowerCase()) return arr[i].ts;
    }
    return 0;
  }

  // ----- Weighted random selection ------------------------------------------
  function weightFor(member, skipRecent) {
    if (!skipRecent) return 1.0;
    var when = lastConductedAt(member.name);
    if (!when) return 1.0;
    var diff = Date.now() - when;
    if (diff <= WEEK_MS) return 0.05;              // last week — heavy penalty
    if (diff <= 3 * WEEK_MS) return 0.3;           // last 3 weeks — moderate
    return 1.0;
  }

  function weightedPick(pool, skipRecent) {
    var weights = pool.map(function (m) { return weightFor(m, skipRecent); });
    var total = weights.reduce(function (a, b) { return a + b; }, 0);
    if (total <= 0) {
      // fallback to uniform if all zero
      return pool[Math.floor(Math.random() * pool.length)];
    }
    var r = Math.random() * total;
    for (var i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  function pickBackups(pool, winner, skipRecent, n) {
    var rest = pool.filter(function (m) { return m.name !== winner.name; });
    var picks = [];
    while (picks.length < n && rest.length) {
      var p = weightedPick(rest, skipRecent);
      picks.push(p);
      rest = rest.filter(function (m) { return m.name !== p.name; });
    }
    return picks;
  }

  // ----- Roll animation ------------------------------------------------------
  function roll() {
    var f = currentFilters();
    var eligible = roster.filter(function (m) { return isEligible(m, f); });
    var reveal = $('reveal');
    var nameEl = $('reveal-name');
    var subEl = $('reveal-status');
    var metaEl = $('reveal-meta');
    var backupsEl = $('backups');
    var auditEl = $('audit-info');
    var postRow = $('post-row');

    if (!eligible.length) {
      reveal.classList.remove('winner-shown');
      reveal.classList.add('on');
      subEl.textContent = t('noEligible');
      nameEl.textContent = '—';
      metaEl.textContent = '';
      backupsEl.style.display = 'none';
      auditEl.style.display = 'none';
      postRow.style.display = 'none';
      return;
    }

    var winner = weightedPick(eligible, f.skipRecent);
    var backups = pickBackups(eligible, winner, f.skipRecent, 2);

    // Animate: cycle through eligible names for ~2.6s, easing out.
    reveal.classList.add('on', 'spinning');
    reveal.classList.remove('winner-shown');
    subEl.textContent = t('revealSpinning');
    metaEl.textContent = '';
    backupsEl.style.display = 'none';
    auditEl.style.display = 'none';
    postRow.style.display = 'none';

    var start = Date.now();
    var total = 2600;
    var minInterval = 40;
    var maxInterval = 260;

    function tick() {
      var elapsed = Date.now() - start;
      var progress = Math.min(1, elapsed / total);
      // Ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var interval = minInterval + (maxInterval - minInterval) * eased;

      if (progress >= 1) {
        // Final reveal
        reveal.classList.remove('spinning');
        reveal.classList.add('winner-shown');
        subEl.textContent = t('revealWinner');
        nameEl.textContent = winner.name;
        metaEl.textContent = winner.rank + ' · HQ' + winner.hq + ' · ' + fmtPower(winner.power)
          + (winner.titles.length ? ' · ' + winner.titles.join(', ') : '');
        backupsEl.style.display = 'block';
        $('backups-list').innerHTML = backups.map(function (b) {
          return '<span class="b-name">' + escapeHtml(b.name) + '</span>';
        }).join(', ');

        // Audit line
        var titlesLabel = f.titles.length === Object.keys(selectedTitles).length && f.allowNoTitle
          ? t('auditTitlesAny')
          : (f.titles.length ? f.titles.join('/') : '') + (f.allowNoTitle ? ' + no-title' : '');
        var lines = [
          t('auditRolledFrom', { n: eligible.length }),
          t('auditFilters', {
            ranks: f.ranks.join('/'),
            hq: f.hqMin,
            power: f.powerMinM,
            titles: titlesLabel,
          }),
          t('auditBias', { on: f.skipRecent ? t('auditOn') : t('auditOff') }),
          t('auditTs', { t: new Date().toLocaleString() }),
        ];
        auditEl.innerHTML = lines.map(escapeHtml).join('<br>');
        auditEl.style.display = 'block';
        postRow.style.display = 'flex';

        lastRoll = {
          winner: winner,
          backups: backups,
          filters: f,
          ts: Date.now(),
          eligibleCount: eligible.length,
        };
        try {
          if (window.LWSTrack) LWSTrack.event('conductor_rolled', 'train-conductor', {
            eligible: eligible.length, skipRecent: f.skipRecent,
          });
        } catch (e) {}
        return;
      }

      var randMember = eligible[Math.floor(Math.random() * eligible.length)];
      nameEl.textContent = randMember.name;
      setTimeout(tick, interval);
    }
    tick();
  }

  // ----- Utils --------------------------------------------------------------
  function fmtPower(p) {
    if (!p) return '—';
    if (p >= 1e9) return (p / 1e9).toFixed(2) + 'B';
    if (p >= 1e6) return (p / 1e6).toFixed(1) + 'M';
    if (p >= 1e3) return (p / 1e3).toFixed(0) + 'K';
    return String(p);
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ----- Event wiring -------------------------------------------------------
  function wire() {
    // Source tabs
    $$('#source-tabs .source-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var src = btn.getAttribute('data-source');
        $$('#source-tabs .source-tab').forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        var pb = $('preset-block'); if (pb) pb.style.display = src === 'preset' ? 'block' : 'none';
        $('paste-block').style.display = src === 'paste' ? 'block' : 'none';
        $('upload-block').style.display = src === 'upload' ? 'block' : 'none';
      });
    });

    var _presetLoad = $('preset-load');
    if (_presetLoad) _presetLoad.addEventListener('click', function () { loadPreset($('preset-select').value); });
    $('paste-load').addEventListener('click', loadPaste);
    // Auto-load the canonical roster (LW Atlas + upload) from the shared picker.
    window.__lwsRosterLoaded = function (rows) { setRoster(rows, 'LW Atlas'); };
    window.addEventListener('lws:roster-loaded', function (e) {
      if (e.detail && e.detail.rows) setRoster(e.detail.rows, 'LW Atlas');
    });
    $('upload-input').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) loadUpload(e.target.files[0]);
    });

    // Rank chips
    $$('#rank-chips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        c.classList.toggle('on');
        updateEligibleCount();
      });
    });

    // Filters
    ['hq-min', 'power-min', 'skip-recent'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener('change', updateEligibleCount);
      if (el) el.addEventListener('input', updateEligibleCount);
    });
    $('manual-excludes').addEventListener('input', updateEligibleCount);

    // Roll
    $('roll-btn').addEventListener('click', roll);
    $('reroll-btn').addEventListener('click', roll);

    // Confirm / copy
    $('confirm-btn').addEventListener('click', function () {
      if (!lastRoll) return;
      addToHistory({
        name: lastRoll.winner.name,
        rank: lastRoll.winner.rank,
        ts: lastRoll.ts,
      });
      $('reveal-status').textContent = t('confirmed');
      try {
        if (window.LWSTrack) LWSTrack.event('conductor_confirmed', 'train-conductor', {
          rank: lastRoll.winner.rank,
        });
      } catch (e) {}
    });
    $('copy-btn').addEventListener('click', function () {
      if (!lastRoll) return;
      var txt = 'Conductor: ' + lastRoll.winner.name + ' (' + lastRoll.winner.rank + ')\n'
        + 'Backups: ' + lastRoll.backups.map(function (b) { return b.name; }).join(', ') + '\n'
        + 'Eligible pool: ' + lastRoll.eligibleCount + ' members\n'
        + 'Rolled at: ' + new Date(lastRoll.ts).toLocaleString();
      try {
        navigator.clipboard.writeText(txt).then(function () {
          $('reveal-status').textContent = t('copied');
        });
      } catch (e) {
        // Fallback
        var ta = document.createElement('textarea');
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
        $('reveal-status').textContent = t('copied');
      }
    });

    // History
    $('history-clear').addEventListener('click', function () {
      if (window.confirm(t('historyConfirmClear'))) {
        try { localStorage.removeItem(HISTORY_KEY); } catch (e) {}
        renderHistory();
      }
    });
    $('history-export').addEventListener('click', function () {
      var arr = loadHistory();
      var csv = 'position,name,rank,timestamp\n' + arr.map(function (h, i) {
        return (i + 1) + ',' + JSON.stringify(h.name) + ',' + (h.rank || '') + ',' + new Date(h.ts).toISOString();
      }).join('\n');
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'conductor-history.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Re-render on language change
    window.addEventListener('lws:lang-changed', function () {
      // Rebuild the "no title" chip label + count string
      rebuildTitleChips();
      updateEligibleCount();
      renderHistory();
      // Update roster status text if we already have a roster
      if (roster.length) {
        var status = $('roster-status');
        if (status) status.textContent = t('rosterLoaded', { n: roster.length, src: rosterSource });
      }
    });
  }

  // ----- Boot ---------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    wire();
    renderHistory();
    // Auto-load of Moonpetal demo REMOVED 2026-07-26. Empty state by default;
    // users pick a preset + click Load or upload their own CSV.
  });
})();
