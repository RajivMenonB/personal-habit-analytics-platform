import { useEffect } from "react";
import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Progress from "./pages/Progress";

import {
    getFCMToken,
    registerDeviceToken,
    listenForForegroundMessages
} from "./services/notificationService";


// ======================================================
// AUTH HELPER
// ======================================================

const isAuthenticated = () => {
    return Boolean(
        localStorage.getItem("token")
    );
};


// ======================================================
// PRIVATE ROUTE
// ======================================================

function PrivateRoute({ children }) {
    if (!isAuthenticated()) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
}


// ======================================================
// PUBLIC ROUTE
// ======================================================

function PublicRoute({ children }) {
    return children;
}


// ======================================================
// APP
// ======================================================

export default function App() {

    // ==================================================
    // FIREBASE NOTIFICATION SETUP
    // ==================================================

    useEffect(() => {

        // ----------------------------------------------
        // Only initialize notifications for logged-in
        // users
        // ----------------------------------------------

        if (!isAuthenticated()) {

            console.log(
                "User is not logged in. Skipping notification setup."
            );

            return;
        }


        // ==================================================
        // FCM TOKEN SETUP
        // ==================================================

        const setupNotifications = async () => {

            try {

                console.log(
                    "Starting Firebase notification setup..."
                );


                // ------------------------------------------
                // Get Firebase FCM token
                // ------------------------------------------

                const token =
                    await getFCMToken();


                if (!token) {

                    console.warn(
                        "FCM token was not received."
                    );

                    return;
                }


                console.log(
                    "FCM token received successfully."
                );


                // ------------------------------------------
                // Register token with Spring Boot backend
                // ------------------------------------------

                const registered =
                    await registerDeviceToken(
                        token
                    );


                if (registered) {

                    console.log(
                        "Device is now registered for notifications."
                    );

                } else {

                    console.warn(
                        "Device token could not be registered with backend."
                    );
                }

            } catch (error) {

                console.error(
                    "Firebase notification setup failed:",
                    error
                );
            }
        };


        setupNotifications();


        // ==================================================
        // FOREGROUND FCM MESSAGE LISTENER
        // ==================================================

        const unsubscribe =
            listenForForegroundMessages(
                (payload) => {

                    console.log(
                        "Foreground notification received:",
                        payload
                    );


                    // --------------------------------------
                    // Read notification information
                    // --------------------------------------

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

                }
            );


        // ==================================================
        // CLEANUP
        // ==================================================

        return () => {

            if (unsubscribe) {
                unsubscribe();
            }

        };

    }, []);


    // ==================================================
    // ROUTES
    // ==================================================

    return (

        <Routes>

            {/* ==========================================
                PUBLIC ROUTES
                ========================================== */}

            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />


            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />


            {/* ==========================================
                PROTECTED ROUTES
                ========================================== */}

            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />


            <Route
                path="/goals"
                element={
                    <PrivateRoute>
                        <Goals />
                    </PrivateRoute>
                }
            />


            <Route
                path="/habits"
                element={
                    <PrivateRoute>
                        <Habits />
                    </PrivateRoute>
                }
            />


            <Route
                path="/progress"
                element={
                    <PrivateRoute>
                        <Progress />
                    </PrivateRoute>
                }
            />


            {/* ==========================================
                DEFAULT ROUTE
                ========================================== */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* ==========================================
                UNKNOWN URL
                ========================================== */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
    );
}