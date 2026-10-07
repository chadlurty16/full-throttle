/* ===================== UI FRAMEWORK ===================== */
let FICPREF=false,CUR=null,KEYBUF="",KEYT=null,EFX=[],KBD=false;
const HAS_DOM=typeof document!=="undefined"&&!!document.getElementById;
function show(html,choices,opt){let pend=null;const list=[];(choices||[]).filter(Boolean).forEach(c=>{if(c.sec&&!c.f){pend=c.sec;return;}if(pend){c=Object.assign({},c,{sec:pend});pend=null;}list.push(c);});CUR={html,choices:list,opt:opt||{}};if(!CUR.choices.length)CUR.choices=[{t:"Continue",cls:"hi",f:()=>hub()}];draw();}
function draw(){if(!HAS_DOM)return;const top=document.getElementById("top"),main=document.getElementById("main"),ch=document.getElementById("choices");
 top.innerHTML=inGame()?scrub(statusBar()):`<span class="brand">${esc(GAME_TITLE.toUpperCase())}</span><span class="dim small">${GAME_SUB}</span>`;
 main.innerHTML=scrub(CUR.html);ch.innerHTML="";let grid=null;
 CUR.choices.forEach((c,i)=>{if(c.sec){const h=document.createElement("div");h.className="sec-h";h.textContent=c.sec;ch.appendChild(h);grid=null;}
  const b=document.createElement("button");b.className="ch"+(c.dis?" dis":"")+(c.cls?" "+c.cls:"")+(c.tile?" tile":"");
  const why=c.dis&&typeof c.dis==="string"?`<span class="why">${esc(c.dis)}</span>`:"";
  b.innerHTML=scrub(`<span class="num" aria-hidden="true">${i+1}</span>${c.icon?`<span class="ico">${c.icon}</span>`:""}<span class="lbl">${c.t}${c.sub?`<span class="sub">${c.sub}</span>`:""}${why}</span>`);
  if(!c.dis)b.onclick=()=>pick(i);else b.disabled=true;
  if(c.tile){if(!grid){grid=document.createElement("div");grid.className="tgrid";ch.appendChild(grid);}grid.appendChild(b);}else{grid=null;ch.appendChild(b);}});
 window.scrollTo(0,0);if(KBD){const f=ch.querySelector("button.ch:not([disabled])");if(f)f.focus({preventScroll:true});}}
function pick(i){const c=CUR&&CUR.choices[i];if(!c||c.dis)return;
 if(HAS_DOM){document.querySelectorAll("input[data-k],textarea[data-k],select[data-k]").forEach(el=>{window.__in=window.__in||{};window.__in[el.dataset.k]=el.value;});}
 try{c.f();}catch(err){console.error(err);showError(err);}if(G&&G.me&&!G.over)save();}
