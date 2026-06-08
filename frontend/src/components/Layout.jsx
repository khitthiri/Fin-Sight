import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, ArrowLeftRight, BarChart3,
  Sparkles, LogOut, Sun, Moon, Wallet, Target, Star, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/analytics',    icon: BarChart3,        label: 'Analytics' },
  { to: '/ai-insights',  icon: Sparkles,         label: 'AI Insights' },
  { to: '/budget',       icon: Target,           label: 'Budget' },
  { to: '/goals',        icon: Star,             label: 'Goals' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  const currentPage = nav.find(n => n.to === location.pathname)?.label ?? 'FinSight'

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">

      {/* ── SIDEBAR (desktop: always visible, tablet: hidden) ── */}
      <aside className="hidden lg:flex w-60 xl:w-64 flex-col shrink-0 bg-[var(--surface)] border-r border-[var(--border)]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Wallet size={16} className="text-white" />
          </div>
          <span className="text-base font-bold">FinSight</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-[var(--border)] pt-3 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 mb-1">
            <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={toggle} className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[var(--surface)] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center">
                  <Wallet size={16} className="text-white" />
                </div>
                <span className="font-bold">FinSight</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {nav.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}>
                  <Icon size={17} />{label}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 pb-5 border-t border-[var(--border)] pt-3 space-y-1">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 mb-1">
                <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button onClick={toggle} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60">
                {dark ? <Sun size={15} /> : <Moon size={15} />}
                {dark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar (mobile + tablet) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu size={20} />
            </button>
            <span className="font-semibold text-sm">{currentPage}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggle} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}