'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  Activity, AlertTriangle, Radio,
  Droplets, RefreshCw, TrendingUp,
} from 'lucide-react'
import Sidebar   from '@/components/Sidebar'
import StatCard  from '@/components/StatCard'
import RiskBadge from '@/components/RiskBadge'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts'

const RISK_COLOR = {
  SAFE:     '#22c55e',
  MODERATE: '#f59e0b',
  DANGER:   '#ef4444',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="lv-card px-4 py-3 text-xs space-y-1">
      <p className="text-slate-400 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/dashboard-stats')
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  // Chart data
  const pieData = data?.riskDistribution?.map(d => ({
    name: d._id, value: d.count, color: RISK_COLOR[d._id],
  })) || []

  const divisionChart = data?.divisionStats?.map(d => ({
    name:      d._id?.replace(' Division', '') || d._id,
    pH:        d.avgPh,
    Turbidity: d.avgTurbidity,
    TDS:       d.avgTds,
    risk:      d.riskLevel,
  })) || []

  const hourlyChart = data?.hourlyTrend?.map(h => ({
    hour:    h._id,
    Total:   h.count,
    Danger:  h.danger,
  })) || []

  if (loading) return (
    <>
      <Sidebar />
      <div className="ml-64 flex items-center justify-center flex-1">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-lv-400/20 border-t-lv-400
                          rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Sidebar />
      <div className="ml-64 flex-1 p-8 space-y-8 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="lv-title">Dashboard</h1>
            <p className="lv-subtitle">
              Municipal water quality overview — real-time IoT monitoring
            </p>
          </div>
          <button onClick={fetchStats} className="lv-btn-ghost text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Radio}
            label="Monitoring Stations"
            value={data?.totalStations ?? '—'}
            sub="Active IoT sensors"
            accent="text-lv-400"
            accentBg="bg-lv-500/20"
          />
          <StatCard
            icon={AlertTriangle}
            label="Active Alerts"
            value={data?.activeAlerts ?? '—'}
            sub={`${data?.dangerAlerts ?? 0} DANGER level`}
            accent="text-red-400"
            accentBg="bg-red-500/20"
          />
          <StatCard
            icon={Droplets}
            label="Average pH"
            value={data?.averagePh ?? '—'}
            sub="Across all divisions"
            accent="text-purple-400"
            accentBg="bg-purple-500/20"
          />
          <StatCard
            icon={Activity}
            label="Total Readings"
            value={data?.totalReadings ?? '—'}
            sub="All-time records"
            accent="text-emerald-400"
            accentBg="bg-emerald-500/20"
          />
        </div>

        {/* ── Charts row 1 ── */}
        <div className="grid grid-cols-5 gap-6">

          {/* Risk distribution pie */}
          <div className="col-span-2 lv-card p-5">
            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Risk Distribution
            </h2>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={72}
                      paddingAngle={3} dataKey="value"
                    >
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-slate-400">{d.name}</span>
                      </div>
                      <span className="font-mono text-slate-300 font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                No data yet — start the IoT simulator
              </div>
            )}
          </div>

          {/* Division pH bar chart */}
          <div className="col-span-3 lv-card p-5">
            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Division pH Levels
            </h2>
            {divisionChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={divisionChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    domain={[0, 14]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {/* pH safe zone reference */}
                  <Bar dataKey="pH" fill="#1eb8db" radius={[4, 4, 0, 0]} name="Avg pH" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                No division data yet
              </div>
            )}
          </div>
        </div>

        {/* ── Charts row 2 ── */}
        {hourlyChart.length > 0 && (
          <div className="lv-card p-5">
            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Hourly Activity (Last 12 Hours)
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={hourlyChart}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1eb8db" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1eb8db" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="dangerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis                tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Area type="monotone" dataKey="Total"  stroke="#1eb8db" fill="url(#totalGrad)"  strokeWidth={2} />
                <Area type="monotone" dataKey="Danger" stroke="#ef4444" fill="url(#dangerGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Recent readings table ── */}
        <div className="lv-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
            <h2 className="font-display text-lg font-semibold text-white">
              Recent Sensor Readings
            </h2>
            <span className="text-xs text-slate-500">Latest 10 readings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full lv-table">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Division','Location','Sensor','pH','Turbidity','Bacteria','TDS','Risk','Time'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.recentReadings || []).map((r, i) => (
                  <tr
                    key={r._id}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${
                      i % 2 ? 'bg-white/[0.015]' : ''
                    }`}
                  >
                    <td className="font-medium text-white whitespace-nowrap">{r.division}</td>
                    <td className="text-slate-400 whitespace-nowrap text-xs">{r.location}</td>
                    <td className="font-mono text-xs text-slate-500">{r.sensorId}</td>
                    <td className={`font-mono font-semibold ${
                      r.ph < 6.5 || r.ph > 8.5 ? 'text-red-400' : 'text-emerald-400'
                    }`}>{r.ph}</td>
                    <td className={`font-mono ${
                      r.turbidity > 10 ? 'text-red-400'
                      : r.turbidity > 4 ? 'text-amber-400'
                      : 'text-slate-300'
                    }`}>{r.turbidity}</td>
                    <td className={
                      r.bacteria === 'High'   ? 'text-red-400'
                      : r.bacteria === 'Medium' ? 'text-amber-400'
                      : 'text-slate-400'
                    }>{r.bacteria}</td>
                    <td className={`font-mono ${r.tds > 500 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {r.tds}
                    </td>
                    <td><RiskBadge level={r.riskLevel} /></td>
                    <td className="text-slate-500 text-xs whitespace-nowrap">
                      {new Date(r.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {!data?.recentReadings?.length && (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-slate-500 text-sm">
                      No readings yet — start the IoT simulator to see live data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}