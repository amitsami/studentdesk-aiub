/* StudentDesk AIUB — UI layer only. No data is read, stored or sent anywhere.
   Settings are saved in this browser's localStorage only. */
(function () {
  "use strict";
  if (window.__aiubPlus) return; window.__aiubPlus = true;
  var KEY = "aiubPlus.settings.v1";
  var DEF = { app: true, startPage: "home", mode: "light", accent: "#3b82f6", bg: "aurora", v: 3, blur: 22, scale: 100, anim: true, trans: true, compact: false, radius: 18, grades: true, privacy: false, performance: false };
  var PRESETS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#10b981", "#06b6d4", "#64748b"];
  var S = load();
  if(!S.studio4){S.scale=100;S.bg="solid";S.blur=12;S.radius=20;S.accent="#8d4d36";S.compact=false;S.studio4=true;save();}
  var root = document.documentElement;

  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || "{}"); if (o.v !== 3) { o.mode = "light"; o.v = 3; } return Object.assign({}, DEF, o); } catch (e) { return Object.assign({}, DEF); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  function hexToRgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&"); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; var M = Math.max(r, g, b), m = Math.min(r, g, b), h, s, l = (M + m) / 2;
    if (M === m) { h = s = 0; } else { var d = M - m; s = l > .5 ? d / (2 - M - m) : d / (M + m);
      h = M === r ? (g - b) / d + (g < b ? 6 : 0) : M === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h * 360, s, l]; }
  function hslToRgb(h, s, l) { h = ((h % 360) + 360) % 360 / 360; function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }
    if (s === 0) return [l * 255, l * 255, l * 255].map(Math.round); var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return [f(p, q, h + 1 / 3), f(p, q, h), f(p, q, h - 1 / 3)].map(function (x) { return Math.round(x * 255); }); }

  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function apply() {
    root.classList.add("ap");
    var dark = S.mode === "dark" || (S.mode === "auto" && mq && mq.matches);
    root.setAttribute("data-ap-mode", dark ? "dark" : "light");
    root.setAttribute("data-ap-bg", S.bg);
    root.setAttribute("data-ap-anim", S.anim ? "1" : "0");
    root.setAttribute("data-ap-performance", S.performance ? "1" : "0");
    root.setAttribute("data-ap-compact", S.compact ? "1" : "0");
    root.setAttribute("data-ap-privacy", S.privacy ? "1" : "0");
    var rgb = hexToRgb(S.accent), hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var rgb2 = hslToRgb(hsl[0] + 38, Math.min(1, hsl[1] * 1.05), Math.min(.65, Math.max(.45, hsl[2])));
    var st = root.style;
    var actionRgb = rgb.slice();
    function actionLuma(v) { var c = v.map(function (n) { n /= 255; return n <= .04045 ? n / 12.92 : Math.pow((n + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
    while (actionLuma(actionRgb) > .175) actionRgb = actionRgb.map(function (n) { return Math.floor(n * .92); });
    st.setProperty("--ap-action", "rgb(" + actionRgb.join(",") + ")");
    st.setProperty("--ap-accent", S.accent);
    st.setProperty("--ap-accent-rgb", rgb.join(","));
    st.setProperty("--ap-accent2", "rgb(" + rgb2.join(",") + ")");
    st.setProperty("--ap-accent2-rgb", rgb2.join(","));
    st.setProperty("--ap-blur", S.blur + "px");
    st.setProperty("--ap-font-scale", S.scale / 100);
    st.setProperty("--ap-radius", S.radius + "px");
    st.setProperty("--ap-radius-sm", Math.max(4, S.radius - 6) + "px");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta && document.head) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.appendChild(meta); }
    if (meta) meta.content = dark ? "#171b19" : "#f5f4ef";
  }
  try { if (window.top !== window) root.classList.add("pp-embed"); } catch (e) { root.classList.add("pp-embed"); }
  apply(); // runs at document_start → no flash of old design
  if (mq && mq.addEventListener) mq.addEventListener("change", function () { if (S.mode === "auto") apply(); });

  var ICON = {
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    user: '<svg class="ap-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    lock: '<svg class="ap-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    eye: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>'
  };

  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }

  function buildChrome() {
    if (!document.getElementById("ap-bg")) document.body.insertBefore(el('<div id="ap-bg" aria-hidden="true"><i></i><i></i><i></i></div>'), document.body.firstChild);
    if (!document.getElementById("ap-progress")) document.body.appendChild(el('<div id="ap-progress"></div>'));
    var fab = el('<button id="ap-fab" type="button" title="StudentDesk Settings (Alt+S)" aria-label="Theme settings">' + ICON.gear + "</button>");
    document.body.appendChild(fab);
    var p = el('<div id="ap-panel" role="dialog" aria-label="StudentDesk settings"></div>');
    document.body.appendChild(p);
    renderPanel(p);
    fab.addEventListener("click", function (e) { e.stopPropagation(); p.classList.toggle("open"); });
    document.addEventListener("click", function (e) { if (p.classList.contains("open") && !p.contains(e.target) && e.target !== fab) p.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") p.classList.remove("open");
      if (e.altKey && (e.key === "s" || e.key === "S")) { e.preventDefault(); p.classList.toggle("open"); }
      if (e.altKey && (e.key === "d" || e.key === "D")) { e.preventDefault(); S.mode = root.getAttribute("data-ap-mode") === "dark" ? "light" : "dark"; save(); apply(); renderPanel(p); }
    });
  }

  function seg(name, opts) {
    return '<div class="ap-seg" data-k="' + name + '">' + opts.map(function (o) {
      return '<button type="button" data-v="' + o[0] + '" class="' + (String(S[name]) === String(o[0]) ? "on" : "") + '">' + o[1] + "</button>"; }).join("") + "</div>";
  }
  function toggle(name, label) { return '<div class="ap-row"><span>' + label + '</span><label class="ap-tg"><input type="checkbox" data-k="' + name + '"' + (S[name] ? " checked" : "") + "><i></i></label></div>"; }
  function rangeVal(name) { var v = S[name]; return name === "scale" ? v + "%" : name === "blur" ? (v ? v + "px" : "Off") : v + "px"; }
  function range(name, label, min, max, step) { return '<div class="ap-row"><span>' + label + '</span><span class="ap-rg"><input type="range" data-k="' + name + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + S[name] + '" aria-label="' + label + '"><output data-o="' + name + '">' + rangeVal(name) + "</output></span></div>"; }
  /* live preview: shows Glass blur, Roundness and Text size the moment a slider moves */
  function preview() { return '<div class="ap-pv" aria-hidden="true"><i></i><i></i><i></i><span class="ap-pv-bgt">StudentDesk AIUB</span><div class="ap-pv-glass"><b>Live preview</b><small>Glass blur · Roundness · Text size</small><span class="ap-pv-chip">A</span></div></div>'; }

  function renderPanel(p) {
    p.innerHTML = "<h3>StudentDesk · Theme</h3><div class='ap-sub'>Choose a comfortable workspace.</div>" + seg("mode", [["light","Light"],["dark","Dark"],["auto","System"]]) + (!S.app?"<button type='button' class='ap-reset' id='ap-enable-studio'>Open StudentDesk workspace</button>":"");
    p.querySelectorAll(".ap-seg").forEach(function(g){g.onclick=function(e){var b=e.target.closest("button");if(!b)return;S.mode=b.dataset.v;save();apply();renderPanel(p);};});
    var enable=p.querySelector('#ap-enable-studio');if(enable)enable.onclick=function(){S.app=true;save();location.reload();};
  }

  /* ---- login page enhancements (pure UI; the real form is untouched) ---- */
  function enhanceLogin() {
    var form = document.getElementById("loginForm");
    if (!form) return;
    root.classList.add("ap-login");
    try { [localStorage, sessionStorage].forEach(function (st) { Object.keys(st).forEach(function (k) { if (k.indexOf("pp.c.") === 0 || k.indexOf("pp.reminded.") === 0) st.removeItem(k); }); }); } catch (e) {}  // signed out: forget cached portal data
    var u = document.getElementById("username"), pw = document.getElementById("password");
    if (u && !u.parentNode.querySelector(".ap-ico")) u.insertAdjacentHTML("beforebegin", ICON.user);
    if (pw && !pw.parentNode.querySelector(".ap-ico")) {
      pw.insertAdjacentHTML("beforebegin", ICON.lock);
      var eye = el('<button type="button" class="ap-eye" aria-label="Show password" aria-pressed="false">' + ICON.eye + "</button>");
      pw.insertAdjacentElement("afterend", eye);
      eye.addEventListener("click", function () { var show = pw.type === "password"; pw.type = show ? "text" : "password"; eye.setAttribute("aria-label",show?"Hide password":"Show password");eye.setAttribute("aria-pressed",String(show)); eye.innerHTML = show ? ICON.eyeOff : ICON.eye; pw.focus(); });
    }
    // Add programmatic labels without replacing controls, names, tokens or portal handlers.
    [[u,"AIUB ID","username"],[pw,"Password","current-password"]].forEach(function(item){var field=item[0];if(!field)return;if(!field.getAttribute("autocomplete"))field.setAttribute("autocomplete",item[2]);if(!form.querySelector('label[for="'+field.id+'"]')){var label=document.createElement("label");label.className="ap-login-label";label.htmlFor=field.id;label.textContent=item[1];field.parentNode.insertBefore(label,field.parentNode.firstChild);}field.setAttribute("autocapitalize","off");field.setAttribute("spellcheck","false");});
    var hdr = document.querySelector(".login_header");
    if (hdr && !document.getElementById("ap-greet")) {
      hdr.insertAdjacentHTML("beforebegin", '<div id="ap-login-brand">STUDENTDESK · AIUB</div><div id="ap-greet" role="heading" aria-level="1"></div>');
      var greet = function () {
        var h = new Date().getHours(); // user's own device time
        document.getElementById("ap-greet").textContent =
          h >= 5 && h < 12 ? "Good morning." : h >= 12 && h < 14 ? "Good afternoon." :
          h >= 14 && h < 17 ? "Good afternoon." : h >= 17 && h < 20 ? "Good evening." : "Good evening.";
      };
      greet(); setInterval(greet, 60000);
      hdr.textContent = "Sign in with your AIUB ID to continue";
    }
    if (!document.getElementById("ap-foot")) form.insertAdjacentHTML("afterend", '<div id="ap-foot">Sign-in is handled by AIUB. StudentDesk is an unofficial interface.</div>');
    var lf = document.querySelector(".login-form"); if (lf) {lf.style.top = "";var pane=form.parentElement,brand=lf.firstElementChild;if(pane&&pane!==lf&&brand&&brand!==pane){lf.classList.add("ap-login-studio");pane.classList.add("ap-login-entry");brand.classList.add("ap-login-identity");if(!brand.querySelector(".ap-login-story")){var story=document.createElement("div");story.className="ap-login-story";var art=window.StudentDeskArt?window.StudentDeskArt("home"):"";story.innerHTML='<span class="ap-login-kicker">YOUR STUDENT WORKSPACE</span><h2>Less clutter. <br>More clarity.</h2><div class="ap-login-illustration" aria-hidden="true">'+art+'</div><p>A little space to plan <br>what comes next.</p>';brand.appendChild(story);var note=document.createElement("small");note.className="ap-login-identity-note";note.textContent="Your day. Your courses. One thoughtful workspace.";brand.appendChild(note);}}}
    var cap = document.getElementById("captcha"), capIn = document.getElementById("CaptchaInputText");
    if(capIn){var capLabel=cap&&cap.querySelector("label");if(capLabel)capLabel.htmlFor=capIn.id;else capIn.setAttribute("aria-label","Captcha answer");}
    if(cap){var refresh=cap.querySelector("a.btn,button.btn");if(refresh){refresh.setAttribute("aria-label","Refresh captcha");refresh.setAttribute("title","Refresh captcha");refresh.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12 1l2 4M4 12l2 4a7 7 0 0 0 12 1"/></svg>';}}
    if (cap && capIn && window.MutationObserver) {
      var focusCap = function () { if (cap.style.display !== "none" && document.activeElement !== capIn) { capIn.setAttribute("inputmode", "numeric"); capIn.placeholder = "Answer"; } };
      focusCap(); new MutationObserver(focusCap).observe(cap, { attributes: true, attributeFilter: ["style"] });
    }
  }

  /* ---- smooth page transitions ---- */
  function transitions() {
    var leavingTimer;
    function leaving() { root.classList.add("ap-leaving"); clearTimeout(leavingTimer); leavingTimer = setTimeout(function () { root.classList.remove("ap-leaving"); }, 1600); }
    document.addEventListener("click", function (e) {
      if (S.performance || !S.trans || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#" || /^(javascript|mailto|tel):/i.test(href)) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download") || a.hasAttribute("data-toggle") || a.hasAttribute("onclick") || a.hasAttribute("data-ng-click")) return;
      var url; try { url = new URL(a.href, location.href); } catch (x) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      leaving();   // no artificial delay; restore if an AJAX page or download stays open
    }, false);
    document.addEventListener("submit", function (e) { if (!S.performance && S.trans) setTimeout(function () { if (!e.defaultPrevented) leaving(); }, 0); }, false);
    window.addEventListener("pageshow", function () { root.classList.remove("ap-leaving"); });
  }

  /* ---- ripple on buttons ---- */
  function ripple() {
    document.addEventListener("pointerdown", function (e) {
      if (S.performance || !S.anim || e.pointerType !== "mouse") return;
      var b = e.target.closest && e.target.closest(".btn, #ap-fab"); if (!b) return;
      var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement("span");
      s.className = "ap-ripple"; s.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
      b.appendChild(s); setTimeout(function () { s.remove(); }, 650);
    }, { passive: true });
  }

  /* ---- wrap wide tables so they scroll on phones ---- */
  function responsiveTables() {
    document.querySelectorAll("table.table, table").forEach(function (t) {
      if (t.closest(".table-responsive") || t.closest("#ap-panel")) return;
      if (t.offsetWidth > (t.parentElement ? t.parentElement.clientWidth : 0) + 4) {
        var w = document.createElement("div"); w.className = "table-responsive"; t.parentNode.insertBefore(w, t); w.appendChild(t);
      }
    });
  }


  /* ---- highlight the current page in menus ---- */
  function markCurrent() {
    var here = location.pathname.toLowerCase();
    document.querySelectorAll("#navigation-bar a.list-group-item, .drawer-body a.list-group-item, nav.navbar .navbar-nav > li > a").forEach(function (a) {
      try { var u = new URL(a.href, location.href); if (u.pathname.toLowerCase() === here && here !== "/") {
        a.classList.add("ap-current"); var pc = a.closest(".panel-collapse"); if (pc && window.jQuery) { try { window.jQuery(pc).collapse("show"); } catch (e) {} } } } catch (e) {}
    });
  }

  /* ---- colourful grade badges (visual only) ---- */
  var GRADE_RE = /\)\s*\[(A\+|A-?|B\+|B-?|C\+|C-?|D\+|D|F|W|UW|I)\]/g;
  function gcls(g) { var c = g.charAt(0); return c === "A" ? "ap-g-a" : c === "B" ? "ap-g-b" : c === "C" ? "ap-g-c" : c === "D" ? "ap-g-d" : c === "F" ? "ap-g-f" : "ap-g-x"; }
  function gradeChips() {
    var scope = document.getElementById("main-content"); if (!scope) return;
    if (!S.grades) { scope.querySelectorAll("span.ap-grade").forEach(function (sp) { sp.replaceWith(document.createTextNode(sp.dataset.raw)); }); return; }
    var w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = w.nextNode())) { if (n.parentNode.closest && n.parentNode.closest(".ap-grade,script,style,input,textarea,select")) continue; GRADE_RE.lastIndex = 0; if (GRADE_RE.test(n.nodeValue)) nodes.push(n); }
    scope.querySelectorAll("table").forEach(function (tb) {
      var hdr = tb.querySelector("tr"); if (!hdr) return; var idx = [];
      Array.prototype.forEach.call(hdr.children, function (c, i) { if (/grade|^\s*(MTG|FTG|FG)\s*$/i.test(c.textContent)) idx.push(i); });
      if (!idx.length) return;
      tb.querySelectorAll("tr").forEach(function (tr) { idx.forEach(function (i) { var td = tr.children[i];
        if (!td || td.tagName !== "TD" || td.querySelector(".ap-grade")) return; var g = td.textContent.trim();
        if (/^(A\+|A-?|B\+|B-?|C\+|C-?|D\+|D|F|W|UW|I)$/.test(g)) { td.innerHTML = ""; var sp = document.createElement("span"); sp.className = "ap-grade " + gcls(g); sp.textContent = g; sp.dataset.raw = g; td.appendChild(sp); }
      }); });
    });
    nodes.forEach(function (t) {
      var frag = document.createDocumentFragment(), txt = t.nodeValue, last = 0, m; GRADE_RE.lastIndex = 0;
      while ((m = GRADE_RE.exec(txt))) {
        var open = m[0].indexOf("[");
        frag.appendChild(document.createTextNode(txt.slice(last, m.index + open)));
        var sp = document.createElement("span"); sp.className = "ap-grade " + gcls(m[1]); sp.textContent = m[1]; sp.dataset.raw = m[0].slice(open); frag.appendChild(sp);
        last = m.index + m[0].length;
      }
      frag.appendChild(document.createTextNode(txt.slice(last))); t.parentNode.replaceChild(frag, t);
    });
  }

  /* ---- privacy blur targets (visual only) ---- */
  function privacyTargets() {
    document.querySelectorAll("#main-content td, #main-content th").forEach(function (td) {
      var k = td.textContent.trim().toLowerCase();
      if (k === "password" || k === "cgpa") {
        var row = td.parentElement, cells = Array.prototype.slice.call(row.children), i = cells.indexOf(td);
        var v = cells[i + 1] && cells[i + 1].textContent.trim() === ":" ? cells[i + 2] : cells[i + 1];
        var cls = k === "cgpa" ? "ap-cg" : "ap-private";  // CGPA is always blurred (tap to show / hide)
        if (v && !v.classList.contains(cls)) { v.classList.add(cls); v.addEventListener("click", function () { v.classList.toggle("ap-show"); }); }
        if (k === "cgpa" && cells.length >= 3) {  // CGPA column header: blur the numbers below it
          var tb = row.parentElement; Array.prototype.slice.call(tb ? tb.children : []).forEach(function (r2) {
            if (r2 === row || r2.children.length !== cells.length) return; var c2 = r2.children[i];
            if (c2 && /^\d(\.\d+)?$/.test(c2.textContent.trim()) && !c2.classList.contains("ap-cg")) { c2.classList.add("ap-cg"); c2.addEventListener("click", function () { c2.classList.toggle("ap-show"); }); }
          });
        }
      }
    });
  }

  /* ---- "Today" pill on the home schedule ---- */
  function todayPill() {
    document.querySelectorAll("#main-content .panel-body *").forEach(function (e) {
      if (e.children.length === 0 && /^(today)$/i.test(e.textContent.trim())) e.classList.add("ap-today-label");
    });
  }

  function enhanceInner() {
    markCurrent(); gradeChips(); privacyTargets(); todayPill();
    var mc = document.getElementById("main-content");
    if (mc && window.MutationObserver) { var tmr; new MutationObserver(function () { clearTimeout(tmr); tmr = setTimeout(function () { gradeChips(); responsiveTables(); }, 300); }).observe(mc, { childList: true, subtree: true }); }
  }

  function ready() {
    if (!document.querySelector('meta[name="viewport"][content*="initial-scale"]')) {
      var v = document.querySelector('meta[name="viewport"]') || document.head.appendChild(document.createElement("meta"));
      v.name = "viewport"; v.content = "width=device-width, initial-scale=1, viewport-fit=cover";
    }
    apply(); buildChrome(); enhanceLogin(); enhanceInner(); transitions(); ripple(); responsiveTables();
    var rw = innerWidth, rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (innerWidth !== rw) { rw = innerWidth; responsiveTables(); } }, 200); });
  }
  window.__aiubPlusAPI = { get: function () { return S; }, set: function (k, v) { S[k] = v; save(); apply(); }, apply: apply, renderPanel: renderPanel, save: save };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
