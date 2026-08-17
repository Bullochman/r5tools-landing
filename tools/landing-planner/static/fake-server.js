/**
 * Fake-server shim for static GH Pages deploy of LWS Landing Planner.
 * Intercepts POST /api/assign with a JS port of server.py v0.3's
 * rank-tier ring assignment algorithm. Client code unchanged.
 */
(function () {
  'use strict';

  // ---- KB-sourced constants (mirror server.py v0.3) ----
  const FREEZE_THRESHOLD_C = -20;
  const AMBIENT_ZONES_C = [-15, -30, -40, -50, -60, -70, -80];
  const ALLIANCE_FURNACE_HEAT_L1 = 3.0;
  const ALLIANCE_FURNACE_HEAT_L20 = 12.5;
  const FURNACE_RADIUS_TILES_PLACEHOLDER = 5;
  const WARLORD_MISSILE_SAFE_DISTANCE_TILES = 5;
  const MEMBER_GAP_TILES = 2;
  const MEMBER_FOOTPRINT_TILES = 2;
  const MEMBER_PITCH_TILES = MEMBER_FOOTPRINT_TILES + MEMBER_GAP_TILES;
  const RING_CAPACITIES = [20, 28, 36, 44];

  function ambientTemperatureForCoord(x, y, mapSize = 1200) {
    const cx = mapSize / 2, cy = mapSize / 2;
    const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
    const d = Math.max(dx, dy);
    const maxD = mapSize / 2;
    const zoneFromEdge = Math.min(6, Math.max(0, Math.round((1 - d / maxD) * 6)));
    return AMBIENT_ZONES_C[zoneFromEdge];
  }

  function allianceFurnaceHeat(level) {
    const lvl = Math.max(1, Math.min(20, parseInt(level, 10) || 1));
    if (lvl === 1) return ALLIANCE_FURNACE_HEAT_L1;
    if (lvl === 20) return ALLIANCE_FURNACE_HEAT_L20;
    const slope = (ALLIANCE_FURNACE_HEAT_L20 - ALLIANCE_FURNACE_HEAT_L1) / 19;
    return Math.round((ALLIANCE_FURNACE_HEAT_L1 + slope * (lvl - 1)) * 100) / 100;
  }

  function tierForMember(m) {
    const rank = String(m.rank || 'R1').toUpperCase();
    const notes = String(m.notes || '').toLowerCase();
    const isTitled = notes.indexOf('titled:') !== -1;
    const isRallyLeader = notes.indexOf('rally_leader:true') !== -1;
    if (rank === 'R5') return 1;
    if (rank === 'R4' && (isTitled || isRallyLeader)) return 1;
    if (rank === 'R4') return 2;
    if (rank === 'R3') return 3;
    return 4;
  }

  function placeInRing(ring, slotInRing, capacity) {
    const ringDistance = WARLORD_MISSILE_SAFE_DISTANCE_TILES + (ring - 1) * MEMBER_PITCH_TILES;
    const perSide = Math.max(1, Math.floor(capacity / 4));
    const side = Math.floor(slotInRing / perSide);
    const posOnSide = slotInRing % perSide;
    const step = (2 * ringDistance) / Math.max(1, perSide);
    const offset = -ringDistance + step * posOnSide;
    let dx, dy;
    if (side === 0) { dx = offset; dy = -ringDistance; }
    else if (side === 1) { dx = ringDistance; dy = offset; }
    else if (side === 2) { dx = -offset; dy = ringDistance; }
    else { dx = -ringDistance; dy = -offset; }
    return [dx, dy, ringDistance];
  }

  function assignLandingTiles(anchor, roster, furnaceLevel = 1) {
    const ax = anchor.x, ay = anchor.y;
    const ambient = ambientTemperatureForCoord(ax, ay);
    const furnaceBonus = allianceFurnaceHeat(furnaceLevel);
    const warnings = [];
    const ringPurposes = { 1: 'rally-leader', 2: 'defender', 3: 'supporter', 4: 'hunter' };

    const buckets = { 1: [], 2: [], 3: [], 4: [] };
    for (const m of roster) buckets[tierForMember(m)].push(m);
    for (const t of [1, 2, 3, 4]) {
      buckets[t].sort((a, b) => (parseInt(b.power, 10) || 0) - (parseInt(a.power, 10) || 0));
    }

    const r5Count = roster.filter(m => String(m.rank || '').toUpperCase() === 'R5').length;
    const r4Count = roster.filter(m => String(m.rank || '').toUpperCase() === 'R4').length;
    if (r5Count === 0) warnings.push('No R5 in the roster — one member must be R5 to build the Alliance Furnace on Day 1.');
    if (r4Count < 4) warnings.push(`Only ${r4Count} R4(s) in the roster. Season 6 Alliance Skills require 4 titled R4 slots (Warlord / Recruiter / Muse / Butler). Consider promoting more R3s before season starts.`);

    const totalMembers = Object.values(buckets).reduce((s, b) => s + b.length, 0);
    const totalCap = RING_CAPACITIES.reduce((s, c) => s + c, 0);
    if (totalMembers > totalCap) {
      warnings.push(`${totalMembers} members exceed the ${totalCap}-slot 4-ring capacity. Overflow will place into synthetic Ring 5+ further from the furnace — those bases will need personal High-Heat Furnaces to stay safe.`);
    }

    const assignments = [];
    const tierStart = { 1: 1, 2: 2, 3: 3, 4: 4 };
    const ringFill = {};
    const tierOverflow = {};
    const tierLabels = { 1: 'rally leaders', 2: 'defenders', 3: 'supporters', 4: 'hunters' };

    for (const tier of [1, 2, 3, 4]) {
      const members = buckets[tier];
      let ring = tierStart[tier];
      for (const m of members) {
        let capacity = RING_CAPACITIES[Math.min(ring - 1, RING_CAPACITIES.length - 1)];
        while ((ringFill[ring] || 0) >= capacity) {
          ring += 1;
          capacity = RING_CAPACITIES[Math.min(ring - 1, RING_CAPACITIES.length - 1)];
          if (ring > 4) tierOverflow[tier] = true;
        }
        const slot = ringFill[ring] || 0;
        const [dx, dy] = placeInRing(ring, slot, capacity);
        const assignedX = Math.round(ax + dx);
        const assignedY = Math.round(ay + dy);
        const distFromAnchor = Math.max(Math.abs(dx), Math.abs(dy));
        const insideFurnace = distFromAnchor <= FURNACE_RADIUS_TILES_PLACEHOLDER;
        const tileTemp = ambient + (insideFurnace ? furnaceBonus : 0);
        let freezeRisk;
        if (tileTemp > FREEZE_THRESHOLD_C) freezeRisk = 'safe';
        else if (tileTemp > FREEZE_THRESHOLD_C - 10) freezeRisk = 'warning';
        else freezeRisk = 'danger';

        assignments.push({
          name: m.name || '',
          rank: m.rank || '',
          hq_level: m.hq_level || '',
          power: parseInt(m.power, 10) || 0,
          assigned_x: assignedX,
          assigned_y: assignedY,
          delta_x: Math.round(dx),
          delta_y: Math.round(dy),
          ring,
          ring_purpose: ringPurposes[ring] || 'overflow',
          tier,
          inside_furnace_radius: insideFurnace,
          tile_ambient_c: ambient,
          tile_temp_with_furnace_c: Math.round(tileTemp * 10) / 10,
          freeze_risk: freezeRisk,
        });
        ringFill[ring] = slot + 1;
      }
    }

    for (const tier of Object.keys(tierOverflow)) {
      warnings.push(`${tierLabels[tier].charAt(0).toUpperCase() + tierLabels[tier].slice(1)} overflowed past their designated ring — reduce tier size or extend the hive with synthetic rings 5+.`);
    }
    const misplacedLeaders = assignments.filter(a => a.tier === 1 && a.ring > 1);
    if (misplacedLeaders.length) {
      warnings.push(`${misplacedLeaders.length} rally leader(s) placed outside Ring 1 (too many for the 20-slot ring). Consider promoting fewer R4s to Titled, OR sandwiching them in a Ring-1-plus-adjacent-Ring-2 pattern manually.`);
    }

    return {
      anchor: { x: ax, y: ay, ambient_c: ambient },
      furnace_level: parseInt(furnaceLevel, 10) || 1,
      furnace_bonus_c: furnaceBonus,
      furnace_radius_tiles: FURNACE_RADIUS_TILES_PLACEHOLDER,
      furnace_radius_is_placeholder: true,
      ring_purposes: ringPurposes,
      summary: {
        total_members: totalMembers,
        tier_counts: Object.fromEntries(Object.entries(buckets).map(([t, b]) => [t, b.length])),
        ring_fills: ringFill,
        ring_capacities: Object.fromEntries(RING_CAPACITIES.map((c, i) => [i + 1, c])),
      },
      assignments,
      warnings: warnings.concat([
        `Alliance Furnace tile radius by level is not published in any surveyed source (KB open question #1). Using placeholder radius of ${FURNACE_RADIUS_TILES_PLACEHOLDER} tiles. Verify in-game before locking a plan.`
      ]),
    };
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    if (url === '/api/assign' && init && init.method === 'POST') {
      let body = {};
      try { body = JSON.parse(init.body); } catch (e) {}
      const anchor = body.anchor || { x: 600, y: 600 };
      const roster = body.roster || [];
      const furnaceLevel = body.furnace_level || 1;
      return new Response(JSON.stringify(assignLandingTiles(anchor, roster, furnaceLevel)), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      });
    }
    return realFetch(input, init);
  };

  window.__LandingPlanner = { assignLandingTiles, ambientTemperatureForCoord, allianceFurnaceHeat, tierForMember };
})();
