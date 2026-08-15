import { useCallback, useEffect, useState } from "react";
import {
  getHabits,
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
} from "../services/api";

export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getHabits();

      setHabits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load habits:", err);

      setError(
        err?.response?.data?.message ||
        "Failed to load habits"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHabits();
  }, [refreshHabits]);

  const createHabit = async (habitData) => {
    const created = await apiCreateHabit(habitData);

    setHabits((prev) => [
      ...prev,
      created,
    ]);

    return created;
  };

  const updateHabit = async (id, habitData) => {
    const updated = await apiUpdateHabit(
      id,
      habitData
    );

    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id
          ? updated
          : habit
      )
    );

    return updated;
  };

  const removeHabit = async (id) => {
    await apiDeleteHabit(id);

    setHabits((prev) =>
      prev.filter((habit) => habit.id !== id)
    );
  };

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    removeHabit,
    refreshHabits,
  };
}

export default useHabits;