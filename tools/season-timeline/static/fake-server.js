/* Minimal client-side stub for the static (serverless) Season Timeline.
 * Intercepts /api/tasks + /api/config (localStorage-backed) so the checklist
 * + config persist and no /api/* 404s hit the console. Passes every other
 * fetch (incl. the cross-origin canonical-roster call) straight through. */
(function () {
  var realFetch = window.fetch.bind(window);
  var TASKS = 'lws_tl_tasks', CFG = 'lws_tl_config';
  function json(o){ return new Response(JSON.stringify(o), { status:200, headers:{'Content-Type':'application/json'} }); }
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var path = url.replace(location.origin, '').split('?')[0];
    var method = (init && init.method) || 'GET';
    if (path === '/api/tasks') {
      if (method === 'GET') { try { return Promise.resolve(json({ task_state: JSON.parse(localStorage.getItem(TASKS) || '{}') })); } catch (e) { return Promise.resolve(json({ task_state: {} })); } }
      try { var b = JSON.parse((init && init.body) || '{}'); var st = JSON.parse(localStorage.getItem(TASKS) || '{}'); st[b.member] = st[b.member] || {}; st[b.member][b.task_id] = b.done; localStorage.setItem(TASKS, JSON.stringify(st)); } catch (e) {}
      return Promise.resolve(json({ ok: true }));
    }
    if (path === '/api/config') {
      if (method === 'GET') { try { return Promise.resolve(json(JSON.parse(localStorage.getItem(CFG) || '{}'))); } catch (e) { return Promise.resolve(json({})); } }
      try { localStorage.setItem(CFG, (init && init.body) || '{}'); } catch (e) {}
      return Promise.resolve(json({ ok: true }));
    }
    return realFetch(input, init);
  };
})();
