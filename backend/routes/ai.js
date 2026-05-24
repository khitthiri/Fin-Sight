const router      = require('express').Router()
const axios       = require('axios')
const protect     = require('../middleware/auth')
const Transaction = require('../models/Transaction')

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

async function callFlask(endpoint, userId) {
  const txns = await Transaction.find({ user: userId }).sort({ date: -1 }).limit(500).lean()
  const payload = {
    transactions: txns.map(t => ({
      date: t.date, amount: t.amount, type: t.type,
      category: t.category, description: t.description,
    })),
  }
  const res = await axios.post(`${AI_URL}${endpoint}`, payload, { timeout: 15000 })
  return res.data
}

router.post('/insights',    protect, async (req, res) => {
  try { res.json(await callFlask('/predict/insights',     req.user._id)) }
  catch (err) { res.status(503).json({ message: 'AI service unavailable: ' + err.message }) }
})
router.post('/predict',     protect, async (req, res) => {
  try { res.json(await callFlask('/predict/expenses',     req.user._id)) }
  catch (err) { res.status(503).json({ message: 'AI service unavailable: ' + err.message }) }
})
router.post('/personality', protect, async (req, res) => {
  try { res.json(await callFlask('/predict/personality',  req.user._id)) }
  catch (err) { res.status(503).json({ message: 'AI service unavailable: ' + err.message }) }
})

module.exports = router