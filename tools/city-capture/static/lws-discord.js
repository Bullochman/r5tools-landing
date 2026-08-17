/**
 * LWS Discord — drop-in library for the r5tools.io suite.
 *
 * Purpose: turn any tool's PNG export into a one-click Discord post.
 *
 * Usage in a tool:
 *   1. Add <script src="static/lws-discord.js" defer></script> to <head>.
 *   2. Where your existing PNG export button lives, call:
 *        LWSDiscord.renderPostButton(container, {
 *          getBlob: async function () { return myCanvas.toBlob(...); },  // returns a Blob
 *          filename: 'hive-plan.png',
 *          contextText: 'Alliance Hive Plan · ' + allianceName,
 *          toolName: 'Hive Grid Manager',
 *        });
 *   3. Somewhere accessible (settings gear), call:
 *        LWSDiscord.renderSettingsButton(container);
 *
 * Storage: webhook URL is persisted in localStorage under 'lws_discord_webhook'.
 *          Per-origin — so alliances that use tools across multiple origins
 *          (roster.r5tools.io + bullochman.github.io/lws-*) will need to set
 *          it in each origin. Central setup at access-codes.r5tools.io/settings
 *          syncs the primary storage.
 *
 * CORS: Discord's webhook endpoint responds Access-Control-Allow-Origin: *
 *       so browser-side posting works from any origin.
 */

