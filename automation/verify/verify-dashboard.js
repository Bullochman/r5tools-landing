const { chromium } = require('playwright');
// per-tool "did the roster load?" signal
const SIG = {
  Landing:  `(document.getElementById('roster-count-value')||{}).textContent+' loaded'`,
  Hive:     `document.querySelectorAll('#roster-body tr').length+' roster rows'`,
  Heat:     `(document.body.innerText.match(/(\\d+) members/i)||['?'])[0]`,
  Freeze:   `document.querySelectorAll('tbody tr').length+' rows'`,
  Coal:     `((document.getElementById('b-input')||{}).value||'').split(String.fromCharCode(10)).length-1+' csv rows'`,
  City:     `(document.getElementById('btnImportRoster')||{}).textContent`,
  Train:    `(document.body.innerText.match(/of (\\d+) total/i)||['?'])[0]`,
  Timeline: `(document.body.innerText.match(/(\\d+) members/i)||['?'])[0]`,
};
const LABELS = ["Landing","Hive","Heat","Freeze","Coal","City","Train","Timeline","Live Roster","Power Trends","Warzone Intel","Warzones"];
(async () => {
  const b = await chromium.launch({ headless:true });
  const c = await b.newContext();
  await c.addCookies([{ name:'lws_unlock_code', value:'RONY-FREE', domain:'.r5tools.io', path:'/', secure:true, sameSite:'None' }]);
  await c.addInitScript(()=>{ try{ localStorage.setItem('lws_unlock_code','RONY-FREE'); localStorage.setItem('lws_my_warzone','2007'); localStorage.setItem('lws_my_alliance','RONY'); }catch(e){} });
  const p = await c.newPage();
  await p.goto('https://r5tools.io/dashboard.html?warzone=2007&alliance=RONY', { waitUntil:'domcontentloaded', timeout:30000 });
  await p.waitForTimeout(2500);
  const season = await p.locator('#ctx').innerText().catch(()=> '');
  let allGood = true;
  console.log('AUTO-SEASON:', season.replace(/\n/g,' '));
  for (const label of LABELS) {
    try {
      await p.locator('.tab',{hasText:label}).first().click({timeout:5000});
      await p.waitForTimeout(5000);
      const fl = p.frameLocator('#tool');
      let sig='(page loaded)';
      if (SIG[label]) { try { sig=String(await fl.locator(':root').evaluate((r,code)=>{try{return eval(code);}catch(e){return 'evalerr';}}, SIG[label])); } catch(e){ sig='(x)'; } }
      let gh=0; try{ gh=await fl.locator('a[href*="bullochman.github.io"]').count(); }catch(e){}
      const ok = (label==='City' ? /96/.test(sig) : SIG[label] ? /9\d|97|96/.test(sig) : true) && gh===0;
      if(!ok && SIG[label]) allGood=false;
      console.log(`${ok?'✓':'✗'} ${label.padEnd(14)} ${sig.slice(0,34).padEnd(34)} gh=${gh}`);
    } catch(e){ console.log(`✗ ${label.padEnd(14)} ERROR ${String(e).slice(0,30)}`); allGood=false; }
  }
  console.log(allGood ? '\n=== ALL TOOL PANELS GREEN ===' : '\n=== SOME ISSUES ABOVE ===');
  await b.close();
})().catch(e=>{ console.error('FATAL', e.message); process.exit(1); });
