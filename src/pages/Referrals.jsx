// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Referrals.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'

export default function Referrals() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoSuccess, setPromoSuccess] = useState('')
  const [promoError, setPromoError] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    try {
      const res = await apiClient.get('/growth/referrals')
      setStats(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load referral stats.'))
    } finally {
      setLoading(false)
    }
  }

  function copyCode() {
    if (!stats?.referral_code) return
    navigator.clipboard.writeText(stats.referral_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRedeemPromo(e) {
    e.preventDefault()
    setPromoLoading(true)
    setPromoError('')
    setPromoSuccess('')
    try {
      const res = await apiClient.post('/growth/promo-codes/redeem', { code: promoCode })
      setPromoSuccess(res.data.message)
      setPromoCode('')
    } catch (err) {
      setPromoError(getErrorMessage(err, 'Could not redeem promo code.'))
    } finally {
      setPromoLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-ink-line px-6 py-4 flex items-center justify-between">
        <Link to="/chat" className="text-paper-muted hover:text-paper text-sm transition">
          ← Back to chat
        </Link>
        <span className="text-paper-muted text-sm">{user?.full_name}</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-3xl font-semibold text-paper">
            Referrals & Promo Codes
          </h1>
          <p className="text-paper-muted text-sm mt-1">
            Invite friends and earn bonus points
          </p>
        </div>

        {error && (
          <p className="text-danger text-sm mb-6" role="alert">{error}</p>
        )}

        {/* Referral code */}
        <div className="bg-ink-raised border border-ink-line rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg font-semibold text-paper mb-1">
            Your referral code
          </h2>
          <p className="text-paper-muted text-sm mb-5">
            Share this code with friends. When they sign up and subscribe, you both earn bonus points.
          </p>

          {loading ? (
            <p className="text-paper-muted text-sm">Loading…</p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 bg-ink border border-ink-line rounded-lg px-4 py-3">
                  <p className="font-display text-xl font-bold text-gold tracking-widest">
                    {stats?.referral_code || '—'}
                  </p>
                </div>
                <button
                  onClick={copyCode}
                  className="bg-signal hover:bg-signal/90 text-white font-medium px-4 py-3 rounded-lg transition text-sm"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total referrals', value: stats?.total_referrals ?? 0 },
                  { label: 'Converted', value: stats?.converted_referrals ?? 0 },
                  { label: 'Points earned', value: (stats?.points_earned ?? 0).toLocaleString() },
                ].map((s) => (
                  <div key={s.label} className="bg-ink border border-ink-line rounded-xl p-4 text-center">
                    <p className="font-display text-2xl font-bold text-paper">{s.value}</p>
                    <p className="text-paper-faint text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Promo code */}
        <div className="bg-ink-raised border border-ink-line rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-paper mb-1">
            Redeem a promo code
          </h2>
          <p className="text-paper-muted text-sm mb-5">
            Have a promo code? Enter it below to get a discount on your next subscription.
          </p>

          <form onSubmit={handleRedeemPromo} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                required
                placeholder="LAUNCH50"
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition font-display tracking-widest"
              />
              <button
                type="submit"
                disabled={promoLoading || !promoCode.trim()}
                className="bg-gold hover:bg-gold/90 disabled:opacity-50 text-ink font-display font-semibold px-6 py-2.5 rounded-lg transition"
              >
                {promoLoading ? 'Redeeming…' : 'Redeem'}
              </button>
            </div>
            {promoError && (
              <p className="text-danger text-sm" role="alert">{promoError}</p>
            )}
            {promoSuccess && (
              <p className="text-success text-sm">{promoSuccess}</p>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
