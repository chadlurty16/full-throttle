/* ===================== RACE ENGINE ===================== */
const PIT_SERIES={cup:1,oap:1,truck:1,arca:1,indycar:1,nxt:1,f1:1,f2:1,supercars:1,imsagtd:1,imsagtp:1,wecgt:1,wec:1,slm:1,snowball:1};
const CAUTION_P={stock:.55,ss:.55,stockroad:.4,open:.28,indyoval:.45,dirt:.5,kart:.12,endur:.55};
const NOISE_K=.62,COMPRESS_KEEP=.4;
const TP_BASE={stock:4,ss:1.2,stockroad:5,open:8,indyoval:4,dirt:4,kart:4,endur:2,drag:0};
function raceKind(sid,type){const s=SER[sid];if(s.disc==="drag")return "drag";if(s.endur)return "endur";if(type==="ss")return "ss";if(type==="dirt")return "dirt";if(type==="kart")return "kart";if(s.disc==="open")return (type==="road"||type==="street")?"open":"indyoval";if(type==="road"||type==="street")return "stockroad";return "stock";}
function evName(sid,ci){const c=SER[sid].cal[ci];if(c[2])return c[2];const t=TRK[c[0]];const s=SER[sid];if(s.tier<=4)return t[0].replace(/ \(.*\)$/,"")+(s.disc==="kart"?" Club Round":" Feature");return (t[1].split(",")[0])+" ("+s.sh+")";}
function isCrown(sid,ci){return !!SER[sid].cal[ci][3];}
function evLaps(sid,ci){const s=SER[sid],t=TRK[s.cal[ci][0]];if(s.endur){const m=(s.cal[ci][2]||"").match(/(\d+) Hour/);return m?(+m[1])*Math.round(100/t[3])/2|0:Math.round(260/t[3]);}
 if(s.laps)return s.laps;let d=s.dist||100;const n=s.cal[ci][2]||"";if(/Daytona 500|Indianapolis 500|Southern 500/.test(n))d=500;else if(/Coca-Cola 600/.test(n))d=600;else if(/Brickyard 400|Coke Zero/.test(n))d=400;else if(s.id==="cup"&&t[2]==="sht"&&t[3]<0.8)d=t[3]*500;else if(s.id==="cup"&&t[2]==="road")d=Math.min(d,230);
 return clamp(Math.round(d/t[3]),10,600);}
function raceSig(rc){const s=SER[rc.sid];let sig=s.sig;if(s.id==="f1")sig*=.7;if(s.id==="indycar"||s.id==="nxt")sig*=1.15;if(rc.kind==="ss")sig*=1.6;if(rc.wet)sig*=1.25;if(rc.trk==="monaco")sig*=.8;return sig;}
function tpFactor(rc){let tp=TP_BASE[rc.kind]||3;if(rc.trk==="monaco")tp*=2.2;if(rc.trk==="fe_monaco"||rc.trk==="hungaroring"||rc.trk==="singapore")tp*=1.4;if(rc.sid==="f1")tp*=1.15;return tp;}
/* ---------- field ---------- */
function myQ(tid){const t=G.TM[tid];if(!t)return 55;let q=t.q;if(t.own){const o=G.own.find(x=>x.tid===tid);if(o)q=o.q;}
 if(G.car.con&&G.car.con.n1)q+=.6;q+=clamp(relOf("cc")/40,-1,1.2);return q;}
