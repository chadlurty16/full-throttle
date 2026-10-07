/* ===================== TEAM OWNERSHIP ===================== */
const OWN_PRICE={f1:900e6,wec:30e6,imsagtp:25e6,fe:45e6,indycar:12e6,cup:15e6,oap:4e6,truck:2e6,arca:6e5,nxt:2e6,f2:6e6,f3:3e6,freca:1.2e6,supercars:8e6,woo:1.2e6,hlr:1.2e6,lolmds:9e5,nhra:4e6,imsagtd:3e6,wecgt:4e6};
const OWN_OP={f1:250e6,wec:60e6,imsagtp:40e6,fe:30e6};
const CHARTER_PRICE=45e6;
function ownPrice(sid){const s=SER[sid];return OWN_PRICE[sid]||Math.max(30000,Math.round(s.cost*1.3/1000)*1000);}
function ownOp(sid){const s=SER[sid];return OWN_OP[sid]||Math.max(15000,Math.round(s.cost*.85));}
function ownOf(tid){return (G.own||[]).find(o=>o.tid===tid);}
function ownerHub(){const m=G.me;const ch=[];
 (G.own||[]).forEach(o=>{const t=G.TM[o.tid];const pos=t.cars.map(c=>c.d?champPos(o.s,c.d):0).filter(x=>x).sort((a,b)=>a-b)[0];
  ch.push({t:`<b>${esc(o.n)}</b> · ${esc(SER[o.s].sh)}`,sub:`${t.cars.length} car${t.cars.length>1?"s":""} · car rating ${Math.round(o.q)} · team bank ${money(o.cash)} · ${pos?"best in points: "+ordinal(pos):"no starts yet"}`,icon:"🏢",f:()=>teamScreen(o)});});
 ch.push({sec:"GROW YOUR EMPIRE"});
 ch.push({t:"Start a new team",sub:"Pick any series. Costs money; you'll need sponsors",icon:"➕",dis:m.age<18&&"You must be 18 to own a team",f:startTeamMenu});
 ch.push({t:"Buy an existing team",sub:"Take over an independent operation, cars and people included",icon:"💰",dis:m.age<18&&"You must be 18 to own a team",f:buyTeamMenu});
 if(G.ownHist&&G.ownHist.length)ch.push({t:"Ownership history",icon:"📜",f:ownHistScreen});
 ch.push({t:"Back",cls:"hi",f:hub});
 show(`<h2>Team ownership</h2><p>Own a team in any series, even while you're still driving: hire drivers and a crew chief, find sponsors, invest in development and chase owner championships.${G.own.length?"":" You don't own a team yet."}</p><p>Personal cash: <b>${money(m.cash)}</b></p>`,ch);}
function startTeamMenu(){const ch=SERIES_LIST.filter(s=>!s.oneoff).sort((a,b)=>a.tier-b.tier).map(s=>{const p=ownPrice(s.id);return {t:esc(s.n),sub:`Start-up ${money(p)} · about ${money(ownOp(s.id))} per car per season to run${s.id==="cup"?" · charter optional":""}${s.id==="f1"?" · the FIA must approve a new entry":""}`,dis:G.me.cash<p&&`You need ${money(p)}`,f:()=>nameTeam(s.id,null)};});
 show(`<h2>Start a team</h2><p>Every team needs cars, a shop, people and money. You pay the start-up cost from your personal cash; running costs come out of the team bank.</p>`,ch.concat([{t:"Back",cls:"hi",f:ownerHub}]));}
function nameTeam(sid,buyTid){const def=buyTid?tn(buyTid):(G.me.name.split(" ").slice(-1)[0]+" Racing");show(`<h2>Name your team</h2><p><input type="text" id="tnInput" data-k="tname" maxlength="32" value="${esc(def)}"></p>`,[
 {t:"Confirm",cls:"hi",f:()=>{const n=clean(inval("tname"),32)||def;buyTid?doBuyTeam(buyTid,n):doStartTeam(sid,n);}},{t:"Back",f:ownerHub}]);inputHook("tnInput");}
