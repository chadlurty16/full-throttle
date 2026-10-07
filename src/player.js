/* ===================== PLAYER: skills, overall, development ===================== */
const SK=["spd","crf","con","tir","wet","ovl","rdc","sht","drt","drf","qul","ovt","dfd","fit","fbk","med"];
const SKN={spd:"Raw speed",crf:"Racecraft",con:"Consistency",tir:"Tire management",wet:"Wet weather",ovl:"Ovals",rdc:"Road courses",sht:"Short tracks",drt:"Dirt",drf:"Drafting",qul:"Qualifying",ovt:"Overtaking",dfd:"Defending",fit:"Fitness",fbk:"Mechanical feedback",med:"Media & sponsor appeal"};
const CORE={spd:.24,crf:.15,con:.13,tir:.08,qul:.08,ovt:.09,dfd:.07,fit:.06,fbk:.06,wet:.04};
const SPEC={stock:{ovl:.35,sht:.25,drf:.2,rdc:.1,drt:.1},open:{rdc:.55,ovl:.2,wet:.25},dirt:{drt:.8,sht:.2},kart:{rdc:.55,wet:.2,sht:.25},sports:{rdc:.6,wet:.2,fit:.2},drag:{qul:.4,con:.4,spd:.2}};
const TSPEC={ss:{drf:.6,ovl:.4},int:{ovl:.6,drf:.2,tir:.2},sht:{sht:.6,ovl:.2,dfd:.2},dirt:{drt:1},road:{rdc:.8,fbk:.2},street:{rdc:.7,con:.3},kart:{rdc:.6,spd:.4},drag:{qul:.5,con:.5}};
const TRAITS={talent:["Natural talent","+2 raw speed and a higher ceiling",{spd:2}],braker:["Late braker","+5 overtaking, +2 speed, slightly more incidents",{ovt:5,spd:2}],smooth:["Smooth operator","+5 tire management, +4 consistency",{tir:5,con:4}],
 rain:["Rain master","+10 wet weather",{wet:10}],oval:["Oval specialist","+6 ovals, +4 short tracks, +4 drafting",{ovl:6,sht:4,drf:4}],road:["Road course ace","+8 road courses",{rdc:8}],dirt:["Dirt tracker","+10 dirt",{drt:10}],
 qual:["Qualifying specialist","+8 qualifying",{qul:8}],iron:["Iron man","+8 fitness, injuries heal faster",{fit:8}],eng:["Engineer's dream","+8 mechanical feedback",{fbk:8}],media:["Media darling","+10 media & sponsor appeal",{med:10}],
 charger:["Hard charger","+5 racecraft, +3 overtaking",{crf:5,ovt:3}],ice:["Ice cold","+5 consistency, +3 defending, calm on the big stage",{con:5,dfd:3}]};
const BGS={rich:["Rich family","$250,000 to start and Dad's checkbook every week. Paddock cynics call you a pay driver.",250000,2500,{spd:2,qul:2,fbk:1},-3],
 middle:["Middle class","$20,000 in savings and parents who'll help when they can.",20000,250,{},0],
 broke:["Broke racer","$2,000 and a trailer with a flat tire. You build your own cars and you're hungry.",2000,0,{crf:3,fbk:4,tir:2},4],
 sponsor:["Sponsor-backed","$15,000 plus a local sponsor who believes in you ($40,000 a season).",15000,100,{med:5},2]};
