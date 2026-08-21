const { chromium } = require('playwright');
// pages to crawl (interactive ones need data loaded so JS-generated links appear)
const PAGES = [
  ['home','https://r5tools.io/'],
  ['warzones','https://r5tools.io/warzones.html'],
  ['live-roster','https://r5tools.io/live-roster.html?warzone=2007'],
  ['map','https://r5tools.io/map.html?warzone=2007'],
  ['power-trends','https://r5tools.io/power-trends.html?warzone=2007'],
  ['warzone-intel','https://r5tools.io/warzone-intel.html?wz=2007,2002'],
  ['faq','https://r5tools.io/faq.html'],
  ['dashboard','https://r5tools.io/dashboard.html?warzone=2007&alliance=RONY'],
  ['landing','https://r5tools.io/tools/landing-planner/?warzone=2007&alliance=RONY'],
  ['hive','https://r5tools.io/tools/hive/?warzone=2007&alliance=RONY'],
  ['freeze','https://r5tools.io/tools/freeze-risk/?warzone=2007&alliance=RONY'],
];
(async()=>{
  const b=await chromium.launch({headless:true});
  const c=await b.newContext();
  await c.addCookies([{name:'lws_unlock_code',value:'RONY-FREE',domain:'.r5tools.io',path:'/',secure:true,sameSite:'None'}]);
  await c.addInitScript(()=>{try{localStorage.setItem('lws_unlock_code','RONY-FREE');localStorage.setItem('lws_my_warzone','2007');localStorage.setItem('lws_my_alliance','RONY');}catch(e){}});
  const p=await c.newPage();
  const links=new Set();
  for(const [name,url] of PAGES){
    try{
      await p.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
      // trigger data loads that generate links (warzones table, roster, etc.)
      await p.waitForTimeout(5000);
      const hrefs=await p.evaluate(()=>Array.from(document.querySelectorAll('a[href]')).map(a=>a.href));
      hrefs.forEach(h=>{ if(h.includes('r5tools.io') && !h.includes('access-codes.') && !h.includes('hive.r5tools') && !h.includes('chat.r5tools') && !h.startsWith('mailto') && !h.includes('#')) links.add(h.split('#')[0]); });
    }catch(e){ console.log('crawl err',name,e.message.slice(0,30)); }
  }
  // check each unique internal link
  const arr=[...links]; const broken=[];
  for(const u of arr){
    try{ const r=await p.request.get(u,{timeout:12000}); if(r.status()>=400) broken.push(r.status()+'  '+u.replace('https://r5tools.io','')); }
    catch(e){ broken.push('ERR '+u.replace('https://r5tools.io','')); }
  }
  console.log('checked',arr.length,'unique internal links');
  console.log(broken.length? 'BROKEN LINKS:\n  '+broken.join('\n  ') : 'NO BROKEN LINKS ✓');
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
