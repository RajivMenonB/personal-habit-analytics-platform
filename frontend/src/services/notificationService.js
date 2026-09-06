import {
    getToken,
    onMessage
} from "firebase/messaging";

import { messaging } from "../firebase";


// ======================================================
// FIREBASE VAPID KEY
// ======================================================

const VAPID_KEY =
    "BDhXFqmJ-ZzBvBMA5Jd5elFaftEXu2WFzyQ6PTFknLa-J1nCs-ouang7f0Q1G_y2AMmqkznaS7dfkER49GtjC7M";


// ======================================================
// BACKEND API
// ======================================================

const DEVICE_API =
    "http://localhost:8081/api/devices";


// ======================================================
// REQUEST NOTIFICATION PERMISSION
// ======================================================

export async function requestNotificationPermission() {

    if (!("Notification" in window)) {

        console.error(
            "This browser does not support notifications."
        );

        return false;
    }


    // ----------------------------------------------
    // Already granted
    // ----------------------------------------------

    if (
        Notification.permission ===
        "granted"
    ) {

        console.log(
            "Notification permission already granted."
        );

        return true;
    }


    // ----------------------------------------------
    // Previously denied
    // ----------------------------------------------

    if (
        Notification.permission ===
        "denied"
    ) {

        console.warn(
            "Notification permission is blocked for this site."
        );

        return false;
    }


    // ----------------------------------------------
    // Ask browser permission
    // ----------------------------------------------

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
        "Notification permission granted."
    );

    return true;
}


// ======================================================
// GET FCM TOKEN
// ======================================================

export async function getFCMToken() {

    try {

        // ----------------------------------------------
        // Request notification permission
        // ----------------------------------------------

        const permission =
            await requestNotificationPermission();


        if (!permission) {

            return null;
        }


        // ----------------------------------------------
        // Register Firebase service worker
        // ----------------------------------------------

        const registration =
            await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );


        console.log(
            "Firebase service worker registered:",
            registration
        );


        // ----------------------------------------------
        // Get FCM token
        // ----------------------------------------------

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
            "FCM token:",
            token
        );


        return token;

    } catch (error) {

        console.error(
            "Failed to get FCM token:",
            error
        );

        return null;
    }
}


// ======================================================
// REGISTER DEVICE TOKEN WITH SPRING BOOT
// ======================================================

export async function registerDeviceToken(
    token
) {

    try {

        if (!token) {

            console.warn(
                "Cannot register empty FCM token."
            );

            return false;
        }


        // ----------------------------------------------
        // JWT token
        // ----------------------------------------------

        const jwtToken =
            localStorage.getItem(
                "token"
            );


        if (!jwtToken) {

            console.warn(
                "User is not authenticated."
            );

            return false;
        }


        console.log(
            "Registering FCM device with backend..."
        );


        // ----------------------------------------------
        // Send token to Spring Boot
        // ----------------------------------------------

        const response =
            await fetch(
                `${DEVICE_API}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${jwtToken}`
                    },

                    body: JSON.stringify({
                        token: token,

                        deviceType:
                            "WEB"
                    })
                }
            );


        // ----------------------------------------------
        // Backend rejected request
        // ----------------------------------------------

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Device registration failed:",
                response.status,
                errorText
            );

            return false;
        }


        // ----------------------------------------------
        // Success
        // ----------------------------------------------

        const data =
            await response.json();


        console.log(
            "Device registered successfully:",
            data
        );


        return true;

    } catch (error) {

        console.error(
            "Failed to register device token:",
            error
        );

        return false;
    }
}


// ======================================================
// FOREGROUND FCM MESSAGE LISTENER
// ======================================================

export function listenForForegroundMessages(
    callback
) {

    console.log(
        "Starting foreground FCM message listener..."
    );


    return onMessage(
        messaging,
        (payload) => {

            console.log(
                "Foreground FCM message received:",
                payload
            );


            // ------------------------------------------
            // Notification data
            // ------------------------------------------

            const notification =
                payload?.notification;


            const title =
                notification?.title ||
                payload?.data?.title ||
                "HabitMile 365";


            const body =
                notification?.body ||
                payload?.data?.body ||
                "You have a habit reminder.";


            console.log(
                "Notification title:",
                title
            );


            console.log(
                "Notification body:",
                body
            );


            // ------------------------------------------
            // Display browser notification
            // ------------------------------------------

            if (
                "Notification" in window &&
                Notification.permission ===
                    "granted"
            ) {

                try {

                    const browserNotification =
                        new Notification(
                            title,
                            {
                                body: body,

                                icon:
                                    "/favicon.ico",

                                tag:
                                    "habitmile-reminder",

                                requireInteraction:
                                    false
                            }
                        );


                    // ----------------------------------
                    // Notification click
                    // ----------------------------------

                    browserNotification.onclick =
                        () => {

                            window.focus();

                            browserNotification.close();
                        };


                    console.log(
                        "Browser notification displayed."
                    );

                } catch (error) {

                    console.error(
                        "Could not display browser notification:",
                        error
                    );
                }

            } else {

                console.warn(
                    "Browser notification permission is not granted."
                );
            }


            // ------------------------------------------
            // Send payload to React callback
            // ------------------------------------------

            if (callback) {

                callback(
                    payload
                );
            }
        }
    );
}