import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react'
import { getAIInsights, getPrediction, getPersonality } from '../utils/api'
import { formatCurrency } from '../utils/formatters'

const PERSONALITY_META = {
  'Conservative Spender': { emoji:'🛡️', color:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',   desc:'You are disciplined with money. You rarely overspend and prioritize saving.' },
  'Impulsive Buyer':      { emoji:'🛍️', color:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',       desc:'You tend to make frequent unplanned purchases. Setting limits may help.' },
  'Balanced Saver':       { emoji:'⚖️', color:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', desc:'You strike a healthy balance between spending and saving.' },
  'Experience Seeker':    { emoji:'🎯', color:'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', desc:'You prioritize experiences, dining, and entertainment.' },
  'Necessity Focused':    { emoji:'📦', color:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', desc:'Most spending goes to essentials. You may have room to invest.' },
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
        getAIInsights({}), getPrediction({}), getPersonality({})
      ])
      setInsights(ins.data); setPrediction(pred.data); setPersonality(per.data)
    } catch {
      setError('AI service unavailable. Make sure the Python Flask server is running on port 8000.')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div style={{ width:32,height:32,border:'2px solid #14b8a6',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
      <p className="text-sm text-slate-400">Running AI analysis…</p>
    </div>
  )

  const pMeta = personality?.type ? (PERSONALITY_META[personality.type] ?? PERSONALITY_META['Balanced Saver']) : null
  const anomalies       = insights?.anomalies       ?? []
  const recommendations = insights?.recommendations ?? []

  return (
    <div className="page">
      <motion.div className="flex flex-wrap items-center justify-between gap-3 mb-6"
        initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Sparkles size={20} className="text-teal-500" /> AI Insights
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Powered by scikit-learn machine learning</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </motion.div>

      {error && (
        <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-4">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Personality */}
        {personality && pMeta && (
          <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                {pMeta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h2 className="text-sm md:text-base font-bold">Your Financial Personality</h2>
                  <span className={`badge ${pMeta.color}`}>{personality.type}</span>
                </div>
                <p className="text-xs md:text-sm text-slate-400 mb-3">{pMeta.desc}</p>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(personality.scores ?? {}).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-slate-400 mb-1">{k}</p>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width:`${Math.min(v*100,100)}%` }} />
                      </div>
                      <p className="text-xs font-medium mt-1">{(v*100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Prediction */}
        {prediction && (
          <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                <TrendingUp size={16} />
              </div>
              <div>
                <h2 className="text-sm md:text-base font-semibold">Next Month Prediction</h2>
                <p className="text-xs text-slate-400">Linear Regression model</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className="text-lg md:text-2xl font-bold text-teal-500">{formatCurrency(prediction.nextMonth)}</p>
                <p className="text-xs text-slate-400 mt-0.5">Predicted</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className="text-lg md:text-2xl font-bold">{formatCurrency(prediction.avgMonthly)}</p>
                <p className="text-xs text-slate-400 mt-0.5">Monthly Avg</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className={`text-lg md:text-2xl font-bold ${prediction.trend==='up'?'text-red-500':'text-green-500'}`}>
                  {prediction.trend==='up'?'▲':'▼'} {prediction.trendPct?.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400 mt-0.5">vs this month</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Anomalies */}
        <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-semibold">Unusual Spending</h2>
              <p className="text-xs text-slate-400">Isolation Forest detection</p>
            </div>
          </div>
          {anomalies.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <p className="text-2xl mb-1">✅</p>
              <p className="text-sm">No unusual patterns detected!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {anomalies.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{a.description}</p>
                    <p className="text-xs text-slate-400">{new Date(a.date).toLocaleDateString()} · {a.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-amber-600 text-sm">{formatCurrency(a.amount)}</p>
                    <p className="text-xs text-slate-400">{a.pctAboveAvg?.toFixed(0)}% above avg</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recommendations */}
        <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
              <Lightbulb size={16} />
            </div>
            <h2 className="text-sm md:text-base font-semibold">Savings Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-xl shrink-0">{r.icon}</span>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{r.detail}</p>
                  {r.potentialSaving && (
                    <p className="text-xs text-teal-500 font-semibold mt-1.5">
                      Save up to {formatCurrency(r.potentialSaving)}/mo
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}