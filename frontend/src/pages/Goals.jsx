import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import useGoals from "../hooks/useGoals";

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

  // ====================================================
  // GOAL FORM
  // ====================================================

  const emptyGoal = {
    title: "",
    description: "",
    category: "",
    targetValue: 1,
    currentProgress: 0,
    startDate: "",
    targetDate: "",
    startTime: "",
    endTime: "",
    notificationsEnabled: true,
    reminderMinutesBefore: 15,
    priority: "MEDIUM",
    status: "NOT_STARTED",
    completed: false,
  };

  const [goalForm, setGoalForm] =
    useState(emptyGoal);

  // ====================================================
  // TOPIC FORM
  // ====================================================

  const emptyTopic = {
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
    reminderMinutesBefore: 15,
    completed: false,
  };

  const [topicForm, setTopicForm] =
    useState(emptyTopic);

  // ====================================================
  // GOAL SUBMIT
  // ====================================================

  const handleGoalSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingGoal) {
        await editGoal(
          editingGoal.id,
          goalForm
        );
      } else {
        await addGoal(goalForm);
      }

      closeGoalForm();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to save goal."
      );
    }
  };

  // ====================================================
  // TOPIC SUBMIT
  // ====================================================

  const handleTopicSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTopic) {
        await editTopic(
          editingTopic.id,
          topicForm
        );
      } else {
        await addTopic(
          topicFormGoal.id,
          topicForm
        );
      }

      closeTopicForm();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to save topic."
      );
    }
  };

  // ====================================================
  // OPEN GOAL EDIT
  // ====================================================

  const openEditGoal = (goal) => {
    setEditingGoal(goal);

    setGoalForm({
      title: goal.title || "",
      description: goal.description || "",
      category: goal.category || "",
      targetValue: goal.targetValue ?? 1,
      currentProgress:
        goal.currentProgress ?? 0,
      startDate: goal.startDate || "",
      targetDate: goal.targetDate || "",
      startTime: goal.startTime || "",
      endTime: goal.endTime || "",
      notificationsEnabled:
        goal.notificationsEnabled ?? true,
      reminderMinutesBefore:
        goal.reminderMinutesBefore ?? 15,
      priority: goal.priority || "MEDIUM",
      status:
        goal.status || "NOT_STARTED",
      completed:
        goal.completed ?? false,
    });

    setShowGoalForm(true);
  };

  // ====================================================
  // OPEN TOPIC EDIT
  // ====================================================

  const openEditTopic = (topic) => {
    setEditingTopic(topic);

    setTopicForm({
      topicName:
        topic.topicName || "",
      description:
        topic.description || "",
      notes:
        topic.notes || "",
      startDate:
        topic.startDate || "",
      endDate:
        topic.endDate || "",
      startTime:
        topic.startTime || "",
      endTime:
        topic.endTime || "",
      estimatedDuration:
        topic.estimatedDuration ?? 60,
      actualDuration:
        topic.actualDuration ?? 0,
      progress:
        topic.progress ?? 0,
      priority:
        topic.priority || "MEDIUM",
      status:
        topic.status || "NOT_STARTED",
      notificationsEnabled:
        topic.notificationsEnabled ?? true,
      reminderMinutesBefore:
        topic.reminderMinutesBefore ?? 15,
      completed:
        topic.completed ?? false,
    });

    setTopicFormGoal(
      topic.goal || {
        id: topic.goalId,
      }
    );
  };

  // ====================================================
  // OPEN NEW TOPIC
  // ====================================================

  const openTopicForm = (goal) => {
    setTopicFormGoal(goal);
    setEditingTopic(null);
    setTopicForm(emptyTopic);
  };

  // ====================================================
  // CLOSE FORMS
  // ====================================================

  const closeGoalForm = () => {
    setShowGoalForm(false);
    setEditingGoal(null);
    setGoalForm(emptyGoal);
  };

  const closeTopicForm = () => {
    setTopicFormGoal(null);
    setEditingTopic(null);
    setTopicForm(emptyTopic);
  };

  // ====================================================
  // DELETE GOAL
  // ====================================================

  const handleDeleteGoal = async (goal) => {
    const confirmed =
      window.confirm(
        `Delete "${goal.title}"?`
      );

    if (!confirmed) return;

    try {
      await removeGoal(goal.id);

      if (
        expandedGoal === goal.id
      ) {
        setExpandedGoal(null);
      }
    } catch (err) {
      alert(
        "Unable to delete goal."
      );
    }
  };

  // ====================================================
  // DELETE TOPIC
  // ====================================================

  const handleDeleteTopic = async (
    topic
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${topic.topicName}"?`
      );

    if (!confirmed) return;

    try {
      await removeTopic(topic.id);
    } catch {
      alert(
        "Unable to delete topic."
      );
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070c] text-white flex items-center justify-center">
        Loading goals...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070c] text-white flex">

      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto">

        <Topbar title="Goals" />

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-3xl font-black">
              Your Goals
            </h1>

            <p className="text-gray-400 mt-1">
              Create a goal and organize
              everything you need to achieve it.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null);
              setGoalForm(emptyGoal);
              setShowGoalForm(true);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold hover:scale-[1.02] transition"
          >
            + New Goal
          </button>

        </section>

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

          <AnalyticsCard
            title="Total Goals"
            value={analytics.totalGoals}
            icon="🎯"
          />

          <AnalyticsCard
            title="Active Goals"
            value={analytics.activeGoals}
            icon="🚀"
          />

          <AnalyticsCard
            title="Completed Goals"
            value={analytics.completedGoals}
            icon="✓"
          />

          <AnalyticsCard
            title="Topic Progress"
            value={`${analytics.topicProgress}%`}
            icon="📈"
          />

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">
            {error}
          </div>
        )}

        {/* =================================================
            GOALS
        ================================================= */}

        <section className="mt-6 space-y-4">

          {goals.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">

              <div className="text-5xl mb-4">
                🎯
              </div>

              <h2 className="text-xl font-bold">
                No goals yet
              </h2>

              <p className="text-gray-400 mt-2">
                Create your first goal and
                start building your roadmap.
              </p>

              <button
                onClick={() =>
                  setShowGoalForm(true)
                }
                className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold"
              >
                + Create Goal
              </button>

            </div>
          ) : (
            goals.map((goal) => {

              const goalTopics =
                getTopicsForGoal(
                  goal.id
                );

              const isExpanded =
                expandedGoal === goal.id;

              const progress =
                goal.targetValue > 0
                  ? Math.min(
                      100,
                      Math.round(
                        ((goal.currentProgress ||
                          0) /
                          goal.targetValue) *
                          100
                      )
                    )
                  : 0;

              return (
                <div
                  key={goal.id}
                  className="glass rounded-3xl overflow-hidden border border-white/10"
                >

                  {/* =================================================
                      GOAL HEADER
                  ================================================= */}

                  <div className="p-6">

                    <div className="flex flex-col xl:flex-row xl:items-center gap-5">

                      <button
                        onClick={() =>
                          setExpandedGoal(
                            isExpanded
                              ? null
                              : goal.id
                          )
                        }
                        className="flex-1 text-left"
                      >

                        <div className="flex items-start gap-4">

                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xl">
                            🎯
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h2 className="text-xl font-bold">
                                {goal.title}
                              </h2>

                              <StatusBadge
                                status={
                                  goal.status
                                }
                              />

                            </div>

                            <p className="text-sm text-gray-400 mt-1">
                              {goal.description ||
                                "No description"}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-3">

                              {goal.category && (
                                <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300">
                                  {goal.category}
                                </span>
                              )}

                              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300">
                                {goal.startDate ||
                                  "No start date"}
                              </span>

                              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300">
                                →
                              </span>

                              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300">
                                {goal.targetDate ||
                                  "No target date"}
                              </span>

                              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs">
                                {goalTopics.length} topics
                              </span>

                            </div>

                          </div>

                        </div>

                      </button>

                      {/* GOAL ACTIONS */}

                      <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            openEditGoal(goal)
                          }
                          title="Edit goal"
                          className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition"
                        >
                          ✎
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteGoal(
                              goal
                            )
                          }
                          title="Delete goal"
                          className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition"
                        >
                          🗑
                        </button>

                        <button
                          onClick={() =>
                            setExpandedGoal(
                              isExpanded
                                ? null
                                : goal.id
                            )
                          }
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10"
                        >
                          {isExpanded
                            ? "⌃"
                            : "⌄"}
                        </button>

                      </div>

                    </div>

                    {/* GOAL PROGRESS */}

                    <div className="mt-5">

                      <div className="flex justify-between text-xs mb-2">

                        <span className="text-gray-400">
                          Goal progress
                        </span>

                        <span className="font-semibold">
                          {goal.currentProgress || 0}
                          /
                          {goal.targetValue || 0}
                          {" "}
                          ({progress}%)
                        </span>

                      </div>

                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all"
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      TOPICS
                  ================================================= */}

                  {isExpanded && (
                    <div className="border-t border-white/10 bg-black/10 p-6">

                      <div className="flex items-center justify-between mb-5">

                        <div>
                          <h3 className="text-lg font-bold">
                            Goal Topics
                          </h3>

                          <p className="text-sm text-gray-400">
                            Topics and study/work
                            sessions inside{" "}
                            <span className="text-white">
                              {goal.title}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            openTopicForm(goal)
                          }
                          className="px-4 py-2 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/20 transition"
                        >
                          + Add Topic
                        </button>

                      </div>

                      {goalTopics.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">

                          <div className="text-3xl">
                            📚
                          </div>

                          <p className="font-semibold mt-2">
                            No topics yet
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Add topics such as OOPS,
                            Spring Boot, React,
                            PostgreSQL, etc.
                          </p>

                        </div>
                      ) : (
                        <div className="space-y-3">

                          {goalTopics.map(
                            (topic) => {

                              const topicProgress =
                                Math.min(
                                  100,
                                  Number(
                                    topic.progress ||
                                      0
                                  )
                                );

                              return (
                                <div
                                  key={topic.id}
                                  className="rounded-2xl bg-white/5 border border-white/10 p-4"
                                >

                                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                                    {/* TOPIC NAME */}

                                    <div className="flex-1">

                                      <div className="flex flex-wrap items-center gap-2">

                                        <h4 className="font-bold">
                                          {topic.topicName}
                                        </h4>

                                        <StatusBadge
                                          status={
                                            topic.status
                                          }
                                        />

                                      </div>

                                      {topic.description && (
                                        <p className="text-sm text-gray-400 mt-1">
                                          {
                                            topic.description
                                          }
                                        </p>
                                      )}

                                    </div>

                                    {/* DATE */}

                                    <div className="text-xs text-gray-400">

                                      <div>
                                        📅{" "}
                                        {topic.startDate ||
                                          "-"}{" "}
                                        →{" "}
                                        {topic.endDate ||
                                          "-"}
                                      </div>

                                      <div className="mt-1">
                                        🕐{" "}
                                        {topic.startTime ||
                                          "-"}{" "}
                                        →{" "}
                                        {topic.endTime ||
                                          "-"}
                                      </div>

                                    </div>

                                    {/* DURATION */}

                                    <div className="text-xs text-gray-400">

                                      <div>
                                        Estimated
                                      </div>

                                      <strong className="text-white">
                                        {
                                          topic.estimatedDuration
                                        }{" "}
                                        min
                                      </strong>

                                    </div>

                                    {/* PROGRESS */}

                                    <div className="w-full lg:w-32">

                                      <div className="flex justify-between text-xs mb-1">

                                        <span className="text-gray-500">
                                          Progress
                                        </span>

                                        <span>
                                          {
                                            topicProgress
                                          }%
                                        </span>

                                      </div>

                                      <div className="h-1.5 rounded-full bg-white/10">

                                        <div
                                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                                          style={{
                                            width: `${topicProgress}%`,
                                          }}
                                        />

                                      </div>

                                    </div>

                                    {/* ACTIONS */}

                                    <div className="flex gap-2">

                                      <button
                                        onClick={() =>
                                          openEditTopic(
                                            topic
                                          )
                                        }
                                        title="Edit topic"
                                        className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300"
                                      >
                                        ✎
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleDeleteTopic(
                                            topic
                                          )
                                        }
                                        title="Delete topic"
                                        className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300"
                                      >
                                        🗑
                                      </button>

                                    </div>

                                  </div>

                                </div>
                              );
                            }
                          )}

                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })
          )}

        </section>

      </main>

      {/* ======================================================
          GOAL MODAL
      ====================================================== */}

      {showGoalForm && (
        <GoalModal
          form={goalForm}
          setForm={setGoalForm}
          editing={editingGoal}
          onSubmit={handleGoalSubmit}
          onClose={closeGoalForm}
        />
      )}

      {/* ======================================================
          TOPIC MODAL
      ====================================================== */}

      {topicFormGoal && (
        <TopicModal
          form={topicForm}
          setForm={setTopicForm}
          editing={editingTopic}
          goal={topicFormGoal}
          onSubmit={handleTopicSubmit}
          onClose={closeTopicForm}
        />
      )}

    </div>
  );
}

