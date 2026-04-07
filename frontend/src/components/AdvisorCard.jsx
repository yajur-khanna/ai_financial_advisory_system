import ScoreRing from './ScoreRing'

const RANK_STYLES = {
  1: {
    bar: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
    badgeBg: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    shadow: '0 2px 10px rgba(245,158,11,0.4)',
  },
  2: {
    bar: 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
    badgeBg: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
    shadow: '0 2px 10px rgba(148,163,184,0.4)',
  },
  3: {
    bar: 'linear-gradient(90deg, #b45309, #d97706)',
    badgeBg: 'linear-gradient(135deg, #b45309, #d97706)',
    shadow: '0 2px 10px rgba(180,83,9,0.35)',
  },
}

const CONF_COLORS = { High: '#10b981', Medium: '#f59e0b', Low: '#ef4444' }

const FEE_LABELS = {
  aum: 'AUM %',
  flat: 'Flat Fee',
  hourly: 'Hourly',
  subscription: 'Subscription',
  commission: 'Commission',
  performance: 'Performance',
  other: 'Other',
}

function Badge({ children, style, className = '' }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}

function Chip({ children }) {
  return (
    <span className="inline-block text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
      {children}
    </span>
  )
}

export default function AdvisorCard({ rank, match: m }) {
  const rs = RANK_STYLES[rank] ?? RANK_STYLES[3]
  const confColor = CONF_COLORS[m.confidence] ?? '#6366f1'
  const feeLabel = FEE_LABELS[m.fee_model] ?? m.fee_model

  return (
    <div className="advisor-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md flex flex-col">
      {/* Rank color bar */}
      <div className="h-1" style={{ background: rs.bar }} />

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* ── Header ── */}
        <div className="flex items-start gap-3">
          {/* Rank badge */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: rs.badgeBg, boxShadow: rs.shadow }}
          >
            <span className="text-white text-xs font-black">#{rank}</span>
          </div>

          {/* Firm info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm leading-snug break-words">
              {m.firm_name}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              📍 {m.state} · {m.zip_code}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge
                style={{
                  background: confColor + '1a',
                  color: confColor,
                  border: `1px solid ${confColor}55`,
                }}
              >
                {m.confidence} Confidence
              </Badge>
              {m.fiduciary && (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ Fiduciary
                </Badge>
              )}
              <Badge className="bg-slate-100 text-slate-600 border border-slate-200">
                {feeLabel}
              </Badge>
              <Badge className="bg-slate-100 text-slate-600 border border-slate-200">
                {m.years_experience} yrs exp
              </Badge>
            </div>
          </div>

          {/* Score ring */}
          <ScoreRing score={m.score} confidence={m.confidence} />
        </div>

        {/* ── Specialties ── */}
        {m.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pb-4 border-b border-slate-100">
            {m.specialties.slice(0, 5).map((s) => (
              <Chip key={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</Chip>
            ))}
          </div>
        )}

        {/* ── Insights ── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
              Why This Match
            </p>
            {m.why_match?.length > 0 ? (
              <ul className="space-y-1.5">
                {m.why_match.map((r, i) => (
                  <li
                    key={i}
                    className="flex gap-1.5 items-start text-xs text-slate-700 leading-relaxed"
                  >
                    <span className="text-emerald-500 font-bold flex-shrink-0 mt-px">✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific reasons</p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
              To Consider
            </p>
            {m.concerns?.length > 0 ? (
              <ul className="space-y-1.5">
                {m.concerns.map((c, i) => (
                  <li
                    key={i}
                    className="flex gap-1.5 items-start text-xs text-amber-800 leading-relaxed"
                  >
                    <span className="flex-shrink-0 mt-px">⚠</span>
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">None noted</p>
            )}
          </div>
        </div>

        {/* ── Risk flags ── */}
        {m.risks?.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
              ⚡ Risk Flags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {m.risks.map((r, i) => (
                <span
                  key={i}
                  className="inline-block text-xs font-semibold text-red-700 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
