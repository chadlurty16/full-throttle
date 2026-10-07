// Storyline coverage: for every event, find a prepared state where it's valid, then DFS every choice path
// (including multi-step goto chains), checking for thrown errors, error screens and dead ends.
const {load,strip,quickStart}=require('./harness');
const h=load();const R=s=>h.run(s);
function prep(o,extra){quickStart(h,o);R(`(function(){G.set.quick=true;for(let w=0;w<${o.weeks||20};w++){autoWeek();endWeekCore();G.pending=[];}${extra||''}})()`);return R('JSON.stringify(G)');}
const states={
 grass:prep({start:'hobby',age:16,weeks:24},'G.me.cash=1500;for(let i=0;i<4;i++)G.st.races.push({yr:G.yr,wk:G.wk,s:"hobby",ci:i,ev:"x",trk:"f_cedar",st:2,f:i===0?1:3,n:18,led:5,fl:0,dnf:"",pts:40,cj:0,oo:0,tmn:"x"});G.me.fame=12;'),
 kart:prep({start:'kclub',age:12,weeks:20},'G.me.fame=10;'),
 pro:prep({start:'hobby',age:22,weeks:2},`G.me.sk=Object.fromEntries(SK.map(k=>[k,70]));G.me.sim=1;const t=teamsOf("truck")[2].id;signContract({tm:t,s:"truck",role:"race",yrs:2,start:G.yr,sal:300000,win:10000,spon:1,rel:0,n1:false,side:true,pay:0});G.car.spons.push({n:"Test Co",amt:100000,sat:20,lvl:1,duty:1},{n:"Happy Co",amt:100000,sat:90,lvl:1,duty:1});G.me.cash=2e6;G.me.fame=40;G.me.rep=60;G.wk=26;G.S.truck.ci=10;G.car.con.end=G.yr;G.rel["t:"+t]=30;const d=entries("truck").find(e=>e.d!=="me"&&!G.D[e.d].r).d;G.rel["d:"+d]=-40;G.fl.ignoredTO=1;G.st.races.push({yr:G.yr,wk:G.wk,s:"truck",ci:1,ev:"x",trk:"daytona",st:2,f:2,n:36,led:5,fl:0,dnf:"Crash",pts:40,cj:0,oo:0,tmn:"x"});`),
 top:prep({start:'hobby',age:28,weeks:2},`G.me.sk=Object.fromEntries(SK.map(k=>[k,85]));const t=teamsOf("cup").find(t=>t.cars.length>=2&&t.r).id;signContract({tm:t,s:"cup",role:"race",yrs:2,start:G.yr,sal:5e6,win:50000,spon:1,rel:0,n1:false,side:true,pay:0});G.car.spons.push({n:"Big Co",amt:1e6,sat:90,lvl:2,duty:2});G.me.cash=8e7;G.me.fame=70;G.me.rep=70;G.me.sim=2;G.wk=28;G.S.cup.ci=15;G.car.con.end=G.yr;G.rel["t:"+t]=30;G.st.titles.push({yr:G.yr,s:"oap"});doStartTeam("truck","Owner Test");G.own[0].cc.r=80;G.own[0].cash=-5e6;for(let i=0;i<101;i++)G.st.races.push({yr:G.yr-1,wk:10,s:"oap",ci:0,ev:"x",trk:"daytona",st:5,f:i%7===0?1:6,n:38,led:0,fl:0,dnf:"",pts:30,cj:0,oo:0,tmn:"x"});const rd=Object.values(G.D).find(d=>!d.r&&d.ret!==undefined&&d.ret);if(rd)G.rel["d:"+rd.id]=20;const fd=Object.values(G.D).find(d=>!d.r&&!d.tm&&!d.ret);if(fd){fd.ret=G.yr;G.rel["d:"+fd.id]=25;}`),
 cupown:prep({start:'hobby',age:30,weeks:2},`G.me.cash=2e8;doStartTeam("cup","Cup Owner");G.me.fame=40;`),
 reserve:prep({start:'hobby',age:22,weeks:2},`const t=teamsOf("f1")[3].id;applyContract({tm:t,s:"f1",role:"reserve",yrs:1,start:G.yr,end:G.yr,sal:200000,win:0,spon:1,rel:0,n1:false,side:true,pay:0});G.wk=20;G.S.f1.ci=5;`),
 retired:prep({start:'hobby',age:45,weeks:2},`G.me.fame=50;G.me.cash=5e6;for(let i=0;i<10;i++)G.st.races.push({yr:G.yr-1,wk:10,s:"cup",ci:0,ev:"x",trk:"daytona",st:5,f:1,n:38,led:0,fl:0,dnf:"",pts:30,cj:0,oo:0,tmn:"x"});doRetire();doStartTeam("lm","Retired Racing");`),
 free:prep({start:'hobby',age:24,weeks:2},`G.st.seasons.push({yr:G.yr-1,s:"truck",tm:"x",st:20,w:1,pd:3,t5:5,t10:9,pol:1,led:10,fl:0,dnf:2,as:10,af:12,p:500,pos:8,ch:0,oo:0});expireContract();`),
 injured:prep({start:'hobby',age:24,weeks:2},`G.me.inj={n:"broken leg",w:8};G.me.hp=30;G.me.mor=20;G.st.races.push({yr:G.yr,wk:G.wk,s:"hobby",ci:0,ev:"x",trk:"f_cedar",st:2,f:18,n:18,led:0,fl:0,dnf:"Crash",pts:10,cj:0,oo:0,tmn:"x"});`),
 priv:prep({start:'lm',age:19,weeks:40},'G.me.cash=1e5;'),
 proFic:prep({start:'hobby',age:23,weeks:2},`const t=teamsOf("oap").find(t=>!t.r).id;signContract({tm:t,s:"oap",role:"race",yrs:1,start:G.yr,sal:250000,win:0,spon:1,rel:0,n1:false,side:true,pay:0});G.car.spons.push({n:"Fic Co",amt:200000,sat:60,lvl:1,duty:1});G.wk=20;G.S.oap.ci=8;`),
 dirt:prep({start:'dmod',age:20,weeks:24},''),
};
// contexts for system / follow-up events that are only ever scheduled
const SYS={veteran_mentor_followup:['grass','{}'],family_strain_followup:['grass','{}'],payback_result:['grass','{d:entries("hobby").find(e=>e.d!=="me").d}'],engine_debt:['grass','(G.fl.engineDebt=5000,{b:"Test Engines"})'],
 feud_round2:['pro','{d:entries("truck").find(e=>e.d!=="me").d}'],sponsor_bonus_check:['pro','{n:"Happy Co"}'],tv_reality_followup:['top','{}'],illegal_caught:['pro','(G.fl.grayPart=1,{})'],data_scandal:['pro','{}'],suspension_end:['pro','(G.car.sit=true,{})'],
 adviser_result:['top','(G.fl.adviser={amt:100000,n:"X"},{})'],partner_travel:['top','(G.fl.partner="Sam Lee",{n:"Sam Lee"})'],partner_proposal:['top','(G.fl.partner="Sam Lee",{n:"Sam Lee"})'],biz_return:['top','{amt:100000,b:"a tire shop"}'],
 net_callback:['pro','{tm:teamsOf("oap")[3].id}'],debt:['grass','(G.me.cash=-8000,{})'],body_says_no:['top','{}'],team_broke:['top','{tid:G.own[0].tid}'],crossroads:['priv','{}'],title_celebration:['top','{s:"oap",yr:G.yr}']};