function buildField(sid,ci,extraMe){const s=SER[sid];let f=[];
 if(s.oneoff){const pool=[];s.pool.forEach(ps=>entries(ps).forEach(e=>{if(e.d!=="me")pool.push({d:e.d,tm:e.tm,num:e.num,q:G.TM[e.tm].q*.9+R.f(0,8)});}));
  pool.sort((a,b)=>(G.D[b.d].o+R.f(0,14))-(G.D[a.d].o+R.f(0,14)));f=pool.slice(0,s.field-(extraMe?1:0));}
 else{f=entries(sid).map(e=>({d:e.d,tm:e.tm,num:e.num,q:e.d==="me"?myQ(e.tm):(G.TM[e.tm].own?myQ(e.tm)-(G.car.con&&G.car.con.n1?.6:0):G.TM[e.tm].q)}));
  if(sid==="indycar"&&/Indianapolis 500/.test(s.cal[ci][2]||""))INDY500_EXTRA.forEach(x=>{const id=slugId(x[0]);const d=G.D[id];if(d&&!d.ret&&!d.tm)f.push({d:id,tm:null,num:x[5],q:74+R.f(-3,4),tmn:x[4]});});}
 f=f.filter(e=>e.d==="me"||(G.D[e.d]&&!G.D[e.d].inj&&!G.D[e.d].ret));
 // the player's own seat: injured -> substitute; one-off -> extra car
 f.forEach(e=>{if(e.d==="me"&&(G.me.inj||G.me.retired||G.car.sit)){e.d=subDriver(sid);}});
 if(extraMe)f.push({d:"me",tm:extraMe.tm||null,num:G.me.num,q:extraMe.q,tmn:extraMe.tmn});
 return f;}
function subDriver(sid){const fa=Object.values(G.D).filter(d=>!d.r&&!d.tm&&!d.ret&&!d.inj);let d=fa.length?R.pick(fa):genDriverFor(sid);d.cy=0;return d.id;}
function makeRace(sid,ci,extraMe){const s=SER[sid];const c=s.cal[ci];const type=tkt(c[0]);const kind=raceKind(sid,type);
 const rainP=TRK[c[0]][4]||0;const ovalish=["ss","int","sht","dirt","drag"].indexOf(type)>=0;
 let wet=false,rainSeg=-1;if(!ovalish){if(R.chance(rainP*.6))wet=true;else if(R.chance(rainP*.5))rainSeg=R.int(1,2);}
 const field=buildField(sid,ci,extraMe);const K=kind==="drag"?0:kind==="endur"?5:(kind==="dirt"||kind==="kart")?3:4;
 const rc={sid,ci,ev:evName(sid,ci),trk:c[0],type,kind,wet,rainSeg,rainP,laps:evLaps(sid,ci),K,seg:0,phase:"pre",yellow:false,log:[],oneoff:!!extraMe,setup:{q:0,r:0},stageW:[],crown:isCrown(sid,ci),
  cars:field.map(e=>({d:e.d,tm:e.tm,num:e.num,q:e.q,tmn:e.tmn||null,ag:e.d==="me"?.5:(G.D[e.d].ag||.5),sc:0,tire:0,dnf:0,why:"",led:0,pen:0,pit:0,stp:0,dmg:0,cp:{pace:0,wear:1},wt:wet,ab:R.gauss()*1.4,fl:0}))};
 rc.cars.forEach(c=>{c.r=carRating(c,rc);});
 return rc;}
function carRating(c,rc){let r;if(c.d==="me"){r=trackR(rc.type,rc.wet);}else{const d=G.D[c.d];r=aiTrackR(d,rc.type,rc.wet);}
 if(SER[rc.sid].endur){const cod=c.d==="me"?(G.car.co||[]).map(x=>x.r):((G.D[c.d]||{}).co||[]).map(()=>(G.D[c.d].o-3));if(cod.length)r=(r*1.4+sum(cod))/(1.4+cod.length);}
 return r;}