function inval(k){return ((typeof window!=="undefined"&&window.__in&&window.__in[k])||"").trim();}
function showError(err){show(`<h2>Something went wrong</h2><p>An unexpected error occurred: <code>${esc(err&&err.message||err)}</code></p><p>Your progress is autosaved. Returning to the dashboard should get you back on track.</p>`,[{t:"Return to dashboard",cls:"hi",f:()=>{if(G&&G.me){G.rc=null;hub();}else title();}}]);}
function inGame(){return !!(G&&G.me&&!G.over);}
/* ---------- display helpers ---------- */
function tip(t){return `<span class="tip" tabindex="0" data-tip="${esc(t)}">?</span>`;}
function mcol(v){return v>=70?"var(--g)":v>=45?"var(--b)":v>=25?"var(--y)":"var(--r)";}
function meter(label,v,hint){v=Math.round(v);return `<div class="meter"><div class="mh"><span class="ml">${label}${hint?tip(hint):""}</span><span class="mv">${v}</span></div><div class="bar"><i style="width:${clamp(v,0,100)}%;background:${mcol(v)}"></i></div></div>`;}
function tiles(arr){return `<div class="tiles">${arr.filter(Boolean).map(x=>`<div class="tile2"><div class="tl">${x.l}</div><div class="tv${x.sm?" sm":""}">${x.v}</div>${x.h?`<div class="th">${x.h}</div>`:""}</div>`).join("")}</div>`;}
function table(cols,rows,cls){return `<div class="tw"><table class="t${cls?" "+cls:""}"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr${r.hl?' class="me"':""}>${(r.cells||r).map(v=>`<td>${v}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="${cols.length}" class="dim">Nothing here yet.</td></tr>`}</tbody></table></div>`;}
function more(html,label){return `<details class="more"><summary>${label||"More details"}</summary><div>${html}</div></details>`;}
function note(html,kind){return `<div class="note${kind?" "+kind:""}">${html}</div>`;}
function pill(t,k){return `<span class="pill${k?" "+k:""}">${t}</span>`;}
function rtier(v){return v>=88?5:v>=78?4:v>=66?3:v>=52?2:v>=38?1:0;}
function rb(v,sz){v=Math.round(v);return `<span class="rb s${rtier(v)}${sz?" "+sz:""}" title="Rating ${v}">${v}</span>`;}
function relTag(key){const v=relOf(key);const k=v>=50?"g":v>=20?"b":v<=-50?"r":v<=-20?"y":"";const l=v>=50?"Close ally":v>=20?"Friendly":v<=-50?"Bitter rival":v<=-20?"Rival":"Neutral";return pill(`${l} ${sgn(v)}`,k);}
function efxHtml(){if(!EFX.length)return "";const m={},order=[];EFX.forEach(e=>{const k=e[0]+"|"+(e[2]||"");if(!(k in m)){m[k]={n:e[0],v:0,t:e[2]};order.push(k);}m[k].v+=e[1];});
 return `<div class="efx">`+order.map(k=>{const e=m[k];if(e.t==="a")return pill(`🏅 ${esc(e.n)}`,"p");if(e.t==="$")return e.v?pill(`${esc(e.n)}: ${e.v>=0?"+":"-"}${money(Math.abs(e.v))}`,e.v>=0?"g":"r"):"";const v=Math.round(e.v*10)/10;if(!v)return "";const good=v>0;return pill(`${e.t==="rel"?"🤝 ":""}${good?"▲":"▼"} ${esc(e.n)} ${sgn(v)}`,good?"g":"r");}).join("")+`</div>`;}
function statusBar(){const m=G.me;const inj=m.inj?`<span class="tb-i r">🩹 ${plural(m.inj.w,"wk")}</span>`:"";const s=G.car.s?SER[G.car.s].sh:(m.retired?"Retired":"No ride");
 return `<span class="tb-n">${esc(m.nick||m.name)}</span>${rb(OVR(),"sm")}<span class="tb-i">📅 ${dateLbl()}</span><span class="tb-i tb-x">Age ${m.age}</span><span class="tb-i">🏁 ${esc(s)}</span><span class="tb-i">${money(m.cash)}</span>${inj}`;}
