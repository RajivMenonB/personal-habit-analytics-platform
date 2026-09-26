import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import useGoals from "../hooks/useGoals";


const EMPTY_GOAL = {
  title: "",
  description: "",
  category: "",
  targetValue: 1,
  currentProgress: 0,
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  notificationsEnabled: true,
  reminderMinutesBefore: 10,
  priority: "MEDIUM",
  status: "NOT_STARTED",
  completed: false,
};


const EMPTY_TOPIC = {
  topicName: "",
  description: "",
  notes: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  estimatedDuration: 60,
  actualDuration: 0,
  progress: 0,
  priority: "MEDIUM",
  status: "NOT_STARTED",
  notificationsEnabled: true,
  reminderMinutesBefore: 10,
  completed: false,
};


export default function Goals() {

  const {
    goals,
    loading,
    error,

    addGoal,
    editGoal,
    removeGoal,

    addTopic,
    editTopic,
    removeTopic,

    getTopicsForGoal,

    analytics,
  } = useGoals();


  const [expandedGoal, setExpandedGoal] =
    useState(null);

  const [showGoalForm, setShowGoalForm] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState(null);

  const [topicFormGoal, setTopicFormGoal] =
    useState(null);

  const [editingTopic, setEditingTopic] =
    useState(null);


  const [goalForm, setGoalForm] =
    useState({
      ...EMPTY_GOAL,
    });


  const [topicForm, setTopicForm] =
    useState({
      ...EMPTY_TOPIC,
    });


  // ==========================================================
  // HELPERS
  // ==========================================================

  const goalProgress = (goal) => {

    const target =
      Number(
        goal.targetValue || 0
      );

    const current =
      Number(
        goal.currentProgress || 0
      );

    if (target <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (current / target) *
            100
        )
      )
    );
  };


  const topicProgress = (topic) => {

    return Math.min(
      100,
      Math.max(
        0,
        Number(
          topic.progress || 0
        )
      )
    );
  };


  const formatDate = (value) => {

    if (!value) {
      return "Not set";
    }

    const date =
      new Date(
        `${value}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const formatTime = (value) => {

    if (!value) {
      return "";
    }

    return value.slice(0, 5);
  };


  const formatStatus = (value) => {

    return (
      value
        ?.replaceAll("_", " ")
        ?.toLowerCase()
        ?.replace(
          /\b\w/g,
          (char) =>
            char.toUpperCase()
        ) ||
      "Not Started"
    );
  };


  // ==========================================================
  // GOAL FORM
  // ==========================================================

  const openNewGoal = () => {

    setEditingGoal(null);

    setGoalForm({
      ...EMPTY_GOAL,
    });

    setShowGoalForm(true);
  };


  const openEditGoal = (goal) => {

    setEditingGoal(goal);

    setGoalForm({

      title:
        goal.title || "",

      description:
        goal.description || "",

      category:
        goal.category || "",

      targetValue:
        goal.targetValue ?? 1,

      currentProgress:
        goal.currentProgress ?? 0,

      startDate:
        goal.startDate || "",

      endDate:
        goal.endDate ||
        goal.targetDate ||
        "",

      startTime:
        goal.startTime || "",

      endTime:
        goal.endTime || "",

      notificationsEnabled:
        goal.notificationsEnabled ??
        true,

      reminderMinutesBefore:
        goal.reminderMinutesBefore ??
        10,

      priority:
        goal.priority ||
        "MEDIUM",

      status:
        goal.status ||
        "NOT_STARTED",

      completed:
        goal.completed ??
        false,
    });

    setShowGoalForm(true);
  };


  const closeGoalForm = () => {

    setShowGoalForm(false);

    setEditingGoal(null);

    setGoalForm({
      ...EMPTY_GOAL,
    });
  };


  const handleGoalSubmit =
    async (event) => {

      event.preventDefault();

      try {

        const payload = {

          ...goalForm,

          title:
            goalForm.title.trim(),

          targetValue:
            Math.max(
              1,
              Number(
                goalForm.targetValue
              )
            ),

          currentProgress:
            Math.max(
              0,
              Number(
                goalForm.currentProgress
              )
            ),

          reminderMinutesBefore:
            Math.max(
              0,
              Number(
                goalForm.reminderMinutesBefore
              )
            ),
        };


        if (
          payload.currentProgress >
          payload.targetValue
        ) {

          payload.currentProgress =
            payload.targetValue;
        }


        if (
          editingGoal
        ) {

          await editGoal(
            editingGoal.id,
            payload
          );

        } else {

          await addGoal(
            payload
          );
        }


        closeGoalForm();

      } catch (err) {

        console.error(err);

        alert(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to save goal."
        );
      }
    };


  // ==========================================================
  // DELETE GOAL
  // ==========================================================

  const handleDeleteGoal =
    async (goal) => {

      const confirmed =
        window.confirm(
          `Delete "${goal.title}"? This cannot be undone.`
        );

      if (!confirmed) {
        return;
      }


      try {

        await removeGoal(
          goal.id
        );


        if (
          expandedGoal ===
          goal.id
        ) {

          setExpandedGoal(null);
        }

      } catch (err) {

        console.error(err);

        alert(
          err?.response?.data?.message ||
          "Unable to delete goal."
        );
      }
    };


  // ==========================================================
  // TOPIC FORM
  // ==========================================================

  const openNewTopic =
    (goal) => {

      setTopicFormGoal(
        goal
      );

      setEditingTopic(
        null
      );

      setTopicForm({
        ...EMPTY_TOPIC,
      });
    };


  const openEditTopic =
    (topic) => {

      setEditingTopic(
        topic
      );


      setTopicForm({

        topicName:
          topic.topicName ||
          "",

        description:
          topic.description ||
          "",

        notes:
          topic.notes ||
          "",

        startDate:
          topic.startDate ||
          "",

        endDate:
          topic.endDate ||
          "",

        startTime:
          topic.startTime ||
          "",

        endTime:
          topic.endTime ||
          "",

        estimatedDuration:
          topic.estimatedDuration ??
          60,

        actualDuration:
          topic.actualDuration ??
          0,

        progress:
          topic.progress ??
          0,

        priority:
          topic.priority ||
          "MEDIUM",

        status:
          topic.status ||
          "NOT_STARTED",

        notificationsEnabled:
          topic.notificationsEnabled ??
          true,

        reminderMinutesBefore:
          topic.reminderMinutesBefore ??
          10,

        completed:
          topic.completed ??
          false,
      });


      /*
       * The new API gives us goalId.
       *
       * We don't need the Hibernate Goal object anymore.
       */
      const parentGoal =
        goals.find(
          (goal) =>
            Number(goal.id) ===
            Number(topic.goalId)
        );


      setTopicFormGoal(
        parentGoal || {
          id: topic.goalId,
          title: "Goal",
        }
      );
    };


  const closeTopicForm =
    () => {

      setTopicFormGoal(
        null
      );

      setEditingTopic(
        null
      );

      setTopicForm({
        ...EMPTY_TOPIC,
      });
    };


  const handleTopicSubmit =
    async (event) => {

      event.preventDefault();

      try {

        const payload = {

          ...topicForm,

          topicName:
            topicForm.topicName.trim(),

          estimatedDuration:
            Math.max(
              0,
              Number(
                topicForm.estimatedDuration
              )
            ),

          actualDuration:
            Math.max(
              0,
              Number(
                topicForm.actualDuration
              )
            ),

          progress:
            Math.min(
              100,
              Math.max(
                0,
                Number(
                  topicForm.progress
                )
              )
            ),

          reminderMinutesBefore:
            Math.max(
              0,
              Number(
                topicForm.reminderMinutesBefore
              )
            ),
        };


        if (
          payload.progress >= 100
        ) {

          payload.progress = 100;

          payload.completed =
            true;

          payload.status =
            "COMPLETED";
        }


        if (
          editingTopic
        ) {

          /*
           * Do NOT attach goal here.
           *
           * Backend protects the relationship.
           */
          await editTopic(
            editingTopic.id,
            payload
          );

        } else {

          await addTopic(
            topicFormGoal.id,
            payload
          );
        }


        closeTopicForm();

      } catch (err) {

        console.error(err);

        alert(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to save topic."
        );
      }
    };


  // ==========================================================
  // DELETE TOPIC
  // ==========================================================

  const handleDeleteTopic =
    async (topic) => {

      const confirmed =
        window.confirm(
          `Delete "${topic.topicName}"?`
        );

      if (!confirmed) {
        return;
      }


      try {

        await removeTopic(
          topic.id
        );

      } catch (err) {

        console.error(err);

        alert(
          err?.response?.data?.message ||
          "Unable to delete topic."
        );
      }
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-[#08090b] text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 rounded-full border-2 border-[#c07d4c]/20 border-t-[#c07d4c] animate-spin mx-auto" />

          <p className="mt-4 text-sm text-gray-400">
            Loading your goals...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="min-h-screen bg-[#08090b] text-[#eee9e2] flex">

      <Sidebar />


      <main className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto">


        <Topbar
          title="Goals"
        />


        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

          <div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-[#c07d4c] font-bold">
              Personal habit analytics
            </p>

            <h1 className="text-3xl md:text-4xl font-black mt-2">
              Your Goals
            </h1>

            <p className="text-sm text-[#858781] mt-2">
              Turn long-term plans into measurable progress.
            </p>

          </div>


          <button
            onClick={openNewGoal}
            className="px-5 py-3 rounded-2xl bg-[#c07d4c] hover:bg-[#d29a6d] text-[#08090b] font-bold transition shadow-lg shadow-[#c07d4c]/10"
          >
            + New Goal
          </button>

        </section>


        {/* =====================================================
            ANALYTICS
        ===================================================== */}

        <section className="grid grid-cols-2 xl:grid-cols-5 gap-3 mt-6">

          <AnalyticsCard
            title="Total Goals"
            value={analytics.totalGoals}
            icon="🎯"
          />

          <AnalyticsCard
            title="Active"
            value={analytics.activeGoals}
            icon="↗"
          />

          <AnalyticsCard
            title="Completed"
            value={analytics.completedGoals}
            icon="✓"
          />

          <AnalyticsCard
            title="Topics"
            value={analytics.totalTopics}
            icon="◈"
          />

          <AnalyticsCard
            title="Topic Progress"
            value={`${analytics.topicProgress}%`}
            icon="◒"
          />

        </section>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">

            <strong>
              Unable to load goals:
            </strong>{" "}

            {error}

          </div>

        )}


        {/* =====================================================
            EMPTY
        ===================================================== */}

        {goals.length === 0 ? (

          <section className="mt-6 rounded-3xl border border-white/10 bg-[#101116] p-10 md:p-16 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#c07d4c]/10 border border-[#c07d4c]/20 flex items-center justify-center text-3xl">
              🎯
            </div>

            <h2 className="text-xl font-bold mt-5">
              No goals yet
            </h2>

            <p className="text-sm text-[#858781] mt-2 max-w-md mx-auto">
              Create your first goal and break it down into focused topics.
            </p>

            <button
              onClick={openNewGoal}
              className="mt-6 px-5 py-3 rounded-xl bg-[#c07d4c] text-[#08090b] font-bold"
            >
              + Create Goal
            </button>

          </section>

        ) : (

          /* ===================================================
             GOAL LIST
          =================================================== */

          <section className="mt-6 space-y-4">

            {goals.map(
              (goal) => {

                const topics =
                  getTopicsForGoal(
                    goal.id
                  );

                const expanded =
                  expandedGoal ===
                  goal.id;

                const progress =
                  goalProgress(
                    goal
                  );

                const completedTopicCount =
                  topics.filter(
                    (topic) =>
                      topic.completed === true ||
                      Number(topic.progress) >= 100 ||
                      topic.status === "COMPLETED"
                  ).length;


                return (

                  <article
                    key={goal.id}
                    className="rounded-3xl border border-white/10 bg-[#101116] overflow-hidden shadow-xl shadow-black/10"
                  >

                    {/* =================================================
                        GOAL MAIN CARD
                    ================================================= */}

                    <div className="p-5 md:p-6">

                      <div className="flex flex-col xl:flex-row xl:items-start gap-5">


                        {/* ICON */}

                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#c07d4c]/10 border border-[#c07d4c]/20 flex items-center justify-center text-xl">
                          🎯
                        </div>


                        {/* MAIN */}

                        <div className="flex-1 min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h2 className="text-xl font-black truncate">
                              {goal.title}
                            </h2>

                            <StatusBadge
                              status={
                                goal.status
                              }
                            />

                            <PriorityBadge
                              priority={
                                goal.priority
                              }
                            />

                          </div>


                          <p className="text-sm text-[#858781] mt-2 line-clamp-2">
                            {goal.description ||
                              "No description added."}
                          </p>


                          {/* META */}

                          <div className="flex flex-wrap gap-2 mt-4">

                            {goal.category && (

                              <MetaPill>
                                ◇ {goal.category}
                              </MetaPill>

                            )}

                            <MetaPill>
                              📅{" "}
                              {formatDate(
                                goal.startDate
                              )}
                              {" → "}
                              {formatDate(
                                goal.endDate ||
                                goal.targetDate
                              )}
                            </MetaPill>


                            {(goal.startTime ||
                              goal.endTime) && (

                              <MetaPill>
                                ◷{" "}
                                {formatTime(
                                  goal.startTime
                                ) || "--:--"}
                                {" → "}
                                {formatTime(
                                  goal.endTime
                                ) || "--:--"}
                              </MetaPill>

                            )}


                            <MetaPill>
                              ◈{" "}
                              {topics.length}{" "}
                              {topics.length === 1
                                ? "Topic"
                                : "Topics"}
                            </MetaPill>


                            {goal.notificationsEnabled && (

                              <MetaPill accent>
                                🔔{" "}
                                {goal.reminderMinutesBefore ??
                                  10}{" "}
                                min before
                              </MetaPill>

                            )}

                          </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() =>
                              openEditGoal(
                                goal
                              )
                            }
                            className="w-10 h-10 rounded-xl border border-[#c07d4c]/20 bg-[#c07d4c]/5 text-[#d29a6d] hover:bg-[#c07d4c]/15 transition"
                            title="Edit goal"
                          >
                            ✎
                          </button>


                          <button
                            onClick={() =>
                              handleDeleteGoal(
                                goal
                              )
                            }
                            className="w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 hover:bg-red-500/10 transition"
                            title="Delete goal"
                          >
                            ×
                          </button>


                          <button
                            onClick={() =>
                              setExpandedGoal(
                                expanded
                                  ? null
                                  : goal.id
                              )
                            }
                            className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.06] transition"
                            title="Expand"
                          >
                            {expanded
                              ? "⌃"
                              : "⌄"}
                          </button>

                        </div>

                      </div>


                      {/* =================================================
                          PROGRESS
                      ================================================= */}

                      <div className="mt-6">

                        <div className="flex items-center justify-between text-xs mb-2">

                          <span className="text-[#858781]">
                            Goal progress
                          </span>

                          <span className="font-bold text-[#eee9e2]">
                            {goal.currentProgress ?? 0}
                            {" / "}
                            {goal.targetValue ?? 0}
                            {" "}
                            <span className="text-[#c07d4c]">
                              ({progress}%)
                            </span>
                          </span>

                        </div>


                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#a9633a] via-[#c07d4c] to-[#d29a6d] transition-all duration-500"
                            style={{
                              width:
                                `${progress}%`,
                            }}
                          />

                        </div>

                      </div>


                      {/* =================================================
                          SMALL STATS
                      ================================================= */}

                      <div className="grid grid-cols-3 gap-2 mt-5">

                        <MiniStat
                          label="Topics"
                          value={
                            topics.length
                          }
                        />

                        <MiniStat
                          label="Completed"
                          value={
                            completedTopicCount
                          }
                        />

                        <MiniStat
                          label="Progress"
                          value={
                            `${progress}%`
                          }
                        />

                      </div>

                    </div>


                    {/* =================================================
                        TOPICS
                    ================================================= */}

                    {expanded && (

                      <div className="border-t border-white/10 bg-[#0b0c0f] p-5 md:p-6">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

                          <div>

                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#c07d4c] font-bold">
                              Goal roadmap
                            </p>

                            <h3 className="text-lg font-black mt-1">
                              Goal Topics
                            </h3>

                            <p className="text-xs text-[#858781] mt-1">
                              Break this goal into focused milestones.
                            </p>

                          </div>


                          <button
                            onClick={() =>
                              openNewTopic(
                                goal
                              )
                            }
                            className="px-4 py-2.5 rounded-xl border border-[#c07d4c]/25 bg-[#c07d4c]/10 text-[#d29a6d] font-bold hover:bg-[#c07d4c]/15 transition"
                          >
                            + Add Topic
                          </button>

                        </div>


                        {topics.length === 0 ? (

                          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">

                            <div className="text-3xl">
                              ◈
                            </div>

                            <p className="font-bold mt-3">
                              No topics yet
                            </p>

                            <p className="text-xs text-[#858781] mt-1">
                              Add your first milestone for this goal.
                            </p>

                          </div>

                        ) : (

                          <div className="grid xl:grid-cols-2 gap-3">

                            {topics.map(
                              (topic) => (

                                <TopicCard
                                  key={
                                    topic.id
                                  }
                                  topic={
                                    topic
                                  }
                                  progress={
                                    topicProgress(
                                      topic
                                    )
                                  }
                                  onEdit={() =>
                                    openEditTopic(
                                      topic
                                    )
                                  }
                                  onDelete={() =>
                                    handleDeleteTopic(
                                      topic
                                    )
                                  }
                                  formatDate={
                                    formatDate
                                  }
                                  formatTime={
                                    formatTime
                                  }
                                />

                              )
                            )}

                          </div>

                        )}

                      </div>

                    )}

                  </article>

                );
              }
            )}

          </section>

        )}


      </main>


      {/* =========================================================
          GOAL MODAL
      ========================================================= */}

      {showGoalForm && (

        <GoalModal
          form={goalForm}
          setForm={setGoalForm}
          editing={editingGoal}
          onSubmit={
            handleGoalSubmit
          }
          onClose={
            closeGoalForm
          }
        />

      )}


      {/* =========================================================
          TOPIC MODAL
      ========================================================= */}

      {topicFormGoal && (

        <TopicModal
          form={topicForm}
          setForm={setTopicForm}
          editing={editingTopic}
          goal={topicFormGoal}
          onSubmit={
            handleTopicSubmit
          }
          onClose={
            closeTopicForm
          }
        />

      )}

    </div>
  );
}


// ============================================================
// ANALYTICS CARD
// ============================================================

function AnalyticsCard({
  title,
  value,
  icon,
}) {

  return (

    <div className="rounded-2xl border border-white/10 bg-[#101116] p-4">

      <div className="flex items-center justify-between">

        <span className="text-xs text-[#858781]">
          {title}
        </span>

        <span className="text-[#c07d4c]">
          {icon}
        </span>

      </div>

      <div className="text-2xl font-black mt-3">
        {value}
      </div>

    </div>
  );
}


// ============================================================
// META PILL
// ============================================================

function MetaPill({
  children,
  accent = false,
}) {

  return (

    <span
      className={
        accent
          ? "px-2.5 py-1.5 rounded-lg bg-[#c07d4c]/10 border border-[#c07d4c]/15 text-[#d29a6d] text-[11px]"
          : "px-2.5 py-1.5 rounded-lg bg-white/[0.035] border border-white/[0.06] text-[#858781] text-[11px]"
      }
    >
      {children}
    </span>
  );
}


// ============================================================
// MINI STAT
// ============================================================

function MiniStat({
  label,
  value,
}) {

  return (

    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">

      <p className="text-[10px] uppercase tracking-wider text-[#858781]">
        {label}
      </p>

      <p className="text-sm font-black mt-1">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
  status,
}) {

  const value =
    status ||
    "NOT_STARTED";


  const styles = {

    NOT_STARTED:
      "bg-white/[0.04] text-gray-300 border-white/10",

    IN_PROGRESS:
      "bg-[#c07d4c]/10 text-[#d29a6d] border-[#c07d4c]/20",

    COMPLETED:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",

    PENDING:
      "bg-amber-500/10 text-amber-300 border-amber-500/20",
  };


  return (

    <span
      className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wide font-bold border ${
        styles[value] ||
        styles.NOT_STARTED
      }`}
    >
      {formatStatusStatic(
        value
      )}
    </span>
  );
}


