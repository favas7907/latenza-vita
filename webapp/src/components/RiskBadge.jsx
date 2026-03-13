const CFG = {
  SAFE: {
    bg:     'bg-emerald-500/15',
    text:   'text-emerald-400',
    border: 'border-emerald-500/30',
    dot:    'bg-emerald-400',
    glow:   'shadow-emerald-500/20',
  },
  MODERATE: {
    bg:     'bg-amber-500/15',
    text:   'text-amber-400',
    border: 'border-amber-500/30',
    dot:    'bg-amber-400',
    glow:   'shadow-amber-500/20',
  },
  DANGER: {
    bg:     'bg-red-500/15',
    text:   'text-red-400',
    border: 'border-red-500/30',
    dot:    'bg-red-400',
    glow:   'shadow-red-500/20',
  },
}

export default function RiskBadge({ level, size = 'sm' }) {
  const c = CFG[level] || CFG.SAFE
  const padding =
    size === 'lg' ? 'px-4 py-1.5 text-sm'
    : size === 'xl' ? 'px-5 py-2 text-base'
    : 'px-2.5 py-0.5 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border
                  shadow-sm ${c.bg} ${c.text} ${c.border} ${c.glow} ${padding}`}
    >
      <span
        className={`rounded-full ${c.dot} ${
          level === 'DANGER' ? 'animate-pulse' : ''
        }`}
        style={{ width: '6px', height: '6px', flexShrink: 0 }}
      />
      {level}
    </span>
  )
}