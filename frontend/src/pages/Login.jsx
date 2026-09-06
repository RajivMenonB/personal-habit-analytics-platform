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
  const [showPassword, setShowPassword] = useState(false);

  // ======================================================
  // HANDLE INPUT
  // ======================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  // ======================================================
  // LOGIN
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData);

      if (!data.token) {
        setError("Invalid login response from server");
        return;
      }

      // Save JWT
      localStorage.setItem("token", data.token);

      // Save user information
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

      // Redirect to dashboard
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
    <div className="min-h-screen bg-[#05070b] text-white overflow-hidden relative">

      {/* ==================================================
          BACKGROUND
          ================================================== */}

      <div className="absolute inset-0 pointer-events-none">

        {/* Cyan glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.06] blur-[130px]" />

        {/* Purple glow */}
        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-purple-600/[0.07] blur-[140px]" />

        {/* Blue center glow */}
        <div className="absolute top-[45%] left-[48%] w-[300px] h-[300px] rounded-full bg-blue-500/[0.025] blur-[120px]" />

        {/* Decorative dots */}

        <span className="absolute top-[18%] left-[8%] w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />

        <span className="absolute top-[30%] left-[42%] w-1 h-1 rounded-full bg-white/30" />

        <span className="absolute top-[22%] right-[24%] w-1 h-1 rounded-full bg-blue-400" />

        <span className="absolute bottom-[25%] right-[9%] w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.7)]" />

        <span className="absolute bottom-[18%] left-[15%] w-1 h-1 rounded-full bg-cyan-400" />

        {/* Decorative lines */}

        <div className="absolute top-[28%] left-[7%] w-24 h-px bg-gradient-to-r from-cyan-400/40 to-transparent rotate-[-25deg]" />

        <div className="absolute bottom-[28%] right-[7%] w-28 h-px bg-gradient-to-r from-transparent to-purple-400/30 rotate-[-25deg]" />

      </div>


      {/* ==================================================
          NAVBAR
          ================================================== */}

      <header className="relative z-20 px-6 sm:px-10 lg:px-14 py-5">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* BRAND */}

          <Link
            to="/login"
            className="flex items-center gap-3"
          >

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.18)]">

              <span className="text-black font-black text-lg">
                H
              </span>

            </div>

            <div>

              <h1 className="text-base font-black tracking-tight">
                HabitMile{" "}
                <span className="text-cyan-400">
                  365
                </span>
              </h1>

              <p className="text-[7px] text-gray-600 tracking-[0.22em]">
                PERSONAL HABIT ANALYTICS
              </p>

            </div>

          </Link>


          {/* NAVIGATION */}

          <nav className="hidden md:flex items-center gap-8">

            <a
              href="#home"
              className="relative text-xs text-white"
            >
              Home

              <span className="absolute -bottom-2 left-0 right-0 mx-auto w-5 h-px bg-cyan-400" />
            </a>

            <a
              href="#features"
              className="text-xs text-gray-500 hover:text-white transition"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-xs text-gray-500 hover:text-white transition"
            >
              About
            </a>

            <Link
              to="/register"
              className="group px-4 py-2 rounded-full border border-white/10 bg-white/[0.025] text-xs text-gray-400 hover:text-white hover:border-cyan-400/30 transition"
            >

              Create account

              <span className="ml-2 text-cyan-400 group-hover:translate-x-1 inline-block transition">
                →
              </span>

            </Link>

          </nav>

        </div>

      </header>


      {/* ==================================================
          MAIN CONTENT
          ================================================== */}

      <main
        id="home"
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14"
      >

        <div className="min-h-[calc(100vh-105px)] flex items-center">

          <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1fr_390px] gap-16 xl:gap-24 items-center">


            {/* ==================================================
                LEFT SIDE — BIG THOUGHT
                ================================================== */}

            <section className="max-w-2xl">

              {/* SMALL BADGE */}

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.035] mb-7">

                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

                <span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300">
                  Your growth starts here
                </span>

              </div>


              {/* ==================================================
                  BIG THOUGHT
                  ================================================== */}

              <h2 className="font-black tracking-[-0.06em] leading-[0.9] text-[58px] sm:text-[70px] md:text-[82px] lg:text-[78px] xl:text-[92px]">

                Build habits.

                <br />

                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Achieve goals.
                </span>

              </h2>


              {/* DESCRIPTION */}

              <p className="mt-7 max-w-xl text-sm sm:text-[15px] leading-7 text-gray-500">

                Turn everyday actions into meaningful progress.
                Track your habits, manage your goals, and build
                a better version of yourself — one day at a time.

              </p>


              {/* ==================================================
                  ACTION BUTTONS
                  ================================================== */}

              <div className="flex flex-wrap gap-3 mt-7">

                <button
                  onClick={() =>
                    document
                      .getElementById("login-card")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="group px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white text-xs font-bold shadow-[0_12px_30px_rgba(59,130,246,0.18)] hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(59,130,246,0.3)] transition-all"
                >

                  Start your journey

                  <span className="ml-2 group-hover:translate-x-1 inline-block transition">
                    →
                  </span>

                </button>


                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl border border-white/10 bg-white/[0.025] text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition"
                >
                  Create account
                </Link>

              </div>


              {/* ==================================================
                  MINI STATS
                  ================================================== */}

              <div className="mt-10 pt-6 border-t border-white/[0.07] max-w-lg">

                <div className="flex items-center">

                  <div className="pr-7">

                    <p className="text-2xl font-black text-cyan-400">
                      365
                    </p>

                    <p className="text-[8px] uppercase tracking-[0.18em] text-gray-600 mt-1">
                      Days of growth
                    </p>

                  </div>


                  <div className="h-9 w-px bg-white/10" />


                  <div className="px-7">

                    <p className="text-2xl font-black text-purple-400">
                      ∞
                    </p>

                    <p className="text-[8px] uppercase tracking-[0.18em] text-gray-600 mt-1">
                      Possibilities
                    </p>

                  </div>


                  <div className="h-9 w-px bg-white/10" />


                  <div className="pl-7">

                    <p className="text-2xl font-black text-blue-400">
                      1%
                    </p>

                    <p className="text-[8px] uppercase tracking-[0.18em] text-gray-600 mt-1">
                      Better every day
                    </p>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  FEATURES
                  ================================================== */}

              <div
                id="features"
                className="flex flex-wrap gap-6 mt-7"
              >

                <div className="flex items-center gap-2">

                  <span className="w-5 h-5 rounded-md bg-cyan-400/[0.07] border border-cyan-400/10 flex items-center justify-center text-[9px] text-cyan-400">
                    ✓
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Smart tracking
                  </span>

                </div>


                <div className="flex items-center gap-2">

                  <span className="w-5 h-5 rounded-md bg-purple-400/[0.07] border border-purple-400/10 flex items-center justify-center text-[9px] text-purple-400">
                    ◆
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Goal management
                  </span>

                </div>


                <div className="flex items-center gap-2">

                  <span className="w-5 h-5 rounded-md bg-blue-400/[0.07] border border-blue-400/10 flex items-center justify-center text-[9px] text-blue-400">
                    ↗
                  </span>

                  <span className="text-[9px] text-gray-600">
                    Progress analytics
                  </span>

                </div>

              </div>

            </section>


            {/* ==================================================
                RIGHT SIDE — LOGIN
                ================================================== */}

            <section
              id="login-card"
              className="relative w-full max-w-[390px] mx-auto"
            >

              {/* CARD GLOW */}

              <div className="absolute -inset-10 bg-gradient-to-br from-cyan-400/[0.08] via-blue-500/[0.02] to-purple-500/[0.08] blur-3xl rounded-full" />


              {/* ==================================================
                  GLASS CARD
                  ================================================== */}

              <div className="relative rounded-[28px] border border-white/[0.14] bg-white/[0.045] backdrop-blur-[28px] shadow-[0_35px_100px_rgba(0,0,0,0.65)] overflow-hidden">

                {/* Top glass shine */}

                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                {/* Cyan accent */}

                <div className="absolute top-0 left-16 right-16 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />


                <div className="p-7 sm:p-8">


                  {/* ==================================================
                      LOGIN HEADER
                      ================================================== */}

                  <div className="flex items-start justify-between mb-7">

                    <div>

                      <p className="text-[9px] uppercase tracking-[0.25em] font-semibold text-cyan-400">
                        Welcome back
                      </p>

                      <h3 className="text-[30px] font-black tracking-tight mt-1">
                        Sign in
                      </h3>

                      <p className="text-[11px] text-gray-500 mt-2">
                        Continue building your best self.
                      </p>

                    </div>


                    <div className="w-10 h-10 rounded-xl border border-white/10 bg-gradient-to-br from-cyan-400/[0.08] to-purple-500/[0.12] flex items-center justify-center">

                      <span className="text-lg text-white">
                        ✦
                      </span>

                    </div>

                  </div>


                  {/* ==================================================
                      ERROR
                      ================================================== */}

                  {error && (

                    <div className="mb-5 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.06]">

                      <p className="text-[10px] font-semibold text-red-300">
                        Unable to sign in
                      </p>

                      <p className="text-[9px] text-red-400/70 mt-1">
                        {error}
                      </p>

                    </div>

                  )}


                  {/* ==================================================
                      FORM
                      ================================================== */}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >

                    {/* EMAIL */}

                    <div>

                      <label className="block text-[9px] uppercase tracking-[0.15em] font-semibold text-gray-500 mb-2">
                        Email address
                      </label>

                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                          @
                        </span>

                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          required
                          autoComplete="email"
                          className="w-full h-12 pl-11 pr-4 rounded-xl bg-black/[0.18] border border-white/[0.09] text-xs text-white placeholder:text-gray-700 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/10 transition-all"
                        />

                      </div>

                    </div>


                    {/* PASSWORD */}

                    <div>

                      <div className="flex items-center justify-between mb-2">

                        <label className="text-[9px] uppercase tracking-[0.15em] font-semibold text-gray-500">
                          Password
                        </label>

                        <button
                          type="button"
                          className="text-[9px] text-gray-600 hover:text-cyan-400 transition"
                        >
                          Forgot password?
                        </button>

                      </div>


                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[8px] text-gray-600">
                          ●
                        </span>

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          required
                          autoComplete="current-password"
                          className="w-full h-12 pl-11 pr-16 rounded-xl bg-black/[0.18] border border-white/[0.09] text-xs text-white placeholder:text-gray-700 outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/10 transition-all"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-wider font-bold text-gray-600 hover:text-white transition"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>

                      </div>

                    </div>


                    {/* ==================================================
                        OPTIONS
                        ================================================== */}

                    <div className="flex items-center justify-between">

                      <label className="flex items-center gap-2 cursor-pointer">

                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 accent-cyan-400 cursor-pointer"
                        />

                        <span className="text-[9px] text-gray-600">
                          Remember me
                        </span>

                      </label>


                      <div className="flex items-center gap-1.5">

                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_7px_rgba(74,222,128,0.7)]" />

                        <span className="text-[8px] uppercase tracking-wider text-gray-600">
                          JWT secured
                        </span>

                      </div>

                    </div>


                    {/* ==================================================
                        LOGIN BUTTON
                        ================================================== */}

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full h-12 rounded-xl overflow-hidden bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white text-xs font-bold shadow-[0_12px_35px_rgba(59,130,246,0.2)] hover:shadow-[0_15px_45px_rgba(59,130,246,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >

                      {/* Button shine */}

                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />


                      <span className="relative flex items-center justify-center gap-2">

                        {loading ? (

                          <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />

                            Signing in...
                          </>

                        ) : (

                          <>
                            Sign in to HabitMile

                            <span className="text-base group-hover:translate-x-1 transition-transform">
                              →
                            </span>
                          </>

                        )}

                      </span>

                    </button>

                  </form>


                  {/* ==================================================
                      REGISTER
                      ================================================== */}

                  <div className="mt-6 pt-5 border-t border-white/[0.07]">

                    <p className="text-center text-[10px] text-gray-600">

                      New to HabitMile 365?

                      <Link
                        to="/register"
                        className="ml-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition"
                      >
                        Create an account
                      </Link>

                    </p>

                  </div>


                  {/* SECURITY */}

                  <div className="flex justify-center items-center gap-2 mt-4">

                    <span className="text-[7px] uppercase tracking-[0.2em] text-gray-700">
                      🔒 Secure
                    </span>

                    <span className="text-gray-800">
                      •
                    </span>

                    <span className="text-[7px] uppercase tracking-[0.2em] text-gray-700">
                      Private
                    </span>

                    <span className="text-gray-800">
                      •
                    </span>

                    <span className="text-[7px] uppercase tracking-[0.2em] text-gray-700">
                      Protected
                    </span>

                  </div>

                </div>

              </div>

            </section>

          </div>

        </div>

      </main>


      {/* ==================================================
          FOOTER
          ================================================== */}

      <footer className="relative z-10 pb-4 text-center">

        <p className="text-[8px] text-gray-700 tracking-wide">
          HabitMile 365 • Small steps. Consistent progress.
        </p>

      </footer>

    </div>
  );
}