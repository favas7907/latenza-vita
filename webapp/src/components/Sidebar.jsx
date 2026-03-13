'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Radio, Bell, Bot,
  Droplets, Waves,
} from 'lucide-react'

const NAV = [
  { href: '/',           icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/monitor',    icon: Radio,            label: 'Monitor'      },
  { href: '/alerts',     icon: Bell,             label: 'Alerts'       },
  { href: '/assistant',  icon: Bot,              label: 'AI Assistant' },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 z-30 flex flex-col border-r border-white/[0.07]"
      style={{
        background:
          'radial-gradient(ellipse at 30% 10%, rgba(30,184,219,0.10) 0%, transparent 60%), #05101e',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.07]">
        <div className="relative w-10 h-10 rounded-xl bg-lv-500/20 border border-lv-400/30 flex items-center justify-center">
          <Waves className="w-5 h-5 text-lv-400" />
          {/* Animated ping */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-lv-400 animate-pulse-slow" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-white tracking-tight leading-none">
            Latenza Vita
          </p>
          <p className="text-[10px] text-lv-400/70 uppercase tracking-[0.15em] mt-0.5">
            Water Monitor
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                          transition-all duration-200 group ${
                active
                  ? 'bg-lv-500/20 text-lv-300 border border-lv-400/25 shadow-sm shadow-lv-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  active ? 'text-lv-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              {label}
              {/* Active indicator */}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-lv-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── SDG Badge ── */}
      <div className="px-5 py-5 border-t border-white/[0.07]">
        <div className="lv-card px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-3.5 h-3.5 text-lv-400" />
            <span className="text-xs font-semibold text-lv-300">SDG 6</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Clean Water &amp; Sanitation<br />
            Powered by LangChain · FAISS<br />
            HuggingFace · FLAN-T5
          </p>
        </div>
      </div>
    </aside>
  )
}