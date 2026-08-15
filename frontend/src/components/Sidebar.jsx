import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getGoals, getHabits, logoutUser } from "../services/api";

const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: "🏠",
  },
  {
    to: "/goals",
    label: "Goals",
    icon: "🎯",
  },
  {
    to: "/habits",
    label: "Habits",
    icon: "🔥",
  },
  {
    to: "/progress",
    label: "Progress",
    icon: "📊",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Unable to read user:", error);
      setUser({});
    }
  }, []);

  // =====================================================
  // LOAD GOALS + HABITS FROM BACKEND
  // =====================================================

  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        const [goalData, habitData] = await Promise.all([
          getGoals(),
          getHabits(),
        ]);

        setGoals(Array.isArray(goalData) ? goalData : []);
        setHabits(Array.isArray(habitData) ? habitData : []);
      } catch (error) {
        console.error("Failed to load sidebar data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSidebarData();
  }, []);

  // =====================================================
  // USER INFORMATION
  // =====================================================

  const name = user?.name || "User";
  const email = user?.email || "user@example.com";

  const initial = name.charAt(0).toUpperCase();

  // =====================================================
  // REAL STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const activeGoals = goals.filter(
      (goal) => goal.status !== "COMPLETED"
    ).length;

    const completedHabits = habits.filter(
      (habit) => habit.status === "COMPLETED"
    ).length;

    /*
     * Current streak.
     *
     * Your current backend Habit entity does not appear to
     * expose a real streak field, so we should NOT invent
     * a number here.
     *
     * We display "-" until streak calculation is implemented
     * in the backend.
     */
    const currentStreak = "-";

    return {
      activeGoals,
      completedHabits,
      currentStreak,
    };
  }, [goals, habits]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <aside className="hidden lg:flex w-72 min-h-screen bg-[#0b0b12] border-r border-white/10 p-6 flex-col sticky top-0">

      {/* =================================================
          BRAND
      ================================================= */}

      <div>
        <div className="flex items-center gap-3">

          {/* Logo */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-black font-black text-xl shadow-lg">
            H
          </div>

          {/* Brand Name */}
          <div>
            <h1 className="text-2xl font-black gradient-text">
              HabitMile 365
            </h1>

            <p className="text-gray-400 text-xs">
              Personal Habit Analytics
            </p>
          </div>

        </div>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="mt-10 space-y-3">

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `
              group
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-2xl
              transition-all
              duration-300

              ${
                isActive
                  ? `
                    bg-gradient-to-r
                    from-cyan-500/20
                    to-purple-500/20
                    border
                    border-cyan-400/30
                    text-white
                    shadow-lg
                  `
                  : `
                    text-gray-300
                    hover:bg-white/5
                    hover:text-white
                    border
                    border-transparent
                  `
              }
              `
            }
          >
            {/* Icon */}
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">
              {link.icon}
            </span>

            {/* Label */}
            <span className="font-medium">
              {link.label}
            </span>
          </NavLink>
        ))}

      </nav>

      {/* =================================================
          QUICK STATS
      ================================================= */}

      <div className="mt-8 glass rounded-3xl p-4 border border-white/10">

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            Your Progress
          </p>

          <span className="text-xs text-cyan-400">
            Live
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">

            <div className="h-4 bg-white/5 rounded animate-pulse" />

            <div className="h-4 bg-white/5 rounded animate-pulse" />

            <div className="h-4 bg-white/5 rounded animate-pulse" />

          </div>
        ) : (
          <div className="space-y-4">

            {/* Active Goals */}
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <span>🎯</span>

                <span className="text-sm text-gray-300">
                  Goals
                </span>
              </div>

              <span className="text-sm font-semibold text-cyan-300">
                {statistics.activeGoals} active
              </span>

            </div>

            {/* Completed Habits */}
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <span>🔥</span>

                <span className="text-sm text-gray-300">
                  Habits
                </span>
              </div>

              <span className="text-sm font-semibold text-purple-300">
                {statistics.completedHabits} done
              </span>

            </div>

            {/* Streak */}
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <span>⚡</span>

                <span className="text-sm text-gray-300">
                  Streak
                </span>
              </div>

              <span className="text-sm font-semibold text-emerald-300">
                {statistics.currentStreak === "-"
                  ? "-"
                  : `${statistics.currentStreak} days`}
              </span>

            </div>

          </div>
        )}

      </div>

      {/* =================================================
          USER PROFILE
      ================================================= */}

      <div className="mt-auto glass rounded-3xl p-4 border border-white/10">

        {/* User information */}
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-black font-bold shadow-lg">
            {initial}
          </div>

          {/* Name + Email */}
          <div className="min-w-0">

            <p className="font-semibold truncate">
              {name}
            </p>

            <p className="text-xs text-gray-400 truncate">
              {email}
            </p>

          </div>

        </div>

        {/* Divider */}
        <div className="mt-4 pt-4 border-t border-white/10">

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full
              py-2.5
              rounded-2xl
              bg-red-500/10
              text-red-300
              border
              border-red-500/20
              hover:bg-red-500/20
              hover:border-red-500/40
              transition-all
              duration-200
              font-medium
            "
          >
            Logout
          </button>

        </div>

      </div>

    </aside>
  );
}