/* ===================== RACE WEEKEND UI ===================== */
function myCar(rc){return rc.cars.find(c=>c.d==="me");}
function myPosNow(rc){const run=rc.cars.filter(c=>!c.dnf).sort((a,b)=>b.sc-a.sc);const i=run.findIndex(c=>c.d==="me");return i>=0?i+1:0;}
function expFin(rc){const sorted=rc.cars.slice().sort((a,b)=>perf(b,rc)-perf(a,rc));return sorted.findIndex(c=>c.d==="me")+1||Math.round(rc.cars.length/2);}
function raceWeekend(sid,ci,oo){const ooIdx=oo?G.car.oneoffs.indexOf(oo):-1;
 const extra=oo?{tm:oo.tm||null,q:oo.q,tmn:oo.tmn}:null;const rc=makeRace(sid,ci,extra);rc.ooIdx=ooIdx;rc.phase="pre";rc.myTm=oo?(oo.tm||null):G.car.tm;
 rc.exp=expFin(rc);G.rc=rc;if(G.set.quick)return quickMine();return preview();}
function resumeRace(){const rc=G.rc;if(!rc)return hub();if(rc.phase==="pre")return preview();if(rc.phase==="quali")return qualiCard();if(rc.phase==="race")return segCard();if(rc.phase==="drag")return dragCard();if(rc.phase==="post")return resultsScreen();G.rc=null;hub();}
function fieldAvgQ(rc){return avg(rc.cars.filter(c=>c.d!=="me").map(c=>c.q));}
function preview(){const rc=G.rc,s=SER[rc.sid],me=myCar(rc);const t=TRK[rc.trk];
 const rivals=standings(rc.sid).filter(r=>r.id!=="me").slice(0,3).map(r=>r.id);const top=rc.cars.filter(c=>c.d!=="me").sort((a,b)=>perf(b,rc)-perf(a,rc)).slice(0,3).map(c=>c.d);
 const fc=rc.wet?"Rain all day. Wet race.":rc.rainSeg>=0?"Showers likely at some point.":rc.rainP>.2&&["road","street","kart"].indexOf(rc.type)>=0?"A slight chance of rain.":"Dry and warm.";
 const crowd=rc.crown?`<p class="gold">👑 <b>This is a crown jewel.</b> ${esc(rc.ev)}. Winning here puts your name in the history books.</p>`:"";
 const intro=rc.kind==="drag"?`Two lanes, a quarter-mile reduced to 1,000 feet, eleven thousand horsepower.`:rc.kind==="ss"?"Pack racing at 190 mph. Everybody's a contender, and anybody can get caught in the Big One.":rc.kind==="dirt"?"The cushion is building up and the track is going to slick off. Car control wins here.":rc.kind==="endur"?`Endurance racing: you share the car with ${G.car.co&&G.car.co.length?G.car.co.map(c=>esc(c.n)).join(" and "):"your co-drivers"}.`:rc.kind==="open"?"Qualifying matters: passing is hard and strategy decides races.":rc.kind==="kart"?"Wheel to wheel, bumper to bumper. Keep your nose clean through turn one.":"";
 show(`<div class="eyebrow">${esc(s.n.toUpperCase())} · ROUND ${rc.oneoff?"(one-off)":(rc.ci+1)+" OF "+s.cal.length}</div><h2>${esc(rc.ev)}</h2>
 <p>${esc(t[0])}, ${esc(t[1])} · ${TTYPE_N[rc.type]}, ${t[3]} mi${rc.kind!=="drag"?` · ${rc.laps} laps`:""}</p>${crowd}<p>${intro}</p>
 ${tiles([{l:"Your track rating",v:rb(Math.round(trackR(rc.type,rc.wet)))},{l:"Your car",v:Math.round(me.q),h:"Field average "+Math.round(fieldAvgQ(rc))},{l:"Forecast",v:rc.wet?"🌧️":rc.rainSeg>=0?"🌦️":"☀️",h:fc},{l:"Field",v:rc.cars.length,h:"cars"}])}
 <p>Fastest on paper: ${top.map(id=>nmb(id)).join(", ")}${rivals.length&&!rc.oneoff?`. Points leaders: ${rivals.map(id=>esc(nm(id))).join(", ")}.`:"."}</p>`,
 rc.kind==="drag"?[{t:"Head to the staging lanes",cls:"hi",f:()=>{rc.phase="drag";dragStart();}},{t:"Quick-sim this event",f:quickMine}]:[
  {sec:"PRACTICE"},
  {t:"Practice: race setup",sub:"Long runs. Better race pace, less one-lap speed",icon:"🛞",f:()=>practice("race")},
  {t:"Practice: qualifying setup",sub:"Low fuel, sticker tires. Better grid spot",icon:"⏱️",f:()=>practice("qual")},
  {t:"Practice: balanced",sub:"A bit of both",icon:"⚖️",f:()=>practice("bal")},
  {t:"Push hard in practice",sub:"Find the limit. Bigger gains, but you could crash",icon:"🔥",f:()=>practice("push")},
  {t:"Quick-sim the whole weekend",sub:"Skip to the results",icon:"⏩",f:quickMine}]);}
