import { useState } from 'react'

// ─── Step definitions ─────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'state',
    icon: '📍',
    question: 'Where are you located?',
    hint: "We'll match you with SEC-registered advisors in your state.",
  },
  {
    id: 'timeline',
    icon: '⏱️',
    question: 'Tell us about your timeline',
    hint: 'Your age and retirement horizon shape the right advisor profile.',
  },
  {
    id: 'goal',
    icon: '🎯',
    question: "What's your primary financial goal?",
    hint: "We'll prioritize advisors with matching specialties.",
  },
  {
    id: 'savings',
    icon: '💰',
    question: 'What are your approximate savings?',
    hint: 'Helps us match advisor minimums and client-type fit.',
  },
  {
    id: 'background',
    icon: '👤',
    question: 'A bit about yourself',
    hint: 'Optional details that refine your match quality.',
  },
  {
    id: 'risk',
    icon: '📈',
    question: "What's your risk tolerance?",
    hint: 'How comfortable are you with investment volatility?',
  },
]

// ─── Constants ────────────────────────────────────────────────────────────
const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

const SPECIALTY_OPTIONS = [
  { key: 'retirement planning',               label: 'Retirement Planning',               icon: '🏖️' },
  { key: 'tax aware investing',               label: 'Tax Aware Investing',               icon: '📋' },
  { key: 'estate planning',                   label: 'Estate Planning',                   icon: '🏛️' },
  { key: 'management of new wealth',          label: 'Management of New Wealth',          icon: '💼' },
  { key: 'entrepreneurial wealth management', label: 'Entrepreneurial Wealth Management', icon: '🚀' },
  { key: 'socially conscious investing',      label: 'Socially Conscious Investing',      icon: '🌱' },
  { key: 'tax preparation',                   label: 'Tax Preparation',                   icon: '🧾' },
  { key: 'life insurance',                    label: 'Life Insurance',                    icon: '🛡️' },
  { key: 'divorce planning',                  label: 'Divorce Planning',                  icon: '⚖️' },
  { key: "i don't know",                      label: "I Don't Know Yet",                  icon: '🤔' },
]

const AGE_BUCKETS     = ['<30', '30-40', '40-50', '60+']
const RETIREMENT_GOALS = ['<2 yrs', '2-5 yrs', '5-10 yrs', '10+ yrs']

const RISK_LABELS = ['', 'Very Conservative', 'Conservative', 'Moderate', 'Aggressive', 'Very Aggressive']
const RISK_DESCS  = [
  '',
  'Prioritize capital preservation. Minimal exposure to market swings.',
  'Prefer steady, low-risk growth over high potential returns.',
  'Balanced mix of growth and stability.',
  'Comfortable with volatility in pursuit of higher returns.',
  'Maximize growth potential. High risk is acceptable.',
]

// ─── Shared input component ───────────────────────────────────────────────
const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm ' +
  'focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white'

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls + ' cursor-pointer appearance-none bg-white'}
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

// ─── Step content renderers ───────────────────────────────────────────────
function StepState({ formData, update }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        State
      </label>
      <SelectInput value={formData.state} onChange={(v) => update('state', v)} options={STATES} />
    </div>
  )
}