/* Diminishing returns: whatever you gain beyond the best AI package (+EDGE_FREE) only counts EDGE_KEEP. Stops 20-win seasons when the field ages out. */
const EDGE_FREE=1.5,EDGE_KEEP=.3;
function topAI(rc){if(rc._top==null){const cw=SER[rc.sid].cw;let m=-1e9;rc.cars.forEach(o=>{if(o.d!=="me"&&o.r!=null){const v=(1-cw)*o.r+cw*o.q;if(v>m)m=v;}});rc._top=m>-1e9?m:0;}return rc._top;}
function perf(c,rc){const cw=SER[rc.sid].cw;let p=(1-cw)*c.r+cw*c.q;p+=c.d==="me"?rc.setup.r:c.ab;if(c.d==="me"&&rc.cars.length>3){const cap=topAI(rc)+EDGE_FREE;if(p>cap)p=cap+(p-cap)*EDGE_KEEP;}p-=c.dmg;return p;}
function tirSk(c){return c.d==="me"?G.me.sk.tir:clamp(45+(G.D[c.d].o-55)*.6,25,90);}
function conSk(c){return c.d==="me"?G.me.sk.con:clamp(40+(G.D[c.d].o-50)*.7,20,95);}
/* ---------- qualifying ---------- */
function qualify(rc,mode){const cw=SER[rc.sid].cw;const sig=SER[rc.sid].sig*.55*(rc.wet?1.3:1);let note="";
 rc.cars.forEach(c=>{let r=c.r;if(c.d==="me"){r+=(G.me.sk.qul-G.me.sk.spd)*.25+rc.setup.q;if(mode)r+=mode.qb||0;}else{r+=R.gauss()*.8+c.ab*.5;}
  c.qs=(1-cw)*r+cw*c.q+R.gauss()*sig;
  if(c.d==="me"&&mode&&mode.risk&&R.chance(mode.risk)){c.qs=-999;note=mode.fail||"You push too hard, run wide and abort the lap. You'll start from the back.";}});
 // oval qualifying for drafting tracks is mostly the car
 const order=rc.cars.slice().sort((a,b)=>b.qs-a.qs);order.forEach((c,i)=>{c.start=i+1;});
 const n=order.length,tp=tpFactor(rc)*rc.K;order.forEach((c,i)=>{c.sc=n>1?(n-1-i)/(n-1)*tp:0;});
 rc.pole=order[0].d;rc.phase="race";return note;}
