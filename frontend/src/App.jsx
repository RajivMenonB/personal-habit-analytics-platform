import { useEffect, useRef } from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyRegister from "./pages/VerifyRegister";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Progress from "./pages/Progress";

import {
  getFCMToken,
  registerDeviceToken,
  listenForForegroundMessages,
} from "./services/notificationService";

import "./App.css";


/* =========================================================
   AUTHENTICATION
   ========================================================= */

const getAuthToken = () => {
  return localStorage.getItem("token");
};


const isAuthenticated = () => {
  return Boolean(getAuthToken());
};


/* =========================================================
   PRIVATE ROUTE
   ========================================================= */

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


/* =========================================================
   PUBLIC ROUTE
   ========================================================= */

function PublicRoute({ children }) {
  return children;
}


/* =========================================================
   APP
   ========================================================= */

export default function App() {

  /*
   * Keeps track of the token for which FCM registration
   * has already been completed.
   */
  const registeredTokenRef = useRef(null);


  /* =======================================================
     FIREBASE NOTIFICATION SYSTEM
     
     IMPORTANT:
     The foreground listener is started independently
     from authentication.
     
     This prevents the old problem where:
     
     App starts
          ↓
     No JWT yet
          ↓
     return
          ↓
     foreground listener never starts
     
     The listener must exist whenever the application
     is running.
     ======================================================= */

  useEffect(() => {

    let mounted = true;

    let authCheckTimer = null;


    console.log(
      "🔔 HabitMile 365 notification system initializing..."
    );


    /* =====================================================
       FOREGROUND FCM LISTENER
       ===================================================== */

    const unsubscribe =
      listenForForegroundMessages(
        (payload) => {

          if (!mounted) {
            return;
          }

          console.log(
            "🔔 Foreground notification received:",
            payload
          );

        }
      );


    /* =====================================================
       AUTHENTICATED FCM DEVICE REGISTRATION
       ===================================================== */

    const setupAuthenticatedNotifications =
      async () => {

        if (!mounted) {
          return;
        }


        const token =
          getAuthToken();


        /* -------------------------------------------------
           User is not logged in.
           
           IMPORTANT:
           Do NOT stop the foreground listener.
           Only skip device registration.
           ------------------------------------------------- */

        if (!token) {

          console.log(
            "User is not logged in. Waiting for authentication..."
          );

          return;
        }


        /* -------------------------------------------------
           Already registered this JWT.
           ------------------------------------------------- */

        if (
          registeredTokenRef.current ===
          token
        ) {

          return;
        }


        try {

          console.log(
            "🔐 Authenticated user detected."
          );

          console.log(
            "Starting Firebase notification setup..."
          );


          /* ===============================================
             GET FCM TOKEN
             =============================================== */

          const fcmToken =
            await getFCMToken();


          if (!mounted) {
            return;
          }


          if (!fcmToken) {

            console.warn(
              "⚠️ FCM token was not received."
            );

            return;
          }


          console.log(
            "✅ FCM token received successfully."
          );


          /* ===============================================
             REGISTER DEVICE TOKEN WITH BACKEND
             =============================================== */

          const registered =
            await registerDeviceToken(
              fcmToken
            );


          if (!mounted) {
            return;
          }


          if (registered) {

            registeredTokenRef.current =
              token;


            console.log(
              "✅ Device is now registered for notifications."
            );

          } else {

            console.warn(
              "⚠️ Device token could not be registered with backend."
            );

          }

        } catch (error) {

          console.error(
            "❌ Firebase notification setup failed:",
            error
          );

        }

      };


    /* =====================================================
       INITIAL CHECK
       ===================================================== */

    setupAuthenticatedNotifications();


    /* =====================================================
       AUTHENTICATION WATCHER
       
       This handles situations where the user logs in
       without the entire React application being recreated.
       
       It also makes the notification setup more robust
       against timing issues during login.
       ===================================================== */

    authCheckTimer =
      window.setInterval(() => {

        if (!mounted) {
          return;
        }

        setupAuthenticatedNotifications();

      }, 1500);


    /* =====================================================
       CLEANUP
       ===================================================== */

    return () => {

      mounted = false;


      if (authCheckTimer) {

        window.clearInterval(
          authCheckTimer
        );

      }


      if (
        typeof unsubscribe ===
        "function"
      ) {

        unsubscribe();

      }

    };

  }, []);


  /* =======================================================
     ROUTES
     ======================================================= */

  return (
    <div className="app-shell">

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
            ================================================= */}

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


        {/* =================================================
            REGISTER OTP
            ================================================= */}

        <Route
          path="/verify-register"
          element={
            <PublicRoute>
              <VerifyRegister />
            </PublicRoute>
          }
        />


        {/* =================================================
            FORGOT PASSWORD
            ================================================= */}

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />


        {/* =================================================
            PROTECTED ROUTES
            ================================================= */}

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


        {/* =================================================
            DEFAULT ROUTE
            ================================================= */}

        <Route
          path="/"
          element={

            isAuthenticated() ? (

              <Navigate
                to="/dashboard"
                replace
              />

            ) : (

              <Navigate
                to="/login"
                replace
              />

            )

          }
        />


        {/* =================================================
            UNKNOWN ROUTES
            ================================================= */}

        <Route
          path="*"
          element={

            isAuthenticated() ? (

              <Navigate
                to="/dashboard"
                replace
              />

            ) : (

              <Navigate
                to="/login"
                replace
              />

            )

          }
        />

      </Routes>

    </div>
  );
}