/* ---------- Save / Load ---------- */
function save(){if(!G)return;try{if(typeof localStorage!=="undefined")localStorage.setItem(SAVE_KEY,JSON.stringify(G));}catch(e){}}
function hasSave(){try{return typeof localStorage!=="undefined"&&!!localStorage.getItem(SAVE_KEY);}catch(e){return false;}}
function loadSave(){try{const s=localStorage.getItem(SAVE_KEY);if(!s)return false;const o=JSON.parse(s);if(!o||!o.me||!o.D)return false;G=o;migrate();return true;}catch(e){return false;}}
function encSave(raw){return btoa(unescape(encodeURIComponent(raw)));}
function exportString(){return encSave(JSON.stringify(G));}
function importString(s){const o=JSON.parse(decodeURIComponent(escape(atob(String(s).replace(/\s+/g,"")))));if(!o||!o.me||!o.D||!o.car)throw new Error("Not a valid "+GAME_TITLE+" save");G=o;migrate();save();}
function migrate(){G.set=G.set||{fic:false};G.notes=G.notes||[];G.sched=G.sched||[];G.pending=G.pending||[];G.own=G.own||[];G.v=G.v||1;SCRUB=null;if(G.v<SAVE_VER)G.v=SAVE_VER;}
function resume(){if(G.over)return endScreen();if(G.rc&&G.rc.phase&&G.rc.phase!=="done")return resumeRace();if(G.pending&&G.pending.length)return continuePending();hub();}
function shareSave(s,fname){try{const f=typeof File!=="undefined"?new File([s],fname,{type:"text/plain"}):null;const p=f&&navigator.canShare&&navigator.canShare({files:[f]})?navigator.share({files:[f],title:GAME_TITLE+" save"}):navigator.share({title:GAME_TITLE+" save",text:s});p.catch(()=>{});}catch(e){}}
function downloadSave(s,fname){try{const u=URL.createObjectURL(new Blob([s],{type:"text/plain"}));const a=document.createElement("a");a.href=u;a.download=fname;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);}catch(e){}}
/* ---------- Title ---------- */
function title(){const cont=hasSave();let sub="";if(cont){try{const o=JSON.parse(localStorage.getItem(SAVE_KEY));sub=`${esc(o.me.name)} · ${o.car&&o.car.s&&SER[o.car.s]?esc(SER[o.car.s].sh):"between rides"} · ${o.yr}`;}catch(e){}}
 show(`<div class="logo-ico">🏁</div><div class="logo">${esc(GAME_TITLE.toUpperCase())}</div><div class="logo2">THE MOTORSPORT CAREER RPG</div>
 <p class="center"><b>From a rented kart or a $500 hobby stock to the Daytona 500, Monaco and the Indy 500.</b></p>
 <p class="center dim">Pick your start and your path. Race every weekend, negotiate every contract, survive every silly season. One day, run your own team.</p>
 <div class="feat"><div><span class="fi">🏎️</span><b>44 championships</b>Karting, short tracks, dirt, NASCAR, IndyCar, F1, sports cars, Formula E, Supercars, NHRA</div><div><span class="fi">📊</span><b>Every stat tracked</b>Starts, wins, poles, laps led, top 5s, titles and crown jewels, race by race</div><div><span class="fi">🔁</span><b>Silly season</b>Rumors, offers, agents, release clauses and seat swaps every year</div><div><span class="fi">🏢</span><b>Team owner</b>Buy a charter, hire drivers and crews, build a dynasty</div></div>
 ${note(`<b>Note:</b> ${esc(GAME_TITLE)} uses the names of real drivers, teams and team owners inside an entirely <b>fictional</b> story. On-track results, rivalries and contract moves are invented; nothing depicts real events or anyone's private life. Prefer made-up names? Turn on <b>Fictional-only mode</b>.`)}`,[
  cont?{t:"Continue Career",sub,cls:"hi",f:()=>{if(loadSave())resume();else title();}}:null,
  {t:"New Career",cls:cont?"":"hi",f:()=>newCareer()},
  {t:"How to Play",f:()=>howTo(title)},
  {t:"Backup &amp; restore saves",sub:"Export your career as a save string, or import one",f:()=>backupScreen()},
  {t:`Fictional-only mode: <b>${FICPREF?"ON":"OFF"}</b>`,sub:"Swap every real driver, team and owner for a generated name (series and tracks stay real)",f:()=>{FICPREF=!FICPREF;try{localStorage.setItem(SAVE_KEY+"_fic",FICPREF?"1":"0");}catch(e){}title();}}]);}