function practice(mode){const rc=G.rc,m=G.me;EFX=[];const base=(m.sk.fbk-50)/25+relOf("cc")/60+(G.car.testB||0)+(G.fl.simPrep?.3:0)+R.gauss()*.7;let q=0,r=0;
 if(mode==="race"){r=base;q=base*.35;}else if(mode==="qual"){q=base+.5;r=base*.35;}else if(mode==="bal"){q=r=base*.7;}else{q=r=base*.9+.6;}
 let txt=R.pick(["The car is tight in the center and loose off.","You chase the balance all session.","The crew makes a big swing on the setup and it works.","Your lap times drop with every run."]);
 if(base>1.5)txt="The car is <b>on rails</b>. You're near the top of the practice sheet.";else if(base<-.5)txt="Nothing works. You're buried down the practice chart.";
 if(R.chance(mode==="push"?.09:.02)){q-=1;r-=1;txt+=` <b class="r">You crash in practice!</b> The crew thrashes to fix the car${SER[rc.sid].tier>=6?" (backup car)":""}.`;if(G.car.tm==="priv"&&!rc.oneoff){const cost=Math.round(SER[rc.sid].cost/SER[rc.sid].cal.length*.4);spend(cost,"Repairs");}rel("cc",-2);}
 rc.setup={q:r1(q),r:r1(r)};G.car.testB=0;G.fl.simPrep=0;gainSk("fbk",.08,true);rc.phase="quali";
 show(`<h2>Practice</h2><p>${txt}</p><p>Setup: qualifying trim <b>${sgn(rc.setup.q)}</b>, race trim <b>${sgn(rc.setup.r)}</b>.</p>${efxHtml()}`,[{t:"On to qualifying",cls:"hi",f:qualiCard}]);}
function sgn2(v){return (v>=0?"+":"")+r1(v);}
function qualiCard(){const rc=G.rc;rc.phase="quali";const ovalPack=rc.kind==="ss";
 const fmt=rc.kind==="kart"?"Timed qualifying sets the grid for the heats and the final.":rc.kind==="dirt"?"Time trials, then heat races. Qualifying sets your heat position.":ovalPack?"Single-car runs at a superspeedway are mostly about the car.":SER[rc.sid].disc==="open"?"Knockout qualifying. Every tenth matters.":"Single-car qualifying runs.";
 show(`<h2>Qualifying</h2><p>${fmt}</p>`,[
  {t:"Clean, safe lap",sub:"No risk",icon:"✅",f:()=>doQuali({qb:0,risk:0})},
  {t:"Push for a strong lap",sub:"+speed, small chance of a mistake",icon:"⚡",f:()=>doQuali({qb:ovalPack?.6:1.4,risk:.08})},
  {t:"Everything on the line",sub:"Big gain or a big mistake",icon:"🔥",f:()=>doQuali({qb:ovalPack?1.2:2.8,risk:.22})},
  {t:"Quick-sim the rest of the weekend",icon:"⏩",f:quickMine}]);}
