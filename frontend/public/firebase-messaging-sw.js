importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBE4cXWXxmpaM3LjmLjuicpOqJbs6Pciu4",
  authDomain: "habitmile-365.firebaseapp.com",
  projectId: "habitmile-365",
  storageBucket: "habitmile-365.firebasestorage.app",
  messagingSenderId: "341992791116",
  appId: "1:341992791116:web:caa574004b09b7995928e9",
  measurementId: "G-9S0YNQZ033"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message received:",
    payload
  );

  const notificationTitle =
    payload.notification?.title || "HabitMile 365";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "You have a new HabitMile 365 reminder.",
    icon: "/vite.svg",
    data: payload.data || {}
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});