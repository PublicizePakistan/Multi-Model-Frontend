// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\PaymentFailed.jsx
// (CREATE this file — new file)

import { useSearchParams, Link } from 'react-router-dom'

export default function PaymentFailed() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id')

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="bg-ink-raised border border-danger/30 rounded-2xl p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="font-display text-2xl font-semibold text-paper mb-2">Payment failed</h1>
        <p className="text-paper-muted text-sm mb-2">
          Your payment could not be processed. You have not been charged.
        </p>
        {orderId && (
          <p className="text-paper-faint text-xs mb-6">Order ID: {orderId}</p>
        )}
        <div className="flex gap-3 justify-center">
          <Link to="/topup"
            className="bg-gold hover:bg-gold/90 text-ink font-display font-semibold px-6 py-2.5 rounded-xl transition text-sm">
            Try again
          </Link>
          <Link to="/support"
            className="border border-ink-line text-paper-muted hover:text-paper px-6 py-2.5 rounded-lg transition text-sm">
            Get help
          </Link>
        </div>
      </div>
    </div>
  )
}
