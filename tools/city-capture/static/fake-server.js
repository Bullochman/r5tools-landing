/**
 * Fake-server shim for static GH Pages deploy of LWS City Capture Planner.
 * Intercepts /api/rank with a JS port of server.py's rank_captures() +
 * _capture_slot_schedule(). Client code untouched.
 */
(function () {
  'use strict';

  // ---- KB-sourced constants (mirror server.py) ----
  const CITY_HEAT_BY_LEVEL = { 1: 5, 2: 15, 3: 25, 4: 35, 5: 50, 6: 60 };
  const CITY_SOIL_PER_HR = { 1: 350, 2: 450, 3: 600, 4: 750, 5: 900, 6: 1000 };
  const CITY_UNLOCK_WEEK_DAY = { 1: [1, 3], 2: [1, 5], 3: [2, 2], 4: [2, 5], 5: [3, 3], 6: [3, 6] };
  const MAX_CITIES = 6, MAX_DIGS = 4, CAPTURES_PER_DAY = 2, POST_CAPTURE_PROTECTION_HOURS = 36;

  function chebyshevDistance(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  }

  function isUnlocked(cityLevel, week, day) {
    if (!(cityLevel in CITY_UNLOCK_WEEK_DAY)) return true;
    const [uw, ud] = CITY_UNLOCK_WEEK_DAY[cityLevel];
    if (week < uw) return false;
    if (week === uw && day < ud) return false;
    return true;
  }

  function scoreCandidate(candidate, hiveCenter, week, day, exposedCount) {
    const ctype = (candidate.type || 'city').toLowerCase();
    const level = parseInt(candidate.targetLevel, 10) || 1;
    const x = parseInt(candidate.x, 10) || 0;
    const y = parseInt(candidate.y, 10) || 0;

    const heatDelta = ctype === 'city' ? (CITY_HEAT_BY_LEVEL[level] || 0) : 0;
    const heatMultiplier = exposedCount > 0 ? 2 : 1;
    const heatScore = heatDelta * heatMultiplier;

    const soilPerHr = ctype === 'city' ? (CITY_SOIL_PER_HR[level] || 0) : 300;
    const soilScore = (soilPerHr / CITY_SOIL_PER_HR[6]) * 100;

    const dist = hiveCenter ? chebyshevDistance({ x, y }, hiveCenter) : 30;
    const proximityScore = Math.max(0, 30 - dist);

    const unlocked = ctype === 'city' ? isUnlocked(level, week, day) : true;
    const unlockScore = unlocked ? 1 : -5;

    const typeBonus = ctype === 'city' ? 5 : 0;

    const total = heatScore + soilScore + proximityScore + unlockScore + typeBonus;
    return { total, breakdown: {
      heat_score: Math.round(heatScore * 10) / 10,
      soil_score: Math.round(soilScore * 10) / 10,
      proximity_score: Math.round(proximityScore * 10) / 10,
      unlock_score: unlockScore,
      type_bonus: typeBonus,
      heat_delta_c: heatDelta,
      soil_per_hr: soilPerHr,
      distance_from_hive_tiles: dist,
      unlocked_this_wk_day: unlocked,
    }};
  }

  function captureSlotSchedule(ranked, seasonStartIso, currentWeek, currentDay) {
    const schedule = [];
    const slotCounts = new Map();
    const keyOf = (w, d) => `${w}.${d}`;
    for (const c of ranked) {
      let wk = currentWeek, day = currentDay;
      const ctype = (c.type || 'city').toLowerCase();
      const level = parseInt(c.targetLevel, 10) || 1;
      if (ctype === 'city' && (level in CITY_UNLOCK_WEEK_DAY)) {
        const [uw, ud] = CITY_UNLOCK_WEEK_DAY[level];
        if (wk < uw || (wk === uw && day < ud)) { wk = uw; day = ud; }
      }
      while ((slotCounts.get(keyOf(wk, day)) || 0) >= CAPTURES_PER_DAY) {
        day += 1;
        if (day > 7) { day = 1; wk += 1; }
      }
      const k = keyOf(wk, day);
      slotCounts.set(k, (slotCounts.get(k) || 0) + 1);
      const withSlot = Object.assign({}, c);
      withSlot.capture_slot = { week: wk, day: day, slot_index_in_day: slotCounts.get(k) };
      if (seasonStartIso) {
        try {
          const startMs = new Date(seasonStartIso).getTime();
          const captureMs = startMs + ((wk - 1) * 7 + (day - 1)) * 86400_000;
          const expiryMs = captureMs + POST_CAPTURE_PROTECTION_HOURS * 3600_000;
          withSlot.protection_expiry_utc = new Date(expiryMs).toISOString().replace(/\.\d{3}Z$/, 'Z');
        } catch (e) { withSlot.protection_expiry_utc = null; }
      }
      schedule.push(withSlot);
    }
    return schedule;
  }

  function rankCaptures(payload) {
    const candidates = payload.candidates || [];
    const hiveCenter = payload.hive_center || payload.hiveCenter || { x: 600, y: 600 };
    const week = parseInt(payload.week, 10) || 1;
    const day = parseInt(payload.day, 10) || 1;
    const exposed = parseInt(payload.exposed_members, 10) || 0;
    const seasonStartIso = payload.season_start_iso;

    const warnings = [];
    const scored = candidates.map(c => {
      const s = scoreCandidate(c, hiveCenter, week, day, exposed);
      return { total: s.total, item: Object.assign({}, c, { priority_score: Math.round(s.total * 10) / 10 }, s.breakdown) };
    });
    scored.sort((a, b) => b.total - a.total);
    const ranked = scored.map(x => x.item);

    const cityCount = ranked.filter(c => (c.type || 'city').toLowerCase() === 'city').length;
    const digCount = ranked.filter(c => (c.type || '').toLowerCase() === 'dig').length;
    if (cityCount > MAX_CITIES) warnings.push(`${cityCount} city candidates exceeds the ${MAX_CITIES}-city cap. Lowest-scored will be deferred.`);
    if (digCount > MAX_DIGS) warnings.push(`${digCount} dig-site candidates exceeds the ${MAX_DIGS}-site cap. Lowest-scored will be deferred.`);
    const gated = ranked.filter(c => c.unlocked_this_wk_day === false);
    if (gated.length) warnings.push(`${gated.length} candidate(s) locked at current Wk${week}.D${day} — scheduled for their unlock window.`);
    if (exposed > 0) warnings.push(`Heat scoring is 2x weighted because ${exposed} member(s) are exposed below the -20°C freeze threshold.`);

    const schedule = captureSlotSchedule(ranked, seasonStartIso, week, day);

    return {
      ranked: schedule,
      summary: {
        candidate_count: ranked.length,
        city_count: cityCount, dig_count: digCount, gated_count: gated.length,
        current_wk_day: { week, day },
        exposed_members: exposed,
        capacity: { cities: `${Math.min(cityCount, MAX_CITIES)}/${MAX_CITIES}`, digs: `${Math.min(digCount, MAX_DIGS)}/${MAX_DIGS}` },
      },
      warnings,
    };
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    if (url === '/api/rank' && init && init.method === 'POST') {
      let body = {};
      try { body = JSON.parse(init.body); } catch (e) {}
      return new Response(JSON.stringify(rankCaptures(body)), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      });
    }
    return realFetch(input, init);
  };

  window.__CityCapture = { rankCaptures, scoreCandidate, captureSlotSchedule };
})();