function doQuali(mode){const rc=G.rc;const note2=qualify(rc,mode);const me=myCar(rc);const g=rc.cars.slice().sort((a,b)=>a.start-b.start);
 if(me.start===1){G.notes.push("");}
 const rows=g.slice(0,10).map(c=>({cells:[c.start,(c.d==="me"?"<b>"+esc(G.me.name)+"</b>":esc(nm(c.d))),esc(c.tmn||tn(c.tm)),"#"+esc(String(c.num))],hl:c.d==="me"}));if(me.start>10)rows.push({cells:[me.start,"<b>"+esc(G.me.name)+"</b>",esc(me.tmn||tn(me.tm)),"#"+me.num],hl:true});
 const msg=me.start===1?`<p class="gold"><b>POLE POSITION!</b> ${R.pick(["What a lap!","You put it on the pole by a whisker.","Nobody could touch that lap."])}</p>`:me.start<=3?`<p class="g">You'll start <b>${ordinal(me.start)}</b>. A great lap.</p>`:me.start<=rc.cars.length/2?`<p>You'll start <b>${ordinal(me.start)}</b>.</p>`:`<p class="r">You'll start <b>${ordinal(me.start)}</b>. Work to do.</p>`;
 if(me.start===1)G.notes.pop();
 show(`<h2>Qualifying results</h2>${note2?`<p class="r">${note2}</p>`:""}${msg}${table(["Pos","Driver","Team","Car"],rows)}`,[{t:"Go racing",cls:"hi",f:segCard}]);}
