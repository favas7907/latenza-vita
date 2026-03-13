'use client'
import { useState } from 'react'
import {
  AlertTriangle, ShieldAlert, Clock, MapPin,
  User, ChevronDown, ChevronUp, CheckCircle2,
} from 'lucide-react'
import RiskBadge from './RiskBadge'

export default function AlertCard({ alert, onAcknowledge }) {
  const [expanded, setExpanded] = useState(false)
  const isDanger = alert.riskLevel === 'DANGER'

  return (
    <div
      className={`lv-card p-5 border animate-slide-up transition-all duration-300 ${
        isDanger
          ? 'border-red-500/30 bg-red-500/[0.04]'
          : 'border-amber-500/20 bg-amber-500/[0.03]'
      }`}
    >
      {/* ── Top Row ── */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: icon + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDanger ? 'bg-red-500/20' : 'bg-amber-500/20'
            }`}
          >
            {isDanger
              ? <AlertTriangle className="w-5 h-5 text-red-400" />
              : <ShieldAlert   className="w-5 h-5 text-amber-400" />
            }
          </div>

          <div className="flex-1 min-w-0">
            {/* Division + risk */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <RiskBadge level={alert.riskLevel} />
              <span className="text-sm font-semibold text-white truncate">
                {alert.division}
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {alert.location}
              </span>
              <span className="font-mono">{alert.sensorId}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Issue chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {alert.issues.map((issue, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 bg-white/[0.05] border border-white/[0.08]
                             rounded-full text-slate-400"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!alert.acknowledged ? (
            <button
              onClick={() => onAcknowledge?.(alert._id)}
              className="text-xs px-3 py-1.5 bg-lv-500/20 text-lv-300
                         border border-lv-400/30 rounded-lg
                         hover:bg-lv-500/30 transition-colors whitespace-nowrap"
            >
              Acknowledge
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs text-emerald-500
                             bg-emerald-500/10 border border-emerald-500/20
                             rounded-lg px-2.5 py-1">
              <CheckCircle2 className="w-3 h-3" /> Done
            </span>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300
                       hover:bg-white/[0.05] transition-colors"
          >
            {expanded
              ? <ChevronUp   className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Expanded Detail ── */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.07] space-y-4 animate-fade-in">

          {/* Parameter grid */}
          {alert.parameters && (
            <div className="grid grid-cols-4 gap-3">
              {[
                ['pH',          alert.parameters.ph],
                ['Turbidity',   `${alert.parameters.turbidity} NTU`],
                ['TDS',         `${alert.parameters.tds} mg/L`],
                ['Rainfall',    `${alert.parameters.rainfall} mm`],
                ['Temperature', `${alert.parameters.temperature}°C`],
                ['Bacteria',    alert.parameters.bacteria],
                ['Chemical',    alert.parameters.chemical],
              ].map(([k, v]) => (
                <div key={k} className="bg-white/[0.04] rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">{k}</p>
                  <p className="text-sm font-mono font-semibold text-white">{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* AI Analysis */}
          {alert.aiAnalysis && (
            <div className="bg-lv-500/[0.08] border border-lv-400/[0.15] rounded-xl p-4">
              <p className="text-xs font-semibold text-lv-400 mb-2 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-lv-400/20 flex items-center
                                 justify-center text-[9px] font-bold">AI</span>
                AI Analysis — LangChain RAG
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{alert.aiAnalysis}</p>
            </div>
          )}

          {/* Emergency measures */}
          {alert.measures?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white mb-2.5 uppercase tracking-wider">
                Emergency Measures
              </p>
              <ul className="space-y-2">
                {alert.measures.map((m, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center
                                  text-[9px] font-bold flex-shrink-0 ${
                        m.startsWith('IMMEDIATE')
                          ? 'bg-red-500/30 text-red-300'
                          : 'bg-lv-500/20 text-lv-400'
                      }`}
                    >
                      {i + 1}
                    </span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsible authority */}
          {alert.responsibleAuth && (
            <div className="flex items-center gap-2 text-xs text-slate-400
                            bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5">
              <User className="w-3.5 h-3.5 text-lv-400 flex-shrink-0" />
              Responsible Authority:
              <span className="text-white font-medium ml-1">{alert.responsibleAuth}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}