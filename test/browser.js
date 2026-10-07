// Headless Chrome walkthrough of the real HTML file: customization, grassroots race weekend (full strategy), full season,
// silly-season negotiation, move to the Cup Series, team ownership, reload/Continue, export/import, fictional-only mode,
// keyboard (single and two-digit, Esc), phone layout. Saves screenshots.
const {chromium}=require('playwright-core');
const path=require('path'),fs=require('fs');
const FILE='file://'+path.resolve(__dirname,'../racing_career.html');
const SS=path.resolve(__dirname,'../screenshots')+'/';fs.mkdirSync(SS,{recursive:true});
let checks=0,fails=0;const log=(...a)=>console.log(...a);
const ok=(c,m)=>{checks++;if(!c){fails++;log('FAIL:',m);}else log('ok:',m);};
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await browser.newContext({viewport:{width:1000,height:1300}});
 const page=await ctx.newPage();
 const errs=[];page.on('pageerror',e=>errs.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
 await page.goto(FILE);
 const txt=async()=>await page.innerText('#main');
 const btns=async()=>Promise.all((await page.$$('button.ch')).map(b=>b.innerText()));
 const clickText=async(re0,opt)=>{const re=new RegExp(re0.source,re0.flags.includes('i')?re0.flags:re0.flags+'i');const bs=await page.$$('button.ch:not(.dis)');for(const b of bs){const t=(await b.innerText()).replace(/^\d+\s*/,'').replace(/^[^A-Za-z0-9#$"'(]+/,'');if(re.test(t)){await b.click();await page.waitForTimeout(20);return t;}}if(opt)return null;throw new Error('no button '+re+' among: '+(await btns()).map(s=>s.replace(/\n/g,' ')).join(' | ')+'\nTEXT: '+(await txt()).slice(0,300));};
 const errScreen=async()=>/Something went wrong/.test(await txt());
 const atHub=async()=>(await btns()).some(x=>/Advance to next week|Race weekend:|One-off:/i.test(x));
 const toHub=async(max=80)=>{for(let i=0;i<max;i++){if(await atHub())return true;const r=await clickText(/^Continue$|^Back to the dashboard|^To the dashboard|^Back$/,true);if(!r){const bs=await page.$$('button.ch:not(.dis)');if(!bs.length)return false;await bs[0].click();await page.waitForTimeout(20);}}return false;};
 // ---------- Title ----------
 ok(/FULL THROTTLE/i.test(await page.innerText('body')),'title screen renders');
 ok(/fictional/i.test(await page.innerText('body')),'real-names disclaimer visible');
 // ---------- Customization ----------
 await clickText(/New Career/);
 await page.fill('#nameInput','Aaron Lurty');await clickText(/Confirm name/);
 await page.fill('#nickInput','Full Send');await clickText(/Use this nickname/);
 await page.fill('#ageInput','14');await clickText(/Use typed age/);
 await clickText(/^American/);
 await page.fill('#homeInput','Concord, NC');await clickText(/Confirm hometown/);
 await clickText(/Middle class/);
 await clickText(/Natural talent/);await clickText(/Hard charger/);
 ok(/Where do you start/i.test(await txt()),'starting-series screen');
 const startBtns=await btns();ok(startBtns.some(b=>/Hobby Stock/.test(b))&&startBtns.some(b=>/Club Karting/i.test(b))&&startBtns.some(b=>/Mini Sprints/.test(b)),'karting, hobby stock and dirt starts offered');
 await clickText(/Hobby Stock \(weekly\)/);
 await page.fill('#numInput','27');await clickText(/Use this number/);
 await clickText(/Midnight blue/);
 ok(/Aaron Lurty/.test(await txt())&&/Full Send/.test(await txt())&&/Hobby Stock/.test(await txt()),'confirm screen shows the custom driver');
 await page.screenshot({path:SS+'01_customization.png',fullPage:true});
 await clickText(/Start my career/);
 ok(/YOUR STORY BEGINS/.test(await txt()),'intro story');
 await toHub();ok(await atHub(),'dashboard reached');
 ok(await page.evaluate(()=>G.me.name==="Aaron Lurty"&&G.me.nick==="Full Send"&&G.me.num===27&&G.me.age===14&&G.car.s==="hobby"),'customization stored in state');
 // ---------- Keyboard ----------
 {const b=await btns();ok(b.length>=10,'dashboard has 10+ choices');const lab10=b[9].replace(/^\d+\s*/,'').split('\n')[0];
  await page.keyboard.press('1');await page.keyboard.press('0');await page.waitForTimeout(700);
  const changed=!(await atHub());ok(changed,'two-digit key "10" opened: '+lab10);
  await page.keyboard.press('Escape');await page.waitForTimeout(100);ok(await atHub(),'Esc goes back to the dashboard');
  await page.keyboard.press('1');await page.waitForTimeout(700);ok(/This week|action point/i.test(await txt()),'single key "1" opened weekly activities');await page.keyboard.press('Escape');await page.waitForTimeout(100);await toHub();}
 // ---------- Weekly activity ----------
 await clickText(/Train, test/);await clickText(/Fitness training/);ok(/Fitness/.test(await txt()),'did a weekly activity');await toHub();
 // ---------- Grassroots race weekend, full strategy ----------
 for(let i=0;i<30&&!(await btns()).some(x=>/Race weekend:/.test(x));i++){if(!(await clickText(/Skip ahead to the next race week/,true)))await clickText(/Advance to next week/,true);await toHub();}
 ok((await btns()).some(x=>/Race weekend:/.test(x)),'race week arrives');
 await clickText(/Race weekend:/);ok(/HOBBY STOCK/i.test(await txt())&&/Forecast/i.test(await txt()),'race preview');
 await clickText(/Practice: race setup/);ok(/Setup:/.test(await txt()),'practice result');
 await clickText(/On to qualifying/);await clickText(/Push for a strong lap/);ok(/Qualifying results/i.test(await txt()),'qualifying results');
 await clickText(/Go racing/);
 let segs=0;for(let i=0;i<12;i++){const t=await txt();if(/RESULTS ·/.test(t))break;if(/Lap \d+ of|green flag|rolls two-by-two/i.test(t)){segs++;if(segs===2)await page.screenshot({path:SS+'02_race_strategy_grassroots.png',fullPage:true});}const r=await clickText(/Race hard but smart|Clean start|Settle in|Push the pace|Stay out|Pit for four|Hug the bottom|Ride high/,true);if(!r){const bs=await page.$$('button.ch:not(.dis)');await bs[0].click();await page.waitForTimeout(20);}}
 ok(/RESULTS ·/.test(await txt()),'race results after '+segs+' strategy decisions');ok(/standings/i.test(await txt()),'results include championship standings');
 await page.screenshot({path:SS+'03_results_standings.png',fullPage:true});
 ok(await page.evaluate(()=>G.st.races.length===1&&G.S.hobby.tab.me&&G.S.hobby.tab.me.st===1),'race stats recorded');
 await clickText(/^Continue$/);await toHub();
 // ---------- Full season (quick-sim mode via Settings) ----------
 await clickText(/Settings/);await clickText(/Race presentation: switch to quick/);await clickText(/^Back$/);
 for(let i=0;i<400&&!(await page.evaluate(()=>G.S.hobby.done));i++){if(await errScreen())break;if(await atHub()){const r=await clickText(/Race weekend:/,true);if(!r)await clickText(/Advance to next week/);}else{const r=await clickText(/^Continue$|Back to the dashboard|Back to the team/,true);if(!r){const bs=await page.$$('button.ch:not(.dis)');await bs[0].click();await page.waitForTimeout(15);}}}
 ok(await page.evaluate(()=>G.S.hobby.done&&G.S.hobby.tab.me.st>=14),'played a full Hobby Stock season: '+await page.evaluate(()=>G.S.hobby.tab.me.st+' starts, '+G.S.hobby.tab.me.w+' wins, P'+champPos("hobby","me")));
 ok(!(await errScreen()),'no error screens during season');
 await toHub();
 await clickText(/^Standings/);ok(/Hobby Stock/i.test(await txt())&&(await page.$$('table.t tbody tr')).length>=18,'full-field standings table');await clickText(/^Back$/);await toHub();
 await clickText(/Career stats/);ok(/Starts/i.test(await txt())&&/Wins/i.test(await txt()),'career stats screen');
 await page.screenshot({path:SS+'04_career_stats.png',fullPage:true});
 await clickText(/Season by season/);ok(/Hobby Stock/.test(await txt()),'season-by-season table');await clickText(/^Back$/);await clickText(/^Back$/);await toHub();
 // ---------- Silly season: offers + negotiation ----------
 await page.evaluate(()=>{G.me.age=20;G.me.sk=Object.fromEntries(SK.map(k=>[k,Math.max(G.me.sk[k],72)]));G.me.rep=55;G.st.seasons.push({yr:G.yr,s:"slm",tm:"x",st:12,w:6,pd:9,t5:10,t10:12,pol:5,led:300,fl:3,dnf:0,as:2,af:2.5,p:600,pos:1,ch:1,oo:0});G.S.hobby.tab.me={p:0,st:0,w:0,pd:0,t5:0,t10:0,pol:0,dnf:0,led:0,sf:0,best:99};G.car.s=null;G.car.con=null;removeMe();G.offers=[];const t=teamsOf("arca").sort((a,b)=>b.q-a.q)[1];G.offers.push(mkOffer(t,"race",{start:G.yr+1,int:70}));generateOffers("eos");hub();});
 await clickText(/Contracts &amp; offers|Contracts & offers/);ok(/OFFERS/.test((await btns()).join(' ')+await page.innerText('#choices')),'offers listed');
 await clickText(/ARCA/);ok(/Negotiation/i.test(await txt()),'negotiation screen');
 await clickText(/Ask for another year|Ask for a shorter deal/);await clickText(/Keep negotiating/);
 await page.screenshot({path:SS+'05_silly_season_offer.png',fullPage:true});
 await clickText(/Accept and sign/);{const tt=await txt();ok(/sign|deal|welcome/i.test(tt),'contract signed screen: '+tt.slice(0,120).replace(/\n/g,' '));};
 ok(await page.evaluate(()=>G.car.next&&G.car.next.s==="arca"),'signed with an ARCA team for next season');
 await toHub();
 // silly season news after AI moves
 await page.evaluate(()=>{G.wk=50;processSillySeason();hub();});
 await clickText(/News/);ok(/🔁/.test(await txt()),'silly-season moves in the news feed');await clickText(/^Back$/);await toHub();
 // ---------- Move into a top series: Cup ----------
 await page.evaluate(()=>{G.car.next=null;G.yr++;G.wk=5;for(const s of SERIES_LIST)resetSeriesState(s.id);G.me.age=25;G.me.sk=Object.fromEntries(SK.map(k=>[k,84]));const t=teamsOf("cup").filter(t=>t.r).sort((a,b)=>b.q-a.q)[6];G.offers=[mkOffer(t,"race",{start:G.yr,int:80})];G.set.quick=false;hub();});
 await clickText(/Contracts/);await clickText(/Cup Series/);await clickText(/Accept and sign/);await toHub();
 ok(await page.evaluate(()=>G.car.s==="cup"&&entries("cup").some(e=>e.d==="me")),'now driving in the NASCAR Cup Series');
 let pitShot=false;
 for(let race=0;race<4&&!pitShot;race++){
  for(let i=0;i<10&&!(await btns()).some(x=>/Race weekend:/.test(x));i++){await clickText(/Advance to next week|Skip ahead/,true);await toHub();}
  await clickText(/Race weekend:/);await clickText(/Practice: balanced/);await clickText(/On to qualifying/);await clickText(/Clean, safe lap/);await clickText(/Go racing/);
  for(let i=0;i<14;i++){const t=await txt();if(/RESULTS ·/.test(t))break;const b=await btns();if(!pitShot&&b.some(x=>/Pit for four tires|Two tires/.test(x))){await page.screenshot({path:SS+'02_race_strategy.png',fullPage:true});pitShot=true;}
   const r=await clickText(/Pit for four tires|Race hard but smart|Clean start|Settle in|Push to the front/,true);if(!r){const bs=await page.$$('button.ch:not(.dis)');await bs[0].click();await page.waitForTimeout(20);}}
  ok(/RESULTS ·/.test(await txt()),`Cup race ${race+1} completed`);await clickText(/^Continue$/);await toHub();}
 if(!pitShot)await page.screenshot({path:SS+'02_race_strategy.png',fullPage:true});
 ok(pitShot,'saw a caution pit-strategy decision in Cup');
 // ---------- Team ownership ----------
 await page.evaluate(()=>{G.me.cash=3e6;hub();});
 await clickText(/Team ownership/);await clickText(/Start a new team/);await clickText(/ARCA Menards Series/);
 await page.fill('#tnInput','Lurty Motorsports');await clickText(/^Confirm$/);await clickText(/Manage the team/);
 ok(/LURTY MOTORSPORTS/i.test(await txt()),'own team created');
 await clickText(/Invest personal money/);await clickText(/^\$1M/);await clickText(/Add a car/);await clickText(/Back to the team/);await clickText(/Hire a driver/);const hb=await page.$$('button.ch:not(.dis)');await hb[0].click();await page.waitForTimeout(30);await clickText(/Back to the team/,true);
 ok(await page.evaluate(()=>G.TM[G.own[0].tid].cars.filter(c=>c.d).length>=2),'hired a second driver');
 await page.screenshot({path:SS+'06_team_ownership.png',fullPage:true});
 await clickText(/^Back$/);await clickText(/^Back$/);await toHub();
 // ---------- Reload / Continue ----------
 const before=await page.evaluate(()=>({yr:G.yr,wk:G.wk,n:G.st.races.length}));
 await page.reload();await page.waitForTimeout(150);
 ok((await btns()).some(b=>/Continue Career/.test(b)),'Continue offered after reload');await clickText(/Continue Career/);
 const after=await page.evaluate(()=>({yr:G.yr,wk:G.wk,n:G.st.races.length,name:G.me.name,own:G.own.length}));
 ok(after.yr===before.yr&&after.wk===before.wk&&after.n===before.n&&after.name==='Aaron Lurty'&&after.own===1,'state restored after reload');await toHub();
 // ---------- Export / import ----------
 await clickText(/Settings/);await clickText(/Export save string/);const s=await page.inputValue('#exportBox');ok(s.length>5000,'export string produced ('+Math.round(s.length/1024)+' KB)');
 await clickText(/^Back$/);await page.evaluate(()=>{G.me.name="Someone Else";});await clickText(/Import save string/);await page.fill('#importBox',s);await clickText(/^Import$/);
 ok(/Save imported/.test(await txt())&&await page.evaluate(()=>G.me.name==="Aaron Lurty"),'import restored the save');await clickText(/^Continue$/);await toHub();
 // ---------- Fictional-only mode ----------
 const real=await page.evaluate(()=>entries("cup").filter(e=>G.D[e.d]&&G.D[e.d].r).map(e=>G.D[e.d].n).concat(teamsOf("cup").filter(t=>t.r).map(t=>t.n)));
 await clickText(/Settings/);await clickText(/Turn fictional-only mode ON/);await clickText(/^Back$/);
 await clickText(/^Standings/);const st=await page.innerText('body');const leaks=real.filter(n=>st.indexOf(n)>=0);ok(leaks.length===0,'fictional-only mode hides real names in Cup standings'+(leaks.length?': '+leaks.slice(0,3):''));
 await clickText(/Teams &amp; drivers|Teams & drivers/);const st2=await page.innerText('body');ok(real.filter(n=>st2.indexOf(n)>=0).length===0,'fictional-only mode hides real names in team list');
 await clickText(/^Back$/);await clickText(/Settings/);await clickText(/Turn fictional-only mode OFF/);await clickText(/^Back$/);
 await clickText(/^Standings/);ok(real.some(n=>(page.innerText&&true))&&(await page.innerText('body')).includes(real[0].split(' ').slice(-1)[0]),'real names return when mode is off');await clickText(/^Back$/);await toHub();
 ok(!(await errScreen()),'no error screen');
 // ---------- Phone layout ----------
 const save=await page.evaluate(()=>localStorage.getItem(SAVE_KEY));
 const ph=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const pp=await ph.newPage();pp.on('pageerror',e=>errs.push('phone pageerror: '+e.message));
 await pp.goto(FILE);await pp.evaluate(s=>{localStorage.setItem(SAVE_KEY,s);},save);await pp.reload();
 const over=async()=>pp.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 ok(await over()<=2,'phone: title fits width');
 await pp.click('text=Continue Career');await pp.waitForTimeout(100);ok(await over()<=2,'phone: dashboard fits width ('+await over()+')');
 await pp.screenshot({path:SS+'07_phone_dashboard.png',fullPage:false});
 const pb=async re=>{const bs=await pp.$$('button.ch:not(.dis)');for(const b of bs){if(re.test(await b.innerText())){await b.click();await pp.waitForTimeout(40);return true;}}return false;};
 for(const [re,name] of [[/Standings/,'standings'],[/Career stats/,'career stats'],[/Series & teams|Series &amp; teams/,'series browser']]){await pb(re);if(name==='series browser')await pb(/NASCAR Cup Series/);ok(await over()<=2,`phone: ${name} fits width (${await over()})`);await pp.evaluate(()=>hub());}
 await pp.evaluate(()=>{const e=nextEvent();if(e){G.wk=e.c[1];}hub();});if(await pb(/Race weekend/)){ok(await over()<=2,'phone: race preview fits width');await pb(/Practice: balanced/);await pb(/On to qualifying/);await pb(/Clean, safe lap/);ok(await over()<=2,'phone: qualifying table fits width');}
 await ph.close();
 ok(errs.length===0,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
 await browser.close();
 log(`browser checks: ${checks-fails}/${checks} passed`);process.exit(fails?1:0);
})().catch(e=>{console.log('THROW',e.message.slice(0,1500));process.exit(1);});
