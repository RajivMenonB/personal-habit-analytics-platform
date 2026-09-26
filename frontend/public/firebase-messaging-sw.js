/* =========================================================
   HabitMile 365
   Firebase Cloud Messaging Service Worker
   ========================================================= */

/* ---------------------------------------------------------
   Firebase SDK
   Keep this version the same as your existing frontend setup.
   --------------------------------------------------------- */

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);


/* ---------------------------------------------------------
   Firebase Configuration
   --------------------------------------------------------- */

firebase.initializeApp({
  apiKey: "AIzaSyBE4cXWXxmpaM3LjmLjuicpOqJbs6Pciu4",
  authDomain: "habitmile-365.firebaseapp.com",
  projectId: "habitmile-365",
  storageBucket: "habitmile-365.firebasestorage.app",
  messagingSenderId: "341992791116",
  appId: "1:341992791116:web:caa574004b09b7995928e9",
  measurementId: "G-9S0YNQZ033"
});


/* ---------------------------------------------------------
   Firebase Messaging
   --------------------------------------------------------- */

const messaging = firebase.messaging();


/* ---------------------------------------------------------
   Background FCM Message
   --------------------------------------------------------- */

messaging.onBackgroundMessage((payload) => {

  console.log(
    "[firebase-messaging-sw.js] Background message received:",
    payload
  );


  /* -------------------------------------------------------
     Firebase can automatically display notifications when
     the FCM payload contains:

     payload.notification

     Therefore:

     - notification payload -> Firebase/browser handles it
     - data-only payload -> we manually display it

     This prevents duplicate notifications.
     ------------------------------------------------------- */

  const notificationPayload =
    payload.notification || null;

  const dataPayload =
    payload.data || {};


  /* -------------------------------------------------------
     Notification payload already exists
     ------------------------------------------------------- */

  if (notificationPayload) {

    console.log(
      "[firebase-messaging-sw.js] Notification payload detected."
    );

    console.log(
      "[firebase-messaging-sw.js] Browser/Firebase will handle display."
    );

    return;
  }


  /* -------------------------------------------------------
     DATA-ONLY MESSAGE
     ------------------------------------------------------- */

  const notificationTitle =
    dataPayload.title ||
    "HabitMile 365";


  const notificationBody =
    dataPayload.body ||
    dataPayload.message ||
    "You have a new HabitMile 365 reminder.";


  const notificationOptions = {

    body:
      notificationBody,

    icon:
      "/vite.svg",

    badge:
      "/vite.svg",

    tag:
      dataPayload.type ||
      "habitmile-reminder",

    renotify:
      true,

    requireInteraction:
      false,

    data:
      {
        ...dataPayload,

        url:
          dataPayload.url ||
          "/dashboard"
      }
  };


  console.log(
    "[firebase-messaging-sw.js] Showing data-only notification:",
    notificationTitle,
    notificationOptions
  );


  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});


/* ---------------------------------------------------------
   Notification Click
   --------------------------------------------------------- */

self.addEventListener(
  "notificationclick",
  (event) => {

    console.log(
      "[firebase-messaging-sw.js] Notification clicked."
    );


    /* Close notification */

    event.notification.close();


    /* Get URL */

    const notificationData =
      event.notification.data || {};


    const targetUrl =
      notificationData.url ||
      "/dashboard";


    console.log(
      "[firebase-messaging-sw.js] Opening:",
      targetUrl
    );


    /* -----------------------------------------------------
       Focus existing HabitMile tab if available.
       Otherwise open a new tab.
       ----------------------------------------------------- */

    event.waitUntil(

      clients.matchAll({

        type:
          "window",

        includeUncontrolled:
          true

      }).then(
        (clientList) => {

          for (
            const client of clientList
          ) {

            /*
             * If HabitMile is already open,
             * navigate it to dashboard and focus it.
             */

            if (
              client.url.includes(
                window.location.origin
              )
            ) {

              if (
                "navigate" in client
              ) {

                client.navigate(
                  targetUrl
                );
              }


              if (
                "focus" in client
              ) {

                return client.focus();
              }
            }
          }


          /* ------------------------------------------------
             No existing tab found.
             Open HabitMile dashboard.
             ------------------------------------------------ */

          if (
            clients.openWindow
          ) {

            return clients.openWindow(
              targetUrl
            );
          }


          return null;
        }
      )
    );
  }
);


/* ---------------------------------------------------------
   Service Worker Installation
   --------------------------------------------------------- */

self.addEventListener(
  "install",
  (event) => {

    console.log(
      "[firebase-messaging-sw.js] Service worker installed."
    );


    self.skipWaiting();
  }
);


/* ---------------------------------------------------------
   Service Worker Activation
   --------------------------------------------------------- */

self.addEventListener(
  "activate",
  (event) => {

    console.log(
      "[firebase-messaging-sw.js] Service worker activated."
    );


    event.waitUntil(
      self.clients.claim()
    );
  }
);