/* ---------- AI behaviour ---------- */
function aiFx(c,rc){const late=rc.seg>=rc.K-1;const a=c.ag;return {pace:(a-.5)*1.2+(late?(a-.4):0),risk:.75+a*.6+(late?.2:0),wear:1};}
function wantPit(c,rc,yellow){if(!PIT_SERIES[rc.sid])return false;if(rc.seg>=rc.K-1&&!yellow)return c.tire>=3;if(yellow)return c.tire>=1&&R.chance(.85);return c.tire>=(rc.kind==="endur"?1:2);}
/* ---------- one segment ---------- */
function simSeg(rc,myfx){const s=SER[rc.sid],K=rc.K,sig=raceSig(rc);myfx=myfx||{};const lines=[];const yellowBefore=rc.yellow;rc.yellow=false;
 const run=rc.cars.filter(c=>!c.dnf);const segLaps=Math.max(1,Math.round(rc.laps/K));const pitS=!!PIT_SERIES[rc.sid];
 const beforePos={};run.slice().sort((a,b)=>b.sc-a.sc).forEach((c,i)=>beforePos[c.d]=i+1);
 // rain arrives
 let rainNow=false;if(rc.rainSeg===rc.seg){rc.wet=true;rainNow=true;lines.push(`🌧️ <b>Rain!</b> The skies open over ${esc(tkn(rc.trk))}.`);run.forEach(c=>{if(c.d!=="me"&&R.chance(.7)){c.wt=true;c.sc-=K*2.2;c.pit++;}});}
 run.forEach(c=>{const me=c.d==="me";const fx=me?myfx:aiFx(c,rc);
  // pit stops
  let pit=me?!!fx.pit:wantPit(c,rc,yellowBefore);if(me&&fx.wetTires&&!c.wt){c.wt=true;pit=true;}
  if(!me&&rc.wet&&!c.wt&&R.chance(.6)){c.wt=true;pit=true;}
  if(pit&&(pitS||fx.wetTires||rc.wet)){c.pit++;const cost=yellowBefore?K*.9:K*(rc.kind==="endur"?1.4:2.6);c.sc-=cost;c.tire=fx.tires===2?1:0;if(fx.comp)c.cp=fx.comp;
   if(R.chance((fx.pitAgg?.07:.025)*(me?1.15-G.me.sk.con/200:1))){c.sc-=K*2.5;c.pen++;if(me)lines.push(`🚨 Penalty: speeding on pit road. Pass-through!`);}}
  if(me&&fx.stay&&yellowBefore){c.sc+=K*1.1;}
  // pace
  const wearRate=pitS?1.0:.55;const wearPen=wearRate*c.tire*(fx.wear||1)*c.cp.wear*(1.2-tirSk(c)/100);
  let wetPen=0;if(rc.wet&&!c.wt)wetPen=4.5;if(!rc.wet&&c.wt)wetPen=3;
  c.sc+=perf(c,rc)+(fx.pace||0)+c.cp.pace-wearPen-wetPen+R.gauss()*sig*Math.sqrt(K)*NOISE_K;
  c.tire+=1;c.stp=perf(c,rc)+(fx.pace||0)-wearPen;
  if(me&&fx.lane){c.sc+=K*fx.lane*R.f(-.6,1.2);}
  // incidents
  const pInc=s.dnf/K*(fx.risk||1)*(1.3-conSk(c)/140)*(rc.kind==="ss"?.5:1)*(rc.wet?1.4:1);
  if(R.chance(pInc)){if(R.chance(.55)){c.dnf=rc.seg+1;c.why=R.pick(["Crash","Crash","Spun and hit the wall","Contact damage"]);}else{c.sc-=K*R.f(2,6);c.dmg+=R.f(.5,2.5);c.inc="spin";}rc.yellow=true;}
  else if(R.chance(s.dnf*.3/K*(1.35-c.q/100))){c.dnf=rc.seg+1;c.why=R.pick(["Engine","Mechanical","Electrical","Gearbox","Suspension","Overheating"]);}
  if(!c.dnf&&fx.jump&&R.chance(fx.jump)){c.sc-=K*2;c.pen++;if(me)lines.push("🚨 Penalty: jumped the start. Five seconds!");}
  if(!c.dnf&&rc.kind==="open"&&R.chance((fx.risk||1)>1.3?.03:.005)){c.sc-=K*1.2;c.pen++;if(me)lines.push("🚨 Five-second penalty for exceeding track limits.");}
 });
 // the Big One on drafting tracks
 if(rc.kind==="ss"&&rc.seg>0&&R.chance(.32)){const pack=rc.cars.filter(c=>!c.dnf).sort((a,b)=>b.sc-a.sc);const lo=Math.min(3,pack.length-1);const n=R.int(4,Math.min(12,Math.max(4,pack.length-4)));const st=R.int(lo,Math.max(lo,Math.floor(pack.length/3)));
  const hit=pack.slice(st,st+n);let names=[];hit.forEach(c=>{if(c.d==="me"){const dodge=(myfx.back?.65:0)+G.me.sk.crf/250;if(R.chance(dodge)){lines.push("😮 You thread the needle through the wreck untouched!");return;}}
   if(R.chance(.6)){c.dnf=rc.seg+1;c.why="Multi-car crash";}else{c.dmg+=R.f(1,3);c.sc-=K*2;}names.push(c.d);});
  if(names.length){lines.push(`💥 <b>THE BIG ONE!</b> ${names.length} cars collected, including ${names.slice(0,3).map(id=>esc(nm(id))).join(", ")}.`);rc.yellow=true;}}
 if(!rc.yellow&&R.chance(CAUTION_P[rc.kind]*.6))rc.yellow=true;
 // laps led
 const order=rc.cars.filter(c=>!c.dnf).sort((a,b)=>b.sc-a.sc);if(order[0]){order[0].led+=Math.round(segLaps*.72);if(order[1])order[1].led+=segLaps-Math.round(segLaps*.72);}
 // NASCAR stage points
 if(s.pts==="nascar"&&rc.K===4&&(rc.seg===0||rc.seg===1)&&!rc.oneoffOnly){order.slice(0,10).forEach((c,i)=>{c.stg=(c.stg||0)+(10-i);});rc.stageW.push(order[0]&&order[0].d);lines.push(`🏁 <b>Stage ${rc.seg+1}</b> goes to ${esc(nm(order[0].d))}.`);}
 // caution compression
 if(rc.yellow&&rc.seg<rc.K-1){const lead=order[0]?order[0].sc:0;order.forEach((c,i)=>{c.sc=lead-(lead-c.sc)*COMPRESS_KEEP-i*.4;});}
 // narrative
 const dnfNow=rc.cars.filter(c=>c.dnf===rc.seg+1);
 dnfNow.filter(c=>c.d!=="me").slice(0,3).forEach(c=>lines.push(`❌ ${esc(nm(c.d))} is out (${c.why.toLowerCase()}).${G.D[c.d]&&!G.D[c.d].r&&/Crash/.test(c.why)&&R.chance(.04)?aiInjury(c.d):""}`));
 if(order[0])lines.push(`🔝 ${esc(nm(order[0].d))} leads${order[1]?`, ${esc(nm(order[1].d))} second`:""}.`);
 const me=rc.cars.find(c=>c.d==="me");if(me){if(me.dnf===rc.seg+1)lines.push(`<b class="r">Your race is over: ${esc(me.why.toLowerCase())}.</b>`);else if(!me.dnf){const p=order.indexOf(me)+1;const b=beforePos.me||p;lines.push(`<b>You are running ${ordinal(p)}</b>${b>p?` <span class="g">(+${b-p})</span>`:b<p?` <span class="r">(${b-p})</span>`:""}.`);}}
 if(rc.yellow&&rc.seg<rc.K-1)lines.push(rc.kind==="open"?"🟡 Safety car deployed.":rc.kind==="endur"?"🟡 Full course yellow.":"🟡 Caution is out.");
 rc.seg++;rc.log.push({seg:rc.seg,lines});return lines;}
