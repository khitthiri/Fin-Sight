const router      = require('express').Router()
const multer      = require('multer')
const Papa        = require('papaparse')
const fs          = require('fs')
const protect     = require('../middleware/auth')
const Transaction = require('../models/Transaction')

const upload = multer({ dest: 'uploads/' })

const CATEGORY_RULES = {
  Food:          ['grocery','restaurant','coffee','food','dining','lunch','dinner','cafe','pizza','burger'],
  Housing:       ['rent','mortgage','electric','gas','water','utility','internet','phone','bill','insurance'],
  Transport:     ['uber','lyft','gas station','fuel','transit','parking','taxi','train','bus'],
  Entertainment: ['netflix','spotify','hulu','movie','cinema','concert','game','streaming'],
  Health:        ['pharmacy','doctor','hospital','gym','fitness','medical','dental'],
  Shopping:      ['amazon','clothing','store','shop','mall','target','walmart','online'],
}

function autoCategory(description = '') {
  const lower = description.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return 'Other'
}

router.get('/', protect, async (req, res) => {
  const { search, category } = req.query
  const filter = { user: req.user._id }
  if (category) filter.category = category
  if (search)   filter.description = { $regex: search, $options: 'i' }
  try {
    const txns = await Transaction.find(filter).sort({ date: -1 }).limit(200)
    res.json(txns)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/', protect, async (req, res) => {
  try {
    const txn = await Transaction.create({ ...req.body, user: req.user._id })
    res.status(201).json(txn)
  } catch (err) { res.status(400).json({ message: err.message }) }
})

router.delete('/:id', protect, async (req, res) => {
  try {
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!txn) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  try {
    const raw = fs.readFileSync(req.file.path, 'utf8')
    const { data } = Papa.parse(raw, { header: true, skipEmptyLines: true })
    const docs = data.map(row => ({
      user:        req.user._id,
      description: row.description || row.Description || 'Unknown',
      amount:      parseFloat(row.amount || row.Amount || 0),
      type:        (row.type || row.Type || 'expense').toLowerCase(),
      category:    row.category || autoCategory(row.description || row.Description),
      date:        new Date(row.date || row.Date || Date.now()),
    })).filter(d => d.amount > 0)
    await Transaction.insertMany(docs)
    fs.unlinkSync(req.file.path)
    res.json({ imported: docs.length })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router