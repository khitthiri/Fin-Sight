import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { getAnalytics } from '../utils/api'
import { formatCurrency, formatMonth, categoryHex } from '../utils/formatters'

export default function AnalyticsPage() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-full">
    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div>

  const monthly    = data?.monthly ?? []
  const byCategory = data?.byCategory ?? []
  const weekly     = data?.weekly ?? []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Deep dive into your spending patterns</p>
      </motion.div>

      {/* Bar chart – monthly expense comparison */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-base font-semibold mb-5">Monthly Expense Comparison</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly} margin={{ left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={formatMonth} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
            <Legend />
            <Bar dataKey="income"   name="Income"   fill="#22c55e" radius={[6,6,0,0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Line chart – savings trend */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-base font-semibold mb-5">Savings Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthly} margin={{ left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={formatMonth} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
            <Line type="monotone" dataKey="savings" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4, fill: '#14b8a6' }} name="Net Savings" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category breakdown bar */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-base font-semibold mb-5">Spending by Category</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `$${v}`} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} width={90} />
            <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
            <Bar dataKey="total" radius={[0,6,6,0]}>
              {byCategory.map((entry, i) => (
                <Cell key={i} fill={categoryHex(entry.category)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary table */}
      <motion.div className="card overflow-hidden p-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold">Monthly Summary Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/40">
              <tr>
                {['Month','Income','Expenses','Savings','Savings %'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthly.map((m, i) => (
                <tr key={i} className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-5 py-3.5 font-medium">{formatMonth(m.month)}</td>
                  <td className="px-5 py-3.5 text-green-500 font-mono">{formatCurrency(m.income)}</td>
                  <td className="px-5 py-3.5 text-red-500 font-mono">{formatCurrency(m.expenses)}</td>
                  <td className={`px-5 py-3.5 font-mono font-semibold ${m.savings >= 0 ? 'text-brand-500' : 'text-red-500'}`}>{formatCurrency(m.savings)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${m.savingsRate >= 20 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                      {m.savingsRate?.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}