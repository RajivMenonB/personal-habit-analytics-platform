import { useCallback, useEffect, useMemo, useState } from "react";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====================================================
  // LOAD DATA
  // ====================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [goalData, topicData] = await Promise.all([
        getGoals(),
        getGoalTopics(),
      ]);

      setGoals(Array.isArray(goalData) ? goalData : []);
      setTopics(Array.isArray(topicData) ? topicData : []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load goals."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ====================================================
  // GOAL CRUD
  // ====================================================

  const addGoal = async (goalData) => {
    const createdGoal = await createGoal(goalData);

    setGoals((current) => [
      ...current,
      createdGoal,
    ]);

    return createdGoal;
  };

  const editGoal = async (id, goalData) => {
    const updatedGoal = await updateGoal(
      id,
      goalData
    );

    setGoals((current) =>
      current.map((goal) =>
        goal.id === id ? updatedGoal : goal
      )
    );

    return updatedGoal;
  };

  const removeGoal = async (id) => {
    await deleteGoal(id);

    setGoals((current) =>
      current.filter((goal) => goal.id !== id)
    );

    // Remove topics from UI that belong to deleted goal.
    setTopics((current) =>
      current.filter((topic) => {
        const topicGoalId =
          topic.goal?.id ??
          topic.goalId;

        return Number(topicGoalId) !== Number(id);
      })
    );
  };

  // ====================================================
  // TOPIC CRUD
  // ====================================================

  const addTopic = async (goalId, topicData) => {
    const payload = {
      ...topicData,

      // Goal relationship
      goal: {
        id: goalId,
      },
    };

    const createdTopic =
      await createGoalTopic(payload);

    setTopics((current) => [
      ...current,
      createdTopic,
    ]);

    return createdTopic;
  };

  const editTopic = async (id, topicData) => {
    const updatedTopic =
      await updateGoalTopic(
        id,
        topicData
      );

    setTopics((current) =>
      current.map((topic) =>
        topic.id === id
          ? updatedTopic
          : topic
      )
    );

    return updatedTopic;
  };

  const removeTopic = async (id) => {
    await deleteGoalTopic(id);

    setTopics((current) =>
      current.filter(
        (topic) => topic.id !== id
      )
    );
  };

  // ====================================================
  // FIND TOPICS FOR GOAL
  // ====================================================

  const getTopicsForGoal = useCallback(
    (goalId) => {
      return topics.filter((topic) => {
        const topicGoalId =
          topic.goal?.id ??
          topic.goalId;

        return (
          Number(topicGoalId) ===
          Number(goalId)
        );
      });
    },
    [topics]
  );

  // ====================================================
  // ANALYTICS
  // ====================================================

  const analytics = useMemo(() => {
    const totalGoals = goals.length;

    const completedGoals =
      goals.filter(
        (goal) =>
          goal.status === "COMPLETED" ||
          goal.completed === true
      ).length;

    const activeGoals =
      goals.filter(
        (goal) =>
          goal.status !== "COMPLETED" &&
          goal.completed !== true
      ).length;

    const totalTopics = topics.length;

    const completedTopics =
      topics.filter(
        (topic) =>
          topic.status === "COMPLETED" ||
          topic.completed === true
      ).length;

    const topicProgress =
      totalTopics === 0
        ? 0
        : Math.round(
            (completedTopics /
              totalTopics) *
              100
          );

    const goalProgress =
      totalGoals === 0
        ? 0
        : Math.round(
            (completedGoals /
              totalGoals) *
              100
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