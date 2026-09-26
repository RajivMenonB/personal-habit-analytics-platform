import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  verifyLoginOtp,
  resendOtp,
} from "../services/api";

import "./Otp.css";

export default function VerifyLoginOtp() {

  const navigate =
    useNavigate();

  const [
    email,
    setEmail
  ] = useState("");

  const [
    otp,
    setOtp
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    resendLoading,
    setResendLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    message,
    setMessage
  ] = useState("");

  const [
    countdown,
    setCountdown
  ] = useState(60);

  // =========================================================
  // LOAD EMAIL
  // =========================================================

  useEffect(() => {

    const savedEmail =
      sessionStorage.getItem(
        "loginOtpEmail"
      );

    if (!savedEmail) {

      navigate(
        "/login",
        { replace: true }
      );

      return;
    }

    setEmail(
      savedEmail
    );

  }, [navigate]);

  // =========================================================
  // COUNTDOWN
  // =========================================================

  useEffect(() => {

    if (countdown <= 0) {
      return;
    }

    const timer =
      setInterval(() => {

        setCountdown(
          (value) =>
            Math.max(
              0,
              value - 1
            )
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, [countdown]);

  // =========================================================
  // OTP INPUT
  // =========================================================

  const handleOtpChange =
    (event) => {

      const value =
        event.target.value
          .replace(/\D/g, "")
          .slice(0, 6);

      setOtp(value);
      setError("");
    };

  // =========================================================
  // VERIFY
  // =========================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setError("");
      setMessage("");

      if (otp.length !== 6) {

        setError(
          "Please enter the 6-digit OTP."
        );

        return;
      }

      setLoading(true);

      try {

        await verifyLoginOtp({
          email,
          otp,
        });

        sessionStorage.removeItem(
          "loginOtpEmail"
        );

        // Full reload is intentional.
        // It makes App.jsx run again with
        // the newly stored JWT, so the
        // existing FCM setup starts normally.

        window.location.replace(
          "/dashboard"
        );

      } catch (err) {

        setError(
          err.response?.data?.message ||
          err.message ||
          "Invalid OTP."
        );

      } finally {

        setLoading(false);
      }
    };

  // =========================================================
  // RESEND
  // =========================================================

  const handleResend =
    async () => {

      if (countdown > 0) {
        return;
      }

      setError("");
      setMessage("");
      setResendLoading(true);

      try {

        const data =
          await resendOtp(
            email,
            "LOGIN"
          );

        setMessage(
          data.message ||
          "A new OTP has been sent."
        );

        setCountdown(60);

        setOtp("");

      } catch (err) {

        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to resend OTP."
        );

      } finally {

        setResendLoading(false);
      }
    };

  return (
    <main className="otp-page">

      <div className="otp-glow otp-glow-one" />
      <div className="otp-glow otp-glow-two" />

      <div className="otp-card">

        <div className="otp-brand">
          <span className="otp-logo">
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


        <div className="otp-heading">

          <span className="otp-eyebrow">
            EMAIL VERIFICATION
          </span>

          <h1>
            Verify your
            <br />
            <span>
              login
            </span>
          </h1>

          <p>
            We sent a 6-digit verification
            code to:
          </p>

          <strong className="otp-email">
            {email}
          </strong>

        </div>


        <form
          className="otp-form"
          onSubmit={
            handleSubmit
          }
        >

          <label htmlFor="otp">
            VERIFICATION CODE
          </label>

          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={
              handleOtpChange
            }
            placeholder="000000"
            maxLength={6}
            disabled={loading}
            autoFocus
          />


          {error && (
            <div className="otp-error">
              {error}
            </div>
          )}


          {message && (
            <div className="otp-success">
              {message}
            </div>
          )}


          <button
            type="submit"
            className="otp-button"
            disabled={
              loading ||
              otp.length !== 6
            }
          >
            {loading
              ? "VERIFYING..."
              : "VERIFY OTP"}
          </button>

        </form>


        <div className="otp-resend">

          {countdown > 0 ? (

            <span>
              Resend OTP in{" "}
              <strong>
                {countdown}s
              </strong>
            </span>

          ) : (

            <button
              type="button"
              onClick={
                handleResend
              }
              disabled={
                resendLoading
              }
            >
              {resendLoading
                ? "SENDING..."
                : "RESEND OTP"}
            </button>

          )}

        </div>


        <Link
          className="otp-back"
          to="/login"
          onClick={() =>
            sessionStorage.removeItem(
              "loginOtpEmail"
            )
          }
        >
          ← Back to login
        </Link>

      </div>

    </main>
  );
}