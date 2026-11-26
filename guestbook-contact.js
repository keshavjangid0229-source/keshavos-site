"use strict";
/* ================= REACT APPS — Contact + Guestbook =================
   React 18 (UMD) se powered. Contact form: Formspree endpoint set ho to
   seedha POST hota hai; khaali ho to visitor ka mail app Keshav ke Gmail
   par ready message ke saath khulta hai. Endpoint yahan paste karna hai:
   e.g. "https://formspree.io/f/abcdwxyz"                          */
var FORMSPREE_ENDPOINT = "";
var CONTACT_EMAIL = "keshavjangid0229@gmail.com";

function gbRelTime(ts){
  var s = Math.floor((Date.now() - ts) / 1000);
  if(s < 45) return "just now";
  var m = Math.floor(s / 60); if(m < 60) return m + " min ago";
  var hh = Math.floor(m / 60); if(hh < 24) return hh + (hh === 1 ? " hr ago" : " hrs ago");
  var d = Math.floor(hh / 24); return d + (d === 1 ? " day ago" : " days ago");
}
var GB_COLORS = ["#0a84ff","#30a46c","#e07b00","#e5486c","#5e5ce6","#0e9bb5","#9b4dca","#e03131"];
function gbColor(name){ var n = 0; for(var i = 0; i < name.length; i++) n += name.charCodeAt(i); return GB_COLORS[n % GB_COLORS.length]; }

const guestbookStorageKey = "keshavos-guestbook";
const guestbookWelcome = { id: "owner-welcome", name: "Keshav", owner: true, status: "approved",
  ts: 0, likes: 0, liked: false, msg: "Welcome! Leave a note about the portfolio." };
function loadGuestbook(){
  try {
    const rows = JSON.parse(localStorage.getItem(guestbookStorageKey) || "[]");
    return Array.isArray(rows) ? rows.filter(row => row && typeof row.id === "string" &&
      typeof row.name === "string" && typeof row.msg === "string") : [];
  } catch { return []; }
}
const guestbookEntries = loadGuestbook();
var GB_STORE = {
  entries: guestbookEntries.concat(guestbookWelcome),
  listeners: []
};
function gbNotify(){
  try { localStorage.setItem(guestbookStorageKey, JSON.stringify(GB_STORE.entries.filter(entry => !entry.owner))); }
  catch { /* Keep this session usable if browser storage is unavailable. */ }
  GB_STORE.listeners.slice().forEach(fn => fn());
}

