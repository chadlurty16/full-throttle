/* ===================== SEASON LOOP, HUB & WEEKLY ACTIVITIES ===================== */
function addNews(t,mine){G.news.unshift({yr:G.yr,wk:G.wk,t,m:mine?1:0});if(G.news.length>160)G.news.length=160;}
function myEvent(){const sid=G.car.s;if(!sid||G.car.role!=="race")return null;const st=G.S[sid];const s=SER[sid];if(!st||st.ci>=s.cal.length)return null;const c=s.cal[st.ci];if(c[1]!==G.wk)return null;return {sid,ci:st.ci};}
function myOneoff(){return (G.car.oneoffs||[]).find(o=>{const c=SER[o.s].cal[o.ci];return c&&c[1]===G.wk&&!o.done;})||null;}
function canDrive(){return !G.me.inj&&!G.me.retired&&!G.car.sit;}
function nextEvent(sid){sid=sid||G.car.s;if(!sid)return null;const st=G.S[sid],s=SER[sid];if(!st||st.ci>=s.cal.length)return null;return {ci:st.ci,c:s.cal[st.ci]};}
function seasonOver(sid){sid=sid||G.car.s;return !sid||G.S[sid].done||G.S[sid].ci>=SER[sid].cal.length;}
function offseason(){return G.wk>=46||seasonOver();}
function apMax(){return offseason()?3:2;}
/* ---------- the dashboard ---------- */
function hub(){if(G.over)return endScreen();if(G.rc&&G.rc.phase&&G.rc.phase!=="done")return resumeRace();if(G.pending.length)return continuePending();
 const m=G.me,c=G.car,s=c.s?SER[c.s]:null;const ev=myEvent(),oo=myOneoff();const nx=nextEvent();
 const notes=G.notes.splice(0);
 let hero="";if(s){const t=G.TM[c.tm];const pos=champPos(c.s,"me");const tab=G.S[c.s].tab.me||{};
  hero=`<div class="hero"><div class="eyebrow">${esc(s.n.toUpperCase())}${c.role==="reserve"?" · RESERVE / TEST DRIVER":""}</div><div class="hero-t">#${c.role==="race"&&t?esc(String((t.cars.find(x=>x.d==="me")||{num:m.num}).num)):m.num} ${esc(tn(c.tm))}</div>
  <div class="hero-s">${t&&t.mfr?esc(t.mfr)+" · ":""}Car rating <b>${Math.round(myQ(c.tm))}</b> · ${c.con?`Contract through <b>${c.con.end}</b>${c.con.sal?` · ${money(c.con.sal)}/yr`:""}${c.con.pay?` · paying ${money(c.con.pay)}/yr`:""}`:"No contract"}${c.cc?` · ${s.disc==="open"||s.disc==="sports"?"Race engineer":"Crew chief"}: ${esc(c.cc)}`:""}</div></div>`;
  hero+=tiles([{l:"Overall",v:rb(OVR()),h:DISC_N[s.disc]},{l:"Championship",v:pos?ordinal(pos):"-",h:`${tab.p||0} pts`},{l:"Season",v:`${tab.w||0} W · ${tab.t5||0} T5`,sm:1,h:`${tab.st||0} starts · ${tab.pol||0} poles`},{l:"Cash",v:money(m.cash),sm:1,h:m.agent?"Agent: "+esc(m.agent.n):""},{l:"Reputation",v:Math.round(m.rep),h:"Fame "+Math.round(m.fame)},{l:"Health",v:Math.round(m.hp),h:m.inj?esc(m.inj.n):"Morale "+Math.round(m.mor)}]);}
 else hero=`<div class="hero"><div class="eyebrow">${m.retired?"RETIRED DRIVER":"FREE AGENT"}</div><div class="hero-t">${m.retired?"Life after driving":"Looking for a ride"}</div><div class="hero-s">${m.retired?"You can still run your teams, or close the book on your career.":"No seat right now. Check offers, buy a ride, or run your own car."}</div></div>`+tiles([{l:"Overall",v:rb(OVR())},{l:"Cash",v:money(m.cash),sm:1},{l:"Reputation",v:Math.round(m.rep)},{l:"Age",v:m.age}]);
 let agenda=`<div class="agenda">`;
 if(ev)agenda+=`<div>🏁 <b>Race week:</b> ${esc(evName(ev.sid,ev.ci))} at ${esc(tkn(SER[ev.sid].cal[ev.ci][0]))} (${TTYPE_N[tkt(SER[ev.sid].cal[ev.ci][0])]})${isCrown(ev.sid,ev.ci)?" 👑 crown jewel":""}${canDrive()?"":` <span class="r">You can't drive: ${m.inj?"injured":"sitting out"}</span>`}</div>`;
 else if(nx)agenda+=`<div>📅 Next: ${esc(evName(c.s,nx.ci))} at ${esc(tkn(nx.c[0]))} on ${wkDate(nx.c[1])} (${plural(nx.c[1]-G.wk,"week")})</div>`;
 else if(s)agenda+=`<div>🏆 Your ${esc(s.sh)} season is complete. ${champPos(c.s,"me")?"You finished "+ordinal(champPos(c.s,"me"))+".":""}</div>`;
 if(oo)agenda+=`<div>⭐ One-off this week: ${esc(evName(oo.s,oo.ci))}</div>`;
 const offers=G.offers.filter(o=>o.exp>=G.yr*52+G.wk);if(offers.length)agenda+=`<div>📄 You have <b>${offers.length}</b> contract offer${offers.length>1?"s":""} waiting.</div>`;
 if(c.next)agenda+=`<div>✍️ Signed for ${c.next.start}: ${esc(SER[c.next.s].sh)} with ${esc(tn(c.next.tm))}.</div>`;
 else if(c.con&&c.con.end===G.yr&&G.wk>=24&&!m.retired)agenda+=`<div>⏳ Your deal ends after this season. Silly season is on.</div>`;
 (G.own||[]).forEach(o=>{agenda+=`<div>🏢 Team owner: <b>${esc(o.n)}</b> (${esc(SER[o.s].sh)}) · ${money(o.cash)}</div>`;});
 agenda+=`<div>⚡ Action points this week: <b>${c.ap}</b></div></div>`;
 const goal=goalLine();
 const ch=[];
 ch.push({sec:"THIS WEEK"});
 if(c.ap>0&&!m.retired)ch.push({t:"Train, test &amp; promote",sub:`Spend action points (${c.ap} left)`,icon:"💪",f:activities});
 if(ev&&canDrive()&&!G.fl.raced)ch.push({t:`<b>Race weekend: ${esc(evName(ev.sid,ev.ci))}</b>`,sub:`${esc(tkn(SER[ev.sid].cal[ev.ci][0]))} · ${G.set.quick?"quick sim":"practice, qualifying, race"}`,icon:"🏁",cls:"hi",f:()=>raceWeekend(ev.sid,ev.ci,null)});
 else if(oo&&canDrive()&&!oo.done)ch.push({t:`<b>One-off: ${esc(evName(oo.s,oo.ci))}</b>`,sub:esc(tkn(SER[oo.s].cal[oo.ci][0])),icon:"⭐",cls:"hi",f:()=>raceWeekend(oo.s,oo.ci,oo)});
 else ch.push({t:"Advance to next week",sub:ev&&!canDrive()?"A substitute drives your car this weekend":nx?`${plural(Math.max(0,nx.c[1]-G.wk),"week")} to the next race`:"",icon:"⏭️",cls:"hi",f:advanceWeek});
 if(!ev&&!oo&&nx&&nx.c[1]-G.wk>1)ch.push({t:"Skip ahead to the next race week",sub:"Auto-plans your weeks (sim work and fitness)",icon:"⏩",f:()=>skipToRace()});
 ch.push({sec:"CAREER"});
 ch.push({t:`Contracts &amp; offers${offers.length?` <span class="pill y">${offers.length}</span>`:""}`,icon:"📄",tile:1,f:offersScreen});
 ch.push({t:"Standings",icon:"🏆",tile:1,f:()=>standingsScreen(c.s||lastSeries())});
 ch.push({t:"Career stats",icon:"📊",tile:1,f:careerScreen});
 ch.push({t:"Driver ratings",icon:"📈",tile:1,f:ratingsScreen});
 ch.push({t:"Calendar",icon:"📅",tile:1,f:()=>calendarScreen(c.s||lastSeries())});
 ch.push({t:"One-off races",icon:"⭐",tile:1,f:oneoffScreen});
 ch.push({t:"News &amp; rumors",icon:"📰",tile:1,f:newsScreen});
 ch.push({t:"Relationships",icon:"🤝",tile:1,f:relScreen});
 ch.push({t:"Series &amp; teams",icon:"🌍",tile:1,f:seriesBrowser});
 ch.push({t:"Team ownership",icon:"🏢",tile:1,f:ownerHub});
 ch.push({sec:"OTHER"});
 ch.push({t:"Settings &amp; save",icon:"⚙️",tile:1,f:settingsScreen});
 ch.push({t:m.retired?"Close the book on your career":"Retire from driving",icon:"🏳️",tile:1,f:retireMenu});
 show(`${notes.length?notes.map(n=>note(n,"good")).join(""):""}${hero}${agenda}${goal?`<div class="obj">🎯 ${goal}</div>`:""}`,ch);}
