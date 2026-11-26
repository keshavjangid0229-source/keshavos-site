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

/* Music — REAL AUDIO via YouTube IFrame API (in-widget playback).
   "Rakhlo Tum Chupaake" — Arpit Bala, official audio track (album Keychain
   Laalu), video slN2QlYr_-c. Player PURA gaana bajata hai: 0:00 se
   aakhir tak (3:25, 205s) — koi end cap nahi, koi loop nahi. Total time
   har jagah asli video duration (3:25) dikhta hai. Ek hi shared player Now
   Playing widget aur Music app dono ko chalata hai, dono hamesha sync
   rehte hain. Awaz SIRF site ke apne player se aati hai: widget/app ke
   Play-Pause controls bajate hain, progress aur elapsed/total ASLI player
   ke getCurrentTime()/getDuration() se chalte hain.

   Diagnosis (purani silent failure): purana player 1px x 1px, opacity 0
   holder me banta tha — YouTube embed uss invisibility ko block kar deta
   hai, playVideo() kabhi start hi nahi hui, aur koi error bhi fire nahi
   hua (silent fail). Dusri galti: toggle() play dabate hi local state
   flip kar deta tha bina verify kiye ki player asal me baja ya nahi, aur
   player ready hone se pehle dabaye gaye play commands kho jate the.
   Fix: player ab EK ASLI visible mini video area hai — Music app ke
   screen me (album-art ki jagah, 300x170), jo hamesha DOM me rehta hai.
   Widget usi shared player ko remotely control karta hai. Play command
   pending reh sakti hai (player ready hone par execute hoti hai), aur
   har Play ke ~3s baad getPlayerState() se verify hota hai ki asal me
   PLAYING hai — na ho to "YouTube par suno" fallback link dikhta hai aur
   galti console me bhi log hoti hai. Koi autoplay nahi: gaana sirf play
   dabane par bajta hai. */
