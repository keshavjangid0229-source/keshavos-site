"use strict";
/* ---------------- PER-APP LOGIC ---------------- */
const NOTES = [
  { body:"Portfolio ideas\n\n• macOS style desktop — done!\n• Har app functional rakho\n• LinkedIn / GitHub dock se seedha khule\n• Projects page update karna hai" },
  { body:"Hackathon checklist\n\n• Team ke saath problem statement shortlist karo\n• Prototype ka scope fix karo\n• Demo video script ready rakho" },
  { body:"Learning goals\n\n• React deep-dive\n• DSA — roz 2 problems\n• Ek project har month ship karo" },
];

function initApp(id, win){
  initPortfolioApp(id, win);
  if(id === "terminal") initTerminal(win);
  if(id === "notes") initNotes(win);
  if(id === "calc") initCalc(win);
  if(id === "calendar"){ const g = $("#calGrid", win); if(g) buildCalGrid(g, false); }
  if(id === "music") initMusic(win);
  if(id === "contact") mountContact(win);
  if(id === "guestbook") mountGuestbook(win);
  if(id === "github"){
    // Contribution graph — deterministic pattern so it looks the same every open
    const grid = $("[data-gh-grid]", win);
    if(grid && !grid.children.length){
      let html = "";
      for(let i = 0; i < 182; i++){
        const v = (i * 37 + Math.floor(i / 7) * 13) % 11;
        const lvl = v < 4 ? "" : v < 6 ? " l1" : v < 8 ? " l2" : v < 10 ? " l3" : " l4";
        html += '<i class="' + lvl.trim() + '"></i>';
      }
      grid.innerHTML = html;
    }
    // Tabs
    $$("[data-gh-tab]", win).forEach(tab => tab.addEventListener("click", ()=>{
      $$("[data-gh-tab]", win).forEach(t => t.classList.toggle("act", t === tab));
      $$("[data-gh-pane]", win).forEach(p => p.classList.toggle("act", p.dataset.ghPane === tab.dataset.ghTab));
      const body = $(".win-body", win); if(body) body.scrollTop = body.scrollTop;
    }));
    // Follow toggle (in-window only — real follow happens on github.com)
    const fol = $("[data-gh-follow]", win);
    if(fol) fol.addEventListener("click", ()=>{
      const on = fol.classList.toggle("following");
      fol.textContent = on ? "✓ Following" : "Follow";
      toast(on ? "Following @keshavjangid0229-source — asli follow ke liye github.com par bhi kar dena!" : "Unfollowed (sirf is window me)");
    });
    // Copy profile link
    const cp = $("[data-copy-link]", win);
    if(cp) cp.addEventListener("click", async ()=>{
      const url = "https://github.com/keshavjangid0229-source";
      try{ await navigator.clipboard.writeText(url); toast("GitHub profile link copy ho gaya: " + url); }
      catch(e){ toast("GitHub: " + url); }
    });
    // Repository search filter
    const search = $("[data-gh-search]", win);
    if(search) search.addEventListener("input", ()=>{
      const q = search.value.trim().toLowerCase(); let visible = 0;
      $$("[data-gh-repo-list] .gh-repo", win).forEach(r=>{
        const show = !q || r.textContent.toLowerCase().includes(q);
        r.style.display = show ? "" : "none"; if(show) visible++;
      });
      const empty = $("[data-gh-empty]", win); if(empty) empty.style.display = visible ? "none" : "block";
    });
  }
  if(id === "resume"){
    let zoom = 1;
    const stage = $("#pvZoom", win), label = $("#pvZoomLabel", win);
    $$("[data-pv-zoom]", win).forEach(b => b.addEventListener("click", ()=>{
      zoom = Math.min(1.6, Math.max(0.6, zoom + (b.dataset.pvZoom === "+" ? 0.15 : -0.15)));
      if(stage) stage.style.transform = "scale(" + zoom.toFixed(2) + ")";
      if(label) label.textContent = Math.round(zoom * 100) + "%";
    }));
  }
  if(id === "activity"){
    const list = $("#actList", win);
    if(list){
      const ids = Object.keys(wins);
      list.innerHTML = ids.length ? ids.map((k,i)=>{
        const a = APPS[k]; const pct = 18 + ((k.length * 13 + i * 7) % 55);
        return '<div class="act-row"><span class="a-ic" style="background:#eef0ff">' + (a.name.charAt(0)) + '</span><span class="grow">' + a.name + '<small>Window khuli hai · ' + a.title + '</small></span><span class="act-meter"><i style="width:' + pct + '%"></i></span></div>';
      }).join("") : '<p style="color:var(--win-sub); font-size:13px">Abhi sirf Activity Monitor khula hai.</p>';
    }
  }
  if(id === "labs") initLabs(win);
  if(id === "settings"){
    $$("[data-set-nav]", win).forEach(b => b.addEventListener("click", ()=>{
      $$("[data-set-nav]", win).forEach(x => x.classList.toggle("act", x === b));
      $$("[data-set-pane]", win).forEach(pane => pane.classList.toggle("act", pane.dataset.setPane === b.dataset.setNav));
    }));
    const mag = $("[data-dock-mag]", win);
    if(mag) mag.addEventListener("click", ()=>{
      mag.classList.toggle("on");
      window.__dockMag = mag.classList.contains("on");
      if(!window.__dockMag) $$(".dock-item").forEach(it=>{ it.style.transform=""; it.style.margin=""; });
      toast("Dock magnification " + (window.__dockMag ? "On" : "Off"));
    });
    const sizeRange = $("[data-dock-size]", win);
    if(sizeRange){
      sizeRange.value = settingsStore.dockSize;
      const sizeVal = $("[data-dock-size-val]", win);
      if(sizeVal) sizeVal.textContent = settingsStore.dockSize + "px";
      sizeRange.addEventListener("input", ()=> applyDockSize(parseInt(sizeRange.value, 10), true));
      sizeRange.addEventListener("change", ()=> applyDockSize(parseInt(sizeRange.value, 10)));
    }
    const rtSwitch = $("[data-reduce-transparency]", win);
    if(rtSwitch){
      rtSwitch.classList.toggle("on", settingsStore.reduceTransparency);
      rtSwitch.addEventListener("click", ()=> applyReduceTransparency(!settingsStore.reduceTransparency));
    }
    $$("[data-theme-set]", win).forEach(b => b.addEventListener("click", ()=> applyTheme(b.dataset.themeSet)));
    $$("[data-accent]", win).forEach(b => b.addEventListener("click", ()=> applyAccent(b.dataset.accent)));
    const rs = $("[data-reset-settings]", win);
    if(rs) rs.addEventListener("click", ()=>{
      applyTheme("light"); applyAccent("#0a84ff"); setWallpaper("wp-streaks");
      applyDockSize(50, true); applyReduceTransparency(false, true);
      $("#bright").value = 100; $("#desktop").style.filter = "";
      toast("Settings reset ho gayi — sab default par wapas.");
    });
    // Reflect current state
    const cur = document.documentElement.dataset.theme || "light";
    $$("[data-theme-set]", win).forEach(b => b.classList.toggle("sel", b.dataset.themeSet === cur));
    const acc = document.documentElement.style.getPropertyValue("--accent") || "#0a84ff";
    $$("[data-accent]", win).forEach(b => b.classList.toggle("sel", b.dataset.accent === acc.trim()));
  }
  if(id === "trash"){
    const b = $("#emptyTrash", win);
    if(b) b.addEventListener("click", ()=> toast("Trash pehle se khaali hai — kuch delete hi nahi hua."));
  }
  $$(".switch[data-set]", win).forEach(sw => sw.addEventListener("click", ()=>{
    sw.classList.toggle("on");
    toast(sw.dataset.set + (sw.classList.contains("on") ? " — On" : " — Off"));
  }));
}

