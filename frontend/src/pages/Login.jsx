import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  loginUser,
} from "../services/api";

import "./Login.css";
import "./AuthCopper.css";


export default function Login() {

  const navigate =
    useNavigate();


  const [
    formData,
    setFormData,
  ] = useState({
    email: "",
    password: "",
  });


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const handleChange =
    (e) => {

      setFormData({
        ...formData,
        [e.target.name]:
          e.target.value,
      });

      if (error) {
        setError("");
      }
    };


  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");


      if (
        !formData.email.trim()
        ||
        !formData.password
      ) {

        setError(
          "Please enter your email and password."
        );

        return;
      }


      setLoading(true);


      try {

        const data =
          await loginUser(
            {
              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              password:
                formData.password,
            }
          );


        if (!data?.token) {

          throw new Error(
            "Login token was not received."
          );
        }


        /*
         * loginUser already stores:
         * token
         * user
         */


        navigate(
          "/dashboard"
        );

      } catch (err) {

        setError(

          err?.response?.data?.message
          ||
          err?.message
          ||
          "Unable to sign in. Please check your credentials."
        );

      } finally {

        setLoading(false);
      }
    };


  return (
    <main className="login-page">

      <div className="login-glow login-glow-one" />

      <div className="login-glow login-glow-two" />

      <div className="login-glow login-glow-three" />

      <div className="login-orbit login-orbit-one" />

      <div className="login-orbit login-orbit-two" />


      <div className="login-layout">

        <section className="login-hero">

          <div className="hero-inner">

            <div className="hero-top">

              <div className="hero-brand">

                <span className="hero-brand-mark">
                  H
                </span>

                <span className="hero-brand-name">
                  HabitMile
                </span>

                <span className="hero-brand-number">
                  365
                </span>

              </div>

              <span className="hero-year">
                2026
              </span>

            </div>


            <div className="hero-main">

              <div className="hero-eyebrow">

                <span className="hero-line" />

                <span>
                  YOUR PERSONAL GROWTH SPACE
                </span>

              </div>


              <h1>
                Small habits.
                <br />
                <span>
                  Big goals.
                </span>
              </h1>


              <p className="hero-description">
                Turn everyday actions into meaningful
                progress. Build consistency, track what
                matters, and become the person you want
                to be.
              </p>


              <p className="hero-thought">
                Your future is shaped by what you
                repeatedly do today.
              </p>


              <div className="hero-features">

                <div className="hero-feature">

                  <span className="feature-icon">
                    ↗
                  </span>

                  <div>
                    <strong>
                      Track
                    </strong>

                    <span>
                      Your progress
                    </span>
                  </div>

                </div>


                <div className="hero-feature">

                  <span className="feature-icon">
                    ◇
                  </span>

                  <div>
                    <strong>
                      Achieve
                    </strong>

                    <span>
                      Your goals
                    </span>
                  </div>

                </div>


                <div className="hero-feature">

                  <span className="feature-icon">
                    +
                  </span>

                  <div>
                    <strong>
                      Build
                    </strong>

                    <span>
                      Better habits
                    </span>
                  </div>

                </div>

              </div>

            </div>


            <div className="hero-bottom">

              <div className="hero-progress">

                <span>
                  01
                </span>

                <div className="hero-progress-line">
                  <div />
                </div>

                <span>
                  365
                </span>

              </div>

              <span className="hero-bottom-text">
                ONE DAY AT A TIME
              </span>

            </div>


            <div className="hero-large-orbit">
              <span />
            </div>

          </div>

        </section>


        <section className="login-section">

          <div className="login-card">

            <div className="login-card-glow" />


            <div className="login-card-header">

              <div className="login-card-brand">

                <span className="login-mark">
                  H
                </span>

                <div>

                  <strong>
                    HabitMile
                  </strong>

                  <span>
                    365
                  </span>

                </div>

              </div>

              <span className="login-card-number">
                01 / 365
              </span>

            </div>


            <div className="login-heading">

              <span className="login-eyebrow">
                WELCOME BACK
              </span>

              <h2>
                Sign in to
                <br />
                <span>
                  HabitMile 365
                </span>
              </h2>

              <p>
                Continue your journey and keep
                building a better you.
              </p>

            </div>


            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              <div className="login-field">

                <label htmlFor="email">
                  EMAIL ADDRESS
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />

              </div>


              <div className="login-field">

                <label htmlFor="password">
                  PASSWORD
                </label>

                <div className="password-wrapper">

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        value => !value
                      )
                    }
                    disabled={loading}
                  >
                    {
                      showPassword
                        ? "HIDE"
                        : "SHOW"
                    }
                  </button>

                </div>

              </div>


              <div className="login-forgot">

                <Link to="/forgot-password">
                  Forgot password?
                </Link>

              </div>


              {error && (

                <div className="login-error">

                  <span>
                    !
                  </span>

                  <p>
                    {error}
                  </p>

                </div>

              )}


              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <span className="spinner" />

                    <span>
                      SIGNING IN...
                    </span>
                  </>

                ) : (

                  <>
                    <span>
                      SIGN IN
                    </span>

                    <span className="button-arrow">
                      →
                    </span>
                  </>

                )}

              </button>

            </form>


            <div className="create-account">

              <span>
                Don't have an account?
              </span>

              <Link to="/register">
                Create an account
              </Link>

            </div>


            <div className="login-card-footer">

              <div />

              <span>
                YOUR PACE · YOUR PROGRESS · YOUR YEAR
              </span>

              <div />

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}