function doStartTeam(sid,n){const s=SER[sid];EFX=[];const p=ownPrice(sid);spend(p,"Team start-up");
 // a struggling independent folds to make room (keeps field sizes sensible)
 const weak=teamsOf(sid).filter(t=>!t.r&&!t.own&&!t.priv&&!t.cars.some(c=>c.d==="me")&&!myTeamLink(t.id)).sort((a,b)=>a.q-b.q)[0];if(weak&&teamsOf(sid).length>4){weak.cars.forEach(c=>{if(c.d){freeDriver(c.d);}});foldTeam(weak.id);}
 const t=newTeam({s:sid,n,mfr:s.mfr?R.pick(s.mfr):"",q:s.ql-6,ow:G.me.name,r:0,own:1});const d=genDriverFor(sid);seatDriver(t.id,usedNum(sid),d.id);d.cy=1;
 const o={tid:t.id,s:sid,n,q:t.q,cash:Math.round(ownOp(sid)*.35),titles:0,wins:0,starts:0,top5:0,cc:{n:genStaff(t.id),r:R.int(45,60)},crew:R.int(45,60),bud:1,rnd:0,charter:0,spons:[{n:R.pick(SPONSOR_FIC),amt:Math.round(ownOp(sid)*.45/1000)*1000}],sal:{},founded:G.yr,last:[]};o.sal[d.id]=driverAsk(d,sid);
 G.own.push(o);addNews(`${G.me.name} launches ${n} in ${s.n}.`,true);checkAch();save();
 show(`<h2>${esc(n)} is born</h2><p>A rented shop, one car, a handful of people and a big dream. ${esc(nm(d.id))} is your first driver. The team bank starts with a sponsor commitment and some working capital.</p>${efxHtml()}`,[{t:"Manage the team",cls:"hi",f:()=>teamScreen(o)}]);}
function buyTeamMenu(){const ch=[];SERIES_LIST.filter(s=>!s.oneoff).forEach(s=>{teamsOf(s.id).filter(t=>!t.r&&!t.own&&!t.priv&&!t.cars.some(c=>c.d==="me")).sort((a,b)=>b.q-a.q).slice(0,2).forEach(t=>{const p=Math.round(ownPrice(s.id)*(.6+t.q/s.ql*.7)/1000)*1000;
  ch.push({t:`${esc(tn(t.id))} · ${esc(s.sh)}`,sub:`${t.cars.length} car(s), rating ${Math.round(t.q)} · asking ${money(p)}`,dis:G.me.cash<p&&"Not enough cash",f:()=>{G.fl.buyPrice=p;nameTeam(s.id,t.id);}});});});
 show(`<h2>Buy a team</h2><p>Independent teams (fictional operations) open to offers. Real-world teams aren't for sale in this game.</p>`,ch.concat([{t:"Back",cls:"hi",f:ownerHub}]));}
function doBuyTeam(tid,n){const t=G.TM[tid];EFX=[];spend(G.fl.buyPrice||ownPrice(t.s),"Team purchase");t.own=1;t.n=n;t.ow=G.me.name;
 const o={tid,s:t.s,n,q:t.q,cash:Math.round(ownOp(t.s)*.25),titles:0,wins:0,starts:0,top5:0,cc:{n:genStaff(tid),r:R.int(50,70)},crew:R.int(50,68),bud:1,rnd:0,charter:t.s==="cup"&&t.q>78?1:0,spons:[{n:R.pick(SPONSOR_FIC),amt:Math.round(ownOp(t.s)*.5/1000)*1000}],sal:{},founded:G.yr,last:[]};
 t.cars.forEach(c=>{if(c.d&&c.d!=="me")o.sal[c.d]=driverAsk(G.D[c.d],t.s);});G.own.push(o);addNews(`${G.me.name} buys ${tn(tid)} (${SER[t.s].sh}).`,true);checkAch();save();
 show(`<h2>Deal done</h2><p>You're the new owner of <b>${esc(n)}</b>.</p>${efxHtml()}`,[{t:"Manage the team",cls:"hi",f:()=>teamScreen(o)}]);}
