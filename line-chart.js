/*!
 * LWSLineChart — lightweight SVG line chart for r5tools.io
 * Zero dependencies. Vanilla JS. SVG only.
 * Exports window.LWSLineChart = { render, renderMulti }
 */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var THEME = {
    bg: '#0d1424',
    line: '#c9a961',
    grid: 'rgba(255,255,255,0.08)',
    text: '#a8b0c0',
    axis: 'rgba(255,255,255,0.18)'
  };
  var DEFAULT_PALETTE = ['#c9a961', '#8ae0a3', '#7fb0e6', '#e08a8a', '#c48ae0', '#e6cf7a'];

  function el(tag, attrs, parent) {
    var n = document.createElementNS(SVG_NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function niceNum(range, round) {
    var exp = Math.floor(Math.log10(range));
    var frac = range / Math.pow(10, exp);
    var nf;
    if (round) nf = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
    else nf = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
    return nf * Math.pow(10, exp);
  }

  function niceTicks(min, max, count) {
    if (min === max) { min -= 1; max += 1; }
    var range = niceNum(max - min, false);
    var step = niceNum(range / (count - 1), true);
    var tickMin = Math.floor(min / step) * step;
    var tickMax = Math.ceil(max / step) * step;
    var ticks = [];
    for (var v = tickMin; v <= tickMax + step / 2; v += step) ticks.push(+v.toFixed(10));
    return { ticks: ticks, min: tickMin, max: tickMax };
  }

  function fmtNum(v) {
    var a = Math.abs(v);
    if (a >= 1e9) return (v / 1e9).toFixed(a >= 1e10 ? 1 : 2).replace(/\.?0+$/, '') + 'B';
    if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + 'M';
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.?0+$/, '') + 'K';
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(2).replace(/\.?0+$/, '');
  }

  function showEmpty(containerEl, msg) {
    containerEl.innerHTML =
      '<div style="padding:40px 20px;text-align:center;color:' + THEME.text +
      ';background:' + THEME.bg + ';border-radius:8px;font:14px system-ui,sans-serif;">' +
      (msg || 'No data yet — upload a roster to see trends.') + '</div>';
  }

  function ensureTooltip() {
    var t = document.getElementById('__lws_chart_tt');
    if (!t) {
      t = document.createElement('div');
      t.id = '__lws_chart_tt';
      t.style.cssText =
        'position:fixed;pointer-events:none;z-index:9999;background:#0a0e1a;' +
        'border:1px solid rgba(201,169,97,0.5);color:#e6e8ee;padding:6px 10px;' +
        'border-radius:6px;font:12px system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.4);' +
        'opacity:0;transition:opacity 120ms;white-space:nowrap;';
      document.body.appendChild(t);
    }
    return t;
  }

  function drawChart(containerEl, opts) {
    var series = opts.series || [];
    var isMulti = opts.multi === true;
    var lines = isMulti ? series : [{ label: opts.labelY || 'value', color: THEME.line, points: series }];

    // filter to non-empty
    lines = lines.filter(function (s) { return s.points && s.points.length; });
    if (!lines.length) { showEmpty(containerEl, opts.emptyMsg); return; }

    // Container prep
    containerEl.innerHTML = '';
    containerEl.style.background = THEME.bg;
    containerEl.style.borderRadius = '8px';
    containerEl.style.padding = '12px';
    containerEl.style.boxSizing = 'border-box';
    containerEl.style.position = 'relative';

    // Title
    if (opts.title) {
      var h = document.createElement('div');
      h.textContent = opts.title;
      h.style.cssText = 'color:#e6e8ee;font:600 14px system-ui,sans-serif;margin:0 0 8px 4px;letter-spacing:0.03em;';
      containerEl.appendChild(h);
    }

    // Legend for multi
    if (isMulti) {
      var lg = document.createElement('div');
      lg.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;margin:0 0 8px 4px;font:12px system-ui,sans-serif;color:' + THEME.text + ';';
      lines.forEach(function (s, i) {
        var c = s.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
        var item = document.createElement('span');
        item.style.cssText = 'display:inline-flex;align-items:center;gap:6px;';
        item.innerHTML = '<span style="width:12px;height:2px;background:' + c + ';display:inline-block;"></span>' +
          '<span>' + (s.label || 'series ' + (i + 1)) + '</span>';
        lg.appendChild(item);
      });
      containerEl.appendChild(lg);
    }

    var W = containerEl.clientWidth || 600;
    var H = opts.height || 240;
    var margin = { top: 10, right: 16, bottom: 44, left: 56 };
    var plotW = Math.max(50, W - margin.left - margin.right);
    var plotH = Math.max(50, H - margin.top - margin.bottom);

    // determine x domain: use index if x is numeric, otherwise treat as category
    var allXs = [], allYs = [];
    lines.forEach(function (s) { s.points.forEach(function (p) { allXs.push(p.x); allYs.push(+p.y); }); });
    var xIsNumeric = allXs.every(function (v) { return typeof v === 'number' && isFinite(v); });

    var xLabels;
    if (xIsNumeric) {
      xLabels = null;
    } else {
      // category axis — use x values from first (longest) series
      var longest = lines.reduce(function (a, b) { return b.points.length > a.points.length ? b : a; });
      xLabels = longest.points.map(function (p) { return String(p.x); });
    }

    var yMin = Math.min.apply(null, allYs);
    var yMax = Math.max.apply(null, allYs);
    if (yMin > 0 && yMin / (yMax || 1) > 0.6) yMin = yMin - (yMax - yMin) * 0.2;
    var y = niceTicks(yMin, yMax, 5);

    var xMin, xMax;
    if (xIsNumeric) { xMin = Math.min.apply(null, allXs); xMax = Math.max.apply(null, allXs); if (xMin === xMax) { xMin -= 1; xMax += 1; } }

    function xScale(v, seriesPoints) {
      if (xIsNumeric) return margin.left + ((v - xMin) / (xMax - xMin)) * plotW;
      // category: find idx in xLabels
      var idx = xLabels.indexOf(String(v));
      if (idx < 0 && seriesPoints) idx = seriesPoints.findIndex(function (p) { return String(p.x) === String(v); });
      var denom = Math.max(1, xLabels.length - 1);
      return margin.left + (idx / denom) * plotW;
    }
    function yScale(v) { return margin.top + plotH - ((v - y.min) / (y.max - y.min)) * plotH; }

    var svg = el('svg', { width: '100%', height: H, viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none' });
    svg.style.display = 'block';
    svg.style.overflow = 'visible';

    // Y grid + labels
    y.ticks.forEach(function (t) {
      var yy = yScale(t);
      el('line', { x1: margin.left, x2: W - margin.right, y1: yy, y2: yy, stroke: THEME.grid, 'stroke-width': 1 }, svg);
      var lbl = el('text', { x: margin.left - 8, y: yy + 4, 'text-anchor': 'end', fill: THEME.text, 'font-size': 11, 'font-family': 'system-ui, sans-serif' }, svg);
      lbl.textContent = fmtNum(t);
    });

    // X axis line
    el('line', { x1: margin.left, x2: W - margin.right, y1: margin.top + plotH, y2: margin.top + plotH, stroke: THEME.axis, 'stroke-width': 1 }, svg);

    // X labels
    var xTickVals, tickCount;
    if (xIsNumeric) {
      tickCount = Math.min(8, Math.max(2, Math.floor(plotW / 70)));
      xTickVals = [];
      for (var i = 0; i < tickCount; i++) xTickVals.push(xMin + (i / (tickCount - 1)) * (xMax - xMin));
    } else {
      xTickVals = xLabels.slice();
      tickCount = xTickVals.length;
    }
    var perLabelW = plotW / Math.max(1, tickCount - 1);
    var rotate = perLabelW < 60;
    xTickVals.forEach(function (v, i) {
      var xx = xIsNumeric ? xScale(v) : (margin.left + (i / Math.max(1, xLabels.length - 1)) * plotW);
      el('line', { x1: xx, x2: xx, y1: margin.top + plotH, y2: margin.top + plotH + 4, stroke: THEME.axis, 'stroke-width': 1 }, svg);
      var lbl = el('text', {
        x: xx, y: margin.top + plotH + (rotate ? 14 : 18),
        'text-anchor': rotate ? 'end' : 'middle', fill: THEME.text, 'font-size': 11,
        'font-family': 'system-ui, sans-serif',
        transform: rotate ? 'rotate(-45 ' + xx + ' ' + (margin.top + plotH + 14) + ')' : null
      }, svg);
      lbl.textContent = xIsNumeric ? fmtNum(v) : String(v);
    });

    // Axis labels
    if (opts.labelY) {
      var yl = el('text', { x: 12, y: margin.top + plotH / 2, fill: THEME.text, 'font-size': 11, 'font-family': 'system-ui, sans-serif', 'text-anchor': 'middle', transform: 'rotate(-90 12 ' + (margin.top + plotH / 2) + ')' }, svg);
      yl.textContent = opts.labelY;
    }
    if (opts.labelX) {
      var xl = el('text', { x: margin.left + plotW / 2, y: H - 4, fill: THEME.text, 'font-size': 11, 'font-family': 'system-ui, sans-serif', 'text-anchor': 'middle' }, svg);
      xl.textContent = opts.labelX;
    }

    // Draw lines
    var tooltip = ensureTooltip();
    var gRoot = el('g', { style: 'opacity:0;transition:opacity 400ms ease-out;' }, svg);
    lines.forEach(function (s, si) {
      var color = s.color || (isMulti ? DEFAULT_PALETTE[si % DEFAULT_PALETTE.length] : THEME.line);
      var pts = s.points.map(function (p) { return [xScale(p.x, s.points), yScale(+p.y)]; });
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
      el('path', { d: d, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, gRoot);
      s.points.forEach(function (p, i) {
        var cx = pts[i][0], cy = pts[i][1];
        var circle = el('circle', { cx: cx, cy: cy, r: 3.5, fill: THEME.bg, stroke: color, 'stroke-width': 2, style: 'cursor:pointer;' }, gRoot);
        var hit = el('circle', { cx: cx, cy: cy, r: 10, fill: 'transparent', style: 'cursor:pointer;' }, gRoot);
        var showTip = function (ev) {
          var xLabel = (typeof p.x === 'number') ? fmtNum(p.x) : String(p.x);
          tooltip.innerHTML = '<div style="color:' + color + ';font-weight:600;">' + (s.label || '') + '</div>' +
            '<div>' + xLabel + '</div>' +
            '<div style="color:#c9a961;font-weight:600;">' + fmtNum(+p.y) + '</div>';
          var r = ev.target.getBoundingClientRect();
          tooltip.style.left = (r.left + r.width / 2 + 12) + 'px';
          tooltip.style.top = (r.top - 8) + 'px';
          tooltip.style.opacity = '1';
          circle.setAttribute('r', 5);
        };
        var hideTip = function () { tooltip.style.opacity = '0'; circle.setAttribute('r', 3.5); };
        hit.addEventListener('mouseenter', showTip);
        hit.addEventListener('mouseleave', hideTip);
        circle.addEventListener('mouseenter', showTip);
        circle.addEventListener('mouseleave', hideTip);
      });
    });
    containerEl.appendChild(svg);
    // fade-in
    requestAnimationFrame(function () { gRoot.style.opacity = '1'; });

    // Re-render on resize
    if (!containerEl.__lwsResizeBound) {
      containerEl.__lwsResizeBound = true;
      var lastW = containerEl.clientWidth;
      var ro = new ResizeObserver(function () {
        if (Math.abs(containerEl.clientWidth - lastW) > 4) {
          lastW = containerEl.clientWidth;
          drawChart(containerEl, opts);
        }
      });
      ro.observe(containerEl);
    }
  }

  window.LWSLineChart = {
    render: function (containerEl, opts) { drawChart(containerEl, Object.assign({ multi: false }, opts || {})); },
    renderMulti: function (containerEl, opts) { drawChart(containerEl, Object.assign({ multi: true }, opts || {})); }
  };
})();
