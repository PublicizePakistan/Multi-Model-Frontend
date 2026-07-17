// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Subscription.jsx
// (REPLACE the existing file completely)

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listPlans, getMySubscription, cancelSubscription, pauseSubscription, resumeSubscription } from '../api/subscriptions'
import { initiatePayment } from '../api/payments'
import { getErrorMessage } from '../api/errors'

function FeatureRow({ label, included }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={included ? 'text-success' : 'text-paper-faint'}>{included ? '✓' : '✕'}</span>
      <span className={included ? 'text-paper-muted' : 'text-paper-faint line-through'}>{label}</span>
    </div>
  )
}

function PlanCard({ plan, currentPlan, onSubscribe, loading }) {
  const isActive = currentPlan?.plan_id === plan.id || currentPlan?.plan?.slug === plan.slug
  const isPro = plan.slug === 'pro'
  const isBusiness = plan.slug === 'business'

  const borderColor = isBusiness ? 'border-gold' : isPro ? 'border-signal' : 'border-ink-line'
  const btnClass = isBusiness
    ? 'bg-gold hover:bg-gold/90 text-ink'
    : isPro
    ? 'bg-signal hover:bg-signal/90 text-white'
    : 'bg-ink-line hover:bg-ink-line/80 text-paper'

  return (
    <div className={`relative bg-ink-raised border ${borderColor} rounded-2xl p-6 flex flex-col`}>
      {isBusiness && (
        <span className="absolute -top-3 left-6 bg-gold text-ink text-xs font-display font-semibold px-3 py-1 rounded-full">
          Most popular
        </span>
      )}
      {isActive && (
        <span className="absolute -top-3 right-6 bg-success text-white text-xs font-display font-semibold px-3 py-1 rounded-full">
          Current plan
        </span>
      )}
      <h3 className="font-display text-xl font-semibold text-paper">{plan.display_name}</h3>
      <p className="text-paper-muted text-sm mt-1 mb-4">{plan.description}</p>
      <p className="font-display text-3xl font-bold text-paper">
        Rs {Number(plan.price_pkr).toLocaleString()}
        <span className="text-base font-normal text-paper-muted">/mo</span>
      </p>
      <p className="text-gold text-sm font-medium mt-1 mb-5">
        {plan.daily_points} pts/day
      </p>
      <div className="space-y-2 mb-6 flex-1">
        <FeatureRow label="AI Chat" included={true} />
        <FeatureRow label="Web Search (+5 pts)" included={plan.features?.web_search} />
        <FeatureRow label="Image Generation" included={plan.features?.image_gen} />
        <FeatureRow label={`PDF Upload (${plan.features?.max_file_mb || 10}MB max)`} included={plan.features?.pdf_upload} />
        <FeatureRow label="API Access" included={plan.features?.api_access} />
        <FeatureRow label="Priority Support" included={plan.features?.priority_support} />
      </div>
      <button
        onClick={() => onSubscribe(plan)}
        disabled={isActive || loading === plan.slug}
        className={`w-full font-display font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}
      >
        {isActive ? 'Current plan'
          : loading === plan.slug ? 'Redirecting…'
          : `Subscribe — Rs ${Number(plan.price_pkr).toLocaleString()}/mo`}
      </button>
    </div>
  )
}

export default function Subscription() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [currentSub, setCurrentSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const plansData = await listPlans()
      setPlans(plansData)
      try { setCurrentSub(await getMySubscription()) } catch { setCurrentSub(null) }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load plans.'))
    } finally { setLoading(false) }
  }

  async function handleSubscribe(plan) {
    setActionLoading(plan.slug)
    setError('')
    setSuccess('')
    try {
      const result = await initiatePayment({
        amountPkr: plan.price_pkr,
        description: `${plan.display_name} Plan — Monthly Subscription`,
        transactionType: 'subscription',
        planSlug: plan.slug,
      })
      // Redirect to DialogPay checkout
      window.location.href = result.checkout_url
    } catch (err) {
      setError(getErrorMessage(err, 'Could not initiate payment. Please try again.'))
      setActionLoading(null)
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel your subscription at end of billing period?')) return
    setActionLoading('cancel')
    try {
      await cancelSubscription()
      setSuccess('Subscription will be cancelled at end of billing period.')
      await loadData()
    } catch (err) { setError(getErrorMessage(err, 'Could not cancel.')) }
    finally { setActionLoading(null) }
  }

  async function handlePause() {
    setActionLoading('pause')
    try {
      await pauseSubscription()
      setSuccess('Subscription paused for 30 days.')
      await loadData()
    } catch (err) { setError(getErrorMessage(err, 'Could not pause.')) }
    finally { setActionLoading(null) }
  }

  async function handleResume() {
    setActionLoading('resume')
    try {
      await resumeSubscription()
      setSuccess('Subscription resumed.')
      await loadData()
    } catch (err) { setError(getErrorMessage(err, 'Could not resume.')) }
    finally { setActionLoading(null) }
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-ink-line px-6 py-4 flex items-center justify-between">
        <Link to="/chat" className="text-paper-muted hover:text-paper text-sm transition">← Back to chat</Link>
        <span className="text-paper-muted text-sm">{user?.full_name}</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-3xl font-semibold text-paper">Choose your plan</h1>
          <p className="text-paper-muted mt-2">
            Pay securely via JazzCash, Easypaisa or Card · Points granted daily automatically
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/JazzCash.svg/200px-JazzCash.svg.png"
              alt="JazzCash" className="h-6 opacity-70" />
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Easypaisa_Logo.svg/200px-Easypaisa_Logo.svg.png"
              alt="Easypaisa" className="h-6 opacity-70" />
            <span className="text-paper-faint text-sm">+ Debit / Credit Card</span>
          </div>
        </div>

        {currentSub && (
          <div className="bg-ink-raised border border-ink-line rounded-xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-paper font-display font-semibold">Active subscription</p>
              <p className="text-paper-muted text-sm mt-0.5">
                Status: <span className="text-success capitalize">{currentSub.status}</span>
                {currentSub.current_period_end && ` · Renews ${new Date(currentSub.current_period_end).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              </p>
            </div>
            <div className="flex gap-3">
              {currentSub.status === 'active' && (
                <button onClick={handlePause} disabled={actionLoading === 'pause'}
                  className="text-paper-muted hover:text-paper border border-ink-line px-4 py-2 rounded-lg text-sm transition disabled:opacity-50">
                  {actionLoading === 'pause' ? 'Pausing…' : 'Pause 30 days'}
                </button>
              )}
              {currentSub.status === 'paused' && (
                <button onClick={handleResume} disabled={actionLoading === 'resume'}
                  className="text-success border border-success px-4 py-2 rounded-lg text-sm transition disabled:opacity-50">
                  {actionLoading === 'resume' ? 'Resuming…' : 'Resume'}
                </button>
              )}
              <button onClick={handleCancel}
                disabled={actionLoading === 'cancel' || currentSub.cancel_at_period_end}
                className="text-danger border border-danger/40 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50">
                {currentSub.cancel_at_period_end ? 'Cancels at period end' : actionLoading === 'cancel' ? 'Cancelling…' : 'Cancel plan'}
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-success/10 border border-success rounded-xl p-4 mb-6 text-center">
            <p className="text-success font-medium">{success}</p>
          </div>
        )}
        {error && <p className="text-danger text-sm text-center mb-6" role="alert">{error}</p>}

        {loading ? (
          <p className="text-paper-muted text-center">Loading plans…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan} currentPlan={currentSub}
                onSubscribe={handleSubscribe} loading={actionLoading} />
            ))}
          </div>
        )}

        <p className="text-paper-faint text-xs text-center mt-8">
          All plans billed monthly · Cancel anytime · 15% WHT applies per Pakistan tax regulations
          · Payments processed by DialogPay
        </p>
      </main>
    </div>
  )
}
