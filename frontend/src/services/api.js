import axios from "axios";


// ======================================================
// API CONFIGURATION
// ======================================================

const API = axios.create({
  baseURL: "http://localhost:8081/api",

  headers: {
    "Content-Type": "application/json",
  },
});


// ======================================================
// PUBLIC AUTH ROUTES
// These pages do not require an authenticated JWT.
// ======================================================

const PUBLIC_AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-register",
  "/reset-password",
];


// ======================================================
// REQUEST INTERCEPTOR
// Automatically attaches JWT to protected requests.
// ======================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ======================================================
// RESPONSE INTERCEPTOR
// Handles expired / invalid authentication.
// ======================================================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    const currentPath =
      window.location.pathname;

    const isPublicAuthPage =
      PUBLIC_AUTH_PATHS.includes(currentPath);

    /*
     * Only clear the stored authentication when a protected
     * request fails with 401/403.
     *
     * This prevents public authentication pages such as
     * Forgot Password from unnecessarily redirecting.
     */

    if (
      (status === 401 || status === 403) &&
      !isPublicAuthPage
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


// ======================================================
// AUTH — REGISTER
// ======================================================

export const registerUser = async (userData) => {
  const response = await API.post(
    "/users/register",
    userData
  );

  return response.data;
};


// ======================================================
// AUTH — VERIFY REGISTER OTP
// ======================================================

export const verifyRegisterOtp = async (
  email,
  otp
) => {
  const response = await API.post(
    "/users/verify-register-otp",
    {
      email,
      otp,
    }
  );

  return response.data;
};


// ======================================================
// AUTH — LOGIN
// Normal login DOES NOT use OTP.
// Backend returns JWT + user.
// ======================================================

export const loginUser = async (loginData) => {
  const response = await API.post(
    "/users/login",
    loginData
  );

  const data = response.data;

  // ----------------------------------------------------
  // Store JWT
  // ----------------------------------------------------

  if (data?.token) {
    localStorage.setItem(
      "token",
      data.token
    );
  }

  // ----------------------------------------------------
  // Store authenticated user
  // ----------------------------------------------------

  if (data?.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }

  return data;
};


// ======================================================
// AUTH — FORGOT PASSWORD
// Sends OTP to registered email.
// ======================================================

export const forgotPassword = async (
  email
) => {
  const response = await API.post(
    "/users/forgot-password",
    {
      email,
    }
  );

  return response.data;
};


// ======================================================
// AUTH — VERIFY RESET OTP
// Verifies OTP and receives reset token.
// ======================================================

export const verifyResetOtp = async (
  email,
  otp
) => {
  const response = await API.post(
    "/users/verify-reset-otp",
    {
      email,
      otp,
    }
  );

  return response.data;
};


// ======================================================
// AUTH — RESET PASSWORD
//
// Supports:
// resetPassword(email, resetToken, newPassword)
//
// AND:
//
// resetPassword({
//   email,
//   resetToken,
//   newPassword
// })
//
// The object format is used by the new ForgotPassword.jsx.
// ======================================================

export const resetPassword = async (
  emailOrData,
  resetToken,
  newPassword
) => {

  let email;
  let finalResetToken;
  let finalNewPassword;

  // ----------------------------------------------------
  // New object format
  // ----------------------------------------------------

  if (
    typeof emailOrData === "object" &&
    emailOrData !== null
  ) {
    email = emailOrData.email;
    finalResetToken =
      emailOrData.resetToken;
    finalNewPassword =
      emailOrData.newPassword;
  }

  // ----------------------------------------------------
  // Old 3-argument format
  // ----------------------------------------------------

  else {
    email = emailOrData;
    finalResetToken = resetToken;
    finalNewPassword = newPassword;
  }

  const response = await API.post(
    "/users/reset-password",
    {
      email,
      resetToken: finalResetToken,
      newPassword: finalNewPassword,
    }
  );

  return response.data;
};


// ======================================================
// AUTH — RESEND OTP
//
// purpose:
// REGISTER
// RESET_PASSWORD
// ======================================================

export const resendOtp = async (
  email,
  purpose
) => {
  const response = await API.post(
    "/users/resend-otp",
    {
      email,
      purpose,
    }
  );

  return response.data;
};


// ======================================================
// AUTH — CURRENT USER
//
// Gets the currently authenticated user from backend.
// ======================================================

export const getCurrentUser = async () => {
  const response = await API.get(
    "/users/me"
  );

  const data = response.data;

  /*
   * Backend may return:
   *
   * {
   *   user: {...}
   * }
   *
   * or directly:
   *
   * {...}
   */

  const currentUser =
    data?.user || data;

  if (
    currentUser &&
    typeof currentUser === "object" &&
    currentUser.email
  ) {
    localStorage.setItem(
      "user",
      JSON.stringify(currentUser)
    );
  }

  return data;
};


// ======================================================
// LOGOUT
// ======================================================

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/login";
};


