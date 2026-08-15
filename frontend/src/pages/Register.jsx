import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

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
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070c] relative overflow-hidden flex items-center justify-center p-6 text-white">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-3xl rounded-full -top-40 -right-40 animate-pulse"></div>
      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full -bottom-40 -left-40 animate-pulse"></div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-3xl font-black text-black shadow-2xl">
            ✨
          </div>

          <h1 className="text-4xl font-black mt-5 gradient-text">
            Join LifeOS 365
          </h1>

          <p className="text-gray-400 mt-2">
            Build habits. Achieve goals. Track progress.
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-[32px] p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Create account</h2>
            <p className="text-gray-400 mt-1">
              Start your productivity transformation
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm text-gray-300">Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Rajiv Menon"
                required
                className="w-full mt-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-300">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rajiv@example.com"
                required
                className="w-full mt-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                className="w-full mt-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-gray-300">
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                required
                className="w-full mt-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 rounded bg-white/5 border-white/20"
              />
              <span className="text-sm text-gray-400">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold text-lg hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-400 mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Secure registration • End-to-end encrypted
        </p>
      </div>
    </div>
  );
}