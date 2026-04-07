import { useState } from 'react'
import Wizard from './components/Wizard'
import AdvisorCard from './components/AdvisorCard'
import StatsRow from './components/StatsRow'

// ─── Header ───────────────────────────────────────────────────────────────
function Header({ onStartOver }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)',
      }}
    >
      {/* Glow */}
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)',
          transform: 'translate(30%, -30%)',
        }}
      />
      <div className="relative z-10 flex items-center gap-4 px-8 py-6 max-w-5xl mx-auto">
        <span className="text-3xl select-none">💎</span>
        <div className="flex-1">
          <h1
            className="text-xl font-extrabold leading-none"
            style={{
              background: 'linear-gradient(135deg, #a5b4fc, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            FindMyAdvisor
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            AI-powered financial advisor matching · Real SEC Form ADV data
          </p>
        </div>
        {onStartOver && (
          <button
            onClick={onStartOver}
            className="text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-500 rounded-xl px-4 py-2 transition-all"
          >
            ← Start Over
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Loading screen ────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl select-none">
          💎
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold text-slate-700 text-lg">Finding your best matches…</p>
        <p className="text-slate-400 text-sm mt-1">Scanning the SEC advisor registry</p>
      </div>
    </div>
  )
}

// ─── Results view ──────────────────────────────────────────────────────────
function ResultsView({ results, meta }) {
  const avgExp = results.length
    ? Math.round(results.reduce((s, r) => s + r.years_experience, 0) / results.length)
    : 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <StatsRow
        total={meta.total}
        count={results.length}
        topScore={results[0]?.score ?? 0}
        avgExp={avgExp}
      />

      <div className="flex items-baseline gap-2 mb-5">
        <h2 className="font-extrabold text-slate-800 text-lg">Your Top Advisor Matches</h2>
        <span className="text-slate-400 text-sm font-normal">· ranked by fit score</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {results.map((m, i) => (
          <AdvisorCard key={m.advisor_id} rank={i + 1} match={m} />
        ))}
      </div>

      <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-xs leading-relaxed pb-4">
        Data sourced from the SEC Investment Adviser Public Disclosure (IAPD) · Form ADV filings
        <br />
        For informational purposes only — not financial advice.
      </footer>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────
function NoResults({ state }) {
  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="font-bold text-slate-700 text-lg mb-2">No matches found in {state}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        No advisors in our database matched your profile for{' '}
        <strong>{state}</strong>. Try a neighboring state or a broader financial goal.
      </p>
    </div>
  )
}

// ─── Main app ──────────────────────────────────────────────────────────────
export default function App() {
  // view: 'wizard' | 'loading' | 'results' | 'empty'
  const [view,      setView]     = useState('wizard')
  const [results,   setResults]  = useState(null)
  const [meta,      setMeta]     = useState(null)
  const [lastState, setLastState] = useState('')
  const [error,     setError]    = useState(null)

  const handleMatch = async (formData) => {
    setView('loading')
    setError(null)
    setLastState(formData.state)

    try {
      const res = await fetch('/api/match', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setResults(data.results)
      setMeta({ total: data.total_advisors })
      setView(data.results.length > 0 ? 'results' : 'empty')
    } catch {
      setError('Could not connect to the server. Make sure the backend is running on port 8000.')
      setView('wizard')
    }
  }

  const handleStartOver = () => {
    setView('wizard')
    setResults(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Header onStartOver={view !== 'wizard' ? handleStartOver : null} />

      <main>
        {view === 'wizard' && (
          <>
            <Wizard onSubmit={handleMatch} />
            {error && (
              <p className="text-center text-red-500 text-sm -mt-6 pb-6">{error}</p>
            )}
          </>
        )}

        {view === 'loading' && <LoadingScreen />}

        {view === 'results' && results && (
          <ResultsView results={results} meta={meta} />
        )}

        {view === 'empty' && <NoResults state={lastState} />}
      </main>
    </div>
  )
}
