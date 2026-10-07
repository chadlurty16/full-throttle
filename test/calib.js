// Balance calibration: AI-only seasons (win spread) and player win rates by rating gap.
const {load,quickStart}=require('./harness');
const h=load();quickStart(h,{start:'hobby',age:16});
const sers=(process.argv[2]||'cup,f1,indycar,hobby,woo,wec').split(',');
for(const sid of sers){h.run(`resetSeriesState("${sid}")`);const n=h.run(`SER["${sid}"].cal.length`);for(let ci=0;ci<n;ci++)h.run(`quickRace("${sid}",${ci})`);
 const rows=h.run(`standings("${sid}").slice(0,6).map(r=>[nm(r.id),r.w,r.t5,r.p,Math.round((G.D[r.id]||{o:0}).o),Math.round(G.TM[(G.D[r.id]||{}).tm]?G.TM[G.D[r.id].tm].q:0)])`);
 const winners=h.run(`new Set(G.S["${sid}"].res.map(r=>r.w)).size`);
 console.log(sid,'races',n,'distinct winners',winners,JSON.stringify(rows));}
// player win rate vs rating gap in a series
const sid=process.argv[3]||'cup';
for(const gap of [-10,-5,0,5,10]){let w=0,t5=0,sf=0,N=+process.argv[4]||60;
 for(let i=0;i<N;i++){h.run(`(function(){const s=SER["${sid}"];const top=Math.max(...entries("${sid}").filter(e=>e.d!=="me").map(e=>G.D[e.d].o));SK.forEach(k=>G.me.sk[k]=top+${gap});G.me.hp=100;G.me.mor=50;})()`);
  const tm=h.run(`(function(){const t=teamsOf("${sid}").sort((a,b)=>b.q-a.q)[2];return t.id;})()`);
  const r=h.run(`(function(){const rc=makeRace("${sid}",${i%10},{tm:"${tm}",q:G.TM["${tm}"].q,tmn:"x"});G.rc=rc;rc.setup={q:0,r:0};qualify(rc,null);while(rc.seg<rc.K)simSeg(rc,autoFx(rc));const res=classify(rc);G.rc=null;return res.find(x=>x.d==="me").f;})()`);
  if(r===1)w++;if(r<=5)t5++;sf+=r;}
 console.log(`${sid} gap ${gap>=0?'+':''}${gap} vs best AI (3rd-best car): win ${Math.round(w/N*100)}% top5 ${Math.round(t5/N*100)}% avg ${(sf/N).toFixed(1)}`);}