function lastSeries(){const r=G.st.races[G.st.races.length-1];return r?r.s:"cup";}
function goalLine(){const m=G.me,c=G.car;if(m.retired)return "";if(!c.s)return "Find a ride: check Contracts &amp; offers, or run your own car in a grassroots series.";const s=SER[c.s];
 const nxt=(NEXT[c.s]||[]).map(id=>SER[id].sh).slice(0,3).join(", ");
 if(s.id==="f1")return "You made it to Formula 1. Win races, win titles, become a legend.";
 if(s.tier>=9)return `You're at the top of ${esc(LADDERS[s.lad]||"the sport")}. Win the big ones: ${s.cal.filter(x=>x[3]).map(x=>esc(x[2])).join(", ")||"the championship"}.`;
 if(s.lad==="open-eu"&&s.tier>=6)return `Formula 1 needs 40 superlicense points over 3 seasons (you have ${slpTotal()}) and a team that wants you.`;
 return `Finish near the front in ${esc(s.sh)} to earn offers from ${esc(nxt||"higher series")}. Teams look at results, your rating, reputation and sponsor appeal.`;}
/* ---------- weekly activities ---------- */
function testCost(){const s=G.car.s?SER[G.car.s]:null;if(!s)return 800;if(G.car.tm==="priv")return Math.round(s.cost/s.cal.length*.5);return 0;}
function coachCost(){const s=G.car.s?SER[G.car.s]:null;const t=s?s.tier:1;return [0,300,500,900,1500,3000,5000,8000,10000,12000,15000][t]||500;}
function activities(){const c=G.car,m=G.me;const s=c.s?SER[c.s]:null;const priv=c.tm==="priv";const testOk=!!s&&(priv||!G.fl.testWk||G.yr*52+G.wk-G.fl.testWk>=4)&&!m.inj;
 const ch=[
  {t:"Fitness training",sub:"+Fitness, +health. Endurance races and hot days punish the unfit.",icon:"🏋️",f:()=>act("fit")},
  {t:"Sim racing session",sub:`+Qualifying, consistency and a track skill${m.sim?" (rig level "+m.sim+")":""}`,icon:"🎮",f:()=>act("sim")},
  s?{t:"Private test day",sub:priv?`Costs ${money(testCost())}. +Setup for your next race, +feedback, +speed`:"Team test (once every 4 weeks). +Setup for your next race, +feedback",icon:"🔧",dis:!testOk&&(m.inj?"You're injured":"Your team won't run another test yet"),f:()=>act("test")}:null,
  {t:"Driver coaching",sub:`${money(coachCost())}. Pick a skill to work on with a coach`,icon:"🧑‍🏫",dis:m.cash<coachCost()&&"Not enough cash",f:coachMenu},
  {t:"Hunt for sponsors",sub:"Make calls, send proposals, shake hands. Better with fame, results and media skill",icon:"💼",f:()=>act("spons")},
  {t:"Media & fan engagement",sub:"+Fame, +media skill, keeps sponsors happy",icon:"🎙️",f:()=>act("media")},
  {t:"Study data & onboard video",sub:"+Racecraft, +consistency, a small setup edge",icon:"📼",f:()=>act("study")},
  {t:"Network in the paddock",sub:"Meet team owners and managers in bigger series",icon:"🤝",f:()=>act("net")},
  priv?{t:"Work on your own car",sub:"+Car rating (slowly) and +mechanical feedback",icon:"🛠️",f:()=>act("car")}:null,
  (m.age<26||m.cash<5000)?{t:"Work a side job",sub:`Earn about ${money(sideJobPay())}`,icon:"🧰",f:()=>act("job")}:null,
  {t:"Rest & recover",sub:"+Health, +morale",icon:"🛌",f:()=>act("rest")},
  priv?{t:"Buy equipment upgrades",sub:"Spend money to make your car faster",icon:"🛒",f:upgradeMenu}:null,
  m.sim<3?{t:`Buy a better sim rig (level ${m.sim+1})`,sub:`${money([3000,15000,60000][m.sim])}. Sim sessions become more effective. No action point needed`,icon:"🖥️",dis:m.cash<[3000,15000,60000][m.sim]&&"Not enough cash",f:()=>{EFX=[];spend([3000,15000,60000][m.sim],"Sim rig");m.sim++;show(`<h2>New sim rig</h2><p>Direct-drive wheel, load-cell pedals and a laser-scanned track library.</p>${efxHtml()}`,[{t:"Back",cls:"hi",f:activities}]);}}:null,
  {t:"Back",cls:"hi",f:hub}];
 show(`<h2>This week</h2><p>You have <b>${c.ap}</b> action point${c.ap===1?"":"s"} left. Growth is slower as you approach your natural ceiling, and much slower after your mid-20s.</p>${statGrid()}`,ch.map(x=>x&&x.f!==hub&&!/sim rig/.test(x.t||"")&&x.f!==upgradeMenu?Object.assign(x,{dis:x.dis||(c.ap<=0&&"No action points left")}):x));}
