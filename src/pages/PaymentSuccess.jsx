// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\PaymentSuccess.jsx
// (CREATE this file — new file)

import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { verifyPayment } from '../api/payments'

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id')
  const hash = params.get('hash')
  const [status, setStatus] = useState('verifying')
  const [details, setDetails] = useState(null)

  useEffect(() => {
    if (orderId) verify()
  }, [orderId])

  async function verify() {
    try {
      const result = await verifyPayment(orderId, hash)
      setDetails(result)
      setStatus(result.status === 'completed' ? 'success' : 'pending')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="bg-ink-raised border border-ink-line rounded-2xl p-10 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="font-display text-2xl font-semibold text-paper mb-2">Verifying payment…</h1>
            <p className="text-paper-muted text-sm">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="font-display text-2xl font-semibold text-paper mb-2">Payment successful!</h1>
            <p className="text-paper-muted text-sm mb-6">
              {details?.description} — Rs {Number(details?.amount_pkr || 0).toLocaleString()} paid.
              Your points have been credited.
            </p>
            <Link to="/chat"
              className="bg-signal hover:bg-signal/90 text-white font-display font-semibold px-8 py-3 rounded-xl transition inline-block">
              Back to chat →
            </Link>
          </>
        )}
        {status === 'pending' && (
          <>
            <div className="text-5xl mb-4">🕐</div>
            <h1 className="font-display text-2xl font-semibold text-paper mb-2">Payment pending</h1>
            <p className="text-paper-muted text-sm mb-6">
              Your payment is being processed. Points will be credited once confirmed.
            </p>
            <Link to="/chat"
              className="bg-signal hover:bg-signal/90 text-white font-display font-semibold px-8 py-3 rounded-xl transition inline-block">
              Back to chat →
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="font-display text-2xl font-semibold text-paper mb-2">Could not verify</h1>
            <p className="text-paper-muted text-sm mb-6">
              We could not verify your payment status. If you were charged, please contact support with order ID: {orderId}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/support"
                className="border border-ink-line text-paper-muted hover:text-paper px-6 py-2.5 rounded-lg transition text-sm">
                Contact support
              </Link>
              <Link to="/chat"
                className="bg-signal hover:bg-signal/90 text-white font-display font-semibold px-6 py-2.5 rounded-xl transition text-sm">
                Back to chat
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
