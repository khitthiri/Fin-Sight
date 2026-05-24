import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'brand', delay = 0 }) {
  const colors = {
    brand:  'bg-teal-500/10 text-teal-600',
    green:  'bg-green-500/10 text-green-600',
    red:    'bg-red-500/10 text-red-600',
    purple: 'bg-purple-500/10 text-purple-600',
    amber:  'bg-amber-500/10 text-amber-600',
  }
  return (
    <motion.div className="card"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </motion.div>
  )
}