/* Terminal */
function initTerminal(win){
  const body = $("#termBody", win); if(!body) return;
  const PROMPT = '<span class="prompt">keshav@macbook</span> <span class="path">~</span> % ';
  function line(html){ const d = document.createElement("div"); d.className = "out"; d.innerHTML = html; body.appendChild(d); }
  function newInput(){
    const row = document.createElement("div"); row.className = "term-line";
    row.innerHTML = PROMPT + '<input type="text" aria-label="Terminal input" autocomplete="off" spellcheck="false" />';
    body.appendChild(row);
    const inp = row.querySelector("input"); inp.focus();
    inp.addEventListener("keydown", (e)=>{
      if(e.key !== "Enter") return;
      const raw = inp.value.trim(); inp.disabled = true;
      run(raw.toLowerCase(), raw);
      newInput(); body.scrollTop = body.scrollHeight;
    });
  }
  function run(cmd, raw){
    const cmds = {
      help: "Available commands:\n  about     — mere baare me\n  skills    — tech stack\n  projects  — project list\n  socials   — LinkedIn / GitHub\n  open linkedin / open github / open guestbook\n  open resume / open labs\n  date      — aaj ki date\n  clear     — screen saaf karo\n  sudo hire-me — try karke dekho 😉",
      about: "Keshav — developer & builder. Web apps, hackathons (SIH 2026) aur college tech scene (ACM, GGSIPU EDC) me active. Dock se Finder kholo for full profile.",
      skills: "HTML/CSS ██████████ 90%\nJavaScript ████████░░ 82%\nReact      ████████░░ 80%\nGit/Vercel █████████░ 85%",
      projects: portfolioProjects.map((p,i)=> (i+1)+". "+p.name+" — "+p.tags.join(", ")).join("\n") + "\n\nDetails ke liye Projects app kholo.",
      socials: "GitHub   → github.com/keshavjangid0229-source\n           Desktop ka 'GitHub Profile' icon = improved profile window (README, pinned, repos)\n           Dock ka GitHub icon = seedha github.com\nLinkedIn → dock ka 'in' icon — seedha LinkedIn khulta hai",
      date: new Date().toLocaleString("en-IN", { timeZone:"Asia/Kolkata", dateStyle:"full", timeStyle:"medium" }),
      neofetch: "   /\\        keshav@macbook\n  /  \\       ──────────────\n / /\\ \\      OS: KeshavOS 1.0\n/ ____ \\     Shell: zsh (portfolio edition)\n          Uptime: jab tak tab open hai\n          Mood: shipping mode 🚀",
      "open linkedin": "OPEN_LINKEDIN",
      "open github": "OPEN_GITHUB",
      "open guestbook": "OPEN_GUESTBOOK",
      "open resume": "OPEN_RESUME",
      "open labs": "OPEN_LABS",
      "sudo hire-me": "Permission granted. 🎉 Keshav internships ke liye open hai — Mail app se message bhejo!",
      whoami: "keshav — builder, developer, future hackathon winner.",
      ls: "About.app  Projects/  Resume.pdf  Terminal.app  secrets.txt",
      "cat secrets.txt": "secret: consistency > motivation. Roz thoda, lekin roz.",
    };
    if(cmd === "clear"){ body.innerHTML = ""; return; }
    if(cmds[cmd] === "OPEN_LINKEDIN"){ line("Opening LinkedIn…"); window.open("https://www.linkedin.com", "_blank", "noopener"); return; }
    if(cmds[cmd] === "OPEN_GITHUB"){ line("Opening GitHub — @keshavjangid0229-source …"); window.open("https://github.com/keshavjangid0229-source", "_blank", "noopener"); return; }
    if(cmds[cmd] === "OPEN_GUESTBOOK"){ line("Opening Guestbook — sign karke jana!"); openApp("guestbook"); return; }
    if(cmds[cmd] === "OPEN_RESUME"){ line("Opening Resume.pdf in Preview…"); openApp("resume"); return; }
    if(cmds[cmd] === "OPEN_LABS"){ line("Opening Labs — sentiment playground…"); openApp("labs"); return; }
    if(cmds[cmd]) line(cmds[cmd].replace(/</g,"&lt;"));
    else if(cmd === "") return;
    else line("zsh: command not found: " + raw.replace(/</g,"&lt;") + " — 'help' type karo");
  }
  body.addEventListener("click", ()=>{ const i = body.querySelector("input:not([disabled])"); if(i) i.focus(); });
  newInput();
}

