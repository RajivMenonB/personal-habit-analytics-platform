export default function Toast({ show, message, type = "success" }) {
  if (!show) return null;

  const bg =
    type === "success"
      ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
      : type === "error"
      ? "bg-red-500/20 border-red-400/30 text-red-300"
      : "bg-cyan-500/20 border-cyan-400/30 text-cyan-300";

  return (
    <div className="fixed top-5 right-5 z-[60]">
      <div
        className={`px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${bg}`}
      >
        {message}
      </div>
    </div>
  );
}