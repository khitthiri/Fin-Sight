import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon:Icon, trend, color='brand', delay=0 }) {
  const colors = {
    brand:  'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    green:  'bg-green-500/10 text-green-600 dark:text-green-400',
    red:    'bg-red-500/10 text-red-600 dark:text-red-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    amber:  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  }
  return (
    <motion.div className="card"
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={17} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend==='up'?'text-green-500':'text-red-500'}`}>
            {trend==='up' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
          </span>
        )}
      </div>
      <p className="text-lg md:text-xl lg:text-2xl font-bold mb-0.5 truncate">{value}</p>
      <p className="text-xs font-medium text-slate-400">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
    </motion.div>
  )
}