let paths=0,covered=0;const missing=[],errs=[];
const ids=R('EVENTS.map(e=>e.id)');
for(const id of ids){
 let base=null,ctxExpr=null;
 if(SYS[id]){base=SYS[id][0];ctxExpr=SYS[id][1];}
 else{for(const k of Object.keys(states)){R(`__setG(JSON.parse(${JSON.stringify(states[k])}))`);R('SCRUB=null');const okc=R(`(function(){const e=EVM["${id}"];const tags=stageTags();if(!e.st.some(t=>tags.indexOf(t)>=0))return null;if(e.not&&e.not.some(t=>tags.indexOf(t)>=0))return null;let c=null;try{c=e.cond?e.cond():{};}catch(x){c=null;}return c?JSON.stringify(c):null;})()`);if(okc){base=k;ctxExpr=okc;break;}}}
 if(!base){missing.push(id);continue;}
 covered++;
 // DFS over choice paths: a path is a list of choice indices
 const stack=[[]];let guard=0;
 while(stack.length&&guard++<200){const path=stack.pop();
  R(`__setG(JSON.parse(${JSON.stringify(states[base])}))`);R('SCRUB=null;EFX=[]');h.errors.length=0;
  R(`G.pending=[];queuePending("${id}",${ctxExpr});runEvent(G.pending[0]);`);
  let ok=true;
  for(let d=0;d<path.length;d++){const cur=h.CUR();if(path[d]>=cur.choices.length){ok=false;break;}R(`pick(${path[d]})`);
   // after a choice: follow plain "Continue" result screens until we're at a new choice screen of the same event or out of it
  }
  if(!ok)continue;
  const cur=h.CUR();const html=cur.html;
  if(/Something went wrong/.test(html)||h.errors.length){errs.push(`${id} path ${path.join('>')}: ${(h.errors[0]||strip(html)).slice(0,300)}`);continue;}
  const stillEvent=R(`G.pending.length&&G.pending[0].id==="${id}"`);
  const evTitle=R(`EVM["${id}"].t`);
  const onEventScreen=html.indexOf('<h2>'+evTitle+'</h2>')>=0&&(stillEvent||path.length===0);
  if(path.length===0||(stillEvent&&onEventScreen)){cur.choices.forEach((c,i)=>{if(!c.dis)stack.push(path.concat([i]));});if(path.length===0&&!cur.choices.filter(c=>!c.dis).length)errs.push(id+': no enabled choices');}
  else{paths++;// terminal: the result screen must offer a way forward
   if(!cur.choices.filter(c=>!c.dis).length)errs.push(`${id} path ${path.join('>')}: dead end`);else{R('pick(0)');if(/Something went wrong/.test(h.CUR().html)||h.errors.length)errs.push(`${id} path ${path.join('>')} continue: ${(h.errors[0]||'').slice(0,300)}`);}}
 }
}
console.log(`events: ${ids.length} defined, ${covered} exercised, ${paths} choice paths, ${errs.length} errors`);
if(missing.length)console.log('NOT TRIGGERABLE from prepared states:',missing.join(', '));
errs.slice(0,15).forEach(e=>console.log('ERR',e));
process.exit(errs.length||missing.length?1:0);