function howTo(back){show(`<h2>How to Play</h2>
 <p>Tap a button, or press its number on the keyboard (two-digit numbers work: type them quickly). Esc goes back.</p><ul>
 <li><b>📅 Weeks:</b> every week you get <b>2 action points</b> (3 in the off-season) for fitness, sim work, test days, coaching, sponsor hunting, media and side jobs. Then race (if your series has an event) or advance the week.</li>
 <li><b>🏎️ Race weekends:</b> choose a setup direction in practice, a qualifying approach, then make strategy calls during the race: starts, pace, tires, pit stops, cautions, restarts, drafting, rain calls and team orders. Car quality, your skills, the track type and luck all matter.</li>
 <li><b>📈 Ratings:</b> your overall is built from 16 skills. They grow slowly with seat time, testing, sim work and coaching, faster when you're young, and decline in your late 30s. The overall shown depends on the discipline you race.</li>
 <li><b>🧗 Career path:</b> results and reputation bring seat offers. Move up your ladder, switch ladders, take a test/reserve role, accept a development deal or buy a ride. F1 needs 40 superlicense points over three seasons. Ages gate some series.</li>
 <li><b>🔁 Silly season:</b> rumors from mid-season, offers in the fall. Negotiate salary, years, win bonuses, sponsor duties, release clauses, #1 status and the right to race elsewhere. Agents help. Leaking rumors creates leverage, and enemies.</li>
 <li><b>🏆 One-offs:</b> the Daytona 500, Indy 500, Le Mans, the Rolex 24, the Chili Bowl, Knoxville, the Snowball Derby, Bathurst and more, if you can find a ride.</li>
 <li><b>🏢 Team ownership:</b> later in your career (or as a driver-owner) start or buy a team in any series you can afford. Hire drivers, crew chiefs and pit crews, find sponsors, develop the car, buy a NASCAR charter.</li>
 <li><b>💾 Saving:</b> autosaves every choice on this device. Export a save string from Settings to back it up.</li></ul>`,[{t:"Back",f:back}]);}
function backupScreen(){const s=hasSave()?localStorage.getItem(SAVE_KEY):null;const day=HAS_DOM?new Date().toISOString().slice(0,10):"";
 show(`<h2>Backup &amp; restore</h2><p>Progress autosaves on this device after every choice. A backup is a save string you keep somewhere else.</p>${tiles([{l:"Career save",v:s?Math.max(1,Math.round(s.length/1024))+" KB":"None",sm:1}])}`,[
  s?{t:"Export career save",f:()=>exportScreen(encSave(s),backupScreen,"career-"+day)}:null,
  {t:"Import a save",sub:"Paste a save string or open a backup file",f:()=>importScreen(backupScreen)},{t:"Back",cls:"hi",f:title}]);}
function importScreen(back){back=typeof back==="function"?back:settingsScreen;
 show(`<h2>Import Save</h2><p>Paste a save string below (or open a backup file), then choose Import. This replaces your current career.</p><textarea id="importBox" data-k="imp" rows="8" placeholder="Paste save string here" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
 <label class="filebtn">📂 Open a backup file<input type="file" id="importFile" accept=".txt,text/plain"></label>`,[
  {t:"Import",cls:"hi",f:()=>{try{importString(inval("imp"));show(`<p>Save imported: <b>${esc(G.me.name)}</b>, ${dateLbl()}.</p>`,[{t:"Continue",cls:"hi",f:resume}]);}catch(e){show(`<p class="r">That save string is invalid.</p>`,[{t:"Try again",f:()=>importScreen(back)},{t:"Back",f:back}]);}}},{t:"Back",f:back}]);
 if(HAS_DOM){const ta=document.getElementById("importBox");if(ta)ta.addEventListener("keydown",e=>e.stopPropagation());const fi=document.getElementById("importFile");if(fi&&ta)fi.addEventListener("change",()=>{const f=fi.files&&fi.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{ta.value=String(r.result||"").trim();};r.readAsText(f);});}}
