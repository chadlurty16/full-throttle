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

/* ===================== TRACKS ===================== */
// id: [name, location, type, length (miles), rain chance]. Types: ss superspeedway/drafting, int intermediate oval, sht short/flat oval, dirt, road, street, kart, drag.
const TRK={
 // NASCAR / US ovals
 daytona:["Daytona International Speedway","Daytona Beach, FL","ss",2.5,.12],talladega:["Talladega Superspeedway","Lincoln, AL","ss",2.66,.12],atlanta:["EchoPark Speedway","Hampton, GA","ss",1.54,.14],
 lasvegas:["Las Vegas Motor Speedway","Las Vegas, NV","int",1.5,.03],charlotte:["Charlotte Motor Speedway","Concord, NC","int",1.5,.15],texas:["Texas Motor Speedway","Fort Worth, TX","int",1.5,.1],kansas:["Kansas Speedway","Kansas City, KS","int",1.5,.12],
 homestead:["Homestead-Miami Speedway","Homestead, FL","int",1.5,.15],chicagoland:["Chicagoland Speedway","Joliet, IL","int",1.5,.12],michigan:["Michigan International Speedway","Brooklyn, MI","int",2.0,.14],pocono:["Pocono Raceway","Long Pond, PA","int",2.5,.16],
 indy:["Indianapolis Motor Speedway","Speedway, IN","int",2.5,.12],darlington:["Darlington Raceway","Darlington, SC","int",1.366,.12],nashville:["Nashville Superspeedway","Lebanon, TN","int",1.33,.13],
 dover:["Dover Motor Speedway","Dover, DE","sht",1.0,.14],phoenix:["Phoenix Raceway","Avondale, AZ","sht",1.0,.02],newhampshire:["New Hampshire Motor Speedway","Loudon, NH","sht",1.058,.15],richmond:["Richmond Raceway","Richmond, VA","sht",0.75,.12],
 martinsville:["Martinsville Speedway","Ridgeway, VA","sht",0.526,.12],bristol:["Bristol Motor Speedway","Bristol, TN","sht",0.533,.12],nwilkesboro:["North Wilkesboro Speedway","North Wilkesboro, NC","sht",0.625,.13],iowa:["Iowa Speedway","Newton, IA","sht",0.875,.12],
 gateway:["World Wide Technology Raceway","Madison, IL","sht",1.25,.12],milwaukee:["Milwaukee Mile","West Allis, WI","sht",1.0,.12],rockingham:["Rockingham Speedway","Rockingham, NC","sht",1.017,.12],irp:["Lucas Oil Indianapolis Raceway Park","Brownsburg, IN","sht",0.686,.12],
 fiveflags:["Five Flags Speedway","Pensacola, FL","sht",0.5,.1],toledo:["Toledo Speedway","Toledo, OH","sht",0.5,.12],salem:["Salem Speedway","Salem, IN","sht",0.555,.12],berlin:["Berlin Raceway","Marne, MI","sht",0.4375,.12],elko:["Elko Speedway","Elko New Market, MN","sht",0.375,.12],
 springfield:["Illinois State Fairgrounds (dirt mile)","Springfield, IL","dirt",1.0,.12],duquoin:["DuQuoin State Fairgrounds (dirt mile)","Du Quoin, IL","dirt",1.0,.12],charlotteq:["Charlotte Motor Speedway quarter-mile","Concord, NC","sht",0.25,.15],
 // US road & street
 cota:["Circuit of the Americas","Austin, TX","road",3.41,.06],glen:["Watkins Glen International","Watkins Glen, NY","road",2.45,.18],sonoma:["Sonoma Raceway","Sonoma, CA","road",1.99,.04],roval:["Charlotte Motor Speedway ROVAL","Concord, NC","road",2.28,.15],
 sandiego:["Naval Base Coronado street course","San Diego, CA","street",3.4,.03],limerock:["Lime Rock Park","Lakeville, CT","road",1.5,.18],roadamerica:["Road America","Elkhart Lake, WI","road",4.05,.2],midohio:["Mid-Ohio Sports Car Course","Lexington, OH","road",2.26,.18],
 barber:["Barber Motorsports Park","Birmingham, AL","road",2.38,.15],laguna:["WeatherTech Raceway Laguna Seca","Monterey, CA","road",2.24,.05],portland:["Portland International Raceway","Portland, OR","road",1.96,.15],imsrc:["Indianapolis Motor Speedway road course","Speedway, IN","road",2.44,.15],
 stpete:["Streets of St. Petersburg","St. Petersburg, FL","street",1.8,.12],longbeach:["Streets of Long Beach","Long Beach, CA","street",1.97,.03],detroit:["Streets of Detroit","Detroit, MI","street",1.65,.15],arlington:["Streets of Arlington","Arlington, TX","street",2.7,.1],
 markham:["Streets of Markham","Markham, ON","street",1.8,.15],washington:["Streets of Washington, D.C.","Washington, D.C.","street",2.0,.15],sebring:["Sebring International Raceway","Sebring, FL","road",3.74,.15],roadatlanta:["Michelin Raceway Road Atlanta","Braselton, GA","road",2.54,.15],
 vir:["VIRginia International Raceway","Alton, VA","road",3.27,.15],ctmp:["Canadian Tire Motorsport Park","Bowmanville, ON","road",2.46,.18],pitt:["Pittsburgh International Race Complex","Wampum, PA","road",2.78,.18],nola:["NOLA Motorsports Park","Avondale, LA","road",2.75,.18],
 // F1 / international
 albert:["Albert Park Circuit","Melbourne, Australia","street",3.28,.15],shanghai:["Shanghai International Circuit","Shanghai, China","road",3.39,.2],suzuka:["Suzuka Circuit","Suzuka, Japan","road",3.61,.25],bahrain:["Bahrain International Circuit","Sakhir, Bahrain","road",3.36,.01],
 jeddah:["Jeddah Corniche Circuit","Jeddah, Saudi Arabia","street",3.84,.01],miami:["Miami International Autodrome","Miami Gardens, FL","street",3.36,.15],montreal:["Circuit Gilles Villeneuve","Montreal, Canada","street",2.71,.25],monaco:["Circuit de Monaco","Monte Carlo, Monaco","street",2.07,.12],
 barcelona:["Circuit de Barcelona-Catalunya","Montmeló, Spain","road",2.89,.08],redbullring:["Red Bull Ring","Spielberg, Austria","road",2.68,.25],silverstone:["Silverstone Circuit","Silverstone, UK","road",3.66,.3],spa:["Circuit de Spa-Francorchamps","Stavelot, Belgium","road",4.35,.35],
 hungaroring:["Hungaroring","Mogyoród, Hungary","road",2.72,.12],zandvoort:["Circuit Zandvoort","Zandvoort, Netherlands","road",2.65,.25],monza:["Autodromo Nazionale Monza","Monza, Italy","road",3.6,.15],madrid:["Madring","Madrid, Spain","street",3.39,.06],
 baku:["Baku City Circuit","Baku, Azerbaijan","street",3.73,.05],singapore:["Marina Bay Street Circuit","Singapore","street",3.07,.2],mexico:["Autódromo Hermanos Rodríguez","Mexico City, Mexico","road",2.67,.1],interlagos:["Autódromo José Carlos Pace (Interlagos)","São Paulo, Brazil","road",2.68,.35],
 vegas:["Las Vegas Strip Circuit","Las Vegas, NV","street",3.85,.01],lusail:["Lusail International Circuit","Lusail, Qatar","road",3.37,.01],yasmarina:["Yas Marina Circuit","Abu Dhabi, UAE","road",3.28,.01],imola:["Imola (Enzo e Dino Ferrari)","Imola, Italy","road",3.05,.25],
 misano:["Misano World Circuit","Misano Adriatico, Italy","road",2.6,.15],mugello:["Mugello Circuit","Scarperia, Italy","road",3.26,.15],vallelunga:["Vallelunga Circuit","Campagnano di Roma, Italy","road",2.53,.15],paulricard:["Circuit Paul Ricard","Le Castellet, France","road",3.6,.08],
 lemans:["Circuit de la Sarthe","Le Mans, France","road",8.47,.3],fuji:["Fuji Speedway","Oyama, Japan","road",2.84,.3],brands:["Brands Hatch","West Kingsdown, UK","road",1.2,.3],hockenheim:["Hockenheimring","Hockenheim, Germany","road",2.84,.2],
 // Formula E
 fe_mexico:["Mexico City E-Prix circuit","Mexico City, Mexico","street",1.46,.05],fe_miami:["Homestead-Miami E-Prix circuit","Homestead, FL","street",2.0,.15],fe_jeddah:["Jeddah Corniche E-Prix circuit","Jeddah, Saudi Arabia","street",1.86,.01],fe_madrid:["Jarama E-Prix circuit","Madrid, Spain","street",2.4,.05],
 fe_monaco:["Monaco E-Prix circuit","Monte Carlo, Monaco","street",2.07,.1],fe_berlin:["Tempelhof Airport Street Circuit","Berlin, Germany","street",1.47,.2],fe_tokyo:["Tokyo Street Circuit","Tokyo, Japan","street",1.6,.2],fe_shanghai:["Shanghai E-Prix circuit","Shanghai, China","street",2.0,.2],
 fe_jakarta:["Jakarta International E-Prix Circuit","Jakarta, Indonesia","street",1.5,.3],fe_london:["ExCeL London circuit","London, UK","street",1.45,.0],
 // Supercars
 sydney:["Sydney Motorsport Park","Sydney, Australia","road",2.43,.15],taupo:["Taupo International Motorsport Park","Taupo, New Zealand","road",2.0,.25],symmons:["Symmons Plains Raceway","Launceston, Australia","road",1.5,.25],wanneroo:["Wanneroo Raceway","Perth, Australia","road",1.5,.08],
 hiddenvalley:["Hidden Valley Raceway","Darwin, Australia","road",1.8,.15],townsville:["Reid Park Street Circuit","Townsville, Australia","street",1.8,.1],ipswich:["Queensland Raceway","Ipswich, Australia","road",1.95,.1],sandown:["Sandown Raceway","Melbourne, Australia","road",1.93,.25],
 thebend:["The Bend Motorsport Park","Tailem Bend, Australia","road",2.1,.15],bathurst:["Mount Panorama Circuit","Bathurst, Australia","road",3.86,.3],goldcoast:["Surfers Paradise Street Circuit","Gold Coast, Australia","street",1.84,.2],adelaide:["Adelaide Street Circuit","Adelaide, Australia","street",2.0,.12],
 // Dirt (real)
 knoxville:["Knoxville Raceway","Knoxville, IA","dirt",0.5,.15],eldora:["Eldora Speedway","Rossburg, OH","dirt",0.5,.15],williamsgrove:["Williams Grove Speedway","Mechanicsburg, PA","dirt",0.5,.15],portroyal:["Port Royal Speedway","Port Royal, PA","dirt",0.5,.15],
 lernerville:["Lernerville Speedway","Sarver, PA","dirt",0.41,.15],volusia:["Volusia Speedway Park","Barberville, FL","dirt",0.5,.12],attica:["Attica Raceway Park","Attica, OH","dirt",0.375,.15],skagit:["Skagit Speedway","Alger, WA","dirt",0.375,.2],
 jackson:["Jackson Motorplex","Jackson, MN","dirt",0.5,.15],ohsweken:["Ohsweken Speedway","Ohsweken, ON","dirt",0.375,.15],cedarlake:["Cedar Lake Speedway","New Richmond, WI","dirt",0.375,.15],tulsa:["Tulsa Expo Raceway (Chili Bowl)","Tulsa, OK","dirt",0.25,.0],
 eastbay:["East Bay Raceway Park","Gibsonton, FL","dirt",0.333,.12],florence:["Florence Speedway","Union, KY","dirt",0.5,.15],brownstown:["Brownstown Speedway","Brownstown, IN","dirt",0.25,.15],portsmouth:["Portsmouth Raceway Park","Portsmouth, OH","dirt",0.375,.15],
 atomic:["Atomic Speedway","Chillicothe, OH","dirt",0.375,.15],lincoln:["Lincoln Speedway","Abbottstown, PA","dirt",0.375,.15],bigdiamond:["Big Diamond Speedway","Pottsville, PA","dirt",0.5,.15],
 // NHRA
 gainesville:["Gainesville Raceway","Gainesville, FL","drag",.25,.15],pomona:["Pomona Dragstrip","Pomona, CA","drag",.25,.03],wildhorse:["Wild Horse Pass Motorsports Park","Chandler, AZ","drag",.25,.02],vegasdrag:["The Strip at Las Vegas Motor Speedway","Las Vegas, NV","drag",.25,.02],
 zmax:["zMAX Dragway","Concord, NC","drag",.25,.15],route66:["Route 66 Raceway","Joliet, IL","drag",.25,.15],bristoldrag:["Bristol Dragway","Bristol, TN","drag",.25,.15],summit:["Summit Motorsports Park","Norwalk, OH","drag",.25,.15],
 pacific:["Pacific Raceways","Kent, WA","drag",.25,.2],sonomadrag:["Sonoma Raceway dragstrip","Sonoma, CA","drag",.25,.03],brainerd:["Brainerd International Raceway","Brainerd, MN","drag",.25,.15],indydrag:["Lucas Oil Indianapolis Raceway Park dragstrip","Brownsburg, IN","drag",.25,.15],
 maplegrove:["Maple Grove Raceway","Mohnton, PA","drag",.25,.15],motorplex:["Texas Motorplex","Ennis, TX","drag",.25,.1],wwtdrag:["World Wide Technology Raceway dragstrip","Madison, IL","drag",.25,.12],
 // Karting (real)
 okc:["Orlando Kart Center","Orlando, FL","kart",.8,.12],newcastle:["New Castle Motorsports Park","New Castle, IN","kart",.9,.15],gopro:["GoPro Motorplex","Mooresville, NC","kart",.75,.15],vegaskart:["SuperNationals street circuit","Las Vegas, NV","kart",.6,.02],
 lonato:["South Garda Karting","Lonato, Italy","kart",.75,.15],genk:["Karting Genk","Genk, Belgium","kart",.82,.3],zuera:["Circuito Internacional de Zuera","Zuera, Spain","kart",.8,.05],kristianstad:["Asum Ring","Kristianstad, Sweden","kart",.75,.3],franciacorta:["Franciacorta Karting Track","Castrezzato, Italy","kart",.8,.15],
 // Fictional local venues (grassroots)
 f_cedar:["Cedar Ridge Speedway (3/8-mile asphalt)","your home county","sht",.375,.15],f_thunder:["Thunder Valley Raceway (1/2-mile asphalt)","the next county over","sht",.5,.15],f_river:["Riverbend Motor Speedway (1/4-mile)","down by the river","sht",.25,.15],
 f_pine:["Pine Hollow Speedway (4/10-mile)","two hours north","sht",.4,.15],f_lake:["Lakeview Motor Speedway (1/3-mile)","the lake country","sht",.333,.15],f_iron:["Iron Hill Speedway (5/8-mile)","the state capital","sht",.625,.15],
 f_clay:["Red Clay Raceway (dirt)","your home county","dirt",.25,.15],f_copper:["Copper Basin Speedway (dirt)","out past the quarry","dirt",.333,.15],f_prairie:["Prairie Wind Dirt Track","the county fairgrounds","dirt",.375,.15],
 f_hollister:["Hollister Clay Oval","three hours west","dirt",.5,.15],f_gravel:["Gravel Creek Raceway","the state line","dirt",.25,.15],f_mesa:["Mesa Bend Mini Oval (dirt)","the edge of town","dirt",.125,.15],
 f_lakeside:["Lakeside Kart Club","your hometown","kart",.6,.15],f_tri:["Tri-County Kart Park","the next town over","kart",.7,.15],f_valley:["Valley View Karting","two hours south","kart",.65,.15],f_ridge:["Ridgeline Kartplex","across the state","kart",.8,.15],f_summit:["Summit Point Kart Center","the mountains","kart",.75,.15]
};
const TTYPE_N={ss:"Superspeedway",int:"Intermediate oval",sht:"Short track",dirt:"Dirt oval",road:"Road course",street:"Street circuit",kart:"Kart circuit",drag:"Drag strip"};
function tkn(id){return TRK[id]?TRK[id][0]:id;}
function tkt(id){return TRK[id]?TRK[id][2]:"road";}

/* ===================== SERIES ===================== */
// lvl: typical AI driver rating; ql: typical car quality; cw: car weight in performance; sig: race randomness; dnf: base retirement rate
function gcal(tracks,start,n,step,names){const a=[];for(let i=0;i<n;i++){const t=tracks[i%tracks.length];a.push([t,start+Math.round(i*step),names&&names[i]?names[i]:null]);}return a;}
const SERIES_LIST=[
 // ---------- KARTING ----------
 {id:"kclub",n:"Local Club Karting",sh:"Club Karts",disc:"kart",lad:"kart",tier:1,age:6,lvl:34,ql:50,cw:.3,sig:7,dnf:.06,laps:15,field:16,cost:7000,sal:[0,0],pts:"grass",purse:150,
  cal:gcal(["f_lakeside","f_tri","f_lakeside","f_valley"],14,10,2.5),desc:"Saturday club races. Dads with toolboxes, kids with big dreams."},
 {id:"kreg",n:"Regional Karting Championship",sh:"Regional Karts",disc:"kart",lad:"kart",tier:2,age:8,lvl:42,ql:55,cw:.3,sig:6.5,dnf:.06,laps:18,field:20,cost:25000,sal:[0,0],pts:"grass",purse:300,
  cal:gcal(["f_tri","f_valley","f_ridge","f_summit"],12,8,3.5),desc:"The best karters from three states. Scouts occasionally watch."},
 {id:"knat",n:"SKUSA Pro Tour (National Karting)",sh:"SKUSA",disc:"kart",lad:"kart",tier:3,age:10,lvl:50,ql:60,cw:.33,sig:6,dnf:.06,laps:20,field:24,cost:90000,sal:[0,0],pts:"grass",purse:1000,
  cal:[["okc",5],["newcastle",18],["gopro",26],["newcastle",34],["okc",40],["vegaskart",47,"SKUSA SuperNationals",1]],desc:"America's premier national karting tour, finishing at the SuperNationals in Las Vegas."},
 {id:"kint",n:"FIA Karting European & World Championship",sh:"FIA Karting",disc:"kart",lad:"kart",tier:4,age:12,lvl:56,ql:62,cw:.33,sig:5.5,dnf:.06,laps:22,field:28,cost:250000,sal:[0,40000],pts:"grass",purse:0,
  cal:[["lonato",14],["genk",19],["zuera",23],["kristianstad",28],["franciacorta",33],["lonato",39,"FIA Karting World Championship",1]],desc:"The international karting summit: future F1 drivers are made (and broken) here.",slp:[4,3,2,1]},
 // ---------- LOCAL SHORT TRACK STOCK ----------
 {id:"hobby",n:"Hobby Stock (weekly)",sh:"Hobby Stock",disc:"stock",lad:"stock",tier:1,age:14,lvl:30,ql:45,cw:.4,sig:8,dnf:.12,laps:20,field:18,cost:6000,sal:[0,0],pts:"grass",purse:500,
  cal:gcal(["f_cedar","f_cedar","f_river","f_cedar","f_thunder"],15,16,1.5),desc:"Stock-bodied street cars, a roll cage and a lot of courage. The entry door to Saturday night."},
 {id:"pure",n:"Pure Stock (weekly)",sh:"Pure Stock",disc:"stock",lad:"stock",tier:1,age:14,lvl:33,ql:47,cw:.4,sig:8,dnf:.12,laps:25,field:18,cost:8000,sal:[0,0],pts:"grass",purse:700,
  cal:gcal(["f_cedar","f_thunder","f_cedar","f_river"],15,16,1.5),desc:"Strict rules, spec tires, little money. Wins come from the driver."},
 {id:"street",n:"Street Stock (weekly)",sh:"Street Stock",disc:"stock",lad:"stock",tier:2,age:15,lvl:38,ql:50,cw:.42,sig:7.5,dnf:.12,laps:30,field:20,cost:12000,sal:[0,0],pts:"grass",purse:1000,
  cal:gcal(["f_thunder","f_cedar","f_lake","f_thunder","f_pine"],15,16,1.5),desc:"More motor, more grip, more contact. Bump-and-run is a way of life."},
 {id:"lm",n:"Late Model Stock (regional)",sh:"Late Model",disc:"stock",lad:"stock",tier:3,age:14,lvl:45,ql:55,cw:.45,sig:7,dnf:.11,laps:100,field:22,cost:45000,sal:[0,15000],pts:"grass",purse:3000,
  cal:gcal(["f_thunder","f_iron","f_pine","f_lake","f_cedar","fiveflags","f_iron"],14,14,1.8),desc:"Where NASCAR scouts look for the next Truck Series rookie."},
 {id:"slm",n:"Super Late Model (regional touring)",sh:"Super Late Model",disc:"stock",lad:"stock",tier:4,age:14,lvl:52,ql:58,cw:.45,sig:6.5,dnf:.11,laps:150,field:24,cost:90000,sal:[0,40000],pts:"grass",purse:5000,
  cal:[["f_iron",13],["fiveflags",15],["toledo",18],["salem",21],["berlin",24],["f_pine",27],["elko",30],["toledo",33],["salem",36],["f_iron",39],["berlin",42],["fiveflags",44]],desc:"Big-money short track racing. Win here and Truck teams call."},
 {id:"band",n:"Bandolero Series",sh:"Bandolero",disc:"stock",lad:"stock",tier:1,age:8,maxAge:17,lvl:30,ql:50,cw:.25,sig:7.5,dnf:.08,laps:20,field:16,cost:8000,sal:[0,0],pts:"grass",purse:200,
  cal:gcal(["f_river","charlotteq","f_cedar","f_river"],16,10,2.2,{4:"Summer Shootout (Charlotte)"}),desc:"Spec cars for 8 to 16 year olds. The first rung of the stock car ladder."},
 {id:"legends",n:"INEX Legends Cars",sh:"Legends",disc:"stock",lad:"stock",tier:2,age:12,lvl:40,ql:52,cw:.25,sig:7,dnf:.1,laps:25,field:20,cost:25000,sal:[0,0],pts:"grass",purse:500,
  cal:gcal(["f_river","charlotteq","f_cedar","f_thunder","f_lake"],14,12,2,{3:"Summer Shootout (Charlotte)"}),desc:"5/8-scale 1930s-style coupes with motorcycle engines. Twitchy, fast and a famous proving ground."},
 // ---------- DIRT ----------
 {id:"minisp",n:"Mini Sprints (weekly dirt)",sh:"Mini Sprints",disc:"dirt",lad:"dirt",tier:1,age:10,lvl:33,ql:48,cw:.38,sig:8.5,dnf:.13,laps:20,field:18,cost:10000,sal:[0,0],pts:"grass",purse:400,
  cal:gcal(["f_mesa","f_clay","f_gravel","f_mesa"],15,14,1.6),desc:"Small winged sprinters on tiny bullrings. Bicycle-fast reflexes required."},
 {id:"microsp",n:"Micro Sprints (600cc, regional)",sh:"Micro Sprints",disc:"dirt",lad:"dirt",tier:2,age:12,lvl:40,ql:52,cw:.38,sig:8,dnf:.13,laps:25,field:22,cost:18000,sal:[0,0],pts:"grass",purse:800,
  cal:gcal(["f_clay","f_gravel","f_copper","f_prairie"],14,14,1.7),desc:"600cc winged micros: the fastest way to learn the cushion."},
 {id:"dmod",n:"Dirt Modifieds (weekly)",sh:"Dirt Modifieds",disc:"dirt",lad:"dirt",tier:3,age:14,lvl:46,ql:55,cw:.4,sig:8,dnf:.12,laps:25,field:22,cost:40000,sal:[0,0],pts:"grass",purse:2000,
  cal:gcal(["f_prairie","f_copper","f_clay","f_hollister"],15,15,1.6),desc:"Open-wheel-ish, fendered, sideways. The working man's dirt division."},
 {id:"dlm",n:"Dirt Late Models (regional)",sh:"Dirt Late Models",disc:"dirt",lad:"dirt",tier:4,age:15,lvl:52,ql:57,cw:.42,sig:7.5,dnf:.12,laps:40,field:24,cost:90000,sal:[0,30000],pts:"grass",purse:5000,
  cal:gcal(["f_hollister","f_copper","f_prairie","brownstown","f_hollister","portsmouth"],13,14,2),desc:"800 horsepower and a wedge-shaped body. The top of weekly dirt."},
 {id:"sprint360",n:"360 Winged Sprint Cars (regional)",sh:"360 Sprints",disc:"dirt",lad:"dirt",tier:4,age:15,lvl:52,ql:58,cw:.42,sig:7.5,dnf:.13,laps:25,field:24,cost:120000,sal:[0,30000],pts:"grass",purse:4000,
  cal:gcal(["f_hollister","lincoln","f_copper","bigdiamond","f_prairie","attica"],13,14,2),desc:"The stepping stone to the 410 national tours."},
 {id:"midget",n:"USAC National Midgets",sh:"USAC Midgets",disc:"dirt",lad:"dirt",tier:5,age:15,lvl:58,ql:60,cw:.4,sig:7.5,dnf:.12,laps:30,field:24,cost:150000,sal:[0,60000],pts:"grass",purse:3000,
  cal:[["f_hollister",8],["volusia",9],["f_copper",14],["lincoln",18],["portroyal",22],["attica",25],["f_prairie",28],["jackson",31],["eldora",34],["f_hollister",38],["f_gravel",42],["f_copper",45]],desc:"Lightweight, 400hp and terrifying. The Chili Bowl crowd's favorite cars."},
 {id:"lolmds",n:"Lucas Oil Late Model Dirt Series",sh:"Lucas Oil LMDS",disc:"dirt",lad:"dirt",tier:6,age:16,lvl:70,ql:66,cw:.42,sig:7,dnf:.11,laps:50,field:26,cost:600000,sal:[60000,400000],pts:"sprint",purse:15000,rp:1,
  cal:[["eastbay",5],["volusia",6],["florence",14],["brownstown",16],["portsmouth",19],["atomic",21],["eldora",24,"Dirt Late Model Dream",1],["florence",27],["brownstown",29],["knoxville",33,"Lucas Oil Late Model Knoxville Nationals"],["eldora",36,"World 100",1],["atomic",38],["portsmouth",41],["florence",44]],desc:"The premier national dirt late model tour."},
 {id:"woo",n:"World of Outlaws Sprint Car Series",sh:"WoO Sprints",disc:"dirt",lad:"dirt",tier:7,age:16,lvl:80,ql:68,cw:.42,sig:7,dnf:.12,laps:30,field:24,cost:900000,sal:[100000,800000],pts:"sprint",purse:10000,rp:1,
  cal:[["volusia",6,"DIRTcar Nationals"],["volusia",7],["williamsgrove",13],["portroyal",15],["lernerville",17],["attica",19],["eldora",21],["ohsweken",24],["cedarlake",26],["eldora",28,"Kings Royal",1],["jackson",30],["knoxville",32,"Knoxville Nationals",1],["skagit",35],["williamsgrove",39,"National Open"],["portroyal",40],["lernerville",42],["volusia",45]],desc:"410 winged sprint cars, 900 horsepower, 1,400 pounds. The Greatest Show on Dirt."},
 {id:"hlr",n:"High Limit Racing",sh:"High Limit",disc:"dirt",lad:"dirt",tier:7,age:16,lvl:79,ql:68,cw:.42,sig:7,dnf:.12,laps:30,field:24,cost:900000,sal:[100000,800000],pts:"sprint",purse:15000,rp:1,
  cal:[["volusia",8],["lincoln",14],["bigdiamond",16],["lernerville",20],["attica",22],["portroyal",25],["jackson",27],["ohsweken",29],["cedarlake",31],["knoxville",34],["eldora",37,"4-Crown Nationals"],["williamsgrove",41],["lincoln",43]],desc:"The big-money midweek 410 sprint tour."},
 // ---------- ROAD RACING / OPEN WHEEL ENTRY ----------
 {id:"miata",n:"SCCA Spec Miata (regional)",sh:"Spec Miata",disc:"sports",lad:"spec",tier:2,age:14,lvl:42,ql:55,cw:.25,sig:6.5,dnf:.07,laps:20,field:24,cost:25000,sal:[0,0],pts:"grass",purse:0,
  cal:[["roadatlanta",14],["vir",17],["pitt",20],["midohio",23],["roadamerica",26],["limerock",29],["glen",32],["nola",35],["sebring",38],["roadamerica",41,"SCCA National Championship Runoffs",1]],desc:"The most popular road racing class in America. Drafting packs, door-to-door, cheap thrills."},
 {id:"ff",n:"Formula Ford (F1600)",sh:"Formula Ford",disc:"open",lad:"open-us",tier:2,age:14,lvl:45,ql:55,cw:.3,sig:6.5,dnf:.08,laps:18,field:20,cost:60000,sal:[0,0],pts:"grass",purse:0,
  cal:[["roadatlanta",14],["vir",17],["pitt",20],["midohio",23],["roadamerica",26],["limerock",29],["glen",32],["nola",35],["brands",42,"Formula Ford Festival",1]],desc:"No wings, skinny tires, pure racecraft. A classic first step in single-seaters."},
 {id:"f4us",n:"F4 United States Championship",sh:"F4 US",disc:"open",lad:"open-us",tier:3,age:15,lvl:50,ql:58,cw:.3,sig:6.5,dnf:.09,laps:20,field:24,cost:180000,sal:[0,0],pts:"f1",purse:0,slp:[12,10,7,5,3,2,1],
  cal:[["nola",12],["barber",15],["cota",17],["roadatlanta",20],["midohio",24],["roadamerica",28],["vir",33],["cota",43]],desc:"FIA-certified F4 in America. Superlicense points on the line."},
 {id:"f4it",n:"Italian F4 Championship",sh:"Italian F4",disc:"open",lad:"open-eu",tier:3,age:15,lvl:54,ql:60,cw:.3,sig:6.2,dnf:.09,laps:20,field:30,cost:350000,sal:[0,0],pts:"f1",purse:0,slp:[12,10,7,5,3,2,1],
  cal:[["misano",16],["vallelunga",20],["monza",24],["imola",28],["mugello",34],["monza",40]],desc:"The toughest F4 grid in the world. Europe's academies all watch."},
 {id:"usfj",n:"USF Juniors",sh:"USF Juniors",disc:"open",lad:"open-us",tier:3,age:14,lvl:52,ql:58,cw:.3,sig:6.5,dnf:.09,laps:20,field:20,cost:200000,sal:[0,0],pts:"f1",purse:0,
  cal:[["nola",11],["barber",14],["roadatlanta",19],["vir",24],["midohio",27],["roadamerica",31],["cota",39]],desc:"The first step of the USF Pro Championships, the road to Indy."},
 {id:"usf2",n:"USF2000",sh:"USF2000",disc:"open",lad:"open-us",tier:4,age:15,lvl:56,ql:60,cw:.3,sig:6.2,dnf:.09,laps:22,field:22,cost:350000,sal:[0,0],pts:"f1",purse:0,
  cal:[["stpete",9],["nola",12],["barber",13],["imsrc",19],["roadamerica",25],["midohio",27],["irp",30],["portland",33],["laguna",37]],desc:"Road to Indy rung two. Wings, slicks and scholarships."},
 {id:"usfp",n:"USF Pro 2000",sh:"USF Pro 2000",disc:"open",lad:"open-us",tier:5,age:15,lvl:61,ql:62,cw:.3,sig:6,dnf:.09,laps:25,field:20,cost:600000,sal:[0,0],pts:"f1",purse:0,slp:[10,8,6,4,3,2,1],
  cal:[["stpete",9],["nola",12],["barber",13],["imsrc",19],["roadamerica",25],["midohio",27],["irp",30],["portland",33],["laguna",37]],desc:"The final step before Indy NXT. Win it and the scholarship pays your way up."},
 {id:"nxt",n:"INDY NXT by Firestone",sh:"Indy NXT",disc:"open",lad:"open-us",tier:6,age:16,lvl:67,ql:64,cw:.3,sig:6,dnf:.09,dist:90,field:20,cost:1200000,sal:[0,150000],pts:"indy",purse:0,slp:[15,12,10,8,6,4,3,2,1],
  cal:[["stpete",9],["barber",13],["longbeach",15],["imsrc",19],["detroit",22],["gateway",23],["roadamerica",25],["midohio",27],["iowa",29],["portland",30],["markham",32],["milwaukee",35],["laguna",37]],desc:"IndyCar's official development series. The last stop before the big show."},
 {id:"indycar",n:"NTT INDYCAR SERIES",sh:"IndyCar",disc:"open",lad:"open-us",tier:9,age:18,lvl:80,ql:82,cw:.42,sig:6,dnf:.1,dist:220,field:25,cost:6000000,sal:[500000,8000000],pts:"indy",purse:0,rp:1,slp:[40,30,20,10,8,6,4,3,2,1],mfr:["Chevrolet","Honda"],
  cal:[["stpete",9,"Firestone Grand Prix of St. Petersburg"],["phoenix",10],["arlington",11,"Grand Prix of Arlington"],["barber",13],["longbeach",15,"Grand Prix of Long Beach"],["imsrc",19,"Sonsio Grand Prix"],["indy",21,"Indianapolis 500",1],["detroit",22],["gateway",23],["roadamerica",25],["midohio",27],["nashville",28],["portland",30],["markham",32],["washington",34,"Freedom 250 Grand Prix of Washington, D.C."],["milwaukee",35,"Milwaukee Mile 250 (Race 1)"],["milwaukee",36,"Milwaukee Mile 250 (Race 2)"],["laguna",37,"Grand Prix of Monterey"]],desc:"America's open-wheel championship: ovals, street circuits and road courses, plus the Indianapolis 500."},
 {id:"freca",n:"Formula Regional European Championship",sh:"FRECA",disc:"open",lad:"open-eu",tier:5,age:15,lvl:62,ql:62,cw:.3,sig:6,dnf:.09,laps:22,field:30,cost:900000,sal:[0,0],pts:"f1",purse:0,slp:[25,20,15,10,7,5,3,2,1],
  cal:[["misano",16],["monza",18],["spa",20],["zandvoort",25],["hungaroring",29],["barcelona",31],["imola",34],["mugello",37],["redbullring",40],["paulricard",42]],desc:"Formula Regional by Alpine. The bridge between F4 and FIA F3."},
 {id:"f3",n:"FIA Formula 3 Championship",sh:"FIA F3",disc:"open",lad:"open-eu",tier:6,age:16,lvl:69,ql:65,cw:.3,sig:5.8,dnf:.1,laps:22,field:30,cost:1500000,sal:[0,0],pts:"f1",purse:0,rp:1,slp:[30,25,20,15,12,9,7,5,3,1],
  cal:[["albert",10],["bahrain",15],["monaco",23],["barcelona",24],["redbullring",26],["silverstone",27],["spa",29],["hungaroring",30],["monza",36],["madrid",37]],desc:"Thirty cars on the F1 support bill. Brutal, crowded, decisive."},
 {id:"f2",n:"FIA Formula 2 Championship",sh:"FIA F2",disc:"open",lad:"open-eu",tier:7,age:17,lvl:75,ql:68,cw:.3,sig:5.5,dnf:.1,laps:30,field:22,cost:2800000,sal:[0,300000],pts:"f1",purse:0,rp:1,slp:[40,40,40,30,20,10,8,6,4,3],
  cal:[["albert",10],["bahrain",15],["jeddah",16],["monaco",23],["barcelona",24],["redbullring",26],["silverstone",27],["spa",29],["hungaroring",30],["monza",36],["madrid",37],["baku",39],["lusail",48],["yasmarina",49]],desc:"The final step before Formula 1. Win this and the superlicense is yours."},
 {id:"f1",n:"FIA Formula One World Championship",sh:"Formula 1",disc:"open",lad:"open-eu",tier:10,age:18,lvl:88,ql:85,cw:.62,sig:4.5,dnf:.07,dist:190,field:22,cost:0,sal:[1000000,55000000],pts:"f1",purse:0,rp:1,lic:"slp",
  cal:[["albert",10,"Australian Grand Prix"],["shanghai",11,"Chinese Grand Prix"],["suzuka",13,"Japanese Grand Prix"],["bahrain",15,"Bahrain Grand Prix"],["jeddah",16,"Saudi Arabian Grand Prix"],["miami",18,"Miami Grand Prix"],["montreal",21,"Canadian Grand Prix"],["monaco",23,"Monaco Grand Prix",1],["barcelona",24,"Barcelona-Catalunya Grand Prix"],["redbullring",26,"Austrian Grand Prix"],["silverstone",27,"British Grand Prix"],["spa",29,"Belgian Grand Prix"],["hungaroring",30,"Hungarian Grand Prix"],["zandvoort",34,"Dutch Grand Prix"],["monza",36,"Italian Grand Prix"],["madrid",37,"Spanish Grand Prix"],["baku",39,"Azerbaijan Grand Prix"],["singapore",41,"Singapore Grand Prix"],["cota",43,"United States Grand Prix"],["mexico",44,"Mexico City Grand Prix"],["interlagos",45,"São Paulo Grand Prix"],["vegas",47,"Las Vegas Grand Prix"],["lusail",48,"Qatar Grand Prix"],["yasmarina",49,"Abu Dhabi Grand Prix"]],desc:"The pinnacle. Twenty-two seats on Earth."},
 // ---------- STOCK CAR LADDER ----------
 {id:"arca",n:"ARCA Menards Series",sh:"ARCA",disc:"stock",lad:"stock",tier:5,age:15,lvl:58,ql:60,cw:.55,sig:8,dnf:.13,dist:120,field:24,cost:500000,sal:[0,120000],pts:"nascar",purse:0,mfr:["Chevrolet","Ford","Toyota"],
  cal:[["daytona",6],["phoenix",10],["talladega",17],["kansas",16],["glen",19],["charlotte",21],["toledo",22],["michigan",23],["pocono",24],["elko",26],["iowa",28],["irp",30],["berlin",31],["springfield",33],["milwaukee",34],["duquoin",35],["salem",36],["bristol",37],["toledo",39],["kansas",40]],desc:"The bridge from short tracks to NASCAR's national series. Superspeedways, dirt miles and bullrings."},
 {id:"truck",n:"NASCAR CRAFTSMAN Truck Series",sh:"Truck Series",disc:"stock",lad:"stock",tier:6,age:16,lvl:69,ql:70,cw:.5,sig:7.5,dnf:.12,dist:200,field:34,cost:1500000,sal:[100000,600000],pts:"nascar",purse:0,rp:1,chase:{after:18,n:10},mfr:["Chevrolet","Ford","Toyota","Ram"],
  cal:[["daytona",6],["atlanta",7],["stpete",9],["darlington",12],["rockingham",13],["bristol",15],["texas",18],["glen",19],["dover",20],["charlotte",21],["nashville",22],["michigan",23],["sandiego",25],["limerock",27],["nwilkesboro",28],["irp",30],["richmond",32],["newhampshire",33],["bristol",37],["kansas",38],["roval",40],["talladega",41],["martinsville",42],["phoenix",43],["homestead",44,"Truck Series Championship"]],desc:"Pickups, rookies and veterans. NASCAR's national proving ground."},
 {id:"oap",n:"NASCAR O'Reilly Auto Parts Series",sh:"O'Reilly Series",disc:"stock",lad:"stock",tier:7,age:18,lvl:73,ql:73,cw:.5,sig:7,dnf:.11,dist:250,field:36,cost:3500000,sal:[250000,1500000],pts:"nascar",purse:0,rp:1,chase:{after:24,n:12},mfr:["Chevrolet","Ford","Toyota"],
  cal:[["daytona",6],["atlanta",8],["cota",9],["phoenix",10],["lasvegas",11],["darlington",12],["martinsville",13],["rockingham",14],["bristol",15],["talladega",17],["texas",18],["glen",19],["charlotte",21],["nashville",22],["pocono",24],["sandiego",25],["sonoma",26],["chicagoland",27],["dover",29],["indy",30],["iowa",31],["richmond",32],["newhampshire",33],["daytona",34],["darlington",35],["bristol",37],["kansas",38],["lasvegas",39],["roval",40],["talladega",41],["martinsville",42],["phoenix",43],["homestead",44,"O'Reilly Series Championship"]],desc:"NASCAR's top developmental series (formerly Xfinity). Future Cup stars and Cup moonlighters."},
 {id:"cup",n:"NASCAR Cup Series",sh:"Cup Series",disc:"stock",lad:"stock",tier:9,age:18,lvl:82,ql:82,cw:.48,sig:6.5,dnf:.1,dist:400,field:37,cost:12000000,sal:[1500000,15000000],pts:"nascar",purse:0,rp:1,chase:{after:26,n:16},mfr:["Chevrolet","Ford","Toyota"],slp:[15,12,10,8,6,5,4,3,2,1],
  cal:[["daytona",7,"Daytona 500",1],["atlanta",8],["cota",9],["phoenix",10],["lasvegas",11],["darlington",12],["martinsville",13],["bristol",15],["kansas",16],["talladega",17],["texas",18],["glen",19],["charlotte",21,"Coca-Cola 600",1],["nashville",22],["michigan",23],["pocono",24],["sandiego",25],["sonoma",26],["chicagoland",27],["nwilkesboro",28],["dover",29],["indy",30,"Brickyard 400",1],["iowa",31],["richmond",32],["newhampshire",33],["daytona",34,"Coke Zero Sugar 400"],["darlington",35,"Southern 500",1],["gateway",36],["bristol",37,"Bass Pro Shops Night Race"],["kansas",38],["lasvegas",39],["roval",40],["talladega",41],["martinsville",42],["phoenix",43],["homestead",44,"Cup Series Championship Race"]],desc:"The top of American stock car racing. 36 races, the Daytona 500 and the Chase."},
 // ---------- SPORTS CARS ----------
 {id:"imsagtd",n:"IMSA WeatherTech SportsCar Championship (GTD)",sh:"IMSA GTD",disc:"sports",lad:"sports",tier:6,age:16,lvl:66,ql:66,cw:.45,sig:6,dnf:.08,endur:1,field:18,cost:600000,sal:[40000,300000],pts:"imsa",purse:0,
  cal:[["daytona",4,"Rolex 24 At Daytona",1],["sebring",11,"Twelve Hours of Sebring",1],["laguna",19],["glen",26,"Six Hours of The Glen"],["ctmp",28],["roadamerica",31],["vir",34],["imsrc",38],["roadatlanta",41,"Petit Le Mans",1]],desc:"GT3 cars from Porsche, Ferrari, BMW, Lamborghini, Corvette and more. A pro career in sports cars starts here."},
 {id:"imsagtp",n:"IMSA WeatherTech SportsCar Championship (GTP)",sh:"IMSA GTP",disc:"sports",lad:"sports",tier:8,age:18,lvl:82,ql:84,cw:.45,sig:5.5,dnf:.08,endur:1,field:12,cost:0,sal:[400000,2000000],pts:"imsa",purse:0,rp:1,slp:[18,14,12,10,8,6,4,3,2,1],
  cal:[["daytona",4,"Rolex 24 At Daytona",1],["sebring",11,"Twelve Hours of Sebring",1],["longbeach",15],["laguna",19],["detroit",22],["glen",26,"Six Hours of The Glen"],["roadamerica",31],["imsrc",38],["roadatlanta",41,"Petit Le Mans",1]],desc:"Hybrid prototypes from Porsche, Cadillac, BMW, Acura and Aston Martin."},
 {id:"wecgt",n:"FIA World Endurance Championship (LMGT3)",sh:"WEC LMGT3",disc:"sports",lad:"sports",tier:6,age:17,lvl:66,ql:66,cw:.45,sig:6,dnf:.08,endur:1,field:18,cost:1200000,sal:[40000,250000],pts:"wec",purse:0,
  cal:[["lusail",9,"Qatar 1812km"],["imola",16,"6 Hours of Imola"],["spa",19,"6 Hours of Spa-Francorchamps"],["lemans",24,"24 Hours of Le Mans",1],["interlagos",28,"6 Hours of São Paulo"],["cota",35,"Lone Star Le Mans"],["fuji",39,"6 Hours of Fuji"],["bahrain",45,"8 Hours of Bahrain"]],desc:"The world championship's GT class, including Le Mans."},
 {id:"wec",n:"FIA World Endurance Championship (Hypercar)",sh:"WEC Hypercar",disc:"sports",lad:"sports",tier:8,age:18,lvl:82,ql:84,cw:.45,sig:5.5,dnf:.08,endur:1,field:16,cost:0,sal:[500000,2500000],pts:"wec",purse:0,rp:1,slp:[20,16,12,10,8,6,4,3,2,1],
  cal:[["lusail",9,"Qatar 1812km"],["imola",16,"6 Hours of Imola"],["spa",19,"6 Hours of Spa-Francorchamps"],["lemans",24,"24 Hours of Le Mans",1],["interlagos",28,"6 Hours of São Paulo"],["cota",35,"Lone Star Le Mans"],["fuji",39,"6 Hours of Fuji"],["bahrain",45,"8 Hours of Bahrain"]],desc:"Ferrari, Toyota, Cadillac, BMW, Alpine, Peugeot, Aston Martin and Genesis fight for Le Mans."},
 // ---------- OTHERS ----------
 {id:"fe",n:"ABB FIA Formula E World Championship",sh:"Formula E",disc:"open",lad:"fe",tier:8,age:18,lvl:82,ql:84,cw:.4,sig:7.5,dnf:.08,dist:55,field:20,cost:0,sal:[500000,4000000],pts:"fe",purse:0,rp:1,slp:[30,25,20,15,12,10,8,6,4,2],
  cal:[["fe_mexico",2,"Mexico City E-Prix"],["fe_miami",5,"Miami E-Prix"],["fe_jeddah",7,"Jeddah E-Prix (Race 1)"],["fe_jeddah",8,"Jeddah E-Prix (Race 2)"],["fe_madrid",12,"Madrid E-Prix"],["fe_monaco",18,"Monaco E-Prix"],["fe_berlin",20,"Berlin E-Prix (Race 1)"],["fe_berlin",21,"Berlin E-Prix (Race 2)"],["fe_tokyo",22,"Tokyo E-Prix"],["fe_shanghai",25,"Shanghai E-Prix"],["fe_jakarta",26,"Jakarta E-Prix"],["fe_london",31,"London E-Prix (Race 1)"],["fe_london",32,"London E-Prix (Race 2)"]],desc:"Electric street racing: energy management, Attack Mode and chaos."},
 {id:"supercars",n:"Repco Supercars Championship",sh:"Supercars",disc:"stock",lad:"aus",tier:8,age:17,lvl:80,ql:80,cw:.42,sig:5.5,dnf:.07,dist:150,field:24,cost:2000000,sal:[200000,1200000],pts:"super",purse:0,rp:1,slp:[10,8,6,5,4,3,2,1],mfr:["Ford","Chevrolet","Toyota"],
  cal:[["sydney",7],["albert",10],["taupo",15],["symmons",17],["wanneroo",19],["hiddenvalley",24],["townsville",28],["ipswich",31],["thebend",35],["sandown",37],["bathurst",41,"Bathurst 1000",1],["goldcoast",43,"Gold Coast 500"],["adelaide",48,"Adelaide Grand Final"]],desc:"Australia's V8 touring car war: Mustang vs Camaro vs Supra, and the Great Race at Bathurst."},
 {id:"nhra",n:"NHRA Mission Foods Drag Racing Series (Top Fuel)",sh:"NHRA Top Fuel",disc:"drag",lad:"drag",tier:7,age:18,lvl:80,ql:75,cw:.5,sig:4,dnf:.0,field:16,cost:3000000,sal:[150000,1500000],pts:"nhra",purse:0,rp:1,
  cal:[["gainesville",10,"Gatornationals"],["wildhorse",12],["pomona",14,"Winternationals"],["vegasdrag",15],["zmax",17,"Four-Wide Nationals"],["route66",20],["bristoldrag",22,"Thunder Valley Nationals"],["summit",25],["pacific",29],["sonomadrag",30],["brainerd",32],["indydrag",35,"U.S. Nationals",1],["maplegrove",37],["wwtdrag",40],["motorplex",42,"Fall Nationals"],["vegasdrag",43],["pomona",45,"In-N-Out Burger Finals"]],desc:"11,000 horsepower, 330 mph, under four seconds. An optional side path for the brave."},
 // ---------- ONE-OFF CROWN JEWEL EVENTS (no championship) ----------
 {id:"chili",n:"Chili Bowl Nationals",sh:"Chili Bowl",disc:"dirt",lad:"dirt",tier:5,age:14,lvl:66,ql:62,cw:.38,sig:8,dnf:.1,laps:55,field:24,cost:0,sal:[0,0],pts:"none",purse:10000,oneoff:1,pool:["woo","hlr","midget","lolmds","microsp","sprint360"],
  cal:[["tulsa",2,"Chili Bowl Nationals",1]],desc:"Indoor midget racing in a Tulsa expo hall every January. Everybody comes."},
 {id:"snowball",n:"Snowball Derby",sh:"Snowball Derby",disc:"stock",lad:"stock",tier:5,age:14,lvl:60,ql:60,cw:.45,sig:7,dnf:.12,laps:300,field:30,cost:0,sal:[0,0],pts:"none",purse:30000,oneoff:1,pool:["slm","lm","arca","truck"],
  cal:[["fiveflags",49,"Snowball Derby",1]],desc:"300 laps at Five Flags Speedway in December. The most famous Super Late Model race on Earth."}
];
const SER={};SERIES_LIST.forEach(s=>{SER[s.id]=s;s.cal.sort((a,b)=>a[1]-b[1]);});
const LADDERS={kart:"Karting",stock:"Stock car",dirt:"Dirt",spec:"Club road racing","open-us":"American open wheel (Road to Indy)","open-eu":"European open wheel (Road to F1)",sports:"Sports cars",fe:"Formula E",aus:"Australian Supercars",drag:"Drag racing"};
const DISC_N={kart:"Karting",stock:"Stock cars",dirt:"Dirt",open:"Open wheel",sports:"Sports cars",drag:"Drag racing"};
// Which series a successful driver usually moves to next (progression graph); used for offers and AI promotion.
const NEXT={kclub:["kreg","band","legends","minisp"],kreg:["knat","legends","f4us","usfj","ff","microsp","miata"],knat:["kint","f4us","usfj","f4it","legends","lm"],kint:["f4it","freca","f4us","usfj"],
 hobby:["pure","street"],pure:["street","lm"],street:["lm","dmod"],band:["legends","lm"],legends:["lm","slm","arca"],lm:["slm","arca"],slm:["arca","truck"],
 minisp:["microsp"],microsp:["dmod","sprint360","midget"],dmod:["dlm"],dlm:["lolmds","arca"],sprint360:["midget","hlr","woo"],midget:["woo","hlr","arca","usfp"],lolmds:["arca"],woo:["truck"],hlr:["truck"],
 miata:["imsagtd","ff"],ff:["f4us","usf2","miata"],f4us:["usf2","usfp","freca"],usfj:["usf2"],usf2:["usfp"],usfp:["nxt"],nxt:["indycar"],indycar:["imsagtp"],
 f4it:["freca","f3"],freca:["f3"],f3:["f2"],f2:["f1","fe","indycar","wec"],f1:["wec","indycar","fe"],
 arca:["truck"],truck:["oap"],oap:["cup"],cup:[],imsagtd:["imsagtp","wecgt"],wecgt:["wec","imsagtd"],imsagtp:["wec"],wec:["imsagtp"],fe:["wec"],supercars:[],nhra:[]};
// Starting series offered at character creation, grouped by discipline.
const START_SERIES=["kclub","kreg","hobby","pure","street","lm","band","legends","minisp","microsp","dmod","dlm","miata","ff","f4us","f4it","usfj"];
const PTS={f1:[25,18,15,12,10,8,6,4,2,1],indy:[50,40,35,32,30,28,26,24,22,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5],imsa:[350,320,300,280,260,250,240,230,220,210,200,190,180,170,160,150,140,130,120,110],
 super:[150,138,129,120,111,102,96,90,84,78,72,69,66,63,60,57,54,51,48,45,42,39,36,33,30],nhra:[]};
function ptsFor(s,p,ev){const k=SER[s].pts;if(k==="none")return 0;if(p<=0)return 0;
 if(k==="nascar")return p===1?55:Math.max(1,37-p);
 if(k==="nhra")return p===1?100:p===2?80:p<=4?60:p<=8?40:20;
 if(k==="grass")return Math.max(10,52-2*p);
 if(k==="sprint")return Math.max(40,154-4*p);
 if(k==="wec"){const v=PTS.f1[p-1]||0;return ev&&/Le Mans/.test(ev)?v*2:v;}
 if(k==="fe")return PTS.f1[p-1]||0;
 const t=PTS[k];if(!t)return 0;return t[p-1]!==undefined?t[p-1]:(k==="imsa"?Math.max(60,110-5*(p-20)):k==="super"?Math.max(15,30-(p-25)*3):k==="indy"?5:0);}

/* ===================== REAL TEAMS & DRIVERS (2025-26 snapshot) ===================== */
// Real names appear inside a fictional story. Ratings are game estimates, not real-world judgments.
// [team, manufacturer/engine, car quality, owner/principal, [[car #, driver, nationality, birth year, rating, traits(o=oval r=road d=dirt w=wet), co-drivers...]]]
const REAL={
 cup:[["Hendrick Motorsports","Chevrolet",93,"Rick Hendrick",[[5,"Kyle Larson","USA",1992,92,"d8r1"],[9,"Chase Elliott","USA",1995,88,"r3"],[24,"William Byron","USA",1997,89,""],[48,"Alex Bowman","USA",1993,82,""]]],
  ["Joe Gibbs Racing","Toyota",92,"Joe Gibbs",[[11,"Denny Hamlin","USA",1980,90,"o2"],[19,"Chase Briscoe","USA",1994,85,"d5"],[20,"Christopher Bell","USA",1994,89,"d8"],[54,"Ty Gibbs","USA",2002,82,"r2"]]],
  ["Team Penske","Ford",89,"Roger Penske",[[2,"Austin Cindric","USA",1998,80,"r3"],[12,"Ryan Blaney","USA",1993,89,""],[22,"Joey Logano","USA",1990,88,""]]],
  ["Wood Brothers Racing","Ford",80,"Eddie and Len Wood",[[21,"Josh Berry","USA",1990,80,""]]],
  ["23XI Racing","Toyota",88,"Michael Jordan and Denny Hamlin",[[23,"Bubba Wallace","USA",1993,83,""],[45,"Tyler Reddick","USA",1996,87,"d5r2"],[35,"Riley Herbst","USA",1999,76,""]]],
  ["Trackhouse Racing","Chevrolet",83,"Justin Marks",[[1,"Ross Chastain","USA",1992,84,""],[88,"Connor Zilisch","USA",2006,80,"r6"],[97,"Shane van Gisbergen","NZL",1989,84,"r10o-4w5"]]],
  ["RFK Racing","Ford",83,"Brad Keselowski",[[6,"Brad Keselowski","USA",1984,81,""],[17,"Chris Buescher","USA",1992,84,""],[60,"Ryan Preece","USA",1990,80,""]]],
  ["Richard Childress Racing","Chevrolet",80,"Richard Childress",[[3,"Austin Dillon","USA",1990,77,""],[33,"Austin Hill","USA",1994,79,""]]],
  ["Legacy Motor Club","Toyota",79,"Jimmie Johnson",[[42,"John Hunter Nemechek","USA",1997,79,""],[43,"Erik Jones","USA",1996,79,""]]],
  ["Spire Motorsports","Chevrolet",79,"Jeff Dickerson and T.J. Puchyr",[[7,"Daniel Suárez","MEX",1992,80,"r3"],[71,"Michael McDowell","USA",1984,79,"r5"],[77,"Carson Hocevar","USA",2003,81,""]]],
  ["Kaulig Racing","Chevrolet",76,"Matt Kaulig",[[10,"Ty Dillon","USA",1992,74,""],[16,"AJ Allmendinger","USA",1981,79,"r7"]]],
  ["Front Row Motorsports","Ford",77,"Bob Jenkins",[[4,"Noah Gragson","USA",1998,76,""],[34,"Todd Gilliland","USA",2000,76,""],[38,"Zane Smith","USA",1999,78,""]]],
  ["Haas Factory Team","Chevrolet",74,"Gene Haas",[[41,"Cole Custer","USA",1998,77,""]]],
  ["Hyak Motorsports","Chevrolet",74,"Hyak Motorsports ownership group",[[47,"Ricky Stenhouse Jr.","USA",1987,77,"d3"]]],
  ["Rick Ware Racing","Chevrolet",68,"Rick Ware",[[51,"Cody Ware","USA",1995,68,""]]]],
 oap:[["JR Motorsports","Chevrolet",88,"Dale Earnhardt Jr.",[[1,"Carson Kvapil","USA",2003,79,""],[7,"Justin Allgaier","USA",1986,82,""],[8,"Sammy Smith","USA",2004,77,""],[88,"Rajah Caruth","USA",2002,75,""]]],
  ["Haas Factory Team","Chevrolet",84,"Gene Haas",[["00","Sheldon Creed","USA",1997,80,"r2"],[41,"Sam Mayer","USA",2003,79,"r2"]]],
  ["Richard Childress Racing","Chevrolet",84,"Richard Childress",[[2,"Jesse Love","USA",2005,79,""],[21,null]]],
  ["Joe Gibbs Racing","Toyota",86,"Joe Gibbs",[[18,"William Sawalich","USA",2006,76,""],[19,"Brent Crews","USA",2008,74,""],[20,"Brandon Jones","USA",1997,78,""],[54,"Taylor Gray","USA",2005,77,""]]],
  ["Hendrick Motorsports","Chevrolet",85,"Rick Hendrick",[[17,"Corey Day","USA",2005,77,"d8"]]],
  ["Viking Motorsports","Chevrolet",76,"Viking Motorsports ownership",[[96,"Anthony Alfredo","USA",1999,72,""],[99,"Parker Retzlaff","USA",2003,74,""]]],
  ["RSS Racing","Ford",72,"Rod Sieg",[[39,"Ryan Sieg","USA",1993,74,""],[28,"Kyle Sieg","USA",1996,69,""]]],
  ["Alpha Prime Racing","Chevrolet",70,"Tommy Joe Martins",[[44,"Brennan Poole","USA",1991,71,""],[45,"Lavar Scott","USA",2002,69,""]]],
  ["Sam Hunt Racing","Toyota",74,"Sam Hunt",[[24,"Harrison Burton","USA",2000,74,""],[26,"Dean Thompson","USA",2002,70,""]]],
  ["Jeremy Clements Racing","Chevrolet",66,"Tony Clements",[[51,"Jeremy Clements","USA",1985,68,""]]],
  ["Jordan Anderson Racing","Chevrolet",70,"Jordan Anderson",[[27,"Jeb Burton","USA",1992,70,""],[31,"Blaine Perkins","USA",2002,67,""]]],
  ["Big Machine Racing","Chevrolet",70,"Scott Borchetta",[[48,"Patrick Staropoli","USA",1997,68,""]]],
  ["SS-Greenlight Racing","Chevrolet",64,"Bobby Dotter",[["07","Josh Bilicki","USA",1995,66,"r4"],[14,"Garrett Smithley","USA",1992,64,""]]],
  ["Young's Motorsports","Chevrolet",64,"Tyler Young",[["02","Ryan Ellis","USA",1989,66,"r3"]]],
  ["Peterson Racing","Chevrolet",66,"Peterson Racing ownership",[[87,"Austin Green","USA",1997,66,""]]],
  ["DGM Racing","Chevrolet",63,"Mario Gosselin",[[92,"Josh Williams","USA",1993,66,""],[91,"Mason Maggio","USA",2000,62,""]]],
  ["Joey Gase Motorsports","Chevrolet",60,"Joey Gase",[[35,"Joey Gase","USA",1993,62,""]]]],
 truck:[["TRICON Garage","Toyota",86,"David Gilliland",[[1,"Corey Heim","USA",2002,82,""],[11,"Kaden Honeycutt","USA",2003,75,""],[15,"Tanner Gray","USA",1999,73,""],[17,"Gio Ruggiero","USA",2006,74,""],[5,"Nick Leitz","USA",2003,67,""]]],
  ["Front Row Motorsports","Ford",84,"Bob Jenkins",[[34,"Layne Riggs","USA",2002,78,""],[38,"Chandler Smith","USA",2002,79,""]]],
  ["ThorSport Racing","Ford",80,"Duke and Rhonda Thorson",[[13,"Cole Butcher","CAN",1998,72,""],[88,"Ty Majeski","USA",1994,79,""],[98,"Jake Garcia","USA",2005,72,""],[99,"Ben Rhodes","USA",1997,75,""]]],
  ["McAnally-Hilgemann Racing","Chevrolet",80,"Bill McAnally",[[18,"Tyler Ankrum","USA",2001,74,""],[19,"Daniel Hemric","USA",1991,77,""],[81,"Kris Wright","USA",1999,66,""],[91,"Christian Eckes","USA",2001,78,""]]],
  ["Kaulig Racing","Ram",78,"Matt Kaulig",[[10,"Daniel Dye","USA",2003,71,""],[12,"Brenden Queen","USA",2001,72,""],[14,"Mini Tyrrell","GBR",2007,66,"r3"],[16,"Justin Haley","USA",1999,75,""]]],
  ["Spire Motorsports","Chevrolet",82,"Jeff Dickerson and T.J. Puchyr",[[7,"Connor Mosack","USA",1998,70,"r2"],[77,null]]],
  ["Niece Motorsports","Chevrolet",74,"Al Niece",[[44,"Andrés Pérez de Lara","MEX",2004,70,""],[42,"Tyler Reif","USA",2003,66,""]]],
  ["Halmar Friesen Racing","Toyota",74,"Stewart Friesen",[[52,"Stewart Friesen","CAN",1983,72,"d10"]]],
  ["CR7 Motorsports","Chevrolet",72,"Codie Rohrbaugh",[[9,"Grant Enfinger","USA",1985,75,""]]],
  ["Rackley W.A.R.","Chevrolet",68,"Curtis Rackley",[[26,"Dawson Sutton","USA",2006,66,""]]],
  ["Freedom Racing Enterprises","Chevrolet",62,"Freedom Racing ownership",[[76,"Spencer Boyd","USA",1995,63,""]]],
  ["Team Reaume","Ford",60,"Josh Reaume",[[22,"Josh Reaume","CAN",1991,60,""],[33,"Frankie Muniz","USA",1985,58,""]]]],
 arca:[["Venturini Motorsports","Toyota",80,"Billy Venturini",[[15,null],[20,null],[25,null],[55,null]]],["Joe Gibbs Racing","Toyota",84,"Joe Gibbs",[[18,null]]],["Rette Jones Racing","Ford",72,"Mark Rette",[[30,null]]],
  ["Pinnacle Racing Group","Chevrolet",76,"Pinnacle Racing Group",[[28,null]]],["Nitro Motorsports","Toyota",72,"Nitro Motorsports",[[70,null]]],["Bill McAnally Racing","Chevrolet",74,"Bill McAnally",[[16,null],[19,null]]],
  ["Fast Track Racing","Ford",58,"Andy Hillenburg",[[10,null],[11,null],[12,null]]],["Clubb Racing","Ford",56,"Brad Clubb",[[86,null]]],["Greg Van Alst Motorsports","Ford",64,"Greg Van Alst",[[35,null]]],["Cook Racing Technologies","Chevrolet",66,"Cook Racing",[[17,null]]]],
 indycar:[["Team Penske","Chevrolet",91,"Roger Penske",[[2,"Josef Newgarden","USA",1990,88,"o4"],[3,"Scott McLaughlin","NZL",1993,88,""],[12,"David Malukas","USA",2001,83,"o3"]]],
  ["Chip Ganassi Racing","Honda",93,"Chip Ganassi",[[10,"Álex Palou","ESP",1997,95,""],[9,"Scott Dixon","NZL",1980,90,"w4"],[8,"Kyffin Simpson","CAY",2004,76,""]]],
  ["Arrow McLaren","Chevrolet",88,"Zak Brown",[[5,"Pato O'Ward","MEX",1999,89,"o3"],[7,"Christian Lundgaard","DEN",2001,85,"r3"],[6,"Nolan Siegel","USA",2004,77,""]]],
  ["Andretti Global","Honda",86,"Dan Towriss",[[26,"Will Power","AUS",1981,87,"r3"],[27,"Kyle Kirkwood","USA",1998,86,"r3"],[28,"Marcus Ericsson","SWE",1990,83,"o2"]]],
  ["Rahal Letterman Lanigan Racing","Honda",80,"Bobby Rahal",[[15,"Graham Rahal","USA",1989,80,""],[45,"Louis Foster","GBR",2003,78,""],[47,"Mick Schumacher","GER",1999,79,"r2"]]],
  ["Meyer Shank Racing","Honda",82,"Mike Shank",[[60,"Felix Rosenqvist","SWE",1991,84,""],[66,"Marcus Armstrong","NZL",2000,82,""]]],
  ["A.J. Foyt Racing","Chevrolet",78,"Larry Foyt",[[14,"Santino Ferrucci","USA",1998,80,"o5"],[4,"Caio Collet","BRA",2002,77,""]]],
  ["Ed Carpenter Racing","Chevrolet",79,"Ed Carpenter",[[20,"Alexander Rossi","USA",1991,84,"o2"],[21,"Christian Rasmussen","DEN",2000,79,""]]],
  ["Dale Coyne Racing","Honda",74,"Dale Coyne",[[18,"Romain Grosjean","FRA",1986,80,"r3"],[19,"Dennis Hauger","NOR",2003,79,""]]],
  ["Juncos Hollinger Racing","Chevrolet",74,"Ricardo Juncos",[[76,"Rinus VeeKay","NED",2000,79,""],[77,"Sting Ray Robb","USA",2001,71,""]]]],
 nxt:[["Andretti Global","Dallara-HMD",80,"Dan Towriss",[[26,null],[27,null],[28,null]]],["HMD Motorsports","Dallara-HMD",80,"Henry Malukas",[[1,null],[11,null],[39,null],[71,null]]],["Abel Motorsports","Dallara-HMD",72,"Abel Motorsports",[[51,null],[19,null]]],
  ["Cape Motorsports","Dallara-HMD",70,"Dan Andersen",[[2,null],[3,null]]],["Chip Ganassi Racing","Dallara-HMD",78,"Chip Ganassi",[[9,null],[10,null]]],["Juncos Hollinger Racing","Dallara-HMD",70,"Ricardo Juncos",[[76,null],[77,null]]],["Cusick Motorsports","Dallara-HMD",64,"Cusick Motorsports",[[23,null]]]],
 f1:[["McLaren F1 Team","Mercedes",95,"Zak Brown",[[1,"Lando Norris","GBR",1999,94,"w3"],[81,"Oscar Piastri","AUS",2001,93,""]]],
  ["Mercedes-AMG Petronas F1 Team","Mercedes",93,"Toto Wolff",[[63,"George Russell","GBR",1998,93,"w2"],[12,"Kimi Antonelli","ITA",2006,86,""]]],
  ["Oracle Red Bull Racing","Red Bull Ford",90,"Laurent Mekies",[[3,"Max Verstappen","NED",1997,97,"w6"],[6,"Isack Hadjar","FRA",2004,84,""]]],
  ["Scuderia Ferrari HP","Ferrari",91,"Fred Vasseur",[[16,"Charles Leclerc","MON",1997,92,""],[44,"Lewis Hamilton","GBR",1985,89,"w5"]]],
  ["Atlassian Williams Racing","Mercedes",84,"James Vowles",[[23,"Alex Albon","THA",1996,87,""],[55,"Carlos Sainz","ESP",1994,89,""]]],
  ["Visa Cash App Racing Bulls","Red Bull Ford",80,"Alan Permane",[[30,"Liam Lawson","NZL",2002,82,""],[41,"Arvid Lindblad","GBR",2007,80,""]]],
  ["Aston Martin Aramco F1 Team","Honda",82,"Lawrence Stroll",[[14,"Fernando Alonso","ESP",1981,89,"w4"],[18,"Lance Stroll","CAN",1998,80,"w3"]]],
  ["MoneyGram Haas F1 Team","Ferrari",79,"Ayao Komatsu",[[31,"Esteban Ocon","FRA",1996,84,""],[87,"Oliver Bearman","GBR",2005,84,""]]],
  ["Audi Revolut F1 Team","Audi",77,"Jonathan Wheatley",[[27,"Nico Hülkenberg","GER",1987,85,"w2"],[5,"Gabriel Bortoleto","BRA",2004,83,""]]],
  ["BWT Alpine F1 Team","Mercedes",80,"Flavio Briatore",[[10,"Pierre Gasly","FRA",1996,86,"w2"],[43,"Franco Colapinto","ARG",2003,80,""]]],
  ["Cadillac Formula 1 Team","Ferrari",72,"Graeme Lowdon",[[11,"Sergio Pérez","MEX",1990,85,""],[77,"Valtteri Bottas","FIN",1989,85,""]]]],
 f2:[["Campos Racing","Mecachrome",72,"Adrián Campos Jr.",[[1,"Nikola Tsolov","BUL",2007,78,""],[2,null]]],["Invicta Racing","Mecachrome",74,"Invicta Racing",[[3,"Rafael Câmara","BRA",2005,79,""],[4,null]]],
  ["Hitech TGR","Mecachrome",73,"Oliver Oakes",[[5,"Colton Herta","USA",2000,82,""],[6,"Dino Beganovic","SWE",2004,77,""]]],["MP Motorsport","Mecachrome",72,"Sander Dorsman",[[7,"Gabriele Minì","ITA",2005,77,""],[8,"Oliver Goethe","GER",2004,74,""]]],
  ["Rodin Motorsport","Mecachrome",71,"Rodin Motorsport",[[9,"Alex Dunne","IRL",2005,78,""],[10,"Martinius Stenshorne","NOR",2005,76,""]]],["ART Grand Prix","Mecachrome",72,"Sébastien Philippe",[[11,"Tim Tramnitz","GER",2004,74,""],[12,null]]],
  ["PREMA Racing","Mecachrome",71,"René Rosin",[[14,"Sebastián Montoya","COL",2005,75,""],[15,"Mari Boya","ESP",2005,73,""]]],["DAMS Lucas Oil","Mecachrome",69,"Charles Pic",[[16,"Kush Maini","IND",2000,75,""],[17,null]]],
  ["Trident","Mecachrome",68,"Giacomo Ricci",[[20,"Laurens van Hoepen","NED",2005,74,""],[21,"John Bennett","GBR",2003,72,""]]],["AIX Racing","Mecachrome",66,"AIX Racing",[[22,"Joshua Dürksen","PAR",2003,75,""],[23,null]]],
  ["Van Amersfoort Racing","Mecachrome",67,"Frits van Amersfoort",[[24,"Ritomo Miyata","JPN",1999,74,""],[25,"Roman Staněk","CZE",2004,74,""]]]],
 f3:[["PREMA Racing","Mecachrome",72,"René Rosin",[[1,null],[2,"Ugo Ugochukwu","USA",2007,73,""],[3,null]]],["Trident","Mecachrome",72,"Giacomo Ricci",[[4,"Noah Strømsted","DEN",2006,72,""],[5,null],[6,null]]],
  ["ART Grand Prix","Mecachrome",71,"Sébastien Philippe",[[7,"Tuukka Taponen","FIN",2006,72,""],[8,null],[9,null]]],["Hitech TGR","Mecachrome",70,"Oliver Oakes",[[10,"Freddie Slater","GBR",2008,73,""],[11,null],[12,null]]],
  ["MP Motorsport","Mecachrome",71,"Sander Dorsman",[[14,"Charlie Wurz","AUT",2005,71,""],[15,null],[16,null]]],["Campos Racing","Mecachrome",68,"Adrián Campos Jr.",[[17,"Roman Bilinski","GBR",2004,71,""],[18,null],[19,null]]],
  ["Van Amersfoort Racing","Mecachrome",67,"Frits van Amersfoort",[[20,"Théophile Naël","FRA",2004,70,""],[21,null],[22,null]]],["Rodin Motorsport","Mecachrome",67,"Rodin Motorsport",[[23,"Callum Voisin","GBR",2005,70,""],[24,null],[25,null]]],
  ["AIX Racing","Mecachrome",64,"AIX Racing",[[26,null],[27,null],[28,null]]],["DAMS Lucas Oil","Mecachrome",65,"Charles Pic",[[29,"Alessandro Giusti","FRA",2006,70,""],[30,null],[31,null]]]],
 freca:[["PREMA Racing","Alpine",70,"René Rosin",[[1,null],[2,null],[3,null]]],["R-ace GP","Alpine",70,"R-ace GP",[[4,null],[5,null],[6,null]]],["ART Grand Prix","Alpine",68,"Sébastien Philippe",[[7,null],[8,null],[9,null]]],["MP Motorsport","Alpine",68,"Sander Dorsman",[[10,null],[11,null],[12,null]]],
  ["Van Amersfoort Racing","Alpine",66,"Frits van Amersfoort",[[14,null],[15,null],[16,null]]],["KIC Motorsport","Alpine",62,"KIC Motorsport",[[17,null],[18,null]]],["Trident","Alpine",65,"Giacomo Ricci",[[19,null],[20,null],[21,null]]],["RPM","Alpine",60,"RPM",[[22,null],[23,null]]]],
 imsagtp:[["Porsche Penske Motorsport","Porsche 963",88,"Roger Penske",[[6,"Kévin Estre","FRA",1988,88,"w3","Laurens Vanthoor"],[7,"Felipe Nasr","BRA",1992,86,"","Julien Andlauer"]]],
  ["Cadillac Wayne Taylor Racing","Cadillac V-Series.R",85,"Wayne Taylor",[[10,"Ricky Taylor","USA",1989,84,"","Filipe Albuquerque"],[40,"Jordan Taylor","USA",1991,85,"","Louis Delétraz"]]],
  ["Cadillac Whelen","Cadillac V-Series.R",83,"Action Express Racing",[[31,"Jack Aitken","GBR",1995,84,"","Frederik Vesti"]]],
  ["Acura Meyer Shank Racing","Acura ARX-06",84,"Mike Shank",[[60,"Tom Blomqvist","GBR",1993,85,"","Colin Braun"],[93,"Renger van der Zande","NED",1986,83,"","Nick Yelloly"]]],
  ["BMW M Team RLL","BMW M Hybrid V8",84,"Bobby Rahal",[[24,"Sheldon van der Linde","RSA",1999,84,"","Robin Frijns"],[25,"Philipp Eng","AUT",1990,83,"","Marco Wittmann"]]],
  ["Aston Martin THOR Team (IMSA)","Aston Martin Valkyrie",80,"Heart of Racing",[[23,"Ross Gunn","GBR",1997,82,"","Roman De Angelis"]]]],
 wec:[["Ferrari AF Corse","Ferrari 499P",90,"Antonello Coletta",[[50,"Antonio Fuoco","ITA",1996,87,"","Miguel Molina","Nicklas Nielsen"],[51,"Alessandro Pier Guidi","ITA",1983,87,"","James Calado","Antonio Giovinazzi"]]],
  ["Toyota Gazoo Racing","Toyota TR010",88,"Kazuki Nakajima",[[7,"Kamui Kobayashi","JPN",1986,85,"","Mike Conway"],[8,"Brendon Hartley","NZL",1989,87,"","Ryo Hirakawa"]]],
  ["Cadillac Hertz Team JOTA","Cadillac V-Series.R",85,"Sam Hignett",[[12,"Alex Lynn","GBR",1993,85,"","Will Stevens"],[38,"Earl Bamber","NZL",1990,85,"","Sébastien Bourdais"]]],
  ["BMW M Team WRT","BMW M Hybrid V8",84,"Vincent Vosse",[[15,"Kevin Magnussen","DEN",1992,85,"","Dries Vanthoor","Raffaele Marciello"],[20,"René Rast","GER",1986,85,""]]],
  ["Alpine Endurance Team","Alpine A424",82,"Alpine",[[35,"Paul-Loup Chatin","FRA",1991,82,"","Ferdinand Habsburg","Charles Milesi"],[36,"Jules Gounon","FRA",1994,83,"","Frédéric Makowiecki"]]],
  ["Peugeot TotalEnergies","Peugeot 9X8",81,"Peugeot Sport",[[93,"Paul di Resta","GBR",1986,82,"","Mikkel Jensen"],[94,"Stoffel Vandoorne","BEL",1992,85,"","Loïc Duval","Malthe Jakobsen"]]],
  ["Aston Martin THOR Team","Aston Martin Valkyrie",80,"Heart of Racing",[["007","Harry Tincknell","GBR",1991,82,"","Tom Gamble"],["009","Alex Riberas","ESP",1993,82,"","Marco Sørensen"]]],
  ["Genesis Magma Racing","Genesis GMR-001",78,"Genesis Magma Racing",[[17,"André Lotterer","GER",1981,83,""]]]],
 imsagtd:[["Paul Miller Racing","BMW M4 GT3",72,"Paul Miller",[[1,null]]],["Wright Motorsports","Porsche 911 GT3 R",72,"John Wright",[[120,null]]],["Vasser Sullivan","Lexus RC F GT3",72,"Jimmy Vasser",[[12,null],[14,null]]],["Heart of Racing Team","Aston Martin Vantage GT3",72,"Heart of Racing",[[27,null]]],
  ["Turner Motorsport","BMW M4 GT3",70,"Will Turner",[[96,null]]],["AO Racing","Porsche 911 GT3 R",72,"Anders Ottesen",[[77,null]]],["Winward Racing","Mercedes-AMG GT3",73,"Winward Racing",[[57,null]]],["Korthoff Competition Motors","Mercedes-AMG GT3",68,"Korthoff",[[32,null]]],
  ["Pfaff Motorsports","Lamborghini Huracán GT3",70,"Chris Pfaff",[[9,null]]],["Inception Racing","Ferrari 296 GT3",66,"Inception Racing",[[70,null]]],["Gradient Racing","Ford Mustang GT3",66,"Gradient Racing",[[66,null]]],["Conquest Racing","Ferrari 296 GT3",66,"Conquest Racing",[[34,null]]],["Triarsi Competizione","Ferrari 296 GT3",66,"Triarsi",[[21,null]]]],
 wecgt:[["Manthey","Porsche 911 GT3 R",73,"Manthey",[[91,null],[92,null]]],["Iron Lynx","Lamborghini Huracán GT3",68,"Iron Lynx",[[60,null]]],["TF Sport","Corvette Z06 GT3.R",72,"Tom Ferrier",[[33,null],[81,null]]],["United Autosports","McLaren 720S GT3",70,"Zak Brown and Richard Dean",[[59,null],[95,null]]],
  ["Vista AF Corse","Ferrari 296 GT3",72,"AF Corse",[[21,null],[54,null]]],["Team WRT","BMW M4 GT3",72,"Vincent Vosse",[[31,null],[46,null]]],["Proton Competition","Ford Mustang GT3",68,"Christian Ried",[[77,null],[88,null]]],["Akkodis ASP","Lexus RC F GT3",68,"Akkodis ASP",[[78,null],[87,null]]],["Heart of Racing Team","Aston Martin Vantage GT3",70,"Heart of Racing",[[27,null]]]],
 fe:[["TAG Heuer Porsche Formula E Team","Porsche",91,"Florian Modlinger",[[94,"Pascal Wehrlein","GER",1994,89,""],[51,"Nico Müller","SUI",1992,83,""]]],
  ["Jaguar TCS Racing","Jaguar",90,"James Barclay",[[9,"Mitch Evans","NZL",1994,88,""],[13,"António Félix da Costa","POR",1991,86,""]]],
  ["Nissan Formula E Team","Nissan",88,"Tommaso Volpe",[[23,"Oliver Rowland","GBR",1992,89,""],[17,"Norman Nato","FRA",1992,80,""]]],
  ["DS Penske","DS",82,"Jay Penske",[[7,"Maximilian Günther","GER",1997,84,""],[77,"Taylor Barnard","GBR",2004,82,""]]],
  ["Andretti Formula E","Porsche",84,"Roger Griffiths",[[1,"Jake Dennis","GBR",1995,85,""],[28,"Felipe Drugovich","BRA",2000,80,""]]],
  ["Mahindra Racing","Mahindra",83,"Frédéric Bertrand",[[48,"Edoardo Mortara","SUI",1987,84,""],[21,"Nyck de Vries","NED",1995,84,""]]],
  ["Envision Racing","Jaguar",82,"Sylvain Filippi",[[16,"Sébastien Buemi","SUI",1988,84,""],[18,"Joel Eriksson","SWE",1998,79,""]]],
  ["Citroën Racing","Stellantis",84,"Citroën Racing",[[25,"Jean-Éric Vergne","FRA",1990,86,""],[37,"Nick Cassidy","NZL",1994,86,""]]],
  ["Lola Yamaha ABT","Lola-Yamaha",76,"Thomas Biermaier",[[11,"Lucas di Grassi","BRA",1984,82,""],[22,"Zane Maloney","BRB",2003,78,""]]],
  ["Cupra Kiro","Porsche",77,"Kiro Race Co",[[33,"Dan Ticktum","GBR",1999,83,""],[3,"Pepe Martí","ESP",2005,78,""]]]],
 woo:[["Big Game Motorsports","Sprint car",86,"Chris Dyson",[[2,"David Gravel","USA",1992,89,""]]],["Jason Johnson Racing","Sprint car",84,"Jason Johnson Racing",[[41,"Carson Macedo","USA",1996,87,""]]],
  ["Stenhouse Jr./Marshall Racing","Sprint car",82,"Ricky Stenhouse Jr. and Tod Quiring",[[17,"Sheldon Haudenschild","USA",1994,86,""]]],["Tony Stewart Racing","Sprint car",82,"Tony Stewart",[[15,"Donny Schatz","USA",1977,84,""],[14,"Zeb Wise","USA",2002,81,""]]],
  ["Shark Racing","Sprint car",80,"Jac Haudenschild",[["1S","Logan Schuchart","USA",1994,83,""]]],["Kasey Kahne Racing","Sprint car",82,"Kasey Kahne",[[9,"Giovanni Scelzi","USA",2002,84,""],[19,"Spencer Bayston","USA",1999,82,""]]],
  ["Roth Motorsports","Sprint car",80,"Dennis Roth",[[83,"James McFadden","AUS",1992,80,""]]],["Balog Racing","Sprint car",72,"Bill Balog",[["1B","Bill Balog","USA",1977,77,""]]],
  ["Eliason Motorsports","Sprint car",76,"Cory Eliason",[[11,"Cory Eliason","USA",1997,80,""]]],["Madsen Racing","Sprint car",74,"Kerry Madsen",[[29,"Kerry Madsen","AUS",1972,77,""]]],["Timms Racing","Sprint car",78,"Paul Silva",[[24,"Ryan Timms","USA",2006,80,""]]]],
 hlr:[["Brad Sweet Racing","Sprint car",84,"Brad Sweet",[[49,"Brad Sweet","USA",1985,86,""]]],["Rico Abreu Racing","Sprint car",82,"Rico Abreu",[[24,"Rico Abreu","USA",1992,84,""]]],["Courtney Racing","Sprint car",80,"Tyler Courtney",[[7,"Tyler Courtney","USA",1993,82,""]]],
  ["Reutzel Racing","Sprint car",80,"Aaron Reutzel",[[87,"Aaron Reutzel","USA",1989,82,""]]],["Peck Racing","Sprint car",76,"Justin Peck",[[13,"Justin Peck","USA",1987,80,""]]],["Marks Racing","Sprint car",76,"Brent Marks",[[19,"Brent Marks","USA",1997,80,""]]],
  ["Macri Racing","Sprint car",78,"Anthony Macri",[[39,"Anthony Macri","USA",1997,82,""]]],["Dewease Racing","Sprint car",74,"Lance Dewease",[[69,"Lance Dewease","USA",1965,78,""]]]],
 lolmds:[["Davenport Racing","Late model",84,"Jonathan Davenport",[[49,"Jonathan Davenport","USA",1984,89,""]]],["Sheppard Racing","Late model",84,"Brandon Sheppard",[[1,"Brandon Sheppard","USA",1993,88,""]]],["O'Neal Racing","Late model",82,"Hudson O'Neal",[[71,"Hudson O'Neal","USA",1999,87,""]]],
  ["Thornton Racing","Late model",84,"Ricky Thornton Jr.",[[20,"Ricky Thornton Jr.","USA",1990,88,""]]],["Pierce Racing","Late model",80,"Bobby Pierce",[[32,"Bobby Pierce","USA",1997,86,""]]],["Moran Racing","Late model",80,"Devin Moran",[[99,"Devin Moran","USA",1994,85,""]]],
  ["McCreadie Racing","Late model",78,"Tim McCreadie",[[39,"Tim McCreadie","USA",1974,83,""]]],["Erb Racing","Late model",78,"Tyler Erb",[[1,"Tyler Erb","USA",1991,84,""]]],["Marlar Racing","Late model",74,"Mike Marlar",[[157,"Mike Marlar","USA",1978,82,""]]],["English Racing","Late model",74,"Tanner English",[[81,"Tanner English","USA",1993,82,""]]]],
 supercars:[["Triple Eight Race Engineering","Ford",88,"Roland Dane",[[88,"Broc Feeney","AUS",2002,90,""],[87,"Will Brown","AUS",1998,88,""]]],["Walkinshaw Andretti United","Toyota",84,"Ryan Walkinshaw",[[25,"Chaz Mostert","AUS",1992,86,""],[2,"Ryan Wood","NZL",2001,81,""]]],
  ["Dick Johnson Racing","Ford",84,"Dick Johnson",[[17,"Anton De Pasquale","AUS",1995,84,""],[38,"Brodie Kostecki","AUS",1997,85,""]]],["Tickford Racing","Ford",83,"Rod Nash",[[6,"Cam Waters","AUS",1994,87,""],[55,"Thomas Randle","AUS",1995,82,""]]],
  ["Grove Racing","Ford",83,"Stephen Grove",[[19,"Matt Payne","NZL",2002,84,""],[26,"David Reynolds","AUS",1985,81,""]]],["Team 18","Chevrolet",78,"Charlie Schwerkolt",[[18,"Mark Winterbottom","AUS",1981,80,""]]],
  ["Brad Jones Racing","Toyota",78,"Brad Jones",[[8,"Andre Heimgartner","NZL",1995,81,""],[96,"Macauley Jones","AUS",1995,76,""]]],["Erebus Motorsport","Chevrolet",79,"Betty Klimenko",[[9,"Cooper Murray","AUS",2002,78,""]]],
  ["Matt Stone Racing","Chevrolet",74,"Matt Stone",[[4,"Nick Percat","AUS",1988,77,""]]],["PremiAir Racing","Chevrolet",76,"Peter Xiberras",[[31,"James Golding","AUS",1996,77,""],[62,"Richie Stanaway","NZL",1991,77,""]]],["Blanchard Racing Team","Ford",74,"Tim Blanchard",[[3,"Aaron Cameron","AUS",2002,76,""]]]],
 nhra:[["Antron Brown Motorsports","Top Fuel",86,"Antron Brown",[[1,"Antron Brown","USA",1976,89,""]]],["Kalitta Motorsports","Top Fuel",86,"Connie Kalitta",[[2,"Doug Kalitta","USA",1964,86,""],[3,"Shawn Langdon","USA",1982,86,""]]],
  ["John Force Racing","Top Fuel",86,"John Force Racing",[[4,"Brittany Force","USA",1986,88,""]]],["Phillips Racing","Top Fuel",82,"Phillips Racing",[[5,"Justin Ashley","USA",1995,87,""]]],["Capco Contractors","Top Fuel",84,"Torrence family",[[6,"Steve Torrence","USA",1983,85,""]]],
  ["Elite Motorsports","Top Fuel",80,"Richard Freeman",[[7,"Tony Stewart","USA",1971,82,""]]],["Clay Millican Racing","Top Fuel",76,"Clay Millican",[[8,"Clay Millican","USA",1966,80,""]]],["Josh Hart Racing","Top Fuel",78,"Josh Hart",[[9,"Josh Hart","USA",1981,82,""]]],
  ["Scrappers Racing","Top Fuel",72,"Scrappers Racing",[[10,"Jasmine Salinas","USA",1994,76,""]]],["Zetterström Racing","Top Fuel",70,"Ida Zetterström",[[11,"Ida Zetterström","SWE",1997,76,""]]]]
};
// Extra one-off entries for the Indianapolis 500 (real, part-time)
const INDY500_EXTRA=[["Hélio Castroneves","BRA",1975,82,"Meyer Shank Racing",6],["Takuma Sato","JPN",1977,81,"Rahal Letterman Lanigan Racing",75],["Ryan Hunter-Reay","USA",1980,79,"Arrow McLaren",31],["Conor Daly","USA",1991,78,"Dreyer & Reinbold Racing",23],["Ed Carpenter","USA",1981,78,"Ed Carpenter Racing",33],["Katherine Legge","GBR",1980,74,"HMD Motorsports with A.J. Foyt Racing",11],["Jack Harvey","GBR",1993,76,"Dreyer & Reinbold Racing",24],["Jacob Abel","USA",2001,74,"Abel Motorsports",51]];
/* ===================== FICTIONAL NAME POOLS ===================== */
const FN={USA:["Jake","Tyler","Cody","Mason","Logan","Brady","Colt","Hunter","Austin","Wyatt","Cole","Trey","Dalton","Kyle","Ryan","Brandon","Chase","Jesse","Bobby","Ricky","Dustin","Travis","Caleb","Garrett","Landon","Bryce","Dillon","Kaden","Ethan","Nolan","Jordan","Kayla","Hailey","Madison","Brooke","Savannah","Taylor","Morgan","Riley","Emma","Ava","Sierra","Danica","Lexi","Sam","Maddie","Toby","Owen","Gage","Reid"],
 GBR:["Oliver","Harry","George","Jack","Charlie","Alfie","Freddie","Archie","Lewis","Callum","Jamie","Ellis","Olly","Toby","Rory","Isla","Ella","Abbie","Zak","Finley"],AUS:["Liam","Jye","Cooper","Brodie","Jaxon","Lachlan","Kai","Mitchell","Tom","Zane","Josh","Chloe","Riley","Hayden"],
 ITA:["Lorenzo","Matteo","Leonardo","Gabriele","Andrea","Marco","Luca","Alessio","Tommaso","Nicola","Giulia","Federico"],FRA:["Théo","Hugo","Louis","Arthur","Victor","Jules","Sacha","Enzo","Maxime","Paul","Léa","Raphaël"],GER:["Lukas","Felix","Jonas","Leon","Max","Finn","Tim","Niklas","Moritz","Paul","Lena","Ben"],
 ESP:["Pablo","Javier","Álvaro","Iker","Marc","Sergio","Pol","Alex","Daniel","Lucía"],NED:["Daan","Thijs","Bram","Sem","Lars","Jesse","Ruben","Niels","Tim","Fenna"],BRA:["Pedro","Gabriel","Rafael","Enzo","Lucas","Caio","Felipe","Bruno","Thiago","Matheus"],
 MEX:["Diego","Santiago","Emiliano","Alejandro","Sebastián","Rodrigo","Mateo"],JPN:["Haruto","Ren","Sota","Yuki","Kaito","Riku","Hiroto","Daiki"],SCA:["Oskar","Elias","Emil","William","Noah","Magnus","Viktor","Anton","Mikkel","Isak"],
 CAN:["Liam","Alexis","Mathis","Jacob","Owen","Félix","Logan","Zachary"],NZL:["Hayden","Liam","Marcus","Kiri","Josh","Cam"]};
const LN={USA:["Miller","Johnson","Carter","Hayes","Brooks","Dalton","Mercer","Whitfield","Harlan","Turner","Pruitt","Sizemore","Gentry","Crowder","Boone","Rutledge","McCall","Tillman","Haskins","Wade","Coker","Stroud","Pickett","Lyle","Barnes","Tatum","Kessler","Dunlap","Greer","Baxter","Holloway","Sutter","Kramer","Petty","Yates","Rowe","Fenton","Vance","Hollis","Cobb","Ledford","Ingram","Sharpe","Duvall","Raines","Combs","Mabry","Pruett","Lambert","Rhodes","Osborne","Bledsoe","Garner","Crane","Mackey"],
 GBR:["Hughes","Barrett","Fletcher","Whitmore","Ashby","Pemberton","Rowntree","Cartwright","Lockhart","Thornton","Hale","Marsh","Crawley","Stanton","Holt"],AUS:["McKenzie","Dawson","Sinclair","Hargreaves","Whelan","Fitzgerald","Pryor","Drummond","Kerr","Lowe"],
 ITA:["Rossetti","Bianchi","Ferraro","Gallo","Conti","Marini","Moretti","Lombardi","Barbieri","Fontana","Greco","Sartori"],FRA:["Moreau","Lefèvre","Girard","Bonnet","Dupont","Lambert","Fontaine","Chevalier","Rousseau","Mercier"],GER:["Becker","Hoffmann","Schäfer","Koch","Richter","Krüger","Wolf","Neumann","Brandt","Vogel"],
 ESP:["García","Navarro","Ortega","Romero","Herrera","Castillo","Molina","Vidal"],NED:["de Jong","Bakker","Visser","Smit","Mulder","de Graaf","Kuiper","Bos"],BRA:["Silva","Oliveira","Costa","Pereira","Almeida","Ribeiro","Carvalho","Moura"],
 MEX:["Hernández","Ramírez","Torres","Flores","Vargas","Mendoza","Castañeda"],JPN:["Tanaka","Suzuki","Sato","Yamamoto","Nakamura","Kobayashi","Ito","Watanabe"],SCA:["Lindqvist","Andersen","Nyberg","Holm","Larsen","Berg","Dahl","Virtanen","Eklund","Strand"],
 CAN:["Tremblay","Gagnon","Roy","MacLeod","Fraser","Bouchard","Leblanc"],NZL:["Walsh","Ngata","Harrison","McRae","Burke"]};
const NAT_N={USA:"American",CAN:"Canadian",MEX:"Mexican",BRA:"Brazilian",ARG:"Argentine",GBR:"British",IRL:"Irish",FRA:"French",GER:"German",ITA:"Italian",ESP:"Spanish",NED:"Dutch",BEL:"Belgian",DEN:"Danish",SWE:"Swedish",FIN:"Finnish",NOR:"Norwegian",AUS:"Australian",NZL:"New Zealander",JPN:"Japanese",CHN:"Chinese",RSA:"South African",MON:"Monegasque",THA:"Thai",SUI:"Swiss",AUT:"Austrian",POR:"Portuguese",COL:"Colombian",BUL:"Bulgarian",CZE:"Czech",IND:"Indian",PAR:"Paraguayan",CAY:"Caymanian",BRB:"Barbadian",POL:"Polish"};
const NAT_POOL={USA:"USA",CAN:"CAN",MEX:"MEX",BRA:"BRA",ARG:"MEX",COL:"MEX",GBR:"GBR",IRL:"GBR",FRA:"FRA",BEL:"FRA",MON:"FRA",GER:"GER",AUT:"GER",SUI:"GER",ITA:"ITA",ESP:"ESP",POR:"ESP",NED:"NED",DEN:"SCA",SWE:"SCA",FIN:"SCA",NOR:"SCA",AUS:"AUS",NZL:"NZL",JPN:"JPN"};
// regional nationality mixes for generated fields
const NAT_MIX={us:["USA","USA","USA","USA","USA","USA","CAN","MEX"],eu:["GBR","GBR","ITA","FRA","GER","ESP","NED","SCA","SCA","BRA","USA","JPN","AUS","MEX","BEL","SUI"],aus:["AUS","AUS","AUS","NZL"],intl:["USA","GBR","ITA","FRA","GER","ESP","NED","SCA","BRA","JPN","AUS","MEX","CAN"]};
function genName(nat,seed){const p=NAT_POOL[nat]||"USA";const f=FN[p]||FN.USA,l=LN[p]||LN.USA;if(seed!==undefined)return hpick(f,seed+"f")+" "+hpick(l,seed+"l");return R.pick(f)+" "+R.pick(l);}
const SPONSOR_FIC=["Apex Lubricants","Hometown Pizza Co.","Big Ridge Lumber","Crossroads Tire & Auto","Thunderbolt Energy Drink","Summit Peak Roofing","Blue Line Logistics","Redline Brake Systems","Quik-Fix Hardware","Lakeshore Credit Union","Ironclad Insurance","Velocity Vapor-Free Coolant","Golden Harvest Feed & Seed","Stallion Trucking","Northstar Solar","Pinnacle Health Clinics","Riverside Ford","Mach 5 Car Wash","Bolt Wireless","Cardinal Steel","Trailhead Outdoors","FastLane Fuel Stops","Cobalt Data Systems","Harbor Freightways","Prime Cut Steakhouse","Granite State Windows","Nitro Coffee Roasters","Wildfire BBQ Sauce","Atlas Moving & Storage","Sunbelt Pools","Comet Cleaning Supply","Patriot Pest Control"];
const BIG_SPONSOR_FIC=["Titan Telecom","Velocity Bank","Aurora Airlines","Global Freight Corp","Zenith Energy","Starline Beverages","Nexus Software","Paramount Insurance","Horizon Petroleum","Meridian Watches"];
const ENG_FIRST=["Dale","Rusty","Marty","Gil","Wendell","Hank","Lou","Carla","Denise","Ray","Benny","Tom","Matteo","Pierre","Giles","Ingrid","Ken","Rob","Sophie","Andy"];
function genStaff(seed){return hpick(ENG_FIRST,seed+"e")+" "+hpick(LN.USA.concat(LN.GBR,LN.ITA),seed+"s");}
const TEAM_SUFFIX=["Racing","Motorsports","Racing Group","Competition","Performance","Racing Team"];

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

/* ===================== PLAYER: skills, overall, development ===================== */
const SK=["spd","crf","con","tir","wet","ovl","rdc","sht","drt","drf","qul","ovt","dfd","fit","fbk","med"];
const SKN={spd:"Raw speed",crf:"Racecraft",con:"Consistency",tir:"Tire management",wet:"Wet weather",ovl:"Ovals",rdc:"Road courses",sht:"Short tracks",drt:"Dirt",drf:"Drafting",qul:"Qualifying",ovt:"Overtaking",dfd:"Defending",fit:"Fitness",fbk:"Mechanical feedback",med:"Media & sponsor appeal"};
const CORE={spd:.24,crf:.15,con:.13,tir:.08,qul:.08,ovt:.09,dfd:.07,fit:.06,fbk:.06,wet:.04};
const SPEC={stock:{ovl:.35,sht:.25,drf:.2,rdc:.1,drt:.1},open:{rdc:.55,ovl:.2,wet:.25},dirt:{drt:.8,sht:.2},kart:{rdc:.55,wet:.2,sht:.25},sports:{rdc:.6,wet:.2,fit:.2},drag:{qul:.4,con:.4,spd:.2}};
const TSPEC={ss:{drf:.6,ovl:.4},int:{ovl:.6,drf:.2,tir:.2},sht:{sht:.6,ovl:.2,dfd:.2},dirt:{drt:1},road:{rdc:.8,fbk:.2},street:{rdc:.7,con:.3},kart:{rdc:.6,spd:.4},drag:{qul:.5,con:.5}};
const TRAITS={talent:["Natural talent","+2 raw speed and a higher ceiling",{spd:2}],braker:["Late braker","+5 overtaking, +2 speed, slightly more incidents",{ovt:5,spd:2}],smooth:["Smooth operator","+5 tire management, +4 consistency",{tir:5,con:4}],
 rain:["Rain master","+10 wet weather",{wet:10}],oval:["Oval specialist","+6 ovals, +4 short tracks, +4 drafting",{ovl:6,sht:4,drf:4}],road:["Road course ace","+8 road courses",{rdc:8}],dirt:["Dirt tracker","+10 dirt",{drt:10}],
 qual:["Qualifying specialist","+8 qualifying",{qul:8}],iron:["Iron man","+8 fitness, injuries heal faster",{fit:8}],eng:["Engineer's dream","+8 mechanical feedback",{fbk:8}],media:["Media darling","+10 media & sponsor appeal",{med:10}],
 charger:["Hard charger","+5 racecraft, +3 overtaking",{crf:5,ovt:3}],ice:["Ice cold","+5 consistency, +3 defending, calm on the big stage",{con:5,dfd:3}]};
const BGS={rich:["Rich family","$250,000 to start and Dad's checkbook every week. Paddock cynics call you a pay driver.",250000,2500,{spd:2,qul:2,fbk:1},-3],
 middle:["Middle class","$20,000 in savings and parents who'll help when they can.",20000,250,{},0],
 broke:["Broke racer","$2,000 and a trailer with a flat tire. You build your own cars and you're hungry.",2000,0,{crf:3,fbk:4,tir:2},4],
 sponsor:["Sponsor-backed","$15,000 plus a local sponsor who believes in you ($40,000 a season).",15000,100,{med:5},2]};
function hasTrait(t){return G.me.traits.indexOf(t)>=0;}
function wsum(w,f){let s=0,t=0;for(const k in w){s+=f(k)*w[k];t+=w[k];}return t?s/t:0;}
function coreR(){return wsum(CORE,k=>G.me.sk[k]);}
function discOf(sid){const s=SER[sid];return s?s.disc:"stock";}
function OVR(disc){const m=G.me;disc=disc||(G.car.s?discOf(G.car.s):m.disc||"stock");return Math.round(.7*coreR()+.3*wsum(SPEC[disc]||SPEC.stock,k=>m.sk[k]));}
function trackR(type,wet){const m=G.me;let r=.65*coreR()+.35*wsum(TSPEC[type]||TSPEC.road,k=>m.sk[k]);if(wet)r=.7*r+.3*m.sk.wet;const hpPen=m.hp<70?(70-m.hp)*.12:0;const mor=(m.mor-50)*.03;return r-hpPen+mor;}
function aiTrackR(d,type,wet){const dv=d.dv||{};let r=d.o+((type==="dirt"?dv.d:(type==="road"||type==="street"||type==="kart")?dv.r:dv.o)||0);if(wet)r+=dv.w||0;return r;}
function ageGrowth(a){return a<=14?1.35:a<=17?1.2:a<=21?1.05:a<=25?.85:a<=29?.6:a<=33?.3:a<=37?.1:.03;}
function gainSk(k,amt,quiet){const m=G.me;const cur=m.sk[k];const ceil=k==="med"?95:m.pot;const room=cur>=ceil+1?0:clamp((ceil+1-cur)/24,0.04,1);const g=amt>0?amt*ageGrowth(m.age)*room:amt;const nv=clamp(cur+g,1,99);const d=nv-cur;m.sk[k]=nv;if(!quiet&&Math.abs(d)>=0.05)EFX.push([SKN[k],r1(d)]);return d;}
function seatTime(type,quality){const map={ss:["drf","ovl"],int:["ovl","tir"],sht:["sht","dfd"],dirt:["drt","crf"],road:["rdc","fbk"],street:["rdc","con"],kart:["rdc","ovt"],drag:["qul","con"]};
 const q=quality||1;(map[type]||["crf"]).forEach(k=>gainSk(k,.3*q,true));["crf","con","spd","ovt","tir","qul","dfd"].forEach(k=>gainSk(k,.13*q,true));}
function naturalGrowth(){const m=G.me;if(m.retired)return;SK.forEach(k=>{if(k!=="med")gainSk(k,.018,true);});}
function rep(v){G.me.rep=clamp(G.me.rep+v,0,100);if(v)EFX.push(["Paddock reputation",v]);}
function fame(v){G.me.fame=clamp(G.me.fame+v,0,100);if(v)EFX.push(["Fame",v]);}
function morale(v){G.me.mor=clamp(G.me.mor+v,0,100);if(v)EFX.push(["Morale",v]);}
function earn(v,why){G.me.cash+=v;if(v>0)G.me.earned+=v;EFX.push([why||"Money",v,"$"]);}
function spend(v,why){G.me.cash-=v;EFX.push([why||"Spent",-v,"$"]);}
function rel(key,v){G.rel[key]=clamp((G.rel[key]||0)+v,-100,100);if(v)EFX.push([relName(key),v,"rel"]);}
function relOf(key){return G.rel[key]||0;}
function relName(key){if(key.startsWith("d:"))return nm(key.slice(2));if(key.startsWith("t:"))return towner(key.slice(2))+" ("+tn(key.slice(2))+")";if(key==="cc")return G.car.cc?G.car.cc+" (crew chief/engineer)":"Your crew chief";if(key.startsWith("sp:"))return key.slice(3);if(key==="media")return "The media";if(key==="fam")return "Your family";if(key==="fans")return "Your fans";return key;}
function hurt(sev){const m=G.me;const tough=hasTrait("iron")?.7:1;const table=sev>=3?[["broken collarbone",6],["fractured wrist",7],["concussion",4],["broken leg",12],["compressed vertebra",10]]:sev===2?[["sprained wrist",2],["cracked rib",3],["badly bruised shoulder",2],["mild concussion",2]]:[["bruised ribs",1],["sore neck",1]];
 const t=R.pick(table);const w=Math.max(1,Math.round(t[1]*tough));m.inj={n:t[0],w};m.hp=clamp(m.hp-(sev*12),20,100);G.stats.injuries++;addNews(`${m.name} is recovering from a ${t[0]} (out about ${plural(w,"week")}).`,true);return t[0];}
function legacyScore(){const c=careerTotals();const titles=G.st.titles||[];let ls=0;titles.forEach(t=>{ls+=Math.round(4+SER[t.s].tier*SER[t.s].tier*.8);});
 ls+=c.w*(1.2)+c.pod*.3+c.pol*.3;G.st.races.forEach(r=>{if(r.f===1)ls+=SER[r.s].tier>=9?6:SER[r.s].tier>=7?2:0;});ls+=G.st.cj.length*14;ls+=(G.me.fame*.4);if(G.ownHist)ls+=G.ownHist.reduce((a,o)=>a+(o.titles||0)*20+(o.wins||0)*1.5,0);return Math.round(ls);}
function legacyTier(v){return v>=900?"All-Time Great":v>=550?"Legend of the Sport":v>=320?"Champion & Star":v>=170?"Proven Winner":v>=80?"Respected Pro":v>=30?"Journeyman Racer":"Saturday Night Hero";}

/* ===================== RACE ENGINE ===================== */
const PIT_SERIES={cup:1,oap:1,truck:1,arca:1,indycar:1,nxt:1,f1:1,f2:1,supercars:1,imsagtd:1,imsagtp:1,wecgt:1,wec:1,slm:1,snowball:1};
const CAUTION_P={stock:.55,ss:.55,stockroad:.4,open:.28,indyoval:.45,dirt:.5,kart:.12,endur:.55};
const NOISE_K=.62,COMPRESS_KEEP=.4;
const TP_BASE={stock:4,ss:1.2,stockroad:5,open:8,indyoval:4,dirt:4,kart:4,endur:2,drag:0};
function raceKind(sid,type){const s=SER[sid];if(s.disc==="drag")return "drag";if(s.endur)return "endur";if(type==="ss")return "ss";if(type==="dirt")return "dirt";if(type==="kart")return "kart";if(s.disc==="open")return (type==="road"||type==="street")?"open":"indyoval";if(type==="road"||type==="street")return "stockroad";return "stock";}
function evName(sid,ci){const c=SER[sid].cal[ci];if(c[2])return c[2];const t=TRK[c[0]];const s=SER[sid];if(s.tier<=4)return t[0].replace(/ \(.*\)$/,"")+(s.disc==="kart"?" Club Round":" Feature");return (t[1].split(",")[0])+" ("+s.sh+")";}
function isCrown(sid,ci){return !!SER[sid].cal[ci][3];}
function evLaps(sid,ci){const s=SER[sid],t=TRK[s.cal[ci][0]];if(s.endur){const m=(s.cal[ci][2]||"").match(/(\d+) Hour/);return m?(+m[1])*Math.round(100/t[3])/2|0:Math.round(260/t[3]);}
 if(s.laps)return s.laps;let d=s.dist||100;const n=s.cal[ci][2]||"";if(/Daytona 500|Indianapolis 500|Southern 500/.test(n))d=500;else if(/Coca-Cola 600/.test(n))d=600;else if(/Brickyard 400|Coke Zero/.test(n))d=400;else if(s.id==="cup"&&t[2]==="sht"&&t[3]<0.8)d=t[3]*500;else if(s.id==="cup"&&t[2]==="road")d=Math.min(d,230);
 return clamp(Math.round(d/t[3]),10,600);}
function raceSig(rc){const s=SER[rc.sid];let sig=s.sig;if(s.id==="f1")sig*=.7;if(s.id==="indycar"||s.id==="nxt")sig*=1.15;if(rc.kind==="ss")sig*=1.6;if(rc.wet)sig*=1.25;if(rc.trk==="monaco")sig*=.8;return sig;}
function tpFactor(rc){let tp=TP_BASE[rc.kind]||3;if(rc.trk==="monaco")tp*=2.2;if(rc.trk==="fe_monaco"||rc.trk==="hungaroring"||rc.trk==="singapore")tp*=1.4;if(rc.sid==="f1")tp*=1.15;return tp;}
/* ---------- field ---------- */
function myQ(tid){const t=G.TM[tid];if(!t)return 55;let q=t.q;if(t.own){const o=G.own.find(x=>x.tid===tid);if(o)q=o.q;}
 if(G.car.con&&G.car.con.n1)q+=.6;q+=clamp(relOf("cc")/40,-1,1.2);return q;}
function buildField(sid,ci,extraMe){const s=SER[sid];let f=[];
 if(s.oneoff){const pool=[];s.pool.forEach(ps=>entries(ps).forEach(e=>{if(e.d!=="me")pool.push({d:e.d,tm:e.tm,num:e.num,q:G.TM[e.tm].q*.9+R.f(0,8)});}));
  pool.sort((a,b)=>(G.D[b.d].o+R.f(0,14))-(G.D[a.d].o+R.f(0,14)));f=pool.slice(0,s.field-(extraMe?1:0));}
 else{f=entries(sid).map(e=>({d:e.d,tm:e.tm,num:e.num,q:e.d==="me"?myQ(e.tm):(G.TM[e.tm].own?myQ(e.tm)-(G.car.con&&G.car.con.n1?.6:0):G.TM[e.tm].q)}));
  if(sid==="indycar"&&/Indianapolis 500/.test(s.cal[ci][2]||""))INDY500_EXTRA.forEach(x=>{const id=slugId(x[0]);const d=G.D[id];if(d&&!d.ret&&!d.tm)f.push({d:id,tm:null,num:x[5],q:74+R.f(-3,4),tmn:x[4]});});}
 f=f.filter(e=>e.d==="me"||(G.D[e.d]&&!G.D[e.d].inj&&!G.D[e.d].ret));
 // the player's own seat: injured -> substitute; one-off -> extra car
 f.forEach(e=>{if(e.d==="me"&&(G.me.inj||G.me.retired||G.car.sit)){e.d=subDriver(sid);}});
 if(extraMe)f.push({d:"me",tm:extraMe.tm||null,num:G.me.num,q:extraMe.q,tmn:extraMe.tmn});
 return f;}
function subDriver(sid){const fa=Object.values(G.D).filter(d=>!d.r&&!d.tm&&!d.ret&&!d.inj);let d=fa.length?R.pick(fa):genDriverFor(sid);d.cy=0;return d.id;}
function makeRace(sid,ci,extraMe){const s=SER[sid];const c=s.cal[ci];const type=tkt(c[0]);const kind=raceKind(sid,type);
 const rainP=TRK[c[0]][4]||0;const ovalish=["ss","int","sht","dirt","drag"].indexOf(type)>=0;
 let wet=false,rainSeg=-1;if(!ovalish){if(R.chance(rainP*.6))wet=true;else if(R.chance(rainP*.5))rainSeg=R.int(1,2);}
 const field=buildField(sid,ci,extraMe);const K=kind==="drag"?0:kind==="endur"?5:(kind==="dirt"||kind==="kart")?3:4;
 const rc={sid,ci,ev:evName(sid,ci),trk:c[0],type,kind,wet,rainSeg,rainP,laps:evLaps(sid,ci),K,seg:0,phase:"pre",yellow:false,log:[],oneoff:!!extraMe,setup:{q:0,r:0},stageW:[],crown:isCrown(sid,ci),
  cars:field.map(e=>({d:e.d,tm:e.tm,num:e.num,q:e.q,tmn:e.tmn||null,ag:e.d==="me"?.5:(G.D[e.d].ag||.5),sc:0,tire:0,dnf:0,why:"",led:0,pen:0,pit:0,stp:0,dmg:0,cp:{pace:0,wear:1},wt:wet,ab:R.gauss()*1.4,fl:0}))};
 rc.cars.forEach(c=>{c.r=carRating(c,rc);});
 return rc;}
function carRating(c,rc){let r;if(c.d==="me"){r=trackR(rc.type,rc.wet);}else{const d=G.D[c.d];r=aiTrackR(d,rc.type,rc.wet);}
 if(SER[rc.sid].endur){const cod=c.d==="me"?(G.car.co||[]).map(x=>x.r):((G.D[c.d]||{}).co||[]).map(()=>(G.D[c.d].o-3));if(cod.length)r=(r*1.4+sum(cod))/(1.4+cod.length);}
 return r;}
/* Diminishing returns: whatever you gain beyond the best AI package (+EDGE_FREE) only counts EDGE_KEEP. Stops 20-win seasons when the field ages out. */
const EDGE_FREE=1.5,EDGE_KEEP=.3;
function topAI(rc){if(rc._top==null){const cw=SER[rc.sid].cw;let m=-1e9;rc.cars.forEach(o=>{if(o.d!=="me"&&o.r!=null){const v=(1-cw)*o.r+cw*o.q;if(v>m)m=v;}});rc._top=m>-1e9?m:0;}return rc._top;}
function perf(c,rc){const cw=SER[rc.sid].cw;let p=(1-cw)*c.r+cw*c.q;p+=c.d==="me"?rc.setup.r:c.ab;if(c.d==="me"&&rc.cars.length>3){const cap=topAI(rc)+EDGE_FREE;if(p>cap)p=cap+(p-cap)*EDGE_KEEP;}p-=c.dmg;return p;}
function tirSk(c){return c.d==="me"?G.me.sk.tir:clamp(45+(G.D[c.d].o-55)*.6,25,90);}
function conSk(c){return c.d==="me"?G.me.sk.con:clamp(40+(G.D[c.d].o-50)*.7,20,95);}
/* ---------- qualifying ---------- */
function qualify(rc,mode){const cw=SER[rc.sid].cw;const sig=SER[rc.sid].sig*.55*(rc.wet?1.3:1);let note="";
 rc.cars.forEach(c=>{let r=c.r;if(c.d==="me"){r+=(G.me.sk.qul-G.me.sk.spd)*.25+rc.setup.q;if(mode)r+=mode.qb||0;}else{r+=R.gauss()*.8+c.ab*.5;}
  c.qs=(1-cw)*r+cw*c.q+R.gauss()*sig;
  if(c.d==="me"&&mode&&mode.risk&&R.chance(mode.risk)){c.qs=-999;note=mode.fail||"You push too hard, run wide and abort the lap. You'll start from the back.";}});
 // oval qualifying for drafting tracks is mostly the car
 const order=rc.cars.slice().sort((a,b)=>b.qs-a.qs);order.forEach((c,i)=>{c.start=i+1;});
 const n=order.length,tp=tpFactor(rc)*rc.K;order.forEach((c,i)=>{c.sc=n>1?(n-1-i)/(n-1)*tp:0;});
 rc.pole=order[0].d;rc.phase="race";return note;}
/* ---------- AI behaviour ---------- */
function aiFx(c,rc){const late=rc.seg>=rc.K-1;const a=c.ag;return {pace:(a-.5)*1.2+(late?(a-.4):0),risk:.75+a*.6+(late?.2:0),wear:1};}
function wantPit(c,rc,yellow){if(!PIT_SERIES[rc.sid])return false;if(rc.seg>=rc.K-1&&!yellow)return c.tire>=3;if(yellow)return c.tire>=1&&R.chance(.85);return c.tire>=(rc.kind==="endur"?1:2);}
/* ---------- one segment ---------- */
function simSeg(rc,myfx){const s=SER[rc.sid],K=rc.K,sig=raceSig(rc);myfx=myfx||{};const lines=[];const yellowBefore=rc.yellow;rc.yellow=false;
 const run=rc.cars.filter(c=>!c.dnf);const segLaps=Math.max(1,Math.round(rc.laps/K));const pitS=!!PIT_SERIES[rc.sid];
 const beforePos={};run.slice().sort((a,b)=>b.sc-a.sc).forEach((c,i)=>beforePos[c.d]=i+1);
 // rain arrives
 let rainNow=false;if(rc.rainSeg===rc.seg){rc.wet=true;rainNow=true;lines.push(`🌧️ <b>Rain!</b> The skies open over ${esc(tkn(rc.trk))}.`);run.forEach(c=>{if(c.d!=="me"&&R.chance(.7)){c.wt=true;c.sc-=K*2.2;c.pit++;}});}
 run.forEach(c=>{const me=c.d==="me";const fx=me?myfx:aiFx(c,rc);
  // pit stops
  let pit=me?!!fx.pit:wantPit(c,rc,yellowBefore);if(me&&fx.wetTires&&!c.wt){c.wt=true;pit=true;}
  if(!me&&rc.wet&&!c.wt&&R.chance(.6)){c.wt=true;pit=true;}
  if(pit&&(pitS||fx.wetTires||rc.wet)){c.pit++;const cost=yellowBefore?K*.9:K*(rc.kind==="endur"?1.4:2.6);c.sc-=cost;c.tire=fx.tires===2?1:0;if(fx.comp)c.cp=fx.comp;
   if(R.chance((fx.pitAgg?.07:.025)*(me?1.15-G.me.sk.con/200:1))){c.sc-=K*2.5;c.pen++;if(me)lines.push(`🚨 Penalty: speeding on pit road. Pass-through!`);}}
  if(me&&fx.stay&&yellowBefore){c.sc+=K*1.1;}
  // pace
  const wearRate=pitS?1.0:.55;const wearPen=wearRate*c.tire*(fx.wear||1)*c.cp.wear*(1.2-tirSk(c)/100);
  let wetPen=0;if(rc.wet&&!c.wt)wetPen=4.5;if(!rc.wet&&c.wt)wetPen=3;
  c.sc+=perf(c,rc)+(fx.pace||0)+c.cp.pace-wearPen-wetPen+R.gauss()*sig*Math.sqrt(K)*NOISE_K;
  c.tire+=1;c.stp=perf(c,rc)+(fx.pace||0)-wearPen;
  if(me&&fx.lane){c.sc+=K*fx.lane*R.f(-.6,1.2);}
  // incidents
  const pInc=s.dnf/K*(fx.risk||1)*(1.3-conSk(c)/140)*(rc.kind==="ss"?.5:1)*(rc.wet?1.4:1);
  if(R.chance(pInc)){if(R.chance(.55)){c.dnf=rc.seg+1;c.why=R.pick(["Crash","Crash","Spun and hit the wall","Contact damage"]);}else{c.sc-=K*R.f(2,6);c.dmg+=R.f(.5,2.5);c.inc="spin";}rc.yellow=true;}
  else if(R.chance(s.dnf*.3/K*(1.35-c.q/100))){c.dnf=rc.seg+1;c.why=R.pick(["Engine","Mechanical","Electrical","Gearbox","Suspension","Overheating"]);}
  if(!c.dnf&&fx.jump&&R.chance(fx.jump)){c.sc-=K*2;c.pen++;if(me)lines.push("🚨 Penalty: jumped the start. Five seconds!");}
  if(!c.dnf&&rc.kind==="open"&&R.chance((fx.risk||1)>1.3?.03:.005)){c.sc-=K*1.2;c.pen++;if(me)lines.push("🚨 Five-second penalty for exceeding track limits.");}
 });
 // the Big One on drafting tracks
 if(rc.kind==="ss"&&rc.seg>0&&R.chance(.32)){const pack=rc.cars.filter(c=>!c.dnf).sort((a,b)=>b.sc-a.sc);const lo=Math.min(3,pack.length-1);const n=R.int(4,Math.min(12,Math.max(4,pack.length-4)));const st=R.int(lo,Math.max(lo,Math.floor(pack.length/3)));
  const hit=pack.slice(st,st+n);let names=[];hit.forEach(c=>{if(c.d==="me"){const dodge=(myfx.back?.65:0)+G.me.sk.crf/250;if(R.chance(dodge)){lines.push("😮 You thread the needle through the wreck untouched!");return;}}
   if(R.chance(.6)){c.dnf=rc.seg+1;c.why="Multi-car crash";}else{c.dmg+=R.f(1,3);c.sc-=K*2;}names.push(c.d);});
  if(names.length){lines.push(`💥 <b>THE BIG ONE!</b> ${names.length} cars collected, including ${names.slice(0,3).map(id=>esc(nm(id))).join(", ")}.`);rc.yellow=true;}}
 if(!rc.yellow&&R.chance(CAUTION_P[rc.kind]*.6))rc.yellow=true;
 // laps led
 const order=rc.cars.filter(c=>!c.dnf).sort((a,b)=>b.sc-a.sc);if(order[0]){order[0].led+=Math.round(segLaps*.72);if(order[1])order[1].led+=segLaps-Math.round(segLaps*.72);}
 // NASCAR stage points
 if(s.pts==="nascar"&&rc.K===4&&(rc.seg===0||rc.seg===1)&&!rc.oneoffOnly){order.slice(0,10).forEach((c,i)=>{c.stg=(c.stg||0)+(10-i);});rc.stageW.push(order[0]&&order[0].d);lines.push(`🏁 <b>Stage ${rc.seg+1}</b> goes to ${esc(nm(order[0].d))}.`);}
 // caution compression
 if(rc.yellow&&rc.seg<rc.K-1){const lead=order[0]?order[0].sc:0;order.forEach((c,i)=>{c.sc=lead-(lead-c.sc)*COMPRESS_KEEP-i*.4;});}
 // narrative
 const dnfNow=rc.cars.filter(c=>c.dnf===rc.seg+1);
 dnfNow.filter(c=>c.d!=="me").slice(0,3).forEach(c=>lines.push(`❌ ${esc(nm(c.d))} is out (${c.why.toLowerCase()}).${G.D[c.d]&&!G.D[c.d].r&&/Crash/.test(c.why)&&R.chance(.04)?aiInjury(c.d):""}`));
 if(order[0])lines.push(`🔝 ${esc(nm(order[0].d))} leads${order[1]?`, ${esc(nm(order[1].d))} second`:""}.`);
 const me=rc.cars.find(c=>c.d==="me");if(me){if(me.dnf===rc.seg+1)lines.push(`<b class="r">Your race is over: ${esc(me.why.toLowerCase())}.</b>`);else if(!me.dnf){const p=order.indexOf(me)+1;const b=beforePos.me||p;lines.push(`<b>You are running ${ordinal(p)}</b>${b>p?` <span class="g">(+${b-p})</span>`:b<p?` <span class="r">(${b-p})</span>`:""}.`);}}
 if(rc.yellow&&rc.seg<rc.K-1)lines.push(rc.kind==="open"?"🟡 Safety car deployed.":rc.kind==="endur"?"🟡 Full course yellow.":"🟡 Caution is out.");
 rc.seg++;rc.log.push({seg:rc.seg,lines});return lines;}
function aiInjury(id){const d=G.D[id];if(!d||d.r)return "";const w=R.int(2,6);d.inj={w};addNews(`${d.n} will miss about ${plural(w,"week")} with injuries from a crash.`);return ` ${esc(d.n)} is taken to the infield care center.`;}
/* ---------- finish ---------- */
function classify(rc){const fin=rc.cars.filter(c=>!c.dnf).sort((a,b)=>b.sc-a.sc).concat(rc.cars.filter(c=>c.dnf).sort((a,b)=>b.dnf-a.dnf||b.sc-a.sc));
 fin.forEach((c,i)=>{c.fin=i+1;});const top=fin.filter(c=>!c.dnf).slice(0,6);if(top.length){const f=R.wpick(top,c=>Math.exp((c.stp||0)/3));if(f)f.fl=1;}
 const maxLed=Math.max(...rc.cars.map(c=>c.led));return fin.map(c=>({d:c.d,tm:c.tm,num:c.num,st:c.start,f:c.fin,dnf:c.dnf?c.why:"",led:c.led,fl:c.fl,ml:c.led>0&&c.led===maxLed,stg:c.stg||0,pen:c.pen,tmn:c.tmn}));}
function applyResults(rc,res){const s=SER[rc.sid];const st=G.S[rc.sid];const champ=!s.oneoff;const n=res.length;
 res.forEach(r=>{let p=0;if(champ){p=ptsFor(rc.sid,r.f,rc.ev)+(r.stg||0);if(s.pts==="indy"){if(r.st===1)p+=1;if(r.led>0)p+=1;if(r.ml)p+=2;}if(s.pts==="fe"){if(r.st===1)p+=3;if(r.fl&&r.f<=10)p+=1;}}
  r.pts=p;if(!champ)return;if(rc.oneoff&&r.d==="me")return;
  const t=st.tab[r.d]||(st.tab[r.d]={p:0,st:0,w:0,pd:0,t5:0,t10:0,pol:0,dnf:0,led:0,sf:0,best:99});t.p+=p;t.st++;if(r.f===1)t.w++;if(r.f<=3)t.pd++;if(r.f<=5)t.t5++;if(r.f<=10)t.t10++;if(r.st===1)t.pol++;if(r.dnf)t.dnf++;t.led+=r.led;t.sf+=r.f;t.best=Math.min(t.best,r.f);});
 res.forEach(r=>{if(r.d==="me")return;const d=G.D[r.d];if(!d)return;d.c.st++;if(r.f===1){d.c.w++;if(rc.crown)d.c.cj++;}if(r.f<=5)d.c.t5++;if(r.st===1)d.c.pol++;});
 if(!s.oneoff){st.res.push({ci:rc.ci,w:res[0].d,p2:res[1]&&res[1].d,p3:res[2]&&res[2].d,pole:(res.find(r=>r.st===1)||{}).d});st.ci=Math.max(st.ci,rc.ci+1);}
 else G.hist[rc.sid].push({yr:G.yr,c:res[0].d,cn:res[0].d==="me"?G.me.name:nm(res[0].d)});
 if(typeof ownerRaceHook==="function")ownerRaceHook(rc,res);
 if(s.chase&&st.res.length===s.chase.after&&!st.chase)startChase(rc.sid);
 if(!s.oneoff&&st.res.length>=s.cal.length)finishSeries(rc.sid);
 const w=res[0];if(w.d!=="me"&&(s.tier>=7||rc.crown)&&R.chance(rc.crown?1:.35))addNews(`${nm(w.d)} wins ${rc.crown?"the ":""}${rc.ev}${rc.crown?"":" ("+s.sh+")"}.`);}
function startChase(sid){const st=G.S[sid];const rows=standings(sid).filter(r=>r.id);const n=SER[sid].chase.n;const ch=rows.slice(0,n).map(r=>r.id);st.chase=ch;
 ch.forEach((id,i)=>{st.tab[id].p=i===0?2100:i===1?2075:2065-(i-2)*5;});addNews(`${SER[sid].sh}: the Chase field is set. ${nm(ch[0])} leads the ${n} contenders.`);if(ch.indexOf("me")>=0){G.fl.madeChase=(G.fl.madeChase||0)+1;G.notes.push(`🏆 You made the ${SER[sid].sh} Chase!`);}}
function finishSeries(sid){const st=G.S[sid];if(st.done)return;st.done=true;const rows=standings(sid);if(!rows.length)return;const c=rows[0].id;st.champ=c;
 G.hist[sid].push({yr:G.yr,c,cn:c==="me"?G.me.name:nm(c),tm:c==="me"?(G.car.tm?tn(G.car.tm):""):tn(G.D[c]&&G.D[c].tm),p2:rows[1]&&rows[1].id});
 if(c!=="me"&&G.D[c])G.D[c].c.tt++;
 // team owners' championships
 (G.own||[]).forEach(o=>{if(o.s===sid){const ids=G.TM[o.tid]?G.TM[o.tid].cars.map(x=>x.d):[];if(ids.indexOf(c)>=0){o.titles=(o.titles||0)+1;G.notes.push(`🏆 Your team ${o.n} won the ${SER[sid].sh} championship!`);}}});
 if(c==="me"){G.st.titles.push({yr:G.yr,s:sid});addNews(`${G.me.name} is the ${G.yr} ${SER[sid].n} champion!`,true);G.notes.push(`🏆 <b>${G.yr} ${esc(SER[sid].n)} CHAMPION!</b>`);rep(SER[sid].tier*2);fame(SER[sid].tier*2);}
 else if(SER[sid].tier>=6)addNews(`${nm(c)} wins the ${G.yr} ${SER[sid].sh} championship.`);
 // superlicense points
 const tbl=SER[sid].slp;if(tbl){const p=champPos(sid,"me");if(p&&p<=tbl.length&&(st.tab.me||{}).st>=Math.ceil(SER[sid].cal.length*.6)){G.me.slp.push({yr:G.yr,s:sid,p:tbl[p-1]});G.notes.push(`📜 ${tbl[p-1]} FIA superlicense points for finishing ${ordinal(p)} in ${SER[sid].sh}.`);}}}
function slpTotal(){return sum(G.me.slp.filter(x=>x.yr>=G.yr-2).map(x=>x.p));}
/* ---------- quick (non-interactive) race for AI series ---------- */
function quickRace(sid,ci){const rc=makeRace(sid,ci,null);if(rc.kind==="drag"){const res=dragQuick(rc);applyResults(rc,res);return res;}
 rc.setup={q:0,r:0};qualify(rc,null);for(let i=0;i<rc.K;i++)simSeg(rc,null);const res=classify(rc);applyResults(rc,res);return res;}
/* ---------- drag racing ---------- */
function dragET(c,rc,tune){const q=c.q,r=c.r;let et=3.62+(100-q)*.0045-(r-70)*.0012+R.gauss()*.035;let smoke=.07+(tune&&tune.agg?.07:0)-(q-70)*.001;if(R.chance(smoke)){et+=R.f(.6,2.5);c.smoke=1;}else c.smoke=0;return et;}
function dragRT(c,launch){const sk=c.d==="me"?G.me.sk.qul:clamp(G.D[c.d].o,30,95);let rt=.085-(sk-60)*.0006+Math.abs(R.gauss())*.025;if(launch&&launch.agg)rt-=.012;let red=launch&&launch.agg?.06:.012;if(c.d==="me"&&launch&&launch.safe){rt+=.015;red=.003;}if(R.chance(red))return -1;return Math.max(.02,rt);}
function dragQuick(rc){rc.cars.forEach(c=>{c.qet=dragET(c,rc,null);});const q=rc.cars.slice().sort((a,b)=>a.qet-b.qet);q.length=Math.min(q.length,dragBracket(q.length));q.forEach((c,i)=>c.start=i+1);let round=q.slice();const out=[];
 while(round.length>1){const next=[];for(let i=0;i<round.length/2;i++){const a=round[i],b=round[round.length-1-i];const w=dragDuel(a,b,null,null);next.push(w);out.unshift(w===a?b:a);}round=next;}out.unshift(round[0]);
 return out.map((c,i)=>({d:c.d,tm:c.tm,num:c.num,st:c.start,f:i+1,dnf:"",led:0,fl:0,ml:0,stg:0,pen:0}));}
function dragDuel(a,b,tune,launch){if(a===b){a.last=a.last||{rt:.1,et:a.qet||4,sm:0};return a;}const ra=dragRT(a,a.d==="me"?launch:null),rb=dragRT(b,b.d==="me"?launch:null);
 const ea=(ra<0?.2:ra)+dragET(a,null,a.d==="me"?tune:null),eb=(rb<0?.2:rb)+dragET(b,null,b.d==="me"?tune:null);a.last={rt:ra,et:ea-(ra<0?.2:ra),sm:a.smoke};b.last={rt:rb,et:eb-(rb<0?.2:rb),sm:b.smoke};if(ra<0&&rb>=0)return b;if(rb<0&&ra>=0)return a;return ea<=eb?a:b;}
function dragBracket(n){let b=16;while(b>1&&b>n)b/=2;return b;}

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

/* ===================== SEASON LOOP, HUB & WEEKLY ACTIVITIES ===================== */
function addNews(t,mine){G.news.unshift({yr:G.yr,wk:G.wk,t,m:mine?1:0});if(G.news.length>160)G.news.length=160;}
function myEvent(){const sid=G.car.s;if(!sid||G.car.role!=="race")return null;const st=G.S[sid];const s=SER[sid];if(!st||st.ci>=s.cal.length)return null;const c=s.cal[st.ci];if(c[1]!==G.wk)return null;return {sid,ci:st.ci};}
function myOneoff(){return (G.car.oneoffs||[]).find(o=>{const c=SER[o.s].cal[o.ci];return c&&c[1]===G.wk&&!o.done;})||null;}
function canDrive(){return !G.me.inj&&!G.me.retired&&!G.car.sit;}
function nextEvent(sid){sid=sid||G.car.s;if(!sid)return null;const st=G.S[sid],s=SER[sid];if(!st||st.ci>=s.cal.length)return null;return {ci:st.ci,c:s.cal[st.ci]};}
function seasonOver(sid){sid=sid||G.car.s;return !sid||G.S[sid].done||G.S[sid].ci>=SER[sid].cal.length;}
function offseason(){return G.wk>=46||seasonOver();}
function apMax(){return offseason()?3:2;}
/* ---------- the dashboard ---------- */
function hub(){if(G.over)return endScreen();if(G.rc&&G.rc.phase&&G.rc.phase!=="done")return resumeRace();if(G.pending.length)return continuePending();
 const m=G.me,c=G.car,s=c.s?SER[c.s]:null;const ev=myEvent(),oo=myOneoff();const nx=nextEvent();
 const notes=G.notes.splice(0);
 let hero="";if(s){const t=G.TM[c.tm];const pos=champPos(c.s,"me");const tab=G.S[c.s].tab.me||{};
  hero=`<div class="hero"><div class="eyebrow">${esc(s.n.toUpperCase())}${c.role==="reserve"?" · RESERVE / TEST DRIVER":""}</div><div class="hero-t">#${c.role==="race"&&t?esc(String((t.cars.find(x=>x.d==="me")||{num:m.num}).num)):m.num} ${esc(tn(c.tm))}</div>
  <div class="hero-s">${t&&t.mfr?esc(t.mfr)+" · ":""}Car rating <b>${Math.round(myQ(c.tm))}</b> · ${c.con?`Contract through <b>${c.con.end}</b>${c.con.sal?` · ${money(c.con.sal)}/yr`:""}${c.con.pay?` · paying ${money(c.con.pay)}/yr`:""}`:"No contract"}${c.cc?` · ${s.disc==="open"||s.disc==="sports"?"Race engineer":"Crew chief"}: ${esc(c.cc)}`:""}</div></div>`;
  hero+=tiles([{l:"Overall",v:rb(OVR()),h:DISC_N[s.disc]},{l:"Championship",v:pos?ordinal(pos):"-",h:`${tab.p||0} pts`},{l:"Season",v:`${tab.w||0} W · ${tab.t5||0} T5`,sm:1,h:`${tab.st||0} starts · ${tab.pol||0} poles`},{l:"Cash",v:money(m.cash),sm:1,h:m.agent?"Agent: "+esc(m.agent.n):""},{l:"Reputation",v:Math.round(m.rep),h:"Fame "+Math.round(m.fame)},{l:"Health",v:Math.round(m.hp),h:m.inj?esc(m.inj.n):"Morale "+Math.round(m.mor)}]);}
 else hero=`<div class="hero"><div class="eyebrow">${m.retired?"RETIRED DRIVER":"FREE AGENT"}</div><div class="hero-t">${m.retired?"Life after driving":"Looking for a ride"}</div><div class="hero-s">${m.retired?"You can still run your teams, or close the book on your career.":"No seat right now. Check offers, buy a ride, or run your own car."}</div></div>`+tiles([{l:"Overall",v:rb(OVR())},{l:"Cash",v:money(m.cash),sm:1},{l:"Reputation",v:Math.round(m.rep)},{l:"Age",v:m.age}]);
 let agenda=`<div class="agenda">`;
 if(ev)agenda+=`<div>🏁 <b>Race week:</b> ${esc(evName(ev.sid,ev.ci))} at ${esc(tkn(SER[ev.sid].cal[ev.ci][0]))} (${TTYPE_N[tkt(SER[ev.sid].cal[ev.ci][0])]})${isCrown(ev.sid,ev.ci)?" 👑 crown jewel":""}${canDrive()?"":` <span class="r">You can't drive: ${m.inj?"injured":"sitting out"}</span>`}</div>`;
 else if(nx)agenda+=`<div>📅 Next: ${esc(evName(c.s,nx.ci))} at ${esc(tkn(nx.c[0]))} on ${wkDate(nx.c[1])} (${plural(nx.c[1]-G.wk,"week")})</div>`;
 else if(s)agenda+=`<div>🏆 Your ${esc(s.sh)} season is complete. ${champPos(c.s,"me")?"You finished "+ordinal(champPos(c.s,"me"))+".":""}</div>`;
 if(oo)agenda+=`<div>⭐ One-off this week: ${esc(evName(oo.s,oo.ci))}</div>`;
 const offers=G.offers.filter(o=>o.exp>=G.yr*52+G.wk);if(offers.length)agenda+=`<div>📄 You have <b>${offers.length}</b> contract offer${offers.length>1?"s":""} waiting.</div>`;
 if(c.next)agenda+=`<div>✍️ Signed for ${c.next.start}: ${esc(SER[c.next.s].sh)} with ${esc(tn(c.next.tm))}.</div>`;
 else if(c.con&&c.con.end===G.yr&&G.wk>=24&&!m.retired)agenda+=`<div>⏳ Your deal ends after this season. Silly season is on.</div>`;
 (G.own||[]).forEach(o=>{agenda+=`<div>🏢 Team owner: <b>${esc(o.n)}</b> (${esc(SER[o.s].sh)}) · ${money(o.cash)}</div>`;});
 agenda+=`<div>⚡ Action points this week: <b>${c.ap}</b></div></div>`;
 const goal=goalLine();
 const ch=[];
 ch.push({sec:"THIS WEEK"});
 if(c.ap>0&&!m.retired)ch.push({t:"Train, test &amp; promote",sub:`Spend action points (${c.ap} left)`,icon:"💪",f:activities});
 if(ev&&canDrive()&&!G.fl.raced)ch.push({t:`<b>Race weekend: ${esc(evName(ev.sid,ev.ci))}</b>`,sub:`${esc(tkn(SER[ev.sid].cal[ev.ci][0]))} · ${G.set.quick?"quick sim":"practice, qualifying, race"}`,icon:"🏁",cls:"hi",f:()=>raceWeekend(ev.sid,ev.ci,null)});
 else if(oo&&canDrive()&&!oo.done)ch.push({t:`<b>One-off: ${esc(evName(oo.s,oo.ci))}</b>`,sub:esc(tkn(SER[oo.s].cal[oo.ci][0])),icon:"⭐",cls:"hi",f:()=>raceWeekend(oo.s,oo.ci,oo)});
 else ch.push({t:"Advance to next week",sub:ev&&!canDrive()?"A substitute drives your car this weekend":nx?`${plural(Math.max(0,nx.c[1]-G.wk),"week")} to the next race`:"",icon:"⏭️",cls:"hi",f:advanceWeek});
 if(!ev&&!oo&&nx&&nx.c[1]-G.wk>1)ch.push({t:"Skip ahead to the next race week",sub:"Auto-plans your weeks (sim work and fitness)",icon:"⏩",f:()=>skipToRace()});
 ch.push({sec:"CAREER"});
 ch.push({t:`Contracts &amp; offers${offers.length?` <span class="pill y">${offers.length}</span>`:""}`,icon:"📄",tile:1,f:offersScreen});
 ch.push({t:"Standings",icon:"🏆",tile:1,f:()=>standingsScreen(c.s||lastSeries())});
 ch.push({t:"Career stats",icon:"📊",tile:1,f:careerScreen});
 ch.push({t:"Driver ratings",icon:"📈",tile:1,f:ratingsScreen});
 ch.push({t:"Calendar",icon:"📅",tile:1,f:()=>calendarScreen(c.s||lastSeries())});
 ch.push({t:"One-off races",icon:"⭐",tile:1,f:oneoffScreen});
 ch.push({t:"News &amp; rumors",icon:"📰",tile:1,f:newsScreen});
 ch.push({t:"Relationships",icon:"🤝",tile:1,f:relScreen});
 ch.push({t:"Series &amp; teams",icon:"🌍",tile:1,f:seriesBrowser});
 ch.push({t:"Team ownership",icon:"🏢",tile:1,f:ownerHub});
 ch.push({sec:"OTHER"});
 ch.push({t:"Settings &amp; save",icon:"⚙️",tile:1,f:settingsScreen});
 ch.push({t:m.retired?"Close the book on your career":"Retire from driving",icon:"🏳️",tile:1,f:retireMenu});
 show(`${notes.length?notes.map(n=>note(n,"good")).join(""):""}${hero}${agenda}${goal?`<div class="obj">🎯 ${goal}</div>`:""}`,ch);}
function lastSeries(){const r=G.st.races[G.st.races.length-1];return r?r.s:"cup";}
function goalLine(){const m=G.me,c=G.car;if(m.retired)return "";if(!c.s)return "Find a ride: check Contracts &amp; offers, or run your own car in a grassroots series.";const s=SER[c.s];
 const nxt=(NEXT[c.s]||[]).map(id=>SER[id].sh).slice(0,3).join(", ");
 if(s.id==="f1")return "You made it to Formula 1. Win races, win titles, become a legend.";
 if(s.tier>=9)return `You're at the top of ${esc(LADDERS[s.lad]||"the sport")}. Win the big ones: ${s.cal.filter(x=>x[3]).map(x=>esc(x[2])).join(", ")||"the championship"}.`;
 if(s.lad==="open-eu"&&s.tier>=6)return `Formula 1 needs 40 superlicense points over 3 seasons (you have ${slpTotal()}) and a team that wants you.`;
 return `Finish near the front in ${esc(s.sh)} to earn offers from ${esc(nxt||"higher series")}. Teams look at results, your rating, reputation and sponsor appeal.`;}
/* ---------- weekly activities ---------- */
function testCost(){const s=G.car.s?SER[G.car.s]:null;if(!s)return 800;if(G.car.tm==="priv")return Math.round(s.cost/s.cal.length*.5);return 0;}
function coachCost(){const s=G.car.s?SER[G.car.s]:null;const t=s?s.tier:1;return [0,300,500,900,1500,3000,5000,8000,10000,12000,15000][t]||500;}
function activities(){const c=G.car,m=G.me;const s=c.s?SER[c.s]:null;const priv=c.tm==="priv";const testOk=!!s&&(priv||!G.fl.testWk||G.yr*52+G.wk-G.fl.testWk>=4)&&!m.inj;
 const ch=[
  {t:"Fitness training",sub:"+Fitness, +health. Endurance races and hot days punish the unfit.",icon:"🏋️",f:()=>act("fit")},
  {t:"Sim racing session",sub:`+Qualifying, consistency and a track skill${m.sim?" (rig level "+m.sim+")":""}`,icon:"🎮",f:()=>act("sim")},
  s?{t:"Private test day",sub:priv?`Costs ${money(testCost())}. +Setup for your next race, +feedback, +speed`:"Team test (once every 4 weeks). +Setup for your next race, +feedback",icon:"🔧",dis:!testOk&&(m.inj?"You're injured":"Your team won't run another test yet"),f:()=>act("test")}:null,
  {t:"Driver coaching",sub:`${money(coachCost())}. Pick a skill to work on with a coach`,icon:"🧑‍🏫",dis:m.cash<coachCost()&&"Not enough cash",f:coachMenu},
  {t:"Hunt for sponsors",sub:"Make calls, send proposals, shake hands. Better with fame, results and media skill",icon:"💼",f:()=>act("spons")},
  {t:"Media & fan engagement",sub:"+Fame, +media skill, keeps sponsors happy",icon:"🎙️",f:()=>act("media")},
  {t:"Study data & onboard video",sub:"+Racecraft, +consistency, a small setup edge",icon:"📼",f:()=>act("study")},
  {t:"Network in the paddock",sub:"Meet team owners and managers in bigger series",icon:"🤝",f:()=>act("net")},
  priv?{t:"Work on your own car",sub:"+Car rating (slowly) and +mechanical feedback",icon:"🛠️",f:()=>act("car")}:null,
  (m.age<26||m.cash<5000)?{t:"Work a side job",sub:`Earn about ${money(sideJobPay())}`,icon:"🧰",f:()=>act("job")}:null,
  {t:"Rest & recover",sub:"+Health, +morale",icon:"🛌",f:()=>act("rest")},
  priv?{t:"Buy equipment upgrades",sub:"Spend money to make your car faster",icon:"🛒",f:upgradeMenu}:null,
  m.sim<3?{t:`Buy a better sim rig (level ${m.sim+1})`,sub:`${money([3000,15000,60000][m.sim])}. Sim sessions become more effective. No action point needed`,icon:"🖥️",dis:m.cash<[3000,15000,60000][m.sim]&&"Not enough cash",f:()=>{EFX=[];spend([3000,15000,60000][m.sim],"Sim rig");m.sim++;show(`<h2>New sim rig</h2><p>Direct-drive wheel, load-cell pedals and a laser-scanned track library.</p>${efxHtml()}`,[{t:"Back",cls:"hi",f:activities}]);}}:null,
  {t:"Back",cls:"hi",f:hub}];
 show(`<h2>This week</h2><p>You have <b>${c.ap}</b> action point${c.ap===1?"":"s"} left. Growth is slower as you approach your natural ceiling, and much slower after your mid-20s.</p>${statGrid()}`,ch.map(x=>x&&x.f!==hub&&!/sim rig/.test(x.t||"")&&x.f!==upgradeMenu?Object.assign(x,{dis:x.dis||(c.ap<=0&&"No action points left")}):x));}
function sideJobPay(){const a=G.me.age;return a<16?200:a<18?350:a<22?600:800;}
function act(k){const m=G.me,c=G.car;EFX=[];if(c.ap<=0)return hub();c.ap--;let txt="";const s=c.s?SER[c.s]:null;
 if(k==="fit"){gainSk("fit",.75);m.hp=clamp(m.hp+6,0,100);txt=R.pick(["Intervals on the bike, neck harness work, heat training in a sauna suit.","Five a.m. runs and an hour of core work. Your trainer is not impressed yet.","Reaction drills, grip strength and a long cardio session."]);}
 else if(k==="sim"){const b=1+m.sim*.25;gainSk("qul",.28*b);gainSk("con",.2*b);const tt=nextEvent()?tkt(nextEvent().c[0]):"road";const map={ss:"drf",int:"ovl",sht:"sht",dirt:"drt",road:"rdc",street:"rdc",kart:"rdc",drag:"qul"};gainSk(map[tt]||"rdc",.32*b);G.fl.simPrep=1;txt=`Three hours of laps${nextEvent()?" at a laser-scanned "+esc(tkn(nextEvent().c[0])):""}. Braking markers memorized.`;}
 else if(k==="test"){const cost=testCost();if(cost){if(m.cash<cost){c.ap++;return show(`<p>You can't afford a test day (${money(cost)}).</p>`,[{t:"Back",f:activities}]);}spend(cost,"Test day");}G.fl.testWk=G.yr*52+G.wk;c.testB=clamp((c.testB||0)+1.2+m.sk.fbk/80,0,3);gainSk("fbk",.4);gainSk("spd",.2);rel("cc",2);txt="A full day of runs: springs, shocks, aero balance, tire pressures. You find something.";}
 else if(k==="spons"){const chance=.15+m.sk.med/250+m.fame/250+(m.rep/400);if(R.chance(chance)){const sp=newSponsorOffer();return sponsorOfferScreen(sp);}gainSk("med",.15);txt=R.pick(["Twenty calls, two callbacks, zero deals. Next week.","A promising lunch meeting ends with \"let's circle back after the season.\"","You email forty companies. One replies with a coupon."]);}
 else if(k==="media"){gainSk("med",.35);fame(R.f(.4,1.2)|0||1);rel("media",2);c.spons.forEach(sp=>sp.sat=clamp(sp.sat+4,0,100));txt=R.pick(["A podcast, a fan Q&amp;A and a signing session at a dealership.","You film a sponsor video and do a live stream from your sim rig.","Local TV runs a feature on you. Your mom records it twice."]);}
 else if(k==="study"){gainSk("crf",.25);gainSk("con",.2);c.testB=clamp((c.testB||0)+.4,0,3);txt="Hours of onboard video and data overlays. You spot where the fast guys roll more speed.";}
 else if(k==="net"){const tgt=networkTarget();if(tgt){rel("t:"+tgt,R.int(4,8));if(R.chance(.18+m.rep/300)){G.fl.netOffer=tgt;txt=`You spend an evening talking racing with ${esc(towner(tgt))} of ${esc(tn(tgt))}. They ask for your number.`;if(R.chance(.5))later("net_callback",R.int(2,5),{tm:tgt});}else txt=`You introduce yourself to people at ${esc(tn(tgt))}. Faces will remember you.`;}else txt="The paddock is quiet this week.";rep(.5);}
 else if(k==="car"){const t=G.TM.priv;const cap=SER[t.s].ql+14;if(t.q<cap){t.q=r1(t.q+R.f(.3,.8));EFX.push(["Car rating",.5]);}gainSk("fbk",.35);txt="Late nights in the garage: scaling, bump steer, a fresh set of shocks.";}
 else if(k==="job"){const p=sideJobPay();earn(p,"Side job");morale(-2);txt=R.pick(["Tire shop shifts. You learn more about tires than you expected.","Fabrication work at a chassis builder.","Delivering pizzas in your own car. Not the car you want to be driving."]);}
 else if(k==="rest"){m.hp=clamp(m.hp+15,0,100);morale(6);txt="Sleep, family dinner, a day on the lake. You come back sharper.";}
 show(`<h2>${{fit:"Fitness training",sim:"Sim session",test:"Test day",spons:"Sponsor hunting",media:"Media & fans",study:"Data study",net:"Networking",car:"Garage night",job:"Side job",rest:"Rest day"}[k]}</h2><p>${txt}</p>${efxHtml()}`,[c.ap>0?{t:"Do something else",f:activities}:null,{t:"Back to the dashboard",cls:"hi",f:hub}]);}
function networkTarget(){const c=G.car;const ids=[];const tiers=c.s?SER[c.s].tier:1;Object.values(G.TM).forEach(t=>{if(t.priv||t.own)return;const s=SER[t.s];if(s.tier>tiers&&s.tier<=tiers+3&&(s.lad===(c.s?SER[c.s].lad:s.lad)||R.chance(.3)))ids.push(t.id);});return ids.length?R.pick(ids):null;}
function coachMenu(){const groups=[["Racecraft & overtaking",["crf","ovt","dfd"]],["Qualifying & raw speed",["qul","spd"]],["Ovals & drafting",["ovl","drf","sht"]],["Road & street courses",["rdc","wet"]],["Dirt",["drt","crf"]],["Tires & consistency",["tir","con"]],["Media training",["med"]]];
 show(`<h2>Driver coaching</h2><p>A session costs ${money(coachCost())}.</p>`,groups.map(g=>({t:g[0],sub:g[1].map(k=>SKN[k]+" "+Math.round(G.me.sk[k])).join(" · "),f:()=>{EFX=[];if(G.car.ap<=0)return hub();G.car.ap--;spend(coachCost(),"Coaching");g[1].forEach(k=>gainSk(k,.55));show(`<h2>Coaching</h2><p>Your coach breaks down every corner and every mistake. It's humbling, and it works.</p>${efxHtml()}`,[G.car.ap>0?{t:"Do something else",f:activities}:null,{t:"Back to the dashboard",cls:"hi",f:hub}]);}})).concat([{t:"Back",f:activities}]));}
function upgradeMenu(){const t=G.TM.priv;const s=SER[t.s];const cap=s.ql+16;const step=Math.round(s.cost*.12);
 show(`<h2>Equipment upgrades</h2><p>Your car rating is <b>${Math.round(t.q)}</b> (series average about ${s.ql}). Each upgrade costs ${money(step)}.</p>`,[
  {t:"Fresh engine / motor freshen",sub:"+2 car rating",dis:(m=>m.cash<step&&"Not enough cash")(G.me)||(t.q>=cap&&"You're at the top of what money can buy here"),f:()=>{EFX=[];spend(step,"Upgrade");t.q=Math.min(cap,t.q+2);EFX.push(["Car rating",2]);show(`<p>The new parts are on. It feels quicker already.</p>${efxHtml()}`,[{t:"Back",f:upgradeMenu}]);}},
  {t:"Back",cls:"hi",f:activities}]);}
function autoWeek(){const c=G.car;while(c.ap>0){c.ap--;EFX=[];if(G.me.hp<70){G.me.hp=clamp(G.me.hp+15,0,100);}else if(c.ap%2===0)gainSk("fit",.6,true);else{gainSk("qul",.2,true);gainSk("con",.15,true);}}EFX=[];}
function skipToRace(){let guard=0;while(guard++<60){autoWeek();const r=endWeekCore();if(G.pending.length||G.notes.length||myEvent()||myOneoff()||G.wk===0||r==="stop")break;}continuePending();}
/* ---------- week processing ---------- */
function advanceWeek(){const ev=myEvent();if(ev&&canDrive()&&!G.fl.raced)return raceWeekend(ev.sid,ev.ci,null);endWeekCore();continuePending();}
function endWeekCore(){const m=G.me,c=G.car;
 // simulate every other race held this week
 for(const s of SERIES_LIST){const st=G.S[s.id];if(!st)continue;if(s.oneoff){if(s.cal[0][1]===G.wk&&!(G.fl["oo_"+s.id]===G.yr))quickRace(s.id,0);continue;}
  while(st.ci<s.cal.length&&s.cal[st.ci][1]===G.wk){quickRace(s.id,st.ci);}}
 G.fl.raced=0;
 // money
 let inc=0;if(c.con&&!m.retired){if(c.con.sal)inc+=c.con.sal/52;}
 const bg=BGS[m.bg];let fam=bg[3];if(m.age>=23)fam*=.4;if(m.age>=27)fam=0;inc+=fam;
 c.spons.forEach(sp=>inc+=sp.amt/52);if(m.agent&&c.con&&c.con.sal)inc-=c.con.sal/52*m.agent.fee;
 if(m.age>=18)inc-=m.retired?400:250;if(G.car.dev&&G.car.dev.pay)inc+=G.car.dev.pay/52;
 m.cash+=inc;if(inc>0)m.earned+=Math.max(0,inc);
 // health & injuries
 if(m.inj){m.inj.w--;if(m.inj.w<=0){m.inj=null;G.notes.push("🩺 You're cleared to race again.");}}
 naturalGrowth();m.hp=clamp(m.hp+(m.inj?2:5),0,100);m.mor+= (60-m.mor)*.05;
 for(const id in G.D){const d=G.D[id];if(d.inj){d.inj.w--;if(d.inj.w<=0)delete d.inj;}}
 ownerWeekly();
 // calendar
 G.wk++;if(G.wk>=52)newYear();
 c.ap=apMax();
 sillyTicks();
 queueEvents();
 if(m.cash<-5000&&!G.fl.debtWk){G.fl.debtWk=1;queuePending("debt",{});}
 return null;}
/* ---------- new year ---------- */
function newYear(){const m=G.me;recordSeasons();
 G.yr++;G.wk=0;m.age++;
 // aging
 if(m.age>=32){const dec=(m.age-31)*.42*(hasTrait("iron")?.8:1);["spd","qul","fit","wet","ovt"].forEach(k=>{m.sk[k]=clamp(m.sk[k]-dec*R.f(.5,1.1),5,99);});if(m.age>=36)["con","crf","dfd","tir"].forEach(k=>m.sk[k]=clamp(m.sk[k]-dec*.45,5,99));}
 for(const id in G.D)developAI(G.D[id]);pruneWorld();
 for(const s of SERIES_LIST)resetSeriesState(s.id);
 G.offers=G.offers.filter(o=>o.exp>=G.yr*52);G.fl.cross=0;G.fl.sillyDone=0;G.fl.midOffers=0;G.fl.eosOffers=0;G.fl.raced=0;
 // contracts
 const c=G.car;if(c.dev&&c.dev.end<G.yr)c.dev=null;
 if(G.fl.nextPriv&&!c.next){const np=G.fl.nextPriv;G.fl.nextPriv=null;removeMe();joinPrivOrPay(np,false);G.me.disc=SER[np].disc;addNews(`${m.name} moves up to ${SER[np].n} with a self-funded car.`,true);}
 else if(c.next){applyContract(c.next);c.next=null;}
 else if(c.con&&c.con.end<G.yr){if(c.con.priv&&!m.retired){c.con.end=G.yr;}else expireContract();}
 if(c.con&&c.con.pay&&c.con.payYr!==G.yr&&!c.con.priv){spend(c.con.pay,"Ride payment");c.con.payYr=G.yr;}
 c.spons=c.spons.filter(sp=>{if(sp.sat<35){G.notes.push(`💸 ${esc(sp.n)} did not renew its sponsorship.`);return false;}sp.sat=clamp(sp.sat-10,0,100);return true;});
 c.oneoffs=[];ownerNewYear();
 if(c.s&&G.TM[c.tm]&&G.TM[c.tm].priv){const t=G.TM.priv;const s=SER[c.s];t.q=clamp(t.q-R.f(0,1.5),20,s.ql+16);}
 addNews(`The ${G.yr} season begins.`);
 if(G.fl.retireEoY&&!m.retired){G.fl.retireEoY=0;doRetire();if(!(G.own||[]).length)G.over=true;}
 if(!m.retired&&m.age>=58){doRetire();G.notes.push("🏳️ At 58, you finally hang up the helmet.");if(!(G.own||[]).length)G.over=true;}
 if(m.age>=40&&!m.retired&&!G.fl.bodyAsk){G.fl.bodyAsk=1;queuePending("body_says_no",{});}}
function recordSeasons(){const yr=G.yr;const bySer={};G.st.races.forEach(r=>{if(r.yr===yr){(bySer[r.s]=bySer[r.s]||[]).push(r);}});
 Object.keys(bySer).forEach(sid=>{const rs=bySer[sid];const s=SER[sid];const pos=s.oneoff?0:champPos(sid,"me");const t=G.S[sid].tab.me;
  G.st.seasons.push({yr,s:sid,tm:rs[rs.length-1].tmn||"",st:rs.length,w:rs.filter(r=>r.f===1).length,pd:rs.filter(r=>r.f<=3).length,t5:rs.filter(r=>r.f<=5).length,t10:rs.filter(r=>r.f<=10).length,pol:rs.filter(r=>r.st===1).length,led:sum(rs.map(r=>r.led)),fl:rs.filter(r=>r.fl).length,dnf:rs.filter(r=>r.dnf).length,as:r1(avg(rs.map(r=>r.st))),af:r1(avg(rs.map(r=>r.f))),p:t?t.p:sum(rs.map(r=>r.pts||0)),pos,ch:pos===1&&G.S[sid].done?1:0,oo:rs.every(r=>r.oo)?1:0});});}
function developAI(d){if(d.ret)return;const a=G.yr-d.by;let ch=0;if(a<24)ch=Math.max(0,(d.pot-d.o))*R.f(.12,.35);else if(a<31)ch=R.f(-1,1.3)+(d.pot>d.o?.5:0);else if(a<35)ch=R.f(-1.5,.6);else ch=-R.f(.8,2.8)*(a>=39?1.5:1);d.o=clamp(r1(d.o+ch),15,98);}

function pruneWorld(){for(const id in G.D){const d=G.D[id];if(d.r||d.tm)continue;const keep=G.rel["d:"+id]||(G.car.oneoffs||[]).some(o=>o.d===id)||G.fl.prodigy===id;if(keep)continue;if((d.ret&&G.yr-d.ret>=2)||(!d.ret&&G.yr-d.by>34&&d.c.st===0))delete G.D[id];}G.rumors=G.rumors.filter(r=>!r.d||G.D[r.d]);}

/* ===================== RACE WEEKEND UI ===================== */
function myCar(rc){return rc.cars.find(c=>c.d==="me");}
function myPosNow(rc){const run=rc.cars.filter(c=>!c.dnf).sort((a,b)=>b.sc-a.sc);const i=run.findIndex(c=>c.d==="me");return i>=0?i+1:0;}
function expFin(rc){const sorted=rc.cars.slice().sort((a,b)=>perf(b,rc)-perf(a,rc));return sorted.findIndex(c=>c.d==="me")+1||Math.round(rc.cars.length/2);}
function raceWeekend(sid,ci,oo){const ooIdx=oo?G.car.oneoffs.indexOf(oo):-1;
 const extra=oo?{tm:oo.tm||null,q:oo.q,tmn:oo.tmn}:null;const rc=makeRace(sid,ci,extra);rc.ooIdx=ooIdx;rc.phase="pre";rc.myTm=oo?(oo.tm||null):G.car.tm;
 rc.exp=expFin(rc);G.rc=rc;if(G.set.quick)return quickMine();return preview();}
function resumeRace(){const rc=G.rc;if(!rc)return hub();if(rc.phase==="pre")return preview();if(rc.phase==="quali")return qualiCard();if(rc.phase==="race")return segCard();if(rc.phase==="drag")return dragCard();if(rc.phase==="post")return resultsScreen();G.rc=null;hub();}
function fieldAvgQ(rc){return avg(rc.cars.filter(c=>c.d!=="me").map(c=>c.q));}
function preview(){const rc=G.rc,s=SER[rc.sid],me=myCar(rc);const t=TRK[rc.trk];
 const rivals=standings(rc.sid).filter(r=>r.id!=="me").slice(0,3).map(r=>r.id);const top=rc.cars.filter(c=>c.d!=="me").sort((a,b)=>perf(b,rc)-perf(a,rc)).slice(0,3).map(c=>c.d);
 const fc=rc.wet?"Rain all day. Wet race.":rc.rainSeg>=0?"Showers likely at some point.":rc.rainP>.2&&["road","street","kart"].indexOf(rc.type)>=0?"A slight chance of rain.":"Dry and warm.";
 const crowd=rc.crown?`<p class="gold">👑 <b>This is a crown jewel.</b> ${esc(rc.ev)}. Winning here puts your name in the history books.</p>`:"";
 const intro=rc.kind==="drag"?`Two lanes, a quarter-mile reduced to 1,000 feet, eleven thousand horsepower.`:rc.kind==="ss"?"Pack racing at 190 mph. Everybody's a contender, and anybody can get caught in the Big One.":rc.kind==="dirt"?"The cushion is building up and the track is going to slick off. Car control wins here.":rc.kind==="endur"?`Endurance racing: you share the car with ${G.car.co&&G.car.co.length?G.car.co.map(c=>esc(c.n)).join(" and "):"your co-drivers"}.`:rc.kind==="open"?"Qualifying matters: passing is hard and strategy decides races.":rc.kind==="kart"?"Wheel to wheel, bumper to bumper. Keep your nose clean through turn one.":"";
 show(`<div class="eyebrow">${esc(s.n.toUpperCase())} · ROUND ${rc.oneoff?"(one-off)":(rc.ci+1)+" OF "+s.cal.length}</div><h2>${esc(rc.ev)}</h2>
 <p>${esc(t[0])}, ${esc(t[1])} · ${TTYPE_N[rc.type]}, ${t[3]} mi${rc.kind!=="drag"?` · ${rc.laps} laps`:""}</p>${crowd}<p>${intro}</p>
 ${tiles([{l:"Your track rating",v:rb(Math.round(trackR(rc.type,rc.wet)))},{l:"Your car",v:Math.round(me.q),h:"Field average "+Math.round(fieldAvgQ(rc))},{l:"Forecast",v:rc.wet?"🌧️":rc.rainSeg>=0?"🌦️":"☀️",h:fc},{l:"Field",v:rc.cars.length,h:"cars"}])}
 <p>Fastest on paper: ${top.map(id=>nmb(id)).join(", ")}${rivals.length&&!rc.oneoff?`. Points leaders: ${rivals.map(id=>esc(nm(id))).join(", ")}.`:"."}</p>`,
 rc.kind==="drag"?[{t:"Head to the staging lanes",cls:"hi",f:()=>{rc.phase="drag";dragStart();}},{t:"Quick-sim this event",f:quickMine}]:[
  {sec:"PRACTICE"},
  {t:"Practice: race setup",sub:"Long runs. Better race pace, less one-lap speed",icon:"🛞",f:()=>practice("race")},
  {t:"Practice: qualifying setup",sub:"Low fuel, sticker tires. Better grid spot",icon:"⏱️",f:()=>practice("qual")},
  {t:"Practice: balanced",sub:"A bit of both",icon:"⚖️",f:()=>practice("bal")},
  {t:"Push hard in practice",sub:"Find the limit. Bigger gains, but you could crash",icon:"🔥",f:()=>practice("push")},
  {t:"Quick-sim the whole weekend",sub:"Skip to the results",icon:"⏩",f:quickMine}]);}
function practice(mode){const rc=G.rc,m=G.me;EFX=[];const base=(m.sk.fbk-50)/25+relOf("cc")/60+(G.car.testB||0)+(G.fl.simPrep?.3:0)+R.gauss()*.7;let q=0,r=0;
 if(mode==="race"){r=base;q=base*.35;}else if(mode==="qual"){q=base+.5;r=base*.35;}else if(mode==="bal"){q=r=base*.7;}else{q=r=base*.9+.6;}
 let txt=R.pick(["The car is tight in the center and loose off.","You chase the balance all session.","The crew makes a big swing on the setup and it works.","Your lap times drop with every run."]);
 if(base>1.5)txt="The car is <b>on rails</b>. You're near the top of the practice sheet.";else if(base<-.5)txt="Nothing works. You're buried down the practice chart.";
 if(R.chance(mode==="push"?.09:.02)){q-=1;r-=1;txt+=` <b class="r">You crash in practice!</b> The crew thrashes to fix the car${SER[rc.sid].tier>=6?" (backup car)":""}.`;if(G.car.tm==="priv"&&!rc.oneoff){const cost=Math.round(SER[rc.sid].cost/SER[rc.sid].cal.length*.4);spend(cost,"Repairs");}rel("cc",-2);}
 rc.setup={q:r1(q),r:r1(r)};G.car.testB=0;G.fl.simPrep=0;gainSk("fbk",.08,true);rc.phase="quali";
 show(`<h2>Practice</h2><p>${txt}</p><p>Setup: qualifying trim <b>${sgn(rc.setup.q)}</b>, race trim <b>${sgn(rc.setup.r)}</b>.</p>${efxHtml()}`,[{t:"On to qualifying",cls:"hi",f:qualiCard}]);}
function sgn2(v){return (v>=0?"+":"")+r1(v);}
function qualiCard(){const rc=G.rc;rc.phase="quali";const ovalPack=rc.kind==="ss";
 const fmt=rc.kind==="kart"?"Timed qualifying sets the grid for the heats and the final.":rc.kind==="dirt"?"Time trials, then heat races. Qualifying sets your heat position.":ovalPack?"Single-car runs at a superspeedway are mostly about the car.":SER[rc.sid].disc==="open"?"Knockout qualifying. Every tenth matters.":"Single-car qualifying runs.";
 show(`<h2>Qualifying</h2><p>${fmt}</p>`,[
  {t:"Clean, safe lap",sub:"No risk",icon:"✅",f:()=>doQuali({qb:0,risk:0})},
  {t:"Push for a strong lap",sub:"+speed, small chance of a mistake",icon:"⚡",f:()=>doQuali({qb:ovalPack?.6:1.4,risk:.08})},
  {t:"Everything on the line",sub:"Big gain or a big mistake",icon:"🔥",f:()=>doQuali({qb:ovalPack?1.2:2.8,risk:.22})},
  {t:"Quick-sim the rest of the weekend",icon:"⏩",f:quickMine}]);}
function doQuali(mode){const rc=G.rc;const note2=qualify(rc,mode);const me=myCar(rc);const g=rc.cars.slice().sort((a,b)=>a.start-b.start);
 if(me.start===1){G.notes.push("");}
 const rows=g.slice(0,10).map(c=>({cells:[c.start,(c.d==="me"?"<b>"+esc(G.me.name)+"</b>":esc(nm(c.d))),esc(c.tmn||tn(c.tm)),"#"+esc(String(c.num))],hl:c.d==="me"}));if(me.start>10)rows.push({cells:[me.start,"<b>"+esc(G.me.name)+"</b>",esc(me.tmn||tn(me.tm)),"#"+me.num],hl:true});
 const msg=me.start===1?`<p class="gold"><b>POLE POSITION!</b> ${R.pick(["What a lap!","You put it on the pole by a whisker.","Nobody could touch that lap."])}</p>`:me.start<=3?`<p class="g">You'll start <b>${ordinal(me.start)}</b>. A great lap.</p>`:me.start<=rc.cars.length/2?`<p>You'll start <b>${ordinal(me.start)}</b>.</p>`:`<p class="r">You'll start <b>${ordinal(me.start)}</b>. Work to do.</p>`;
 if(me.start===1)G.notes.pop();
 show(`<h2>Qualifying results</h2>${note2?`<p class="r">${note2}</p>`:""}${msg}${table(["Pos","Driver","Team","Car"],rows)}`,[{t:"Go racing",cls:"hi",f:segCard}]);}
/* ---------- in-race decisions ---------- */
function segCard(){const rc=G.rc;rc.phase="race";const me=myCar(rc);if(me.dnf||rc.seg>=rc.K)return finishRace();
 const pos=myPosNow(rc);const n=rc.cars.filter(c=>!c.dnf).length;const pitS=!!PIT_SERIES[rc.sid];const last=rc.seg===rc.K-1;const first=rc.seg===0;const kind=rc.kind;
 const lapNow=Math.round(rc.laps*rc.seg/rc.K);const prev=rc.log.length?rc.log[rc.log.length-1].lines:[];
 let head=first?`<p>${kind==="kart"||kind==="dirt"?"The field rolls two-by-two.":kind==="open"?"Five red lights...":kind==="endur"?"The rolling start is moments away.":"The green flag is in the air!"} You start <b>${ordinal(me.start)}</b> of ${rc.cars.length}.</p>`:`<p>Lap ${lapNow} of ${rc.laps}. You're running <b>${ordinal(pos)}</b> of ${n}.${pitS?` Tires: ${["fresh","good","worn","shot","gone"][Math.min(4,me.tire)]}.`:""}</p>`;
 const log=prev.length?`<div class="log">${prev.map(l=>`<div>${l}</div>`).join("")}</div>`:"";
 let ch=[];const fx=(o)=>()=>runSeg(o);
 // team orders
 if(!first&&rc.seg>=rc.K-2&&!rc.toAsked&&!rc.oneoff){const run=rc.cars.filter(c=>!c.dnf).sort((a,b)=>b.sc-a.sc);const i=run.indexOf(me);const behind=run[i+1],ahead=run[i-1];
  const mate=behind&&behind.tm===me.tm&&behind.d!=="me"?behind:null;const st=G.S[rc.sid];
  if(mate&&R.chance(.4)&&G.car.con&&!G.car.con.n1&&(st.tab[mate.d]||{p:0}).p>((st.tab.me||{p:0}).p)){rc.toAsked=1;
   return show(`${head}${log}<h3>📻 Team orders</h3><p>"${esc(G.car.cc||"Your engineer")} here. ${esc(nm(mate.d))} is ahead of you in the championship. The team asks you to let them through."</p>`,[
    {t:"Let your teammate by",sub:"Lose a spot; the team remembers your loyalty",f:()=>{EFX=[];const t=me.sc;me.sc=mate.sc-.1;mate.sc=t+.1;rel("t:"+me.tm,6);rel("d:"+mate.d,5);G.fl.obeyed=(G.fl.obeyed||0)+1;segCardNote("You lift and wave your teammate through.");}},
    {t:"Ignore the call",sub:"Keep your spot; the team won't be happy",f:()=>{EFX=[];rel("t:"+me.tm,-8);rel("d:"+mate.d,-8);rep(-1);G.fl.ignoredTO=(G.fl.ignoredTO||0)+1;segCardNote("You keep your foot in it. The radio goes very quiet.");}}]);}}
 if(first){
  if(kind==="ss")ch=[{t:"Ride high in the draft",sub:"Momentum lane: could gain a lot or lose a lot",f:fx({lane:1,pace:.3,risk:1})},{t:"Hang at the back, wait for the end",sub:"Avoid the Big One; give up track position",f:fx({back:1,pace:-1.6,risk:.6})},{t:"Push to the front early",sub:"Lead laps, collect stage points, take risks",f:fx({pace:1.2,risk:1.3})}];
  else if(kind==="dirt")ch=[{t:"Run the cushion",sub:"The fastest line and the riskiest",f:fx({pace:1.3,risk:1.45})},{t:"Hug the bottom",sub:"Safe, steady and slower",f:fx({pace:-.3,risk:.7})},{t:"Slide job the leaders",sub:"Aggressive passing",f:fx({pace:.9,risk:1.3})}];
  else ch=[{t:"Aggressive start",sub:"Gain spots into turn one; risk contact"+(kind==="open"||kind==="kart"?" or a jump start":""),f:fx({pace:1.4,risk:1.4,jump:kind==="open"||kind==="kart"?.04:0})},{t:"Clean start",sub:"Hold position, stay out of trouble",f:fx({pace:.2,risk:.85})},{t:"Patient: save tires early",sub:"Lose a little now, faster later",f:fx({pace:-.5,risk:.7,wear:.7,save:1})}];
 }else if(rc.yellow&&pitS&&!last){
  ch=[{t:kind==="open"||kind==="endur"?"Box under the safety car":"Pit for four tires",sub:"Fresh tires, lose track position",f:fx({pit:1,pace:.3,risk:1})},
   (SER[rc.sid].disc==="stock")?{t:"Two tires",sub:"Quicker stop, half the grip",f:fx({pit:1,tires:2,pace:.1,risk:1})}:{t:"Box and switch to softer tires",sub:"Faster, but they wear quickly",f:fx({pit:1,comp:{pace:1,wear:1.6},risk:1})},
   {t:"Stay out for track position",sub:me.tire>=2?"Your tires are worn. Risky.":"Gain spots, older tires",f:fx({stay:1,risk:1})}];
  if(rc.wet&&!me.wt)ch.unshift({t:"Pit for wet tires",sub:"It's raining: slicks are useless",f:fx({pit:1,wetTires:1})});
 }else if(rc.wet&&!me.wt&&kind!=="stock"&&kind!=="ss"&&kind!=="dirt"&&kind!=="indyoval"){
  ch=[{t:"Pit for wet tires now",sub:"The right call if the rain stays",f:fx({wetTires:1})},{t:"Gamble: stay on slicks",sub:"If it dries, you win big. If not...",f:fx({risk:1.4,pace:-.5})}];
 }else if(rc.rainSeg===rc.seg+1&&!rc.radarWarned&&["road","street","kart"].indexOf(rc.type)>=0){rc.radarWarned=1;
  ch=[{t:"Radar says rain soon: pit for wets early",sub:"A gamble that pays off if the rain comes heavy",f:fx({wetTires:1,pace:-.3})},{t:"Stay out and react",sub:"Standard approach",f:fx({pace:0,risk:1})},{t:"Push hard before it rains",sub:"Build a gap",f:fx({pace:1,risk:1.25})}];
 }else if(last){
  ch=[{t:"All-out attack",sub:"Everything you've got: more passing, more mistakes",f:fx({pace:2,risk:1.7})},{t:"Race hard but smart",sub:"Take what the car gives you",f:fx({pace:.7,risk:1.05})},{t:"Bring it home",sub:"Protect the finish and the points",f:fx({pace:-.3,risk:.6})}];
  if(rc.yellow&&(kind==="stock"||kind==="ss"||kind==="indyoval"))ch.unshift({t:"Restart: take the outside line",sub:"Bold: could clear you to the lead or hang you out to dry",f:fx({lane:1.3,pace:.6,risk:1.25})});
  if(pitS&&me.tire>=3)ch.push({t:"Late stop for fresh tires",sub:"Your tires are gone. Lose time now, charge at the end",f:fx({pit:1,pace:1.5,risk:1.2})});
 }else{
  ch=[{t:"Push the pace",sub:"Close the gap",f:fx({pace:1,risk:1.25,wear:1.25})},{t:"Settle in and manage",sub:"Look after the car",f:fx({pace:0,risk:.85,wear:.8})}];
  if(pitS&&me.tire>=2)ch.push({t:kind==="open"||kind==="endur"?"Box for fresh tires (green flag)":"Green-flag pit stop",sub:"Costs time now, faster after",f:fx({pit:1,risk:1})});
  if(kind==="ss")ch.push({t:"Work the draft with a partner",sub:SER[rc.sid].mfr?"Lock bumpers with a manufacturer teammate":"Find a drafting partner",f:fx({lane:.8,pace:.3,risk:1.1})});
  if(kind==="endur")ch.push({t:"Double-stint (stay in the car)",sub:"You're quicker than the co-driver, but it takes it out of you",f:fx({pace:.8,risk:1.05,fit:1})});
  if(kind==="dirt")ch.push({t:"Move up to the cushion",sub:"The track is slicking off: find grip up high",f:fx({pace:1,risk:1.3})});
  if(kind==="open"&&!rc.compAsked){ch.push({t:"Switch to a two-stop plan",sub:"Softer tires and more pace, an extra stop",f:fx({comp:{pace:1.2,wear:1.4},pace:.3,risk:1})});}
 }
 ch.push({t:"Sim to the checkered flag",sub:"Auto strategy",cls:"",icon:"⏩",f:simToEnd});
 show(`<div class="eyebrow">${esc(rc.ev.toUpperCase())}</div>${head}${log}`,ch);}
function segCardNote(t){const rc=G.rc;rc.log.push({seg:rc.seg,lines:[t]});save();segCard();}
function runSeg(fx){const rc=G.rc;if(fx.fit){G.me.hp=clamp(G.me.hp-8,0,100);}
 if(hasTrait("charger")&&fx.pace>0)fx.pace+=.2;if(hasTrait("ice")&&rc.seg===rc.K-1)fx.risk=(fx.risk||1)*.85;if(hasTrait("braker"))fx.risk=(fx.risk||1)*1.05;
 simSeg(rc,fx);save();const me=myCar(rc);if(me.dnf||rc.seg>=rc.K)return finishRace();segCard();}
function autoFx(rc){const me=myCar(rc);const fx={pace:.3,risk:1};if(!me)return fx;const pitS=!!PIT_SERIES[rc.sid];if(rc.wet&&!me.wt)fx.wetTires=1;
 else if(pitS&&rc.yellow&&me.tire>=1&&rc.seg<rc.K-1)fx.pit=1;else if(pitS&&me.tire>=3)fx.pit=1;if(rc.seg===rc.K-1)fx.pace=.8;return fx;}
function simToEnd(){const rc=G.rc;let g=0;while(rc.seg<rc.K&&!myCar(rc).dnf&&g++<20)simSeg(rc,autoFx(rc));if(rc.seg<rc.K){while(rc.seg<rc.K&&g++<40)simSeg(rc,{});}finishRace();}
function quickMine(){const rc=G.rc;if(rc.kind==="drag"){rc.phase="drag";const res=dragQuick(rc);return applyMine(res);}if(rc.phase==="pre"){rc.setup={q:(G.car.testB||0)*.6+(G.me.sk.fbk-50)/40,r:(G.car.testB||0)*.6+(G.me.sk.fbk-50)/40};G.car.testB=0;}
 if(rc.phase==="pre"||rc.phase==="quali")qualify(rc,null);simToEnd();}
function finishRace(){const rc=G.rc;while(rc.seg<rc.K)simSeg(rc,{});const res=classify(rc);applyMine(res);}
/* ---------- results ---------- */
function applyMine(res){const rc=G.rc;const s=SER[rc.sid];EFX=[];applyResults(rc,res);const r=res.find(x=>x.d==="me");rc.res=res;rc.phase="post";
 if(rc.ooIdx>=0&&G.car.oneoffs[rc.ooIdx])G.car.oneoffs[rc.ooIdx].done=1;if(s.oneoff)G.fl["oo_"+s.id]=G.yr;
 if(!r){save();return resultsScreen();}
 const tmn=rc.oneoff?(myCar(rc).tmn||tn(myCar(rc).tm)):tn(G.car.tm);
 const rec={yr:G.yr,wk:G.wk,s:rc.sid,ci:rc.ci,ev:rc.ev,trk:rc.trk,st:r.st||rc.cars.length,f:r.f,n:res.length,led:r.led,fl:r.fl?1:0,dnf:r.dnf||"",pts:r.pts||0,cj:rc.crown&&r.f===1?1:0,oo:rc.oneoff?1:0,tmn,wet:rc.wet?1:0};
 G.st.races.push(rec);if(rec.cj){G.st.cj.push({yr:G.yr,ev:rc.ev,s:rc.sid});addNews(`${G.me.name} wins the ${rc.ev}!`,true);}else if(r.f===1)addNews(`${G.me.name} wins the ${rc.ev}${s.tier>=5?"":" at "+tkn(rc.trk)}.`,true);
 // money
 const perRace=Math.round(s.cost/Math.max(1,s.cal.length));
 if(G.car.tm==="priv"&&!rc.oneoff){spend(perRace,"Race costs (tires, fuel, entry)");}
 const payout=r.f===1?1:r.f===2?.6:r.f===3?.45:r.f<=5?.3:r.f<=10?.15:.06;
 if(s.purse&&(G.car.tm==="priv"||rc.oneoff||s.tier<=4))earn(Math.round(s.purse*payout),"Prize money");
 else if(s.purse)earn(Math.round(s.purse*payout*.3),"Purse share");
 if(r.f===1&&G.car.con&&G.car.con.win&&!rc.oneoff)earn(G.car.con.win,"Win bonus");
 if(r.dnf&&/rash|ontact|wall|Multi/.test(r.dnf)){G.stats.crashes++;if(G.car.tm==="priv"&&!rc.oneoff)spend(Math.round(perRace*.6),"Crash repairs");rel("cc",-1);
  const p=.07*(rc.kind==="ss"?1.6:1)*(s.tier>=6?1.3:1)*(rc.kind==="kart"?.5:1);if(R.chance(p)){const sev=R.wpick([1,2,3],x=>x===1?5:x===2?3:1.3);const inj=hurt(sev);G.notes.push(`🚑 You were hurt in the crash: ${esc(inj)}. ${G.me.inj.w>1?"You'll miss about "+plural(G.me.inj.w,"week")+".":""}`);}}
 // reputation, morale, relationships
 const tierW=.4+s.tier*.25;const n=res.length;
 if(r.f===1){rep(r1(tierW*1.6));fame(r1(tierW*1.4));morale(10);}else if(r.f<=3){rep(r1(tierW*.7));fame(r1(tierW*.5));morale(5);}else if(r.f<=Math.max(5,n*.25)){rep(r1(tierW*.25));morale(2);}else if(r.dnf){morale(-5);rep(-.3);}else if(r.f>n*.7)morale(-3);
 const diff=rc.exp-r.f;if(!rc.oneoff&&G.car.tm&&G.car.tm!=="priv"){if(diff>=3)rel("t:"+G.car.tm,Math.min(5,Math.round(diff/2)));else if(diff<=-6)rel("t:"+G.car.tm,-2);}
 if(diff>=3)rel("cc",1);
 G.car.spons.forEach(sp=>{sp.sat=clamp(sp.sat+(r.f===1?8:r.f<=5?4:r.dnf?-4:r.f<=n/2?1:-2),0,100);});
 if(rc.oneoff&&myCar(rc).tm)rel("t:"+myCar(rc).tm,r.f<=5?5:r.dnf?-3:1);
 if(r.fl)G.fl.fl=(G.fl.fl||0)+1;
 seatTime(rc.type,.9+s.tier*.06);G.me.hp=clamp(G.me.hp-(rc.kind==="endur"?14:6)*(1.3-G.me.sk.fit/100),10,100);
 // rival tracking: who beat you most
 const ahead=res.filter(x=>x.f<r.f&&x.d!=="me").slice(-1)[0];if(ahead&&r.f<=4&&ahead.f===r.f-1&&G.D[ahead.d]){G.fl.lastRival=ahead.d;rel("d:"+ahead.d,-1);}
 checkAch();save();resultsScreen();}
function resultsScreen(){const rc=G.rc;if(!rc||!rc.res)return hub();const s=SER[rc.sid];const res=rc.res;const r=res.find(x=>x.d==="me");const st=G.S[rc.sid];
 let head="";if(r){head=r.f===1?`<p class="gold big">🏆 <b>YOU WIN ${rc.crown?"THE "+esc(rc.ev.toUpperCase()):""}!</b></p><p>${winLine(rc)}</p>`:r.dnf?`<p class="r big">DNF: ${esc(r.dnf)}. Classified ${ordinal(r.f)}.</p>`:`<p class="big">You finish <b>${ordinal(r.f)}</b>${r.st?` (started ${ordinal(r.st)})`:""}.</p>`;
  head+=`<p>${r.led?`Led ${r.led} laps. `:""}${r.fl?"Fastest lap. ":""}${!rc.oneoff&&!s.oneoff?`+${r.pts} points.`:""}</p>`;}
 const rows=res.slice(0,10).map(x=>({cells:[x.f,(x.d==="me"?`<b>${esc(G.me.name)}</b>`:esc(nm(x.d))),esc(x.tmn||tn(x.tm)),x.st||"-",x.dnf?`<span class="r">${esc(x.dnf)}</span>`:(x.led?x.led+" led":"")+(x.fl?" FL":"")],hl:x.d==="me"}));
 if(r&&r.f>10)rows.push({cells:[r.f,`<b>${esc(G.me.name)}</b>`,esc(r.tmn||tn(r.tm)),r.st||"-",r.dnf||""],hl:true});
 let stand="";if(!s.oneoff){const sr=standings(rc.sid);const top=sr.slice(0,10);const mi=sr.findIndex(x=>x.id==="me");
  const srows=top.map((x,i)=>({cells:[i+1,x.id==="me"?`<b>${esc(G.me.name)}</b>`:esc(nm(x.id)),x.p,x.w,x.t5],hl:x.id==="me"}));if(mi>=10)srows.push({cells:[mi+1,`<b>${esc(G.me.name)}</b>`,sr[mi].p,sr[mi].w,sr[mi].t5],hl:true});
  stand=`<h3>${esc(s.sh)} standings${st.chase?" (Chase)":""} after round ${st.res.length}</h3>${table(["Pos","Driver","Pts","W","T5"],srows)}`;}
 show(`<div class="eyebrow">RESULTS · ${esc(rc.ev.toUpperCase())}</div>${head}${efxHtml()}${table(["Pos","Driver","Team","Start",""],rows)}${stand}`,[
  {t:"Continue",cls:"hi",f:afterRace},{t:"Full results",f:()=>fullResults(afterRace)}]);}
function winLine(rc){const k=rc.kind;return esc(R.pick(k==="ss"?["You dodge the chaos and win the drag race to the line!","A perfect push from behind and you're in Victory Lane."]:k==="dirt"?["You slide the leader with two to go and never look back.","Wire to wire on a slick track. A clinic."]:k==="open"?["Lights to flag. Champagne time.","The undercut works perfectly and you take the win."]:k==="kart"?["Bumper to bumper for the whole final, and you take it at the line.","You hold the inside line and the win is yours."]:k==="endur"?["Hours of racing, decided by a perfect final stint.","You take the checkered flag after an endurance epic."]:["Burnouts on the frontstretch!","You hold off the field on the last restart and win it!"]));}
function fullResults(back){const rc=G.rc;show(`<h2>Full results</h2>${table(["Pos","Driver","Team","#","St","Note"],rc.res.map(x=>({cells:[x.f,x.d==="me"?`<b>${esc(G.me.name)}</b>`:esc(nm(x.d)),esc(x.tmn||tn(x.tm)),esc(String(x.num||"")),x.st||"-",x.dnf?esc(x.dnf):x.led?x.led+" led":""],hl:x.d==="me"})))}`,[{t:"Back",cls:"hi",f:resultsScreen}]);}
function afterRace(){const rc=G.rc;if(rc)rc.phase="done";G.rc=null;G.fl.raced=1;
 if((myEvent()||myOneoff())&&canDrive()){save();return hub();}
 endWeekCore();continuePending();}
/* ---------- drag racing ---------- */
function dragStart(){const rc=G.rc;const me=myCar(rc);rc.drag={stage:"q",round:0,bracket:null,out:[]};dragCard();}
function dragCard(){const rc=G.rc;const D=rc.drag;const me=myCar(rc);
 if(D.stage==="q")return show(`<h2>Qualifying passes</h2><p>The top 16 make the elimination ladder. Your tune decides how hard the car leans on the track.</p>`,[
  {t:"Conservative tune",sub:"Make a clean pass",f:()=>dragQual({agg:0})},{t:"Aggressive tune",sub:"Quicker if it hooks up, smoke if it doesn't",f:()=>dragQual({agg:1})}]);
 if(D.stage==="r"){const opp=D.opp;const names=["Round 1","Quarterfinals","Semifinals","Final"];
  return show(`<h2>${names[D.round]||"Elimination"}</h2><p>You face <b>${esc(nm(opp.d))}</b> (qualified ${ordinal(opp.start)}).</p>`,[
   {t:"Normal leave, safe tune",f:()=>dragRound({agg:0},{})},{t:"Aggressive leave, safe tune",sub:"Better reaction, red-light risk",f:()=>dragRound({agg:0},{agg:1})},{t:"Normal leave, aggressive tune",sub:"Smoke risk",f:()=>dragRound({agg:1},{})},{t:"Cut a light (deep stage)",sub:"Slower reaction, almost no red light",f:()=>dragRound({agg:0},{safe:1})}]);}
 finishDrag();}
function dragQual(tune){const rc=G.rc;const D=rc.drag;rc.cars.forEach(c=>{c.qet=dragET(c,rc,c.d==="me"?tune:null);});const q=rc.cars.slice().sort((a,b)=>a.qet-b.qet);q.forEach((c,i)=>c.start=i+1);const me=myCar(rc);
 const BK=dragBracket(q.length);D.field=q.slice(0,BK).map(c=>c.d);D.qorder=q.map(c=>c.d);D.out=[];
 if(me.start>BK){D.stage="done";D.dnq=1;return show(`<h2>DNQ</h2><p>Your best pass of ${me.qet.toFixed(3)} seconds is only good for ${ordinal(me.start)}. You miss the show.</p>`,[{t:"Continue",cls:"hi",f:finishDrag}]);}
 D.stage="r";D.round=0;D.alive=D.field.slice();dragPair();show(`<h2>Qualified ${ordinal(me.start)}</h2><p>Best pass: ${me.qet.toFixed(3)} seconds${me.smoke?" (it smoked the tires on the other run)":""}.</p>`,[{t:"To eliminations",cls:"hi",f:dragCard}]);}
function dragPair(){const rc=G.rc,D=rc.drag;const al=D.alive;const i=al.indexOf("me");const j=al.length-1-i;D.opp=rc.cars.find(c=>c.d===al[j]);}
function dragRound(tune,launch){const rc=G.rc,D=rc.drag;const al=D.alive;const next=[];let mine="";
 for(let i=0;i<al.length/2;i++){const a=rc.cars.find(c=>c.d===al[i]),b=rc.cars.find(c=>c.d===al[al.length-1-i]);const w=dragDuel(a,b,(a.d==="me"||b.d==="me")?tune:null,(a.d==="me"||b.d==="me")?launch:null);next.push(w.d);D.out.unshift(w===a?b.d:a.d);
  if(a.d==="me"||b.d==="me"){const me=a.d==="me"?a:b,op=a.d==="me"?b:a;mine=`<p>Reaction ${me.last.rt<0?"<b class='r'>RED LIGHT</b>":me.last.rt.toFixed(3)} · ${me.last.sm?"tires smoked, ":""}${me.last.et.toFixed(3)} s vs ${esc(nm(op.d))}: ${op.last.rt<0?"red light":op.last.rt.toFixed(3)} · ${op.last.et.toFixed(3)} s</p>`+(w===me?`<p class="g"><b>You win the round!</b></p>`:`<p class="r"><b>You lose the round.</b></p>`);}}
 // keep order seeded
 D.alive=al.filter(id=>next.indexOf(id)>=0);D.round++;
 if(D.alive.indexOf("me")<0||D.alive.length===1){while(D.alive.length>1){const nx=[];const a2=D.alive;for(let i=0;i<a2.length/2;i++){const a=rc.cars.find(c=>c.d===a2[i]),b=rc.cars.find(c=>c.d===a2[a2.length-1-i]);const w=dragDuel(a,b,null,null);nx.push(w.d);D.out.unshift(w===a?b.d:a.d);}D.alive=a2.filter(id=>nx.indexOf(id)>=0);}D.stage="done";return show(`<h2>Eliminations</h2>${mine}`,[{t:"Results",cls:"hi",f:finishDrag}]);}
 dragPair();show(`<h2>Eliminations</h2>${mine}`,[{t:"Next round",cls:"hi",f:dragCard}]);}
function finishDrag(){const rc=G.rc,D=rc.drag;let order;if(D.dnq)order=D.qorder.slice();else{order=[D.alive[0]].concat(D.out);const rest=D.qorder.filter(id=>order.indexOf(id)<0);order=order.concat(rest);}
 const res=order.map((id,i)=>{const c=rc.cars.find(x=>x.d===id);return {d:id,tm:c.tm,num:c.num,st:c.start,f:i+1,dnf:"",led:0,fl:0,ml:0,stg:0,pen:0,tmn:c.tmn};});applyMine(res);}

/* ===================== CAREER: offers, contracts, silly season, one-offs ===================== */
function absWk(){return G.yr*52+G.wk;}
function primarySeasonPerf(){// most relevant recent full-time results
 let best=null;const cur=G.car.s&&!SER[G.car.s].oneoff?G.car.s:null;
 if(cur){const t=G.S[cur].tab.me;if(t&&t.st>=3){const n=Math.max(2,entries(cur).length);best={s:cur,pos:champPos(cur,"me"),n,w:t.w,st:t.st,t5:t.t5,ch:G.S[cur].done&&champPos(cur,"me")===1};}}
 if(!best){const ss=G.st.seasons.filter(x=>!x.oo&&x.yr>=G.yr-2).sort((a,b)=>b.yr-a.yr);if(ss[0]){const x=ss[0];best={s:x.s,pos:x.pos||Math.round(SER[x.s].field/2),n:SER[x.s].field,w:x.w,st:x.st,t5:x.t5,ch:x.ch};}}
 return best;}
function myStock(sid){const s=SER[sid];const m=G.me;let v=OVR(s.disc);const p=primarySeasonPerf();
 if(p){const pct=p.n>1?1-(p.pos-1)/(p.n-1):.5;let b=(pct-.5)*16+Math.min(p.w,6)*1.2+(p.ch?5:0)+Math.min(p.t5,10)*.2;const gap=s.tier-SER[p.s].tier;if(gap>2){b*=.5;b-=(gap-2)*3.5;}else if(gap<=0)b*=1.15;
  if(SER[p.s].disc!==s.disc)b*=.7;v+=b;}else v-=4;
 v+=(m.rep-30)*.12+(m.sk.med-50)*.04;if(m.age<=21&&s.tier<=8)v+=2;if(m.age>=34)v-=(m.age-33)*1.2;
 if(G.car.dev&&G.car.dev.org&&G.TM[G.car.dev.org]&&G.TM[G.car.dev.org].s===sid)v+=3;
 return v;}
function teamNeed(t){const s=SER[t.s];return s.lvl-4+(t.q-s.ql)*.6;}
function licenseBlock(sid){const s=SER[sid];if(G.me.age<s.age)return `Minimum age ${s.age}`;if(s.maxAge&&G.me.age>s.maxAge)return `Age limit ${s.maxAge}`;
 if(s.lic==="slp"&&slpTotal()<40)return `Superlicense needs 40 points over three seasons (you have ${slpTotal()})`;return "";}
function salFor(s,frac){if(!s.sal[1])return 0;return Math.round((s.sal[0]+(s.sal[1]-s.sal[0])*Math.pow(clamp(frac,0,1),2.2))/1000)*1000;}
function startYrFor(){if(!G.car.s||!G.car.con)return G.wk<40?G.yr:G.yr+1;if(G.car.con.end>G.yr)return G.car.con.end+1>G.yr+1?G.yr+1:G.yr+1;return G.wk>=8||seasonOver()?G.yr+1:G.yr;}
function mkOffer(t,role,o){const s=SER[t.s];const st=myStock(t.s);const need=teamNeed(t);const marg=st-need;const frac=marg/15+(t.q-s.ql)/30+.2;
 const off=Object.assign({id:"o"+(G.nid++),tm:t.id,s:t.s,role,yrs:s.tier>=8?R.int(1,3):R.int(1,2),sal:role==="race"?salFor(s,frac):Math.round(s.sal[0]*.15/1000)*1000,win:s.tier>=5?Math.round(s.sal[0]*.04/1000)*1000:0,spon:R.int(1,3),rel:0,n1:false,side:s.tier<9,pay:0,start:startYrFor(),int:clamp(Math.round(55+marg*3+relOf("t:"+t.id)/4+(G.me.agent?8:0)),20,95),asks:0,exp:absWk()+R.int(3,6)},o||{});
 if(off.start>G.yr&&G.wk<44)off.exp=Math.max(off.exp,absWk()+R.int(4,8));return off;}
function generateOffers(kind){const m=G.me;if(m.retired)return 0;const cur=G.car.s;const out=[];
 const targets=new Set();if(cur&&!SER[cur].oneoff){targets.add(cur);(NEXT[cur]||[]).forEach(x=>targets.add(x));}
 else{const p=primarySeasonPerf();const base=p?p.s:lastSeries();targets.add(base);(NEXT[base]||[]).forEach(x=>targets.add(x));}
 // occasional cross-discipline interest at a similar level
 const tierNow=cur?SER[cur].tier:3;SERIES_LIST.forEach(s=>{if(!s.oneoff&&!targets.has(s.id)&&Math.abs(s.tier-tierNow)<=1&&R.chance(.12))targets.add(s.id);});
 [...targets].forEach(sid=>{const s=SER[sid];if(s.oneoff||licenseBlock(sid)&&!/Superlicense/.test(licenseBlock(sid)))return;
  const st=myStock(sid);teamsOf(sid).filter(t=>!t.priv&&!t.own&&t.id!==G.car.tm).forEach(t=>{if(isPriv(sid)&&s.tier<=2)return;
   const need=teamNeed(t);const roll=st+R.gauss()*2.5+(kind==="mid"?-2:0)+(G.me.agent?1.5:0);
   const weak=t.cars.some(c=>!c.d||(G.D[c.d]&&(G.D[c.d].cy<=1||G.D[c.d].o<st-2)));
   if(roll>=need&&weak&&R.chance(s.tier>=9?.35:.45))out.push(mkOffer(t,"race"));
   else if(s.cost>0&&roll>=s.lvl-13&&t.q<=s.ql+2&&R.chance(.18)&&kind!=="mid"){const pay=Math.round(s.cost*clamp(.65+(need-roll)/30,.5,1.3)/1000)*1000;out.push(mkOffer(t,"race",{pay,sal:0,win:0,int:60}));}
   else if(s.tier>=8&&roll>=need-7&&R.chance(.08)&&kind!=="mid"&&["f1","fe","wec","indycar","imsagtp","cup"].indexOf(sid)>=0){out.push(mkOffer(t,sid==="cup"?"dev":"reserve",{yrs:1,n1:false,side:true}));}});});
 // current team re-sign
 if(cur&&G.car.tm&&G.car.tm!=="priv"&&G.car.con&&G.car.con.end===G.yr&&!G.car.next&&kind!=="mid"){const t=G.TM[G.car.tm];if(t&&!t.own&&relOf("t:"+t.id)>-25&&myStock(cur)>=teamNeed(t)-5)out.push(mkOffer(t,"race",{note:"Your current team wants to keep you.",int:70}));}
 // dedupe by team, keep best few
 const by={};out.forEach(o=>{if(!by[o.tm]||by[o.tm].role!=="race")by[o.tm]=o;});let list=Object.values(by).sort((a,b)=>SER[b.s].tier-SER[a.s].tier||b.sal-a.sal);
 list=list.slice(0,kind==="mid"?2:5);list.forEach(o=>{if(!G.offers.some(x=>x.tm===o.tm&&x.s===o.s))G.offers.push(o);});
 if(list.length){G.notes.push(`📄 ${list.length} new contract offer${list.length>1?"s":""}: ${list.map(o=>esc(tn(o.tm))+" ("+esc(SER[o.s].sh)+")").join(", ")}.`);}
 return list.length;}
/* ---------- signing ---------- */
function signContract(con){const s=SER[con.s];con.end=con.end||((con.start||G.yr)+con.yrs-1);con.start=con.start||G.yr;
 if(con.pay&&con.start===G.yr){spend(con.pay,"Ride payment");con.payYr=G.yr;}
 G.offers=G.offers.filter(o=>o.tm!==con.tm);
 if(con.start>G.yr){G.car.next=con;addNews(`${G.me.name} signs with ${tn(con.tm)} for the ${con.start} ${SER[con.s].sh} season.`,true);return;}
 applyContract(con);}
function removeMe(){for(const id in G.TM){const t=G.TM[id];t.cars.forEach(c=>{if(c.d==="me")c.d=null;});if(t.priv&&t.cars.every(c=>!c.d))t.cars=[];}}
function ensureSlot(tid){const t=G.TM[tid];if(!t)return null;let slot=t.cars.find(c=>!c.d);if(slot)return slot;if(!t.cars.length){const c={num:G.me.num,d:null};t.cars.push(c);return c;}
 const cand=t.cars.filter(c=>c.d!=="me").sort((a,b)=>(G.D[a.d]?G.D[a.d].o:0)-(G.D[b.d]?G.D[b.d].o:0))[0];if(!cand)return null;const out=cand.d;freeDriver(out);if(G.D[out]){G.D[out].cy=0;if(SER[t.s].tier>=6)addNews(`${nm(out)} is out at ${tn(tid)} to make room for ${G.me.name}.`);}return t.cars.find(c=>!c.d);}
function applyContract(con){const t=G.TM[con.tm];if(!t)return;removeMe();const s=SER[con.s];G.car.con=con;G.car.s=con.s;G.car.tm=con.tm;G.car.role=con.role||"race";G.me.disc=s.disc;
 if(G.car.role==="race"){const slot=ensureSlot(con.tm);if(slot){slot.d="me";if(t.priv||t.own)slot.num=G.me.num;}}
 if(G.car.role==="dev"){G.car.dev={org:con.tm,end:con.end,pay:con.sal};// a feeder ride with an affiliated team
  const feeder=s.id==="cup"?"oap":"truck";const ft=teamsOf(feeder).filter(x=>x.r&&!x.own).sort((a,b)=>b.q-a.q)[R.int(2,6)]||teamsOf(feeder)[0];
  const c2={tm:ft.id,s:feeder,role:"race",yrs:con.yrs,start:con.start,end:con.end,sal:Math.round(SER[feeder].sal[0]*1.2),win:Math.round(SER[feeder].sal[0]*.05),spon:2,rel:0,n1:false,side:true,pay:0};G.car.con=c2;G.car.s=feeder;G.car.tm=ft.id;G.car.role="race";G.me.disc="stock";const sl=ensureSlot(ft.id);if(sl)sl.d="me";
  G.notes.push(`🤝 Development deal: ${esc(tn(con.tm))} places you in a ${esc(SER[feeder].sh)} ride with ${esc(tn(ft.id))}.`);}
 G.car.cc=genStaff(con.tm+G.yr);delete G.rel.cc;G.car.co=[];
 if(SER[G.car.s].endur){const n=SER[G.car.s].tier>=8?2:1;for(let i=0;i<n;i++)G.car.co.push({n:genName(R.pick(NAT_MIX.intl)),r:clamp(SER[G.car.s].lvl+R.gauss()*3,40,92)});}
 rel("t:"+G.car.tm,3);addNews(G.car.role==="reserve"?`${G.me.name} joins ${tn(G.car.tm)} as reserve and test driver.`:`${G.me.name} will drive for ${tn(G.car.tm)} in ${SER[G.car.s].sh}.`,true);}
function expireContract(){removeMe();const was=G.car.s;G.car.con=null;G.car.s=null;G.car.tm=null;G.car.role=null;if(was)G.notes.push(`📄 Your contract has ended. You're a free agent. Check Contracts & offers.`);}
/* ---------- offers screen ---------- */
function offersScreen(){const c=G.car,m=G.me;const now=absWk();G.offers=G.offers.filter(o=>o.exp>=now&&G.TM[o.tm]);
 let cur="";if(c.con){const t=G.TM[c.tm];cur=`<h3>Current deal</h3>${table(["",""],[["Series",esc(SER[c.s].n)],["Team",esc(tn(c.tm))+(c.role==="reserve"?" (reserve/test)":"")],["Through",c.con.end],["Salary",c.con.sal?money(c.con.sal)+"/yr":"-"],["Paying",c.con.pay?money(c.con.pay)+"/yr":"-"],["Win bonus",c.con.win?money(c.con.win):"-"],["Release clause",c.con.rel?money(c.con.rel):"none"],["#1 driver",c.con.n1?"yes":"no"],["Other series allowed",c.con.side?"yes":"no"]])}`;}
 if(c.next)cur+=note(`Signed for ${c.next.start}: ${esc(SER[c.next.s].sh)} with ${esc(tn(c.next.tm))} (${c.next.yrs} yr${c.next.yrs>1?"s":""}${c.next.sal?", "+money(c.next.sal)+"/yr":""}${c.next.pay?", paying "+money(c.next.pay)+"/yr":""}).`,"good");
 const ch=[];if(G.offers.length){ch.push({sec:"OFFERS"});G.offers.forEach(o=>{const s=SER[o.s];const lb=licenseBlock(o.s);ch.push({t:`<b>${esc(tn(o.tm))}</b> · ${esc(s.sh)}${o.role!=="race"?` (${o.role==="reserve"?"reserve/test driver":"development deal"})`:""}`,sub:`${o.pay?"Pay "+money(o.pay)+"/yr":o.sal?money(o.sal)+"/yr":"No salary"} · ${o.yrs} yr · car ${Math.round(G.TM[o.tm].q)} · from ${o.start}${lb?" · ⚠️ "+lb:""}${o.note?" · "+o.note:""}`,f:()=>negotiate(o)});});}
 else ch.push({sec:"NO OFFERS RIGHT NOW"});
 ch.push({sec:"OPTIONS"});
 const lastAsk=G.fl.askWk||0;ch.push({t:m.agent?"Have your agent shop you around":"Make calls looking for a ride",sub:now-lastAsk<4?"You asked recently; give it a few weeks":"Teams with openings may respond",dis:(now-lastAsk<4)&&"Wait a few weeks",f:()=>{G.fl.askWk=now;const n=generateOffers("fa");show(n?`<p>Your phone rings. ${n} team${n>1?"s are":" is"} interested.</p>`:`<p>Nobody bites right now. Better results, a higher rating or more sponsor money would help.</p>`,[{t:"Back",cls:"hi",f:offersScreen}]);}});
 ch.push({t:"Buy a ride",sub:"Bring money, get a seat. Pay-to-drive deals in most series",f:buyRideMenu});
 ch.push({t:"Run your own car",sub:"Privateer program in a grassroots series. Always available",f:ownCarMenu});
 if(c.con&&c.con.end===G.yr&&c.tm&&c.tm!=="priv"&&!c.next&&!G.offers.some(o=>o.tm===c.tm))ch.push({t:"Talk extension with your current team",sub:`Relationship ${Math.round(relOf("t:"+c.tm))}`,f:()=>{const t=G.TM[c.tm];if(myStock(c.s)>=teamNeed(t)-6&&relOf("t:"+c.tm)>-20){const o=mkOffer(t,c.role||"race",{note:"Extension",start:G.yr+1});G.offers.push(o);negotiate(o);}else show(`<p>${esc(towner(c.tm))} says they're "exploring options." That's not good.</p>`,[{t:"Back",f:offersScreen}]);}});
 ch.push(m.agent?{t:`Fire your agent (${esc(m.agent.n)})`,sub:`Fee: ${Math.round(m.agent.fee*100)}% of salary`,f:()=>{m.agent=null;offersScreen();}}:{t:"Hire an agent",sub:"10% of your salary. More offers, better deals",f:()=>{m.agent={n:genName("USA"),fee:.1};show(`<p><b>${esc(m.agent.n)}</b> is now your agent. "Let me make some calls."</p>`,[{t:"Back",cls:"hi",f:offersScreen}]);}});
 ch.push({t:"Back",cls:"hi",f:hub});show(`<h2>Contracts &amp; offers</h2>${cur}<p>Market value in your series: <b>${c.s?Math.round(myStock(c.s)):Math.round(myStock(lastSeries()))}</b> (teams compare it against their standards).</p>`,ch);}
function termsTable(o){const s=SER[o.s];return table(["Term","Offer"],[["Team",`${esc(tn(o.tm))}${G.TM[o.tm].mfr?" ("+esc(G.TM[o.tm].mfr)+")":""}`],["Series",esc(s.n)],["Role",o.role==="race"?"Full-time race seat":o.role==="reserve"?"Reserve & test driver":"Development deal (feeder series ride)"],["Car rating",Math.round(G.TM[o.tm].q)+` (series avg ${s.ql})`],["Years",`${o.yrs} (${o.start}-${o.start+o.yrs-1})`],[o.pay?"You pay":"Salary",o.pay?money(o.pay)+" per season":o.sal?money(o.sal)+" per season":"none"],["Win bonus",o.win?money(o.win):"-"],["Sponsor duties",["light","normal","heavy"][o.spon-1]||"normal"],["Release clause",o.rel?money(o.rel):"none"],["#1 driver status",o.n1?"yes":"no"],["Race other series",o.side?"allowed":"not allowed"],["Team interest",meter("",o.int)]]);}
function negotiate(o){const lb=licenseBlock(o.s);const buy=buyoutCost(o);const tms=G.TM[o.tm].cars.map(c=>c.d).filter(d=>d&&d!=="me").map(d=>nm(d));
 const ask=(lab,sub,fn)=>({t:lab,sub,dis:o.asks>=4&&"They're done negotiating",f:()=>{o.asks++;const p=clamp(o.int/100+(G.me.agent?.12:0)-o.asks*.08,.05,.95);EFX=[];if(R.chance(p)){fn();o.int=clamp(o.int-6,0,100);negMsg(o,"They agree.","good");}else{o.int=clamp(o.int-12,0,100);if(o.int<25){G.offers=G.offers.filter(x=>x!==o);rel("t:"+o.tm,-3);return show(`<p class="r">${esc(towner(o.tm))} pulls the offer. "We'll go another direction."</p>`,[{t:"Back",cls:"hi",f:offersScreen}]);}negMsg(o,"They refuse. Interest drops.","bad");}}});
 const ch=[{t:"<b>Accept and sign</b>",sub:lb?lb:o.pay&&G.me.cash+sponsorCash()<o.pay*.8?`You need about ${money(o.pay)} (you have ${money(G.me.cash)})`:buy?`Buying out your current deal costs ${money(buy)}`:"",cls:"hi",dis:lb||(o.pay&&G.me.cash+sponsorCash()<o.pay*.8&&"Not enough money"),f:()=>{EFX=[];if(buy){spend(buy,"Contract buyout");rel("t:"+G.car.tm,-10);}const con=Object.assign({},o);delete con.int;delete con.asks;delete con.exp;signContract(con);checkAch();save();show(`<h2>Signed!</h2><p>${o.start>G.yr?`From ${o.start}, you'll`:"You'll"} ${o.role==="reserve"?"be the reserve and test driver for":"drive for"} <b>${esc(tn(o.tm))}</b> in ${esc(SER[o.s].n)}.</p>${efxHtml()}`,[{t:"Back to the dashboard",cls:"hi",f:hub}]);}},
  o.pay?ask("Negotiate the price down","-15% on the payment",()=>{o.pay=Math.round(o.pay*.85/1000)*1000;}):o.sal?ask("Ask for more money","+15% salary",()=>{o.sal=Math.round(o.sal*1.15/1000)*1000;}):null,
  ask(o.yrs<3?"Ask for another year":"Ask for a shorter deal",o.yrs<3?"More security":"More freedom",()=>{o.yrs=o.yrs<3?o.yrs+1:o.yrs-1;}),
  !o.win&&SER[o.s].tier>=4?ask("Ask for a win bonus","",()=>{o.win=Math.max(5000,Math.round((o.sal||SER[o.s].sal[1]*.05)*.05/1000)*1000);}):null,
  !o.n1&&tms.length?ask("Demand #1 driver status",`Priority over ${tms.map(esc).join(", ")}`,()=>{o.n1=true;o.int-=8;}):null,
  !o.rel&&o.yrs>1?ask("Ask for a performance release clause","Lets you leave early for a fixed fee",()=>{o.rel=Math.round(Math.max(50000,(o.sal||100000)*.5)/1000)*1000;}):null,
  !o.side?ask("Ask to race other series","Dirt races, one-offs, Le Mans",()=>{o.side=true;}):null,
  o.spon>1?ask("Reduce sponsor obligations","Fewer appearances",()=>{o.spon--;}):null,
  G.offers.length>1?{t:"Use another offer as leverage",sub:"Could raise interest or annoy them",dis:o.lev&&"Already tried",f:()=>{o.lev=1;EFX=[];if(R.chance(.55)){o.int=clamp(o.int+12,0,100);if(o.sal)o.sal=Math.round(o.sal*1.1/1000)*1000;negMsg(o,"They don't want to lose you. Salary +10%.","good");}else{o.int-=10;rel("t:"+o.tm,-2);negMsg(o,"\"Then go sign there.\" Interest drops.","bad");}}}:null,
  {t:"Leak the talks to the media",sub:"Raises your profile; your current team won't love it",dis:o.leak&&"Already leaked",f:()=>{o.leak=1;EFX=[];fame(1);o.int=clamp(o.int+6,0,100);if(G.car.tm&&G.car.tm!==o.tm&&G.car.tm!=="priv")rel("t:"+G.car.tm,-5);G.rumors.push({me:1,tm:o.tm,yr:G.yr});addNews(`Rumor: ${G.me.name} in talks with ${tn(o.tm)} (${SER[o.s].sh}).`,true);negMsg(o,"The story is everywhere by morning.","good");}},
  {t:"Decline",f:()=>{G.offers=G.offers.filter(x=>x!==o);offersScreen();}},{t:"Back",f:offersScreen}];
 show(`<h2>Negotiation</h2>${o.note?`<p>${esc(o.note)}</p>`:""}<p>${esc(towner(o.tm))} of ${esc(tn(o.tm))} wants you${tms.length?`. Teammates: ${tms.map(esc).join(", ")}`:""}.</p>${termsTable(o)}${efxHtml()}`,ch);}
function negMsg(o,t,k){show(`<p class="${k==="good"?"g":"r"}">${t}</p>${termsTable(o)}${efxHtml()}`,[{t:"Keep negotiating",cls:"hi",f:()=>negotiate(o)}]);}
function buyoutCost(o){const c=G.car.con;if(!c||c.priv||o.start>c.end)return 0;if(G.car.tm===o.tm)return 0;if(c.rel)return c.rel;const left=c.end-G.yr+(G.wk<40?1:0);return Math.max(0,Math.round((c.sal||100000)*.5*Math.max(1,left)/1000)*1000);}
function sponsorCash(){return sum(G.car.spons.map(s=>s.amt));}
function buyRideMenu(){const m=G.me;const ch=[];const opts=SERIES_LIST.filter(s=>!s.oneoff&&s.cost>0&&!isPriv(s.id)&&!licenseBlock(s.id)&&myStock(s.id)>=s.lvl-14).sort((a,b)=>a.tier-b.tier);
 opts.forEach(s=>{const tms=teamsOf(s.id).filter(t=>!t.own&&!t.priv).sort((a,b)=>a.q-b.q);const t=tms[Math.floor(tms.length*.35)];if(!t)return;const cost=Math.round(s.cost*(myStock(s.id)<s.lvl-6?1.15:1)/1000)*1000;
  ch.push({t:`${esc(s.n)}`,sub:`${esc(tn(t.id))} (car ${Math.round(t.q)}) · ${money(cost)} per season`,dis:m.cash+sponsorCash()<cost*.8&&`You need about ${money(cost)}`,f:()=>{const o=mkOffer(t,"race",{pay:cost,sal:0,win:0,yrs:1,int:60,start:(G.car.s&&!seasonOver())||G.wk>=40?G.yr+1:G.yr});G.offers.push(o);negotiate(o);}});});
 show(`<h2>Buy a ride</h2><p>Pay-to-drive seats are how most drivers climb the junior ladders. Sponsor money counts toward the bill. Series you can't qualify for (age, superlicense, or a rating far below the field) aren't listed.</p>`,ch.concat([{t:"Back",cls:"hi",f:offersScreen}]));}
function ownCarMenu(){const ch=[];SERIES_LIST.filter(s=>isPriv(s.id)&&!s.oneoff&&!licenseBlock(s.id)).forEach(s=>{const per=startCost(s.id);ch.push({t:esc(s.n),sub:`About ${money(per)} per race (${s.cal.length} races). ${esc(s.desc)}`,f:()=>{if(G.car.con&&!G.car.con.priv&&G.car.con.end>=G.yr&&!seasonOver()){return show(`<p>You're under contract with ${esc(tn(G.car.tm))}. Running your own car means walking away (buyout ${money(buyoutCost({start:G.yr,tm:"priv"}))}).</p>`,[{t:"Walk away and run my own car",f:()=>{EFX=[];spend(buyoutCost({start:G.yr,tm:"priv"}),"Buyout");rel("t:"+G.car.tm,-12);startPriv(s.id);}},{t:"Back",cls:"hi",f:ownCarMenu}]);}startPriv(s.id);}});});
 show(`<h2>Run your own car</h2><p>Buy or build a car, tow it to the track, pay for tires and entry fees. Prize money helps. This is always possible, so you are never without a place to race.</p>`,ch.concat([{t:"Back",cls:"hi",f:offersScreen}]));}
function startPriv(sid){EFX=[];removeMe();G.car.next=null;joinPrivOrPay(sid,false);G.me.disc=SER[sid].disc;const c=G.car.con;c.end=G.yr+(seasonOver(sid)?1:0);c.start=G.yr;
 const st=G.S[sid];addNews(`${G.me.name} will run a self-funded car in ${SER[sid].n}.`,true);save();show(`<h2>Your own program</h2><p>You're running your own car in <b>${esc(SER[sid].n)}</b>. ${st.ci>=SER[sid].cal.length?"The season is over, so your first race is next year.":""}</p>${efxHtml()}`,[{t:"Back to the dashboard",cls:"hi",f:hub}]);}
/* ---------- weekly silly-season ticks ---------- */
function sillyTicks(){const c=G.car,m=G.me;if(m.retired)return;
 if(G.wk>=26&&G.wk<=40&&!G.fl.midOffers&&R.chance(.12)){const tier=c.s?SER[c.s].tier:0;const p=primarySeasonPerf();if(p&&p.n>1&&(p.pos-1)/(p.n-1)<.3){G.fl.midOffers=1;generateOffers("mid");}}
 if(!G.fl.eosOffers&&(G.wk>=44||(c.s&&seasonOver()&&G.wk>=30))&&(!c.con||c.con.end<=G.yr||c.con.priv||myStock(c.s)>teamNeed(G.TM[c.tm]||{s:c.s,q:60})+6)){G.fl.eosOffers=1;generateOffers("eos");}
 if(!c.s&&G.wk%4===0)generateOffers("fa");
 if(c.s&&c.tm==="priv"&&seasonOver()&&G.wk>=30&&!G.fl.cross&&!G.fl.nextPriv&&!c.next){G.fl.cross=1;queuePending("crossroads",{});}
 if(G.wk>=18&&G.wk<=44&&R.chance(.3))midRumor();
 if(G.wk===50&&!G.fl.sillyDone){G.fl.sillyDone=1;processSillySeason();}}
function midRumor(){const ser=["cup","f1","indycar","oap","wec","imsagtp","fe","supercars","woo"];const sid=R.pick(ser);const ds=entries(sid).map(e=>e.d).filter(d=>d!=="me"&&G.D[d]&&G.D[d].cy<=1);if(!ds.length)return;const d=R.pick(ds);
 const tms=teamsOf(sid).filter(t=>t.id!==G.D[d].tm&&!t.own&&t.q>=G.TM[G.D[d].tm].q-8);if(!tms.length)return;const t=R.pick(tms);G.rumors.push({d,tm:t.id,yr:G.yr});if(G.rumors.length>40)G.rumors.shift();
 addNews(R.pick([`Silly season: ${nm(d)} linked with ${tn(t.id)} for ${G.yr+1}.`,`Paddock rumor: ${tn(t.id)} has held talks with ${nm(d)}.`,`${nm(d)}'s contract is up after ${G.yr}; ${tn(t.id)} is said to be interested.`]));}
/* ---------- AI silly season ---------- */
function processSillySeason(){const moves=[];if(G.car.next)ensureSlot(G.car.next.tm);
 const pct=d=>{const s=d.s;if(!s)return .5;const p=champPos(s,d.id);const n=Math.max(2,entries(s).length);return p?1-(p-1)/(n-1):.3;};
 // retirements & contract decisions
 Object.values(G.D).forEach(d=>{if(d.ret)return;const a=G.yr-d.by;
  let rp=a<36?0:(a-35)*.07;if(d.s&&SER[d.s].tier<=4)rp*=.6;if(!d.tm&&a>30)rp+=.15;
  if(R.chance(rp)){const was=d.s,tm=d.tm;if(tm)freeDriver(d.id);d.ret=G.yr;if(d.r||(was&&SER[was].tier>=7))moves.push(`${d.n} announces retirement${tm?` after the season with ${G.TM[tm].n}`:""}.`);return;}
  if(!d.tm)return;const t=G.TM[d.tm];if(!t||t.own||t.priv)return;d.cy--;
  const s=SER[d.s];const pc=pct(d);
  if(a<=24&&s.tier<9&&pc>=.8&&(NEXT[d.s]||[]).length&&R.chance(.6)){d.promo=1;freeDriver(d.id);return;}
  if(d.cy<=0){let keep=.6+(pc-.5)*.7+(d.r?.12:0)+(s.tier>=8?.08:0)-(a>36?.2:0)-(d.o<s.lvl-6?.2:0);if(G.rumors.some(r=>r.d===d.id&&r.yr===G.yr))keep-=.25;
   if(R.chance(keep))d.cy=R.int(1,3);else{d.lastTm=d.tm;freeDriver(d.id);}}});
 // team changes
 Object.values(G.TM).forEach(t=>{if(t.priv||t.own)return;const s=SER[t.s];t.q=clamp(r1(t.q+R.gauss()*2.2+(s.ql-t.q)*.08),20,98);
  if(s.mfr&&s.mfr.length>1&&R.chance(.03)){const nw=R.pick(s.mfr.filter(x=>x!==t.mfr));if(nw){t.mfr=nw;if(s.tier>=7)moves.push(`${t.r?t.n:tn(t.id)} will switch to ${nw} for ${G.yr+1}.`);}}});
 // fill vacancies from the top down
 const resv=G.car.next?G.car.next.tm:null;
 SERIES_LIST.filter(s=>!s.oneoff).sort((a,b)=>b.tier-a.tier).forEach(s=>{teamsOf(s.id).forEach(t=>{if(t.priv||t.own)return;let skip=t.id===resv?1:0;
  t.cars.forEach(c=>{if(c.d)return;if(skip){skip--;return;}const d=pickRecruit(s,t);if(d.tm)freeDriver(d.id);c.d=d.id;d.s=s.id;d.tm=t.id;d.num=c.num;d.cy=R.int(1,3);delete d.promo;
   if((d.r||s.tier>=9)&&(s.tier>=7||d.r)&&d.lastTm!==t.id)moves.push(`${nm(d.id)} will drive the #${c.num} for ${tn(t.id)} in ${s.sh} next season.`);});});});
 // unsigned old free agents fade away
 Object.values(G.D).forEach(d=>{if(!d.ret&&!d.tm&&G.yr-d.by>32&&R.chance(.3))d.ret=G.yr;});
 moves.slice(0,40).forEach(t=>addNews("🔁 "+t));G.lastSilly=moves.slice(0,60);
 G.notes.push(`🔁 Silly season: ${moves.length} driver moves and announcements. See News.`);}
function fitsSeries(d,sid){const ls=d.ls||d.s;if(!ls||ls===sid)return true;const a=SER[ls],b=SER[sid];if(!a)return true;if((NEXT[ls]||[]).indexOf(sid)>=0||(NEXT[sid]||[]).indexOf(ls)>=0)return true;if(a.lad===b.lad&&Math.abs(a.tier-b.tier)<=3)return true;if(!d.r&&a.disc===b.disc&&Math.abs(a.tier-b.tier)<=2)return true;return false;}
function pickRecruit(s,t){const ar=AGE_R[s.id]||[16,40];const lower=SERIES_LIST.filter(x=>(NEXT[x.id]||[]).indexOf(s.id)>=0).map(x=>x.id);
 const pool=Object.values(G.D).filter(d=>!d.ret&&!d.inj&&(!d.tm||d.promo&&lower.indexOf(d.s)>=0)&&(G.yr-d.by)>=Math.max(s.age,ar[0]-1)&&(G.yr-d.by)<=ar[1]+4&&d.o>=s.lvl-9&&(!s.maxAge||G.yr-d.by<=s.maxAge)&&fitsSeries(d,s.id));
 let best=null,bs=-1e9;pool.forEach(d=>{let sc=d.o+R.f(0,4)+(d.promo?3:0)+((G.yr-d.by)<24?2:0)-(d.lastTm===t.id?5:0);if(G.rumors.some(r=>r.d===d.id&&r.tm===t.id))sc+=8;if(s.rp&&d.r)sc+=2;if(NATR[s.id]&&NAT_MIX[NATR[s.id]].indexOf(d.nat)<0)sc-=2;if(sc>bs){bs=sc;best=d;}});
 const need=s.lvl-2+(t.q-s.ql)*.35;if(best&&best.o>=need-(s.tier<=4?6:0))return best;
 // nobody good enough is available: a rookie or an import of the right calibre arrives
 const d=genDriverFor(s.id);d.o=clamp(r1(s.lvl+1.5+(t.q-s.ql)*.3+R.gauss()*4),15,96);const a=G.yr-d.by;d.pot=clamp(Math.round(d.o+Math.max(0,24-a)*R.f(.5,1.6)),d.o,97);return d;}
/* ---------- one-off races ---------- */
const ONEOFFS=[["cup",/Daytona 500/,"The Great American Race. Open cars can race their way in."],["indycar",/Indianapolis 500/,"33 cars, 500 miles, the Greatest Spectacle in Racing."],["cup",/Coca-Cola 600/,"Run Indy and Charlotte on the same day for The Double."],
 ["imsagtd",/Rolex 24/,"24 hours at Daytona in a GT car."],["imsagtp",/Rolex 24/,"24 hours at Daytona in a prototype."],["wecgt",/Le Mans/,"The 24 Hours of Le Mans in LMGT3."],["wec",/Le Mans/,"The 24 Hours of Le Mans in a Hypercar."],["imsagtd",/Sebring/,"Twelve brutal hours on the bumps of Sebring."],
 ["chili",/Chili/,"Thousands of midget racers under one roof in Tulsa every January."],["snowball",/Snowball/,"The biggest Super Late Model race in America, at Five Flags Speedway."],["woo",/Knoxville Nationals/,"The Super Bowl of Sprint Car racing."],["woo",/Kings Royal/,"Eldora's big-money sprint car classic."],["lolmds",/Dream/,"Eldora's Dirt Late Model Dream."],["lolmds",/World 100/,"The World 100 at Eldora: win and you get the globe."],["supercars",/Bathurst/,"Mount Panorama. The Great Race."],["nhra",/U.S. Nationals/,"The Big Go at Indianapolis."],["knat",/SuperNationals/,"Las Vegas karting showdown."],["miata",/Runoffs/,"The SCCA National Championship Runoffs."],["ff",/Festival/,"The Formula Ford Festival at Brands Hatch."],["truck",/Eldora|Bristol/,"A Truck Series one-off."],["oap",/Daytona|Talladega/,"A superspeedway one-off in the O'Reilly Series."],["arca",/Daytona/,"ARCA season opener at Daytona."]];
function oneoffList(){const out=[];const seen={};ONEOFFS.forEach(([sid,re,desc])=>{const s=SER[sid];s.cal.forEach((c,ci)=>{const name=c[2]||evName(sid,ci);if(!re.test(name))return;const k=sid+ci;if(seen[k])return;seen[k]=1;
  const wkOk=c[1]>G.wk||(c[1]===G.wk&&!myEvent());out.push({s:sid,ci,wk:c[1],name,desc,past:!wkOk||(s.oneoff?G.fl["oo_"+sid]===G.yr:G.S[sid].ci>ci)});});});return out.sort((a,b)=>a.wk-b.wk);}
function oneoffReq(o){const s=SER[o.s];const m=G.me;const lb=licenseBlock(o.s);if(lb&&!/Superlicense/.test(lb))return lb;if(G.car.s===o.s&&G.car.role==="race")return "That's your own series";
 if(G.car.con&&!G.car.con.side&&!G.car.con.priv&&G.car.s)return "Your contract doesn't allow other series";if(m.inj)return "You're injured";
 const clash=G.car.s&&G.car.role==="race"&&SER[G.car.s].cal.some((c,ci)=>c[1]===o.wk&&ci>=G.S[G.car.s].ci)&&!(o.s==="indycar"||/Coca-Cola 600/.test(o.name));if(clash)return "Clashes with your own race that week";
 if((G.car.oneoffs||[]).some(x=>SER[x.s].cal[x.ci][1]===o.wk))return "You already have a one-off that week";
 const need=s.lvl-(s.tier>=8?10:14);if(myStock(o.s)<need)return `Teams won't put you in a car yet (need value ${Math.round(need)}, you're ${Math.round(myStock(o.s))})`;return "";}
function oneoffDeal(o){const s=SER[o.s];const st=myStock(o.s);const fameHigh=G.me.fame>=55||st>=s.lvl+2;const pool=s.oneoff?[]:teamsOf(o.s).filter(t=>!t.priv&&!t.own);
 const t=pool.length?R.pick(pool.slice().sort((a,b)=>a.q-b.q).slice(0,Math.max(1,Math.ceil(pool.length*(fameHigh?.8:.4))))):null;
 const cost=fameHigh?0:Math.round((s.cost||60000)*(s.oneoff?1:1.6)/Math.max(4,s.cal.length)/1000)*1000;const fee=fameHigh?Math.round((s.sal[0]||20000)*.05/1000)*1000:0;
 return {s:o.s,ci:o.ci,tm:t?t.id:null,tmn:t?(t.r&&!fic()?"a third entry from "+t.n:tn(t.id)):"Your own car",q:t?t.q-2:s.ql+R.f(-2,4),cost,fee};}
function oneoffScreen(){const list=oneoffList();const ch=list.map(o=>{const req=o.past?"Already run this year":oneoffReq(o);return {t:`${esc(o.name)} <span class="dim">(${esc(SER[o.s].sh)})</span>`,sub:`${wkDate(o.wk)} · ${esc(o.desc)}${req?" · "+req:""}`,dis:req||false,f:()=>{const d=oneoffDeal(o);
   show(`<h2>${esc(o.name)}</h2><p>${esc(o.desc)}</p>${table(["",""],[["Ride",esc(d.tmn)],["Car rating",Math.round(d.q)+` (field ~${SER[o.s].ql})`],[d.cost?"Cost to you":"Appearance fee",d.cost?money(d.cost):money(d.fee)]])}`,[
    {t:"Enter",cls:"hi",dis:d.cost>G.me.cash&&"Not enough cash",f:()=>{EFX=[];if(d.cost)spend(d.cost,"One-off entry");if(d.fee)earn(d.fee,"Appearance fee");G.car.oneoffs.push(d);if(d.tm)rel("t:"+d.tm,2);addNews(`${G.me.name} enters the ${o.name}${d.tm?" with "+tn(d.tm):""}.`,true);save();show(`<p>You're entered in the <b>${esc(o.name)}</b>.</p>${efxHtml()}`,[{t:"Back",cls:"hi",f:oneoffScreen}]);}},{t:"Back",f:oneoffScreen}]);}};});
 const mine=(G.car.oneoffs||[]).filter(x=>!x.done).map(x=>evName(x.s,x.ci));
 show(`<h2>One-off races</h2><p>Crown jewels and big events you can enter outside your main series. Fame and market value get you better rides.</p>${mine.length?note("Entered: "+mine.map(esc).join(", "),"good"):""}`,ch.concat([{t:"Back",cls:"hi",f:hub}]));}
/* ---------- sponsors ---------- */
function newSponsorOffer(){const m=G.me;const tier=G.car.s?SER[G.car.s].tier:1;const big=R.chance(.08+m.fame/300)&&tier>=5;const n=big?R.pick(BIG_SPONSOR_FIC):R.pick(SPONSOR_FIC);
 const base=[0,3000,6000,15000,30000,60000,150000,300000,600000,1200000,2500000][tier]||5000;const amt=Math.round(base*R.f(.5,1.4)*(1+m.fame/100)*(big?2.5:1)/500)*500;return {n,amt,sat:60,lvl:big?2:1,duty:R.int(1,3)};}
function sponsorOfferScreen(sp){show(`<h2>Sponsor interest</h2><p><b>${esc(sp.n)}</b> wants to back you: <b>${money(sp.amt)}</b> per season. ${["Light","Regular","Heavy"][sp.duty-1]} appearance duties.</p>`,[
 {t:"Sign the deal",cls:"hi",f:()=>{G.car.spons.push(sp);rel("sp:"+sp.n,10);addNews(`${sp.n} signs on as a sponsor of ${G.me.name}.`,true);if(sp.duty===3)G.me.mor-=2;checkAch();show(`<p>Welcome aboard, ${esc(sp.n)}. Their logo goes on your car and your firesuit.</p>`,[{t:"Back",cls:"hi",f:G.car.ap>0?activities:hub}]);}},
 {t:"Negotiate for more",f:()=>{if(R.chance(.45+G.me.sk.med/250)){sp.amt=Math.round(sp.amt*1.2/500)*500;sponsorOfferScreen(sp);}else show(`<p>${esc(sp.n)} walks away.</p>`,[{t:"Back",f:hub}]);}},
 {t:"Pass",f:hub}]);}

/* ===================== TEAM OWNERSHIP ===================== */
const OWN_PRICE={f1:900e6,wec:30e6,imsagtp:25e6,fe:45e6,indycar:12e6,cup:15e6,oap:4e6,truck:2e6,arca:6e5,nxt:2e6,f2:6e6,f3:3e6,freca:1.2e6,supercars:8e6,woo:1.2e6,hlr:1.2e6,lolmds:9e5,nhra:4e6,imsagtd:3e6,wecgt:4e6};
const OWN_OP={f1:250e6,wec:60e6,imsagtp:40e6,fe:30e6};
const CHARTER_PRICE=45e6;
function ownPrice(sid){const s=SER[sid];return OWN_PRICE[sid]||Math.max(30000,Math.round(s.cost*1.3/1000)*1000);}
function ownOp(sid){const s=SER[sid];return OWN_OP[sid]||Math.max(15000,Math.round(s.cost*.85));}
function ownOf(tid){return (G.own||[]).find(o=>o.tid===tid);}
function ownerHub(){const m=G.me;const ch=[];
 (G.own||[]).forEach(o=>{const t=G.TM[o.tid];const pos=t.cars.map(c=>c.d?champPos(o.s,c.d):0).filter(x=>x).sort((a,b)=>a-b)[0];
  ch.push({t:`<b>${esc(o.n)}</b> · ${esc(SER[o.s].sh)}`,sub:`${t.cars.length} car${t.cars.length>1?"s":""} · car rating ${Math.round(o.q)} · team bank ${money(o.cash)} · ${pos?"best in points: "+ordinal(pos):"no starts yet"}`,icon:"🏢",f:()=>teamScreen(o)});});
 ch.push({sec:"GROW YOUR EMPIRE"});
 ch.push({t:"Start a new team",sub:"Pick any series. Costs money; you'll need sponsors",icon:"➕",dis:m.age<18&&"You must be 18 to own a team",f:startTeamMenu});
 ch.push({t:"Buy an existing team",sub:"Take over an independent operation, cars and people included",icon:"💰",dis:m.age<18&&"You must be 18 to own a team",f:buyTeamMenu});
 if(G.ownHist&&G.ownHist.length)ch.push({t:"Ownership history",icon:"📜",f:ownHistScreen});
 ch.push({t:"Back",cls:"hi",f:hub});
 show(`<h2>Team ownership</h2><p>Own a team in any series, even while you're still driving: hire drivers and a crew chief, find sponsors, invest in development and chase owner championships.${G.own.length?"":" You don't own a team yet."}</p><p>Personal cash: <b>${money(m.cash)}</b></p>`,ch);}
function startTeamMenu(){const ch=SERIES_LIST.filter(s=>!s.oneoff).sort((a,b)=>a.tier-b.tier).map(s=>{const p=ownPrice(s.id);return {t:esc(s.n),sub:`Start-up ${money(p)} · about ${money(ownOp(s.id))} per car per season to run${s.id==="cup"?" · charter optional":""}${s.id==="f1"?" · the FIA must approve a new entry":""}`,dis:G.me.cash<p&&`You need ${money(p)}`,f:()=>nameTeam(s.id,null)};});
 show(`<h2>Start a team</h2><p>Every team needs cars, a shop, people and money. You pay the start-up cost from your personal cash; running costs come out of the team bank.</p>`,ch.concat([{t:"Back",cls:"hi",f:ownerHub}]));}
function nameTeam(sid,buyTid){const def=buyTid?tn(buyTid):(G.me.name.split(" ").slice(-1)[0]+" Racing");show(`<h2>Name your team</h2><p><input type="text" id="tnInput" data-k="tname" maxlength="32" value="${esc(def)}"></p>`,[
 {t:"Confirm",cls:"hi",f:()=>{const n=clean(inval("tname"),32)||def;buyTid?doBuyTeam(buyTid,n):doStartTeam(sid,n);}},{t:"Back",f:ownerHub}]);inputHook("tnInput");}
function doStartTeam(sid,n){const s=SER[sid];EFX=[];const p=ownPrice(sid);spend(p,"Team start-up");
 // a struggling independent folds to make room (keeps field sizes sensible)
 const weak=teamsOf(sid).filter(t=>!t.r&&!t.own&&!t.priv&&!t.cars.some(c=>c.d==="me")&&!myTeamLink(t.id)).sort((a,b)=>a.q-b.q)[0];if(weak&&teamsOf(sid).length>4){weak.cars.forEach(c=>{if(c.d){freeDriver(c.d);}});foldTeam(weak.id);}
 const t=newTeam({s:sid,n,mfr:s.mfr?R.pick(s.mfr):"",q:s.ql-6,ow:G.me.name,r:0,own:1});const d=genDriverFor(sid);seatDriver(t.id,usedNum(sid),d.id);d.cy=1;
 const o={tid:t.id,s:sid,n,q:t.q,cash:Math.round(ownOp(sid)*.35),titles:0,wins:0,starts:0,top5:0,cc:{n:genStaff(t.id),r:R.int(45,60)},crew:R.int(45,60),bud:1,rnd:0,charter:0,spons:[{n:R.pick(SPONSOR_FIC),amt:Math.round(ownOp(sid)*.45/1000)*1000}],sal:{},founded:G.yr,last:[]};o.sal[d.id]=driverAsk(d,sid);
 G.own.push(o);addNews(`${G.me.name} launches ${n} in ${s.n}.`,true);checkAch();save();
 show(`<h2>${esc(n)} is born</h2><p>A rented shop, one car, a handful of people and a big dream. ${esc(nm(d.id))} is your first driver. The team bank starts with a sponsor commitment and some working capital.</p>${efxHtml()}`,[{t:"Manage the team",cls:"hi",f:()=>teamScreen(o)}]);}
function buyTeamMenu(){const ch=[];SERIES_LIST.filter(s=>!s.oneoff).forEach(s=>{teamsOf(s.id).filter(t=>!t.r&&!t.own&&!t.priv&&!t.cars.some(c=>c.d==="me")).sort((a,b)=>b.q-a.q).slice(0,2).forEach(t=>{const p=Math.round(ownPrice(s.id)*(.6+t.q/s.ql*.7)/1000)*1000;
  ch.push({t:`${esc(tn(t.id))} · ${esc(s.sh)}`,sub:`${t.cars.length} car(s), rating ${Math.round(t.q)} · asking ${money(p)}`,dis:G.me.cash<p&&"Not enough cash",f:()=>{G.fl.buyPrice=p;nameTeam(s.id,t.id);}});});});
 show(`<h2>Buy a team</h2><p>Independent teams (fictional operations) open to offers. Real-world teams aren't for sale in this game.</p>`,ch.concat([{t:"Back",cls:"hi",f:ownerHub}]));}
function doBuyTeam(tid,n){const t=G.TM[tid];EFX=[];spend(G.fl.buyPrice||ownPrice(t.s),"Team purchase");t.own=1;t.n=n;t.ow=G.me.name;
 const o={tid,s:t.s,n,q:t.q,cash:Math.round(ownOp(t.s)*.25),titles:0,wins:0,starts:0,top5:0,cc:{n:genStaff(tid),r:R.int(50,70)},crew:R.int(50,68),bud:1,rnd:0,charter:t.s==="cup"&&t.q>78?1:0,spons:[{n:R.pick(SPONSOR_FIC),amt:Math.round(ownOp(t.s)*.5/1000)*1000}],sal:{},founded:G.yr,last:[]};
 t.cars.forEach(c=>{if(c.d&&c.d!=="me")o.sal[c.d]=driverAsk(G.D[c.d],t.s);});G.own.push(o);addNews(`${G.me.name} buys ${tn(tid)} (${SER[t.s].sh}).`,true);checkAch();save();
 show(`<h2>Deal done</h2><p>You're the new owner of <b>${esc(n)}</b>.</p>${efxHtml()}`,[{t:"Manage the team",cls:"hi",f:()=>teamScreen(o)}]);}
function driverAsk(d,sid){const s=SER[sid];if(!s.sal[1])return 0;const f=clamp((d.o-s.lvl+8)/22,0,1);return Math.round((s.sal[0]*.6+(s.sal[1]*.5-s.sal[0]*.6)*Math.pow(f,2))/1000)*1000;}
function teamCost(o){const t=G.TM[o.tid];return Math.round(ownOp(o.s)*t.cars.length*[.75,1,1.35][o.bud]+sum(Object.values(o.sal)));}
function teamIncome(o){return sum(o.spons.map(s=>s.amt))+(o.charter?Math.round(ownOp(o.s)*.6):0);}
function teamScreen(o){const t=G.TM[o.tid];if(!t)return ownerHub();const s=SER[o.s];
 const rows=t.cars.map(c=>({cells:["#"+esc(String(c.num)),c.d?(c.d==="me"?"<b>You</b>":esc(nm(c.d))):"<i>empty</i>",c.d&&c.d!=="me"?Math.round(G.D[c.d].o):Math.round(OVR(s.disc)),c.d?(champPos(o.s,c.d)?ordinal(champPos(o.s,c.d)):"-"):"-",c.d&&c.d!=="me"?money(o.sal[c.d]||0):"-"],hl:c.d==="me"}));
 const ch=[{sec:"PEOPLE"},
  {t:"Hire a driver",sub:"Free agents and drivers from other series",icon:"🧑",dis:!t.cars.some(c=>!c.d)&&"No empty car: release someone or add a car",f:()=>hireMenu(o)},
  {t:"Release a driver",icon:"✂️",dis:!t.cars.some(c=>c.d&&c.d!=="me")&&"Nobody to release",f:()=>releaseMenu(o)},
  {t:t.cars.some(c=>c.d==="me")?"Step out of the car":"Put yourself in the car",sub:t.cars.some(c=>c.d==="me")?"Hire someone else to drive":"Owner-driver: race for your own team",icon:"🏎️",dis:!t.cars.some(c=>c.d==="me")&&(licenseBlock(o.s)||(G.me.retired&&"You're retired from driving")||(G.car.con&&G.car.tm!==o.tid&&!G.car.con.priv&&G.car.con.end>=G.yr&&!seasonOver()&&"You're under contract elsewhere this season")||(!t.cars.some(c=>!c.d)&&"No empty car")),f:()=>ownerDriver(o)},
  {t:`Upgrade crew chief / technical director (${o.cc.r})`,sub:`${money(Math.round(ownOp(o.s)*.08))} per upgrade · better setups and strategy`,icon:"🧠",dis:(o.cash<ownOp(o.s)*.08&&"Team bank is too low")||(o.cc.r>=92&&"Already elite"),f:()=>{EFX=[];o.cash-=Math.round(ownOp(o.s)*.08);o.cc.r=Math.min(95,o.cc.r+R.int(4,8));o.cc.n=genStaff(o.tid+o.cc.r);teamMsg(o,`You hire ${esc(o.cc.n)} to lead the team (rating ${o.cc.r}).`);}},
  {t:`Train the pit crew (${o.crew})`,sub:`${money(Math.round(ownOp(o.s)*.04))}`,icon:"🛞",dis:(o.cash<ownOp(o.s)*.04&&"Team bank is too low")||(o.crew>=92&&"Already elite"),f:()=>{o.cash-=Math.round(ownOp(o.s)*.04);o.crew=Math.min(95,o.crew+R.int(3,7));teamMsg(o,"Pit stop practice every morning. Stops are getting faster.");}},
  {sec:"MONEY & CARS"},
  {t:`Budget level: ${["Lean","Standard","All-in"][o.bud]}`,sub:"Higher budgets develop the car faster but cost more",icon:"💵",f:()=>{o.bud=(o.bud+1)%3;teamScreen(o);}},
  {t:"Invest in R&D",sub:`${money(Math.round(ownOp(o.s)*.15))} → car rating up over the season`,icon:"🔬",dis:o.cash<ownOp(o.s)*.15&&"Team bank is too low",f:()=>{o.cash-=Math.round(ownOp(o.s)*.15);o.rnd+=1;o.q=Math.min(s.ql+14,o.q+R.f(.8,2));t.q=o.q;teamMsg(o,"The engineers get to work on a new package.");}},
  {t:"Find a team sponsor",sub:"Results, fame and your name help",icon:"💼",dis:G.fl["tsp"+o.tid]===absWk()&&"Already tried this week",f:()=>{G.fl["tsp"+o.tid]=absWk();const p=.25+G.me.fame/200+(o.wins>0?.1:0);if(R.chance(p)){const sp={n:R.pick(R.chance(.2)?BIG_SPONSOR_FIC:SPONSOR_FIC),amt:Math.round(ownOp(o.s)*R.f(.12,.45)/1000)*1000};o.spons.push(sp);teamMsg(o,`${esc(sp.n)} signs on for ${money(sp.amt)} per season.`);}else teamMsg(o,"Lots of meetings, no signatures this week.");}},
  {t:"Add a car",sub:`${money(Math.round(ownOp(o.s)*.5))} to build it; more running costs`,icon:"➕",dis:(t.cars.length>=4&&"Four cars is the limit")||(o.cash<ownOp(o.s)*.5&&"Team bank is too low"),f:()=>{o.cash-=Math.round(ownOp(o.s)*.5);t.cars.push({num:usedNum(o.s),d:null});teamMsg(o,"A new car rolls out of the shop. Now find a driver.");}},
  o.s==="cup"&&!o.charter?{t:"Buy a NASCAR charter",sub:`${money(CHARTER_PRICE)} (personal cash). Guaranteed starts and a bigger share of the money`,icon:"📜",dis:G.me.cash<CHARTER_PRICE&&"Not enough personal cash",f:()=>{EFX=[];spend(CHARTER_PRICE,"Charter");o.charter=1;teamMsg(o,"You buy a charter. Your team is now a permanent fixture in the Cup garage.");}}:null,
  {t:"Invest personal money",sub:"Move money into the team bank",icon:"⬆️",f:()=>moneyMove(o,1)},
  {t:"Take money out",sub:"Move money from the team bank to you",icon:"⬇️",dis:o.cash<=0&&"The bank is empty",f:()=>moneyMove(o,-1)},
  {t:"Standings",icon:"🏆",f:()=>standingsScreen(o.s)},
  {t:"Sell the team",icon:"🏷️",f:()=>sellTeam(o)},
  {t:"Back",cls:"hi",f:ownerHub}];
 show(`<div class="eyebrow">TEAM OWNER · ${esc(s.n.toUpperCase())}</div><h2>${esc(o.n)}</h2>
 ${tiles([{l:"Car rating",v:Math.round(o.q),h:`series avg ${s.ql}`},{l:"Team bank",v:money(o.cash),sm:1},{l:"Season costs",v:money(teamCost(o)),sm:1,h:"incl. salaries"},{l:"Sponsors",v:money(teamIncome(o)),sm:1,h:o.spons.map(x=>esc(x.n)).join(", ")},{l:"Wins",v:o.wins,h:`${o.starts} starts · ${o.titles} titles`},{l:"Crew chief",v:o.cc.r,h:esc(o.cc.n)}])}
 ${table(["Car","Driver","Rating","Points pos","Salary"],rows)}${o.last.length?`<p>Last race: ${o.last.map(x=>`${esc(nm(x.d))} ${ordinal(x.f)}`).join(", ")}</p>`:""}`,ch);}
function teamMsg(o,t){save();show(`<p>${t}</p>${efxHtml()}`,[{t:"Back to the team",cls:"hi",f:()=>teamScreen(o)}]);}
function moneyMove(o,dir){const amts=[10000,100000,1000000,10000000].filter(a=>dir>0?G.me.cash>=a:o.cash>=a);show(`<h2>${dir>0?"Invest":"Withdraw"}</h2>`,amts.map(a=>({t:money(a),f:()=>{if(dir>0){G.me.cash-=a;o.cash+=a;}else{o.cash-=a;G.me.cash+=a;}teamScreen(o);}})).concat([{t:"Back",cls:"hi",f:()=>teamScreen(o)}]));}
function hireMenu(o){const s=SER[o.s];const ar=AGE_R[o.s]||[16,40];const pool=Object.values(G.D).filter(d=>!d.ret&&!d.inj&&(!d.tm||(d.s&&SER[d.s].tier<s.tier&&SER[d.s].tier>=s.tier-3))&&(G.yr-d.by)>=s.age&&(G.yr-d.by)<=ar[1]+5&&d.o>=s.lvl-16).sort((a,b)=>b.o-a.o).slice(0,14);
 show(`<h2>Hire a driver</h2><p>Better drivers want more money and a competitive car. Drivers under contract in lower series will jump for a promotion.</p>`,pool.map(d=>{const ask=driverAsk(d,o.s);const want=d.o>o.q+12&&!d.tm?"Wants a better car":"";return {t:`${esc(nm(d.id))} (${G.yr-d.by}, ${esc(d.nat)}) · rating ${Math.round(d.o)}`,sub:`${d.tm?esc(SER[d.s].sh)+" with "+esc(tn(d.tm)):"Free agent"} · asks ${money(ask)}/yr${want?" · "+want:""}`,dis:want&&R.chance(.5)?want:false,f:()=>{const t=G.TM[o.tid];const c=t.cars.find(x=>!x.d);if(!c)return teamScreen(o);if(d.tm)freeDriver(d.id);c.d=d.id;d.s=o.s;d.tm=o.tid;d.num=c.num;d.cy=2;o.sal[d.id]=ask;rel("d:"+d.id,4);addNews(`${nm(d.id)} joins ${o.n} for ${s.sh}.`,true);teamMsg(o,`${esc(nm(d.id))} signs with ${esc(o.n)}.`);}};}).concat([{t:"Promote a young prospect",sub:"A cheap, raw rookie",f:()=>{const t=G.TM[o.tid];const c=t.cars.find(x=>!x.d);if(!c)return teamScreen(o);const d=genDriverFor(o.s);d.o=clamp(d.o-4,15,90);d.by=G.yr-Math.max(s.age,R.int(16,20));c.d=d.id;d.s=o.s;d.tm=o.tid;d.num=c.num;o.sal[d.id]=Math.round(driverAsk(d,o.s)*.5);teamMsg(o,`You sign rookie ${esc(d.n)}.`);}},{t:"Back",cls:"hi",f:()=>teamScreen(o)}]));}
function releaseMenu(o){const t=G.TM[o.tid];show(`<h2>Release a driver</h2>`,t.cars.filter(c=>c.d&&c.d!=="me").map(c=>({t:esc(nm(c.d)),sub:`Rating ${Math.round(G.D[c.d].o)} · buyout ${money(Math.round((o.sal[c.d]||0)*.5))}`,f:()=>{o.cash-=Math.round((o.sal[c.d]||0)*.5);delete o.sal[c.d];rel("d:"+c.d,-10);const id=c.d;freeDriver(id);G.D[id].cy=0;teamMsg(o,`${esc(nm(id))} is released.`);}})).concat([{t:"Back",cls:"hi",f:()=>teamScreen(o)}]));}
function ownerDriver(o){const t=G.TM[o.tid];if(t.cars.some(c=>c.d==="me")){const c=t.cars.find(x=>x.d==="me");c.d=null;if(G.car.tm===o.tid){G.car.con=null;G.car.s=null;G.car.tm=null;G.car.role=null;}return teamMsg(o,"You step out of the car. Hire a driver to fill it.");}
 EFX=[];if(G.car.con&&G.car.con.priv){removeMe();}const con={tm:o.tid,s:o.s,yrs:1,start:G.yr,end:G.yr+(seasonOver(o.s)?1:0),sal:0,win:0,spon:0,rel:0,n1:true,side:true,pay:0,own:1};applyContract(con);checkAch();teamMsg(o,`You'll drive the #${(t.cars.find(c=>c.d==="me")||{}).num} for your own team. Owner-driver, like the greats.`);}
function sellTeam(o){const t=G.TM[o.tid];const val=Math.round((ownPrice(o.s)*(.5+o.q/SER[o.s].ql*.5)+(o.charter?CHARTER_PRICE*.9:0)+Math.max(0,o.cash))/1000)*1000;
 show(`<h2>Sell ${esc(o.n)}?</h2><p>A buyer offers <b>${money(val)}</b>, including the team bank${o.charter?" and the charter":""}.</p>`,[{t:"Sell",cls:"hi",f:()=>{EFX=[];earn(val,"Team sale");if(o.cash<0)G.me.cash+=o.cash;t.own=0;t.n=ficTeamName(t.id+"sold",SER[o.s]);t.ow=genName("USA");if(t.cars.some(c=>c.d==="me")){t.cars.forEach(c=>{if(c.d==="me")c.d=null;});if(G.car.tm===o.tid){G.car.con=null;G.car.s=null;G.car.tm=null;G.car.role=null;}}
  G.ownHist=G.ownHist||[];G.ownHist.push({n:o.n,s:o.s,from:o.founded,to:G.yr,titles:o.titles,wins:o.wins,starts:o.starts});G.own=G.own.filter(x=>x!==o);addNews(`${G.me.name} sells ${o.n}.`,true);save();show(`<p>The team is sold.</p>${efxHtml()}`,[{t:"Back",cls:"hi",f:ownerHub}]);}},{t:"Keep it",f:()=>teamScreen(o)}]);}
function ownHistScreen(){show(`<h2>Ownership history</h2>${table(["Team","Series","Years","Starts","Wins","Titles"],(G.ownHist||[]).map(h=>[esc(h.n),esc(SER[h.s].sh),h.from+"-"+h.to,h.starts,h.wins,h.titles]))}`,[{t:"Back",cls:"hi",f:ownerHub}]);}
/* ---------- hooks ---------- */
function ownerRaceHook(rc,res){(G.own||[]).forEach(o=>{if(o.s!==rc.sid)return;const t=G.TM[o.tid];if(!t)return;const mine=res.filter(r=>r.tm===o.tid);if(!mine.length)return;o.last=mine.map(r=>({d:r.d,f:r.f}));
  const s=SER[o.s];const per=ownOp(o.s)/Math.max(1,s.cal.length);mine.forEach(r=>{o.starts++;if(r.f===1)o.wins++;if(r.f<=5)o.top5++;const pf=r.f===1?1.4:r.f<=3?.9:r.f<=10?.55:.3;o.cash+=Math.round(per*pf*(s.id==="cup"&&!o.charter?.6:1)*.5);});
  if(mine.some(r=>r.f===1)&&!mine.some(r=>r.d==="me"))G.notes.push(`🏢 Your team ${esc(o.n)} won the ${esc(rc.ev)} with ${esc(nm(mine.find(r=>r.f===1).d))}!`);});}
function ownerWeekly(){(G.own||[]).forEach(o=>{const t=G.TM[o.tid];if(!t)return;o.cash+=Math.round((teamIncome(o)-teamCost(o))/52);
  // the crew chief and budget slowly develop the car
  const s=SER[o.s];const tgt=s.ql-6+(o.cc.r-55)*.25+(o.bud-1)*4+o.rnd*1.2;o.q=clamp(o.q+(tgt-o.q)*.02,20,s.ql+16);t.q=o.q;
  if(o.cash<-teamCost(o)*.5&&!o.warned){o.warned=1;queuePending("team_broke",{tid:o.tid});}});}
function ownerNewYear(){(G.own||[]).forEach(o=>{const t=G.TM[o.tid];if(!t)return;o.rnd=Math.max(0,o.rnd-1);o.warned=0;const best=t.cars.map(c=>c.d?(G.S[o.s].tab[c.d]?0:0):0);
  o.hist=o.hist||[];o.hist.push({yr:G.yr-1,wins:o.wins,starts:o.starts,cash:o.cash});
  o.spons=o.spons.filter(sp=>R.chance(o.wins>0?.85:.65)||(G.notes.push(`🏢 ${esc(sp.n)} leaves ${esc(o.n)}.`),false));
  t.cars.forEach(c=>{if(c.d&&c.d!=="me"&&G.D[c.d]){const d=G.D[c.d];d.cy--;if(d.ret){c.d=null;}else if(d.cy<=0){d.cy=R.int(1,2);o.sal[d.id]=driverAsk(d,o.s);}}});
  t.cars.forEach(c=>{if(!c.d){G.notes.push(`🏢 ${esc(o.n)} has an empty car (#${c.num}). Hire a driver.`);}});});}

/* ===================== SCREENS: stats, standings, browser, achievements, endings ===================== */
function careerTotals(filter){const rs=G.st.races.filter(filter||(()=>true));return {st:rs.length,w:rs.filter(r=>r.f===1).length,pod:rs.filter(r=>r.f<=3).length,t5:rs.filter(r=>r.f<=5).length,t10:rs.filter(r=>r.f<=10).length,pol:rs.filter(r=>r.st===1).length,led:sum(rs.map(r=>r.led||0)),fl:rs.filter(r=>r.fl).length,dnf:rs.filter(r=>r.dnf).length,as:rs.length?r1(avg(rs.map(r=>r.st))):0,af:rs.length?r1(avg(rs.map(r=>r.f))):0};}
function careerScreen(){const c=careerTotals();const m=G.me;const titles=G.st.titles;
 show(`<h2>Career: ${esc(m.name)}${m.nick?` "${esc(m.nick)}"`:""}</h2><p>Age ${m.age} · ${esc(m.home)} · ${G.st.seasons.filter(s=>!s.oo).length} seasons · career earnings ${money(m.earned)}</p>
 ${tiles([{l:"Starts",v:c.st},{l:"Wins",v:c.w,h:c.st?Math.round(c.w/c.st*100)+"%":""},{l:"Podiums",v:c.pod},{l:"Top 5 / 10",v:`${c.t5} / ${c.t10}`,sm:1},{l:"Poles",v:c.pol},{l:"Laps led",v:c.led},{l:"Fastest laps",v:c.fl},{l:"DNFs",v:c.dnf},{l:"Avg start / finish",v:`${c.as} / ${c.af}`,sm:1},{l:"Championships",v:titles.length,h:titles.map(t=>t.yr+" "+esc(SER[t.s].sh)).slice(-3).join(", ")},{l:"Crown jewels",v:G.st.cj.length},{l:"Legacy",v:legacyScore(),h:legacyTier(legacyScore())}])}`,[
  {t:"Season by season",icon:"📅",tile:1,f:seasonsScreen},{t:"Totals by series",icon:"🗂️",tile:1,f:bySeriesScreen},{t:"Race log",icon:"📝",tile:1,f:()=>raceLog(0)},{t:"Crown jewels",icon:"👑",tile:1,f:crownScreen},{t:"Records",icon:"📈",tile:1,f:recordsScreen},{t:"Achievements",icon:"🏅",tile:1,f:achScreen},{t:"Back",cls:"hi",f:hub}]);}
function seasonsScreen(){const rows=G.st.seasons.slice().reverse().map(s=>({cells:[s.yr,esc(SER[s.s].sh)+(s.oo?" (one-off)":""),esc(s.tm),s.st,s.w,s.pd,s.t5,s.pol,s.dnf,s.af,s.oo?"-":(s.pos?ordinal(s.pos):"-")+(s.ch?" 🏆":"")],hl:!!s.ch}));
 const cur=Object.keys(G.S).filter(sid=>G.st.races.some(r=>r.yr===G.yr&&r.s===sid)).map(sid=>{const rs=G.st.races.filter(r=>r.yr===G.yr&&r.s===sid);const c=careerTotals(r=>r.yr===G.yr&&r.s===sid);return {cells:[G.yr+"*",esc(SER[sid].sh),esc(rs[rs.length-1].tmn||""),c.st,c.w,c.pod,c.t5,c.pol,c.dnf,c.af,SER[sid].oneoff||rs.every(r=>r.oo)?"-":ordinal(champPos(sid,"me")||0)]};});
 show(`<h2>Season by season</h2>${table(["Year","Series","Team","St","W","Pod","T5","Pole","DNF","Avg F","Pos"],cur.concat(rows))}<p class="dim">* current season in progress</p>`,[{t:"Back",cls:"hi",f:careerScreen}]);}
function bySeriesScreen(){const ids=[...new Set(G.st.races.map(r=>r.s))];show(`<h2>Totals by series</h2>${table(["Series","St","W","Pod","T5","Pole","Led","DNF","Avg F","Titles"],ids.map(sid=>{const c=careerTotals(r=>r.s===sid);return [esc(SER[sid].sh),c.st,c.w,c.pod,c.t5,c.pol,c.led,c.dnf,c.af,G.st.titles.filter(t=>t.s===sid).length];}))}`,[{t:"Back",cls:"hi",f:careerScreen}]);}
function raceLog(pg){const rs=G.st.races.slice().reverse();const per=25;const page=rs.slice(pg*per,pg*per+per);
 show(`<h2>Race log</h2><p>${rs.length} starts. Page ${pg+1} of ${Math.max(1,Math.ceil(rs.length/per))}.</p>${table(["Year","Event","Series","St","Fin","Led","Note"],page.map(r=>({cells:[r.yr,esc(r.ev)+(r.cj?" 👑":""),esc(SER[r.s].sh),r.st,r.f===1?"<b>1</b>":r.f,r.led||"",r.dnf?`<span class="r">${esc(r.dnf)}</span>`:(r.fl?"FL":"")],hl:r.f===1})))}`,
  [pg>0?{t:"Newer",f:()=>raceLog(pg-1)}:null,(pg+1)*per<rs.length?{t:"Older",f:()=>raceLog(pg+1)}:null,{t:"Back",cls:"hi",f:careerScreen}]);}
function crownScreen(){const all=[];SERIES_LIST.forEach(s=>s.cal.forEach((c,ci)=>{if(c[3])all.push({s:s.id,ci,n:c[2]});}));const seen={};const list=all.filter(x=>{if(seen[x.n])return false;seen[x.n]=1;return true;});
 show(`<h2>Crown jewels</h2><p>The races every driver wants on their résumé.</p>${table(["Race","Starts","Best","Wins"],list.map(x=>{const rs=G.st.races.filter(r=>r.ev===x.n);return {cells:[esc(x.n),rs.length,rs.length?Math.min(...rs.map(r=>r.f)):"-",rs.filter(r=>r.f===1).length?`<b class="gold">${rs.filter(r=>r.f===1).map(r=>r.yr).join(", ")}</b>`:"-"],hl:rs.some(r=>r.f===1)};}))}`,[{t:"Back",cls:"hi",f:careerScreen}]);}
function recordsScreen(){const ss=G.st.seasons.filter(s=>!s.oo);const bw=ss.slice().sort((a,b)=>b.w-a.w)[0];const ba=ss.filter(s=>s.st>=5).sort((a,b)=>a.af-b.af)[0];const rs=G.st.races;
 let streak=0,best=0;rs.forEach(r=>{if(r.f===1){streak++;best=Math.max(best,streak);}else streak=0;});const backWin=rs.filter(r=>r.f===1).sort((a,b)=>b.st-a.st)[0];
 const allTime={};Object.values(G.D).forEach(d=>{if(d.c.w>0)allTime[d.id]=d.c.w;});const topAI=Object.keys(allTime).sort((a,b)=>allTime[b]-allTime[a]).slice(0,5);
 show(`<h2>Records</h2>${table(["Record","Value"],[["Most wins in a season",bw?`${bw.w} (${bw.yr} ${esc(SER[bw.s].sh)})`:"-"],["Best average finish",ba?`${ba.af} (${ba.yr} ${esc(SER[ba.s].sh)})`:"-"],["Longest win streak",best],["Win from furthest back",backWin?`started ${ordinal(backWin.st)}: ${esc(backWin.ev)} ${backWin.yr}`:"-"],["Biggest payday career earnings",money(G.me.earned)],["Highest overall rating",Math.round(G.fl.peakOvr||OVR())]])}
 <h3>Most wins by rivals (in this career)</h3>${table(["Driver","Wins"],topAI.map(id=>[esc(nm(id)),allTime[id]]))}`,[{t:"Back",cls:"hi",f:careerScreen}]);}
function ratingsScreen(){const m=G.me;const ds=["kart","stock","dirt","open","sports"];
 show(`<h2>Driver ratings</h2>${tiles(ds.map(d=>({l:DISC_N[d],v:rb(OVR(d))})).concat([{l:"Potential",v:m.pot>=90?"Elite":m.pot>=84?"High":m.pot>=78?"Good":"Solid",h:"Your natural ceiling"},{l:"Superlicense",v:slpTotal()+"/40",h:"last 3 seasons"},{l:"Health",v:Math.round(m.hp)},{l:"Morale",v:Math.round(m.mor)}]))}
 ${statGrid()}<p>Traits: ${m.traits.map(t=>`<b>${TRAITS[t][0]}</b> (${TRAITS[t][1]})`).join("; ")}</p>`,[{t:"Back",cls:"hi",f:hub}]);}
function standingsScreen(sid,all){if(!sid||!SER[sid])sid="cup";const s=SER[sid];const st=G.S[sid];const rows=standings(sid);const lim=all?rows.length:Math.min(rows.length,40);
 const tb=rows.slice(0,lim).map((r,i)=>{const d=G.D[r.id];const tm=r.id==="me"?G.car.tm:d&&d.tm;return {cells:[i+1+(st.chase&&st.chase.indexOf(r.id)>=0?"*":""),r.id==="me"?`<b>${esc(G.me.name)}</b>`:esc(nm(r.id)),esc(tm?tn(tm):"-"),r.p,r.st,r.w,r.t5,r.pol,r.dnf],hl:r.id==="me"};});
 const ch=[{t:"Calendar & results",f:()=>calendarScreen(sid)},{t:"Past champions",f:()=>champsScreen(sid)},{t:"Teams & drivers",f:()=>seriesDetail(sid)}];if(!all&&rows.length>lim)ch.push({t:"Show the full field",f:()=>standingsScreen(sid,1)});
 const mine=[...new Set([G.car.s].concat(G.st.races.filter(r=>r.yr===G.yr).map(r=>r.s)).concat((G.own||[]).map(o=>o.s)))].filter(x=>x&&x!==sid&&!SER[x].oneoff);mine.forEach(x=>ch.push({t:`${esc(SER[x].sh)} standings`,f:()=>standingsScreen(x)}));
 ch.push({t:"Other series",f:()=>pickSeries(standingsScreen)},{t:"Back",cls:"hi",f:hub});
 show(`<h2>${esc(s.n)} ${G.yr}</h2><p>${st.res.length} of ${s.cal.length} rounds complete${st.chase?" · Chase drivers marked *":""}${st.done&&st.champ?` · Champion: <b>${esc(st.champ==="me"?G.me.name:nm(st.champ))}</b>`:""}</p>${table(["Pos","Driver","Team","Pts","St","W","T5","Pole","DNF"],tb)}`,ch);}
function pickSeries(fn){const ch=[];Object.keys(LADDERS).forEach(l=>{let first=true;SERIES_LIST.filter(s=>s.lad===l&&!s.oneoff).forEach(s=>{ch.push({sec:first?LADDERS[l].toUpperCase():null,t:esc(s.n),f:()=>fn(s.id)});first=false;});});
 show(`<h2>Pick a series</h2>`,ch.concat([{t:"Back",cls:"hi",f:hub}]));}
function calendarScreen(sid){if(!sid||!SER[sid])sid="cup";const s=SER[sid];const st=G.S[sid];
 const rows=s.cal.map((c,ci)=>{const r=st.res.find(x=>x.ci===ci);const mine=G.st.races.find(x=>x.yr===G.yr&&x.s===sid&&x.ci===ci);return {cells:[ci+1,wkDate(c[1]),esc(c[2]||evName(sid,ci))+(c[3]?" 👑":""),esc(tkn(c[0])),r?(r.w==="me"?`<b>${esc(G.me.name)}</b>`:esc(nm(r.w))):s.oneoff&&G.hist[sid].find(h=>h.yr===G.yr)?esc(G.hist[sid].find(h=>h.yr===G.yr).cn):"",mine?ordinal(mine.f):""],hl:!!mine&&mine.f===1};});
 show(`<h2>${esc(s.sh)} calendar ${G.yr}</h2>${table(["Rd","Date","Event","Track","Winner","You"],rows)}`,[{t:"Standings",f:()=>standingsScreen(sid)},{t:"Back",cls:"hi",f:hub}]);}
function champsScreen(sid){const h=G.hist[sid]||[];show(`<h2>${esc(SER[sid].sh)}: champions${SER[sid].oneoff?" & winners":""}</h2>${table(["Year","Champion","Team"],h.slice().reverse().map(x=>({cells:[x.yr,x.c==="me"?`<b>${esc(G.me.name)}</b>`:esc(x.c&&G.D[x.c]?nm(x.c):x.cn),esc(x.tm||"")],hl:x.c==="me"})))}`,[{t:"Back",cls:"hi",f:()=>standingsScreen(sid)}]);}
function seriesBrowser(){pickSeries(seriesDetail);}
function seriesDetail(sid){const s=SER[sid];const tms=teamsOf(sid).sort((a,b)=>b.q-a.q);
 const rows=[];tms.forEach(t=>t.cars.forEach(c=>{if(!c.d)return;rows.push({cells:["#"+esc(String(c.num)),c.d==="me"?`<b>${esc(G.me.name)}</b>`:esc(nm(c.d)),esc(tn(t.id))+(t.own?" (yours)":""),esc(t.mfr||""),c.d==="me"?Math.round(OVR(s.disc)):Math.round(G.D[c.d].o),c.d==="me"?G.me.age:G.yr-G.D[c.d].by],hl:c.d==="me"});}));
 show(`<h2>${esc(s.n)}</h2><p>${esc(s.desc)}</p>${tiles([{l:"Ladder",v:esc(LADDERS[s.lad]||""),sm:1},{l:"Level",v:esc(seriesTierName(s.tier)),sm:1},{l:"Races",v:s.cal.length},{l:"Field",v:s.field},{l:"Min age",v:s.age},{l:"Season cost",v:s.cost?money(s.cost):"Team-funded",sm:1}])}
 ${s.oneoff?"":table(["Car","Driver","Team","Make","Rtg","Age"],rows)}`,[{t:"Standings",f:()=>standingsScreen(sid)},{t:"Calendar",f:()=>calendarScreen(sid)},{t:"Past champions",f:()=>champsScreen(sid)},{t:"Other series",f:seriesBrowser},{t:"Back",cls:"hi",f:hub}]);}
function newsScreen(){const n=G.news.slice(0,70);const rum=G.rumors.filter(r=>r.yr===G.yr&&!r.me).slice(-8).reverse();
 show(`<h2>News &amp; rumors</h2>${rum.length?`<h3>Silly season rumor mill</h3><ul>${rum.map(r=>`<li>${esc(nm(r.d))} ↔ ${esc(tn(r.tm))}</li>`).join("")}</ul>`:""}<div class="news">${n.map(x=>`<div class="${x.m?"mine":""}"><span class="dim">${dateLbl(x.yr,x.wk)}</span> ${esc(x.t)}</div>`).join("")||"<p>No news yet.</p>"}</div>`,[{t:"Back",cls:"hi",f:hub}]);}
function relScreen(){const keys=Object.keys(G.rel).filter(k=>Math.abs(G.rel[k])>=1).sort((a,b)=>G.rel[b]-G.rel[a]);
 show(`<h2>Relationships</h2><p>People remember. Team owners, rivals, crew chiefs, sponsors and the media all react to how you treat them.</p>${table(["Who","Standing"],keys.map(k=>[esc(relName(k)),relTag(k)]))}`,[{t:"Back",cls:"hi",f:hub}]);}
/* ---------- achievements ---------- */
const ACH=[["first_start","Green Flag","Make your first start",()=>G.st.races.length>0],["first_win","Victory Lane","Win your first race",()=>G.st.races.some(r=>r.f===1)],["first_pole","Pole Sitter","Win a pole",()=>G.st.races.some(r=>r.st===1)],["podium","Champagne","Finish on the podium",()=>G.st.races.some(r=>r.f<=3)],
 ["w10","Double Digits","Win 10 races",()=>careerTotals().w>=10],["w25","Winner","Win 25 races",()=>careerTotals().w>=25],["w50","Serial Winner","Win 50 races",()=>careerTotals().w>=50],["w100","Centurion","Win 100 races",()=>careerTotals().w>=100],
 ["s100","Ironman","Make 100 starts",()=>G.st.races.length>=100],["s500","Lifer","Make 500 starts",()=>G.st.races.length>=500],
 ["title1","Champion","Win a championship",()=>G.st.titles.length>=1],["title3","Dynasty","Win 3 championships",()=>G.st.titles.length>=3],["title5","Legend","Win 5 championships",()=>G.st.titles.length>=5],["title3s","Versatile Champion","Win titles in 3 different series",()=>new Set(G.st.titles.map(t=>t.s)).size>=3],
 ["disc3","Jack of All Trades","Win in 3 different disciplines",()=>new Set(G.st.races.filter(r=>r.f===1).map(r=>SER[r.s].disc)).size>=3],
 ["d500","Great American Race","Win the Daytona 500",()=>G.st.cj.some(c=>/Daytona 500/.test(c.ev))],["i500","Milk Drinker","Win the Indianapolis 500",()=>G.st.cj.some(c=>/Indianapolis 500/.test(c.ev))],["monaco","Monte Carlo","Win the Monaco Grand Prix",()=>G.st.cj.some(c=>/Monaco/.test(c.ev))],["lemans","Twice Around the Clock","Win the 24 Hours of Le Mans",()=>G.st.cj.some(c=>/Le Mans/.test(c.ev))],
 ["triple","Triple Crown","Win Monaco, Indy and Le Mans",()=>["Monaco","Indianapolis 500","Le Mans"].every(k=>G.st.cj.some(c=>c.ev.indexOf(k)>=0))],["chili","Golden Driller","Win the Chili Bowl",()=>G.st.cj.some(c=>/Chili/.test(c.ev))],["knox","Knoxville King","Win the Knoxville Nationals",()=>G.st.cj.some(c=>/Knoxville/.test(c.ev))],["snow","Snowball Champion","Win the Snowball Derby",()=>G.st.cj.some(c=>/Snowball/.test(c.ev))],["bathurst","King of the Mountain","Win the Bathurst 1000",()=>G.st.cj.some(c=>/Bathurst/.test(c.ev))],
 ["double","The Double","Race the Indy 500 and the Coca-Cola 600 in the same year",()=>G.st.races.some(r=>/Indianapolis 500/.test(r.ev)&&G.st.races.some(x=>x.yr===r.yr&&/Coca-Cola 600/.test(x.ev)))],
 ["f1","Formula 1 Driver","Start a Formula 1 race",()=>G.st.races.some(r=>r.s==="f1")],["cup","Cup Driver","Start a NASCAR Cup race",()=>G.st.races.some(r=>r.s==="cup")],["indy","IndyCar Driver","Start an IndyCar race",()=>G.st.races.some(r=>r.s==="indycar")],
 ["owner","Team Owner","Own a race team",()=>(G.own||[]).length>0||(G.ownHist||[]).length>0],["ownwin","Owner's Win","Win a race as a team owner",()=>(G.own||[]).some(o=>o.wins>0)||(G.ownHist||[]).some(o=>o.wins>0)],["owntitle","Owner's Championship","Win a title as a team owner",()=>(G.own||[]).some(o=>o.titles>0)||(G.ownHist||[]).some(o=>o.titles>0)],
 ["ownerdriver","Owner-Driver Winner","Win driving your own team's car",()=>G.st.races.some(r=>r.f===1&&(G.own||[]).some(o=>o.n===r.tmn))],
 ["rain","Rainmaster","Win a wet race",()=>G.st.races.some(r=>r.f===1&&r.wet)],["back","From the Back","Win from 20th or worse",()=>G.st.races.some(r=>r.f===1&&r.st>=20)],["mil","Millionaire","Earn $1,000,000",()=>G.me.earned>=1e6],["mil10","Big Money","Earn $10,000,000",()=>G.me.earned>=1e7],
 ["sponsor","Backed","Sign a sponsor",()=>G.car.spons.length>0],["slp","Superlicense","Hold 40 superlicense points",()=>slpTotal()>=40],["seasons20","Two Decades","Race 20 seasons",()=>new Set(G.st.races.map(r=>r.yr)).size>=20],["hof","Hall of Famer","Be inducted into the Hall of Fame",()=>!!G.fl.hof]];
function checkAch(){if(!G||!G.me)return;G.fl.peakOvr=Math.max(G.fl.peakOvr||0,OVR());ACH.forEach(a=>{if(G.ach[a[0]])return;let ok=false;try{ok=a[3]();}catch(e){ok=false;}if(ok){G.ach[a[0]]=G.yr;G.notes.push(`🏅 Achievement unlocked: <b>${a[1]}</b>`);}});}
function achScreen(){const n=Object.keys(G.ach).length;show(`<h2>Achievements (${n}/${ACH.length})</h2>${table(["","Achievement","How"],ACH.map(a=>({cells:[G.ach[a[0]]?"🏅":"·",G.ach[a[0]]?`<b>${a[1]}</b> (${G.ach[a[0]]})`:a[1],a[2]],hl:!!G.ach[a[0]]})))}`,[{t:"Back",cls:"hi",f:careerScreen}]);}
/* ---------- retirement & endings ---------- */
function retireMenu(){const m=G.me;if(m.retired)return show(`<h2>Close the book?</h2><p>This ends the game and shows your final career summary and legacy.</p>`,[{t:"Yes, end my career story",cls:"hi",f:()=>{G.over=true;save();endScreen();}},{t:"Not yet",f:hub}]);
 show(`<h2>Retire from driving?</h2><p>You're ${m.age}. ${m.age<30?"That's young to walk away.":m.age>=40?"Nobody would blame you.":"You still have years left."}</p>`,[
  {t:"Retire and end the game",sub:"Final career summary, Hall of Fame vote and legacy",f:()=>{doRetire();G.over=true;save();endScreen();}},
  {t:"Retire from driving, keep owning teams",sub:(G.own||[]).length?"Stay on as a full-time owner":"You don't own a team yet; you can start one after retiring",f:()=>{doRetire();save();hub();}},
  {t:"Keep racing",cls:"hi",f:hub}]);}
function doRetire(){const m=G.me;m.retired=true;removeMe();G.car.con=null;G.car.next=null;G.car.s=null;G.car.tm=null;G.car.role=null;G.offers=[];addNews(`${m.name} retires from driving at age ${m.age}.`,true);}
function hofCheck(){const ls=legacyScore();const topTitles=G.st.titles.filter(t=>SER[t.s].tier>=8).length;const ok=ls>=320||topTitles>=2||(topTitles>=1&&ls>=200)||G.st.cj.length>=3;if(ok)G.fl.hof=1;return ok;}
function endScreen(){G.over=true;const m=G.me;const c=careerTotals();const hof=hofCheck();checkAch();const ls=legacyScore();save();
 const tops=G.st.titles.map(t=>`${t.yr} ${esc(SER[t.s].n)}`);const cj=G.st.cj.map(x=>`${x.yr} ${esc(x.ev)}`);
 const story=c.st===0?"A career that never quite got started.":ls>=550?`${esc(m.name)} will be talked about as long as engines are fired. A legend of the sport.`:ls>=320?`A champion and a star. ${esc(m.name)}'s name is on trophies that matter.`:ls>=170?"A proven winner who earned respect everywhere they raced.":ls>=80?"A respected professional who made a living doing what most people only dream about.":"From Saturday nights to wherever the road led, a racer's racer.";
 show(`<div class="eyebrow">CAREER COMPLETE</div><h2>${esc(m.name)}</h2><p>${story}</p>
 ${tiles([{l:"Legacy score",v:ls,h:legacyTier(ls)},{l:"Hall of Fame",v:hof?"Inducted ✅":"Not inducted",sm:1},{l:"Starts",v:c.st},{l:"Wins",v:c.w},{l:"Podiums",v:c.pod},{l:"Poles",v:c.pol},{l:"Titles",v:G.st.titles.length},{l:"Crown jewels",v:G.st.cj.length},{l:"Earnings",v:money(m.earned),sm:1},{l:"Achievements",v:Object.keys(G.ach).length+"/"+ACH.length,sm:1}])}
 ${tops.length?`<h3>Championships</h3><p>${tops.join("<br>")}</p>`:""}${cj.length?`<h3>Crown jewels</h3><p>${cj.join("<br>")}</p>`:""}
 ${(G.ownHist||[]).length||(G.own||[]).length?`<h3>As a team owner</h3><p>${(G.own||[]).concat(G.ownHist||[]).map(o=>`${esc(o.n)} (${esc(SER[o.s].sh)}): ${o.wins} wins, ${o.titles} titles`).join("<br>")}</p>`:""}
 ${more(table(["Year","Series","St","W","T5","Pos"],G.st.seasons.map(s=>[s.yr,esc(SER[s.s].sh),s.st,s.w,s.t5,s.oo?"-":(s.pos?ordinal(s.pos):"-")])),"Season by season")}`,[
  {t:"Career stats",f:careerScreen},{t:"Export this save",f:backupScreen},{t:"Start a new career",cls:"hi",f:()=>{G=null;try{localStorage.removeItem(SAVE_KEY);}catch(e){}newCareer();}},{t:"Title screen",f:title}]);}

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

/* ===================== STORYLINES: GRASSROOTS & JUNIOR ===================== */
EV({id:"promoter_bonus",t:"Promoter's Proposition",st:["grass"],not:["kart"],cond:()=>G.car.s&&tkt(SER[G.car.s].cal[0][0])!=="kart"?{p:genName("USA")}:null,s:{start:c=>({x:`${esc(c.p)}, who runs the local track, leans on your trailer. "Fans love your car. Run our midweek special and I'll slip you appearance money. Bring a crowd and there's more."`,
 ch:[["Run the special",()=>{earn(cashScale()*.8|0,"Appearance money");fame(1);G.me.hp=clamp(G.me.hp-8,0,100);seatTime(tkt(SER[G.car.s].cal[0][0]),.5);return "A wild midweek show. You finish fourth, sign autographs for an hour and drive home at 2 a.m.";}],
  ["Ask for more money first",()=>{if(R.chance(.5)){earn(cashScale()*1.4|0,"Appearance money");return `${esc(c.p)} grumbles and pays. You put on a show.`;}rel("media",-1);return `"Forget it, kid. Plenty of guys would race for free." The offer's gone.`;}],
  ["Pass: rest and work on the car",()=>{G.car.testB=(G.car.testB||0)+.5;return "You spend the night in the garage instead. The car will be better for it.";}]]})}});
EV({id:"tech_flag",t:"Trouble in Tech",st:["grass"],cond:()=>({o:genName("USA")}),s:{start:c=>({x:`Post-race tech. Inspector ${esc(c.o)} frowns at your ${R.pick(["carburetor spacer","rear spring","ride height","tire durometer"])}. "This looks out of spec."`,
 ch:[["Calmly ask them to measure again",()=>{if(R.chance(.6+G.me.sk.fbk/300)){rep(1);return "Second measurement: legal by a hair. The inspector shrugs and waves you through.";}spend(cashScale()*.3|0,"Fine");return "Still out. A fine and a stern warning.";}],
  ["Argue loudly",()=>{if(R.chance(.3)){fame(1);return "The crowd at the tech shed cheers you on. The inspector gives up.";}spend(cashScale()*.4|0,"Fine");rep(-1);rel("media",-2);return "Bad idea. You lose your points from the night and pay a fine.";}],
  ["Accept the penalty",()=>{rep(.5);return "You take your medicine. The old-timers nod: that kid has class.";}]]})}});
EV({id:"veteran_parts",t:"Hand-Me-Down Parts",st:["grass"],cond:()=>({v:genName("USA")}),s:{start:c=>({x:`${esc(c.v)}, a gray-haired local legend who won here for twenty years, waves you over. "I'm hanging it up. Got a shed full of parts. They're yours if you want 'em, just promise you'll win with 'em."`,
 ch:[["Accept gratefully",()=>{if(G.car.tm==="priv")carUp(1.5);rel("fans",3);return "Shocks, gears, spare noses and a notebook of setups going back to 1998. Priceless.";}],["Offer to pay him something",()=>{spend(cashScale()*.5|0,"Parts");if(G.car.tm==="priv")carUp(2);rep(1);return `"Respect," he says, shaking your hand. He throws in his favorite set of shocks.`;}],
  ["Ask him to coach you instead",()=>{gainSk("crf",.8);gainSk("sht",.6);later("veteran_mentor_followup",R.int(6,12),{});return "He grins. \"Now that I can do.\" You spend Sunday afternoons learning his lines.";}]]})}});
EV({id:"veteran_mentor_followup",t:"The Old Man's Last Lesson",s:{start:()=>({x:"Your mentor watches from the grandstands, arms crossed. Afterward he says: \"You're quick. But you race the guy next to you instead of the track. Race the track.\"",ch:[["Take it to heart",()=>{gainSk("con",1);gainSk("crf",.5);return "Something clicks. Smoother hands, calmer mind.";}],["Argue that racing is about beating people",()=>{gainSk("ovt",.8);return "He laughs. \"Then go beat 'em.\"";}]]})}});
EV({id:"local_paper",t:"Front Page of the Sports Section",st:["grass"],cond:()=>G.st.races.length>=2?{}:null,s:{start:()=>({x:`The ${esc(G.me.home.split(",")[0])} newspaper wants to profile the local kid going racing. The reporter asks what your dream is.`,
 ch:[["\"The Daytona 500. Or Indy. Or Formula 1. All of it.\"",()=>{fame(2);rel("media",3);return "The headline reads: LOCAL RACER DREAMS BIG. Your mom buys ten copies.";}],["\"Win this weekend. That's all I think about.\"",()=>{rep(1);rel("media",1);return "The old racers at the track appreciate the humility.";}],["Mention your sponsors (or that you need some)",()=>{if(R.chance(.4)){const sp=newSponsorOffer();return {screen:()=>sponsorOfferScreen(sp)};}fame(1);return "No calls yet, but your name's out there.";}]]})}});
EV({id:"family_strain",t:"Kitchen Table Talk",st:["grass"],not:["own"],cond:()=>G.me.bg!=="rich"&&G.me.cash<cashScale()*6?{}:null,s:{start:()=>({x:"Your parents sit you down. Racing is eating the family budget alive. Dad has worked overtime for months. \"We want this for you. We just don't know how much longer we can do it.\"",
 ch:[["Get a part-time job and pay your own way",()=>{earn(cashScale()*2|0,"Job savings");G.me.hp=clamp(G.me.hp-5,0,100);rel("fam",8);morale(-2);return "Early shifts before school or work, races on weekends. Exhausting, but it's yours.";}],["Sell the spare engine",()=>{earn(cashScale()*3|0,"Sold parts");if(G.car.tm==="priv")carUp(-1.5);return "It hurts to watch it go, but the bills are paid.";}],["Promise to find sponsors",()=>{rel("fam",3);G.fl.sponPromise=1;later("family_strain_followup",8,{});return "You start a list of every business in town.";}],["Ask your grandparents for help",()=>{earn(cashScale()*2.5|0,"Family loan");rel("fam",-2);return "Grandpa writes a check and says, \"Pay me back with a trophy.\"";}]]})}});
EV({id:"family_strain_followup",t:"The Promise",s:{start:()=>({x:G.car.spons.length?"You kept your word: sponsors are on the car. Dad tears up a little at the track.":"Eight weeks later: no sponsors. Your parents don't say anything, which is worse.",ch:[[G.car.spons.length?"Hug your dad":"Work harder",()=>{if(G.car.spons.length){rel("fam",10);morale(5);return "He pretends there's dust in his eye.";}morale(-4);gainSk("med",.6);return "You start cold-calling businesses in the next county too.";}]]})}});
EV({id:"school_exams",t:"Exams vs. Race Weekend",st:["junior"],cond:()=>({}),s:{start:()=>({x:"Finals week lines up with the biggest race of the month. Your teachers aren't impressed by \"I'm a race car driver.\"",
 ch:[["Study hard, skip testing",()=>{rel("fam",6);G.car.testB=0;morale(-1);return "Straight A's... well, B-plus. Your parents are thrilled.";}],["Race first, cram later",()=>{gainSk("crf",.4);rel("fam",-6);return "You barely pass. Mom is not happy.";}],["Bring the textbooks to the track",()=>{gainSk("con",.3);rel("fam",2);return "Flashcards between heat races. It sort of works.";}]]})}});
EV({id:"rival_dumped_you",t:"Bumped and Run",st:["grass"],cond:()=>{const d=ficD();return d?{d}:null;},s:{start:c=>({x:`${D(c.d)} moved you out of the way for a spot last weekend, a classic bump and run. Their crew laughed about it in the pits.`,
 ch:[["Return the favor next week",()=>{rel("d:"+c.d,-15);later("payback_result",R.int(1,3),{d:c.d});return "You circle the date. Payback is coming.";}],["Talk to them like an adult",()=>{if(R.chance(.55)){rel("d:"+c.d,10);rep(1);return `${esc(nm(c.d))} admits it was a cheap shot. You shake hands.`;}rel("d:"+c.d,-5);return `${esc(nm(c.d))} shrugs. "That's racing."`;}],["Let it go and beat them on speed",()=>{gainSk("con",.4);morale(-1);return "Your mechanic nods. \"Beat 'em on the stopwatch.\"";}]]})}});
EV({id:"payback_result",t:"Payback",s:{start:c=>({x:`Feature race, ten laps to go. ${D(c.d)} is right in front of you. You've got a run into turn three.`,
 ch:[["Put the bumper to them",()=>{if(R.chance(.5)){rel("d:"+c.d,-10);fame(2);rep(-1);return "They spin. The crowd roars, half cheering and half booing. Officials send you to the back, but the message is delivered.";}spend(cashScale()*.4|0,"Repairs");rel("d:"+c.d,-10);return "You both wreck. Two torn-up cars and a long night of repairs.";}],["Pass them clean",()=>{rep(2);rel("d:"+c.d,5);gainSk("ovt",.5);return "You get the run and drive right around them. The best kind of revenge.";}]]})}});
EV({id:"pit_confrontation",t:"An Angry Racing Dad",st:["grass","junior"],cond:()=>{const d=ficD();return d?{d}:null;},s:{start:c=>({x:`${esc(nm(c.d))}'s father storms over to your pit after the feature, red-faced. "Your kid wrecked mine! Who's paying for that nose?"`,
 ch:[["Stay calm and apologize for the contact",()=>{rep(1);rel("d:"+c.d,4);return "He calms down. The track officials, watching, are impressed.";}],["Get your own family involved",()=>{rel("d:"+c.d,-10);rel("fam",-3);fame(1);return "It turns into a shouting match by the concession stand. The track bans both dads for a week.";}],["Show him the video: it wasn't your fault",()=>{if(R.chance(.6)){rel("d:"+c.d,2);return "He watches it twice, mumbles something, and walks away.";}rel("d:"+c.d,-6);return "He doesn't care what the video says.";}]]})}});
EV({id:"engine_builder",t:"Engine Builder's Offer",st:["grass"],cond:()=>G.car.tm==="priv"?{b:genName("USA").split(" ")[1]+" Racing Engines"}:null,s:{start:c=>({x:`${esc(c.b)} offers a fresh motor at cost if you run their decal and tell everyone where the power came from.`,
 ch:[["Deal",()=>{spend(cashScale()*1.2|0,"Engine");carUp(2.5);rel("sp:"+c.b,10);return "The new motor screams. You're quicker everywhere.";}],["Ask to pay over time",()=>{carUp(2);G.fl.engineDebt=cashScale()*1.5|0;later("engine_debt",10,{b:c.b});return "They agree. The bill comes later.";}],["No thanks",()=>"You stick with your old motor."]]})}});
EV({id:"engine_debt",t:"The Engine Bill",s:{start:c=>({x:`${esc(c.b)} calls about the engine payment: ${money(G.fl.engineDebt||1000)}.`,ch:[["Pay it",()=>{spend(G.fl.engineDebt||1000,"Engine bill");G.fl.engineDebt=0;rep(1);return "Paid in full. Your word is good.";}],["Ask for more time",()=>{rep(-2);rel("sp:"+c.b,-10);if(G.TM.priv)carUp(-1);return "They take back some parts. Word gets around that you're slow to pay.";}]]})}});
EV({id:"trailer_trouble",t:"Broken Down on the Interstate",st:["grass"],cond:()=>({}),s:{start:()=>({x:"The tow truck's transmission dies 60 miles from the track. It's 2 p.m. and the drivers' meeting is at 5.",
 ch:[["Call every racer you know for a tow",()=>{if(R.chance(.6)){rel("fans",3);return "A rival family stops and hauls your car the rest of the way. Racing people are the best people.";}morale(-3);return "Nobody's free. You miss the race.";}],["Pay for an emergency rental",()=>{spend(cashScale()*.6|0,"Rental truck");return "Expensive, but you make the drivers' meeting with ten minutes to spare.";}],["Fix it on the side of the road",()=>{gainSk("fbk",.6);if(R.chance(.4))return "Duct tape and determination. You make it.";morale(-3);return "You can't fix it. Long night.";}]]})}});
EV({id:"mentor_champ",t:"The Track Champion",st:["grass","junior"],cond:()=>({v:genName("USA")}),s:{start:c=>({x:`${esc(c.v)}, a seven-time track champion who once ran a few national touring races, offers to coach you for the rest of the season.`,
 ch:[["Pay for weekly coaching",()=>{spend(cashScale()*1.5|0,"Coaching");gainSk("crf",1);gainSk("con",.8);gainSk("rdc",.4);gainSk("sht",.4);return "Hours of video review and laps in the passenger seat of a street car. You learn a lot.";}],["Offer to work in his shop in exchange",()=>{gainSk("fbk",1);gainSk("crf",.5);G.me.hp=clamp(G.me.hp-5,0,100);return "Sweeping floors, rebuilding shocks, soaking up wisdom.";}],["Politely decline",()=>"You'd rather learn on your own."]]})}});
EV({id:"chassis_offer",t:"A New Chassis",st:["grass"],cond:()=>G.car.tm==="priv"?{}:null,s:{start:()=>({x:"A chassis builder offers you a brand-new car at a discount. Their cars are winning everywhere this year.",
 ch:[["Buy it",()=>{spend(cashScale()*2.5|0,"New chassis");carUp(3.5);return "Fresh welds, new geometry. The car is a weapon.";}],["Buy a used one from a top team",()=>{spend(cashScale()*1.2|0,"Used chassis");carUp(1.8);return "A bit tired, but it won races last year.";}],["Keep your old car",()=>{gainSk("fbk",.3);return "You know every bolt on it. That counts for something.";}]]})}});
EV({id:"viral_video",t:"Gone Viral",st:["grass","ladder"],cond:()=>G.st.races.length>=3?{}:null,s:{start:()=>({x:"Your in-car camera from last week's race, with a three-wide save on the last lap, has a million views overnight.",
 ch:[["Lean in: start posting regularly",()=>{fame(4);gainSk("med",.8);rel("fans",6);return "Your follower count explodes. Sponsors start paying attention.";}],["Stay humble: just say thanks",()=>{fame(2);rep(1);return "People like the humility.";}],["Use it to pitch sponsors",()=>{const sp=newSponsorOffer();sp.amt=Math.round(sp.amt*1.3);return {screen:()=>sponsorOfferScreen(sp)};}]]})}});
EV({id:"scholarship",t:"Rising Star Scholarship Shootout",st:["grass","junior"],cond:()=>G.me.age<=22&&G.st.races.length>=4?{}:null,cd:60,s:{start:()=>({x:"A national racing scholarship invites twelve young drivers to a two-day shootout. The prize is a funded season in the next series up, plus coaching.",
 ch:[["Go for it",()=>{const r=OVR()+R.gauss()*6+G.me.sk.med/10;if(r>=56){G.fl.scholar=G.yr;const amt=cashScale()*20;earn(amt,"Scholarship");rep(4);fame(3);addNews(`${G.me.name} wins the Rising Star Scholarship shootout.`,true);return "You win it! Fastest in the car, best in the interviews. The check is huge.";}rep(1);gainSk("qul",.5);return "You make the final four but come up short. The judges tell you to come back next year.";}],["Skip it: focus on your season",()=>"You stay home and work on your car."]]})}});
EV({id:"county_fair",t:"County Fair Special",st:["grass"],not:["kart"],cond:()=>({}),s:{start:()=>({x:"The county fair is running a figure-8 and demolition-style 'run what you brung' race with a $2,000 to win purse. Your mechanic grins. \"We have that old junker in the back...\"",
 ch:[["Enter the junker!",()=>{if(R.chance(.35+OVR()/250)){earn(2000,"Fair purse");fame(2);return "You win the figure-8! The local TV station interviews you holding a giant check.";}if(R.chance(.15)){const inj=hurt(1);return `You T-bone a minivan at the crossover and get banged up: ${esc(inj)}.`;}fame(1);return "You lose a wheel on lap 6. The crowd loved it anyway.";}],["Watch from the grandstand with a funnel cake",()=>{morale(4);return "A rare night off. You laugh until your stomach hurts.";}]]})}});
EV({id:"local_diner",t:"The Diner Owner",st:["grass"],cond:()=>({n:R.pick(["Rosie's Diner","Big Al's BBQ","Main Street Pizza","Hank's Tire & Lube","Twin Oaks Hardware"])}),s:{start:c=>({x:`The owner of ${esc(c.n)} has been watching you race for years. "I can't do much. But I can do something."`,
 ch:[["Put their name on the car",()=>{G.car.spons.push({n:c.n,amt:cashScale()*3|0,sat:70,lvl:1,duty:1});rel("sp:"+c.n,10);return `${esc(c.n)} goes on the rear quarter panel. Free meals on race nights too.`;}],["Ask for free meals instead",()=>{G.me.hp=clamp(G.me.hp+5,0,100);morale(3);return "Unlimited pancakes. Your crew is very happy.";}]]})}});
EV({id:"trailer_theft",t:"Stolen",st:["grass","priv"],cd:150,cond:()=>G.car.tm==="priv"?{}:null,s:{start:()=>({x:"You walk outside on Saturday morning and the trailer is gone. Car, tools, spares, everything.",
 ch:[["Post it everywhere online",()=>{if(R.chance(.5)){fame(2);rel("fans",5);return "The racing community is incredible. It's found two counties over by Wednesday, mostly intact.";}carUp(-4);spend(cashScale()*2|0,"Replacement parts");return "It's never found. You start over with borrowed parts.";}],["File an insurance claim",()=>{carUp(-2);earn(cashScale()|0,"Insurance");return "The insurance money doesn't cover everything, but it's a start.";}]]})}});
EV({id:"kart_shop",t:"The Kart Shop",st:["kart"],cond:()=>({n:R.pick(["Apex Kart Works","Velocity Karting","Precision Kart Shop","Podium Karts"])}),s:{start:c=>({x:`${esc(c.n)} offers you a factory-supported seat for the next few races: their best chassis, their tuner, but you have to run their colors and help with customer days.`,
 ch:[["Accept",()=>{carUp(2);G.me.hp=clamp(G.me.hp-5,0,100);gainSk("fbk",.5);return "Factory support! Your kart is suddenly very fast.";}],["Stay independent",()=>"You keep your own program. Freedom matters."]]})}});
EV({id:"move_to_europe",t:"Move to Europe?",st:["kart","junior"],once:1,cond:()=>G.me.age>=12&&G.me.age<=16?{}:null,s:{start:()=>({x:"A European karting team scout watched you at a national event. \"If you want Formula 1, you need to race in Europe. Italy, Belgium, the big championships. It's expensive and lonely. But it's the path.\"",
 ch:[["Move to Italy with the team",()=>{G.fl.euro=1;spend(cashScale()*4|0,"Moving costs");gainSk("rdc",1.5);gainSk("crf",1);rep(3);rel("fam",-5);return "You move into a tiny flat near the kart factory. The level is unreal, and you get better every week.";}],["Stay in America",()=>{rel("fam",5);return "You'll take the American route: maybe Road to Indy, maybe stock cars.";}]]})}});
EV({id:"dad_crewchief",t:"Dad Wants to Be Crew Chief",st:["grass"],once:1,cond:()=>G.car.tm==="priv"?{}:null,s:{start:()=>({x:"Your dad has been turning wrenches since you started. Now he wants to call the shots on setup and strategy. He knows a lot, but you've been learning things he doesn't know.",
 ch:[["Let him run it",()=>{rel("fam",10);G.car.cc="Dad";gainSk("fbk",.3);return "He's in heaven. Some of his calls are brilliant; some are from 1985.";}],["Hire a real crew chief",()=>{spend(cashScale()*1.5|0,"Crew chief");G.car.cc=genStaff("cc"+absWk());rel("fam",-6);carUp(1);return "Dad is hurt, but he understands. The new guy is sharp.";}],["Make it a partnership",()=>{rel("fam",5);gainSk("fbk",.5);return "You split decisions. Sometimes it's chaos, sometimes it's magic.";}]]})}});
EV({id:"fan_kid",t:"Your Biggest Fan",st:["grass","ladder"],cond:()=>G.me.fame>=8?{}:null,s:{start:()=>({x:"A seven-year-old in a homemade firesuit with your number on it waits by your hauler. He's too shy to speak.",
 ch:[["Give him your gloves",()=>{fame(1);rel("fans",8);morale(5);return "His face lights up like a Christmas tree. His mom posts the photo and it goes everywhere.";}],["Let him sit in the car",()=>{rel("fans",6);morale(6);return "He grips the wheel and makes engine noises. You remember being that kid.";}]]})}});
EV({id:"protest_win",t:"Protested",st:["grass"],cond:()=>G.st.races.some(r=>r.f===1&&r.yr===G.yr)&&ficD()?{d:ficD()}:null,s:{start:c=>({x:`${D(c.d)} files a protest against your win, claiming your engine isn't legal. Tearing it down costs money, and if you refuse, you forfeit.`,
 ch:[["Tear it down",()=>{spend(cashScale()*.5|0,"Teardown");if(R.chance(.9)){rep(2);rel("d:"+c.d,-8);return "Legal. Every part. You collect the protest fee and a lot of respect.";}rep(-4);return "Something's out by a few thousandths. You lose the win.";}],["Refuse and forfeit",()=>{rep(-3);return "People will talk. You keep your secrets.";}]]})}});
EV({id:"midnight_garage",t:"Midnight in the Garage",st:["grass","priv"],cond:()=>({f:genName("USA")}),s:{start:c=>({x:`Your best friend ${esc(c.f)} shows up at 11 p.m. with pizza and a toolbox. "Figured you could use a hand." The car needs a full rebuild before Saturday.`,
 ch:[["Pull an all-nighter together",()=>{G.car.testB=(G.car.testB||0)+.8;G.me.hp=clamp(G.me.hp-10,0,100);morale(5);return "At 6 a.m. the car is done. You fall asleep on a pile of tires.";}],["Send them home and sleep",()=>{G.me.hp=clamp(G.me.hp+5,0,100);return "You'll finish tomorrow. Mostly.";}]]})}});
EV({id:"bad_fuel",t:"Bad Fuel",st:["grass"],cond:()=>({}),s:{start:()=>({x:"Half the pit area is sputtering: a bad batch of fuel from the track pumps. Your car is coughing too.",
 ch:[["Drain it and buy race fuel from a rival",()=>{spend(cashScale()*.2|0,"Race fuel");rep(1);return "Expensive, but you're one of the few cars running right. You finish strong.";}],["Run it and hope",()=>{if(R.chance(.5))return "It clears up after a few laps. Lucky.";if(G.car.tm==="priv")carUp(-1);return "The motor pings all night. It'll need a freshen.";}]]})}});
EV({id:"track_closing",t:"The Track Is Closing",st:["grass"],cd:200,cond:()=>({t:R.pick(["Cedar Valley Speedway","Thunder Road Raceway","Riverside Speedway","Copper Creek Clay"])}),s:{start:c=>({x:`${esc(c.t)}, where you ran your first laps, is being sold to developers. The last race night is a big one.`,
 ch:[["Lead a petition to save it",()=>{fame(2);rel("fans",8);if(R.chance(.25)){addNews(`Local racers save ${c.t} from closing.`,true);return "Against all odds, a group of local businesses buys the track. It's saved!";}return "Thousands sign. The sale goes through anyway, but people remember you fought.";}],["Win the last race ever held there",()=>{if(R.chance(.35+OVR()/300)){fame(2);morale(8);return "You win the final race ever held there. You take a chunk of the start-finish line home.";}morale(-2);return "You finish fifth. Somebody else will be in the history books.";}]]})}});
EV({id:"banger_invite",t:"Invite to a Big Grassroots Race",st:["grass"],cond:()=>({}),s:{start:()=>({x:"A promoter invites you to a big-money special a few states away. The top racers in the region will be there.",
 ch:[["Make the trip",()=>{spend(cashScale()*.6|0,"Travel");const r=OVR()+R.gauss()*8;if(r>=SER[G.car.s].lvl+6){earn(cashScale()*3|0,"Prize money");rep(3);fame(2);return "You win the whole thing against the best in the region!";}if(r>=SER[G.car.s].lvl){earn(cashScale()|0,"Prize money");rep(1);return "A top-five finish against a stacked field. People noticed.";}seatTime("sht",.5);return "A rough night: mid-pack, but you learned a lot.";}],["Stay home",()=>"Not worth the gas money."]]})}});
EV({id:"junior_media_training",t:"Media Training",st:["junior","grass"],cond:()=>({}),s:{start:()=>({x:"A family friend who works in TV offers to teach you how to do interviews: hit the sponsors, smile, don't say anything dumb.",ch:[["Take the lessons",()=>{gainSk("med",1.5);return "\"Well, the Hometown Tire & Lube Chevrolet was really good today...\" You're a natural.";}],["Nah, just be yourself",()=>{fame(1);return "Your awkward, honest interviews become a local favorite.";}]]})}});

/* ===================== STORYLINES: PRO RACING (on-track & contract stories may involve real drivers; off-track drama is fictional only) ===================== */
EV({id:"engineer_clash",t:"Setup Philosophy",st:["team"],cond:()=>({}),s:{start:()=>({x:`You want the car freer on entry. ${cc()}, your ${ccW()}, insists the data says tighter. The debrief is getting tense.`,
 ch:[["Trust the data",()=>{rel("cc",5);G.car.testB=(G.car.testB||0)+.4;return "You drive what they give you. The data was right, mostly.";}],["Insist on your setup",()=>{if(R.chance(.5+G.me.sk.fbk/250)){G.car.testB=(G.car.testB||0)+1;rel("cc",2);return "Your feel was right. The car comes alive.";}rel("cc",-6);G.car.testB=0;return "It's a disaster in practice. The silence in the debrief room is deafening.";}],["Find a compromise",()=>{rel("cc",2);G.car.testB=(G.car.testB||0)+.6;gainSk("fbk",.4);return "Half of each idea. It works better than either.";}]]})}});
EV({id:"teammate_quali",t:"Teammate Tension",st:["team"],cond:()=>{const m=mateId();return m?{d:m}:null;},s:{start:c=>({x:`In qualifying, ${D(c.d)} ${R.pick(["took the tow you were supposed to get","didn't let you by on their cool-down lap","got the newer parts this weekend"])}. Everyone in the team is waiting to see how you react.`,
 ch:[["Raise it privately with the team",()=>{rel("t:"+G.car.tm,2);rel("d:"+c.d,-2);return "The team promises it won't happen again. Your teammate gives you a cool nod.";}],["Call it out in the media",()=>{fame(2);rel("d:"+c.d,-12);rel("t:"+G.car.tm,-6);rel("media",3);addNews(`${G.me.name} publicly criticizes a teammate after qualifying.`,true);return "The quote makes headlines. The team is furious, the fans love the drama.";}],["Let your driving do the talking",()=>{rep(1);gainSk("qul",.4);return "You'll just be faster next week.";}]]})}});
EV({id:"media_rival",t:"Press Conference",st:["pro"],cond:()=>{const d=rivalD()||(G.car.s?standings(G.car.s).filter(r=>r.id!=="me")[0]:null)&&standings(G.car.s).filter(r=>r.id!=="me")[0].id;return d&&G.D[d]?{d}:null;},s:{start:c=>({x:`A reporter asks about ${D(c.d)}: "Are they the one to beat this year?"`,
 ch:[["\"They're great. I'm going to beat them anyway.\"",()=>{fame(2);rel("d:"+c.d,-3);return "Confident, not disrespectful. The quote runs everywhere.";}],["Praise them generously",()=>{rel("d:"+c.d,6);rep(1);return "They return the compliment later. Mutual respect.";}],["\"I don't think about other drivers.\"",()=>{rel("media",-1);return "The reporters sigh. Not much of a story.";}]]})}});
EV({id:"contact_aftermath",t:"Contact on Track",st:["pro"],cond:()=>{const d=anyD();return d?{d,fic:!G.D[d].r}:null;},s:{start:c=>({x:`You and ${D(c.d)} made contact battling for position last race. ${c.fic?`They walk up to you in the garage, still in their firesuit, clearly fuming.`:`Afterward, ${esc(nmShort(c.d))} told reporters they weren't happy with how you raced them.`}`,
 ch:[["Apologize: your fault",()=>{rel("d:"+c.d,8);rep(1);return "Clean and classy. Things settle down.";}],["Stand your ground: hard racing",()=>{rel("d:"+c.d,-10);fame(1);G.fl.feud=c.d;later("feud_round2",R.int(3,7),{d:c.d});return "You think it was a racing incident and you say so. This isn't over.";}],["Watch the replay together",()=>{if(R.chance(.5)){rel("d:"+c.d,5);return "You both see it differently, but you agree to give each other room.";}rel("d:"+c.d,-4);return "Watching it again just makes things worse.";}]]})}});
EV({id:"feud_round2",t:"Round Two",valid:c=>G.car.s&&G.D[c.d]&&G.D[c.d].s===G.car.s,s:{start:c=>({x:`Late in the race you find yourself side by side with ${D(c.d)} again. Last time it ended badly.`,
 ch:[["Give them room",()=>{rel("d:"+c.d,8);rep(1);return "You race them clean and finish nose to tail. Afterward there's a fist bump. Feud over.";}],["Race them hard, no quarter",()=>{if(R.chance(.5)){rel("d:"+c.d,-5);fame(2);return "You make the pass stick and drive off. The broadcast replays it all week.";}rel("d:"+c.d,-10);G.stats.crashes++;rep(-1);return "You both end up in the wall. The officials call you both to the hauler.";}]]})}});
EV({id:"penalty_contact",t:"Called to the Stewards",st:["pro"],cond:()=>({}),s:{start:()=>({x:"The officials review your move from last race and want to see you. A penalty is possible.",
 ch:[["Bring the data and argue your case",()=>{if(R.chance(.5+G.me.sk.med/300))return "They accept your explanation. No further action.";spend(cashScale()*.3|0,"Fine");return "They don't buy it. Fine issued.";}],["Accept responsibility",()=>{spend(cashScale()*.15|0,"Fine");rep(1);return "A small fine and a reputation for honesty.";}],["Criticize the officials publicly",()=>{spend(cashScale()*.5|0,"Fine");fame(2);rep(-2);rel("media",2);return "The fans cheer you on. The officials fine you again for the comments.";}]]})}});
EV({id:"manufacturer_program",t:"Manufacturer Development Program",st:["ladder","grass"],cond:()=>OVR()>=50&&G.me.age<=24?{m:R.pick(["Toyota","Chevrolet","Ford","Honda","Porsche","BMW","Ferrari","Mercedes"])}:null,cd:120,s:{start:c=>({x:`${esc(c.m)}'s driver development people want you in their program: sim access, fitness coaching, and a word in the right ears. They want loyalty in return.`,
 ch:[["Join the program",()=>{G.fl.mfr=c.m;gainSk("qul",.6);gainSk("fit",.6);rep(3);addNews(`${G.me.name} joins the ${c.m} driver development program.`,true);return `You're officially a ${esc(c.m)} development driver. Doors are opening.`;}],["Keep your options open",()=>"You stay independent. Your agent says it might cost you, or might pay off later."]]})}});
EV({id:"sponsor_conflict",t:"Sponsor Day vs. Test Day",st:["pro","team"],cond:()=>mySponsor()?{}:null,s:{start:()=>({x:`${esc(mySponsor().n)} wants you at a corporate event on the same day as the team's test.`,
 ch:[["Go to the sponsor event",()=>{mySponsor().sat=clamp(mySponsor().sat+10,0,100);G.car.testB=0;rel("cc",-3);return "Handshakes, photos and a speech. The sponsor is very happy.";}],["Go to the test",()=>{mySponsor().sat=clamp(mySponsor().sat-12,0,100);G.car.testB=(G.car.testB||0)+1;return "The car is better. The sponsor is not.";}],["Do both: fly back and forth",()=>{G.me.hp=clamp(G.me.hp-12,0,100);mySponsor().sat=clamp(mySponsor().sat+5,0,100);G.car.testB=(G.car.testB||0)+.5;return "Two cities in one day. Exhausting, but everyone's happy.";}]]})}});
EV({id:"sponsor_unhappy",t:"An Unhappy Sponsor",st:["any"],not:["retired"],cond:()=>{const s=G.car.spons.find(x=>x.sat<35);return s?{n:s.n}:null;},s:{start:c=>({x:`${esc(c.n)}'s marketing director calls. "We're not seeing the return we expected."`,
 ch:[["Promise more appearances",()=>{const s=G.car.spons.find(x=>x.n===c.n);if(s)s.sat+=20;G.me.hp=clamp(G.me.hp-6,0,100);return "Your calendar fills up with store visits and golf outings.";}],["Promise better results",()=>{const s=G.car.spons.find(x=>x.n===c.n);if(s)s.sat+=8;G.fl.promise=1;return "\"We'll hold you to that.\"";}],["Let them walk",()=>{G.car.spons=G.car.spons.filter(x=>x.n!==c.n);return "They're gone. You'll find someone else.";}]]})}});
EV({id:"sponsor_bonus",t:"Bonus Offer",st:["any"],not:["retired"],cond:()=>{const s=G.car.spons.find(x=>x.sat>=75);return s?{n:s.n}:null;},s:{start:c=>({x:`${esc(c.n)} loves the partnership. They offer a performance bonus: hit a target and they double the check.`,
 ch:[["Accept: a top five this month",()=>{G.fl.spBonus={n:c.n,wk:absWk()+5};later("sponsor_bonus_check",5,{n:c.n});return "Game on.";}],["Ask for a guaranteed raise instead",()=>{const s=G.car.spons.find(x=>x.n===c.n);if(s&&R.chance(.5)){s.amt=Math.round(s.amt*1.15);return "They agree to a 15% raise.";}return "They'd rather do the bonus. Maybe next year.";}]]})}});
EV({id:"sponsor_bonus_check",t:"Bonus Time",s:{start:c=>{const ok=G.st.races.some(r=>r.f<=5&&r.yr*52+r.wk>=absWk()-5);return {x:ok?`You hit the target. ${esc(c.n)} pays up.`:`No top five. ${esc(c.n)} is disappointed.`,ch:[["Continue",()=>{const s=G.car.spons.find(x=>x.n===c.n);if(ok&&s){earn(Math.round(s.amt*.5),"Sponsor bonus");s.sat+=5;}else if(s)s.sat-=5;return "";}]]};}}});
EV({id:"driver_council",t:"Drivers' Council",st:["top"],once:1,cond:()=>G.me.rep>=50?{}:null,s:{start:()=>({x:"Your fellow drivers want you to represent them on the drivers' council: safety, schedules, rules and money.",
 ch:[["Accept the role",()=>{rep(4);rel("media",3);G.fl.council=1;return "You spend late nights on conference calls about tire allocation and SAFER barriers. People respect you more.";}],["Decline: focus on driving",()=>"You've got enough on your plate."]]})}});
EV({id:"contract_rumor_you",t:"Linked With a Rival Team",st:["pro"],cond:()=>{if(!G.car.s)return null;const t=teamsOf(G.car.s).filter(x=>x.id!==G.car.tm&&!x.own&&!x.priv&&x.q>=myQ(G.car.tm)-3);return t.length?{tm:R.pick(t).id}:null;},s:{start:c=>({x:`A respected journalist reports that ${esc(tn(c.tm))} has asked about your availability. Your phone won't stop buzzing.`,
 ch:[["Deny everything",()=>{rel("t:"+G.car.tm,3);return "You say you're happy where you are. Your team appreciates it.";}],["\"I'm focused on this season.\" (Wink.)",()=>{rel("t:"+c.tm,4);rel("t:"+G.car.tm,-3);fame(1);if(R.chance(.5)){G.offers.push(mkOffer(G.TM[c.tm],"race",{note:"They called after the rumor."}));G.notes.push(`📄 ${esc(tn(c.tm))} made you an offer.`);}return "The rumor grows legs.";}],["Use it to push your team for a raise",()=>{if(G.car.con&&G.car.con.sal&&R.chance(.45)){G.car.con.sal=Math.round(G.car.con.sal*1.12);rel("t:"+G.car.tm,-2);return "Your team quietly bumps your salary 12%.";}rel("t:"+G.car.tm,-6);return "Your team doesn't take kindly to the pressure.";}]]})}});
EV({id:"cc_poached",t:"Your Crew Chief Gets an Offer",st:["team"],cond:()=>G.car.cc&&G.car.cc!=="Dad"?{}:null,s:{start:()=>({x:`${cc()} pulls you aside. A bigger team has offered them a job. "I'd rather stay with you. But that's a lot of money."`,
 ch:[["Ask the team to match it",()=>{if(R.chance(.55)){rel("cc",12);return "The team matches. Your partnership gets stronger.";}G.car.cc=genStaff("cc"+absWk());delete G.rel.cc;return "The team won't pay. You get a new crew chief and start from scratch.";}],["Tell them to take it",()=>{G.car.cc=genStaff("cc"+absWk());delete G.rel.cc;rep(1);return "You hug it out. The new person is good, but it takes time to gel.";}],["Chip in from your own salary",()=>{spend(cashScale()*2|0,"Crew chief raise");rel("cc",20);return "They're stunned. \"I'll never forget this.\"";}]]})}});
EV({id:"pit_mistakes",t:"Pit Road Woes",st:["team"],cond:()=>G.car.s&&PIT_SERIES[G.car.s]?{}:null,s:{start:()=>({x:"Two races in a row, your pit crew has cost you spots with slow stops. The crew is down. The team asks what you think.",
 ch:[["Back the crew publicly",()=>{rel("t:"+G.car.tm,3);rel("cc",4);return "The crew practices every morning. The stops get faster. They'll go to war for you.";}],["Demand changes",()=>{carUp(.6);rel("cc",-4);return "Two crew members get swapped out. The stops improve. The garage is colder.";}],["Bring donuts to pit practice",()=>{rel("cc",3);morale(2);return "Sometimes leadership is just showing up with breakfast.";}]]})}});
EV({id:"budget_cut",t:"Budget Cuts",st:["team"],cond:()=>onTeam()&&!G.TM[G.car.tm].r?{}:null,s:{start:()=>({x:`${esc(towner(G.car.tm))} calls a team meeting: a sponsor left, and the budget for the rest of the year is being cut.`,
 ch:[["Bring your own sponsor money to the team",()=>{const s=mySponsor();if(s){spend(Math.round(s.amt*.3),"Team support");rel("t:"+G.car.tm,10);return "Your contribution keeps the car competitive.";}carUp(-2);return "You don't have enough sponsorship to help.";}],["Accept it and make do",()=>{carUp(-2);return "Fewer tests, older parts. You'll have to drive around it.";}],["Start looking at other teams",()=>{rel("t:"+G.car.tm,-5);G.fl.askWk=0;return "Your agent starts making calls.";}]]})}});
EV({id:"upgrade_package",t:"The New Package",st:["team"],cond:()=>({}),s:{start:()=>({x:"The team brings a big upgrade package this weekend: new aero, new suspension. It's fast in the wind tunnel, untested on track.",
 ch:[["Run it",()=>{if(R.chance(.6)){carUp(1.5);return "It works! You gain real speed.";}carUp(-.5);return "It's a step backward. The team has to go back to the drawing board.";}],["Test it first, race the old spec",()=>{G.car.testB=(G.car.testB||0)+.5;if(R.chance(.7)){carUp(1);return "After a careful test, the package goes on next week. Solid gain.";}return "The test shows it doesn't work. Good thing you waited.";}]]})}});
EV({id:"rookie_hazing",t:"Rookie Welcome",st:["pro"],once:1,cond:()=>{const d=ficD(x=>G.yr-x.by>=30);return d?{d}:null;},s:{start:c=>({x:`Veteran ${D(c.d)} makes it clear in the drivers' meeting that rookies need to "learn their place."`,
 ch:[["Earn their respect on track",()=>{rel("d:"+c.d,5);gainSk("dfd",.5);return "You race them hard and clean all weekend. Afterward: \"Not bad, rookie.\"";}],["Say something back",()=>{rel("d:"+c.d,-10);fame(1);return "The room goes quiet. A few drivers smirk. You've made an enemy.";}],["Ask them for advice",()=>{rel("d:"+c.d,10);gainSk("crf",.4);return "They're surprised, then flattered. Turns out they're a good teacher.";}]]})}});
EV({id:"fitness_coach",t:"Elite Fitness Coach",st:["pro"],cond:()=>G.me.sk.fit<80?{n:genName("GBR")}:null,s:{start:c=>({x:`${esc(c.n)}, a trainer who has worked with top drivers, offers a year-long program: ${money(cashScale()*3|0)}.`,
 ch:[["Sign up",()=>{spend(cashScale()*3|0,"Trainer");gainSk("fit",2);G.me.hp=100;return "Brutal. Effective. Your neck is the size of a tree trunk.";}],["Pass",()=>"You'll stick to your own routine."]]})}});
EV({id:"performance_coach",t:"A Mental Edge",st:["pro"],cond:()=>({}),s:{start:()=>({x:"A sports psychologist offers sessions on visualization, pressure and focus.",
 ch:[["Try it",()=>{spend(cashScale()|0,"Sessions");gainSk("con",.8);morale(5);return "Breathing exercises, mental laps, pressure routines. You feel calmer under the lights.";}],["\"My head is fine.\"",()=>"You'll handle the pressure your way."]]})}});
EV({id:"charity_event",t:"Charity Ride-Along Day",st:["pro"],cond:()=>({}),s:{start:()=>({x:"A children's hospital charity asks if you'll host a ride-along day at the track.",
 ch:[["Absolutely",()=>{fame(2);rel("fans",8);morale(6);return "You give 40 hot laps and get more out of it than any of the kids.";}],["Donate money instead",()=>{spend(cashScale()|0,"Donation");rel("fans",3);return "A generous check, quietly delivered.";}]]})}});
EV({id:"hometown_parade",t:"Hometown Hero",st:["pro"],once:1,cond:()=>G.me.fame>=35?{}:null,s:{start:()=>({x:`${esc(G.me.home.split(",")[0])} wants to throw you a parade and put your name on a sign at the edge of town.`,
 ch:[["Ride in the parade",()=>{fame(3);rel("fans",10);rel("fam",8);morale(8);return "Your whole town lines Main Street. Your elementary school teacher hands you a drawing you made at age eight: a race car.";}],["Politely ask for a scholarship fund instead",()=>{rep(2);rel("fans",8);return "The Racing Dreams Scholarship is founded in your name.";}]]})}});
EV({id:"tv_reality",t:"Reality TV Offer",st:["pro"],cond:()=>G.me.fame>=30?{}:null,cd:150,s:{start:()=>({x:"A streaming service wants to film a behind-the-scenes series about your season. Big money, cameras everywhere.",
 ch:[["Sign on",()=>{earn(cashScale()*4|0,"TV deal");fame(5);G.fl.tvShow=1;later("tv_reality_followup",12,{});return "The cameras arrive Monday.";}],["Decline",()=>"You'd rather keep the garage private."]]})}});
EV({id:"tv_reality_followup",t:"The Show Airs",s:{start:()=>({x:"The series airs. The editors made a few of your heated radio messages look worse than they were.",ch:[["Laugh it off",()=>{fame(3);gainSk("med",.5);return "Your fanbase doubles. Nobody remembers the context, only the personality.";}],["Complain about the editing",()=>{rel("media",-3);fame(1);return "Complaining makes the clip go viral again.";}]]})}});
EV({id:"esports_invite",t:"Sim Racing Invitational",st:["any"],not:["retired"],cond:()=>G.me.sim>=1?{}:null,s:{start:()=>({x:"You're invited to a televised sim racing invitational with pro drivers and top sim racers.",
 ch:[["Go all in",()=>{const r=G.me.sk.qul+G.me.sim*5+R.gauss()*10;if(r>=75){fame(3);earn(cashScale()|0,"Prize");return "You win the invitational! The sim community is impressed.";}fame(1);return "You finish mid-pack. The sim racers are terrifyingly good.";}],["Stream it casually",()=>{fame(1);rel("fans",4);return "You crash out on lap one and laugh about it. Great content.";}]]})}});
EV({id:"tire_test",t:"Tire Test Invitation",st:["pro"],cond:()=>({}),s:{start:()=>({x:"The tire supplier invites you to a two-day tire test. Tons of laps, no pressure, valuable seat time.",
 ch:[["Accept",()=>{seatTime(G.car.s?tkt(SER[G.car.s].cal[0][0]):"road",1.5);gainSk("tir",.7);gainSk("fbk",.5);return "Hundreds of laps. You know more about tires than ever.";}],["Rest instead",()=>{G.me.hp=clamp(G.me.hp+10,0,100);return "A few days off. You needed it.";}]]})}});
EV({id:"fp1_outing",t:"FP1 Outing",st:["reserve"],cond:()=>({}),cd:8,s:{start:()=>({x:`${esc(tn(G.car.tm))} gives you the car for the first practice session this weekend.`,
 ch:[["Push for a headline time",()=>{if(R.chance(.15)){rel("t:"+G.car.tm,-6);return "You go off and damage the floor. Not the impression you wanted.";}rel("t:"+G.car.tm,6);rep(2);seatTime("road",1.2);return "You finish the session ahead of one of the regular drivers. The team notices.";}],["Do the test program perfectly",()=>{rel("t:"+G.car.tm,4);gainSk("fbk",.8);seatTime("road",1);return "Every item on the run plan, perfectly. The engineers love you.";}]]})}});
EV({id:"reserve_sim",t:"Simulator Duty",st:["reserve"],cond:()=>({}),cd:6,s:{start:()=>({x:"The team needs you in the simulator all night to develop the setup for the next race.",
 ch:[["Grind it out",()=>{gainSk("qul",.4);gainSk("fbk",.4);rel("t:"+G.car.tm,3);return "At 4 a.m. you find something: a setup direction that works. The race team uses it.";}],["Ask for a seat-time deal in return",()=>{if(R.chance(.4)){G.fl.reserveRace=1;rel("t:"+G.car.tm,1);return "They promise you an extra outing. Keep doing the work.";}rel("t:"+G.car.tm,-2);return "\"Just do your job.\"";}]]})}});
EV({id:"daytona_alliance",t:"Drafting Alliance",st:["stock"],cond:()=>G.car.s&&SER[G.car.s].tier>=5&&anyD()?{d:anyD()}:null,s:{start:c=>({x:`Before the next superspeedway race, ${D(c.d)} suggests working together in the draft.`,
 ch:[["Shake on it",()=>{rel("d:"+c.d,6);gainSk("drf",.5);return "You plan to work together until the final lap. After that, it's every driver for themselves.";}],["Stick with your manufacturer teammates",()=>{rel("t:"+G.car.tm,3);return "Team first.";}]]})}});
EV({id:"team_orders_fallout",t:"The Team Orders Fallout",st:["team"],cond:()=>G.fl.ignoredTO&&!G.fl.toFall?{}:null,s:{start:()=>({x:`${esc(towner(G.car.tm))} calls you to the office about the radio call you ignored.`,
 ch:[["Apologize",()=>{G.fl.toFall=1;rel("t:"+G.car.tm,5);return "\"Don't let it happen again.\"";}],["Stand by it: you race to win",()=>{G.fl.toFall=1;rel("t:"+G.car.tm,-8);fame(2);rep(1);return "Some respect you for it. Your boss isn't one of them.";}]]})}});
EV({id:"caution_controversy",t:"A Controversial Call",st:["pro"],cond:()=>G.st.races.length&&G.st.races[G.st.races.length-1].f>1&&G.st.races[G.st.races.length-1].f<=3?{}:null,s:{start:()=>({x:"A late caution or safety car last race wiped out your lead. Replays suggest it was unnecessary.",
 ch:[["Speak out",()=>{spend(cashScale()*.2|0,"Fine");fame(2);rel("media",2);return "\"That was ridiculous.\" The fans agree. The officials fine you for it.";}],["Stay diplomatic",()=>{rep(1);return "\"That's racing.\" You'll get it back.";}]]})}});
EV({id:"spotter_issue",t:"Spotter Trouble",st:["stock"],cond:()=>G.car.s&&SER[G.car.s].tier>=4?{n:genName("USA")}:null,s:{start:c=>({x:`Your spotter, ${esc(c.n)}, missed a call that nearly put you in the wall.`,
 ch:[["Give them another chance",()=>{rel("cc",2);return "They're dialed in the next week. Loyalty pays.";}],["Hire a veteran spotter",()=>{spend(cashScale()*.5|0,"New spotter");gainSk("drf",.4);gainSk("crf",.2);return "The new spotter has been on the roof for 25 years. Calm, precise, perfect.";}]]})}});
EV({id:"heat_wave",t:"Heat Wave",st:["season"],not:["kart"],cond:()=>G.wk>=24&&G.wk<=34?{}:null,s:{start:()=>({x:"Temperatures in the car will hit 140°F this weekend. Drivers are being warned about heat exhaustion.",
 ch:[["Heat training all week",()=>{gainSk("fit",.6);G.me.hp=clamp(G.me.hp-4,0,100);return "Sauna sessions in a firesuit. Brutal, but you're ready.";}],["Rest and hydrate",()=>{G.me.hp=clamp(G.me.hp+8,0,100);return "IVs and sleep. You'll be fine.";}]]})}});
EV({id:"illegal_part",t:"A Gray Area",st:["team","priv"],cond:()=>tierNow()>=3?{}:null,cd:120,s:{start:()=>({x:`${cc()} shows you a part. "It's... creative. Technically the rulebook doesn't say we can't. Technically."`,
 ch:[["Run it",()=>{carUp(1.5);G.fl.grayPart=1;later("illegal_caught",R.int(2,6),{});return "The car is noticeably faster.";}],["Not worth the risk",()=>{rep(.5);return "You'd rather win clean.";}]]})}});
EV({id:"illegal_caught",t:"Inspection Findings",valid:()=>G.fl.grayPart&&!!G.car.s,s:{start:()=>{const caught=R.chance(.45);return {x:caught?"Officials find the part in post-race inspection. The penalty is coming.":"Officials looked right at the part and moved on. You got away with it, but the rule is being clarified for next week.",ch:[["Continue",()=>{G.fl.grayPart=0;if(caught){const st=G.S[G.car.s];if(st&&st.tab.me){st.tab.me.p=Math.max(0,st.tab.me.p-(SER[G.car.s].pts==="nascar"?40:SER[G.car.s].pts==="grass"?40:10));}rep(-3);rel("media",-3);carUp(-1.5);spend(cashScale()|0,"Fine");addNews(`${G.me.name}'s team penalized after inspection.`,true);return "Points docked, fine paid, part confiscated.";}carUp(-1.5);return "The part comes off. No harm done.";}]]};}}});
EV({id:"data_offer",t:"Stolen Data",st:["pro"],cd:200,cond:()=>({e:genName("GBR")}),s:{start:c=>({x:`An engineer named ${esc(c.e)}, from a rival (fictional) team, offers you a USB drive with their setup data. "For a price."`,
 ch:[["Refuse and report it",()=>{rep(3);rel("media",2);return "The engineer is fired. You're seen as a person of integrity.";}],["Refuse quietly",()=>"You walk away and say nothing."],["Take it",()=>{G.car.testB=(G.car.testB||0)+2;later("data_scandal",R.int(4,10),{});return "The data is gold. You feel sick about it.";}]]})}});
EV({id:"data_scandal",t:"The Data Scandal",s:{start:()=>({x:"An investigation into leaked data has found your name. Your team is furious.",ch:[["Come clean",()=>{rep(-5);rel("t:"+G.car.tm,-10);spend(cashScale()*2|0,"Fine");addNews(`${G.me.name} fined for using leaked data from a rival team.`,true);return "You admit it. A fine and a ruined reputation, but you can rebuild.";}],["Deny everything",()=>{if(R.chance(.5))return "The investigation runs out of evidence.";rep(-10);G.car.sit=true;later("suspension_end",3,{});addNews(`${G.me.name} suspended for three weeks in the data scandal.`,true);return "The evidence is clear. You're suspended for three weeks.";}]]})}});
EV({id:"suspension_end",t:"Back in the Car",s:{start:()=>({x:"Your suspension is over.",ch:[["Get back to work",()=>{G.car.sit=false;return "Time to rebuild trust.";}]]})}});
EV({id:"merch_deal",t:"Merchandise Deal",st:["pro"],cond:()=>G.me.fame>=25?{}:null,s:{start:()=>({x:"A merchandise company wants to put your face on T-shirts, hats and diecast cars.",ch:[["Sign the deal",()=>{earn(cashScale()*2|0,"Merch deal");fame(2);return "Your first diecast arrives in the mail. You put it on the shelf next to your first trophy.";}],["Design the merch yourself",()=>{earn(cashScale()|0,"Merch");rel("fans",6);return "Your designs are a hit with the fans.";}]]})}});
EV({id:"video_game",t:"Video Game Rating",st:["top"],once:1,cond:()=>({}),s:{start:()=>({x:"Your rating in the official video game came out. It's... lower than you think it should be.",ch:[["Complain online (jokingly)",()=>{fame(2);rel("fans",5);return "The developers bump your rating in a patch and the fans love the bit.";}],["Use it as motivation",()=>{morale(4);return "You print it and tape it to your sim rig.";}]]})}});
EV({id:"cross_dirt",t:"Midweek Dirt Race",st:["pro"],not:["dirt"],cond:()=>!G.car.con||G.car.con.side?{}:null,s:{start:()=>({x:"A dirt track promoter offers you a guest ride in a midweek Sprint Car show. Lots of pros do it to stay sharp.",
 ch:[["Go play in the dirt",()=>{gainSk("drt",1);gainSk("crf",.4);const r=G.me.sk.drt+R.gauss()*10;if(r>=60){fame(2);rep(1);return "You win the feature! The dirt crowd adopts you as one of their own.";}if(R.chance(.08)){const inj=hurt(2);return `You flip in turn three. The car's ruined and you're hurt: ${esc(inj)}.`;}return "Mid-pack and filthy. Best night you've had in months.";}],["Team says no",()=>{rel("t:"+G.car.tm,2);return "Your team breathes a sigh of relief.";}]]})}});
EV({id:"early_extension",t:"An Early Extension",st:["team"],cond:()=>G.car.con&&G.car.con.end===G.yr&&!G.car.next&&relOf("t:"+G.car.tm)>=15&&G.TM[G.car.tm]&&!G.TM[G.car.tm].own?{}:null,s:{start:()=>({x:`${esc(towner(G.car.tm))} wants to extend your deal before silly season gets going.`,
 ch:[["Let's talk",()=>{const o=mkOffer(G.TM[G.car.tm],"race",{note:"Early extension",start:G.yr+1,int:75});G.offers.push(o);return {screen:()=>negotiate(o)};}],["Wait and test the market",()=>{rel("t:"+G.car.tm,-3);return "You want to see what's out there.";}]]})}});
EV({id:"teammate_replaced_rumor",t:"Rumor Mill",st:["team","realser"],cond:()=>{const m=mateId();if(!m)return null;const others=fieldIds(d=>d.tm!==G.car.tm);if(!others.length)return null;return {d:m,d2:R.pick(others)};},s:{start:c=>({x:`Word in the paddock is that ${esc(tn(G.car.tm))} has talked to ${D(c.d2)} about next season. Either you or ${D(c.d)} could be the one squeezed out.`,
 ch:[["Ask the team directly",()=>{if(relOf("t:"+G.car.tm)>=10)return "\"You're not going anywhere.\" Relief.";rel("t:"+G.car.tm,-2);return "The answer is vague. Too vague.";}],["Put in extra hours at the shop",()=>{rel("t:"+G.car.tm,4);gainSk("fbk",.3);return "Everyone sees you there at 7 a.m. every day.";}]]})}});
EV({id:"safety_crusade",t:"After the Crash",st:["pro"],cond:()=>{const d=ficD();return d?{d}:null;},cd:150,s:{start:c=>({x:`${D(c.d)} had a violent crash into an unprotected wall last week. They walked away, barely. Drivers are angry.`,
 ch:[["Lead the call for better barriers",()=>{rep(3);rel("media",4);rel("d:"+c.d,8);return "Within months, the series installs energy-absorbing barriers at three tracks. You may have saved lives.";}],["Visit them and keep it private",()=>{rel("d:"+c.d,12);return "They appreciate it more than you know.";}]]})}});
EV({id:"former_rival_retires",t:"An Old Rival Hangs It Up",st:["pro"],cond:()=>{const a=Object.keys(G.rel).filter(k=>k.startsWith("d:")&&G.D[k.slice(2)]&&G.D[k.slice(2)].ret&&!G.D[k.slice(2)].r&&Math.abs(G.rel[k])>=10);return a.length?{d:a[0].slice(2)}:null;},cd:100,s:{start:c=>({x:`${D(c.d)}, someone you battled with for years, has retired.`,ch:[["Send a message of respect",()=>{rel("d:"+c.d,15);rep(1);return "They reply: \"You made me better.\"";}],["Say nothing",()=>"Some rivalries don't end with a handshake."]]})}});
EV({id:"pole_record",t:"Track Record Chance",st:["season"],cond:()=>G.car.s&&tierNow()>=3?{}:null,s:{start:()=>({x:"Conditions are perfect for qualifying this weekend: cool air, grippy track. The track record is within reach.",ch:[["Go for the record",()=>{G.car.testB=(G.car.testB||0)+.6;gainSk("qul",.4);if(R.chance(.3)){fame(2);return "You smash the track record in practice! Qualifying should be good.";}return "Close, but not quite. You'll have a strong setup though.";}],["Focus on race trim",()=>{G.car.testB=(G.car.testB||0)+.4;return "Race setup it is.";}]]})}});
EV({id:"throwback",t:"Throwback Paint Scheme",st:["stock"],cond:()=>tierNow()>=5?{}:null,s:{start:()=>({x:"For the throwback weekend, you can pick a retro paint scheme.",ch:[["Honor your first race car",()=>{rel("fans",6);fame(1);return "The fans who remember your Saturday-night days love it.";}],["Let the fans vote",()=>{rel("fans",8);return "The fans pick a gloriously ugly 1980s design. It sells out in merch.";}],["Whatever the sponsor wants",()=>{if(mySponsor())mySponsor().sat+=8;return "The sponsor is thrilled.";}]]})}});

/* ===================== STORYLINES: LIFE, MILESTONES, OWNERSHIP, RETIREMENT, SYSTEM ===================== */
EV({id:"first_win_trophy",t:"Your First Win",tag:"MILESTONE",st:["active"],once:1,cond:()=>G.st.races.some(r=>r.f===1)?{}:null,w:20,s:{start:()=>({x:"The trophy from your first win sits on the kitchen table. Your family can't stop looking at it.",ch:[["Give it to your parents",()=>{rel("fam",15);morale(5);return "Mom puts it on the mantel. It'll be there forever.";}],["Keep it in the shop as motivation",()=>{morale(4);gainSk("con",.3);return "It goes on the shelf above your toolbox. One down.";}],["Give it to your crew",()=>{rel("cc",10);return "The crew argues for an hour over who gets to take it home first.";}]]})}});
EV({id:"title_celebration",t:"Champion!",tag:"MILESTONE",st:["any"],cond:()=>{const t=G.st.titles.filter(x=>x.yr===G.yr||x.yr===G.yr-1).slice(-1)[0];return t&&!G.fl["cel"+t.yr+t.s]?{s:t.s,yr:t.yr}:null;},w:20,cd:0,s:{start:c=>({x:`You're the ${c.yr} ${esc(SER[c.s].n)} champion. The celebration is still going.`,ch:[["Party with the crew all night",()=>{G.fl["cel"+c.yr+c.s]=1;rel("cc",10);morale(10);return "Champagne, pizza, and a crew member asleep in the hauler at sunrise.";}],["Thank everyone personally",()=>{G.fl["cel"+c.yr+c.s]=1;rep(3);rel("fam",5);rel("t:"+G.car.tm,5);return "Handwritten notes to every crew member, sponsor and family member.";}],["Already thinking about next year",()=>{G.fl["cel"+c.yr+c.s]=1;gainSk("con",.5);return "Two hours after the title, you're asking about next year's car.";}]]})}});
EV({id:"start100",t:"100 Starts",tag:"MILESTONE",st:["active"],once:1,cond:()=>G.st.races.length>=100?{}:null,w:10,s:{start:()=>({x:"Your 100th career start. The team puts a special decal on the car.",ch:[["Reflect on the journey",()=>{morale(5);return `From ${esc(SER[G.st.races[0].s].n)} to here. What a ride.`;}]]})}});
EV({id:"partner",t:"Someone Special",st:["active"],not:["junior"],once:1,cond:()=>G.me.age>=20?{n:genName(G.me.nat)}:null,s:{start:c=>({x:`You meet ${esc(c.n)} at a friend's barbecue. They don't know anything about racing and couldn't care less that you drive race cars. You like that.`,
 ch:[["Ask them out",()=>{G.fl.partner=c.n;morale(8);rel("fam",3);later("partner_travel",R.int(20,40),{n:c.n});return "Dinner turns into a four-hour conversation.";}],["Focus on racing",()=>"Maybe another time."]]})}});
EV({id:"partner_travel",t:"The Travel Is Hard",valid:c=>G.fl.partner===c.n,s:{start:c=>({x:`${esc(c.n)} says the weekends apart are getting hard.`,ch:[["Bring them on the road",()=>{morale(5);G.me.hp=clamp(G.me.hp-3,0,100);later("partner_proposal",R.int(30,60),{n:c.n});return "They come to the races. The paddock adopts them.";}],["Promise more time at home",()=>{G.car.ap=Math.max(0,G.car.ap-1);morale(4);later("partner_proposal",R.int(30,60),{n:c.n});return "You block out off-weekends. It helps.";}],["Racing comes first",()=>{G.fl.partner=null;morale(-8);return "You break up. The silence at home is loud.";}]]})}});
EV({id:"partner_proposal",t:"The Question",valid:c=>G.fl.partner===c.n,s:{start:c=>({x:`You've been with ${esc(c.n)} for a long time now. You've got a ring in your firesuit pocket.`,ch:[["Propose in victory lane (or wherever)",()=>{G.fl.married=c.n;morale(15);fame(1);addNews(`${G.me.name} is engaged.`,true);return "They say yes! The crew sprays you both with champagne.";}],["Not yet",()=>"The ring stays in the pocket."]]})}});
EV({id:"family_wedding",t:"Family Wedding",st:["season"],cond:()=>({}),s:{start:()=>({x:"Your sister's wedding is the same weekend as a race.",ch:[["Fly in after qualifying, fly back for the race",()=>{G.me.hp=clamp(G.me.hp-10,0,100);rel("fam",8);return "You make the toast in your team polo. Your sister cries.";}],["Miss the wedding",()=>{rel("fam",-15);morale(-5);return "Your sister doesn't speak to you for a month.";}]]})}});
EV({id:"money_manager",t:"A Financial Adviser",st:["pro"],cond:()=>G.me.cash>cashScale()*10?{n:genName("USA")}:null,cd:200,s:{start:c=>({x:`${esc(c.n)}, a slick financial adviser who manages money for "lots of athletes," wants to take over your finances. Returns of 25% a year, guaranteed.`,
 ch:[["Hand over the money",()=>{const amt=Math.round(G.me.cash*.4);G.me.cash-=amt;G.fl.adviser={amt,n:c.n};later("adviser_result",R.int(10,25),{});return "\"You won't regret it,\" they say.";}],["Use a boring index fund instead",()=>{earn(Math.round(G.me.cash*.05),"Investment returns");return "Slow, steady, safe.";}],["No thanks",()=>"You keep your money where it is."]]})}});
EV({id:"adviser_result",t:"The Adviser",valid:()=>!!G.fl.adviser,s:{start:()=>{const a=G.fl.adviser;const scam=R.chance(.6);return {x:scam?`${esc(a.n)} has vanished. The accounts are empty. You're one of a dozen athletes who were scammed.`:`${esc(a.n)} actually delivered. Your investment has grown.`,ch:[["Continue",()=>{G.fl.adviser=null;if(scam){morale(-10);addNews(`A fictional financial adviser who scammed several athletes, including ${G.me.name}, has disappeared.`,true);return "Lesson learned the hard way.";}earn(Math.round(a.amt*1.25),"Investment return");return "Nice.";}]]};}}});
EV({id:"sponsor_scandal",t:"Sponsor in Trouble",st:["any"],not:["retired"],cond:()=>{const s=G.car.spons.find(x=>x.amt>0);return s?{n:s.n}:null;},cd:200,s:{start:c=>({x:`${esc(c.n)}, one of your sponsors (a fictional company), is in the news for all the wrong reasons: accused of cooking its books.`,
 ch:[["Drop them immediately",()=>{G.car.spons=G.car.spons.filter(x=>x.n!==c.n);rep(2);return "You remove their logo before the next race. The media praises the quick action.";}],["Wait for the facts",()=>{if(R.chance(.5)){rep(1);return "The accusations turn out to be overblown. Your loyalty is rewarded.";}G.car.spons=G.car.spons.filter(x=>x.n!==c.n);rep(-2);return "It's all true. Your association lingers in the headlines.";}]]})}});
EV({id:"injury_choice",t:"Road to Recovery",st:["active"],cond:()=>G.me.inj&&G.me.inj.w>=3?{}:null,cd:10,w:5,s:{start:()=>({x:`Doctors say you need about ${plural(G.me.inj.w,"week")} to heal your ${esc(G.me.inj.n)}. Your team is asking when you'll be back.`,
 ch:[["Follow the doctors' timeline",()=>{G.me.hp=clamp(G.me.hp+10,0,100);return "Patience. You'll be back at full strength.";}],["Push to come back early",()=>{G.me.inj.w=Math.max(1,Math.round(G.me.inj.w*.5));G.me.hp=clamp(G.me.hp-15,0,100);if(R.chance(.25)){G.me.pot=Math.max(60,G.me.pot-1);return "You're back early, but something never feels quite right again.";}return "You're back early. It hurts, but you're in the car.";}],["Spend the time in the simulator",()=>{gainSk("qul",.6);gainSk("con",.4);return "You can't drive, but you can study.";}]]})}});
EV({id:"crash_confidence",t:"Shaken",st:["active"],cond:()=>{const r=G.st.races.slice(-1)[0];return r&&/rash|Multi/.test(r.dnf||"")&&G.me.inj?{}:null;},cd:40,s:{start:()=>({x:"That crash was a big one. At night you replay the impact. You haven't told anyone.",ch:[["Talk to a sports psychologist",()=>{morale(6);gainSk("con",.4);return "It helps to say it out loud.";}],["Get back in a car as soon as possible",()=>{if(R.chance(.6)){morale(4);return "The first laps are scary. Then it's just driving again.";}morale(-4);return "You're tentative for weeks.";}]]})}});
EV({id:"burnout",t:"Running on Empty",st:["active"],cond:()=>G.me.hp<45||G.me.mor<30?{}:null,cd:20,s:{start:()=>({x:"You're exhausted. Travel, sponsors, testing, racing. Something has to give.",ch:[["Take a full week off",()=>{G.me.hp=clamp(G.me.hp+25,0,100);morale(10);G.car.ap=0;return "No phone. No racing. Just sleep and sunlight.";}],["Push through",()=>{G.me.hp=clamp(G.me.hp-5,0,100);gainSk("fit",.2);return "You grind it out.";}]]})}});
EV({id:"podcast",t:"Start a Podcast?",st:["pro"],once:1,cond:()=>G.me.fame>=20?{}:null,s:{start:()=>({x:"A producer wants to launch a racing podcast with you as host.",ch:[["Do it",()=>{fame(3);gainSk("med",1);G.fl.podcast=1;earn(cashScale()|0,"Podcast");return "Episode 1 hits the top of the sports charts.";}],["No time",()=>"You've got enough going on."]]})}});
EV({id:"driving_camp",t:"Your Own Driving Camp",st:["pro","retired"],once:1,cond:()=>G.me.fame>=25?{}:null,s:{start:()=>({x:"You could start a youth driving camp in your name.",ch:[["Start it",()=>{spend(cashScale()*2|0,"Camp setup");rel("fans",10);G.fl.camp=1;return "Thirty kids in karts on opening day. One of them is really, really fast.";}],["Not yet",()=>"Someday."]]})}});
EV({id:"movie_consultant",t:"Hollywood Calling",st:["top"],once:1,cond:()=>G.me.fame>=50?{}:null,s:{start:()=>({x:"A film studio making a racing movie wants you as a technical consultant and a cameo.",ch:[["Do it",()=>{earn(cashScale()*2|0,"Movie fee");fame(4);return "You spend a week teaching an actor how to sit in a car. Your cameo: 'Driver #3'.";}],["Pass",()=>"You'd rather race."]]})}});
EV({id:"business_offer",t:"Business Opportunity",st:["pro","retired"],cond:()=>G.me.cash>cashScale()*15?{b:R.pick(["a car dealership","a tire shop chain","a race shop","a racing school","a short track"])}:null,cd:200,s:{start:c=>({x:`A friend offers you a stake in ${esc(c.b)}.`,ch:[["Invest",()=>{const amt=cashScale()*6|0;spend(amt,"Investment");G.fl.biz=(G.fl.biz||0)+1;later("biz_return",R.int(26,52),{amt,b:c.b});return "You're a business owner.";}],["Pass",()=>"You stick to racing."]]})}});
EV({id:"biz_return",t:"Business Report",s:{start:c=>{const g=R.chance(.65);return {x:g?`${esc(c.b)} is doing well. A dividend arrives.`:`${esc(c.b)} is struggling.`,ch:[["Continue",()=>{if(g)earn(Math.round(c.amt*R.f(.3,.9)),"Dividend");else spend(Math.round(c.amt*.2),"Capital call");return "";}]]};}}});
/* ---------- team owner storylines ---------- */
function ownPick(){return (G.own||[]).length?R.pick(G.own):null;}
EV({id:"own_driver_raise",t:"Your Driver Wants a Raise",tag:"TEAM OWNER",st:["own"],cond:()=>{const o=ownPick();if(!o)return null;const t=G.TM[o.tid];const d=t.cars.map(c=>c.d).filter(x=>x&&x!=="me"&&G.D[x]&&!G.D[x].r)[0];return d?{tid:o.tid,d}:null;},s:{start:c=>{const o=ownOf(c.tid);return {x:`${D(c.d)}, who drives for ${esc(o.n)}, wants more money. Their agent mentions "other interest."`,ch:[["Give them a 20% raise",()=>{o.sal[c.d]=Math.round((o.sal[c.d]||10000)*1.2);rel("d:"+c.d,8);return "Happy driver, lighter bank account.";}],["Refuse",()=>{rel("d:"+c.d,-10);if(R.chance(.4)){const id=c.d;freeDriver(id);G.D[id].cy=0;return "They walk. You need a new driver.";}return "They grumble, but they stay.";}]]};}}});
EV({id:"own_pay_driver",t:"A Pay Driver Pitch",tag:"TEAM OWNER",st:["own"],cond:()=>{const o=ownPick();return o?{tid:o.tid,d:genName(R.pick(NAT_MIX.intl))}:null;},s:{start:c=>{const o=ownOf(c.tid);const amt=Math.round(ownOp(o.s)*.4/1000)*1000;return {x:`A wealthy family offers ${money(amt)} if their child, ${esc(c.d)}, gets a seat at ${esc(o.n)}. The kid is... not very fast.`,
 ch:[["Take the money (replace your weakest driver)",()=>{const t=G.TM[o.tid];const slot=t.cars.filter(x=>x.d!=="me").sort((a,b)=>(G.D[a.d]?G.D[a.d].o:0)-(G.D[b.d]?G.D[b.d].o:0))[0];if(!slot)return "There's no seat to give.";if(slot.d){delete o.sal[slot.d];freeDriver(slot.d);}const d=genDriverFor(o.s);d.n=c.d;d.o=clamp(SER[o.s].lvl-8,15,90);slot.d=d.id;d.tm=o.tid;d.s=o.s;d.num=slot.num;o.sal[d.id]=0;o.cash+=amt;return "The money's in the bank. Results might suffer.";}],["Decline",()=>{rep(1);return "Your team, your standards.";}]]};}}});
EV({id:"own_cc_poached",t:"Your Technical Director Is Poached",tag:"TEAM OWNER",st:["own"],cond:()=>{const o=(G.own||[]).find(x=>x.cc.r>=65);return o?{tid:o.tid}:null;},s:{start:c=>{const o=ownOf(c.tid);return {x:`A bigger team wants ${esc(o.cc.n)}, your top technical person at ${esc(o.n)}.`,ch:[["Match the offer",()=>{o.cash-=Math.round(ownOp(o.s)*.06);return "They stay.";}],["Let them go",()=>{o.cc.r=Math.max(40,o.cc.r-12);o.cc.n=genStaff(o.tid+absWk());return "You promote from within. It'll take time.";}]]};}}});
EV({id:"own_alliance",t:"Technical Alliance",tag:"TEAM OWNER",st:["own"],cond:()=>{const o=ownPick();if(!o)return null;const big=teamsOf(o.s).filter(t=>!t.own&&t.q>o.q+5).sort((a,b)=>b.q-a.q)[0];return big?{tid:o.tid,tm:big.id}:null;},cd:100,s:{start:c=>{const o=ownOf(c.tid);return {x:`${esc(tn(c.tm))} offers ${esc(o.n)} a technical alliance: their engineering data and parts, for a fee and some independence.`,ch:[["Sign the alliance",()=>{o.cash-=Math.round(ownOp(o.s)*.15);o.q=Math.min(SER[o.s].ql+10,o.q+3);G.TM[o.tid].q=o.q;return "Your cars get a lot faster, but you're now somebody's B-team.";}],["Stay independent",()=>"You'll build it your way."]]};}}});
EV({id:"own_prodigy",t:"A Prodigy Is Available",tag:"TEAM OWNER",st:["own"],cond:()=>{const o=ownPick();return o?{tid:o.tid}:null;},s:{start:c=>{const o=ownOf(c.tid);const n=genName(R.pick(NAT_MIX.us));return {x:`Scouts are raving about ${esc(n)}, a teenage phenom. You could sign them to a development deal for ${esc(o.n)}.`,ch:[["Sign them",()=>{const d=genDriverFor(o.s);d.n=n;d.by=G.yr-Math.max(SER[o.s].age,16);d.o=clamp(SER[o.s].lvl-3,15,90);d.pot=clamp(d.o+20,0,96);const t=G.TM[o.tid];const slot=t.cars.find(x=>!x.d);if(slot){slot.d=d.id;d.tm=o.tid;d.s=o.s;d.num=slot.num;o.sal[d.id]=Math.round(driverAsk(d,o.s)*.4);return `${esc(n)} goes straight into your empty car.`;}d.tm=null;d.s=null;d.cy=0;G.fl.prodigy=d.id;return `You sign ${esc(n)} to a development deal. When a seat opens, they're ready.`;}],["Pass",()=>"Someone else will take the chance."]]};}}});
EV({id:"team_broke",t:"The Team Is Broke",tag:"TEAM OWNER",s:{start:c=>{const o=ownOf(c.tid);if(!o)return null;return {x:`${esc(o.n)}'s bank account is deep in the red (${money(o.cash)}). Suppliers are calling.`,ch:[["Bail it out with your own money",()=>{const need=Math.min(G.me.cash,-o.cash+Math.round(ownOp(o.s)*.2));G.me.cash-=need;o.cash+=need;return "The team survives, for now.";}],["Cut the budget to the bone",()=>{o.bud=0;o.q=Math.max(20,o.q-3);G.TM[o.tid].q=o.q;return "Lean times.";}],["Sell the team",()=>({screen:()=>sellTeam(o)})]]};}}});
EV({id:"charter_sale",t:"Charter for Sale",tag:"TEAM OWNER",st:["own"],cond:()=>{const o=(G.own||[]).find(x=>x.s==="cup"&&!x.charter);return o?{tid:o.tid}:null;},cd:100,s:{start:c=>{const o=ownOf(c.tid);const p=Math.round(CHARTER_PRICE*R.f(.7,.95));return {x:`A struggling Cup team (fictional) is selling its charter for ${money(p)}, below market price.`,ch:[["Buy it",()=>{if(G.me.cash<p)return "You don't have the money.";spend(p,"Charter");o.charter=1;return "Your team now has a charter.";},G.me.cash<p&&"Not enough cash"],["Pass",()=>"Maybe next time."]]};}}});
/* ---------- retired ---------- */
EV({id:"tv_booth",t:"The Broadcast Booth",tag:"LIFE AFTER RACING",st:["retired"],once:1,cond:()=>G.me.fame>=20||careerTotals().w>=5?{}:null,s:{start:()=>({x:"A TV network offers you a job as a race analyst.",ch:[["Take the job",()=>{G.fl.tv=1;earn(Math.round(cashScale()*5+200000),"TV contract");fame(3);return "Your first broadcast goes well. You might be better at this than anyone expected.";}],["Pass",()=>"You'd rather watch from the couch."]]})}});
EV({id:"legends_race",t:"Legends Race",tag:"LIFE AFTER RACING",st:["retired"],cd:52,cond:()=>({}),s:{start:()=>({x:"A charity legends race invites retired champions for one more go.",ch:[["Race",()=>{if(R.chance(.35)){fame(2);return "You win, and you feel 25 again for about an hour.";}return "You finish mid-pack, laughing in your helmet.";}],["Wave the green flag instead",()=>{fame(1);return "Grand marshal duty. The crowd gives you a standing ovation.";}]]})}});
EV({id:"coach_offer",t:"Driver Coach",tag:"LIFE AFTER RACING",st:["retired"],once:1,cond:()=>({}),s:{start:()=>({x:"A young driver's family asks you to coach their kid.",ch:[["Coach them",()=>{earn(50000,"Coaching");rel("fans",4);return "The kid is raw but fearless. You see yourself.";}],["Decline",()=>"You're enjoying retirement."]]})}});
/* ---------- system / follow-ups ---------- */
EV({id:"net_callback",t:"A Callback",tag:"OPPORTUNITY",valid:c=>!!G.TM[c.tm],s:{start:c=>({x:`${esc(towner(c.tm))} of ${esc(tn(c.tm))} calls back. "We might have something for you."`,ch:[["Hear them out",()=>{const t=G.TM[c.tm];const o=mkOffer(t,myStock(t.s)>=teamNeed(t)-3?"race":"race",myStock(t.s)>=teamNeed(t)-3?{}:{pay:Math.round((SER[t.s].cost||200000)*.8/1000)*1000,sal:0,win:0});G.offers.push(o);return {screen:()=>negotiate(o)};}],["Not now",()=>"You thank them for thinking of you."]]})}});
EV({id:"debt",t:"In Debt",tag:"MONEY",s:{start:()=>({x:`You're ${money(-G.me.cash)} in the red. Creditors are calling.`,ch:[["Take a loan from family",()=>{G.me.cash+=Math.min(-G.me.cash+2000,40000);rel("fam",-6);G.fl.debtWk=0;return "Your family bails you out. Again.";}],["Sell equipment",()=>{G.me.cash+=Math.round(cashScale()*3);if(G.TM.priv)G.TM.priv.q=Math.max(20,G.TM.priv.q-3);G.fl.debtWk=0;return "The spares go. The car is slower.";}],["Work extra jobs",()=>{G.me.cash+=3000;G.me.hp=clamp(G.me.hp-15,0,100);G.fl.debtWk=0;return "Night shifts. You're exhausted, but solvent-ish.";}]]})}});
EV({id:"body_says_no",t:"The Body Says No",tag:"MILESTONE",s:{start:()=>({x:`You're ${G.me.age}. Your reflexes are a tick slower. The young drivers are fearless. Is it time?`,ch:[["Keep going",()=>{morale(2);return "Not yet. Not while you can still win.";}],["Retire at the end of the season",()=>{G.fl.retireEoY=1;addNews(`${G.me.name} announces this will be their final season.`,true);fame(2);return "The farewell tour begins.";}],["Retire now",()=>({screen:retireMenu})]]})}});
EV({id:"crossroads",t:"Season Over: What's Next?",tag:"CAREER",s:{start:()=>{const c=G.car;const s=SER[c.s];const pos=champPos(c.s,"me");const opts=(NEXT[c.s]||[]).filter(id=>!licenseBlock(id));
 const ch=opts.map(id=>{const n=SER[id];if(isPriv(id))return [`Move up to ${esc(n.n)} next year (own car)`,()=>{G.fl.nextPriv=id;return `Next season you'll run your own car in ${esc(n.n)}: about ${money(startCost(id))} per race. Start saving and hunting sponsors.`;},false,`${esc(n.desc)} · ~${money(startCost(id)*n.cal.length)} per season`];
  return [`Chase a ride in ${esc(n.n)}`,()=>{G.fl.askWk=0;generateOffers("fa");return {screen:offersScreen};},false,`Team seat or pay ride (${n.cost?"~"+money(n.cost)+" per season to buy in":"team-funded"})`];});
 ch.push(["Stay and run another season here",()=>"You'll be back next year. Unfinished business.",false,`${esc(s.n)}`]);
 ch.push(["Try a different discipline",()=>({screen:ownCarMenu}),false,"Karting, dirt, stock cars, road racing..."]);
 return {x:`Your ${esc(s.n)} season is done${pos?`: you finished <b>${ordinal(pos)}</b> in points`:""}. Every racer reaches this point: stay where you're comfortable, or step up to faster cars and tougher fields.`,ch};}}});
EV({id:"free_tryout",t:"A Tryout",tag:"OPPORTUNITY",st:["free"],cond:()=>{const sid=lastSeries();const ts=teamsOf(sid).filter(t=>!t.own&&!t.priv);return ts.length?{tm:R.pick(ts).id}:null;},cd:12,s:{start:c=>({x:`${esc(tn(c.tm))} needs a driver for a test session and invites you. A strong showing could turn into a ride.`,
 ch:[["Give it everything",()=>{const t=G.TM[c.tm];if(OVR(SER[t.s].disc)+R.gauss()*5>=teamNeed(t)-4){const o=mkOffer(t,"race",{note:"After your tryout",start:G.wk<40?G.yr:G.yr+1});G.offers.push(o);return {screen:()=>negotiate(o)};}rel("t:"+c.tm,3);return "Respectable, but they go another way. They'll remember you, though.";}],["Pass",()=>"You'll wait for something better."]]})}});

/* ===================== BOOT ===================== */
function boot(){try{if(typeof localStorage!=="undefined"){try{FICPREF=localStorage.getItem(SAVE_KEY+"_fic")==="1";}catch(e){}}title();}catch(e){console.error(e);if(HAS_DOM)document.getElementById("main").innerHTML="<p>Failed to start: "+esc(e.message)+"</p>";}}
if(HAS_DOM){window.addEventListener("error",e=>{try{if(G&&G.me)showError(e.error||e.message);}catch(_){}});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();}

