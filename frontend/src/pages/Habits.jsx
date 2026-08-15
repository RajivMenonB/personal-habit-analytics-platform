import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const API_URL = "http://localhost:8081/api/habits";

const EMPTY_FORM = {
  title: "",
  description: "",
  notes: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  targetCount: 1,
  currentProgress: 0,
  priority: "MEDIUM",
  status: "NOT_STARTED",
  notificationsEnabled: false,
  reminderMinutesBefore: 10,
  completed: false,
};

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  /* =====================================================
     AUTH
  ===================================================== */

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          text || `Failed to load habits (${response.status})`
        );
      }

      const data = await response.json();

      setHabits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to load habits"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     MESSAGE
  ===================================================== */

  const successMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  /* =====================================================
     FORM
  ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =====================================================
     TIME
  ===================================================== */

  const formatTimeForInput = (time) => {
    if (!time) return "";

    return String(time).substring(0, 5);
  };

  const formatTime = (time) => {
    if (!time) return "--";

    const parts = String(time).split(":");

    if (parts.length < 2) {
      return String(time);
    }

    let hour = Number(parts[0]);
    const minute = parts[1];

    const suffix =
      hour >= 12 ? "PM" : "AM";

    hour = hour % 12;

    if (hour === 0) {
      hour = 12;
    }

    return `${String(hour).padStart(
      2,
      "0"
    )}:${minute} ${suffix}`;
  };

  /*
    IMPORTANT:

    Your backend expects:

        01:50

    NOT:

        01:50:00

    The previous code added ":00", which caused
    the LocalTime parsing error.
  */

  const backendTime = (time) => {
    if (!time) return null;

    return String(time).substring(0, 5);
  };

  /* =====================================================
     ADD
  ===================================================== */

  const openAddModal = () => {
    setEditingHabit(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowModal(true);
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const openEditModal = (habit) => {
    setEditingHabit(habit);

    setForm({
      title: habit.title || "",
      description: habit.description || "",
      notes: habit.notes || "",

      startDate: habit.startDate || "",
      endDate: habit.endDate || "",

      startTime: formatTimeForInput(
        habit.startTime
      ),

      endTime: formatTimeForInput(
        habit.endTime
      ),

      targetCount:
        habit.targetCount ?? 1,

      currentProgress:
        habit.currentProgress ?? 0,

      priority:
        habit.priority || "MEDIUM",

      status:
        habit.status || "NOT_STARTED",

      notificationsEnabled:
        habit.notificationsEnabled ?? false,

      reminderMinutesBefore:
        habit.reminderMinutesBefore ?? 10,

      completed:
        habit.completed ?? false,
    });

    setError("");
    setShowModal(true);
  };

  /* =====================================================
     CREATE / EDIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const target = Math.max(
        1,
        Number(form.targetCount) || 1
      );

      let progress = Math.max(
        0,
        Number(form.currentProgress) || 0
      );

      progress = Math.min(
        progress,
        target
      );

      let status = form.status;

      if (progress === 0) {
        status = "NOT_STARTED";
      } else if (progress >= target) {
        progress = target;
        status = "COMPLETED";
      } else {
        status = "IN_PROGRESS";
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        notes: form.notes.trim(),

        startDate:
          form.startDate || null,

        endDate:
          form.endDate || null,

        /*
          IMPORTANT:
          Send HH:mm only.
        */

        startTime:
          backendTime(form.startTime),

        endTime:
          backendTime(form.endTime),

        targetCount: target,

        currentProgress: progress,

        priority: form.priority,

        status: status,

        notificationsEnabled:
          Boolean(
            form.notificationsEnabled
          ),

        reminderMinutesBefore:
          Number(
            form.reminderMinutesBefore
          ) || 0,

        completed:
          status === "COMPLETED",
      };

      let response;

      if (editingHabit) {
        response = await fetch(
          `${API_URL}/${editingHabit.id}`,
          {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch(
          API_URL,
          {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload),
          }
        );
      }

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          text || "Failed to save habit"
        );
      }

      setShowModal(false);
      setEditingHabit(null);
      setForm({ ...EMPTY_FORM });

      await loadHabits();

      successMessage(
        editingHabit
          ? "Habit updated successfully."
          : "Habit created successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to save habit"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     UPDATE PROGRESS
  ===================================================== */

  const updateProgress = async (
    habit,
    requestedProgress
  ) => {
    try {
      setUpdatingId(habit.id);
      setError("");

      const target = Math.max(
        1,
        Number(habit.targetCount) || 1
      );

      let progress = Math.max(
        0,
        Number(requestedProgress) || 0
      );

      progress = Math.min(
        progress,
        target
      );

      let status;

      if (progress <= 0) {
        status = "NOT_STARTED";
        progress = 0;
      } else if (progress >= target) {
        status = "COMPLETED";
        progress = target;
      } else {
        status = "IN_PROGRESS";
      }

      /*
        Send ONLY valid backend fields.

        Most importantly:
        startTime = HH:mm
        endTime   = HH:mm
      */

      const payload = {
        title: habit.title || "",

        description:
          habit.description || "",

        notes:
          habit.notes || "",

        startDate:
          habit.startDate || null,

        endDate:
          habit.endDate || null,

        startTime:
          backendTime(habit.startTime),

        endTime:
          backendTime(habit.endTime),

        targetCount: target,

        currentProgress: progress,

        priority:
          habit.priority || "MEDIUM",

        status: status,

        notificationsEnabled:
          habit.notificationsEnabled ?? false,

        reminderMinutesBefore:
          Number(
            habit.reminderMinutesBefore ?? 10
          ),

        completed:
          status === "COMPLETED",
      };

      const response = await fetch(
        `${API_URL}/${habit.id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Failed to update progress"
        );
      }

      /*
        Update UI immediately.
      */

      setHabits((previous) =>
        previous.map((item) =>
          item.id === habit.id
            ? {
                ...item,
                currentProgress:
                  progress,
                status: status,
                completed:
                  status === "COMPLETED",
              }
            : item
        )
      );

      /*
        Reload from backend.
        This verifies that the database
        actually contains the new progress.
      */

      await loadHabits();

      if (status === "COMPLETED") {
        successMessage(
          `${habit.title} completed! ${progress}/${target}`
        );
      } else {
        successMessage(
          `${habit.title}: ${progress}/${target}`
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to update progress"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =====================================================
     +1 PROGRESS BUTTON
  ===================================================== */

  const increaseProgress = (habit) => {
    const current =
      Number(
        habit.currentProgress || 0
      );

    const target =
      Number(
        habit.targetCount || 1
      );

    if (current >= target) {
      return;
    }

    updateProgress(
      habit,
      current + 1
    );
  };

  /* =====================================================
     RESET PROGRESS
  ===================================================== */

  const resetProgress = (habit) => {
    updateProgress(
      habit,
      0
    );
  };

  /* =====================================================
     COMPLETE
  ===================================================== */

  const completeHabit = (habit) => {
    updateProgress(
      habit,
      Number(
        habit.targetCount || 1
      )
    );
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const deleteHabit = async (habit) => {
    const confirmed =
      window.confirm(
        `Delete "${habit.title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(habit.id);
      setError("");

      const response = await fetch(
        `${API_URL}/${habit.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Failed to delete habit"
        );
      }

      setHabits((previous) =>
        previous.filter(
          (item) =>
            item.id !== habit.id
        )
      );

      successMessage(
        `"${habit.title}" deleted.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to delete habit"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =====================================================
     PROGRESS %
  ===================================================== */

  const getProgress = (habit) => {
    const target =
      Number(
        habit.targetCount || 0
      );

    const current =
      Number(
        habit.currentProgress || 0
      );

    if (target <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (current / target) * 100
      )
    );
  };

  /* =====================================================
     STATUS BUTTON STYLE
  ===================================================== */

  const statusClass = (
    habit,
    status
  ) => {
    const active =
      habit.status === status;

    if (
      status === "NOT_STARTED"
    ) {
      return active
        ? "border-purple-400 bg-purple-500/20 text-purple-300"
        : "border-white/10 text-gray-500 hover:border-purple-400 hover:text-purple-300";
    }

    if (
      status === "IN_PROGRESS"
    ) {
      return active
        ? "border-cyan-400 bg-cyan-400/20 text-cyan-300"
        : "border-white/10 text-gray-500 hover:border-cyan-400 hover:text-cyan-300";
    }

    return active
      ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
      : "border-white/10 text-gray-500 hover:border-emerald-400 hover:text-emerald-300";
  };

  /* =====================================================
     NOTIFICATION
  ===================================================== */

  const toggleNotifications = async (
    enabled
  ) => {
    setForm((previous) => ({
      ...previous,
      notificationsEnabled:
        enabled,
    }));

    if (
      enabled &&
      "Notification" in window
    ) {
      try {
        if (
          Notification.permission ===
          "default"
        ) {
          await Notification.requestPermission();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  /* =====================================================
     STATISTICS
  ===================================================== */

  const total = habits.length;

  const completed = habits.filter(
    (habit) =>
      habit.status ===
        "COMPLETED" ||
      habit.completed
  ).length;

  const active =
    total - completed;

  const overall =
    total === 0
      ? 0
      : Math.round(
          habits.reduce(
            (sum, habit) =>
              sum +
              getProgress(habit),
            0
          ) / total
        );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin mx-auto mb-4" />

          <p className="text-gray-400 text-sm">
            Loading your habits...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#07070c] text-white flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 md:p-5 overflow-x-hidden">

        <Topbar
          title="Habits"
          user={user}
        />

        {/* HEADER */}

        <div className="flex items-center justify-between mt-5 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">
              Daily Habits
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              Build consistency and track real progress.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold text-sm hover:scale-[1.02] transition"
          >
            + Add Habit
          </button>
        </div>

        {/* SUCCESS */}

        {message && (
          <div className="mb-3 px-4 py-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 text-sm">
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}

        {/* STATISTICS */}

        <div className="grid grid-cols-3 gap-3 mb-4">

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] uppercase text-gray-500">
              Total
            </p>

            <p className="text-xl font-black mt-1">
              {total}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] uppercase text-gray-500">
              Active
            </p>

            <p className="text-xl font-black text-cyan-300 mt-1">
              {active}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] uppercase text-gray-500">
              Overall
            </p>

            <p className="text-xl font-black text-purple-300 mt-1">
              {overall}%
            </p>
          </div>

        </div>

        {/* HABIT TABLE */}

        {habits.length > 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] overflow-x-auto shadow-2xl">

            {/* HEADER */}

            <div className="min-w-[950px] grid grid-cols-[2fr_1.2fr_.7fr_1.25fr_1.1fr_.6fr] items-center px-4 py-3 border-b border-white/10 text-[10px] uppercase tracking-wider text-gray-500">

              <span>
                Habit
              </span>

              <span>
                Schedule
              </span>

              <span>
                Target
              </span>

              <span>
                Progress
              </span>

              <span>
                Status
              </span>

              <span className="text-right">
                Actions
              </span>

            </div>

            {/* ROWS */}

            {habits.map((habit) => {
              const progress =
                getProgress(habit);

              const current =
                Number(
                  habit.currentProgress || 0
                );

              const target =
                Number(
                  habit.targetCount || 1
                );

              const updating =
                updatingId === habit.id;

              return (
                <div
                  key={habit.id}
                  className="min-w-[950px] grid grid-cols-[2fr_1.2fr_.7fr_1.25fr_1.1fr_.6fr] items-center gap-2 px-4 py-3 border-b border-white/10 last:border-b-0 hover:bg-white/[0.025] transition"
                >

                  {/* HABIT */}

                  <div className="flex items-center gap-2.5 min-w-0">

                    <button
                      onClick={() =>
                        completeHabit(habit)
                      }
                      disabled={updating}
                      title="Complete habit"
                      className={`w-9 h-9 shrink-0 rounded-full border flex items-center justify-center font-bold ${
                        habit.status ===
                        "COMPLETED"
                          ? "bg-emerald-400 text-black border-emerald-300"
                          : "border-white/20 text-gray-500 hover:border-emerald-400 hover:text-emerald-400"
                      }`}
                    >
                      {habit.status ===
                      "COMPLETED"
                        ? "✓"
                        : "○"}
                    </button>

                    <div className="min-w-0">

                      <h3 className="font-bold text-sm truncate">
                        {habit.title ||
                          "Untitled Habit"}
                      </h3>

                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {habit.description ||
                          "Build consistency"}
                      </p>

                    </div>
                  </div>

                  {/* SCHEDULE */}

                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] whitespace-nowrap">

                      <span className="text-cyan-400">
                        ◷
                      </span>

                      <span>
                        {formatTime(
                          habit.startTime
                        )}

                        {" – "}

                        {formatTime(
                          habit.endTime
                        )}
                      </span>

                    </div>
                  </div>

                  {/* TARGET */}

                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[11px]">
                      <span className="text-cyan-400">
                        ◎
                      </span>

                      <span>
                        {current}/{target}
                      </span>
                    </div>
                  </div>

                  {/* PROGRESS */}

                  <div className="min-w-0">

                    <div className="flex items-center justify-between mb-1">

                      <span className="text-[11px] font-bold">
                        {progress}%
                      </span>

                      <span className="text-[10px] text-gray-500">
                        {current}/{target}
                      </span>

                    </div>

                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                    {/* +1 BUTTON */}

                    <button
                      onClick={() =>
                        increaseProgress(
                          habit
                        )
                      }
                      disabled={
                        updating ||
                        current >= target
                      }
                      title="Increase progress by 1"
                      className="mt-2 w-full h-6 rounded-md border border-cyan-400/40 bg-cyan-400/5 text-cyan-300 text-[10px] font-bold hover:bg-cyan-400/15 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +1 Progress
                    </button>

                  </div>

                  {/* STATUS */}

                  <div className="flex items-center gap-1.5">

                    {/* NOT STARTED */}

                    <button
                      onClick={() =>
                        resetProgress(
                          habit
                        )
                      }
                      disabled={updating}
                      title="Not Started"
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${statusClass(
                        habit,
                        "NOT_STARTED"
                      )}`}
                    >
                      ○
                    </button>

                    {/* IN PROGRESS */}

                    <button
                      onClick={() =>
                        increaseProgress(
                          habit
                        )
                      }
                      disabled={
                        updating ||
                        current >= target
                      }
                      title="In Progress - increase by 1"
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs ${statusClass(
                        habit,
                        "IN_PROGRESS"
                      )}`}
                    >
                      ▶
                    </button>

                    {/* COMPLETE */}

                    <button
                      onClick={() =>
                        completeHabit(
                          habit
                        )
                      }
                      disabled={updating}
                      title="Complete"
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${statusClass(
                        habit,
                        "COMPLETED"
                      )}`}
                    >
                      ✓
                    </button>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center justify-end gap-1.5">

                    {/* EDIT */}

                    <button
                      onClick={() =>
                        openEditModal(
                          habit
                        )
                      }
                      title="Edit Habit"
                      className="w-8 h-8 rounded-lg border border-cyan-400/40 bg-cyan-400/5 text-cyan-300 flex items-center justify-center hover:bg-cyan-400/15 hover:border-cyan-400"
                    >
                      ✎
                    </button>

                    {/* DELETE */}

                    <button
                      onClick={() =>
                        deleteHabit(
                          habit
                        )
                      }
                      title="Delete Habit"
                      className="w-8 h-8 rounded-lg border border-red-500/60 bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/25 hover:border-red-400"
                    >
                      🗑
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        ) : (
          <div className="min-h-[280px] rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center">

            <div className="text-4xl mb-4">
              🔥
            </div>

            <h2 className="text-lg font-bold">
              Build consistency, one habit at a time.
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Create your first habit and start tracking.
            </p>

            <button
              onClick={openAddModal}
              className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold text-sm"
            >
              + Create Your First Habit
            </button>

          </div>
        )}

      </main>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setShowModal(false);
            }
          }}
        >

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#101016] shadow-2xl p-5">

            {/* HEADER */}

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-xl font-black">
                  {editingHabit
                    ? "Edit Habit"
                    : "Create New Habit"}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Plan your habit and track your progress.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* TITLE */}

              <div>

                <label className="block text-xs text-gray-400 mb-1.5">
                  Habit Name
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Example: Drink Water"
                  className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-xs text-gray-400 mb-1.5">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={handleChange}
                  rows="2"
                  placeholder="What do you want to achieve?"
                  className="w-full px-3 py-2.5 rounded-lg outline-none resize-none text-sm"
                />

              </div>

              {/* NOTES */}

              <div>

                <label className="block text-xs text-gray-400 mb-1.5">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2.5 rounded-lg outline-none resize-none text-sm"
                />

              </div>

              {/* DATES */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      form.startDate
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                  />

                </div>

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={
                      form.endDate
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                  />

                </div>

              </div>

              {/* TIME */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={
                      form.startTime
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                  />

                </div>

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={
                      form.endTime
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                  />

                </div>

              </div>

              {/* TARGET / PROGRESS */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    Target
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="targetCount"
                    value={
                      form.targetCount
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                  />

                  <p className="text-[10px] text-gray-500 mt-1">
                    Example: target 8 = complete 8 times.
                  </p>

                </div>

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    Current Progress
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="currentProgress"
                    value={
                      form.currentProgress
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                  />

                </div>

              </div>

              {/* PRIORITY */}

              <div>

                <label className="block text-xs text-gray-400 mb-1.5">
                  Priority
                </label>

                <select
                  name="priority"
                  value={
                    form.priority
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                >

                  <option value="LOW">
                    LOW
                  </option>

                  <option value="MEDIUM">
                    MEDIUM
                  </option>

                  <option value="HIGH">
                    HIGH
                  </option>

                </select>

              </div>

              {/* NOTIFICATIONS */}

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">

                <div>

                  <p className="font-semibold text-sm">
                    Notifications
                  </p>

                  <p className="text-[11px] text-gray-500">
                    Remind me before the habit time.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleNotifications(
                      !form.notificationsEnabled
                    )
                  }
                  className={`relative w-11 h-6 rounded-full transition ${
                    form.notificationsEnabled
                      ? "bg-cyan-400"
                      : "bg-white/10"
                  }`}
                >

                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                      form.notificationsEnabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />

                </button>

              </div>

              {/* REMINDER */}

              {form.notificationsEnabled && (
                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    Reminder Before (minutes)
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="reminderMinutesBefore"
                    value={
                      form.reminderMinutesBefore
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm"
                  />

                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold text-sm disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingHabit
                    ? "Save Changes"
                    : "Create Habit"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}