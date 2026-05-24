import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LayoutDashboard, ArrowLeftRight, BarChart3, Sparkles, LogOut, Sun, Moon, Wallet } from 'lucide-react'

const nav = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/analytics',    icon: BarChart3,        label: 'Analytics' },
  { to: '/ai-insights',  icon: Sparkles,         label: 'AI Insights' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <aside className="w-64 flex flex-col shrink-0 bg-[var(--surface)] border-r border-[var(--border)]">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[var(--border)]">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center">
            <Wallet size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold">FinSight</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-teal-500/10 text-teal-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-1 border-t border-[var(--border)] pt-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 mb-2">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={toggle} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={() => { logout(); navigate('/login') }} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  )
}