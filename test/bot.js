// Random-play bot: plays full careers through the UI choice layer from different starting series,
// detecting error screens, thrown exceptions, NaN values and softlocks, and reporting balance stats.
const {load,strip,quickStart}=require('./harness');const vm=require('vm');
const STEP_CAP=+(process.env.BOT_STEP_CAP||20000),RUN_MS=+(process.env.BOT_RUN_MS||150000);
const RUNS=+process.argv[2]||6;const MAXYEARS=+process.argv[3]||30;const VERBOSE=process.argv.includes('-v');
const STARTS=process.env.BOT_STARTS?process.env.BOT_STARTS.split(','):['kclub','hobby','minisp','ui','dmod','kreg','legends','f4us','street','usfj','miata','microsp'];
const agg={screens:0,errScreens:0,softlocks:0,evts:{},ended:0,top:{},owners:0,titles:0,maxSeasonWinPct:0,warn:[]};
let allErrors=[];
const bad=/Start a new career|Title screen|^Import|Copy|Close the book|Yes, end my career|Export|Download|Share|Delete|Backup/i;
for(let run=0;run<RUNS;run++){
 const h=load();const start=STARTS[run%STARTS.length];
 if(start==='ui'){h.run('title()');}else{quickStart(h,{start,age:start[0]==='k'?10:start==='f4us'||start==='usfj'?15:16,bg:['middle','rich','broke','sponsor'][run%4],fic:run%5===4});h.run('hub()');}
 if(run%2===0)h.run('if(G)G.set.quick=true');
 let steps=0,lastProg=0,lastKey='',lastPick='';const t0=Date.now();const stuck=(why)=>{agg.softlocks++;const C=h.CUR(),g=h.G();console.log(`WATCHDOG run ${run}: ${why} at ${g&&g.me?g.yr+' wk '+g.wk:'?'} after ${steps} steps, ${Math.round((Date.now()-t0)/1000)}s\n  screen: ${strip(C.html).slice(0,300)}\n  choices: ${C.choices.map(c=>strip(c.t)).join(' | ')}\n  last pick: ${lastPick}`);};
 while(true){
  steps++;const G=h.G(),CUR=h.CUR();
  if(G&&G.over){agg.ended++;break;}
  if(G&&G.yr>2026+MAXYEARS)break;
  const key=G&&G.me?[G.yr,G.wk,G.pending.length,G.rc?G.rc.phase+':'+G.rc.seg:'',G.offers.length,G.car.s].join('|'):'pre'+steps;
  if(key!==lastKey){lastKey=key;lastProg=steps;}
  if(steps>STEP_CAP){stuck('step cap '+STEP_CAP);break;}
  if(Date.now()-t0>RUN_MS){stuck('wall-clock cap '+RUN_MS+'ms');break;}
  if(steps-lastProg>2500){agg.softlocks++;console.log('SOFTLOCK?',key,strip(CUR.html).slice(0,300),CUR.choices.map(c=>strip(c.t)));break;}
  if(/Something went wrong/.test(CUR.html)){agg.errScreens++;if(agg.errScreens<6)console.log('ERRSCREEN',strip(CUR.html).slice(0,200),'\n  after:',lastPick,'\n  stack:',(h.errors[h.errors.length-1]||'').slice(0,900));}
  const ch=CUR.choices.map((c,i)=>({c,i})).filter(x=>!x.c.dis);
  if(!ch.length){console.log('NO CHOICES',strip(CUR.html).slice(0,300));agg.softlocks++;break;}
  let okc=ch.filter(x=>!bad.test(strip(x.c.t)));
  okc=okc.filter(x=>!/Retire|retire/i.test(strip(x.c.t))||(G&&G.me&&G.me.age>=38&&Math.random()<.15));
  okc=okc.filter(x=>!/Sell the team|Sell$/.test(strip(x.c.t))||Math.random()<.05);
  if(!okc.length)okc=ch.filter(x=>!/Title screen|Start a new career/.test(strip(x.c.t)));
  if(!okc.length)okc=ch;
  if(G&&G.me&&!G.me.retired&&G.me.age>=41&&!G.car.s&&Math.random()<.02){const r=okc.find(x=>/Retire/i.test(strip(x.c.t)));if(r)okc=[r];}
  const prog=/Advance to next week|^Continue|Skip ahead|Race weekend|One-off:|Go racing|On to qualifying|Accept and sign|Start my career|Confirm|Next round|Results|To eliminations|Head to the staging|Sim to the checkered|Practice|Clean, safe lap|Push for a strong lap|Use this number|Back to the dashboard|Enter$|Sign the deal/i;
  const pc=okc.filter(x=>prog.test(strip(x.c.t)));
  let pickI=(pc.length&&Math.random()<.6)?pc[Math.floor(Math.random()*pc.length)].i:okc[Math.floor(Math.random()*okc.length)].i;
  const m=CUR.html.match(/class="tag">([A-Z ]+)<\/div><h2>([^<]+)/);if(m){agg.evts[m[2]]=(agg.evts[m[2]]||0)+1;}
  lastPick=strip(CUR.choices[pickI].t)+' @ '+strip(CUR.html).slice(0,140);
  try{vm.runInContext(`pick(${pickI})`,h.ctx,{timeout:10000});}catch(e){if(/timed out/i.test(e.message)){stuck('single pick ran >10s (infinite loop?)');break;}h.errors.push('THROW '+e.stack);}
  {const g=h.G();if(g&&g.me&&!g.__nan){const badv=[];['cash','rep','fame','hp','mor','age','earned'].forEach(k=>{if(!Number.isFinite(g.me[k]))badv.push(k);});for(const k in g.me.sk)if(!Number.isFinite(g.me.sk[k]))badv.push('sk.'+k);(g.own||[]).forEach(o=>{if(!Number.isFinite(o.cash)||!Number.isFinite(o.q))badv.push('own '+o.n);});
   if(g.rc&&g.rc.cars&&g.rc.cars.some(c=>!Number.isFinite(c.sc)))badv.push('rc.sc');
   if(badv.length){g.__nan=1;h.errors.push('NaN '+badv.join(',')+' after "'+lastPick+'"');}}}
  agg.screens++;
  if(steps>900000){console.log('too many steps');break;}
 }
 const G=h.G();
 if(G&&G.me){const c=h.run('careerTotals()');const tops=[...new Set(G.st.races.map(r=>r.s))].filter(s=>['cup','f1','indycar','wec','imsagtp','fe','supercars','woo','hlr','oap','truck','nxt','f2'].includes(s));tops.forEach(s=>agg.top[s]=(agg.top[s]||0)+1);
  if((G.own||[]).length||(G.ownHist||[]).length)agg.owners++;agg.titles+=G.st.titles.length;
  G.st.seasons.filter(s=>!s.oo&&s.st>=8).forEach(s=>{const p=s.w/s.st;if(h.run(`SER["${s.s}"].tier`)>=5)agg.maxSeasonWinPct=Math.max(agg.maxSeasonWinPct,p);if(p>.8&&h.run(`SER["${s.s}"].tier`)>=5)agg.warn.push(`${s.yr} ${s.s} ${s.w}/${s.st}`);});
  const path=[];G.st.seasons.filter(s=>!s.oo).forEach(s=>{if(path[path.length-1]!==s.s)path.push(s.s);});
  console.log(`run ${run} [${start}] ${Math.round((Date.now()-t0)/1000)}s ${steps} steps: age ${G.me.age} yr ${G.yr} OVR ${h.run('OVR()')} starts ${c.st} W ${c.w} pod ${c.pod} pol ${c.pol} titles ${G.st.titles.length} cj ${G.st.cj.length} $${Math.round(G.me.cash)} path ${path.join('>')} own ${(G.own||[]).length} events ${G.stats.events} legacy ${h.run('legacyScore()')} over ${!!G.over} save ${Math.round((h.store.fullThrottleSave_v1||'').length/1024)}KB steps ${steps}`);}
 allErrors=allErrors.concat(h.errors);
}
console.log('screens',agg.screens,'errScreens',agg.errScreens,'softlocks',agg.softlocks,'ended',agg.ended,'owners',agg.owners,'titles',agg.titles);
console.log('reached',JSON.stringify(agg.top),'max season win% (tier>=5)',Math.round(agg.maxSeasonWinPct*100),agg.warn.length?'WARN '+agg.warn.join(', '):'');
console.log('distinct storyline events seen',Object.keys(agg.evts).length);
if(VERBOSE)console.log(JSON.stringify(agg.evts));
const uniq=[...new Set(allErrors)];console.log('ERRORS',allErrors.length);uniq.slice(0,12).forEach(e=>console.log(e.slice(0,900)));
process.exit(allErrors.length||agg.errScreens||agg.softlocks?1:0);
