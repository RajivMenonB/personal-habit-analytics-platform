import { useEffect, useMemo, useRef, useState } from "react";
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
  notificationsEnabled: false,
  reminderMinutesBefore: 10,
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

  const [form, setForm] = useState({
    ...EMPTY_FORM,
  });

  const progressLocks = useRef(new Set());
  const messageTimer = useRef(null);

  /* =========================================================
     USER
  ========================================================= */

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  /* =========================================================
     AUTH
  ========================================================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

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

  /* =========================================================
     LOAD HABITS
  ========================================================= */

  useEffect(() => {
    loadHabits();

    return () => {
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
    };
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders(),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          text ||
            `Failed to load habits (${response.status})`
        );
      }

      const data = await response.json();

      setHabits(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load habits."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SUCCESS MESSAGE
  ========================================================= */

  const showSuccess = (text) => {
    setMessage(text);

    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
    }

    messageTimer.current = setTimeout(() => {
      setMessage("");
    }, 2200);
  };

  /* =========================================================
     DATE HELPERS
  ========================================================= */

  const calculateDurationDays = (
    startDate,
    endDate
  ) => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(
      `${startDate}T00:00:00`
    );

    const end = new Date(
      `${endDate}T00:00:00`
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return 0;
    }

    const difference =
      end.getTime() -
      start.getTime();

    if (difference < 0) {
      return 0;
    }

    return (
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "--";
    }

    const parts = String(date).split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  /* =========================================================
     TIME HELPERS
  ========================================================= */

  const backendTime = (time) => {
    if (!time) {
      return null;
    }

    return String(time).substring(0, 5);
  };

  const formatTimeForInput = (time) => {
    if (!time) {
      return "";
    }

    return String(time).substring(0, 5);
  };

  const formatTime = (time) => {
    if (!time) {
      return "--";
    }

    const parts = String(time).split(":");

    if (parts.length < 2) {
      return String(time);
    }

    let hour = Number(parts[0]);
    const minute = parts[1];

    const suffix =
      hour >= 12
        ? "PM"
        : "AM";

    hour = hour % 12;

    if (hour === 0) {
      hour = 12;
    }

    return `${String(hour).padStart(
      2,
      "0"
    )}:${minute} ${suffix}`;
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => {
      const next = {
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      if (
        !editingHabit &&
        (name === "startDate" ||
          name === "endDate")
      ) {
        const duration =
          calculateDurationDays(
            name === "startDate"
              ? value
              : next.startDate,

            name === "endDate"
              ? value
              : next.endDate
          );

        if (duration > 0) {
          next.targetCount = duration;
        }
      }

      return next;
    });

    setError("");
  };

  /* =========================================================
     FORM DURATION
  ========================================================= */

  const formDuration = useMemo(() => {
    return calculateDurationDays(
      form.startDate,
      form.endDate
    );
  }, [
    form.startDate,
    form.endDate,
  ]);

  const useSuggestedTarget = () => {
    if (formDuration <= 0) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      targetCount: formDuration,
    }));

    showSuccess(
      `Target set to ${formDuration} completions.`
    );
  };

  /* =========================================================
     ADD HABIT
  ========================================================= */

  const openAddModal = () => {
    setEditingHabit(null);

    setForm({
      ...EMPTY_FORM,
    });

    setError("");
    setMessage("");
    setShowModal(true);
  };

  /* =========================================================
     EDIT HABIT
  ========================================================= */

  const openEditModal = (habit) => {
    setEditingHabit(habit);

    setForm({
      title: habit.title || "",
      description: habit.description || "",
      notes: habit.notes || "",

      startDate: habit.startDate || "",
      endDate: habit.endDate || "",

      startTime:
        formatTimeForInput(
          habit.startTime
        ),

      endTime:
        formatTimeForInput(
          habit.endTime
        ),

      targetCount:
        habit.targetCount ?? 1,

      currentProgress:
        habit.currentProgress ?? 0,

      priority:
        habit.priority || "MEDIUM",

      notificationsEnabled:
        habit.notificationsEnabled ??
        false,

      reminderMinutesBefore:
        habit.reminderMinutesBefore ??
        10,
    });

    setError("");
    setMessage("");
    setShowModal(true);
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const calculateStatus = (
    currentProgress,
    targetCount
  ) => {
    const target = Math.max(
      1,
      Number(targetCount) || 1
    );

    let progress = Math.max(
      0,
      Number(currentProgress) || 0
    );

    progress = Math.min(
      progress,
      target
    );

    if (progress === 0) {
      return {
        progress: 0,
        status: "NOT_STARTED",
        completed: false,
      };
    }

    if (progress >= target) {
      return {
        progress: target,
        status: "COMPLETED",
        completed: true,
      };
    }

    return {
      progress,
      status: "IN_PROGRESS",
      completed: false,
    };
  };

  /* =========================================================
     CREATE / UPDATE HABIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (
        form.startDate &&
        form.endDate &&
        form.endDate < form.startDate
      ) {
        throw new Error(
          "End date cannot be before start date."
        );
      }

      const target = Math.max(
        1,
        Number(form.targetCount) || 1
      );

      const state = calculateStatus(
        form.currentProgress,
        target
      );

      const payload = {
        title: form.title.trim(),

        description:
          form.description.trim(),

        notes:
          form.notes.trim(),

        startDate:
          form.startDate || null,

        endDate:
          form.endDate || null,

        startTime:
          backendTime(
            form.startTime
          ),

        endTime:
          backendTime(
            form.endTime
          ),

        targetCount: target,

        currentProgress:
          state.progress,

        priority:
          form.priority,

        status:
          state.status,

        notificationsEnabled:
          Boolean(
            form.notificationsEnabled
          ),

        reminderMinutesBefore:
          Math.max(
            0,
            Number(
              form.reminderMinutesBefore
            ) || 0
          ),

        completed:
          state.completed,
      };

      const url = editingHabit
        ? `${API_URL}/${editingHabit.id}`
        : API_URL;

      const method = editingHabit
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          text ||
            "Failed to save habit."
        );
      }

      /*
       * Backend may return JSON
       * or an empty response.
       */
      const responseText =
        await response.text();

      if (responseText.trim()) {
        try {
          const savedHabit =
            JSON.parse(responseText);

          if (editingHabit) {
            setHabits((previous) =>
              previous.map((habit) =>
                habit.id ===
                editingHabit.id
                  ? savedHabit
                  : habit
              )
            );
          } else {
            setHabits((previous) => [
              savedHabit,
              ...previous,
            ]);
          }
        } catch {
          await loadHabits();
        }
      } else {
        await loadHabits();
      }

      setShowModal(false);
      setEditingHabit(null);

      setForm({
        ...EMPTY_FORM,
      });

      showSuccess(
        editingHabit
          ? "Habit updated successfully."
          : "Habit created successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to save habit."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     UPDATE PROGRESS
  ========================================================= */

  const updateProgress = async (
    habit,
    requestedProgress
  ) => {
    const habitId = habit.id;

    if (
      progressLocks.current.has(
        habitId
      )
    ) {
      return;
    }

    progressLocks.current.add(habitId);

    setUpdatingId(habitId);

    const target = Math.max(
      1,
      Number(habit.targetCount) || 1
    );

    const state = calculateStatus(
      requestedProgress,
      target
    );

    const oldHabit = {
      ...habit,
    };

    /*
     * Optimistic UI
     */
    setHabits((previous) =>
      previous.map((item) =>
        item.id === habitId
          ? {
              ...item,
              currentProgress:
                state.progress,
              status:
                state.status,
              completed:
                state.completed,
            }
          : item
      )
    );

    try {
      setError("");

      const payload = {
        title:
          habit.title || "",

        description:
          habit.description || "",

        notes:
          habit.notes || "",

        startDate:
          habit.startDate || null,

        endDate:
          habit.endDate || null,

        startTime:
          backendTime(
            habit.startTime
          ),

        endTime:
          backendTime(
            habit.endTime
          ),

        targetCount:
          target,

        currentProgress:
          state.progress,

        priority:
          habit.priority || "MEDIUM",

        status:
          state.status,

        notificationsEnabled:
          Boolean(
            habit.notificationsEnabled
          ),

        reminderMinutesBefore:
          Math.max(
            0,
            Number(
              habit.reminderMinutesBefore ??
                10
            )
          ),

        completed:
          state.completed,
      };

      const response = await fetch(
        `${API_URL}/${habitId}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Failed to update progress."
        );
      }

      const responseText =
        await response.text();

      if (responseText.trim()) {
        try {
          const updatedHabit =
            JSON.parse(responseText);

          if (
            updatedHabit &&
            updatedHabit.id ===
              habitId
          ) {
            setHabits((previous) =>
              previous.map((item) =>
                item.id === habitId
                  ? {
                      ...item,
                      ...updatedHabit,
                    }
                  : item
              )
            );
          }
        } catch {
          // Optimistic UI is already correct.
        }
      }

      if (
        state.status ===
        "COMPLETED"
      ) {
        showSuccess(
          `${habit.title} completed — ${state.progress}/${target}`
        );
      } else {
        showSuccess(
          `${habit.title} — ${state.progress}/${target}`
        );
      }
    } catch (err) {
      console.error(err);

      /*
       * Restore previous state
       */
      setHabits((previous) =>
        previous.map((item) =>
          item.id === habitId
            ? oldHabit
            : item
        )
      );

      setError(
        err.message ||
          "Failed to update progress."
      );
    } finally {
      progressLocks.current.delete(
        habitId
      );

      setUpdatingId(null);
    }
  };

  /* =========================================================
     +1
  ========================================================= */

  const increaseProgress = (habit) => {
    const current = Number(
      habit.currentProgress || 0
    );

    const target = Math.max(
      1,
      Number(habit.targetCount) || 1
    );

    if (current >= target) {
      return;
    }

    if (
      progressLocks.current.has(
        habit.id
      )
    ) {
      return;
    }

    updateProgress(
      habit,
      current + 1
    );
  };

  /* =========================================================
     -1
  ========================================================= */

  const decreaseProgress = (habit) => {
    const current = Number(
      habit.currentProgress || 0
    );

    if (current <= 0) {
      return;
    }

    if (
      progressLocks.current.has(
        habit.id
      )
    ) {
      return;
    }

    updateProgress(
      habit,
      current - 1
    );
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetProgress = (habit) => {
    const current = Number(
      habit.currentProgress || 0
    );

    if (current <= 0) {
      return;
    }

    updateProgress(
      habit,
      0
    );
  };

  /* =========================================================
     COMPLETE
  ========================================================= */

  const completeHabit = (habit) => {
    const target = Math.max(
      1,
      Number(habit.targetCount) || 1
    );

    const current = Number(
      habit.currentProgress || 0
    );

    if (current >= target) {
      return;
    }

    updateProgress(
      habit,
      target
    );
  };

  /* =========================================================
     DELETE
  ========================================================= */

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

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Failed to delete habit."
        );
      }

      setHabits((previous) =>
        previous.filter(
          (item) =>
            item.id !== habit.id
        )
      );

      showSuccess(
        `"${habit.title}" deleted.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to delete habit."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================================================
     PROGRESS %
  ========================================================= */

  const getProgress = (habit) => {
    const target = Number(
      habit.targetCount || 0
    );

    const current = Number(
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

  /* =========================================================
     STATUS STYLE
  ========================================================= */

  const statusClass = (
    habit,
    status
  ) => {
    const active =
      habit.status === status;

    if (
      status ===
      "NOT_STARTED"
    ) {
      return active
        ? "border-purple-400 bg-purple-500/20 text-purple-300"
        : "border-white/10 text-gray-500 hover:border-purple-400 hover:text-purple-300";
    }

    if (
      status ===
      "IN_PROGRESS"
    ) {
      return active
        ? "border-cyan-400 bg-cyan-400/20 text-cyan-300"
        : "border-white/10 text-gray-500 hover:border-cyan-400 hover:text-cyan-300";
    }

    return active
      ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
      : "border-white/10 text-gray-500 hover:border-emerald-400 hover:text-emerald-300";
  };

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const toggleNotifications =
    async (enabled) => {
      if (
        enabled &&
        "Notification" in window
      ) {
        try {
          if (
            Notification.permission ===
            "default"
          ) {
            const permission =
              await Notification.requestPermission();

            if (
              permission !==
              "granted"
            ) {
              setError(
                "Notification permission was not granted."
              );

              return;
            }
          }

          if (
            Notification.permission ===
            "denied"
          ) {
            setError(
              "Browser notifications are blocked. Enable them in browser settings."
            );

            return;
          }
        } catch (err) {
          console.error(err);
          return;
        }
      }

      setForm((previous) => ({
        ...previous,
        notificationsEnabled:
          enabled,
      }));
    };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const total = habits.length;

  const completed =
    habits.filter(
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

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070c] text-white flex items-center justify-center">
        <div className="text-center">

          <div
            className="
              w-9
              h-9
              rounded-full
              border-4
              border-cyan-400/20
              border-t-cyan-400
              animate-spin
              mx-auto
              mb-4
            "
          />

          <p className="text-gray-400 text-sm">
            Loading your habits...
          </p>

        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#07070c] text-white flex">

      <Sidebar />

      <main
        className="
          flex-1
          min-w-0
          p-4
          md:p-5
          overflow-x-hidden
        "
      >

        <Topbar
          title="Habits"
          user={user}
        />

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            mt-5
            mb-4
          "
        >

          <div className="shrink-0">

            <h1 className="text-2xl md:text-3xl font-black">
              Daily Habits
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              Build consistency and track real progress.
            </p>

          </div>

          <div className="flex-1 flex justify-center px-2">

            {message && (
              <div
                className="
                  px-4
                  py-2
                  rounded-xl
                  border
                  border-emerald-400/30
                  bg-emerald-400/10
                  text-emerald-300
                  text-sm
                  font-semibold
                "
              >
                {message}
              </div>
            )}

          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="
              shrink-0
              px-5
              py-2.5
              rounded-xl
              bg-gradient-to-r
              from-cyan-400
              to-purple-500
              text-black
              font-bold
              text-sm
              hover:scale-[1.02]
              transition
            "
          >
            + Add Habit
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-4
              px-4
              py-3
              rounded-xl
              border
              border-red-500/30
              bg-red-500/10
              text-red-300
              text-sm
            "
          >
            {error}
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-3 gap-3 mb-4">

          <div
            className="
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              px-4
              py-3
            "
          >
            <p className="text-[10px] uppercase text-gray-500">
              Total
            </p>

            <p className="text-xl font-black mt-1">
              {total}
            </p>
          </div>

          <div
            className="
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              px-4
              py-3
            "
          >
            <p className="text-[10px] uppercase text-gray-500">
              Active
            </p>

            <p className="text-xl font-black text-cyan-300 mt-1">
              {active}
            </p>
          </div>

          <div
            className="
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              px-4
              py-3
            "
          >
            <p className="text-[10px] uppercase text-gray-500">
              Overall
            </p>

            <p className="text-xl font-black text-purple-300 mt-1">
              {overall}%
            </p>
          </div>

        </div>

        {/* =================================================
            HABITS TABLE
        ================================================= */}

        {habits.length > 0 ? (

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.025]
              overflow-x-auto
              shadow-2xl
            "
          >

            {/* =================================================
                TABLE HEADER
            ================================================= */}

            <div
              className="
                min-w-[1040px]
                grid
                grid-cols-[2.25fr_1.15fr_.65fr_1.25fr_1.05fr_.7fr]
                items-center
                px-4
                py-3
                border-b
                border-white/10
                text-[10px]
                uppercase
                tracking-wider
                text-gray-500
              "
            >

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

              <span className="text-left">
                Actions
              </span>

            </div>

            {/* =================================================
                HABIT ROWS
            ================================================= */}

            {habits.map((habit) => {

              const progress =
                getProgress(habit);

              const current =
                Number(
                  habit.currentProgress ||
                    0
                );

              const target =
                Math.max(
                  1,
                  Number(
                    habit.targetCount ||
                      1
                  )
                );

              const updating =
                updatingId ===
                habit.id;

              return (
                <div
                  key={habit.id}
                  className="
                    min-w-[1040px]
                    grid
                    grid-cols-[2.25fr_1.15fr_.65fr_1.25fr_1.05fr_.7fr]
                    items-center
                    gap-2
                    px-4
                    py-3
                    border-b
                    border-white/10
                    last:border-b-0
                    hover:bg-white/[0.025]
                    transition
                  "
                >

                  {/* =================================================
                      HABIT
                  ================================================= */}

                  <div
                    className="
                      flex
                      items-start
                      gap-2.5
                      min-w-0
                    "
                  >

                    {/* COMPLETE CIRCLE */}

                    <button
                      type="button"
                      onClick={() =>
                        completeHabit(
                          habit
                        )
                      }
                      disabled={
                        updating ||
                        current >=
                          target
                      }
                      title="Complete habit"
                      aria-label="Complete habit"
                      className={`
                        w-9
                        h-9
                        shrink-0
                        rounded-full
                        border
                        flex
                        items-center
                        justify-center
                        font-bold
                        transition
                        ${
                          habit.status ===
                          "COMPLETED"
                            ? "bg-emerald-400 text-black border-emerald-300"
                            : "border-white/20 text-gray-500 hover:border-emerald-400 hover:text-emerald-400"
                        }
                        disabled:opacity-30
                      `}
                    >
                      {habit.status ===
                      "COMPLETED"
                        ? "✓"
                        : "○"}
                    </button>

                    <div className="min-w-0 flex-1">

                      {/* TITLE */}

                      <div className="flex items-center gap-2 min-w-0">

                        <h3
                          className="
                            font-black
                            text-sm
                            truncate
                            text-white
                          "
                        >
                          {habit.title ||
                            "Untitled Habit"}
                        </h3>

                        {habit.status ===
                          "COMPLETED" && (
                          <span
                            className="
                              shrink-0
                              text-[8px]
                              px-1.5
                              py-0.5
                              rounded-md
                              border
                              border-emerald-400/30
                              bg-emerald-400/10
                              text-emerald-300
                              font-bold
                            "
                          >
                            DONE
                          </span>
                        )}

                      </div>

                      {/* DESCRIPTION */}

                      <p
                        className="
                          text-[10px]
                          text-gray-500
                          truncate
                          mt-0.5
                          font-medium
                        "
                      >
                        {habit.description ||
                          "Build consistency"}
                      </p>

                      {/* DATE */}

                      <p
                        className="
                          text-[9px]
                          text-gray-600
                          mt-1
                          font-medium
                        "
                      >
                        {formatDate(
                          habit.startDate
                        )}

                        {" → "}

                        {formatDate(
                          habit.endDate
                        )}
                      </p>

                      {/* =================================================
                          COMPACT NOTES
                      ================================================= */}

                      {habit.notes &&
                        habit.notes.trim() && (

                          <div
                            className="
                              mt-1.5
                              max-w-[210px]
                              h-[26px]
                              flex
                              items-center
                              rounded-md
                              border
                              border-cyan-400/20
                              bg-cyan-400/[0.035]
                              px-2
                              overflow-hidden
                            "
                            title={
                              habit.notes
                            }
                          >

                            <span
                              className="
                                text-[10px]
                                mr-1
                                shrink-0
                              "
                            >
                              📝
                            </span>

                            <span
                              className="
                                text-[7px]
                                uppercase
                                tracking-wide
                                text-cyan-400
                                font-black
                                mr-1
                                shrink-0
                              "
                            >
                              NOTES
                            </span>

                            <span
                              className="
                                text-[8px]
                                text-gray-300
                                font-bold
                                truncate
                              "
                            >
                              {habit.notes}
                            </span>

                          </div>

                        )}

                    </div>

                  </div>

                  {/* =================================================
                      SCHEDULE
                  ================================================= */}

                  <div className="min-w-0">

                    <div
                      className="
                        inline-flex
                        items-center
                        gap-1
                        px-2
                        py-1.5
                        rounded-lg
                        bg-white/[0.04]
                        border
                        border-white/10
                        text-[10px]
                        whitespace-nowrap
                        font-semibold
                      "
                    >

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

                  {/* =================================================
                      TARGET
                  ================================================= */}

                  <div>

                    <div
                      className="
                        inline-flex
                        items-center
                        gap-1
                        px-2
                        py-1.5
                        rounded-lg
                        bg-white/[0.04]
                        border
                        border-white/10
                        text-[10px]
                        font-semibold
                      "
                    >

                      <span className="text-cyan-400">
                        ◎
                      </span>

                      <span>
                        {current}/
                        {target}
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      PROGRESS
                  ================================================= */}

                  <div className="min-w-0">

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        mb-1
                      "
                    >

                      <span className="text-[11px] font-black">
                        {progress}%
                      </span>

                      <span className="text-[9px] text-gray-500 font-semibold">
                        {current}/
                        {target}
                      </span>

                    </div>

                    <div
                      className="
                        h-1.5
                        rounded-full
                        bg-white/10
                        overflow-hidden
                      "
                    >
                      <div
                        className="
                          h-full
                          rounded-full
                          bg-gradient-to-r
                          from-cyan-400
                          to-purple-500
                          transition-[width]
                          duration-300
                          ease-out
                        "
                        style={{
                          width:
                            `${progress}%`,
                        }}
                      />
                    </div>

                    {/* -1 / +1 */}

                    <div
                      className="
                        flex
                        gap-1
                        mt-2
                      "
                    >

                      <button
                        type="button"
                        onClick={() =>
                          decreaseProgress(
                            habit
                          )
                        }
                        disabled={
                          updating ||
                          current <= 0
                        }
                        title="Decrease progress by 1"
                        className="
                          w-8
                          h-6
                          shrink-0
                          rounded-md
                          border
                          border-red-400/40
                          bg-red-400/5
                          text-red-300
                          text-xs
                          font-black
                          hover:bg-red-400/15
                          disabled:opacity-25
                          disabled:cursor-not-allowed
                        "
                      >
                        −1
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          increaseProgress(
                            habit
                          )
                        }
                        disabled={
                          updating ||
                          current >=
                            target
                        }
                        title="Increase progress by 1"
                        className="
                          flex-1
                          h-6
                          rounded-md
                          border
                          border-cyan-400/40
                          bg-cyan-400/5
                          text-cyan-300
                          text-[9px]
                          font-bold
                          hover:bg-cyan-400/15
                          disabled:opacity-25
                          disabled:cursor-not-allowed
                        "
                      >
                        {updating
                          ? "Updating..."
                          : "+1 Progress"}
                      </button>

                    </div>

                  </div>

                  {/* =================================================
                      STATUS
                  ================================================= */}

                  <div
                    className="
                      flex
                      items-center
                      gap-1
                    "
                  >

                    {/* NOT STARTED */}

                    <button
                      type="button"
                      onClick={() =>
                        resetProgress(
                          habit
                        )
                      }
                      disabled={
                        updating ||
                        current === 0
                      }
                      title="Not Started — reset progress"
                      className={`
                        w-8
                        h-8
                        rounded-lg
                        border
                        flex
                        items-center
                        justify-center
                        text-sm
                        transition
                        ${statusClass(
                          habit,
                          "NOT_STARTED"
                        )}
                        disabled:opacity-30
                      `}
                    >
                      ○
                    </button>

                    {/* IN PROGRESS */}

                    <button
                      type="button"
                      onClick={() =>
                        increaseProgress(
                          habit
                        )
                      }
                      disabled={
                        updating ||
                        current >=
                          target
                      }
                      title="In Progress — increase progress"
                      className={`
                        w-8
                        h-8
                        rounded-lg
                        border
                        flex
                        items-center
                        justify-center
                        text-xs
                        transition
                        ${statusClass(
                          habit,
                          "IN_PROGRESS"
                        )}
                        disabled:opacity-30
                      `}
                    >
                      ▶
                    </button>

                    {/* COMPLETE */}

                    <button
                      type="button"
                      onClick={() =>
                        completeHabit(
                          habit
                        )
                      }
                      disabled={
                        updating ||
                        current >=
                          target
                      }
                      title="Completed"
                      className={`
                        w-8
                        h-8
                        rounded-lg
                        border
                        flex
                        items-center
                        justify-center
                        text-sm
                        transition
                        ${statusClass(
                          habit,
                          "COMPLETED"
                        )}
                        disabled:opacity-30
                      `}
                    >
                      ✓
                    </button>

                  </div>

                  {/* =================================================
                      ACTIONS
                      CLOSE + ICON ONLY
                  ================================================= */}

                  <div
                    className="
                      flex
                      items-center
                      justify-start
                      gap-1
                    "
                  >

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(
                          habit
                        )
                      }
                      disabled={
                        updating
                      }
                      title="Edit habit"
                      aria-label={`Edit ${
                        habit.title ||
                        "habit"
                      }`}
                      className="
                        w-8
                        h-8
                        shrink-0
                        rounded-lg
                        border
                        border-cyan-400/40
                        bg-cyan-400/5
                        text-cyan-300
                        flex
                        items-center
                        justify-center
                        text-sm
                        font-bold
                        hover:bg-cyan-400/15
                        hover:border-cyan-400
                        hover:text-cyan-200
                        active:scale-95
                        transition-all
                        duration-150
                        disabled:opacity-30
                        disabled:cursor-not-allowed
                      "
                    >
                      ✎
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        deleteHabit(
                          habit
                        )
                      }
                      disabled={
                        updating
                      }
                      title="Delete habit"
                      aria-label={`Delete ${
                        habit.title ||
                        "habit"
                      }`}
                      className="
                        w-8
                        h-8
                        shrink-0
                        rounded-lg
                        border
                        border-red-500/50
                        bg-red-500/5
                        text-red-400
                        flex
                        items-center
                        justify-center
                        text-sm
                        font-bold
                        hover:bg-red-500/15
                        hover:border-red-400
                        hover:text-red-300
                        active:scale-95
                        transition-all
                        duration-150
                        disabled:opacity-30
                        disabled:cursor-not-allowed
                      "
                    >
                      🗑
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        ) : (

          /* =================================================
             EMPTY STATE
          ================================================= */

          <div
            className="
              min-h-[280px]
              rounded-2xl
              border
              border-dashed
              border-white/10
              bg-white/[0.02]
              flex
              flex-col
              items-center
              justify-center
              text-center
            "
          >

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
              type="button"
              onClick={openAddModal}
              className="
                mt-5
                px-5
                py-2.5
                rounded-xl
                bg-gradient-to-r
                from-cyan-400
                to-purple-500
                text-black
                font-bold
                text-sm
              "
            >
              + Create Your First Habit
            </button>

          </div>

        )}

      </main>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/70
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowModal(false);
            }
          }}
        >

          <div
            className="
              w-full
              max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              rounded-2xl
              border
              border-white/10
              bg-[#101016]
              shadow-2xl
              p-5
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                mb-5
              "
            >

              <div>

                <h2 className="text-xl font-black">
                  {editingHabit
                    ? "Edit Habit"
                    : "Create New Habit"}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Plan your habit and track real progress.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-white/5
                  border
                  border-white/10
                  text-gray-400
                  hover:text-white
                "
              >
                ✕
              </button>

            </div>

            {/* FORM */}

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
                  className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    outline-none
                    text-sm
                    bg-white
                    text-black
                  "
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-xs text-gray-400 mb-1.5">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="What do you want to achieve?"
                  className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    outline-none
                    resize-none
                    text-sm
                    bg-white
                    text-black
                  "
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
                  rows="3"
                  placeholder="Additional notes for this habit..."
                  className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    outline-none
                    resize-none
                    text-sm
                    bg-white
                    text-black
                  "
                />

                <p className="text-[10px] text-gray-500 mt-1">
                  Notes are displayed in a compact format under each habit.
                </p>

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
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      px-3
                      py-2.5
                      rounded-lg
                      outline-none
                      text-sm
                      bg-white
                      text-black
                    "
                  />

                </div>

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    min={
                      form.startDate ||
                      undefined
                    }
                    className="
                      w-full
                      px-3
                      py-2.5
                      rounded-lg
                      outline-none
                      text-sm
                      bg-white
                      text-black
                    "
                  />

                </div>

              </div>

              {/* DURATION */}

              {formDuration > 0 && (

                <div
                  className="
                    rounded-xl
                    border
                    border-cyan-400/20
                    bg-cyan-400/[0.05]
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >

                    <div>

                      <p className="text-sm font-bold text-cyan-300">
                        Habit Duration
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {formDuration} days
                      </p>

                      <p className="text-[11px] text-gray-500 mt-2">
                        Suggested target:{" "}
                        <span className="text-cyan-300 font-bold">
                          {formDuration}
                        </span>{" "}
                        completions
                      </p>

                      <p className="text-[10px] text-gray-600 mt-1">
                        This assumes you want to complete the habit every day.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        useSuggestedTarget
                      }
                      className="
                        shrink-0
                        px-3
                        py-2
                        rounded-lg
                        border
                        border-cyan-400/30
                        bg-cyan-400/10
                        text-cyan-300
                        text-xs
                        font-bold
                        hover:bg-cyan-400/20
                      "
                    >
                      Use {formDuration}
                    </button>

                  </div>

                </div>

              )}

              {/* TIME */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className="
                      w-full
                      px-3
                      py-2.5
                      rounded-lg
                      outline-none
                      text-sm
                      bg-white
                      text-black
                    "
                  />

                </div>

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className="
                      w-full
                      px-3
                      py-2.5
                      rounded-lg
                      outline-none
                      text-sm
                      bg-white
                      text-black
                    "
                  />

                </div>

              </div>

              {/* TARGET / PROGRESS */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    Target Completions
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="targetCount"
                    value={form.targetCount}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      px-3
                      py-2.5
                      rounded-lg
                      outline-none
                      text-sm
                      bg-white
                      text-black
                    "
                  />

                  <p className="text-[10px] text-gray-500 mt-1">
                    Total times this habit should be completed during the selected duration.
                  </p>

                </div>

                <div>

                  <label className="block text-xs text-gray-400 mb-1.5">
                    Current Progress
                  </label>

                  <input
                    type="number"
                    min="0"
                    max={
                      form.targetCount ||
                      1
                    }
                    name="currentProgress"
                    value={
                      form.currentProgress
                    }
                    onChange={handleChange}
                    className="
                      w-full
                      px-3
                      py-2.5
                      rounded-lg
                      outline-none
                      text-sm
                      bg-white
                      text-black
                    "
                  />

                  <p className="text-[10px] text-gray-500 mt-1">
                    Used to correct progress if necessary.
                  </p>

                </div>

              </div>

              {/* PRIORITY */}

              <div>

                <label className="block text-xs text-gray-400 mb-1.5">
                  Priority
                </label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="
                    w-full
                    px-3
                    py-2.5
                    rounded-lg
                    outline-none
                    text-sm
                    bg-white
                    text-black
                  "
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

              <div
                className="
                  flex
                  items-center
                  justify-between
                  p-3
                  rounded-xl
                  bg-white/[0.03]
                  border
                  border-white/10
                "
              >

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
                  className={`
                    relative
                    w-11
                    h-6
                    rounded-full
                    ${
                      form.notificationsEnabled
                        ? "bg-cyan-400"
                        : "bg-white/10"
                    }
                  `}
                >

                  <span
                    className={`
                      absolute
                      top-1
                      w-4
                      h-4
                      rounded-full
                      bg-white
                      ${
                        form.notificationsEnabled
                          ? "left-6"
                          : "left-1"
                      }
                    `}
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
                    onChange={handleChange}
                    className="
                      w-full
                      px-3
                      py-2.5
                      rounded-lg
                      outline-none
                      text-sm
                      bg-white
                      text-black
                    "
                  />

                </div>

              )}

              {/* PREVIEW */}

              <div
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.025]
                  p-3
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <span className="text-xs text-gray-400">
                    Progress Preview
                  </span>

                  <span className="text-xs font-bold text-cyan-300">

                    {Math.min(
                      Number(
                        form.currentProgress ||
                          0
                      ),
                      Math.max(
                        1,
                        Number(
                          form.targetCount ||
                            1
                        )
                      )
                    )}

                    /

                    {Math.max(
                      1,
                      Number(
                        form.targetCount ||
                          1
                      )
                    )}

                  </span>

                </div>

                <div
                  className="
                    h-1.5
                    rounded-full
                    bg-white/10
                    overflow-hidden
                    mt-2
                  "
                >

                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-cyan-400
                      to-purple-500
                    "
                    style={{
                      width:
                        `${Math.min(
                          100,
                          Math.round(
                            (
                              Number(
                                form.currentProgress ||
                                  0
                              ) /
                              Math.max(
                                1,
                                Number(
                                  form.targetCount ||
                                    1
                                )
                              )
                            ) *
                              100
                          )
                        )}%`,
                    }}
                  />

                </div>

              </div>

              {/* FORM BUTTONS */}

              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-4
                  border-t
                  border-white/10
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="
                    px-4
                    py-2.5
                    rounded-lg
                    border
                    border-white/10
                    bg-white/5
                    text-gray-300
                    text-sm
                    hover:bg-white/10
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    px-5
                    py-2.5
                    rounded-lg
                    bg-gradient-to-r
                    from-cyan-400
                    to-purple-500
                    text-black
                    font-bold
                    text-sm
                    disabled:opacity-50
                  "
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