/* Notes */
function initNotes(win){
  const list = $("#notesList", win), area = $("#noteArea", win); if(!list || !area) return;
  let cur = 0;
  function render(){
    list.innerHTML = "";
    NOTES.forEach((n, i)=>{
      const first = (n.body.split("\n")[0] || "New Note");
      const b = document.createElement("button");
      if(i === cur) b.className = "act";
      b.innerHTML = "<b>" + first.replace(/</g,"&lt;") + "</b><small>" + n.body.replace(/\n/g," ").slice(0,26).replace(/</g,"&lt;") + "…</small>";
      b.addEventListener("click", ()=>{ cur = i; area.value = NOTES[i].body; render(); });
      list.appendChild(b);
    });
    const add = document.createElement("button");
    add.innerHTML = "<b>+ New Note</b><small>Click to add</small>";
    add.addEventListener("click", ()=>{ NOTES.unshift({ body:"New note\n\nYahan likho…" }); cur = 0; area.value = NOTES[0].body; render(); area.focus(); });
    list.appendChild(add);
  }
  area.value = NOTES[0].body;
  area.addEventListener("input", ()=>{ NOTES[cur].body = area.value; render(); const i2 = $("#noteArea", win); if(i2 && document.activeElement !== i2){} });
  render();
}

/* Calculator */
function initCalc(win){
  const disp = $("#calcDisp", win), grid = $("#calcGrid", win); if(!disp || !grid) return;
  let cur = "0", prev = null, op = null, fresh = true;
  function show(){ disp.textContent = cur.length > 11 ? parseFloat(cur).toExponential(5) : cur; }
  function compute(){
    const a = parseFloat(prev), b = parseFloat(cur); if(isNaN(a) || isNaN(b)) return cur;
    let r = 0;
    if(op === "+") r = a + b; else if(op === "-") r = a - b;
    else if(op === "*") r = a * b; else if(op === "/") r = b === 0 ? NaN : a / b;
    return isNaN(r) ? "Error" : String(Math.round(r * 1e10) / 1e10);
  }
  grid.addEventListener("click", (e)=>{
    const b = e.target.closest("button"); if(!b) return;
    const c = b.dataset.c, v = b.dataset.v;
    if(c === "num"){ if(fresh || cur === "0" || cur === "Error"){ cur = v === "." ? "0." : v; fresh = false; } else if(!(v === "." && cur.includes("."))) cur += v; }
    if(c === "clear"){ cur = "0"; prev = null; op = null; fresh = true; }
    if(c === "neg"){ cur = cur.startsWith("-") ? cur.slice(1) : "-" + cur; }
    if(c === "pct"){ cur = String(parseFloat(cur) / 100 || 0); }
    if(c === "op"){ if(prev !== null && op && !fresh) cur = compute(); prev = cur; op = v; fresh = true; }
    if(c === "eq"){ if(op && prev !== null){ cur = compute(); prev = null; op = null; fresh = true; } }
    show();
  });
}

/* Calendar grids — November 2026 (1 Nov 2026 is a Sunday) */
function buildCalGrid(el, mini){
  const DOW = ["S","M","T","W","T","F","S"];
  let html = DOW.map(d=>'<span class="'+(mini?"dow":"dow")+'" style="font-size:'+(mini?9.5:11)+'px;color:var(--win-sub);font-weight:700">'+d+"</span>").join("");
  for(let d = 1; d <= 30; d++){
    const cls = d === 4 ? "today" : ([4,7,14].includes(d) ? "event" : "");
    html += mini
      ? '<span class="'+(d===4?"today":"")+'">'+d+"</span>"
      : '<span class="d '+cls+'">'+d+"</span>";
  }
  el.innerHTML = html;
}

/* One native audio element keeps the desktop, mobile and Music controls in sync. */
const SongPlayer = (function(){
  const audio = new Audio("https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e8/11/c8/e811c82c-e80b-b0b4-7e86-6ced99844767/mzaf_3066499147965018967.plus.aac.p.m4a");
  audio.preload = "metadata";
  const listeners = [];
  function state(){
    const total = Number.isFinite(audio.duration) ? audio.duration : 0;
    return { playing: !audio.paused && !audio.ended, elapsed: audio.currentTime, total,
      frac: total ? audio.currentTime / total : 0 };
  }
  function notify(){ listeners.forEach(listener => listener(state())); }
  function play(){ audio.play().catch(() => toast("Tough preview could not play. Try again.")); }
  for(const event of ["play","pause","ended","timeupdate","loadedmetadata"]) audio.addEventListener(event, notify);
  return {
    toggle(){ if(audio.paused || audio.ended) play(); else audio.pause(); },
    restart(){ audio.currentTime = 0; play(); },
    seek(seconds){
      if (Number.isFinite(audio.duration) && Number.isFinite(seconds)) {
        audio.currentTime = Math.max(0, Math.min(seconds, audio.duration));
        notify();
      }
    },
    subscribe(listener){ listeners.push(listener); listener(state()); }
  };
})();

function bindSongSeek(input){
  if (!input) return;
  input.addEventListener("click", event => event.stopPropagation());
  input.addEventListener("input", () => SongPlayer.seek(input.valueAsNumber));
  SongPlayer.subscribe(state => {
    input.disabled = state.total <= 0;
    input.max = String(state.total);
    input.value = String(state.elapsed);
    input.setAttribute("aria-valuetext", fmtSongTime(state.elapsed) + " of " + fmtSongTime(state.total));
  });
}

