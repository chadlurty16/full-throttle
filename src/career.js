/* ===================== CAREER: offers, contracts, silly season, one-offs ===================== */
function absWk(){return G.yr*52+G.wk;}
function primarySeasonPerf(){// most relevant recent full-time results
 let best=null;const cur=G.car.s&&!SER[G.car.s].oneoff?G.car.s:null;
 if(cur){const t=G.S[cur].tab.me;if(t&&t.st>=3){const n=Math.max(2,entries(cur).length);best={s:cur,pos:champPos(cur,"me"),n,w:t.w,st:t.st,t5:t.t5,ch:G.S[cur].done&&champPos(cur,"me")===1};}}
 if(!best){const ss=G.st.seasons.filter(x=>!x.oo&&x.yr>=G.yr-2).sort((a,b)=>b.yr-a.yr);if(ss[0]){const x=ss[0];best={s:x.s,pos:x.pos||Math.round(SER[x.s].field/2),n:SER[x.s].field,w:x.w,st:x.st,t5:x.t5,ch:x.ch};}}
 return best;}
function myStock(sid){const s=SER[sid];const m=G.me;let v=OVR(s.disc);const p=primarySeasonPerf();
 if(p){const pct=p.n>1?1-(p.pos-1)/(p.n-1):.5;let b=(pct-.5)*16+Math.min(p.w,6)*1.2+(p.ch?5:0)+Math.min(p.t5,10)*.2;const gap=s.tier-SER[p.s].tier;if(gap>2){b*=.5;b-=(gap-2)*3.5;}else if(gap<=0)b*=1.15;
  if(SER[p.s].disc!==s.disc)b*=.7;v+=b;}else v-=4;
 v+=(m.rep-30)*.12+(m.sk.med-50)*.04;if(m.age<=21&&s.tier<=8)v+=2;if(m.age>=34)v-=(m.age-33)*1.2;
 if(G.car.dev&&G.car.dev.org&&G.TM[G.car.dev.org]&&G.TM[G.car.dev.org].s===sid)v+=3;
 return v;}
function teamNeed(t){const s=SER[t.s];return s.lvl-4+(t.q-s.ql)*.6;}
function licenseBlock(sid){const s=SER[sid];if(G.me.age<s.age)return `Minimum age ${s.age}`;if(s.maxAge&&G.me.age>s.maxAge)return `Age limit ${s.maxAge}`;
 if(s.lic==="slp"&&slpTotal()<40)return `Superlicense needs 40 points over three seasons (you have ${slpTotal()})`;return "";}
function salFor(s,frac){if(!s.sal[1])return 0;return Math.round((s.sal[0]+(s.sal[1]-s.sal[0])*Math.pow(clamp(frac,0,1),2.2))/1000)*1000;}
function startYrFor(){if(!G.car.s||!G.car.con)return G.wk<40?G.yr:G.yr+1;if(G.car.con.end>G.yr)return G.car.con.end+1>G.yr+1?G.yr+1:G.yr+1;return G.wk>=8||seasonOver()?G.yr+1:G.yr;}
function mkOffer(t,role,o){const s=SER[t.s];const st=myStock(t.s);const need=teamNeed(t);const marg=st-need;const frac=marg/15+(t.q-s.ql)/30+.2;
 const off=Object.assign({id:"o"+(G.nid++),tm:t.id,s:t.s,role,yrs:s.tier>=8?R.int(1,3):R.int(1,2),sal:role==="race"?salFor(s,frac):Math.round(s.sal[0]*.15/1000)*1000,win:s.tier>=5?Math.round(s.sal[0]*.04/1000)*1000:0,spon:R.int(1,3),rel:0,n1:false,side:s.tier<9,pay:0,start:startYrFor(),int:clamp(Math.round(55+marg*3+relOf("t:"+t.id)/4+(G.me.agent?8:0)),20,95),asks:0,exp:absWk()+R.int(3,6)},o||{});
 if(off.start>G.yr&&G.wk<44)off.exp=Math.max(off.exp,absWk()+R.int(4,8));return off;}
