// Node logic tests: data integrity, world building, race engine, stats, contracts, gating, saves, ownership, fictional mode, real-people safety.
const fs=require('fs');const {load,strip,quickStart}=require('./harness');
let pass=0,fail=0;const T=(name,fn)=>{try{const r=fn();if(r===false)throw new Error('returned false');pass++;}catch(e){fail++;console.log('FAIL',name,'-',e.message.slice(0,300));}};
const eq=(a,b,m)=>{if(a!==b)throw new Error((m||'')+` expected ${b} got ${a}`);};const ok=(c,m)=>{if(!c)throw new Error(m||'assert');};
const h=load();const R=s=>h.run(s);
// ---------- data ----------
T('series count >= 40',()=>ok(R('SERIES_LIST.length')>=40));
T('every calendar track exists and calendars sorted',()=>{const bad=R(`SERIES_LIST.flatMap(s=>s.cal.filter(c=>!TRK[c[0]]).map(c=>s.id+":"+c[0]))`);ok(!bad.length,bad.join(','));ok(R(`SERIES_LIST.every(s=>s.cal.every((c,i)=>i===0||c[1]>=s.cal[i-1][1]))`),'unsorted');});
T('weeks in range and no double-booking within a series',()=>ok(R(`SERIES_LIST.every(s=>s.cal.every(c=>c[1]>=0&&c[1]<52)&&new Set(s.cal.map(c=>c[1])).size===s.cal.length)`)));
T('crown jewels present',()=>{const n=R(`SERIES_LIST.flatMap(s=>s.cal.filter(c=>c[3]).map(c=>c[2]))`).join('|');['Daytona 500','Indianapolis 500','Monaco','Le Mans','Chili Bowl','Knoxville Nationals','Snowball Derby','Bathurst','Coca-Cola 600','Rolex 24'].forEach(k=>ok(n.indexOf(k)>=0,'missing '+k));});
T('points defined for every series and position',()=>ok(R(`SERIES_LIST.every(s=>[1,2,5,10,20,40].every(p=>Number.isFinite(ptsFor(s.id,p,""))))`)));
T('NEXT graph references valid series',()=>ok(R(`Object.keys(NEXT).every(k=>SER[k]&&NEXT[k].every(x=>SER[x]))`)));
T('start series valid and grassroots',()=>ok(R(`START_SERIES.every(id=>SER[id]&&SER[id].tier<=4)`)));
T('track count >= 150',()=>ok(R('Object.keys(TRK).length')>=150));
T('Kyle Busch not on any roster (respect: deceased 2026)',()=>ok(!R(`JSON.stringify(REAL)`).includes('Kyle Busch')));
// ---------- world ----------
quickStart(h,{start:'hobby',age:16});
T('field sizes match series definitions',()=>{const bad=R(`SERIES_LIST.filter(s=>!s.oneoff&&entries(s.id).length!==s.field).map(s=>s.id+":"+entries(s.id).length+"/"+s.field)`);ok(!bad.length,bad.join(','));});
T('no driver seated twice',()=>{const ids=R(`Object.values(G.TM).flatMap(t=>t.cars.map(c=>c.d)).filter(Boolean)`);eq(new Set(ids).size,ids.length);});
T('driver.tm consistent with team cars',()=>ok(R(`Object.values(G.TM).every(t=>t.cars.every(c=>!c.d||c.d==="me"||G.D[c.d].tm===t.id))`)));
T('player seated in hobby as privateer',()=>{eq(R('G.car.s'),'hobby');eq(R('G.car.tm'),'priv');ok(R('entries("hobby").some(e=>e.d==="me")'));});
T('real drivers present in top series',()=>{ok(R(`entries("cup").filter(e=>G.D[e.d]&&G.D[e.d].r).length`)>=30);ok(R(`entries("f1").filter(e=>G.D[e.d]&&G.D[e.d].r).length`)>=20);ok(R(`entries("indycar").filter(e=>G.D[e.d]&&G.D[e.d].r).length`)>=20);});
T('grassroots fields are fully fictional',()=>ok(R(`["hobby","kclub","minisp","lm","slm","dmod"].every(s=>entries(s).every(e=>e.d==="me"||!G.D[e.d].r))`)));
// ---------- race engine ----------
T('quickRace yields a valid classification for every series',()=>{const bad=R(`SERIES_LIST.filter(s=>{const res=quickRace(s.id,0);const f=res.map(r=>r.f).sort((a,b)=>a-b);return !res.length||f.some((v,i)=>v!==i+1)||res.some(r=>!Number.isFinite(r.pts));}).map(s=>s.id)`);ok(!bad.length,bad.join(','));});
T('player interactive race records stats',()=>{R('for(const s of SERIES_LIST)resetSeriesState(s.id)');R('G.wk=SER.hobby.cal[0][1];raceWeekend("hobby",0,null)');eq(R('G.rc.phase'),'pre');R('practice("bal")');R('doQuali({qb:0,risk:0})');let g=0;while(R('G.rc&&G.rc.phase==="race"')&&g++<10)R('runSeg({pace:.3,risk:1})');eq(R('G.rc.phase'),'post');eq(R('G.st.races.length'),1);const r=R('G.st.races[0]');ok(r.f>=1&&r.f<=18);eq(R('careerTotals().st'),1);eq(R('G.S.hobby.tab.me.st'),1);R('afterRace()');ok(!R('G.rc'));});
T('drag race flow',()=>{R('G.wk=SER.nhra.cal[0][1];raceWeekend("nhra",0,{s:"nhra",ci:0,tm:null,q:78,tmn:"Test"})');R('dragStart()');R('dragQual({agg:0})');let g=0;while(R('G.rc&&G.rc.phase!=="post"')&&g++<10){const st=R('G.rc.drag.stage');if(st==='r')R('dragRound({agg:0},{})');else R('finishDrag()');}eq(R('G.rc.phase'),'post');R('afterRace()');});
T('offers survive a team folding; tied teams never fold',()=>{R('G.offers=[];const ts=teamsOf("lm").filter(t=>!t.r&&!t.priv);G.offers.push(mkOffer(ts[0],"race",{start:G.yr+1}));G.offers.push(mkOffer(ts[1],"race",{start:G.yr+1}));G.__a=ts[0].id;G.__b=ts[1].id;');eq(R('myTeamLink(G.__a)'),true);R('foldTeam(G.__a)');eq(R('G.offers.length'),1);R('delete G.TM[G.__b]');R('offersScreen()');eq(R('G.offers.length'),0);});
T('drag races survive red lights and short fields (40 aggressive weekends)',()=>{for(let k=0;k<40;k++){R('G.wk=SER.nhra.cal[0][1];raceWeekend("nhra",0,{s:"nhra",ci:0,tm:null,q:95,tmn:"Test"})');if(k%3===0)R('G.rc.cars=G.rc.cars.filter(c=>c.d==="me").concat(G.rc.cars.filter(c=>c.d!=="me").slice(0,'+(6+k%5)+'))');R('dragStart()');R('dragQual({agg:1})');let g=0;while(R('G.rc&&G.rc.phase!=="post"')&&g++<12){const st=R('G.rc.drag.stage');if(st==='r')R('dragRound({agg:1},{agg:1})');else R('finishDrag()');}eq(R('G.rc.phase'),'post');R('afterRace()');}});
T('NASCAR Chase starts after race 26 and a champion is crowned',()=>{R('resetSeriesState("cup")');for(let i=0;i<36;i++)R(`quickRace("cup",${i})`);eq(R('G.S.cup.chase.length'),16);ok(R('G.S.cup.done'));ok(R('!!G.S.cup.champ'));ok(R('G.hist.cup.length')>=1);});
T('superspeedway Big One can happen',()=>{let big=0;for(let i=0;i<30;i++){const rc=R(`(function(){const rc=makeRace("cup",0,null);qualify(rc,null);for(let k=0;k<rc.K;k++)simSeg(rc,null);return rc.log.some(l=>l.lines.some(x=>/BIG ONE/.test(x)));})()`);if(rc)big++;}ok(big>0&&big<30,'big ones '+big);});
// ---------- gating & contracts ----------
T('superlicense gate for F1',()=>{R('G.me.age=22');ok(/Superlicense/.test(R('licenseBlock("f1")')||''));R('G.me.age=22;G.me.slp=[{yr:G.yr,s:"f2",p:40}]');eq(R('licenseBlock("f1")'),'');R('G.me.slp=[];G.me.age=16');});
T('age gate for Cup',()=>ok(/Minimum age/.test(R('G.me.age=12;licenseBlock("cup")'))));
T('sign contract now moves player into the team',()=>{R('G.me.age=24');const tid=R('teamsOf("truck")[3].id');R(`signContract({tm:"${tid}",s:"truck",role:"race",yrs:2,start:G.yr,sal:200000,win:10000,spon:1,rel:0,n1:false,side:true,pay:0})`);eq(R('G.car.s'),'truck');eq(R('G.car.tm'),tid);ok(R(`G.TM["${tid}"].cars.some(c=>c.d==="me")`));ok(!R('entries("hobby").some(e=>e.d==="me")'));eq(R('entries("truck").length'),R('SER.truck.field'));});
T('future contract applies at new year',()=>{const tid=R('teamsOf("oap")[2].id');R(`signContract({tm:"${tid}",s:"oap",role:"race",yrs:1,start:G.yr+1,sal:400000,win:0,spon:1,rel:0,n1:false,side:true,pay:0})`);ok(R('!!G.car.next'));R('G.wk=50;processSillySeason();G.wk=51;endWeekCore()');eq(R('G.car.s'),'oap');eq(R('G.car.tm'),tid);ok(R(`G.TM["${tid}"].cars.some(c=>c.d==="me")`));});
T('offers generated and negotiation screen renders',()=>{R('G.me.sk=Object.fromEntries(SK.map(k=>[k,80]));G.car.con.end=G.yr;G.fl.eosOffers=0;G.offers=[]');R('generateOffers("eos")');R('if(G.offers[0])negotiate(G.offers[0])');ok(R('G.offers.length')>0,'no offers');ok(/Negotiation/.test(R('CUR.html')));});
T('free agent can always run own car (no softlock)',()=>{R('expireContract()');ok(!R('G.car.s'));R('ownCarMenu()');ok(R('CUR.choices.filter(c=>!c.dis).length')>3);R('startPriv("lm")');eq(R('G.car.s'),'lm');});
T('silly season keeps fields full and moves drivers',()=>{R('G.wk=50;processSillySeason()');const bad=R(`SERIES_LIST.filter(s=>!s.oneoff&&entries(s.id).length<s.field-1).map(s=>s.id)`);ok(!bad.length,bad.join(','));ok(R('(G.lastSilly||[]).length')>0);});
T('silly season does not send F1 drivers to Cup',()=>{for(let i=0;i<4;i++)R('G.wk=50;processSillySeason();G.yr++');const n=R(`entries("cup").filter(e=>G.D[e.d]&&G.D[e.d].r&&G.D[e.d].ls==="f1").length`);eq(n,0);});
// ---------- one-offs ----------
T('one-off list includes the big ones',()=>{const n=R('oneoffList().map(o=>o.name)').join('|');['Daytona 500','Indianapolis 500','Le Mans','Chili Bowl','Knoxville Nationals','Snowball Derby','Bathurst'].forEach(k=>ok(n.indexOf(k)>=0,'missing '+k));});
T('one-off entry runs as extra car',()=>{R('G.yr=G.yr;for(const s of SERIES_LIST)resetSeriesState(s.id);G.wk=0;G.me.age=25;G.me.sk=Object.fromEntries(SK.map(k=>[k,82]));G.me.fame=60');const o=R('oneoffList().find(o=>/Indianapolis 500/.test(o.name))');R(`G.car.oneoffs.push(oneoffDeal(${JSON.stringify(o)}))`);R(`G.wk=${o.wk};raceWeekend("${o.s}",${o.ci},G.car.oneoffs[G.car.oneoffs.length-1])`);eq(R('G.rc.cars.length'),R(`buildField("${o.s}",${o.ci},null).length`)+1);R('quickMine()');ok(R('G.st.races.slice(-1)[0].oo')===1);ok(!R('G.S.indycar.tab.me'),'one-off should not score points');R('afterRace()');});
// ---------- ownership ----------
T('start a team, simulate, no NaN, sell',()=>{R('G.me.cash=5e6;G.me.age=30;doStartTeam("truck","Test Racing")');const o=R('G.own[0]');ok(o&&o.s==='truck');R('for(let i=0;i<5;i++)quickRace("truck",i)');R('ownerWeekly();ownerNewYear()');ok(R('Number.isFinite(G.own[0].cash)&&Number.isFinite(G.own[0].q)'));ok(R('G.own[0].starts')>=5);R('ownerDriver(G.own[0])');eq(R('G.car.tm'),R('G.own[0].tid'));R('sellTeam(G.own[0]);pick(0)');eq(R('G.own.length'),0);ok(R('G.ownHist.length')===1);});
T('NASCAR charter purchase',()=>{R('G.me.cash=1e8;doStartTeam("cup","Charter Test")');R('teamScreen(G.own[0])');const i=R('CUR.choices.findIndex(c=>/charter/i.test(c.t))');ok(i>=0);R(`pick(${i})`);eq(R('G.own[0].charter'),1);});
// ---------- saves ----------
T('save/load roundtrip',()=>{R('save()');const yr=R('G.yr');R('G=null');ok(R('loadSave()'));eq(R('G.yr'),yr);ok(R('Object.keys(G.D).length')>500);});
T('export/import string roundtrip',()=>{const s=R('exportString()');ok(s.length>1000);R('G.me.name="Changed"');R(`importString(${JSON.stringify(s)})`);ok(R('G.me.name')!=='Changed');});
T('import rejects garbage',()=>{let threw=false;try{R('importString("not a save")');}catch(e){threw=true;}ok(threw);});
T('save size reasonable (<1.2MB)',()=>ok(R('JSON.stringify(G).length')<1.2e6));
// ---------- fictional mode ----------
T('fictional mode hides every real driver/team/owner name on key screens',()=>{R('G.set.fic=true;SCRUB=null');const names=R(`[...new Set(Object.values(G.D).filter(d=>d.r).map(d=>d.n).concat(Object.values(G.TM).filter(t=>t.r).flatMap(t=>[t.n,t.ow])).filter(n=>n&&n.length>4))]`);
 const screens=['standingsScreen("cup",1)','standingsScreen("f1",1)','standingsScreen("indycar",1)','seriesDetail("cup")','seriesDetail("f1")','seriesDetail("wec")','newsScreen()','hub()','champsScreen("cup")'];const leaks=[];
 screens.forEach(sc=>{R(sc);const html=R('scrub(CUR.html+CUR.choices.map(c=>c.t+(c.sub||"")).join(" "))');names.forEach(n=>{if(html.indexOf(n)>=0)leaks.push(sc+': '+n);});});ok(!leaks.length,leaks.slice(0,5).join('; '));R('G.set.fic=false;SCRUB=null');});
