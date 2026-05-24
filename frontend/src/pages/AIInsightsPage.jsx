import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Brain } from 'lucide-react'
import { getAIInsights, getPrediction, getPersonality } from '../utils/api'
import { formatCurrency } from '../utils/formatters'

const PERSONALITY_META = {
  'Conservative Spender':  { emoji: '🛡️', color: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',   desc: 'You are disciplined and careful with money. You rarely overspend and prioritize saving.' },
  'Impulsive Buyer':       { emoji: '🛍️', color: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-300',    desc: 'You tend to make frequent unplanned purchases. Setting spending limits may help.' },
  'Balanced Saver':        { emoji: '⚖️', color: 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300',  desc: 'You strike a healthy balance between spending on wants and building savings.' },
  'Experience Seeker':     { emoji: '🎯', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', desc: 'You prioritize experiences, dining, and entertainment over material goods.' },
  'Necessity Focused':     { emoji: '📦', color: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300',  desc: 'Most of your spending goes to essential needs. You may have room to invest.' },
}

export default function AIInsightsPage() {
  const [insights,    setInsights]    = useState(null)
  const [prediction,  setPrediction]  = useState(null)
  const [personality, setPersonality] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [ins, pred, per] = await Promise.all([
        getAIInsights({}),
        getPrediction({}),
        getPersonality({}),
      ])
      setInsights(ins.data)
      setPrediction(pred.data)
      setPersonality(per.data)
    } catch (err) {
      setError('AI service unavailable. Make sure the Python Flask server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[var(--text-muted)]">Running AI analysis…</p>
    </div>
  )

  const pMeta = personality?.type ? (PERSONALITY_META[personality.type] ?? PERSONALITY_META['Balanced Saver']) : null
  const anomalies     = insights?.anomalies ?? []
  const recommendations = insights?.recommendations ?? []

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <motion.div className="flex items-center justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles size={22} className="text-brand-500" /> AI Insights</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Powered by scikit-learn machine learning models</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </motion.div>

      {error && (
        <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4">
          ⚠️ {error}
        </div>
      )}

      {/* Financial Personality */}
      {personality && pMeta && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl flex-shrink-0">
              {pMeta.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-bold">Your Financial Personality</h2>
                <span className={`badge ${pMeta.color}`}>{personality.type}</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-4">{pMeta.desc}</p>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(personality.scores ?? {}).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-[var(--text-muted)] mb-1">{k}</p>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(v * 100, 100)}%` }} />
                    </div>
                    <p className="text-xs font-medium mt-1">{(v * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Expense Prediction */}
      {prediction && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold">Next Month Expense Prediction</h2>
              <p className="text-xs text-[var(--text-muted)]">Linear Regression model trained on your spending history</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 text-center">
              <p className="text-3xl font-bold text-brand-500">{formatCurrency(prediction.nextMonth)}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Predicted Expenses</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 text-center">
              <p className="text-3xl font-bold">{formatCurrency(prediction.avgMonthly)}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Avg Monthly (historical)</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 text-center">
              <p className={`text-3xl font-bold ${prediction.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                {prediction.trend === 'up' ? '▲' : '▼'} {prediction.trendPct?.toFixed(1)}%
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-1">vs. this month</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Anomaly Detection */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold">Unusual Spending Detected</h2>
            <p className="text-xs text-[var(--text-muted)]">Isolation Forest anomaly detection</p>
          </div>
        </div>
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm">No unusual spending patterns detected. Great job!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <div>
                  <p className="font-medium text-sm">{a.description}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{new Date(a.date).toLocaleDateString()} · {a.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(a.amount)}</p>
                  <p className="text-xs text-[var(--text-muted)]">{a.pctAboveAvg?.toFixed(0)}% above avg</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Savings Recommendations */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
            <Lightbulb size={18} />
          </div>
          <h2 className="text-base font-semibold">Personalized Savings Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xl">{r.icon}</span>
              <div>
                <p className="font-medium text-sm">{r.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{r.detail}</p>
                {r.potentialSaving && (
                  <p className="text-xs text-brand-500 font-semibold mt-1.5">
                    Save up to {formatCurrency(r.potentialSaving)}/month
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
