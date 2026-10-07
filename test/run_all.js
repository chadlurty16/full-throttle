// Runs the whole suite: logic, storylines, random-play bots, balance, browser click-through.
const {execSync}=require('child_process');
// [name, command, timeout seconds]. Long soak: `node test/bot.js 12 18` (~12 min) or `node test/run_all.js --long`.
const LONG=process.argv.includes('--long');
const steps=[['logic tests','node test/logic_test.js',120],['storyline paths','node test/events_test.js',120],
 ['random-play bots',LONG?'node test/bot.js 12 18':'BOT_STARTS=kclub,hobby,dmod,ui,f4us node test/bot.js 5 10',LONG?1500:240],
 ['balance',LONG?'node test/balance.js kclub,hobby,minisp,f4us,legends,dmod 22':'node test/balance.js kclub,hobby,f4us,dmod 20',LONG?600:240],['browser click-through','node test/browser.js',240]];
const only=process.argv.slice(2).filter(a=>a!=='--long');let bad=0;
for(const [n,c,to] of steps){if(only.length&&!only.some(o=>n.includes(o)))continue;const t=Date.now();process.stdout.write(`\n=== ${n} ===\n`);
 try{const out=execSync(c,{cwd:__dirname+'/..',encoding:'utf8',maxBuffer:64*1024*1024,timeout:to*1000,killSignal:'SIGKILL',stdio:['ignore','pipe','pipe']});console.log(out.trim().split('\n').slice(-14).join('\n'));console.log(`PASS (${Math.round((Date.now()-t)/1000)}s)`);}
 catch(e){bad++;if(e.signal==='SIGKILL'||e.code==='ETIMEDOUT')console.log(`TIMED OUT after ${to}s`);console.log(String(e.stdout||'').trim().split('\n').slice(-25).join('\n'));console.log(String(e.stderr||'').slice(0,1500));console.log('FAIL');}}
console.log(bad?`\n${bad} suite(s) FAILED`:'\nALL SUITES PASSED');process.exit(bad?1:0);
