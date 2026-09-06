import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getFCMToken } from "../services/notificationService";

const API_URL = "http://localhost:8081/api/habits";
const REMINDER_API = "http://localhost:8081/api/reminders";
const DEVICE_API = "http://localhost:8081/api/devices";

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
      console.error(
        "Load habits error:",
        err
      );

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
    }, 2500);
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

    const parts =
      String(date).split("-");

    if (parts.length !== 3) {
      return String(date);
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

    const parts =
      String(time).split(":");

    if (parts.length < 2) {
      return String(time);
    }

    let hour = Number(parts[0]);

    const minute = parts[1];

    if (
      Number.isNaN(hour)
    ) {
      return String(time);
    }

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
          next.targetCount =
            duration;
        }
      }

      return next;
    });

    setError("");
  };

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
     OPEN ADD
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
     OPEN EDIT
  ========================================================= */

  const openEditModal = (habit) => {
    setEditingHabit(habit);

    setForm({
      title:
        habit.title || "",

      description:
        habit.description || "",

      notes:
        habit.notes || "",

      startDate:
        habit.startDate || "",

      endDate:
        habit.endDate || "",

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
        habit.priority ||
        "MEDIUM",

      notificationsEnabled:
        Boolean(
          habit.notificationsEnabled
        ),

      reminderMinutesBefore:
        habit.reminderMinutesBefore ??
        10,
    });

    setError("");
    setMessage("");
    setShowModal(true);
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingHabit(null);
    setForm({
      ...EMPTY_FORM,
    });
    setError("");
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
     FIREBASE DEVICE REGISTRATION
  ========================================================= */

  const registerFCMDevice = async () => {
    const token =
      await getFCMToken();

    if (!token) {
      throw new Error(
        "Unable to get Firebase notification token."
      );
    }

    /*
     * Remember the latest registered token.
     * This prevents unnecessary duplicate
     * registrations from the frontend.
     */
    const registeredToken =
      localStorage.getItem(
        "fcmRegisteredToken"
      );

    if (
      registeredToken === token
    ) {
      return true;
    }

    const response =
      await fetch(
        `${DEVICE_API}/register`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            token,
            deviceType: "WEB",
          }),
        }
      );

    if (response.status === 401) {
      logout();
      return false;
    }

    if (!response.ok) {
      const text =
        await response.text();

      throw new Error(
        text ||
          "Failed to register notification device."
      );
    }

    localStorage.setItem(
      "fcmRegisteredToken",
      token
    );

    return true;
  };

  /* =========================================================
     FIND REMINDER FOR HABIT
  ========================================================= */

  const getReminderForHabit =
    async (habitId) => {
      const response =
        await fetch(
          REMINDER_API,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );

      if (response.status === 401) {
        logout();
        return null;
      }

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Failed to load reminders."
        );
      }

      const reminders =
        await response.json();

      if (
        !Array.isArray(
          reminders
        )
      ) {
        return null;
      }

      for (
        const reminder of reminders
      ) {
        if (
          Number(
            reminder.habitId
          ) === Number(habitId)
        ) {
          return reminder;
        }
      }

      return null;
    };

  /* =========================================================
     CALCULATE REMINDER DATE/TIME
  ========================================================= */

  const calculateReminderDateTime =
    (habit) => {
      if (
        !habit.startDate ||
        !habit.startTime
      ) {
        throw new Error(
          "Set the habit start date and start time before enabling notifications."
        );
      }

      const minutesBefore =
        Math.max(
          0,
          Number(
            habit.reminderMinutesBefore ??
              0
          ) || 0
        );

      const time =
        backendTime(
          habit.startTime
        );

      const date =
        new Date(
          `${habit.startDate}T${time}:00`
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        throw new Error(
          "Invalid habit date or time."
        );
      }

      date.setMinutes(
        date.getMinutes() -
          minutesBefore
      );

      const pad = (value) =>
        String(value).padStart(
          2,
          "0"
        );

      return {
        reminderDate:
          `${date.getFullYear()}-${pad(
            date.getMonth() + 1
          )}-${pad(
            date.getDate()
          )}`,

        reminderTime:
          `${pad(
            date.getHours()
          )}:${pad(
            date.getMinutes()
          )}`,
      };
    };

  /* =========================================================
     SYNC REMINDER
  ========================================================= */

  const syncReminderForHabit =
    async (habit) => {
      if (
        !habit ||
        !habit.id
      ) {
        return;
      }

      const existingReminder =
        await getReminderForHabit(
          habit.id
        );

      /*
       * Notifications OFF
       */
      if (
        !habit.notificationsEnabled
      ) {
        if (
          existingReminder &&
          existingReminder.id
        ) {
          const response =
            await fetch(
              `${REMINDER_API}/${existingReminder.id}/toggle?enabled=false`,
              {
                method: "PATCH",
                headers:
                  getHeaders(),
              }
            );

          if (
            response.status ===
            401
          ) {
            logout();
            return;
          }

          if (!response.ok) {
            const text =
              await response.text();

            throw new Error(
              text ||
                "Failed to disable reminder."
            );
          }
        }

        return;
      }

      /*
       * Notifications ON
       */
      await registerFCMDevice();

      const {
        reminderDate,
        reminderTime,
      } =
        calculateReminderDateTime(
          habit
        );

      /*
       * If the habit has different
       * start/end dates, create a daily
       * reminder. Otherwise one-time.
       */
      const repeatType =
        habit.endDate &&
        habit.endDate !==
          habit.startDate
          ? "DAILY"
          : "ONCE";

      const reminderPayload = {
        habitId:
          habit.id,

        title:
          habit.title ||
          "Habit Reminder",

        message:
          `Time to work on: ${
            habit.title ||
            "your habit"
          }`,

        reminderDate,

        reminderTime,

        repeatType,

        timezone:
          "Asia/Kolkata",

        enabled: true,
      };

      const url =
        existingReminder &&
        existingReminder.id
          ? `${REMINDER_API}/${existingReminder.id}`
          : REMINDER_API;

      const method =
        existingReminder &&
        existingReminder.id
          ? "PUT"
          : "POST";

      const response =
        await fetch(
          url,
          {
            method,
            headers:
              getHeaders(),
            body: JSON.stringify(
              reminderPayload
            ),
          }
        );

      if (
        response.status === 401
      ) {
        logout();
        return;
      }

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Failed to save habit reminder."
        );
      }
    };

  /* =========================================================
     SAVE HABIT
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      /*
       * Required title
       */
      if (
        !form.title.trim()
      ) {
        throw new Error(
          "Habit name is required."
        );
      }

      /*
       * Date validation
       */
      if (
        form.startDate &&
        form.endDate &&
        form.endDate <
          form.startDate
      ) {
        throw new Error(
          "End date cannot be before start date."
        );
      }

      /*
       * Notification validation
       */
      if (
        form.notificationsEnabled
      ) {
        if (
          !form.startDate
        ) {
          throw new Error(
            "Please select a start date before enabling notifications."
          );
        }

        if (
          !form.startTime
        ) {
          throw new Error(
            "Please select a start time before enabling notifications."
          );
        }
      }

      const target =
        Math.max(
          1,
          Number(
            form.targetCount
          ) || 1
        );

      const state =
        calculateStatus(
          form.currentProgress,
          target
        );

      /*
       * Backend payload
       */
      const payload = {
        title:
          form.title.trim(),

        description:
          form.description.trim(),

        notes:
          form.notes.trim(),

        startDate:
          form.startDate ||
          null,

        endDate:
          form.endDate ||
          null,

        startTime:
          backendTime(
            form.startTime
          ),

        endTime:
          backendTime(
            form.endTime
          ),

        targetCount:
          target,

        currentProgress:
          state.progress,

        priority:
          form.priority ||
          "MEDIUM",

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

      const url =
        editingHabit
          ? `${API_URL}/${editingHabit.id}`
          : API_URL;

      const method =
        editingHabit
          ? "PUT"
          : "POST";

      /*
       * Save habit first.
       */
      const response =
        await fetch(
          url,
          {
            method,
            headers:
              getHeaders(),
            body: JSON.stringify(
              payload
            ),
          }
        );

      if (
        response.status === 401
      ) {
        logout();
        return;
      }

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Failed to save habit."
        );
      }

      /*
       * Read backend response.
       */
      const responseText =
        await response.text();

      let savedHabit = null;

      if (
        responseText.trim()
      ) {
        try {
          savedHabit =
            JSON.parse(
              responseText
            );
        } catch (
          parseError
        ) {
          console.warn(
            "Habit response is not JSON:",
            parseError
          );
        }
      }

      /*
       * If backend returned the
       * saved habit, use it.
       */
      if (
        savedHabit &&
        savedHabit.id
      ) {
        if (
          editingHabit
        ) {
          setHabits(
            (previous) =>
              previous.map(
                (habit) =>
                  habit.id ===
                  editingHabit.id
                    ? savedHabit
                    : habit
              )
          );
        } else {
          setHabits(
            (previous) => [
              savedHabit,
              ...previous,
            ]
          );
        }
      }

      /*
       * If backend did not return
       * JSON, reload the habits.
       */
      if (
        !savedHabit ||
        !savedHabit.id
      ) {
        await loadHabits();
      }

      /*
       * Determine which habit should
       * receive the reminder.
       */
      let habitForReminder =
        savedHabit;

      /*
       * Editing always already has
       * an ID.
       */
      if (
        !habitForReminder &&
        editingHabit
      ) {
        habitForReminder = {
          ...editingHabit,
          ...payload,
        };
      }

      /*
       * Creating a new habit:
       *
       * If the backend did not return
       * the created habit, load the list
       * and find it using a normal loop.
       *
       * IMPORTANT:
       * There is NO malformed
       * latestHabits.find(...) code here.
       */
      if (
        !habitForReminder &&
        !editingHabit
      ) {
        try {
          const latestResponse =
            await fetch(
              API_URL,
              {
                method: "GET",
                headers:
                  getHeaders(),
              }
            );

          if (
            latestResponse.status ===
            401
          ) {
            logout();
            return;
          }

          if (
            latestResponse.ok
          ) {
            const latestHabits =
              await latestResponse.json();

            if (
              Array.isArray(
                latestHabits
              )
            ) {
              for (
                const habit of latestHabits
              ) {
                const habitTime =
                  String(
                    habit.startTime ||
                      ""
                  ).substring(
                    0,
                    5
                  );

                const payloadTime =
                  String(
                    payload.startTime ||
                      ""
                  ).substring(
                    0,
                    5
                  );

                if (
                  habit.title ===
                    payload.title &&
                  habit.startDate ===
                    payload.startDate &&
                  habitTime ===
                    payloadTime
                ) {
                  habitForReminder =
                    habit;

                  break;
                }
              }
            }
          }
        } catch (
          lookupError
        ) {
          console.warn(
            "Could not locate newly created habit:",
            lookupError
          );
        }
      }

      /*
       * Sync Firebase reminder.
       */
      if (
        habitForReminder &&
        habitForReminder.id
      ) {
        await syncReminderForHabit(
          {
            ...habitForReminder,

            id:
              habitForReminder.id,

            title:
              payload.title,

            startDate:
              payload.startDate,

            endDate:
              payload.endDate,

            startTime:
              payload.startTime,

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
          }
        );
      }

      /*
       * Close modal.
       */
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
      console.error(
        "Save habit error:",
        err
      );

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
    const habitId =
      habit.id;

    if (
      progressLocks.current.has(
        habitId
      )
    ) {
      return;
    }

    progressLocks.current.add(
      habitId
    );

    setUpdatingId(
      habitId
    );

    const target =
      Math.max(
        1,
        Number(
          habit.targetCount
        ) || 1
      );

    const state =
      calculateStatus(
        requestedProgress,
        target
      );

    const oldHabit = {
      ...habit,
    };

    /*
     * Optimistic update.
     */
    setHabits(
      (previous) =>
        previous.map(
          (item) =>
            item.id ===
            habitId
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
          habit.startDate ||
          null,

        endDate:
          habit.endDate ||
          null,

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
          habit.priority ||
          "MEDIUM",

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
            ) || 0
          ),

        completed:
          state.completed,
      };

      const response =
        await fetch(
          `${API_URL}/${habitId}`,
          {
            method: "PUT",
            headers:
              getHeaders(),
            body: JSON.stringify(
              payload
            ),
          }
        );

      if (
        response.status === 401
      ) {
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

      if (
        responseText.trim()
      ) {
        try {
          const updatedHabit =
            JSON.parse(
              responseText
            );

          if (
            updatedHabit &&
            updatedHabit.id ===
              habitId
          ) {
            setHabits(
              (previous) =>
                previous.map(
                  (item) =>
                    item.id ===
                    habitId
                      ? {
                          ...item,
                          ...updatedHabit,
                        }
                      : item
                )
            );
          }
        } catch {
          /*
           * Optimistic UI is already
           * updated correctly.
           */
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
      console.error(
        "Progress update error:",
        err
      );

      /*
       * Restore old habit.
       */
      setHabits(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
              habitId
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
     INCREASE
  ========================================================= */

  const increaseProgress = (
    habit
  ) => {
    const current =
      Number(
        habit.currentProgress ||
          0
      );

    const target =
      Math.max(
        1,
        Number(
          habit.targetCount
        ) || 1
      );

    if (
      current >= target
    ) {
      return;
    }

    updateProgress(
      habit,
      current + 1
    );
  };

  /* =========================================================
     DECREASE
  ========================================================= */

  const decreaseProgress = (
    habit
  ) => {
    const current =
      Number(
        habit.currentProgress ||
          0
      );

    if (
      current <= 0
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

  const resetProgress = (
    habit
  ) => {
    const current =
      Number(
        habit.currentProgress ||
          0
      );

    if (
      current <= 0
    ) {
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

  const completeHabit = (
    habit
  ) => {
    const target =
      Math.max(
        1,
        Number(
          habit.targetCount
        ) || 1
      );

    const current =
      Number(
        habit.currentProgress ||
          0
      );

    if (
      current >= target
    ) {
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

  const deleteHabit = async (
    habit
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${habit.title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(
        habit.id
      );

      setError("");

      /*
       * Disable reminder first.
       */
      try {
        const reminder =
          await getReminderForHabit(
            habit.id
          );

        if (
          reminder &&
          reminder.id
        ) {
          await fetch(
            `${REMINDER_API}/${reminder.id}/toggle?enabled=false`,
            {
              method: "PATCH",
              headers:
                getHeaders(),
            }
          );
        }
      } catch (
        reminderError
      ) {
        console.warn(
          "Could not disable reminder:",
          reminderError
        );
      }

      const response =
        await fetch(
          `${API_URL}/${habit.id}`,
          {
            method: "DELETE",
            headers:
              getHeaders(),
          }
        );

      if (
        response.status === 401
      ) {
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

      setHabits(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              habit.id
          )
      );

      showSuccess(
        `"${habit.title}" deleted.`
      );
    } catch (err) {
      console.error(
        "Delete habit error:",
        err
      );

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

  const getProgress = (
    habit
  ) => {
    const target =
      Number(
        habit.targetCount || 0
      );

    const current =
      Number(
        habit.currentProgress ||
          0
      );

    if (
      target <= 0
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (current / target) *
          100
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
      habit.status ===
      status;

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
     NOTIFICATION TOGGLE
  ========================================================= */

  const toggleNotifications =
    async (enabled) => {
      if (!enabled) {
        setForm(
          (previous) => ({
            ...previous,
            notificationsEnabled:
              false,
          })
        );

        setError("");

        return;
      }

      if (
        !("Notification" in window)
      ) {
        setError(
          "This browser does not support notifications."
        );

        return;
      }

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

        /*
         * Get Firebase token and
         * register browser/device.
         */
        await registerFCMDevice();

        setForm(
          (previous) => ({
            ...previous,
            notificationsEnabled:
              true,
          })
        );

        setError("");

        showSuccess(
          "Notifications enabled."
        );
      } catch (err) {
        console.error(
          "Notification enable error:",
          err
        );

        setError(
          err.message ||
            "Could not enable notifications."
        );
      }
    };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const total =
    habits.length;

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
              getProgress(
                habit
              ),
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
              w-10
              h-10
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

        {/* ===================================================
            HEADER
        =================================================== */}

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
          <div>
            <h1 className="text-2xl md:text-3xl font-black">
              Daily Habits
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              Build consistency and track real progress.
            </p>
          </div>

          <div className="flex-1 flex justify-center">
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

        {/* ===================================================
            ERROR
        =================================================== */}

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

        {/* ===================================================
            STATS
        =================================================== */}

        <div
          className="
            grid
            grid-cols-3
            gap-3
            mb-4
          "
        >
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
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
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
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
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
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Overall
            </p>

            <p className="text-xl font-black text-purple-300 mt-1">
              {overall}%
            </p>
          </div>
        </div>

        {/* ===================================================
            HABIT TABLE
        =================================================== */}

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
              <span>Habit</span>
              <span>Schedule</span>
              <span>Target</span>
              <span>Progress</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {habits.map(
              (habit) => {
                const progress =
                  getProgress(
                    habit
                  );

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
                    {/* HABIT */}

                    <div
                      className="
                        flex
                        items-start
                        gap-2.5
                        min-w-0
                      "
                    >
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
                        <div className="flex items-center gap-2">
                          <h3
                            className="
                              font-black
                              text-sm
                              truncate
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

                        <p
                          className="
                            text-[10px]
                            text-gray-500
                            truncate
                            mt-0.5
                          "
                        >
                          {habit.description ||
                            "Build consistency"}
                        </p>

                        <p
                          className="
                            text-[9px]
                            text-gray-600
                            mt-1
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

                        {habit.notes &&
                          habit.notes.trim() && (
                            <div
                              className="
                                mt-1.5
                                max-w-[220px]
                                h-[27px]
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
                              <span className="text-[9px] mr-1">
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
                                "
                              >
                                NOTES
                              </span>

                              <span
                                className="
                                  text-[8px]
                                  text-gray-300
                                  truncate
                                  font-semibold
                                "
                              >
                                {habit.notes}
                              </span>
                            </div>
                          )}

                        {habit.notificationsEnabled && (
                          <div
                            className="
                              mt-1.5
                              flex
                              items-center
                              gap-1
                              text-[8px]
                              text-cyan-400
                              font-bold
                            "
                          >
                            🔔 Reminder enabled
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SCHEDULE */}

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

                    {/* TARGET */}

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

                    {/* PROGRESS */}

                    <div>
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

                        <span className="text-[9px] text-gray-500">
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
                            transition-all
                            duration-300
                          "
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />
                      </div>

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
                          className="
                            w-8
                            h-6
                            rounded-md
                            border
                            border-red-400/40
                            bg-red-400/5
                            text-red-300
                            text-xs
                            font-black
                            hover:bg-red-400/15
                            disabled:opacity-25
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
                          "
                        >
                          {updating
                            ? "Updating..."
                            : "+1 Progress"}
                        </button>
                      </div>
                    </div>

                    {/* STATUS */}

                    <div
                      className="
                        flex
                        items-center
                        gap-1
                      "
                    >
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
                        title="Not Started"
                        className={`
                          w-8
                          h-8
                          rounded-lg
                          border
                          flex
                          items-center
                          justify-center
                          text-sm
                          ${statusClass(
                            habit,
                            "NOT_STARTED"
                          )}
                          disabled:opacity-30
                        `}
                      >
                        ○
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
                        title="In Progress"
                        className={`
                          w-8
                          h-8
                          rounded-lg
                          border
                          flex
                          items-center
                          justify-center
                          text-xs
                          ${statusClass(
                            habit,
                            "IN_PROGRESS"
                          )}
                          disabled:opacity-30
                        `}
                      >
                        ▶
                      </button>

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

                    {/* ACTIONS */}

                    <div
                      className="
                        flex
                        items-center
                        gap-1
                      "
                    >
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
                        className="
                          w-8
                          h-8
                          rounded-lg
                          border
                          border-cyan-400/40
                          bg-cyan-400/5
                          text-cyan-300
                          flex
                          items-center
                          justify-center
                          font-bold
                          hover:bg-cyan-400/15
                          disabled:opacity-30
                        "
                      >
                        ✎
                      </button>

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
                        className="
                          w-8
                          h-8
                          rounded-lg
                          border
                          border-red-500/50
                          bg-red-500/5
                          text-red-400
                          flex
                          items-center
                          justify-center
                          font-bold
                          hover:bg-red-500/15
                          disabled:opacity-30
                        "
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <div
            className="
              min-h-[300px]
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
            <div className="text-5xl mb-4">
              🔥
            </div>

            <h2 className="text-xl font-black">
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

        {/* ===================================================
            ADD / EDIT MODAL
        =================================================== */}

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
                closeModal();
              }
            }}
          >
            <div
              className="
                w-full
                max-w-2xl
                max-h-[92vh]
                overflow-y-auto
                rounded-2xl
                border
                border-white/10
                bg-[#0c0c14]
                shadow-2xl
              "
            >
              {/* MODAL HEADER */}

              <div
                className="
                  sticky
                  top-0
                  z-10
                  px-5
                  py-4
                  border-b
                  border-white/10
                  bg-[#0c0c14]
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <h2 className="text-xl font-black">
                    {editingHabit
                      ? "Edit Habit"
                      : "Create Habit"}
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Track your progress and build consistency.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                  className="
                    w-9
                    h-9
                    rounded-lg
                    border
                    border-white/10
                    text-gray-400
                    hover:text-white
                    hover:bg-white/5
                  "
                >
                  ✕
                </button>
              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="
                  p-5
                  space-y-5
                "
              >
                {/* TITLE */}

                <div>
                  <label
                    htmlFor="habit-title"
                    className="
                      block
                      text-xs
                      font-bold
                      text-gray-300
                      mb-2
                    "
                  >
                    Habit Name *
                  </label>

                  <input
                    id="habit-title"
                    name="title"
                    value={
                      form.title
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Read 20 pages"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-cyan-400/60
                    "
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label
                    htmlFor="habit-description"
                    className="
                      block
                      text-xs
                      font-bold
                      text-gray-300
                      mb-2
                    "
                  >
                    Description
                  </label>

                  <textarea
                    id="habit-description"
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    rows={3}
                    placeholder="What do you want to achieve?"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      px-4
                      py-3
                      text-sm
                      outline-none
                      resize-none
                      focus:border-cyan-400/60
                    "
                  />
                </div>

                {/* NOTES */}

                <div>
                  <label
                    htmlFor="habit-notes"
                    className="
                      block
                      text-xs
                      font-bold
                      text-gray-300
                      mb-2
                    "
                  >
                    Notes
                  </label>

                  <textarea
                    id="habit-notes"
                    name="notes"
                    value={
                      form.notes
                    }
                    onChange={
                      handleChange
                    }
                    rows={2}
                    placeholder="Add any notes..."
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      px-4
                      py-3
                      text-sm
                      outline-none
                      resize-none
                      focus:border-cyan-400/60
                    "
                  />
                </div>

                {/* DATES */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="habit-start-date"
                      className="
                        block
                        text-xs
                        font-bold
                        text-gray-300
                        mb-2
                      "
                    >
                      Start Date
                    </label>

                    <input
                      id="habit-start-date"
                      type="date"
                      name="startDate"
                      value={
                        form.startDate
                      }
                      onChange={
                        handleChange
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-4
                        py-3
                        text-sm
                        outline-none
                        focus:border-cyan-400/60
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="habit-end-date"
                      className="
                        block
                        text-xs
                        font-bold
                        text-gray-300
                        mb-2
                      "
                    >
                      End Date
                    </label>

                    <input
                      id="habit-end-date"
                      type="date"
                      name="endDate"
                      value={
                        form.endDate
                      }
                      min={
                        form.startDate ||
                        undefined
                      }
                      onChange={
                        handleChange
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-4
                        py-3
                        text-sm
                        outline-none
                        focus:border-cyan-400/60
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
                      border-purple-400/20
                      bg-purple-400/5
                      px-4
                      py-3
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-purple-300 font-bold">
                        Habit Duration
                      </p>

                      <p className="text-sm font-black mt-1">
                        {formDuration} day
                        {formDuration !==
                        1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        useSuggestedTarget
                      }
                      className="
                        px-3
                        py-2
                        rounded-lg
                        border
                        border-purple-400/30
                        text-purple-300
                        text-xs
                        font-bold
                        hover:bg-purple-400/10
                      "
                    >
                      Use as Target
                    </button>
                  </div>
                )}

                {/* TIME */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="habit-start-time"
                      className="
                        block
                        text-xs
                        font-bold
                        text-gray-300
                        mb-2
                      "
                    >
                      Start Time
                      {form.notificationsEnabled &&
                        " *"}
                    </label>

                    <input
                      id="habit-start-time"
                      type="time"
                      name="startTime"
                      value={
                        form.startTime
                      }
                      onChange={
                        handleChange
                      }
                      required={
                        form.notificationsEnabled
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-4
                        py-3
                        text-sm
                        outline-none
                        focus:border-cyan-400/60
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="habit-end-time"
                      className="
                        block
                        text-xs
                        font-bold
                        text-gray-300
                        mb-2
                      "
                    >
                      End Time
                    </label>

                    <input
                      id="habit-end-time"
                      type="time"
                      name="endTime"
                      value={
                        form.endTime
                      }
                      onChange={
                        handleChange
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-4
                        py-3
                        text-sm
                        outline-none
                        focus:border-cyan-400/60
                      "
                    />
                  </div>
                </div>

                {/* TARGET / PROGRESS */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="habit-target"
                      className="
                        block
                        text-xs
                        font-bold
                        text-gray-300
                        mb-2
                      "
                    >
                      Target Count
                    </label>

                    <input
                      id="habit-target"
                      type="number"
                      name="targetCount"
                      min="1"
                      value={
                        form.targetCount
                      }
                      onChange={
                        handleChange
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-4
                        py-3
                        text-sm
                        outline-none
                        focus:border-cyan-400/60
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="habit-progress"
                      className="
                        block
                        text-xs
                        font-bold
                        text-gray-300
                        mb-2
                      "
                    >
                      Current Progress
                    </label>

                    <input
                      id="habit-progress"
                      type="number"
                      name="currentProgress"
                      min="0"
                      max={
                        form.targetCount ||
                        1
                      }
                      value={
                        form.currentProgress
                      }
                      onChange={
                        handleChange
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-4
                        py-3
                        text-sm
                        outline-none
                        focus:border-cyan-400/60
                      "
                    />
                  </div>
                </div>

                {/* PRIORITY */}

                <div>
                  <label
                    htmlFor="habit-priority"
                    className="
                      block
                      text-xs
                      font-bold
                      text-gray-300
                      mb-2
                    "
                  >
                    Priority
                  </label>

                  <select
                    id="habit-priority"
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-[#11111a]
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-cyan-400/60
                    "
                  >
                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>
                  </select>
                </div>

                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-cyan-400/20
                    bg-cyan-400/[0.035]
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
                      <p className="font-black text-sm">
                        🔔 Habit Notifications
                      </p>

                      <p className="text-[11px] text-gray-500 mt-1">
                        Remind me before the habit time.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={
                        form.notificationsEnabled
                      }
                      onClick={() =>
                        toggleNotifications(
                          !form.notificationsEnabled
                        )
                      }
                      className={`
                        relative
                        w-12
                        h-7
                        rounded-full
                        transition
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
                          w-5
                          h-5
                          rounded-full
                          bg-white
                          transition
                          ${
                            form.notificationsEnabled
                              ? "left-6"
                              : "left-1"
                          }
                        `}
                      />
                    </button>
                  </div>

                  {form.notificationsEnabled && (
                    <div className="mt-4">
                      <label
                        htmlFor="reminder-minutes"
                        className="
                          block
                          text-xs
                          font-bold
                          text-gray-300
                          mb-2
                        "
                      >
                        Reminder Before
                        (minutes)
                      </label>

                      <input
                        id="reminder-minutes"
                        type="number"
                        min="0"
                        name="reminderMinutesBefore"
                        value={
                          form.reminderMinutesBefore
                        }
                        onChange={
                          handleChange
                        }
                        className="
                          w-full
                          rounded-xl
                          border
                          border-white/10
                          bg-white/[0.04]
                          px-4
                          py-3
                          text-sm
                          outline-none
                          focus:border-cyan-400/60
                        "
                      />

                      <p className="text-[10px] text-gray-600 mt-2">
                        Example: 10 means you will receive the reminder 10 minutes before the habit start time.
                      </p>
                    </div>
                  )}
                </div>

                {/* FORM ERROR */}

                {error && (
                  <div
                    className="
                      rounded-xl
                      border
                      border-red-500/30
                      bg-red-500/10
                      text-red-300
                      px-4
                      py-3
                      text-xs
                    "
                  >
                    {error}
                  </div>
                )}

                {/* BUTTONS */}

                <div
                  className="
                    flex
                    items-center
                    justify-end
                    gap-3
                    pt-2
                  "
                >
                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    disabled={saving}
                    className="
                      px-5
                      py-2.5
                      rounded-xl
                      border
                      border-white/10
                      text-gray-300
                      text-sm
                      font-bold
                      hover:bg-white/5
                      disabled:opacity-40
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      px-6
                      py-2.5
                      rounded-xl
                      bg-gradient-to-r
                      from-cyan-400
                      to-purple-500
                      text-black
                      text-sm
                      font-black
                      hover:scale-[1.02]
                      transition
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    {saving
                      ? "Saving..."
                      : editingHabit
                      ? "Update Habit"
                      : "Create Habit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}