/* ===================== FULL THROTTLE: UTIL ===================== */
"use strict";
const GAME_TITLE="Full Throttle";            // rename the game here
const GAME_SUB="a motorsport career RPG";
const SAVE_KEY="fullThrottleSave_v1";
const SAVE_VER=1;
const START_YEAR=2026;
let G=null;
const R={
 int:(a,b)=>Math.floor(Math.random()*(b-a+1))+a,
 f:(a,b)=>Math.random()*(b-a)+a,
 pick:a=>a[Math.floor(Math.random()*a.length)],
 chance:p=>Math.random()<p,
 gauss:()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);},
 shuffle:a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
 wpick:(items,wf)=>{let tot=0;const ws=items.map(i=>{const w=Math.max(0,wf(i));tot+=w;return w;});if(tot<=0)return null;let r=Math.random()*tot;for(let i=0;i<items.length;i++){r-=ws[i];if(r<=0)return items[i];}return items[items.length-1];}
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const r1=x=>Math.round(x*10)/10;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function money(x){x=Math.round(x||0);const n=Math.abs(x);let s;if(n>=1e6)s="$"+(n/1e6).toFixed(n>=1e7?1:2).replace(/\.?0+$/,"")+"M";else s="$"+n.toLocaleString("en-US");return (x<0?"-":"")+s;}
function plural(n,w,pl){return n+" "+(n===1?w:(pl||w+"s"));}
function ordinal(n){const s=["th","st","nd","rd"],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
function hashStr(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function hpick(arr,seed){return arr[hashStr(seed)%arr.length];}
function cap1(s){s=String(s);return s.charAt(0).toUpperCase()+s.slice(1);}
function sgn(v){return (v>0?"+":"")+v;}
function avg(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0;}
function sum(a){return a.reduce((x,y)=>x+y,0);}
function pos(n){return n?"P"+n:"-";}
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function wkDate(w){const d=new Date(Date.UTC(2026,0,4+7*w));return MONTHS[d.getUTCMonth()]+" "+d.getUTCDate();}
function dateLbl(yr,w){if(yr===undefined){yr=G.yr;w=G.wk;}return `${wkDate(w)}, ${yr}`;}
