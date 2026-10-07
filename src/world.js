/* ===================== WORLD: drivers, teams, series state ===================== */
const AGE_R={kclub:[7,13],kreg:[9,15],knat:[11,17],kint:[13,17],hobby:[16,55],pure:[16,55],street:[17,50],lm:[15,40],slm:[16,40],band:[8,16],legends:[12,30],minisp:[10,25],microsp:[12,30],dmod:[16,50],dlm:[17,45],sprint360:[16,40],midget:[16,28],lolmds:[20,45],woo:[20,45],hlr:[20,45],
 miata:[18,55],ff:[15,28],f4us:[15,18],f4it:[15,17],usfj:[14,17],usf2:[15,19],usfp:[16,21],nxt:[17,24],indycar:[21,40],freca:[16,19],f3:[17,21],f2:[18,24],f1:[19,40],arca:[16,30],truck:[18,40],oap:[19,38],cup:[21,42],imsagtd:[20,50],wecgt:[20,50],imsagtp:[24,45],wec:[24,45],fe:[23,40],supercars:[20,40],nhra:[25,60]};
const NATR={f4it:"eu",freca:"eu",f3:"eu",f2:"eu",f1:"eu",kint:"eu",wec:"intl",wecgt:"eu",fe:"intl",supercars:"aus",imsagtd:"intl"};
function slugId(s){return "r_"+String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");}
function parseTr(s){const o={o:0,r:0,d:0,w:0};String(s||"").replace(/([ordw])(-?\d+)/g,(m,k,v)=>{o[k]=+v;});return o;}
function fic(){return !!(G&&G.set&&G.set.fic);}
function newDriver(o){const id=o.id||("f"+(G.nid++));const d=Object.assign({id,n:"",nat:"USA",by:G.yr-25,o:50,pot:55,dv:{o:0,r:0,d:0,w:0},r:0,s:null,tm:null,num:null,ag:R.f(.3,.7),cy:R.int(1,3),c:{st:0,w:0,t5:0,pol:0,tt:0,cj:0}},o);d.id=id;G.D[id]=d;return d;}
function genDriverFor(sid,extra){const s=SER[sid];const ar=AGE_R[sid]||[18,35];const nat=R.pick(NAT_MIX[NATR[sid]||(s.lad==="open-eu"?"eu":"us")]);const age=R.int(ar[0],ar[1]);
 const youth=clamp((26-age)/14,0,1);let o=clamp(Math.round(s.lvl+R.gauss()*5.5),15,93);const pot=clamp(Math.round(o+R.f(0,20)*youth+R.f(-2,4)),o,96);
 const dv={o:R.int(-4,4),r:R.int(-4,4),d:R.int(-4,4),w:R.int(-5,5)};if(s.disc==="dirt")dv.d+=R.int(2,6);if(s.disc==="open")dv.r+=R.int(1,4);
 return newDriver(Object.assign({n:genName(nat),nat,by:G.yr-age,o,pot,dv,ag:R.f(.2,.85),cy:R.int(1,3)},extra||{}));}
function newTeam(o){const id=o.id||(o.s+"_t"+(G.ntid++));const t=Object.assign({id,n:"",s:null,mfr:"",q:60,ow:"",r:0,cars:[]},o);t.id=id;G.TM[id]=t;return t;}
function ficTeamName(seed,s){const sur=hpick(LN.USA.concat(LN.GBR,LN.ITA,LN.GER),seed+"tn");if(s&&s.lad==="open-eu"&&s.tier>=9)return sur+" Grand Prix";return sur+" "+hpick(TEAM_SUFFIX,seed+"sx");}
function seatDriver(tid,num,did){const t=G.TM[tid];const d=G.D[did];if(!t||!d)return;t.cars.push({num,d:did});d.s=t.s;d.tm=tid;d.num=num;}
function freeDriver(did){const d=G.D[did];if(!d||!d.tm)return;d.ls=d.s;const t=G.TM[d.tm];if(t){const c=t.cars.find(c=>c.d===did);if(c)c.d=null;}d.tm=null;d.s=null;d.num=null;}
function buildWorld(){
 G.D={};G.TM={};G.S={};G.nid=1;G.ntid=1;G.hist={};
 for(const s of SERIES_LIST){
  G.hist[s.id]=[];if(s.oneoff){continue;}
  const real=REAL[s.id];let count=0;
  if(real){real.forEach((t,ti)=>{const tm=newTeam({id:s.id+"_"+ti,n:t[0],s:s.id,mfr:t[1],q:t[2]+R.int(-1,1),ow:t[3],r:1});
   t[4].forEach(c=>{let d;if(c[1]){const id=slugId(c[1])+(G.D[slugId(c[1])]?"_"+s.id:"");d=newDriver({id,n:c[1],nat:c[2],by:c[3],o:c[4],pot:Math.max(c[4],c[4]+Math.max(0,(24-(G.yr-c[3])))*1.2),dv:parseTr(c[5]),r:1,ag:R.f(.35,.7),cy:R.int(1,3),co:c.slice(6)});}
    else d=genDriverFor(s.id);
    if(s.endur&&!d.co){d.co=[genName(d.nat)];if(s.tier>=8)d.co.push(genName(R.pick(NAT_MIX.intl)));}
    seatDriver(tm.id,c[0],d.id);count++;});});}
  // fill to field size with fictional entries
  let k=0;const grass=s.tier<=4&&!s.rp;
  while(count<s.field){const seed=s.id+k;let tm;
   if(grass||!real||k%2===0){tm=newTeam({s:s.id,n:"",mfr:s.mfr?R.pick(s.mfr):"",q:clamp(Math.round(s.ql+R.gauss()*7-(real?6:0)),25,92),ow:"",r:0});}
   else tm=G.TM[Object.keys(G.TM).filter(id=>G.TM[id].s===s.id&&!G.TM[id].r).slice(-1)[0]]||newTeam({s:s.id,q:s.ql-5,r:0});
   const d=genDriverFor(s.id);if(s.endur&&!d.co)d.co=[genName(d.nat)];
   if(!tm.n){tm.n=grass?(d.n.split(" ").slice(-1)[0]+" "+R.pick(["Racing","Motorsports","Family Racing","Speed Shop"])):ficTeamName(seed,s);tm.ow=grass?d.n:genName("USA");}
   seatDriver(tm.id,usedNum(s.id),d.id);count++;k++;}
 }
 // part-time Indy 500 entries are kept as free agents with an Indy flag
 INDY500_EXTRA.forEach(x=>{const d=newDriver({id:slugId(x[0]),n:x[0],nat:x[1],by:x[2],o:x[3],pot:x[3],dv:{o:3,r:0,d:0,w:0},r:1,i5:{tm:x[4],num:x[5]}});d.cy=9;});
 // a pool of fictional free agents
 for(let i=0;i<30;i++){const sid=R.pick(["truck","oap","arca","f3","f2","nxt","imsagtd","woo","lm","slm"]);const d=genDriverFor(sid);d.cy=0;d.ls=sid;}
 assignAliases();
 for(const s of SERIES_LIST)resetSeriesState(s.id);
}
function usedNum(sid){const used=new Set();Object.values(G.TM).forEach(t=>{if(t.s===sid)t.cars.forEach(c=>used.add(String(c.num)));});for(let i=0;i<500;i++){const n=R.int(2,99);if(!used.has(String(n)))return n;}return R.int(100,999);}
function assignAliases(){for(const id in G.D){const d=G.D[id];if(d.r&&!d.fa)d.fa=genName(NAT_POOL[d.nat]?d.nat:"USA",id);if(d.co&&d.r&&!d.cofa)d.cofa=d.co.map(n=>genName("USA",n));}
 for(const id in G.TM){const t=G.TM[id];if(t.r&&!t.fa){t.fa=ficTeamName(t.n,SER[t.s]);t.ofa=genName("USA",t.ow);}}SCRUB=null;}
function resetSeriesState(sid){G.S[sid]={yr:G.yr,ci:0,res:[],tab:{},chase:null,done:false,champ:null};}
/* ---------- names ---------- */
function nm(id){if(id==="me")return G.me.name;const d=G.D[id];if(!d)return "a former rival";if(d.r&&fic())return d.fa;return d.n;}
function nmShort(id){const n=nm(id);const p=n.split(" ");return p.length>1?p.slice(1).join(" "):n;}
function nmb(id){return `<b>${esc(nm(id))}</b>`;}
function tn(tid){const t=G.TM[tid];if(!t)return "an independent team";if(t.r&&fic())return t.fa;return t.n;}
function towner(tid){const t=G.TM[tid];if(!t)return "the team owner";if(t.r&&fic())return t.ofa;return t.ow||"the team owner";}
function coNames(d){if(!d.co)return [];return d.r&&fic()&&d.cofa?d.cofa:d.co;}
let SCRUB=null;
function buildScrub(){const pairs=[];for(const id in G.D){const d=G.D[id];if(d.r){pairs.push([d.n,d.fa]);if(d.co&&d.cofa)d.co.forEach((c,i)=>pairs.push([c,d.cofa[i]]));}}
 for(const id in G.TM){const t=G.TM[id];if(t.r){pairs.push([t.n,t.fa]);if(t.ow)pairs.push([t.ow,t.ofa]);}}
 INDY500_EXTRA.forEach(x=>{if(!pairs.some(p=>p[0]===x[4]))pairs.push([x[4],ficTeamName(x[4])]);});
 // a few real names that may appear inside story text
 [["Michael Jordan","Marcus Jordane"],["Dale Earnhardt Jr.","Dale Earnwood Jr."]].forEach(p=>pairs.push(p));
 pairs.sort((a,b)=>b[0].length-a[0].length);const map={};pairs.forEach(p=>{if(p[0]&&p[1]&&!(p[0] in map))map[p[0]]=p[1];});
 const keys=Object.keys(map).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));SCRUB={re:keys.length?new RegExp(keys.join("|"),"g"):null,map};}