function StepTimeline({ formData, update }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Age Range
        </label>
        <div className="grid grid-cols-4 gap-2">
          {AGE_BUCKETS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => update('age_bucket', b)}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                formData.age_bucket === b
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Retirement Timeline
        </label>
        <div className="grid grid-cols-4 gap-2">
          {RETIREMENT_GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => update('retirement_goal', g)}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                formData.retirement_goal === g
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepGoal({ formData, update }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SPECIALTY_OPTIONS.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => update('specialty_key', o.key)}
          className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left text-sm font-medium border transition-all ${
            formData.specialty_key === o.key
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
          }`}
        >
          <span className="text-base flex-shrink-0">{o.icon}</span>
          <span className="leading-tight">{o.label}</span>
        </button>
      ))}
    </div>
  )
}

function StepSavings({ formData, update }) {
  const fmt = (n) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : `$${(n / 1_000).toFixed(0)}K`

  return (
    <div className="space-y-5">
      <div className="text-center py-4">
        <div className="text-4xl font-extrabold text-indigo-600">
          {fmt(formData.approx_savings)}
        </div>
        <div className="text-slate-400 text-xs mt-1">approximate savings</div>
      </div>
      <input
        type="range"
        min={1000}
        max={5_000_000}
        step={5000}
        value={formData.approx_savings}
        onChange={(e) => update('approx_savings', Number(e.target.value))}
        className="w-full cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>$1K</span>
        <span>$5M</span>
      </div>
      <div className="relative">
        <span className="absolute left-4 top-3 text-slate-400 text-sm">$</span>
        <input
          type="number"
          value={formData.approx_savings}
          onChange={(e) => update('approx_savings', Number(e.target.value))}
          min={1000}
          max={10_000_000}
          step={1000}
          className={inputCls + ' pl-8'}
          placeholder="Enter exact amount"
        />
      </div>
    </div>
  )
}

function StepBackground({ formData, update }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Profession <span className="text-slate-300 normal-case font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={formData.profession}
          onChange={(e) => update('profession', e.target.value)}
          placeholder="e.g. Software Engineer, Doctor, Teacher…"
          className={inputCls + ' placeholder-slate-300'}
        />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Do you own a home?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: true,  label: '🏠 Yes, I own a home' },
            { val: false, label: '🏢 No, I rent or other' },
          ].map(({ val, label }) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => update('owns_house', val)}
              className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                formData.owns_house === val
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepRisk({ formData, update }) {
  const score = formData.risk_score
  const TRACK_COLORS = ['', '#10b981', '#6ee7b7', '#f59e0b', '#f97316', '#ef4444']

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-5 text-center transition-all"
        style={{ background: TRACK_COLORS[score] + '15', border: `1px solid ${TRACK_COLORS[score]}33` }}
      >
        <div
          className="text-2xl font-extrabold mb-1 transition-all"
          style={{ color: TRACK_COLORS[score] }}
        >
          {RISK_LABELS[score]}
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">{RISK_DESCS[score]}</p>
      </div>

      <div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={score}
          onChange={(e) => update('risk_score', Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{ accentColor: TRACK_COLORS[score] }}
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Conservative</span>
          <span>Aggressive</span>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => update('risk_score', v)}
            className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
            style={
              score === v
                ? { background: TRACK_COLORS[v], color: 'white', border: `1px solid ${TRACK_COLORS[v]}` }
                : { background: 'white', color: '#94a3b8', border: '1px solid #e2e8f0' }
            }
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Progress indicator ───────────────────────────────────────────────────
function ProgressDots({ step, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width:      i === step ? '24px' : '8px',
            height:     '8px',
            background: i < step ? '#6366f1' : i === step ? '#6366f1' : '#e2e8f0',
            opacity:    i < step ? 0.4 : 1,
          }}
        />
      ))}
    </div>
  )
}

// ─── Wizard ───────────────────────────────────────────────────────────────
const STEP_RENDERERS = [StepState, StepTimeline, StepGoal, StepSavings, StepBackground, StepRisk]

export default function Wizard({ onSubmit }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    state:           'NY',
    age_bucket:      '30-40',
    retirement_goal: '5-10 yrs',
    specialty_key:   'retirement planning',
    approx_savings:  250000,
    profession:      '',
    owns_house:      false,
    risk_score:      3,
  })

  const update = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = () =>
    onSubmit({
      ...formData,
      approx_savings: Number(formData.approx_savings),
      risk_score:     Number(formData.risk_score),
      owns_house:     Boolean(formData.owns_house),
    })

  const isLast = step === STEPS.length - 1
  const StepContent = STEP_RENDERERS[step]

  return (
    <div className="max-w-xl mx-auto pt-10 pb-16 px-4">
      {/* Step count */}
      <div className="text-center mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      {/* Progress dots */}
      <ProgressDots step={step} total={STEPS.length} />

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Card header */}
        <div
          className="px-8 pt-8 pb-6"
          style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
        >
          <div className="text-4xl mb-3 select-none">{STEPS[step].icon}</div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
            {STEPS[step].question}
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{STEPS[step].hint}</p>
        </div>

        {/* Card body — keyed so it re-mounts cleanly on step change */}
        <div key={step} className="px-8 pt-6 pb-8 step-enter">
          <StepContent formData={formData} update={update} />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold transition-colors flex items-center gap-1"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={isLast ? submit : next}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background:  'linear-gradient(135deg, #6366f1, #818cf8)',
                boxShadow:   '0 4px 16px rgba(99,102,241,0.38)',
              }}
            >
              {isLast ? (
                <>Find My Advisors <span>→</span></>
              ) : (
                <>Continue <span>→</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