(function (global) {
  'use strict';

  // ---- i18n (KO-aware; mirrors the shared `lws_lang` preference used by the
  //      sibling tools' langToggle) --------------------------------------
  function _getLang() {
    try {
      var s = localStorage.getItem('lws_lang');
      if (s === 'ko' || s === 'en') return s;
    } catch (e) { /* private mode */ }
    return (navigator.language || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  }
  var _STR = {
    en: {
      postBtn: 'Post to Discord',
      postBtnTitle: 'Post the PNG to your alliance Discord',
      posting: 'Posting…',
      posted: 'Posted!',
      fillFirst: 'Fill in the tool inputs and click ',
      fillFirstEnd: ' first — then Post to Discord.',
      noImage: 'No image produced',
      setUpBtnLabel: 'Discord webhook',
    },
    ko: {
      postBtn: '디스코드에 게시',
      postBtnTitle: 'PNG를 얼라이언스 디스코드에 게시합니다',
      posting: '게시 중…',
      posted: '게시 완료!',
      fillFirst: '먼저 도구 입력을 채우고 ',
      fillFirstEnd: '를 클릭한 후 디스코드에 게시하세요.',
      noImage: '이미지가 생성되지 않았습니다',
      setUpBtnLabel: '디스코드 웹훅',
    },
  };
  function _t(key) {
    var lang = _getLang();
    return (_STR[lang] && _STR[lang][key]) || _STR.en[key] || key;
  }

  var STORAGE_KEY = 'lws_discord_webhook';
  var USERNAME = 'R5TOOLS.IO';
  var AVATAR = 'https://r5tools.io/apple-touch-icon.png';
  var FOOTER = ' · made with r5tools.io';
  var CENTRAL_API = 'https://access-codes.r5tools.io/api/webhook';

  // On any r5tools.io subdomain the lws_unlock_code cookie is auto-sent
  // to the central API — the R5 sets the webhook once and every tool at
  // hive/roster/landing picks it up. bullochman.github.io tools can't send
  // the cookie (different registrable domain), so they stay localStorage-only.
  async function syncFromCentral() {
    try {
      var resp = await fetch(CENTRAL_API, { method: 'GET', credentials: 'include' });
      if (!resp.ok) return null;
      var d = await resp.json();
      var url = d && d.webhook_url;
      if (url && isValidWebhookUrl(url)) {
        try { localStorage.setItem(STORAGE_KEY, url); } catch (e) {}
        return url;
      }
      return null;
    } catch (e) { return null; }
  }
  async function pushToCentral(url) {
    try {
      var resp = await fetch(CENTRAL_API, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: url || '' }),
      });
      return resp.ok;
    } catch (e) { return false; }
  }

  // ---------- storage ----------
  function getWebhook() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; }
    catch (e) { return ''; }
  }
  function setWebhook(url) {
    try {
      if (url) localStorage.setItem(STORAGE_KEY, url);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* quota */ }
    // Fire and forget — the central store keeps sibling tools in sync.
    // Non-blocking on save, non-fatal if central is unreachable.
    pushToCentral(url).catch(function () {});
    return true;
  }
  function isValidWebhookUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return /^https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+\/?$/.test(url.trim());
  }

  // ---------- post ----------
  async function postMessage(opts) {
    // opts: { content, blob?, filename?, embed? }
    var webhook = getWebhook();
    if (!webhook) throw new Error('No webhook configured. Click the ⚙ gear to set one.');
    if (!isValidWebhookUrl(webhook)) throw new Error('Configured webhook URL is malformed. Reset it.');

    var payload = {
      username: USERNAME,
      avatar_url: AVATAR,
      content: (opts.content || '') + FOOTER,
    };
    if (opts.embed) payload.embeds = [opts.embed];

    if (opts.blob) {
      var fd = new FormData();
      fd.append('payload_json', JSON.stringify(payload));
      fd.append('file', opts.blob, opts.filename || 'export.png');
      var resp = await fetch(webhook, { method: 'POST', body: fd });
      if (!resp.ok) {
        var txt = await resp.text().catch(function () { return ''; });
        throw new Error('Discord rejected ' + resp.status + ' ' + txt.slice(0, 120));
      }
      return true;
    }
    var resp2 = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp2.ok) {
      var txt2 = await resp2.text().catch(function () { return ''; });
      throw new Error('Discord rejected ' + resp2.status + ' ' + txt2.slice(0, 120));
    }
    return true;
  }

  // ---------- UI ----------
  var BTN_STYLE = 'display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:#5865F2;color:#fff;border:none;border-radius:6px;font:600 13px system-ui,-apple-system,sans-serif;cursor:pointer;text-decoration:none';
  var BTN_STYLE_HOVER = 'background:#4752c4';
  var GEAR_STYLE = 'display:inline-flex;align-items:center;gap:4px;padding:6px 10px;background:transparent;color:#a8b0c0;border:1px solid rgba(255,255,255,0.15);border-radius:6px;font:500 12px system-ui,-apple-system,sans-serif;cursor:pointer;text-decoration:none';
  var TOAST_STYLE = 'position:fixed;bottom:24px;right:24px;padding:14px 20px;border-radius:8px;font:500 13px system-ui,-apple-system,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.4);z-index:100000;max-width:360px;line-height:1.4';

  function showToast(msg, kind) {
    var el = document.createElement('div');
    el.setAttribute('style', TOAST_STYLE +
      (kind === 'error'
        ? ';background:#7a1f1f;color:#ffdad7;border:1px solid #b8402c'
        : ';background:#1a4a2a;color:#d7ffe0;border:1px solid #2eaa4c'));
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity 0.4s';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 400);
    }, kind === 'error' ? 6000 : 3500);
  }

  function openSettingsModal(afterSave) {
    var backdrop = document.createElement('div');
    backdrop.setAttribute('style',
      'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,sans-serif');
    var box = document.createElement('div');
    box.setAttribute('style',
      'background:#0d1424;color:#e6e8ee;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:24px;max-width:520px;width:100%;box-shadow:0 12px 48px rgba(0,0,0,0.6)');
    box.innerHTML =
      '<h3 style="margin:0 0 10px;color:#c9a961;font-size:16px;letter-spacing:0.04em;text-transform:uppercase">Discord Webhook</h3>' +
      '<p style="margin:0 0 6px;font-size:13px;color:#a8b0c0;line-height:1.5">Paste your alliance Discord webhook URL. Every PNG export in every tool will one-click post to that channel.</p>' +
      '<details style="margin:8px 0 14px;font-size:12px;color:#a8b0c0"><summary style="cursor:pointer;color:#c9a961">How do I get a webhook URL?</summary>' +
      '<ol style="margin:8px 0 0;padding-left:20px;line-height:1.6">' +
      '<li>Open your alliance Discord server</li>' +
      '<li>Server Settings → <strong>Integrations → Webhooks</strong></li>' +
      '<li>Click <strong>New Webhook</strong>, pick a channel (e.g. #alliance-planning), name it "R5 Tools"</li>' +
      '<li>Click <strong>Copy Webhook URL</strong> and paste it below</li>' +
      '</ol>' +
      '<p style="margin:8px 0 0;font-size:11.5px;color:#7a8290">Requires Manage Webhooks permission in your Discord role. If you\'re not the server owner, ask them to make you a webhook — they never share it with anyone else.</p>' +
      '</details>' +
      '<input type="text" id="lws-dc-webhook-in" placeholder="https://discord.com/api/webhooks/1234.../abcd..." value="' +
        (getWebhook() || '').replace(/"/g, '&quot;') +
        '" style="width:100%;padding:10px 12px;background:#050810;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:6px;font:12px ui-monospace,SFMono-Regular,monospace;box-sizing:border-box" />' +
      '<div id="lws-dc-msg" style="margin-top:8px;font-size:12px;min-height:16px"></div>' +
      '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">' +
      '<button id="lws-dc-test" style="padding:8px 14px;background:#5865F2;color:#fff;border:none;border-radius:6px;font:600 13px system-ui;cursor:pointer">Test post</button>' +
      '<button id="lws-dc-save" style="padding:8px 14px;background:#c9a961;color:#0a0e1a;border:none;border-radius:6px;font:600 13px system-ui;cursor:pointer">Save</button>' +
      '<button id="lws-dc-clear" style="padding:8px 14px;background:transparent;color:#a8b0c0;border:1px solid rgba(255,255,255,0.15);border-radius:6px;font:500 13px system-ui;cursor:pointer">Clear</button>' +
      '<button id="lws-dc-close" style="padding:8px 14px;background:transparent;color:#a8b0c0;border:1px solid rgba(255,255,255,0.15);border-radius:6px;font:500 13px system-ui;cursor:pointer;margin-left:auto">Close</button>' +
      '</div>';
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    var input = box.querySelector('#lws-dc-webhook-in');
    var msgEl = box.querySelector('#lws-dc-msg');
    function setMsg(text, color) { msgEl.textContent = text; msgEl.style.color = color || '#a8b0c0'; }
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    box.querySelector('#lws-dc-close').onclick = function () { backdrop.remove(); };
    backdrop.onclick = function (e) { if (e.target === backdrop) backdrop.remove(); };
    box.querySelector('#lws-dc-clear').onclick = function () {
      setWebhook('');
      input.value = '';
      setMsg('Webhook cleared.', '#a8b0c0');
    };
    box.querySelector('#lws-dc-save').onclick = function () {
      var url = input.value.trim();
      if (!url) { setMsg('Paste a webhook URL first.', '#e08a8a'); return; }
      if (!isValidWebhookUrl(url)) {
        setMsg('That URL doesn\'t look like a Discord webhook — expected https://discord.com/api/webhooks/…', '#e08a8a');
        return;
      }
      setWebhook(url);
      setMsg('Saved. Every tool will post to that channel now.', '#8ae0a3');
      setTimeout(function () { backdrop.remove(); if (typeof afterSave === 'function') afterSave(); }, 900);
    };
    box.querySelector('#lws-dc-test').onclick = function () {
      var url = input.value.trim();
      if (!url) { setMsg('Paste a URL first.', '#e08a8a'); return; }
      if (!isValidWebhookUrl(url)) { setMsg('Malformed webhook URL.', '#e08a8a'); return; }
      // Save FIRST so postMessage picks it up
      var prev = getWebhook();
      setWebhook(url);
      setMsg('Sending test message...', '#a8b0c0');
      postMessage({ content: '✓ r5tools.io webhook connected — you\'ll see PNG posts from every tool here.' })
        .then(function () {
          setMsg('Test message posted. Check your Discord channel — you should see a message right now.', '#8ae0a3');
        })
        .catch(function (e) {
          setMsg('Failed: ' + (e.message || e), '#e08a8a');
          setWebhook(prev); // roll back on failure
        });
    };
  }

  function renderSettingsButton(container, label) {
    if (!container) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('style', GEAR_STYLE);
    btn.innerHTML = '<span style="font-size:14px">⚙</span> <span>' + (label || 'Discord') + '</span>';
    btn.title = 'Configure Discord webhook';
    btn.onclick = function () { openSettingsModal(); };
    container.appendChild(btn);
    return btn;
  }

  function renderPostButton(container, opts) {
    if (!container) return;
    // opts: { getBlob: async () => Blob, filename, contextText, toolName }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('style', BTN_STYLE);
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.956-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.334-.946 2.42-2.157 2.42z"/></svg><span>' + _t('postBtn') + '</span>';
    btn.title = _t('postBtnTitle');
    var origHTML = btn.innerHTML;
    btn.onmouseover = function () { btn.setAttribute('style', BTN_STYLE + ';' + BTN_STYLE_HOVER); };
    btn.onmouseout  = function () { btn.setAttribute('style', BTN_STYLE); };
    btn.onclick = async function () {
      var webhook = getWebhook();
      if (!webhook) {
        openSettingsModal(function () {
          if (getWebhook()) btn.click(); // retry after successful save
        });
        return;
      }
      btn.disabled = true;
      btn.innerHTML = '<span>' + _t('posting') + '</span>';
      try {
        var blob = await opts.getBlob();
        if (!blob) throw new Error(_t('noImage'));
        await postMessage({
          content: (opts.contextText || opts.toolName || 'Alliance planning'),
          blob: blob,
          filename: opts.filename || 'export.png',
        });
        showToast('✓ ' + _t('posted'), 'success');
      } catch (e) {
        showToast((_getLang() === 'ko' ? '디스코드 게시 실패: ' : 'Discord post failed: ') + (e.message || e), 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = origHTML;
      }
    };
    container.appendChild(btn);
    return btn;
  }

  /**
   * attachToButton — for tools with an existing "Export PNG" button that uses
   * canvas.toBlob(). Renders a Post-to-Discord button as a sibling, and when
   * clicked, temporarily hooks toBlob to capture the blob that the PNG button
   * generates. Zero modification to the tool's app IIFE required.
   *
   *   opts: { pngBtnId, slotId, gearSlotId, filename, contextText, toolName }
   */
  function attachToButton(opts) {
    var pngBtn = document.getElementById(opts.pngBtnId);
    var slot = opts.slotId ? document.getElementById(opts.slotId) : null;
    var gearSlot = opts.gearSlotId ? document.getElementById(opts.gearSlotId) : null;

    var postBtn;
    if (slot) {
      postBtn = renderPostButton(slot, {
        getBlob: function () {
          // Guard: if the underlying PNG button is disabled, the tool isn't
          // in a state where it can produce a PNG yet. Tell the user, don't
          // silently fail.
          var pngBtnEl = document.getElementById(opts.pngBtnId);
          if (pngBtnEl && pngBtnEl.disabled) {
            return Promise.reject(new Error(_t('fillFirst') + (pngBtnEl.textContent || 'Export PNG').trim().slice(0, 40) + _t('fillFirstEnd')));
          }
          // Hook toBlob, click the PNG button, wait for the callback to fire.
          return new Promise(function (resolve, reject) {
            var origToBlob = HTMLCanvasElement.prototype.toBlob;
            var origToDataURL = HTMLCanvasElement.prototype.toDataURL;
            var settled = false;
            var timeout = setTimeout(function () {
              if (settled) return;
              settled = true;
              HTMLCanvasElement.prototype.toBlob = origToBlob;
              HTMLCanvasElement.prototype.toDataURL = origToDataURL;
              reject(new Error('The tool didn\'t produce a PNG. Try clicking the ' + (opts.pngBtnId ? '#' + opts.pngBtnId : 'Export PNG') + ' button first — it may need input data.'));
            }, 5000);
            HTMLCanvasElement.prototype.toBlob = function (cb, type, quality) {
              var self = this;
              return origToBlob.call(self, function (blob) {
                if (!settled && blob) {
                  settled = true;
                  clearTimeout(timeout);
                  HTMLCanvasElement.prototype.toBlob = origToBlob;
                  HTMLCanvasElement.prototype.toDataURL = origToDataURL;
                  resolve(blob);
                }
                if (typeof cb === 'function') cb(blob);
              }, type, quality);
            };
            // Also intercept toDataURL — some tools use that instead of toBlob.
            HTMLCanvasElement.prototype.toDataURL = function (type, quality) {
              var dataUrl = origToDataURL.call(this, type, quality);
              if (!settled && dataUrl && dataUrl.indexOf('data:image/') === 0) {
                try {
                  var parts = dataUrl.split(',');
                  var meta = parts[0]; var b64 = parts[1] || '';
                  var mime = (meta.match(/data:([^;]+)/) || [])[1] || 'image/png';
                  var bin = atob(b64);
                  var arr = new Uint8Array(bin.length);
                  for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
                  var blob = new Blob([arr], { type: mime });
                  settled = true;
                  clearTimeout(timeout);
                  HTMLCanvasElement.prototype.toBlob = origToBlob;
                  HTMLCanvasElement.prototype.toDataURL = origToDataURL;
                  resolve(blob);
                } catch (e) { /* let PNG button proceed */ }
              }
              return dataUrl;
            };
            // Trigger the tool's own PNG rendering.
            if (pngBtn) {
              pngBtn.click();
            } else {
              settled = true;
              clearTimeout(timeout);
              HTMLCanvasElement.prototype.toBlob = origToBlob;
              HTMLCanvasElement.prototype.toDataURL = origToDataURL;
              reject(new Error('PNG export button not found (looked for #' + opts.pngBtnId + ')'));
            }
          });
        },
        filename: opts.filename || 'export.png',
        contextText: opts.contextText || opts.toolName || 'r5tools.io export',
        toolName: opts.toolName || 'r5tools.io',
      });
    }
    if (gearSlot) renderSettingsButton(gearSlot);
    return postBtn;
  }

  // Bootstrap: on any r5tools.io subdomain, kick off a background sync from
  // central so tools reflect changes made in other tools quickly.
  if (typeof window !== 'undefined' && /\.r5tools\.io$/i.test(window.location.hostname || '')) {
    syncFromCentral().catch(function () {});
  }

  global.LWSDiscord = {
    getWebhook: getWebhook,
    setWebhook: setWebhook,
    isValidWebhookUrl: isValidWebhookUrl,
    postMessage: postMessage,
    openSettingsModal: openSettingsModal,
    renderSettingsButton: renderSettingsButton,
    renderPostButton: renderPostButton,
    attachToButton: attachToButton,
    syncFromCentral: syncFromCentral,
    pushToCentral: pushToCentral,
  };
})(window);
