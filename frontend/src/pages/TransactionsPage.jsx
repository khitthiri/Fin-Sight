import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Search, X, Upload } from 'lucide-react'
import { getTransactions, createTransaction, deleteTransaction, uploadCSV } from '../utils/api'
import { formatCurrency, categoryColor } from '../utils/formatters'

const CATEGORIES = ['Food','Housing','Transport','Entertainment','Health','Shopping','Utilities','Other']

export default function TransactionsPage() {
  const [txns, setTxns]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm] = useState({
    description:'', amount:'', type:'expense',
    category:'Food', date: new Date().toISOString().split('T')[0]
  })

  const load = async () => {
    setLoading(true)
    try { const res = await getTransactions({ search, category: catFilter }); setTxns(res.data) }
    catch {} finally { setLoading(false) }
  }
  useEffect(() => { load() }, [search, catFilter])

  const handleAdd = async (e) => {
    e.preventDefault()
    try { await createTransaction(form); setShowForm(false); load() }
    catch (err) { alert(err.response?.data?.message || 'Failed to add') }
  }
  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    try { await deleteTransaction(id); load() } catch {}
  }
  const handleCSV = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const fd = new FormData(); fd.append('file', file)
    try { await uploadCSV(fd); load() } catch { alert('Upload failed') }
  }

  return (
    <div className="page">
      {/* Header */}
      <motion.div className="flex flex-wrap items-center justify-between gap-3 mb-5"
        initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-slate-400 mt-0.5">{txns.length} records</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="btn-ghost flex items-center gap-1.5 cursor-pointer">
            <Upload size={14} /> Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          </label>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
            <Plus size={15} /> Add
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…" className="input pl-9" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input sm:w-40">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table – scrollable on small screens */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-slate-50 dark:bg-slate-800/40">
                {['Date','Description','Category','Type','Amount',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {txns.map((t, i) => (
                  <motion.tr key={t._id}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[160px] truncate">{t.description}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${categoryColor(t.category)}`}>{t.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${t.type==='income'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold font-mono whitespace-nowrap ${t.type==='income'?'text-green-500':'text-red-500'}`}>
                      {t.type==='income'?'+':'-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(t._id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {!loading && txns.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="font-medium mb-1">No transactions yet</p>
              <p className="text-sm">Add one manually or upload a CSV file</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl"
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ type:'spring', damping:25 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold">Add Transaction</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Description</label>
                  <input value={form.description} onChange={e => setForm({...form,description:e.target.value})}
                    placeholder="e.g. Grocery Store" className="input" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Amount ($)</label>
                    <input type="number" step="0.01" min="0" value={form.amount}
                      onChange={e => setForm({...form,amount:e.target.value})} placeholder="0.00" className="input" required />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="input" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Type</label>
                    <select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className="input">
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Category</label>
                    <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="input">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-1">Add Transaction</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}