function scrub(s){if(!fic()||!G||!G.D)return s;if(!SCRUB)buildScrub();if(!SCRUB.re)return s;return String(s).replace(SCRUB.re,m=>SCRUB.map[m]||m);}
/* ---------- queries ---------- */
function entries(sid){const out=[];for(const id in G.TM){const t=G.TM[id];if(t.s!==sid)continue;t.cars.forEach(c=>{if(c.d)out.push({d:c.d,tm:id,num:c.num});});}return out;}
function teamsOf(sid){return Object.values(G.TM).filter(t=>t.s===sid);}
function age(d){return d==="me"?G.me.age:G.yr-G.D[d].by;}
function teammates(tid,except){const t=G.TM[tid];if(!t)return [];return t.cars.map(c=>c.d).filter(x=>x&&x!==except);}
function standings(sid){const st=G.S[sid];if(!st)return [];const rows=Object.keys(st.tab).map(id=>Object.assign({id},st.tab[id]));
 rows.sort((a,b)=>{if(st.chase){const ia=st.chase.indexOf(a.id)>=0,ib=st.chase.indexOf(b.id)>=0;if(ia!==ib)return ia?-1:1;}return b.p-a.p||b.w-a.w||(a.best||99)-(b.best||99);});return rows;}
function champPos(sid,id){const r=standings(sid);const i=r.findIndex(x=>x.id===id);return i>=0?i+1:0;}
function seriesTierName(t){return t>=9?"Top tier":t>=7?"National / international":t>=5?"Pro ladder":t>=3?"National grassroots":"Local grassroots";}

/* A team the player is tied to (offer, signed future deal, current ride) must never fold. */
function myTeamLink(tid){return (G.car&&(G.car.tm===tid||(G.car.next&&G.car.next.tm===tid)))||(G.offers||[]).some(o=>o.tm===tid);}
function foldTeam(tid){delete G.TM[tid];G.offers=(G.offers||[]).filter(o=>o.tm!==tid);if(G.car&&G.car.next&&G.car.next.tm===tid)G.car.next=null;}
