// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import TopUp from './pages/TopUp'
import Subscription from './pages/Subscription'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Support from './pages/Support'
import History from './pages/History'
import ImageGen from './pages/ImageGen'
import Files from './pages/Files'
import Payments from './pages/Payments'
import Admin from './pages/Admin'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-ink flex items-center justify-center text-paper">Loading…</div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function P({ children }) { return <ProtectedRoute>{children}</ProtectedRoute> }

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<P><Chat /></P>} />
          <Route path="/topup" element={<P><TopUp /></P>} />
          <Route path="/subscription" element={<P><Subscription /></P>} />
          <Route path="/profile" element={<P><Profile /></P>} />
          <Route path="/notifications" element={<P><Notifications /></P>} />
          <Route path="/support" element={<P><Support /></P>} />
          <Route path="/history" element={<P><History /></P>} />
          <Route path="/images" element={<P><ImageGen /></P>} />
          <Route path="/files" element={<P><Files /></P>} />
          <Route path="/payments" element={<P><Payments /></P>} />
          <Route path="/admin" element={<P><Admin /></P>} />
          <Route path="/payment/success" element={<P><PaymentSuccess /></P>} />
          <Route path="/payment/failed" element={<P><PaymentFailed /></P>} />
          <Route path="/payment/pending" element={<P><PaymentSuccess /></P>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