function fmtSongTime(sec){ sec = Math.max(0, Math.floor(sec || 0)); const m = Math.floor(sec / 60), s = sec % 60; return m + ":" + (s < 10 ? "0" : "") + s; }

function initMusic(win){
  const play = $("#mPlay", win), prog = $("#musicProg", win), viz = $("#viz", win), art = $("#ytDockMusic", win);
  if(!play) return;
  bindSongSeek(prog);
  /* Sirf ek hi track hai — hidden gem. Baaki music kahin nahi dikhta.
     Playback asli hai — shared SongPlayer widget ke saath full sync. */
  play.addEventListener("click", ()=> SongPlayer.toggle());
  const restart = ()=>{ SongPlayer.restart(); toast("♪ Tough — Krish Rao"); };
  const nx = $("#mNext", win), pv = $("#mPrev", win);
  if(nx) nx.addEventListener("click", restart);
  if(pv) pv.addEventListener("click", restart);
  const mEl = $("#mElapsed", win), mTt = $("#mTotal", win);
  SongPlayer.subscribe((s)=>{
    play.textContent = s.playing ? "⏸" : "▶";
    if(viz) viz.classList.toggle("play", s.playing);
    if(art) art.classList.toggle("playing", s.playing);
    if(mEl) mEl.textContent = fmtSongTime(s.elapsed);
    if(mTt) mTt.textContent = fmtSongTime(s.total);
  });
  $$("#viz i", win).forEach((bar, i)=> bar.style.animationDelay = (i * 0.09) + "s");
}

/* Appearance + accent (Settings) */
function applyTheme(t){
  if(t === "dark") document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  $$("[data-theme-set]").forEach(b => b.classList.toggle("sel", b.dataset.themeSet === t));
  toast("Appearance: " + (t === "dark" ? "Dark" : "Light"));
}
function applyAccent(color){
  document.documentElement.style.setProperty("--accent", color);
  $$("[data-accent]").forEach(b => b.classList.toggle("sel", b.dataset.accent === color));
  toast("Accent color badal diya");
}

/* Settings store — dockSize + reduceTransparency (localStorage me persist) */
var SETTINGS_KEY = "keshavos-settings-v1";
var settingsStore = { dockSize: 50, reduceTransparency: false, wallpaper: "wp-streaks" };
var WP_ALL = ["wp-streaks","wp-dusk","wp-tide","wp-lagoon","wp-ember","wp-graphite","wp-waves","wp-crimson","wp-aurora","wp-sunset","wp-green-hills","wp-goku","wp-vice-city"];
try{
  var savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
  if(savedSettings){
    if(typeof savedSettings.dockSize === "number") settingsStore.dockSize = Math.min(72, Math.max(40, savedSettings.dockSize));
    if(typeof savedSettings.reduceTransparency === "boolean") settingsStore.reduceTransparency = savedSettings.reduceTransparency;
    if(typeof savedSettings.wallpaper === "string" && WP_ALL.indexOf(savedSettings.wallpaper) !== -1) settingsStore.wallpaper = savedSettings.wallpaper;
  }
}catch(e){}
function saveSettings(){ try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsStore)); }catch(e){} }
function applyDockSize(size, silent){
  settingsStore.dockSize = Math.min(72, Math.max(40, Math.round(size) || 50));
  document.documentElement.style.setProperty("--dock-size", settingsStore.dockSize + "px");
  $$("[data-dock-size]").forEach(r => { r.value = settingsStore.dockSize; });
  $$("[data-dock-size-val]").forEach(o => { o.textContent = settingsStore.dockSize + "px"; });
  saveSettings();
  if(!silent) toast("Dock size: " + settingsStore.dockSize + "px");
}
function applyReduceTransparency(on, silent){
  settingsStore.reduceTransparency = !!on;
  if(settingsStore.reduceTransparency) document.documentElement.dataset.reduceTransparency = "true";
  else delete document.documentElement.dataset.reduceTransparency;
  $$("[data-reduce-transparency]").forEach(sw => sw.classList.toggle("on", settingsStore.reduceTransparency));
  saveSettings();
  if(!silent) toast("Reduce Transparency " + (settingsStore.reduceTransparency ? "On — Dock aur Menu Bar solid" : "Off — Dock aur Menu Bar translucent"));
}

/* Labs — sentiment playground (sab kuch browser me chalta hai) */
function initLabs(win){
  const input = $("#labInput", win); if(!input) return;
  const POS = ["good","great","awesome","amazing","best","love","loved","happy","excellent","fantastic","nice","cool","superb","brilliant","mast","badhiya","accha","achha","shandaar","zabardast","pasand","kamaal","dhamaal","perfect","wonderful","great"];
  const NEG = ["bad","worst","hate","hated","boring","slow","bug","error","problem","terrible","awful","bakwaas","bekar","kharab","bura","ganda","fail","failed","sad","angry","poor","waste","mushkil"];
  const SAMPLES = {
    pos: "Ye portfolio bahut badhiya hai — design mast hai aur animations zabardast hain!",
    neg: "Ye page bohot slow hai, har jagah bug aur error hai. Bilkul bakwaas experience, bohot kharab.",
    mix: "Design accha hai aur idea kamaal ka hai, lekin page thoda slow hai aur ek bug bhi mila."
  };
  function analyze(){
    const text = input.value || "";
    const words = text.toLowerCase().replace(/[^a-zà-ÿ\u0900-\u097F\s]/gi, " ").split(/\s+/).filter(Boolean);
    let pos = 0, neg = 0;
    words.forEach(w => { if(POS.includes(w)) pos++; if(NEG.includes(w)) neg++; });
    const raw = pos - neg;
    const score = words.length ? Math.max(-100, Math.min(100, Math.round(raw / Math.max(3, Math.sqrt(words.length)) * 45))) : 0;
    const verdict = $("#labVerdict", win), sc = $("#labScore", win), needle = $("#labNeedle", win);
    if(!words.length){ verdict.textContent = "—"; sc.textContent = "Score 0 · pehle kuch likho"; }
    else if(score > 18){ verdict.textContent = "Positive"; sc.textContent = "Score +" + score + " · mood upbeat hai"; }
    else if(score < -18){ verdict.textContent = "Negative"; sc.textContent = "Score " + score + " · mood down hai"; }
    else { verdict.textContent = "Neutral"; sc.textContent = "Score " + (score > 0 ? "+" : "") + score + " · mila-jula mood"; }
    needle.style.left = ((score + 100) / 2) + "%";
    $("#labPos", win).textContent = "Positive words: " + pos;
    $("#labNeg", win).textContent = "Negative words: " + neg;
    $("#labWords", win).textContent = "Words: " + words.length;
    $("#labRead", win).textContent = "Reading time: " + Math.max(1, Math.round(words.length / 3.2)) + "s";
  }
  input.addEventListener("input", analyze);
  $$("[data-lab-sample]", win).forEach(b => b.addEventListener("click", ()=>{
    const k = b.dataset.labSample;
    input.value = k === "clear" ? "" : SAMPLES[k];
    analyze(); input.focus();
  }));
  analyze();
  initBM25(win);
}

