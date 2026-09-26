import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { registerUser } from "../services/api";

import "./AuthCopper.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const name = formData.name.trim();
    const email = formData.email
      .trim()
      .toLowerCase();

    if (name.length < 2) {
      setError(
        "Full name must contain at least 2 characters."
      );
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name,
        email,
        password: formData.password,
      });

      /*
       * Registration is OTP based.
       *
       * The backend sends the OTP to the
       * registered email address.
       */
      if (
        response?.otpRequired !== false
      ) {
        navigate(
          `/verify-register?email=${encodeURIComponent(
            email
          )}`
        );
        return;
      }

      /*
       * Fallback in case the backend returns
       * a normal successful registration.
       */
      navigate("/login");
    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to create your account.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hm-auth">

      {/* =====================================================
          ATMOSPHERIC LIGHTS
          ===================================================== */}

      <div
        className="hm-glow hm-glow-lime"
        style={{
          width: 300,
          height: 300,
          left: "-130px",
          top: "-100px",
        }}
      />

      <div
        className="hm-glow hm-glow-cyan"
        style={{
          width: 280,
          height: 280,
          right: "-120px",
          top: "8%",
        }}
      />

      <div
        className="hm-glow hm-glow-purple"
        style={{
          width: 320,
          height: 320,
          right: "-140px",
          bottom: "-140px",
        }}
      />

      {/* =====================================================
          PARTICLES
          ===================================================== */}

      <span
        className="hm-particle"
        style={{
          left: "14%",
          top: "18%",
        }}
      />

      <span
        className="hm-particle cyan"
        style={{
          left: "76%",
          top: "21%",
          animationDelay: "1s",
        }}
      />

      <span
        className="hm-particle purple"
        style={{
          left: "88%",
          top: "70%",
          animationDelay: "2s",
        }}
      />

      <span
        className="hm-particle pink"
        style={{
          left: "17%",
          top: "76%",
          animationDelay: "3s",
        }}
      />

      <span
        className="hm-particle copper"
        style={{
          left: "52%",
          top: "12%",
          animationDelay: "1.5s",
        }}
      />

      {/* =====================================================
          MAIN AUTH SHELL
          ===================================================== */}

      <div className="hm-auth-shell">

        {/* ===================================================
            BRAND
            =================================================== */}

        <div className="hm-auth-brand">

          <div className="hm-logo">
            H
          </div>

          <div>
            <div className="hm-auth-brand-name">
              HabitMile 365
            </div>

            <div className="hm-auth-brand-sub">
              Personal Habit Analytics
            </div>
          </div>

        </div>

        {/* ===================================================
            MAIN PANEL
            =================================================== */}

        <div className="hm-auth-panel">

          {/* =================================================
              LEFT STORY
              ================================================= */}

          <section className="hm-auth-story">

            <div className="hm-story-content">

              <div className="hm-story-kicker">
                <span className="hm-welcome-dot" />

                Start your journey
              </div>

              <h1 className="hm-story-title">
                Create today.
                <br />

                <em>
                  Grow tomorrow.
                </em>
              </h1>

              <p className="hm-story-text">
                Create your personal
                HabitMile account and
                start turning consistent
                daily actions into measurable
                progress.
              </p>

            </div>

            {/* =============================================
                ANALYTICS CARD
                ============================================= */}

            <div className="hm-analytics">

              <div className="hm-analytics-header">

                <div>
                  <div className="hm-analytics-label">
                    Your year
                  </div>

                  <div className="hm-analytics-value">
                    365
                  </div>
                </div>

                <div className="hm-analytics-icon">
                  ✦
                </div>

              </div>

              <div className="hm-bars">

                <div
                  className="hm-bar"
                  style={{
                    height: "25%",
                  }}
                />

                <div
                  className="hm-bar"
                  style={{
                    height: "40%",
                  }}
                />

                <div
                  className="hm-bar"
                  style={{
                    height: "34%",
                  }}
                />

                <div
                  className="hm-bar"
                  style={{
                    height: "57%",
                  }}
                />

                <div
                  className="hm-bar"
                  style={{
                    height: "68%",
                  }}
                />

                <div
                  className="hm-bar"
                  style={{
                    height: "76%",
                  }}
                />

                <div
                  className="hm-bar"
                  style={{
                    height: "94%",
                  }}
                />

              </div>

            </div>

            {/* =============================================
                QUOTE
                ============================================= */}

            <div className="hm-quote">
              "Small steps become a
              lifestyle."
            </div>

          </section>

          {/* =================================================
              RIGHT FORM
              ================================================= */}

          <section className="hm-auth-form-area">

            <div className="hm-auth-heading-kicker">

              <span className="hm-auth-heading-line" />

              New beginning

            </div>

            <h2 className="hm-auth-title">
              Create
              <br />

              <span>
                your account.
              </span>
            </h2>

            <p className="hm-auth-description">
              Set up your personal space
              for habits, goals, and
              progress.
            </p>

            {/* =============================================
                ERROR
                ============================================= */}

            {error && (
              <div className="hm-auth-error">
                <span className="hm-error-icon">
                  !
                </span>

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* =============================================
                FORM
                ============================================= */}

            <form
              onSubmit={handleSubmit}
              className="hm-auth-form"
            >

              {/* NAME */}

              <div className="hm-field">

                <label
                  className="hm-label"
                  htmlFor="register-name"
                >
                  Full name
                </label>

                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                  minLength={2}
                  disabled={loading}
                  className="hm-input"
                />

              </div>

              {/* EMAIL */}

              <div className="hm-field">

                <label
                  className="hm-label"
                  htmlFor="register-email"
                >
                  Email address
                </label>

                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="hm-input"
                />

              </div>

              {/* PASSWORD */}

              <div className="hm-field">

                <label
                  className="hm-label"
                  htmlFor="register-password"
                >
                  Password
                </label>

                <div className="hm-password-wrapper">

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={loading}
                    className="hm-input"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    disabled={loading}
                    className="hm-show-button"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="hm-field">

                <label
                  className="hm-label"
                  htmlFor="register-confirm-password"
                >
                  Confirm password
                </label>

                <div className="hm-password-wrapper">

                  <input
                    id="register-confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    required
                    autoComplete="new-password"
                    disabled={loading}
                    className="hm-input"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    disabled={loading}
                    className="hm-show-button"
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* SECURITY ROW */}

              <div className="hm-form-options">

                <span>
                  Secure account creation
                </span>

                <div className="hm-secure">

                  <span className="hm-secure-dot" />

                  Protected

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="hm-auth-submit"
              >

                {loading ? (
                  <>
                    <span className="hm-spinner" />

                    Sending verification code...
                  </>
                ) : (
                  <>
                    Create account
                    <span>
                      →
                    </span>
                  </>
                )}

              </button>

            </form>

            {/* =============================================
                LOGIN LINK
                ============================================= */}

            <div className="hm-auth-footer">

              <span>
                Already have an account?
              </span>

              <Link
                to="/login"
                className="hm-auth-link"
              >
                Sign in
              </Link>

            </div>

            {/* =============================================
                SECURITY FOOTER
                ============================================= */}

            <div className="hm-auth-security">

              <span>
                Secure
              </span>

              <span>
                •
              </span>

              <span>
                Private
              </span>

              <span>
                •
              </span>

              <span>
                Protected
              </span>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}