// ==========================================================
// ANALYTICS CARD
// ==========================================================

function AnalyticsCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/10">

      <div className="flex items-center justify-between">

        <span className="text-gray-400 text-sm">
          {title}
        </span>

        <span>
          {icon}
        </span>

      </div>

      <div className="text-3xl font-black mt-3">
        {value}
      </div>

    </div>
  );
}

// ==========================================================
// STATUS
// ==========================================================

function StatusBadge({ status }) {

  const value =
    status || "NOT_STARTED";

  const styles = {
    NOT_STARTED:
      "bg-gray-500/10 text-gray-300 border-gray-500/20",

    IN_PROGRESS:
      "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",

    COMPLETED:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",

    PENDING:
      "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
        styles[value] ||
        styles.NOT_STARTED
      }`}
    >
      {value.replace(
        "_",
        " "
      )}
    </span>
  );
}

// ==========================================================
// GOAL MODAL
// ==========================================================

function GoalModal({
  form,
  setForm,
  editing,
  onSubmit,
  onClose,
}) {
  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

      <form
        onSubmit={onSubmit}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#111118] border border-white/10 rounded-3xl p-6"
      >

        <div className="flex justify-between items-center mb-6">

          <div>
            <h2 className="text-2xl font-black">
              {editing
                ? "Edit Goal"
                : "Create Goal"}
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Define your main goal and
              timeframe.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5"
          >
            ✕
          </button>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            label="Goal title"
            value={form.title}
            onChange={(v) =>
              update("title", v)
            }
            required
            placeholder="Java Fullstack"
          />

          <Input
            label="Category"
            value={form.category}
            onChange={(v) =>
              update("category", v)
            }
            placeholder="Programming"
          />

          <div className="md:col-span-2">

            <label className="text-sm text-gray-400">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                update(
                  "description",
                  e.target.value
                )
              }
              className="field mt-2 min-h-24"
              placeholder="Complete Java Fullstack in 90 days"
            />

          </div>

          <Input
            label="Target value"
            type="number"
            value={form.targetValue}
            onChange={(v) =>
              update(
                "targetValue",
                Number(v)
              )
            }
          />

          <Input
            label="Current progress"
            type="number"
            value={form.currentProgress}
            onChange={(v) =>
              update(
                "currentProgress",
                Number(v)
              )
            }
          />

          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(v) =>
              update(
                "startDate",
                v
              )
            }
          />

          <Input
            label="Target date"
            type="date"
            value={form.targetDate}
            onChange={(v) =>
              update(
                "targetDate",
                v
              )
            }
          />

          <Input
            label="Start time"
            type="time"
            value={form.startTime}
            onChange={(v) =>
              update(
                "startTime",
                v
              )
            }
          />

          <Input
            label="End time"
            type="time"
            value={form.endTime}
            onChange={(v) =>
              update(
                "endTime",
                v
              )
            }
          />

          <Select
            label="Priority"
            value={form.priority}
            onChange={(v) =>
              update(
                "priority",
                v
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
            value={form.status}
            onChange={(v) =>
              update(
                "status",
                v
              )
            }
            options={[
              "NOT_STARTED",
              "IN_PROGRESS",
              "COMPLETED",
            ]}
          />

          <Input
            label="Reminder minutes"
            type="number"
            value={
              form.reminderMinutesBefore
            }
            onChange={(v) =>
              update(
                "reminderMinutesBefore",
                Number(v)
              )
            }
          />

        </div>

        <label className="flex items-center gap-3 mt-5 text-sm">

          <input
            type="checkbox"
            checked={
              form.notificationsEnabled
            }
            onChange={(e) =>
              update(
                "notificationsEnabled",
                e.target.checked
              )
            }
          />

          Enable notifications

        </label>

        <div className="flex justify-end gap-3 mt-6">

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-white/5 border border-white/10"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold"
          >
            {editing
              ? "Save Changes"
              : "Create Goal"}
          </button>

        </div>

      </form>

    </div>
  );
}

// ==========================================================
// TOPIC MODAL
// ==========================================================

function TopicModal({
  form,
  setForm,
  editing,
  goal,
  onSubmit,
  onClose,
}) {
  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

      <form
        onSubmit={onSubmit}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#111118] border border-white/10 rounded-3xl p-6"
      >

        <div className="flex justify-between items-center mb-6">

          <div>
            <p className="text-xs text-cyan-300">
              GOAL
            </p>

            <h2 className="text-2xl font-black">
              {goal?.title}
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              {editing
                ? "Edit goal topic"
                : "Add a topic to this goal"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5"
          >
            ✕
          </button>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            label="Topic name"
            value={form.topicName}
            onChange={(v) =>
              update(
                "topicName",
                v
              )
            }
            required
            placeholder="Learn Spring Security"
          />

          <Select
            label="Priority"
            value={form.priority}
            onChange={(v) =>
              update(
                "priority",
                v
              )
            }
            options={[
              "LOW",
              "MEDIUM",
              "HIGH",
            ]}
          />

          <div className="md:col-span-2">

            <label className="text-sm text-gray-400">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                update(
                  "description",
                  e.target.value
                )
              }
              className="field mt-2"
              placeholder="Study JWT and authorization"
            />

          </div>

          <div className="md:col-span-2">

            <label className="text-sm text-gray-400">
              Notes
            </label>

            <textarea
              value={form.notes}
              onChange={(e) =>
                update(
                  "notes",
                  e.target.value
                )
              }
              className="field mt-2"
              placeholder="Focus on filters and ownership checks"
            />

          </div>

          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(v) =>
              update(
                "startDate",
                v
              )
            }
          />

          <Input
            label="End date"
            type="date"
            value={form.endDate}
            onChange={(v) =>
              update(
                "endDate",
                v
              )
            }
          />

          <Input
            label="Start time"
            type="time"
            value={form.startTime}
            onChange={(v) =>
              update(
                "startTime",
                v
              )
            }
          />

          <Input
            label="End time"
            type="time"
            value={form.endTime}
            onChange={(v) =>
              update(
                "endTime",
                v
              )
            }
          />

          <Input
            label="Estimated duration (minutes)"
            type="number"
            value={
              form.estimatedDuration
            }
            onChange={(v) =>
              update(
                "estimatedDuration",
                Number(v)
              )
            }
          />

          <Input
            label="Actual duration (minutes)"
            type="number"
            value={
              form.actualDuration
            }
            onChange={(v) =>
              update(
                "actualDuration",
                Number(v)
              )
            }
          />

          <Input
            label="Progress (%)"
            type="number"
            min="0"
            max="100"
            value={form.progress}
            onChange={(v) =>
              update(
                "progress",
                Math.min(
                  100,
                  Math.max(
                    0,
                    Number(v)
                  )
                )
              )
            }
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(v) =>
              update(
                "status",
                v
              )
            }
            options={[
              "NOT_STARTED",
              "IN_PROGRESS",
              "COMPLETED",
            ]}
          />

          <Input
            label="Reminder minutes"
            type="number"
            value={
              form.reminderMinutesBefore
            }
            onChange={(v) =>
              update(
                "reminderMinutesBefore",
                Number(v)
              )
            }
          />

        </div>

        <label className="flex items-center gap-3 mt-5 text-sm">

          <input
            type="checkbox"
            checked={
              form.notificationsEnabled
            }
            onChange={(e) =>
              update(
                "notificationsEnabled",
                e.target.checked
              )
            }
          />

          Enable notifications

        </label>

        <div className="flex justify-end gap-3 mt-6">

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-white/5 border border-white/10"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold"
          >
            {editing
              ? "Save Topic"
              : "Add Topic"}
          </button>

        </div>

      </form>

    </div>
  );
}

// ==========================================================
// INPUT
// ==========================================================

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
    <div>

      <label className="text-sm text-gray-400">
        {label}
      </label>

      <input
        type={type}
        value={value ?? ""}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="field mt-2"
      />

    </div>
  );
}

// ==========================================================
// SELECT
// ==========================================================

function Select({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label className="text-sm text-gray-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="field mt-2"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[#111118]"
          >
            {option.replace(
              "_",
              " "
            )}
          </option>
        ))}
      </select>

    </div>
  );
}