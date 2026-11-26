"use strict";
const $ = (s, r) => (r||document).querySelector(s);
const $$ = (s, r) => Array.from((r||document).querySelectorAll(s));

/* ---------------- APP REGISTRY ---------------- */
function ic(bg, inner, extra){ return '<div class="app-ic" style="background:'+bg+(extra||'')+'">'+inner+'</div>'; }
function txtIc(t, size){ return '<span style="color:#fff;font-weight:800;font-size:'+(size||21)+'px;letter-spacing:-.5px">'+t+'</span>'; }
const svgWrap = (body)=> '<svg viewBox="0 0 64 64" fill="none">'+body+'</svg>';

const APPS = {
  about:   { name:"Finder", title:"About Keshav", tpl:"tpl-about", w:740, h:570,
             icon: ic("linear-gradient(180deg,#6fc3ff,#1f6fe0)", svgWrap('<path d="M32 10v44M14 24c4 3 7 3 10 0M40 24c3 3 6 3 10 0" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><circle cx="22" cy="18" r="2.6" fill="#fff"/><circle cx="42" cy="18" r="2.6" fill="#fff"/><path d="M21 40c3.5 5 7.5 7 11 7s7.5-2 11-7" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>')) },
  launchpad:{ name:"Launchpad", action:"launchpad",
             icon: ic("linear-gradient(180deg,#4a4a52,#232329)", svgWrap('<g fill="#fff"><rect x="12" y="12" width="11" height="11" rx="3"/><rect x="27" y="12" width="11" height="11" rx="3"/><rect x="42" y="12" width="11" height="11" rx="3"/><rect x="12" y="27" width="11" height="11" rx="3"/><rect x="27" y="27" width="11" height="11" rx="3" fill="#ff9f0a"/><rect x="42" y="27" width="11" height="11" rx="3"/><rect x="12" y="42" width="11" height="11" rx="3"/><rect x="27" y="42" width="11" height="11" rx="3"/><rect x="42" y="42" width="11" height="11" rx="3"/></g>')) },
  safari:  { name:"Safari", title:"Safari — Favorites", tpl:"tpl-safari", w:800, h:550,
             icon: ic("#f5f5f7", svgWrap('<circle cx="32" cy="32" r="24" fill="#fff" stroke="#d9d9de"/><path d="M43 21l-6.5 15.5L21 43l6.5-15.5z" fill="#e8e8ec"/><path d="M43 21l-6.5 15.5L32 32z" fill="#ff453a"/><path d="M21 43l6.5-15.5L32 32z" fill="#0a84ff"/>'), ";border:1px solid #d9d9de") },
  projects:{ name:"Projects", title:"Projects — Finder", tpl:"tpl-projects", w:780, h:530,
             icon: ic("linear-gradient(180deg,#5ebcf5,#2f8fe0)", svgWrap('<path d="M10 20a4 4 0 014-4h13l5 7h22a4 4 0 014 4v19a4 4 0 01-4 4H14a4 4 0 01-4-4z" fill="rgba(255,255,255,.28)"/><path d="M10 27h48" stroke="rgba(255,255,255,.5)" stroke-width="2.5"/>')) },
  terminal:{ name:"Terminal", title:"keshav — zsh", tpl:"tpl-terminal", w:640, h:440, dark:true,
             icon: ic("linear-gradient(180deg,#3a3a40,#141416)", '<span style="font-family:var(--mono);color:#32d74b;font-weight:700;font-size:19px">&gt;_</span>') },
  notes:   { name:"Notes", title:"Notes", tpl:"tpl-notes", w:640, h:450,
             icon: ic("linear-gradient(180deg,#ffd60a 0 26%,#ffffff 26%)", '<span style="font-size:24px;margin-top:14px">✎</span>', ";color:#8a6d00") },
  calc:    { name:"Calculator", title:"Calculator", tpl:"tpl-calc", w:302, h:472, dark:true,
             icon: ic("linear-gradient(180deg,#4a4a4e,#232326)", svgWrap('<rect x="16" y="12" width="32" height="9" rx="2.5" fill="#a5a5a5"/><g fill="#fff"><circle cx="22" cy="30" r="3"/><circle cx="32" cy="30" r="3"/><circle cx="42" cy="30" r="3" fill="#ff9f0a"/><circle cx="22" cy="41" r="3"/><circle cx="32" cy="41" r="3"/><circle cx="42" cy="41" r="3" fill="#ff9f0a"/><circle cx="22" cy="52" r="3"/><circle cx="32" cy="52" r="3"/><circle cx="42" cy="52" r="3" fill="#ff9f0a"/></g>')) },
  calendar:{ name:"Calendar", title:"Calendar", tpl:"tpl-calendar", w:490, h:540,
             icon: ic("#ffffff", '<span style="text-align:center;line-height:1.05"><span style="display:block;color:#ff453a;font-size:10.5px;font-weight:700;letter-spacing:1.5px">WED</span><span style="display:block;color:#1c1c1e;font-size:27px;font-weight:300">4</span></span>', ";border:1px solid #d9d9de") },
  photos:  { name:"Photos", title:"Photos — Wallpapers", tpl:"tpl-photos", w:660, h:450,
             icon: ic("#ffffff", svgWrap('<g><ellipse cx="32" cy="21" rx="6.5" ry="10" fill="#ff9f0a" opacity=".85"/><ellipse cx="32" cy="43" rx="6.5" ry="10" fill="#64d2ff" opacity=".85"/><ellipse cx="21" cy="32" rx="10" ry="6.5" fill="#ff6482" opacity=".85"/><ellipse cx="43" cy="32" rx="10" ry="6.5" fill="#30d158" opacity=".85"/><ellipse cx="24.5" cy="24.5" rx="8" ry="8" fill="#ffd60a" opacity=".7" transform="rotate(45 24.5 24.5)"/><ellipse cx="39.5" cy="39.5" rx="8" ry="8" fill="#bf5af2" opacity=".7" transform="rotate(45 39.5 39.5)"/><ellipse cx="39.5" cy="24.5" rx="8" ry="8" fill="#0a84ff" opacity=".65" transform="rotate(45 39.5 24.5)"/><ellipse cx="24.5" cy="39.5" rx="8" ry="8" fill="#ff6961" opacity=".65" transform="rotate(45 24.5 39.5)"/></g>'), ";border:1px solid #e2e2e8") },
  settings:{ name:"Settings", title:"System Settings", tpl:"tpl-settings", w:550, h:570,
             icon: ic("linear-gradient(180deg,#8e8e96,#55555c)", '<span style="font-size:29px;color:#e8e8ec">⚙</span>') },
  music:   { name:"Music", title:"Music", tpl:"tpl-music", w:390, h:540, dark:true,
             icon: ic("linear-gradient(180deg,#fc6076,#e72c4b)", '<span style="font-size:27px;color:#fff">♪</span>') },
  linkedin:{ name:"LinkedIn", title:"LinkedIn — Keshav", tpl:"tpl-linkedin", w:600, h:580, ext:"https://www.linkedin.com",
             icon: ic("#0a66c2", txtIc("in", 23)) },
  github:  { name:"GitHub", title:"GitHub — @keshavjangid0229-source", tpl:"tpl-github", w:760, h:640, dark:true, ext:"https://github.com/keshavjangid0229-source",
             icon: ic("linear-gradient(180deg,#3a3f46,#17191c)", '<svg viewBox="0 0 24 24" width="30" height="30" fill="#fff" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 1.28 1.06.47 1.06 2.14v3.17c0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>') },
  contact: { name:"Mail", title:"Mail — New Message", tpl:"tpl-contact", w:490, h:575,
             icon: ic("linear-gradient(180deg,#59b0ff,#1668e8)", svgWrap('<rect x="10" y="20" width="44" height="26" rx="4" fill="#fff"/><path d="M11 22l21 15 21-15" stroke="#1668e8" stroke-width="3" fill="none"/>')) },
  guestbook:{ name:"Guestbook", title:"Guestbook — Sign the Wall", tpl:"tpl-guestbook", w:560, h:610,
             icon: ic("linear-gradient(180deg,#ff9f5a,#f94d6a)", svgWrap('<rect x="15" y="9" width="34" height="46" rx="5" fill="#fff"/><path d="M23 21h18M23 29h18M23 37h11" stroke="#f94d6a" stroke-width="3" stroke-linecap="round"/><path d="M41 42l10-10 5 5-10 10-6 2z" fill="#1c1c1e"/>')) },
  resume:  { name:"Preview", title:"Preview — Resume.pdf", tpl:"tpl-resume", w:760, h:640, dark:true,
             icon: ic("linear-gradient(180deg,#ff6b64,#e5322d)", '<span style="color:#fff;font-weight:800;font-size:15px;letter-spacing:.5px">PDF</span>') },
  labs:    { name:"Labs", title:"Labs — AI Playground", tpl:"tpl-labs", w:620, h:560,
             icon: ic("linear-gradient(180deg,#b18cff,#7d4fd0)", svgWrap('<path d="M27 10h10M30 10v13.5L19.5 44a5 5 0 004.7 7h15.6a5 5 0 004.7-7L34 23.5V10" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 38h16" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><circle cx="29" cy="44" r="1.8" fill="#fff"/><circle cx="35" cy="42" r="1.4" fill="#fff"/>')) },
  home:    { name:"KeshavOS", title:"KeshavOS — About Keshav", tpl:"tpl-about", w:740, h:570,
             icon: ic("linear-gradient(160deg,#5e5ce6,#bf5af2)", '<span style="color:#fff;font-weight:800;font-size:27px;letter-spacing:-1px">K</span>') },
  activity:{ name:"Activity", title:"Activity Monitor", tpl:"tpl-activity", w:560, h:500,
             icon: ic("linear-gradient(180deg,#3a3a40,#141416)", svgWrap('<path d="M10 38h10l4-14 6 22 6-18h18" stroke="#30d158" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')) },
  trash:   { name:"Trash", title:"Trash", tpl:"tpl-trash", w:410, h:350,
             icon: ic("linear-gradient(180deg,#e8eaee,#c3c8cf)", svgWrap('<path d="M20 22h24l-2.6 24a5 5 0 01-5 4.6h-8.8a5 5 0 01-5-4.6z" fill="#f4f6f8"/><path d="M17 22h30" stroke="#9aa0a8" stroke-width="3.4" stroke-linecap="round"/><path d="M27 22c0-3.4 2-5 5-5s5 1.6 5 5" fill="none" stroke="#9aa0a8" stroke-width="3"/><path d="M27 29v14M32 29v14M37 29v14" stroke="#c3c8cf" stroke-width="2.6" stroke-linecap="round"/>')) },
};
registerPortfolioApps();
const DOCK_ORDER = ["home","about","projects","safari","music","contact","notes","terminal","labs","activity","ask","settings","github","linkedin","guestbook","resume","trash"];

