'use client'
import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react'
import Sidebar   from '@/components/Sidebar'
import RiskBadge from '@/components/RiskBadge'

const RISK_FILTERS  = ['All', 'SAFE', 'MODERATE', 'DANGER']
const DIVISION_LIST = [
  'All',
  'North Division', 'South Division',
  'East Division',  'West Division',
  'Central Division',
]

export default function Monitor() {
  const [readings,  setReadings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [risk,      setRisk]      = useState('All')
  const [division,  setDivision]  = useState('All')
  const [search,    setSearch]    = useState('')
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)
  const LIMIT = 25

  const fetchReadings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (risk !== 'All')     params.set('risk',     risk)
      if (division !== 'All') params.set('division', division)
      if (search)             params.set('sensor',   search)

      const res  = await fetch(`/api/readings?${params}`)
      const json = await res.json()
      if (json.success) {
        setReadings(json.data.readings)
        setTotal(json.data.total)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [risk, division, search, page])

  useEffect(() => { fetchReadings() }, [fetchReadings])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <>
      <Sidebar />
      <div className="ml-64 flex-1 p-8 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="lv-title">Live Monitor</h1>
            <p className="lv-subtitle">
              Real-time IoT sensor readings across all municipal divisions
            </p>
          </div>
          <button onClick={fetchReadings} className="lv-btn-ghost text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-44">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="lv-input pl-9"
              placeholder="Search sensor ID or location…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>

          {/* Division selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <select
              value={division}
              onChange={e => { setDivision(e.target.value); setPage(1) }}
              className="lv-input w-auto"
            >
              {DIVISION_LIST.map(d => (
                <option key={d} value={d} className="bg-slate-900">{d}</option>
              ))}
            </select>
          </div>

          {/* Risk filter pills */}
          <div className="flex gap-1.5">
            {RISK_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => { setRisk(f); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  risk === f
                    ? f === 'DANGER'   ? 'bg-red-500/20   text-red-300   border-red-500/40'
                    : f === 'MODERATE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : f === 'SAFE'     ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-lv-500/20 text-lv-300 border-lv-400/30'
                    : 'bg-white/[0.05] text-slate-400 border-white/[0.10] hover:bg-white/[0.08]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="lv-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07]">
            <span className="text-xs text-slate-400">{total} readings found</span>
            <span className="text-xs text-slate-500">
              Page {page} / {totalPages || 1}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full lv-table">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {[
                    'Division','Location','Sensor ID',
                    'pH','Turbidity','Bacteria','Chemical',
                    'Temp','TDS','Rainfall','Risk','Issues','Time',
                  ].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={13} className="py-16 text-center">
                      <div className="w-7 h-7 border-2 border-lv-400/20 border-t-lv-400
                                      rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : readings.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-14 text-center text-slate-500 text-sm">
                      No readings match the current filters
                    </td>
                  </tr>
                ) : readings.map((r, i) => (
                  <tr
                    key={r._id}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${
                      i % 2 ? 'bg-white/[0.015]' : ''
                    }`}
                  >
                    <td className="font-medium text-white whitespace-nowrap text-xs">{r.division}</td>
                    <td className="text-slate-400 whitespace-nowrap text-xs">{r.location}</td>
                    <td className="font-mono text-slate-500 text-xs">{r.sensorId}</td>
                    <td className={`font-mono font-bold text-xs ${
                      r.ph < 6.5 || r.ph > 8.5 ? 'text-red-400' : 'text-emerald-400'
                    }`}>{r.ph}</td>
                    <td className={`font-mono text-xs ${
                      r.turbidity > 10 ? 'text-red-400'
                      : r.turbidity > 4 ? 'text-amber-400'
                      : 'text-slate-300'
                    }`}>{r.turbidity}</td>
                    <td className={`text-xs ${
                      r.bacteria === 'High' ? 'text-red-400'
                      : r.bacteria === 'Medium' ? 'text-amber-400'
                      : 'text-slate-400'
                    }`}>{r.bacteria}</td>
                    <td className={`text-xs ${
                      r.chemical === 'Contaminated' ? 'text-red-400'
                      : r.chemical === 'Trace' ? 'text-amber-400'
                      : 'text-slate-400'
                    }`}>{r.chemical}</td>
                    <td className="text-slate-400 font-mono text-xs">{r.temperature}°C</td>
                    <td className={`font-mono text-xs ${r.tds > 500 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {r.tds}
                    </td>
                    <td className="text-slate-400 font-mono text-xs">{r.rainfall}mm</td>
                    <td><RiskBadge level={r.riskLevel} /></td>
                    <td>
                      {r.issues?.length > 0 && (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {r.issues.slice(0, 2).map((iss, j) => (
                            <span key={j}
                              className="text-[10px] px-1.5 py-0.5 bg-white/[0.05]
                                         border border-white/[0.08] rounded text-slate-500
                                         whitespace-nowrap">
                              {iss}
                            </span>
                          ))}
                          {r.issues.length > 2 && (
                            <span className="text-[10px] text-slate-600">
                              +{r.issues.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="text-slate-500 text-xs whitespace-nowrap">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.07]">
              <span className="text-xs text-slate-500">
                Showing {(page-1)*LIMIT + 1}–{Math.min(page*LIMIT, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="lv-btn-ghost py-1.5 px-3 text-xs disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="lv-btn-ghost py-1.5 px-3 text-xs disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}