function GuestbookApp(){
  var h = React.createElement, useState = React.useState, useEffect = React.useEffect;
  var tS = useState(0), setTick = tS[1];
  var nS = useState(""), name = nS[0], setName = nS[1];
  var mS = useState(""), msg = mS[0], setMsg = mS[1];
  var erS = useState(""), err = erS[0], setErr = erS[1];

  useEffect(function(){
    var fn = function(){ setTick(function(t){ return t + 1; }); };
    GB_STORE.listeners.push(fn);
    return function(){ GB_STORE.listeners = GB_STORE.listeners.filter(function(f){ return f !== fn; }); };
  }, []);

  var entries = GB_STORE.entries;
  var api = document.querySelector('meta[name="keshavos-api"]')?.content.trim().replace(/\/$/, "") || "";
  var [sending, setSending] = useState(false);

  async function submit(e){
    e.preventDefault();
    var n = name.trim(), m = msg.trim();
    if(!n || !m){ setErr("Naam aur message dono likho — phir Sign dabao."); return; }
    if (sending) return;
    if (api) {
      setSending(true); setErr("");
      try {
        var response = await fetch(api + "/guestbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: n, message: m })
        });
        if (!response.ok) throw new Error("Save failed");
        setMsg("");
        toast("Guestbook entry saved for review.");
      } catch {
        setErr("Could not save your note. Please try again.");
      } finally { setSending(false); }
      return;
    }
    var entry = { id: "g" + Date.now() + Math.floor(Math.random() * 999), name: n, msg: m, ts: Date.now(), likes: 0, liked: false, status: "approved" };
    GB_STORE.entries = [entry].concat(GB_STORE.entries);
    setMsg(""); setErr("");
    gbNotify();
    toast("Guestbook entry saved in this browser.");
  }
  function toggleLike(id){
    GB_STORE.entries = GB_STORE.entries.map(function(en){
      return en.id === id ? Object.assign({}, en, { liked: !en.liked, likes: en.likes + (en.liked ? -1 : 1) }) : en;
    });
    gbNotify();
  }
  function removeEntry(id){
    GB_STORE.entries = GB_STORE.entries.filter(function(en){ return en.id !== id; });
    gbNotify();
  }
  function renderEntry(en){
    return h("article", { key: en.id, className: "gb-entry" },
      h("span", { className: "gb-av", style: { background: gbColor(en.name) } }, (en.name.charAt(0) || "?").toUpperCase()),
      h("div", { className: "gb-main" },
        h("div", { className: "gb-top" },
          h("b", null, en.name),
          en.owner ? h("span", { className: "gb-badge owner" }, "Owner") : null,
          en.owner ? null : h("span", { className: "gb-time" }, gbRelTime(en.ts))),
        h("p", { className: "gb-msg" }, en.msg),
        h("div", { className: "gb-actions" },
          h("button", { type: "button", className: "gb-like" + (en.liked ? " on" : ""), onClick: function(){ toggleLike(en.id); }, "aria-label": "Like this message" }, (en.liked ? "♥ " : "♡ ") + en.likes),
          !en.owner
            ? h("button", { type: "button", className: "gb-del", onClick: function(){ removeEntry(en.id); } }, "Delete")
            : null
        )
      )
    );
  }

  return h("div", { className: "gb-wrap" },
    h("div", { className: "gb-head" },
      h("h3", null, "Sign the Guestbook"),
      h("p", null, "Leave a note about the portfolio."),
      h("span", { className: "gb-count" }, entries.length + (entries.length === 1 ? " signature" : " signatures"))
    ),
    h("form", { className: "gb-form", onSubmit: submit },
      h("input", { value: name, onChange: function(e){ setName(e.target.value); }, placeholder: "Tumhara naam", maxLength: 40, "aria-label": "Your name" }),
      h("textarea", { value: msg, onChange: function(e){ setMsg(e.target.value); }, placeholder: "Kuch likho — feedback, salaam, ya bas hello…", maxLength: 280, "aria-label": "Your message" }),
      err ? h("div", { className: "gb-err" }, err) : null,
      h("div", { className: "gb-form-foot" },
        h("span", { className: "gb-note" }, api ? "New entries are saved for review." : "Entries are saved in this browser."),
        h("button", { type: "submit", className: "gb-sign", disabled: sending }, sending ? "Saving…" : "Sign Guestbook")
      )
    ),
    h("div", { className: "gb-list" }, entries.map(renderEntry))
  );
}

