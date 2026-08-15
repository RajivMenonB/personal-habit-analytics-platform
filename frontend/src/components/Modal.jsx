export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0f1117] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">{title}</h2>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-white">{children}</div>
      </div>
    </div>
  );
}