'use client'
import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, BellRing } from 'lucide-react'
import Sidebar    from '@/components/Sidebar'
import AlertCard  from '@/components/AlertCard'

const FILTERS = [
  { key: 'all',            label: 'All Alerts'    },
  { key: 'danger',         label: '🔴 Danger'     },
  { key: 'moderate',       label: '🟡 Moderate'   },
  { key: 'unacknowledged', label: 'Unacknowledged'},
  { key: 'acknowledged',   label: 'Resolved'      },
]

export default function Alerts() {
  const [alerts,   setAlerts]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [total,    setTotal]    = useState(0)
  const [filter,   setFilter]   = useState('all')

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 50 })
      if (filter === 'danger')          params.set('risk', 'DANGER')
      if (filter === 'moderate')        params.set('risk', 'MODERATE')
      if (filter === 'unacknowledged')  params.set('acknowledged', 'false')
      if (filter === 'acknowledged')    params.set('acknowledged', 'true')

      const res  = await fetch(`/api/alerts?${params}`)
      const json = await res.json()
      if (json.success) {
        setAlerts(json.data.alerts)
        setTotal(json.data.total)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  const handleAcknowledge = async (id) => {
    try {
      await fetch('/api/alerts', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id }),
      })
      fetchAlerts()
    } catch (e) { console.error(e) }
  }

  const dangerCount   = alerts.filter(a => a.riskLevel === 'DANGER'   && !a.acknowledged).length
  const moderateCount = alerts.filter(a => a.riskLevel === 'MODERATE' && !a.acknowledged).length

  return (
    <>
      <Sidebar />
      <div className="ml-64 flex-1 p-8 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="lv-title">Alerts</h1>
            <p className="lv-subtitle">
              AI-enriched water quality alerts with emergency measures
            </p>
          </div>
          <button onClick={fetchAlerts} className="lv-btn-ghost text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary chips */}
        {(dangerCount > 0 || moderateCount > 0) && (
          <div className="flex gap-3 flex-wrap">
            {dangerCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10
                              border border-red-500/30 rounded-xl text-sm">
                <BellRing className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-red-300 font-semibold">
                  {dangerCount} DANGER alert{dangerCount > 1 ? 's' : ''} require attention
                </span>
              </div>
            )}
            {moderateCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10
                              border border-amber-500/30 rounded-xl text-sm">
                <span className="text-amber-300">
                  {moderateCount} MODERATE alert{moderateCount > 1 ? 's' : ''} active
                </span>
              </div>
            )}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                filter === f.key
                  ? 'bg-lv-500/20 text-lv-300 border-lv-400/30'
                  : 'bg-white/[0.05] text-slate-400 border-white/[0.10] hover:bg-white/[0.08]'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500 self-center">
            {total} alerts
          </span>
        </div>

        {/* Alert list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-9 h-9 border-2 border-lv-400/20 border-t-lv-400
                            rounded-full animate-spin" />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map(a => (
              <AlertCard
                key={a._id}
                alert={a}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </div>
        ) : (
          <div className="lv-card p-16 text-center">
            <p className="text-slate-500">No alerts match the current filter</p>
          </div>
        )}
      </div>
    </>
  )
}