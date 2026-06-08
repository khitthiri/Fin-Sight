import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, BarChart3, Sparkles, Target } from 'lucide-react'

const tabs = [
  { to: '/',             icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/budget',       icon: Target,           label: 'Budget' },
  { to: '/analytics',    icon: BarChart3,        label: 'Analytics' },
  { to: '/ai-insights',  icon: Sparkles,         label: 'AI' },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] border-t border-[var(--border)] flex md:hidden">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-teal-500' : 'text-slate-400'
            }`}>
          {({ isActive }) => (
            <>
              <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}