import {
    getToken,
    onMessage
} from "firebase/messaging";

import { messaging } from "../firebase";


/* ============================================================
   FIREBASE VAPID KEY
   ============================================================ */

const VAPID_KEY =
    "BDhXFqmJ-ZzBvBMA5Jd5elFaftEXu2WFzyQ6PTFknLa-J1nCs-ouang7f0Q1G_y2AMmqkznaS7dfkER49GtjC7M";


/* ============================================================
   FOREGROUND SOUND
   ============================================================ */

/*
 * Browser notification sound is controlled by the browser and
 * Windows notification settings.
 *
 * We also create a small Web Audio beep for foreground
 * notifications.
 *
 * The AudioContext is unlocked after the user's first
 * interaction with the page.
 */

let audioContext = null;


const getAudioContext = () => {

    try {

        if (!audioContext) {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {
                return null;
            }

            audioContext =
                new AudioContextClass();
        }

        return audioContext;

    } catch (error) {

        console.warn(
            "Unable to create audio context:",
            error
        );

        return null;
    }
};


const unlockAudio = async () => {

    try {

        const context =
            getAudioContext();

        if (!context) {
            return;
        }

        if (
            context.state ===
            "suspended"
        ) {

            await context.resume();

        }

    } catch (error) {

        console.warn(
            "Unable to unlock notification audio:",
            error
        );

    }
};


/*
 * Unlock audio after a real user interaction.
 */

if (
    typeof window !==
    "undefined"
) {

    const unlockEvents = [
        "click",
        "touchstart",
        "keydown"
    ];


    unlockEvents.forEach(
        (eventName) => {

            window.addEventListener(
                eventName,
                unlockAudio,
                {
                    once: true,
                    passive: true
                }
            );

        }
    );
}


/* ============================================================
   PLAY FOREGROUND NOTIFICATION SOUND
   ============================================================ */

const playNotificationSound = async () => {

    try {

        const context =
            getAudioContext();

        if (!context) {
            return;
        }


        if (
            context.state ===
            "suspended"
        ) {

            await context.resume();

        }


        /*
         * First tone
         */

        const oscillator1 =
            context.createOscillator();

        const gainNode1 =
            context.createGain();


        oscillator1.type =
            "sine";

        oscillator1.frequency.setValueAtTime(
            880,
            context.currentTime
        );


        gainNode1.gain.setValueAtTime(
            0.0001,
            context.currentTime
        );

        gainNode1.gain.exponentialRampToValueAtTime(
            0.18,
            context.currentTime + 0.02
        );

        gainNode1.gain.exponentialRampToValueAtTime(
            0.0001,
            context.currentTime + 0.18
        );


        oscillator1.connect(
            gainNode1
        );

        gainNode1.connect(
            context.destination
        );


        oscillator1.start(
            context.currentTime
        );

        oscillator1.stop(
            context.currentTime + 0.2
        );


        /*
         * Second tone
         */

        const oscillator2 =
            context.createOscillator();

        const gainNode2 =
            context.createGain();


        oscillator2.type =
            "sine";

        oscillator2.frequency.setValueAtTime(
            1175,
            context.currentTime + 0.13
        );


        gainNode2.gain.setValueAtTime(
            0.0001,
            context.currentTime + 0.13
        );

        gainNode2.gain.exponentialRampToValueAtTime(
            0.15,
            context.currentTime + 0.15
        );

        gainNode2.gain.exponentialRampToValueAtTime(
            0.0001,
            context.currentTime + 0.34
        );


        oscillator2.connect(
            gainNode2
        );

        gainNode2.connect(
            context.destination
        );


        oscillator2.start(
            context.currentTime + 0.13
        );

        oscillator2.stop(
            context.currentTime + 0.35
        );


    } catch (error) {

        console.warn(
            "Foreground notification sound could not be played:",
            error
        );

    }
};


/* ============================================================
   REQUEST NOTIFICATION PERMISSION
   ============================================================ */

export async function requestNotificationPermission() {

    if (
        !(
            "Notification" in
            window
        )
    ) {

        console.error(
            "This browser does not support notifications."
        );

        return false;
    }


    /*
     * Already granted.
     */

    if (
        Notification.permission ===
        "granted"
    ) {

        return true;
    }


    /*
     * Already denied.
     */

    if (
        Notification.permission ===
        "denied"
    ) {

        console.warn(
            "Notification permission is blocked in browser settings."
        );

        return false;
    }


    try {

        const permission =
            await Notification.requestPermission();


        if (
            permission !==
            "granted"
        ) {

            console.warn(
                "Notification permission was not granted."
            );

            return false;
        }


        console.log(
            "✅ Notification permission granted."
        );


        return true;

    } catch (error) {

        console.error(
            "Notification permission request failed:",
            error
        );

        return false;
    }
}


/* ============================================================
   GET FCM TOKEN
   ============================================================ */

