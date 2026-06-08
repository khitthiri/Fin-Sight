import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus, Trash2, X, CheckCircle } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

const GOAL_ICONS = ['🏠','🚗','✈️','📱','💍','🎓','🏖️','💰','🏋️','🎮']

function GoalCard({ goal, onDelete, onUpdate }) {
  const pct       = Math.min((goal.saved / goal.target) * 100, 100)
  const done      = goal.saved >= goal.target
  const remaining = goal.target - goal.saved

  return (
    <motion.div className="card relative"
      initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}>
      {done && <div className="absolute top-3 right-3"><CheckCircle size={18} className="text-green-500" /></div>}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">{goal.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{goal.name}</h3>
          <p className="text-xs text-slate-400">Target: {formatCurrency(goal.target)}</p>
          {goal.deadline && (
            <p className="text-xs text-slate-400">By: {new Date(goal.deadline).toLocaleDateString('en-US',{month:'short',year:'numeric'})}</p>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-semibold text-teal-500">{formatCurrency(goal.saved)} saved</span>
          <span className="text-slate-400">{pct.toFixed(0)}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: done ? '#22c55e' : '#14b8a6' }}
            initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8 }} />
        </div>
        {!done && <p className="text-xs text-slate-400 mt-1">{formatCurrency(remaining)} to go</p>}
        {done  && <p className="text-xs text-green-500 font-medium mt-1">🎉 Goal reached!</p>}
      </div>

      <div className="flex gap-2">
        <input type="number" min="0" placeholder="Add savings…"
          className="input py-1.5 text-sm flex-1"
          onKeyDown={e => {
            if (e.key==='Enter' && e.target.value) {
              onUpdate(goal.id, parseFloat(e.target.value))
              e.target.value = ''
            }
          }} />
        <button onClick={e => {
          const input = e.currentTarget.previousSibling
          if (input.value) { onUpdate(goal.id, parseFloat(input.value)); input.value='' }
        }} className="btn-primary py-1.5 px-3 text-sm">Add</button>
      </div>

      <button onClick={() => onDelete(goal.id)}
        className="absolute top-3 right-8 p-1 rounded-lg text-slate-300 hover:text-red-500 transition-colors">
        <Trash2 size={13} />
      </button>
    </motion.div>
  )
}

export default function GoalsPage() {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('goals')
    return saved ? JSON.parse(saved) : [
      { id:'1', name:'Emergency Fund', icon:'💰', target:5000, saved:1200, deadline:'2024-12-31' },
      { id:'2', name:'Vacation',       icon:'✈️', target:2000, saved:450,  deadline:'2024-08-01' },
    ]
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', target:'', saved:'', icon:'💰', deadline:'' })

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals))
  }, [goals])

  const addGoal = (e) => {
    e.preventDefault()
    setGoals(g => [...g, { ...form, id: Date.now().toString(), target: parseFloat(form.target), saved: parseFloat(form.saved)||0 }])
    setForm({ name:'', target:'', saved:'', icon:'💰', deadline:'' })
    setShowForm(false)
  }

  const deleteGoal = (id) => setGoals(g => g.filter(x => x.id !== id))
  const updateGoal = (id, amount) => setGoals(g =>
    g.map(x => x.id===id ? { ...x, saved: Math.min(x.saved+amount, x.target) } : x)
  )

  const totalTarget = goals.reduce((a, g) => a + g.target, 0)
  const totalSaved  = goals.reduce((a, g) => a + g.saved,  0)

  return (
    <div className="page">
      <motion.div className="flex flex-wrap items-center justify-between gap-3 mb-6"
        initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Star size={22} className="text-teal-500" /> Savings Goals
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Track progress toward your financial goals</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Goal
        </button>
      </motion.div>

      {/* Summary */}
      <motion.div className="card mb-4" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <div className="flex justify-between mb-2">
          <div>
            <p className="text-xs text-slate-400">Total Saved</p>
            <p className="text-2xl font-bold text-teal-500">{formatCurrency(totalSaved)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Target</p>
            <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
          </div>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div className="h-full bg-teal-500 rounded-full"
            initial={{ width:0 }}
            animate={{ width:`${totalTarget > 0 ? Math.min(totalSaved/totalTarget*100,100) : 0}%` }}
            transition={{ duration:1 }} />
        </div>
      </motion.div>

      {/* Goals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onDelete={deleteGoal} onUpdate={updateGoal} />
          ))}
        </AnimatePresence>
      </div>

      {goals.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-medium">No goals yet</p>
          <p className="text-sm">Create your first savings goal to get started</p>
        </div>
      )}

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl"
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ type:'spring', damping:25 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold">New Savings Goal</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={addGoal} className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Goal Name</label>
                  <input value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                    placeholder="e.g. New Car" className="input" required />
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_ICONS.map(icon => (
                      <button key={icon} type="button" onClick={() => setForm({...form,icon})}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                          form.icon===icon ? 'bg-teal-500/20 ring-2 ring-teal-500' : 'bg-slate-100 dark:bg-slate-800'
                        }`}>{icon}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Target ($)</label>
                    <input type="number" min="1" value={form.target}
                      onChange={e => setForm({...form,target:e.target.value})}
                      placeholder="5000" className="input" required />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Already saved ($)</label>
                    <input type="number" min="0" value={form.saved}
                      onChange={e => setForm({...form,saved:e.target.value})}
                      placeholder="0" className="input" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Target Date (optional)</label>
                  <input type="date" value={form.deadline}
                    onChange={e => setForm({...form,deadline:e.target.value})} className="input" />
                </div>
                <button type="submit" className="btn-primary w-full">Create Goal</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}