/* ---------- in-race decisions ---------- */
function segCard(){const rc=G.rc;rc.phase="race";const me=myCar(rc);if(me.dnf||rc.seg>=rc.K)return finishRace();
 const pos=myPosNow(rc);const n=rc.cars.filter(c=>!c.dnf).length;const pitS=!!PIT_SERIES[rc.sid];const last=rc.seg===rc.K-1;const first=rc.seg===0;const kind=rc.kind;
 const lapNow=Math.round(rc.laps*rc.seg/rc.K);const prev=rc.log.length?rc.log[rc.log.length-1].lines:[];
 let head=first?`<p>${kind==="kart"||kind==="dirt"?"The field rolls two-by-two.":kind==="open"?"Five red lights...":kind==="endur"?"The rolling start is moments away.":"The green flag is in the air!"} You start <b>${ordinal(me.start)}</b> of ${rc.cars.length}.</p>`:`<p>Lap ${lapNow} of ${rc.laps}. You're running <b>${ordinal(pos)}</b> of ${n}.${pitS?` Tires: ${["fresh","good","worn","shot","gone"][Math.min(4,me.tire)]}.`:""}</p>`;
 const log=prev.length?`<div class="log">${prev.map(l=>`<div>${l}</div>`).join("")}</div>`:"";
 let ch=[];const fx=(o)=>()=>runSeg(o);
 // team orders
 if(!first&&rc.seg>=rc.K-2&&!rc.toAsked&&!rc.oneoff){const run=rc.cars.filter(c=>!c.dnf).sort((a,b)=>b.sc-a.sc);const i=run.indexOf(me);const behind=run[i+1],ahead=run[i-1];
  const mate=behind&&behind.tm===me.tm&&behind.d!=="me"?behind:null;const st=G.S[rc.sid];
  if(mate&&R.chance(.4)&&G.car.con&&!G.car.con.n1&&(st.tab[mate.d]||{p:0}).p>((st.tab.me||{p:0}).p)){rc.toAsked=1;
   return show(`${head}${log}<h3>📻 Team orders</h3><p>"${esc(G.car.cc||"Your engineer")} here. ${esc(nm(mate.d))} is ahead of you in the championship. The team asks you to let them through."</p>`,[
    {t:"Let your teammate by",sub:"Lose a spot; the team remembers your loyalty",f:()=>{EFX=[];const t=me.sc;me.sc=mate.sc-.1;mate.sc=t+.1;rel("t:"+me.tm,6);rel("d:"+mate.d,5);G.fl.obeyed=(G.fl.obeyed||0)+1;segCardNote("You lift and wave your teammate through.");}},
    {t:"Ignore the call",sub:"Keep your spot; the team won't be happy",f:()=>{EFX=[];rel("t:"+me.tm,-8);rel("d:"+mate.d,-8);rep(-1);G.fl.ignoredTO=(G.fl.ignoredTO||0)+1;segCardNote("You keep your foot in it. The radio goes very quiet.");}}]);}}
 if(first){
  if(kind==="ss")ch=[{t:"Ride high in the draft",sub:"Momentum lane: could gain a lot or lose a lot",f:fx({lane:1,pace:.3,risk:1})},{t:"Hang at the back, wait for the end",sub:"Avoid the Big One; give up track position",f:fx({back:1,pace:-1.6,risk:.6})},{t:"Push to the front early",sub:"Lead laps, collect stage points, take risks",f:fx({pace:1.2,risk:1.3})}];
  else if(kind==="dirt")ch=[{t:"Run the cushion",sub:"The fastest line and the riskiest",f:fx({pace:1.3,risk:1.45})},{t:"Hug the bottom",sub:"Safe, steady and slower",f:fx({pace:-.3,risk:.7})},{t:"Slide job the leaders",sub:"Aggressive passing",f:fx({pace:.9,risk:1.3})}];
  else ch=[{t:"Aggressive start",sub:"Gain spots into turn one; risk contact"+(kind==="open"||kind==="kart"?" or a jump start":""),f:fx({pace:1.4,risk:1.4,jump:kind==="open"||kind==="kart"?.04:0})},{t:"Clean start",sub:"Hold position, stay out of trouble",f:fx({pace:.2,risk:.85})},{t:"Patient: save tires early",sub:"Lose a little now, faster later",f:fx({pace:-.5,risk:.7,wear:.7,save:1})}];
 }else if(rc.yellow&&pitS&&!last){
  ch=[{t:kind==="open"||kind==="endur"?"Box under the safety car":"Pit for four tires",sub:"Fresh tires, lose track position",f:fx({pit:1,pace:.3,risk:1})},
   (SER[rc.sid].disc==="stock")?{t:"Two tires",sub:"Quicker stop, half the grip",f:fx({pit:1,tires:2,pace:.1,risk:1})}:{t:"Box and switch to softer tires",sub:"Faster, but they wear quickly",f:fx({pit:1,comp:{pace:1,wear:1.6},risk:1})},
   {t:"Stay out for track position",sub:me.tire>=2?"Your tires are worn. Risky.":"Gain spots, older tires",f:fx({stay:1,risk:1})}];
  if(rc.wet&&!me.wt)ch.unshift({t:"Pit for wet tires",sub:"It's raining: slicks are useless",f:fx({pit:1,wetTires:1})});
 }else if(rc.wet&&!me.wt&&kind!=="stock"&&kind!=="ss"&&kind!=="dirt"&&kind!=="indyoval"){
  ch=[{t:"Pit for wet tires now",sub:"The right call if the rain stays",f:fx({wetTires:1})},{t:"Gamble: stay on slicks",sub:"If it dries, you win big. If not...",f:fx({risk:1.4,pace:-.5})}];
 }else if(rc.rainSeg===rc.seg+1&&!rc.radarWarned&&["road","street","kart"].indexOf(rc.type)>=0){rc.radarWarned=1;
  ch=[{t:"Radar says rain soon: pit for wets early",sub:"A gamble that pays off if the rain comes heavy",f:fx({wetTires:1,pace:-.3})},{t:"Stay out and react",sub:"Standard approach",f:fx({pace:0,risk:1})},{t:"Push hard before it rains",sub:"Build a gap",f:fx({pace:1,risk:1.25})}];
 }else if(last){
  ch=[{t:"All-out attack",sub:"Everything you've got: more passing, more mistakes",f:fx({pace:2,risk:1.7})},{t:"Race hard but smart",sub:"Take what the car gives you",f:fx({pace:.7,risk:1.05})},{t:"Bring it home",sub:"Protect the finish and the points",f:fx({pace:-.3,risk:.6})}];
  if(rc.yellow&&(kind==="stock"||kind==="ss"||kind==="indyoval"))ch.unshift({t:"Restart: take the outside line",sub:"Bold: could clear you to the lead or hang you out to dry",f:fx({lane:1.3,pace:.6,risk:1.25})});
  if(pitS&&me.tire>=3)ch.push({t:"Late stop for fresh tires",sub:"Your tires are gone. Lose time now, charge at the end",f:fx({pit:1,pace:1.5,risk:1.2})});
 }else{
  ch=[{t:"Push the pace",sub:"Close the gap",f:fx({pace:1,risk:1.25,wear:1.25})},{t:"Settle in and manage",sub:"Look after the car",f:fx({pace:0,risk:.85,wear:.8})}];
  if(pitS&&me.tire>=2)ch.push({t:kind==="open"||kind==="endur"?"Box for fresh tires (green flag)":"Green-flag pit stop",sub:"Costs time now, faster after",f:fx({pit:1,risk:1})});
  if(kind==="ss")ch.push({t:"Work the draft with a partner",sub:SER[rc.sid].mfr?"Lock bumpers with a manufacturer teammate":"Find a drafting partner",f:fx({lane:.8,pace:.3,risk:1.1})});
  if(kind==="endur")ch.push({t:"Double-stint (stay in the car)",sub:"You're quicker than the co-driver, but it takes it out of you",f:fx({pace:.8,risk:1.05,fit:1})});
  if(kind==="dirt")ch.push({t:"Move up to the cushion",sub:"The track is slicking off: find grip up high",f:fx({pace:1,risk:1.3})});
  if(kind==="open"&&!rc.compAsked){ch.push({t:"Switch to a two-stop plan",sub:"Softer tires and more pace, an extra stop",f:fx({comp:{pace:1.2,wear:1.4},pace:.3,risk:1})});}
 }
 ch.push({t:"Sim to the checkered flag",sub:"Auto strategy",cls:"",icon:"⏩",f:simToEnd});
 show(`<div class="eyebrow">${esc(rc.ev.toUpperCase())}</div>${head}${log}`,ch);}