function sideJobPay(){const a=G.me.age;return a<16?200:a<18?350:a<22?600:800;}
function act(k){const m=G.me,c=G.car;EFX=[];if(c.ap<=0)return hub();c.ap--;let txt="";const s=c.s?SER[c.s]:null;
 if(k==="fit"){gainSk("fit",.75);m.hp=clamp(m.hp+6,0,100);txt=R.pick(["Intervals on the bike, neck harness work, heat training in a sauna suit.","Five a.m. runs and an hour of core work. Your trainer is not impressed yet.","Reaction drills, grip strength and a long cardio session."]);}
 else if(k==="sim"){const b=1+m.sim*.25;gainSk("qul",.28*b);gainSk("con",.2*b);const tt=nextEvent()?tkt(nextEvent().c[0]):"road";const map={ss:"drf",int:"ovl",sht:"sht",dirt:"drt",road:"rdc",street:"rdc",kart:"rdc",drag:"qul"};gainSk(map[tt]||"rdc",.32*b);G.fl.simPrep=1;txt=`Three hours of laps${nextEvent()?" at a laser-scanned "+esc(tkn(nextEvent().c[0])):""}. Braking markers memorized.`;}
 else if(k==="test"){const cost=testCost();if(cost){if(m.cash<cost){c.ap++;return show(`<p>You can't afford a test day (${money(cost)}).</p>`,[{t:"Back",f:activities}]);}spend(cost,"Test day");}G.fl.testWk=G.yr*52+G.wk;c.testB=clamp((c.testB||0)+1.2+m.sk.fbk/80,0,3);gainSk("fbk",.4);gainSk("spd",.2);rel("cc",2);txt="A full day of runs: springs, shocks, aero balance, tire pressures. You find something.";}
 else if(k==="spons"){const chance=.15+m.sk.med/250+m.fame/250+(m.rep/400);if(R.chance(chance)){const sp=newSponsorOffer();return sponsorOfferScreen(sp);}gainSk("med",.15);txt=R.pick(["Twenty calls, two callbacks, zero deals. Next week.","A promising lunch meeting ends with \"let's circle back after the season.\"","You email forty companies. One replies with a coupon."]);}
 else if(k==="media"){gainSk("med",.35);fame(R.f(.4,1.2)|0||1);rel("media",2);c.spons.forEach(sp=>sp.sat=clamp(sp.sat+4,0,100));txt=R.pick(["A podcast, a fan Q&amp;A and a signing session at a dealership.","You film a sponsor video and do a live stream from your sim rig.","Local TV runs a feature on you. Your mom records it twice."]);}
 else if(k==="study"){gainSk("crf",.25);gainSk("con",.2);c.testB=clamp((c.testB||0)+.4,0,3);txt="Hours of onboard video and data overlays. You spot where the fast guys roll more speed.";}
 else if(k==="net"){const tgt=networkTarget();if(tgt){rel("t:"+tgt,R.int(4,8));if(R.chance(.18+m.rep/300)){G.fl.netOffer=tgt;txt=`You spend an evening talking racing with ${esc(towner(tgt))} of ${esc(tn(tgt))}. They ask for your number.`;if(R.chance(.5))later("net_callback",R.int(2,5),{tm:tgt});}else txt=`You introduce yourself to people at ${esc(tn(tgt))}. Faces will remember you.`;}else txt="The paddock is quiet this week.";rep(.5);}
 else if(k==="car"){const t=G.TM.priv;const cap=SER[t.s].ql+14;if(t.q<cap){t.q=r1(t.q+R.f(.3,.8));EFX.push(["Car rating",.5]);}gainSk("fbk",.35);txt="Late nights in the garage: scaling, bump steer, a fresh set of shocks.";}
 else if(k==="job"){const p=sideJobPay();earn(p,"Side job");morale(-2);txt=R.pick(["Tire shop shifts. You learn more about tires than you expected.","Fabrication work at a chassis builder.","Delivering pizzas in your own car. Not the car you want to be driving."]);}
 else if(k==="rest"){m.hp=clamp(m.hp+15,0,100);morale(6);txt="Sleep, family dinner, a day on the lake. You come back sharper.";}
 show(`<h2>${{fit:"Fitness training",sim:"Sim session",test:"Test day",spons:"Sponsor hunting",media:"Media & fans",study:"Data study",net:"Networking",car:"Garage night",job:"Side job",rest:"Rest day"}[k]}</h2><p>${txt}</p>${efxHtml()}`,[c.ap>0?{t:"Do something else",f:activities}:null,{t:"Back to the dashboard",cls:"hi",f:hub}]);}