// ======================================================
// GOALS
// ======================================================

export const getGoals = async () => {
  const response = await API.get(
    "/goals"
  );

  return response.data;
};


export const getGoalById = async (
  id
) => {
  const response = await API.get(
    `/goals/${id}`
  );

  return response.data;
};


export const createGoal = async (
  goalData
) => {
  const response = await API.post(
    "/goals",
    goalData
  );

  return response.data;
};


export const updateGoal = async (
  id,
  goalData
) => {
  const response = await API.put(
    `/goals/${id}`,
    goalData
  );

  return response.data;
};


export const deleteGoal = async (
  id
) => {
  const response = await API.delete(
    `/goals/${id}`
  );

  return response.data;
};


// ======================================================
// GOAL TOPICS
// ======================================================

export const getGoalTopics = async () => {
  const response = await API.get(
    "/goal-topics"
  );

  return response.data;
};


export const getGoalTopicById = async (
  id
) => {
  const response = await API.get(
    `/goal-topics/${id}`
  );

  return response.data;
};


export const createGoalTopic = async (
  topicData
) => {
  const response = await API.post(
    "/goal-topics",
    topicData
  );

  return response.data;
};


export const updateGoalTopic = async (
  id,
  topicData
) => {
  const response = await API.put(
    `/goal-topics/${id}`,
    topicData
  );

  return response.data;
};


export const deleteGoalTopic = async (
  id
) => {
  const response = await API.delete(
    `/goal-topics/${id}`
  );

  return response.data;
};


// ======================================================
// HABITS
// ======================================================

export const getHabits = async () => {
  const response = await API.get(
    "/habits"
  );

  return response.data;
};


export const getHabitById = async (
  id
) => {
  const response = await API.get(
    `/habits/${id}`
  );

  return response.data;
};


export const createHabit = async (
  habitData
) => {
  const response = await API.post(
    "/habits",
    habitData
  );

  return response.data;
};


export const updateHabit = async (
  id,
  habitData
) => {
  const response = await API.put(
    `/habits/${id}`,
    habitData
  );

  return response.data;
};


export const deleteHabit = async (
  id
) => {
  const response = await API.delete(
    `/habits/${id}`
  );

  return response.data;
};


// ======================================================
// REMINDERS
// ======================================================

export const getReminders = async () => {
  const response = await API.get(
    "/reminders"
  );

  return response.data;
};


export const createReminder = async (
  data
) => {
  const response = await API.post(
    "/reminders",
    data
  );

  return response.data;
};


export const updateReminder = async (
  id,
  data
) => {
  const response = await API.put(
    `/reminders/${id}`,
    data
  );

  return response.data;
};


export const deleteReminder = async (
  id
) => {
  const response = await API.delete(
    `/reminders/${id}`
  );

  return response.data;
};


// ======================================================
// USER — STORED USER
// ======================================================

export const getStoredUser = () => {
  try {
    const user =
      localStorage.getItem("user");

    return user
      ? JSON.parse(user)
      : null;

  } catch (error) {
    console.error(
      "Unable to parse stored user:",
      error
    );

    return null;
  }
};


// ======================================================
// AUTH CHECK
// ======================================================

export const isAuthenticated = () => {
  return Boolean(
    localStorage.getItem("token")
  );
};


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default API;