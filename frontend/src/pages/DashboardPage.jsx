import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { DollarSign, TrendingDown, PiggyBank, Activity, Upload, Plus } from 'lucide-react'
import { getAnalytics, uploadCSV } from '../utils/api'
import { formatCurrency, categoryHex, formatMonth } from '../utils/formatters'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    try {
      const res = await getAnalytics()
      setData(res.data)
    } catch { /* handled silently */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCSV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try { await uploadCSV(form); load() } catch (err) { alert('Upload failed: ' + err.message) }
    finally { setUploading(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const summary = data?.summary ?? {}
  const monthly = data?.monthly ?? []
  const byCategory = data?.byCategory ?? []
  const health  = data?.healthScore ?? 72
  const healthColor = health >= 75 ? '#22c55e' : health >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Here's your financial overview</p>
        </div>
        <div className="flex gap-3">
          <label className="btn-ghost flex items-center gap-2 cursor-pointer text-sm">
            <Upload size={16} />
            {uploading ? 'Uploading…' : 'Upload CSV'}
            <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          </label>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Income"   value={formatCurrency(summary.totalIncome)}   icon={DollarSign}    color="green"  delay={0}    trend="up" />
        <StatCard title="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={TrendingDown}  color="red"    delay={0.05} trend="down" />
        <StatCard title="Net Savings"    value={formatCurrency(summary.netSavings)}    icon={PiggyBank}     color="brand"  delay={0.1} />
        <StatCard title="Savings Ratio"  value={`${summary.savingsRatio ?? 0}%`}       icon={Activity}      color="purple" delay={0.15}
          subtitle={summary.savingsRatio >= 20 ? '✓ On track' : 'Below recommended 20%'} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend */}
        <motion.div className="card lg:col-span-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-base font-semibold mb-5">Monthly Cash Flow</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={formatMonth} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
              <Legend />
              <Area type="monotone" dataKey="income"   stroke="#22c55e" fill="url(#incGrad)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category pie */}
        <motion.div className="card"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <h2 className="text-base font-semibold mb-5">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={byCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {byCategory.map((entry, i) => (
                  <Cell key={i} fill={categoryHex(entry.category)} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {byCategory.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: categoryHex(c.category) }} />
                  <span className="text-[var(--text-muted)]">{c.category}</span>
                </div>
                <span className="font-medium">{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Financial Health Score */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Financial Health Score</h2>
            <p className="text-sm text-[var(--text-muted)]">Based on savings ratio, spending patterns, and consistency</p>
          </div>
          <div className="text-4xl font-bold" style={{ color: healthColor }}>{health}</div>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: healthColor }}
            initial={{ width: 0 }}
            animate={{ width: `${health}%` }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
          <span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span>
        </div>
      </motion.div>
    </div>
  )
}