// ============================================================
// PRIORITY BADGE
// ============================================================

function PriorityBadge({
  priority,
}) {

  const value =
    priority ||
    "MEDIUM";


  return (

    <span className="px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wide font-bold border border-white/10 bg-white/[0.03] text-[#858781]">
      {value}
    </span>
  );
}


// ============================================================
// TOPIC CARD
// ============================================================

function TopicCard({
  topic,
  progress,
  onEdit,
  onDelete,
  formatDate,
  formatTime,
}) {

  return (

    <div className="rounded-2xl border border-white/[0.08] bg-[#101116] p-4 hover:border-[#c07d4c]/20 transition">


      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h4 className="font-bold truncate">
              {topic.topicName ||
                "Untitled Topic"}
            </h4>

            <StatusBadge
              status={
                topic.status
              }
            />

            <PriorityBadge
              priority={
                topic.priority
              }
            />

          </div>


          {topic.description && (

            <p className="text-xs text-[#858781] mt-2 line-clamp-2">
              {topic.description}
            </p>

          )}

        </div>


        <div className="flex gap-1 shrink-0">

          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-lg border border-[#c07d4c]/20 bg-[#c07d4c]/5 text-[#d29a6d]"
            title="Edit"
          >
            ✎
          </button>

          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg border border-red-500/20 bg-red-500/5 text-red-300"
            title="Delete"
          >
            ×
          </button>

        </div>

      </div>


      {/* PROGRESS */}

      <div className="mt-4">

        <div className="flex justify-between text-[11px] mb-2">

          <span className="text-[#858781]">
            Progress
          </span>

          <span className="font-bold text-[#d29a6d]">
            {progress}%
          </span>

        </div>


        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">

          <div
            className="h-full rounded-full bg-gradient-to-r from-[#a9633a] to-[#d29a6d]"
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>

      </div>


      {/* INFO */}

      <div className="grid grid-cols-2 gap-2 mt-4">

        <TopicInfo
          label="Schedule"
          value={
            topic.startDate ||
            topic.endDate
              ? `${formatDate(
                  topic.startDate
                )} → ${formatDate(
                  topic.endDate
                )}`
              : "Not set"
          }
        />


        <TopicInfo
          label="Time"
          value={
            topic.startTime ||
            topic.endTime
              ? `${formatTime(
                  topic.startTime
                ) || "--:--"} → ${formatTime(
                  topic.endTime
                ) || "--:--"}`
              : "Not set"
          }
        />


        <TopicInfo
          label="Estimated"
          value={`${topic.estimatedDuration ?? 0} min`}
        />


        <TopicInfo
          label="Actual"
          value={`${topic.actualDuration ?? 0} min`}
        />

      </div>


      {/* FOOTER */}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">

        <div className="flex items-center gap-2">

          {topic.notificationsEnabled ? (

            <span className="text-[10px] text-[#d29a6d]">
              🔔 {topic.reminderMinutesBefore ?? 10} min
            </span>

          ) : (

            <span className="text-[10px] text-[#858781]">
              Notifications off
            </span>

          )}

        </div>


        {topic.notes && (

          <span className="text-[10px] text-[#858781]">
            ◌ Notes added
          </span>

        )}

      </div>

    </div>
  );
}


// ============================================================
// TOPIC INFO
// ============================================================

function TopicInfo({
  label,
  value,
}) {

  return (

    <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] p-2.5">

      <p className="text-[9px] uppercase tracking-wide text-[#858781]">
        {label}
      </p>

      <p className="text-[10px] font-semibold mt-1 truncate">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// GOAL MODAL
// ============================================================

function GoalModal({
  form,
  setForm,
  editing,
  onSubmit,
  onClose,
}) {

  const update = (
    key,
    value
  ) => {

    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  };


  return (

    <ModalShell
      title={
        editing
          ? "Edit Goal"
          : "Create Goal"
      }
      subtitle={
        editing
          ? "Update your goal and keep your roadmap accurate."
          : "Define the target, timeframe and reminder settings."
      }
      onClose={onClose}
    >

      <form
        onSubmit={onSubmit}
      >

        <FormSection
          title="Goal information"
          subtitle="The identity of your goal."
        >

          <div className="grid md:grid-cols-2 gap-4">

            <Input
              label="Goal title"
              value={
                form.title
              }
              onChange={(value) =>
                update(
                  "title",
                  value
                )
              }
              placeholder="Java Fullstack"
              required
            />

            <Input
              label="Category"
              value={
                form.category
              }
              onChange={(value) =>
                update(
                  "category",
                  value
                )
              }
              placeholder="Programming"
            />

          </div>


          <TextArea
            label="Description"
            value={
              form.description
            }
            onChange={(value) =>
              update(
                "description",
                value
              )
            }
            placeholder="Complete Java Fullstack in 90 days..."
          />

        </FormSection>


        <FormSection
          title="Target & progress"
          subtitle="Measure the actual progress of this goal."
        >

          <div className="grid md:grid-cols-2 gap-4">

            <Input
              label="Target value"
              type="number"
              min="1"
              value={
                form.targetValue
              }
              onChange={(value) =>
                update(
                  "targetValue",
                  Number(value)
                )
              }
            />

            <Input
              label="Current progress"
              type="number"
              min="0"
              value={
                form.currentProgress
              }
              onChange={(value) =>
                update(
                  "currentProgress",
                  Number(value)
                )
              }
            />

          </div>

        </FormSection>


        <FormSection
          title="Schedule"
          subtitle="Set the date and optional daily time window."
        >

          <div className="grid md:grid-cols-2 gap-4">

            <Input
              label="Start date"
              type="date"
              value={
                form.startDate
              }
              onChange={(value) =>
                update(
                  "startDate",
                  value
                )
              }
            />

            <Input
              label="End date"
              type="date"
              value={
                form.endDate
              }
              onChange={(value) =>
                update(
                  "endDate",
                  value
                )
              }
            />

            <Input
              label="Start time"
              type="time"
              value={
                form.startTime
              }
              onChange={(value) =>
                update(
                  "startTime",
                  value
                )
              }
            />

            <Input
              label="End time"
              type="time"
              value={
                form.endTime
              }
              onChange={(value) =>
                update(
                  "endTime",
                  value
                )
              }
            />

          </div>

        </FormSection>


        <FormSection
          title="Status & priority"
          subtitle="Control the current state of your goal."
        >

          <div className="grid md:grid-cols-2 gap-4">

            <Select
              label="Priority"
              value={
                form.priority
              }
              onChange={(value) =>
                update(
                  "priority",
                  value
                )
              }
              options={[
                "LOW",
                "MEDIUM",
                "HIGH",
              ]}
            />

            <Select
              label="Status"
              value={
                form.status
              }
              onChange={(value) =>
                update(
                  "status",
                  value
                )
              }
              options={[
                "NOT_STARTED",
                "IN_PROGRESS",
                "COMPLETED",
              ]}
            />

          </div>


          <Checkbox
            checked={
              form.completed
            }
            onChange={(value) =>
              update(
                "completed",
                value
              )
            }
            label="Goal completed"
          />

        </FormSection>


        <FormSection
          title="Reminders"
          subtitle="Control notification behavior for this goal."
        >

          <div className="grid md:grid-cols-2 gap-4">

            <Input
              label="Reminder minutes before"
              type="number"
              min="0"
              value={
                form.reminderMinutesBefore
              }
              onChange={(value) =>
                update(
                  "reminderMinutesBefore",
                  Number(value)
                )
              }
            />

            <div className="flex items-end">

              <Checkbox
                checked={
                  form.notificationsEnabled
                }
                onChange={(value) =>
                  update(
                    "notificationsEnabled",
                    value
                  )
                }
                label="Enable notifications"
              />

            </div>

          </div>

        </FormSection>


        <ModalActions
          onClose={onClose}
          submitLabel={
            editing
              ? "Save Changes"
              : "Create Goal"
          }
        />

      </form>

    </ModalShell>
  );
}


// ============================================================
// TOPIC MODAL
// ============================================================

function TopicModal({
  form,
  setForm,
  editing,
  goal,
  onSubmit,
  onClose,
}) {

  const update = (
    key,
    value
  ) => {

    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  };


  return (

    <ModalShell
      title={
        editing
          ? "Edit Topic"
          : "Add Goal Topic"
      }
      subtitle={
        goal?.title
          ? `Roadmap for ${goal.title}`
          : "Create a focused milestone."
      }
      onClose={onClose}
    >

      <form
        onSubmit={onSubmit}
      >

        <FormSection
          title="Topic information"
          subtitle="Define the milestone."
        >

          <div className="grid md:grid-cols-2 gap-4">

            <Input
              label="Topic name"
              value={
                form.topicName
              }
              onChange={(value) =>
                update(
                  "topicName",
                  value
                )
              }
              placeholder="Learn Spring Security"
              required
            />

            <Select
              label="Priority"
              value={
                form.priority
              }
              onChange={(value) =>
                update(
                  "priority",
                  value
                )
              }
              options={[
                "LOW",
                "MEDIUM",
                "HIGH",
              ]}
            />

          </div>


          <TextArea
            label="Description"
            value={
              form.description
            }
            onChange={(value) =>
              update(
                "description",
                value
              )
            }
            placeholder="Study JWT and authorization..."
          />


          <TextArea
            label="Notes"
            value={
              form.notes
            }
            onChange={(value) =>
              update(
                "notes",
                value
              )
            }
            placeholder="Important notes, resources or checkpoints..."
          />

        </FormSection>


        <FormSection
          title="Schedule"
          subtitle="Set when this topic should be worked on."
        >

          <div className="grid md:grid-cols-2 gap-4">

            <Input
              label="Start date"
              type="date"
              value={
                form.startDate
              }
              onChange={(value) =>
                update(
                  "startDate",
                  value
                )
              }
            />

            <Input
              label="End date"
              type="date"
              value={
                form.endDate
              }
              onChange={(value) =>
                update(
                  "endDate",
                  value
                )
              }
            />

            <Input
              label="Start time"
              type="time"
              value={
                form.startTime
              }
              onChange={(value) =>
                update(
                  "startTime",
                  value
                )
              }
            />

            <Input
              label="End time"
              type="time"
              value={
                form.endTime
              }
              onChange={(value) =>
                update(
                  "endTime",
                  value
                )
              }
            />

          </div>

        </FormSection>


        <FormSection
          title="Time & progress"
          subtitle="Track planned versus actual effort."
        >

          <div className="grid md:grid-cols-2 gap-4">

            <Input
              label="Estimated duration (minutes)"
              type="number"
              min="0"
              value={
                form.estimatedDuration
              }
              onChange={(value) =>
                update(
                  "estimatedDuration",
                  Number(value)
                )
              }
            />

            <Input
              label="Actual duration (minutes)"
              type="number"
              min="0"
              value={
                form.actualDuration
              }
              onChange={(value) =>
                update(
                  "actualDuration",
                  Number(value)
                )
              }
            />

            <Input
              label="Progress (%)"
              type="number"
              min="0"
              max="100"
              value={
                form.progress
              }
              onChange={(value) =>
                update(
                  "progress",
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(value)
                    )
                  )
                )
              }
            />

            <Select
              label="Status"
              value={
                form.status
              }
              onChange={(value) =>
                update(
                  "status",
                  value
                )
              }
              options={[
                "NOT_STARTED",
                "IN_PROGRESS",
                "COMPLETED",
              ]}
            />

          </div>

        </FormSection>


        <FormSection
          title="Reminders & completion"
          subtitle="Configure notifications and completion state."
        >

          <div className="grid md:grid-cols-2 gap-4">

            <Input
              label="Reminder minutes before"
              type="number"
              min="0"
              value={
                form.reminderMinutesBefore
              }
              onChange={(value) =>
                update(
                  "reminderMinutesBefore",
                  Number(value)
                )
              }
            />

            <div className="flex items-end">

              <Checkbox
                checked={
                  form.notificationsEnabled
                }
                onChange={(value) =>
                  update(
                    "notificationsEnabled",
                    value
                  )
                }
                label="Enable notifications"
              />

            </div>

          </div>


          <Checkbox
            checked={
              form.completed
            }
            onChange={(value) =>
              update(
                "completed",
                value
              )
            }
            label="Topic completed"
          />

        </FormSection>


        <ModalActions
          onClose={onClose}
          submitLabel={
            editing
              ? "Save Topic"
              : "Add Topic"
          }
        />

      </form>

    </ModalShell>
  );
}


