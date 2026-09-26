import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendOtp,
} from "../services/api";

const COPPER = "#c07d4c";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");

  const [email, setEmail] = useState(
    () => sessionStorage.getItem("resetEmail") || ""
  );

  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          clearInterval(timer);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(cleanEmail);

      sessionStorage.setItem("resetEmail", cleanEmail);

      setEmail(cleanEmail);
      setStep("otp");
      setCountdown(60);

      setMessage(
        response?.message ||
          "A verification code has been sent to your email."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Unable to send the verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setOtp(value);
    clearMessages();
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyResetOtp(email, otp);

      const token =
        response?.resetToken ||
        response?.token ||
        response?.data?.resetToken ||
        response?.data?.token;

      if (!token) {
        throw new Error("Reset token was not returned by the server.");
      }

      setResetToken(token);
      setStep("password");
      setMessage("Code verified. Create your new password.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    clearMessages();
    setResending(true);

    try {
      await resendOtp(email, "RESET_PASSWORD");

      setCountdown(60);
      setOtp("");

      setMessage("A new verification code has been sent.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Unable to resend the code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email,
        resetToken,
        newPassword,
      });

      sessionStorage.removeItem("resetEmail");

      setMessage("Password changed successfully. Redirecting to sign in...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Unable to reset your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    clearMessages();
    setOtp("");
    setStep("email");
  };

  const maskedEmail = () => {
    if (!email || !email.includes("@")) return email;

    const [name, domain] = email.split("@");

    if (name.length <= 2) {
      return `${name[0] || ""}***@${domain}`;
    }

    return `${name.slice(0, 2)}${"*".repeat(
      Math.min(Math.max(name.length - 2, 3), 6)
    )}@${domain}`;
  };

  return (
    <div className="auth-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .auth-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background:
            radial-gradient(
              circle at 50% 20%,
              rgba(192, 125, 76, 0.10),
              transparent 34%
            ),
            radial-gradient(
              circle at 15% 85%,
              rgba(192, 125, 76, 0.06),
              transparent 30%
            ),
            #08090b;
          color: #eee9e2;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .auth-shell {
          width: 100%;
          max-width: 430px;
        }

        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          margin-bottom: 22px;
        }

        .brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            145deg,
            #d29a6d,
            #a9633a
          );
          color: #120d09;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 21px;
          font-weight: 700;
          box-shadow:
            0 8px 24px rgba(192, 125, 76, 0.20);
        }

        .brand-copy {
          text-align: left;
        }

        .brand-name {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          font-weight: 700;
          line-height: 1;
          color: #f1ece6;
        }

        .brand-subtitle {
          margin-top: 4px;
          color: #777873;
          font-size: 7px;
          letter-spacing: 0.20em;
          text-transform: uppercase;
        }

        .auth-card {
          position: relative;
          width: 100%;
          padding: 34px 34px 28px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.045),
              rgba(255, 255, 255, 0.018)
            ),
            rgba(10, 11, 13, 0.94);
          box-shadow:
            0 28px 80px rgba(0, 0, 0, 0.48),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);
          backdrop-filter: blur(18px);
        }

        .auth-card::before {
          content: "";
          position: absolute;
          left: 34px;
          right: 34px;
          top: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(192, 125, 76, 0.65),
            transparent
          );
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 16px;
          color: #c07d4c;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .eyebrow-line {
          width: 24px;
          height: 1px;
          background: #c07d4c;
        }

        .title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 42px;
          line-height: 0.98;
          letter-spacing: -0.04em;
          font-weight: 700;
          color: #f1ece6;
        }

        .title-accent {
          display: block;
          margin-top: 4px;
          color: #d29a6d;
          font-style: italic;
          font-weight: 500;
        }

        .description {
          margin: 16px 0 25px;
          color: #858781;
          font-size: 12px;
          line-height: 1.7;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .field-label {
          display: block;
          margin-bottom: 8px;
          color: #9a9b96;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .input {
          width: 100%;
          height: 48px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 10px;
          outline: none;
          padding: 0 14px;
          background: rgba(255, 255, 255, 0.045);
          color: #eee9e2;
          font-size: 13px;
          transition: 180ms ease;
        }

        .input::placeholder {
          color: #5e605d;
        }

        .input:focus {
          border-color: rgba(192, 125, 76, 0.65);
          background: rgba(192, 125, 76, 0.045);
          box-shadow: 0 0 0 3px rgba(192, 125, 76, 0.08);
        }

        .primary-button {
          width: 100%;
          height: 48px;
          border: 0;
          border-radius: 10px;
          cursor: pointer;
          background: linear-gradient(
            135deg,
            #c07d4c,
            #a9633a
          );
          color: #160f0b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.13em;
          transition: 180ms ease;
          box-shadow:
            0 10px 28px rgba(169, 99, 58, 0.20);
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 14px 34px rgba(169, 99, 58, 0.30);
        }

        .primary-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .secondary-link {
          display: block;
          text-align: center;
          color: #777873;
          font-size: 11px;
          text-decoration: none;
          transition: 150ms ease;
        }

        .secondary-link:hover {
          color: #d29a6d;
        }

        .message,
        .error {
          padding: 11px 12px;
          border-radius: 9px;
          font-size: 11px;
          line-height: 1.5;
        }

        .message {
          border: 1px solid rgba(192, 125, 76, 0.20);
          background: rgba(192, 125, 76, 0.07);
          color: #d9b08e;
        }

        .error {
          border: 1px solid rgba(190, 85, 65, 0.28);
          background: rgba(190, 85, 65, 0.07);
          color: #df9b8d;
        }

        .otp-area {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .verification-icon {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 17px;
          border: 1px solid rgba(192, 125, 76, 0.28);
          background: rgba(192, 125, 76, 0.08);
          color: #d29a6d;
          font-size: 23px;
        }

        .otp-description {
          text-align: center;
          margin: 0 auto 23px;
          max-width: 290px;
          color: #858781;
          font-size: 12px;
          line-height: 1.7;
        }

        .masked-email {
          display: block;
          margin-top: 5px;
          color: #d29a6d;
          font-weight: 600;
        }

        .otp-input {
          width: 100%;
          height: 62px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 12px;
          outline: none;
          text-align: center;
          letter-spacing: 0.48em;
          padding-left: 0.48em;
          background: rgba(255, 255, 255, 0.045);
          color: #f0e8df;
          font-size: 25px;
          font-weight: 700;
          transition: 180ms ease;
        }

        .otp-input:focus {
          border-color: rgba(192, 125, 76, 0.65);
          box-shadow: 0 0 0 3px rgba(192, 125, 76, 0.08);
        }

        .resend-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          color: #696b67;
          font-size: 10px;
        }

        .resend-button {
          border: 0;
          padding: 0;
          background: transparent;
          color: #c07d4c;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
        }

        .resend-button:disabled {
          color: #555753;
          cursor: not-allowed;
        }

        .back-button {
          border: 0;
          padding: 0;
          background: transparent;
          color: #777873;
          cursor: pointer;
          font-size: 10px;
        }

        .back-button:hover {
          color: #d29a6d;
        }

        .password-strength {
          margin-top: 7px;
          color: #696b67;
          font-size: 9px;
        }

        @media (max-width: 520px) {
          .auth-page {
            padding: 22px 14px;
            align-items: flex-start;
          }

          .auth-shell {
            margin-top: 24px;
          }

          .auth-card {
            padding: 29px 22px 24px;
            border-radius: 18px;
          }

          .auth-card::before {
            left: 22px;
            right: 22px;
          }

          .title {
            font-size: 36px;
          }
        }
      `}</style>

      <div className="auth-shell">
        <div className="brand">
          <div className="brand-mark">H</div>

          <div className="brand-copy">
            <div className="brand-name">HabitMile 365</div>
            <div className="brand-subtitle">
              Personal Habit Analytics
            </div>
          </div>
        </div>

        <div className="auth-card">
          {step === "email" && (
            <>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                Account Recovery
              </div>

              <h1 className="title">
                Reset
                <span className="title-accent">your password.</span>
              </h1>

              <p className="description">
                Enter your registered email address and we'll send
                you a secure verification code.
              </p>

              {error && <div className="error">{error}</div>}
              {message && <div className="message">{message}</div>}

              <form className="form" onSubmit={handleEmailSubmit}>
                <div>
                  <label className="field-label">
                    Email Address
                  </label>

                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearMessages();
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "SENDING..." : "SEND VERIFICATION CODE"}
                </button>

                <Link className="secondary-link" to="/login">
                  Back to sign in
                </Link>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="otp-area">
                <div className="verification-icon">✉</div>

                <div className="eyebrow">
                  <span className="eyebrow-line" />
                  Verify Email
                  <span className="eyebrow-line" />
                </div>

                <h1 className="title" style={{ textAlign: "center" }}>
                  Enter
                  <span className="title-accent">
                    your code.
                  </span>
                </h1>

                <p className="otp-description">
                  We sent a 6-digit verification code to
                  <span className="masked-email">
                    {maskedEmail()}
                  </span>
                </p>
              </div>

              {error && <div className="error">{error}</div>}
              {message && <div className="message">{message}</div>}

              <form
                className="form"
                onSubmit={handleOtpSubmit}
              >
                <div>
                  <label className="field-label">
                    Verification Code
                  </label>

                  <input
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="••••••"
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "VERIFYING..." : "VERIFY CODE"}
                </button>

                <div className="resend-row">
                  <span>
                    Didn't receive the code?
                  </span>

                  <button
                    type="button"
                    className="resend-button"
                    onClick={handleResend}
                    disabled={countdown > 0 || resending}
                  >
                    {resending
                      ? "Sending..."
                      : countdown > 0
                      ? `Resend in ${countdown}s`
                      : "Resend code"}
                  </button>
                </div>

                <button
                  type="button"
                  className="back-button"
                  onClick={handleBackToEmail}
                >
                  ← Change email
                </button>
              </form>
            </>
          )}

          {step === "password" && (
            <>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                New Password
              </div>

              <h1 className="title">
                Create
                <span className="title-accent">
                  a new password.
                </span>
              </h1>

              <p className="description">
                Your email has been verified. Choose a new
                password for your HabitMile 365 account.
              </p>

              {error && <div className="error">{error}</div>}
              {message && <div className="message">{message}</div>}

              <form
                className="form"
                onSubmit={handlePasswordSubmit}
              >
                <div>
                  <label className="field-label">
                    New Password
                  </label>

                  <input
                    className="input"
                    type="password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      clearMessages();
                    }}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <div className="password-strength">
                    Minimum 8 characters
                  </div>
                </div>

                <div>
                  <label className="field-label">
                    Confirm Password
                  </label>

                  <input
                    className="input"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      clearMessages();
                    }}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}