function segCardNote(t){const rc=G.rc;rc.log.push({seg:rc.seg,lines:[t]});save();segCard();}
function runSeg(fx){const rc=G.rc;if(fx.fit){G.me.hp=clamp(G.me.hp-8,0,100);}
 if(hasTrait("charger")&&fx.pace>0)fx.pace+=.2;if(hasTrait("ice")&&rc.seg===rc.K-1)fx.risk=(fx.risk||1)*.85;if(hasTrait("braker"))fx.risk=(fx.risk||1)*1.05;
 simSeg(rc,fx);save();const me=myCar(rc);if(me.dnf||rc.seg>=rc.K)return finishRace();segCard();}
function autoFx(rc){const me=myCar(rc);const fx={pace:.3,risk:1};if(!me)return fx;const pitS=!!PIT_SERIES[rc.sid];if(rc.wet&&!me.wt)fx.wetTires=1;
 else if(pitS&&rc.yellow&&me.tire>=1&&rc.seg<rc.K-1)fx.pit=1;else if(pitS&&me.tire>=3)fx.pit=1;if(rc.seg===rc.K-1)fx.pace=.8;return fx;}
function simToEnd(){const rc=G.rc;let g=0;while(rc.seg<rc.K&&!myCar(rc).dnf&&g++<20)simSeg(rc,autoFx(rc));if(rc.seg<rc.K){while(rc.seg<rc.K&&g++<40)simSeg(rc,{});}finishRace();}
function quickMine(){const rc=G.rc;if(rc.kind==="drag"){rc.phase="drag";const res=dragQuick(rc);return applyMine(res);}if(rc.phase==="pre"){rc.setup={q:(G.car.testB||0)*.6+(G.me.sk.fbk-50)/40,r:(G.car.testB||0)*.6+(G.me.sk.fbk-50)/40};G.car.testB=0;}
 if(rc.phase==="pre"||rc.phase==="quali")qualify(rc,null);simToEnd();}
