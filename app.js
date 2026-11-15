/* My Tickets – Cheadle Blues members' app (plain JavaScript, no build step). */
(function () {
  "use strict";

  var CFG = window.MT_CONFIG || {};
  var DEMO = !CFG.API_URL;
  var app = document.getElementById("app");
  var logoutBtn = document.getElementById("logout");

  var state = { screen: "login", email: "", data: null, person: 0, game: null, error: "", busy: false, refreshing: false };

  /* ---------- small helpers ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function h(tag, attrs) {
    var el = document.createElement(tag), i, k;
    attrs = attrs || {};
    for (k in attrs) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === "text") el.textContent = v;
      else if (k === "html") el.innerHTML = v; // only ever used with our own fixed markup
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x) el.appendChild(typeof x === "string" ? document.createTextNode(x) : x); });
      else el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return el;
  }
  var CHEVRON = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4E5869" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  var BACK = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C2C5B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
  var SHARE = '<svg class="share-icon" aria-label="Share" role="img" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C2C5B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  var CLOSE = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /* ---------- talking to the engine (Stage 2) ---------- */
  function api(action, payload) {
    if (DEMO) return demoApi(action, payload);
    var body = Object.assign({ action: action }, payload || {});
    // text/plain avoids a CORS preflight, which Apps Script can't answer
    return fetch(CFG.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error((j && j.error) || "Something went wrong. Please try again."); return j; });
  }
  function demoApi(action, p) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (action === "requestCode") return resolve({ ok: true });
        if (action === "verify") return /^\d{6}$/.test(p.code || "") ? resolve({ ok: true, token: "demo" }) : reject(new Error("Please enter the 6-digit code."));
        if (action === "status") return resolve(Object.assign({ ok: true }, window.MT_DEMO));
        reject(new Error("Unknown request"));
      }, 350);
    });
  }

  /* ---------- actions ---------- */
  function go(patch) { Object.assign(state, patch); render(); window.scrollTo(0, 0); }
  function sendCode(email) {
    email = (email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return go({ email: email, error: "Please enter a valid email address." });
    go({ email: email, busy: true, error: "" });
    api("requestCode", { email: email })
      .then(function () { go({ screen: "code", busy: false }); })
      .catch(function (e) { go({ busy: false, error: e.message }); });
  }
  function verify(code) {
    code = (code || "").replace(/\D/g, "");
    if (code.length !== 6) return go({ error: "Please enter the 6-digit code." });
    go({ busy: true, error: "" });
    api("verify", { email: state.email, code: code })
      .then(function (j) { store("mt_token", j.token); store("mt_status", null); state.data = null; loadStatus(); })
      .catch(function (e) { go({ busy: false, error: e.message }); });
  }
  // The last status is kept on the phone so the app opens instantly, then refreshes in the background.
  function savedStatus() { try { return JSON.parse(store("mt_status") || "null"); } catch (e) { return null; } }
  function loadStatus() {
    var token = store("mt_token");
    if (!token) return go({ screen: "login", busy: false });
    if (state.refreshing) return;
    var saved = state.data || savedStatus();
    if (saved) {
      // show the saved copy straight away (keep whatever screen they're on)
      Object.assign(state, { data: saved, error: "", refreshing: true });
      if (state.screen !== "list" && state.screen !== "detail") state.screen = "list";
      render();
    } else {
      go({ screen: "loading", error: "", refreshing: true });
    }
    api("status", { token: token })
      .then(function (j) {
        store("mt_status", JSON.stringify(j));
        var people = j.people || [];
        var person = state.person < people.length ? state.person : 0;
        var game = state.screen === "detail" && people[person] && state.game < (people[person].games || []).length ? state.game : null;
        Object.assign(state, { data: j, person: person, game: game, busy: false, refreshing: false, error: "" });
        if (state.screen !== "detail" || game === null) state.screen = "list";
        render();
      })
      .catch(function (e) {
        state.refreshing = false;
        if (/expired|log in/i.test(e.message)) { store("mt_token", null); store("mt_status", null); return go({ screen: "login", data: null, busy: false, error: e.message }); }
        if (saved) { state.error = "Couldn’t update just now – showing your last saved status. Close and reopen the app to try again."; render(); }
        else go({ screen: "list", busy: false, error: e.message });
      });
  }
  function logout() {
    var token = store("mt_token");
    if (token && !DEMO) api("logout", { token: token }).catch(function () {});
    store("mt_token", null);
    store("mt_status", null);
    go({ screen: "login", email: "", data: null, person: 0, game: null, error: "" });
  }
  logoutBtn.addEventListener("click", logout);

  /* ---------- install tip ---------- */
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferredPrompt = e; render(); });
  function isStandalone() { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
  function installTip() {
    if (isStandalone() || store("mt_hide_install") === "1") return null;
    var close = h("button", { type: "button", class: "x", "aria-label": "Hide this tip", html: CLOSE, onclick: function () { store("mt_hide_install", "1"); render(); } });
    if (deferredPrompt) {
      return h("div", { class: "install" },
        h("div", { class: "install-text" }, h("strong", { text: "Add My Tickets to your home screen" }), h("br"), "One tap to check your tickets.",
          h("div", { style: "margin-top:10px" }, h("button", { type: "button", class: "btn", style: "min-height:44px;font-size:15px", text: "Install app", onclick: function () { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(function () { deferredPrompt = null; render(); }); } }))),
        close);
    }
    if (isIOS()) {
      var t = h("div", { class: "install-text" });
      t.innerHTML = "<strong>Add My Tickets to your home screen</strong><br>In Safari, tap " + SHARE + " <strong>Share</strong>, then <strong>Add to Home Screen</strong>.";
      return h("div", { class: "install" }, t, close);
    }
    return null;
  }

  /* ---------- screens ---------- */
  function loginScreen() {
    var input = h("input", { id: "email", type: "email", inputmode: "email", autocomplete: "email", placeholder: "you@example.com", value: state.email });
    var form = h("form", { class: "stack", novalidate: true, onsubmit: function (e) { e.preventDefault(); sendCode(input.value); } },
      h("div", { class: "field" }, h("label", { for: "email", text: "Email address" }), input),
      state.error ? h("div", { class: "error", role: "alert", text: state.error }) : null,
      h("button", { type: "submit", class: "btn", disabled: state.busy, text: state.busy ? "Sending…" : "Send my code" }));
    return h("div", { class: "pad stack" },
      h("div", { class: "stack", style: "gap:8px" },
        h("h1", { text: "Check your away tickets" }),
        h("p", { class: "lead", text: "Enter the email address you gave the branch. We’ll send you a 6-digit code – no password needed." })),
      form,
      h("p", { class: "muted", text: "Only email addresses on the Cheadle Blues members list can log in. Not working? Message Pete." }),
      installTip());
  }
  function codeScreen() {
    var input = h("input", { id: "code", class: "code", inputmode: "numeric", autocomplete: "one-time-code", maxlength: "6", placeholder: "••••••" });
    var form = h("form", { class: "stack", novalidate: true, onsubmit: function (e) { e.preventDefault(); verify(input.value); } },
      h("div", { class: "field" }, h("label", { for: "code", text: "6-digit code" }), input),
      state.error ? h("div", { class: "error", role: "alert", text: state.error }) : null,
      h("button", { type: "submit", class: "btn", disabled: state.busy, text: state.busy ? "Checking…" : "Log in" }));
    setTimeout(function () { input.focus(); }, 50);
    return h("div", { class: "pad stack" },
      h("div", { class: "stack", style: "gap:8px" },
        h("h1", { text: "Check your email" }),
        h("p", { class: "lead" }, "We’ve sent a 6-digit code to ", h("strong", { text: state.email }), ". It lasts 10 minutes. Check your junk folder if it’s not there.")),
      form,
      h("button", { type: "button", class: "link-btn", text: "Use a different email", onclick: function () { go({ screen: "login", error: "" }); } }));
  }
  function listScreen() {
    var d = state.data || { people: [] };
    var people = d.people || [];
    var person = people[state.person] || { games: [] };
    var tabs = people.length > 1 ? h("div", { class: "tabs", role: "tablist", "aria-label": "Household member" },
      people.map(function (p, i) {
        return h("button", { type: "button", class: "tab", role: "tab", "aria-selected": i === state.person ? "true" : "false", text: p.name, onclick: function () { go({ person: i }); } });
      })) : null;
    var games = (person.games || []).map(function (g, i) {
      var card = h("button", { type: "button", class: "game", onclick: function () { go({ screen: "detail", game: i }); } },
        h("div", { class: "game-top" },
          h("div", null, h("div", { class: "team", text: g.team }), h("div", { class: "when", text: g.when })),
          h("span", { html: CHEVRON })),
        h("div", { class: "pills" },
          h("span", { class: "pill " + (g.tone || "grey"), text: g.ticketShort }),
          g.coachShort ? h("span", { class: "pill coach", text: g.coachShort }) : null),
        g.action ? h("div", { class: "action", text: g.action }) : null);
      return card;
    });
    return h("div", { class: "list-wrap" },
      h("div", { class: "stack", style: "gap:4px" },
        h("h1", { class: "small", text: d.greeting || "My tickets" }),
        state.refreshing ? h("p", { class: "muted updating", role: "status", text: "Updating…" })
          : d.updated ? h("p", { class: "muted", text: "Updated from Pete’s lists: " + d.updated }) : null),
      state.error ? h("div", { class: "error", role: "alert", text: state.error }) : null,
      tabs,
      games.length ? h("div", { class: "games" }, games) : h("div", { class: "empty", text: "You don’t have any ticket applications open at the moment. Names for upcoming games are taken at branch meetings." }),
      CFG.CONTACT_URL ? h("a", { class: "btn outline", href: CFG.CONTACT_URL, target: "_blank", rel: "noopener", text: "Something wrong? Message Pete" }) : null,
      installTip());
  }
  function detailScreen() {
    var d = state.data || { people: [] };
    var person = (d.people || [])[state.person];
    var g = person && person.games[state.game];
    if (!g) { state.screen = "list"; return listScreen(); }
    function section(label, text) { return text ? h("div", { class: "section" }, h("div", { class: "label", text: label }), h("div", { class: "body", text: text })) : null; }
    return h("div", { class: "list-wrap" },
      h("button", { type: "button", class: "back", onclick: function () { go({ screen: "list", game: null }); } }, h("span", { html: BACK }), "All games"),
      h("div", { class: "stack", style: "gap:4px" },
        h("div", { class: "eyebrow", text: (d.people.length > 1 ? person.name + " · " : "") + (g.comp || "") }),
        h("h1", { text: g.team }),
        h("div", { class: "lead", text: g.when })),
      h("div", { class: "panel" },
        h("div", { class: "section" },
          h("div", { class: "label", text: "TICKET" }),
          h("div", null, h("span", { class: "pill " + (g.tone || "grey"), text: g.ticketShort })),
          h("div", { class: "body", text: g.ticketLine })),
        section("PAYMENT", g.paidLine),
        section("COACH", g.coachLine)),
      g.next ? h("div", { class: "next" }, h("div", { class: "label", text: "WHAT HAPPENS NEXT" }), h("div", { class: "body", text: g.next })) : null,
      h("p", { class: "muted", text: "If your circumstances change and you can’t make the game, please let Pete know straight away. Don’t offer your ticket to anyone else – Pete will reallocate it within the branch." }),
      CFG.CONTACT_URL ? h("a", { class: "btn", href: CFG.CONTACT_URL, target: "_blank", rel: "noopener", text: "Message Pete about this game" }) : null);
  }

  function render() {
    var s = state.screen, view;
    if (s === "loading") view = h("div", { class: "spinner", role: "status", "aria-label": "Loading" });
    else if (s === "code") view = codeScreen();
    else if (s === "list") view = listScreen();
    else if (s === "detail") view = detailScreen();
    else view = loginScreen();
    app.replaceChildren(view);
    logoutBtn.hidden = !(s === "list" || s === "detail");
    document.getElementById("demo-banner").hidden = !DEMO;
  }

  /* ---------- start ---------- */
  if (store("mt_token")) loadStatus(); else render();
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && (state.screen === "list" || state.screen === "detail") && store("mt_token")) loadStatus();
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
