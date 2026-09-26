import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { getGoals, getHabits } from "../services/api";

const dashboardStyles = `
  .hm365-dashboard {
    --bg: #08090b;
    --panel: rgba(20, 22, 26, 0.78);
    --panel-2: rgba(15, 17, 21, 0.88);
    --line: rgba(255,255,255,.075);
    --line-soft: rgba(255,255,255,.045);
    --text: #e8e2db;
    --muted: #8a8985;
    --dim: #62635f;
    --copper: #b97948;
    --copper-light: #cf9569;
    --green: #7f9d89;

    min-height: 100vh;
    display: flex;
    background:
      radial-gradient(circle at 76% 9%, rgba(185,121,72,.035), transparent 25%),
      radial-gradient(circle at 17% 86%, rgba(255,255,255,.018), transparent 30%),
      var(--bg);
    color: var(--text);
  }

  .hm365-dashboard-main {
    flex: 1;
    min-width: 0;
    padding: 18px 20px 24px;
    overflow-x: hidden;
  }

  .hm365-dashboard .hm365-top {
    margin-bottom: 16px;
  }

  .hm365-dashboard .hm365-error {
    margin: 0 0 14px;
    padding: 11px 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid rgba(180,80,70,.22);
    border-radius: 12px;
    background: rgba(120,40,35,.10);
    color: #c9a09a;
    font-size: 11px;
  }

  .hm365-dashboard .hm365-error button {
    height: 30px;
    padding: 0 12px;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 8px;
    background: rgba(255,255,255,.035);
    color: #b7b3ae;
    cursor: pointer;
  }

  /* HERO */
  .hm365-hero {
    position: relative;
    min-height: 335px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 430px;
    align-items: center;
    gap: 26px;
    padding: 30px 32px;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 22px;
    background:
      linear-gradient(135deg, rgba(28,30,35,.82), rgba(12,14,18,.94));
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.028),
      0 22px 60px rgba(0,0,0,.22);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }

  .hm365-hero::before {
    content: "";
    position: absolute;
    width: 360px;
    height: 360px;
    right: 70px;
    top: -170px;
    border-radius: 50%;
    background: rgba(185,121,72,.035);
    filter: blur(65px);
    pointer-events: none;
  }

  .hm365-hero-copy {
    position: relative;
    z-index: 1;
    max-width: 570px;
    padding: 4px 0;
  }

  .hm365-eyebrow {
    margin: 0 0 12px;
    color: var(--copper-light);
    font-size: 9px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: .17em;
    text-transform: uppercase;
  }

  .hm365-hero-title {
    margin: 0;
    color: #eee9e3;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(42px, 4.2vw, 59px);
    line-height: .98;
    letter-spacing: -.045em;
    font-weight: 700;
  }

  .hm365-hero-title span {
    display: block;
    margin-top: 5px;
    color: var(--copper-light);
    font-style: italic;
    font-weight: 600;
  }

  .hm365-hero-description {
    max-width: 500px;
    margin: 18px 0 0;
    color: #858783;
    font-size: 11.5px;
    line-height: 1.75;
  }

  .hm365-thought {
    margin-top: 17px;
    padding: 9px 0 9px 13px;
    border-left: 1px solid rgba(185,121,72,.55);
  }

  .hm365-thought-label {
    margin: 0 0 4px;
    color: #74746f;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .hm365-thought-text {
    margin: 0;
    color: #92928d;
    font-size: 9.5px;
    line-height: 1.55;
  }

  .hm365-actions {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 20px;
  }

  .hm365-btn {
    height: 38px;
    padding: 0 15px;
    border-radius: 10px;
    font-family: Inter, "Segoe UI", sans-serif;
    font-size: 10.5px;
    font-weight: 700;
    cursor: pointer;
    transition: .18s ease;
  }

  .hm365-btn-primary {
    border: 1px solid rgba(214,153,105,.18);
    background: linear-gradient(135deg, #a96d40, #bc7b4b);
    color: #17100b;
    box-shadow: 0 8px 22px rgba(0,0,0,.22);
  }

  .hm365-btn-primary:hover {
    transform: translateY(-1px);
    background: linear-gradient(135deg, #b77a49, #ca8956);
  }

  .hm365-btn-secondary {
    border: 1px solid rgba(255,255,255,.085);
    background: rgba(255,255,255,.025);
    color: #a5a39e;
  }

  .hm365-btn-secondary:hover {
    border-color: rgba(185,121,72,.25);
    background: rgba(255,255,255,.045);
    color: #d0cbc4;
  }

  /* HERO VISUAL */
  .hm365-hero-visual {
    position: relative;
    z-index: 1;
    min-width: 0;
    height: 275px;
    display: grid;
    grid-template-columns: 235px 160px;
    align-items: center;
    justify-content: end;
    gap: 18px;
  }

  .hm365-illustration {
    width: 235px;
    height: 235px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hm365-illustration img {
    width: 220px;
    height: 220px;
    object-fit: contain;
    opacity: .82;
    filter: drop-shadow(0 17px 25px rgba(0,0,0,.38));
  }

  /* COMPLETION */
  .hm365-completion {
    width: 160px;
    height: 196px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,.075);
    border-radius: 17px;
    background: linear-gradient(145deg, rgba(255,255,255,.035), rgba(255,255,255,.012));
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.025),
      0 16px 35px rgba(0,0,0,.22);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .hm365-completion-title {
    margin: 0 0 11px;
    color: #777873;
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .hm365-ring {
    position: relative;
    width: 116px;
    height: 116px;
  }

  .hm365-ring svg {
    width: 116px;
    height: 116px;
    display: block;
    transform: rotate(-90deg);
  }

  .hm365-ring-track {
    fill: none;
    stroke: rgba(255,255,255,.065);
    stroke-width: 7;
  }

  .hm365-ring-progress {
    fill: none;
    stroke: url(#hm365CopperGradient);
    stroke-width: 7;
    stroke-linecap: round;
    transition: stroke-dashoffset .4s ease;
  }

  .hm365-ring-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .hm365-ring-value {
    color: #e8e2dc;
    font-size: 24px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: -.04em;
  }

  .hm365-ring-label {
    margin-top: 5px;
    color: #676964;
    font-size: 6.5px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .hm365-completion-foot {
    width: 100%;
    margin-top: 10px;
    padding-top: 8px;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid rgba(255,255,255,.045);
    color: #555753;
    font-size: 7px;
  }

  /* STATS */
  .hm365-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 13px;
  }

  .hm365-stat {
    min-height: 92px;
    padding: 15px 16px;
    border: 1px solid var(--line-soft);
    border-radius: 15px;
    background: linear-gradient(145deg, rgba(24,27,31,.70), rgba(12,14,18,.78));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.02);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transition: .18s ease;
  }

  .hm365-stat:hover {
    transform: translateY(-1px);
    border-color: rgba(185,121,72,.14);
  }

  .hm365-stat-label {
    margin: 0;
    color: #737570;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .hm365-stat-value {
    margin: 8px 0 0;
    color: #e2ddd7;
    font-size: 24px;
    line-height: 1;
    font-weight: 700;
  }

  .hm365-stat-detail {
    margin: 6px 0 0;
    color: #8b6548;
    font-size: 8px;
  }

  /* LOWER PANELS */
  .hm365-panels {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 13px;
    margin-top: 13px;
  }

  .hm365-panel {
    min-width: 0;
    padding: 19px;
    border: 1px solid var(--line-soft);
    border-radius: 17px;
    background: linear-gradient(145deg, rgba(21,24,29,.72), rgba(12,14,18,.82));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.02);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .hm365-panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 14px;
  }

  .hm365-panel-title {
    margin: 0;
    color: #ddd8d2;
    font-size: 16px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -.02em;
  }

  .hm365-panel-subtitle {
    margin: 4px 0 0;
    color: #686b67;
    font-size: 9px;
  }

  .hm365-view-all {
    border: 0;
    background: transparent;
    color: #b47a4d;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .hm365-view-all:hover {
    color: #d09a70;
  }

  .hm365-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .hm365-item {
    min-width: 0;
    padding: 12px 13px;
    border: 1px solid rgba(255,255,255,.05);
    border-radius: 12px;
    background: rgba(255,255,255,.016);
    transition: .18s ease;
  }

  .hm365-item:hover {
    border-color: rgba(185,121,72,.13);
    background: rgba(255,255,255,.027);
  }

  .hm365-item-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .hm365-item-title {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    color: #d0d2ce;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hm365-item-description,
  .hm365-item-time {
    margin: 4px 0 0;
    overflow: hidden;
    color: #6e716d;
    font-size: 8.5px;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hm365-status {
    flex-shrink: 0;
    padding: 4px 7px;
    border: 1px solid rgba(255,255,255,.065);
    border-radius: 999px;
    color: #8d8d87;
    background: rgba(255,255,255,.025);
    font-size: 7px;
    font-weight: 700;
    white-space: nowrap;
  }

  .hm365-status.completed {
    color: #8ba794;
    border-color: rgba(127,157,137,.20);
    background: rgba(127,157,137,.07);
  }

  .hm365-status.progress {
    color: #c28a5f;
    border-color: rgba(185,121,72,.20);
    background: rgba(185,121,72,.065);
  }

  .hm365-progress-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 9px;
    color: #5f625e;
    font-size: 7.5px;
  }

  .hm365-progress-value {
    color: #aaa49d;
  }

  .hm365-progress-track {
    height: 4px;
    margin-top: 5px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255,255,255,.055);
  }

  .hm365-progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #805333, #bd7a49);
  }

  .hm365-empty {
    min-height: 145px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #60635f;
    font-size: 9px;
  }

  .hm365-empty button {
    margin-top: 7px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #b67a4d;
    font-size: 9px;
    cursor: pointer;
  }

  .hm365-footer {
    padding: 18px 0 2px;
    color: #414440;
    text-align: center;
    font-size: 7.5px;
    letter-spacing: .04em;
  }

  @media (max-width: 1180px) {
    .hm365-hero {
      grid-template-columns: minmax(0, 1fr) 365px;
      gap: 12px;
      padding: 27px;
    }

    .hm365-hero-visual {
      grid-template-columns: 195px 145px;
      gap: 10px;
    }

    .hm365-illustration {
      width: 195px;
      height: 210px;
    }

    .hm365-illustration img {
      width: 190px;
      height: 190px;
    }

    .hm365-completion {
      width: 145px;
    }
  }

  @media (max-width: 1023px) {
    .hm365-dashboard-main {
      padding: 14px;
    }

    .hm365-hero {
      grid-template-columns: 1fr;
      min-height: auto;
      padding: 25px;
    }

    .hm365-hero-copy {
      max-width: 650px;
    }

    .hm365-hero-visual {
      width: 100%;
      height: auto;
      grid-template-columns: 200px 155px;
      justify-content: center;
    }

    .hm365-panels {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .hm365-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .hm365-hero-title {
      font-size: 40px;
    }

    .hm365-hero {
      padding: 21px;
    }

    .hm365-hero-visual {
      grid-template-columns: 175px 145px;
      gap: 8px;
    }

    .hm365-illustration {
      width: 175px;
      height: 190px;
    }

    .hm365-illustration img {
      width: 175px;
      height: 175px;
    }
  }

  @media (max-width: 520px) {
    .hm365-dashboard-main {
      padding: 10px;
    }

    .hm365-stats {
      grid-template-columns: 1fr;
    }

    .hm365-hero-visual {
      grid-template-columns: 1fr;
    }

    .hm365-illustration {
      margin: 0 auto;
    }

    .hm365-completion {
      margin: 0 auto;
    }

    .hm365-actions {
      flex-wrap: wrap;
    }
  }
`;

