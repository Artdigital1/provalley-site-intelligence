export default function StatCard({ label, value, change, icon, iconBg, lowerIsBetter = false, suffix = '' }) {
  const improved = lowerIsBetter ? change < 0 : change > 0
  const absChange = Math.abs(change).toFixed(1)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-colors duration-150">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center text-xl flex-shrink-0`}>
          {icon}
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          improved
            ? 'text-emerald-400 bg-emerald-400/10'
            : 'text-red-400 bg-red-400/10'
        }`}>
          {improved ? '↑' : '↓'} {absChange}%
        </span>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-100 leading-none">
          {typeof value === 'number' ? value + suffix : value}
        </div>
        <div className="text-sm text-slate-500 mt-1.5">{label}</div>
        <div className="text-xs text-slate-700 mt-1">vs. last 30 days</div>
      </div>
    </div>
  )
}