function finishRace(){const rc=G.rc;while(rc.seg<rc.K)simSeg(rc,{});const res=classify(rc);applyMine(res);}
/* ---------- results ---------- */
function applyMine(res){const rc=G.rc;const s=SER[rc.sid];EFX=[];applyResults(rc,res);const r=res.find(x=>x.d==="me");rc.res=res;rc.phase="post";
 if(rc.ooIdx>=0&&G.car.oneoffs[rc.ooIdx])G.car.oneoffs[rc.ooIdx].done=1;if(s.oneoff)G.fl["oo_"+s.id]=G.yr;
 if(!r){save();return resultsScreen();}
 const tmn=rc.oneoff?(myCar(rc).tmn||tn(myCar(rc).tm)):tn(G.car.tm);
 const rec={yr:G.yr,wk:G.wk,s:rc.sid,ci:rc.ci,ev:rc.ev,trk:rc.trk,st:r.st||rc.cars.length,f:r.f,n:res.length,led:r.led,fl:r.fl?1:0,dnf:r.dnf||"",pts:r.pts||0,cj:rc.crown&&r.f===1?1:0,oo:rc.oneoff?1:0,tmn,wet:rc.wet?1:0};
 G.st.races.push(rec);if(rec.cj){G.st.cj.push({yr:G.yr,ev:rc.ev,s:rc.sid});addNews(`${G.me.name} wins the ${rc.ev}!`,true);}else if(r.f===1)addNews(`${G.me.name} wins the ${rc.ev}${s.tier>=5?"":" at "+tkn(rc.trk)}.`,true);
 // money
 const perRace=Math.round(s.cost/Math.max(1,s.cal.length));
 if(G.car.tm==="priv"&&!rc.oneoff){spend(perRace,"Race costs (tires, fuel, entry)");}
 const payout=r.f===1?1:r.f===2?.6:r.f===3?.45:r.f<=5?.3:r.f<=10?.15:.06;
 if(s.purse&&(G.car.tm==="priv"||rc.oneoff||s.tier<=4))earn(Math.round(s.purse*payout),"Prize money");
 else if(s.purse)earn(Math.round(s.purse*payout*.3),"Purse share");
 if(r.f===1&&G.car.con&&G.car.con.win&&!rc.oneoff)earn(G.car.con.win,"Win bonus");
 if(r.dnf&&/rash|ontact|wall|Multi/.test(r.dnf)){G.stats.crashes++;if(G.car.tm==="priv"&&!rc.oneoff)spend(Math.round(perRace*.6),"Crash repairs");rel("cc",-1);
  const p=.07*(rc.kind==="ss"?1.6:1)*(s.tier>=6?1.3:1)*(rc.kind==="kart"?.5:1);if(R.chance(p)){const sev=R.wpick([1,2,3],x=>x===1?5:x===2?3:1.3);const inj=hurt(sev);G.notes.push(`🚑 You were hurt in the crash: ${esc(inj)}. ${G.me.inj.w>1?"You'll miss about "+plural(G.me.inj.w,"week")+".":""}`);}}
 // reputation, morale, relationships
 const tierW=.4+s.tier*.25;const n=res.length;
 if(r.f===1){rep(r1(tierW*1.6));fame(r1(tierW*1.4));morale(10);}else if(r.f<=3){rep(r1(tierW*.7));fame(r1(tierW*.5));morale(5);}else if(r.f<=Math.max(5,n*.25)){rep(r1(tierW*.25));morale(2);}else if(r.dnf){morale(-5);rep(-.3);}else if(r.f>n*.7)morale(-3);
 const diff=rc.exp-r.f;if(!rc.oneoff&&G.car.tm&&G.car.tm!=="priv"){if(diff>=3)rel("t:"+G.car.tm,Math.min(5,Math.round(diff/2)));else if(diff<=-6)rel("t:"+G.car.tm,-2);}
 if(diff>=3)rel("cc",1);
 G.car.spons.forEach(sp=>{sp.sat=clamp(sp.sat+(r.f===1?8:r.f<=5?4:r.dnf?-4:r.f<=n/2?1:-2),0,100);});
 if(rc.oneoff&&myCar(rc).tm)rel("t:"+myCar(rc).tm,r.f<=5?5:r.dnf?-3:1);
 if(r.fl)G.fl.fl=(G.fl.fl||0)+1;
 seatTime(rc.type,.9+s.tier*.06);G.me.hp=clamp(G.me.hp-(rc.kind==="endur"?14:6)*(1.3-G.me.sk.fit/100),10,100);
 // rival tracking: who beat you most
 const ahead=res.filter(x=>x.f<r.f&&x.d!=="me").slice(-1)[0];if(ahead&&r.f<=4&&ahead.f===r.f-1&&G.D[ahead.d]){G.fl.lastRival=ahead.d;rel("d:"+ahead.d,-1);}
 checkAch();save();resultsScreen();}
