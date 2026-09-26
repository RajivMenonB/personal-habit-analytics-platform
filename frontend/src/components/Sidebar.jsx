import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  getGoals,
  getHabits,
  logoutUser,
} from "../services/api";

import "../../src/App.css";

const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: "⌂",
  },
  {
    to: "/goals",
    label: "Goals",
    icon: "◇",
  },
  {
    to: "/habits",
    label: "Habits",
    icon: "○",
  },
  {
    to: "/progress",
    label: "Progress",
    icon: "↗",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     USER
  ===================================================== */

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        "Unable to read user:",
        error
      );

      setUser({});
    }
  }, []);

  /* =====================================================
     SIDEBAR DATA
  ===================================================== */

  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        const [
          goalData,
          habitData,
        ] = await Promise.all([
          getGoals(),
          getHabits(),
        ]);

        setGoals(
          Array.isArray(goalData)
            ? goalData
            : []
        );

        setHabits(
          Array.isArray(habitData)
            ? habitData
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load sidebar data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadSidebarData();
  }, []);

  /* =====================================================
     USER INFORMATION
     ===================================================== */

  /*
   * The backend now returns:
   *
   * {
   *   id,
   *   name,
   *   email
   * }
   *
   * after successful login.
   */

  const name =
    user?.name?.trim() ||
    user?.username?.trim() ||
    "User";

  const email =
    user?.email?.trim() ||
    "";

  const initial =
    name.charAt(0).toUpperCase() ||
    "U";

  /* =====================================================
     STATISTICS
  ===================================================== */

  const statistics = useMemo(() => {
    const activeGoals =
      goals.filter(
        (goal) =>
          goal.completed !== true &&
          goal.status !== "COMPLETED"
      ).length;

    const completedHabits =
      habits.filter(
        (habit) =>
          habit.completed === true ||
          habit.status === "COMPLETED"
      ).length;

    return {
      activeGoals,
      completedHabits,
      currentStreak: "-",
    };
  }, [goals, habits]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    logoutUser();

    navigate("/login", {
      replace: true,
    });
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <aside className="hm-sidebar hidden lg:flex flex-col p-5">

      {/* =================================================
          BRAND
      ================================================= */}

      <div className="hm-brand">

        <div className="flex items-center gap-3">

          <div className="hm-brand-logo">
            H
          </div>

          <div className="min-w-0">

            <h1 className="hm-brand-name">
              HabitMile <span>365</span>
            </h1>

            <p className="hm-brand-subtitle">
              Personal Habit Analytics
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="mt-7">

        <p className="hm-sidebar-label px-2">
          Workspace
        </p>

        <nav className="hm-nav">

          {links.map((link) => (

            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `hm-nav-item ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span className="hm-nav-icon">
                {link.icon}
              </span>

              <span>
                {link.label}
              </span>

              <span className="ml-auto text-[10px] opacity-50">
                →
              </span>

            </NavLink>

          ))}

        </nav>

      </div>


      {/* =================================================
          PROGRESS
      ================================================= */}

      <div className="hm-side-card">

        <div className="flex items-center justify-between mb-3">

          <p className="hm-side-card-title">
            Your Progress
          </p>

          <span className="hm-live">
            Live
          </span>

        </div>


        {loading ? (

          <div className="space-y-2">

            <div className="h-7 rounded-lg bg-white/[0.025] animate-pulse" />

            <div className="h-7 rounded-lg bg-white/[0.025] animate-pulse" />

            <div className="h-7 rounded-lg bg-white/[0.025] animate-pulse" />

          </div>

        ) : (

          <div>

            <div className="hm-side-stat">

              <div className="hm-side-stat-label">

                <span className="hm-nav-icon">
                  ◇
                </span>

                <span>
                  Goals
                </span>

              </div>

              <span className="hm-side-stat-value">
                {statistics.activeGoals}
              </span>

            </div>


            <div className="hm-side-stat">

              <div className="hm-side-stat-label">

                <span className="hm-nav-icon">
                  ○
                </span>

                <span>
                  Habits
                </span>

              </div>

              <span className="hm-side-stat-value">
                {statistics.completedHabits}
              </span>

            </div>


            <div className="hm-side-stat">

              <div className="hm-side-stat-label">

                <span className="hm-nav-icon">
                  ↗
                </span>

                <span>
                  Streak
                </span>

              </div>

              <span className="hm-side-stat-value">
                {statistics.currentStreak}
              </span>

            </div>

          </div>

        )}

      </div>


      {/* =================================================
          USER
      ================================================= */}

      <div className="hm-sidebar-user">

        <div className="flex items-center gap-3">

          <div className="hm-avatar">
            {initial}
          </div>

          <div className="min-w-0">

            <p className="hm-user-name truncate">
              {name}
            </p>

            <p className="hm-user-email truncate">
              {email || " "}
            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={handleLogout}
          className="hm-signout"
        >
          Sign out
        </button>

      </div>

    </aside>
  );
}