// Balance check: a "sensible" career bot (trains, races, signs the best offers, moves up) on several ladders.
// Reports the path with ages and checks for implausible stats (e.g. 30-win seasons, instant top-tier arrival).
const {load,strip,quickStart}=require('./harness');
const STARTS=(process.argv[2]||'kclub,hobby,minisp,f4us,legends,dmod').split(',');const YEARS=+process.argv[3]||22;const SEEDRUNS=+process.argv[4]||1;
let fails=[];const summary=[];const agg={st:0,w:0};
for(const start of STARTS)for(let k=0;k<SEEDRUNS;k++){
 const h=load();quickStart(h,{start,age:start[0]==='k'?10:start==='f4us'?15:15,bg:k%2?'sponsor':'middle',traits:['talent',start==='hobby'||start==='legends'?'oval':start==='minisp'||start==='dmod'?'dirt':'road']});h.run('G.set.quick=true');
 const R=s=>h.run(s);let coachI=0;const firsts={};
 for(let w=0;w<52*YEARS;w++){const G=h.G();if(G.over||G.me.retired)break;
  // weekly training
  while(G.car.ap>0){if(G.me.cash>R('coachCost()')*4){R(`EFX=[];G.car.ap--;spend(coachCost(),"c");[["crf","ovt","dfd"],["qul","spd"],["ovl","drf","sht"],["rdc","wet"],["drt","crf"],["tir","con"]][${coachI++%6}].forEach(k=>gainSk(k,.55));`);}
   else if(G.wk%5===0)R('act("spons");if(CUR&&/Sponsor interest/.test(CUR.html))pick(0);');else R(G.wk%2?'act("fit")':'act("sim")');}
  const ev=R('myEvent()');if(ev&&R('canDrive()')){R(`raceWeekend("${ev.sid}",${ev.ci},null)`);R('afterRace()');}else{const oo=R('myOneoff()');if(oo&&R('canDrive()')&&!oo.done){R('raceWeekend(myOneoff().s,myOneoff().ci,myOneoff())');R('afterRace()');}else R('endWeekCore()');}
  // events: pick a random enabled choice, then continue
  let g=0;while(h.G().pending.length&&g++<20){R('continuePending()');const c=h.CUR().choices.map((x,i)=>({x,i})).filter(o=>!o.x.dis);const p=c[Math.floor(Math.random()*c.length)];R(`pick(${p.i})`);let gg=0;while(gg++<5&&/Continue|Back/.test(strip(h.CUR().choices[0].t))&&h.G().pending.length===0)break;}
  // offers: sign the best race seat for a higher or equal tier
  const best=R(`(function(){const cur=G.car.s?SER[G.car.s].tier:0;const o=G.offers.filter(o=>!licenseBlock(o.s)&&(!o.pay||G.me.cash+sponsorCash()>=o.pay)&&o.role!=="reserve"&&SER[o.s].tier>=cur&&!(G.car.next)).sort((a,b)=>SER[b.s].tier-SER[a.s].tier||b.sal-a.sal)[0];if(!o)return null;const buy=buyoutCost(o);if(buy>G.me.cash*.5)return null;if(buy)spend(buy,"b");const con=Object.assign({},o);delete con.int;delete con.asks;delete con.exp;signContract(con);return o.s;})()`);
  if(h.G().pending.length===0&&R('G.pending.length')===0){}
  // crossroads handled above randomly; privateer move-up if affordable and no offer
  R(`(function(){if(G.car.tm==="priv"&&seasonOver()&&!G.fl.nextPriv&&!G.car.next&&G.wk>=40){const nx=(NEXT[G.car.s]||[]).filter(id=>isPriv(id)&&!licenseBlock(id)&&G.me.cash>startCost(id)*SER[id].cal.length*.5);if(nx.length&&champPos(G.car.s,"me")<=3)G.fl.nextPriv=nx[0];}})()`);
  if(!h.G().car.s&&!h.G().me.retired&&h.G().wk===2){R(`(function(){const ops=SERIES_LIST.filter(s=>isPriv(s.id)&&!licenseBlock(s.id)&&!s.oneoff&&G.me.cash>startCost(s.id)*s.cal.length*.4).sort((a,b)=>b.tier-a.tier);if(ops[0])startPriv(ops[0].id);})()`);}
  const G2=h.G();if(G2.car.s){const t=R(`SER["${G2.car.s}"].tier`);if(!firsts[t])firsts[t]={age:G2.me.age,s:G2.car.s};}
  if(h.errors.length){fails.push(start+': '+h.errors[0].slice(0,400));break;}
 }
 const G=h.G();const c=R('careerTotals()');
 const seas=G.st.seasons.filter(s=>!s.oo).map(s=>`${s.yr-2026+R('START_YEAR')-2026+0}`);
 const tops=G.st.seasons.filter(s=>!s.oo&&R(`SER["${s.s}"].tier`)>=7);
 // Real-world ceilings: SVG 2022 won 64% in Supercars, Verstappen 2023 86% in F1. Flag anything above 70% or 22+ wins.
 tops.forEach(s=>{agg.st+=s.st;agg.w+=s.w;if(s.st>=10&&(s.w/s.st>.7||s.w>22))fails.push(`${start}: implausible ${s.w}/${s.st} wins in ${s.yr} ${s.s}`);});
 const ages=Object.keys(firsts).sort((a,b)=>a-b).map(t=>`T${t}:${firsts[t].s}@${firsts[t].age}`).join(' ');
 console.log(`[${start}] age ${G.me.age} OVR ${R('OVR()')} pot ${G.me.pot} starts ${c.st} W ${c.w} titles ${G.st.titles.map(t=>t.yr+t.s).join(',')} cj ${G.st.cj.length} $${Math.round(G.me.cash)} | ${ages}`);
 console.log('   top-level seasons: '+tops.map(s=>`${s.yr} ${s.s} ${s.st}st ${s.w}W ${s.t5}T5 P${s.pos}`).join('; '));
 summary.push({start,top:Math.max(0,...Object.keys(firsts).map(Number))});
}
if(agg.st){const p=agg.w/agg.st;console.log(`top-tier (tier 7+) win rate across all sensible careers: ${agg.w}/${agg.st} = ${Math.round(p*100)}%`);if(p>.3)fails.push('aggregate top-tier win rate above 30%');}
const reachedTop=summary.filter(s=>s.top>=8).length;console.log(`reached tier 8+ in ${reachedTop}/${summary.length} sensible careers`);
if(fails.length){console.log('FAIL');fails.forEach(f=>console.log(' ',f));process.exit(1);}else console.log('balance OK');
