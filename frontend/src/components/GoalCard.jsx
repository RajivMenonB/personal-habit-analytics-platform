import { useMemo, useState } from "react";
import {
  getGoalTopics,
  deleteGoal,
  deleteGoalTopic,
} from "../services/api";

export default function GoalCard({
  goal,
  onEdit,
  onRefresh,
}) {
  const [expanded, setExpanded] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // ============================================================
  // SAFE VALUES
  // ============================================================

  const target = Number(goal?.targetValue || 0);
  const current = Number(goal?.currentProgress || 0);

  const progress = useMemo(() => {
    if (target <= 0) return 0;

    return Math.min(
      100,
      Math.max(0, Math.round((current / target) * 100))
    );
  }, [current, target]);

  const status = goal?.status || "NOT_STARTED";

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
  // PRIORITY STYLE
  // ============================================================

  const priorityStyle = {
    LOW: "text-emerald-300",
    MEDIUM: "text-yellow-300",
    HIGH: "text-red-300",
  };

  // ============================================================
  // LOAD TOPICS
  // ============================================================

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    try {
      setLoadingTopics(true);

      const data = await getGoalTopics(goal.id);

      setTopics(Array.isArray(data) ? data : []);
      setExpanded(true);
    } catch (error) {
      console.error("Failed to load goal topics:", error);
      setTopics([]);
      setExpanded(true);
    } finally {
      setLoadingTopics(false);
    }
  };

  // ============================================================
  // DELETE GOAL
  // ============================================================

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${goal.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteGoal(goal.id);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);

      alert(
        error?.response?.data?.message ||
          "Unable to delete this goal."
      );
    }
  };

  // ============================================================
  // DELETE TOPIC
  // ============================================================

  const handleDeleteTopic = async (topicId) => {
    const confirmed = window.confirm(
      "Delete this goal topic?"
    );

    if (!confirmed) return;

    try {
      await deleteGoalTopic(topicId);

      setTopics((previous) =>
        previous.filter((topic) => topic.id !== topicId)
      );

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to delete topic:", error);

      alert(
        error?.response?.data?.message ||
          "Unable to delete this topic."
      );
    }
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "No date";

    const value = new Date(`${date}T00:00:00`);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="w-full">

      {/* ======================================================
          COMPACT GOAL ROW
      ====================================================== */}

      <div
        className={`
          group
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
        `}
      >

        {/* GOAL ICON */}

        <div
          className="
            shrink-0
            w-11
            h-11
            rounded-xl
            bg-gradient-to-br
            from-cyan-400/20
            to-purple-500/20
            border
            border-white/10
            flex
            items-center
            justify-center
            text-xl
          "
        >
          🎯
        </div>


        {/* TITLE */}

        <div className="min-w-[170px] max-w-[220px]">

          <div className="flex items-center gap-2">

            <h3
              className="
                font-bold
                text-white
                truncate
              "
              title={goal.title}
            >
              {goal.title || "Untitled Goal"}
            </h3>

          </div>

          <p
            className="
              text-xs
              text-gray-500
              truncate
              mt-1
            "
            title={goal.description}
          >
            {goal.description || "No description"}
          </p>

        </div>


        {/* STATUS */}

        <span
          className={`
            shrink-0
            px-3
            py-1.5
            rounded-full
            text-[10px]
            font-bold
            tracking-wide
            border
            ${statusStyle[status] || statusStyle.NOT_STARTED}
          `}
        >
          {status.replace("_", " ")}
        </span>


        {/* CATEGORY */}

        <div
          className="
            hidden
            xl:flex
            shrink-0
            items-center
            gap-1.5
            px-3
            py-1.5
            rounded-lg
            bg-white/5
            text-xs
            text-gray-300
          "
        >
          <span>📁</span>
          <span>{goal.category || "General"}</span>
        </div>


        {/* DATE */}

        <div
          className="
            hidden
            lg:flex
            shrink-0
            items-center
            gap-2
            text-xs
            text-gray-400
          "
        >
          <span>
            {formatDate(goal.startDate)}
          </span>

          <span className="text-gray-600">
            →
          </span>

          <span>
            {formatDate(goal.targetDate)}
          </span>
        </div>


        {/* PROGRESS */}

        <div
          className="
            flex
            items-center
            gap-3
            min-w-[150px]
            flex-1
          "
        >

          <div className="w-full max-w-[130px]">

            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">

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

          <span className="text-xs font-semibold text-gray-300 whitespace-nowrap">
            {current}/{target}
          </span>

          <span className="text-xs font-bold text-cyan-300 whitespace-nowrap">
            {progress}%
          </span>

        </div>


        {/* PRIORITY */}

        <span
          className={`
            hidden
            xl:block
            shrink-0
            text-[10px]
            font-bold
            ${priorityStyle[goal.priority] || "text-gray-300"}
          `}
        >
          {goal.priority || "MEDIUM"}
        </span>


        {/* ACTIONS */}

        <div
          className="
            shrink-0
            flex
            items-center
            gap-1.5
          "
        >

          {/* EDIT */}

          <button
            type="button"
            onClick={() => onEdit?.(goal)}
            title="Edit goal"
            className="
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


          {/* DELETE */}

          <button
            type="button"
            onClick={handleDelete}
            title="Delete goal"
            className="
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


          {/* EXPAND */}

          <button
            type="button"
            onClick={handleExpand}
            title={
              expanded
                ? "Hide goal topics"
                : "Show goal topics"
            }
            className={`
              w-9
              h-9
              rounded-xl
              border
              border-purple-400/20
              bg-purple-400/5
              text-purple-300
              flex
              items-center
              justify-center
              transition
              ${expanded ? "rotate-180 bg-purple-400/15" : ""}
            `}
          >
            ↓
          </button>

        </div>

      </div>


      {/* ======================================================
          GOAL TOPICS
      ====================================================== */}

      {expanded && (
        <div
          className="
            ml-6
            mt-2
            mb-2
            border-l
            border-cyan-400/20
            pl-4
          "
        >

          <div className="flex items-center justify-between mb-3">

            <div>

              <p className="text-sm font-semibold text-white">
                Goal Topics
              </p>

              <p className="text-xs text-gray-500">
                {topics.length} topic
                {topics.length !== 1 ? "s" : ""}
              </p>

            </div>

          </div>


          {loadingTopics ? (
            <div className="text-xs text-gray-500 py-3">
              Loading topics...
            </div>
          ) : topics.length === 0 ? (
            <div
              className="
                rounded-xl
                border
                border-dashed
                border-white/10
                px-4
                py-4
                text-xs
                text-gray-500
              "
            >
              No topics added to this goal yet.
            </div>
          ) : (
            <div className="space-y-2">

              {topics.map((topic) => {

                const topicProgress =
                  Number(topic.progress || 0);

                return (
                  <div
                    key={topic.id}
                    className="
                      flex
                      items-center
                      gap-3
                      px-3
                      py-2.5
                      rounded-xl
                      bg-white/[0.025]
                      border
                      border-white/5
                      hover:border-white/10
                      transition
                    "
                  >

                    {/* Topic check */}

                    <div
                      className={`
                        w-7
                        h-7
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        text-xs
                        shrink-0
                        ${
                          topic.completed
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-white/5 text-gray-500"
                        }
                      `}
                    >
                      {topic.completed ? "✓" : "•"}
                    </div>


                    {/* Topic title */}

                    <div className="min-w-[150px] flex-1">

                      <p className="text-sm font-medium text-gray-200 truncate">
                        {topic.title}
                      </p>

                      <p className="text-[10px] text-gray-500">
                        {topic.startDate || "No date"}
                        {topic.startTime
                          ? ` • ${topic.startTime}`
                          : ""}
                      </p>

                    </div>


                    {/* Topic status */}

                    <span className="hidden md:block text-[10px] text-gray-400">
                      {(topic.status || "NOT_STARTED").replace(
                        "_",
                        " "
                      )}
                    </span>


                    {/* Topic progress */}

                    <div className="w-20 hidden sm:block">

                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">

                        <div
                          className="
                            h-full
                            rounded-full
                            bg-gradient-to-r
                            from-cyan-400
                            to-purple-500
                          "
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, topicProgress)
                            )}%`,
                          }}
                        />

                      </div>

                    </div>


                    <span className="text-[10px] text-cyan-300 w-8">
                      {topicProgress}%
                    </span>


                    {/* Topic delete */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteTopic(topic.id)
                      }
                      title="Delete topic"
                      className="
                        w-7
                        h-7
                        rounded-lg
                        text-red-300
                        hover:bg-red-400/10
                        transition
                      "
                    >
                      🗑
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      )}

    </div>
  );
}