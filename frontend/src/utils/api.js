import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'
})

// Automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const register = (data) => api.post('/auth/register', data)
export const login    = (data) => api.post('/auth/login', data)

export const getTransactions   = (params) => api.get('/transactions', { params })
export const createTransaction = (data)   => api.post('/transactions', data)
export const deleteTransaction = (id)     => api.delete(`/transactions/${id}`)
export const uploadCSV         = (form)   => api.post('/transactions/upload', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
})

export const getAnalytics   = ()     => api.get('/analytics/summary')
export const getAIInsights  = (data) => api.post('/ai/insights', data)
export const getPrediction  = (data) => api.post('/ai/predict', data)
export const getPersonality = (data) => api.post('/ai/personality', data)

export default api