/* ===================== CHARACTER CREATION ===================== */
let SETUP={};
const COLORS=["Midnight blue & safety orange","Black & gold","Fire red & white","Lime green & black","Purple & silver","Sky blue & yellow","Gunmetal grey & neon pink","Day-Glo orange & navy","White & candy-apple red","Forest green & cream"];
const NAT_CHOICES=["USA","CAN","MEX","BRA","ARG","GBR","IRL","FRA","GER","ITA","ESP","NED","BEL","DEN","SWE","FIN","NOR","AUS","NZL","JPN","RSA"];
function inputHook(id){if(!HAS_DOM)return;const i=document.getElementById(id);if(i){i.focus();i.addEventListener("keydown",e=>{e.stopPropagation();if(e.key==="Enter")pick(0);});}}
function crumbs(n){const steps=["Name","Nickname","Age","Nationality","Hometown","Background","Traits","Start","Number","Colors","Confirm"];return `<div class="crumbs">${steps.map((s,i)=>`<span class="${i<n?"done":i===n?"on":""}">${s}</span>`).join("")}</div>`;}
function clean(s,max){return String(s||"").replace(/[<>"]/g,"").slice(0,max||30).trim();}
function newCareer(){SETUP={fic:FICPREF,traits:[]};
 show(`${crumbs(0)}<h2>Who are you?</h2><p>Every champion started as a kid staring through a catch fence. What's your name?</p><p><input type="text" id="nameInput" data-k="name" maxlength="28" placeholder="e.g. Aaron Lurty" autocomplete="off"></p>`,[
  {t:"Confirm name",cls:"hi",f:()=>{SETUP.name=clean(inval("name"),28)||"Aaron Lurty";nickStep();}},{t:"Back",f:title}]);inputHook("nameInput");}
function nickStep(){const ln=SETUP.name.split(" ").slice(-1)[0],fn=SETUP.name.split(" ")[0];const sug=[`"${fn.slice(0,1)}-Train"`,`The ${ln} Express`,`Lights-Out ${ln}`,`Wheelman`,`Hot Rod ${ln}`].map(s=>s.replace(/"/g,""));
 show(`${crumbs(1)}<h2>Nickname</h2><p>Announcers love a nickname. Type one, pick one, or skip it.</p><p><input type="text" id="nickInput" data-k="nick" maxlength="24" placeholder="optional" autocomplete="off"></p>`,[
  {t:"Use this nickname",cls:"hi",f:()=>{SETUP.nick=clean(inval("nick"),24);ageStep();}},...sug.map(s=>({t:esc(s),f:()=>{SETUP.nick=s;ageStep();}})),{t:"No nickname",f:()=>{SETUP.nick="";ageStep();}},{t:"Back",f:newCareer}]);inputHook("nickInput");}
function ageStep(){const opts=[[8,"Kids' karting, Bandoleros, mini sprints"],[10,"Karting, Bandoleros, mini sprints"],[12,"Adds regional karting, Legends, micro sprints"],[14,"Adds hobby stocks, Late Models, Formula Ford, USF Juniors"],[15,"Adds F4, street stocks"],[16,"Adds dirt late models"],[18,"Late starter: everything grassroots"],[21,"Very late start"],[25,"The last possible chance"]];
 show(`${crumbs(2)}<h2>Starting age</h2><p>Start young and you'll develop faster, but the money runs out sooner. Start older and you're behind the curve. Your age decides which series you can enter.</p><p><input type="text" inputmode="numeric" id="ageInput" data-k="age" maxlength="2" placeholder="8 to 25"></p>`,[
  {t:"Use typed age",cls:"hi",f:()=>{const a=parseInt(inval("age"),10);if(!(a>=8&&a<=25))return ageStep();SETUP.age=a;natStep();}},...opts.map(o=>({t:`Age ${o[0]}`,sub:o[1],tile:1,f:()=>{SETUP.age=o[0];natStep();}})),{t:"Back",f:nickStep}]);inputHook("ageInput");}
function natStep(){show(`${crumbs(3)}<h2>Nationality</h2><p>It decides your flag on the timing screen, which fans adopt you, and how some teams see you.</p>`,NAT_CHOICES.map(n=>({t:NAT_N[n],tile:1,f:()=>{SETUP.nat=n;homeStep();}})).concat([{t:"Back",f:ageStep}]));}
function homeStep(){show(`${crumbs(4)}<h2>Hometown</h2><p>Where's home? Your local track will be the closest one to it.</p><p><input type="text" id="homeInput" data-k="home" maxlength="30" placeholder="e.g. Mooresville, NC" autocomplete="off"></p>`,[
  {t:"Confirm hometown",cls:"hi",f:()=>{SETUP.home=clean(inval("home"),30)||"Mooresville, NC";bgStep();}},{t:"Mooresville, NC",f:()=>{SETUP.home="Mooresville, NC";bgStep();}},{t:"Indianapolis, IN",f:()=>{SETUP.home="Indianapolis, IN";bgStep();}},{t:"Knoxville, IA",f:()=>{SETUP.home="Knoxville, IA";bgStep();}},{t:"Back",f:natStep}]);inputHook("homeInput");}
function bgStep(){show(`${crumbs(5)}<h2>Background &amp; funding</h2><p>Racing costs money. Lots of it. Where does yours come from?</p>`,Object.keys(BGS).map(k=>({t:BGS[k][0],sub:BGS[k][1],f:()=>{SETUP.bg=k;SETUP.traits=[];traitStep();}})).concat([{t:"Back",f:homeStep}]));}
function traitStep(){const n=SETUP.traits.length;
 show(`${crumbs(6)}<h2>Driving traits</h2><p>Pick <b>two</b> traits that define how you drive. ${n?`Chosen: <b>${SETUP.traits.map(t=>TRAITS[t][0]).join(", ")}</b>`:""}</p>`,Object.keys(TRAITS).filter(k=>SETUP.traits.indexOf(k)<0).map(k=>({t:TRAITS[k][0],sub:TRAITS[k][1],tile:1,f:()=>{SETUP.traits.push(k);if(SETUP.traits.length>=2)startStep();else traitStep();}}))
  .concat([n?{t:"Reset traits",f:()=>{SETUP.traits=[];traitStep();}}:null,{t:"Back",f:bgStep}]));}
function startCost(sid){const s=SER[sid];return isPriv(sid)?Math.round(s.cost/s.cal.length):s.cost;}
function isPriv(sid){const s=SER[sid];return (s.tier<=4&&s.disc!=="open")||sid==="ff";}
function startStep(){const a=SETUP.age;const cash=BGS[SETUP.bg][2]+(SETUP.bg==="sponsor"?40000:0);
 const groups=[["kart","KARTING"],["stock","SHORT TRACK STOCK CARS"],["dirt","DIRT"],["sports","CLUB ROAD RACING"],["open","OPEN WHEEL"]];const ch=[];
 groups.forEach(([d,lab])=>{let first=true;START_SERIES.filter(id=>SER[id].disc===d).forEach(id=>{const s=SER[id];let dis=false;if(a<s.age)dis=`Minimum age ${s.age}`;else if(s.maxAge&&a>s.maxAge)dis=`Ages ${s.age} to ${s.maxAge} only`;
   else if(!isPriv(id)&&cash<s.cost*.6)dis=`A season costs about ${money(s.cost)}: you can't fund it yet`;
   ch.push({sec:first?lab:null,t:`<b>${esc(s.n)}</b>`,sub:`${esc(s.desc)} · ${isPriv(id)?"Run your own car: about "+money(startCost(id))+" per race":"Pay-to-drive seat: "+money(s.cost)+" per season"}`,dis,f:()=>{SETUP.start=id;numStep();}});first=false;});});
 show(`${crumbs(7)}<h2>Where do you start?</h2><p>Age ${a}, ${esc(BGS[SETUP.bg][0].toLowerCase())}. You can switch paths later: karting to stock cars, dirt to IndyCar, sports cars to Le Mans. Some series need a minimum age or money you don't have yet.</p>`,ch.concat([{t:"Back",f:()=>{SETUP.traits=[];traitStep();}}]));}
function numStep(){show(`${crumbs(8)}<h2>Car number</h2><p>Pick the number you'll carry (0 to 99). Teams may assign another one later.</p><p><input type="text" inputmode="numeric" id="numInput" data-k="num" maxlength="2" placeholder="e.g. 27"></p>`,[
  {t:"Use this number",cls:"hi",f:()=>{const n=parseInt(inval("num"),10);SETUP.num=(n>=0&&n<=99)?n:R.int(2,99);colStep();}},...[3,8,11,24,42,88].map(n=>({t:"#"+n,tile:1,f:()=>{SETUP.num=n;colStep();}})),{t:"Back",f:startStep}]);inputHook("numInput");}
function colStep(){show(`${crumbs(9)}<h2>Colors</h2><p>Your helmet, your firesuit, and (when you own the car) your paint scheme.</p>`,COLORS.map(c=>({t:c,tile:1,f:()=>{SETUP.col=c;confirmStep();}})).concat([{t:"Back",f:numStep}]));}
function confirmStep(){const s=SER[SETUP.start];show(`${crumbs(10)}<h2>Confirm your driver</h2>
 ${tiles([{l:"Name",v:esc(SETUP.name),sm:1,h:SETUP.nick?`"${esc(SETUP.nick)}"`:""},{l:"Age",v:SETUP.age},{l:"From",v:esc(SETUP.home),sm:1,h:NAT_N[SETUP.nat]},{l:"Background",v:BGS[SETUP.bg][0],sm:1},{l:"Traits",v:SETUP.traits.map(t=>TRAITS[t][0]).join(" + "),sm:1},{l:"Starting series",v:esc(s.sh),sm:1,h:esc(s.n)},{l:"Car",v:"#"+SETUP.num,sm:1,h:esc(SETUP.col)}])}
 ${note(`Fictional-only mode is <b>${SETUP.fic?"ON":"OFF"}</b>. ${SETUP.fic?"All real drivers, teams and owners get generated names.":"Real names appear in a fictional story; you can change this any time in Settings."}`)}`,[
  {t:"Start my career",cls:"hi xl",f:()=>{newGame(SETUP);intro();}},{t:`Fictional-only mode: ${SETUP.fic?"ON":"OFF"} (toggle)`,f:()=>{SETUP.fic=!SETUP.fic;confirmStep();}},{t:"Back",f:colStep}]);}
function newGame(o){
 G={v:SAVE_VER,set:{fic:!!o.fic,quick:false},yr:START_YEAR,wk:0,nid:1,ntid:1,news:[],notes:[],rel:{},fl:{},evSeen:{},pending:[],sched:[],log:[],offers:[],rumors:[],own:[],ach:{},stats:{events:0,injuries:0,crashes:0,pens:0},over:false,rc:null,
  me:{name:o.name||"Aaron Lurty",nick:o.nick||"",age:o.age||14,nat:o.nat||"USA",home:o.home||"Mooresville, NC",bg:o.bg||"middle",traits:(o.traits||["talent","charger"]).slice(0,2),num:o.num===undefined?27:o.num,col:o.col||COLORS[0],
   sk:{},pot:0,cash:0,earned:0,rep:5,fame:2,mor:65,hp:100,inj:null,slp:[],retired:false,agent:null,sim:0,disc:SER[o.start||"kclub"].disc},
  car:{s:null,tm:null,con:null,next:null,role:null,dev:null,oneoffs:[],ap:2,testB:0,cc:null,co:[],sit:false,spons:[]},
  st:{races:[],seasons:[],cj:[],titles:[]}};
 const m=G.me;const base=24+(clamp(m.age,8,25)-8)*1.3;SK.forEach(k=>{m.sk[k]=clamp(Math.round(base+R.f(-4,4)),8,60);});
 const bg=BGS[m.bg];for(const k in bg[4])m.sk[k]+=bg[4][k];m.traits.forEach(t=>{const fx=TRAITS[t][2];for(const k in fx)m.sk[k]+=fx[k];});
 const disc=SER[o.start||"kclub"].disc;const spec={kart:["rdc","ovt"],stock:["sht","ovl"],dirt:["drt","crf"],sports:["rdc","tir"],open:["rdc","qul"]}[disc]||[];spec.forEach(k=>m.sk[k]+=5);
 SK.forEach(k=>m.sk[k]=clamp(m.sk[k],5,70));m.pot=R.int(76,89)+(hasTrait("talent")?5:0);m.cash=bg[2];m.rep=5+bg[5];m.fame=2;
 if(m.bg==="sponsor")G.car.spons.push({n:R.pick(SPONSOR_FIC),amt:40000,sat:60,lvl:1});
 buildWorld();
 const sid=o.start||"kclub";joinPrivOrPay(sid,true);
 addNews(`${m.name} (age ${m.age}, ${m.home}) begins a racing career in ${SER[sid].n}.`,true);
 G.car.ap=3;save();}
function joinPrivOrPay(sid,initial){const s=SER[sid];
 if(isPriv(sid)){let t=G.TM.priv;const q=clamp(s.ql+({rich:7,middle:-2,broke:-8,sponsor:0}[G.me.bg]||0)+(initial?0:2),25,90);
  if(!t)t=newTeam({id:"priv",n:G.me.name.split(" ").slice(-1)[0]+" Family Racing",s:sid,q,ow:G.me.name,r:0,priv:1});else{t.s=sid;t.q=Math.max(q,Math.min(t.q,s.ql+8));t.cars=[];}
  t.cars=[{num:G.me.num,d:"me"}];if(entries(sid).length>s.field){const x=teamsOf(sid).filter(tt=>!tt.r&&!tt.priv&&!tt.own&&tt.cars.length===1&&tt.cars[0].d!=="me"&&!myTeamLink(tt.id)).sort((a,b)=>a.q-b.q)[0];if(x){x.cars.forEach(c=>{const id=c.d;if(id){freeDriver(id);G.D[id].cy=0;}});foldTeam(x.id);}}G.car.s=sid;G.car.tm="priv";G.car.role="race";G.car.con={tm:"priv",s:sid,yrs:1,end:G.yr,sal:0,win:0,spon:0,rel:0,n1:true,side:true,pay:0,priv:true};G.car.cc=G.car.cc||genStaff("cc"+G.yr);return true;}
 // pay ride with a fictional team
 const tms=teamsOf(sid).filter(t=>!t.r||!SER[sid].rp).sort((a,b)=>a.q-b.q);const t=tms[Math.floor(tms.length*R.f(.35,.75))]||tms[0];
 const cost=s.cost;signContract({tm:t.id,s:sid,yrs:1,end:G.yr,sal:0,win:0,spon:1,rel:0,n1:false,side:true,pay:cost});return true;}
function intro(){const m=G.me,s=SER[G.car.s];const c=s.cal[0];
 show(`<div class="tag">YOUR STORY BEGINS</div><h2>${esc(m.name)}${m.nick?` <span class="dim">"${esc(m.nick)}"</span>`:""}</h2>
 <p>It's January ${G.yr} in ${esc(m.home)}. You're ${m.age}. ${m.bg==="rich"?"There's a brand-new trailer in the driveway and a family credit card in your firesuit pocket.":m.bg==="broke"?"The trailer has a bad tire and the engine came out of a junkyard. You built most of the car yourself.":m.bg==="sponsor"?`A local business, ${esc(G.car.spons[0]?G.car.spons[0].n:"a local business")}, has its decal on your car and its faith in you.`:"Your parents have emptied a savings account to get you here. Nobody says it, but everybody knows."}</p>
 <p>This season: <b>${esc(s.n)}</b> with <b>${esc(tn(G.car.tm))}</b>, car #${G.car.con&&G.car.tm!=="priv"?G.TM[G.car.tm].cars.find(x=>x.d==="me").num:m.num}. The opener is at ${esc(tkn(c[0]))} on ${wkDate(c[1])}.</p>
 ${statGrid()}
 ${note("Each week you have action points for training, sim work, testing, sponsors and media. Race weekends happen automatically when your series has an event. Check your dashboard for goals and offers.")}`,[{t:"To the dashboard",cls:"hi",f:hub}]);}
function statGrid(){const m=G.me;return `<div class="sgrid">${SK.map(k=>`<div class="srow"><span>${SKN[k]}</span><div class="sbar"><i style="width:${m.sk[k]}%;background:${mcol(m.sk[k])}"></i></div><b>${Math.round(m.sk[k])}</b></div>`).join("")}</div>`;}
