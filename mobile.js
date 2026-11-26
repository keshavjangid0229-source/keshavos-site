"use strict";
/* ================= iOS MODE — phone (<=768px) par iPhone-style layout =================
   Desktop macOS layout bilkul untouched rehta hai. Phone par #desktop chhup
   jata hai aur #ios layer aa jata hai: status bar, widgets, app grid, dock.
   App tap karne par WAHI window (usi window manager se) full-screen iOS app
   layer me khulti hai — content reuse hota hai, kuch dobara nahi banta.
   Music: mobile widget ka play button bhi usi shared SongPlayer ko chalata
   hai, aur player ka iframe #ytDockMobile slot me dock hota hai — dusra
   player kabhi nahi banta. Cat bhi home screen par rehti hai.            */
(function(){
  var mq = window.matchMedia("(max-width: 768px)");
  var iosEl = document.getElementById("ios");
  if(!iosEl || typeof APPS === "undefined") return;
  var grid1 = document.getElementById("iosGrid1");
  var grid2 = document.getElementById("iosGrid2");
  var dockEl = document.getElementById("iosDock");
  var layer = document.getElementById("iosAppLayer");
  var content = document.getElementById("iosAppContent");
  var titleEl = document.getElementById("iosAppTitle");
  var iosMain = document.getElementById("iosMain");
  var currentApp = null;

  var GRID = [
    ["home","About Me"],["research","Research"],["experience","Experience"],["skills","Skills"],
    ["notes","Notes"],["resume","Resume"],["github","GitHub"],["ask","Ask Keshav"],
    ["projects","Projects"],["photos","Photos"],["music","Music"],["calendar","Calendar"],
    ["terminal","Terminal"],["labs","Labs"],["guestbook","Guestbook"],["settings","Settings"],
    ["calc","Calculator"],["linkedin","LinkedIn"],["activity","Activity"]
  ];
  var DOCK = ["about","projects","music","contact"];
  var LABELS = {};
  GRID.forEach(function(p){ LABELS[p[0]] = p[1]; });

  function iosOpen(id){
    var app = APPS[id]; if(!app) return;
    if(wins[id]){
      if(wins[id].min) restoreWin(id);
      adopt(id);
      focusWin(id);
    } else {
      openApp(id); /* openApp ka hook adopt() ko khud bula lega */
    }
  }
  function iconBtn(id, label){
    var app = APPS[id]; if(!app || !app.icon) return null;
    var b = document.createElement("button");
    b.className = "ios-app";
    b.setAttribute("aria-label", label);
    b.innerHTML = app.icon + "<span>" + label + "</span>";
    b.addEventListener("click", function(){ iosOpen(id); });
    return b;
  }
  var PAGE1 = GRID.slice(0, 8), PAGE2 = GRID.slice(8);
  PAGE1.forEach(function(p){ var b = iconBtn(p[0], p[1]); if(b) grid1.appendChild(b); });
  PAGE2.forEach(function(p){ var b = iconBtn(p[0], p[1]); if(b) grid2.appendChild(b); });
  DOCK.forEach(function(id){ var b = iconBtn(id, APPS[id].name); if(b) dockEl.appendChild(b); });

  /* Native horizontal scrolling keeps touch swipes and vertical page scrolling independent. */
  var pager = document.getElementById("iosPager");
  var dotEls = Array.from(document.querySelectorAll(".ios-dot"));
  var curPage = 0;
  function showPage(i){
    curPage = Math.max(0, Math.min(dotEls.length - 1, i));
    dotEls.forEach(function(dot, index){
      dot.classList.toggle("on", index === curPage);
      if(index === curPage) dot.setAttribute("aria-current", "page");
      else dot.removeAttribute("aria-current");
    });
    iosEl.classList.toggle("pg2", curPage === 1);
  }
  function goPage(i, behavior){
    pager.scrollTo({ left:i * pager.clientWidth, behavior:behavior });
  }
  pager.addEventListener("scroll", function(){
    if(pager.clientWidth) showPage(Math.round(pager.scrollLeft / pager.clientWidth));
  }, { passive:true });
  dotEls.forEach(function(dot, i){
    dot.addEventListener("click", function(){
      goPage(i, matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
    });
  });
  window.addEventListener("resize", function(){
    if(document.body.classList.contains("ios-mode")) goPage(curPage, "auto");
  });
  showPage(0);

  function fullscreenWin(id, win){
    if(win.dataset.deskCss === undefined){
      win.dataset.deskCss = win.style.cssText || "";
      win.dataset.deskMaxed = (wins[id] && wins[id].maxed) ? "1" : "";
    }
    win.style.left = "0px"; win.style.top = "0px";
    win.style.width = "100%"; win.style.height = "100%";
    win.classList.add("maxed");
    if(wins[id]) wins[id].maxed = true;
  }
  function adopt(id){
    var w = wins[id]; if(!w) return;
    var win = w.el;
    if(win.parentNode !== content) content.appendChild(win);
    fullscreenWin(id, win);
    showApp(id);
  }
  function showApp(id){
    currentApp = id;
    Object.keys(wins).forEach(function(k){ wins[k].el.style.display = (k === id) ? "flex" : "none"; });
    titleEl.textContent = LABELS[id] || (APPS[id] ? APPS[id].name : "");
    layer.classList.add("open");
    iosEl.classList.add("app-open");
  }
  function goHome(){
    currentApp = null;
    layer.classList.remove("open");
    iosEl.classList.remove("app-open");
  }
  function refreshAfterClose(closedId){
    if(currentApp && currentApp !== closedId && wins[currentApp]) return;
    var rest = Object.keys(wins).filter(function(k){ return wins[k].el.parentNode === content; });
    if(rest.length) showApp(rest[rest.length - 1]);
    else goHome();
  }
  function deskCssFor(id, win){
    var saved = win.dataset.deskCss;
    if(saved && /width:\s*\d+(\.\d+)?px/.test(saved)) return saved;
    var layerEl = document.getElementById("windows");
    var lw = layerEl.clientWidth || 900, lh = layerEl.clientHeight || 600;
    var app = APPS[id] || { w: 640, h: 480 };
    var w = Math.min(app.w, lw - 16), h = Math.min(app.h, lh - 16);
    return "left:" + Math.max(8, (lw - w) / 2) + "px;top:" + Math.max(6, (lh - h) / 2) +
           "px;width:" + w + "px;height:" + h + "px;z-index:" + (parseInt(win.style.zIndex, 10) || 100);
  }

  document.getElementById("iosDone").addEventListener("click", function(){
    if(currentApp && wins[currentApp]){ var id = currentApp; closeWin(id); refreshAfterClose(id); }
    else goHome();
  });
  document.getElementById("iosHomeBtn").addEventListener("click", goHome);
  /* Traffic-light close se window content se hate to layer ko sync rakho */
  new MutationObserver(function(){
    if(currentApp && !wins[currentApp]) refreshAfterClose(currentApp);
  }).observe(content, { childList: true });

  /* Cat — desktop se home screen par, wapas desktop par bhi */
  var cat = document.getElementById("wanderingCat");
  var catHome = cat ? { parent: cat.parentNode, next: cat.nextSibling } : null;

  /* Wallpaper — desktop ki wp-* classes #ios par mirror karo */
  var desk = document.getElementById("desktop");
  var WP_CLASSES = ["wp-streaks","wp-dusk","wp-tide","wp-lagoon","wp-ember","wp-graphite","wp-waves","wp-crimson","wp-aurora","wp-sunset","wp-green-hills","wp-goku","wp-vice-city","wp-cosmic-peaks","wp-alpine-lake","wp-scenic-avif"];
  function syncWp(){
    WP_CLASSES.forEach(function(c){ iosEl.classList.toggle(c, desk.classList.contains(c)); });
  }
  syncWp();
  new MutationObserver(syncWp).observe(desk, { attributes: true, attributeFilter: ["class"] });

  function applyMode(on){
    document.body.classList.toggle("ios-mode", on);
    syncWallpaperVideo();
    window.IOSMode.active = on;
    iosEl.setAttribute("aria-hidden", on ? "false" : "true");
    if(on){
      if(cat) iosMain.appendChild(cat);
      var ids = Object.keys(wins);
      ids.forEach(function(id){ adopt(id); });
      if(!ids.length) goHome();
    } else {
      goHome();
      if(cat && catHome && catHome.parent) catHome.parent.insertBefore(cat, catHome.next);
      var winLayer = document.getElementById("windows");
      Object.keys(wins).forEach(function(id){
        var win = wins[id].el;
        winLayer.appendChild(win);
        win.style.cssText = deskCssFor(id, win);
        var wasMaxed = win.dataset.deskMaxed === "1";
        delete win.dataset.deskCss; delete win.dataset.deskMaxed;
        if(wins[id]) wins[id].maxed = wasMaxed;
        win.classList.toggle("maxed", wasMaxed);
        win.style.display = (wins[id] && wins[id].min) ? "none" : "flex";
      });
    }
  }
  window.IOSMode = { active: false, open: iosOpen, adopt: function(id){ if(document.body.classList.contains("ios-mode")) adopt(id); } };
  function onMq(){ applyMode(mq.matches); }
  if(mq.addEventListener) mq.addEventListener("change", onMq);
  else if(mq.addListener) mq.addListener(onMq);
  applyMode(mq.matches);

  /* Status bar + clock widget — live time */
  function iosTick(){
    var now = new Date();
    var parts = {};
    new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(now).forEach(function(p){ parts[p.type] = p.value; });
    var t = parts.hour + ":" + parts.minute;
    var st = document.getElementById("iosTime"); if(st) st.textContent = t;
    var wt = document.getElementById("iosWTime"); if(wt) wt.textContent = t;
  }
  iosTick();
  setInterval(iosTick, 1000);

  /* Now Playing widget — SAME shared SongPlayer, koi dusra player nahi */
  var npW = document.getElementById("iosNp");
  var npPlay = document.getElementById("iosNpPlay");
  if(npW && npPlay && typeof SongPlayer !== "undefined"){
    bindSongSeek(document.getElementById("iosNpProg"));
    var npEl = document.getElementById("iosNpElapsed");
    var npTt = document.getElementById("iosNpTotal");
    npPlay.addEventListener("click", function(e){ e.stopPropagation(); SongPlayer.toggle(); });
    npW.addEventListener("click", function(){ iosOpen("music"); });
    SongPlayer.subscribe(function(s){
      npPlay.textContent = s.playing ? "⏸" : "▶";
      npW.classList.toggle("playing", s.playing);
      if(npEl) npEl.textContent = fmtSongTime(s.elapsed);
      if(npTt) npTt.textContent = fmtSongTime(s.total);
    });
  }
})();
