const COLORS = {
  High: '#10b981',
  Medium: '#f59e0b',
  Low: '#ef4444',
}

export default function ScoreRing({ score, confidence }) {
  const color = COLORS[confidence] ?? '#6366f1'
  const r = 46
  const circ = 2 * Math.PI * r
  const filled = score * circ
  const gap = circ - filled
  const pct = Math.round(score * 100)

  return (
    <svg width="108" height="108" viewBox="0 0 108 108" className="flex-shrink-0">
      {/* Track */}
      <circle cx="54" cy="54" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      {/* Progress */}
      <circle
        cx="54"
        cy="54"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(1)} ${gap.toFixed(1)}`}
        transform="rotate(-90 54 54)"
      />
      {/* Score text */}
      <text
        x="54"
        y="48"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="21"
        fontWeight="800"
        fill={color}
        fontFamily="Inter, sans-serif"
      >
        {pct}%
      </text>
      {/* Label */}
      <text
        x="54"
        y="66"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="9"
        fill="#94a3b8"
        fontFamily="Inter, sans-serif"
        fontWeight="700"
        letterSpacing="0.08em"
      >
        MATCH
      </text>
    </svg>
  )
}
