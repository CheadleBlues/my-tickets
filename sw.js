/* Keeps the app shell available offline. (The last ticket status is kept by app.js in localStorage, not here.)
   Also receives ticket-update notifications (Firebase Cloud Messaging) when the app is closed. */
try {
  importScripts("config.js");
  var MT = self.MT_CONFIG || {};
  if (MT.FIREBASE && MT.FIREBASE_SDK) {
    importScripts(MT.FIREBASE_SDK + "firebase-app-compat.js", MT.FIREBASE_SDK + "firebase-messaging-compat.js");
    firebase.initializeApp(MT.FIREBASE);
    firebase.messaging();   // shows the notification itself when the app isn't open
  }
} catch (e) { /* offline or blocked – the app still works, just without notifications */ }

// Tapping a notification opens (or brings forward) the app
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) if ("focus" in list[i]) return list[i].focus();
    return self.clients.openWindow("./");
  }));
});
var CACHE = "mt-v7";
var SHELL = ["./", "index.html", "styles.css", "app.js", "config.js", "demo-data.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL.map(function (u) { return new Request(u, { cache: "reload" }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return; // engine calls and fonts go straight to the network
  // Network first so updates show straight away (no-cache = always check GitHub for a newer copy,
  // instead of trusting the browser's 10-minute copy); fall back to the cached copy when offline.
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(function (res) {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return res;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match("index.html"); }); }));
});
