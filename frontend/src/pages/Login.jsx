import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData);

      // Check token
      if (!data.token) {
        setError("Invalid login response from server");
        return;
      }

      // Save JWT
      localStorage.setItem("token", data.token);

      // Save logged-in user info
      const user = {
        name:
          data.name ||
          data.user?.name ||
          formData.email.split("@")[0],
        email:
          data.email ||
          data.user?.email ||
          formData.email,
      };

      localStorage.setItem("user", JSON.stringify(user));

      // Redirect
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070c] relative overflow-hidden flex items-center justify-center p-6 text-white">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-3xl rounded-full -top-40 -left-40 animate-pulse"></div>
      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full -bottom-40 -right-40 animate-pulse"></div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-3xl font-black text-black shadow-2xl">
            L
          </div>

          <h1 className="text-4xl font-black mt-5 gradient-text">
            LifeOS 365
          </h1>

          <p className="text-gray-400 mt-2">
            Your intelligent productivity companion
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-[32px] p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-gray-400 mt-1">
              Sign in to continue your journey
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-300">
                Email address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rajiv@example.com"
                required
                autoComplete="email"
                className="w-full mt-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-300">
                  Password
                </label>

                <button
                  type="button"
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Forgot?
                </button>
              </div>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full mt-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Remember */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-white/5 border-white/20"
              />

              <span className="text-sm text-gray-400">
                Remember me
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold text-lg hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-sm text-gray-400">or</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-4">
            <button className="py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              Google
            </button>

            <button className="py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              GitHub
            </button>
          </div>

          {/* Register */}
          <p className="text-center text-gray-400 mt-8">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Secure • Private • Encrypted
        </p>
      </div>
    </div>
  );
}