/* Labs — BM25 retrieval playground (simplified Okapi BM25, ~30 lines) */
function initBM25(win){
  const qInput = $("#bmQuery", win), out = $("#bmResults", win);
  if(!qInput || !out) return;
  const DOCS = [
    { t:"KeshavOS — macOS Portfolio", d:"Keshav ka personal portfolio jo browser me pura macOS desktop chalata hai. Draggable windows, magnifying dock, terminal, spotlight search aur guestbook — React aur JavaScript se bana interactive web experience.", text:"keshavos macos portfolio desktop windows dock terminal spotlight guestbook react javascript interactive web os finder safari" },
    { t:"3D Interactive Bike Model", d:"Ek interactive 3D bike model jo browser me rotate, zoom aur explore hota hai. Real-time WebGL rendering ke saath Vercel par live demo hosted hai.", text:"3d interactive bike model webgl three.js rotate zoom render browser demo vercel motorcycle graphics" },
    { t:"Keshav — Skills & Stack", d:"Keshav ka daily stack: HTML, CSS, JavaScript aur React se modern web apps, Git aur GitHub workflow, Vercel deployments aur Tailwind styling.", text:"skills html css javascript react git github vercel tailwind web development frontend stack" },
    { t:"Hackathons & SIH 2026", d:"Smart India Hackathon 2026 aur campus tech community (ACM, GGSIPU EDC) me building, team collaboration, prototyping aur problem solving.", text:"hackathon sih 2026 smart india acm campus team prototype problem solving builder community" },
    { t:"Shipping Log — Har Month Ek Project", d:"Keshav ka rule: har month ek project live ship karo. Projects GitHub par public hain aur Vercel par deploy hote hain — learning by shipping.", text:"shipping projects monthly vercel deploy github public learning building portfolio live" }
  ];
  const tok = (t)=> t.toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(Boolean);
  const docToks = DOCS.map(x => tok(x.t + " " + x.d + " " + x.text));
  const N = DOCS.length;
  const avgLen = docToks.reduce((a,t)=>a+t.length,0) / N;
  const df = {}; docToks.forEach(t => Array.from(new Set(t)).forEach(w => df[w] = (df[w]||0)+1));
  function run(){
    const k1 = parseFloat($("#bmK1", win).value), b = parseFloat($("#bmB", win).value);
    $("#bmK1Out", win).textContent = k1.toFixed(1);
    $("#bmBOut", win).textContent = b.toFixed(2);
    const q = Array.from(new Set(tok(qInput.value)));
    const scored = DOCS.map((doc, i)=>{
      const toks = docToks[i], tf = {};
      toks.forEach(w => tf[w] = (tf[w]||0)+1);
      let score = 0;
      q.forEach(w => {
        if(!tf[w]) return;
        const idf = Math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5));
        score += idf * (tf[w] * (k1 + 1)) / (tf[w] + k1 * (1 - b + b * (toks.length / avgLen)));
      });
      return { doc: doc, score: score };
    }).sort((a,b2)=> b2.score - a.score);
    const max = scored.length ? scored[0].score : 0;
    out.innerHTML = scored.map((r, idx)=>
      '<div class="bm25-item"><b>' + (idx+1) + '. ' + r.doc.t + '</b><p>' + r.doc.d + '</p>' +
      '<div class="bm25-bar"><i style="width:' + (max > 0 ? Math.max(3, r.score / max * 100) : 0) + '%"></i></div>' +
      '<div class="bm25-score">BM25 score: ' + r.score.toFixed(3) + (r.score === 0 ? ' · koi query term match nahi hua' : '') + '</div></div>'
    ).join("");
  }
  qInput.addEventListener("input", run);
  $("#bmK1", win).addEventListener("input", run);
  $("#bmB", win).addEventListener("input", run);
  run();
}

/* Now Playing widget */
(function initNpWidget(){
  const w = $("#npWidget"); if(!w) return;
  const btn = $("#npPlay"), prog = $("#npProg");
  bindSongSeek(prog);
  const npEl = $("#npElapsed"), npTt = $("#npTotal");
  $$(".np-eq i", w).forEach((bar, i)=> bar.style.animationDelay = (i * 0.08) + "s");
  btn.addEventListener("click", (e)=>{
    e.stopPropagation();
    SongPlayer.toggle();
  });
  SongPlayer.subscribe((s)=>{
    btn.textContent = s.playing ? "⏸" : "▶";
    w.classList.toggle("playing", s.playing);
    if(npEl) npEl.textContent = fmtSongTime(s.elapsed);
    if(npTt) npTt.textContent = fmtSongTime(s.total);
  });
  w.addEventListener("click", ()=> openApp("music"));
})();
$("#lpOpen").addEventListener("click", ()=> openApp("projects"));

