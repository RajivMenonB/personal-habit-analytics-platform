import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Progress from "./pages/Progress";


// ======================================================
// AUTH HELPERS
// ======================================================

const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};


// ======================================================
// PRIVATE ROUTE
// ======================================================

function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ======================================================
// PUBLIC ROUTE
// Prevent logged-in users from going back to Login/Register
// ======================================================

function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


// ======================================================
// APP
// ======================================================

export default function App() {
  return (
    <Routes>

      {/* ==================================================
          PUBLIC ROUTES
          ================================================== */}

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


      {/* ==================================================
          PROTECTED ROUTES
          ================================================== */}

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


      {/* ==================================================
          DEFAULT ROUTE
          ================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated() ? "/dashboard" : "/login"}
            replace
          />
        }
      />


      {/* ==================================================
          UNKNOWN URL
          ================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated() ? "/dashboard" : "/login"}
            replace
          />
        }
      />

    </Routes>
  );
}