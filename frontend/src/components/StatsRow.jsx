function StatCard({ value, label, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
      <div
        className="text-2xl font-extrabold leading-none"
        style={{ color: accent ?? '#6366f1' }}
      >
        {value}
      </div>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1.5">
        {label}
      </div>
    </div>
  )
}

export default function StatsRow({ total, count, topScore, avgExp }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-5">
      <StatCard value={total.toLocaleString()} label="Advisors Reviewed" accent="#6366f1" />
      <StatCard value={count} label="Top Matches" accent="#6366f1" />
      <StatCard value={`${Math.round(topScore * 100)}%`} label="Best Match Score" accent="#10b981" />
      <StatCard value={`${avgExp} yrs`} label="Avg Experience" accent="#f59e0b" />
    </div>
  )
}
