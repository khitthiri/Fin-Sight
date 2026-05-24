require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const mongoose = require('mongoose')
const path     = require('path')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth',         require('./routes/auth'))
app.use('/api/transactions', require('./routes/transactions'))
app.use('/api/analytics',    require('./routes/analytics'))
app.use('/api/ai',           require('./routes/ai'))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => console.error('❌  MongoDB error:', err.message))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀  Backend running on http://localhost:${PORT}`))