function driverAsk(d,sid){const s=SER[sid];if(!s.sal[1])return 0;const f=clamp((d.o-s.lvl+8)/22,0,1);return Math.round((s.sal[0]*.6+(s.sal[1]*.5-s.sal[0]*.6)*Math.pow(f,2))/1000)*1000;}
function teamCost(o){const t=G.TM[o.tid];return Math.round(ownOp(o.s)*t.cars.length*[.75,1,1.35][o.bud]+sum(Object.values(o.sal)));}
function teamIncome(o){return sum(o.spons.map(s=>s.amt))+(o.charter?Math.round(ownOp(o.s)*.6):0);}
function teamScreen(o){const t=G.TM[o.tid];if(!t)return ownerHub();const s=SER[o.s];
 const rows=t.cars.map(c=>({cells:["#"+esc(String(c.num)),c.d?(c.d==="me"?"<b>You</b>":esc(nm(c.d))):"<i>empty</i>",c.d&&c.d!=="me"?Math.round(G.D[c.d].o):Math.round(OVR(s.disc)),c.d?(champPos(o.s,c.d)?ordinal(champPos(o.s,c.d)):"-"):"-",c.d&&c.d!=="me"?money(o.sal[c.d]||0):"-"],hl:c.d==="me"}));
 const ch=[{sec:"PEOPLE"},
  {t:"Hire a driver",sub:"Free agents and drivers from other series",icon:"🧑",dis:!t.cars.some(c=>!c.d)&&"No empty car: release someone or add a car",f:()=>hireMenu(o)},
  {t:"Release a driver",icon:"✂️",dis:!t.cars.some(c=>c.d&&c.d!=="me")&&"Nobody to release",f:()=>releaseMenu(o)},
  {t:t.cars.some(c=>c.d==="me")?"Step out of the car":"Put yourself in the car",sub:t.cars.some(c=>c.d==="me")?"Hire someone else to drive":"Owner-driver: race for your own team",icon:"🏎️",dis:!t.cars.some(c=>c.d==="me")&&(licenseBlock(o.s)||(G.me.retired&&"You're retired from driving")||(G.car.con&&G.car.tm!==o.tid&&!G.car.con.priv&&G.car.con.end>=G.yr&&!seasonOver()&&"You're under contract elsewhere this season")||(!t.cars.some(c=>!c.d)&&"No empty car")),f:()=>ownerDriver(o)},
  {t:`Upgrade crew chief / technical director (${o.cc.r})`,sub:`${money(Math.round(ownOp(o.s)*.08))} per upgrade · better setups and strategy`,icon:"🧠",dis:(o.cash<ownOp(o.s)*.08&&"Team bank is too low")||(o.cc.r>=92&&"Already elite"),f:()=>{EFX=[];o.cash-=Math.round(ownOp(o.s)*.08);o.cc.r=Math.min(95,o.cc.r+R.int(4,8));o.cc.n=genStaff(o.tid+o.cc.r);teamMsg(o,`You hire ${esc(o.cc.n)} to lead the team (rating ${o.cc.r}).`);}},
  {t:`Train the pit crew (${o.crew})`,sub:`${money(Math.round(ownOp(o.s)*.04))}`,icon:"🛞",dis:(o.cash<ownOp(o.s)*.04&&"Team bank is too low")||(o.crew>=92&&"Already elite"),f:()=>{o.cash-=Math.round(ownOp(o.s)*.04);o.crew=Math.min(95,o.crew+R.int(3,7));teamMsg(o,"Pit stop practice every morning. Stops are getting faster.");}},
  {sec:"MONEY & CARS"},
  {t:`Budget level: ${["Lean","Standard","All-in"][o.bud]}`,sub:"Higher budgets develop the car faster but cost more",icon:"💵",f:()=>{o.bud=(o.bud+1)%3;teamScreen(o);}},
  {t:"Invest in R&D",sub:`${money(Math.round(ownOp(o.s)*.15))} → car rating up over the season`,icon:"🔬",dis:o.cash<ownOp(o.s)*.15&&"Team bank is too low",f:()=>{o.cash-=Math.round(ownOp(o.s)*.15);o.rnd+=1;o.q=Math.min(s.ql+14,o.q+R.f(.8,2));t.q=o.q;teamMsg(o,"The engineers get to work on a new package.");}},
  {t:"Find a team sponsor",sub:"Results, fame and your name help",icon:"💼",dis:G.fl["tsp"+o.tid]===absWk()&&"Already tried this week",f:()=>{G.fl["tsp"+o.tid]=absWk();const p=.25+G.me.fame/200+(o.wins>0?.1:0);if(R.chance(p)){const sp={n:R.pick(R.chance(.2)?BIG_SPONSOR_FIC:SPONSOR_FIC),amt:Math.round(ownOp(o.s)*R.f(.12,.45)/1000)*1000};o.spons.push(sp);teamMsg(o,`${esc(sp.n)} signs on for ${money(sp.amt)} per season.`);}else teamMsg(o,"Lots of meetings, no signatures this week.");}},
  {t:"Add a car",sub:`${money(Math.round(ownOp(o.s)*.5))} to build it; more running costs`,icon:"➕",dis:(t.cars.length>=4&&"Four cars is the limit")||(o.cash<ownOp(o.s)*.5&&"Team bank is too low"),f:()=>{o.cash-=Math.round(ownOp(o.s)*.5);t.cars.push({num:usedNum(o.s),d:null});teamMsg(o,"A new car rolls out of the shop. Now find a driver.");}},
  o.s==="cup"&&!o.charter?{t:"Buy a NASCAR charter",sub:`${money(CHARTER_PRICE)} (personal cash). Guaranteed starts and a bigger share of the money`,icon:"📜",dis:G.me.cash<CHARTER_PRICE&&"Not enough personal cash",f:()=>{EFX=[];spend(CHARTER_PRICE,"Charter");o.charter=1;teamMsg(o,"You buy a charter. Your team is now a permanent fixture in the Cup garage.");}}:null,
  {t:"Invest personal money",sub:"Move money into the team bank",icon:"⬆️",f:()=>moneyMove(o,1)},
  {t:"Take money out",sub:"Move money from the team bank to you",icon:"⬇️",dis:o.cash<=0&&"The bank is empty",f:()=>moneyMove(o,-1)},
  {t:"Standings",icon:"🏆",f:()=>standingsScreen(o.s)},
  {t:"Sell the team",icon:"🏷️",f:()=>sellTeam(o)},
  {t:"Back",cls:"hi",f:ownerHub}];
 show(`<div class="eyebrow">TEAM OWNER · ${esc(s.n.toUpperCase())}</div><h2>${esc(o.n)}</h2>
 ${tiles([{l:"Car rating",v:Math.round(o.q),h:`series avg ${s.ql}`},{l:"Team bank",v:money(o.cash),sm:1},{l:"Season costs",v:money(teamCost(o)),sm:1,h:"incl. salaries"},{l:"Sponsors",v:money(teamIncome(o)),sm:1,h:o.spons.map(x=>esc(x.n)).join(", ")},{l:"Wins",v:o.wins,h:`${o.starts} starts · ${o.titles} titles`},{l:"Crew chief",v:o.cc.r,h:esc(o.cc.n)}])}
 ${table(["Car","Driver","Rating","Points pos","Salary"],rows)}${o.last.length?`<p>Last race: ${o.last.map(x=>`${esc(nm(x.d))} ${ordinal(x.f)}`).join(", ")}</p>`:""}`,ch);}