// ============================================================
// MODAL SHELL
// ============================================================

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}) {

  return (

    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6">

      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111217] shadow-2xl">

        <div className="sticky top-0 z-10 bg-[#111217]/95 backdrop-blur-xl border-b border-white/[0.07] px-5 md:px-7 py-5">

          <div className="flex items-start justify-between gap-4">

            <div>

              <p className="text-[9px] uppercase tracking-[0.25em] text-[#c07d4c] font-bold">
                HabitMile 365
              </p>

              <h2 className="text-2xl font-black mt-1">
                {title}
              </h2>

              <p className="text-xs text-[#858781] mt-1">
                {subtitle}
              </p>

            </div>


            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.07]"
            >
              ×
            </button>

          </div>

        </div>


        <div className="p-5 md:p-7">

          {children}

        </div>

      </div>

    </div>
  );
}


// ============================================================
// FORM SECTION
// ============================================================

function FormSection({
  title,
  subtitle,
  children,
}) {

  return (

    <section className="mb-6">

      <div className="mb-3">

        <h3 className="text-sm font-bold text-[#eee9e2]">
          {title}
        </h3>

        <p className="text-[11px] text-[#858781] mt-0.5">
          {subtitle}
        </p>

      </div>


      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 md:p-5 space-y-4">

        {children}

      </div>

    </section>
  );
}