function ContactApp(){
  var h = React.createElement, useState = React.useState;
  var fS = useState({ name: "", email: "", subject: "", msg: "" }), f = fS[0], setF = fS[1];
  var sS = useState("idle"), status = sS[0], setStatus = sS[1];
  function upd(k){ return function(e){ var o = Object.assign({}, f); o[k] = e.target.value; setF(o); }; }

  function submit(e){
    e.preventDefault();
    if(!f.name.trim() || !f.msg.trim()){ setStatus("error"); return; }
    if(FORMSPREE_ENDPOINT){
      setStatus("sending");
      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name: f.name, email: f.email, subject: f.subject, message: f.msg })
      }).then(function(r){ setStatus(r.ok ? "sent-form" : "error"); })
        .catch(function(){ setStatus("error"); });
    } else {
      var subj = encodeURIComponent(f.subject || ("Portfolio message from " + f.name));
      var body = encodeURIComponent(f.msg + "\n\n— " + f.name + (f.email ? " (" + f.email + ")" : ""));
      var a = document.createElement("a");
      a.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subj + "&body=" + body;
      document.body.appendChild(a); a.click(); a.remove();
      setStatus("sent-mail");
      toast("Mail app khul raha hai — wahan se Send kar dena.");
    }
  }

  if(status === "sent-form" || status === "sent-mail"){
    return h("div", { className: "ct-sent" },
      h("svg", { viewBox: "0 0 52 52", width: 72, height: 72, "aria-hidden": "true" },
        h("circle", { className: "ck-circle", cx: 26, cy: 26, r: 24, fill: "none", stroke: "#30d158", strokeWidth: 2.5 }),
        h("path", { className: "ck-check", fill: "none", stroke: "#30d158", strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round", d: "M14 27l8 8 16-17" })
      ),
      h("h3", null, status === "sent-form" ? "Message bhej diya!" : "Bas ek step baki hai"),
      h("p", null, status === "sent-form"
        ? "Dhanyavaad, " + (f.name.split(" ")[0] || "dost") + " — message mere inbox me aa gaya hai, jald reply karunga."
        : "Tumhara mail app khul gaya hoga aur message ready hai — wahan Send dabate hi wo seedha mere inbox me aa jayega."),
      h("button", { className: "send-btn", style: { maxWidth: 240, margin: "18px auto 0" }, onClick: function(){ setStatus("idle"); setF({ name: "", email: "", subject: "", msg: "" }); } }, "Ek aur message likho")
    );
  }

  return h("div", { className: "contact-body" },
    h("div", { className: "ct-profile" },
      h("span", { className: "avatar" }, "KJ"),
      h("div", null,
        h("b", null, "Keshav Jangid"),
        h("p", null, "Full-Stack Developer · Web Apps & Hackathons"),
        h("p", null, "✉ keshavjangid0229@gmail.com"),
        h("div", { className: "ct-links" },
          h("a", { href: "https://github.com/keshavjangid0229-source", target: "_blank", rel: "noopener" }, "GitHub ↗"),
          h("a", { className: "li", href: "https://www.linkedin.com", target: "_blank", rel: "noopener", title: "LinkedIn profile URL abhi add nahi hai — linkedin.com khulega" }, "LinkedIn ↗"),
          h("a", { className: "ml", href: "mailto:keshavjangid0229@gmail.com" }, "Email")
        )
      )
    ),
    h("h3", null, "Get in touch"),
    h("p", null, "Project, internship ya collaboration ke liye likho — form bharo, Send dabate hi tumhara mail app mere Gmail (keshavjangid0229@gmail.com) par ready message ke saath khul jayega."),
    h("form", { onSubmit: submit },
      h("label", null, "Your name"),
      h("input", { value: f.name, onChange: upd("name"), placeholder: "Naam", required: true }),
      h("label", null, "Your email"),
      h("input", { type: "email", value: f.email, onChange: upd("email"), placeholder: "tumhara@email.com" }),
      h("label", null, "Subject"),
      h("input", { value: f.subject, onChange: upd("subject"), placeholder: "Internship / Project / Hello" }),
      h("label", null, "Message"),
      h("textarea", { value: f.msg, onChange: upd("msg"), placeholder: "Hi Keshav, ...", required: true }),
      status === "error" ? h("div", { className: "gb-err" }, "Kuch gadbad hai — naam aur message check karke dobara try karo.") : null,
      h("button", { className: "send-btn", type: "submit", disabled: status === "sending" }, status === "sending" ? "Bhej raha hoon…" : "Send Message")
    ),
    h("div", { className: "ct-alt" },
      h("span", null, "Ya seedha yahan milo:"),
      h("a", { href: "https://github.com/keshavjangid0229-source", target: "_blank", rel: "noopener" }, "GitHub ↗"),
      h("a", { href: "https://www.linkedin.com", target: "_blank", rel: "noopener" }, "LinkedIn (linkedin.com) ↗")
    )
  );
}

function mountReactApp(win, component){
  var mount = win.querySelector(".react-mount");
  if(!mount) return false;
  if(!(window.React && window.ReactDOM && ReactDOM.createRoot)) return false;
  var root = ReactDOM.createRoot(mount);
  root.render(React.createElement(component));
  var rec = wins[win.dataset.app];
  if(rec) rec.root = root;
  return true;
}
function mountContact(win){
  if(mountReactApp(win, ContactApp)) return;
  var mount = win.querySelector(".react-mount"); if(!mount) return;
  mount.innerHTML = '<div class="contact-body"><h3>Get in touch</h3><p>Form abhi load nahi ho paya — seedha mail kar do, main wahi padhta hoon:</p><a class="send-btn" style="display:block;text-align:center;text-decoration:none" href="mailto:' + CONTACT_EMAIL + '">Email Keshav ↗</a></div>';
}
function mountGuestbook(win){
  if(mountReactApp(win, GuestbookApp)) return;
  var mount = win.querySelector(".react-mount"); if(!mount) return;
  mount.innerHTML = '<div class="gb-wrap"><div class="gb-empty"><div class="gb-empty-ic">✎</div><b>Guestbook load nahi ho paya</b><p>Iske liye internet chahiye hota hai — tab tak Mail app se message bhej do.</p><p><button class="gb-sign" data-goto="contact" style="margin:12px auto 0">Mail App Kholo</button></p></div></div>';
}