function networkTarget(){const c=G.car;const ids=[];const tiers=c.s?SER[c.s].tier:1;Object.values(G.TM).forEach(t=>{if(t.priv||t.own)return;const s=SER[t.s];if(s.tier>tiers&&s.tier<=tiers+3&&(s.lad===(c.s?SER[c.s].lad:s.lad)||R.chance(.3)))ids.push(t.id);});return ids.length?R.pick(ids):null;}
function coachMenu(){const groups=[["Racecraft & overtaking",["crf","ovt","dfd"]],["Qualifying & raw speed",["qul","spd"]],["Ovals & drafting",["ovl","drf","sht"]],["Road & street courses",["rdc","wet"]],["Dirt",["drt","crf"]],["Tires & consistency",["tir","con"]],["Media training",["med"]]];
 show(`<h2>Driver coaching</h2><p>A session costs ${money(coachCost())}.</p>`,groups.map(g=>({t:g[0],sub:g[1].map(k=>SKN[k]+" "+Math.round(G.me.sk[k])).join(" · "),f:()=>{EFX=[];if(G.car.ap<=0)return hub();G.car.ap--;spend(coachCost(),"Coaching");g[1].forEach(k=>gainSk(k,.55));show(`<h2>Coaching</h2><p>Your coach breaks down every corner and every mistake. It's humbling, and it works.</p>${efxHtml()}`,[G.car.ap>0?{t:"Do something else",f:activities}:null,{t:"Back to the dashboard",cls:"hi",f:hub}]);}})).concat([{t:"Back",f:activities}]));}