function generateOffers(kind){const m=G.me;if(m.retired)return 0;const cur=G.car.s;const out=[];
 const targets=new Set();if(cur&&!SER[cur].oneoff){targets.add(cur);(NEXT[cur]||[]).forEach(x=>targets.add(x));}
 else{const p=primarySeasonPerf();const base=p?p.s:lastSeries();targets.add(base);(NEXT[base]||[]).forEach(x=>targets.add(x));}
 // occasional cross-discipline interest at a similar level
 const tierNow=cur?SER[cur].tier:3;SERIES_LIST.forEach(s=>{if(!s.oneoff&&!targets.has(s.id)&&Math.abs(s.tier-tierNow)<=1&&R.chance(.12))targets.add(s.id);});
 [...targets].forEach(sid=>{const s=SER[sid];if(s.oneoff||licenseBlock(sid)&&!/Superlicense/.test(licenseBlock(sid)))return;
  const st=myStock(sid);teamsOf(sid).filter(t=>!t.priv&&!t.own&&t.id!==G.car.tm).forEach(t=>{if(isPriv(sid)&&s.tier<=2)return;
   const need=teamNeed(t);const roll=st+R.gauss()*2.5+(kind==="mid"?-2:0)+(G.me.agent?1.5:0);
   const weak=t.cars.some(c=>!c.d||(G.D[c.d]&&(G.D[c.d].cy<=1||G.D[c.d].o<st-2)));
   if(roll>=need&&weak&&R.chance(s.tier>=9?.35:.45))out.push(mkOffer(t,"race"));
   else if(s.cost>0&&roll>=s.lvl-13&&t.q<=s.ql+2&&R.chance(.18)&&kind!=="mid"){const pay=Math.round(s.cost*clamp(.65+(need-roll)/30,.5,1.3)/1000)*1000;out.push(mkOffer(t,"race",{pay,sal:0,win:0,int:60}));}
   else if(s.tier>=8&&roll>=need-7&&R.chance(.08)&&kind!=="mid"&&["f1","fe","wec","indycar","imsagtp","cup"].indexOf(sid)>=0){out.push(mkOffer(t,sid==="cup"?"dev":"reserve",{yrs:1,n1:false,side:true}));}});});
 // current team re-sign
 if(cur&&G.car.tm&&G.car.tm!=="priv"&&G.car.con&&G.car.con.end===G.yr&&!G.car.next&&kind!=="mid"){const t=G.TM[G.car.tm];if(t&&!t.own&&relOf("t:"+t.id)>-25&&myStock(cur)>=teamNeed(t)-5)out.push(mkOffer(t,"race",{note:"Your current team wants to keep you.",int:70}));}
 // dedupe by team, keep best few
 const by={};out.forEach(o=>{if(!by[o.tm]||by[o.tm].role!=="race")by[o.tm]=o;});let list=Object.values(by).sort((a,b)=>SER[b.s].tier-SER[a.s].tier||b.sal-a.sal);
 list=list.slice(0,kind==="mid"?2:5);list.forEach(o=>{if(!G.offers.some(x=>x.tm===o.tm&&x.s===o.s))G.offers.push(o);});
 if(list.length){G.notes.push(`📄 ${list.length} new contract offer${list.length>1?"s":""}: ${list.map(o=>esc(tn(o.tm))+" ("+esc(SER[o.s].sh)+")").join(", ")}.`);}
 return list.length;}
/* ---------- signing ---------- */
function signContract(con){const s=SER[con.s];con.end=con.end||((con.start||G.yr)+con.yrs-1);con.start=con.start||G.yr;
 if(con.pay&&con.start===G.yr){spend(con.pay,"Ride payment");con.payYr=G.yr;}
 G.offers=G.offers.filter(o=>o.tm!==con.tm);
 if(con.start>G.yr){G.car.next=con;addNews(`${G.me.name} signs with ${tn(con.tm)} for the ${con.start} ${SER[con.s].sh} season.`,true);return;}
 applyContract(con);}
function removeMe(){for(const id in G.TM){const t=G.TM[id];t.cars.forEach(c=>{if(c.d==="me")c.d=null;});if(t.priv&&t.cars.every(c=>!c.d))t.cars=[];}}
function ensureSlot(tid){const t=G.TM[tid];if(!t)return null;let slot=t.cars.find(c=>!c.d);if(slot)return slot;if(!t.cars.length){const c={num:G.me.num,d:null};t.cars.push(c);return c;}
 const cand=t.cars.filter(c=>c.d!=="me").sort((a,b)=>(G.D[a.d]?G.D[a.d].o:0)-(G.D[b.d]?G.D[b.d].o:0))[0];if(!cand)return null;const out=cand.d;freeDriver(out);if(G.D[out]){G.D[out].cy=0;if(SER[t.s].tier>=6)addNews(`${nm(out)} is out at ${tn(tid)} to make room for ${G.me.name}.`);}return t.cars.find(c=>!c.d);}
function applyContract(con){const t=G.TM[con.tm];if(!t)return;removeMe();const s=SER[con.s];G.car.con=con;G.car.s=con.s;G.car.tm=con.tm;G.car.role=con.role||"race";G.me.disc=s.disc;
 if(G.car.role==="race"){const slot=ensureSlot(con.tm);if(slot){slot.d="me";if(t.priv||t.own)slot.num=G.me.num;}}
 if(G.car.role==="dev"){G.car.dev={org:con.tm,end:con.end,pay:con.sal};// a feeder ride with an affiliated team
  const feeder=s.id==="cup"?"oap":"truck";const ft=teamsOf(feeder).filter(x=>x.r&&!x.own).sort((a,b)=>b.q-a.q)[R.int(2,6)]||teamsOf(feeder)[0];
  const c2={tm:ft.id,s:feeder,role:"race",yrs:con.yrs,start:con.start,end:con.end,sal:Math.round(SER[feeder].sal[0]*1.2),win:Math.round(SER[feeder].sal[0]*.05),spon:2,rel:0,n1:false,side:true,pay:0};G.car.con=c2;G.car.s=feeder;G.car.tm=ft.id;G.car.role="race";G.me.disc="stock";const sl=ensureSlot(ft.id);if(sl)sl.d="me";
  G.notes.push(`🤝 Development deal: ${esc(tn(con.tm))} places you in a ${esc(SER[feeder].sh)} ride with ${esc(tn(ft.id))}.`);}
 G.car.cc=genStaff(con.tm+G.yr);delete G.rel.cc;G.car.co=[];
 if(SER[G.car.s].endur){const n=SER[G.car.s].tier>=8?2:1;for(let i=0;i<n;i++)G.car.co.push({n:genName(R.pick(NAT_MIX.intl)),r:clamp(SER[G.car.s].lvl+R.gauss()*3,40,92)});}
 rel("t:"+G.car.tm,3);addNews(G.car.role==="reserve"?`${G.me.name} joins ${tn(G.car.tm)} as reserve and test driver.`:`${G.me.name} will drive for ${tn(G.car.tm)} in ${SER[G.car.s].sh}.`,true);}