function hasTrait(t){return G.me.traits.indexOf(t)>=0;}
function wsum(w,f){let s=0,t=0;for(const k in w){s+=f(k)*w[k];t+=w[k];}return t?s/t:0;}
function coreR(){return wsum(CORE,k=>G.me.sk[k]);}
function discOf(sid){const s=SER[sid];return s?s.disc:"stock";}
function OVR(disc){const m=G.me;disc=disc||(G.car.s?discOf(G.car.s):m.disc||"stock");return Math.round(.7*coreR()+.3*wsum(SPEC[disc]||SPEC.stock,k=>m.sk[k]));}
function trackR(type,wet){const m=G.me;let r=.65*coreR()+.35*wsum(TSPEC[type]||TSPEC.road,k=>m.sk[k]);if(wet)r=.7*r+.3*m.sk.wet;const hpPen=m.hp<70?(70-m.hp)*.12:0;const mor=(m.mor-50)*.03;return r-hpPen+mor;}
function aiTrackR(d,type,wet){const dv=d.dv||{};let r=d.o+((type==="dirt"?dv.d:(type==="road"||type==="street"||type==="kart")?dv.r:dv.o)||0);if(wet)r+=dv.w||0;return r;}
function ageGrowth(a){return a<=14?1.35:a<=17?1.2:a<=21?1.05:a<=25?.85:a<=29?.6:a<=33?.3:a<=37?.1:.03;}
function gainSk(k,amt,quiet){const m=G.me;const cur=m.sk[k];const ceil=k==="med"?95:m.pot;const room=cur>=ceil+1?0:clamp((ceil+1-cur)/24,0.04,1);const g=amt>0?amt*ageGrowth(m.age)*room:amt;const nv=clamp(cur+g,1,99);const d=nv-cur;m.sk[k]=nv;if(!quiet&&Math.abs(d)>=0.05)EFX.push([SKN[k],r1(d)]);return d;}
function seatTime(type,quality){const map={ss:["drf","ovl"],int:["ovl","tir"],sht:["sht","dfd"],dirt:["drt","crf"],road:["rdc","fbk"],street:["rdc","con"],kart:["rdc","ovt"],drag:["qul","con"]};
 const q=quality||1;(map[type]||["crf"]).forEach(k=>gainSk(k,.3*q,true));["crf","con","spd","ovt","tir","qul","dfd"].forEach(k=>gainSk(k,.13*q,true));}
function naturalGrowth(){const m=G.me;if(m.retired)return;SK.forEach(k=>{if(k!=="med")gainSk(k,.018,true);});}
function rep(v){G.me.rep=clamp(G.me.rep+v,0,100);if(v)EFX.push(["Paddock reputation",v]);}
function fame(v){G.me.fame=clamp(G.me.fame+v,0,100);if(v)EFX.push(["Fame",v]);}
function morale(v){G.me.mor=clamp(G.me.mor+v,0,100);if(v)EFX.push(["Morale",v]);}
function earn(v,why){G.me.cash+=v;if(v>0)G.me.earned+=v;EFX.push([why||"Money",v,"$"]);}
function spend(v,why){G.me.cash-=v;EFX.push([why||"Spent",-v,"$"]);}
function rel(key,v){G.rel[key]=clamp((G.rel[key]||0)+v,-100,100);if(v)EFX.push([relName(key),v,"rel"]);}
function relOf(key){return G.rel[key]||0;}
function relName(key){if(key.startsWith("d:"))return nm(key.slice(2));if(key.startsWith("t:"))return towner(key.slice(2))+" ("+tn(key.slice(2))+")";if(key==="cc")return G.car.cc?G.car.cc+" (crew chief/engineer)":"Your crew chief";if(key.startsWith("sp:"))return key.slice(3);if(key==="media")return "The media";if(key==="fam")return "Your family";if(key==="fans")return "Your fans";return key;}
function hurt(sev){const m=G.me;const tough=hasTrait("iron")?.7:1;const table=sev>=3?[["broken collarbone",6],["fractured wrist",7],["concussion",4],["broken leg",12],["compressed vertebra",10]]:sev===2?[["sprained wrist",2],["cracked rib",3],["badly bruised shoulder",2],["mild concussion",2]]:[["bruised ribs",1],["sore neck",1]];
 const t=R.pick(table);const w=Math.max(1,Math.round(t[1]*tough));m.inj={n:t[0],w};m.hp=clamp(m.hp-(sev*12),20,100);G.stats.injuries++;addNews(`${m.name} is recovering from a ${t[0]} (out about ${plural(w,"week")}).`,true);return t[0];}
function legacyScore(){const c=careerTotals();const titles=G.st.titles||[];let ls=0;titles.forEach(t=>{ls+=Math.round(4+SER[t.s].tier*SER[t.s].tier*.8);});
 ls+=c.w*(1.2)+c.pod*.3+c.pol*.3;G.st.races.forEach(r=>{if(r.f===1)ls+=SER[r.s].tier>=9?6:SER[r.s].tier>=7?2:0;});ls+=G.st.cj.length*14;ls+=(G.me.fame*.4);if(G.ownHist)ls+=G.ownHist.reduce((a,o)=>a+(o.titles||0)*20+(o.wins||0)*1.5,0);return Math.round(ls);}
function legacyTier(v){return v>=900?"All-Time Great":v>=550?"Legend of the Sport":v>=320?"Champion & Star":v>=170?"Proven Winner":v>=80?"Respected Pro":v>=30?"Journeyman Racer":"Saturday Night Hero";}