function upgradeMenu(){const t=G.TM.priv;const s=SER[t.s];const cap=s.ql+16;const step=Math.round(s.cost*.12);
 show(`<h2>Equipment upgrades</h2><p>Your car rating is <b>${Math.round(t.q)}</b> (series average about ${s.ql}). Each upgrade costs ${money(step)}.</p>`,[
  {t:"Fresh engine / motor freshen",sub:"+2 car rating",dis:(m=>m.cash<step&&"Not enough cash")(G.me)||(t.q>=cap&&"You're at the top of what money can buy here"),f:()=>{EFX=[];spend(step,"Upgrade");t.q=Math.min(cap,t.q+2);EFX.push(["Car rating",2]);show(`<p>The new parts are on. It feels quicker already.</p>${efxHtml()}`,[{t:"Back",f:upgradeMenu}]);}},
  {t:"Back",cls:"hi",f:activities}]);}
function autoWeek(){const c=G.car;while(c.ap>0){c.ap--;EFX=[];if(G.me.hp<70){G.me.hp=clamp(G.me.hp+15,0,100);}else if(c.ap%2===0)gainSk("fit",.6,true);else{gainSk("qul",.2,true);gainSk("con",.15,true);}}EFX=[];}
function skipToRace(){let guard=0;while(guard++<60){autoWeek();const r=endWeekCore();if(G.pending.length||G.notes.length||myEvent()||myOneoff()||G.wk===0||r==="stop")break;}continuePending();}
/* ---------- week processing ---------- */
function advanceWeek(){const ev=myEvent();if(ev&&canDrive()&&!G.fl.raced)return raceWeekend(ev.sid,ev.ci,null);endWeekCore();continuePending();}
function endWeekCore(){const m=G.me,c=G.car;
 // simulate every other race held this week
 for(const s of SERIES_LIST){const st=G.S[s.id];if(!st)continue;if(s.oneoff){if(s.cal[0][1]===G.wk&&!(G.fl["oo_"+s.id]===G.yr))quickRace(s.id,0);continue;}
  while(st.ci<s.cal.length&&s.cal[st.ci][1]===G.wk){quickRace(s.id,st.ci);}}
 G.fl.raced=0;
 // money
 let inc=0;if(c.con&&!m.retired){if(c.con.sal)inc+=c.con.sal/52;}
 const bg=BGS[m.bg];let fam=bg[3];if(m.age>=23)fam*=.4;if(m.age>=27)fam=0;inc+=fam;
 c.spons.forEach(sp=>inc+=sp.amt/52);if(m.agent&&c.con&&c.con.sal)inc-=c.con.sal/52*m.agent.fee;
 if(m.age>=18)inc-=m.retired?400:250;if(G.car.dev&&G.car.dev.pay)inc+=G.car.dev.pay/52;
 m.cash+=inc;if(inc>0)m.earned+=Math.max(0,inc);
 // health & injuries
 if(m.inj){m.inj.w--;if(m.inj.w<=0){m.inj=null;G.notes.push("🩺 You're cleared to race again.");}}
 naturalGrowth();m.hp=clamp(m.hp+(m.inj?2:5),0,100);m.mor+= (60-m.mor)*.05;
 for(const id in G.D){const d=G.D[id];if(d.inj){d.inj.w--;if(d.inj.w<=0)delete d.inj;}}
 ownerWeekly();
 // calendar
 G.wk++;if(G.wk>=52)newYear();
 c.ap=apMax();
 sillyTicks();
 queueEvents();
 if(m.cash<-5000&&!G.fl.debtWk){G.fl.debtWk=1;queuePending("debt",{});}
 return null;}
