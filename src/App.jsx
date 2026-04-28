import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import BoardsPage from './pages/BoardsPage'
import BoardPage from './pages/BoardPage'

function PrivateRoute({ children }) {
  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Yükleniyor...</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><BoardsPage /></PrivateRoute>} />
      <Route path="/board/:id" element={<PrivateRoute><BoardPage /></PrivateRoute>} />
    </Routes>
  )
}