function aiInjury(id){const d=G.D[id];if(!d||d.r)return "";const w=R.int(2,6);d.inj={w};addNews(`${d.n} will miss about ${plural(w,"week")} with injuries from a crash.`);return ` ${esc(d.n)} is taken to the infield care center.`;}
/* ---------- finish ---------- */
function classify(rc){const fin=rc.cars.filter(c=>!c.dnf).sort((a,b)=>b.sc-a.sc).concat(rc.cars.filter(c=>c.dnf).sort((a,b)=>b.dnf-a.dnf||b.sc-a.sc));
 fin.forEach((c,i)=>{c.fin=i+1;});const top=fin.filter(c=>!c.dnf).slice(0,6);if(top.length){const f=R.wpick(top,c=>Math.exp((c.stp||0)/3));if(f)f.fl=1;}
 const maxLed=Math.max(...rc.cars.map(c=>c.led));return fin.map(c=>({d:c.d,tm:c.tm,num:c.num,st:c.start,f:c.fin,dnf:c.dnf?c.why:"",led:c.led,fl:c.fl,ml:c.led>0&&c.led===maxLed,stg:c.stg||0,pen:c.pen,tmn:c.tmn}));}
function applyResults(rc,res){const s=SER[rc.sid];const st=G.S[rc.sid];const champ=!s.oneoff;const n=res.length;
 res.forEach(r=>{let p=0;if(champ){p=ptsFor(rc.sid,r.f,rc.ev)+(r.stg||0);if(s.pts==="indy"){if(r.st===1)p+=1;if(r.led>0)p+=1;if(r.ml)p+=2;}if(s.pts==="fe"){if(r.st===1)p+=3;if(r.fl&&r.f<=10)p+=1;}}
  r.pts=p;if(!champ)return;if(rc.oneoff&&r.d==="me")return;
  const t=st.tab[r.d]||(st.tab[r.d]={p:0,st:0,w:0,pd:0,t5:0,t10:0,pol:0,dnf:0,led:0,sf:0,best:99});t.p+=p;t.st++;if(r.f===1)t.w++;if(r.f<=3)t.pd++;if(r.f<=5)t.t5++;if(r.f<=10)t.t10++;if(r.st===1)t.pol++;if(r.dnf)t.dnf++;t.led+=r.led;t.sf+=r.f;t.best=Math.min(t.best,r.f);});
 res.forEach(r=>{if(r.d==="me")return;const d=G.D[r.d];if(!d)return;d.c.st++;if(r.f===1){d.c.w++;if(rc.crown)d.c.cj++;}if(r.f<=5)d.c.t5++;if(r.st===1)d.c.pol++;});
 if(!s.oneoff){st.res.push({ci:rc.ci,w:res[0].d,p2:res[1]&&res[1].d,p3:res[2]&&res[2].d,pole:(res.find(r=>r.st===1)||{}).d});st.ci=Math.max(st.ci,rc.ci+1);}
 else G.hist[rc.sid].push({yr:G.yr,c:res[0].d,cn:res[0].d==="me"?G.me.name:nm(res[0].d)});
 if(typeof ownerRaceHook==="function")ownerRaceHook(rc,res);
 if(s.chase&&st.res.length===s.chase.after&&!st.chase)startChase(rc.sid);
 if(!s.oneoff&&st.res.length>=s.cal.length)finishSeries(rc.sid);
 const w=res[0];if(w.d!=="me"&&(s.tier>=7||rc.crown)&&R.chance(rc.crown?1:.35))addNews(`${nm(w.d)} wins ${rc.crown?"the ":""}${rc.ev}${rc.crown?"":" ("+s.sh+")"}.`);}
