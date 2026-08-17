/**
 * LWS Support — drop-in in-app support / feature request widget.
 *
 * Renders a small floating "💡 Feature request" button at bottom-left of any
 * page. Click → modal with text area + optional "🚨 URGENT — need help now"
 * escalation button that hits Evan's admin Discord with @here + red styling.
 *
 * Server side: POST to access-codes.r5tools.io/api/support with
 *   { tool, message, urgent: bool, contact?: string }
 * → server forwards to FEATURE_REQUEST_WEBHOOK env var.
 *
 * Usage: <script src="static/lws-support.js" defer></script> — auto-mounts
 * on DOMContentLoaded. To hide, remove the include or call
 *   LWSSupport.remove()
 * from console.
 */

(function (global) {
  'use strict';

  var API = 'https://access-codes.r5tools.io/api/support';
  var STATUS_API = 'https://access-codes.r5tools.io/api/support/status';
  var LS_KEY = 'lws_support_requests';   // array of {id, ts, tool, snippet, status, checked_at}
  var TOOL_NAME = ''; // Auto-detected from hostname unless overridden

  var STATUS_META = {
    received:    { emoji: '📥', label: 'Received',    color: '#a8b0c0' },
    seen:        { emoji: '👀', label: 'Seen by Evan', color: '#7cc8f2' },
    in_progress: { emoji: '🛠',  label: 'In progress', color: '#e0c060' },
    shipped:     { emoji: '✅', label: 'Shipped',      color: '#8ae0a3' },
    wont_fix:    { emoji: '❌', label: "Won't fix",    color: '#e08a8a' },
    unknown:     { emoji: '❓', label: 'Not found',    color: '#7a8290' },
  };

  function loadMyRequests() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') || []; }
    catch (e) { return []; }
  }
  function saveMyRequest(rec) {
    var arr = loadMyRequests();
    arr.unshift(rec);
    // Cap at 30 outstanding
    if (arr.length > 30) arr = arr.slice(0, 30);
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function updateMyRequests(statuses) {
    var arr = loadMyRequests();
    statuses.forEach(function (s) {
      var idx = arr.findIndex(function (r) { return r.id === s.id; });
      if (idx !== -1) {
        arr[idx].status = s.status;
        arr[idx].checked_at = new Date().toISOString();
      }
    });
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch (e) {}
    return arr;
  }
  async function refreshStatuses() {
    var arr = loadMyRequests();
    // Only re-check open items (not shipped/wont_fix)
    var open = arr.filter(function (r) { return r.status !== 'shipped' && r.status !== 'wont_fix'; });
    if (!open.length) return arr;
    try {
      var resp = await fetch(STATUS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: open.map(function (r) { return r.id; }) }),
      });
      var d = await resp.json();
      if (d && d.statuses) return updateMyRequests(d.statuses);
    } catch (e) { /* stay quiet */ }
    return arr;
  }

  function detectTool() {
    if (TOOL_NAME) return TOOL_NAME;
    var host = window.location.hostname || '';
    var path = window.location.pathname || '';
    if (host === 'hive.r5tools.io') return 'Hive Grid Manager';
    if (host === 'roster.r5tools.io') return 'Roster Extractor';
    if (host === 'chat.r5tools.io') return 'KB Chat';
    if (host === 'access-codes.r5tools.io') return 'Access Codes';
    if (host === 'r5tools.io') return 'Landing';
    if (host === 'bullochman.github.io') {
      var m = /lws-([a-z-]+?)-static/.exec(path);
      if (m) return m[1].replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }
    return host || 'r5tools.io';
  }

  var FAB_STYLE = 'position:fixed;bottom:24px;left:24px;background:#c9a961;color:#0a0e1a;border:none;border-radius:100px;padding:12px 18px;font:600 13px system-ui,-apple-system,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.4);cursor:pointer;z-index:99997;display:inline-flex;align-items:center;gap:6px';
  var FAB_HOVER = 'background:#d9b871;transform:translateY(-1px);box-shadow:0 6px 24px rgba(0,0,0,0.5)';

  function createFab() {
    if (document.getElementById('lws-support-fab')) return;
    var btn = document.createElement('button');
    btn.id = 'lws-support-fab';
    btn.type = 'button';
    btn.setAttribute('style', FAB_STYLE);
    btn.innerHTML = '<span style="font-size:16px;line-height:1">💡</span><span>Request Feature</span>';
    btn.title = 'Request a feature or get support';
    btn.onmouseover = function () { btn.setAttribute('style', FAB_STYLE + ';' + FAB_HOVER); };
    btn.onmouseout = function () { btn.setAttribute('style', FAB_STYLE); };
    btn.onclick = openModal;
    document.body.appendChild(btn);
  }

  function openModal() {
    if (document.getElementById('lws-support-backdrop')) return;
    var b = document.createElement('div');
    b.id = 'lws-support-backdrop';
    b.setAttribute('style', 'position:fixed;inset:0;background:rgba(0,0,0,0.72);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,sans-serif');

    var box = document.createElement('div');
    box.setAttribute('style', 'background:#0d1424;color:#e6e8ee;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:24px;max-width:560px;width:100%;box-shadow:0 12px 48px rgba(0,0,0,0.6);max-height:90vh;overflow-y:auto');

    box.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
      '  <h3 style="margin:0;color:#c9a961;font-size:15px;letter-spacing:0.05em;text-transform:uppercase">💡 Request a feature or get support</h3>' +
      '  <button id="lws-support-close" style="background:transparent;color:#7a8290;border:none;font-size:22px;cursor:pointer;padding:0 6px">×</button>' +
      '</div>' +
      '<div id="lws-evan-status" style="padding:10px 14px;background:rgba(201,169,97,0.08);border:1px solid rgba(201,169,97,0.25);border-radius:8px;margin-bottom:14px;font-size:12.5px;color:#a8b0c0;display:flex;align-items:center;gap:10px">' +
      '  <span id="lws-evan-emoji" style="font-size:18px;line-height:1">⏳</span>' +
      '  <span id="lws-evan-text" style="flex:1;line-height:1.4">Checking Evan\'s current availability…</span>' +
      '</div>' +
      '<div id="lws-my-requests-slot" style="margin-bottom:14px"></div>' +
      '<p style="margin:0 0 14px;color:#a8b0c0;font-size:13px;line-height:1.5">' +
      "What's missing? What's broken? What would make this suite work better for your R5 role? Every message lands in Evan's Discord instantly. You'll get a reference number — check back here anytime to see where it is in his pipeline." +
      '</p>' +
      '<label style="display:block;font-size:11px;color:#7a8290;letter-spacing:.05em;text-transform:uppercase;margin-bottom:4px">You are here: <span style="color:#c9a961">' + detectTool().replace(/</g, '&lt;') + '</span></label>' +
      '<textarea id="lws-support-msg" rows="6" placeholder="Type your feature request, bug report, or question here..." style="width:100%;padding:12px;background:#050810;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:6px;font:14px system-ui;box-sizing:border-box;resize:vertical;min-height:120px;line-height:1.5"></textarea>' +
      '<label style="display:block;font-size:11px;color:#7a8290;letter-spacing:.05em;text-transform:uppercase;margin:12px 0 4px">Optional — how to reach you back (email, Discord tag, alliance name)</label>' +
      '<input id="lws-support-contact" type="text" placeholder="you@example.com or Discord@name or alliance name" style="width:100%;padding:10px 12px;background:#050810;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:6px;font:13px system-ui;box-sizing:border-box" />' +
      '<div id="lws-support-status" style="margin-top:10px;font-size:12.5px;min-height:16px;color:#a8b0c0"></div>' +
      '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;justify-content:flex-end">' +
      '  <button id="lws-support-cancel" style="padding:9px 14px;background:transparent;color:#a8b0c0;border:1px solid rgba(255,255,255,0.15);border-radius:6px;font:500 13px system-ui;cursor:pointer">Cancel</button>' +
      '  <button id="lws-support-send" style="padding:9px 16px;background:#c9a961;color:#0a0e1a;border:none;border-radius:6px;font:700 13px system-ui;cursor:pointer">Send to Evan\'s Discord</button>' +
      '</div>' +
      '<div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08)">' +
      '  <div style="font-size:11px;color:#7a8290;letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px">Nothing else works?</div>' +
      '  <button id="lws-support-urgent" style="width:100%;padding:12px;background:#7a1f1f;color:#ffdad7;border:1px solid #b8402c;border-radius:6px;font:700 13px system-ui;cursor:pointer;letter-spacing:.03em">🚨 URGENT — WAKE EVAN UP (paying customer, tool is broken)</button>' +
      '  <p style="margin:6px 0 0;font-size:11px;color:#7a8290;line-height:1.5">' +
      "Sends the same message flagged red with @here in Evan's admin channel. Use only if a paid tool isn't working and you're stuck. He'll see the push notification on his phone within seconds." +
      '  </p>' +
      '</div>';

    b.appendChild(box);
    document.body.appendChild(b);
    var msgEl = box.querySelector('#lws-support-msg');
    var contactEl = box.querySelector('#lws-support-contact');
    var statusEl = box.querySelector('#lws-support-status');
    msgEl.focus();

    function setStatus(text, color) {
      statusEl.textContent = text;
      statusEl.style.color = color || '#a8b0c0';
    }

    function close() { b.remove(); }
    box.querySelector('#lws-support-close').onclick = close;
    box.querySelector('#lws-support-cancel').onclick = close;
    b.onclick = function (e) { if (e.target === b) close(); };

    // Render Evan's current availability + user's request history (async)
    refreshStatuses().then(function (arr) { renderMyRequests(box, arr); });
    // Also fetch fresh evan-status from any POST/GET response cycle. We'll
    // trigger a status lookup with empty ids just to get evan status back.
    fetch(STATUS_API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [] }),
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.evan) renderEvanStatus(box, d.evan);
    }).catch(function () {});

    async function send(urgent) {
      var msg = msgEl.value.trim();
      if (!msg) { setStatus('Type a message first.', '#e08a8a'); return; }
      var sendBtn = box.querySelector('#lws-support-send');
      var urgentBtn = box.querySelector('#lws-support-urgent');
      sendBtn.disabled = true; urgentBtn.disabled = true;
      setStatus(urgent ? 'Sending URGENT notification...' : 'Sending...', '#c9a961');
      try {
        var resp = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: detectTool(),
            message: msg,
            contact: contactEl.value.trim(),
            urgent: !!urgent,
          }),
          credentials: 'omit',
        });
        var d = await resp.json();
        if (d && d.ok && d.ref_id) {
          // Persist locally so user can check status on future visits
          saveMyRequest({
            id: d.ref_id,
            ts: new Date().toISOString(),
            tool: detectTool(),
            snippet: msg.slice(0, 100),
            status: d.status || 'received',
            urgent: !!urgent,
          });
          var hoursHint = d.expected_response_hours
            ? ' Evan usually replies within ' + d.expected_response_hours + 'h from now.'
            : '';
          setStatus(
            '✓ Received. Your reference: ' + d.ref_id + '.' + hoursHint +
            ' Reopen this dialog anytime to see its pipeline status.',
            '#8ae0a3'
          );
          if (d.evan) renderEvanStatus(box, d.evan);
          // Refresh the My-Requests panel to include the new one
          renderMyRequests(box, loadMyRequests());
          // Close after a longer wait so user can copy the ref ID
          setTimeout(close, 6000);
        } else if (d && d.ok && !d.delivered) {
          setStatus('Server received it but Discord forwarding failed: ' + (d.forward_err || 'unknown') + '. Evan still gets it via the log — your reference: ' + (d.ref_id || 'none') + '.', '#e0c060');
        } else if (d && d.error === 'rate_limited') {
          setStatus('Too many requests in the last hour — wait a bit and try again.', '#e08a8a');
        } else if (d && d.error) {
          setStatus('Failed: ' + d.error, '#e08a8a');
        } else {
          setStatus('Unexpected response — try again in a minute.', '#e08a8a');
        }
      } catch (e) {
        setStatus('Network error: ' + (e.message || e) + '. Check your connection.', '#e08a8a');
      } finally {
        sendBtn.disabled = false; urgentBtn.disabled = false;
      }
    }

    box.querySelector('#lws-support-send').onclick = function () { send(false); };
    box.querySelector('#lws-support-urgent').onclick = function () {
      if (confirm('This will send a red-flagged @here URGENT alert to Evan\'s admin Discord. Push notification on his phone. Only use if a paid tool is really broken and you\'re stuck. Continue?')) {
        send(true);
      }
    };
  }

  function renderEvanStatus(box, evan) {
    var emojiEl = box.querySelector('#lws-evan-emoji');
    var textEl = box.querySelector('#lws-evan-text');
    if (emojiEl) emojiEl.textContent = evan.emoji || '🟢';
    if (textEl) textEl.innerHTML =
      '<strong>Evan is: ' + (evan.emoji || '') + ' ' + (evan.status || 'active') + '</strong> · ' +
      (evan.hint || '') +
      ' <span style="color:#7a8290;font-size:11px">(' + (evan.local_time_ct || '') + ' CT)</span>';
  }

  function renderMyRequests(box, arr) {
    var slot = box.querySelector('#lws-my-requests-slot');
    if (!slot) return;
    if (!arr || !arr.length) { slot.innerHTML = ''; return; }
    var openCount = arr.filter(function (r) { return r.status !== 'shipped' && r.status !== 'wont_fix'; }).length;
    var rowsHtml = arr.slice(0, 6).map(function (r) {
      var meta = STATUS_META[r.status] || STATUS_META.unknown;
      var age = timeAgo(r.ts);
      return '<div style="display:flex;gap:10px;align-items:center;padding:8px 10px;background:rgba(0,0,0,0.15);border-radius:6px;font-size:12.5px;margin-bottom:4px">' +
        '  <span style="font-size:14px">' + meta.emoji + '</span>' +
        '  <div style="flex:1;min-width:0;overflow:hidden">' +
        '    <div style="color:' + meta.color + ';font-weight:600;font-size:11px;letter-spacing:.04em;text-transform:uppercase">' + meta.label + '</div>' +
        '    <div style="color:#e6e8ee;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escapeHtml(r.snippet || '(no snippet)') + '</div>' +
        '  </div>' +
        '  <div style="color:#7a8290;font-family:ui-monospace,monospace;font-size:11px">#' + escapeHtml(r.id) + '</div>' +
        '  <div style="color:#7a8290;font-size:10.5px;white-space:nowrap">' + age + '</div>' +
        '</div>';
    }).join('');
    slot.innerHTML =
      '<div style="font-size:11px;color:#7a8290;letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px">Your open requests · ' + openCount + ' waiting</div>' +
      rowsHtml;
  }
  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; }); }
  function timeAgo(iso) {
    if (!iso) return '';
    var t = new Date(iso).getTime();
    if (isNaN(t)) return '';
    var mins = Math.floor((Date.now() - t) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    var days = Math.floor(hrs / 24);
    return days + 'd ago';
  }

  function remove() {
    var f = document.getElementById('lws-support-fab');
    if (f) f.remove();
  }

  global.LWSSupport = {
    open: openModal,
    remove: remove,
    setToolName: function (n) { TOOL_NAME = n; },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFab);
  } else {
    createFab();
  }
})(window);
