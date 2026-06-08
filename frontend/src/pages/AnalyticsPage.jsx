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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div style={{ width:32,height:32,border:'2px solid #14b8a6',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
    </div>
  )

  const monthly    = data?.monthly    ?? []
  const byCategory = data?.byCategory ?? []

  return (
    <div className="page">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Deep dive into your spending patterns</p>
      </motion.div>

      <div className="space-y-4 md:space-y-6">
        {/* Bar chart */}
        <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
          <h2 className="text-sm md:text-base font-semibold mb-4">Monthly Expense Comparison</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ left:-20, right:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'var(--text-muted)' }} tickFormatter={formatMonth} />
              <YAxis tick={{ fontSize:10, fill:'var(--text-muted)' }} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, fontSize:12 }} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Bar dataKey="income"   name="Income"   fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line chart */}
        <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
          <h2 className="text-sm md:text-base font-semibold mb-4">Savings Trend</h2>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={monthly} margin={{ left:-20, right:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'var(--text-muted)' }} tickFormatter={formatMonth} />
              <YAxis tick={{ fontSize:10, fill:'var(--text-muted)' }} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, fontSize:12 }} />
              <Line type="monotone" dataKey="savings" stroke="#14b8a6" strokeWidth={2.5} dot={{ r:3, fill:'#14b8a6' }} name="Net Savings" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Horizontal bar – categories */}
        <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <h2 className="text-sm md:text-base font-semibold mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={Math.max(byCategory.length * 36, 180)}>
            <BarChart data={byCategory} layout="vertical" margin={{ left:10, right:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:10, fill:'var(--text-muted)' }} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize:11, fill:'var(--text-muted)' }} width={80} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, fontSize:12 }} />
              <Bar dataKey="total" radius={[0,6,6,0]}>
                {byCategory.map((entry, i) => <Cell key={i} fill={categoryHex(entry.category)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Summary table – scrollable on mobile */}
        <motion.div className="card overflow-hidden p-0" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
          <div className="px-4 md:px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-sm md:text-base font-semibold">Monthly Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[440px]">
              <thead className="bg-slate-50 dark:bg-slate-800/40">
                <tr>
                  {['Month','Income','Expenses','Savings','Rate'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthly.map((m, i) => (
                  <tr key={i} className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-medium text-xs md:text-sm whitespace-nowrap">{formatMonth(m.month)}</td>
                    <td className="px-4 py-3 text-green-500 font-mono text-xs md:text-sm">{formatCurrency(m.income)}</td>
                    <td className="px-4 py-3 text-red-500 font-mono text-xs md:text-sm">{formatCurrency(m.expenses)}</td>
                    <td className={`px-4 py-3 font-mono font-semibold text-xs md:text-sm ${m.savings>=0?'text-teal-500':'text-red-500'}`}>{formatCurrency(m.savings)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${m.savingsRate>=20?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300':'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
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
    </div>
  )
}