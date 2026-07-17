import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, fullName)
      await login(email, password)
      navigate('/chat')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full balance-arc opacity-[0.07] blur-2xl"
        style={{ '--arc-pct': 28 }}
        aria-hidden="true"
      />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-full balance-arc shrink-0"
            style={{ '--arc-pct': 28 }}
            aria-hidden="true"
          />
          <span className="font-display font-semibold text-paper text-lg tracking-tight">
            Multi Model
          </span>
        </div>

        <div className="bg-ink-raised border border-ink-line rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h1 className="font-display text-2xl font-semibold text-paper mb-1.5 tracking-tight">
            Create your account
          </h1>
          <p className="text-paper-muted text-sm mb-7">
            Start with a free balance, top up anytime
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal transition"
                placeholder="Your name"
              />
            </div>

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
                minLength={8}
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal transition"
                placeholder="At least 8 characters"
              />
              <p className="text-paper-faint text-xs mt-1.5">
                Must include an uppercase letter, a lowercase letter, and a number.
              </p>
            </div>

            {error && (
              <p className="text-danger text-sm" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed text-ink font-display font-semibold py-2.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-ink-raised"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-paper-muted text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-signal hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}