function teamMsg(o,t){save();show(`<p>${t}</p>${efxHtml()}`,[{t:"Back to the team",cls:"hi",f:()=>teamScreen(o)}]);}
function moneyMove(o,dir){const amts=[10000,100000,1000000,10000000].filter(a=>dir>0?G.me.cash>=a:o.cash>=a);show(`<h2>${dir>0?"Invest":"Withdraw"}</h2>`,amts.map(a=>({t:money(a),f:()=>{if(dir>0){G.me.cash-=a;o.cash+=a;}else{o.cash-=a;G.me.cash+=a;}teamScreen(o);}})).concat([{t:"Back",cls:"hi",f:()=>teamScreen(o)}]));}
function hireMenu(o){const s=SER[o.s];const ar=AGE_R[o.s]||[16,40];const pool=Object.values(G.D).filter(d=>!d.ret&&!d.inj&&(!d.tm||(d.s&&SER[d.s].tier<s.tier&&SER[d.s].tier>=s.tier-3))&&(G.yr-d.by)>=s.age&&(G.yr-d.by)<=ar[1]+5&&d.o>=s.lvl-16).sort((a,b)=>b.o-a.o).slice(0,14);
 show(`<h2>Hire a driver</h2><p>Better drivers want more money and a competitive car. Drivers under contract in lower series will jump for a promotion.</p>`,pool.map(d=>{const ask=driverAsk(d,o.s);const want=d.o>o.q+12&&!d.tm?"Wants a better car":"";return {t:`${esc(nm(d.id))} (${G.yr-d.by}, ${esc(d.nat)}) · rating ${Math.round(d.o)}`,sub:`${d.tm?esc(SER[d.s].sh)+" with "+esc(tn(d.tm)):"Free agent"} · asks ${money(ask)}/yr${want?" · "+want:""}`,dis:want&&R.chance(.5)?want:false,f:()=>{const t=G.TM[o.tid];const c=t.cars.find(x=>!x.d);if(!c)return teamScreen(o);if(d.tm)freeDriver(d.id);c.d=d.id;d.s=o.s;d.tm=o.tid;d.num=c.num;d.cy=2;o.sal[d.id]=ask;rel("d:"+d.id,4);addNews(`${nm(d.id)} joins ${o.n} for ${s.sh}.`,true);teamMsg(o,`${esc(nm(d.id))} signs with ${esc(o.n)}.`);}};}).concat([{t:"Promote a young prospect",sub:"A cheap, raw rookie",f:()=>{const t=G.TM[o.tid];const c=t.cars.find(x=>!x.d);if(!c)return teamScreen(o);const d=genDriverFor(o.s);d.o=clamp(d.o-4,15,90);d.by=G.yr-Math.max(s.age,R.int(16,20));c.d=d.id;d.s=o.s;d.tm=o.tid;d.num=c.num;o.sal[d.id]=Math.round(driverAsk(d,o.s)*.5);teamMsg(o,`You sign rookie ${esc(d.n)}.`);}},{t:"Back",cls:"hi",f:()=>teamScreen(o)}]));}