export async function getFCMToken() {

    try {

        /*
         * Ask for notification permission.
         */

        const permission =
            await requestNotificationPermission();


        if (!permission) {
            return null;
        }


        /*
         * Register Firebase service worker.
         */

        const registration =
            await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );


        console.log(
            "Firebase service worker registered:",
            registration
        );


        /*
         * Wait until the service worker is ready.
         */

        await navigator.serviceWorker.ready;


        /*
         * Get Firebase Cloud Messaging token.
         */

        const token =
            await getToken(
                messaging,
                {
                    vapidKey:
                        VAPID_KEY,

                    serviceWorkerRegistration:
                        registration
                }
            );


        if (!token) {

            console.warn(
                "No FCM token received."
            );

            return null;
        }


        console.log(
            "FCM token received."
        );


        return token;

    } catch (error) {

        console.error(
            "❌ Failed to get FCM token:",
            error
        );

        return null;
    }
}


/* ============================================================
   SHOW FOREGROUND BROWSER NOTIFICATION
   ============================================================ */

function showForegroundNotification(
    payload
) {

    /*
     * Browser doesn't support notifications.
     */

    if (
        !(
            "Notification" in
            window
        )
    ) {

        console.warn(
            "Browser notifications are not supported."
        );

        return;
    }


    /*
     * Permission isn't granted.
     */

    if (
        Notification.permission !==
        "granted"
    ) {

        console.warn(
            "Notification permission is not granted."
        );

        return;
    }


    const notificationPayload =
        payload?.notification ||
        {};


    const dataPayload =
        payload?.data ||
        {};


    const title =
        notificationPayload.title ||
        dataPayload.title ||
        "HabitMile 365";


    const body =
        notificationPayload.body ||
        dataPayload.body ||
        dataPayload.message ||
        "You have a new HabitMile 365 reminder.";


    const targetUrl =
        dataPayload.url ||
        "/habits";


    try {

        const notification =
            new Notification(
                title,
                {
                    body: body,

                    icon:
                        "/habitmile-dashboard.png",

                    badge:
                        "/habitmile-dashboard.png",

                    tag:
                        dataPayload.type ||
                        "habitmile-reminder",

                    renotify:
                        true,

                    silent:
                        false,

                    data: {
                        ...dataPayload,

                        url:
                            targetUrl
                    }
                }
            );


        /*
         * Play foreground sound.
         */

        playNotificationSound();


        /*
         * Clicking the notification opens
         * the appropriate HabitMile page.
         */

        notification.onclick =
            () => {

                try {

                    notification.close();

                    const absoluteUrl =
                        new URL(
                            targetUrl,
                            window.location.origin
                        ).href;


                    /*
                     * Focus existing HabitMile tab.
                     */

                    window.focus();


                    /*
                     * Navigate current application.
                     */

                    window.location.href =
                        absoluteUrl;

                } catch (error) {

                    console.warn(
                        "Unable to open notification target:",
                        error
                    );

                }

            };


        console.log(
            "🔔 Foreground browser notification displayed."
        );


    } catch (error) {

        console.error(
            "❌ Could not display foreground notification:",
            error
        );

    }
}


/* ============================================================
   LISTEN FOR FOREGROUND MESSAGES
   ============================================================ */

export function listenForForegroundMessages(
    callback
) {

    console.log(
        "🎧 Starting foreground FCM listener..."
    );


    /*
     * Firebase onMessage handles messages while the
     * HabitMile application is open and visible.
     */

    const unsubscribe =
        onMessage(
            messaging,
            async (payload) => {

                console.log(
                    "🔔 Foreground FCM message received:",
                    payload
                );


                /*
                 * Display the actual browser popup.
                 */

                showForegroundNotification(
                    payload
                );


                /*
                 * Preserve the callback used by App.jsx.
                 */

                if (callback) {

                    try {

                        callback(
                            payload
                        );

                    } catch (error) {

                        console.error(
                            "Foreground notification callback failed:",
                            error
                        );

                    }

                }

            }
        );


    console.log(
        "✅ Foreground FCM listener started."
    );


    /*
     * Return Firebase's unsubscribe function.
     */

    return unsubscribe;
}


/* ============================================================
   REGISTER DEVICE TOKEN
   ============================================================ */

export async function registerDeviceToken(
    token
) {

    if (!token) {

        console.warn(
            "Cannot register empty FCM token."
        );

        return false;
    }


    const jwt =
        localStorage.getItem(
            "token"
        );


    if (!jwt) {

        console.warn(
            "No JWT found. Device token registration skipped."
        );

        return false;
    }


    try {

        const response =
            await fetch(
                "http://localhost:8081/api/devices/register",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${jwt}`
                    },

                    body:
                        JSON.stringify({
                            token: token
                        })
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Device token registration failed:",
                response.status,
                errorText
            );

            return false;
        }


        console.log(
            "✅ FCM device token registered with backend."
        );


        return true;

    } catch (error) {

        console.error(
            "❌ Device token registration request failed:",
            error
        );

        return false;
    }
}