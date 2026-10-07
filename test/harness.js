// Shared node vm harness: loads game_bundle.js in a sandbox with a fake localStorage.
const fs=require('fs'),vm=require('vm');
function load(){
 const code=fs.readFileSync(__dirname+'/../game_bundle.js','utf8');
 const errors=[];const store={};
 const ctx={console:{log:()=>{},error:(...a)=>{errors.push(a.map(x=>x&&x.stack||String(x)).join(' '));},warn:()=>{}},
  localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},
  btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),Math,JSON,Date,setTimeout,clearTimeout,escape,unescape,encodeURIComponent,decodeURIComponent,parseInt,parseFloat,Object,Array,String,Number,Set,Map,isNaN,isFinite,Infinity,RegExp,Error};
 vm.createContext(ctx);
 vm.runInContext(code+';this.__g=()=>G;this.__setG=v=>{G=v;};this.__cur=()=>CUR;',ctx);
 const run=s=>vm.runInContext(s,ctx);
 return {ctx,run,errors,store,G:()=>ctx.__g(),CUR:()=>ctx.__cur()};
}
function strip(s){return String(s).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();}
function quickStart(h,o){o=o||{};
 h.run(`newGame(${JSON.stringify(Object.assign({name:"Test Pilot",nick:"",age:14,nat:"USA",home:"Mooresville, NC",bg:"middle",traits:["talent","charger"],num:27,col:"Orange & black",start:"kclub",fic:false},o))});`);
}
module.exports={load,strip,quickStart};