const SongPlayer = (function(){
  const VIDEO_ID = "slN2QlYr_-c";
  const SEG_START = 0, SEG_END = 205; /* pura gaana: 0:00 → 3:25 (fallback total; asli total player ke getDuration() se aata hai) */
  let yt = null, ready = false, failed = false;
  let playing = false;            /* UI intent — asal state player events se sync hota hai */
  let wantPlay = false;           /* pending play command (player ready hone se pehle dabaye gaye clicks ke liye) */
  let simElapsed = 0, simDur = 205; /* 3:25 — sirf last-resort simulated fallback ke liye */
  let poll = null, simTimer = null, verifyTimer = null, verifyRetried = false;
  const subs = [];
  function times(){
    if(ready && yt && !failed){
      try{
        const t = yt.getCurrentTime() || 0;
        /* Total = asli video duration (3:25) player se; na mile to 205s
           fallback. Elapsed bhi usi total par clamp. */
        let dur = 0; try{ dur = yt.getDuration() || 0; }catch(e){}
        const total = dur > 0 ? dur : SEG_END;
        return { elapsed: Math.min(Math.max(0, t - SEG_START), total), total: total };
      }catch(e){}
    }
    return { elapsed: simElapsed, total: simDur };
  }
  function frac(){ const tm = times(); return tm.total > 0 ? Math.min(1, tm.elapsed / tm.total) : 0; }
  function state(){ const tm = times(); return { playing: playing, frac: frac(), elapsed: tm.elapsed, total: tm.total, failed: failed, real: ready && !failed }; }
  function notify(){ const s = state(); subs.forEach(fn => { try{ fn(s); }catch(e){} }); }
  function stopTimers(){ if(poll){ clearInterval(poll); poll = null; } if(simTimer){ clearInterval(simTimer); simTimer = null; } }
  function startSim(){
    stopTimers();
    simTimer = setInterval(()=>{ simElapsed += 0.25; if(simElapsed >= simDur){ segmentEnd(); return; } notify(); }, 250);
  }
  function runTimers(){
    stopTimers();
    if(!playing) return;
    if(ready && !failed) poll = setInterval(()=>{
      /* Safety net: gaana asli duration par pakka stop — auto-loop NAHI */
      try{ if(yt){ const d = yt.getDuration() || SEG_END; if(d > 0 && yt.getCurrentTime() >= d){ segmentEnd(); return; } } }catch(e){}
      notify();
    }, 250);
    else startSim();
  }
  function setPlaying(p){ playing = p; runTimers(); notify(); }
  function fail(reason){
    if(failed) return;
    failed = true; ready = false;
    if(reason) console.warn("[SongPlayer] Real playback fail:", reason, "— fallback link + simulated progress ON");
    runTimers(); /* baj raha tha to simulated progress par shift ho jao (last resort) */
    notify();
  }
  /* Verify: Play dabane ke ~3s baad asal player state check karo.
     PLAYING nahi hai to pehle EK auto-retry (unMute + volume 100 +
     playVideo) aur verify re-arm; retry ke baad bhi na baje to failure
     VISIBLE karo — "YouTube par suno" fallback link dikhega. */
  function scheduleVerify(){
    if(verifyTimer) clearTimeout(verifyTimer);
    verifyTimer = setTimeout(()=>{
      verifyTimer = null;
      if(failed || !wantPlay) return;
      if(!ready || !yt) return; /* API abhi slow hai — onReady queued play ke baad verify dobara arm karega; API kabhi na aaye to 9s timeout fail karega */
      let st = -99;
      try{ st = yt.getPlayerState(); }catch(e){}
      if(st !== 1 /* YT.PlayerState.PLAYING */){
        if(!verifyRetried){
          /* Ek automatic retry: unMute + full volume + playVideo dobara,
             phir verify aur 3s ke liye re-arm. Uske baad bhi na baje
             tabhi fallback link dikhega. */
          verifyRetried = true;
          console.warn("[SongPlayer] Verify fail (state =", st, ") — ek baar auto-retry: unMute + setVolume(100) + playVideo");
          try{ yt.unMute(); }catch(e){}
          try{ yt.setVolume(100); }catch(e){}
          try{ yt.playVideo(); }catch(e){}
          scheduleVerify();
          return;
        }
        console.warn("[SongPlayer] Verify fail (retry ke baad bhi) — getPlayerState() =", st, "(1 = PLAYING hona chahiye tha)");
        fail("play-verify-timeout");
      }
    }, 3000);
  }
  function doPlay(){
    wantPlay = true;
    verifyRetried = false; /* har fresh Play press ko ek auto-retry milega */
    if(ready && yt && !failed){
      try{ yt.unMute(); }catch(e){}
      try{ yt.setVolume(100); }catch(e){}
      try{ yt.playVideo(); }catch(e){}
      setPlaying(true);
    } else if(failed){
      setPlaying(true); /* simulated fallback */
    } else {
      /* Player abhi ready nahi — command QUEUE karo, kho mat do */
      setPlaying(true);
    }
    scheduleVerify();
  }
  function doPause(){
    wantPlay = false;
    if(verifyTimer){ clearTimeout(verifyTimer); verifyTimer = null; }
    if(yt && ready){ try{ yt.pauseVideo(); }catch(e){} }
    setPlaying(false);
  }
  /* Gaana khatam (poll safety-net ya player ka ENDED event): stop karo,
     0:00 par wapas, Play icon dobara — auto-loop kabhi nahi. */
  function segmentEnd(){
    wantPlay = false;
    if(verifyTimer){ clearTimeout(verifyTimer); verifyTimer = null; }
    if(yt){ try{ yt.pauseVideo(); }catch(e){} try{ yt.seekTo(SEG_START, true); }catch(e){} }
    simElapsed = 0; setPlaying(false); /* progress 0, play icon wapas */
    notify();
  }
  function onEnded(){ segmentEnd(); }
  /* ASLI visible player — Music app me rehta hai; hamesha DOM me hota hai
     (window band hone par bhi, taaki state kabhi kho na jaye). */
  function createPlayer(){
    if(yt) return;
    try{
      yt = new YT.Player("ytPlayerSlot", {
        width: "300", height: "170", videoId: VIDEO_ID,
        playerVars: { enablejsapi: 1, playsinline: 1, rel: 0, modestbranding: 1, controls: 1 },
        events: {
          onReady: function(){
            ready = true;
            /* Pura gaana cue karo: 0:00 se aakhir tak (3:25) — koi
               endSeconds cap NAHI. cueVideoById autoplay NAHI karta —
               gaana sirf Play dabane par bajega. */
            try{ yt.cueVideoById({ videoId: VIDEO_ID, startSeconds: SEG_START }); }catch(e){}
            try{ yt.setVolume(100); }catch(e){}
            if(wantPlay){ /* queued play command ab execute karo */
              try{ yt.unMute(); }catch(e){}
              try{ yt.setVolume(100); }catch(e){}
              try{ yt.playVideo(); }catch(e){}
              scheduleVerify();
            }
            runTimers(); notify();
          },
          onStateChange: function(e){
            if(!window.YT) return;
            if(e.data === YT.PlayerState.ENDED) onEnded();
            else if(e.data === YT.PlayerState.PLAYING){ if(verifyTimer){ clearTimeout(verifyTimer); verifyTimer = null; } setPlaying(true); }
            else if(e.data === YT.PlayerState.PAUSED){ if(!wantPlay) setPlaying(false); }
          },
          onError: function(ev){ fail("yt-error-" + (ev && ev.data)); }
        }
      });
    }catch(err){ fail("player-construct"); }
  }
  /* Floating player box — iframe DOM me EK hi jagah rehta hai (DOM me
     move karne se iframe reload ho jata hai), lekin CSS position se ye
     widget ke mini video area ya Music app ke video area ke upar bilkul
     chipka rehta hai (har animation frame sync). Isiliye player hamesha
     ek ASLI, visible, full-size jagah par hota hai — purana 1px /
     opacity-0 wala tareeka gaya, wahi silent failure ki jad thi. */
  const floatBox = document.createElement("div");
  floatBox.id = "ytFloat";
  floatBox.style.cssText = "position:fixed; left:0; top:0; width:200px; height:112px; z-index:5; border-radius:10px; overflow:hidden; background:#000; visibility:hidden; box-shadow:0 10px 30px rgba(0,0,0,.35)";
  const slotEl = document.createElement("div"); slotEl.id = "ytPlayerSlot"; slotEl.style.cssText = "width:100%; height:100%";
  floatBox.appendChild(slotEl);
  document.body.appendChild(floatBox);
  function visibleDock(){
    const m = document.getElementById("ytDockMusic");
    if(m && m.getClientRects().length) return { el: m, z: 4000 };
    const mo = document.getElementById("ytDockMobile");
    if(mo && mo.getClientRects().length) return { el: mo, z: 300 };
    const w = document.getElementById("ytDockWidget");
    if(w && w.getClientRects().length) return { el: w, z: 5 };
    return null;
  }
  function syncDock(){
    const d = visibleDock();
    if(d){
      const r = d.el.getBoundingClientRect();
      floatBox.style.left = r.left + "px"; floatBox.style.top = r.top + "px";
      floatBox.style.right = "auto"; floatBox.style.bottom = "auto";
      floatBox.style.width = r.width + "px"; floatBox.style.height = r.height + "px";
      floatBox.style.zIndex = d.z; floatBox.style.visibility = "visible";
    } else if(playing || wantPlay){
      /* Koi dock visible nahi (jaise mobile par Music window band) —
         chhota floating mini-player, taaki bajta gaana dikhe bhi */
      floatBox.style.left = "auto"; floatBox.style.top = "auto";
      floatBox.style.right = "12px"; floatBox.style.bottom = "96px";
      floatBox.style.width = "176px"; floatBox.style.height = "99px";
      floatBox.style.zIndex = 4000; floatBox.style.visibility = "visible";
    } else {
      floatBox.style.visibility = "hidden";
    }
    requestAnimationFrame(syncDock);
  }
  requestAnimationFrame(syncDock);
  window.onYouTubeIframeAPIReady = createPlayer;
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  tag.onerror = function(){ fail("api-script-load"); };
  document.head.appendChild(tag);
  /* API kabhi aaye hi na (offline/block) to silent mat raho */
  setTimeout(()=>{ if(!ready && !failed && typeof window.YT === "undefined") fail("api-timeout-9s"); }, 9000);
  return {
    toggle: function(){
      if(wantPlay || playing) doPause(); else doPlay();
    },
    restart: function(){
      simElapsed = 0;
      if(yt && ready && !failed){ try{ yt.seekTo(0, true); }catch(e){} }
      doPlay(); notify();
    },
    subscribe: function(fn){ subs.push(fn); try{ fn(state()); }catch(e){} }
  };
})();