function releaseMenu(o){const t=G.TM[o.tid];show(`<h2>Release a driver</h2>`,t.cars.filter(c=>c.d&&c.d!=="me").map(c=>({t:esc(nm(c.d)),sub:`Rating ${Math.round(G.D[c.d].o)} · buyout ${money(Math.round((o.sal[c.d]||0)*.5))}`,f:()=>{o.cash-=Math.round((o.sal[c.d]||0)*.5);delete o.sal[c.d];rel("d:"+c.d,-10);const id=c.d;freeDriver(id);G.D[id].cy=0;teamMsg(o,`${esc(nm(id))} is released.`);}})).concat([{t:"Back",cls:"hi",f:()=>teamScreen(o)}]));}
function ownerDriver(o){const t=G.TM[o.tid];if(t.cars.some(c=>c.d==="me")){const c=t.cars.find(x=>x.d==="me");c.d=null;if(G.car.tm===o.tid){G.car.con=null;G.car.s=null;G.car.tm=null;G.car.role=null;}return teamMsg(o,"You step out of the car. Hire a driver to fill it.");}
 EFX=[];if(G.car.con&&G.car.con.priv){removeMe();}const con={tm:o.tid,s:o.s,yrs:1,start:G.yr,end:G.yr+(seasonOver(o.s)?1:0),sal:0,win:0,spon:0,rel:0,n1:true,side:true,pay:0,own:1};applyContract(con);checkAch();teamMsg(o,`You'll drive the #${(t.cars.find(c=>c.d==="me")||{}).num} for your own team. Owner-driver, like the greats.`);}
