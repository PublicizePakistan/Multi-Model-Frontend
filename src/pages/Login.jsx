import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/chat')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(detail || 'Login failed. Check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient signature: a faint, slowly-pulsing balance arc behind everything */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full balance-arc opacity-[0.07] blur-2xl"
        style={{ '--arc-pct': 72 }}
        aria-hidden="true"
      />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        {/* Brand mark */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-full balance-arc shrink-0"
            style={{ '--arc-pct': 72 }}
            aria-hidden="true"
          />
          <span className="font-display font-semibold text-paper text-lg tracking-tight">
            Multi Model
          </span>
        </div>

        <div className="bg-ink-raised border border-ink-line rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h1 className="font-display text-2xl font-semibold text-paper mb-1.5 tracking-tight">
            Welcome back
          </h1>
          <p className="text-paper-muted text-sm mb-7">
            Log in to top up and start chatting
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-danger text-sm" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signal hover:bg-signal/90 disabled:opacity-50 disabled:cursor-not-allowed text-ink font-display font-semibold py-2.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 focus:ring-offset-ink-raised"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>

        <p className="text-paper-muted text-sm mt-6 text-center">
          New here?{' '}
          <Link to="/register" className="text-gold hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}