function exportScreen(s,back,tag){s=typeof s==="string"?s:exportString();back=typeof back==="function"?back:settingsScreen;tag=tag||("career-"+(HAS_DOM?new Date().toISOString().slice(0,10):""));const fname=GAME_TITLE.toLowerCase().replace(/\s+/g,"-")+"-"+tag+".txt";
 const share=HAS_DOM&&typeof navigator!=="undefined"&&!!navigator.share;
 show(`<h2>Export Save</h2><p>Copy this entire string and keep it somewhere safe (${Math.max(1,Math.round(s.length/1024))} KB). Paste it into "Import save" to restore.</p><textarea id="exportBox" readonly rows="8">${s}</textarea>`,[
  {t:"Copy to clipboard",f:()=>{try{const ta=document.getElementById("exportBox");ta.select();if(navigator.clipboard)navigator.clipboard.writeText(s);else document.execCommand("copy");}catch(e){}show(`<p>Copied (if your browser allows clipboard access). Otherwise select the text manually.</p><textarea readonly rows="8">${s}</textarea>`,[{t:"Back",f:back}]);}},
  share?{t:"Share or save to Files",f:()=>shareSave(s,fname)}:null,{t:"Download as a file",sub:fname,f:()=>downloadSave(s,fname)},{t:"Back",f:back}]);}
function settingsScreen(){show(`<h2>Settings</h2>${note("Real driver, team and owner names appear inside a fictional story. Fictional-only mode replaces every real person and team name with a generated one. Series and track names stay real.")}
 ${tiles([{l:"Fictional-only mode",v:G.set.fic?"ON":"OFF"},{l:"Race presentation",v:G.set.quick?"Quick sim":"Full strategy",sm:1},{l:"Save size",v:Math.round(JSON.stringify(G).length/1024)+" KB"}])}`,[
  {t:`Turn fictional-only mode ${G.set.fic?"OFF":"ON"}`,f:()=>{G.set.fic=!G.set.fic;SCRUB=null;settingsScreen();}},
  {t:`Race presentation: switch to ${G.set.quick?"full strategy (practice, qualifying, race calls)":"quick sim (auto-run my races)"}`,f:()=>{G.set.quick=!G.set.quick;settingsScreen();}},
  {t:"Export save string",f:exportScreen},{t:"Import save string",f:()=>importScreen(settingsScreen)},{t:"How to play",f:()=>howTo(settingsScreen)},
  {t:"Quit to title screen",f:()=>{save();title();}},{t:"Back",cls:"hi",f:hub}]);}
/* ---------- Keyboard ---------- */
if(HAS_DOM){document.addEventListener("mousedown",()=>{KBD=false;},true);
 document.addEventListener("keydown",e=>{if(!CUR)return;const tg=e.target&&e.target.tagName;if(tg==="INPUT"||tg==="TEXTAREA"||tg==="SELECT")return;if(e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key;
  if(k==="Escape"||k==="Backspace"){const i=CUR.choices.findIndex(c=>/^(Back|Cancel)\b/.test(String(c.t).replace(/<[^>]+>/g,"")));if(i>=0){e.preventDefault();KBD=true;pick(i);}return;}
  if(k==="Enter"&&CUR.choices.length===1&&!(document.activeElement&&document.activeElement.tagName==="BUTTON")){pick(0);return;}
  if(!/^[0-9]$/.test(k))return;KBD=true;e.preventDefault();const n=CUR.choices.length;
  if(n<=9){const i=parseInt(k,10)-1;if(i>=0)pick(i);return;}
  KEYBUF+=k;clearTimeout(KEYT);const v=parseInt(KEYBUF,10);
  if(v*10>n||KEYBUF.length>=2){KEYBUF="";if(v>=1)pick(v-1);return;}
  KEYT=setTimeout(()=>{const v2=parseInt(KEYBUF,10);KEYBUF="";if(v2>=1)pick(v2-1);},700);});}
