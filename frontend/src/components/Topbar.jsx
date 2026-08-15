import { useNavigate } from "react-router-dom";

export default function Topbar({ title, user }) {
  const navigate = useNavigate();

  const userName = user?.name || "User";
  const initial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="glass rounded-3xl px-6 py-4 flex items-center justify-between gap-4">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-gray-400 mt-1">
          Stay consistent. Build your future.
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
          🔔
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 glass rounded-2xl px-3 py-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-black">
            {initial}
          </div>

          <div className="hidden sm:block">
            <p className="font-semibold">{userName}</p>
            <p className="text-xs text-gray-400">
              {user?.email || "Productivity Builder"}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}