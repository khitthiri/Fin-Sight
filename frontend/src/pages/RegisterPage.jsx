import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, User, Mail, Lock, AlertCircle } from 'lucide-react'
import { register as apiRegister } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await apiRegister(form)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <motion.div className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-teal-500 flex items-center justify-center">
            <Wallet size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold">FinSight</span>
        </div>
        <div className="card">
          <h1 className="text-xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-slate-400 mb-6">Start analyzing your finances with AI</p>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name:'name',     type:'text',     placeholder:'Full name',       icon: User },
              { name:'email',    type:'email',    placeholder:'you@example.com', icon: Mail },
              { name:'password', type:'password', placeholder:'8+ characters',   icon: Lock },
            ].map(({ name, type, placeholder, icon: Icon }) => (
              <div key={name}>
                <label className="text-sm font-medium mb-1.5 block capitalize">{name}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name={name} type={type} value={form[name]}
                    onChange={e => setForm({...form, [name]: e.target.value})}
                    placeholder={placeholder} className="input pl-10" required />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="text-sm text-center text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-500 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}