/* Keep one background video active across desktop and mobile layouts. */
var wallpaperVideo;
var wallpaperMotion = matchMedia("(prefers-reduced-motion: reduce)");
function syncWallpaperVideo(){
  const desktop = $("#desktop");
  const target = document.body.classList.contains("ios-mode") ? $("#ios") : desktop;
  const slug = desktop.classList.contains("wp-goku") ? "goku"
    : desktop.classList.contains("wp-vice-city") ? "vice-city" : "";
  if (!slug || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (wallpaperVideo) {
      wallpaperVideo.pause();
      wallpaperVideo.remove();
      wallpaperVideo.removeAttribute("src");
      wallpaperVideo.load();
      wallpaperVideo = undefined;
    }
    return;
  }
  if (!wallpaperVideo) {
    wallpaperVideo = document.createElement("video");
    wallpaperVideo.className = "wallpaper-video";
    wallpaperVideo.setAttribute("aria-hidden", "true");
    wallpaperVideo.muted = true;
    wallpaperVideo.loop = true;
    wallpaperVideo.playsInline = true;
  }
  if (wallpaperVideo.parentElement !== target) target.prepend(wallpaperVideo);
  const source = "assets/" + slug + ".mp4";
  if (wallpaperVideo.getAttribute("src") !== source) {
    wallpaperVideo.poster = "assets/" + slug + ".jpg";
    wallpaperVideo.src = source;
  }
  wallpaperVideo.play().catch(() => {});
}
wallpaperMotion.addEventListener("change", syncWallpaperVideo);

function setWallpaper(cls, silent){
  const d = $("#desktop");
  WP_ALL.forEach(c => d.classList.remove(c));
  d.classList.add(cls);
  syncWallpaperVideo();
  $$(".wp-thumb, .wp-card").forEach(t => t.classList.toggle("sel", t.dataset.wp === cls));
  if(typeof settingsStore !== "undefined"){ settingsStore.wallpaper = cls; saveSettings(); }
  const names = { "wp-streaks":"Streaks (Default)", "wp-dusk":"Dusk", "wp-tide":"Tide", "wp-lagoon":"Lagoon", "wp-ember":"Ember", "wp-graphite":"Graphite", "wp-waves":"Sonoma Waves", "wp-crimson":"Crimson Streak", "wp-aurora":"Aurora", "wp-sunset":"Sunset Coast", "wp-green-hills":"Green Hills", "wp-goku":"Goku Ultra Instinct", "wp-vice-city":"Vice City" };
  if(!silent) toast("Wallpaper: " + (names[cls] || cls));
}
document.addEventListener("click", (e)=>{
  const g = e.target.closest("[data-goto]"); if(g){ e.preventDefault(); if(g.dataset.goto === "launchpad-x"){ toggleLaunchpad(true); } else if(window.IOSMode && IOSMode.active){ IOSMode.open(g.dataset.goto); } else { openApp(g.dataset.goto); } }
  const wp = e.target.closest("[data-wp]"); if(wp) setWallpaper(wp.dataset.wp);
  const di = e.target.closest(".desk-icon");
  $$(".desk-icon").forEach(x => x.classList.toggle("sel", x === di));
});

/* ---------------- CLOCK ---------------- */
function tickClock(){
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-IN", { timeZone:"Asia/Kolkata", weekday:"short", day:"numeric", month:"short", hour:"numeric", minute:"2-digit", hour12:true });
  const parts = {};
  fmt.formatToParts(now).forEach(p => parts[p.type] = p.value);
  $("#clock").innerHTML = parts.weekday + " " + parts.day + " " + parts.month + "&nbsp;&nbsp;" + parts.hour + ":" + parts.minute + " " + (parts.dayPeriod||"").toLowerCase();
  const t24 = new Intl.DateTimeFormat("en-GB", { timeZone:"Asia/Kolkata", hour:"2-digit", minute:"2-digit" });
  $("#wTime").textContent = t24.format(now);
  const df = new Intl.DateTimeFormat("en-IN", { timeZone:"Asia/Kolkata", weekday:"long", day:"numeric", month:"long" });
  $("#wDate").textContent = df.format(now);
  const tp = {};
  new Intl.DateTimeFormat("en-GB", { timeZone:"Asia/Kolkata", hour:"2-digit", minute:"2-digit", second:"2-digit", hourCycle:"h23" }).formatToParts(now).forEach(x => tp[x.type] = parseInt(x.value, 10) || 0);
  const ah = $("#acHour"), am = $("#acMin"), as = $("#acSec");
  if(ah) ah.style.transform = "rotate(" + (((tp.hour % 12) * 30) + tp.minute * 0.5) + "deg)";
  if(am) am.style.transform = "rotate(" + ((tp.minute * 6) + tp.second * 0.1) + "deg)";
  if(as) as.style.transform = "rotate(" + (tp.second * 6) + "deg)";
  const wt = $("#wTime"); if(wt && wt.textContent.indexOf("·") >= 0) wt.textContent = t24.format(now) + " · New Delhi, India";
}
setInterval(tickClock, 1000);