T('fictional aliases differ from real names',()=>ok(R(`Object.values(G.D).filter(d=>d.r).every(d=>d.fa&&d.fa!==d.n)`)));
// ---------- real people safety (static) ----------
T('events touching possibly-real drivers avoid off-track drama',()=>{const src=['events_grass.js','events_pro.js','events_life.js'].map(f=>fs.readFileSync(__dirname+'/../src/'+f,'utf8')).join('\n');const evs=src.split(/\nEV\(/).slice(1);const banned=/hurt\(|injur|hospital|arrest|drunk|divorce|affair|drug|police|scam|suspend|scandal|care center/i;const bad=[];
 evs.forEach(e=>{const id=(e.match(/id:"(\w+)"/)||[])[1];if(/anyD\(|mateId\(|rivalD\(|allyD\(|fieldIds\(/.test(e)&&banned.test(e))bad.push(id);});ok(!bad.length,'events: '+bad.join(','));});
T('AI injuries only ever hit fictional drivers',()=>{const src=fs.readFileSync(__dirname+'/../src/race.js','utf8');ok(/function aiInjury\(id\)\{const d=G\.D\[id\];if\(!d\|\|d\.r\)return "";/.test(src));ok(/!G\.D\[c\.d\]\.r&&\/Crash\//.test(src));});
T('100+ storyline events',()=>ok(R('EVENTS.length')>=100,'events '+R('EVENTS.length')));
T('achievements >= 35',()=>ok(R('ACH.length')>=35));
// ---------- season rollover ----------
T('a full season of weeks rolls over cleanly',()=>{const h2=load();quickStart(h2,{start:'kclub',age:10});for(let w=0;w<60;w++){h2.run('autoWeek();endWeekCore();G.pending=[];');}eq(h2.run('G.yr'),2027);eq(h2.run('G.me.age'),11);ok(h2.run('G.st.seasons.length')>=0);ok(!h2.errors.length,h2.errors[0]);});
console.log(`logic tests: ${pass} passed, ${fail} failed`);if(h.errors.length){console.log('console errors:',h.errors.slice(0,3));}
process.exit(fail||h.errors.length?1:0);
