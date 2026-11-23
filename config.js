/*
  My Tickets – settings.
  Everything in this repository is PUBLIC. Never put member names, emails,
  phone numbers, points or ticket details in here – they live in the
  Google Sheets and come through the Apps Script engine after login.
*/
self.MT_CONFIG = {   // "self" so the service worker can read it too (notifications)
  // Web app URL of the Google Apps Script engine (Stage 2).
  // Leave empty to run the preview with made-up members.
  API_URL: "https://script.google.com/macros/s/AKfycbzBzBcF35ck8WtYSX3KtzX4nXti3cHff7RMQ3oReN3ScqM6yfFLMZeUdTcI93jt6yf6/exec",

  // Optional "Message Pete" link (e.g. https://wa.me/447...). Leave empty to hide the button.
  // Note: whatever goes here is publicly visible.
  CONTACT_URL: "",

  // Notifications (Firebase Cloud Messaging) – these are PUBLIC identifiers, safe to publish.
  // The private key is kept only in the engine's Script properties.
  FIREBASE: {
    apiKey: "AIzaSyDQBzzj46ImgsfAsI8aVEs4y87SfgppsZE",
    authDomain: "cheadle-blues-app.firebaseapp.com",
    projectId: "cheadle-blues-app",
    storageBucket: "cheadle-blues-app.firebasestorage.app",
    messagingSenderId: "956230202102",
    appId: "1:956230202102:web:a8bfed43cb92e5509972d7"
  },
  VAPID_KEY: "BAX-jqVer7nsW6hNKbeUmqOXXWlJGAFsK1vQ_4qeoSlvivyBzeeilFQG18G_Z89dNZ0D4Jg5vC82116MIldXNr0",
  FIREBASE_SDK: "https://www.gstatic.com/firebasejs/10.12.2/"
};
