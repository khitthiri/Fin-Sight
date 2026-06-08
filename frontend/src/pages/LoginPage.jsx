import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, Mail, Lock, AlertCircle } from 'lucide-react'
import { login as apiLogin } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await apiLogin(form)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-8">
      <motion.div className="w-full max-w-sm"
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}>
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold">FinSight</span>
        </div>
        <div className="card">
          <h1 className="text-lg font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-5">Sign in to your account</p>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="email" type="email" value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})}
                  placeholder="you@example.com" className="input pl-9" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="password" type="password" value={form.password}
                  onChange={e => setForm({...form, password:e.target.value})}
                  placeholder="••••••••" className="input pl-9" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-center text-slate-400 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-500 font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}