function expireContract(){removeMe();const was=G.car.s;G.car.con=null;G.car.s=null;G.car.tm=null;G.car.role=null;if(was)G.notes.push(`📄 Your contract has ended. You're a free agent. Check Contracts & offers.`);}
/* ---------- offers screen ---------- */
function offersScreen(){const c=G.car,m=G.me;const now=absWk();G.offers=G.offers.filter(o=>o.exp>=now&&G.TM[o.tm]);
 let cur="";if(c.con){const t=G.TM[c.tm];cur=`<h3>Current deal</h3>${table(["",""],[["Series",esc(SER[c.s].n)],["Team",esc(tn(c.tm))+(c.role==="reserve"?" (reserve/test)":"")],["Through",c.con.end],["Salary",c.con.sal?money(c.con.sal)+"/yr":"-"],["Paying",c.con.pay?money(c.con.pay)+"/yr":"-"],["Win bonus",c.con.win?money(c.con.win):"-"],["Release clause",c.con.rel?money(c.con.rel):"none"],["#1 driver",c.con.n1?"yes":"no"],["Other series allowed",c.con.side?"yes":"no"]])}`;}
 if(c.next)cur+=note(`Signed for ${c.next.start}: ${esc(SER[c.next.s].sh)} with ${esc(tn(c.next.tm))} (${c.next.yrs} yr${c.next.yrs>1?"s":""}${c.next.sal?", "+money(c.next.sal)+"/yr":""}${c.next.pay?", paying "+money(c.next.pay)+"/yr":""}).`,"good");
 const ch=[];if(G.offers.length){ch.push({sec:"OFFERS"});G.offers.forEach(o=>{const s=SER[o.s];const lb=licenseBlock(o.s);ch.push({t:`<b>${esc(tn(o.tm))}</b> · ${esc(s.sh)}${o.role!=="race"?` (${o.role==="reserve"?"reserve/test driver":"development deal"})`:""}`,sub:`${o.pay?"Pay "+money(o.pay)+"/yr":o.sal?money(o.sal)+"/yr":"No salary"} · ${o.yrs} yr · car ${Math.round(G.TM[o.tm].q)} · from ${o.start}${lb?" · ⚠️ "+lb:""}${o.note?" · "+o.note:""}`,f:()=>negotiate(o)});});}
 else ch.push({sec:"NO OFFERS RIGHT NOW"});
 ch.push({sec:"OPTIONS"});
 const lastAsk=G.fl.askWk||0;ch.push({t:m.agent?"Have your agent shop you around":"Make calls looking for a ride",sub:now-lastAsk<4?"You asked recently; give it a few weeks":"Teams with openings may respond",dis:(now-lastAsk<4)&&"Wait a few weeks",f:()=>{G.fl.askWk=now;const n=generateOffers("fa");show(n?`<p>Your phone rings. ${n} team${n>1?"s are":" is"} interested.</p>`:`<p>Nobody bites right now. Better results, a higher rating or more sponsor money would help.</p>`,[{t:"Back",cls:"hi",f:offersScreen}]);}});
 ch.push({t:"Buy a ride",sub:"Bring money, get a seat. Pay-to-drive deals in most series",f:buyRideMenu});
 ch.push({t:"Run your own car",sub:"Privateer program in a grassroots series. Always available",f:ownCarMenu});
 if(c.con&&c.con.end===G.yr&&c.tm&&c.tm!=="priv"&&!c.next&&!G.offers.some(o=>o.tm===c.tm))ch.push({t:"Talk extension with your current team",sub:`Relationship ${Math.round(relOf("t:"+c.tm))}`,f:()=>{const t=G.TM[c.tm];if(myStock(c.s)>=teamNeed(t)-6&&relOf("t:"+c.tm)>-20){const o=mkOffer(t,c.role||"race",{note:"Extension",start:G.yr+1});G.offers.push(o);negotiate(o);}else show(`<p>${esc(towner(c.tm))} says they're "exploring options." That's not good.</p>`,[{t:"Back",f:offersScreen}]);}});
 ch.push(m.agent?{t:`Fire your agent (${esc(m.agent.n)})`,sub:`Fee: ${Math.round(m.agent.fee*100)}% of salary`,f:()=>{m.agent=null;offersScreen();}}:{t:"Hire an agent",sub:"10% of your salary. More offers, better deals",f:()=>{m.agent={n:genName("USA"),fee:.1};show(`<p><b>${esc(m.agent.n)}</b> is now your agent. "Let me make some calls."</p>`,[{t:"Back",cls:"hi",f:offersScreen}]);}});
 ch.push({t:"Back",cls:"hi",f:hub});show(`<h2>Contracts &amp; offers</h2>${cur}<p>Market value in your series: <b>${c.s?Math.round(myStock(c.s)):Math.round(myStock(lastSeries()))}</b> (teams compare it against their standards).</p>`,ch);}