/* ---------------- MENUS ---------------- */
const sleepOverlay = document.createElement("div");
sleepOverlay.style.cssText = "position:fixed;inset:0;background:#000;z-index:9500;display:none;place-items:center;color:rgba(255,255,255,.4);font-size:14px;cursor:pointer";
sleepOverlay.textContent = "Click anywhere to wake";
sleepOverlay.addEventListener("click", ()=> sleepOverlay.style.display = "none");
document.body.appendChild(sleepOverlay);
function showScreenOverlay(label, size, color){
  closeDropdown();
  sleepOverlay.textContent = label;
  sleepOverlay.style.fontSize = size;
  sleepOverlay.style.color = color;
  sleepOverlay.style.display = "grid";
}
function doSleep(){ showScreenOverlay("Click anywhere to wake", "14px", "rgba(255,255,255,.4)"); }
function doLock(){ showScreenOverlay("K", "76px", "#f5f5f7"); }
function doRestart(){
  closeDropdown();
  Object.keys(wins).slice().forEach(closeWin);
  const boot = $("#boot"); boot.classList.remove("done");
  const bar = boot.querySelector(".bar i"); const clone = bar.cloneNode(); bar.replaceWith(clone);
  setTimeout(()=>{ boot.classList.add("done"); setTimeout(()=> openApp("about"), 500); }, 1750);
}
const MENUS = {
  apple: [
    ["About This Mac", ()=> openApp("about")],
    ["System Settings…", ()=> openApp("settings")],
    ["App Store…", ()=> toast("Portfolio edition me App Store nahi — Launchpad hi kaafi hai 😄")],
    null,
    ["Sleep", doSleep],
    ["Restart…", doRestart],
    ["Shut Down…", doSleep],
    null,
    ["Lock Screen", doLock],
  ],
  file: [ ["New Finder Window", ()=> openApp("about")], ["New Folder", ()=> toast("Desktop par folder ban gaya hota — par ye portfolio hai, sab apps me hai")], null, ["Close Window", ()=>{ if(focusedId) closeWin(focusedId); }] ],
  edit: [ ["Undo", ()=> toast("Undo — par galti hui hi nahi 😉")], ["Copy", ()=> toast("Copied! (mann me)")], ["Paste", ()=> toast("Paste karne ke liye pehle kuch copy karo")] ],
  view: [ ["Change Wallpaper", ()=>{ const order = WP_ALL; const cur = order.find(c => $("#desktop").classList.contains(c)) || "wp-streaks"; setWallpaper(order[(order.indexOf(cur)+1)%order.length]); }], ["Launchpad", ()=> toggleLaunchpad(true)], ["Spotlight Search", ()=> openSpotlight()] ],
  go: [ ["About Keshav", ()=> openApp("about")], ["Resume.pdf (Preview)", ()=> openApp("resume")], ["Projects", ()=> openApp("projects")], ["Labs — AI Playground", ()=> openApp("labs")], ["Guestbook", ()=> openApp("guestbook")], ["Contact / Mail", ()=> openApp("contact")], ["Terminal", ()=> openApp("terminal")], ["Calendar", ()=> openApp("calendar")] ],
  help: [ ["Portfolio Help", ()=> toast("Dock se apps kholo · Windows drag karo · Spotlight: ⌘K · LinkedIn/GitHub dock icons seedha site kholte hain")], ["Keyboard Shortcuts", ()=> toast("⌘K / Ctrl+K — Spotlight · Double-click titlebar — maximize · Right-click desktop — menu")] ],
};
let openMenuKey = null;
function closeDropdown(){ $("#dropdown").classList.remove("show"); openMenuKey = null; $$("#menubar .mb-btn").forEach(b=>b.classList.remove("open")); }
function showMenu(key, anchor){
  const dd = $("#dropdown"); const items = MENUS[key]; if(!items) return;
  dd.innerHTML = "";
  items.forEach(it=>{
    if(it === null){ dd.appendChild(document.createElement("hr")); return; }
    const b = document.createElement("button"); b.textContent = it[0];
    b.addEventListener("click", ()=>{ closeDropdown(); it[1](); });
    dd.appendChild(b);
  });
  const r = anchor.getBoundingClientRect();
  dd.style.left = Math.max(6, r.left - 4) + "px";
  dd.classList.add("show"); openMenuKey = key;
  $$("#menubar .mb-btn").forEach(b=>b.classList.toggle("open", b === anchor));
}
$("#appleBtn").addEventListener("click", (e)=>{ e.stopPropagation(); openMenuKey === "apple" ? closeDropdown() : showMenu("apple", e.currentTarget); });
$$("#menubar [data-menu]").forEach(btn=>{
  btn.addEventListener("click", (e)=>{ e.stopPropagation(); openMenuKey === btn.dataset.menu ? closeDropdown() : showMenu(btn.dataset.menu, btn); });
  btn.addEventListener("mouseenter", ()=>{ if(openMenuKey && openMenuKey !== btn.dataset.menu) showMenu(btn.dataset.menu, btn); });
});
document.addEventListener("click", (e)=>{ if(!e.target.closest("#dropdown") && !e.target.closest("#menubar")) { closeDropdown(); $("#cc").classList.remove("show"); } });

/* Control Center */
$("#ccBtn").addEventListener("click", (e)=>{ e.stopPropagation(); $("#cc").classList.toggle("show"); closeDropdown(); });
$("#cc").addEventListener("click", (e)=> e.stopPropagation());
$$("#cc .tile").forEach(t => t.addEventListener("click", ()=>{
  t.classList.toggle("on");
  const sub = t.querySelector("small"); const on = t.classList.contains("on");
  if(t.dataset.cc === "wifi"){ $("#ccWifiSub").textContent = on ? "HomeWiFi-5G" : "Off"; $("#wifiIc").style.opacity = on ? "1" : ".35"; }
  if(sub && t.dataset.cc !== "wifi") sub.textContent = on ? (t.dataset.cc === "focus" ? "Do Not Disturb" : t.dataset.cc === "bt" ? "On" : "Contacts Only") : "Off";
}));
$("#bright").addEventListener("input", (e)=>{ $("#desktop").style.filter = "brightness(" + (e.target.value/100) + ")"; });

const openSpotlight = installSpotlight();

/* ---------------- CONTEXT MENU ---------------- */
const ctx = $("#ctx");
function hideCtx(){ ctx.classList.remove("show"); }
function showCtx(x, y){
  ctx.innerHTML = "";
  [["About This Mac", ()=> openApp("about")], ["Open Launchpad", ()=> toggleLaunchpad(true)], ["Change Wallpaper", ()=>{ const order = WP_ALL; const cur = order.find(c => $("#desktop").classList.contains(c)) || "wp-streaks"; setWallpaper(order[(order.indexOf(cur)+1)%order.length]); }], ["Open Terminal", ()=> openApp("terminal")], ["Sleep", doSleep]].forEach(([label, fn])=>{
    const b = document.createElement("button"); b.textContent = label;
    b.addEventListener("click", ()=>{ hideCtx(); fn(); });
    ctx.appendChild(b);
  });
  ctx.style.left = Math.min(x, innerWidth - 230) + "px";
  ctx.style.top = Math.min(y, innerHeight - 190) + "px";
  ctx.classList.add("show");
}
$("#desktop").addEventListener("contextmenu", (e)=>{
  if(e.target.closest(".window") || e.target.closest("#dock") || e.target.closest("#menubar")) return;
  e.preventDefault(); showCtx(e.clientX, e.clientY);
});
document.addEventListener("click", (e)=>{ if(!e.target.closest("#ctx")) hideCtx(); });

