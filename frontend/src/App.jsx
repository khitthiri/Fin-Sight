import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import DashboardPage    from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import AnalyticsPage    from './pages/AnalyticsPage'
import AIInsightsPage   from './pages/AIInsightsPage'
import BudgetPage       from './pages/BudgetPage'
import GoalsPage        from './pages/GoalsPage'
import Layout           from './components/Layout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:32, height:32, border:'2px solid #14b8a6', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index                element={<DashboardPage />} />
              <Route path="transactions"  element={<TransactionsPage />} />
              <Route path="analytics"     element={<AnalyticsPage />} />
              <Route path="ai-insights"   element={<AIInsightsPage />} />
              <Route path="budget"        element={<BudgetPage />} />
              <Route path="goals"         element={<GoalsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}