export default function Dashboard() {
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userName =
    user?.name?.trim() ||
    user?.username?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "User";

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

  const today = new Date();

  const todayString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  const isDateInRange = (startDate, endDate) => {
    if (!startDate || !endDate) return true;

    return todayString >= startDate && todayString <= endDate;
  };

  const activeGoals = useMemo(() => {
    return goals.filter((goal) => {
      if (goal.completed === true) return false;
      if (goal.status === "COMPLETED") return false;
      return true;
    });
  }, [goals]);

  const completedGoals = useMemo(() => {
    return goals.filter(
      (goal) =>
        goal.completed === true ||
        goal.status === "COMPLETED"
    );
  }, [goals]);

  const todayHabits = useMemo(() => {
    return habits.filter((habit) =>
      isDateInRange(habit.startDate, habit.endDate)
    );
  }, [habits, todayString]);

  const completedHabits = useMemo(() => {
    return habits.filter(
      (habit) =>
        habit.completed === true ||
        habit.status === "COMPLETED"
    );
  }, [habits]);

  const habitProgress = useMemo(() => {
    if (habits.length === 0) return 0;

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
      return completedHabits.length === habits.length ? 100 : 0;
    }

    return Math.round((totalCurrent / totalTarget) * 100);
  }, [habits, completedHabits]);

  const goalProgress = useMemo(() => {
    if (goals.length === 0) return 0;

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
      return completedGoals.length === goals.length ? 100 : 0;
    }

    return Math.round((totalCurrent / totalTarget) * 100);
  }, [goals, completedGoals]);

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

  const getStatusLabel = (status) => {
    if (!status) return "Not Started";

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
          .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  };

  const getStatusClass = (status) => {
    if (status === "COMPLETED") return "completed";
    if (status === "IN_PROGRESS") return "progress";
    return "";
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090b",
          color: "#aaa",
          fontFamily: 'Inter, "Segoe UI", sans-serif',
        }}
      >
        Loading HabitMile 365...
      </div>
    );
  }

  const circumference = 2 * Math.PI * 47;
  const dashOffset =
    circumference -
    (circumference * stats.habitProgress) / 100;

  return (
    <div className="hm365-dashboard">
      <style>{dashboardStyles}</style>

      <Sidebar />

      <main className="hm365-dashboard-main">
        <div className="hm365-top">
          <Topbar title="Dashboard" user={user} />
        </div>

        {error && (
          <div className="hm365-error">
            <span>{error}</span>

            <button type="button" onClick={loadDashboard}>
              Retry
            </button>
          </div>
        )}

        {/* HERO */}
        <section className="hm365-hero">
          <div className="hm365-hero-copy">
            <p className="hm365-eyebrow">
              Welcome back, {userName}
            </p>

            <h1 className="hm365-hero-title">
              Build habits.
              <span>Achieve goals.</span>
            </h1>

            <p className="hm365-hero-description">
              Track your habits, manage your goals, measure your
              consistency, and turn everyday actions into meaningful
              long-term progress.
            </p>

            <div className="hm365-thought">
              <p className="hm365-thought-label">
                Today's thought
              </p>

              <p className="hm365-thought-text">
                Small actions, repeated with intention, become
                remarkable results.
              </p>
            </div>

            <div className="hm365-actions">
              <button
                type="button"
                className="hm365-btn hm365-btn-primary"
                onClick={() => navigate("/goals")}
              >
                Create a goal
              </button>

              <button
                type="button"
                className="hm365-btn hm365-btn-secondary"
                onClick={() => navigate("/habits")}
              >
                Add a habit
              </button>
            </div>
          </div>

          <div className="hm365-hero-visual">
            <div className="hm365-illustration">
              <img
                src="/habitmile-dashboard.png"
                alt="HabitMile 365 productivity"
              />
            </div>

            <div className="hm365-completion">
              <p className="hm365-completion-title">
                Habit completion
              </p>

              <div className="hm365-ring">
                <svg viewBox="0 0 116 116" aria-hidden="true">
                  <defs>
                    <linearGradient
                      id="hm365CopperGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8e5b38"
                      />
                      <stop
                        offset="100%"
                        stopColor="#c78957"
                      />
                    </linearGradient>
                  </defs>

                  <circle
                    className="hm365-ring-track"
                    cx="58"
                    cy="58"
                    r="47"
                  />

                  <circle
                    className="hm365-ring-progress"
                    cx="58"
                    cy="58"
                    r="47"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>

                <div className="hm365-ring-center">
                  <span className="hm365-ring-value">
                    {stats.habitProgress}%
                  </span>

                  <span className="hm365-ring-label">
                    Complete
                  </span>
                </div>
              </div>

              <div className="hm365-completion-foot">
                <span>Active {stats.activeHabits}</span>
                <span>Done {stats.completedHabits}</span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="hm365-stats">
          <article className="hm365-stat">
            <p className="hm365-stat-label">Active goals</p>
            <p className="hm365-stat-value">
              {stats.activeGoals}
            </p>
            <p className="hm365-stat-detail">
              {stats.completedGoals} completed
            </p>
          </article>

          <article className="hm365-stat">
            <p className="hm365-stat-label">Active habits</p>
            <p className="hm365-stat-value">
              {stats.activeHabits}
            </p>
            <p className="hm365-stat-detail">
              {stats.totalHabits} total
            </p>
          </article>

          <article className="hm365-stat">
            <p className="hm365-stat-label">Completed habits</p>
            <p className="hm365-stat-value">
              {stats.completedHabits}
            </p>
            <p className="hm365-stat-detail">
              Overall completion
            </p>
          </article>

          <article className="hm365-stat">
            <p className="hm365-stat-label">Goal progress</p>
            <p className="hm365-stat-value">
              {stats.goalProgress}%
            </p>
            <p className="hm365-stat-detail">
              Based on current progress
            </p>
          </article>
        </section>

        {/* LOWER PANELS */}
        <section className="hm365-panels">
          {/* ACTIVE GOALS */}
          <section className="hm365-panel">
            <div className="hm365-panel-header">
              <div>
                <h2 className="hm365-panel-title">
                  Active goals
                </h2>

                <p className="hm365-panel-subtitle">
                  Keep moving toward your targets
                </p>
              </div>

              <button
                type="button"
                className="hm365-view-all"
                onClick={() => navigate("/goals")}
              >
                View all
              </button>
            </div>

            {activeGoals.length === 0 ? (
              <div className="hm365-empty">
                <div>
                  <div>No active goals yet.</div>

                  <button
                    type="button"
                    onClick={() => navigate("/goals")}
                  >
                    Create your first goal →
                  </button>
                </div>
              </div>
            ) : (
              <div className="hm365-list">
                {activeGoals.slice(0, 5).map((goal) => {
                  const target = Number(
                    goal.targetValue || 0
                  );

                  const current = Number(
                    goal.currentProgress || 0
                  );

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
                    <article
                      key={goal.id}
                      className="hm365-item"
                    >
                      <div className="hm365-item-head">
                        <div style={{ minWidth: 0 }}>
                          <h3 className="hm365-item-title">
                            {goal.title}
                          </h3>

                          {goal.description && (
                            <p className="hm365-item-description">
                              {goal.description}
                            </p>
                          )}
                        </div>

                        <span
                          className={`hm365-status ${getStatusClass(
                            goal.status
                          )}`}
                        >
                          {getStatusLabel(goal.status)}
                        </span>
                      </div>

                      <div className="hm365-progress-meta">
                        <span>Progress</span>
                        <span className="hm365-progress-value">
                          {progress}%
                        </span>
                      </div>

                      <div className="hm365-progress-track">
                        <div
                          className="hm365-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* TODAY'S HABITS */}
          <section className="hm365-panel">
            <div className="hm365-panel-header">
              <div>
                <h2 className="hm365-panel-title">
                  Today's habits
                </h2>

                <p className="hm365-panel-subtitle">
                  Habits currently active today
                </p>
              </div>

              <button
                type="button"
                className="hm365-view-all"
                onClick={() => navigate("/habits")}
              >
                View all
              </button>
            </div>

            {todayHabits.length === 0 ? (
              <div className="hm365-empty">
                <div>
                  <div>No habits scheduled for today.</div>

                  <button
                    type="button"
                    onClick={() => navigate("/habits")}
                  >
                    Create a habit →
                  </button>
                </div>
              </div>
            ) : (
              <div className="hm365-list">
                {todayHabits.slice(0, 5).map((habit) => {
                  const target = Number(
                    habit.targetCount || 0
                  );

                  const current = Number(
                    habit.currentProgress || 0
                  );

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
                    <article
                      key={habit.id}
                      className="hm365-item"
                    >
                      <div className="hm365-item-head">
                        <div style={{ minWidth: 0 }}>
                          <h3 className="hm365-item-title">
                            {habit.title}
                          </h3>

                          <p className="hm365-item-time">
                            {habit.startTime || "--:--"}{" "}
                            -{" "}
                            {habit.endTime || "--:--"}
                          </p>
                        </div>

                        <span
                          className={`hm365-status ${getStatusClass(
                            habit.status
                          )}`}
                        >
                          {getStatusLabel(habit.status)}
                        </span>
                      </div>

                      <div className="hm365-progress-meta">
                        <span>
                          {current}/{target || 1}
                        </span>

                        <span className="hm365-progress-value">
                          {progress}%
                        </span>
                      </div>

                      <div className="hm365-progress-track">
                        <div
                          className="hm365-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>

        <footer className="hm365-footer">
          HabitMile 365 • Build consistency. Measure progress.
        </footer>
      </main>
    </div>
  );
}
