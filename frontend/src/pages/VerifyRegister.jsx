import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  verifyRegisterOtp,
  resendOtp,
} from "../services/api";

export default function VerifyRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(
    () => searchParams.get("email") || ""
  );

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

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

  const handleOtpChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
    clearMessages();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      await verifyRegisterOtp(email, otp);

      setMessage(
        "Email verified successfully. Your account has been created."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            email,
            registered: true,
          },
        });
      }, 1000);
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
      await resendOtp(email, "REGISTER");

      setOtp("");
      setCountdown(60);

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

  return (
    <div className="verify-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .verify-page {
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
              circle at 85% 85%,
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

        .verify-shell {
          width: 100%;
          max-width: 430px;
        }

        .verify-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          margin-bottom: 22px;
        }

        .verify-brand-mark {
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

        .verify-brand-copy {
          text-align: left;
        }

        .verify-brand-name {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          font-weight: 700;
          line-height: 1;
          color: #f1ece6;
        }

        .verify-brand-subtitle {
          margin-top: 4px;
          color: #777873;
          font-size: 7px;
          letter-spacing: 0.20em;
          text-transform: uppercase;
        }

        .verify-card {
          position: relative;
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

        .verify-card::before {
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

        .verify-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(192, 125, 76, 0.28);
          background: rgba(192, 125, 76, 0.08);
          color: #d29a6d;
          font-size: 24px;
        }

        .verify-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-bottom: 15px;
          color: #c07d4c;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .verify-line {
          width: 22px;
          height: 1px;
          background: #c07d4c;
        }

        .verify-title {
          margin: 0;
          text-align: center;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 40px;
          line-height: 1;
          letter-spacing: -0.04em;
          color: #f1ece6;
        }

        .verify-title-accent {
          display: block;
          margin-top: 4px;
          color: #d29a6d;
          font-style: italic;
          font-weight: 500;
        }

        .verify-description {
          max-width: 300px;
          margin: 16px auto 25px;
          text-align: center;
          color: #858781;
          font-size: 12px;
          line-height: 1.7;
        }

        .verify-email {
          display: block;
          margin-top: 5px;
          color: #d29a6d;
          font-weight: 600;
        }

        .verify-form {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .verify-label {
          display: block;
          margin-bottom: 8px;
          color: #9a9b96;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .verify-otp {
          width: 100%;
          height: 64px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 12px;
          outline: none;
          text-align: center;
          letter-spacing: 0.48em;
          padding-left: 0.48em;
          background: rgba(255, 255, 255, 0.045);
          color: #f0e8df;
          font-size: 26px;
          font-weight: 700;
          transition: 180ms ease;
        }

        .verify-otp::placeholder {
          color: #555753;
        }

        .verify-otp:focus {
          border-color: rgba(192, 125, 76, 0.65);
          box-shadow:
            0 0 0 3px rgba(192, 125, 76, 0.08);
        }

        .verify-button {
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

        .verify-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 14px 34px rgba(169, 99, 58, 0.30);
        }

        .verify-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .verify-message,
        .verify-error {
          margin-bottom: 15px;
          padding: 11px 12px;
          border-radius: 9px;
          font-size: 11px;
          line-height: 1.5;
        }

        .verify-message {
          border: 1px solid rgba(192, 125, 76, 0.20);
          background: rgba(192, 125, 76, 0.07);
          color: #d9b08e;
        }

        .verify-error {
          border: 1px solid rgba(190, 85, 65, 0.28);
          background: rgba(190, 85, 65, 0.07);
          color: #df9b8d;
        }

        .verify-resend {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          color: #696b67;
          font-size: 10px;
        }

        .verify-resend button {
          border: 0;
          padding: 0;
          background: transparent;
          color: #c07d4c;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
        }

        .verify-resend button:disabled {
          color: #555753;
          cursor: not-allowed;
        }

        .verify-back {
          display: block;
          margin: 3px auto 0;
          color: #777873;
          font-size: 10px;
          text-decoration: none;
        }

        .verify-back:hover {
          color: #d29a6d;
        }

        @media (max-width: 520px) {
          .verify-page {
            padding: 22px 14px;
            align-items: flex-start;
          }

          .verify-shell {
            margin-top: 24px;
          }

          .verify-card {
            padding: 29px 22px 24px;
            border-radius: 18px;
          }

          .verify-card::before {
            left: 22px;
            right: 22px;
          }

          .verify-title {
            font-size: 36px;
          }
        }
      `}</style>

      <div className="verify-shell">
        <div className="verify-brand">
          <div className="verify-brand-mark">H</div>

          <div className="verify-brand-copy">
            <div className="verify-brand-name">
              HabitMile 365
            </div>

            <div className="verify-brand-subtitle">
              Personal Habit Analytics
            </div>
          </div>
        </div>

        <div className="verify-card">
          <div className="verify-icon">✉</div>

          <div className="verify-eyebrow">
            <span className="verify-line" />
            Verify Account
            <span className="verify-line" />
          </div>

          <h1 className="verify-title">
            Verify
            <span className="verify-title-accent">
              your email.
            </span>
          </h1>

          <p className="verify-description">
            We sent a 6-digit verification code to
            <span className="verify-email">
              {maskedEmail()}
            </span>
          </p>

          {error && (
            <div className="verify-error">
              {error}
            </div>
          )}

          {message && (
            <div className="verify-message">
              {message}
            </div>
          )}

          <form
            className="verify-form"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="verify-label">
                Verification Code
              </label>

              <input
                className="verify-otp"
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
              className="verify-button"
              type="submit"
              disabled={loading || otp.length !== 6}
            >
              {loading
                ? "VERIFYING..."
                : "VERIFY & CREATE ACCOUNT"}
            </button>

            <div className="verify-resend">
              <span>Didn't receive the code?</span>

              <button
                type="button"
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

            <Link
              className="verify-back"
              to="/register"
            >
              ← Back to registration
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}