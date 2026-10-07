/* ===================== BOOT ===================== */
function boot(){try{if(typeof localStorage!=="undefined"){try{FICPREF=localStorage.getItem(SAVE_KEY+"_fic")==="1";}catch(e){}}title();}catch(e){console.error(e);if(HAS_DOM)document.getElementById("main").innerHTML="<p>Failed to start: "+esc(e.message)+"</p>";}}
if(HAS_DOM){window.addEventListener("error",e=>{try{if(G&&G.me)showError(e.error||e.message);}catch(_){}});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();}
