import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ======================================================
// AUTH
// ======================================================

export const registerUser = async (userData) => {
  const response = await API.post("/users/register", userData);
  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await API.post("/users/login", loginData);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  if (response.data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// ======================================================
// GOALS
// ======================================================

export const getGoals = async () => {
  const response = await API.get("/goals");
  return response.data;
};

export const getGoalById = async (id) => {
  const response = await API.get(`/goals/${id}`);
  return response.data;
};

export const createGoal = async (goalData) => {
  const response = await API.post("/goals", goalData);
  return response.data;
};

export const updateGoal = async (id, goalData) => {
  const response = await API.put(`/goals/${id}`, goalData);
  return response.data;
};

export const deleteGoal = async (id) => {
  const response = await API.delete(`/goals/${id}`);
  return response.data;
};

// ======================================================
// GOAL TOPICS
// IMPORTANT:
// Backend controller uses GET /api/goal-topics
// ======================================================

export const getGoalTopics = async () => {
  const response = await API.get("/goal-topics");
  return response.data;
};

export const getGoalTopicById = async (id) => {
  const response = await API.get(`/goal-topics/${id}`);
  return response.data;
};

export const createGoalTopic = async (topicData) => {
  const response = await API.post(
    "/goal-topics",
    topicData
  );

  return response.data;
};

export const updateGoalTopic = async (id, topicData) => {
  const response = await API.put(
    `/goal-topics/${id}`,
    topicData
  );

  return response.data;
};

export const deleteGoalTopic = async (id) => {
  const response = await API.delete(
    `/goal-topics/${id}`
  );

  return response.data;
};

// ======================================================
// HABITS
// ======================================================

export const getHabits = async () => {
  const response = await API.get("/habits");
  return response.data;
};

export const getHabitById = async (id) => {
  const response = await API.get(`/habits/${id}`);
  return response.data;
};

export const createHabit = async (habitData) => {
  const response = await API.post("/habits", habitData);
  return response.data;
};

export const updateHabit = async (id, habitData) => {
  const response = await API.put(
    `/habits/${id}`,
    habitData
  );

  return response.data;
};

export const deleteHabit = async (id) => {
  const response = await API.delete(`/habits/${id}`);
  return response.data;
};

// ======================================================
// USER
// ======================================================

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};

export default API;