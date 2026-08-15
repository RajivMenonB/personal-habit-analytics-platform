export default function StatCard({ title, value, change, icon }) {
  return (
    <div className="glass rounded-3xl p-6 hover:translate-y-[-4px] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-xl">
          {icon}
        </div>
        <span className="text-green-400 text-sm font-medium">{change}</span>
      </div>

      <div className="mt-5">
        <p className="text-gray-400 text-sm">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
      </div>
    </div>
  );
}