// ============================================================
// INPUT
// ============================================================

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
}) {

  return (

    <div className="w-full">

      <label className="block text-[11px] font-semibold text-[#858781]">
        {label}
      </label>


      <input
        type={type}
        value={
          value ?? ""
        }
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full h-11 rounded-xl border border-white/[0.07] bg-[#18191f] px-3 text-sm text-[#eee9e2] outline-none focus:border-[#c07d4c]/50 transition placeholder:text-[#555861]"
      />

    </div>
  );
}


// ============================================================
// TEXTAREA
// ============================================================

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}) {

  return (

    <div className="w-full">

      <label className="block text-[11px] font-semibold text-[#858781]">
        {label}
      </label>


      <textarea
        value={
          value ?? ""
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full rounded-xl border border-white/[0.07] bg-[#18191f] p-3 text-sm text-[#eee9e2] outline-none resize-y focus:border-[#c07d4c]/50 transition placeholder:text-[#555861]"
      />

    </div>
  );
}


// ============================================================
// SELECT
// ============================================================

function Select({
  label,
  value,
  onChange,
  options,
}) {

  return (

    <div className="w-full">

      <label className="block text-[11px] font-semibold text-[#858781]">
        {label}
      </label>


      <select
        value={
          value ?? ""
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full h-11 rounded-xl border border-white/[0.07] bg-[#18191f] px-3 text-sm text-[#eee9e2] outline-none focus:border-[#c07d4c]/50"
      >

        {options.map(
          (option) => (

            <option
              key={option}
              value={option}
              className="bg-[#18191f]"
            >
              {formatStatusStatic(
                option
              )}
            </option>

          )
        )}

      </select>

    </div>
  );
}


// ============================================================
// CHECKBOX
// ============================================================

function Checkbox({
  checked,
  onChange,
  label,
}) {

  return (

    <label className="flex items-center gap-3 min-h-11 cursor-pointer">

      <input
        type="checkbox"
        checked={
          Boolean(checked)
        }
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
        className="w-4 h-4 accent-[#c07d4c]"
      />

      <span className="text-xs text-[#eee9e2]">
        {label}
      </span>

    </label>
  );
}


// ============================================================
// MODAL ACTIONS
// ============================================================

function ModalActions({
  onClose,
  submitLabel,
}) {

  return (

    <div className="flex justify-end gap-3 pt-2">

      <button
        type="button"
        onClick={onClose}
        className="px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-gray-300 hover:bg-white/[0.07]"
      >
        Cancel
      </button>


      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-[#c07d4c] hover:bg-[#d29a6d] text-[#08090b] text-sm font-black transition"
      >
        {submitLabel}
      </button>

    </div>
  );
}


// ============================================================
// STATIC FORMAT
// ============================================================

function formatStatusStatic(
  value
) {

  return (
    value
      ?.replaceAll(
        "_",
        " "
      )
      ?.toLowerCase()
      ?.replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      ) ||
    "Not Set"
  );
}