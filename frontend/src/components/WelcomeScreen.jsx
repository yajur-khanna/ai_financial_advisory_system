const FEATURES = [
  {
    icon: '🎯',
    title: 'Goal Alignment',
    desc: 'Matched to your specific financial objectives and timeline.',
  },
  {
    icon: '🔍',
    title: 'Transparent Scoring',
    desc: 'See exactly why each advisor ranked — no black boxes.',
  },
  {
    icon: '🛡️',
    title: 'Trust & Risk Detection',
    desc: 'Flags disclosures, disciplinary history, and fee anomalies.',
  },
  {
    icon: '📊',
    title: 'Real SEC Data',
    desc: 'Sourced directly from Form ADV IAPD filings.',
  },
]

export default function WelcomeScreen() {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-6xl mb-4 select-none">💎</div>
      <h2 className="text-2xl font-extrabold text-slate-800 mb-3">
        Find Your Perfect Financial Advisor
      </h2>
      <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed text-sm">
        Build your profile on the left to receive personalized, explainable recommendations
        from thousands of SEC-registered investment advisers.
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-sm"
          >
            <div className="text-2xl mb-2">{f.icon}</div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">{f.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
