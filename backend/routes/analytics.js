const router      = require('express').Router()
const protect     = require('../middleware/auth')
const Transaction = require('../models/Transaction')

router.get('/summary', protect, async (req, res) => {
  const uid = req.user._id
  try {
    const monthly = await Transaction.aggregate([
      { $match: { user: uid } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    const monthMap = {}
    for (const m of monthly) {
      const key = `${m._id.year}-${String(m._id.month).padStart(2,'0')}`
      if (!monthMap[key]) monthMap[key] = { month: key+'-01', income: 0, expenses: 0 }
      if (m._id.type === 'income')  monthMap[key].income   += m.total
      if (m._id.type === 'expense') monthMap[key].expenses += m.total
    }
    const monthlyData = Object.values(monthMap).map(m => ({
      ...m,
      savings:     m.income - m.expenses,
      savingsRate: m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0,
    }))

    const byCategory = await Transaction.aggregate([
      { $match: { user: uid, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $project: { category: '$_id', total: 1, _id: 0 } },
    ])

    const totals = await Transaction.aggregate([
      { $match: { user: uid } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ])
    const totalIncome   = totals.find(t => t._id === 'income')?.total  ?? 0
    const totalExpenses = totals.find(t => t._id === 'expense')?.total ?? 0
    const netSavings    = totalIncome - totalExpenses
    const savingsRatio  = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0
    const healthScore   = Math.min(Math.round(savingsRatio * 2 + monthlyData.length * 5 + 30), 100)

    res.json({ summary: { totalIncome, totalExpenses, netSavings, savingsRatio }, monthly: monthlyData, byCategory, healthScore })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router