function resultsScreen(){const rc=G.rc;if(!rc||!rc.res)return hub();const s=SER[rc.sid];const res=rc.res;const r=res.find(x=>x.d==="me");const st=G.S[rc.sid];
 let head="";if(r){head=r.f===1?`<p class="gold big">🏆 <b>YOU WIN ${rc.crown?"THE "+esc(rc.ev.toUpperCase()):""}!</b></p><p>${winLine(rc)}</p>`:r.dnf?`<p class="r big">DNF: ${esc(r.dnf)}. Classified ${ordinal(r.f)}.</p>`:`<p class="big">You finish <b>${ordinal(r.f)}</b>${r.st?` (started ${ordinal(r.st)})`:""}.</p>`;
  head+=`<p>${r.led?`Led ${r.led} laps. `:""}${r.fl?"Fastest lap. ":""}${!rc.oneoff&&!s.oneoff?`+${r.pts} points.`:""}</p>`;}
 const rows=res.slice(0,10).map(x=>({cells:[x.f,(x.d==="me"?`<b>${esc(G.me.name)}</b>`:esc(nm(x.d))),esc(x.tmn||tn(x.tm)),x.st||"-",x.dnf?`<span class="r">${esc(x.dnf)}</span>`:(x.led?x.led+" led":"")+(x.fl?" FL":"")],hl:x.d==="me"}));
 if(r&&r.f>10)rows.push({cells:[r.f,`<b>${esc(G.me.name)}</b>`,esc(r.tmn||tn(r.tm)),r.st||"-",r.dnf||""],hl:true});
 let stand="";if(!s.oneoff){const sr=standings(rc.sid);const top=sr.slice(0,10);const mi=sr.findIndex(x=>x.id==="me");
  const srows=top.map((x,i)=>({cells:[i+1,x.id==="me"?`<b>${esc(G.me.name)}</b>`:esc(nm(x.id)),x.p,x.w,x.t5],hl:x.id==="me"}));if(mi>=10)srows.push({cells:[mi+1,`<b>${esc(G.me.name)}</b>`,sr[mi].p,sr[mi].w,sr[mi].t5],hl:true});
  stand=`<h3>${esc(s.sh)} standings${st.chase?" (Chase)":""} after round ${st.res.length}</h3>${table(["Pos","Driver","Pts","W","T5"],srows)}`;}
 show(`<div class="eyebrow">RESULTS · ${esc(rc.ev.toUpperCase())}</div>${head}${efxHtml()}${table(["Pos","Driver","Team","Start",""],rows)}${stand}`,[
  {t:"Continue",cls:"hi",f:afterRace},{t:"Full results",f:()=>fullResults(afterRace)}]);}
function winLine(rc){const k=rc.kind;return esc(R.pick(k==="ss"?["You dodge the chaos and win the drag race to the line!","A perfect push from behind and you're in Victory Lane."]:k==="dirt"?["You slide the leader with two to go and never look back.","Wire to wire on a slick track. A clinic."]:k==="open"?["Lights to flag. Champagne time.","The undercut works perfectly and you take the win."]:k==="kart"?["Bumper to bumper for the whole final, and you take it at the line.","You hold the inside line and the win is yours."]:k==="endur"?["Hours of racing, decided by a perfect final stint.","You take the checkered flag after an endurance epic."]:["Burnouts on the frontstretch!","You hold off the field on the last restart and win it!"]));}
function fullResults(back){const rc=G.rc;show(`<h2>Full results</h2>${table(["Pos","Driver","Team","#","St","Note"],rc.res.map(x=>({cells:[x.f,x.d==="me"?`<b>${esc(G.me.name)}</b>`:esc(nm(x.d)),esc(x.tmn||tn(x.tm)),esc(String(x.num||"")),x.st||"-",x.dnf?esc(x.dnf):x.led?x.led+" led":""],hl:x.d==="me"})))}`,[{t:"Back",cls:"hi",f:resultsScreen}]);}
function afterRace(){const rc=G.rc;if(rc)rc.phase="done";G.rc=null;G.fl.raced=1;
 if((myEvent()||myOneoff())&&canDrive()){save();return hub();}
 endWeekCore();continuePending();}
/* ---------- drag racing ---------- */
function dragStart(){const rc=G.rc;const me=myCar(rc);rc.drag={stage:"q",round:0,bracket:null,out:[]};dragCard();}
function dragCard(){const rc=G.rc;const D=rc.drag;const me=myCar(rc);
 if(D.stage==="q")return show(`<h2>Qualifying passes</h2><p>The top 16 make the elimination ladder. Your tune decides how hard the car leans on the track.</p>`,[
  {t:"Conservative tune",sub:"Make a clean pass",f:()=>dragQual({agg:0})},{t:"Aggressive tune",sub:"Quicker if it hooks up, smoke if it doesn't",f:()=>dragQual({agg:1})}]);
 if(D.stage==="r"){const opp=D.opp;const names=["Round 1","Quarterfinals","Semifinals","Final"];
  return show(`<h2>${names[D.round]||"Elimination"}</h2><p>You face <b>${esc(nm(opp.d))}</b> (qualified ${ordinal(opp.start)}).</p>`,[
   {t:"Normal leave, safe tune",f:()=>dragRound({agg:0},{})},{t:"Aggressive leave, safe tune",sub:"Better reaction, red-light risk",f:()=>dragRound({agg:0},{agg:1})},{t:"Normal leave, aggressive tune",sub:"Smoke risk",f:()=>dragRound({agg:1},{})},{t:"Cut a light (deep stage)",sub:"Slower reaction, almost no red light",f:()=>dragRound({agg:0},{safe:1})}]);}
 finishDrag();}