function sellTeam(o){const t=G.TM[o.tid];const val=Math.round((ownPrice(o.s)*(.5+o.q/SER[o.s].ql*.5)+(o.charter?CHARTER_PRICE*.9:0)+Math.max(0,o.cash))/1000)*1000;
 show(`<h2>Sell ${esc(o.n)}?</h2><p>A buyer offers <b>${money(val)}</b>, including the team bank${o.charter?" and the charter":""}.</p>`,[{t:"Sell",cls:"hi",f:()=>{EFX=[];earn(val,"Team sale");if(o.cash<0)G.me.cash+=o.cash;t.own=0;t.n=ficTeamName(t.id+"sold",SER[o.s]);t.ow=genName("USA");if(t.cars.some(c=>c.d==="me")){t.cars.forEach(c=>{if(c.d==="me")c.d=null;});if(G.car.tm===o.tid){G.car.con=null;G.car.s=null;G.car.tm=null;G.car.role=null;}}
  G.ownHist=G.ownHist||[];G.ownHist.push({n:o.n,s:o.s,from:o.founded,to:G.yr,titles:o.titles,wins:o.wins,starts:o.starts});G.own=G.own.filter(x=>x!==o);addNews(`${G.me.name} sells ${o.n}.`,true);save();show(`<p>The team is sold.</p>${efxHtml()}`,[{t:"Back",cls:"hi",f:ownerHub}]);}},{t:"Keep it",f:()=>teamScreen(o)}]);}
function ownHistScreen(){show(`<h2>Ownership history</h2>${table(["Team","Series","Years","Starts","Wins","Titles"],(G.ownHist||[]).map(h=>[esc(h.n),esc(SER[h.s].sh),h.from+"-"+h.to,h.starts,h.wins,h.titles]))}`,[{t:"Back",cls:"hi",f:ownerHub}]);}
/* ---------- hooks ---------- */
function ownerRaceHook(rc,res){(G.own||[]).forEach(o=>{if(o.s!==rc.sid)return;const t=G.TM[o.tid];if(!t)return;const mine=res.filter(r=>r.tm===o.tid);if(!mine.length)return;o.last=mine.map(r=>({d:r.d,f:r.f}));
  const s=SER[o.s];const per=ownOp(o.s)/Math.max(1,s.cal.length);mine.forEach(r=>{o.starts++;if(r.f===1)o.wins++;if(r.f<=5)o.top5++;const pf=r.f===1?1.4:r.f<=3?.9:r.f<=10?.55:.3;o.cash+=Math.round(per*pf*(s.id==="cup"&&!o.charter?.6:1)*.5);});
  if(mine.some(r=>r.f===1)&&!mine.some(r=>r.d==="me"))G.notes.push(`🏢 Your team ${esc(o.n)} won the ${esc(rc.ev)} with ${esc(nm(mine.find(r=>r.f===1).d))}!`);});}
function ownerWeekly(){(G.own||[]).forEach(o=>{const t=G.TM[o.tid];if(!t)return;o.cash+=Math.round((teamIncome(o)-teamCost(o))/52);
  // the crew chief and budget slowly develop the car
  const s=SER[o.s];const tgt=s.ql-6+(o.cc.r-55)*.25+(o.bud-1)*4+o.rnd*1.2;o.q=clamp(o.q+(tgt-o.q)*.02,20,s.ql+16);t.q=o.q;
  if(o.cash<-teamCost(o)*.5&&!o.warned){o.warned=1;queuePending("team_broke",{tid:o.tid});}});}
function ownerNewYear(){(G.own||[]).forEach(o=>{const t=G.TM[o.tid];if(!t)return;o.rnd=Math.max(0,o.rnd-1);o.warned=0;const best=t.cars.map(c=>c.d?(G.S[o.s].tab[c.d]?0:0):0);
  o.hist=o.hist||[];o.hist.push({yr:G.yr-1,wins:o.wins,starts:o.starts,cash:o.cash});
  o.spons=o.spons.filter(sp=>R.chance(o.wins>0?.85:.65)||(G.notes.push(`🏢 ${esc(sp.n)} leaves ${esc(o.n)}.`),false));
  t.cars.forEach(c=>{if(c.d&&c.d!=="me"&&G.D[c.d]){const d=G.D[c.d];d.cy--;if(d.ret){c.d=null;}else if(d.cy<=0){d.cy=R.int(1,2);o.sal[d.id]=driverAsk(d,o.s);}}});
  t.cars.forEach(c=>{if(!c.d){G.notes.push(`🏢 ${esc(o.n)} has an empty car (#${c.num}). Hire a driver.`);}});});}