function fmtSongTime(sec){ sec = Math.max(0, Math.floor(sec || 0)); const m = Math.floor(sec / 60), s = sec % 60; return m + ":" + (s < 10 ? "0" : "") + s; }

function initMusic(win){
  const play = $("#mPlay", win), prog = $("#musicProg", win), viz = $("#viz", win), art = $("#ytDockMusic", win);
  if(!play) return;
  /* Sirf ek hi track hai — hidden gem. Baaki music kahin nahi dikhta.
     Playback asli hai — shared SongPlayer widget ke saath full sync. */
  play.addEventListener("click", ()=> SongPlayer.toggle());
  const restart = ()=>{ SongPlayer.restart(); toast("♪ Rakhlo Tum Chupaake — yehi ek hidden gem hai 🔒"); };
  const nx = $("#mNext", win), pv = $("#mPrev", win);
  if(nx) nx.addEventListener("click", restart);
  if(pv) pv.addEventListener("click", restart);
  const ytLink = $("#mYtLink", win);
  const mEl = $("#mElapsed", win), mTt = $("#mTotal", win);
  SongPlayer.subscribe((s)=>{
    play.textContent = s.playing ? "⏸" : "▶";
    if(viz) viz.classList.toggle("play", s.playing);
    if(art) art.classList.toggle("playing", s.playing);
    if(prog) prog.style.width = (s.frac * 100).toFixed(1) + "%";
    if(mEl) mEl.textContent = fmtSongTime(s.elapsed);
    if(mTt) mTt.textContent = fmtSongTime(s.total);
    if(ytLink) ytLink.style.display = s.failed ? "inline-block" : "none";
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
var WP_ALL = ["wp-streaks","wp-dusk","wp-tide","wp-lagoon","wp-ember","wp-graphite","wp-waves","wp-crimson","wp-aurora","wp-sunset"];
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
  /* Front screen par sirf yehi ek gaana — Rakhlo Tum Chupaake, Arpit Bala.
     Koi playlist nahi, baaki music hidden hai. Playback ASLI hai — shared
     SongPlayer (YouTube IFrame API) se, Music app ke saath full sync. */
  const btn = $("#npPlay"), prog = $("#npProg"), ytLink = $("#npYtLink");
  const npEl = $("#npElapsed"), npTt = $("#npTotal");
  $$(".np-eq i", w).forEach((bar, i)=> bar.style.animationDelay = (i * 0.08) + "s");
  btn.addEventListener("click", (e)=>{
    e.stopPropagation();
    SongPlayer.toggle();
  });
  if(ytLink) ytLink.addEventListener("click", (e)=> e.stopPropagation());
  SongPlayer.subscribe((s)=>{
    btn.textContent = s.playing ? "⏸" : "▶";
    w.classList.toggle("playing", s.playing);
    prog.style.width = (s.frac * 100).toFixed(1) + "%";
    if(npEl) npEl.textContent = fmtSongTime(s.elapsed);
    if(npTt) npTt.textContent = fmtSongTime(s.total);
    if(ytLink) ytLink.style.display = s.failed ? "inline-block" : "none";
  });
  w.addEventListener("click", ()=> openApp("music"));
})();
$("#lpOpen").addEventListener("click", ()=> openApp("projects"));

/* Wallpaper */
function setWallpaper(cls, silent){
  const d = $("#desktop");
  WP_ALL.forEach(c => d.classList.remove(c));
  d.classList.add(cls);
  $$(".wp-thumb, .wp-card").forEach(t => t.classList.toggle("sel", t.dataset.wp === cls));
  if(typeof settingsStore !== "undefined"){ settingsStore.wallpaper = cls; saveSettings(); }
  const names = { "wp-streaks":"Streaks (Default)", "wp-dusk":"Dusk", "wp-tide":"Tide", "wp-lagoon":"Lagoon", "wp-ember":"Ember", "wp-graphite":"Graphite", "wp-waves":"Sonoma Waves", "wp-crimson":"Crimson Streak", "wp-aurora":"Aurora", "wp-sunset":"Sunset Coast" };
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
    setTimeout(()=>{ if(!(window.IOSMode && IOSMode.active)) openApp("about"); }, 550);
  }, 1650);
});
