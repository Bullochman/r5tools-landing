/*!
 * alliance-flag.js — Alliance Flag PNG generator for r5tools.io
 * -------------------------------------------------------------
 * Pattern-keyword emblem renderer. No dependencies. No network.
 *
 * Because we can't turn arbitrary prose into vector art, this parses
 * the emblem string for known keywords (crown, sword, dragon…) and maps
 * each to a Unicode glyph rendered at large size on a themed badge.
 * Color words in the string tint the emblem + (for the "custom" theme)
 * the badge fill. Everything renders to a 400×400 (configurable) canvas.
 *
 * v2 could swap the keyword lookup for a DALL·E / SDXL call and paint
 * the returned bitmap into the same badge chrome — the composition
 * scaffolding (ring + banner + watermark) is intentionally reusable.
 *
 * Public API:
 *   window.AllianceFlag.generate(opts) -> HTMLCanvasElement
 *   window.AllianceFlag.mount(selector) -> void  (builds interactive UI)
 */
(function (global) {
  'use strict';

  // -------- palette + themes --------
  var THEMES = {
    gold:   { bg: '#0a0e1a', ring: '#c9a961', banner: '#12192c', bannerText: '#c9a961', emblem: '#c9a961', badgeFill: '#12192c' },
    frost:  { bg: '#e8eef7', ring: '#3b6fb0', banner: '#1a3358', bannerText: '#e8eef7', emblem: '#1a3358', badgeFill: '#c8d6ea' },
    desert: { bg: '#3d2a17', ring: '#e0b56a', banner: '#5a3d1e', bannerText: '#f4e3b8', emblem: '#f4e3b8', badgeFill: '#8a5a2b' },
    night:  { bg: '#0a0514', ring: '#8a5cd1', banner: '#1a0f2e', bannerText: '#c8a8f0', emblem: '#c8a8f0', badgeFill: '#1e1235' },
    west:   { bg: '#e8d4a8', ring: '#a04a1e', banner: '#5c2410', bannerText: '#e8d4a8', emblem: '#a04a1e', badgeFill: '#c88a55' },
    custom: { bg: '#0a0e1a', ring: '#c9a961', banner: '#12192c', bannerText: '#c9a961', emblem: '#c9a961', badgeFill: '#12192c' }
  };

  // Named color words → hex. First match in emblem string wins for `emblem` color.
  var COLOR_WORDS = {
    gold: '#c9a961', yellow: '#e6c85a', amber: '#e8a032',
    red: '#c94a3a', crimson: '#8b1a2b', scarlet: '#c9302c',
    blue: '#3b6fb0', azure: '#4a90e2', navy: '#1a3358',
    green: '#4a9b5f', emerald: '#2f8a5a', forest: '#1e5c3a',
    purple: '#7a4ac9', violet: '#8a5cd1', magenta: '#c94a9b',
    white: '#f4f4f8', silver: '#c8ccd4', ivory: '#f0e8d8',
    black: '#0a0a12', onyx: '#141420', charcoal: '#2a2a35',
    orange: '#e88a4a', rust: '#a04a1e', copper: '#b87333',
    pink: '#e88ab0', teal: '#3aa89b', cyan: '#4ac9c9'
  };

  // Emblem keyword → Unicode glyph. All chosen for wide font support
  // (system-ui, Apple Color Emoji, Segoe UI Symbol, Noto Sans Symbols).
  var EMBLEM_GLYPHS = {
    crown:   '♛', // ♛ black queen (crown-shaped, monochrome-tintable)
    shield:  '⛨', // ⛨ shield
    sword:   '⚔', // ⚔ crossed swords
    swords:  '⚔',
    star:    '★', // ★ black star
    bolt:    '⚡', // ⚡ high voltage
    lightning: '⚡',
    flame:   '🔥', // 🔥
    fire:    '🔥',
    moon:    '☽', // ☽ first quarter
    sun:     '☀', // ☀
    wolf:    '🐺', // 🐺
    dragon:  '🐉', // 🐉
    arrow:   '➳', // ➳ arrow
    leaf:    '⚘', // ⚘ leaf-like
    skull:   '☠', // ☠
    eye:     '👁', // 👁
    snake:   '🐍', // 🐍
    phoenix: '🕊',  // 🕊 (dove — closest fallback for phoenix)
    anchor:  '⚓', // ⚓
    heart:   '❤', // ❤
    axe:     '🪓', // 🪓
    hammer:  '🔨', // 🔨
    horse:   '♞', // ♞
    tower:   '♜'  // ♜
  };

  // -------- parsing --------
  function parseEmblem(str) {
    var lower = (str || '').toLowerCase();
    var glyph = null, keyword = null;
    var keys = Object.keys(EMBLEM_GLYPHS);
    // Find first keyword match (by position in string) so "red crown on shield" picks crown.
    var earliest = Infinity;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var idx = lower.indexOf(k);
      if (idx >= 0 && idx < earliest) { earliest = idx; keyword = k; glyph = EMBLEM_GLYPHS[k]; }
    }
    // If no known keyword, fall back to first uppercase letter of description or "?"
    if (!glyph) {
      var m = (str || '').match(/[A-Za-z]/);
      glyph = m ? m[0].toUpperCase() : '✦'; // ✦
      keyword = null;
    }

    var colors = [];
    var cw = Object.keys(COLOR_WORDS);
    // Preserve order-of-appearance so "gold on red" → [gold, red].
    var found = [];
    for (var j = 0; j < cw.length; j++) {
      var pos = lower.indexOf(cw[j]);
      if (pos >= 0) found.push({ pos: pos, hex: COLOR_WORDS[cw[j]] });
    }
    found.sort(function (a, b) { return a.pos - b.pos; });
    for (var f = 0; f < found.length; f++) colors.push(found[f].hex);

    return { glyph: glyph, keyword: keyword, colors: colors };
  }

  // -------- drawing --------
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function generate(opts) {
    opts = opts || {};
    var size = opts.size || 400;
    var tag = (opts.tag || 'R5T').toString().slice(0, 6).toUpperCase();
    var emblem = opts.emblem || 'gold star';
    var themeName = (opts.theme || 'gold').toLowerCase();
    var theme = THEMES[themeName] ? Object.assign({}, THEMES[themeName]) : Object.assign({}, THEMES.gold);

    var parsed = parseEmblem(emblem);

    // Apply parsed colors: first color tints the emblem; if theme is custom,
    // second color tints the badge fill and third the ring.
    if (parsed.colors[0]) theme.emblem = parsed.colors[0];
    if (themeName === 'custom') {
      if (parsed.colors[1]) theme.badgeFill = parsed.colors[1];
      if (parsed.colors[2]) theme.ring = parsed.colors[2];
      if (parsed.colors[1]) theme.banner = parsed.colors[1];
    }
    // Explicit overrides win.
    if (opts.rankColor) theme.ring = opts.rankColor;
    if (opts.bgColor) theme.bg = opts.bgColor;
    if (opts.emblemColor) theme.emblem = opts.emblemColor;

    var canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    var ctx = canvas.getContext('2d');

    // Background wash
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, size, size);

    // Subtle vignette
    var grd = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.7);
    grd.addColorStop(0, 'rgba(255,255,255,0.04)');
    grd.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);

    // Circular badge
    var cx = size / 2;
    var cy = size * 0.46;
    var radius = size * 0.36;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = theme.badgeFill;
    ctx.fill();

    // Ring
    ctx.lineWidth = Math.max(6, size * 0.025);
    ctx.strokeStyle = theme.ring;
    ctx.stroke();

    // Inner hairline
    ctx.beginPath();
    ctx.arc(cx, cy, radius - ctx.lineWidth - 2, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.stroke();

    // Emblem glyph
    ctx.fillStyle = theme.emblem;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var emblemFontSize = Math.floor(size * 0.45);
    ctx.font = '700 ' + emblemFontSize + 'px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "Noto Sans Symbols 2", system-ui, sans-serif';
    // Nudge baseline slightly; emoji rendering varies per platform.
    ctx.fillText(parsed.glyph, cx, cy + emblemFontSize * 0.02);

    // Bottom tag banner (rounded pill)
    var bannerW = Math.min(size * 0.78, size - 40);
    var bannerH = Math.floor(size * 0.16);
    var bannerX = (size - bannerW) / 2;
    var bannerY = size - bannerH - Math.floor(size * 0.06);
    var bannerR = bannerH / 2;

    // Banner shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = theme.banner;
    roundRect(ctx, bannerX, bannerY, bannerW, bannerH, bannerR);
    ctx.fill();
    ctx.restore();

    // Banner border
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.ring;
    roundRect(ctx, bannerX, bannerY, bannerW, bannerH, bannerR);
    ctx.stroke();

    // Tag text
    ctx.fillStyle = theme.bannerText;
    var tagFontSize = Math.floor(bannerH * 0.5);
    ctx.font = '800 ' + tagFontSize + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('[' + tag + ']', size / 2, bannerY + bannerH / 2 + 1);

    // Watermark
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '600 9px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('r5tools.io', size - 6, size - 4);

    return canvas;
  }

  // -------- interactive UI --------
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === 'style' && typeof attrs[k] === 'object') Object.assign(e.style, attrs[k]);
        else if (k === 'text') e.textContent = attrs[k];
        else if (k === 'html') e.innerHTML = attrs[k];
        else e.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return e;
  }

  function mount(selector) {
    var host = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!host) { console.warn('[AllianceFlag] mount target not found:', selector); return; }

    // Inject scoped styles once.
    if (!document.getElementById('alliance-flag-styles')) {
      var style = document.createElement('style');
      style.id = 'alliance-flag-styles';
      style.textContent = [
        '.af-wrap{display:grid;grid-template-columns:minmax(280px,1fr) minmax(280px,1fr);gap:24px;align-items:start}',
        '@media (max-width:720px){.af-wrap{grid-template-columns:1fr}}',
        '.af-form{background:var(--panel,#0d1424);border:1px solid var(--border,rgba(255,255,255,.08));border-radius:12px;padding:22px;display:flex;flex-direction:column;gap:14px}',
        '.af-form label{display:block;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-mute,#7a8290);margin-bottom:6px;font-weight:600}',
        '.af-form input,.af-form select{width:100%;padding:11px 13px;background:var(--panel-2,#12192c);border:1px solid var(--border,rgba(255,255,255,.08));border-radius:8px;color:var(--text,#e6e8ee);font-size:14px;font-family:inherit}',
        '.af-form input:focus,.af-form select:focus{outline:none;border-color:var(--accent,#c9a961)}',
        '.af-hint{font-size:11.5px;color:var(--text-mute,#7a8290);margin-top:4px;line-height:1.5}',
        '.af-preview{background:var(--panel,#0d1424);border:1px solid var(--border,rgba(255,255,255,.08));border-radius:12px;padding:22px;display:flex;flex-direction:column;align-items:center;gap:16px}',
        '.af-canvas-frame{background:repeating-conic-gradient(#12192c 0% 25%,#0d1424 0% 50%) 50%/24px 24px;border-radius:10px;padding:12px;display:inline-block}',
        '.af-canvas-frame canvas{display:block;max-width:100%;height:auto;border-radius:6px}',
        '.af-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}',
        '.af-btn{background:var(--accent,#c9a961);color:#0a0e1a;padding:11px 20px;border-radius:8px;font-weight:700;font-size:13.5px;border:none;cursor:pointer;font-family:inherit;text-decoration:none;display:inline-block}',
        '.af-btn:hover{background:var(--accent-hover,#d9b871)}',
        '.af-btn.secondary{background:var(--panel-2,#12192c);color:var(--text,#e6e8ee);border:1px solid var(--border,rgba(255,255,255,.08))}',
        '.af-btn.secondary:hover{border-color:var(--accent,#c9a961);color:var(--accent,#c9a961)}',
        '.af-swatches{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}',
        '.af-swatch{width:22px;height:22px;border-radius:50%;border:1px solid rgba(255,255,255,.15);cursor:pointer}',
        '.af-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}'
      ].join('\n');
      document.head.appendChild(style);
    }

    var tagInput = el('input', { type: 'text', maxlength: '6', value: 'RONY', placeholder: 'RONY', 'aria-label': 'Alliance tag' });
    var emblemInput = el('input', { type: 'text', value: 'gold crown on dark shield', placeholder: 'gold crown on red shield', 'aria-label': 'Emblem description' });
    var themeSelect = el('select', { 'aria-label': 'Theme' });
    var themeOpts = [
      ['gold',   'Gold — accent on dark (default)'],
      ['frost',  'Frost — blue on white (S2 vibe)'],
      ['desert', 'Desert — sand on ochre (S3 vibe)'],
      ['night',  'Night — purple on black (S4 vibe)'],
      ['west',   'West — rust on tan (S5 vibe)'],
      ['custom', 'Custom — colors from emblem text']
    ];
    themeOpts.forEach(function (o) { themeSelect.appendChild(el('option', { value: o[0] }, o[1])); });

    var sizeSelect = el('select', { 'aria-label': 'Size' });
    [['400', '400×400 (Discord header, tool background)'], ['800', '800×800 (retina / print)'], ['1200', '1200×1200 (banner source)']].forEach(function (o) {
      sizeSelect.appendChild(el('option', { value: o[0] }, o[1]));
    });

    var previewFrame = el('div', { class: 'af-canvas-frame' });
    var downloadBtn = el('a', { class: 'af-btn', download: 'alliance-flag.png' }, 'Download PNG');
    var copyBtn = el('button', { class: 'af-btn secondary', type: 'button' }, 'Copy image');
    var randomizeBtn = el('button', { class: 'af-btn secondary', type: 'button' }, 'Try example');

    var examples = [
      { tag: 'RONY', emblem: 'gold crown on dark shield',   theme: 'gold' },
      { tag: 'FROST', emblem: 'silver wolf blue moon',       theme: 'frost' },
      { tag: 'SAND', emblem: 'amber sun on desert',          theme: 'desert' },
      { tag: 'HEX',  emblem: 'violet dragon eye',            theme: 'night' },
      { tag: 'RUST', emblem: 'rust axe on tan',              theme: 'west' },
      { tag: 'STORM', emblem: 'gold lightning bolt on black', theme: 'custom' },
      { tag: 'HIVE', emblem: 'emerald leaf on gold',         theme: 'custom' },
      { tag: 'KILN', emblem: 'red flame on onyx',            theme: 'custom' }
    ];

    function render() {
      var opts = {
        tag: tagInput.value.trim() || 'R5T',
        emblem: emblemInput.value.trim() || 'gold star',
        theme: themeSelect.value,
        size: parseInt(sizeSelect.value, 10) || 400
      };
      var canvas = generate(opts);
      previewFrame.innerHTML = '';
      // Show preview at max 360px wide regardless of source size.
      canvas.style.width = Math.min(360, canvas.width) + 'px';
      previewFrame.appendChild(canvas);
      try {
        downloadBtn.href = canvas.toDataURL('image/png');
        downloadBtn.download = 'alliance-flag-' + opts.tag.toLowerCase() + '-' + opts.size + '.png';
      } catch (e) { /* tainted canvas shouldn't happen — no external images */ }
      previewFrame._canvas = canvas;
    }

    [tagInput, emblemInput, themeSelect, sizeSelect].forEach(function (n) {
      n.addEventListener('input', render);
      n.addEventListener('change', render);
    });

    copyBtn.addEventListener('click', function () {
      var c = previewFrame._canvas;
      if (!c || !c.toBlob || !navigator.clipboard || !window.ClipboardItem) {
        copyBtn.textContent = 'Not supported in this browser';
        setTimeout(function () { copyBtn.textContent = 'Copy image'; }, 1800);
        return;
      }
      c.toBlob(function (blob) {
        var item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(function () {
          copyBtn.textContent = 'Copied!';
          setTimeout(function () { copyBtn.textContent = 'Copy image'; }, 1400);
        }).catch(function () {
          copyBtn.textContent = 'Copy failed';
          setTimeout(function () { copyBtn.textContent = 'Copy image'; }, 1600);
        });
      });
    });

    randomizeBtn.addEventListener('click', function () {
      var e = examples[Math.floor(Math.random() * examples.length)];
      tagInput.value = e.tag;
      emblemInput.value = e.emblem;
      themeSelect.value = e.theme;
      render();
    });

    var keywordList = Object.keys(EMBLEM_GLYPHS).join(', ');
    var colorList = Object.keys(COLOR_WORDS).slice(0, 12).join(', ');

    var form = el('div', { class: 'af-form' }, [
      el('div', null, [
        el('label', null, 'Alliance tag (3-6 chars)'),
        tagInput,
        el('div', { class: 'af-hint' }, 'Rendered as [TAG] in the bottom banner.')
      ]),
      el('div', null, [
        el('label', null, 'Emblem description'),
        emblemInput,
        el('div', { class: 'af-hint', html: 'Keywords: <b>' + keywordList + '</b>. Colors: <b>' + colorList + '…</b>. First keyword picks the glyph; first color tints it.' })
      ]),
      el('div', { class: 'af-row2' }, [
        el('div', null, [el('label', null, 'Theme'), themeSelect]),
        el('div', null, [el('label', null, 'Size'), sizeSelect])
      ]),
      el('div', null, [randomizeBtn])
    ]);

    var preview = el('div', { class: 'af-preview' }, [
      previewFrame,
      el('div', { class: 'af-actions' }, [downloadBtn, copyBtn])
    ]);

    host.innerHTML = '';
    host.appendChild(el('div', { class: 'af-wrap' }, [form, preview]));

    render();
  }

  global.AllianceFlag = { generate: generate, mount: mount, _themes: THEMES, _emblems: EMBLEM_GLYPHS, _colors: COLOR_WORDS };
})(typeof window !== 'undefined' ? window : this);
