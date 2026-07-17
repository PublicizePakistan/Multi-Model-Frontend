// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\TopUp.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'
import { initiatePayment } from '../api/payments'

export default function TopUp() {
  const { user } = useAuth()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { loadPackages() }, [])

  async function loadPackages() {
    setLoading(true)
    try {
      const res = await apiClient.get('/topups/packages')
      setPackages(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load packages.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleBuy(pkg) {
    setPaying(pkg.id)
    setError('')
    try {
      const result = await initiatePayment({
        amountPkr: pkg.price_pkr,
        description: `Top-up: ${pkg.display_name} — ${pkg.base_points + pkg.bonus_points} pts`,
        transactionType: 'topup',
        topupPackageId: pkg.id,
      })
      window.location.href = result.checkout_url
    } catch (err) {
      setError(getErrorMessage(err, 'Could not initiate payment. Please try again.'))
      setPaying(null)
    }
  }

  const COLORS = [
    { border: 'border-ink-line',  btn: 'bg-ink-line hover:bg-ink-line/80 text-paper' },
    { border: 'border-signal',    btn: 'bg-signal hover:bg-signal/90 text-white' },
    { border: 'border-gold',      btn: 'bg-gold hover:bg-gold/90 text-ink' },
    { border: 'border-success',   btn: 'bg-success hover:bg-success/90 text-white' },
  ]

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-ink-line px-6 py-4 flex items-center justify-between">
        <Link to="/chat" className="text-paper-muted hover:text-paper text-sm transition">
          ← Back to chat
        </Link>
        <span className="text-paper-muted text-sm">{user?.full_name}</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center animate-fade-up">
          <h1 className="font-display text-3xl font-semibold text-paper">Top Up Points</h1>
          <p className="text-paper-muted mt-2">
            Pay securely via JazzCash, Easypaisa or Card — points credited instantly after payment
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <span className="text-paper-muted text-sm font-medium">💳 JazzCash</span>
            <span className="text-paper-muted text-sm font-medium">📱 Easypaisa</span>
            <span className="text-paper-muted text-sm font-medium">🏦 Debit / Credit Card</span>
          </div>
        </div>

        {error && (
          <p className="text-danger text-sm text-center mb-6" role="alert">{error}</p>
        )}

        {loading ? (
          <p className="text-paper-muted text-center">Loading packages…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.map((pkg, i) => {
              const color = COLORS[i % COLORS.length]
              const totalPoints = (pkg.base_points || 0) + (pkg.bonus_points || 0)
              return (
                <div key={pkg.id}
                  className={`bg-ink-raised border ${color.border} rounded-2xl p-5 flex flex-col`}>
                  <h3 className="font-display text-lg font-semibold text-paper">{pkg.display_name}</h3>
                  <p className="font-display text-3xl font-bold text-paper mt-3">
                    Rs {Number(pkg.price_pkr).toLocaleString()}
                  </p>
                  <p className="text-gold text-sm font-medium mt-1">
                    {totalPoints.toLocaleString()} pts
                  </p>
                  {pkg.bonus_points > 0 && (
                    <p className="text-success text-xs mt-1 mb-2">
                      +{pkg.bonus_points} bonus pts included
                    </p>
                  )}
                  <div className="flex-1 mt-3" />
                  <button
                    onClick={() => handleBuy(pkg)}
                    disabled={paying === pkg.id}
                    className={`w-full font-display font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${color.btn}`}
                  >
                    {paying === pkg.id ? 'Redirecting…' : 'Buy now'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-paper-faint text-xs text-center mt-8">
          Payments processed securely by DialogPay ·
          15% WHT applies per Pakistan tax regulations ·
          Points are non-refundable
        </p>
      </main>
    </div>
  )
}
