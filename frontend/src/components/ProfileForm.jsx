import { useState } from 'react'

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

const SPECIALTY_OPTIONS = [
  { key: 'retirement planning',             label: 'Retirement Planning' },
  { key: 'tax aware investing',             label: 'Tax Aware Investing' },
  { key: 'estate planning',                 label: 'Estate Planning' },
  { key: 'management of new wealth',        label: 'Management of New Wealth' },
  { key: 'entrepreneurial wealth management', label: 'Entrepreneurial Wealth Mgmt' },
  { key: 'socially conscious investing',    label: 'Socially Conscious Investing' },
  { key: 'tax preparation',                 label: 'Tax Preparation' },
  { key: 'life insurance',                  label: 'Life Insurance' },
  { key: 'divorce planning',                label: 'Divorce Planning' },
  { key: "i don't know",                    label: "I Don't Know" },
]

const AGE_BUCKETS    = ['<30', '30-40', '40-50', '60+']
const RETIREMENT_GOALS = ['<2 yrs', '2-5 yrs', '5-10 yrs', '10+ yrs']

const RISK_LABELS = [
  '', 'Very Conservative', 'Conservative', 'Moderate', 'Aggressive', 'Very Aggressive',
]

/* ── Shared input styles ── */
const inputCls =
  'w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3 py-2.5 text-sm ' +
  'focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors'

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  )
}

function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls + ' cursor-pointer appearance-none'}
    >
      {options.map((o) =>
        typeof o === 'string' ? (
          <option key={o} value={o}>{o}</option>
        ) : (
          <option key={o.key} value={o.key}>{o.label}</option>
        ),
      )}
    </select>
  )
}

function Divider() {
  return <div className="border-t border-slate-800 my-4" />
}

/* ── Toggle switch ── */
function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-slate-900 ${
          checked ? 'bg-indigo-500' : 'bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-slate-300 text-sm">{label}</span>
    </div>
  )
}

export default function ProfileForm({ onSubmit, loading }) {
  const [state,          setState]          = useState('NY')
  const [ageBucket,      setAgeBucket]      = useState('30-40')
  const [retirementGoal, setRetirementGoal] = useState('5-10 yrs')
  const [specialtyKey,   setSpecialtyKey]   = useState('retirement planning')
  const [savings,        setSavings]        = useState(250000)
  const [profession,     setProfession]     = useState('')
  const [ownsHouse,      setOwnsHouse]      = useState(false)
  const [riskScore,      setRiskScore]      = useState(3)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      state,
      age_bucket:      ageBucket,
      retirement_goal: retirementGoal,
      specialty_key:   specialtyKey,
      approx_savings:  savings,
      profession,
      owns_house:  ownsHouse,
      risk_score:  riskScore,
    })
  }

  return (
    <aside className="w-72 flex-shrink-0 bg-slate-900 h-screen overflow-y-auto flex flex-col border-r border-slate-800">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl select-none">💎</span>
          <span
            className="text-lg font-extrabold"
            style={{
              background: 'linear-gradient(135deg, #a5b4fc, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            DataAlign
          </span>
        </div>
        <p className="text-slate-500 text-xs">Configure your investor profile</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-5 py-5 space-y-4">
        <div>
          <FieldLabel>📍 State</FieldLabel>
          <SelectField value={state} onChange={setState} options={STATES} />
        </div>

        <div>
          <FieldLabel>👤 Age Range</FieldLabel>
          <SelectField value={ageBucket} onChange={setAgeBucket} options={AGE_BUCKETS} />
        </div>

        <div>
          <FieldLabel>⏱️ Retirement Timeline</FieldLabel>
          <SelectField
            value={retirementGoal}
            onChange={setRetirementGoal}
            options={RETIREMENT_GOALS}
          />
        </div>

        <div>
          <FieldLabel>🎯 Primary Financial Goal</FieldLabel>
          <SelectField
            value={specialtyKey}
            onChange={setSpecialtyKey}
            options={SPECIALTY_OPTIONS}
          />
        </div>

        <Divider />

        <div>
          <FieldLabel>💰 Approximate Savings</FieldLabel>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm select-none">$</span>
            <input
              type="number"
              value={savings}
              onChange={(e) => setSavings(Number(e.target.value))}
              min={0}
              max={10000000}
              step={10000}
              className={inputCls + ' pl-7'}
            />
          </div>
        </div>

        <div>
          <FieldLabel>💼 Profession</FieldLabel>
          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="e.g. Software Engineer"
            className={inputCls + ' placeholder-slate-600'}
          />
        </div>

        <Toggle
          checked={ownsHouse}
          onChange={setOwnsHouse}
          label="🏠 I own a home"
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <FieldLabel>📈 Risk Tolerance</FieldLabel>
            <span className="text-xs font-semibold text-indigo-400">{RISK_LABELS[riskScore]}</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={riskScore}
            onChange={(e) => setRiskScore(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-0.5">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
        </div>

        <Divider />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
              Matching…
            </span>
          ) : (
            'Find My Advisors →'
          )}
        </button>
      </form>
    </aside>
  )
}