/* ---------------- STATE ---------------- */
const wins = {}; let zTop = 100, openCount = 0, focusedId = null;
const isMobile = () => window.matchMedia("(max-width:760px)").matches;

function toast(msg){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove("show"), 2600);
}

/* ---------------- DOCK + LAUNCHPAD ---------------- */
function buildDock(){
  const dock = $("#dock"); dock.innerHTML = "";
  DOCK_ORDER.forEach((id, i)=>{
    if(id === "trash"){
      const sep = document.createElement("div"); sep.className = "dock-sep"; dock.appendChild(sep);
    }
    const app = APPS[id];
    const b = document.createElement("button");
    b.className = "dock-item"; b.dataset.app = id; b.setAttribute("aria-label", app.name);
    b.innerHTML = app.icon + '<span class="tip">'+app.name+'</span><span class="run-dot"></span>';
    b.addEventListener("click", ()=> dockClick(id, b));
    dock.appendChild(b);
  });
  // Magnification
  dock.addEventListener("mousemove", (e)=>{
    if(isMobile() || window.__dockMag === false) return;
    $$(".dock-item", dock).forEach(it=>{
      const r = it.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width/2));
      const s = 1 + 0.5 * Math.max(0, 1 - d/115);
      it.style.transform = "scale("+s.toFixed(3)+")";
      it.style.margin = "0 " + ((s-1)*13).toFixed(1) + "px";
    });
  });
  dock.addEventListener("mouseleave", ()=> $$(".dock-item", dock).forEach(it=>{ it.style.transform=""; it.style.margin=""; }));
}
function dockClick(id, el){
  const app = APPS[id];
  if(app.action === "launchpad"){ toggleLaunchpad(true); return; }
  if(app.ext){ el.classList.remove("bounce"); void el.offsetWidth; el.classList.add("bounce"); window.open(app.ext, "_blank", "noopener"); return; }
  if(wins[id]){
    if(wins[id].min){ restoreWin(id); }
    else focusWin(id);
    return;
  }
  el.classList.remove("bounce"); void el.offsetWidth; el.classList.add("bounce");
  openApp(id);
}
function buildLaunchpad(){
  const g = $("#lpGrid"); g.innerHTML = "";
  Object.keys(APPS).forEach((id, idx)=>{
    if(id === "launchpad") return;
    const app = APPS[id];
    const b = document.createElement("button");
    b.className = "lp-item";
    b.style.animationDelay = (idx * 0.035) + "s";
    b.innerHTML = app.icon + "<span>" + app.name + "</span>";
    b.addEventListener("click", ()=>{ toggleLaunchpad(false); dockClick(id, b); });
    g.appendChild(b);
  });
}
function toggleLaunchpad(show){
  $("#launchpad").classList.toggle("show", show);
}
$("#launchpad").addEventListener("click", (e)=>{ if(e.target.id === "launchpad") toggleLaunchpad(false); });

