export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent    = 'text-lv-400',
  accentBg  = 'bg-lv-500/20',
  trend,
}) {
  return (
    <div className="lv-card p-5 flex flex-col gap-3 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${accentBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${accent}`} />
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="font-display text-3xl font-bold text-white tabular-nums">{value}</p>
        {sub && (
          <p className="text-xs text-slate-500 mt-1">{sub}</p>
        )}
      </div>

      {/* Optional trend */}
      {trend !== undefined && (
        <div className={`text-xs font-medium ${trend >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% from last hour
        </div>
      )}
    </div>
  )
}