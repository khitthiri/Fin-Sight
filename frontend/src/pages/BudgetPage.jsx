import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Save } from 'lucide-react'
import { getAnalytics } from '../utils/api'
import { formatCurrency, categoryHex } from '../utils/formatters'

const CATEGORIES = ['Food','Housing','Transport','Entertainment','Health','Shopping','Utilities','Other']

const DEFAULT_BUDGETS = {
  Food: 400, Housing: 1500, Transport: 200,
  Entertainment: 150, Health: 100, Shopping: 300,
  Utilities: 200, Other: 100,
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('budgets')
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS
  })
  const [actuals, setActuals] = useState({})
  const [editing, setEditing] = useState(null)
  const [tempVal, setTempVal] = useState('')
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    getAnalytics().then(r => {
      const map = {}
      for (const c of (r.data.byCategory ?? [])) map[c.category] = c.total
      setActuals(map)
    }).catch(() => {})
  }, [])

  const saveBudgets = () => {
    localStorage.setItem('budgets', JSON.stringify(budgets))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0)
  const totalSpent  = Object.values(actuals).reduce((a, b) => a + b, 0)
  const totalPct    = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0
  const overallColor = totalPct >= 90 ? '#ef4444' : totalPct >= 70 ? '#f59e0b' : '#22c55e'

  return (
    <div className="page">
      <motion.div className="flex flex-wrap items-center justify-between gap-3 mb-6"
        initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Target size={22} className="text-teal-500" /> Budget Planner
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Set monthly limits per category</p>
        </div>
        <button onClick={saveBudgets} className="btn-primary flex items-center gap-2">
          <Save size={15} /> {saved ? 'Saved ✓' : 'Save'}
        </button>
      </motion.div>

      {/* Overall summary */}
      <motion.div className="card mb-4" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Spent</p>
            <p className="text-2xl font-bold" style={{ color: overallColor }}>{formatCurrency(totalSpent)}</p>
          </div>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: overallColor }}
            initial={{ width:0 }} animate={{ width:`${totalPct}%` }} transition={{ duration:1 }} />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">{totalPct.toFixed(0)}% of budget used</p>
      </motion.div>

      {/* Per-category */}
      <div className="space-y-3">
        {CATEGORIES.map((cat, i) => {
          const budget = budgets[cat] ?? 0
          const spent  = actuals[cat]  ?? 0
          const pct    = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
          const over   = spent > budget
          const barColor = over ? '#ef4444' : pct >= 75 ? '#f59e0b' : categoryHex(cat)

          return (
            <motion.div key={cat} className="card"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: categoryHex(cat) }} />
                  <span className="font-medium text-sm">{cat}</span>
                  {over && <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Over!</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">{formatCurrency(spent)} /</span>
                  {editing === cat ? (
                    <input type="number" value={tempVal}
                      onChange={e => setTempVal(e.target.value)}
                      className="input w-24 py-1 text-sm"
                      autoFocus
                      onBlur={() => { setBudgets(b => ({...b, [cat]: parseFloat(tempVal)||0})); setEditing(null) }}
                      onKeyDown={e => { if (e.key==='Enter') { setBudgets(b => ({...b,[cat]:parseFloat(tempVal)||0})); setEditing(null) }}} />
                  ) : (
                    <button onClick={() => { setEditing(cat); setTempVal(budget) }}
                      className="text-sm font-semibold hover:text-teal-500 transition-colors">
                      {formatCurrency(budget)}
                    </button>
                  )}
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: barColor }}
                  initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8, delay: i*0.04 }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {pct.toFixed(0)}% used
                {!over && budget > spent && ` · ${formatCurrency(budget - spent)} remaining`}
                {over && ` · ${formatCurrency(spent - budget)} over budget`}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}