function startChase(sid){const st=G.S[sid];const rows=standings(sid).filter(r=>r.id);const n=SER[sid].chase.n;const ch=rows.slice(0,n).map(r=>r.id);st.chase=ch;
 ch.forEach((id,i)=>{st.tab[id].p=i===0?2100:i===1?2075:2065-(i-2)*5;});addNews(`${SER[sid].sh}: the Chase field is set. ${nm(ch[0])} leads the ${n} contenders.`);if(ch.indexOf("me")>=0){G.fl.madeChase=(G.fl.madeChase||0)+1;G.notes.push(`🏆 You made the ${SER[sid].sh} Chase!`);}}
function finishSeries(sid){const st=G.S[sid];if(st.done)return;st.done=true;const rows=standings(sid);if(!rows.length)return;const c=rows[0].id;st.champ=c;
 G.hist[sid].push({yr:G.yr,c,cn:c==="me"?G.me.name:nm(c),tm:c==="me"?(G.car.tm?tn(G.car.tm):""):tn(G.D[c]&&G.D[c].tm),p2:rows[1]&&rows[1].id});
 if(c!=="me"&&G.D[c])G.D[c].c.tt++;
 // team owners' championships
 (G.own||[]).forEach(o=>{if(o.s===sid){const ids=G.TM[o.tid]?G.TM[o.tid].cars.map(x=>x.d):[];if(ids.indexOf(c)>=0){o.titles=(o.titles||0)+1;G.notes.push(`🏆 Your team ${o.n} won the ${SER[sid].sh} championship!`);}}});
 if(c==="me"){G.st.titles.push({yr:G.yr,s:sid});addNews(`${G.me.name} is the ${G.yr} ${SER[sid].n} champion!`,true);G.notes.push(`🏆 <b>${G.yr} ${esc(SER[sid].n)} CHAMPION!</b>`);rep(SER[sid].tier*2);fame(SER[sid].tier*2);}
 else if(SER[sid].tier>=6)addNews(`${nm(c)} wins the ${G.yr} ${SER[sid].sh} championship.`);
 // superlicense points
 const tbl=SER[sid].slp;if(tbl){const p=champPos(sid,"me");if(p&&p<=tbl.length&&(st.tab.me||{}).st>=Math.ceil(SER[sid].cal.length*.6)){G.me.slp.push({yr:G.yr,s:sid,p:tbl[p-1]});G.notes.push(`📜 ${tbl[p-1]} FIA superlicense points for finishing ${ordinal(p)} in ${SER[sid].sh}.`);}}}
