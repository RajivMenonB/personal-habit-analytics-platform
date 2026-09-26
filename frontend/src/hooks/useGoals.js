import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalTopics,
  createGoalTopic,
  updateGoalTopic,
  deleteGoalTopic,
} from "../services/api";


export default function useGoals() {

  const [goals, setGoals] = useState([]);

  const [topics, setTopics] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD
  // ==========================================================

  const loadData = useCallback(
    async () => {

      try {

        setLoading(true);

        setError("");


        const [
          goalData,
          topicData,
        ] = await Promise.all([
          getGoals(),
          getGoalTopics(),
        ]);


        setGoals(
          Array.isArray(goalData)
            ? goalData
            : []
        );


        setTopics(
          Array.isArray(topicData)
            ? topicData
            : []
        );

      } catch (err) {

        console.error(
          "Goals loading error:",
          err
        );


        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load goals."
        );

      } finally {

        setLoading(false);
      }

    },
    []
  );


  useEffect(() => {

    loadData();

  }, [loadData]);


  // ==========================================================
  // CREATE GOAL
  // ==========================================================

  const addGoal = async (
    goalData
  ) => {

    const createdGoal =
      await createGoal(goalData);


    setGoals(
      (current) => [
        ...current,
        createdGoal,
      ]
    );


    return createdGoal;
  };


  // ==========================================================
  // UPDATE GOAL
  // ==========================================================

  const editGoal = async (
    id,
    goalData
  ) => {

    const updatedGoal =
      await updateGoal(
        id,
        goalData
      );


    setGoals(
      (current) =>
        current.map(
          (goal) =>
            Number(goal.id) === Number(id)
              ? updatedGoal
              : goal
        )
    );


    return updatedGoal;
  };


  // ==========================================================
  // DELETE GOAL
  // ==========================================================

  const removeGoal = async (
    id
  ) => {

    await deleteGoal(id);


    setGoals(
      (current) =>
        current.filter(
          (goal) =>
            Number(goal.id) !== Number(id)
        )
    );


    setTopics(
      (current) =>
        current.filter(
          (topic) =>
            Number(topic.goalId) !==
            Number(id)
        )
    );
  };


  // ==========================================================
  // CREATE TOPIC
  // ==========================================================

  const addTopic = async (
    goalId,
    topicData
  ) => {

    const payload = {
      ...topicData,

      goal: {
        id: goalId,
      },
    };


    const createdTopic =
      await createGoalTopic(
        payload
      );


    setTopics(
      (current) => [
        ...current,
        createdTopic,
      ]
    );


    return createdTopic;
  };


  // ==========================================================
  // UPDATE TOPIC
  // ==========================================================

  const editTopic = async (
    id,
    topicData
  ) => {

    /*
     * IMPORTANT:
     *
     * Do not send a new Goal relationship
     * during topic update.
     *
     * Backend protects the original relationship.
     */
    const updatedTopic =
      await updateGoalTopic(
        id,
        topicData
      );


    setTopics(
      (current) =>
        current.map(
          (topic) =>
            Number(topic.id) === Number(id)
              ? updatedTopic
              : topic
        )
    );


    return updatedTopic;
  };


  // ==========================================================
  // DELETE TOPIC
  // ==========================================================

  const removeTopic = async (
    id
  ) => {

    await deleteGoalTopic(id);


    setTopics(
      (current) =>
        current.filter(
          (topic) =>
            Number(topic.id) !== Number(id)
        )
    );
  };


  // ==========================================================
  // GET TOPICS FOR GOAL
  // ==========================================================

  const getTopicsForGoal =
    useCallback(
      (goalId) => {

        return topics.filter(
          (topic) =>
            Number(topic.goalId) ===
            Number(goalId)
        );

      },
      [topics]
    );


  // ==========================================================
  // ANALYTICS
  // ==========================================================

  const analytics =
    useMemo(() => {

      const totalGoals =
        goals.length;


      const completedGoals =
        goals.filter(
          (goal) =>
            goal.status ===
              "COMPLETED" ||
            goal.completed === true
        ).length;


      const activeGoals =
        goals.filter(
          (goal) =>
            goal.status !==
              "COMPLETED" &&
            goal.completed !== true
        ).length;


      const totalTopics =
        topics.length;


      const completedTopics =
        topics.filter(
          (topic) =>
            topic.status ===
              "COMPLETED" ||
            topic.completed === true ||
            Number(topic.progress) >= 100
        ).length;


      const topicProgress =
        totalTopics === 0
          ? 0
          : Math.round(
              topics.reduce(
                (sum, topic) =>
                  sum +
                  Math.max(
                    0,
                    Math.min(
                      100,
                      Number(
                        topic.progress || 0
                      )
                    )
                  ),
                0
              ) /
              totalTopics
            );


      const goalProgress =
        totalGoals === 0
          ? 0
          : Math.round(
              goals.reduce(
                (sum, goal) => {

                  const target =
                    Number(
                      goal.targetValue || 0
                    );

                  const current =
                    Number(
                      goal.currentProgress || 0
                    );

                  if (target <= 0) {
                    return sum;
                  }

                  return (
                    sum +
                    Math.min(
                      100,
                      Math.max(
                        0,
                        (current /
                          target) *
                          100
                      )
                    )
                  );

                },
                0
              ) /
              totalGoals
            );


      return {

        totalGoals,

        activeGoals,

        completedGoals,

        totalTopics,

        completedTopics,

        topicProgress,

        goalProgress,
      };

    }, [goals, topics]);


  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    goals,

    topics,

    loading,

    error,

    reload: loadData,

    addGoal,

    editGoal,

    removeGoal,

    addTopic,

    editTopic,

    removeTopic,

    getTopicsForGoal,

    analytics,
  };
}