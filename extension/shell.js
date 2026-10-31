/* StudentDesk AIUB — App shell.
   Reads pages from portal.aiub.edu with the user's own logged-in session (same as clicking
   the links), parses them in this browser, and shows them in a new UI. Nothing is sent anywhere. */
(function () {
  "use strict";
  if (window.__ppShell) return; window.__ppShell = true;
  var API = window.__aiubPlusAPI; if (!API) return;
  try { if (window.top !== window) return; } catch (e) { return; }
  if (!/^\/Student(\/|$)/i.test(location.pathname)) return;      // only on logged-in student pages
  if (!API.get().app) return;
  var root = document.documentElement;

  /* ------------------------------------------------------------ helpers */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function txt(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function title(s) { return String(s || "").toLowerCase().replace(/(^|[\s(&\/-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }).replace(/\b(And|Of|In|To|With|For|The|On)\b/g, function (w) { return w.toLowerCase(); }).replace(/^./, function (c) { return c.toUpperCase(); }); }
  function money(n) { return (isNaN(n) ? 0 : n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
  function num(s) { var n = parseFloat(String(s || "").replace(/,/g, "")); return isNaN(n) ? 0 : n; }
  function hue(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }
  function ccol(s) { return "hsl(" + ((hue(s) * 7) % 360) + ",72%,56%)"; }
  function fmtT(m) { var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "PM" : "AM", hh = h % 12 || 12; return hh + ":" + (mm < 10 ? "0" : "") + mm + " " + ap; }
  function fmtShort(m) { var h = Math.floor(m / 60), mm = m % 60, hh = h % 12 || 12; return hh + ":" + (mm < 10 ? "0" : "") + mm; }
  function dur(m) { var h = Math.floor(m / 60), mm = m % 60; return (h ? h + "h " : "") + (mm ? mm + "m" : (h ? "" : "0m")).trim(); }
  function nowMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAYFULL = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };
  var GP = { "A+": 4, "A": 3.75, "B+": 3.5, "B": 3.25, "C+": 3, "C": 2.75, "D+": 2.5, "D": 2.25, "F": 0 };

  var ICONS = {
    drop: '<path d="M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
    wind: '<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 17h5a2 2 0 1 1-2 2"/>',
    home: '<path d="m3.5 10 8.5-7 8.5 7v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/><path d="M9 21v-7.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V21"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="4"/><path d="M7.5 3v4m9-4v4M3 11h18m-13 4h.1m4.9 0h.1m-5.1 3h.1m4.9 0h.1m3.9-3h.1"/>',
    book: '<path d="M12 5C8 2 4 3 2.5 4v15c3-1.5 6.5-1.5 9.5 1.5 3-3 6.5-3 9.5-1.5V4C19 3 15 2 12 5Zm0 0v15.5M5.5 7h3m7 0h3"/>',
    award: '<circle cx="12" cy="8.5" r="5.5"/><path d="m8 13-1.5 8 5.5-3 5.5 3-1.5-8"/><path d="m10 8.5 1.5 1.5L14 7"/>',
    wallet: '<path d="M19.5 8V5.5a2 2 0 0 0-2.3-2L5 5.5A2.5 2.5 0 0 0 3 8v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3H5"/><path d="M21 13h-5a2 2 0 0 0 0 4h5m-4-2h.1"/>',
    mail: '<rect x="3" y="5" width="18" height="15" rx="4"/><path d="m4 7 6.5 5a2.5 2.5 0 0 0 3 0L20 7m-16 11 5-5m11 5-5-5"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    gear: '<path d="M9.53 4.39 L10.47 4.15 L10.61 2.10 L13.39 2.10 L13.53 4.15 L14.47 4.39 L15.63 4.87 L16.47 5.37 L18.02 4.01 L19.99 5.98 L18.63 7.53 L19.13 8.37 L19.61 9.53 L19.85 10.47 L21.90 10.61 L21.90 13.39 L19.85 13.53 L19.61 14.47 L19.13 15.63 L18.63 16.47 L19.99 18.02 L18.02 19.99 L16.47 18.63 L15.63 19.13 L14.47 19.61 L13.53 19.85 L13.39 21.90 L10.61 21.90 L10.47 19.85 L9.53 19.61 L8.37 19.13 L7.53 18.63 L5.98 19.99 L4.01 18.02 L5.37 16.47 L4.87 15.63 L4.39 14.47 L4.15 13.53 L2.10 13.39 L2.10 10.61 L4.15 10.47 L4.39 9.53 L4.87 8.37 L5.37 7.53 L4.01 5.98 L5.98 4.01 L7.53 5.37 L8.37 4.87 Z"/><circle cx="12" cy="12" r="3.3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    coffee: '<path d="M4 8h12v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Zm12 1h2a3 3 0 0 1 0 6h-2"/><path d="M7 2v3m5-3v3M3 22h14"/>',
    ext: '<path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', back: '<path d="m15 18-6-6 6-6"/>', down: '<path d="m6 9 6 6 6-6"/>', lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    lib: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>', file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    megaphone: '<path d="m4 9 14-5v15L4 14Z"/><path d="M4 9v5m3 1 2 6h4l-2-5m10-9 1-1m-1 6h2m-2 5 1 1"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2"/><path d="m17 6 3 3"/><path d="m14.5 8.5 2 2"/>',
    calc: '<rect x="5" y="2.5" width="14" height="19" rx="3"/><path d="M8.5 7h7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
    spark: '<rect x="5" y="4" width="15" height="17" rx="3"/><path d="M9 3v3m7-3v3m-8 5 1.5 1.5L12 10m2 2h3m-9 4 1.5 1.5L12 15m2 2h3"/>',
    minus: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    cloud: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    bell: '<path d="M5 9a7 7 0 0 1 14 0c0 5 1.5 6 2 8H3c.5-2 2-3 2-8Z"/><path d="M10 21h4m-4-4v1a2 2 0 0 0 4 0v-1"/>', flash: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'
  };
  function ic(n, cls) { return '<svg class="i ' + (cls || "") + '" data-sd-icon="' + esc(n) + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[n] || "") + "</svg>"; }

  /* ------------------------------------------------------------ portal links (from the real menu) */
  var LINKS = {}, MENU = [];
  function collectLinks() {
    $$("a[href]").forEach(function (a) { var t = txt(a), h = a.getAttribute("href"); if (t && h && h.charAt(0) === "/" && !LINKS[t]) LINKS[t] = h; });
    $$("#navigation-bar .panel").forEach(function (p) {
      var g = txt($(".panel-title", p)); var items = $$("a.list-group-item", p).map(function (a) { return { t: txt(a), h: a.getAttribute("href") }; });
      if (g && items.length) MENU.push({ g: g, items: items });
    });
  }
  function L(name) { return LINKS[name] || null; }
  var NAME = "", FIRST = "";

  /* ------------------------------------------------------------ data layer */
  var mem = {};
  var STORE = (function () { try { localStorage.setItem("pp.t", "1"); localStorage.removeItem("pp.t"); return localStorage; } catch (e) { return sessionStorage; } })();
  function cacheRaw(k) { try { return JSON.parse(STORE.getItem("pp.c." + k)); } catch (e) { return null; } }
  function clearCache() { mem = {}; pkMemo = {}; [STORE, sessionStorage].forEach(function (st) { try { Object.keys(st).forEach(function (k) { if (k.indexOf("pp.c.") === 0) st.removeItem(k); }); } catch (x) {} }); }
  var pkMemo = {};
  function peek(k) { if (mem[k]) return mem[k]; if (pkMemo[k]) return pkMemo[k]; var r = cacheRaw(k); return r && r.d ? (pkMemo[k] = r.d) : null; }
  var bgQ = Promise.resolve();
  function bg(fn) { var p = bgQ.then(fn, fn); bgQ = p.catch(function () {}); return p; }   // one background request at a time
  function cacheGet(k) { var v = cacheRaw(k); return v && Date.now() - v.t < 10 * 60e3 ? v.d : null; }
  function cacheSet(k, d) { delete pkMemo[k]; try { STORE.setItem("pp.c." + k, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} if (TRK_BY_KEY[k]) { mem[k] = d; schedPaint(); } }
  var inflight = {};
  var requestWarnings = {};
  function networkError(e) { return e && (e.name === "TypeError" || e.name === "AbortError" || /load failed|failed to fetch|network|timeout|responding|HTTP (408|502|503|504)/i.test(e.message || "")); }
  function retryRead(fn) { return Promise.resolve().then(fn).catch(function (e) { if (!networkError(e) || navigator.onLine === false) throw e; return new Promise(function (r) { setTimeout(r, 650); }).then(fn); }); }
  function getDoc(url) {
    if (inflight[url]) return inflight[url];
    var attempt = function () {
      var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
      return fetch(url, { credentials: "include", signal: ctl ? ctl.signal : undefined }).then(function (r) {
        if (/\/Login(?:\/|\?|$)/i.test(r.url)) throw new Error("SESSION");
        if (r.status === 401) throw new Error("SESSION");
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }).then(function (h) { var d = new DOMParser().parseFromString(h, "text/html"); if (d.getElementById("loginForm") || d.querySelector('form input[type="password"]') && !d.querySelector("#navigation-bar")) throw new Error("SESSION"); return d; }).finally(function () { clearTimeout(to); });
    };
    var pr = retryRead(attempt).catch(function (e) { if (e && e.name === "AbortError") throw new Error("The portal is responding slowly — please try again"); throw e; });
    pr.then(done, done); function done() { delete inflight[url]; }
    return (inflight[url] = pr);
  }
  function load(key, url, parser, force) {
    if (!url) return Promise.reject(new Error("NOLINK"));
    if (!force && mem[key]) return Promise.resolve(mem[key]);
    // the page we are already on: read it straight from the open document (no network)
    if (!force && !mem[key] && samePage(url)) { var lv = parser(document); mem[key] = lv; cacheSet(key, lv); return Promise.resolve(lv); }
    var fresh = function () { return getDoc(url).then(function (d) { var v = parser(d); delete requestWarnings[key]; mem[key] = v; cacheSet(key, v); return v; }); };
    var raw = !force && cacheRaw(key);
    if (raw && raw.d) {
      mem[key] = raw.d;
      if (Date.now() - raw.t > 10 * 60e3 && !load.busy[key]) load.busy[key] = bg(fresh).then(function () { delete load.busy[key]; if (!document.hidden) softRefresh(); }, function (e) { delete load.busy[key]; if (e && e.message !== "SESSION") { requestWarnings[key] = "Could not refresh. Showing saved data."; if (!document.hidden) workspacePaint(); } }); if (0) fresh().then(function () { if (!document.hidden) softRefresh(); }, function () {});   // show old instantly, update silently
      return Promise.resolve(raw.d);
    }
    return fresh().catch(function (e) {
      if ((force && (key === "reg" || key === "offered")) || e && (e.message === "SESSION" || e.message === "HTTP 403")) throw e;
      var saved = cacheRaw(key);
      if (saved && saved.d) { requestWarnings[key] = "Could not refresh. Showing saved data."; mem[key] = saved.d; return saved.d; }
      throw e;
    });
  }

  load.busy = {};
  function samePage(url) { try { var u = new URL(url, location.href); return u.pathname.toLowerCase() === location.pathname.toLowerCase() && u.search === location.search; } catch (e) { return false; } }

  function parseRange(s) {
    var m = /(\w{3})\w*\s+(\d{1,2}):(\d{1,2})\s*(AM|PM)?\s*-\s*(?:\w{3}\w*\s+)?(\d{1,2}):(\d{1,2})\s*(AM|PM)?/i.exec(s); if (!m) return null;
    function tm(h, mi, ap) { h = +h; mi = +mi; if (ap) { ap = ap.toUpperCase(); if (ap === "PM" && h < 12) h += 12; if (ap === "AM" && h === 12) h = 0; } else if (h < 8) h += 12; return h * 60 + mi; }
    var a = tm(m[2], m[3], m[4]), b = tm(m[5], m[6], m[7]);
    if (b <= a) b += 12 * 60;
    return { day: m[1].slice(0, 3).replace(/^./, function (c) { return c.toUpperCase(); }).replace(/^(.)(..)$/, function (x, p, q) { return p + q.toLowerCase(); }), start: a, end: b };
  }
  function splitCourse(t) { var m = /^(?:(\d{4,6})-)?(.*?)\s*\[([^\]]+)\]\s*$/.exec(t.trim()); return m ? { cid: m[1] || "", name: m[2].trim(), sec: m[3].trim() } : { cid: "", name: t.trim(), sec: "" }; }
  function norm(s) { return String(s || "").toUpperCase().replace(/&/g, "AND").replace(/[^A-Z0-9]/g, ""); }

  /* the portal's own "Registration" action button (red btn, only shown while registration is open) */
  function findRegBtn(d) {
    var box = d.querySelector("#main-content") || d.body || d, hit = null;
    $$("a[href], button, input[type=button], input[type=submit]", box).some(function (el) {
      var t = (txt(el) || el.value || "").trim(), cls = el.className || "", h = el.getAttribute("href") || "", oc = el.getAttribute("onclick") || "";
      if (!/regist|pre-?reg|advis|add\s*course|course\s*(add|select)/i.test(t) || /print|history|report|drop/i.test(t + " " + h)) return false;
      if (!/btn|alert/.test(cls + " " + ((el.closest(".alert") || {}).className || ""))) return false;
      var m = /location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/.exec(oc); h = m ? m[1] : h;
      if (!h || h === "#" || /^javascript:/i.test(h)) return false;
      if (/^https?:\/\//i.test(h)) { try { var u = new URL(h); if (u.origin !== location.origin) return false; h = u.pathname + u.search; } catch (e) { return false; } }
      if (h.charAt(0) !== "/") h = "/" + h;
      hit = { h: h, t: t.slice(0, 40) }; return true;
    });
    return hit;
  }
  function regTarget() {
    var a = (peek("home") || {}).regGo || (peek("reg") || {}).regGo || null;
    if (!a) MENU.some(function (g) { return g.items.some(function (it) { if (/regist/i.test(it.t) && it.h && it.h !== L("Registration") && !/print|drop/i.test(it.t + it.h)) { a = { h: it.h, t: it.t }; return true; } }); });
    var st = peek("regst");
    var h = a ? a.h : "/Student/Registration/Start";
    return { h: h, st: st, open: !!(st && st.open) };
  }
  /* Registration is "open" only when the portal's registration start page really shows Next + Cancel
     (outside the hidden precaution popup) and no "not allowed" message. Plain page read, nothing is submitted. */
  function parseRegStart(d) {
    var box = $(".portal-body", d) || d.body || d;
    var al = $$(".alert", box).filter(function (x) { return !x.closest(".modal"); }).map(txt).join(" ").replace(/\s+/g, " ").trim();
    var vis = function (el) { return !el.closest(".modal") && !/display\s*:\s*none/i.test(el.getAttribute("style") || "") && !el.closest("[style*='display: none'],[style*='display:none'],.ng-hide"); };
    var ctl = $$("a, button, input[type=button], input[type=submit]", box).filter(vis), lab = function (el) { return (txt(el) || el.value || "").replace(/\s+/g, " ").trim(); };
    var next = ctl.some(function (el) { return /^next\b/i.test(lab(el)); }), cancel = ctl.some(function (el) { return /^cancel$/i.test(lab(el)); });
    var blocked = /not allowed|closed|not open|expired|no registration/i.test(al);
    return { known: (next && cancel) || blocked || /already completed/i.test(al), open: next && cancel && !blocked, done: /already completed/i.test(al), msg: al.slice(0, 180) };
  }
  var regBusy = null;
  function regStatus(force) {
    var c = cacheRaw("regst"); if (!force && c && c.d && Date.now() - c.t < 10 * 60e3) return Promise.resolve(c.d);
    if (regBusy) return regBusy;
    var a = (peek("home") || {}).regGo || (peek("reg") || {}).regGo, url = a && /\/Registration\/Start/i.test(a.h) ? a.h : "/Student/Registration/Start";
    regBusy = getDoc(url).then(function (d) { var st = parseRegStart(d); cacheSet("regst", st); regBusy = null; return st; }, function (e) { regBusy = null; throw e; });
    return regBusy;
  }
  function regBtnHtml(reg) {
    var RT = regTarget(), st = RT.st;
    var chip = !st ? "" : st.open ? ' <span class="pp-chip">Open now</span>' : ' <span class="pp-chip mute">' + (st.done ? "Done" : "Closed") + "</span>";
    var sub = !st ? "Checking registration status…" : st.open ? "Registration is open — tap to start" : st.done ? "Registration completed" + (reg && reg.semester ? " · " + reg.semester : "") : "Registration is closed now";
    return '<a class="pp-regbtn' + (RT.open ? " open" : st ? " closed" : "") + '" href="' + classic(RT.h) + '"><span class="pp-qi">' + ic("flash") + '</span><span class="pp-t"><b>Go to Registration' + chip + "</b><small>" + esc(sub) + "</small></span>" + ic("back", "flip") + "</a>";
  }
  var P = {
    home: function (d) {
      var out = { days: [], teams: null };
      $$(".scheduleTable > .row", d).forEach(function (r) {
        var label = txt($(".col-md-2 label", r)); var items = [];
        $$(".col-md-10 .col-md-6", r).forEach(function (c) { var a = $("a", c); if (!a) return; var ls = $$("div label", c); var rg = parseRange(txt(ls[0]));
          var sc = splitCourse(txt(a)); items.push({ name: sc.name, sec: sc.sec, href: a.getAttribute("href"), room: txt(ls[1]), start: rg && rg.start, end: rg && rg.end, day: rg && rg.day }); });
        out.days.push({ label: label, items: items });
      });
      var al = $("#main-content .alert-success table", d);
      if (al) { var tds = $$("td", al).map(txt); out.teams = { user: tds[2] || "", pass: tds[5] || "" }; }
      out.regGo = findRegBtn(d);
      return out;
    },
    reg: function (d) {
      var out = { semester: "", semesters: [], courses: [], fees: [], credits: {} };
      if (!d.querySelector("#SemesterDropDown,#main-content table.table-details")) throw new Error("REGISTRATION_PAGE_UNAVAILABLE");
      var sel = $("#SemesterDropDown", d); if (sel) { out.semesters = $$("option", sel).map(function (o) { return { t: txt(o), u: o.value, on: o.selected }; }); var so = $$("option", sel).filter(function (o) { return o.selected; })[0]; out.semester = so ? txt(so) : ""; }
      $$("#main-content table.table-details tbody tr", d).forEach(function (tr) {
        var a = $("a", tr); if (!a) return; var sc = splitCourse(txt(a)); var slots = [];
        $$("span", tr.cells[0]).forEach(function (sp) { var t = txt(sp); var rg = parseRange(t); if (!rg) return; var ty = (/\((\w+)\)/.exec(t) || [])[1] || "Class"; var room = (/Room:\s*(\S+)/.exec(t) || [])[1] || ""; slots.push({ day: rg.day, start: rg.start, end: rg.end, type: ty, room: room }); });
        out.courses.push({ cid: sc.cid, name: sc.name, sec: sc.sec, href: a.getAttribute("href"), slots: slots, cr: txt(tr.cells[1]) });
      });
      $$("#divAssesment li", d).forEach(function (li) { var b = $(".badge", li); if (!b) return; var lab = txt(li).replace(txt(b), "").trim(); out.fees.push({ k: lab, v: num(txt(b)) }); });
      $$("#main-content table.table-bordered label", d).forEach(function (l, i, arr) { var t = txt(l); if (/:$/.test(t) && arr[i + 1]) out.credits[t.replace(":", "")] = txt(arr[i + 1]); });
      out.regGo = findRegBtn(d);
      return out;
    },
    curr: function (d) {
      var out = { info: {}, core: [], elective: [] }, sec = "core", sem = "";
      var gr = $(".grade-report", d); if (!gr) return out;
      var tables = $$("table", gr); if (tables[0]) $$("tr", tables[0]).forEach(function (tr) { var c = $$("td", tr).map(txt); if (c.length >= 3) out.info[c[0]] = c[2]; if (c.length >= 6) out.info[c[3]] = c[5]; });
      Array.prototype.forEach.call(gr.children, function (el) {
        if (el.tagName !== "TABLE") { var t = txt(el); if (/Elective Curriculum/i.test(t)) sec = "elective"; var m = /Semester:\s*(\d+)/i.exec(t); if (m) sem = m[1]; return; }
        if (el === tables[0]) return;
        $$("tr", el).slice(1).forEach(function (tr) { var c = $$("td", tr).map(txt); if (c.length < 3) return;
          var att = c[2], grades = []; att.replace(/\(([^)]+)\)\s*\[\s*([^\]]*?)\s*\]/g, function (m, s, g) { grades.push({ sem: s, g: g }); });
          var last = grades[grades.length - 1]; var st = "remaining";
          if (last) { if (last.g === "-" || last.g === "") st = "running"; else if (last.g === "F" || last.g === "W" || last.g === "UW" || last.g === "I") st = "retake"; else st = "done"; }
          out[sec].push({ code: c[0], name: c[1], sem: sem, status: st, grade: last ? last.g : "", when: last ? last.sem : "", tries: grades });
        });
      });
      return out;
    },
    sem: function (d) {
      var out = { sems: [] }, cur = null; var tb = $$("#main-content table", d)[1]; if (!tb) return out;
      $$("tr", tb).slice(1).forEach(function (tr) { var c = $$("td,th", tr).map(txt);
        if (c.length === 1 && /\*{3}/.test(c[0])) { cur = { name: c[0].replace(/\*+/g, "").trim(), courses: [], gpa: null, cgpa: null }; out.sems.push(cur); return; }
        if (!cur) return;
        if (c.length >= 12) cur.courses.push({ id: c[0], name: c[1], cr: num(c[2]), mid: c[3], fin: c[4], g: c[5], tgp: num(c[6]), sts: c[10] });
        else if (c.length >= 5) { cur.tgp = num(c[1]); cur.ecr = num(c[2]); cur.gpa = num(c[3]); cur.cgpa = num(c[4]); }
      });
      return out;
    },
    offered: function (d) {
      var out = { title: txt($("#main-content .panel-title", d)) || txt($("#main-content h5", d)), list: [] };
      var tb = $("#main-content table", d); if (!tb) throw new Error("OFFERINGS_PAGE_UNAVAILABLE");
      $$("tr", tb).forEach(function (tr) { if (tr.parentNode.closest && tr.parentNode.closest("table") !== tb) return; var cs = tr.children; if (cs.length < 6 || cs[0].tagName !== "TD") return;
        var sc = splitCourse(txt(cs[1])); var times = $$("tr", cs[5]).map(function (r) { var t = $$("td", r).map(txt); var rg = parseRange((t[1] || "").slice(0, 3) + " " + t[2] + " - " + t[3]); return rg ? { type: t[0], day: rg.day, start: rg.start, end: rg.end, room: t[4] } : null; }).filter(Boolean);
        function knownNumber(el){var t=txt(el).replace(/,/g,"");return /^\d+(?:\.\d+)?$/.test(t)?Number(t):null;}
        out.list.push({ id: txt(cs[0]), code:(/^[A-Z]{2,6}\d{3,6}$/i.test(txt(cs[0]))?txt(cs[0]):""), name: sc.name, sec: sc.sec, status: txt(cs[2]), cap: knownNumber(cs[3]), cnt: knownNumber(cs[4]), times: times });
      });
      return out;
    },
    acc: function (d) {
      var out = { rows: [] }; var tb = $("#main-content table", d); if (!tb) return out;
      $$("tr", tb).forEach(function (tr) { var c = $$("td", tr).map(txt); if (c.length >= 6 && /\d{4}/.test(c[0])) out.rows.push({ date: c[0], what: c[1], dr: num(c[2]), cr: num(c[3]), vat: num(c[4]), bal: num(c[5]) }); });
      return out;
    },
    profile: function (d) {
      var out = { name: txt($("#main-content legend", d)), f: {} };
      $$("#main-content table tr", d).forEach(function (tr) { var c = $$("td", tr).map(txt); if (c.length >= 2 && c[0]) out.f[c[0].replace(/\s*:\s*$/, "")] = c[1]; });
      return out;
    }
  };
  var D = {
    home: function (f) { if (!f && !mem.home && document.querySelector(".scheduleTable")) { mem.home = P.home(document); cacheSet("home", mem.home); return Promise.resolve(mem.home); } return load("home", "/Student/Home/Index/5", P.home, f); },
    reg: function (f) { return load("reg", L("Registration"), P.reg, f); },
    curr: function (f) { return load("curr", L("By Curriculum"), P.curr, f); },
    sem: function (f) { return load("sem", L("By Semester"), P.sem, f); },
    offered: function (f) { return load("offered", L("Offered Courses"), P.offered, f); },
    acc: function (f) { return load("acc", L("Financials"), P.acc, f); },
    profile: function (f) { return load("profile", "/Student/Home/Profile", P.profile, f); }
  };
  var PAL = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#06b6d4", "#8b5cf6", "#ef4444", "#84cc16", "#f97316", "#0ea5e9"];
  function weekly(reg) { var slots = []; reg.courses.forEach(function (c, i) { c.slots.forEach(function (s) { slots.push({ day: s.day, start: s.start, end: s.end, type: s.type, room: s.room, name: c.name, sec: c.sec, href: c.href, col: PAL[i % PAL.length] }); }); }); return slots; }
  function daySlots(slots, day) { return slots.filter(function (s) { return s.day === day; }).sort(function (a, b) { return a.start - b.start; }); }
  function todayKey() { return DAYS[new Date().getDay()]; }

  /* ------------------------------------------------------------ shell */
  var NAV = [
    { r: "home", t: "Home", i: "home", tab: "Home" },
    { r: "schedule", t: "Class Routine", i: "cal", tab: "Routine" },
    { r: "courses", t: "Courses", i: "book", tab: "Courses" },
    { r: "grades", t: "Grades & CGPA", i: "award" },
    { r: "planner", t: "Course planner", i: "spark" },
    { r: "finance", t: "Financials", i: "wallet" },
    { r: "notices", t: "Notices", i: "megaphone", tab: "Notices" },
    { r: "notifications", t: "Notifications", i: "bell" },
    { r: "mail", t: "Mail", i: "mail" },
    { r: "reviews", t: "Faculty review", i: "star" },
    { r: "more", t: "More", i: "grid", tab: "More" }
  ];
  var app, scroller, topH, topS, topR;
  function build() {
    collectLinks();
    var w = $$("nav.navbar .navbar-right a").map(txt).filter(function (t) { return /,/.test(t); })[0] || txt($('a[href="/Student/Home/Profile"]')) || "";
    NAME = w ? title(w.split(",").reverse().join(" ").trim()) : "Student"; FIRST = NAME.split(" ")[0];
    var initials = NAME.split(" ").filter(Boolean).slice(0, 2).map(function (x) { return x[0]; }).join("");
    app = document.createElement("div"); app.id = "pp-app";
    app.innerHTML =
      '<aside class="pp-side"><div class="pp-brand"><span class="pp-logo"><img src="/Content/Images/aiub_logo_92x92.png" alt="AIUB" decoding="async"></span><div><b>StudentDesk AIUB</b><small>Student workspace</small></div></div>' +
      '<nav class="pp-nav" aria-label="Workspace navigation">' + NAV.map(function (n, i) { return (i === 0 ? '<div class="pp-nav-label">WORKSPACE</div>' : n.r === "notices" ? '<div class="pp-sep"></div><div class="pp-nav-label">CAMPUS</div>' : "") + '<a href="#/' + n.r + '" data-r="' + n.r + '" aria-label="' + esc(n.t) + '" title="' + esc(n.t) + '">' + ic(n.i) + "<span>" + n.t + "</span></a>"; }).join("") +
      '</nav>' +
      '<div class="pp-me"><span class="pp-avatar">' + esc(initials) + '</span><div><b>' + esc(NAME) + '</b><small>' + esc((L("Change Password") ? "" : "") + (location.host)) + '</small></div><a class="pp-iconbtn pp-signout" data-act="logout" href="/Login/Logout" title="Log out" aria-label="Log out">' + ic("out") + "</a></div></aside>" +
      '<main class="pp-main"><header class="pp-top"><a class="pp-hlogo" href="#/home" aria-label="Home"><img src="/Content/Images/aiub_logo_92x92.png" alt="AIUB" decoding="async"></a><div class="pp-grow"><span class="pp-top-kicker">YOUR STUDENT WORKSPACE</span><h1 id="pp-h"></h1><div class="pp-sub" id="pp-s"></div></div><div class="pp-row" id="pp-tr"></div>' +
      '<div class="pp-appearance-tools" role="group" aria-label="Appearance and settings"><button type="button" class="pp-iconbtn pp-theme-toggle" data-act="theme" aria-label="Switch to dark mode" aria-pressed="false">' + ic("moon") + '</button><button type="button" class="pp-iconbtn pp-gear" data-act="settings" title="Settings" aria-label="Settings">' + ic("gear") + '</button></div>' +
      '<div class="pp-header-tools" role="group" aria-label="Page tools"><button type="button" class="pp-iconbtn pp-search-trigger" data-act="search" title="Search (Ctrl+K)" aria-label="Search portal">' + ic("search") + '<span>Search portal</span><kbd>Ctrl K</kbd></button><button type="button" class="pp-iconbtn pp-bell" data-act="noti" data-r="notifications" title="Notifications" aria-label="Notifications">' + ic("bell") + '</button><button type="button" class="pp-iconbtn" data-act="refresh" title="Refresh data" aria-label="Refresh data">' + ic("refresh") + '</button></div></header><div class="pp-scroll" id="pp-scroll" tabindex="-1" role="region" aria-label="Page content"></div></main>' +
      '<nav class="pp-tabbar"><span class="pp-pill"></span>' + NAV.filter(function (n) { return n.tab; }).map(function (n) { return '<a href="#/' + n.r + '" data-r="' + n.r + '">' + ic(n.i) + "<span>" + n.tab + "</span></a>"; }).join("") + "</nav>" +
      '<div class="pp-toast" id="pp-toast" role="status" aria-live="polite" aria-atomic="true"></div>';
    document.body.appendChild(app);
    root.classList.add("pp-on");
    var ff = /Firefox\//.test(navigator.userAgent), mob = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
    if (ff) root.classList.add("pp-ff"); if (mob) root.classList.add("pp-mob");
    try { if (!ff && (navigator.deviceMemory || 4) >= 8 && (navigator.hardwareConcurrency || 4) >= 8) root.classList.add("pp-hq"); } catch (e) {}
    $(".pp-me small", app).textContent = "Signed in · AIUB";
    scroller = $("#pp-scroll", app); topH = $("#pp-h", app); topS = $("#pp-s", app); topR = $("#pp-tr", app);
    app.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return; var a = b.getAttribute("data-act");
      if (a === "theme") { var dark = root.getAttribute("data-ap-mode") === "dark"; API.set("mode", dark ? "light" : "dark"); syncThemeIcon(); }
      if (a === "logout") { e.preventDefault(); requestLogout(b); }
      if (a === "search") openSearch();
      if (a === "settings") go("#/settings");
      if (a === "noti") go("#/notifications");
      if (a === "refresh") { mem = {}; pkMemo = {}; toast("Refreshing from portal… saved data kept as a fallback"); route(true); }
    });
    // The portal's own script swallows clicks on "#" links, so we handle navigation ourselves
    window.addEventListener("click", function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]"); if (!a || !app.contains(a)) return;
      var h = a.getAttribute("href"); if (!h || h.indexOf("#/") !== 0) return;
      e.preventDefault(); e.stopImmediatePropagation(); if (a.__pd && Date.now() - a.__pd < 1500) { a.__pd = 0; return; } if (a.__pre) try { a.__pre(); } catch (x) {} go(h);
    }, true);
    // low latency: tab bar / sidebar switch on finger-down instead of waiting for the click
    app.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return; var a = e.target.closest && e.target.closest(".pp-tabbar a[href^='#/'], .pp-nav a[href^='#/']"); if (!a) return;
      a.__pd = Date.now(); if (location.hash !== a.getAttribute("href")) go(a.getAttribute("href"));
    }, { passive: true });
    window.addEventListener("hashchange", checkNav);
    window.addEventListener("popstate", checkNav);
    setInterval(checkNav, 300);
    var rzW = innerWidth, rzT; window.addEventListener("resize", function () { clearTimeout(rzT); rzT = setTimeout(function () { if (innerWidth === rzW) return; rzW = innerWidth; movePill(); refreshQuickActions(); syncPaint(); }, 120); });
    [MQ_PHONE, MQ_TOUCH].forEach(function (mq) { if (mq.addEventListener) mq.addEventListener("change", refreshQuickActions); });
    if(window.StudentDeskPlannerView) {
      var planner = window.StudentDeskPlannerView({app:app,esc:esc,title:title,ic:ic,toast:toast,time:fmtT,account:NAME,curr:D.curr,profile:D.profile,reg:D.reg,registrationStatus:function(f){return regStatus(f).then(function(st){return Object.assign({},st,{checkedAt:(cacheRaw("regst")||{}).t,url:regTarget().h});});},registrationUrl:function(){return classic(regTarget().h);},offered:function(f){return D.offered(f).then(function(d){return Object.assign({},d,{snapshotAt:(cacheRaw("offered")||{}).t});});},setHead:setHead,refresh:function(){route(true);}});
      VIEWS.planner = planner.render; VIEWS.planner.after = planner.after;
    }
    syncThemeIcon();
    new MutationObserver(syncThemeIcon).observe(root, {attributes:true, attributeFilter:["data-ap-mode"]});
    if (!/^#\//.test(location.hash)) history.replaceState(null, "", "#/" + (API.get().startPage || "home"));
    route();
    gestures();
    wireTop(); warmOnIntent(); paintBadges(); workspaceStart();
    setTimeout(prefetch, 1800);
    setInterval(function () { if (!document.hidden) bg(function () { return notiLoad(true); }).catch(function () {}); }, 5 * 60e3);
    setInterval(function () { if (!document.hidden && current === "home") wxPaint(true); }, 10 * 60e3);
    document.addEventListener("visibilitychange", function () { if (!document.hidden && current === "home") wxPaint(); });
    setInterval(function () { var t = $(".pp-tick", app); if (t) tick(); }, 30000);
  }
  function syncThemeIcon() {
    var dark = root.getAttribute("data-ap-mode") === "dark";
    $$('[data-act="theme"]', app).forEach(function (b) {
      b.innerHTML = ic(dark ? "sun" : "moon");
      b.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      b.setAttribute("title", (dark ? "Switch to light mode" : "Switch to dark mode") + " (Alt+D)");
      b.setAttribute("aria-pressed", dark ? "true" : "false");
    });
  }
  function requestLogout(trigger) {
    var old = $("#pp-logout-dialog", app); if (old) { if (old.open) return; old.remove(); }
    var d = document.createElement("dialog"); d.id = "pp-logout-dialog"; d.className = "pp-logout-dialog";
    d.setAttribute("aria-labelledby", "pp-logout-title"); d.setAttribute("aria-describedby", "pp-logout-description");
    d.innerHTML = '<span class="pp-logout-mark">' + ic("out") + '</span><span class="pp-eyebrow">YOUR ACCOUNT</span><h2 id="pp-logout-title">Ready to sign out?</h2><p id="pp-logout-description">You’ll be signed out of the AIUB portal. Cached portal data will be cleared from this browser.</p><div class="pp-logout-actions"><button type="button" class="pp-btn" data-logout-cancel>Stay signed in</button><button type="button" class="pp-btn pp-logout-confirm" data-logout-confirm>Log out ' + ic("out") + '</button></div>';
    app.appendChild(d);
    function close() { d.close(); d.remove(); if (trigger && trigger.isConnected) trigger.focus(); }
    $("[data-logout-cancel]", d).onclick = close;
    d.addEventListener("cancel", function(e) { e.preventDefault(); close(); });
    $("[data-logout-confirm]", d).onclick = function() {
      clearCache(); try { localStorage.removeItem(MF_KEY); mf = null; } catch(e) {}
      try { sessionStorage.clear(); } catch(e) {}
      location.assign("/Login/Logout");
    };
    if (d.showModal) d.showModal(); else { d.setAttribute("open", ""); d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); }
    $("[data-logout-cancel]", d).focus();
  }
  function toast(m) { var t = $("#pp-toast", app); t.textContent = m; t.classList.add("on"); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove("on"); }, 2200); }
  function movePill() {
    var bar = $(".pp-tabbar", app); if (!bar) return; var on = $("a.on", bar), pill = $(".pp-pill", bar);
    if (!on) { pill.style.width = "0"; return; }
    var left = on.offsetLeft, width = on.offsetWidth;  // read layout once, then update the compositor-friendly transform
    pill.style.transform = "translate3d(" + left + "px,0,0)"; pill.style.width = width + "px";
  }
  function setHead(h, s, right) { topH.textContent = h; topS.innerHTML = s || ""; topR.innerHTML = right || ""; }
  function skeleton(n) { var h = ""; for (var i = 0; i < (n || 3); i++) h += '<div class="pp-sk" style="height:' + (i ? 90 : 150) + 'px;margin-bottom:14px"></div>'; return '<div class="pp-view">' + h + "</div>"; }
  function failView(err) {
    var net = networkError(err), message = net ? (navigator.onLine === false ? "You are offline. Reconnect and try again." : "The request could not finish. Check your connection and try again.") : err && err.message || "Unknown error";
    if (err && err.message === "SESSION") return '<div class="pp-view"><div class="pp-card pp-empty"><span class="pp-em">🔒</span><h3 style="justify-content:center">Session expired</h3><p>Please sign in again.</p><a class="pp-btn pri" href="/">Log in again</a></div></div>';
    return '<div class="pp-view"><div class="pp-card pp-empty"><span class="pp-em">😕</span><h3 style="justify-content:center">Couldn’t load</h3><p>' + esc(message) + '</p><button class="pp-btn pri" data-act="refresh">Try again</button> <a class="pp-btn" href="#/classic?u=' + encodeURIComponent(location.pathname + location.search) + '">Classic view</a></div></div>';
  }
  var current = "", renderId = 0;
  // Show final numbers immediately: no per-frame text/layout work during navigation.
  /* ---------- background prefetch (one request at a time, so the portal server is never stressed) ---------- */
  function prefetch() {
    var jobs = [function () { return D.home && D.home(); }, function () { return D.reg && D.reg(); }, function () { return D.curr && D.curr(); }, function () { return D.sem && D.sem(); }, function () { return D.acc && D.acc(); }, function () { return noticePage(1); }, function () { return notiLoad(); }, function () { return mailIds(); }, function () { return examLoad(); }, function () { return regStatus(); }, function () { return rvCfg() ? rvList() : null; }, function () { return D.profile && D.profile(); }];
    if (!MQ_PHONE.matches && !(navigator.connection && navigator.connection.saveData)) jobs.push(function () { return D.offered && D.offered(); });
    var i = 0; (function next() { if (i >= jobs.length) return; var j = jobs[i++]; whenIdle(function () { bg(j).then(next, next); }, i === 1 ? 1200 : 350, i === 1 ? 5000 : 1800); })();
  }
  var MQ_PHONE = window.matchMedia ? matchMedia("(max-width: 900px)") : { matches: false };
  var MQ_TOUCH = window.matchMedia ? matchMedia("(hover: none) and (pointer: coarse)") : { matches: false };
  function scTop(v) { if (!scroller) return 0; if (v == null) return scroller.scrollTop; scroller.scrollTop = v; }   // phone + PC: the app scrolls inside .pp-scroll (fixed tab bar never moves)
  var lastHash = null;
  function go(h) { if (location.hash === h) { route(); return; } location.hash = h; checkNav(); }
  function checkNav() { if (location.hash !== lastHash) route(); }
  var softT;
  function softRefresh() { clearTimeout(softT); softT = setTimeout(function () { whenIdle(function () { var st = scTop(); route(true, true); setTimeout(function () { scTop(st); }, 30); }); }, 400); }
  /* never do background work while the finger is on the screen / the page is moving */
  var lastInput = 0;
  function whenIdle(fn, quiet, cap) { var t0 = Date.now(); quiet = quiet || 1200; cap = cap || 6000; (function wait() { if (document.hidden || (Date.now() - lastInput < quiet && Date.now() - t0 < cap)) return setTimeout(wait, 250); var ric = window.requestIdleCallback; if (ric) ric(fn, { timeout: 1500 }); else setTimeout(fn, 60); })(); }
  ["touchstart", "pointerdown", "wheel", "keydown"].forEach(function (ev) { window.addEventListener(ev, function () { lastInput = Date.now(); }, { capture: true, passive: true }); });
  function swap(html, after) {
    // Animate only the new view in CSS, not a snapshot of the entire browser page.
    // Synchronous replacement also prevents an older queued transition winning a fast tab switch.
    rvCapture($("#pp-rvbody",app));
    scroller.innerHTML = html;
    $$("button:not([type])",scroller).forEach(function(b){b.type="button";});
    if (after) after();
    var view=$(".pp-view",scroller),reduced=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(view&&!view.classList.contains("pp-quiet")&&!API.get().performance&&API.get().anim!==false&&API.get().trans!==false&&!reduced&&view.animate) {
      if(swap.motion)swap.motion.cancel();
      swap.motion=view.animate([{opacity:.92},{opacity:1}],{duration:MQ_PHONE.matches||MQ_TOUCH.matches?110:160,easing:"ease-out"});
    }
  }
  function route(force, silent) {
    lastHash = location.hash;
    var h = location.hash.replace(/^#\//, ""), q = ""; var qi = h.indexOf("?"); if (qi >= 0) { q = h.slice(qi + 1); h = h.slice(0, qi); }
    var r = h || "home"; if (!VIEWS[r]) r = "home";
    $$(".pp-nav a, .pp-tabbar a", app).forEach(function (a) { var ar = a.getAttribute("data-r"); a.classList.toggle("on", ar === r || (r !== "home" && !NAV.some(function (n) { return n.tab && n.r === r; }) && ar === "more" && a.closest(".pp-tabbar"))); if(a.classList.contains("on"))a.setAttribute("aria-current",ar===r?"page":"location");else a.removeAttribute("aria-current"); });
    movePill();
    var params = {}; q.split("&").forEach(function (kv) { if (!kv) return; var p = kv.split("="); params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); });
    var id = ++renderId, prevR = current; current = r;
    if (r !== prevR) { RECENT = {}; clearTimeout(route.seenT); app.classList.remove("pp-cgon"); }
    var shown = false, skT = silent ? null : setTimeout(function () { if (id === renderId && !shown) scroller.innerHTML = r === "notices" ? '<div class="pp-view pp-notices" aria-busy="true"><div class="pp-bulletin-head"><span class="pp-eyebrow">CAMPUS BULLETIN</span><h2>Stay in the loop.</h2><p role="status">Loading university notices…</p></div><div class="pp-card">' + skeleton(3) + '</div></div>' : skeleton(); }, 90);  // skeleton only if slow
    if (!force && r !== prevR) scTop(0);
    Promise.resolve().then(function () { return VIEWS[r](params, !!force && !silent); }).then(function (html) { shown = true; clearTimeout(skT); if (id !== renderId) return; swap(silent ? html.replace('class="pp-view"', 'class="pp-view pp-quiet"') : html, function () { scroller.setAttribute("data-r", r); if (VIEWS[r].after) VIEWS[r].after(params); workspacePaint(); topCheck(); requestAnimationFrame(function () { setTimeout(paintBadges, 0); }); scheduleSeen(r); }); })
      .catch(function (e) { shown = true; clearTimeout(skT); if (id !== renderId) return; scroller.innerHTML = failView(e); if (window.console) console.warn("[StudentDesk]", e); });
  }
  function greet() { var h = new Date().getHours(); return h >= 5 && h < 12 ? "Good morning" : h >= 12 && h < 17 ? "Good afternoon" : h >= 17 && h < 20 ? "Good evening" : "Good night"; }
  function greetEmoji() { var h = new Date().getHours(); return h >= 5 && h < 12 ? "☀️" : h >= 12 && h < 14 ? "🌞" : h >= 14 && h < 17 ? "🌤️" : h >= 17 && h < 20 ? "🌆" : "🌙"; }
  function classic(u) { return "#/classic?u=" + encodeURIComponent(u); }

  /* ------------------------------------------------------------ views */
  var VIEWS = {};
  var tickData = null;
  function nextInfo(slots) {
    var d = todayKey(), n = nowMin(), today = daySlots(slots, d);
    var live = today.filter(function (s) { return s.start <= n && n < s.end; })[0];
    var next = today.filter(function (s) { return s.start > n; })[0];
    if (!next && !live) { for (var k = 1; k <= 7; k++) { var dk = DAYS[(new Date().getDay() + k) % 7]; var ds = daySlots(slots, dk); if (ds.length) { next = ds[0]; next._in = k; break; } } }
    return { live: live, next: next };
  }
  function tick() {
    if (!tickData) return; var el = $(".pp-tick", app); if (!el) return; var info = nextInfo(tickData), n = nowMin();
    var cd = $(".pp-cd", el), lab = $(".pp-nl", el);
    if (!peek("home") && !peek("reg")) { lab.textContent = "Waiting for your schedule"; cd.textContent = ""; return; }
    if (info.live) { lab.innerHTML = '<span>Now · <b>' + esc(title(info.live.name)) + "</b> · Room " + esc(info.live.room) + "</span>"; cd.textContent = dur(info.live.end - n) + " left"; }
    else if (info.next && !info.next._in) { lab.innerHTML = '<span>Next · <b>' + esc(title(info.next.name)) + "</b> · Room " + esc(info.next.room) + " · " + fmtT(info.next.start) + "</span>"; cd.textContent = "in " + dur(info.next.start - n); }
    else if (info.next) { lab.innerHTML = '<span>No more classes today. Next: <b>' + esc(title(info.next.name)) + "</b> · " + DAYFULL[info.next.day] + " " + fmtT(info.next.start) + "</span>"; cd.textContent = ""; }
    else { lab.innerHTML = "<span>No classes found</span>"; cd.textContent = ""; }
  }

  function homeSlots(home) {
    var seen = {}, out = [];
    (home && home.days || []).forEach(function (d) { d.items.forEach(function (it) { if (!it.day || it.start == null) return; var k = it.day + it.start + it.name; if (seen[k]) return; seen[k] = 1;
      out.push({ day: it.day, start: it.start, end: it.end, type: "", room: it.room, name: it.name, sec: it.sec, href: it.href, col: PAL[hue(it.name) % PAL.length] }); }); });
    return out;
  }
  VIEWS.home = function (p, f) {
    setHead("Home", new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
    return D.home(f).catch(function (e) { if (e && e.message === "SESSION") throw e; requestWarnings.home = "Home could not refresh. Check your connection or use the original portal."; return null; }).then(function (home) {
      var reg = peek("reg");
      if (!reg && !f) bg(function () { return D.reg(); }).then(function () { if (current === "home") softRefresh(); }, function () {});
      var slots = reg ? weekly(reg) : homeSlots(home); tickData = slots;
      var today = daySlots(slots, todayKey()), n = nowMin();
      var todayHtml = !home && !reg ? '<div class="pp-empty">Schedule unavailable. Your classes are not confirmed by this view.</div>' : today.length ? '<div class="pp-list">' + today.map(function (s) { var live = s.start <= n && n < s.end, past = n >= s.end;
          return '<a class="pp-item' + (past ? " pp-past" : "") + '" href="' + classic(s.href) + '"><span class="pp-dot" style="background:' + s.col + '"></span><div class="pp-t"><b>' + esc(title(s.name)) + '</b><small>' + (s.type ? esc(s.type) + " · " : "") + "Room " + esc(s.room) + '</small></div><div class="pp-r"><b>' + fmtShort(s.start) + "–" + fmtShort(s.end) + "</b><br>" + (live ? '<span class="pp-chip bad">Live</span>' : past ? "Done" : "in " + dur(s.start - n)) + "</div></a>"; }).join("") + "</div>"
        : '<div class="pp-empty"><span class="pp-em">🌿</span>No classes today</div>';
      var up = home && home.days ? home.days.slice(1, 4).map(function (d) { return '<div class="pp-item"><div class="pp-t"><b>' + esc(d.label) + "</b><small>" + (d.items.length ? d.items.map(function (i) { return esc(title(i.name)); }).join(" · ") : "No classes") + '</small></div><span class="pp-chip ' + (d.items.length ? "" : "ok") + '">' + d.items.length + "</span></div>"; }).join("") : "";
      var sub = (!home && !reg ? "Schedule unavailable · refresh when connected" : "") || (reg && reg.semester ? esc(reg.semester) + " · " : "") + (today.length ? today.length + (today.length > 1 ? " classes" : " class") + " today" : "Free day");
      return '<div class="pp-view pp-home">' +
        '<div class="pp-grid pp-g-21 pp-overview-grid"><section class="pp-card pp-hero pp-overview"><div class="pp-overview-intro"><div><span class="pp-eyebrow">STUDENTDESK · YOUR DAY</span><h2>' + esc(greet()) + ", " + esc(FIRST) + '</h2><p>' + sub + '</p></div><div class="pp-date-tile' + ((home || reg) && !today.length ? ' pp-day-off' : '') + '" aria-label="' + ((home || reg) && !today.length ? 'No classes today' : 'Today') + '"><small>' + new Date().toLocaleDateString("en-GB", { month: "short" }) + '</small><b>' + new Date().getDate() + '</b></div></div>' +
          '<div class="pp-overview-body"><div class="pp-next pp-tick">' + ic("clock") + '<div class="pp-nl"></div><div class="pp-cd"></div></div>' +
          '<div class="pp-home-links">' + regBtnHtml(reg) + rvHeroBtn() + "</div></div></section>" +
          '<section class="pp-card pp-quick-card"><span class="pp-eyebrow">AT YOUR FINGERTIPS</span><h3>Quick actions</h3><p class="pp-section-caption">A little less searching. A little more doing.</p><div class="pp-quick">' + quickActionsHtml() + "</div></section></div>" +
        (examUpcoming().length ? '<div class="pp-card pp-examcard"><h3>' + ic("cal") + ' Exam routine is out<a class="pp-more" href="#/schedule?view=exams">All exams →</a></h3><div class="pp-list">' + examRows(examUpcoming(), 3) + "</div></div>" : "") +
        '<a class="sd-planner-banner" href="#/planner"><span class="sd-banner-mark">' + ic("spark") + '</span><div><span class="pp-eyebrow">NEW IN STUDENTDESK 4.5</span><b>Your next semester starts with a plan.</b><small>Prerequisites, course priorities and a timetable that fits.</small></div><span class="sd-banner-cta">Open planner ↗</span></a>' +
        '<div class="pp-card pp-wxcard"><h3>Campus weather<span class="pp-more" style="color:var(--ap-muted)">AIUB · Kuratoli, Dhaka</span></h3><div id="pp-wx">' + (peek("wx") ? wxCard(peek("wx")) : '<div class="pp-sk" style="height:120px"></div>') + "</div></div>" +
        '<div class="pp-grid pp-g2"><div class="pp-card"><h3>Today · ' + DAYFULL[todayKey()] + '<a class="pp-more" href="#/schedule">Routine →</a></h3>' + todayHtml + "</div>" +
          '<div class="pp-card"><h3>Coming up<a class="pp-more" href="#/schedule">Week →</a></h3><div class="pp-list">' + (up || '<div class="pp-empty">—</div>') + "</div></div></div>" +
        '<div class="pp-card"><h3>Latest notices<a class="pp-more" href="#/notices">All notices →</a></h3><div class="pp-list" id="pp-hnot">' + noticeRows((peek("notices1") || { items: [] }).items.slice(0, 4)) + "</div></div>" +
        "</div>";
    });
  };
  VIEWS.home.after = function () { tick(); wxPaint(); updBar(); whenIdle(function () { updGet().then(function () { paintBadges(); updBar(); }, function () {}); }, 1500, 8000);
    whenIdle(function () { regStatus().then(function () { var b = $(".pp-regbtn", app); if (b && current === "home") b.outerHTML = regBtnHtml(peek("reg")); }, function () {}); }, 600, 3000);
    if (rvCfg() && Date.now() - rvAt > 60e3) whenIdle(function () { rvList().then(function () { var c = $(".pp-rvhome", app); if (c && current === "home") { c.outerHTML = rvHeroBtn(); rvPics(); } }, function () {}); }, 600, 3000);
    wireQuickActions();
    var box = $("#pp-hnot", app); if (!box) return;
    if (!box.children.length) box.innerHTML = '<div class="pp-sk" style="height:56px"></div><div class="pp-sk" style="height:56px"></div>';
    noticePage(1).then(function (d) { var b = $("#pp-hnot", app); if (b) b.innerHTML = noticeRows(d.items.slice(0, 4)) || '<div class="pp-empty">No notices</div>'; paintBadges(); }, function () { var b = $("#pp-hnot", app); if (b && !b.querySelector(".pp-item")) b.innerHTML = '<a class="pp-item" href="#/notices"><span class="pp-qi">' + ic("bell") + '</span><div class="pp-t"><b>View university notices</b><small>Latest university updates in your campus bulletin</small></div>' + ic("ext") + '</a>'; });
  };

  /* ---------- update tracker: red dots with counts (stored on this device only) ---------- */
  var NEWDOT = '<i class="pp-newdot" title="New"></i>';
  function flatSem(d) { var o = []; (d.sems || []).forEach(function (s) { s.courses.forEach(function (c) { if (c.g && c.g !== "-") o.push(s.name + "|" + c.id + "|" + c.g); }); }); return o; }
  var TRK = {
    notices: { key: "notices1", r: "notices", sig: function (d) { return (d.items || []).map(function (i) { return i.u; }); } },
    noti: { key: "noti", r: "notifications", sig: function (d) { return (d.list || []).map(notiSig); } },
    mail: { key: "mail0", r: "mail", sig: function (d) { return Array.isArray(d) ? d : []; } },
    grades: { key: "sem", r: "grades", sig: flatSem },
    courses: { key: "curr", r: "courses", sig: function (d) { return (d.core || []).concat(d.elective || []).filter(function (c) { return c.status !== "remaining"; }).map(function (c) { return c.code + "|" + c.status + "|" + c.grade; }); } },
    routine: { key: "reg", r: "schedule", sig: function (d) { return (d.courses || []).map(function (c) { return c.name + "|" + c.sec + "|" + c.slots.map(function (s) { return s.day + s.start + s.room; }).join(","); }); } },
    exams: { key: "exams", r: "schedule", sig: function (d) { return (d.list || []).map(examSig); } },
    finance: { key: "acc", r: "finance", sig: function (d) { return (d.rows || []).map(function (x) { return x.date + "|" + x.what + "|" + x.dr + "|" + x.cr; }); } }
  };
  var TRK_BY_KEY = {}, TRK_BY_R = {}; Object.keys(TRK).forEach(function (t) { TRK_BY_KEY[TRK[t].key] = t; (TRK_BY_R[TRK[t].r] = TRK_BY_R[TRK[t].r] || []).push(t); });
  var RECENT = {}, seenMemo = {};
  function seenSet(t) { if (seenMemo[t]) return seenMemo[t]; var a = null; try { a = JSON.parse(STORE.getItem("pp.seen." + t)); } catch (e) {} if (!a) return null; var o = {}; a.forEach(function (x) { o[x] = 1; }); return (seenMemo[t] = o); }
  function saveSeen(t, list) { var old = seenSet(t) || {}, keep = Object.keys(old).filter(function (x) { return list.indexOf(x) < 0; }).slice(-300); try { STORE.setItem("pp.seen." + t, JSON.stringify(keep.concat(list))); } catch (e) {} delete seenMemo[t]; }
  function sigsOf(t) { var d = peek(TRK[t].key); if (!d) return null; try { return TRK[t].sig(d); } catch (e) { return null; } }
  function freshOf(t) { var sg = sigsOf(t); if (!sg) return []; var s = seenSet(t); if (!s) { saveSeen(t, sg); return []; } return sg.filter(function (x) { return !s[x]; }); }   // first run = baseline, no flood of dots
  function isNewSig(t, sig) { if (RECENT[t] && RECENT[t][sig]) return true; var s = seenSet(t); return !!s && !s[sig]; }
  function newRoutineNames() { var o = {}; var d = peek("reg"); if (!d) return o; (d.courses || []).forEach(function (c) { var sg = TRK.routine.sig({ courses: [c] })[0]; if (isNewSig("routine", sg)) o[c.name] = 1; }); return o; }
  function scheduleSeen(r) { var ts = TRK_BY_R[r]; if (!ts) return; clearTimeout(route.seenT); route.seenT = setTimeout(function () { if (current !== r) return; var any = false; ts.forEach(function (t) { var f = freshOf(t); if (!f.length) return; any = true; RECENT[t] = RECENT[t] || {}; f.forEach(function (x) { RECENT[t][x] = 1; }); saveSeen(t, sigsOf(t) || []); }); if (any) paintBadges(); }, 1500); }
  var paintT; function schedPaint() { clearTimeout(paintT); paintT = setTimeout(paintBadges, 120); }
  function setBadge(el, n) { var b = el.querySelector(".pp-nbadge"); if (!n) { if (b) b.remove(); return; } if (!b) { b = document.createElement("i"); b.className = "pp-nbadge"; el.appendChild(b); } b.textContent = n > 9 ? "9+" : n; }
  function paintBadges() {
    if (!app) return; var cnt = {}, more = 0, tabs = {}; NAV.forEach(function (n) { if (n.tab) tabs[n.r] = 1; });
    Object.keys(TRK).forEach(function (t) { var n = freshOf(t).length; cnt[TRK[t].r] = (cnt[TRK[t].r] || 0) + n; if (!tabs[TRK[t].r]) more += n; });
    $$(".pp-nav a[data-r], .pp-tabbar a[data-r], .pp-quick a[data-r], .pp-bell", app).forEach(function (a) { var r = a.getAttribute("data-r"); setBadge(a, (r === "more" ? updN() : 0) + (r === "more" && a.closest(".pp-tabbar") ? more : cnt[r] || 0)); });
    try { var tot = Object.keys(cnt).reduce(function (a, k) { return a + cnt[k]; }, 0); document.title = (tot ? "(" + tot + ") " : "") + "StudentDesk AIUB"; } catch (e) {}
  }

  /* ---------- portal notifications (portal's own JSON, same as the bell on the classic page) ---------- */
  function notiSig(n) { return n.ID ? String(n.ID) : (n.Title || "") + "|" + (n.Message || "").slice(0, 160) + "|" + (n.WebUrl || ""); }
  function ago(t) { if (!t) return ""; var m = Math.max(0, (Date.now() - t) / 60e3); return m < 60 ? Math.round(m) + " min ago" : m < 1440 ? Math.floor(m / 60) + " h ago" : m < 2880 ? "Yesterday" : m < 43200 ? Math.floor(m / 1440) + " days ago" : new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  function notiLoad(force) {
    var c = cacheRaw("noti"); if (!force && mem.noti) return Promise.resolve(mem.noti);
    if (!force && c && c.d && Date.now() - c.t < 5 * 60e3) { mem.noti = c.d; return Promise.resolve(c.d); }
    var get = function (u) { return fetch(u, { credentials: "include", headers: { Accept: "application/json" } }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }); };
    var pr = get("/Common/Notification/GetAllNotifications").catch(function () { return get("/Common/Notification/GetNotifications?register=false"); }).then(function (j) {
      if (!j || j.HasError) throw new Error("Couldn’t load notifications");
      var list = (Array.isArray(j) ? j : j.Data || []).map(function (n) { var pt = /\/Date\((\d+)/.exec(n.PostedDate || ""); return { ID: n.ID || 0, Title: n.Title || "", Message: String(n.Message || ""), WebUrl: n.WebUrl || "", Duration: n.Duration || "", t: pt ? +pt[1] : 0 }; });
      var d = { list: list }; cacheSet("noti", d); mem.noti = d; return d;
    });
    return pr.catch(function(error) { if(c&&c.d)return c.d;var snapshot=window.StudentDeskPublicSnapshot&&window.StudentDeskPublicSnapshot.faculty;if(snapshot&&snapshot.list&&snapshot.list.length){cacheSet("faculty",snapshot);return snapshot;}throw error; });
  }
  var jsonReads={};
  function portalJSON(path) {
    var u;try{u=new URL(path,location.href);if(u.origin!==location.origin)throw new Error("Invalid portal request");}catch(e){return Promise.reject(e);}
    if(jsonReads[u.href])return jsonReads[u.href];
    var promise=retryRead(function(){return new Promise(function(resolve,reject){
      var xhr=new XMLHttpRequest();xhr.open("GET",u.href,true);xhr.timeout=12000;xhr.withCredentials=true;
      xhr.setRequestHeader("Accept","application/json");xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
      xhr.onload=function(){var body=String(xhr.responseText||"").replace(/^\uFEFF/,"");
        if(xhr.status===401 || /\/Login(?:[/?]|$)/i.test(xhr.responseURL||"") || /<form[^>]+id=["']loginForm/i.test(body))return reject(new Error("SESSION"));
        if(xhr.status<200||xhr.status>=300)return reject(new Error("HTTP "+xhr.status));
        try{var data=JSON.parse(body);if(typeof data==="string")data=JSON.parse(data);resolve(data);}catch(e){reject(new Error(/<html|<!doctype/i.test(body)?"The portal returned a web page instead of mailbox data. Open the original mailbox or sign in again.":"The portal mailbox returned an unreadable response."));}
      };
      xhr.onerror=function(){reject(new TypeError("Portal mailbox network error"));};xhr.ontimeout=function(){reject(new Error("Mailbox timeout"));};xhr.send();
    });});jsonReads[u.href]=promise;promise.then(done,done);function done(){delete jsonReads[u.href];}return promise;
  }
  function mailArray(data){if(Array.isArray(data))return data;var keys=["Messages","messages","Items","items","Data","data"];for(var i=0;i<keys.length;i++)if(data&&Array.isArray(data[keys[i]]))return data[keys[i]];throw new Error("Mailbox response format was not recognized. Open the original mailbox.");}
  function mailIds() { return portalJSON("/Message/Email/GetMessageList?boxID=0&pageNo=0&pageSize=100").then(mailArray).then(function(d){cacheSet("mail0",d.map(function(m){return String(m.ID);}));return d;}); }
  function plain(h) { var d = new DOMParser().parseFromString("<div>" + h + "</div>", "text/html"); return (d.body.textContent || "").replace(/\s+/g, " ").trim(); }
  var notiShow = 30;
  VIEWS.notifications = function (p, f) {
    setHead("Notifications", "From your AIUB portal account");
    return notiLoad(f).then(function (d) {
      var rows = d.list.slice(0, notiShow).map(function (n, i) { var msg = n.WebUrl === "message", t = plain(n.Message);
        return '<div class="pp-item pp-click pp-noti" data-ni="' + i + '"><span class="pp-qi">' + ic(msg ? "mail" : /note/i.test(n.Title) ? "file" : "bell") + '</span><div class="pp-t"><b>' + esc(msg ? n.Title || "Message" : t) + (isNewSig("noti", notiSig(n)) ? NEWDOT : "") + "</b><small>" + (n.Title && !msg ? esc(n.Title) + " · " : "") + esc(n.t ? ago(n.t) : n.Duration) + "</small></div>" + ic(msg ? "plus" : "back", "flip") + '</div><div class="pp-nmsg" id="pp-nm' + i + '" hidden></div>'; }).join("");
      return '<div class="pp-view pp-notis"><div class="pp-card"><div class="pp-list">' + (rows || '<div class="pp-empty"><span class="pp-em">🔔</span>No notifications right now</div>') + "</div>" +
        '<div style="text-align:center;margin-top:14px">' + (d.list.length > notiShow ? '<button class="pp-btn" id="pp-nomore">Show more (' + (d.list.length - notiShow) + ')</button> ' : "") + '<a class="pp-btn" href="' + classic("/Student/Notification") + '">' + ic("layers") + " See all on portal</a></div></div></div>";
    });
  };
  VIEWS.notifications.after = function () {
    var d = mem.noti || peek("noti"); if (!d) return;
    var mo = $("#pp-nomore", app); if (mo) mo.onclick = function () { notiShow += 40; var st = scTop(); route(false, true); setTimeout(function () { scTop(st); }, 30); };
    if (freshOf("noti").length) fetch("/Common/Notification/SeeNotifications", { credentials: "include" }).catch(function () {});   // same as opening the bell on the portal
    $$("[data-ni]", app).forEach(function (el) { el.onclick = function () { var n = d.list[+el.getAttribute("data-ni")]; if (!n) return;
      if (n.WebUrl === "message") { var box = $("#pp-nm" + el.getAttribute("data-ni"), app); if (box.hidden) box.innerHTML = '<div class="pp-nbody">' + cleanHtml(n.Message) + "</div>"; box.hidden = !box.hidden; return; }
      var u = n.WebUrl || ""; if (/^https?:\/\//i.test(u)) { if (u.indexOf(location.origin) === 0) go(classic(u.slice(location.origin.length) || "/Student")); else window.open(u, "_blank", "noopener"); }
      else if (u.charAt(0) === "/") go(classic(u)); }; });
  };

  /* ---------- AIUB campus weather (Open-Meteo, free, no key; AIUB Kuratoli, Khilkhet) ---------- */
  var WX_URL = "https://api.open-meteo.com/v1/forecast?latitude=23.8223&longitude=90.4273&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_hours=8&forecast_days=1&timezone=Asia%2FDhaka";
  function wxInfo(c, day) {
    var M = { 0: ["Clear sky", day ? "☀️" : "🌙"], 1: ["Mostly clear", day ? "🌤️" : "🌙"], 2: ["Partly cloudy", "⛅"], 3: ["Cloudy", "☁️"], 45: ["Fog", "🌫️"], 48: ["Fog", "🌫️"], 51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy drizzle", "🌧️"], 61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"], 66: ["Freezing rain", "🌧️"], 67: ["Freezing rain", "🌧️"], 80: ["Rain showers", "🌦️"], 81: ["Rain showers", "🌧️"], 82: ["Heavy showers", "⛈️"], 95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm, hail", "⛈️"], 99: ["Thunderstorm, hail", "⛈️"] };
    return M[c] || ["—", "🌡️"];
  }
  function wxLoad(force) {
    var c = cacheRaw("wx"); if (!force && c && c.d && Date.now() - c.t < 10 * 60e3) return Promise.resolve(c.d);
    var pr = fetch(WX_URL, { credentials: "omit" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).catch(function () { return xget(WX_URL).then(JSON.parse); })
      .then(function (j) { if (!j || !j.current) throw new Error("No weather"); cacheSet("wx", j); return j; });
    return pr.catch(function(error) { if(c&&c.d)return c.d;var snapshot=window.StudentDeskPublicSnapshot&&window.StudentDeskPublicSnapshot.faculty;if(snapshot&&snapshot.list&&snapshot.list.length){cacheSet("faculty",snapshot);return snapshot;}throw error; });
  }
  function wxSymbol(c,day){return ic(c>=95?"flash":c>=2?"cloud":day?"sun":"moon");}
  function wxCard(j) {
    if (!j || !j.current) return '<div class="pp-wx-empty">Weather unavailable right now</div>';
    var cu = j.current, w = wxInfo(cu.weather_code, cu.is_day), dl = j.daily || {}, hr = j.hourly || {}, t = function (s) { return s ? fmtT((+s.slice(11, 13)) * 60 + (+s.slice(14, 16))) : ""; };
    var rain = (dl.precipitation_probability_max || [])[0], hot = cu.apparent_temperature >= 38, wet = cu.precipitation > 0 || /rain|drizzle|shower|thunder/i.test(w[0]);
    var tip = wet ? "Take an umbrella" : rain >= 60 ? "Rain likely later today" : hot ? "Very hot — carry water" : cu.is_day ? "Good weather on campus" : "Calm night";
    var hrs = (hr.time || []).slice(1, 7).map(function (tm, i) { var k = i + 1, ww = wxInfo(hr.weather_code[k], hr.is_day ? hr.is_day[k] : 1); return '<div><small>' + ((+tm.slice(11, 13)) % 12 || 12) + (+tm.slice(11, 13) < 12 ? " am" : " pm") + "</small><span>" + wxSymbol(hr.weather_code[k],hr.is_day?hr.is_day[k]:1) + "</span><b>" + Math.round(hr.temperature_2m[k]) + "°</b>" + (hr.precipitation_probability[k] >= 20 ? "<i>" + hr.precipitation_probability[k] + "%</i>" : "<i></i>") + "</div>"; }).join("");
    return '<div class="pp-wx-main"><span class="pp-wx-ic">' + wxSymbol(cu.weather_code,cu.is_day) + '</span><div><div class="pp-wx-t">' + Math.round(cu.temperature_2m) + '°<small>C</small></div><div class="pp-wx-c">' + esc(w[0]) + " · feels " + Math.round(cu.apparent_temperature) + "°</div></div>" +
      '<div class="pp-wx-meta"><span>' + ic("drop") +  cu.relative_humidity_2m + "%</span><span>" + ic("wind") +  Math.round(cu.wind_speed_10m) + " km/h</span>" + (rain != null ? "<span>" + ic("cloud") + rain + "% today</span>" : "") + (dl.temperature_2m_max ? "<span>↑" + Math.round(dl.temperature_2m_max[0]) + "° ↓" + Math.round(dl.temperature_2m_min[0]) + "°</span>" : "") + (dl.sunset ? "<span>" + ic("sun") + t(dl.sunset[0]) + "</span>" : "") + "</div></div>" +
      '<div class="pp-wx-hrs">' + hrs + '</div><div class="pp-wx-tip">' + tip + '<small>Updated ' + t(cu.time) + " · Open-Meteo</small></div>";
  }
  function wxPaint(force) { wxLoad(force).then(function (j) { var b = $("#pp-wx", app); if (b) b.innerHTML = wxCard(j); }, function () { var b = $("#pp-wx", app); if (b && !b.querySelector(".pp-wx-main")) b.innerHTML = '<div class="pp-wx-empty">Weather unavailable right now</div>'; }); }

  /* ---------- Exam routine (portal publishes it before every term exam) ---------- */
  var EXAM_PAGE = "/Student/ExamRoutineSchedule";
  function pickK(o, re) { for (var k in o) if (re.test(k) && o[k] != null && o[k] !== "" && typeof o[k] !== "object") return o[k]; return ""; }
  function examNorm(o, term) {
    var d = pickK(o, /^(exam)?date|date$/i), m = /\/Date\((\d+)/.exec(String(d)), dt = m ? new Date(+m[1]) : d ? new Date(String(d).replace(/-/g, " ")) : null;
    return { course: String(pickK(o, /course.*(name|title)|subject|^title$|coursename/i) || pickK(o, /course/i)), sec: String(pickK(o, /section/i) || ""), date: dt && !isNaN(dt) ? dt.getTime() : 0, dtxt: m ? "" : String(d || ""),
      time: String(pickK(o, /time|slot|start/i) || ""), room: String(pickK(o, /room|venue|hall/i) || ""), term: term || String(pickK(o, /term/i) || "") };
  }
  function parseExamTable(d) {
    var out = []; $$("#main-content table", d).forEach(function (tb) {
      var hd = $$("thead th, tr:first-child th", tb).map(function (th) { return txt(th).toLowerCase(); }); if (!hd.length) return;
      $$("tbody tr", tb).forEach(function (tr) { var c = $$("td", tr).map(txt); if (c.length < 2) return; var o = {}; hd.forEach(function (h, i) { o[h.replace(/[^a-z]/g, "") || "c" + i] = c[i] || ""; }); out.push(examNorm(o)); });
    }); return out;
  }
  function examLoad(force) {
    var c = cacheRaw("exams"); if (!force && c && c.d && Date.now() - c.t < 3 * 3600e3) return Promise.resolve(c.d);
    var J = function (u) { return fetch(u, { credentials: "include", headers: { Accept: "application/json" } }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }); };
    var pr = getDoc(EXAM_PAGE).then(function (doc) {
      var html = doc.documentElement.innerHTML;
      if (/no exam routine available/i.test(txt($("#main-content", doc) || doc.body)) && !/ExamRoutineScheduleController/.test(html)) return { list: [], none: true };
      var tbl = parseExamTable(doc); if (tbl.length) return { list: tbl };
      if (!/ExamRoutineScheduleController/.test(html)) return { list: [], none: true };
      return Promise.all([J("/Student/ExamRoutineSchedule/GetStudentSemesters"), J("/Student/ExamRoutineSchedule/GetTerms")]).then(function (r) {
        var sems = Array.isArray(r[0]) ? r[0] : r[0].Data || [], terms = Array.isArray(r[1]) ? r[1] : r[1].Data || [];
        var cur = sems.filter(function (s) { return s.IsCurrent; })[0] || sems[sems.length - 1]; if (!cur) return { list: [] };
        var list = [], i = 0;
        return terms.reduce(function (p, tm) { return p.then(function () { return J("/Student/ExamRoutineSchedule/GetExamRoutinesBySemesterIdTermId?semesterId=" + cur.ID + "&termId=" + tm.ID).then(function (x) { (Array.isArray(x) ? x : x.Data || []).forEach(function (o) { list.push(examNorm(o, tm.Name || tm.Title || tm.TermName || "")); }); }, function () {}); }); }, Promise.resolve()).then(function () { return { list: list }; });
      });
    }).then(function (d) { d.list.sort(function (a, b) { return a.date - b.date; }); cacheSet("exams", d); return d; });
    return pr.catch(function(error) { if(c&&c.d)return c.d;var snapshot=window.StudentDeskPublicSnapshot&&window.StudentDeskPublicSnapshot.faculty;if(snapshot&&snapshot.list&&snapshot.list.length){cacheSet("faculty",snapshot);return snapshot;}throw error; });
  }
  function examSig(e) { return e.term + "|" + e.course + "|" + e.date + "|" + e.time + "|" + e.room; }
  function examRows(list, limit) {
    var now = Date.now() - 864e5;
    return list.filter(function (e) { return !e.date || e.date >= now; }).slice(0, limit || 99).map(function (e) { var dd = e.date ? new Date(e.date) : null, days = dd ? Math.ceil((dd - new Date().setHours(0, 0, 0, 0)) / 864e5) : null;
      return '<div class="pp-item pp-exam"><span class="pp-ndate"><b>' + (dd ? dd.getDate() : "?") + "</b>" + (dd ? dd.toLocaleDateString("en-GB", { month: "short" }) : esc(e.dtxt.slice(0, 6))) + '</span><div class="pp-t"><b>' + esc(title(e.course || "Exam")) + (isNewSig("exams", examSig(e)) ? NEWDOT : "") + "</b><small>" + [e.term, dd ? dd.toLocaleDateString("en-GB", { weekday: "short" }) : "", e.time, e.room ? "Room " + e.room : ""].filter(Boolean).map(esc).join(" · ") + '</small></div><span class="pp-chip ' + (days != null && days <= 2 ? "bad" : days != null && days <= 7 ? "warn" : "") + '">' + (days == null ? "" : days <= 0 ? "Today" : days === 1 ? "Tomorrow" : days + " days") + "</span></div>"; }).join("");
  }
  function examUpcoming() { var d = peek("exams"); if (!d || !d.list) return []; var now = Date.now() - 864e5; return d.list.filter(function (e) { return !e.date || e.date >= now; }); }
  function examView() {
    var d = peek("exams"), up = examUpcoming();
    return '<div class="pp-card"><h3>' + ic("file") + ' Exam routine<a class="pp-more" href="' + classic(EXAM_PAGE) + '">Portal →</a></h3>' +
      (up.length ? '<div class="pp-list">' + examRows(up) + "</div>" : '<div class="pp-empty"><span class="pp-em">📝</span>' + (d ? "No exam routine published yet. It appears here automatically as soon as AIUB posts it." : "Checking the portal…") + "</div>") + "</div>";
  }

  /* ---------- Faculty list (public list from www.aiub.edu) ---------- */
  var facState = { q: "", fac: "", show: 40 };
  var POS_RANK = [/advisor/i, /^professor/i, /director/i, /head/i, /senior associate/i, /^associate/i, /senior assistant/i, /^assistant/i, /senior lecturer/i, /lecturer/i];
  function facRank(p) { for (var i = 0; i < POS_RANK.length; i++) if (POS_RANK[i].test(p)) return i; return 99; }
  function facLoad(force) {
    var c = cacheRaw("faculty"); if (!force && c && c.d && Date.now() - c.t < 3 * 864e5) return Promise.resolve(c.d);
    var pr = xget(SITE + "/Files/Uploads/public-employee-profiles/employeeProfiles.json?v=1.0.11").then(function (t) {
      var j = JSON.parse(t.replace(/^\uFEFF/, "")), L0 = j.EmployeeProfileLightList || j || [];
      if(!Array.isArray(L0))throw new Error("Faculty directory format changed");
      var list = L0.map(function (e) { var cv = e.CvPersonal || {}, po = e.PersonalOtherInfo || {}; return [title(String(cv.Name || "").toLowerCase()), cv.Email || "", e.Faculty || "", (e.HrDepartment || "").replace(/^DEPARTMENT OF /i, ""), e.Position || "", e.Designation && !/^faculty$/i.test(e.Designation) ? e.Designation : "", [po.RoomNo, po.BuildingNo].filter(Boolean).join(", "), po.SecondProfilePhoto || po.ProfilePhoto || cv.ProfilePhoto || e.ProfilePhoto || "", [po.AcademicInterests, po.ResearchInterests].filter(Boolean).join(", ")]; })
        .filter(function (x) { return x[0]; }).sort(function (a, b) { return facRank(a[4]) - facRank(b[4]) || a[0].localeCompare(b[0]); });
      var d = { list: list }; cacheSet("faculty", d); return d;
    });
    return pr.catch(function(error) { if(c&&c.d)return c.d;var snapshot=window.StudentDeskPublicSnapshot&&window.StudentDeskPublicSnapshot.faculty;if(snapshot&&snapshot.list&&snapshot.list.length){cacheSet("faculty",snapshot);return snapshot;}throw error; });
  }
  function facShort(f) { return title(f.replace(/^FACULTY OF /i, "").toLowerCase()).replace(/ And /g, " & "); }
  VIEWS.faculty = function (p, f) {
    setHead("Faculty", "AIUB faculty list · from aiub.edu", '<a class="pp-btn sm" target="_blank" rel="noopener" href="' + SITE + '/faculty-list/faculties">' + ic("ext") + " aiub.edu</a>");
    return facLoad(f).then(function (d) {
      var facs = []; d.list.forEach(function (x) { if (x[2] && facs.indexOf(x[2]) < 0) facs.push(x[2]); });
      return '<div class="pp-view pp-facv"><div class="pp-search" style="margin-bottom:12px">' + ic("search") + '<input class="pp-input" id="pp-fq" placeholder="Search name, department, room or interest" value="' + esc(facState.q) + '" autocomplete="off"></div>' +
        '<div class="pp-tabs pp-fchips"><button data-fac="" class="' + (!facState.fac ? "on" : "") + '">All <span class="pp-n">' + d.list.length + "</span></button>" + facs.map(function (x) { return '<button data-fac="' + esc(x) + '" class="' + (facState.fac === x ? "on" : "") + '">' + esc(facShort(x)) + "</button>"; }).join("") + "</div>" +
        '<div id="pp-flist"></div></div>';
    });
  };
  VIEWS.faculty.after = function () {
    var d = peek("faculty"); if (!d) return; var box = $("#pp-flist", app), inp = $("#pp-fq", app), tm;
    function draw() {
      var q = facState.q.trim().toLowerCase(), qs = q.split(/\s+/).filter(Boolean);
      var list = d.list.filter(function (x) { if (facState.fac && x[2] !== facState.fac) return false; if (!qs.length) return true; var hay = (x[0] + " " + x[1] + " " + x[3] + " " + x[4] + " " + x[5] + " " + x[6] + " " + x[8]).toLowerCase(); return qs.every(function (w) { return hay.indexOf(w) >= 0; }); });
      box.innerHTML = '<div class="pp-fgrid">' + list.slice(0, facState.show).map(function (x) {
        var prof = x[1] ? SITE + "/faculty-list/faculty-profile?q=" + encodeURIComponent(x[1].split("@")[0]) + "#" + encodeURIComponent(x[1]) : SITE + "/faculty-list/faculties";
        return '<div class="pp-fac"><img loading="lazy" decoding="async" width="56" height="56" alt="" src="' + (x[7] ? esc(SITE + x[7]) : "") + '" onerror="this.style.visibility=\'hidden\'"><div class="pp-t"><b>' + esc(x[0]) + "</b><small>" + esc(title(x[4].toLowerCase())) + (x[5] ? " · " + esc(x[5]) : "") + "</small><small>" + esc(title(x[3].toLowerCase())) + (x[6] ? " · 📍 " + esc(x[6]) : "") + '</small><div class="pp-row">' + (x[1] ? '<a class="pp-btn sm" href="mailto:' + esc(x[1]) + '">' + ic("mail") + " Email</a>" : "") + '<a class="pp-btn sm" target="_blank" rel="noopener" href="' + esc(prof) + '">Profile</a></div></div></div>'; }).join("") + "</div>" +
        (list.length > facState.show ? '<div style="text-align:center;margin-top:14px"><button class="pp-btn" id="pp-fmore">Show more (' + (list.length - facState.show) + ")</button></div>" : "") + (list.length ? "" : '<div class="pp-card pp-empty">No faculty found</div>');
      var mb = $("#pp-fmore", app); if (mb) mb.onclick = function () { facState.show += 40; draw(); };
    }
    inp.oninput = function () { clearTimeout(tm); tm = setTimeout(function () { facState.q = inp.value; facState.show = 40; draw(); }, 140); };
    $$("[data-fac]", app).forEach(function (b) { b.onclick = function () { facState.fac = b.getAttribute("data-fac"); facState.show = 40; $$("[data-fac]", app).forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); }; });
    draw();
  };

  /* ---------- Faculty review (anonymous, shared between all StudentDesk users) ----------
     Your faculty list is read from YOUR portal (semester course list -> section page -> course teacher).
     Only the review itself (faculty, course, semester, stars, comment) + a one-way scrambled code is sent
     to the review server. Your name / ID are never sent. */
  var RV_DEF = { url: "https://ebucqisfylvpstuqxroh.supabase.co", key: "sb_publishable_bdOcsLO9OSeyYhFNQiSUrw_nn2m0NGi" };   // built-in review server (Supabase project URL + anon public key)
  var RV_CFG_KEY = "aiubPlus.review.v1", RV_MINE = "aiubPlus.review.mine", RV_REP = "aiubPlus.review.reported";
  function rvCfg() {
    try { var o = JSON.parse(localStorage.getItem(RV_CFG_KEY) || "null"); if (o && /^https:\/\//.test(o.url) && o.key) return o; } catch (e) {}
    return /^https:\/\//.test(RV_DEF.url) && RV_DEF.key.length > 20 ? RV_DEF : null;
  }
  function jget(k, d) { try { return JSON.parse(localStorage.getItem(k) || "null") || d; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function rvReq(path, method, body) {
    var c = rvCfg(); if (!c) return Promise.reject(new Error("NOSERVER"));
    var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    return fetch(c.url.replace(/\/+$/, "") + "/rest/v1/" + path, { method: method || "GET", credentials: "omit", cache: "no-store", signal: ctl ? ctl.signal : undefined,
      headers: rvHeaders(c), body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { clearTimeout(to); return r.text().then(function (t) { var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {} if (!r.ok) throw new Error((j && (j.message || j.hint)) || "Server error " + r.status); return j; }); },
        function (e) { clearTimeout(to); throw new Error(e && e.name === "AbortError" ? "Review server is not responding" : "Couldn’t reach the review server"); });
  }
  function rvHeaders(c) { var h = { apikey: c.key, "Content-Type": "application/json", Accept: "application/json" }; if (!/^sb_/.test(c.key)) h.Authorization = "Bearer " + c.key; return h; }
  var RV_COLS = "id,fac_email,fac_name,course,semester,stars,comment,created_at,updated_at";
  var rvAll = null, rvAt = 0, rvBusy = null;
  function rvList(force) {
    if (!rvAll) { var c = cacheRaw("rv"); if (c && c.d) { rvAll = c.d; rvAt = c.t; } }
    if (!force && rvAll && Date.now() - rvAt < 15e3) return Promise.resolve(rvAll);
    if (rvBusy) return rvBusy;
    rvBusy = rvReq("reviews_public?select=" + RV_COLS + "&order=updated_at.desc&limit=1000").then(function (j) {
      rvBusy = null; rvAll = Array.isArray(j) ? j : []; rvAt = Date.now(); try { STORE.setItem("pp.c.rv", JSON.stringify({ t: rvAt, d: rvAll })); } catch (e) {} return rvAll;
    }, function (e) { rvBusy = null; if (rvAll) return rvAll; throw e; });
    return rvBusy;
  }
  function sha256(s) {
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error("This browser can’t create the anonymous code"));
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); });
  }
  function myId() {
    return D.profile().catch(function () { return null; }).then(function (p) {
      var id = p && p.f && (p.f["Student ID"] || p.f["Student Id"]); if (id && /\d{2}-\d{5}-\d/.test(id)) return /\d{2}-\d{5}-\d/.exec(id)[0];
      var h = peek("home"), u = h && h.teams && h.teams.user; var m = /\d{2}-\d{5}-\d/.exec(u || "") || /\d{2}-\d{5}-\d/.exec(document.body ? (document.querySelector("nav") || {}).textContent || "" : "");
      if (m) return m[0]; throw new Error("Couldn’t read your student ID from the portal");
    });
  }
  function rvKey(x) { return x.e + "|" + norm(x.course) + "|" + x.sem; }
  function ridFor(x, key) { return myId().then(function (id) { return sha256("aiubplus|review|v1|" + id + "|" + (key || rvKey(x))); }); }

  /* --- your faculty, semester by semester (from the portal) --- */
  var MF_KEY = "pp.mf";
  var mf = null, mfBusy = null, mfProg = "";
  function mfGet() { if (!mf) mf = jget(MF_KEY, null); return mf; }
  function parseCourseList(d) {
    var out = [];
    $$(".StudentCourseList .panel", d).forEach(function (p) {
      var body = $(".panel-body", p); if (!body) return;
      var t = ""; Array.prototype.some.call(body.childNodes, function (n) { if (n.nodeType === 3 && n.textContent.trim()) { t = n.textContent.trim(); return true; } });
      if (!t) t = (txt(body).split(/Section Status/i)[0] || "").trim();
      var m = /^(\d{3,6})\s*-\s*(.*?)\s*\[([^\]]+)\]\s*$/.exec(t.replace(/\s+/g, " ")); var name = m ? m[2] : t.replace(/\s*\[[^\]]*\]\s*$/, ""), sec = m ? m[3] : ((/\[([^\]]+)\]/.exec(t) || [])[1] || "");
      var a = $("a[href*='/Student/Section']", p); var href = a ? a.getAttribute("href").split("#")[0] : "";
      var res = (/Result\s*:\s*([^\n]+)/i.exec(txt(body)) || [])[1] || "";
      // Dropped / withdrawn only when the Section Status or Result says so. (A "Drop" / "Withdraw" button on a
      // running course during the drop or withdraw period must not hide the course.)
      var bt = txt(body), stl = (/Section\s*Status\s*:?\s*([A-Za-z][A-Za-z ]{0,24})/i.exec(bt) || [])[1];
      var drop = stl != null ? (/drop|withdr|cancel/i.test(stl) && !/valid/i.test(stl)) : /\b(dropped|withdrawn)\b/i.test(bt);
      if (/^\s*U?W\b/.test(res)) drop = true;
      if (name && href && !drop) out.push({ name: name, sec: sec, href: href, res: res.trim() });
    });
    return out;
  }
  function parseSection(d) {
    var seen = {}, list = [];
    $$("label", d).forEach(function (l) {
      var e = txt(l).trim(); if (!/^[\w.\-]+@aiub\.edu$/i.test(e)) return;
      e = e.toLowerCase(); if (seen[e]) return; seen[e] = 1;
      var box = l.parentNode, nameL = $$("label", box).filter(function (x) { var t = txt(x).trim(); return t && !/@|faculty\s*\[|room/i.test(t); })[0];
      var row = box.closest(".row") || box.parentNode, img = $("img[src*='GetUserImage']", row);
      list.push({ n: title(txt(nameL)), e: e, img: img ? img.getAttribute("src") : "" });
    });
    if (!list.length) $$("select option", d).forEach(function (o) { if (/GetEsf|Employee/i.test(o.value) && txt(o)) list.push({ n: title(txt(o)), e: "name:" + norm(txt(o)).toLowerCase(), img: "" }); });
    return list;
  }
  function mfTell() { var el = app && $("#pp-mfprog", app); if (el) el.textContent = mfProg; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function mfLoad(force, prog) {
    var old = mfGet();
    if (!force && old && old.v === 2 && Date.now() - old.t < 12 * 3600e3) return Promise.resolve(old);
    if (mfBusy) return mfBusy;
    var secCache = {}, oldSem = {}; (old && old.sems || []).forEach(function (s) { oldSem[s.t] = s; s.courses.forEach(function (c) { if (c.t && c.t.length) secCache[c.href] = c.t; }); });
    mfBusy = D.reg().then(function (reg) {
      var sems = (reg.semesters || []).map(function (s) { var q = (/[?&]q=([^&#]+)/.exec(s.u || "") || [])[1]; return q ? { t: s.t, q: q } : null; }).filter(Boolean).reverse();
      if (!sems.length) throw new Error("Couldn’t find your semesters");
      var out = { v: 2, t: Date.now(), sems: [] }, i = 0, cur = reg.semester, fails = [];
      function retry() {   // section pages that failed (portal busy) get one more try, a bit slower
        if (!fails.length) return out; var f = fails.shift();
        return wait(700).then(function () { return getDoc(f.c.href); }).then(function (sd) { var t = parseSection(sd); if (t.length) { f.c.t = t; f.s.done = f.s.courses.every(function (c) { return c.t && c.t.length; }); } }, function (e) { if (e && e.message === "SESSION") throw e; })
          .then(function () { if (prog) prog(mfProg, out); return retry(); });
      }
      function step() {
        if (i >= sems.length) return retry();
        var s = sems[i++]; mfProg = "Semester " + i + " of " + sems.length + " · " + s.t; mfTell(); if (prog) prog(mfProg, out);
        var past = old && old.sems.filter(function (x) { return x.t === s.t && x.done; })[0];
        if (past && s.t !== cur) { out.sems.push(past); return step(); }
        return getDoc("/Student/Home/CourseList?q=" + s.q).then(function (d) {
          var cs = parseCourseList(d); if (!cs.length) { if (oldSem[s.t]) out.sems.push(oldSem[s.t]); return step(); }  // keep what we had
          var sem = { t: s.t, courses: cs, done: true }; out.sems.push(sem);
          var j = 0;
          return (function nextC() {
            if (j >= cs.length) return step();
            var c = cs[j++]; if (secCache[c.href]) { c.t = secCache[c.href]; return nextC(); }
            return wait(120).then(function () { return getDoc(c.href); }).then(function (sd) { c.t = parseSection(sd); if (!c.t.length) { sem.done = false; fails.push({ c: c, s: sem }); } }, function (e) { if (e && e.message === "SESSION") throw e; c.t = []; sem.done = false; fails.push({ c: c, s: sem }); })
              .then(function () { if (prog) prog(mfProg, out); return nextC(); });
          })();
        }, function (e) { if (e && e.message === "SESSION") throw e; if (oldSem[s.t]) out.sems.push(oldSem[s.t]); return step(); });
      }
      return step();
    }).then(function (out) {
      out.sems.forEach(function (s) { s.courses.forEach(function (c) { c.t = (c.t || []).filter(function (x) { return x.n; }); }); });
      mf = out; mfBusy = null; jset(MF_KEY, out); return out;
    }, function (e) { mfBusy = null; if (old) return old; throw e; });
    return mfBusy;
  }
  /* faculty photo + extra info from aiub.edu public faculty list (by email) */
  var facIdx = null;
  if((!peek("faculty")||!Array.isArray(peek("faculty").list))&&window.StudentDeskPublicSnapshot&&window.StudentDeskPublicSnapshot.faculty){mem.faculty=window.StudentDeskPublicSnapshot.faculty;}
  function facBy(e) {
    if (!facIdx) { var d = peek("faculty"); if (!d || !Array.isArray(d.list)) return null; facIdx = {}; d.list.forEach(function (x) { if (x[1]) facIdx[String(x[1]).trim().toLowerCase()] = x; }); }
    return facIdx[String(e || "").trim().toLowerCase()] || null;
  }
  function facultyPhotoUrl(value) {try { if(!value)return "";var u=new URL(String(value).replace(/\\/g,"/"),SITE);return u.protocol==="https:" && (u.origin===SITE || u.origin==="https://portal.aiub.edu") ? u.href : ""; } catch(e){return "";} }
  function facPic(e, portalImg, name, cls) {
    var x = facBy(e), packed=window.StudentDeskPublicSnapshot&&window.StudentDeskPublicSnapshot.faculty;var fallback=packed&&packed.list.filter(function(p){return String(p[1]||"").toLowerCase()===String(e||"").toLowerCase();})[0];var src = fallback&&/^data:image\/webp;base64,/.test(fallback[9]||"")?fallback[9]:facultyPhotoUrl(x && x[7]) || facultyPhotoUrl(portalImg);
    var ini = String(name || "?").split(" ").filter(function (w) { return /^[A-Z]/i.test(w) && !/^(dr|md|mr|ms|mrs)\.?$/i.test(w); }).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
    picWire(); var alt = facultyPhotoUrl(portalImg) || facultyPhotoUrl((x||fallback||[])[7]); if(alt===src)alt="";
    if (src && picDead[src] && Date.now() - picDead[src] < 6e5) src = alt;
    return '<span class="pp-rvpic ' + (cls || "") + '" data-i="' + esc(ini) + '" data-e="' + esc(e) + '"' + (alt ? ' data-alt="' + esc(alt) + '"' : "") + ">" + (src ? '<img loading="lazy" decoding="async" alt="" referrerpolicy="no-referrer" src="' + esc(src) + '" data-src="' + esc(src) + '">' : "") + "</span>";
  }
  function starsHtml(n, big) { var s = ""; for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= Math.round(n) ? "on" : "") + '">★</i>'; return '<span class="pp-stars' + (big ? " big" : "") + '">' + s + "</span>"; }
  function agoIso(s) { var t = Date.parse(s); return !t ? "" : Date.now() - t < 60e3 ? "just now" : ago(t); }
  /* Faculty photos come from www.aiub.edu, which is sometimes slow or busy. A failed photo is retried
     3 times (1.5 s, 4 s, 9 s), then the portal photo or the initials are shown and it is tried again later
     (next refresh, when the connection comes back, or after 10 minutes). The faculty list is retried too. */
  var picDead = {};
  function picFail(im) {
    var el = im.parentNode, base = im.getAttribute("data-src") || im.getAttribute("src") || "", n = +(im.getAttribute("data-try") || 0);
    if (!el || !base) return;
    if (/^data:/.test(base)) n=3; // A data URI must never receive a cache-busting query.
    if (n < 3) { im.setAttribute("data-try", n + 1); setTimeout(function () { if (im.isConnected && im.getAttribute("data-src") === base) im.src = base + (base.indexOf("?") < 0 ? "?" : "&") + "r=" + Date.now().toString(36); }, [1500, 4000, 9000][n]); return; }
    picDead[base] = Date.now();
    var alt = el.getAttribute("data-alt");
    if (alt && alt !== base && !picDead[alt]) { im.setAttribute("data-src", alt); im.setAttribute("data-try", "0"); im.src = alt; return; }
    im.remove();
  }
  function picWire() {
    if (picWire.on || !app) return; picWire.on = 1;
    app.addEventListener("error", function (e) { var t = e.target; if (t && t.tagName === "IMG" && t.parentNode && t.parentNode.classList && t.parentNode.classList.contains("pp-rvpic")) picFail(t); }, true);
    window.addEventListener("online", function () { picDead = {}; rvPics(); });
  }
  function facEnsure() {
    if (peek("faculty")) return Promise.resolve(peek("faculty"));
    if (facEnsure.p) return facEnsure.p;
    var n = facEnsure.n = (facEnsure.n || 0) + 1;
    facEnsure.p = facLoad().then(function (d) { facEnsure.p = null; facEnsure.n = 0; facIdx = null; return d; }, function (e) {
      facEnsure.p = null; if (n < 4) setTimeout(function () { if (current === "reviews" || current === "home") facEnsure().then(rvPics, function () {}); }, [4e3, 12e3, 30e3][n - 1]); throw e; });
    return facEnsure.p;
  }
  function rvPics() {
    if (!app) return; picWire();
    if (!peek("faculty")) { facEnsure().then(function () { rvPics(); }, function () {}); return; }
    facIdx = null;
    $$(".pp-rvpic[data-e]", app).forEach(function (el) {
      var x = facBy(el.getAttribute("data-e")); if (!x || !x[7]) return; var packed=window.StudentDeskPublicSnapshot&&window.StudentDeskPublicSnapshot.faculty;var cached=packed&&packed.list.filter(function(p){return String(p[1]||"").toLowerCase()===String(el.getAttribute("data-e")||"").toLowerCase();})[0];var src=cached&&/^data:image\/webp;base64,/.test(cached[9]||"")?cached[9]:facultyPhotoUrl(x[7]), im = $("img", el); if(!src)return;
      if (picDead[src] && Date.now() - picDead[src] < 6e5) return;
      if (im && im.getAttribute("data-src") === src && !im.getAttribute("data-try") && im.complete && !im.naturalWidth) { picFail(im); return; }  // failed before we were listening
      if (im && (im.getAttribute("data-src") === src || im.getAttribute("data-try"))) return;
      if (!im) { im = document.createElement("img"); im.alt = ""; im.decoding = "async"; el.appendChild(im); }
      delete picDead[src]; im.removeAttribute("data-try"); im.setAttribute("data-src", src); im.src = src;
    });
  }

  var rvState = { tab: "give", q: "", sort: "faculty", show: 30, open: {}, fopen: {} };
  VIEWS.reviews = function (p) {
    if (p.tab) rvState.tab = p.tab;
    if (rvState.sort !== "faculty" && rvState.sort !== "top") rvState.sort = "faculty";
    setHead("Reviews", "Faculty review · anonymous", '<button class="pp-btn sm" data-rv="reload">' + ic("refresh") + " Refresh</button>");
    if (!peek("faculty")) facEnsure().then(function () { if (current === "reviews") rvPics(); }, function () {});
    var srv = rvCfg();
    return '<div class="pp-view pp-rv">' +
      (srv ? "" : '<div class="pp-card pp-rvwarn">⚠️ <b>Review server not connected.</b> Reviews can’t be shared yet. If you are the developer, add the server in <a href="#/settings">Settings → Faculty review server</a>.</div>') +
      '<div class="pp-tabs" id="pp-rvtabs"><button data-rt="give" class="' + (rvState.tab === "give" ? "on" : "") + '">' + ic("file") + ' Give review</button><button data-rt="all" class="' + (rvState.tab === "all" ? "on" : "") + '">' + ic("star") + ' All reviews <span class="pp-n" id="pp-rvn">' + (rvAll ? rvAll.length : "") + "</span></button></div>" +
      '<div id="pp-rvbody"></div></div>';
  };
  var rvPoll = 0;
  var rvDirty = false, rvDrafts = Object.create(null), rvPending = Object.create(null);
  function rvCapture(box) {
    if (!box || box.dataset.reviewTab !== "give") return;
    $$(".pp-rvc", box).forEach(function(card) {
      var key=card.getAttribute("data-k"), ta=$("textarea",card), form=$(".pp-rvform",card);
      if(!ta || !form || rvPending[key] || card.dataset.suppressCapture || !form.classList.contains("open"))return;
      var saved=myMap()[key]||{}, rating=+(card.getAttribute("data-sel")||saved.s||0);
      if(ta.value!==(saved.c||"") || rating!==+(saved.s||0) || rvDrafts[key])rvDrafts[key]={s:rating,c:ta.value,open:true};
    });
  }
  function rvRestore(box) {
    $$(".pp-rvc",box).forEach(function(card) {
      var key=card.getAttribute("data-k"), d=rvDrafts[key];
      if(d){card.setAttribute("data-sel",d.s);$("textarea",card).value=d.c;$(".pp-rvform",card).classList.add("open");var mine=$(".pp-rvmine",card);if(mine)mine.style.display="none";
        $$("[data-s]",card).forEach(function(b){b.classList.toggle("on",+b.dataset.s<=d.s);b.setAttribute("aria-checked",String(+b.dataset.s===d.s));});
        $(".pp-slab",card).textContent=["Tap to rate","Poor","Fair","Good","Very good","Excellent"][d.s]||"Tap to rate";
        $(".pp-rvlen",card).textContent=d.c.length+" / 500";
      }
      if(rvPending[key]){card.setAttribute("aria-busy","true");$$("button,textarea",card).forEach(function(b){b.disabled=true;});}
    });
  }
  function rvPaint(force) { if (current !== "reviews") return; var b = $("#pp-rvbody", app); if (!b) return;
    rvCapture(b);
    if (rvState.tab === "give" && b.dataset.reviewTab === "give" && rvDirty && $(".pp-rvc",b) && force !== true) return;
    var active=document.activeElement, focusKey=active&&active.closest&&active.closest(".pp-rvc"), restoreFocus=focusKey&&active.tagName==="TEXTAREA"?{key:focusKey.dataset.k,start:active.selectionStart,end:active.selectionEnd}:null;
    rvDirty = false; b.dataset.reviewTab=rvState.tab;
    if (rvState.tab === "give") {giveDraw(b);rvRestore(b);} else allDraw(b);
    if(restoreFocus&&rvState.tab==="give")$$(".pp-rvc",b).some(function(c){if(c.dataset.k!==restoreFocus.key)return false;var ta=$("textarea",c);if(ta&&!ta.disabled){ta.focus({preventScroll:true});ta.setSelectionRange(restoreFocus.start,restoreFocus.end);}return true;});
    var n = $("#pp-rvn", app); if (n && rvAll) n.textContent = rvAll.length;
  }
  VIEWS.reviews.after = function () {
    $$("[data-rt]", app).forEach(function (b) { b.onclick = function () { rvState.tab = b.getAttribute("data-rt"); $$("[data-rt]", app).forEach(function (x) { x.classList.toggle("on", x === b); }); rvPaint(true); }; });
    var rl = $('[data-rv="reload"]', app); if (rl) rl.onclick = function () { rl.disabled = true; Promise.all([rvList(true).catch(function () {}), rvState.tab === "give" ? mfLoad(true, givePaintSoon).catch(function () {}) : null]).then(function () { rl.disabled = false; rvPaint(true); toast("Updated ✓"); }); };
    rvPaint();
    rvList().then(rvPaint, function (e) { if (rvState.tab === "all") rvPaint(); });
    clearInterval(rvPoll);
    rvPoll = setInterval(function () { if (current !== "reviews") { clearInterval(rvPoll); return; } if (document.hidden || !rvCfg()) return;
      whenIdle(function () { if (current !== "reviews") return; var n0 = rvAll ? rvAll.length + "|" + (rvAll[0] || {}).updated_at : ""; rvList(true).then(function (l) { var n1 = l.length + "|" + (l[0] || {}).updated_at; if (n1 !== n0) { if (rvState.tab === "all") { if (!(document.activeElement && document.activeElement.id === "pp-rvq")) listDraw(); } var nn = $("#pp-rvn", app); if (nn) nn.textContent = l.length; } }, function () {}); }, 800, 4000); }, 20000);
  };
  /* part 1: give review
     Your own reviews are remembered on this device (the server never links a review to you). They are stored
     per student and matched again even if a course or faculty name is written a little differently later. */
  function myAll() {
    var o = jget(RV_MINE, null) || {};
    if (o.m && !o.by) { var b = {}; b[o.o || "?"] = o.m; o = { v: 2, by: b }; }   // old format (one student)
    if (!o.by) o = { v: 2, by: {} };
    return o;
  }
  function myOwner(o) {
    var k = NAME && NAME !== "Student" ? NAME : "", ks = Object.keys(o.by);
    if (k) { if (o.by[k]) return k; var nk = norm(k); for (var x = 0; x < ks.length; x++) if (norm(ks[x]) === nk) return ks[x]; return k; }
    return ks.length === 1 ? ks[0] : "?";   // name not readable on this page: use the only saved student
  }
  function myMap() { var o = myAll(); return o.by[myOwner(o)] || {}; }
  function mySave(m) {
    var o = myAll(), k = myOwner(o), real = NAME && NAME !== "Student" ? NAME : "";
    if (real && k !== real) { delete o.by[k]; k = real; }   // keep the current spelling of the name
    if (o.by["?"] && k !== "?") { Object.keys(o.by["?"]).forEach(function (x) { if (!m[x]) m[x] = o.by["?"][x]; }); delete o.by["?"]; }
    o.by[k] = m; jset(RV_MINE, o);
  }
  function looseC(c) { return norm(c).replace(/AND/g, ""); }
  /* find your saved review for this faculty + course + semester (exact key first, then a tolerant match) */
  function mineFind(mine, idx, x) {
    var k = rvKey(x); if (mine[k]) return k;
    var cand = (idx[x.e + "|" + norm(x.sem)] || []).concat(idx["name:" + norm(x.n).toLowerCase() + "|" + norm(x.sem)] || []), lc = looseC(x.course);
    for (var i = 0; i < cand.length; i++) { var c = looseC(cand[i].split("|")[1]); if (c === lc || (c.length > 5 && lc.indexOf(c) >= 0) || (lc.length > 5 && c.indexOf(lc) >= 0)) return cand[i]; }
    return "";
  }
  function mineIdx(mine) { var idx = {}; Object.keys(mine).forEach(function (k) { var p = k.split("|"); (idx[p[0] + "|" + norm(p[2])] || (idx[p[0] + "|" + norm(p[2])] = [])).push(k); }); return idx; }
  var giveTm = 0, giveAt = 0;
  function givePaintSoon() {   // while the faculty list is loading: repaint at most every 0.8 s
    if (giveTm) return; var w = Math.max(0, 800 - (Date.now() - giveAt));
    giveTm = setTimeout(function () { giveTm = 0; giveAt = Date.now(); rvPaint(); }, w);
  }
  function giveRows(d, mine) {
    var idx = mineIdx(mine), moved = false, out = [];
    d.sems.forEach(function (s, si) {
      var rows = [], miss = 0;
      s.courses.forEach(function (c) { if (!(c.t || []).length) miss++; (c.t || []).forEach(function (t) {
        var x = { e: t.e, n: t.n, img: t.img, course: title(c.name), sec: c.sec, res: c.res, sem: s.t }, k = rvKey(x), f = mineFind(mine, idx, x);
        if (f && f !== k) { mine[k] = Object.assign({}, mine[f], { rk: mine[f].rk || f }); delete mine[f]; moved = true; }   // heal an old key (rk = key the server knows it by)
        x.k = k; rows.push(x); }); });
      out.push({ t: s.t, rows: rows, miss: miss, n: s.courses.length, done: rows.filter(function (r) { return mine[r.k]; }).length });
    });
    if (moved) mySave(mine);
    return out;
  }
  function giveCard(x, m) {
    return '<div class="pp-card pp-rvc" data-k="' + esc(x.k) + '">' +
      '<div class="pp-rvhead">' + facPic(x.e, x.img, x.n) + '<div class="pp-t"><b>' + esc(x.n) + "</b><small>" + esc(x.course) + (x.sec ? " [" + esc(x.sec) + "]" : "") + (x.res && /[A-F]/.test(x.res) ? " · " + esc(x.res.replace(/\s*\(.*$/, "")) : " · Running") + "</small></div>" + (m ? '<span class="pp-chip ok">✓ Reviewed</span>' : "") + "</div>" +
      '<div class="pp-rvform' + (m ? "" : " open") + '"><div class="pp-starpick" role="radiogroup" aria-label="Rating">' + [1, 2, 3, 4, 5].map(function (i) { return '<button type="button" data-s="' + i + '" class="' + (m && i <= m.s ? "on" : "") + '" role="radio" aria-checked="' + (m && i===m.s ? 'true' : 'false') + '" aria-label="' + i + ' star">★</button>'; }).join("") + '<span class="pp-slab">' + (m ? ["", "Poor", "Fair", "Good", "Very good", "Excellent"][m.s] : "Tap to rate") + "</span></div>" +
      '<textarea class="pp-input" maxlength="500" rows="2" placeholder="Comment (optional) — teaching, grading, behaviour…">' + esc(m ? m.c || "" : "") + '</textarea><div class="pp-row pp-rvact"><small class="pp-rvlen"></small>' + (m ? '<button class="pp-btn sm" data-del="1">Remove</button>' : "") + '<button class="pp-btn pri sm" data-sub="1">' + (m ? "Update review" : "Submit") + "</button></div></div>" +
      (m ? '<div class="pp-rvmine">' + starsHtml(m.s) + (m.c ? "<p>" + esc(m.c) + "</p>" : "") + '<button class="pp-btn sm" data-edit="1">Edit</button></div>' : "") + "</div>";
  }
  function semBody(g, mine) {
    return g.rows.map(function (x) { return giveCard(x, mine[x.k]); }).join("") +
      (g.miss ? '<p class="pp-note pp-rvmiss">⚠️ Couldn’t load the faculty of ' + g.miss + (g.miss > 1 ? " courses" : " course") + ' in this semester. <button class="pp-btn sm" data-rv="retry">Try again</button></p>' : "");
  }
  function giveDraw(box) {
    var d = mfGet();
    if (!d || mfBusy) {
      var pm = mfBusy || mfLoad(false, givePaintSoon); if (!pm.__w) pm.__w = 1, pm.then(function () { rvPaint(); }, function (e) { var b = $("#pp-rvbody", app); if (b && rvState.tab === "give") b.innerHTML = '<div class="pp-card pp-empty"><span class="pp-em">😕</span>' + esc(e.message === "SESSION" ? "Session expired — please log in again" : e.message) + "</div>"; });
      if (!d) { box.innerHTML = '<div class="pp-card"><div class="pp-rvload"><span class="pp-spin"></span><div><b>Finding your faculty…</b><small id="pp-mfprog">' + esc(mfProg || "Reading your semesters from the portal") + "</small></div></div></div>" + '<div class="pp-sk" style="height:110px;margin-top:12px"></div><div class="pp-sk" style="height:110px;margin-top:12px"></div>'; return; }
    }
    if (!mfBusy && Date.now() - d.t > 12 * 3600e3) mfLoad(false, givePaintSoon).then(function () { rvPaint(); }, function () {});
    var mine = myMap(), groups = giveRows(d, mine), byK = {}, tot = 0, dn = 0, first = true, so = rvState.semOpen || (rvState.semOpen = {});
    groups.forEach(function (g) { g.rows.forEach(function (x) { byK[x.k] = x; }); tot += g.rows.length; dn += g.done; }); box.__byK = byK;
    var html = groups.map(function (g) {
      if (!g.rows.length && !g.miss) return "";
      var open = g.t in so ? so[g.t] : first; first = false;
      return '<details class="pp-rvsem" data-sem="' + esc(g.t) + '"' + (open ? " open" : "") + '><summary class="pp-sem-h">' + esc(g.t) + ' <span class="pp-chip' + (g.rows.length && g.done === g.rows.length ? " ok" : "") + '">' + g.done + "/" + g.rows.length + "</span></summary>" +
        '<div class="pp-rvsb">' + (open ? semBody(g, mine) : "") + "</div></details>";   // closed semesters are built when opened
    }).join("");
    box.innerHTML = '<p class="pp-note" style="margin:0 2px 12px">🕶️ Reviews are <b>anonymous</b> — your name and ID are never shown or sent. Rate the faculty you took courses with (running and completed). You can edit any time.' + (tot ? "<br><b>" + dn + " of " + tot + "</b> reviewed." : "") + "</p>" +
      (html || '<div class="pp-card pp-empty"><span class="pp-em">🧑‍🏫</span>No faculty found in your courses yet</div>') + (mfBusy ? '<p class="pp-note" style="text-align:center"><span class="pp-spin"></span> <span id="pp-mfprog">' + esc(mfProg) + "</span></p>" : "");
    $$(".pp-rvsem", box).forEach(function (dt) { dt.addEventListener("toggle", function () {
      var t = dt.getAttribute("data-sem"); so[t] = dt.open;
      var sb = $(".pp-rvsb", dt); if (dt.open && sb && !sb.firstChild) { var g = groups.filter(function (x) { return x.t === t; })[0]; if (g) { sb.innerHTML = semBody(g, myMap()); rvRestore(sb); rvPics(); } }
    }); });
    rvPics();
    if (box.__wired) return; box.__wired = 1;
    /* one set of listeners for all cards (event delegation) */
    function cardOf(el) { var c = el.closest(".pp-rvc"); return c && box.contains(c) ? c : null; }
    function infoOf(card) { var k = card.getAttribute("data-k"), bk = box.__byK || {}; if (bk[k]) return bk[k]; var dd = mfGet(); if (!dd) return null; var r = null; giveRows(dd, myMap()).some(function (g) { return g.rows.some(function (x) { if (x.k === k) { r = x; return true; } }); }); return r; }
    function selOf(card) { return +(card.getAttribute("data-sel") || ((myMap()[card.getAttribute("data-k")] || {}).s) || 0); }
    box.addEventListener("click", function (ev) {
      if (rvState.tab !== "give") return; var t = ev.target.closest("button"); if (!t || !box.contains(t)) return;
      if (t.getAttribute("data-rv") === "retry") { t.disabled = true; mfLoad(true, givePaintSoon).then(function () { rvPaint(true); }, function () { t.disabled = false; }); rvPaint(true); return; }
      var card = cardOf(t); if (!card) return;
      var k = card.getAttribute("data-k"), info = infoOf(card), lab = $(".pp-slab", card), ta = $("textarea", card);
      if(rvPending[k])return;
      if (t.hasAttribute("data-s")) { var sel = +t.getAttribute("data-s"); card.setAttribute("data-sel", sel); rvDirty = true;
        $$("[data-s]", card).forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-s") <= sel); }); lab.textContent = ["", "Poor", "Fair", "Good", "Very good", "Excellent"][sel]; rvCapture(box); $$("[data-s]",card).forEach(function(b){b.setAttribute("aria-checked",String(+b.dataset.s===sel));}); return; }
      if (t.hasAttribute("data-edit")) { $(".pp-rvform", card).classList.add("open"); var mn = $(".pp-rvmine", card); if (mn) mn.style.display = "none"; rvDrafts[k]={s:selOf(card),c:ta.value,open:true}; return; }
      if (!info) { toast("Please refresh and try again"); return; }
      if (t.hasAttribute("data-sub")) {
        var s2 = selOf(card); if (!s2) { toast("Tap the stars to rate first"); return; }
        if (!rvCfg()) { toast("Review server not connected"); return; }
        var cm = ta.value.replace(/\s+/g, " ").trim().slice(0, 500), label = t.textContent, rk = (myMap()[k] || {}).rk; rvCapture(box);rvPending[k]=true;card.setAttribute("aria-busy","true");$$("button,textarea",card).forEach(function(b){b.disabled=true;}); t.textContent = "Submitting…";
        ridFor(info, rk).then(function (rid) { return rvReq("rpc/submit_review", "POST", { p_rid: rid, p_email: info.e, p_name: info.n, p_course: info.course, p_sem: info.sem, p_stars: s2, p_comment: cm }); })
          .then(function () { var mm = myMap(); mm[k] = { s: s2, c: cm, t: Date.now(), n: info.n }; if (rk) mm[k].rk = rk; mySave(mm);delete rvDrafts[k];delete rvPending[k];$$(".pp-rvc",app).forEach(function(c){if(c.dataset.k===k)c.dataset.suppressCapture="1";});card.dataset.suppressCapture="1"; toast("Review submitted ✓ Everyone can see it now"); return rvList(true).catch(function () {}); })
          .then(function () { rvPaint(true); }, function (e) { delete rvPending[k];card.removeAttribute("aria-busy");$$("button,textarea",card).forEach(function(b){b.disabled=false;}); t.textContent = label;rvPaint(true); toast(e.message === "NOSERVER" ? "Review server not connected" : e.message); });
        return;
      }
      if (t.hasAttribute("data-del")) {
        if (!confirm("Remove your review for " + info.n + "?")) return; rvPending[k]=true;$$("button,textarea",card).forEach(function(b){b.disabled=true;});
        ridFor(info, (myMap()[k] || {}).rk).then(function (rid) { return rvReq("rpc/delete_review", "POST", { p_rid: rid }); }).then(function () { var mm = myMap(); delete mm[k]; mySave(mm);delete rvDrafts[k];delete rvPending[k];$$(".pp-rvc",app).forEach(function(c){if(c.dataset.k===k)c.dataset.suppressCapture="1";});card.dataset.suppressCapture="1"; toast("Review removed"); return rvList(true).catch(function () {}); })
          .then(function () { rvPaint(true); }, function (e) {delete rvPending[k];$$("button,textarea",card).forEach(function(b){b.disabled=false;}); toast(e.message); });
      }
    });
    box.addEventListener("keydown",function(ev){var b=ev.target.closest("[data-s]");if(!b||rvState.tab!=="give"||!/[A-Za-z]/.test(ev.key))return;var n=+b.dataset.s;if(["ArrowRight","ArrowUp"].includes(ev.key))n=Math.min(5,n+1);else if(["ArrowLeft","ArrowDown"].includes(ev.key))n=Math.max(1,n-1);else if(ev.key==="Home")n=1;else if(ev.key==="End")n=5;else return;ev.preventDefault();var next=$("[data-s='"+n+"']",b.closest(".pp-starpick"));if(next&&!next.disabled){next.focus();next.click();}});
    box.addEventListener("input", function (ev) { var ta = ev.target; if (ta.tagName !== "TEXTAREA") return; var card = cardOf(ta); if (!card) return; rvDirty = true; var len = $(".pp-rvlen", card); len.textContent = ta.value.length + " / 500";rvCapture(box); });
  }
  /* part 2: everybody's reviews */
  function allDraw(box) {
    if (!rvAll) {
      if (!rvCfg()) { box.innerHTML = '<div class="pp-card pp-empty"><span class="pp-em">🔌</span>Review server not connected</div>'; return; }
      box.innerHTML = '<div class="pp-sk" style="height:46px"></div><div class="pp-sk" style="height:96px;margin-top:12px"></div><div class="pp-sk" style="height:96px;margin-top:12px"></div>';
      rvList().then(rvPaint, function (e) { var b = $("#pp-rvbody", app); if (b && rvState.tab === "all" && !rvAll) b.innerHTML = '<div class="pp-card pp-empty"><span class="pp-em">😕</span>' + esc(e.message) + '<br><br><button class="pp-btn" onclick="this.closest(\'#pp-rvbody\').innerHTML=\'\'">OK</button></div>'; });
      return;
    }
    var focused = document.activeElement && document.activeElement.id === "pp-rvq";
    box.innerHTML = '<div class="pp-search" style="margin-bottom:10px">' + ic("search") + '<input class="pp-input" id="pp-rvq" placeholder="Search faculty, course or comment" value="' + esc(rvState.q) + '" autocomplete="off" enterkeyhint="search"></div>' +
      '<div class="pp-tabs pp-fchips" style="margin-bottom:12px"><button data-so="faculty" class="' + (rvState.sort === "faculty" ? "on" : "") + '">By faculty</button><button data-so="top" class="' + (rvState.sort === "top" ? "on" : "") + '">Top rated</button></div>' +
      '<div id="pp-rvlist"></div>';
    var inp = $("#pp-rvq", box), tm;
    inp.oninput = function () { clearTimeout(tm); tm = setTimeout(function () { rvState.q = inp.value; rvState.show = 30; listDraw(); }, 140); };
    if (focused) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    $$("[data-so]", box).forEach(function (b) { b.onclick = function () { rvState.sort = b.getAttribute("data-so"); rvState.show = 30; $$("[data-so]", box).forEach(function (x) { x.classList.toggle("on", x === b); }); listDraw(); }; });
    listDraw();
  }
  function facAgg(list) {
    var g = {}; list.forEach(function (r) { var k = r.fac_email; var a = g[k] || (g[k] = { e: k, n: r.fac_name, sum: 0, cnt: 0, cm: 0, courses: {} }); a.sum += r.stars; a.cnt++; if (r.comment) a.cm++; a.courses[r.course] = 1; });
    return Object.keys(g).map(function (k) { var a = g[k]; a.avg = a.sum / a.cnt; return a; });
  }
  /* Server search: the app loads the newest 1000 reviews at once. When there are more, a search also asks the
     server for every matching review (same fields as the local search), and the results are merged into the list. */
  var rvSrch = {};
  function rvSearch(q) {
    if (!rvAll || rvAll.length < 1000 || rvSrch[q]) return;
    var toks = q.split(" ").map(function (w) { return w.replace(/[,()"*\\]/g, ""); }).filter(Boolean).slice(0, 6);
    if (!toks.length) return;
    rvSrch[q] = [];
    var f = toks.map(function (w) { var v = "*" + w + "*"; return "or(fac_name.ilike." + v + ",course.ilike." + v + ",comment.ilike." + v + ",semester.ilike." + v + ")"; }).join(",");
    rvReq("reviews_public?select=" + RV_COLS + "&and=" + encodeURIComponent("(" + f + ")") + "&order=updated_at.desc&limit=1000").then(function (j) {
      rvSrch[q] = Array.isArray(j) ? j : [];
      if (current === "reviews" && rvState.tab === "all" && rvState.q.trim().toLowerCase().split(/\s+/).filter(Boolean).join(" ") === q) listDraw();
    }, function () { delete rvSrch[q]; });
  }
  function listDraw() {
    var box = $("#pp-rvlist", app); if (!box || !rvAll) return;
    var qs = rvState.q.trim().toLowerCase().split(/\s+/).filter(Boolean), rep = jget(RV_REP, {});
    var base = rvAll;
    if (qs.length) { var qk = qs.join(" "); rvSearch(qk); var extra = rvSrch[qk]; if (extra && extra.length) { var seen = {}; base = rvAll.concat(extra).filter(function (r) { if (seen[r.id]) return false; seen[r.id] = 1; return true; }); } }
    var list = base.filter(function (r) { if (!qs.length) return true; var x = facBy(r.fac_email), hay = (r.fac_name + " " + r.course + " " + (r.comment || "") + " " + r.semester + " " + (x ? x[3] + " " + x[2] : "")).toLowerCase(); return qs.every(function (w) { return hay.indexOf(w) >= 0; }); });
    var html = "";
    if (rvState.sort === "faculty" || rvState.sort === "top") {
      var ag = facAgg(list); ag.sort(rvState.sort === "top" ? function (a, b) { return (b.avg * b.cnt / (b.cnt + 2) + 3 * 2 / (b.cnt + 2)) - (a.avg * a.cnt / (a.cnt + 2) + 3 * 2 / (a.cnt + 2)) || b.cnt - a.cnt; } : function (a, b) { return a.n.localeCompare(b.n); });
      /* every review of each faculty (not only the ones matching the search) feeds the comments dropdown */
      var byF = {}; base.forEach(function (r) { if (r.comment) (byF[r.fac_email] || (byF[r.fac_email] = [])).push(r); });
      var nRv = 0; ag.forEach(function (a) { nRv += a.cnt; });
      html = (ag.length ? '<div class="pp-rvcount"><b>' + ag.length + "</b> " + "faculty" + (qs.length ? " found" : " reviewed") + " · " + nRv + (nRv > 1 ? " reviews" : " review") + "</div>" : "") +
        ag.slice(0, rvState.show).map(function (a) { var x = facBy(a.e), cms = (byF[a.e] || []).slice().sort(function (p, q) { return String(q.updated_at || q.created_at || "").localeCompare(String(p.updated_at || p.created_at || "")); }), op = !!rvState.fopen[a.e];
        return '<div class="pp-card pp-rvfw' + (op ? " open" : "") + '"><div class="pp-rvfrow"><button class="pp-rvf" data-fq="' + esc(a.n) + '">' + facPic(a.e, "", a.n) + '<div class="pp-t"><b>' + esc(a.n) + "</b><small>" + esc(x ? title(x[4].toLowerCase()) + " · " + title(x[3].toLowerCase()) : Object.keys(a.courses).slice(0, 2).join(" · ")) + '</small><div class="pp-rvavg">' + starsHtml(a.avg) + "<b>" + a.avg.toFixed(1) + "</b><small>" + a.cnt + (a.cnt > 1 ? " reviews" : " review") + (a.cm ? " · " + a.cm + " 💬" : "") + "</small></div></div></button>" +
          '<button class="pp-rvdd" data-dd="' + esc(a.e) + '" aria-expanded="' + op + '" title="' + (op ? "Hide comments" : "Show all comments") + '" aria-label="Comments">💬 ' + cms.length + ic("down") + "</button></div>" +
          ('<div class="pp-rvcms"'+(op?'':' hidden')+'> ' + (cms.length ? cms.map(function (r) { return '<div class="pp-rvci"><p class="pp-rvcm">' + esc(r.comment) + "</p><small>" + starsHtml(r.stars) + " " + esc(r.course) + " · " + esc(r.semester) + " · " + esc(agoIso(r.updated_at || r.created_at)) + "</small></div>"; }).join("") : '<div class="pp-rvci pp-rvc0">No written comments yet — only star ratings.</div>') + "</div>") + "</div>"; }).join("");
      var more = ag.length - rvState.show;
    } else {
      var one = qs.length ? facAgg(list) : []; var head = one.length === 1 ? '<div class="pp-card pp-rvsum">' + facPic(one[0].e, "", one[0].n, "lg") + '<div class="pp-t"><b>' + esc(one[0].n) + '</b><div class="pp-rvavg">' + starsHtml(one[0].avg, 1) + "<b>" + one[0].avg.toFixed(1) + "</b><small>" + one[0].cnt + (one[0].cnt > 1 ? " reviews" : " review") + "</small></div></div></div>" : "";
      html = head + list.slice(0, rvState.show).map(function (r) {
        return '<div class="pp-card pp-rvi">' + facPic(r.fac_email, "", r.fac_name) + '<div class="pp-t"><div class="pp-rvtop"><b>' + esc(r.fac_name) + "</b>" + starsHtml(r.stars) + "</div><small>" + esc(r.course) + " · " + esc(r.semester) + " · " + esc(agoIso(r.updated_at || r.created_at)) + "</small>" + (r.comment ? '<p class="pp-rvcm">' + esc(r.comment) + "</p>" : "") + "</div>" +
          (rep[r.id] ? "" : '<button class="pp-rvrep" data-rep="' + esc(r.id) + '" title="Report abusive review" aria-label="Report">⚑</button>') + "</div>"; }).join("");
      more = list.length - rvState.show;
    }
    box.innerHTML = (html || '<div class="pp-card pp-empty"><span class="pp-em">⭐</span>' + (rvAll.length ? "No reviews match your search" : "No reviews yet — be the first! Go to “Give review”.") + "</div>") +
      (more > 0 ? '<div style="text-align:center;margin-top:14px"><button class="pp-btn" id="pp-rvmore">Show more (' + more + ")</button></div>" : "");
    var mb = $("#pp-rvmore", box); if (mb) mb.onclick = function () { rvState.show += 30; listDraw(); }; rvPics();
    $$("[data-dd]", box).forEach(function (b) { b.onclick = function (ev) {
      ev.stopPropagation();var email=b.getAttribute("data-dd"), card=b.closest(".pp-rvfw"), panel=$(".pp-rvcms",card);if(!panel)return;
      var open=b.getAttribute("aria-expanded")!=="true", from=panel.hidden?0:panel.getBoundingClientRect().height;
      if(panel.__motion)panel.__motion.cancel();if(open)rvState.fopen[email]=1;else delete rvState.fopen[email];
      b.setAttribute("aria-expanded",String(open));b.title=open?"Hide comments":"Show all comments";card.classList.toggle("open",open);
      panel.hidden=false;panel.style.height="auto";var to=open?panel.scrollHeight:0;
      var settings=window.__aiubPlusAPI?window.__aiubPlusAPI.get():{};
      if(!panel.animate||matchMedia("(prefers-reduced-motion: reduce)").matches||settings.anim===false||settings.performance){panel.hidden=!open;return;}
      panel.style.overflow="hidden";var motion=panel.animate([{height:from+"px",opacity:from?1:0},{height:to+"px",opacity:open?1:0}],{duration:220,easing:"cubic-bezier(.2,.7,.2,1)"});panel.__motion=motion;
      motion.onfinish=function(){if(panel.__motion!==motion)return;panel.hidden=!open;panel.style.height="";panel.style.overflow="";panel.__motion=null;};
    }; });
    $$("[data-fq]", box).forEach(function (b) { b.onclick = function () { rvState.q = b.getAttribute("data-fq"); rvState.sort = "latest"; rvState.show = 30; allDraw($("#pp-rvbody", app)); scTop(0); }; });
    $$("[data-rep]", box).forEach(function (b) { b.onclick = function () { if (!confirm("Report this review as abusive or fake? Reviews with several reports are hidden.")) return; var id = +b.getAttribute("data-rep");
      rvReq("rpc/report_review", "POST", { p_id: id }).then(function () { var r = jget(RV_REP, {}); r[id] = 1; jset(RV_REP, r); b.remove(); toast("Reported. Thanks!"); }, function (e) { toast(e.message); }); }; });
  }
  function rvHeroBtn() {
    var n = rvAll ? rvAll.length : 0, top = rvAll && rvAll.length ? facAgg(rvAll).sort(function (a, b) { return b.cnt - a.cnt; }).slice(0, 3) : [];
    return '<a class="pp-regbtn pp-rvhome" href="#/reviews" data-r="reviews"><span class="pp-qi">' + ic("star") + '</span><span class="pp-t"><b>Faculty review</b><small>' + (n ? n + (n > 1 ? " anonymous reviews" : " anonymous review") + " · rate your faculty" : "Rate your faculty anonymously") + "</small></span>" +
      (top.length ? '<span class="pp-rvfaces">' + top.map(function (a) { return facPic(a.e, "", a.n, "sm"); }).join("") + "</span>" : "") + ic("back", "flip") + "</a>";
  }
  /* home card */
  function rvHomeCard() {
    var n = rvAll ? rvAll.length : 0, top = rvAll && rvAll.length ? facAgg(rvAll).sort(function (a, b) { return b.cnt - a.cnt; }).slice(0, 4) : [];
    return '<a class="pp-card pp-rvhome" href="#/reviews" data-r="reviews"><span class="pp-qi">⭐</span><span class="pp-t"><b>Faculty review</b><small>' + (rvCfg() ? (n ? n + (n > 1 ? " anonymous reviews" : " anonymous review") + " · rate your faculty" : "Rate your faculty anonymously · see what others say") : "Rate your faculty anonymously") + "</small></span>" +
      (top.length ? '<span class="pp-rvfaces">' + top.map(function (a) { return facPic(a.e, "", a.n, "sm"); }).join("") + "</span>" : "") + ic("back", "flip") + "</a>";
  }


  function rvSetCard() {
    var c = rvCfg(), own = jget(RV_CFG_KEY, null);
    return '<div class="pp-card"><h3>' + ic("star") + ' Faculty review server</h3><p class="pp-note" style="margin:0 0 10px">' + (c ? "✅ Connected" + (own ? " (custom server on this device)" : " (built-in)") : "Not connected. Paste your Supabase project URL and anon public key.") + '</p>' +
      '<input class="pp-input" id="pp-rvurl" placeholder="https://xxxx.supabase.co" value="' + esc(own ? own.url : "") + '" autocomplete="off" style="margin-bottom:8px">' +
      '<input class="pp-input" id="pp-rvkey" placeholder="anon public key" value="' + esc(own ? own.key : "") + '" autocomplete="off" style="margin-bottom:10px">' +
      '<div class="pp-row"><button class="pp-btn pri sm" id="pp-rvsave">Save & test</button>' + (own ? '<button class="pp-btn sm" id="pp-rvclr">Use built-in</button>' : "") + "</div></div>";
  }
  function rvSetWire() {
    var sv = $("#pp-rvsave", app), cl = $("#pp-rvclr", app); if (cl) cl.onclick = function () { localStorage.removeItem(RV_CFG_KEY); rvAll = null; toast("Saved ✓"); route(true); };
    if (sv) sv.onclick = function () { var u = $("#pp-rvurl", app).value.trim().replace(/\/+$/, ""), k = $("#pp-rvkey", app).value.trim();
      if (!/^https:\/\/[\w.-]+$/.test(u) || k.length < 20) { toast("Enter a valid https URL and key"); return; }
      var prev = localStorage.getItem(RV_CFG_KEY); jset(RV_CFG_KEY, { url: u, key: k }); sv.disabled = true; sv.textContent = "Testing…";
      rvReq("reviews_public?select=id&limit=1").then(function () { rvAll = null; try { STORE.removeItem("pp.c.rv"); } catch (e) {} toast("Connected ✓"); route(true); },
        function (e) { if (prev) localStorage.setItem(RV_CFG_KEY, prev); else localStorage.removeItem(RV_CFG_KEY); sv.disabled = false; sv.textContent = "Save & test"; toast("Couldn’t connect: " + e.message); }); };
  }
  /* ---------- quick actions: only things NOT already in the tab bar / sidebar ---------- */
  function isCoursesResult(name) { return /^COURSES?(?:AND)?RESULTS?$/.test(norm(name)); }
  function coursesResultHref() {
    var href = null;
    MENU.some(function (g) { return g.items.some(function (it) { if (!isCoursesResult(it.t) || !it.h) return false; href = it.h; return true; }); });
    return href;
  }
  function defaultQuickActions() {
    var phone = MQ_PHONE.matches || MQ_TOUCH.matches, q = [], resultHref = coursesResultHref();
    var resultAction = resultHref ? ["classic?u=" + encodeURIComponent(resultHref), "book", "Courses & Result"] : null;
    if (phone) q.push(["grades", "award", "Grades", "grades"], ["finance", "wallet", "Payments", "finance"], ["mail", "mail", "Mail", "mail"]);
    q.push(["schedule", "coffee", "Free time", "", function () { schedState.view = "free"; }]);
    if (!phone) q.push(["schedule", "grid", "Week view", "", function () { schedState.view = "week"; }]);
    q.push(["courses", "spark", "Offered for me", "", function () { courseState.tab = "offered"; }]);
    q.push(["grades", "calc", "CGPA calculator", "", function () { setTimeout(function () { var c = $("#pp-calc", app); if (c) c.scrollIntoView({ block: "start", behavior: "smooth" }); }, 350); }]);
    if (phone && resultAction) q.push(resultAction);
    else q.push(["mail", "cloud", "Outlook", "", function () { mailState.tab = "outlook"; }]);
    if (L("Drop Application")) q.push(["classic?u=" + encodeURIComponent(L("Drop Application")), "minus", "Drop course"]);
    if (!phone) { if (L("Search Book")) q.push(["classic?u=" + encodeURIComponent(L("Search Book")), "lib", "Library"]); if (resultAction) q.push(resultAction); }
    return q.slice(0, 8);
  }
  function quickActionsHtml() {
    return quickActions().map(function (x, i) { return '<a href="#/' + x[0] + '" data-qi="' + i + '"' + (x[3] ? ' data-r="' + x[3] + '"' : "") + '><span class="pp-qi">' + ic(x[1]) + '</span><span class="pp-ql">' + esc(x[2]) + "</span></a>"; }).join("");
  }
  function wireQuickActions() {
    var qa = quickActions();
    $$(".pp-quick a[data-qi]", app).forEach(function (a) { var x = qa[+a.getAttribute("data-qi")]; if (x && x[4]) a.__pre = x[4]; });
  }
  function refreshQuickActions() {
    if (!app || current !== "home") return;
    var box = $(".pp-quick", app); if (!box) return;
    var html = quickActionsHtml(); if (box.innerHTML === html) return;
    box.innerHTML = html; wireQuickActions();
  }

  /* ---------- header: turns into liquid glass when content scrolls under it ---------- */
  var topEl, topOn = false, topRaf = 0;
  function topCheck() { topRaf = 0; if (!topEl) return; var v = scTop() > 4; if (v !== topOn) { topOn = v; topEl.classList.toggle("pp-scrolled", v); } }
  function wireTop() {
    topEl = $(".pp-top", app); var on = function () { if (!topRaf) topRaf = requestAnimationFrame(topCheck); };
    window.addEventListener("scroll", function (e) { on(); lastInput = Date.now(); if (e.target === document) e.stopImmediatePropagation(); }, { capture: true, passive: true });
    scroller.addEventListener("scroll", function () { on(); lastInput = Date.now(); }, { passive: true });
    var setH = function () { app.style.setProperty("--pp-toph", topEl.offsetHeight + "px"); };
    if (window.ResizeObserver) new ResizeObserver(setH).observe(topEl); setH();
  }
  /* ---------- start loading a section's data the moment the finger/mouse touches its button ---------- */
  function warmOnIntent() {
    var W = { schedule: function () { return D.reg(); }, courses: function () { return D.curr(); }, grades: function () { return D.sem(); }, finance: function () { return Promise.all([D.reg(), D.acc()]); }, notices: function () { return noticePage(1); }, notifications: function () { return notiLoad(); }, more: function () { return D.profile(); }, faculty: function () { return facLoad(); }, reviews: function () { return Promise.all([rvList().catch(function () {}), facLoad().catch(function () {}), mfGet() ? null : mfLoad()]); } };
    var warm = function (e) { var a = e.target.closest && e.target.closest("a[data-r], [data-r].pp-bell"); if (!a || !app.contains(a)) return; var f = W[a.getAttribute("data-r")]; if (f && !warm.done[a.getAttribute("data-r")]) { warm.done[a.getAttribute("data-r")] = 1; try { f().catch(function () {}); } catch (x) {} setTimeout(function () { warm.done = {}; }, 60e3); } };
    warm.done = {};
    app.addEventListener("pointerdown", warm, { passive: true });
    app.addEventListener("pointerover", function (e) { if (e.pointerType === "mouse") warm(e); }, { passive: true });
  }

  /* ---------- AIUB notices (public website www.aiub.edu) ---------- */
  var SITE = "https://www.aiub.edu";
  function hasPublicTransport() {
    return typeof GM_xmlhttpRequest === "function" || (typeof GM !== "undefined" && GM && typeof GM.xmlHttpRequest === "function") || (typeof browser !== "undefined" && browser.runtime && typeof browser.runtime.sendMessage === "function") || (typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.sendMessage === "function");
  }
  function publicRuntime() {
    if(typeof chrome!=="undefined" && chrome.runtime && typeof chrome.runtime.sendMessage==="function")return chrome.runtime;
    if(typeof browser!=="undefined" && browser.runtime && typeof browser.runtime.sendMessage==="function")return browser.runtime;
    return null;
  }
  function runtimePublicRequest(url) {
    // Accept callback and Promise runtime APIs. Some Safari-compatible wrappers
    // expose browser.runtime but return undefined instead of a Promise.
    return new Promise(function(resolve,reject){
      var rt=publicRuntime(),done=false,timer;
      if(!rt){reject(new Error("BACKGROUND: Extension messaging unavailable"));return;}
      timer=setTimeout(function(){finish(new Error("BACKGROUND_TIMEOUT: No public-page response after 7 seconds"));},7000);
      function finish(error,value){if(done)return;done=true;clearTimeout(timer);error?reject(error):resolve(value);}
      function receive(response){
        if(!response){finish(new Error("BACKGROUND: Empty extension response"));return;}
        if(response.err){finish(new Error((response.code||"PUBLIC_REQUEST")+": "+String(response.err).slice(0,220)));return;}
        if(typeof response.text!=="string"){finish(new Error("BACKGROUND: Invalid extension response"));return;}
        finish(null,response.text);
      }
      function callback(response){var e=rt.lastError;if(e){finish(new Error("BACKGROUND: "+(e.message||"Extension connection lost")));return;}receive(response);}
      var message={t:"xget",url:url};
      try {
        var isChrome=typeof chrome!=="undefined"&&rt===chrome.runtime;
        if(isChrome){var p=rt.sendMessage(message,callback);if(p&&typeof p.then==="function")p.then(receive,function(e){finish(new Error("BACKGROUND: "+String(e&&e.message||e)));});}
        else {
          var result=rt.sendMessage(message);
          if(result&&typeof result.then==="function")result.then(receive,function(e){finish(new Error("BACKGROUND: "+String(e&&e.message||e)));});
          else {var second=rt.sendMessage(message,callback);if(second&&typeof second.then==="function")second.then(receive,function(e){finish(e);});}
        }
      }catch(e){finish(new Error("BACKGROUND: "+String(e&&e.message||e)));}
    });
  }
  function xgetOnce(url) {
    return new Promise(function (res, rej) {
      var done = false, to = setTimeout(function () { if (!done) { done = true; rej(new Error("aiub.edu is not responding")); } }, 20000);
      function ok(t) { if (done) return; done = true; clearTimeout(to); res(t); } function bad(e) { if (done) return; done = true; clearTimeout(to); rej(e instanceof Error ? e : new Error(String(e))); }
      try {
        if (typeof GM_xmlhttpRequest === "function") return GM_xmlhttpRequest({ method: "GET", url: url, anonymous: true, timeout: 15000, onload: function (r) { r.status >= 200 && r.status < 400 ? ok(r.responseText) : bad("HTTP " + r.status); }, onerror: function () { bad("Network error"); }, ontimeout: function () { bad("Timeout"); } });
        if (typeof GM !== "undefined" && GM && GM.xmlHttpRequest) { var gp = GM.xmlHttpRequest({ method: "GET", anonymous: true, timeout: 15000, url: url, onload: function (r) { r.status >= 200 && r.status < 400 ? ok(r.responseText) : bad("HTTP " + r.status); }, onerror: function () { bad("Network error"); }, ontimeout: function () { bad("Timeout"); } }); if (gp && gp.then) gp.then(function (r) { if (!r) return; r.status >= 200 && r.status < 400 ? ok(r.responseText) : bad("HTTP " + r.status); }, bad); return; }
        if(publicRuntime()){runtimePublicRequest(url).then(ok,bad);return;}
      } catch (e) { return bad(e); }
      fetch(url, { credentials: "omit" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }).then(ok, bad);
    });
  }
  function xget(url) { return retryRead(function () { return xgetOnce(url); }); }
  function publicFailure(e) {
    var m = String(e && e.message || e || "Network error");
    if (/context invalidated|receiving end|connection unavailable|message port|could not establish/i.test(m)) return "Extension connection lost. Reload the portal tab after reloading the extension.";
    if (/403|429/.test(m)) return "aiub.edu refused or limited this request. Open the official site; retry later.";
    if (/could not be read/.test(m)) return "The public notices page format was not recognized.";
    return "Public website request failed: " + m.slice(0, 200) + ".";
  }
  var noticeInflight = {};
  function parseNotices(html) {
    var d = new DOMParser().parseFromString(html, "text/html"), items = [];
    $$(".notification", d).forEach(function (n) {
      var a = n.closest("a[href]") || $("a[href]", n); if (!a) return; var target; try { target = new URL(a.getAttribute("href"), SITE); } catch (e) { return; } if (target.origin !== SITE || /^\/category\//.test(target.pathname)) return; var href = target.pathname;
      var dc = $(".date-custom", n), parts = dc ? txt(dc).split(" ") : [];
      items.push({ u: href, title: txt($(".title", n)), desc: txt($(".desc", n)), day: parts[0] || "", mon: parts[1] || "", year: parts[2] || "" });
    });
    var last = 1; $$(".pagination a[href]", d).forEach(function (a) { var m = /pageNo=(\d+)/.exec(a.getAttribute("href")); if (m) last = Math.max(last, +m[1]); });
    return { items: items, last: last };
  }
  function noticePage(n, force) {
    var key = "notices" + n, c = cacheRaw(key);
    if (!force && c && c.d && Date.now() - c.t < 10 * 60e3) return Promise.resolve(c.d);
    if (noticeInflight[key]) return noticeInflight[key];
    // First paint does not wait for a potentially blocked cross-origin request.
    if (!force && n === 1 && !c && window.StudentDeskPublicSnapshot && window.StudentDeskPublicSnapshot.notices) {
      var initial = {items:window.StudentDeskPublicSnapshot.notices.items,last:window.StudentDeskPublicSnapshot.notices.last,snapshotAt:window.StudentDeskPublicSnapshot.checked};
      cacheSet(key,initial);mem[key]=initial;
      setTimeout(function(){noticePage(1,true).then(function(d){if(!d.snapshotAt && current==="notices")route();},function(){});},50);
      return Promise.resolve(initial);
    }
    var pr = noticeAccess("/category/notices?pageNo=" + n + "&pageSize=20", function(h){var d=parseNotices(h);if(!d.items.length)throw new Error("The notices page could not be read");return d;}).then(function(d){delete requestWarnings[key];cacheSet(key,d);mem[key]=d;return d;}).catch(function (e) {
      requestWarnings[key] = "Notices could not refresh. " + (c && c.d ? "Showing saved notices. " : "") + publicFailure(e);
      if (c && c.d) return c.d;
      throw e;
    });
    noticeInflight[key] = pr; pr.then(done, done); function done() { delete noticeInflight[key]; } return pr;
  }
  function noticeRows(items) {
    return items.map(function (it) { var isNew = isNewSig("notices", it.u);
      return '<a class="pp-item pp-notice" href="#/notice?u=' + encodeURIComponent(it.u) + '"><span class="pp-ndate"><b>' + esc(it.day) + "</b>" + esc(it.mon) + '</span><div class="pp-t"><b>' + esc(it.title) + (isNew ? NEWDOT : "") + "</b><small>" + esc(it.desc) + "</small></div></a>"; }).join("");
  }
  function noticeTime(it) { var t = Date.parse(it.day + " " + it.mon + " " + it.year); return isNaN(t) ? 0 : t; }
  var noticeState = { q: "", pages: 1 };
  // The official page is a temporary, offscreen data source only. The visible UI
  // is always ours. Verified origin + exact window/path/page checks prevent spoofing.
  function publicNoticeData(path) {
    return new Promise(function(resolve,reject) {
      var url;try{url=new URL(path,SITE);}catch(e){reject(e);return;}
      if(url.origin!==SITE || !/^\/[\w\-\/.%]+$/.test(url.pathname)){reject(new Error("Invalid public notice URL"));return;}
      var frame=document.createElement("iframe"),done=false,timer;
      frame.id="pp-notice-data-frame";frame.title="Public notice data loader";frame.tabIndex=-1;frame.setAttribute("aria-hidden","true");frame.referrerPolicy="no-referrer";
      frame.setAttribute("sandbox","allow-scripts allow-same-origin");
      frame.style.cssText="display:block!important;position:fixed!important;left:-10000px!important;top:0!important;width:1px!important;height:1px!important;border:0!important;opacity:0!important;pointer-events:none!important";
      function finish(error,value){if(done)return;done=true;clearTimeout(timer);window.removeEventListener("message",receive);frame.remove();error?reject(error):resolve(value);}
      function receive(e){
        if(e.origin!==SITE || e.source!==frame.contentWindow || !e.data || e.data.t!=="studentdesk:public-notice:v1")return;
        var payload=e.data,d=payload.data;if(payload.path!==url.pathname || !d)return;
        if(/^\/category\/notices\/?$/.test(url.pathname)){
          if(d.kind!=="list" || !Array.isArray(d.items))return;
          var sourcePage=new URLSearchParams(payload.search||"").get("pageNo")||"1";
          if(sourcePage!==(url.searchParams.get("pageNo")||"1"))return;
          var items=d.items.slice(0,100).filter(function(it){return it&&typeof it.title==="string"&&typeof it.u==="string"&&/^\/[\w\-\/.%]+$/.test(it.u)&&!/^\/category\//.test(it.u);}).map(function(it){return {u:it.u,title:it.title.slice(0,2000),desc:String(it.desc||"").slice(0,4000),day:String(it.day||"").slice(0,8),mon:String(it.mon||"").slice(0,16),year:String(it.year||"").slice(0,8)};});
          if(!items.length)return;finish(null,{items:items,last:Math.max(+sourcePage,Math.min(1000,+d.last||1))});
        }else if(d.kind==="detail" && typeof d.title==="string" && typeof d.body==="string")finish(null,{title:d.title.slice(0,2000),date:String(d.date||"").slice(0,120),body:cleanHtml(d.body.slice(0,600000))});
      }
      window.addEventListener("message",receive);
      timer=setTimeout(function(){finish(new Error("Public notice access unavailable. Allow StudentDesk on www.aiub.edu in your extension or userscript manager, then retry."));},10000);
      frame.onload=function(){if(!done&&frame.contentWindow)frame.contentWindow.postMessage({t:"studentdesk:read-public:v1"},SITE);};
      frame.src=url.href;document.body.appendChild(frame);
    });
  }
  function publicCacheMessage(message) {
    return new Promise(function(resolve,reject){var rt=publicRuntime(),done=false,timer=setTimeout(function(){finish(new Error("Public cache not responding"));},1800);function finish(e,v){if(done)return;done=true;clearTimeout(timer);e?reject(e):resolve(v);}function callback(v){if(rt&&rt.lastError){finish(new Error("Public cache unavailable"));return;}finish(null,v);}if(!rt){try{var read=typeof GM_getValue==="function"?GM_getValue:typeof GM!=="undefined"&&GM&&GM.getValue?GM.getValue.bind(GM):null;if(read&&message.t==="sd-public-cache-get"){Promise.resolve(read("sd.public."+message.path,null)).then(function(v){finish(null,{cached:v});},finish);return;}}catch(e){}finish(new Error("Extension messaging unavailable"));return;}try{var p=typeof chrome!=="undefined"&&rt===chrome.runtime?rt.sendMessage(message,callback):rt.sendMessage(message);if(p&&p.then)p.then(function(v){finish(null,v);},function(e){finish(e);});else if(!(typeof chrome!=="undefined"&&rt===chrome.runtime))rt.sendMessage(message,callback);}catch(e){finish(e);}});
  }
  function noticeCachedData(path) {
    return publicCacheMessage({t:"sd-public-cache-get",path:path}).then(function(r){
      if(!r||!r.cached||!r.cached.data)throw new Error("No synced public page");var d=r.cached.data;
      if(/^\/category\/notices/.test(path)){
        if(d.kind!=="list"||!Array.isArray(d.items))throw new Error("Invalid public list");
        return {items:d.items.slice(0,100).filter(function(it){return it&&typeof it.u==="string"&&/^\/[\w/%.\-]+$/.test(it.u)&&!it.u.startsWith("//")&&typeof it.title==="string";}).map(function(it){return {u:it.u,title:it.title.slice(0,2000),desc:String(it.desc||"").slice(0,4000),day:String(it.day||"").slice(0,8),mon:String(it.mon||"").slice(0,16),year:String(it.year||"").slice(0,8)};}),last:Math.min(1000,Math.max(1,+d.last||1)),syncedAt:r.cached.at};
      }
      if(d.kind!=="detail"||typeof d.title!=="string"||typeof d.body!=="string")throw new Error("Invalid public notice");return {title:d.title.slice(0,2000),date:String(d.date||"").slice(0,120),body:cleanHtml(d.body.slice(0,600000)),syncedAt:r.cached.at};
    });
  }
  function noticeAccess(path,parse) {
    var direct=publicRuntime()?runtimePublicRequest(SITE+path).then(parse):hasPublicTransport()?xgetOnce(SITE+path).then(parse):publicNoticeData(path);
    return direct.catch(function(error){
      return noticeCachedData(path).catch(function(){
        var snapshot=window.StudentDeskPublicSnapshot;
        if(snapshot&&snapshot.notices&&/^\/category\/notices\?pageNo=1(?:&|$)/.test(path)){
          return {items:snapshot.notices.items,last:snapshot.notices.last,snapshotAt:snapshot.checked,networkError:String(error&&error.message||error)};
        }
        throw error;
      });
    });
  }
  function noticeSyncHtml(path) {return '<a class="pp-btn pri sd-sync-public" href="'+SITE+esc(path)+'" target="_blank" rel="noopener noreferrer">'+ic("refresh")+' Sync from official site</a><p class="sd-muted sd-small">If background access is blocked, open the official page once with StudentDesk enabled there, then return here. Only public notices are synced; no student data is shared.</p>';}
  function noticeUnavailable(path,error) {
    return noticeSyncHtml(path) + '<section class="pp-card pp-notice-unavailable"><span class="pp-eyebrow">PUBLIC PAGE UNAVAILABLE</span><h3>Notices couldn’t refresh</h3><p>The extension could not retrieve this public page. Saved notices remain available when present.</p>'+(error?'<p class="pp-note" role="status">'+esc(String(error).slice(0,260))+'</p>':'')+'<div class="pp-row"><button type="button" class="pp-btn pri" data-act="refresh">'+ic("refresh")+' Retry</button><a class="pp-btn" href="'+SITE+esc(path)+'" target="_blank" rel="noopener noreferrer">'+ic("ext")+' Open official site</a></div></section>';
  }
  function filteredNotices(items,q){q=q.toLowerCase().trim();return q?items.filter(function(it){return (it.title+" "+it.desc).toLowerCase().indexOf(q)>=0;}):items;}
  VIEWS.notices=function(p,f){
    setHead("Notices","Official updates · your campus bulletin");
    if(p.compact)noticeState.pages=1;
    var jobs=[];for(var i=1;i<=noticeState.pages;i++)jobs.push(noticePage(i,f).catch(function(e){return {items:[],last:noticeState.pages,unavailable:true,error:String(e&&e.message||e)};}));
    return Promise.all(jobs).then(function(pages){
      var all=[],seen={},last=pages[0].last,snap=pages.some(function(pg){return pg.snapshotAt;}),synced=pages.some(function(pg){return pg.syncedAt;}),failed=pages.some(function(pg){return pg.unavailable;});
      pages.forEach(function(pg){pg.items.forEach(function(it){if(!seen[it.u]){seen[it.u]=true;all.push(it);}});last=Math.max(last,pg.last);});noticeState.items=all;
      var list=filteredNotices(all,noticeState.q);
      return '<div class="pp-view pp-notices"><div class="pp-bulletin-head"><span class="pp-eyebrow">CAMPUS BULLETIN</span><h2>Stay in the loop.</h2><p>Notices, deadlines and important university updates.</p></div><div class="pp-notice-toolbar"><input type="search" class="pp-input" id="pp-nq" aria-label="Search loaded notices" placeholder="Search loaded notices" value="'+esc(noticeState.q)+'"><a class="pp-btn sm" href="'+SITE+'/category/notices" target="_blank" rel="noopener noreferrer">'+ic("ext")+' Official site</a></div>'+(snap?'<section class="pp-card sd-notice-provenance"><b>Saved official snapshot · not a live refresh</b><p>Fetched '+esc(new Date(window.StudentDeskPublicSnapshot.checked).toLocaleString())+'. This saved copy may be outdated. A live refresh requires the official site to respond.</p>'+noticeSyncHtml('/category/notices?pageNo=1&pageSize=20')+'</section>':synced?'<p class="pp-note">Showing notices synced from an official-site tab. Refresh after syncing for new updates.</p>':'')+(failed?noticeUnavailable("/category/notices",(pages.filter(function(pg){return pg.unavailable;})[0]||{}).error):"")+(all.length?'<section class="pp-card pp-bulletin"><div class="pp-bulletin-label"><span>Latest updates</span><span id="pp-notice-count">'+list.length+' of '+all.length+'</span></div><div class="pp-list" id="pp-notice-list">'+(noticeRows(list)||'<div class="pp-empty">No matching notices</div>')+'</div>'+(noticeState.pages<last?'<button type="button" class="pp-btn" id="pp-nmore">Load older notices</button>':'')+'</section>':"")+'</div>';
    });
  };
  VIEWS.notices.after=function(){
    var q=$("#pp-nq",app),tmr;if(q)q.oninput=function(){clearTimeout(tmr);var value=q.value;tmr=setTimeout(function(){if(!q.isConnected)return;noticeState.q=value;var items=noticeState.items||[],list=filteredNotices(items,value),box=$("#pp-notice-list",app),count=$("#pp-notice-count",app);if(box)box.innerHTML=noticeRows(list)||'<div class="pp-empty">No matching notices</div>';if(count)count.textContent=list.length+' of '+items.length;},100);};
    var m=$("#pp-nmore",app);if(m)m.onclick=function(){m.disabled=true;noticeState.pages++;route();};
  };
  function cleanHtml(html) {
    var d = new DOMParser().parseFromString("<div>" + html + "</div>", "text/html"), root = d.body.firstChild;
    var OK = /^(P|BR|B|STRONG|I|EM|U|UL|OL|LI|A|IMG|TABLE|THEAD|TBODY|TR|TD|TH|H1|H2|H3|H4|H5|H6|SPAN|DIV|BLOCKQUOTE|HR|SUP|SUB|CENTER|FONT)$/;
    (function walk(el) { Array.prototype.slice.call(el.children).forEach(function (c) {
      if (!OK.test(c.tagName)) { if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|FORM|INPUT|BUTTON|LINK|META)$/.test(c.tagName)) { c.remove(); return; } var f = d.createDocumentFragment(); while (c.firstChild) f.appendChild(c.firstChild); c.replaceWith(f); walk(el); return; }
      Array.prototype.slice.call(c.attributes).forEach(function (at) { var n = at.name.toLowerCase(); if (!((n === "href" && c.tagName === "A") || (n === "src" && c.tagName === "IMG") || n === "colspan" || n === "rowspan" || n === "alt")) c.removeAttribute(at.name); });
      if (c.tagName === "A") { var h = c.getAttribute("href") || ""; try { var target = new URL(h,SITE); if (!/^(https?:|mailto:)$/.test(target.protocol)) c.removeAttribute("href"); else c.setAttribute("href",target.href); } catch(e) { c.removeAttribute("href"); } c.setAttribute("target","_blank"); c.setAttribute("rel","noopener noreferrer"); }
      if (c.tagName === "IMG") { var sr = c.getAttribute("src") || ""; if (sr.charAt(0) === "/") c.setAttribute("src", SITE + sr); else if (!/^https:/i.test(sr)) c.remove(); c.setAttribute("loading", "lazy"); }
      walk(c); }); })(root);
    $$("p, div, span", root).reverse().forEach(function (e) { if (!e.textContent.replace(/\s|\u00a0/g, "") && !e.querySelector("img")) e.remove(); });
    return root.innerHTML;
  }
  VIEWS.notice = function (p, force) {
    var u = p.u || ""; if (!/^\/[\w\-\/%.]+$/.test(u)) return Promise.resolve('<div class="pp-view"><div class="pp-card pp-empty">Invalid notice link</div></div>');
    setHead("Notice", '<a href="#/notices">← All notices</a>');
    var key = "notice:" + u, c = mem[key] || (cacheRaw(key) || {}).d;
    var pr = c && !force ? Promise.resolve(c) : noticeAccess(u, function (h) {
      var d = new DOMParser().parseFromString(h, "text/html"), t = txt($("#dynamicHeading", d)) || txt($("h1", d)), cols = $$(".col-md-8 .question-column", d), body = cols.length > 1 ? cols[1].innerHTML : (cols[0] ? cols[0].innerHTML : "");
      var db = $(".date-box", d), date = db ? txt(db).replace(/\s+/g, " ") : "";
      if(!t || !body)throw new Error("Notice content unavailable");return {title:t,date:date,body:cleanHtml(body)};}).then(function(v){mem[key]=v;cacheSet(key,v);return v;});
    return pr.then(function (n) {
      return '<div class="pp-view pp-ndetail"><div class="pp-card"><div class="pp-chip mute" style="margin-bottom:10px">' + ic("cal") + " " + esc(n.date) + '</div><h2 class="pp-ntitle">' + esc(n.title) + '</h2><div class="pp-nbody">' + (n.body || "<p>(No text — open on aiub.edu)</p>") + '</div><div class="pp-row" style="margin-top:18px"><a class="pp-btn" href="#/notices">← All notices</a><a class="pp-btn pri" target="_blank" rel="noopener" href="' + SITE + esc(u) + '">' + ic("ext") + " Open on aiub.edu</a></div></div></div>";
    }).catch(function (error) { return '<div class="pp-view pp-notices"><a class="pp-btn sm" href="#/notices">← All notices</a>' + noticeUnavailable(u,error&&error.message) + '</div>'; });
  };

  /* CGPA privacy: every CGPA is blurred until tapped; tap again to blur it. Resets when you change page. */
  function cgB(v, tag) { tag = tag || "span"; return "<" + tag + ' class="pp-cgb" role="button" tabindex="0" title="Tap to show / hide CGPA">' + v + "</" + tag + ">"; }
  function cgWire() {
    if (cgWire.on || !app) return; cgWire.on = 1;
    function tg(e) { var b = e.target.closest && e.target.closest(".pp-cgb"); if (!b || !app.contains(b)) return; if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return; e.preventDefault(); e.stopPropagation(); app.classList.toggle("pp-cgon"); }
    app.addEventListener("click", tg, true); app.addEventListener("keydown", tg, true);
  }
  function stat(c, i, k, v, s) { return '<div class="pp-card pp-stat"><span class="pp-ic ' + c + '">' + ic(i) + "</span><small>" + k + "</small><b>" + v + "</b><span>" + s + "</span></div>"; }
  function progressBar(core) {
    var n = core.length || 1, d = core.filter(function (c) { return c.status === "done"; }).length, r = core.filter(function (c) { return c.status === "running"; }).length, t = core.filter(function (c) { return c.status === "retake"; }).length, rem = n - d - r - t;
    function pc(x) { return (x / n * 100).toFixed(1) + "%"; }
    return '<div class="pp-row" style="justify-content:space-between;margin-bottom:10px"><b style="font-size:22px">' + Math.round(d / n * 100) + '% complete</b><span class="pp-chip mute">' + d + " / " + n + " core courses</span></div>" +
      '<div class="pp-progress"><i style="width:' + pc(d) + ';background:linear-gradient(90deg,#10b981,#22d3ee)"></i><i style="width:' + pc(r) + ';background:var(--ap-accent)"></i><i style="width:' + pc(t) + ';background:#f43f5e"></i></div>' +
      '<div class="pp-legend"><span><i style="background:#10b981"></i>Completed ' + d + '</span><span><i style="background:var(--ap-accent)"></i>Running ' + r + '</span><span><i style="background:#f43f5e"></i>Retake ' + t + '</span><span><i style="background:rgba(127,127,127,.3)"></i>Remaining ' + rem + "</span></div>";
  }

  /* ---------- schedule ---------- */
  var schedState = { day: null, view: "day" };
  VIEWS.schedule = function (p, f) {
    if (p.view) schedState.view = p.view;
    return D.reg(f).then(function (reg) {
      var slots = weekly(reg); tickData = slots;
      var used = DAYS.filter(function (d) { return slots.some(function (s) { return s.day === d; }); });
      var tk = todayKey(); if (!schedState.day) schedState.day = tk;
      var mins = slots.reduce(function (a, s) { return a + (s.end - s.start); }, 0);
      setHead("Class Routine", esc(reg.semester) + " · " + slots.length + " classes · " + dur(mins) + " per week",
        '<div class="pp-tabs" style="margin:0"><button data-sv="day" class="' + (schedState.view === "day" ? "on" : "") + '">Day</button><button data-sv="week" class="' + (schedState.view === "week" ? "on" : "") + '">Week</button><button data-sv="free" class="' + (schedState.view === "free" ? "on" : "") + '">Free time</button><button data-sv="exams" class="' + (schedState.view === "exams" ? "on" : "") + '">Exams' + (examUpcoming().length ? ' <span class="pp-n">' + examUpcoming().length + "</span>" : "") + "</button></div>");
      var h = '<div class="pp-view">';
      if (schedState.view === "week") h += weekGrid(slots, used);
      else if (schedState.view === "free") h += freeView(slots);
      else if (schedState.view === "exams") h += examView();
      else {
        h += '<div class="pp-days">' + DAYS.map(function (d) { var n = slots.filter(function (s) { return s.day === d; }).length;
          return '<button class="pp-day' + (d === schedState.day ? " on" : "") + (d === tk ? " today" : "") + '" data-day="' + d + '"><small>' + (d === tk ? "Today" : d) + "</small><b>" + d + '</b><div class="pp-pips">' + new Array(n + 1).join("<i></i>") + "</div></button>"; }).join("") + "</div>";
        h += '<div id="pp-dayview">' + dayView(slots, schedState.day) + "</div>";
      }
      return h + "</div>";
    });
  };
  VIEWS.schedule.after = function () {
    if (schedState.view === "exams") examLoad().then(function () { if (current === "schedule" && schedState.view === "exams") { var c = $("#pp-scroll .pp-view", app); if (c) c.innerHTML = examView(); } }, function () {});
    $$("[data-sv]", app).forEach(function (b) { b.onclick = function () { schedState.view = b.getAttribute("data-sv"); route(); }; });
    $$(".pp-day", app).forEach(function (b) { b.onclick = function () { schedState.day = b.getAttribute("data-day"); $$(".pp-day", app).forEach(function (x) { x.classList.toggle("on", x === b); }); D.reg().then(function (reg) { var dv = $("#pp-dayview", app); dv.innerHTML = '<div class="pp-view">' + dayView(weekly(reg), schedState.day) + "</div>"; }); }; });
    var nl = $(".pp-nowline", app); if (nl) nl.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  function dayView(slots, day) {
    var ds = daySlots(slots, day), isToday = day === todayKey(), n = nowMin();
    if (!ds.length) return '<div class="pp-card pp-off"><span class="pp-em">🏖️</span><h3 style="justify-content:center;margin:10px 0 4px">' + DAYFULL[day] + " — Off day!</h3><p style=\"color:var(--ap-muted)\">No classes on this day. Rest, study, or go out 😎</p></div>";
    var classMin = 0, gapMin = 0, gaps = 0;
    var tl = ds.map(function (s, i) {
      classMin += s.end - s.start; var g = "";
      if (i > 0) { var gm = s.start - ds[i - 1].end; if (gm > 0) { gapMin += gm; gaps++; g = '<div class="pp-slot" style="--cc:transparent"><div class="pp-gap' + (gm >= 60 ? " big" : "") + '">' + ic("coffee") + (gm >= 90 ? "Long break — lunch / library time" : gm >= 60 ? "Free time" : "Short break") + " · " + fmtShort(ds[i - 1].end) + "–" + fmtShort(s.start) + '<span class="pp-gl">' + dur(gm) + "</span></div></div>"; } else if (gm < 0) g = '<div class="pp-slot" style="--cc:#ef4444"><div class="pp-gap" style="border-color:#ef4444;color:#ef4444">' + ic("alert") + " Time clash!</div></div>"; }
      var live = isToday && s.start <= n && n < s.end;
      return g + '<div class="pp-slot" style="--cc:' + s.col + '"><div class="pp-time">' + fmtShort(s.start) + "<small>" + fmtShort(s.end) + '</small></div><a class="pp-class' + (live ? " now" : "") + '" href="' + classic(s.href) + '" style="display:block">' + (live ? '<span class="pp-live">LIVE</span>' : "") +
        "<b>" + esc(title(s.name)) + (newRoutineNames()[s.name] ? NEWDOT : "") + ' <span class="pp-chip" style="background:color-mix(in srgb,' + s.col + ' 18%,transparent);color:' + s.col + '">' + esc(s.sec) + "</span></b>" +
        '<div class="pp-meta"><span>' + ic("clock") + fmtT(s.start) + " – " + fmtT(s.end) + "</span><span>" + ic("pin") + "Room " + esc(s.room) + "</span><span>" + ic(s.type === "Lab" ? "flash" : "book") + esc(s.type) + "</span><span>" + dur(s.end - s.start) + "</span></div></a></div>";
    }).join("");
    return '<div class="pp-summary"><div><small>Starts</small><b>' + fmtT(ds[0].start) + '</b></div><div><small>Ends</small><b>' + fmtT(ds[ds.length - 1].end) + '</b></div><div><small>In class</small><b>' + dur(classMin) + '</b></div><div><small>Gaps</small><b>' + (gaps ? dur(gapMin) + " (" + gaps + ")" : "None") + "</b></div></div>" +
      '<div class="pp-card"><div class="pp-tl">' + tl + "</div></div>";
  }
  function weekGrid(slots, used) {
    var days = DAYS.filter(function (d) { return used.indexOf(d) >= 0; }); if (!days.length) return '<div class="pp-card pp-empty"><span class="pp-em">📭</span>No classes found</div>';
    var lo = Math.floor(Math.min.apply(null, slots.map(function (s) { return s.start; })) / 60) * 60, hi = Math.ceil(Math.max.apply(null, slots.map(function (s) { return s.end; })) / 60) * 60;
    var PX = 1.15, H = (hi - lo) * PX, tk = todayKey(), n = nowMin();
    var hours = ""; for (var t = lo; t <= hi; t += 60) hours += '<div style="top:' + ((t - lo) * PX) + 'px">' + fmtShort(t) + (t < 720 ? "a" : "p") + "</div>";
    var cols = days.map(function (d) { var ds = daySlots(slots, d), b = "";
      ds.forEach(function (s, i) { if (i > 0 && s.start - ds[i - 1].end >= 30) { var gs = ds[i - 1].end, ge = s.start; b += '<div class="pp-gblk" style="top:' + ((gs - lo) * PX + 3) + "px;height:" + ((ge - gs) * PX - 6) + 'px">☕ ' + dur(ge - gs) + " free</div>"; }
        b += '<a class="pp-blk" href="' + classic(s.href) + '" style="--cc:' + s.col + ";top:" + ((s.start - lo) * PX + 2) + "px;height:" + ((s.end - s.start) * PX - 4) + 'px"><b>' + esc(title(s.name)) + "</b><small>" + fmtShort(s.start) + "–" + fmtShort(s.end) + " · " + esc(s.room) + "<br>" + esc(s.type) + "</small></a>"; });
      if (d === tk && n >= lo && n <= hi) b += '<div class="pp-nowline" style="top:' + ((n - lo) * PX) + 'px"></div>';
      return '<div class="pp-col' + (d === tk ? " today" : "") + '" style="height:' + H + 'px">' + b + "</div>"; }).join("");
    var off = DAYS.filter(function (d) { return days.indexOf(d) < 0; });
    return '<div class="pp-card"><div class="pp-week-wrap"><div class="pp-week" style="--days:' + days.length + ";--hh:" + (60 * PX) + 'px"><div></div>' + days.map(function (d) { return '<div class="pp-wh' + (d === tk ? " today" : "") + '">' + d + "</div>"; }).join("") +
      '<div class="pp-hours" style="height:' + H + 'px">' + hours + "</div>" + cols + "</div></div>" +
      (off.length ? '<div class="pp-legend" style="margin-top:14px"><span>🏖️ Off days: <b style="color:var(--ap-text)">' + off.map(function (d) { return DAYFULL[d]; }).join(", ") + "</b></span></div>" : "") + "</div>";
  }
  function freeView(slots) {
    var S0 = 8 * 60, E0 = 17 * 60;
    return '<div class="pp-grid pp-g2">' + DAYS.map(function (d) {
      var ds = daySlots(slots, d), free = [], cur = S0;
      ds.forEach(function (s) { if (s.start > cur) free.push([cur, s.start]); cur = Math.max(cur, s.end); }); if (cur < E0) free.push([cur, E0]);
      var tot = free.reduce(function (a, f) { return a + f[1] - f[0]; }, 0);
      return '<div class="pp-card"><h3>' + (ds.length ? "📚" : "🏖️") + " " + DAYFULL[d] + '<span class="pp-more" style="color:var(--ap-muted)">' + (ds.length ? ds.length + " class · " + dur(tot) + " free" : "Off day") + "</span></h3>" +
        '<div class="pp-progress" style="height:16px;margin-bottom:10px">' + timeline(ds, S0, E0) + "</div>" +
        '<div class="pp-list">' + free.map(function (f) { return '<div class="pp-item" style="padding:9px 12px"><span class="pp-dot" style="background:#10b981"></span><div class="pp-t"><b style="font-size:13.5px">' + fmtT(f[0]) + " – " + fmtT(f[1]) + '</b></div><span class="pp-chip ok">' + dur(f[1] - f[0]) + "</span></div>"; }).join("") + "</div></div>";
    }).join("") + '</div><p class="pp-note">Free time is counted between 8:00 AM and 5:00 PM. Green = free, colored = class.</p>';
  }
  function timeline(ds, a, b) { var h = "", cur = a; ds.forEach(function (s) { var st = Math.max(a, s.start), en = Math.min(b, s.end); if (st > cur) h += '<i style="width:' + ((st - cur) / (b - a) * 100) + '%;background:rgba(16,185,129,.35)"></i>'; if (en > st) h += '<i title="' + esc(s.name) + '" style="width:' + ((en - st) / (b - a) * 100) + "%;background:" + s.col + '"></i>'; cur = Math.max(cur, en); }); if (cur < b) h += '<i style="width:' + ((b - cur) / (b - a) * 100) + '%;background:rgba(16,185,129,.35)"></i>'; return h; }

  /* ---------- courses ---------- */
  var courseState = { tab: "done", q: "", mine: true, show: 40 };
  function gchip(g) { if (!g) return ""; var c = g.charAt(0); var cls = c === "A" ? "ap-g-a" : c === "B" ? "ap-g-b" : c === "C" ? "ap-g-c" : c === "D" ? "ap-g-d" : c === "F" ? "ap-g-f" : "ap-g-x"; return '<span class="ap-grade ' + cls + '">' + esc(g) + "</span>"; }
  function matchOffered(name, list) {
    var n = norm(name); if (n.length < 4) return [];
    return list.filter(function (o) { var on = norm(o.name); return on === n || (n.length >= 12 && (on.indexOf(n) === 0 || n.indexOf(on) === 0)) || (on.length >= 12 && n.replace(/SYS$/, "SYSTEM") === on); });
  }
  function clashes(times, slots) { var c = []; times.forEach(function (t) { slots.forEach(function (s) { if (s.day === t.day && t.start < s.end && s.start < t.end) c.push(s); }); }); return c; }
  function secRows(secs, slots, limit) {
    return '<div class="pp-sec">' + secs.slice(0, limit || 8).map(function (o) { var left = o.cap - o.cnt, cl = slots ? clashes(o.times, slots) : [];
      return '<div class="pp-secrow"><span class="pp-chip">' + esc(o.sec) + '</span><div class="pp-times">' + o.times.map(function (t) { return "<b>" + t.day + "</b> " + fmtShort(t.start) + "–" + fmtShort(t.end) + " · " + esc(t.room) + (t.type === "Lab" ? " (Lab)" : ""); }).join("<br>") +
        (cl.length ? '<br><span style="color:#ef4444;font-weight:600">⚠ Clash: ' + esc(title(cl[0].name)) + "</span>" : "") + '</div><span class="pp-seat" style="color:' + (left <= 0 ? "#ef4444" : left < 6 ? "#f59e0b" : "#10b981") + '">' + (left <= 0 ? "Full" : left + " seats") + "</span></div>"; }).join("") +
      (secs.length > (limit || 8) ? '<div style="font-size:12.5px;color:var(--ap-muted);padding:4px 8px">+ ' + (secs.length - (limit || 8)) + " more sections</div>" : "") + "</div>";
  }
  VIEWS.courses = function (p, f) {
    if (p.tab) courseState.tab = p.tab;
    return D.curr(f).then(function (cur) {
      var all = cur.core.concat(cur.elective.filter(function (c) { return c.status !== "remaining"; }));
      var done = all.filter(function (c) { return c.status === "done"; }), run = all.filter(function (c) { return c.status === "running"; });
      var retake = all.filter(function (c) { return c.status === "retake"; }), rem = cur.core.filter(function (c) { return c.status === "remaining"; }).concat(retake);
      var elec = cur.elective.filter(function (c) { return c.status === "remaining"; });
      setHead("Courses", done.length + " completed · " + run.length + " running · " + rem.length + " remaining");
      var tabs = [["done", "Completed", done.length], ["running", "Running", run.length], ["remaining", "Remaining", rem.length], ["offered", "Offered for me", ""], ["all", "All offered", ""], ["elective", "Electives", elec.length]];
      var h = '<div class="pp-view"><div class="pp-card" style="margin-bottom:16px">' + progressBar(cur.core) + "</div>" +
        '<div class="pp-tabs">' + tabs.map(function (t) { return '<button data-ct="' + t[0] + '" class="' + (courseState.tab === t[0] ? "on" : "") + '">' + t[1] + (t[2] !== "" ? ' <span class="pp-n">' + t[2] + "</span>" : "") + "</button>"; }).join("") + "</div><div id=\"pp-ctab\">";
      var bySem = function (list, right) { var g = {}; list.forEach(function (c) { (g[c.sem || "-"] = g[c.sem || "-"] || []).push(c); });
        return Object.keys(g).map(function (s) { return '<div class="pp-sem-h">' + (s === "-" ? "Elective" : "Semester " + s) + '</div><div class="pp-list">' + g[s].map(function (c) { return '<div class="pp-course"><span class="pp-code">' + esc(c.code) + '</span><div class="pp-t"><b>' + esc(title(c.name)) + (c.status !== "remaining" && isNewSig("courses", c.code + "|" + c.status + "|" + c.grade) ? NEWDOT : "") + "</b><small>" + right(c) + "</small></div>" + (c.status === "done" || c.status === "retake" ? gchip(c.grade) : c.status === "running" ? '<span class="pp-chip">Running</span>' : '<span class="pp-chip mute">Not taken</span>') + "</div>"; }).join("") + "</div>"; }).join(""); };
      if (courseState.tab === "done") h += done.length ? bySem(done, function (c) { return esc(c.when) + (c.tries.length > 1 ? " · " + c.tries.length + " attempts" : ""); }) : '<div class="pp-card pp-empty"><span class="pp-em">📘</span>No completed courses yet</div>';
      else if (courseState.tab === "running") h += bySem(run, function (c) { return esc(c.when) + " · result pending"; });
      else if (courseState.tab === "remaining") h += '<p class="pp-note" style="margin-bottom:6px">🔴 Retake = courses with F/W. The rest haven\'t been taken yet. Check "Offered for me" to see which sections have seats.</p>' + bySem(rem, function (c) { return c.status === "retake" ? "Retake needed · last " + esc(c.when) + " [" + esc(c.grade) + "]" : "Curriculum semester " + esc(c.sem); });
      else if (courseState.tab === "elective") h += bySem(elec, function () { return "Elective option"; });
      else h += '<div class="pp-card"><div class="pp-sk" style="height:200px"></div><p class="pp-note" style="margin-top:10px">Loading offered sections (large list, this may take a moment)…</p></div>';
      return h + "</div></div>";
    });
  };
  VIEWS.courses.after = function () {
    $$("[data-ct]", app).forEach(function (b) { b.onclick = function () { courseState.tab = b.getAttribute("data-ct"); courseState.show = 40; route(); }; });
    if (courseState.tab === "offered" || courseState.tab === "all") {
      Promise.all([D.offered(), D.curr(), D.reg().catch(function () { return { courses: [] }; })]).then(function (r) {
        var off = r[0], cur = r[1], slots = weekly(r[2]); var box = $("#pp-ctab", app); if (!box) return;
        if (courseState.tab === "offered") {
          var need = cur.core.filter(function (c) { return c.status === "remaining" || c.status === "retake"; }).concat(cur.elective.filter(function (c) { return c.status === "remaining"; }));
          var hits = need.map(function (c) { return { c: c, secs: matchOffered(c.name, off.list) }; }).filter(function (x) { return x.secs.length; });
          var miss = need.length - hits.length;
          box.innerHTML = '<div class="pp-view"><p class="pp-note" style="margin-bottom:12px">📋 ' + esc(off.title) + " — <b>" + hits.length + "</b> of your remaining courses are offered" + (miss ? " (" + miss + " not offered this semester)" : "") + ". Seats and clashes with your routine are shown.</p>" +
            '<div class="pp-grid pp-g2">' + hits.map(function (x) { var open = x.secs.filter(function (o) { return o.cap - o.cnt > 0; }).length;
              return '<div class="pp-card"><h3 style="margin-bottom:4px">' + esc(title(x.c.name)) + '</h3><div class="pp-row" style="margin-bottom:6px"><span class="pp-chip mute">' + esc(x.c.code) + "</span>" + (x.c.status === "retake" ? '<span class="pp-chip bad">Retake</span>' : x.c.sem ? '<span class="pp-chip">Sem ' + esc(x.c.sem) + "</span>" : '<span class="pp-chip warn">Elective</span>') + '<span class="pp-chip ' + (open ? "ok" : "bad") + '">' + open + "/" + x.secs.length + " open</span></div>" + secRows(x.secs.sort(function (a, b) { return (b.cap - b.cnt) - (a.cap - a.cnt); }), slots, 6) + "</div>"; }).join("") + "</div>" +
            (hits.length ? "" : '<div class="pp-card pp-empty"><span class="pp-em">🔍</span>None of your remaining courses are in the offered list right now</div>') + "</div>";
        } else {
          var render = function () {
            var q = norm(courseState.q), list = off.list.filter(function (o) { return !q || norm(o.name).indexOf(q) >= 0 || o.id.indexOf(courseState.q) >= 0; });
            var g = {}; list.forEach(function (o) { (g[o.name] = g[o.name] || []).push(o); }); var names = Object.keys(g);
            $("#pp-offlist", app).innerHTML = names.slice(0, courseState.show).map(function (nm) { return '<div class="pp-card" style="margin-bottom:12px"><h3 style="margin-bottom:6px">' + esc(title(nm)) + '<span class="pp-more" style="color:var(--ap-muted)">' + g[nm].length + " sections</span></h3>" + secRows(g[nm], slots, 5) + "</div>"; }).join("") +
              (names.length > courseState.show ? '<button class="pp-btn" id="pp-moreoff" style="width:100%">Show more (' + (names.length - courseState.show) + ")</button>" : "") + (names.length ? "" : '<div class="pp-card pp-empty">Nothing found</div>');
            var mb = $("#pp-moreoff", app); if (mb) mb.onclick = function () { courseState.show += 40; render(); };
          };
          box.innerHTML = '<div class="pp-view"><div class="pp-search" style="margin-bottom:14px">' + ic("search") + '<input class="pp-input" id="pp-offq" placeholder="Search ' + off.list.length + ' offered sections — course name or class ID…" value="' + esc(courseState.q) + '"></div><div id="pp-offlist"></div></div>';
          var inp = $("#pp-offq", app), t; inp.oninput = function () { clearTimeout(t); t = setTimeout(function () { courseState.q = inp.value; courseState.show = 40; render(); }, 180); };
          render();
        }
      }).catch(function (e) { var box = $("#pp-ctab", app); if (box) box.innerHTML = failView(e); });
    }
  };

  /* ---------- grades ---------- */
  VIEWS.grades = function (p, f) {
    return Promise.all([D.sem(f), D.curr(f).catch(function () { return { info: {} }; })]).then(function (r) {
      var sem = r[0], info = r[1].info || {}; var sems = sem.sems.filter(function (s) { return s.cgpa != null && s.courses.length; });
      var cg = info["Cgpa"] || (sems.length ? sems[sems.length - 1].cgpa.toFixed(2) : "—");
      setHead("Grades & CGPA", "CGPA " + cgB(cg) + " · " + (info["Credit(s) Completed"] || "") + " credits");
      var dist = {}; ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F", "W"].forEach(function (g) { dist[g] = 0; });
      sem.sems.forEach(function (s) { s.courses.forEach(function (c) { if (dist[c.g] != null) dist[c.g]++; }); });
      var mx = Math.max.apply(null, Object.keys(dist).map(function (k) { return dist[k]; }).concat([1]));
      var colors = { "A+": "#10b981", "A": "#22c55e", "B+": "#3b82f6", "B": "#6366f1", "C+": "#f59e0b", "C": "#f97316", "D+": "#fb7185", "D": "#f43f5e", "F": "#dc2626", "W": "#94a3b8" };
      var best = sems.slice().sort(function (a, b) { return b.gpa - a.gpa; })[0];
      var h = '<div class="pp-view"><div class="pp-grid pp-g4">' + stat("pp-c1", "award", "CGPA", cgB(cg), "Current · tap to show") + stat("pp-c2", "check", "Credits", info["Credit(s) Completed"] || "—", (info["Course(s) Completed"] || "") + " courses") +
        stat("pp-c3", "flash", "Best semester", best ? best.gpa.toFixed(2) : "—", best ? esc(best.name) : "") + stat("pp-c4", "cal", "Semesters", sems.length, "with results") + "</div>" +
        '<div class="pp-grid pp-g-21"><div class="pp-card"><h3>' + ic("award") + " CGPA trend</h3>" + cgB(chart(sems), "div") + '<div class="pp-legend"><span><i style="background:var(--ap-accent)"></i>CGPA</span><span><i style="background:rgba(var(--ap-accent2-rgb),.35)"></i>Semester GPA</span></div></div>' +
        '<div class="pp-card"><h3>' + ic("list") + ' Grade distribution</h3><div class="pp-dist">' + Object.keys(dist).map(function (g, i) { return '<div><span>' + dist[g] + '</span><i style="height:' + Math.max(4, dist[g] / mx * 100) + "%;background:" + colors[g] + ";animation-delay:" + (i * .05) + 's"></i>' + g + "</div>"; }).join("") + "</div></div></div>" +
        calcCard(num(cg), num(info["Credit(s) Completed"])) +
        sem.sems.slice().reverse().map(function (s) { if (!s.courses.length) return "";
          return '<div class="pp-card" style="margin-bottom:14px"><h3>' + esc(s.name) + '<span class="pp-more" style="color:var(--ap-muted)">' + (s.gpa != null ? 'GPA <b style="color:var(--ap-text)">' + s.gpa.toFixed(2) + '</b> · CGPA <b style="color:var(--ap-text)">' + cgB(s.cgpa.toFixed(2)) + "</b>" : "In progress") + '</span></h3><div class="pp-list">' +
            s.courses.map(function (c) { return '<div class="pp-course" style="padding:11px 14px"><span class="pp-code">' + esc(c.id) + '</span><div class="pp-t"><b>' + esc(title(c.name)) + (c.g && c.g !== "-" && isNewSig("grades", s.name + "|" + c.id + "|" + c.g) ? NEWDOT : "") + "</b><small>" + c.cr + " credit" + (c.mid ? " · Mid " + esc(c.mid) : "") + (c.fin ? " · Final " + esc(c.fin) : "") + "</small></div>" + (c.g ? gchip(c.g) : '<span class="pp-chip mute">—</span>') + "</div>"; }).join("") + "</div></div>"; }).join("") + "</div>";
      return h;
    });
  };
  VIEWS.grades.after = function () { cgWire(); calcWire(); };
  function chart(sems) {
    if (sems.length < 1) return '<div class="pp-empty">No data yet</div>';
    var W = 640, H = 220, pl = 34, pr = 14, pt = 16, pb = 34, lo = 2, hi = 4;
    var xs = function (i) { return pl + (sems.length === 1 ? (W - pl - pr) / 2 : i * (W - pl - pr) / (sems.length - 1)); }, ys = function (v) { return pt + (hi - Math.max(lo, Math.min(hi, v))) / (hi - lo) * (H - pt - pb); };
    var pts = sems.map(function (s, i) { return [xs(i), ys(s.cgpa)]; }), d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var grid = [2, 2.5, 3, 3.5, 4].map(function (v) { return '<line class="gl" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + ys(v) + '" y2="' + ys(v) + '"/><text x="4" y="' + (ys(v) + 4) + '">' + v.toFixed(1) + "</text>"; }).join("");
    var bw = Math.min(26, (W - pl - pr) / sems.length * .5);
    var bars = sems.map(function (s, i) { return '<rect class="bar" rx="5" x="' + (xs(i) - bw / 2) + '" y="' + ys(s.gpa) + '" width="' + bw + '" height="' + (H - pb - ys(s.gpa)) + '"><title>GPA ' + s.gpa + "</title></rect>"; }).join("");
    var labels = sems.map(function (s, i) { var m = /(\d{4})-(\d{4}),\s*(\w+)/.exec(s.name); return '<text text-anchor="middle" x="' + xs(i) + '" y="' + (H - 12) + '">' + (m ? m[3].slice(0, 3) + " '" + m[2].slice(2) : esc(s.name)) + "</text>"; }).join("");
    return '<svg class="pp-chart" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none"><defs><linearGradient id="ppgrad" x1="0" x2="1"><stop offset="0" stop-color="var(--ap-accent)"/><stop offset="1" stop-color="var(--ap-accent2)"/></linearGradient><linearGradient id="ppfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--ap-accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--ap-accent)" stop-opacity="0"/></linearGradient></defs>' +
      grid + bars + '<path class="ar" d="' + d + " L" + pts[pts.length - 1][0] + " " + (H - pb) + " L" + pts[0][0] + " " + (H - pb) + ' Z"/><path class="ln" d="' + d + '"/>' + pts.map(function (p, i) { return '<circle class="pt" r="5" cx="' + p[0] + '" cy="' + p[1] + '"><title>' + esc(sems[i].name) + ": CGPA " + sems[i].cgpa + "</title></circle>"; }).join("") + labels + "</svg>";
  }
  function calcCard(cg, cr) {
    return '<div class="pp-card" style="margin-bottom:16px" id="pp-calc" data-cg="' + cg + '" data-cr="' + cr + '"><h3>' + ic("flash") + ' What-if CGPA calculator<span class="pp-more" style="color:var(--ap-muted)">Enter expected grades to see your new CGPA</span></h3>' +
      '<div class="pp-grid pp-g-21" style="margin:0"><div><div class="pp-calc-row" style="font-size:12px;color:var(--ap-muted);font-weight:700"><span>COURSE</span><span>CREDIT</span><span>GRADE</span><span></span></div><div id="pp-calc-rows"></div><button class="pp-btn sm" id="pp-calc-add">' + ic("plus") + ' Add course</button></div>' +
      '<div style="text-align:center;align-self:center"><div style="color:var(--ap-muted);font-weight:600;font-size:13px">Projected CGPA</div><div class="pp-big pp-cgb" role="button" tabindex="0" title="Tap to show / hide CGPA" id="pp-calc-out">' + (cg ? cg.toFixed(2) : "—") + '</div><div id="pp-calc-diff" style="font-weight:700"></div><div style="color:var(--ap-muted);font-size:12px;margin-top:6px">Current ' + cgB(cg.toFixed(2)) + " · " + cr + " credits</div></div></div></div>";
  }
  function calcWire() {
    var box = $("#pp-calc", app); if (!box) return; var rows = $("#pp-calc-rows", box), cg = +box.dataset.cg, cr = +box.dataset.cr;
    var opts = Object.keys(GP).map(function (g) { return '<option value="' + g + '">' + g + " (" + GP[g].toFixed(2) + ")</option>"; }).join("");
    function add(name, c) { var d = document.createElement("div"); d.className = "pp-calc-row"; d.innerHTML = '<input class="pp-input" value="' + esc(name || "") + '" placeholder="Course"><input class="pp-input" type="number" min="0" max="6" step="1" value="' + (c || 3) + '"><select class="pp-input">' + opts + '</select><button class="pp-iconbtn" title="Remove">' + ic("x") + "</button>"; rows.appendChild(d); $("select", d).value = "B"; $("button", d).onclick = function () { d.remove(); calc(); }; $$("input,select", d).forEach(function (x) { x.oninput = calc; }); }
    function calc() { var pts = cg * cr, c = cr; $$(".pp-calc-row", rows).forEach(function (r) { var k = $$("input", r)[1].value * 1 || 0, g = $("select", r).value; pts += k * GP[g]; c += k; });
      var v = c ? pts / c : 0; $("#pp-calc-out", box).textContent = v.toFixed(2); var df = v - cg; $("#pp-calc-diff", box).innerHTML = '<span style="color:' + (df >= 0 ? "#10b981" : "#ef4444") + '">' + (df >= 0 ? "▲ +" : "▼ ") + df.toFixed(2) + "</span>"; }
    $("#pp-calc-add", box).onclick = function () { add("", 3); calc(); };
    D.reg().then(function (reg) { reg.courses.forEach(function (c) { add(title(c.name), 3); }); calc(); }).catch(function () { add("", 3); calc(); });
  }

  /* ---------- finance ---------- */
  function pdate(s) { var t = Date.parse(String(s).replace(/-/g, " ")); return isNaN(t) ? 0 : t; }
  VIEWS.finance = function (p, f) {
    return Promise.all([D.reg(f), D.acc(f).catch(function () { return { rows: [] }; })]).then(function (r) {
      var reg = r[0], acc = r[1], fee = {}; reg.fees.forEach(function (x) { fee[x.k] = x.v; });
      var net = fee["Net Total"] != null ? fee["Net Total"] : fee["Total"] || 0, paid = fee["Amount Paid"] || 0, bal = fee["Balance"] != null ? fee["Balance"] : net - paid;
      var pc = net ? Math.min(100, Math.round(paid / net * 100)) : 0;
      var rows = acc.rows.slice().sort(function (a, b) { return pdate(b.date) - pdate(a.date); });
      var totPaid = acc.rows.reduce(function (a, x) { return a + x.cr; }, 0), totFee = acc.rows.reduce(function (a, x) { return a + x.dr; }, 0);
      setHead("Financials", esc(reg.semester) + " · " + (bal > 0 ? "৳" + money(bal) + " due" : "All clear ✅"));
      return '<div class="pp-view"><div class="pp-grid pp-g-21"><div class="pp-card"><h3>' + ic("wallet") + " " + esc(reg.semester) + ' assessment</h3><div class="pp-row" style="gap:24px;flex-wrap:nowrap"><div class="pp-ring" style="--p:' + pc + '"><span>' + pc + "%<small>paid</small></span></div>" +
        '<div style="flex:1;display:grid;gap:10px"><div class="pp-item"><div class="pp-t"><small>Net total</small><b class="pp-money">৳' + money(net) + '</b></div></div><div class="pp-item"><div class="pp-t"><small>Paid</small><b class="pp-money" style="color:#10b981">৳' + money(paid) + '</b></div></div><div class="pp-item"><div class="pp-t"><small>Balance due</small><b class="pp-money" style="color:' + (bal > 0 ? "#f43f5e" : "#10b981") + '">৳' + money(bal) + "</b></div></div></div></div></div>" +
        '<div class="pp-card"><h3>' + ic("list") + ' Fee breakdown</h3><div class="pp-list">' + reg.fees.filter(function (x) { return x.v && !/total|balance|paid/i.test(x.k); }).map(function (x) { return '<div class="pp-item" style="padding:9px 12px"><div class="pp-t"><b style="font-size:13.5px">' + esc(x.k) + '</b></div><span class="pp-money">৳' + money(x.v) + "</span></div>"; }).join("") + "</div></div></div>" +
        '<div class="pp-grid pp-g3">' + stat("pp-c4", "wallet", "Total billed", "৳" + money(totFee), "All semesters") + stat("pp-c2", "check", "Total paid", "৳" + money(totPaid), acc.rows.filter(function (x) { return x.cr; }).length + " payments") + stat("pp-c1", "clock", "Ledger balance", rows.length ? "৳" + money(acc.rows[acc.rows.length - 1].bal) : "—", "As per accounts") + "</div>" +
        '<div class="pp-card"><h3>' + ic("list") + ' Transactions<a class="pp-more" href="' + classic(L("Financials") || "/Student") + '">Classic →</a></h3><div class="pp-list">' +
        (rows.length ? rows.map(function (x) { var pay = x.cr > 0; return '<div class="pp-tx"><small>' + esc(x.date) + "</small><div><b>" + esc(x.what.replace(/^\*+/, "")) + (isNewSig("finance", x.date + "|" + x.what + "|" + x.dr + "|" + x.cr) ? NEWDOT : "") + "</b><br><small>Balance ৳" + money(x.bal) + '</small></div><span class="pp-chip ' + (pay ? "ok" : "warn") + '">' + (pay ? "+ ৳" + money(x.cr) : "৳" + money(x.dr)) + "</span></div>"; }).join("") : '<div class="pp-empty">No transactions</div>') + "</div></div></div>";
    });
  };

  /* ---------- mail ---------- */
  var mailState = { tab: "portal", box: 0 };
  function jdate(v) { if (!v) return "";try{var m=/\/Date\((\d+)/.exec(v),d=m?new Date(+m[1]):new Date(v);if(isNaN(d.getTime()))return String(v);try{return d.toLocaleString("en-GB",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"});}catch(e){return d.toISOString().slice(0,16).replace("T"," ");}}catch(e){return String(v||"");} }
  function pickDate(o) { for (var k in o) if (/date|time|sent|created/i.test(k) && o[k] && typeof o[k] === "string") return jdate(o[k]); return ""; }
  VIEWS.mail = function (p, force) {
    if (p.tab) mailState.tab = p.tab;
    setHead("Mail", "AIUB portal mailbox and your Outlook student account");
    var tabs = '<div class="pp-tabs"><button data-mt="portal" class="' + (mailState.tab === "portal" ? "on" : "") + '">' + ic("mail") + ' Portal Mail</button><button data-mt="outlook" class="' + (mailState.tab === "outlook" ? "on" : "") + '"><b style="color:#0078d4">O</b> Outlook</button></div>';
    if (mailState.tab === "outlook") {
      return D.home().catch(function () { return {}; }).then(function (home) {
        var saved = localStorage.getItem("pp.olmail") || (home.teams && home.teams.user) || "";
        return '<div class="pp-view">' + tabs + '<div class="pp-grid pp-g2"><div class="pp-card pp-ol"><span class="pp-olg">O</span><h3 style="margin:6px 0 0">Outlook — AIUB student mail</h3><p style="color:var(--ap-muted);margin:0">Inbox of your @student.aiub.edu account</p>' +
          '<input class="pp-input" id="pp-olmail" placeholder="24-xxxxx-x@student.aiub.edu" value="' + esc(saved) + '" style="max-width:360px;text-align:center"><div class="pp-row" style="justify-content:center"><button class="pp-btn pri" id="pp-olopen">' + ic("ext") + ' Open Outlook inbox</button><button class="pp-btn" id="pp-olcal">' + ic("cal") + " Calendar</button></div>" +
          '<div class="pp-note">🔒 You enter your password on Microsoft\'s own sign-in page — StudentDesk never sees or stores it. Microsoft doesn\'t allow Outlook inside other sites, so it opens in a new window. Choose "Stay signed in" once and next time your inbox opens directly.</div></div>' +
          '<div class="pp-card"><h3>' + ic("lock") + " Microsoft Teams / Office login</h3>" + (home.teams ? '<div class="pp-list"><div class="pp-item"><div class="pp-t"><small>User name</small><b>' + esc(home.teams.user) + '</b></div></div><div class="pp-item pp-click" title="Click to show"><div class="pp-t"><small>One-time password (click to show)</small><b class="pp-secret" id="pp-tpass">' + esc(home.teams.pass) + "</b></div></div></div>" : '<div class="pp-empty">Teams info not found</div>') +
          '<div class="pp-row" style="margin-top:14px"><a class="pp-btn" target="_blank" rel="noopener" href="https://teams.microsoft.com/">Teams</a><a class="pp-btn" target="_blank" rel="noopener" href="https://www.office.com/">Office 365</a><a class="pp-btn" target="_blank" rel="noopener" href="https://onedrive.live.com/">OneDrive</a></div></div></div></div>';
      });
    }
    var boxes = ["Inbox", "Sent", "Drafts", "Trash"];
    var mk = "mail" + mailState.box, mc = mem[mk];
    var getList = mc && !force && Date.now() - mc.t < 120e3 ? Promise.resolve(mc.d) : portalJSON("/Message/Email/GetMessageList?boxID=" + mailState.box + "&pageNo=0&pageSize=100").then(mailArray).then(function (d) { mem[mk] = { t: Date.now(), d: d }; if (mailState.box === 0 && Array.isArray(d)) cacheSet("mail0", d.map(function (m) { return String(m.ID); })); return d; });
    return getList.then(function (list) {
      list = Array.isArray(list) ? list : [];
      return '<div class="pp-view">' + tabs + '<div class="pp-mail"><div class="pp-card" style="padding:12px"><div class="pp-tabs" style="width:100%;margin-bottom:10px">' + boxes.map(function (b, i) { return '<button data-mb="' + i + '" class="' + (mailState.box === i ? "on" : "") + '">' + b + "</button>"; }).join("") + '</div><div class="pp-list" id="pp-mlist">' +
        (list.length ? list.map(function (m, i) { var fr = m.From || {}; return '<div class="pp-item pp-click" data-mid="' + esc(m.ID) + '"><span class="pp-avatar" style="width:34px;height:34px;font-size:12px">' + esc(String(fr.Name || "?").trim().charAt(0)) + '</span><div class="pp-t"><b>' + esc(fr.Name || "Unknown") + (mailState.box === 0 && isNewSig("mail", String(m.ID)) ? NEWDOT : "") + "</b><small>" + esc(m.Subject || "(no subject)") + '</small></div><div class="pp-r" style="font-size:11.5px">' + esc(pickDate(m)) + "</div></div>"; }).join("")
          : '<div class="pp-empty"><span class="pp-em">📭</span>' + boxes[mailState.box] + " is empty</div>") +
        '</div></div><div class="pp-card" id="pp-mview"><div class="pp-empty"><span class="pp-em">✉️</span>Select a message</div><div style="text-align:center"><a class="pp-btn" href="' + classic("/Message/Email") + '">' + ic("layers") + " Open portal mailbox (compose)</a></div></div></div></div>";
    }).catch(function(e){
      var session=e&&e.message==="SESSION";
      return '<div class="pp-view">'+tabs+'<div class="pp-card pp-mail-recovery"><span class="pp-qi">'+ic("mail")+'</span><h2>'+(session?'Sign in again to open mail':'Portal mailbox')+'</h2><p>'+esc(session?'Your portal session has expired.':e.message||'Mailbox data could not be read.')+'</p><div class="pp-row"><a class="pp-btn pri" href="'+(session?'/':classic('/Message/Email'))+'">'+(session?'Sign in':'Open original mailbox')+'</a><button type="button" class="pp-btn" data-act="refresh">Retry</button></div><p class="pp-note">Outlook is separate and remains available from the tab above.</p></div></div>';
    });
  };
  VIEWS.mail.after = function () {
    $$("[data-mt]", app).forEach(function (b) { b.onclick = function () { mailState.tab = b.getAttribute("data-mt"); route(); }; });
    $$("[data-mb]", app).forEach(function (b) { b.onclick = function () { mailState.box = +b.getAttribute("data-mb"); route(); }; });
    var tp = $("#pp-tpass", app); if (tp) tp.parentNode.parentNode.onclick = function () { tp.classList.toggle("show"); };
    var om = $("#pp-olmail", app);
    if (om) {
      var url = function (path) { var e = om.value.trim(); if (e) localStorage.setItem("pp.olmail", e); return "https://outlook.office.com/" + path + (e ? "?login_hint=" + encodeURIComponent(e) : ""); };
      var openW = function (u) { var w = Math.min(1200, screen.availWidth - 80), h = Math.min(860, screen.availHeight - 80); var win = window.open(u, "aiub_outlook", "popup=yes,width=" + w + ",height=" + h + ",left=40,top=40"); if (!win) window.open(u, "_blank"); };
      $("#pp-olopen", app).onclick = function () { openW(url("mail/")); };
      $("#pp-olcal", app).onclick = function () { openW(url("calendar/")); };
    }
    $$("[data-mid]", app).forEach(function (it) { it.onclick = function () {
      $$("[data-mid]", app).forEach(function (x) { x.style.outline = x === it ? "2px solid var(--ap-accent)" : ""; });
      var v = $("#pp-mview", app); v.innerHTML = '<div class="pp-sk" style="height:300px"></div>';
      portalJSON("/Message/Email/GetMessageByID?messageID=" + encodeURIComponent(it.getAttribute("data-mid"))).then(function (m) {
        var fr = m.From || {}; v.innerHTML = "<h3>" + esc(m.Subject || "(no subject)") + '</h3><div class="pp-row" style="margin-bottom:12px"><span class="pp-chip">' + esc(fr.Name || "") + '</span><span style="color:var(--ap-muted);font-size:12.5px">' + esc(pickDate(m)) + '</span></div><iframe sandbox="allow-popups allow-popups-to-escape-sandbox" id="pp-mbody"></iframe>';
        var fr2 = $("#pp-mbody", v); fr2.srcdoc = '<base target="_blank"><style>body{font:15px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#1e293b;margin:16px;word-wrap:break-word}img{max-width:100%}</style>' + (m.Body || "");
      }).catch(function () { v.innerHTML = '<div class="pp-empty">Couldn’t load message</div>'; });
    }; });
  };

  /* ---------- more ---------- */
  /* ---------- What's new + update check ----------
     Reads the public file update.json from the GitHub repo (nothing is sent) at most every 6 hours.
     When a newer version exists, More shows the new features and a GitHub update link. */
  var PP_VER = "4.5.1";
  var PP_NEW = [
    "Use clear, product-focused wording across the portal changelog, update notices and release documentation.",
    "Refresh the bundled offline changelog so it matches the corrected public notes.",
    "Retain the refined warm interface, consistent typography, responsive layouts and smooth phone navigation.",
    "Keep the redesigned login, readable routine cards, safe attachment previews and accessibility improvements.",
    "Preserve strict prerequisite checks, saved plans, review drafts and all existing exports and features.",
    "No additional permissions, credential storage or academic rule changes.",
    "This maintenance update does not add new live-portal or physical-device validation; earlier validation limits still apply."
  ];
  var GH_REPO = "https://github.com/amitsami/studentdesk-aiub",
      UPD_URL = "https://raw.githubusercontent.com/amitsami/studentdesk-aiub/main/update.json",
      US_URL = "https://raw.githubusercontent.com/amitsami/studentdesk-aiub/main/userscript/StudentDesk-AIUB.user.js",
      UPD_KEY = "aiubPlus.update", UPD_SEEN = "aiubPlus.update.seen", UPD_LATER = "aiubPlus.update.later", VER_SEEN = "aiubPlus.ver.seen";
  function verCmp(a, b) { a = String(a).split("."); b = String(b).split("."); for (var i = 0; i < Math.max(a.length, b.length); i++) { var d = (+a[i] || 0) - (+b[i] || 0); if (d) return d > 0 ? 1 : -1; } return 0; }
  function isUS() { return typeof GM_info !== "undefined" || typeof GM_xmlhttpRequest === "function" || (typeof GM !== "undefined" && !!GM); }
  /* Installed from a browser store (Edge, Opera, Chrome, Firefox)? Then the store updates StudentDesk by itself. */
  function storeName() {
    try {
      var rt = typeof browser !== "undefined" && browser.runtime && browser.runtime.getManifest ? browser.runtime : typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest ? chrome.runtime : null;
      if (!rt || isUS()) return ""; var m = rt.getManifest() || {}, u = m.update_url || "";
      if (u) return /microsoft|edge/i.test(u) ? "Microsoft Edge Add-ons" : /opera/i.test(u) ? "Opera add-ons" : /google/i.test(u) ? "Chrome Web Store" : "";
      if (typeof browser !== "undefined" && /firefox/i.test(navigator.userAgent)) return "Firefox Add-ons";
    } catch (e) {}
    return "";
  }
  function usLink() {   // Tampermonkey: update from where it was installed (GitHub or Greasy Fork)
    try { var sc = GM_info && GM_info.script, u = sc && (sc.downloadURL || sc.updateURL); if (u && /^https:\/\/[^ ]+\.user\.js(\?|$)/.test(u)) return u; } catch (e) {}
    return US_URL;
  }
  function updNewer() { var c = jget(UPD_KEY, null), d = c && c.d; return d && d.version && verCmp(d.version, PP_VER) > 0 ? d : null; }
  function updN() { var d = updNewer(); return d && jget(UPD_SEEN, "") !== d.version ? 1 : 0; }
  function updGet(force) {
    var c = jget(UPD_KEY, null);
    if (!force && c && c.t && Date.now() - c.t < 36e5) return Promise.resolve(c.d);  // check GitHub at most once an hour
    if (!window.fetch) return Promise.resolve(c && c.d);
    return fetch(UPD_URL + "?t=" + Math.floor(Date.now() / 6e4), { credentials: "omit", cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (d) { if (!d || !d.version) throw new Error("bad"); jset(UPD_KEY, { t: Date.now(), d: d }); return d; })
      .catch(function () { return c && c.d; });
  }
  function updCard() {
    var d = updNewer(), us = isUS(), st = storeName(), c = jget(UPD_KEY, null), rd = c && c.d;
    var notes = d ? (Array.isArray(d.notes) ? d.notes : []) : (rd && rd.version === PP_VER && Array.isArray(rd.notes) && rd.notes.length ? rd.notes : PP_NEW);
    var link = d ? (us ? usLink() : (d.release || GH_REPO + "/releases/latest")) : GH_REPO + "/releases/latest";
    var head = d ? ic("spark") + " Update available" + NEWDOT + '<span class="pp-more"><span class="pp-chip">v' + esc(d.version) + "</span></span>"
                 : ic("check") + " StudentDesk AIUB v" + PP_VER + '<span class="pp-more"><span class="pp-chip ok">\u2713 Up to date</span></span>';
    return '<div class="pp-card pp-upd' + (d ? " pp-upd-new" : "") + '" id="pp-upd"><h3>' + head + "</h3>" +
      '<p class="pp-note" style="margin:0 0 8px">' + (d ? "<b>StudentDesk AIUB v" + esc(d.version) + "</b>" + (d.date ? " (" + esc(d.date) + ")" : "") + " is out. You have v" + PP_VER + ". New in this update:" : "You are using the latest version. What\u2019s new in v" + PP_VER + ":") + "</p>" +
      '<ul class="pp-updl">' + notes.slice(0, 10).map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>" +
      (d && st ? '<p class="pp-note" style="margin:0 0 10px">Installed from <b>' + esc(st) + "</b>: your browser installs this update automatically (usually within a day after the store approves it). Nothing to do.</p>" : "") +
      (!d && st ? '<p class="pp-note" style="margin:0 0 10px">Updates install automatically from <b>' + esc(st) + "</b>.</p>" : "") +
      (d && !st ? '<p class="pp-note" style="margin:0 0 10px">' + (us ? "Tap <b>Update now</b>. Tampermonkey opens the new version, then tap <b>Update</b> / <b>Install</b>." : "Download the new extension zip, replace the files in your StudentDesk folder, then click <b>Reload</b> on the extensions page.") + "</p>" : "") +
      '<div class="pp-row" style="gap:8px;flex-wrap:wrap">' + (d && !st ? '<a class="pp-btn pri sm" href="' + esc(link) + '" target="_blank" rel="noopener">' + ic("refresh") + (us ? " Update now" : " Download update") + "</a>" : "") +
      '<a class="pp-btn sm" href="' + GH_REPO + '/releases/latest" target="_blank" rel="noopener">' + ic("github") + " View on GitHub</a></div>" +
      '<p class="pp-note" style="margin:12px 0 0">Windows PC: install StudentDesk AIUB directly from <a href="https://microsoftedge.microsoft.com/addons/detail/studentdesk-aiub-%E2%80%94-modern/meogjhmphdkglfabjonfjbdjlfpcpbpa" target="_blank" rel="noopener noreferrer" style="color:var(--ap-accent);text-decoration:underline">Microsoft Edge Add-ons</a>. No ZIP or Developer mode needed. The store delivers the version currently approved by Microsoft.</p></div>';
  }
  /* Home banner: "Update available" (until updated; "Later" hides it for a day) or, once, "Updated to vX". */
  function updBarHtml() {
    var d = updNewer(), seen = jget(VER_SEEN, "");
    if (d) {
      if (+jget(UPD_LATER + "." + d.version, 0) > Date.now() || storeName()) return "";   // store installs update by themselves
      return '<div class="pp-card pp-updbar new" id="pp-updbar"><span class="pp-qi">' + ic("spark") + '</span><div class="pp-t"><b>Update available \u00b7 v' + esc(d.version) + "</b><small>" + esc((d.notes || [])[0] || "New features and fixes") + '</small></div><a class="pp-btn pri sm" href="#/more" data-upd="more">What\u2019s new</a><button class="pp-iconbtn" data-upd="later" title="Later" aria-label="Later">' + ic("x") + "</button></div>";
    }
    if (seen && seen !== PP_VER) return '<div class="pp-card pp-updbar" id="pp-updbar"><span class="pp-qi">' + ic("check") + '</span><div class="pp-t"><b>Updated to v' + PP_VER + " \ud83c\udf89</b><small>You are up to date. See what\u2019s new in this version.</small></div>" + '<a class="pp-btn sm" href="#/more" data-upd="more">What\u2019s new</a><button class="pp-iconbtn" data-upd="ok" title="Close" aria-label="Close">' + ic("x") + "</button></div>";
    if (!seen) jset(VER_SEEN, PP_VER);  // first install: nothing to announce
    return "";
  }
  function updBar() {
    if (current !== "home" || !scroller) return; var v = $(".pp-view", scroller); if (!v) return;
    var old = $("#pp-updbar", v), h = updBarHtml(); if (old) old.remove(); if (!h) return;
    v.insertAdjacentHTML("afterbegin", h); var bar = $("#pp-updbar", v), d = updNewer();
    $$("[data-upd]", bar).forEach(function (b) { b.onclick = function (e) { var a = b.getAttribute("data-upd");
      if (a === "later") { e.preventDefault(); if (d) jset(UPD_LATER + "." + d.version, Date.now() + 864e5); bar.remove(); }
      else if (a === "ok") { e.preventDefault(); jset(VER_SEEN, PP_VER); bar.remove(); }
      else { if (!d) jset(VER_SEEN, PP_VER); updGo = 1; } }; });
  }
  var updGo = 0;
  function updPaint() { var c = $("#pp-upd", app); if (c && current === "more") { c.outerHTML = updCard(); if (!updNewer()) jset(VER_SEEN, PP_VER); if (updGo) { updGo = 0; var n = $("#pp-upd", app); if (n && n.scrollIntoView) n.scrollIntoView({ block: "start", behavior: "smooth" }); } } var d = updNewer(); if (d && current === "more") jset(UPD_SEEN, d.version); paintBadges(); }

  var GROUP_IC = { Academics: "book", "Grade Reports": "award", Library: "lib", Others: "file", Messages: "mail" };
  VIEWS.more = function (p, f) {
    setHead("More", "Everything in the portal, in one place");
    return D.profile(f).catch(function () { return { f: {} }; }).then(function (pr) {
      var fl = pr.f || {}, keys = ["Student ID", "CGPA", "Credit", "Program", "Department", "Verified Email", "Verified Contact"];
      var initials = NAME.split(" ").filter(Boolean).slice(0, 2).map(function (x) { return x[0]; }).join("");
      return '<div class="pp-view"><div class="pp-card" style="margin-bottom:16px"><div class="pp-row" style="gap:16px;margin-bottom:14px"><span class="pp-avatar" style="width:64px;height:64px;font-size:22px">' + esc(initials) + '</span><div><h2 style="font-size:22px">' + esc(NAME) + '</h2><div style="color:var(--ap-muted)">' + esc(fl["Program"] || "") + '</div></div><a class="pp-btn sm" style="margin-left:auto" href="' + classic("/Student/Home/Profile") + '">' + ic("user") + " Full profile</a></div>" +
        '<div class="pp-grid pp-g3" style="margin:0">' + keys.filter(function (k) { return fl[k]; }).map(function (k) { return '<div class="pp-item"><div class="pp-t"><small>' + esc(k) + "</small>" + (k === "CGPA" ? cgB(esc(fl[k]), "b") : "<b" + (/Contact|Email/.test(k) ? ' class="ap-private"' : "") + ">" + esc(fl[k]) + "</b>") + "</div></div>"; }).join("") + "</div></div>" + updCard() +
        '<a class="pp-card pp-facard sd-more-planner" href="#/planner"><span class="pp-qi">' + ic("spark") + '</span><div class="pp-t"><b>Course planner</b><small>Plan next semester · check prerequisites · find conflict-free sections</small></div>' + ic("ext") + '</a>' +
        '<a class="pp-card pp-facard" href="#/reviews" data-r="reviews"><span class="pp-qi">' + ic("star") + '</span><div class="pp-t"><b>Faculty review</b><small>Rate your faculty anonymously · see everyone’s reviews</small></div>' + ic("back", "flip") + "</a>" +
        '<a class="pp-card pp-facard" href="#/faculty"><span class="pp-qi">' + ic("user") + '</span><div class="pp-t"><b>Faculty list</b><small>Find any AIUB faculty — room, email, department, research interests</small></div>' + ic("back", "flip") + "</a>" +
        '<div class="pp-grid pp-g3">' + MENU.map(function (g) { var items = g.items.filter(function (it) { return norm(g.g) !== "ACADEMICS" || !isCoursesResult(it.t); }); if (!items.length) return ""; return '<div class="pp-card"><h3>' + ic(GROUP_IC[g.g] || "grid") + " " + esc(g.g) + '</h3><div class="pp-list">' + items.map(function (it) { return '<a class="pp-item" style="padding:10px 12px" href="' + classic(it.h) + '"><div class="pp-t"><b style="font-size:13.5px">' + esc(it.t) + "</b></div>" + ic("back", "flip") + "</a>"; }).join("") + "</div></div>"; }).join("") +
        '<div class="pp-card"><h3>' + ic("lock") + ' Account</h3><div class="pp-list"><a class="pp-item" href="#/settings"><div class="pp-t"><b>Settings & theme</b></div></a><a class="pp-item" href="' + classic(L("Change Password") || "/Student/Credential/ChangePassword") + '"><div class="pp-t"><b>Change password</b></div></a>' +
        '<a class="pp-item" href="' + classic(location.pathname + location.search) + '"><div class="pp-t"><b>Classic portal view</b><small>Original portal layout</small></div></a><a class="pp-item" href="/Login/Logout" id="pp-logout" data-act="logout" style="color:#ef4444"><div class="pp-t"><b>Log out</b></div>' + ic("out") + "</a></div></div></div></div>" +
        '<div class="pp-card pp-dev"><h3>' + ic("user") + ' Developer info</h3><div class="pp-row" style="gap:14px;align-items:center"><span class="pp-avatar" style="width:52px;height:52px;font-size:18px">AS</span><div class="pp-t" style="flex:1;min-width:0"><b style="font-size:16px">Amit Hasan Sami</b><small>Developer of StudentDesk AIUB</small></div></div>' +
        '<div class="pp-list" style="margin-top:12px"><a class="pp-item" href="mailto:amitsami110@gmail.com">' + ic("mail") + '<div class="pp-t"><small>Email</small><b>amitsami110@gmail.com</b></div></a>' +
        '<a class="pp-item" href="https://www.facebook.com/amithsami110" target="_blank" rel="noopener noreferrer">' + ic("user") + '<div class="pp-t"><small>Facebook</small><b>facebook.com/amithsami110</b></div>' + ic("ext") + "</a>" +
        '<a class="pp-item" href="https://github.com/amitsami" target="_blank" rel="noopener">' + ic("github") + '<div class="pp-t"><small>GitHub</small><b>github.com/amitsami</b></div>' + ic("ext") + "</a></div></div>";
    });
  };
  VIEWS.more.after = function () { cgWire(); updPaint(); var uc = jget(UPD_KEY, null); updGet(!uc || Date.now() - uc.t > 3e5).then(updPaint); $$("svg.flip", app).forEach(function (s) { s.style.transform = "rotate(180deg)"; s.style.opacity = ".5"; }); };

  /* ---------- settings ---------- */
  VIEWS.settings = function () {
    setHead("Settings", "Your portal, your style");
    var sp = API.get().startPage || "home";
    return '<div class="pp-view"><div class="pp-grid pp-g2"><div class="pp-card sd-theme-card"><h3>' + ic("sun") + ' Theme</h3><p class="sd-muted">A quieter workspace, day or night.</p><div class="sd-theme-options">' + [["light","Light"],["dark","Dark"],["auto","System"]].map(function(t){return '<button type="button" class="pp-btn" data-sd-theme="'+t[0]+'" aria-pressed="'+(API.get().mode===t[0])+'">'+t[1]+'</button>';}).join("") + '</div></div><div class="pp-card"><h3>' + ic("grid") + ' App</h3><div class="pp-list">' +
      '<div class="pp-item" style="display:flex;align-items:center;gap:12px"><div class="pp-t" style="flex:1;min-width:0"><b>Start page</b><small>Page shown when the portal opens</small></div><select class="pp-input" id="pp-start" style="width:auto">' + NAV.map(function (n) { return '<option value="' + n.r + '"' + (n.r === sp ? " selected" : "") + ">" + n.t + "</option>"; }).join("") + "</select></div>" +
      '<button class="pp-item pp-click" data-act="refresh" style="text-align:left"><div class="pp-t"><b>Refresh all data</b><small>Reload everything from the portal</small></div>' + ic("refresh") + "</button>" +
      '<a class="pp-item" href="' + classic(location.pathname + location.search) + '"><div class="pp-t"><b>Classic portal view</b><small>Use the original layout</small></div>' + ic("layers") + "</a></div>" +
      '<p class="pp-note" style="margin-top:14px">🔒 StudentDesk runs only in your browser. All data comes directly from portal.aiub.edu and is never sent anywhere — except a faculty review you choose to submit (anonymous: no name, no ID). Settings are saved on this device only.<br><br>⌨️ Shortcuts: Alt+1…7 page change · Alt+D dark mode</p></div>' + rvSetCard() + '</div></div>';
  };
  VIEWS.settings.after = function () {
    $$("[data-sd-theme]",app).forEach(function(b){b.onclick=function(){API.set("mode",b.dataset.sdTheme);$$("[data-sd-theme]",app).forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});syncThemeIcon();};});
    var st = $("#pp-start", app); if (st) st.onchange = function () { API.set("startPage", st.value); toast("Saved ✓"); };
    rvSetWire();
  };

  /* ---------- classic (original portal page inside the app) ---------- */
  VIEWS.classic = function (p) {
    var u = p.u || "/Student"; if (!/^\/(?!\/)/.test(u)) u = "/Student";
    setHead("Portal", '<span style="font-size:12.5px">' + esc(u.split("?")[0]) + "</span>", '<button class="pp-btn sm" onclick="history.back()">' + ic("back") + ' Back</button><a class="pp-btn sm" href="' + esc(u) + '" target="_blank" rel="noopener">' + ic("ext") + " New tab</a>");
    return '<div class="pp-view pp-vclassic" style="max-width:none"><iframe class="pp-frame" id="pp-frame" src="' + esc(u) + '"></iframe></div>';
  };
  VIEWS.classic.after = function () {
    var fr = $("#pp-frame", app); if (!fr) return;
    try { if (fr.contentDocument && fr.contentDocument.body) attachNotePreviews(fr.contentDocument); } catch (e) {}
    var startU = (fr.getAttribute("src") || "").split("?")[0], HOME_RX = /^\/Student\/?(Home(\/Index)?\/?)?$/i;
    fr.addEventListener("load", function () { try { var d = fr.contentDocument; if (d && d.getElementById("loginForm")) { location.href = "/"; return; } if (d && d.body) attachNotePreviews(d);
      // A classic page (e.g. Registration -> Cancel, or registration closed) went back to the portal home:
      // show the StudentDesk home instead of the old layout.
      var pth = fr.contentWindow.location.pathname;
      if (current === "classic" && HOME_RX.test(pth) && !HOME_RX.test(startU)) { go("#/home"); }
    } catch (e) {} });
  };

  /* ------------------------------------------------------------ start */
  function restorePanel() { var panel = document.getElementById("ap-panel"); if (panel && app && app.contains(panel)) { panel.classList.remove("ap-inline", "open"); document.body.appendChild(panel); } }
  var _route = route; route = function (f, q) { restorePanel(); _route(f, q); };
  document.addEventListener("keydown", function (e) { if (!e.altKey) return; var n = parseInt(e.key, 10); if (n >= 1 && n <= NAV.length) { e.preventDefault(); location.hash = "#/" + NAV[n - 1].r; } if (e.key === "d" || e.key === "D") setTimeout(syncThemeIcon, 50); });
  /* ---------- Quick search (Ctrl+K / "/" ) ---------- */
  function openSearch() {
    if (!app) return; var old = $("#pp-cmd", app); if (old) { if(old.__close)old.__close();else old.remove(); return; }
    var items = NAV.map(function (n) { return { t: n.t, s: "StudentDesk", h: "#/" + n.r, i: n.i }; }).concat([{ t: "Settings", s: "StudentDesk", h: "#/settings", i: "gear" }, { t: "Faculty list", s: "More · aiub.edu", h: "#/faculty", i: "user" }, { t: "Exam routine", s: "Routine", h: "#/schedule", i: "file", sv: "exams" }, { t: "Campus weather", s: "Home", h: "#/home", i: "sun" }, { t: "Free time", s: "Routine", h: "#/schedule", i: "cal", sv: "free" }, { t: "Offered for me", s: "Courses", h: "#/courses", i: "list", ct: "offered" }, { t: "Remaining courses", s: "Courses", h: "#/courses", i: "book", ct: "remaining" }, { t: "Offered courses", s: "Courses", h: "#/courses", i: "list", ct: "offered" }]);
    ((peek("notices1") || {}).items || []).forEach(function (n) { items.push({ t: n.title, s: "Notice · " + n.day + " " + n.mon, h: "#/notice?u=" + encodeURIComponent(n.u), i: "bell" }); });
    MENU.forEach(function (g) { g.items.forEach(function (it) { if (it.h && it.h.charAt(0) === "/") items.push({ t: it.t, s: g.g, h: classic(it.h), i: "ext" }); }); });
    var previousFocus=document.activeElement; var box = document.createElement("div"); box.id = "pp-cmd"; box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");box.setAttribute("aria-label","Search portal");
    function closeSearch(){if(!box.isConnected)return;box.remove();document.removeEventListener("keydown",searchKeys,true);if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});}
    function searchKeys(e){if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();closeSearch();return;}if(e.key!=="Tab")return;var f=$$("input,button,a[href]",box).filter(function(x){return x.getClientRects().length&&!x.disabled;});var first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    box.__close=closeSearch;document.addEventListener("keydown",searchKeys,true);
    box.innerHTML = '<div class="pp-cmd-in"><div class="pp-cmd-q">' + ic("search") + '<input type="search" aria-label="Search pages and tools" placeholder="Where to? (routine, grades, payments…)" autocomplete="off" enterkeyhint="go"><kbd>Esc</kbd></div><div class="pp-cmd-l"></div></div>';
    app.appendChild(box);
    var inp = $("input", box), list = $(".pp-cmd-l", box), sel = 0, shown = [];
    function draw() { var q = inp.value.trim().toLowerCase(); shown = items.filter(function (x) { return !q || (x.t + " " + x.s).toLowerCase().indexOf(q) >= 0; }).slice(0, 12); if (sel >= shown.length) sel = 0;
      list.innerHTML = shown.length ? shown.map(function (x, i) { return '<a href="' + x.h + '" data-i="' + i + '" class="' + (i === sel ? "on" : "") + '">' + ic(x.i) + "<b>" + esc(x.t) + "</b><small>" + esc(x.s) + "</small></a>"; }).join("") : '<div class="pp-cmd-e">Nothing found</div>'; }
    function pick(x) { if (!x) return; if (x.sv) schedState.view = x.sv; if (x.ct) courseState.tab = x.ct; closeSearch(); go(x.h); }
    inp.oninput = function () { sel = 0; draw(); };
    inp.onkeydown = function (e) { if (e.key === "ArrowDown") { sel = Math.min(shown.length - 1, sel + 1); draw(); e.preventDefault(); } else if (e.key === "ArrowUp") { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); } else if (e.key === "Enter") { pick(shown[sel]); e.preventDefault(); } else if (e.key === "Escape") closeSearch(); if(e.key==="ArrowDown"||e.key==="ArrowUp"){var active=$(".pp-cmd-l a.on",box);if(active)active.scrollIntoView({block:"nearest"});} };
    box.addEventListener("click", function (e) { var a = e.target.closest("a[data-i]"); if (a) { e.preventDefault(); e.stopPropagation(); pick(shown[+a.getAttribute("data-i")]); } else if (e.target === box) closeSearch(); }, true);
    draw(); setTimeout(function () { inp.focus(); }, 30);
  }
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); openSearch(); }
    else if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) { e.preventDefault(); openSearch(); }
  });
  /* ---------- Phone: swipe left/right between tabs + soft haptic ---------- */
  function gestures() {
    var x0 = 0, y0 = 0, t0 = 0, ok = false;
    scroller.addEventListener("touchstart", function (e) { var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now();
      ok = e.touches.length === 1 && !e.target.closest(".pp-tabs, .pp-days, .pp-week, .pp-wk, input, textarea, select, iframe, [data-noswipe]") && x0 > 24 && x0 < innerWidth - 24; }, { passive: true });
    scroller.addEventListener("touchend", function (e) { if (!ok) return; var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      if (Date.now() - t0 > 600 || Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
      var tabs = NAV.filter(function (n) { return n.tab; }).map(function (n) { return n.r; }), i = tabs.indexOf(current); if (i < 0) return;
      var j = i + (dx < 0 ? 1 : -1); if (j < 0 || j >= tabs.length) return; buzz(); go("#/" + tabs[j]); }, { passive: true });
    $$(".pp-tabbar a", app).forEach(function (a) { a.addEventListener("click", buzz); });
  }
  function buzz() { try { if (navigator.vibrate && matchMedia("(pointer: coarse)").matches) navigator.vibrate(8); } catch (e) {} }
  /* ---------- v3.9.9 workspace tools: local-only, opt-in ---------- */
  function featureMode() { return MQ_PHONE.matches || MQ_TOUCH.matches ? "touch" : "desktop"; }
  function quickId(x) { return norm(x[2]); }
  function quickCatalog() {
    var q = defaultQuickActions(), all = q.slice();
    var result = coursesResultHref();
    if (result) all.push(["classic?u=" + encodeURIComponent(result), "book", "Courses & Result"]);
    all.push(["mail", "cloud", "Outlook", "", function () { mailState.tab = "outlook"; }],
      ["schedule", "grid", "Week view", "", function () { schedState.view = "week"; }],
      ["classic?u=" + encodeURIComponent(L("Change Password") || "/Student/Credential/ChangePassword"), "key", "Password"]);
    if (L("Search Book")) all.push(["classic?u=" + encodeURIComponent(L("Search Book")), "lib", "Library"]);
    NAV.forEach(function (n) { all.push([n.r, n.i, n.t, n.r]); });
    var seen = {}; return all.filter(function (x) { var id = quickId(x); if (seen[id]) return false; seen[id] = true; return true; });
  }
  function quickActions() {
    var saved = jget("pp.quick." + featureMode(), null);
    if (!Array.isArray(saved) || !saved.length) return defaultQuickActions();
    var catalog = quickCatalog(), out = [];
    saved.slice(0, 8).forEach(function (id) { var x = catalog.filter(function (v) { return quickId(v) === id; })[0]; if (x && !out.some(function (v) { return quickId(v) === id; })) out.push(x); });
    return out.length ? out : defaultQuickActions();
  }
  var featureDialogClose = null;
  function featureDialog(label, html) {
    if (featureDialogClose) featureDialogClose();
    var previous = document.activeElement, box = document.createElement("div"); box.className = "pp-overlay";
    box.innerHTML = '<section class="pp-sheet" role="dialog" aria-modal="true" aria-label="' + esc(label) + '"><header class="pp-sheet-head"><div><small>STUDENTDESK</small><h2>' + esc(label) + '</h2></div><button class="pp-iconbtn" data-sheet-close aria-label="Close dialog">' + ic("x") + '</button></header><div class="pp-sheet-body">' + html + '</div></section>';
    var actions = $(".pp-sheet-actions", box); if (actions) $(".pp-sheet", box).appendChild(actions);
    app.appendChild(box);
    function close() { if (!box.isConnected) return; box.remove(); document.removeEventListener("keydown", key, true); if (box.onCleanup) box.onCleanup(); featureDialogClose = null; if (previous && previous.isConnected) previous.focus(); }
    function key(e) { if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); close(); } if (e.key === "Tab") { var f = $$("button:not(:disabled), a[href], input, select, textarea, iframe", box).filter(function (x) { return x.getClientRects().length; }); if (!f.length) return; var first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } }
    box.addEventListener("click", function (e) { if (e.target === box || e.target.closest("[data-sheet-close]")) close(); });
    document.addEventListener("keydown", key, true); featureDialogClose = close; $("[data-sheet-close]", box).focus(); return box;
  }
  function editQuickActions() {
    var mode = featureMode(), catalog = quickCatalog(), chosen = quickActions().map(quickId);
    var box = featureDialog("Your quick actions", '<p class="pp-note">' + (mode === "touch" ? "Phone & tablet" : "Desktop") + ' shortcuts · choose up to 8. Changes stay in this browser.</p><div id="pp-quick-editor"></div><div class="pp-sheet-actions"><button class="pp-btn" id="pp-quick-reset">Use defaults</button><button class="pp-btn pri" id="pp-quick-save">Save shortcuts</button></div>');
    function draw() { $("#pp-quick-editor", box).innerHTML = '<h3>Selected <span class="pp-chip">' + chosen.length + '/8</span></h3><ol class="pp-order">' + chosen.map(function (id, i) { var x = catalog.filter(function (x) { return quickId(x) === id; })[0]; return '<li><span class="pp-qi">' + ic(x[1]) + '</span><b>' + esc(x[2]) + '</b><button class="pp-iconbtn" data-move="' + i + '" data-delta="-1" aria-label="Move ' + esc(x[2]) + ' up"' + (!i ? " disabled" : "") + '>↑</button><button class="pp-iconbtn" data-move="' + i + '" data-delta="1" aria-label="Move ' + esc(x[2]) + ' down"' + (i === chosen.length - 1 ? " disabled" : "") + '>↓</button><button class="pp-iconbtn" data-remove="' + esc(id) + '" aria-label="Remove ' + esc(x[2]) + '">×</button></li>'; }).join("") + '</ol><h3>Add a shortcut</h3><div class="pp-shortcut-options">' + catalog.filter(function (x) { return chosen.indexOf(quickId(x)) < 0; }).map(function (x) { return '<button class="pp-btn" data-add="' + esc(quickId(x)) + '">' + ic(x[1]) + ' ' + esc(x[2]) + '</button>'; }).join("") + '</div>'; }
    box.addEventListener("click", function (e) { var b = e.target.closest("[data-move], [data-remove], [data-add]"); if (!b) return; if (b.hasAttribute("data-move")) { var i = +b.dataset.move, j = i + +b.dataset.delta; if (j >= 0 && j < chosen.length) { var t = chosen[i]; chosen[i] = chosen[j]; chosen[j] = t; } } else if (b.dataset.remove) chosen = chosen.filter(function (x) { return x !== b.dataset.remove; }); else if (chosen.length < 8) chosen.push(b.dataset.add); else { toast("Choose up to 8 shortcuts"); return; } draw(); });
    $("#pp-quick-save", box).onclick = function () { if (!chosen.length) { toast("Keep at least one shortcut"); return; } jset("pp.quick." + mode, chosen); featureDialogClose(); refreshQuickActions(); toast("Shortcuts saved on this device"); };
    $("#pp-quick-reset", box).onclick = function () { localStorage.removeItem("pp.quick." + mode); featureDialogClose(); refreshQuickActions(); toast("Default shortcuts restored"); }; draw();
  }
  function workspaceSettingsHtml() {
    var lead = +jget("pp.reminder.minutes", 0);
    return '<div class="pp-card pp-workspace"><h3>' + ic("spark") + ' Workspace tools <span class="pp-chip">New</span></h3><p class="pp-note">Useful extras. No new account, no external document viewer.</p><div class="pp-list"><button type="button" class="pp-item pp-click pp-performance-row" id="pp-performance" role="switch" aria-checked="' + (!!API.get().performance) + '" aria-pressed="' + (!!API.get().performance) + '"><span class="pp-t"><b>Performance mode</b><small>Less blur and visual work on slower devices</small></span><span class="pp-mode-switch" aria-hidden="true"><i></i></span><span class="pp-performance-label">' + (API.get().performance ? "On" : "Off") + '</span></button><button class="pp-item pp-click" id="pp-edit-quick"><div class="pp-t"><b>Customize quick actions</b><small>Choose and reorder shortcuts for this screen type</small></div>' + ic("grid") + '</button><div class="pp-item sd-reminder-row"><div class="pp-t"><b>Class & exam reminders</b><small>Only while a logged-in portal tab is open. Campus time: Dhaka.</small></div><select class="pp-input" id="pp-reminder" aria-label="Reminder timing">' + [0, 5, 10, 15, 30].map(function (n) { return '<option value="' + n + '"' + (n === lead ? " selected" : "") + '>' + (n ? n + " min before" : "Off") + '</option>'; }).join("") + '</select></div><button class="pp-item pp-click" id="pp-notification-permission"><div class="pp-t"><b>Allow desktop notifications</b><small>Optional browser permission; in-app reminders still work without it</small></div>' + ic("bell") + '</button></div><p class="pp-note">Routine → Export: PNG, Print / Save as PDF, or an 8-week calendar file. Teacher notes → Preview: PDF, images, plain text, and text-only DOCX/PPTX. Unsupported files keep their normal download.</p></div>';
  }
  function workspaceSettingsWire() {
    var p = $("#pp-performance", app); if (!p) return;
    p.type = "button";
    if (!p.__ppPerformance) { p.__ppPerformance = true; p.addEventListener("click", function (e) { e.preventDefault(); e.stopImmediatePropagation(); var on = !API.get().performance; API.set("performance", on); if(on&&swap.motion)swap.motion.cancel(); p.setAttribute("aria-pressed", String(on)); p.setAttribute("aria-checked", String(on)); $(".pp-performance-label", p).textContent = on ? "On" : "Off"; toast(on ? "Performance mode on" : "Balanced motion restored"); }, true); }
    $("#pp-edit-quick", app).onclick = editQuickActions;
    $("#pp-reminder", app).onchange = function (e) { jset("pp.reminder.minutes", +e.target.value); reminderTick(); toast(+e.target.value ? "Reminders enabled while the portal is open" : "Reminders off"); };
    $("#pp-notification-permission", app).onclick = function () { if (!("Notification" in window) || !window.isSecureContext) { toast("Browser notifications unavailable; use in-app reminders"); return; } if (Notification.permission === "denied") { toast("Notifications blocked in browser site settings"); return; } Notification.requestPermission().then(function (v) { toast(v === "granted" ? "Desktop notifications allowed" : "In-app reminders remain available"); }); };
  }
  function syncPaint() {
    if (!app || !topS) return;
    var old = $("#pp-fresh", app); if (old) old.remove();
    var keys = { home: "home", schedule: "reg", courses: "curr", grades: "sem", finance: "acc", more: "profile", notifications: "noti", notices: "notices1" }, key = keys[current], raw = key && cacheRaw(key);
    if (!raw || !raw.t) return;
    var age = Math.max(0, Math.floor((Date.now() - raw.t) / 60000)), stale = age >= 10;
    var badge = document.createElement("span"); badge.id = "pp-fresh"; badge.className = "pp-fresh" + (stale || navigator.onLine === false ? " stale" : "");
    badge.textContent = (requestWarnings[key] ? "Refresh failed · saved " : navigator.onLine === false ? "Offline · saved " : "Cached · ") + (age ? age < 60 ? age + "m ago" : Math.floor(age / 60) + "h ago" : "just now");
    badge.title = "Data saved " + new Date(raw.t).toLocaleString() + ". Cached data may differ from the portal. Use Refresh for a new request."; var host = MQ_PHONE.matches && $("#pp-scroll > .pp-view", app); if (host) { badge.classList.add("pp-mobile-fresh"); host.insertBefore(badge, host.firstChild); } else topS.appendChild(badge);
  }
  function campusNow() { return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })); }
  function examStart(e) {
    if (!e.date) return null;
    var m = /(?:^|\s)(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i.exec(e.time || ""); if (!m) return null;
    var h = +m[1], mi = +m[2]; if (mi > 59 || h > 23 || (m[3] && (h < 1 || h > 12))) return null;
    if (m[3]) h = h % 12 + (/PM/i.test(m[3]) ? 12 : 0);
    var d = new Date(new Date(e.date).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })); d.setHours(h, mi, 0, 0); return d;
  }
  function reminderTick() {
    var lead = +jget("pp.reminder.minutes", 0); if ([5, 10, 15, 30].indexOf(lead) < 0 || !app) return;
    var now = campusNow(), reg = peek("reg"), events = [];
    if (reg) daySlots(weekly(reg), DAYS[now.getDay()]).forEach(function (s) { var d = new Date(now); d.setHours(Math.floor(s.start / 60), s.start % 60, 0, 0); events.push({ id: "class|" + d.toDateString() + "|" + s.name + "|" + s.start, at: d.getTime(), title: title(s.name), text: fmtT(s.start) + (s.room ? " · Room " + s.room : "") }); });
    var exams = peek("exams"); if (exams && exams.list) exams.list.forEach(function (e) { var d = examStart(e); if (d) events.push({ id: "exam|" + examSig(e), at: d.getTime(), title: "Exam · " + title(e.course), text: e.time + (e.room ? " · Room " + e.room : "") }); });
    events.forEach(function (e) { var left = (e.at - now.getTime()) / 60000; if (left <= 0 || left > lead || jget("pp.reminded." + e.id, false)) return; jset("pp.reminded." + e.id, true); toast(e.title + " · in " + Math.ceil(left) + " min · " + e.text); if ("Notification" in window && Notification.permission === "granted") try { var n = new Notification("StudentDesk · " + e.title, { body: "In " + Math.ceil(left) + " min · " + e.text, tag: e.id }); setTimeout(function () { n.close(); }, 15000); } catch (x) {} });
  }
  function fileSave(name, blob) { var url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 60000); }
  function icsEscape(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
  function dateCode(d) { return d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2); }
  function timeCode(d) { return dateCode(d) + "T" + ("0" + d.getHours()).slice(-2) + ("0" + d.getMinutes()).slice(-2) + "00"; }
  function calendarText(slots, exams, now) {
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//StudentDesk AIUB//Routine Preview//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:StudentDesk AIUB - 8 weeks", "BEGIN:VTIMEZONE", "TZID:Asia/Dhaka", "BEGIN:STANDARD", "DTSTART:19700101T000000", "TZOFFSETFROM:+0600", "TZOFFSETTO:+0600", "TZNAME:+06", "END:STANDARD", "END:VTIMEZONE"], stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z/, "Z");
    slots.forEach(function (s, i) { var day = DAYS.indexOf(s.day); if (day < 0) return; var d = new Date(now); d.setDate(d.getDate() + (day - d.getDay() + 7) % 7); d.setHours(Math.floor(s.start / 60), s.start % 60, 0, 0); if (d < now) d.setDate(d.getDate() + 7); var end = new Date(d); end.setMinutes(end.getMinutes() + s.end - s.start); lines.push("BEGIN:VEVENT", "UID:class-" + dateCode(d) + "-" + i + "@studentdesk.local", "DTSTAMP:" + stamp, "DTSTART;TZID=Asia/Dhaka:" + timeCode(d), "DTEND;TZID=Asia/Dhaka:" + timeCode(end), "RRULE:FREQ=WEEKLY;COUNT=8", "SUMMARY:" + icsEscape(s.name + (s.sec ? " [" + s.sec + "]" : "")), "LOCATION:" + icsEscape(s.room || ""), "DESCRIPTION:" + icsEscape("8-week copy of your current routine. Not an official semester calendar; verify changes in the portal."), "BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Class reminder", "END:VALARM", "END:VEVENT"); });
    (exams || []).forEach(function (e, i) { if (!e.date) return; var d = examStart(e), day = new Date(new Date(e.date).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })); if (day.getTime() < now.getTime() - 864e5) return; lines.push("BEGIN:VEVENT", "UID:exam-" + dateCode(day) + "-" + i + "@studentdesk.local", "DTSTAMP:" + stamp); if (d) lines.push("DTSTART;TZID=Asia/Dhaka:" + timeCode(d)); else { var end = new Date(day); end.setDate(end.getDate() + 1); lines.push("DTSTART;VALUE=DATE:" + dateCode(day), "DTEND;VALUE=DATE:" + dateCode(end)); } lines.push("SUMMARY:" + icsEscape("Exam: " + e.course), "LOCATION:" + icsEscape(e.room), "DESCRIPTION:" + icsEscape([e.term, e.time, "Confirm timing in the portal"].filter(Boolean).join(" · ")), "END:VEVENT"); });
    lines.push("END:VCALENDAR");
    return lines.map(function (line) { var chunks = [], part = "", size = 0; Array.from(line).forEach(function (ch) { var n = new TextEncoder().encode(ch).length; if (size + n > 73) { chunks.push(part); part = " "; size = 1; } part += ch; size += n; }); chunks.push(part); return chunks.join("\r\n"); }).join("\r\n") + "\r\n";
  }
  function routineRows(slots) { return DAYS.map(function (day) { var rows = daySlots(slots, day); return '<section><h2>' + DAYFULL[day] + '</h2>' + (rows.length ? rows.map(function (s) { return '<article><strong>' + esc(title(s.name)) + '</strong><span>' + esc(fmtT(s.start) + " – " + fmtT(s.end)) + '</span><small>' + esc([s.sec && "Section " + s.sec, s.type, s.room && "Room " + s.room].filter(Boolean).join(" · ")) + '</small></article>'; }).join("") : '<p>No classes</p>') + '</section>'; }).join(""); }
  function routineExport() {
    var reg = peek("reg"); if (!reg) { toast("Open Routine and wait for your classes to load"); return; } var slots = weekly(reg);
    var box = featureDialog("Export your routine", '<p class="pp-note">' + esc(reg.semester || "Current semester") + ' · Campus time: Asia/Dhaka. Files are created locally.</p><div class="pp-export-options"><button class="pp-export" data-export="png">' + ic("grid") + '<b>Routine image</b><small>Save a clean PNG</small></button><button class="pp-export" data-export="print">' + ic("file") + '<b>Print / PDF</b><small>Choose Save as PDF in the print dialog</small></button><button class="pp-export" data-export="ics">' + ic("cal") + '<b>Add to calendar</b><small>Next 8 weekly occurrences + cached exams</small></button></div><p class="pp-note">Calendar files are snapshots, not a live sync. Re-import after changes. Class alerts: 15 minutes before. Exams without a readable start time become all-day events.</p>');
    box.addEventListener("click", function (e) { var b = e.target.closest("[data-export]"); if (!b) return; if (b.dataset.export === "ics") { fileSave("StudentDesk-routine-8-weeks.ics", new Blob([calendarText(slots, (peek("exams") || {}).list, campusNow())], { type: "text/calendar;charset=utf-8" })); toast("Calendar exported · check dates before importing"); }
      if (b.dataset.export === "print") { var w = window.open("", "_blank"); if (!w) { toast("Allow pop-ups to open the print view"); return; } w.opener = null; w.document.write('<!doctype html><html><meta charset="utf-8"><title>StudentDesk Routine</title><style>body{font:15px system-ui;color:#202124;margin:32px}h1{margin:0}header p{color:#64748b}main{display:grid;grid-template-columns:1fr 1fr;gap:16px}section{border:1px solid #ddd;border-radius:12px;padding:16px;break-inside:avoid}h2{font-size:17px;margin:0 0 12px}article{margin:12px 0}article span,article small{display:block;color:#475569;margin-top:4px}@media print{button{display:none}body{margin:12mm}}</style><header><h1>Class routine</h1><p>' + esc(reg.semester || "StudentDesk AIUB") + ' · Asia/Dhaka · Current cached routine</p><button onclick="window.print()">Print / Save as PDF</button></header><main>' + routineRows(slots) + '</main></html>'); w.document.close(); }
      if (b.dataset.export === "png") routinePng(slots, reg.semester);
    });
  }
  function routinePng(slots, semester) {
    var canvas = document.createElement("canvas"), ctx = canvas.getContext("2d"), rowHeights = DAYS.map(function (d) { return Math.max(150, 70 + daySlots(slots, d).length * 110); });
    var rowH = []; for (var i = 0; i < 4; i++) rowH.push(Math.max(rowHeights[i * 2], rowHeights[i * 2 + 1] || 0));
    canvas.width = 1400; canvas.height = 150 + rowH.reduce(function (a, b) { return a + b + 20; }, 0) + 45;
    ctx.fillStyle = "#f5f5f7"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#1d1d1f"; ctx.font = "bold 38px Arial"; ctx.fillText("Class routine", 44, 65); ctx.font = "20px Arial"; ctx.fillStyle = "#667085"; ctx.fillText((semester || "StudentDesk AIUB") + " · Asia/Dhaka", 44, 108);
    function fit(s, width) { while (ctx.measureText(s).width > width && s.length > 1) s = s.slice(0, -2); return s; }
    var y = 150; DAYS.forEach(function (day, i) { var x = 40 + (i % 2) * 670, height = rowH[Math.floor(i / 2)]; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(x, y, 650, height, 18); ctx.fill(); ctx.fillStyle = "#1d1d1f"; ctx.font = "bold 24px Arial"; ctx.fillText(DAYFULL[day], x + 22, y + 38); var rows = daySlots(slots, day); if (!rows.length) { ctx.fillStyle = "#667085"; ctx.font = "20px Arial"; ctx.fillText("No classes", x + 22, y + 85); } rows.forEach(function (s, j) { var yy = y + 78 + j * 110; ctx.fillStyle = "#1d1d1f"; ctx.font = "bold 21px Arial"; ctx.fillText(fit(title(s.name), 600), x + 22, yy); ctx.font = "19px Arial"; ctx.fillStyle = "#2563eb"; ctx.fillText(fmtT(s.start) + " – " + fmtT(s.end), x + 22, yy + 29); ctx.fillStyle = "#667085"; ctx.font = "18px Arial"; ctx.fillText(fit([s.sec && "Section " + s.sec, s.type, s.room && "Room " + s.room].filter(Boolean).join(" · "), 600), x + 22, yy + 56); }); if (i % 2 || i === 6) y += height + 20; });
    ctx.font = "17px Arial"; ctx.fillStyle = "#667085"; ctx.fillText("StudentDesk AIUB · Cached snapshot. Verify updates in your portal.", 44, canvas.height - 20); canvas.toBlob(function (blob) { if (blob) fileSave("StudentDesk-class-routine.png", blob); }, "image/png");
  }
  function fileCandidate(a) { var h = a.getAttribute("href") || "", label = [a.textContent, a.getAttribute("title"), a.getAttribute("download")].filter(Boolean).join(" "); return h && !/^(#|javascript:|mailto:)/i.test(h) && (/\.(pdf|png|jpe?g|webp|gif|txt|csv|md|docx?|pptx?|xlsx?)(?:[?#\s]|$)/i.test(h + " " + label) || /download|attachment|\/files?\/|getfile|viewfile|coursenote/i.test(h) || a.hasAttribute("download")); }
  function attachNotePreviews(d) {
    if (!d || d.__ppPreviewObserver) return;
    function scan() { $$("a[href]", d).forEach(function (a) { if (a.dataset.ppPreview || !fileCandidate(a)) return; var u; try { u = new URL(a.getAttribute("href"), d.location && d.location.href !== "about:blank" ? d.location.href : d.baseURI); } catch (e) { return; } if (u.origin !== location.origin || u.protocol !== location.protocol) return; a.dataset.ppPreview = "1"; var b = d.createElement("button"); b.type = "button"; b.className = "pp-note-preview"; b.textContent = "Preview"; b.setAttribute("aria-label", "Preview " + (a.textContent.trim() || "attachment")); b.style.cssText = "min-height:44px;margin:4px 8px;padding:6px 14px;border:1px solid #cbd5e1;border-radius:12px;background:var(--sd-surface,#fffefa);color:var(--sd-accent,#8d4d36);font:600 14px Times,serif;cursor:pointer"; b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); previewNote(u.href, a.getAttribute("download") || a.getAttribute("title") || a.textContent.trim() || "Teacher note",d.location&&d.location.href); }; a.insertAdjacentElement("afterend", b); }); }
    var pending = false, observer = new MutationObserver(function () { if (pending) return; pending = true; setTimeout(function () { pending = false; scan(); }, 160); });
    d.__ppPreviewObserver = observer; observer.observe(d.body, { childList: true, subtree: true }); scan();
    function frames() { $$("iframe", d).forEach(function (f) { if (f.__ppPreviewHook) return; f.__ppPreviewHook = true; function hook() { try { if (f.contentDocument && f.contentDocument.body) attachNotePreviews(f.contentDocument); } catch (e) {} } f.addEventListener("load", hook); hook(); }); }
    frames(); var frameWatch = new MutationObserver(frames); frameWatch.observe(d.body, { childList:true, subtree:true });
  }
  async function readBounded(response, limit) {
    if (+response.headers.get("content-length") > limit) throw new Error("This file is too large for preview (25 MB limit). Use the original download.");
    if (!response.body || !response.body.getReader) { var ab = await response.arrayBuffer(); if (ab.byteLength > limit) throw new Error("File too large for preview"); return new Uint8Array(ab); }
    var reader = response.body.getReader(), chunks = [], size = 0;
    try { while (true) { var r = await reader.read(); if (r.done) break; size += r.value.length; if (size > limit) { await reader.cancel(); throw new Error("This file is too large for preview (25 MB limit)."); } chunks.push(r.value); } } finally { reader.releaseLock(); }
    var out = new Uint8Array(size), pos = 0; chunks.forEach(function (c) { out.set(c, pos); pos += c.length; }); return out;
  }
  async function officeText(bytes, kind) {
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), end = -1;
    for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
    if (end < 0) throw new Error("Invalid Office archive");
    var count = view.getUint16(end + 10, true), pos = view.getUint32(end + 16, true), files = []; if (count > 4000) throw new Error("This document is too complex for preview");
    for (i = 0; i < count; i++) { if (pos + 46 > bytes.length || view.getUint32(pos, true) !== 0x02014b50) throw new Error("Invalid Office directory"); var flags = view.getUint16(pos + 8, true), method = view.getUint16(pos + 10, true), packed = view.getUint32(pos + 20, true), unpacked = view.getUint32(pos + 24, true), nlen = view.getUint16(pos + 28, true), extra = view.getUint16(pos + 30, true), comment = view.getUint16(pos + 32, true), local = view.getUint32(pos + 42, true); var name = new TextDecoder().decode(bytes.subarray(pos + 46, pos + 46 + nlen)); pos += 46 + nlen + extra + comment;
      if ((kind === "docx" && name === "word/document.xml") || (kind === "pptx" && /^ppt\/slides\/slide\d+\.xml$/.test(name))) { if (flags & 1 || unpacked > 2 * 1024 * 1024 || packed > 4 * 1024 * 1024) throw new Error("Encrypted or large document not supported"); files.push({ name: name, method: method, packed: packed, unpacked: unpacked, local: local }); }
    }
    files.sort(function (a, b) { return +(a.name.match(/slide(\d+)/) || [0, 0])[1] - +(b.name.match(/slide(\d+)/) || [0, 0])[1]; });
    if (!files.length || files.length > 100 || files.reduce(function (n, f) { return n + f.unpacked; }, 0) > 12 * 1024 * 1024) throw new Error("This Office document cannot be previewed safely");
    var pages = [];
    for (var j = 0; j < files.length; j++) { var f = files[j], offset = f.local; if (offset + 30 > bytes.length || view.getUint32(offset, true) !== 0x04034b50) throw new Error("Invalid Office entry"); var begin = offset + 30 + view.getUint16(offset + 26, true) + view.getUint16(offset + 28, true); if (begin + f.packed > bytes.length) throw new Error("Truncated Office entry"); var raw = bytes.subarray(begin, begin + f.packed), xml;
      if (f.method === 0) { if (raw.length !== f.unpacked) throw new Error("Invalid Office entry size"); xml = new TextDecoder().decode(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength)); } else if (f.method === 8 && window.__sdInflate) { var expanded = window.__sdInflate(raw, f.unpacked); xml = new TextDecoder().decode(expanded.buffer.slice(expanded.byteOffset,expanded.byteOffset+expanded.byteLength)); } else throw new Error("Document decoder missing. Reload the extension and the portal tab.");
      if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("Unsupported XML document"); var doc = new DOMParser().parseFromString(xml, "application/xml"); if (doc.getElementsByTagName("parsererror").length) throw new Error("Invalid document text"); var paras = Array.from(doc.getElementsByTagNameNS("*", "p")); var text = paras.map(function (p) { return Array.from(p.getElementsByTagNameNS("*", "t")).map(function (t) { return t.textContent; }).join(""); }).filter(Boolean).join("\n\n"); pages.push({ title: kind === "pptx" ? "Slide " + (j + 1) : "Document text", text: text || "No readable text on this page." });
    } return pages;
  }
  function readPortalAttachment(url, signal) {
    return new Promise(function(resolve,reject){
      var xhr=new XMLHttpRequest(),limit=25*1024*1024,finished=false;
      function done(error,value){if(finished)return;finished=true;if(signal)signal.removeEventListener("abort",abort);error?reject(error):resolve(value);}
      function abort(){xhr.abort();var e=new Error("Preview closed");e.name="AbortError";done(e);}
      if(signal&&signal.aborted)return abort();
      xhr.open("GET",new URL(url,location.href).href,true);xhr.responseType="arraybuffer";xhr.timeout=20000;
      xhr.onprogress=function(e){if(e.loaded>limit || (e.lengthComputable&&e.total>limit)){xhr.abort();done(new Error("This file is too large for preview (25 MB limit). Use the original download."));}};
      xhr.onload=function(){var response=xhr.response;if(!response)return done(new Error("The portal returned an empty attachment."));if(response.byteLength>limit)return done(new Error("This file is too large for preview (25 MB limit)."));
        done(null,{ok:xhr.status>=200&&xhr.status<300,status:xhr.status,url:xhr.responseURL,headers:{get:function(k){return xhr.getResponseHeader(k);}},arrayBuffer:function(){return Promise.resolve(response);}});
      };
      xhr.onerror=function(){done(new Error("Attachment network request failed. Reopen the original notes page and try again."));};xhr.ontimeout=function(){done(new Error("The attachment server did not respond in time."));};
      if(signal)signal.addEventListener("abort",abort,{once:true});xhr.send();
    });
  }
  // Inspect wrapper HTML inertly. Follow only declared same-origin file links, never scripts/forms.
  function noteTargets(doc, base, label, visited) {
    function clean(v){try{return decodeURIComponent(String(v||""));}catch(e){return String(v||"");}}
    function filename(v){return clean(v).split(/[\/]/).pop().split(/[?#]/)[0].trim().toLowerCase();}
    var wanted=filename(label),hasName=/\.(pdf|png|jpe?g|webp|gif|txt|csv|md|docx?|pptx?|xlsx?)$/i.test(wanted),out=[];
    $$("a[href],iframe[src],embed[src],object[data]",doc).forEach(function(a){
      var raw=a.getAttribute("href")||a.getAttribute("src")||a.getAttribute("data"),u;
      try{u=new URL(raw,base);}catch(e){return;}
      if(u.origin!==location.origin||!/^https?:$/.test(u.protocol)||u.username||u.password||visited.indexOf(u.href)>=0||/\/(logout|delete|remove|signout)(?:[/?]|$)/i.test(u.pathname))return;
      var text=txt(a),download=a.getAttribute("download")||"",path=clean(u.href),n=filename(download||text||u.pathname),match=hasName&&(n===wanted||path.toLowerCase().indexOf(wanted)>=0),ext=/\.(pdf|png|jpe?g|webp|gif|txt|csv|md|docx?|pptx?|xlsx?)(?:[?#&\s]|$)/i.test(path+" "+download+" "+text),endpoint=/download|attachment|\/files?\/|getfile|viewfile/i.test(u.pathname);
      if(!ext&&!endpoint&&!download)return;
      var score=(match?100:0)+(download?25:0)+(endpoint?15:0)+(ext?10:0);
      if(!out.some(function(x){return x.url===u.href;}))out.push({url:u.href,label:(download||text||filename(u.pathname)||"Attachment").slice(0,220),score:score,match:match});
    });
    return out.sort(function(a,b){return b.score-a.score;}).slice(0,20);
  }
  async function resolveNoteAttachment(url,label,signal,visited) {
    visited=visited||[];if(visited.indexOf(url)>=0||visited.length>=3)throw new Error("This notes link loops or has too many redirects. Open the notes page to choose the file.");visited.push(url);
    var r=await readPortalAttachment(url,signal);if(!r.ok)throw new Error("The portal could not open this attachment (HTTP "+r.status+")");
    var finalUrl=new URL(r.url||url,location.href);if(finalUrl.origin!==location.origin)throw new Error("This attachment redirects outside the portal. Use Original download to open it directly.");
    var bytes=await readBounded(r,25*1024*1024),type=(r.headers.get("content-type")||"").toLowerCase(),head=new TextDecoder().decode(bytes.slice(0,2000));
    if(/text\/html/.test(type)||/^\s*(?:<!doctype html|<html|<form)/i.test(head)){
      if(bytes.length>2*1024*1024)throw new Error("This notes page is too large to inspect safely. Open it and choose its download link.");
      var doc=new DOMParser().parseFromString(new TextDecoder().decode(bytes),"text/html");
      if(doc.querySelector('#loginForm,input[type="password"]')){var expired=new Error("Your portal session expired. Sign in again, then reopen the note.");expired.sessionExpired=true;throw expired;}
      var choices=noteTargets(doc,finalUrl.href,label,visited);
      if(choices.length===1||(choices.length>1&&choices[0].match&&choices[0].score>choices[1].score))return resolveNoteAttachment(choices[0].url,label,signal,visited);
      var err=new Error(choices.length?"This page contains several attachments. Choose the file to preview.":"The portal returned a notes page without a direct attachment link. Open notes to choose or download the file.");err.choices=choices;err.notesUrl=finalUrl.href;throw err;
    }
    return {response:r,bytes:bytes,url:finalUrl.href};
  }
  function previewNote(url, label, sourceUrl) {
    var u = new URL(url, location.href); if (u.origin !== location.origin) { toast("Use the original link for externally hosted files"); return; }
    var box = featureDialog("Note preview", '<div class="pp-file-meta"><span class="pp-file-glyph">' + ic("book") + '</span><span><b>' + esc(label) + '</b><small>Private preview · stays in this browser</small></span></div><div class="pp-preview-content" id="pp-preview-content"><div class="pp-sk" style="height:180px"></div><p>Opening note…</p></div><div class="pp-sheet-actions"><button type="button" class="pp-btn" data-preview-retry>Retry</button><button type="button" class="pp-btn" data-preview-notes>Open notes</button><a class="pp-btn" data-preview-original href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">Original download</a></div>');
    var notesHref=sourceUrl||url;
    $('[data-preview-retry]',box).onclick=function(){previewNote(url,label,notesHref);};
    $('[data-preview-notes]',box).onclick=function(){var n;try{n=new URL(notesHref,location.href);}catch(e){return;}if(n.origin!==location.origin)return;featureDialogClose();go(classic(n.href));};
    var ctl = new AbortController(), blobs = [], timedOut = false, previewTimer = setTimeout(function () { timedOut = true; ctl.abort(); }, 20000); box.onCleanup = function () { clearTimeout(previewTimer); ctl.abort(); blobs.forEach(function (u) { URL.revokeObjectURL(u); }); };
    function object(bytes, type) { var u = URL.createObjectURL(new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], { type: type })); blobs.push(u); return u; }
    resolveNoteAttachment(url,label,ctl.signal).then(async function (resolved) {
      var r=resolved.response,bytes=resolved.bytes,type=(r.headers.get("content-type")||"").split(";")[0].toLowerCase(),name=label+" "+resolved.url+" "+(r.headers.get("content-disposition")||"");
      if(!box.isConnected)return;var content=$("#pp-preview-content",box);content.textContent="";
      $('[data-preview-original]',box).href=resolved.url;
      if (bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 && bytes[3] === 70) { var src = object(bytes, "application/pdf"), frame = document.createElement("iframe"); frame.title = "PDF note preview"; frame.className = "pp-pdf-preview"; frame.src = src; content.appendChild(frame); var a = document.createElement("a"); a.href = src; a.target = "_blank"; a.rel = "noopener"; a.className = "pp-btn sm"; a.textContent = "PDF blank on this browser? Open PDF in a new tab"; content.appendChild(a); }
      else if ((bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78) || (bytes[0] === 255 && bytes[1] === 216) || (bytes[0] === 71 && bytes[1] === 73 && bytes[2] === 70) || (bytes[0] === 82 && bytes[1] === 73 && bytes[8] === 87 && bytes[9] === 69)) { var img = document.createElement("img"); img.alt = label; img.src = object(bytes, bytes[0] === 137 ? "image/png" : bytes[0] === 255 ? "image/jpeg" : bytes[0] === 71 ? "image/gif" : "image/webp"); content.appendChild(img); }
      else if (bytes[0] === 80 && bytes[1] === 75 && /docx|pptx|wordprocessingml|presentationml|word\/document\.xml|ppt\/slides\//i.test(name + type + new TextDecoder("latin1").decode(bytes.slice(-65536)))) { var kind = /pptx|presentationml|ppt\/slides\//i.test(name + type + new TextDecoder("latin1").decode(bytes.slice(-65536))) ? "pptx" : "docx", pages = await officeText(bytes, kind); if (!box.isConnected) return; var note = document.createElement("p"); note.className = "pp-note"; note.textContent = "Text-only preview: original layout, images, equations and formatting are not reproduced."; content.appendChild(note); pages.forEach(function (p) { var section = document.createElement("section"), h = document.createElement("h3"), pre = document.createElement("pre"); h.textContent = p.title; pre.textContent = p.text; section.append(h, pre); content.appendChild(section); }); }
      else if (/text\/(plain|csv|markdown)/.test(type) || /\.(txt|csv|md)(?:[\s?#";]|$)/i.test(name)) { var text = new TextDecoder().decode(bytes); if (/<(?:!doctype|html|form)\b/i.test(text.slice(0, 1500))) throw new Error("The portal returned a sign-in page instead of the file. Sign in again."); var pre = document.createElement("pre"); pre.textContent = text.slice(0, 1000000); content.appendChild(pre); }
      else throw new Error("This file type cannot be previewed here. PDF, images, text, DOCX and PPTX text are supported. Use the original download for other formats.");
    }).catch(function (e) { if (!box.isConnected || (e.name === "AbortError" && !timedOut)) return; var c = $("#pp-preview-content", box); c.textContent = ""; var p = document.createElement("p"); p.className = "pp-preview-error"; p.textContent = timedOut ? "The attachment server did not respond in time. Retry or use the original download." : e.message || "Preview unavailable. Use the original download."; c.appendChild(p);if(e.notesUrl)notesHref=e.notesUrl;
      if(e.choices&&e.choices.length){var list=document.createElement("div");list.className="pp-preview-choices";e.choices.forEach(function(choice){var b=document.createElement("button");b.type="button";b.className="pp-btn";b.textContent=choice.label;b.onclick=function(){previewNote(choice.url,choice.label,notesHref);};list.appendChild(b);});c.appendChild(list);}
    }).finally(function () { clearTimeout(previewTimer); });
  }
  function studioArtPaint(){
    if(!window.StudentDeskArt)return;
    var type={home:"home",schedule:"routine",courses:"courses",grades:"grades",finance:"finance",notices:"notices",notice:"notices",mail:"mail",settings:"settings",more:"more",reviews:"reviews",faculty:"faculty",planner:"planner",notifications:"notifications"}[current];
    var view=$("#pp-scroll>.pp-view",app);if(!view)return;
    if(!type){if(window.StudentDeskMotion)window.StudentDeskMotion.paint(app);return;}
    if(current==="home"){
      var intro=$(".pp-overview-intro",view);if(intro&&!$(".sd-live-mascot",intro)){var mascot=document.createElement("span");mascot.className="sd-live-mascot";mascot.innerHTML=window.StudentDeskArt("home");intro.appendChild(mascot);var date=$(".pp-date-tile",intro),eyebrow=$(".pp-eyebrow",intro);if(date&&eyebrow){var label=document.createElement("span");label.className="sd-home-date";label.textContent=$$("small,b",date).map(txt).join(" ");eyebrow.appendChild(label);}}
      var banner=$(".sd-planner-banner",view);if(banner&&!$(".sd-banner-cartoon",banner)){var mark=$(".sd-banner-mark",banner);if(mark)mark.innerHTML=window.StudentDeskArt("planner");}
      $$(".pp-em",view).forEach(function(el){el.innerHTML=window.StudentDeskArt("finance");});
    }else if(current!=="planner"&&current!=="notices"&&current!=="notice"&&!$(".sd-page-intro",view)){
      var copy={schedule:["YOUR WEEK, WITH ROOM TO BREATHE","A rhythm that works for you.","Classes, breaks and the space in between."],courses:["YOUR CURRENT SEMESTER","Small steps. Meaningful progress.","Your curriculum, current courses and academic record."],grades:["YOUR PROGRESS","Look how far you’ve come.","Results and useful perspectives, with privacy controls."],finance:["A CLEARER PICTURE","One less thing to keep track of.","Payments, deadlines and your semester account."],mail:["CAMPUS CONVERSATIONS","A place for the important things.","Your official university messages, within reach."],reviews:["SHARED EXPERIENCES","A little insight. Better-informed choices.","Respectful, course-relevant feedback from students."],faculty:["THE PEOPLE ON CAMPUS","Find the right person.","Faculty profiles and contact information."],notifications:["A GENTLE HEADS-UP","Only what needs your attention.","Important updates and reminders, quietly collected."],more:["YOUR WORKSPACE","Everything else. Still close by.","Useful places in one calm corner."],settings:["MAKE YOURSELF AT HOME","A calmer space. Your own way.","The right light, the right amount of motion."]}[current];
      if(copy){var h=document.createElement("section");h.className="sd-page-intro";h.innerHTML='<div><span class="pp-eyebrow">'+esc(copy[0])+'</span><h2>'+esc(copy[1])+'</h2><p>'+esc(copy[2])+'</p></div>'+window.StudentDeskArt(type);view.insertBefore(h,view.firstChild);}
    }
    var targets=current==="home"?$$(".pp-quick-card,.pp-wxcard,.pp-g2>.pp-card,.pp-home>.pp-card",view):current==="notices"||current==="notice"?$$(".pp-bulletin-head,.pp-card",view):$$(".pp-card",view).filter(function(c){return !c.parentElement.closest(".pp-card");});
    targets.forEach(function(c,i){if($(".sd-portion-art",c)||c.classList.contains("pp-overview"))return;var heading=$("h3,h2",c);if(!heading||heading.parentNode!==c||current==="planner"||$(".pp-avatar,.pp-rvhead,.sd-setup-summary",c)||$("a,button",heading))return;var art=document.createElement("span");art.className="sd-portion-art";art.innerHTML=window.StudentDeskArt(current==="home"?(c.classList.contains("pp-wxcard")?"weather":c.classList.contains("pp-quick-card")?"routine":["finance","routine","notices"][i%3]):type);c.insertBefore(art,c.firstChild);c.classList.add("sd-art-section");heading.classList.add("sd-illustrated-title");});
    $$(".pp-em",view).forEach(function(el){el.innerHTML=window.StudentDeskArt(type);});
    if(window.StudentDeskMotion)window.StudentDeskMotion.paint(app);
  }
  function workspacePaint() {
    syncPaint();
    var wkeys = { home: "home", schedule: "reg", courses: "curr", grades: "sem", finance: "acc", notices: "notices1" }, warning = requestWarnings[wkeys[current]], view = $("#pp-scroll > .pp-view", app);
    if (current === "notices") Object.keys(requestWarnings).some(function (k) { if (/^notices\d+$/.test(k) && +k.slice(7) <= noticeState.pages) { warning = requestWarnings[k]; return true; } });
    if (warning && view && !$(".pp-notice-unavailable",view) && !$(".pp-data-warning", view)) { var warn = document.createElement("div"); warn.className = "pp-data-warning"; warn.setAttribute("role", "status"); var text = document.createElement("span"); text.textContent = warning; var retry = document.createElement("button"); retry.className = "pp-btn sm"; retry.dataset.act = "refresh"; retry.textContent = "Retry"; warn.append(text, retry); view.insertBefore(warn, view.firstChild); }
    if (current === "home") { var quick = $(".pp-quick", app), h = quick && quick.parentNode.querySelector("h3"); if (h && !$("[data-custom-quick]", h)) { var b = document.createElement("button"); b.className = "pp-btn sm pp-custom-quick"; b.dataset.customQuick = "1"; b.textContent = "Customize"; b.onclick = editQuickActions; h.appendChild(b); } }
    if (current === "schedule") { var view = $("#pp-scroll > .pp-view", app); if (view && !$("#pp-export-bar", view)) { var bar = document.createElement("div"); bar.id = "pp-export-bar"; bar.className = "pp-toolstrip"; bar.innerHTML = '<div><b>Your week, anywhere</b><small>Save a routine image, PDF or calendar snapshot</small></div><button class="pp-btn sm" id="pp-export-routine">' + ic("ext") + ' Export</button>'; view.insertBefore(bar, view.firstChild); $("#pp-export-routine", bar).onclick = routineExport; } }
    if (current === "settings") { var view = $("#pp-scroll > .pp-view", app); if (view && !$(".pp-workspace", view)) { var wrap = document.createElement("div"); wrap.innerHTML = workspaceSettingsHtml(); view.insertBefore(wrap.firstChild, view.firstChild); } workspaceSettingsWire(); }
    if(current==="settings"){var list=$(".pp-workspace>.pp-list",app);if(list&&!$("[data-sd-motion-toggle]",list)){var motion=document.createElement("button");motion.type="button";motion.className="pp-item pp-click sd-motion-setting";motion.setAttribute("data-sd-motion-toggle","");motion.setAttribute("role","switch");motion.innerHTML='<span class="pp-t"><b>Animated illustrations & icons</b><small>Soft motion across pages. Reduced-motion and Performance mode take priority.</small></span><span class="pp-mode-switch" aria-hidden="true"><i></i></span><span class="sd-motion-label"></span>';list.insertBefore(motion,list.firstChild);}}
    studioArtPaint();
    if (current === "classic") { var fr = $("#pp-frame", app); if (fr && !fr.__ppNoteHook) { fr.__ppNoteHook = true; fr.addEventListener("load", function () { try { attachNotePreviews(fr.contentDocument); } catch (e) {} }); try { if (fr.contentDocument && fr.contentDocument.body) attachNotePreviews(fr.contentDocument); } catch (e) {} } }
  }
  function workspaceStart() {
    workspacePaint(); setInterval(syncPaint, 60000); setInterval(reminderTick, 20000);
    window.addEventListener("focus",function(){if(current!=="notices"&&current!=="notice")return;var path=current==="notices"?"/category/notices?pageNo=1&pageSize=20":new URLSearchParams(location.hash.split("?")[1]||"").get("u");if(!path)return;noticeCachedData(path).then(function(d){var k=current==="notices"?"notices1":"notice:"+path;var prev=cacheRaw(k);if(!prev||d.syncedAt>prev.t){cacheSet(k,d);route();}},function(){});});
    window.addEventListener("online", syncPaint); window.addEventListener("offline", syncPaint);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) { syncPaint(); reminderTick(); } });
  }

  function start() { if (document.getElementById("pp-app")) return; if (!$("#main-content") && !$("#navigation-bar")) return; build(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
