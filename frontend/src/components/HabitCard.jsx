import { useMemo } from "react";
import {
  deleteHabit,
  updateHabit,
} from "../services/api";

export default function HabitCard({
  habit,
  onEdit,
  onRefresh,
}) {

  // ============================================================
  // SAFE VALUES
  // ============================================================

  const target = Number(habit?.targetCount || 1);

  const current = Number(
    habit?.currentProgress || 0
  );

  const progress = useMemo(() => {

    if (target <= 0) return 0;

    return Math.min(
      100,
      Math.max(
        0,
        Math.round((current / target) * 100)
      )
    );

  }, [current, target]);


  const status =
    habit?.status || "NOT_STARTED";


  // ============================================================
  // STATUS STYLE
  // ============================================================

  const statusStyle = {

    NOT_STARTED:
      "bg-slate-500/10 text-slate-300 border-slate-400/20",

    IN_PROGRESS:
      "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",

    COMPLETED:
      "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",

  };


  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {

    const confirmed = window.confirm(
      `Delete "${habit.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {

      await deleteHabit(habit.id);

      onRefresh?.();

    } catch (error) {

      console.error(
        "Failed to delete habit:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Unable to delete habit."
      );
    }
  };


  // ============================================================
  // STATUS UPDATE
  // ============================================================

  const changeStatus = async (newStatus) => {

    try {

      const updatedHabit = {
        ...habit,
        status: newStatus,
        completed:
          newStatus === "COMPLETED",
        currentProgress:
          newStatus === "COMPLETED"
            ? target
            : current,
      };

      await updateHabit(
        habit.id,
        updatedHabit
      );

      onRefresh?.();

    } catch (error) {

      console.error(
        "Failed to update habit:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Unable to update habit."
      );
    }
  };


  // ============================================================
  // TIME FORMAT
  // ============================================================

  const formatTime = (time) => {

    if (!time) return "--:--";

    const parts = time.split(":");

    if (parts.length < 2) return time;

    let hour = Number(parts[0]);
    const minute = parts[1];

    const suffix =
      hour >= 12 ? "pm" : "am";

    hour = hour % 12;

    if (hour === 0) {
      hour = 12;
    }

    return `${String(hour).padStart(
      2,
      "0"
    )}:${minute} ${suffix}`;
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div
      className="
        w-full
        min-h-[82px]
        px-4
        py-3
        rounded-2xl
        border
        border-white/10
        bg-white/[0.035]
        hover:bg-white/[0.055]
        hover:border-cyan-400/20
        transition-all
        duration-200
        flex
        items-center
        gap-4
      "
    >

      {/* ======================================================
          COMPLETE CHECK
      ====================================================== */}

      <button
        type="button"
        title={
          status === "COMPLETED"
            ? "Completed"
            : "Mark completed"
        }
        onClick={() =>
          changeStatus(
            status === "COMPLETED"
              ? "IN_PROGRESS"
              : "COMPLETED"
          )
        }
        className={`
          shrink-0
          w-10
          h-10
          rounded-full
          border
          flex
          items-center
          justify-center
          text-sm
          transition
          ${
            status === "COMPLETED"
              ? "bg-emerald-400 text-black border-emerald-300"
              : "bg-white/[0.02] text-gray-500 border-white/20 hover:border-emerald-400/50 hover:text-emerald-300"
          }
        `}
      >
        {status === "COMPLETED"
          ? "✓"
          : "○"}
      </button>


      {/* ======================================================
          HABIT NAME
      ====================================================== */}

      <div
        className="
          min-w-[160px]
          max-w-[210px]
        "
      >

        <div className="flex items-center gap-2">

          <h3
            className="
              font-bold
              text-white
              truncate
            "
            title={habit.title}
          >
            {habit.title || "Untitled Habit"}
          </h3>

        </div>

        <p
          className="
            text-xs
            text-gray-500
            truncate
            mt-1
          "
        >
          {habit.description ||
            "Build consistency"}
        </p>

      </div>


      {/* ======================================================
          STATUS
      ====================================================== */}

      <span
        className={`
          shrink-0
          px-3
          py-1.5
          rounded-full
          border
          text-[10px]
          font-bold
          tracking-wide
          ${statusStyle[status] ||
            statusStyle.NOT_STARTED}
        `}
      >
        {status.replace("_", " ")}
      </span>


      {/* ======================================================
          SCHEDULE
      ====================================================== */}

      <div
        className="
          hidden
          md:block
          shrink-0
          px-3
          py-2
          rounded-xl
          bg-white/5
          border
          border-white/5
        "
      >

        <p className="text-[9px] text-gray-500 uppercase">
          Schedule
        </p>

        <p className="text-xs text-gray-300 mt-0.5 whitespace-nowrap">

          {formatTime(habit.startTime)}

          <span className="text-gray-600 mx-1">
            →
          </span>

          {formatTime(habit.endTime)}

        </p>

      </div>


      {/* ======================================================
          TARGET
      ====================================================== */}

      <div
        className="
          hidden
          lg:block
          shrink-0
          px-3
          py-2
          rounded-xl
          bg-white/5
          border
          border-white/5
        "
      >

        <p className="text-[9px] text-gray-500 uppercase">
          Target
        </p>

        <p className="text-xs text-gray-300 mt-0.5">
          {current}/{target}
        </p>

      </div>


      {/* ======================================================
          PRIORITY
      ====================================================== */}

      <div
        className="
          hidden
          xl:block
          shrink-0
          px-3
          py-2
          rounded-xl
          bg-white/5
        "
      >

        <p className="text-[9px] text-gray-500 uppercase">
          Priority
        </p>

        <p
          className={`
            text-xs
            font-bold
            mt-0.5
            ${
              habit.priority === "HIGH"
                ? "text-red-300"
                : habit.priority === "LOW"
                ? "text-emerald-300"
                : "text-yellow-300"
            }
          `}
        >
          {habit.priority || "MEDIUM"}
        </p>

      </div>


      {/* ======================================================
          PROGRESS
      ====================================================== */}

      <div
        className="
          flex
          items-center
          gap-2
          flex-1
          min-w-[120px]
        "
      >

        <div className="flex-1">

          <div
            className="
              h-1.5
              bg-white/10
              rounded-full
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
                duration-500
              "
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        <span className="text-xs text-cyan-300 font-bold whitespace-nowrap">
          {progress}%
        </span>

      </div>


      {/* ======================================================
          STATUS BUTTONS
      ====================================================== */}

      <div
        className="
          hidden
          xl:flex
          items-center
          gap-1
          shrink-0
        "
      >

        {/* NOT STARTED */}

        <button
          type="button"
          title="Set as not started"
          onClick={() =>
            changeStatus("NOT_STARTED")
          }
          className={`
            w-8
            h-8
            rounded-lg
            border
            text-xs
            transition
            ${
              status === "NOT_STARTED"
                ? "border-slate-400/40 bg-slate-400/10 text-white"
                : "border-white/5 text-gray-500 hover:text-gray-300"
            }
          `}
        >
          ○
        </button>


        {/* IN PROGRESS */}

        <button
          type="button"
          title="Set in progress"
          onClick={() =>
            changeStatus("IN_PROGRESS")
          }
          className={`
            w-8
            h-8
            rounded-lg
            border
            text-xs
            transition
            ${
              status === "IN_PROGRESS"
                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                : "border-white/5 text-gray-500 hover:text-cyan-300"
            }
          `}
        >
          ◉
        </button>


        {/* COMPLETE */}

        <button
          type="button"
          title="Complete habit"
          onClick={() =>
            changeStatus("COMPLETED")
          }
          className={`
            w-8
            h-8
            rounded-lg
            border
            text-xs
            transition
            ${
              status === "COMPLETED"
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-white/5 text-gray-500 hover:text-emerald-300"
            }
          `}
        >
          ✓
        </button>

      </div>


      {/* ======================================================
          EDIT
      ====================================================== */}

      <button
        type="button"
        title="Edit habit"
        onClick={() =>
          onEdit?.(habit)
        }
        className="
          shrink-0
          w-9
          h-9
          rounded-xl
          border
          border-cyan-400/20
          bg-cyan-400/5
          text-cyan-300
          flex
          items-center
          justify-center
          hover:bg-cyan-400/15
          hover:border-cyan-400/40
          transition
        "
      >
        ✏️
      </button>


      {/* ======================================================
          DELETE
      ====================================================== */}

      <button
        type="button"
        title="Delete habit"
        onClick={handleDelete}
        className="
          shrink-0
          w-9
          h-9
          rounded-xl
          border
          border-red-400/20
          bg-red-400/5
          text-red-300
          flex
          items-center
          justify-center
          hover:bg-red-400/15
          hover:border-red-400/40
          transition
        "
      >
        🗑️
      </button>

    </div>
  );
}