function slpTotal(){return sum(G.me.slp.filter(x=>x.yr>=G.yr-2).map(x=>x.p));}
/* ---------- quick (non-interactive) race for AI series ---------- */
function quickRace(sid,ci){const rc=makeRace(sid,ci,null);if(rc.kind==="drag"){const res=dragQuick(rc);applyResults(rc,res);return res;}
 rc.setup={q:0,r:0};qualify(rc,null);for(let i=0;i<rc.K;i++)simSeg(rc,null);const res=classify(rc);applyResults(rc,res);return res;}
/* ---------- drag racing ---------- */
function dragET(c,rc,tune){const q=c.q,r=c.r;let et=3.62+(100-q)*.0045-(r-70)*.0012+R.gauss()*.035;let smoke=.07+(tune&&tune.agg?.07:0)-(q-70)*.001;if(R.chance(smoke)){et+=R.f(.6,2.5);c.smoke=1;}else c.smoke=0;return et;}
function dragRT(c,launch){const sk=c.d==="me"?G.me.sk.qul:clamp(G.D[c.d].o,30,95);let rt=.085-(sk-60)*.0006+Math.abs(R.gauss())*.025;if(launch&&launch.agg)rt-=.012;let red=launch&&launch.agg?.06:.012;if(c.d==="me"&&launch&&launch.safe){rt+=.015;red=.003;}if(R.chance(red))return -1;return Math.max(.02,rt);}
function dragQuick(rc){rc.cars.forEach(c=>{c.qet=dragET(c,rc,null);});const q=rc.cars.slice().sort((a,b)=>a.qet-b.qet);q.length=Math.min(q.length,dragBracket(q.length));q.forEach((c,i)=>c.start=i+1);let round=q.slice();const out=[];
 while(round.length>1){const next=[];for(let i=0;i<round.length/2;i++){const a=round[i],b=round[round.length-1-i];const w=dragDuel(a,b,null,null);next.push(w);out.unshift(w===a?b:a);}round=next;}out.unshift(round[0]);
 return out.map((c,i)=>({d:c.d,tm:c.tm,num:c.num,st:c.start,f:i+1,dnf:"",led:0,fl:0,ml:0,stg:0,pen:0}));}
function dragDuel(a,b,tune,launch){if(a===b){a.last=a.last||{rt:.1,et:a.qet||4,sm:0};return a;}const ra=dragRT(a,a.d==="me"?launch:null),rb=dragRT(b,b.d==="me"?launch:null);
 const ea=(ra<0?.2:ra)+dragET(a,null,a.d==="me"?tune:null),eb=(rb<0?.2:rb)+dragET(b,null,b.d==="me"?tune:null);a.last={rt:ra,et:ea-(ra<0?.2:ra),sm:a.smoke};b.last={rt:rb,et:eb-(rb<0?.2:rb),sm:b.smoke};if(ra<0&&rb>=0)return b;if(rb<0&&ra>=0)return a;return ea<=eb?a:b;}
function dragBracket(n){let b=16;while(b>1&&b>n)b/=2;return b;}
