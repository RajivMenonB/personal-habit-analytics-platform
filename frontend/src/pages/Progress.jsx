import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getGoals, getHabits } from "../services/api";

export default function Progress() {
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalData, habitData] = await Promise.all([
        getGoals(),
        getHabits(),
      ]);

      setGoals(goalData);
      setHabits(habitData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(
      (g) => g.status === "COMPLETED"
    ).length;

    const totalHabits = habits.length;
    const completedHabits = habits.filter(
      (h) => h.status === "COMPLETED"
    ).length;

    const activeGoals = goals.filter(
      (g) => g.status === "IN_PROGRESS"
    ).length;

    const consistency =
      totalHabits === 0
        ? 0
        : Math.round((completedHabits / totalHabits) * 100);

    return {
      totalGoals,
      completedGoals,
      totalHabits,
      completedHabits,
      activeGoals,
      consistency,
    };
  }, [goals, habits]);

  return (
    <div className="min-h-screen bg-[#07070c] text-white flex">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <Topbar
          title="Progress"
          user={JSON.parse(localStorage.getItem("user"))}
        />

        {loading ? (
          <div className="glass rounded-[32px] p-10 mt-6 text-center text-gray-400">
            Loading progress...
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="glass rounded-[32px] p-8 mt-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div>
                  <p className="text-cyan-400 font-medium">
                    Keep moving forward 🚀
                  </p>

                  <h1 className="text-4xl lg:text-5xl font-black mt-2">
                    Your productivity is
                    <br />
                    <span className="gradient-text">improving steadily.</span>
                  </h1>

                  <p className="text-gray-400 mt-4 max-w-xl">
                    Track goals, habits, and consistency in one place.
                    Every completed action compounds into long-term success.
                  </p>
                </div>

                {/* Consistency Ring */}
                <div className="glass rounded-3xl p-6 w-full lg:w-72">
                  <p className="text-sm text-gray-400 mb-4">
                    Overall Consistency
                  </p>

                  <div className="relative w-44 h-44 mx-auto">
                    <svg className="w-44 h-44 -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="74"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="12"
                        fill="none"
                      />

                      <circle
                        cx="88"
                        cy="88"
                        r="74"
                        stroke="url(#progressGrad)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="465"
                        strokeDashoffset={
                          465 - (465 * stats.consistency) / 100
                        }
                      />

                      <defs>
                        <linearGradient id="progressGrad">
                          <stop offset="0%" stopColor="#67e8f9" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black">
                        {stats.consistency}%
                      </span>
                      <span className="text-sm text-gray-400">
                        Consistent
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
              <div className="glass rounded-[28px] p-6">
                <p className="text-gray-400 text-sm">Total Goals</p>
                <h2 className="text-4xl font-black mt-2">
                  {stats.totalGoals}
                </h2>
                <p className="text-cyan-400 text-sm mt-2">
                  {stats.completedGoals} completed
                </p>
              </div>

              <div className="glass rounded-[28px] p-6">
                <p className="text-gray-400 text-sm">Active Goals</p>
                <h2 className="text-4xl font-black mt-2">
                  {stats.activeGoals}
                </h2>
                <p className="text-purple-400 text-sm mt-2">
                  Currently in progress
                </p>
              </div>

              <div className="glass rounded-[28px] p-6">
                <p className="text-gray-400 text-sm">Total Habits</p>
                <h2 className="text-4xl font-black mt-2">
                  {stats.totalHabits}
                </h2>
                <p className="text-cyan-400 text-sm mt-2">
                  {stats.completedHabits} completed
                </p>
              </div>

              <div className="glass rounded-[28px] p-6">
                <p className="text-gray-400 text-sm">Completion Rate</p>
                <h2 className="text-4xl font-black mt-2">
                  {stats.consistency}%
                </h2>
                <p className="text-purple-400 text-sm mt-2">
                  Based on habits
                </p>
              </div>
            </div>

            {/* Goals Progress */}
            <div className="glass rounded-[32px] p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Goals Progress</h2>
                  <p className="text-sm text-gray-400">
                    Track every goal visually
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {goals.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    No goals available
                  </div>
                ) : (
                  goals.map((goal) => {
                    const progress =
                      goal.status === "COMPLETED"
                        ? 100
                        : goal.status === "IN_PROGRESS"
                        ? 60
                        : 15;

                    return (
                      <div
                        key={goal.id}
                        className="p-5 rounded-3xl bg-white/5 border border-white/10"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {goal.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {goal.category || "General"}
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-cyan-400">
                            {progress}%
                          </span>
                        </div>

                        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Habits Completion */}
            <div className="glass rounded-[32px] p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Habits Completion</h2>
                  <p className="text-sm text-gray-400">
                    Daily consistency tracker
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {habits.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    No habits available
                  </div>
                ) : (
                  habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10"
                    >
                      <div>
                        <h3 className="font-semibold">{habit.title}</h3>
                        <p className="text-sm text-gray-400">
                          {habit.description}
                        </p>
                      </div>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          habit.status === "COMPLETED"
                            ? "bg-cyan-400/10 text-cyan-300"
                            : "bg-white/5 text-gray-300"
                        }`}
                      >
                        {habit.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-[32px] p-6 mt-6">
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>

              <div className="space-y-4">
                {[...goals.slice(0, 3), ...habits.slice(0, 3)].map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-black font-bold">
                        {item.title?.charAt(0) || "A"}
                      </div>

                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-400">
                          {item.status || "Updated recently"}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}