/* ---------- new year ---------- */
function newYear(){const m=G.me;recordSeasons();
 G.yr++;G.wk=0;m.age++;
 // aging
 if(m.age>=32){const dec=(m.age-31)*.42*(hasTrait("iron")?.8:1);["spd","qul","fit","wet","ovt"].forEach(k=>{m.sk[k]=clamp(m.sk[k]-dec*R.f(.5,1.1),5,99);});if(m.age>=36)["con","crf","dfd","tir"].forEach(k=>m.sk[k]=clamp(m.sk[k]-dec*.45,5,99));}
 for(const id in G.D)developAI(G.D[id]);pruneWorld();
 for(const s of SERIES_LIST)resetSeriesState(s.id);
 G.offers=G.offers.filter(o=>o.exp>=G.yr*52);G.fl.cross=0;G.fl.sillyDone=0;G.fl.midOffers=0;G.fl.eosOffers=0;G.fl.raced=0;
 // contracts
 const c=G.car;if(c.dev&&c.dev.end<G.yr)c.dev=null;
 if(G.fl.nextPriv&&!c.next){const np=G.fl.nextPriv;G.fl.nextPriv=null;removeMe();joinPrivOrPay(np,false);G.me.disc=SER[np].disc;addNews(`${m.name} moves up to ${SER[np].n} with a self-funded car.`,true);}
 else if(c.next){applyContract(c.next);c.next=null;}
 else if(c.con&&c.con.end<G.yr){if(c.con.priv&&!m.retired){c.con.end=G.yr;}else expireContract();}
 if(c.con&&c.con.pay&&c.con.payYr!==G.yr&&!c.con.priv){spend(c.con.pay,"Ride payment");c.con.payYr=G.yr;}
 c.spons=c.spons.filter(sp=>{if(sp.sat<35){G.notes.push(`💸 ${esc(sp.n)} did not renew its sponsorship.`);return false;}sp.sat=clamp(sp.sat-10,0,100);return true;});
 c.oneoffs=[];ownerNewYear();
 if(c.s&&G.TM[c.tm]&&G.TM[c.tm].priv){const t=G.TM.priv;const s=SER[c.s];t.q=clamp(t.q-R.f(0,1.5),20,s.ql+16);}
 addNews(`The ${G.yr} season begins.`);
 if(G.fl.retireEoY&&!m.retired){G.fl.retireEoY=0;doRetire();if(!(G.own||[]).length)G.over=true;}
 if(!m.retired&&m.age>=58){doRetire();G.notes.push("🏳️ At 58, you finally hang up the helmet.");if(!(G.own||[]).length)G.over=true;}
 if(m.age>=40&&!m.retired&&!G.fl.bodyAsk){G.fl.bodyAsk=1;queuePending("body_says_no",{});}}