function dragQual(tune){const rc=G.rc;const D=rc.drag;rc.cars.forEach(c=>{c.qet=dragET(c,rc,c.d==="me"?tune:null);});const q=rc.cars.slice().sort((a,b)=>a.qet-b.qet);q.forEach((c,i)=>c.start=i+1);const me=myCar(rc);
 const BK=dragBracket(q.length);D.field=q.slice(0,BK).map(c=>c.d);D.qorder=q.map(c=>c.d);D.out=[];
 if(me.start>BK){D.stage="done";D.dnq=1;return show(`<h2>DNQ</h2><p>Your best pass of ${me.qet.toFixed(3)} seconds is only good for ${ordinal(me.start)}. You miss the show.</p>`,[{t:"Continue",cls:"hi",f:finishDrag}]);}
 D.stage="r";D.round=0;D.alive=D.field.slice();dragPair();show(`<h2>Qualified ${ordinal(me.start)}</h2><p>Best pass: ${me.qet.toFixed(3)} seconds${me.smoke?" (it smoked the tires on the other run)":""}.</p>`,[{t:"To eliminations",cls:"hi",f:dragCard}]);}
function dragPair(){const rc=G.rc,D=rc.drag;const al=D.alive;const i=al.indexOf("me");const j=al.length-1-i;D.opp=rc.cars.find(c=>c.d===al[j]);}
function dragRound(tune,launch){const rc=G.rc,D=rc.drag;const al=D.alive;const next=[];let mine="";
 for(let i=0;i<al.length/2;i++){const a=rc.cars.find(c=>c.d===al[i]),b=rc.cars.find(c=>c.d===al[al.length-1-i]);const w=dragDuel(a,b,(a.d==="me"||b.d==="me")?tune:null,(a.d==="me"||b.d==="me")?launch:null);next.push(w.d);D.out.unshift(w===a?b.d:a.d);
  if(a.d==="me"||b.d==="me"){const me=a.d==="me"?a:b,op=a.d==="me"?b:a;mine=`<p>Reaction ${me.last.rt<0?"<b class='r'>RED LIGHT</b>":me.last.rt.toFixed(3)} · ${me.last.sm?"tires smoked, ":""}${me.last.et.toFixed(3)} s vs ${esc(nm(op.d))}: ${op.last.rt<0?"red light":op.last.rt.toFixed(3)} · ${op.last.et.toFixed(3)} s</p>`+(w===me?`<p class="g"><b>You win the round!</b></p>`:`<p class="r"><b>You lose the round.</b></p>`);}}
 // keep order seeded
 D.alive=al.filter(id=>next.indexOf(id)>=0);D.round++;
 if(D.alive.indexOf("me")<0||D.alive.length===1){while(D.alive.length>1){const nx=[];const a2=D.alive;for(let i=0;i<a2.length/2;i++){const a=rc.cars.find(c=>c.d===a2[i]),b=rc.cars.find(c=>c.d===a2[a2.length-1-i]);const w=dragDuel(a,b,null,null);nx.push(w.d);D.out.unshift(w===a?b.d:a.d);}D.alive=a2.filter(id=>nx.indexOf(id)>=0);}D.stage="done";return show(`<h2>Eliminations</h2>${mine}`,[{t:"Results",cls:"hi",f:finishDrag}]);}
 dragPair();show(`<h2>Eliminations</h2>${mine}`,[{t:"Next round",cls:"hi",f:dragCard}]);}
function finishDrag(){const rc=G.rc,D=rc.drag;let order;if(D.dnq)order=D.qorder.slice();else{order=[D.alive[0]].concat(D.out);const rest=D.qorder.filter(id=>order.indexOf(id)<0);order=order.concat(rest);}
 const res=order.map((id,i)=>{const c=rc.cars.find(x=>x.d===id);return {d:id,tm:c.tm,num:c.num,st:c.start,f:i+1,dnf:"",led:0,fl:0,ml:0,stg:0,pen:0,tmn:c.tmn};});applyMine(res);}
