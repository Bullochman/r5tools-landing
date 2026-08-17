// LWS Wave Attack Coordinator — CREATE mode + JOIN mode + NTP sync + cues.
// Client-only. Wave config encoded in URL. No backend.
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var t = function (k, v) { return (window.LWS_I18N && window.LWS_I18N.t(k, v)) || k; };

  // ---------- base64url helpers ----------
  function b64urlEncode(str) {
    var b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    try { return decodeURIComponent(escape(atob(str))); } catch (e) { return null; }
  }

  // ---------- NTP-style clock skew ----------
  // Estimated offset in ms: (server_time - Date.now()) at sample time.
  // Use (Date.now() + clockOffsetMs) as "true" wall clock.
  var clockOffsetMs = null;
  var clockOffsetAge = null;

  function syncClock() {
    // Try Cloudflare's cdn-cgi/trace (fast, has ts=) then fall back to
    // worldtimeapi.org. If all fail, we just show "offset unknown".
    var t0 = Date.now();
    // Strategy 1: worldtimeapi (public, no auth, returns unixtime)
    return fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      var t1 = Date.now();
      return r.json().then(function (j) {
        // unixtime is in seconds; account for round-trip
        var serverMs = (j.unixtime * 1000) + Math.round((t1 - t0) / 2);
        clockOffsetMs = serverMs - t1;
        clockOffsetAge = Date.now();
        renderSkew();
        return clockOffsetMs;
      });
    }).catch(function () {
      // Strategy 2: Google time via HEAD (some CORS constraints — best-effort)
      try {
        return fetch('https://www.google.com/generate_204', {
          method: 'HEAD', mode: 'no-cors', cache: 'no-store',
        }).then(function (r) {
          // With no-cors we can't read headers; give up gracefully.
          renderSkew();
          return null;
        }).catch(function () {
          renderSkew();
          return null;
        });
      } catch (e) {
        renderSkew();
        return null;
      }
    });
  }

  function nowMs() {
    if (clockOffsetMs === null) return Date.now();
    return Date.now() + clockOffsetMs;
  }

  function renderSkew() {
    var badge = $('j-skew-badge');
    var val = $('j-skew-value');
    if (!badge || !val) return;
    if (clockOffsetMs === null) {
      val.textContent = t('deviceOffsetUnk');
      badge.className = 'skew-badge';
      return;
    }
    var ms = Math.round(clockOffsetMs);
    var sign = ms >= 0 ? '+' : '-';
    var abs = Math.abs(ms);
    val.textContent = t('deviceOffsetMs', { sign: sign, ms: abs });
    badge.className = 'skew-badge ' + (abs > 500 ? 'bad' : abs > 200 ? 'warn' : 'ok');
  }

  // ---------- Audio (WebAudio) ----------
  var audioCtx = null;
  function ensureAudioCtx() {
    if (audioCtx) return audioCtx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
      return audioCtx;
    } catch (e) { return null; }
  }
  function beep(freq, durMs, volume) {
    var ctx = ensureAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume || 0.35, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (durMs / 1000));
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (durMs / 1000) + 0.02);
  }
  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
  }

  function updateAudioUnlockUi() {
    var el = $('j-audio-unlock');
    if (!el) return;
    var ctx = audioCtx;
    if (!ctx || ctx.state === 'suspended') {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  }

  // ---------- Mode dispatch ----------
  function getWaveFromUrl() {
    var qp = new URLSearchParams(location.search);
    var w = qp.get('w');
    if (!w) return null;
    var json = b64urlDecode(w);
    if (!json) return { __bad: true };
    try {
      var cfg = JSON.parse(json);
      if (!cfg || typeof cfg.impact !== 'number') return { __bad: true };
      return cfg;
    } catch (e) { return { __bad: true }; }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var cfg = getWaveFromUrl();
    if (cfg) {
      $('join-mode').style.display = 'block';
      if (cfg.__bad) {
        renderBadConfig();
      } else {
        initJoin(cfg);
      }
    } else {
      $('create-mode').style.display = 'block';
      initCreate();
    }
  });

  function renderBadConfig() {
    var wrap = $('join-mode');
    wrap.querySelector('.countdown-screen').innerHTML =
      '<div class="wave-name-display" style="color:var(--status-red)">' +
      t('badConfig') + '</div>' +
      '<a href="./" class="fullscreen-btn" style="margin-top:24px">← ' +
      (window.LWS_I18N && window.LWS_I18N.getLang() === 'ko' ? '새 웨이브 만들기' : 'Create a new wave') +
      '</a>';
  }

  // ---------- CREATE mode ----------
  function initCreate() {
    // Default impact-time = now + 5 minutes (local)
    var defaultDt = new Date(Date.now() + 5 * 60 * 1000);
    // datetime-local requires YYYY-MM-DDTHH:MM (no TZ suffix)
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var localStr =
      defaultDt.getFullYear() + '-' + pad(defaultDt.getMonth() + 1) + '-' + pad(defaultDt.getDate()) +
      'T' + pad(defaultDt.getHours()) + ':' + pad(defaultDt.getMinutes()) + ':' + pad(defaultDt.getSeconds());
    $('impact-time').value = localStr;

    $('generate-btn').addEventListener('click', onGenerate);
    $('copy-url-btn').addEventListener('click', onCopyUrl);
    $('share-native-btn').addEventListener('click', onShareNative);
    $('share-whatsapp-btn').addEventListener('click', function () { shareVia('whatsapp'); });
    $('share-discord-btn').addEventListener('click', function () { shareVia('discord'); });
    $('share-kakao-btn').addEventListener('click', function () { shareVia('kakao'); });

    if (window.LWSTrack) {
      window.LWSTrack.event('wave_create_view', 'wave-coordinator', {});
    }
  }

  function readCreateInputs() {
    var name = ($('wave-name').value || '').trim();
    var impactStr = $('impact-time').value;
    var serverTime = $('server-time-toggle').checked;
    var num = parseInt($('wave-num').value, 10);
    var total = parseInt($('wave-total').value, 10);
    var notes = ($('wave-notes').value || '').trim();

    if (!impactStr) return null;
    // impactStr looks like "2026-07-18T19:30:15"
    var impactMs;
    if (serverTime) {
      // interpret as UTC
      impactMs = Date.parse(impactStr + 'Z');
    } else {
      impactMs = Date.parse(impactStr);
    }
    if (isNaN(impactMs)) return null;

    var cfg = { impact: impactMs };
    if (name) cfg.name = name.slice(0, 120);
    if (notes) cfg.notes = notes.slice(0, 500);
    if (!isNaN(num) && num > 0) cfg.n = num;
    if (!isNaN(total) && total > 0) cfg.tot = total;
    if (serverTime) cfg.tz = 'UTC';
    return cfg;
  }

  function buildWaveUrl(cfg) {
    var json = JSON.stringify(cfg);
    var encoded = b64urlEncode(json);
    var base = location.origin + location.pathname;
    return base + '?w=' + encoded + '&ref=RONY-ALLIANCE';
  }

  function onGenerate() {
    var cfg = readCreateInputs();
    if (!cfg) {
      alert(window.LWS_I18N && window.LWS_I18N.getLang() === 'ko' ?
        '착지 시각을 입력해주세요.' :
        'Please set an impact time.');
      return;
    }
    var url = buildWaveUrl(cfg);
    $('wave-url-box').textContent = url;
    $('wave-url-output').style.display = 'block';
    $('preview-link').href = url;
    if (window.LWSTrack) {
      window.LWSTrack.event('wave_created', 'wave-coordinator', {
        has_notes: !!cfg.notes, has_seq: !!cfg.n, tz: cfg.tz || 'local',
      });
    }
  }

  function onCopyUrl() {
    var url = $('wave-url-box').textContent;
    if (!url) return;
    try {
      navigator.clipboard.writeText(url).then(function () {
        var btn = $('copy-url-btn');
        var orig = btn.textContent;
        btn.textContent = '✓ ' + t('copiedMsg');
        setTimeout(function () { btn.innerHTML = '<span data-i18n="copyBtn">' + t('copyBtn') + '</span>'; }, 1600);
      });
    } catch (e) {
      // fallback: select+copy via temp textarea
      var ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e2) {}
      document.body.removeChild(ta);
    }
  }

  function onShareNative() {
    var url = $('wave-url-box').textContent;
    if (!url) return;
    if (navigator.share) {
      navigator.share({
        title: 'Wave attack',
        text: t('shareTextPrefix'),
        url: url,
      }).catch(function () {});
    } else {
      onCopyUrl();
    }
  }

  function shareVia(net) {
    var url = $('wave-url-box').textContent;
    if (!url) return;
    var text = t('shareTextPrefix') + ' ' + url;
    var target = '';
    if (net === 'whatsapp') {
      target = 'https://wa.me/?text=' + encodeURIComponent(text);
    } else if (net === 'discord') {
      // Discord has no direct share URL — copy to clipboard + open web app
      try {
        navigator.clipboard.writeText(text);
      } catch (e) {}
      target = 'https://discord.com/channels/@me';
    } else if (net === 'kakao') {
      // KakaoTalk web share fallback: use share text via mobile URI scheme where possible.
      // For desktop this falls back to copying + notifying.
      try {
        navigator.clipboard.writeText(text);
        alert(window.LWS_I18N && window.LWS_I18N.getLang() === 'ko' ?
          '카카오톡에 붙여넣기용으로 복사되었습니다.' :
          'Copied for pasting into KakaoTalk.');
      } catch (e) {}
      return;
    }
    if (target) window.open(target, '_blank', 'noopener');
  }

  // ---------- JOIN mode ----------
  var joinState = {
    cfg: null,
    marchSeconds: null,
    firedCues: {},
    fired: false,
    tickInterval: null,
  };

  function initJoin(cfg) {
    joinState.cfg = cfg;

    // Populate wave metadata
    if (cfg.name) $('j-wave-name').textContent = cfg.name;
    else {
      $('j-wave-name').textContent = window.LWS_I18N && window.LWS_I18N.getLang() === 'ko' ?
        '웨이브 공격' : 'Wave attack';
    }

    if (cfg.n && cfg.tot) {
      var seq = $('j-wave-seq');
      seq.style.display = 'block';
      seq.textContent = 'Wave ' + cfg.n + ' / ' + cfg.tot;
    }

    if (cfg.notes) {
      $('j-notes').style.display = 'block';
      $('j-notes').textContent = cfg.notes;
    }

    // Impact time display (in viewer's local time)
    var impact = new Date(cfg.impact);
    var lang = window.LWS_I18N && window.LWS_I18N.getLang();
    var opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, weekday: 'short', month: 'short', day: 'numeric' };
    var fmt = impact.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', opts);
    if (cfg.tz === 'UTC') fmt += ' (' + impact.toISOString().split('T')[1].slice(0, 8) + ' UTC)';
    $('j-impact-time').textContent = fmt;
    $('j-lands-at').textContent = fmt;

    // Kick off NTP sync
    syncClock();

    // March-time saved?
    var saved = null;
    try { saved = localStorage.getItem('lws_wave_march_secs'); } catch (e) {}
    if (saved && !isNaN(parseInt(saved, 10))) {
      $('march-seconds').value = saved;
      joinState.marchSeconds = parseInt(saved, 10);
      showCountdownArea();
    } else {
      $('j-march-setup').style.display = 'block';
    }

    // Wire up controls
    $('save-march-btn').addEventListener('click', onSaveMarch);
    $('march-seconds').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') onSaveMarch();
    });
    $('edit-march-btn').addEventListener('click', function () {
      $('j-march-setup').style.display = 'block';
      $('j-countdown-area').style.display = 'none';
    });
    $('audio-unlock-btn').addEventListener('click', unlockAudio);
    $('fullscreen-btn').addEventListener('click', toggleFullscreen);
    $('reset-btn').addEventListener('click', resetJoin);
    $('new-wave-btn').addEventListener('click', function () {
      location.href = location.pathname;
    });

    if (window.LWSTrack) {
      window.LWSTrack.event('wave_join_view', 'wave-coordinator', {
        has_name: !!cfg.name, has_notes: !!cfg.notes,
      });
    }
  }

  function onSaveMarch() {
    var v = parseInt($('march-seconds').value, 10);
    if (isNaN(v) || v <= 0 || v > 7200) return;
    joinState.marchSeconds = v;
    try { localStorage.setItem('lws_wave_march_secs', String(v)); } catch (e) {}
    showCountdownArea();
    // Attempt audio unlock via this user gesture
    unlockAudio();
  }

  function showCountdownArea() {
    $('j-march-setup').style.display = 'none';
    $('j-countdown-area').style.display = 'block';
    updateAudioUnlockUi();
    startTicker();
  }

  function unlockAudio() {
    var ctx = ensureAudioCtx();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(updateAudioUnlockUi).catch(function () {});
    }
    // Play a tiny inaudible tick to fully unlock on iOS
    try { beep(880, 60, 0.05); } catch (e) {}
    updateAudioUnlockUi();
  }

  function startTicker() {
    if (joinState.tickInterval) clearInterval(joinState.tickInterval);
    tick();
    joinState.tickInterval = setInterval(tick, 100);
  }

  function tick() {
    if (!joinState.cfg || !joinState.marchSeconds) return;
    var impactMs = joinState.cfg.impact;
    var sendMs = impactMs - (joinState.marchSeconds * 1000);
    var now = nowMs();
    var deltaMs = sendMs - now;

    // Render send time
    var sendDate = new Date(sendMs);
    var lang = window.LWS_I18N && window.LWS_I18N.getLang();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var msPad = function (n) { return String(n).padStart(3, '0'); };
    var sendStr =
      pad(sendDate.getHours()) + ':' +
      pad(sendDate.getMinutes()) + ':' +
      pad(sendDate.getSeconds()) + '.' +
      msPad(sendDate.getMilliseconds());
    $('j-send-time').textContent = sendStr;

    // Render countdown
    var cd = $('j-countdown');
    cd.className = 'countdown-display';
    if (deltaMs <= -1500) {
      // Post-fire screen
      if (!joinState.fired) {
        joinState.fired = true;
        showFireScreen();
      }
      return;
    }
    if (deltaMs <= 0) {
      // GO
      cd.textContent = t('go');
      cd.classList.add('go');
      fireCue('go');
      return;
    }

    var totalSec = deltaMs / 1000;
    if (totalSec <= 10) cd.classList.add('hot');
    else if (totalSec <= 30) cd.classList.add('warn');

    if (totalSec <= 10) {
      // Show M:SS.mmm-ish (just seconds + decimal for the last 10s)
      cd.textContent = totalSec.toFixed(1) + 's';
    } else {
      var wholeSec = Math.ceil(totalSec);
      var m = Math.floor(wholeSec / 60);
      var s = wholeSec % 60;
      cd.textContent = m + ':' + pad(s);
    }

    // Fire audio+vibration cues
    fireCuesFor(deltaMs);
  }

  function fireCuesFor(deltaMs) {
    var thresholds = [
      { key: 't15', at: 15000, freq: 440, dur: 150, vib: [80] },
      { key: 't10', at: 10000, freq: 523, dur: 200, vib: [120] },
      { key: 't5',  at:  5000, freq: 659, dur: 250, vib: [180] },
      { key: 't3',  at:  3000, freq: 784, dur: 200, vib: [100] },
      { key: 't2',  at:  2000, freq: 880, dur: 200, vib: [100] },
      { key: 't1',  at:  1000, freq: 988, dur: 200, vib: [100] },
    ];
    for (var i = 0; i < thresholds.length; i++) {
      var th = thresholds[i];
      // Fire when deltaMs first drops below the threshold (within a small window)
      if (deltaMs <= th.at && deltaMs > th.at - 400 && !joinState.firedCues[th.key]) {
        joinState.firedCues[th.key] = true;
        beep(th.freq, th.dur, 0.35);
        vibrate(th.vib);
      }
    }
  }

  function fireCue(key) {
    if (joinState.firedCues[key]) return;
    joinState.firedCues[key] = true;
    if (key === 'go') {
      // Big tone: two-note chime
      beep(1175, 500, 0.5);
      setTimeout(function () { beep(1568, 700, 0.5); }, 120);
      vibrate([300, 60, 300]);
      document.body.classList.add('flash-go');
      setTimeout(function () { document.body.classList.remove('flash-go'); }, 700);
    }
  }

  function showFireScreen() {
    $('j-countdown-area').style.display = 'none';
    $('j-fire-screen').style.display = 'block';
    if (window.LWSTrack) {
      window.LWSTrack.event('wave_fired', 'wave-coordinator', {});
    }
  }

  function resetJoin() {
    joinState.firedCues = {};
    joinState.fired = false;
    $('j-fire-screen').style.display = 'none';
    showCountdownArea();
  }

  function toggleFullscreen() {
    document.body.classList.toggle('fs-mode');
    try {
      if (document.body.classList.contains('fs-mode')) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(function () {});
        }
      } else {
        if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
      }
    } catch (e) {}
  }

  // Re-render skew badge on language change
  window.addEventListener('lws:lang-changed', function () {
    renderSkew();
    if (joinState.cfg) {
      // re-render impact time to update locale
      var impact = new Date(joinState.cfg.impact);
      var lang = window.LWS_I18N && window.LWS_I18N.getLang();
      var opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, weekday: 'short', month: 'short', day: 'numeric' };
      var fmt = impact.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', opts);
      if (joinState.cfg.tz === 'UTC') fmt += ' (' + impact.toISOString().split('T')[1].slice(0, 8) + ' UTC)';
      var el1 = $('j-impact-time'); if (el1) el1.textContent = fmt;
      var el2 = $('j-lands-at'); if (el2) el2.textContent = fmt;
    }
  });
})();