function recordSeasons(){const yr=G.yr;const bySer={};G.st.races.forEach(r=>{if(r.yr===yr){(bySer[r.s]=bySer[r.s]||[]).push(r);}});
 Object.keys(bySer).forEach(sid=>{const rs=bySer[sid];const s=SER[sid];const pos=s.oneoff?0:champPos(sid,"me");const t=G.S[sid].tab.me;
  G.st.seasons.push({yr,s:sid,tm:rs[rs.length-1].tmn||"",st:rs.length,w:rs.filter(r=>r.f===1).length,pd:rs.filter(r=>r.f<=3).length,t5:rs.filter(r=>r.f<=5).length,t10:rs.filter(r=>r.f<=10).length,pol:rs.filter(r=>r.st===1).length,led:sum(rs.map(r=>r.led)),fl:rs.filter(r=>r.fl).length,dnf:rs.filter(r=>r.dnf).length,as:r1(avg(rs.map(r=>r.st))),af:r1(avg(rs.map(r=>r.f))),p:t?t.p:sum(rs.map(r=>r.pts||0)),pos,ch:pos===1&&G.S[sid].done?1:0,oo:rs.every(r=>r.oo)?1:0});});}
function developAI(d){if(d.ret)return;const a=G.yr-d.by;let ch=0;if(a<24)ch=Math.max(0,(d.pot-d.o))*R.f(.12,.35);else if(a<31)ch=R.f(-1,1.3)+(d.pot>d.o?.5:0);else if(a<35)ch=R.f(-1.5,.6);else ch=-R.f(.8,2.8)*(a>=39?1.5:1);d.o=clamp(r1(d.o+ch),15,98);}

function pruneWorld(){for(const id in G.D){const d=G.D[id];if(d.r||d.tm)continue;const keep=G.rel["d:"+id]||(G.car.oneoffs||[]).some(o=>o.d===id)||G.fl.prodigy===id;if(keep)continue;if((d.ret&&G.yr-d.ret>=2)||(!d.ret&&G.yr-d.by>34&&d.c.st===0))delete G.D[id];}G.rumors=G.rumors.filter(r=>!r.d||G.D[r.d]);}
