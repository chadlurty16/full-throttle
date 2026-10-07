/* ===================== STORYLINE ENGINE ===================== */
const EVENTS=[],EVM={};
function EV(o){if(o.cd===undefined)o.cd=52;o.w=o.w||1;o.st=o.st||[];EVENTS.push(o);EVM[o.id]=o;}
function queuePending(id,ctx){if(G.pending.some(p=>p.id===id&&JSON.stringify(p.ctx)===JSON.stringify(ctx||{})))return;G.pending.push({id,ctx:ctx||{},step:"start"});}
function later(id,weeks,ctx){G.sched.push({id,at:absWk()+weeks,ctx:ctx||{}});}
function stageTags(){const t=["any"];const m=G.me;t.push(m.retired?"retired":"active");
 if(G.car.s&&!m.retired){const s=SER[G.car.s];t.push(s.disc);t.push(s.tier<=4?"grass":s.tier<=7?"ladder":"top");if(s.tier>=5)t.push("pro");if(G.car.tm==="priv")t.push("priv");else if(G.car.role==="reserve")t.push("reserve");else t.push("team");if(s.rp)t.push("realser");
  const st=G.S[G.car.s];if(st.ci>0&&!seasonOver())t.push("season");else t.push("off");}else if(!m.retired)t.push("free");
 if(m.age<18&&!m.retired)t.push("junior");if((G.own||[]).length)t.push("own");return t;}
function ctxValid(c){for(const k of ["d","d2"])if(c[k]!==undefined&&!G.D[c[k]])return false;for(const k of ["tm","tid"])if(c[k]!==undefined&&!G.TM[c[k]])return false;return true;}
function evAvailable(e){if(!e.st.length)return false;const s=G.evSeen[e.id];if(!s)return true;if(e.once)return false;return absWk()-s.t>=e.cd;}
function markSeen(id){const s=G.evSeen[id]||{n:0};s.n++;s.t=absWk();G.evSeen[id]=s;}
function queueEvents(force){
 const now=absWk();const due=G.sched.filter(s=>s.at<=now);G.sched=G.sched.filter(s=>s.at>now);
 due.forEach(s=>{const e=EVM[s.id];if(!e||!ctxValid(s.ctx))return;if(e.valid&&!e.valid(s.ctx))return;queuePending(s.id,s.ctx);markSeen(s.id);});
 if(force===true)return;
 const tags=stageTags();const n=G.me.retired&&!(G.own||[]).length?1:2;
 for(let i=0;i<n;i++){if(!R.chance(i===0?.3:.08))continue;const cands=[];
  for(const e of EVENTS){if(!evAvailable(e))continue;if(!e.st.some(t=>tags.indexOf(t)>=0))continue;if(e.not&&e.not.some(t=>tags.indexOf(t)>=0))continue;if(G.pending.some(p=>p.id===e.id))continue;let c=null;try{c=e.cond?e.cond():{};}catch(err){c=null;}if(c)cands.push({e,c});}
  const ch=R.wpick(cands,x=>x.e.w);if(ch){queuePending(ch.e.id,ch.c);markSeen(ch.e.id);}}}
function continuePending(){if(G.over)return endScreen();if(G.pending.length)return runEvent(G.pending[0]);hub();}
function runEvent(inst){const e=EVM[inst.id];const drop=()=>{const i=G.pending.indexOf(inst);if(i>=0)G.pending.splice(i,1);};
 if(!e||!ctxValid(inst.ctx)||(e.valid&&!e.valid(inst.ctx))){drop();return continuePending();}
 let st;try{st=e.s[inst.step||"start"](inst.ctx);}catch(err){if(typeof console!=="undefined")console.error(err);drop();return continuePending();}
 if(!st||!st.ch||!st.ch.filter(Boolean).length){drop();return continuePending();}
 const tag=e.tag||"STORYLINE";save();
 show(`<div class="tag">${tag}</div><h2>${e.t}</h2>${st.x.indexOf("<p")===0?st.x:`<p>${st.x}</p>`}`,st.ch.filter(Boolean).map(ch=>({t:ch[0],sub:ch[3]||"",dis:ch[2]||false,cls:ch[4]||"",f:()=>{
  EFX=[];let r;try{r=ch[1](inst.ctx);}catch(err){if(typeof console!=="undefined")console.error(err);r="Things take an unexpected turn.";}
  const txt=typeof r==="string"?r:(r&&r.text)||"";
  if(r&&r.goto)inst.step=r.goto;else{drop();G.stats.events++;}
  G.log.push({yr:G.yr,wk:G.wk,t:e.t,c:String(ch[0]).replace(/<[^>]+>/g,"")});if(G.log.length>200)G.log.shift();
  checkAch();save();
  if(r&&r.screen)return r.screen();
  if(r&&r.goto&&!txt)return runEvent(inst);
  if(!txt&&!EFX.length)return continuePending();
  show(`<div class="tag">${tag}</div><h2>${e.t}</h2><p>${txt}</p>${efxHtml()}`,[{t:"Continue",cls:"hi",f:r&&r.goto?()=>runEvent(inst):continuePending}]);}})));}
/* ---------- context helpers ---------- */
function fieldIds(f){if(!G.car.s)return [];return entries(G.car.s).map(e=>e.d).filter(d=>d!=="me"&&G.D[d]&&!G.D[d].ret&&(!f||f(G.D[d])));}
function anyD(f){const a=fieldIds(f);return a.length?R.pick(a):null;}
// fictional-only pick: used for any off-track drama
function ficD(f){let a=fieldIds(d=>!d.r&&(!f||f(d)));if(!a.length)a=Object.values(G.D).filter(d=>!d.r&&!d.ret&&d.tm&&(!f||f(d))).map(d=>d.id);return a.length?R.pick(a):null;}
function mateId(){const a=G.car.tm&&G.car.tm!=="priv"?teammates(G.car.tm,"me").filter(d=>G.D[d]):[];return a.length?a[0]:null;}
function rivalD(){const a=Object.keys(G.rel).filter(k=>k.startsWith("d:")&&G.rel[k]<=-15&&G.D[k.slice(2)]&&!G.D[k.slice(2)].ret).map(k=>k.slice(2));return a.length?a.sort((x,y)=>G.rel["d:"+x]-G.rel["d:"+y])[0]:null;}
function allyD(){const a=Object.keys(G.rel).filter(k=>k.startsWith("d:")&&G.rel[k]>=20&&G.D[k.slice(2)]&&!G.D[k.slice(2)].ret).map(k=>k.slice(2));return a.length?R.pick(a):null;}
function ccW(){const s=G.car.s?SER[G.car.s]:null;return s&&(s.disc==="open"||s.disc==="sports")?"race engineer":s&&s.disc==="kart"?"kart mechanic":"crew chief";}
function cc(){return esc(G.car.cc||"your "+ccW());}
function ser(){return G.car.s?esc(SER[G.car.s].sh):"racing";}
function tierNow(){return G.car.s?SER[G.car.s].tier:1;}
function cashScale(){return [0,500,1000,2500,5000,15000,40000,80000,150000,300000,600000][tierNow()]||1000;}
function mySponsor(){return G.car.spons.length?G.car.spons[0]:null;}
function D(id){return nmb(id);}
function onTeam(){return G.car.tm&&G.car.tm!=="priv";}
function carUp(v){const t=G.TM[G.car.tm];if(!t)return;t.q=clamp(t.q+v,20,98);const o=ownOf(G.car.tm);if(o)o.q=t.q;EFX.push(["Car rating",v]);}