/* ---------------- WINDOW MANAGER ---------------- */
function openApp(id){
  const app = APPS[id]; if(!app || !app.tpl) return;
  if(wins[id]){ if(wins[id].min) restoreWin(id); else focusWin(id); return; }
  const tpl = document.getElementById(app.tpl);
  const win = document.createElement("section");
  win.className = "window" + (app.dark ? " dark" : "");
  win.dataset.app = id;
  win.innerHTML =
    '<div class="titlebar">' +
      '<div class="traffic"><button type="button" class="r" data-act="close" aria-label="Close window"></button><button type="button" class="y" data-act="min" aria-label="Minimize window"></button><button type="button" class="g" data-act="max" aria-label="Zoom window"></button></div>' +
      '<div class="w-title">' + app.title + '</div><div style="width:52px"></div>' +
    '</div><div class="win-body"></div>';
  win.querySelector(".win-body").appendChild(tpl.content.cloneNode(true));

  const layer = $("#windows");
  const lw = layer.clientWidth, lh = layer.clientHeight;
  let w = Math.min(app.w, lw - 16), h = Math.min(app.h, lh - 16);
  let x = Math.max(8, (lw - w)/2 + (openCount % 6) * 26 - 40);
  let y = Math.max(6, (lh - h)/2 + (openCount % 6) * 22 - 26);
  if(isMobile()){ x = 0; y = 0; w = lw; h = lh; win.classList.add("maxed"); }
  win.style.cssText = "left:"+x+"px;top:"+y+"px;width:"+w+"px;height:"+h+"px;z-index:"+(++zTop);
  layer.appendChild(win);
  wins[id] = { el: win, min:false, maxed: isMobile(), prev:null };
  openCount++;
  $$(".dock-item").forEach(d=>{ if(d.dataset.app === id) d.classList.add("running"); });
  focusWin(id);
  wireWindow(id, win);
  initApp(id, win);
  if(window.IOSMode && IOSMode.active) IOSMode.adopt(id);
  if(id === "about") setTimeout(()=> $$(".skill .bar i", win).forEach(b=> b.style.width = b.dataset.w), 150);
}
function focusWin(id){
  focusedId = id;
  Object.keys(wins).forEach(k=> wins[k].el.classList.toggle("unfocused", k !== id));
  if(wins[id]) wins[id].el.style.zIndex = ++zTop;
  $("#activeAppName").textContent = APPS[id] ? APPS[id].name : "Finder";
}
function closeWin(id){
  const w = wins[id]; if(!w) return;
  clearTimeout(w._minT); clearTimeout(w._resT);
  if(w.root){ const r = w.root; w.root = null; setTimeout(()=>{ try{ r.unmount(); }catch(e){} }, 200); }
  w.el.style.transition = "transform .18s ease, opacity .18s ease";
  w.el.style.transform = "scale(.94)"; w.el.style.opacity = "0";
  setTimeout(()=>{ w.el.remove(); }, 170);
  delete wins[id];
  $$(".dock-item").forEach(d=>{ if(d.dataset.app === id) d.classList.remove("running"); });
  const rest = Object.keys(wins);
  if(rest.length) focusWin(rest[rest.length-1]); else { focusedId = null; $("#activeAppName").textContent = "Finder"; }
}
function genieReducedMotion(){
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
/* Genie flight path, measured at click time: translate from the window's
   bottom-centre to its own dock icon's centre, plus the end scale (icon
   width relative to window width, clamped near 0.1). Returns null when the
   app has no dock item (or it is not laid out) so callers fall back to the
   plain bottom-centre shrink. transform-origin 50% 100% means the scaled
   window lands with its bottom-centre exactly on the icon centre. */
function genieTarget(id, el){
  const item = document.querySelector('.dock-item[data-app="' + id + '"]');
  if(!item) return null;
  const ir = item.getBoundingClientRect();
  if(!ir.width || !ir.height) return null;
  const wr = el.getBoundingClientRect();
  if(!wr.width || !wr.height) return null;
  return {
    x: Math.round((ir.left + ir.width / 2) - (wr.left + wr.width / 2)),
    y: Math.round((ir.top + ir.height / 2) - (wr.top + wr.height)),
    scale: Math.max(0.07, Math.min(0.16, ir.width / wr.width))
  };
}
function setGenieVars(el, t){
  el.style.setProperty("--genie-x", t.x + "px");
  el.style.setProperty("--genie-y", t.y + "px");
  el.style.setProperty("--genie-scale", t.scale.toFixed(3));
}
function clearGenieVars(el){
  el.style.removeProperty("--genie-x");
  el.style.removeProperty("--genie-y");
  el.style.removeProperty("--genie-scale");
}
function minimizeWin(id){
  const w = wins[id]; if(!w || w.min) return;
  w.min = true;
  const el = w.el;
  clearTimeout(w._resT);
  el.classList.remove("restoring");
  el.style.transform = ""; el.style.opacity = "";
  el.style.animation = "none"; /* winIn entrance animation must not fight the genie transition */
  const t = genieReducedMotion() ? null : genieTarget(id, el);
  if(t){
    w.genie = t;
    setGenieVars(el, t);
    el.classList.add("genie");
    void el.offsetWidth; /* lock in the un-transformed start state, then flip */
    el.classList.add("minimizing");
    w._minT = setTimeout(()=>{
      el.style.display = "none";
      el.classList.remove("minimizing", "genie");
      clearGenieVars(el);
    }, 470);
  } else {
    w.genie = null;
    el.classList.add("minimizing");
    w._minT = setTimeout(()=>{ el.style.display = "none"; el.classList.remove("minimizing"); }, 390);
  }
}
function restoreWin(id){
  const w = wins[id]; if(!w) return;
  clearTimeout(w._minT);
  w.min = false;
  const el = w.el;
  el.style.display = "flex";
  el.classList.remove("minimizing");
  el.style.animation = "none"; /* winIn entrance must not replay over the genie flight */
  /* Measure fresh: the icon rect may have moved since minimize (dock
     magnification, resize). Falls back to the stored path, then to the
     original small pop. */
  const t = genieReducedMotion() ? null : (genieTarget(id, el) || w.genie);
  el.classList.add("restoring");
  if(t){
    setGenieVars(el, t);
    el.classList.add("genie");
    el.style.transform = "translate(var(--genie-x), var(--genie-y)) scale(var(--genie-scale))";
    el.style.opacity = "0";
  } else {
    el.style.transform = "scale(.9) translateY(30px)"; el.style.opacity = "0";
  }
  requestAnimationFrame(()=> requestAnimationFrame(()=>{
    el.style.transform = ""; el.style.opacity = "";
    w._resT = setTimeout(()=>{ el.classList.remove("restoring", "genie"); clearGenieVars(el); }, t ? 500 : 320);
  }));
  focusWin(id);
}
function toggleMax(id){
  const w = wins[id]; if(!w) return;
  const layer = $("#windows");
  if(!w.maxed){
    w.prev = { l:w.el.style.left, t:w.el.style.top, wd:w.el.style.width, ht:w.el.style.height };
    w.el.style.left = "0px"; w.el.style.top = "0px";
    w.el.style.width = layer.clientWidth + "px"; w.el.style.height = layer.clientHeight + "px";
    w.maxed = true; w.el.classList.add("maxed");
  } else {
    if(w.prev){ w.el.style.left = w.prev.l; w.el.style.top = w.prev.t; w.el.style.width = w.prev.wd; w.el.style.height = w.prev.ht; }
    w.maxed = false; w.el.classList.remove("maxed");
  }
}
function wireWindow(id, win){
  win.addEventListener("pointerdown", ()=> focusWin(id));
  $$(".traffic button", win).forEach(dot=>{
    dot.addEventListener("click", (e)=>{
      e.stopPropagation();
      const act = dot.dataset.act;
      if(act === "close") closeWin(id);
      else if(act === "min") minimizeWin(id);
      else if(act === "max") toggleMax(id);
    });
  });
  const bar = $(".titlebar", win);
  bar.addEventListener("dblclick", (e)=>{ if(!e.target.closest(".traffic")) toggleMax(id); });
  bar.addEventListener("pointerdown", (e)=>{
    if(e.target.closest(".traffic") || wins[id].maxed) return;
    const r = win.getBoundingClientRect(), layer = $("#windows").getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    function move(ev){
      let nx = ev.clientX - layer.left - dx, ny = ev.clientY - layer.top - dy;
      nx = Math.min(Math.max(nx, -r.width + 90), layer.width - 70);
      ny = Math.min(Math.max(ny, 0), layer.height - 44);
      win.style.left = nx + "px"; win.style.top = ny + "px";
    }
    function up(){ document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); }
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  });
}
