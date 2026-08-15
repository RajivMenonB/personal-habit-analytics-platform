import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { getGoals, getHabits } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // CURRENT USER
  // ======================================================

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userName =
    user?.name ||
    user?.username ||
    "User";

  // ======================================================
  // LOAD DASHBOARD DATA
  // ======================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [goalData, habitData] = await Promise.all([
        getGoals(),
        getHabits(),
      ]);

      setGoals(Array.isArray(goalData) ? goalData : []);
      setHabits(Array.isArray(habitData) ? habitData : []);
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ======================================================
  // TODAY
  // ======================================================

  const today = new Date();

  const todayString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  // ======================================================
  // DATE RANGE CHECK
  // ======================================================

  const isDateInRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return true;
    }

    return (
      todayString >= startDate &&
      todayString <= endDate
    );
  };

  // ======================================================
  // ACTIVE GOALS
  // ======================================================

  const activeGoals = useMemo(() => {
    return goals.filter((goal) => {
      if (goal.completed === true) {
        return false;
      }

      if (goal.status === "COMPLETED") {
        return false;
      }

      return true;
    });
  }, [goals]);

  // ======================================================
  // COMPLETED GOALS
  // ======================================================

  const completedGoals = useMemo(() => {
    return goals.filter(
      (goal) =>
        goal.completed === true ||
        goal.status === "COMPLETED"
    );
  }, [goals]);

  // ======================================================
  // TODAY'S HABITS
  // ======================================================

  const todayHabits = useMemo(() => {
    return habits.filter((habit) => {
      return isDateInRange(
        habit.startDate,
        habit.endDate
      );
    });
  }, [habits, todayString]);

  // ======================================================
  // COMPLETED HABITS
  // ======================================================

  const completedHabits = useMemo(() => {
    return habits.filter(
      (habit) =>
        habit.completed === true ||
        habit.status === "COMPLETED"
    );
  }, [habits]);

  // ======================================================
  // HABIT PROGRESS
  // ======================================================

  const habitProgress = useMemo(() => {
    if (habits.length === 0) {
      return 0;
    }

    let totalTarget = 0;
    let totalCurrent = 0;

    habits.forEach((habit) => {
      const target = Number(habit.targetCount || 0);
      const current = Number(habit.currentProgress || 0);

      if (target > 0) {
        totalTarget += target;
        totalCurrent += Math.min(current, target);
      }
    });

    if (totalTarget === 0) {
      return completedHabits.length === habits.length
        ? 100
        : 0;
    }

    return Math.round(
      (totalCurrent / totalTarget) * 100
    );
  }, [habits, completedHabits]);

  // ======================================================
  // GOAL PROGRESS
  // ======================================================

  const goalProgress = useMemo(() => {
    if (goals.length === 0) {
      return 0;
    }

    let totalTarget = 0;
    let totalCurrent = 0;

    goals.forEach((goal) => {
      const target = Number(goal.targetValue || 0);
      const current = Number(goal.currentProgress || 0);

      if (target > 0) {
        totalTarget += target;
        totalCurrent += Math.min(current, target);
      }
    });

    if (totalTarget === 0) {
      return completedGoals.length === goals.length
        ? 100
        : 0;
    }

    return Math.round(
      (totalCurrent / totalTarget) * 100
    );
  }, [goals, completedGoals]);

  // ======================================================
  // DASHBOARD STATISTICS
  // ======================================================

  const stats = {
    totalGoals: goals.length,
    activeGoals: activeGoals.length,
    completedGoals: completedGoals.length,

    totalHabits: habits.length,
    activeHabits: todayHabits.length,
    completedHabits: completedHabits.length,

    habitProgress,
    goalProgress,
  };

  // ======================================================
  // STATUS LABEL
  // ======================================================

  const getStatusLabel = (status) => {
    if (!status) {
      return "Not Started";
    }

    switch (status) {
      case "COMPLETED":
        return "Completed";

      case "IN_PROGRESS":
        return "In Progress";

      case "NOT_STARTED":
        return "Not Started";

      case "PENDING":
        return "Pending";

      default:
        return status
          .replaceAll("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (char) =>
            char.toUpperCase()
          );
    }
  };

  // ======================================================
  // STATUS STYLE
  // ======================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";

      case "IN_PROGRESS":
        return "bg-cyan-400/10 text-cyan-400 border-cyan-400/20";

      case "NOT_STARTED":
        return "bg-white/5 text-gray-400 border-white/10";

      case "PENDING":
        return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";

      default:
        return "bg-white/5 text-gray-300 border-white/10";
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-white/10 border-t-cyan-400 animate-spin" />

          <p className="mt-4 text-gray-400">
            Loading HabitMile 365...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // DASHBOARD
  // ======================================================

  return (
    <div className="min-h-screen bg-[#07070c] text-white flex">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">

        {/* TOPBAR */}
        <Topbar
          title="Dashboard"
          user={user}
        />

        {/* ERROR */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between gap-4">

            <span>{error}</span>

            <button
              onClick={loadDashboard}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
            >
              Retry
            </button>

          </div>
        )}

        {/* =================================================
            WELCOME BANNER
        ================================================= */}

        <section className="mt-6 glass rounded-[32px] p-6 lg:p-8 relative overflow-hidden">

          {/* BACKGROUND */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-transparent to-purple-500/10" />

          <div className="absolute w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl -top-32 -right-20" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">

            {/* TEXT */}
            <div className="flex-1">

              <p className="text-cyan-400 font-medium">
                Welcome back, {userName} 👋
              </p>

              <h1 className="text-4xl lg:text-5xl font-black mt-2 leading-tight">
                Build habits.
                <br />

                <span className="gradient-text">
                  Achieve goals.
                </span>
              </h1>

              <p className="text-gray-400 mt-4 max-w-xl leading-relaxed">
                Track your habits, manage your goals,
                measure your consistency, and turn
                everyday actions into long-term progress
                with HabitMile 365.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">

                <button
                  onClick={() => navigate("/goals")}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold hover:scale-105 transition"
                >
                  + New Goal
                </button>

                <button
                  onClick={() => navigate("/habits")}
                  className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  + Add Habit
                </button>

              </div>

            </div>

            {/* IMAGE + COMPLETION */}
            <div className="flex items-center gap-4 flex-shrink-0">

              {/* HABITMILE IMAGE */}
              <div className="hidden md:flex w-32 lg:w-40 xl:w-44 h-44 items-center justify-center">

                <img
                  src="/habitmile-dashboard.png"
                  alt="HabitMile 365 productivity"
                  className="w-full h-full object-contain drop-shadow-[0_15px_35px_rgba(168,85,247,0.25)]"
                />

              </div>

              {/* COMPLETION CARD */}
              <div className="glass rounded-3xl p-5 w-52 lg:w-56">

                <p className="text-sm text-gray-400 mb-3">
                  Habit Completion
                </p>

                <div className="relative w-36 h-36 mx-auto">

                  <svg
                    className="w-36 h-36 -rotate-90"
                    viewBox="0 0 144 144"
                  >

                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="10"
                      fill="none"
                    />

                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="url(#dashGrad)"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="377"
                      strokeDashoffset={
                        377 -
                        (377 * stats.habitProgress) / 100
                      }
                    />

                    <defs>
                      <linearGradient
                        id="dashGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#67e8f9"
                        />

                        <stop
                          offset="100%"
                          stopColor="#a855f7"
                        />
                      </linearGradient>
                    </defs>

                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <span className="text-3xl font-black">
                      {stats.habitProgress}%
                    </span>

                    <span className="text-xs text-gray-400">
                      Completed
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">

          <div className="glass rounded-3xl p-5">
            <p className="text-sm text-gray-400">
              Active Goals
            </p>

            <p className="text-3xl font-black mt-2">
              {stats.activeGoals}
            </p>

            <p className="text-xs text-cyan-400 mt-1">
              {stats.completedGoals} completed
            </p>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="text-sm text-gray-400">
              Active Habits
            </p>

            <p className="text-3xl font-black mt-2">
              {stats.activeHabits}
            </p>

            <p className="text-xs text-purple-400 mt-1">
              {stats.totalHabits} total
            </p>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="text-sm text-gray-400">
              Completed Habits
            </p>

            <p className="text-3xl font-black mt-2">
              {stats.completedHabits}
            </p>

            <p className="text-xs text-emerald-400 mt-1">
              Overall completion
            </p>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="text-sm text-gray-400">
              Goal Progress
            </p>

            <p className="text-3xl font-black mt-2">
              {stats.goalProgress}%
            </p>

            <p className="text-xs text-cyan-400 mt-1">
              Based on current progress
            </p>
          </div>

        </section>

        {/* =================================================
            ACTIVE GOALS
        ================================================= */}

        <section className="glass rounded-[32px] p-6 mt-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold">
                Active Goals
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Keep moving toward your targets
              </p>
            </div>

            <button
              onClick={() => navigate("/goals")}
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              View all
            </button>

          </div>

          {activeGoals.length === 0 ? (

            <div className="py-8 text-center text-gray-500">

              <p>
                No active goals yet.
              </p>

              <button
                onClick={() => navigate("/goals")}
                className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Create your first goal →
              </button>

            </div>

          ) : (

            <div className="space-y-3">

              {activeGoals
                .slice(0, 5)
                .map((goal) => {

                  const target =
                    Number(goal.targetValue || 0);

                  const current =
                    Number(goal.currentProgress || 0);

                  const progress =
                    target > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (current / target) * 100
                          )
                        )
                      : 0;

                  return (
                    <div
                      key={goal.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <h3 className="font-semibold truncate">
                            {goal.title}
                          </h3>

                          {goal.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                              {goal.description}
                            </p>
                          )}

                        </div>

                        <span
                          className={`
                            shrink-0
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            border
                            ${getStatusStyle(goal.status)}
                          `}
                        >
                          {getStatusLabel(goal.status)}
                        </span>

                      </div>

                      <div className="mt-4">

                        <div className="flex justify-between text-xs mb-2">

                          <span className="text-gray-500">
                            Progress
                          </span>

                          <span className="text-gray-300">
                            {progress}%
                          </span>

                        </div>

                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  );
                })}

            </div>

          )}

        </section>

        {/* =================================================
            TODAY'S HABITS
        ================================================= */}

        <section className="glass rounded-[32px] p-6 mt-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold">
                Today's Habits
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Habits currently active today
              </p>
            </div>

            <button
              onClick={() => navigate("/habits")}
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              View all
            </button>

          </div>

          {todayHabits.length === 0 ? (

            <div className="py-8 text-center text-gray-500">

              <p>
                No habits scheduled for today.
              </p>

              <button
                onClick={() => navigate("/habits")}
                className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Create a habit →
              </button>

            </div>

          ) : (

            <div className="space-y-3">

              {todayHabits
                .slice(0, 5)
                .map((habit) => {

                  const target =
                    Number(habit.targetCount || 0);

                  const current =
                    Number(habit.currentProgress || 0);

                  const progress =
                    target > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (current / target) * 100
                          )
                        )
                      : habit.completed
                      ? 100
                      : 0;

                  return (
                    <div
                      key={habit.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">

                          <h3 className="font-semibold truncate">
                            {habit.title}
                          </h3>

                          <p className="text-sm text-gray-400 mt-1">
                            {habit.startTime || "--:--"}
                            {" - "}
                            {habit.endTime || "--:--"}
                          </p>

                        </div>

                        <span
                          className={`
                            shrink-0
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            border
                            ${getStatusStyle(habit.status)}
                          `}
                        >
                          {getStatusLabel(habit.status)}
                        </span>

                      </div>

                      <div className="mt-3">

                        <div className="flex justify-between text-xs mb-1.5">

                          <span className="text-gray-500">
                            {current}/{target || 1}
                          </span>

                          <span className="text-gray-400">
                            {progress}%
                          </span>

                        </div>

                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  );
                })}

            </div>

          )}

        </section>

        {/* FOOTER */}

        <div className="text-center text-xs text-gray-600 py-6">
          HabitMile 365 • Build consistency. Measure progress.
        </div>

      </main>

    </div>
  );
}