function termsTable(o){const s=SER[o.s];return table(["Term","Offer"],[["Team",`${esc(tn(o.tm))}${G.TM[o.tm].mfr?" ("+esc(G.TM[o.tm].mfr)+")":""}`],["Series",esc(s.n)],["Role",o.role==="race"?"Full-time race seat":o.role==="reserve"?"Reserve & test driver":"Development deal (feeder series ride)"],["Car rating",Math.round(G.TM[o.tm].q)+` (series avg ${s.ql})`],["Years",`${o.yrs} (${o.start}-${o.start+o.yrs-1})`],[o.pay?"You pay":"Salary",o.pay?money(o.pay)+" per season":o.sal?money(o.sal)+" per season":"none"],["Win bonus",o.win?money(o.win):"-"],["Sponsor duties",["light","normal","heavy"][o.spon-1]||"normal"],["Release clause",o.rel?money(o.rel):"none"],["#1 driver status",o.n1?"yes":"no"],["Race other series",o.side?"allowed":"not allowed"],["Team interest",meter("",o.int)]]);}
function negotiate(o){const lb=licenseBlock(o.s);const buy=buyoutCost(o);const tms=G.TM[o.tm].cars.map(c=>c.d).filter(d=>d&&d!=="me").map(d=>nm(d));
 const ask=(lab,sub,fn)=>({t:lab,sub,dis:o.asks>=4&&"They're done negotiating",f:()=>{o.asks++;const p=clamp(o.int/100+(G.me.agent?.12:0)-o.asks*.08,.05,.95);EFX=[];if(R.chance(p)){fn();o.int=clamp(o.int-6,0,100);negMsg(o,"They agree.","good");}else{o.int=clamp(o.int-12,0,100);if(o.int<25){G.offers=G.offers.filter(x=>x!==o);rel("t:"+o.tm,-3);return show(`<p class="r">${esc(towner(o.tm))} pulls the offer. "We'll go another direction."</p>`,[{t:"Back",cls:"hi",f:offersScreen}]);}negMsg(o,"They refuse. Interest drops.","bad");}}});
 const ch=[{t:"<b>Accept and sign</b>",sub:lb?lb:o.pay&&G.me.cash+sponsorCash()<o.pay*.8?`You need about ${money(o.pay)} (you have ${money(G.me.cash)})`:buy?`Buying out your current deal costs ${money(buy)}`:"",cls:"hi",dis:lb||(o.pay&&G.me.cash+sponsorCash()<o.pay*.8&&"Not enough money"),f:()=>{EFX=[];if(buy){spend(buy,"Contract buyout");rel("t:"+G.car.tm,-10);}const con=Object.assign({},o);delete con.int;delete con.asks;delete con.exp;signContract(con);checkAch();save();show(`<h2>Signed!</h2><p>${o.start>G.yr?`From ${o.start}, you'll`:"You'll"} ${o.role==="reserve"?"be the reserve and test driver for":"drive for"} <b>${esc(tn(o.tm))}</b> in ${esc(SER[o.s].n)}.</p>${efxHtml()}`,[{t:"Back to the dashboard",cls:"hi",f:hub}]);}},
  o.pay?ask("Negotiate the price down","-15% on the payment",()=>{o.pay=Math.round(o.pay*.85/1000)*1000;}):o.sal?ask("Ask for more money","+15% salary",()=>{o.sal=Math.round(o.sal*1.15/1000)*1000;}):null,
  ask(o.yrs<3?"Ask for another year":"Ask for a shorter deal",o.yrs<3?"More security":"More freedom",()=>{o.yrs=o.yrs<3?o.yrs+1:o.yrs-1;}),
  !o.win&&SER[o.s].tier>=4?ask("Ask for a win bonus","",()=>{o.win=Math.max(5000,Math.round((o.sal||SER[o.s].sal[1]*.05)*.05/1000)*1000);}):null,
  !o.n1&&tms.length?ask("Demand #1 driver status",`Priority over ${tms.map(esc).join(", ")}`,()=>{o.n1=true;o.int-=8;}):null,
  !o.rel&&o.yrs>1?ask("Ask for a performance release clause","Lets you leave early for a fixed fee",()=>{o.rel=Math.round(Math.max(50000,(o.sal||100000)*.5)/1000)*1000;}):null,
  !o.side?ask("Ask to race other series","Dirt races, one-offs, Le Mans",()=>{o.side=true;}):null,
  o.spon>1?ask("Reduce sponsor obligations","Fewer appearances",()=>{o.spon--;}):null,
  G.offers.length>1?{t:"Use another offer as leverage",sub:"Could raise interest or annoy them",dis:o.lev&&"Already tried",f:()=>{o.lev=1;EFX=[];if(R.chance(.55)){o.int=clamp(o.int+12,0,100);if(o.sal)o.sal=Math.round(o.sal*1.1/1000)*1000;negMsg(o,"They don't want to lose you. Salary +10%.","good");}else{o.int-=10;rel("t:"+o.tm,-2);negMsg(o,"\"Then go sign there.\" Interest drops.","bad");}}}:null,
  {t:"Leak the talks to the media",sub:"Raises your profile; your current team won't love it",dis:o.leak&&"Already leaked",f:()=>{o.leak=1;EFX=[];fame(1);o.int=clamp(o.int+6,0,100);if(G.car.tm&&G.car.tm!==o.tm&&G.car.tm!=="priv")rel("t:"+G.car.tm,-5);G.rumors.push({me:1,tm:o.tm,yr:G.yr});addNews(`Rumor: ${G.me.name} in talks with ${tn(o.tm)} (${SER[o.s].sh}).`,true);negMsg(o,"The story is everywhere by morning.","good");}},
  {t:"Decline",f:()=>{G.offers=G.offers.filter(x=>x!==o);offersScreen();}},{t:"Back",f:offersScreen}];
 show(`<h2>Negotiation</h2>${o.note?`<p>${esc(o.note)}</p>`:""}<p>${esc(towner(o.tm))} of ${esc(tn(o.tm))} wants you${tms.length?`. Teammates: ${tms.map(esc).join(", ")}`:""}.</p>${termsTable(o)}${efxHtml()}`,ch);}
function negMsg(o,t,k){show(`<p class="${k==="good"?"g":"r"}">${t}</p>${termsTable(o)}${efxHtml()}`,[{t:"Keep negotiating",cls:"hi",f:()=>negotiate(o)}]);}
function buyoutCost(o){const c=G.car.con;if(!c||c.priv||o.start>c.end)return 0;if(G.car.tm===o.tm)return 0;if(c.rel)return c.rel;const left=c.end-G.yr+(G.wk<40?1:0);return Math.max(0,Math.round((c.sal||100000)*.5*Math.max(1,left)/1000)*1000);}
function sponsorCash(){return sum(G.car.spons.map(s=>s.amt));}
function buyRideMenu(){const m=G.me;const ch=[];const opts=SERIES_LIST.filter(s=>!s.oneoff&&s.cost>0&&!isPriv(s.id)&&!licenseBlock(s.id)&&myStock(s.id)>=s.lvl-14).sort((a,b)=>a.tier-b.tier);
 opts.forEach(s=>{const tms=teamsOf(s.id).filter(t=>!t.own&&!t.priv).sort((a,b)=>a.q-b.q);const t=tms[Math.floor(tms.length*.35)];if(!t)return;const cost=Math.round(s.cost*(myStock(s.id)<s.lvl-6?1.15:1)/1000)*1000;
  ch.push({t:`${esc(s.n)}`,sub:`${esc(tn(t.id))} (car ${Math.round(t.q)}) · ${money(cost)} per season`,dis:m.cash+sponsorCash()<cost*.8&&`You need about ${money(cost)}`,f:()=>{const o=mkOffer(t,"race",{pay:cost,sal:0,win:0,yrs:1,int:60,start:(G.car.s&&!seasonOver())||G.wk>=40?G.yr+1:G.yr});G.offers.push(o);negotiate(o);}});});
 show(`<h2>Buy a ride</h2><p>Pay-to-drive seats are how most drivers climb the junior ladders. Sponsor money counts toward the bill. Series you can't qualify for (age, superlicense, or a rating far below the field) aren't listed.</p>`,ch.concat([{t:"Back",cls:"hi",f:offersScreen}]));}
function ownCarMenu(){const ch=[];SERIES_LIST.filter(s=>isPriv(s.id)&&!s.oneoff&&!licenseBlock(s.id)).forEach(s=>{const per=startCost(s.id);ch.push({t:esc(s.n),sub:`About ${money(per)} per race (${s.cal.length} races). ${esc(s.desc)}`,f:()=>{if(G.car.con&&!G.car.con.priv&&G.car.con.end>=G.yr&&!seasonOver()){return show(`<p>You're under contract with ${esc(tn(G.car.tm))}. Running your own car means walking away (buyout ${money(buyoutCost({start:G.yr,tm:"priv"}))}).</p>`,[{t:"Walk away and run my own car",f:()=>{EFX=[];spend(buyoutCost({start:G.yr,tm:"priv"}),"Buyout");rel("t:"+G.car.tm,-12);startPriv(s.id);}},{t:"Back",cls:"hi",f:ownCarMenu}]);}startPriv(s.id);}});});
 show(`<h2>Run your own car</h2><p>Buy or build a car, tow it to the track, pay for tires and entry fees. Prize money helps. This is always possible, so you are never without a place to race.</p>`,ch.concat([{t:"Back",cls:"hi",f:offersScreen}]));}
function startPriv(sid){EFX=[];removeMe();G.car.next=null;joinPrivOrPay(sid,false);G.me.disc=SER[sid].disc;const c=G.car.con;c.end=G.yr+(seasonOver(sid)?1:0);c.start=G.yr;
 const st=G.S[sid];addNews(`${G.me.name} will run a self-funded car in ${SER[sid].n}.`,true);save();show(`<h2>Your own program</h2><p>You're running your own car in <b>${esc(SER[sid].n)}</b>. ${st.ci>=SER[sid].cal.length?"The season is over, so your first race is next year.":""}</p>${efxHtml()}`,[{t:"Back to the dashboard",cls:"hi",f:hub}]);}
/* ---------- weekly silly-season ticks ---------- */
function sillyTicks(){const c=G.car,m=G.me;if(m.retired)return;
 if(G.wk>=26&&G.wk<=40&&!G.fl.midOffers&&R.chance(.12)){const tier=c.s?SER[c.s].tier:0;const p=primarySeasonPerf();if(p&&p.n>1&&(p.pos-1)/(p.n-1)<.3){G.fl.midOffers=1;generateOffers("mid");}}
 if(!G.fl.eosOffers&&(G.wk>=44||(c.s&&seasonOver()&&G.wk>=30))&&(!c.con||c.con.end<=G.yr||c.con.priv||myStock(c.s)>teamNeed(G.TM[c.tm]||{s:c.s,q:60})+6)){G.fl.eosOffers=1;generateOffers("eos");}
 if(!c.s&&G.wk%4===0)generateOffers("fa");
 if(c.s&&c.tm==="priv"&&seasonOver()&&G.wk>=30&&!G.fl.cross&&!G.fl.nextPriv&&!c.next){G.fl.cross=1;queuePending("crossroads",{});}
 if(G.wk>=18&&G.wk<=44&&R.chance(.3))midRumor();
 if(G.wk===50&&!G.fl.sillyDone){G.fl.sillyDone=1;processSillySeason();}}
function midRumor(){const ser=["cup","f1","indycar","oap","wec","imsagtp","fe","supercars","woo"];const sid=R.pick(ser);const ds=entries(sid).map(e=>e.d).filter(d=>d!=="me"&&G.D[d]&&G.D[d].cy<=1);if(!ds.length)return;const d=R.pick(ds);
 const tms=teamsOf(sid).filter(t=>t.id!==G.D[d].tm&&!t.own&&t.q>=G.TM[G.D[d].tm].q-8);if(!tms.length)return;const t=R.pick(tms);G.rumors.push({d,tm:t.id,yr:G.yr});if(G.rumors.length>40)G.rumors.shift();
 addNews(R.pick([`Silly season: ${nm(d)} linked with ${tn(t.id)} for ${G.yr+1}.`,`Paddock rumor: ${tn(t.id)} has held talks with ${nm(d)}.`,`${nm(d)}'s contract is up after ${G.yr}; ${tn(t.id)} is said to be interested.`]));}
/* ---------- AI silly season ---------- */
function processSillySeason(){const moves=[];if(G.car.next)ensureSlot(G.car.next.tm);
 const pct=d=>{const s=d.s;if(!s)return .5;const p=champPos(s,d.id);const n=Math.max(2,entries(s).length);return p?1-(p-1)/(n-1):.3;};
 // retirements & contract decisions
 Object.values(G.D).forEach(d=>{if(d.ret)return;const a=G.yr-d.by;
  let rp=a<36?0:(a-35)*.07;if(d.s&&SER[d.s].tier<=4)rp*=.6;if(!d.tm&&a>30)rp+=.15;
  if(R.chance(rp)){const was=d.s,tm=d.tm;if(tm)freeDriver(d.id);d.ret=G.yr;if(d.r||(was&&SER[was].tier>=7))moves.push(`${d.n} announces retirement${tm?` after the season with ${G.TM[tm].n}`:""}.`);return;}
  if(!d.tm)return;const t=G.TM[d.tm];if(!t||t.own||t.priv)return;d.cy--;
  const s=SER[d.s];const pc=pct(d);
  if(a<=24&&s.tier<9&&pc>=.8&&(NEXT[d.s]||[]).length&&R.chance(.6)){d.promo=1;freeDriver(d.id);return;}
  if(d.cy<=0){let keep=.6+(pc-.5)*.7+(d.r?.12:0)+(s.tier>=8?.08:0)-(a>36?.2:0)-(d.o<s.lvl-6?.2:0);if(G.rumors.some(r=>r.d===d.id&&r.yr===G.yr))keep-=.25;
   if(R.chance(keep))d.cy=R.int(1,3);else{d.lastTm=d.tm;freeDriver(d.id);}}});
 // team changes
 Object.values(G.TM).forEach(t=>{if(t.priv||t.own)return;const s=SER[t.s];t.q=clamp(r1(t.q+R.gauss()*2.2+(s.ql-t.q)*.08),20,98);
  if(s.mfr&&s.mfr.length>1&&R.chance(.03)){const nw=R.pick(s.mfr.filter(x=>x!==t.mfr));if(nw){t.mfr=nw;if(s.tier>=7)moves.push(`${t.r?t.n:tn(t.id)} will switch to ${nw} for ${G.yr+1}.`);}}});
 // fill vacancies from the top down
 const resv=G.car.next?G.car.next.tm:null;
 SERIES_LIST.filter(s=>!s.oneoff).sort((a,b)=>b.tier-a.tier).forEach(s=>{teamsOf(s.id).forEach(t=>{if(t.priv||t.own)return;let skip=t.id===resv?1:0;
  t.cars.forEach(c=>{if(c.d)return;if(skip){skip--;return;}const d=pickRecruit(s,t);if(d.tm)freeDriver(d.id);c.d=d.id;d.s=s.id;d.tm=t.id;d.num=c.num;d.cy=R.int(1,3);delete d.promo;
   if((d.r||s.tier>=9)&&(s.tier>=7||d.r)&&d.lastTm!==t.id)moves.push(`${nm(d.id)} will drive the #${c.num} for ${tn(t.id)} in ${s.sh} next season.`);});});});
 // unsigned old free agents fade away
 Object.values(G.D).forEach(d=>{if(!d.ret&&!d.tm&&G.yr-d.by>32&&R.chance(.3))d.ret=G.yr;});
 moves.slice(0,40).forEach(t=>addNews("🔁 "+t));G.lastSilly=moves.slice(0,60);
 G.notes.push(`🔁 Silly season: ${moves.length} driver moves and announcements. See News.`);}
function fitsSeries(d,sid){const ls=d.ls||d.s;if(!ls||ls===sid)return true;const a=SER[ls],b=SER[sid];if(!a)return true;if((NEXT[ls]||[]).indexOf(sid)>=0||(NEXT[sid]||[]).indexOf(ls)>=0)return true;if(a.lad===b.lad&&Math.abs(a.tier-b.tier)<=3)return true;if(!d.r&&a.disc===b.disc&&Math.abs(a.tier-b.tier)<=2)return true;return false;}
function pickRecruit(s,t){const ar=AGE_R[s.id]||[16,40];const lower=SERIES_LIST.filter(x=>(NEXT[x.id]||[]).indexOf(s.id)>=0).map(x=>x.id);
 const pool=Object.values(G.D).filter(d=>!d.ret&&!d.inj&&(!d.tm||d.promo&&lower.indexOf(d.s)>=0)&&(G.yr-d.by)>=Math.max(s.age,ar[0]-1)&&(G.yr-d.by)<=ar[1]+4&&d.o>=s.lvl-9&&(!s.maxAge||G.yr-d.by<=s.maxAge)&&fitsSeries(d,s.id));
 let best=null,bs=-1e9;pool.forEach(d=>{let sc=d.o+R.f(0,4)+(d.promo?3:0)+((G.yr-d.by)<24?2:0)-(d.lastTm===t.id?5:0);if(G.rumors.some(r=>r.d===d.id&&r.tm===t.id))sc+=8;if(s.rp&&d.r)sc+=2;if(NATR[s.id]&&NAT_MIX[NATR[s.id]].indexOf(d.nat)<0)sc-=2;if(sc>bs){bs=sc;best=d;}});
 const need=s.lvl-2+(t.q-s.ql)*.35;if(best&&best.o>=need-(s.tier<=4?6:0))return best;
 // nobody good enough is available: a rookie or an import of the right calibre arrives
 const d=genDriverFor(s.id);d.o=clamp(r1(s.lvl+1.5+(t.q-s.ql)*.3+R.gauss()*4),15,96);const a=G.yr-d.by;d.pot=clamp(Math.round(d.o+Math.max(0,24-a)*R.f(.5,1.6)),d.o,97);return d;}
/* ---------- one-off races ---------- */
const ONEOFFS=[["cup",/Daytona 500/,"The Great American Race. Open cars can race their way in."],["indycar",/Indianapolis 500/,"33 cars, 500 miles, the Greatest Spectacle in Racing."],["cup",/Coca-Cola 600/,"Run Indy and Charlotte on the same day for The Double."],
 ["imsagtd",/Rolex 24/,"24 hours at Daytona in a GT car."],["imsagtp",/Rolex 24/,"24 hours at Daytona in a prototype."],["wecgt",/Le Mans/,"The 24 Hours of Le Mans in LMGT3."],["wec",/Le Mans/,"The 24 Hours of Le Mans in a Hypercar."],["imsagtd",/Sebring/,"Twelve brutal hours on the bumps of Sebring."],
 ["chili",/Chili/,"Thousands of midget racers under one roof in Tulsa every January."],["snowball",/Snowball/,"The biggest Super Late Model race in America, at Five Flags Speedway."],["woo",/Knoxville Nationals/,"The Super Bowl of Sprint Car racing."],["woo",/Kings Royal/,"Eldora's big-money sprint car classic."],["lolmds",/Dream/,"Eldora's Dirt Late Model Dream."],["lolmds",/World 100/,"The World 100 at Eldora: win and you get the globe."],["supercars",/Bathurst/,"Mount Panorama. The Great Race."],["nhra",/U.S. Nationals/,"The Big Go at Indianapolis."],["knat",/SuperNationals/,"Las Vegas karting showdown."],["miata",/Runoffs/,"The SCCA National Championship Runoffs."],["ff",/Festival/,"The Formula Ford Festival at Brands Hatch."],["truck",/Eldora|Bristol/,"A Truck Series one-off."],["oap",/Daytona|Talladega/,"A superspeedway one-off in the O'Reilly Series."],["arca",/Daytona/,"ARCA season opener at Daytona."]];
function oneoffList(){const out=[];const seen={};ONEOFFS.forEach(([sid,re,desc])=>{const s=SER[sid];s.cal.forEach((c,ci)=>{const name=c[2]||evName(sid,ci);if(!re.test(name))return;const k=sid+ci;if(seen[k])return;seen[k]=1;
  const wkOk=c[1]>G.wk||(c[1]===G.wk&&!myEvent());out.push({s:sid,ci,wk:c[1],name,desc,past:!wkOk||(s.oneoff?G.fl["oo_"+sid]===G.yr:G.S[sid].ci>ci)});});});return out.sort((a,b)=>a.wk-b.wk);}
function oneoffReq(o){const s=SER[o.s];const m=G.me;const lb=licenseBlock(o.s);if(lb&&!/Superlicense/.test(lb))return lb;if(G.car.s===o.s&&G.car.role==="race")return "That's your own series";
 if(G.car.con&&!G.car.con.side&&!G.car.con.priv&&G.car.s)return "Your contract doesn't allow other series";if(m.inj)return "You're injured";
 const clash=G.car.s&&G.car.role==="race"&&SER[G.car.s].cal.some((c,ci)=>c[1]===o.wk&&ci>=G.S[G.car.s].ci)&&!(o.s==="indycar"||/Coca-Cola 600/.test(o.name));if(clash)return "Clashes with your own race that week";
 if((G.car.oneoffs||[]).some(x=>SER[x.s].cal[x.ci][1]===o.wk))return "You already have a one-off that week";
 const need=s.lvl-(s.tier>=8?10:14);if(myStock(o.s)<need)return `Teams won't put you in a car yet (need value ${Math.round(need)}, you're ${Math.round(myStock(o.s))})`;return "";}
function oneoffDeal(o){const s=SER[o.s];const st=myStock(o.s);const fameHigh=G.me.fame>=55||st>=s.lvl+2;const pool=s.oneoff?[]:teamsOf(o.s).filter(t=>!t.priv&&!t.own);
 const t=pool.length?R.pick(pool.slice().sort((a,b)=>a.q-b.q).slice(0,Math.max(1,Math.ceil(pool.length*(fameHigh?.8:.4))))):null;
 const cost=fameHigh?0:Math.round((s.cost||60000)*(s.oneoff?1:1.6)/Math.max(4,s.cal.length)/1000)*1000;const fee=fameHigh?Math.round((s.sal[0]||20000)*.05/1000)*1000:0;
 return {s:o.s,ci:o.ci,tm:t?t.id:null,tmn:t?(t.r&&!fic()?"a third entry from "+t.n:tn(t.id)):"Your own car",q:t?t.q-2:s.ql+R.f(-2,4),cost,fee};}
function oneoffScreen(){const list=oneoffList();const ch=list.map(o=>{const req=o.past?"Already run this year":oneoffReq(o);return {t:`${esc(o.name)} <span class="dim">(${esc(SER[o.s].sh)})</span>`,sub:`${wkDate(o.wk)} · ${esc(o.desc)}${req?" · "+req:""}`,dis:req||false,f:()=>{const d=oneoffDeal(o);
   show(`<h2>${esc(o.name)}</h2><p>${esc(o.desc)}</p>${table(["",""],[["Ride",esc(d.tmn)],["Car rating",Math.round(d.q)+` (field ~${SER[o.s].ql})`],[d.cost?"Cost to you":"Appearance fee",d.cost?money(d.cost):money(d.fee)]])}`,[
    {t:"Enter",cls:"hi",dis:d.cost>G.me.cash&&"Not enough cash",f:()=>{EFX=[];if(d.cost)spend(d.cost,"One-off entry");if(d.fee)earn(d.fee,"Appearance fee");G.car.oneoffs.push(d);if(d.tm)rel("t:"+d.tm,2);addNews(`${G.me.name} enters the ${o.name}${d.tm?" with "+tn(d.tm):""}.`,true);save();show(`<p>You're entered in the <b>${esc(o.name)}</b>.</p>${efxHtml()}`,[{t:"Back",cls:"hi",f:oneoffScreen}]);}},{t:"Back",f:oneoffScreen}]);}};});
 const mine=(G.car.oneoffs||[]).filter(x=>!x.done).map(x=>evName(x.s,x.ci));
 show(`<h2>One-off races</h2><p>Crown jewels and big events you can enter outside your main series. Fame and market value get you better rides.</p>${mine.length?note("Entered: "+mine.map(esc).join(", "),"good"):""}`,ch.concat([{t:"Back",cls:"hi",f:hub}]));}
/* ---------- sponsors ---------- */
function newSponsorOffer(){const m=G.me;const tier=G.car.s?SER[G.car.s].tier:1;const big=R.chance(.08+m.fame/300)&&tier>=5;const n=big?R.pick(BIG_SPONSOR_FIC):R.pick(SPONSOR_FIC);
 const base=[0,3000,6000,15000,30000,60000,150000,300000,600000,1200000,2500000][tier]||5000;const amt=Math.round(base*R.f(.5,1.4)*(1+m.fame/100)*(big?2.5:1)/500)*500;return {n,amt,sat:60,lvl:big?2:1,duty:R.int(1,3)};}
function sponsorOfferScreen(sp){show(`<h2>Sponsor interest</h2><p><b>${esc(sp.n)}</b> wants to back you: <b>${money(sp.amt)}</b> per season. ${["Light","Regular","Heavy"][sp.duty-1]} appearance duties.</p>`,[
 {t:"Sign the deal",cls:"hi",f:()=>{G.car.spons.push(sp);rel("sp:"+sp.n,10);addNews(`${sp.n} signs on as a sponsor of ${G.me.name}.`,true);if(sp.duty===3)G.me.mor-=2;checkAch();show(`<p>Welcome aboard, ${esc(sp.n)}. Their logo goes on your car and your firesuit.</p>`,[{t:"Back",cls:"hi",f:G.car.ap>0?activities:hub}]);}},
 {t:"Negotiate for more",f:()=>{if(R.chance(.45+G.me.sk.med/250)){sp.amt=Math.round(sp.amt*1.2/500)*500;sponsorOfferScreen(sp);}else show(`<p>${esc(sp.n)} walks away.</p>`,[{t:"Back",f:hub}]);}},
 {t:"Pass",f:hub}]);}
