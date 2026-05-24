const router = require('express').Router()
const jwt    = require('jsonwebtoken')
const User   = require('../models/User')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' })
    const user  = await User.create({ name, email, password })
    const token = signToken(user._id)
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })
    const token = signToken(user._id)
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router