/* Desktop icons */
$$(".desk-icon").forEach(b => b.addEventListener("dblclick", ()=> openApp(b.dataset.open)));
$$(".desk-icon").forEach(b => b.addEventListener("click", ()=> openApp(b.dataset.open)));

/* ---------------- INIT ---------------- */
console.log("%c👋 Namaste, fellow developer! KeshavOS ke console me tumhara swagat hai.", "font-size:15px; font-weight:700; color:#5e5ce6");
console.log("%cYe desktop ek portfolio hai jo pura browser me chalta hai — windows, dock, terminal, sab haath se bana hai. Code dekhna hai to GitHub par milo: github.com/keshavjangid0229-source", "font-size:12px; color:#888");
console.log("%c🐈 Ek hint: desktop par ek billi chhupi hui ghoom rahi hai — aur Terminal me 'neofetch' ya 'sudo hire-me' likhne par kuch khaas hota hai. Khud dhoondho!", "font-size:12px; color:#e07b00");

/* Wandering cat — har kuch seconds me nayi jagah; click par meow + hop + dash */
(function initCat(){
  const cat = document.getElementById("wanderingCat"); if(!cat) return;
  const bubble = document.getElementById("catBubble");
  let lastX = 58, bubbleTimer = null, hopTimer = null, dashTimer = null;
  function moveTo(fast){
    const nx = 4 + Math.random() * 82, ny = 14 + Math.random() * 62;
    if(fast) cat.classList.add("dashing");
    cat.style.transform = nx < lastX ? "scaleX(-1)" : "scaleX(1)";
    cat.style.left = nx + "%"; cat.style.top = ny + "%";
    lastX = nx;
    if(fast){ clearTimeout(dashTimer); dashTimer = setTimeout(()=> cat.classList.remove("dashing"), 650); }
  }
  function wander(){ moveTo(false); }
  function meow(){
    if(bubble){ bubble.classList.add("show"); clearTimeout(bubbleTimer); bubbleTimer = setTimeout(()=> bubble.classList.remove("show"), 1900); }
    cat.classList.remove("hopping"); void cat.offsetWidth; cat.classList.add("hopping");
    clearTimeout(hopTimer); hopTimer = setTimeout(()=> cat.classList.remove("hopping"), 600);
    setTimeout(()=> moveTo(true), 240);
  }
  cat.addEventListener("click", (e)=>{ e.stopPropagation(); meow(); });
  cat.addEventListener("keydown", (e)=>{ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); meow(); } });
  setInterval(wander, 4200);
  setTimeout(wander, 1600);
})();

/* Desktop folders — drag karke kahin bhi rakho, jagah localStorage me save.
   Plain click (bina drag) pehle ki tarah app kholta hai: movement 6px se
   kam ho to click, zyada ho to drag. */
(function initDeskDrag(){
  const icons = $$(".desk-icon"); if(!icons.length) return;
  const KEY = "keshavos-desk-pos-v1";
  let saved = {};
  try{ saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; }catch(e){ saved = {}; }
  let justDraggedEl = null, justDraggedAt = 0;
  document.addEventListener("click", (e)=>{
    if(justDraggedEl && (Date.now() - justDraggedAt) < 400 && e.target.closest && e.target.closest(".desk-icon") === justDraggedEl){
      e.stopPropagation(); e.preventDefault();
    }
  }, true);
  document.addEventListener("dblclick", (e)=>{
    if(justDraggedEl && (Date.now() - justDraggedAt) < 450 && e.target.closest && e.target.closest(".desk-icon") === justDraggedEl){
      e.stopPropagation(); e.preventDefault();
    }
  }, true);
  icons.forEach((icon, idx)=>{
    const key = String(idx);
    let off = saved[key] && typeof saved[key].x === "number" ? saved[key] : { x:0, y:0 };
    function apply(){ icon.style.transform = off.x || off.y ? "translate(" + off.x + "px," + off.y + "px)" : ""; }
    apply();
    icon.addEventListener("pointerdown", (e)=>{
      if(e.button !== undefined && e.button !== 0) return;
      const startX = e.clientX, startY = e.clientY, baseX = off.x, baseY = off.y;
      let moved = false;
      function onMove(ev){
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        if(!moved && Math.hypot(dx, dy) < 6) return;
        if(!moved){ moved = true; icon.classList.add("dragging"); }
        off = { x: baseX + dx, y: baseY + dy };
        apply();
        ev.preventDefault();
      }
      function onUp(){
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
        if(moved){
          icon.classList.remove("dragging");
          saved[key] = off;
          try{ localStorage.setItem(KEY, JSON.stringify(saved)); }catch(err){}
          justDraggedEl = icon; justDraggedAt = Date.now();
        }
      }
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    });
  });
})();

applyDockSize(settingsStore.dockSize, true);
applyReduceTransparency(settingsStore.reduceTransparency, true);
setWallpaper(settingsStore.wallpaper, true);
buildDock(); buildLaunchpad(); tickClock();
buildCalGrid($("#wCal"), true);
window.addEventListener("load", ()=>{
  setTimeout(()=>{
    $("#boot").classList.add("done");
    setTimeout(()=>{ if(!(window.IOSMode && IOSMode.active) && !Object.keys(wins).length && !$("#spotlight").classList.contains("show")) openApp("about"); }, 550);
  }, 1650);
});
