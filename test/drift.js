// Field-strength drift: mean / top-3 driver ratings per series at start and after N simulated years.
const {load,quickStart}=require('./harness');
const h=load();quickStart(h,{start:'hobby',age:16});const Y=+process.argv[2]||15;
const sers=['cup','oap','truck','f1','f2','f3','indycar','nxt','fe','wec','imsagtp','woo','supercars','slm','hobby'];
const snap=()=>h.run(`(${JSON.stringify(sers)}).map(s=>{const o=entries(s).filter(e=>e.d!=="me").map(e=>G.D[e.d].o).sort((a,b)=>b-a);return s+":"+Math.round(o.reduce((a,b)=>a+b,0)/o.length)+"/"+o.slice(0,3).map(Math.round).join(",")+" lvl"+SER[s].lvl;})`);
const a=snap();for(let w=0;w<52*Y;w++){h.run('autoWeek();endWeekCore();G.pending=[];');}
const b=snap();a.forEach((x,i)=>console.log(x.padEnd(34),'->',b[i]));
