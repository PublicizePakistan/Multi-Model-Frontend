// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Payments.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const STATUS_COLORS = {
  completed: 'text-success border-success/40 bg-success/10',
  pending: 'text-gold border-gold/40 bg-gold/10',
  failed: 'text-danger border-danger/40 bg-danger/10',
}

export default function Payments() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [invoices, setInvoices] = useState([])
  const [tab, setTab] = useState('transactions')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [txRes, invRes] = await Promise.all([
        apiClient.get('/payments/transactions'),
        apiClient.get('/payments/invoices'),
      ])
      setTransactions(txRes.data)
      setInvoices(invRes.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load payment history.'))
    } finally {
      setLoading(false)
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

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-3xl font-semibold text-paper">Payments</h1>
          <p className="text-paper-muted text-sm mt-1">
            Your payment transactions and invoices
          </p>
        </div>

        {error && <p className="text-danger text-sm mb-6" role="alert">{error}</p>}

        {/* Tabs */}
        <div className="flex gap-1 bg-ink-raised border border-ink-line rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'transactions', label: 'Transactions' },
            { key: 'invoices', label: 'Invoices' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.key ? 'bg-signal text-white' : 'text-paper-muted hover:text-paper'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-paper-muted text-center py-12">Loading…</p>
        ) : tab === 'transactions' ? (
          transactions.length === 0 ? (
            <div className="bg-ink-raised border border-ink-line rounded-2xl p-12 text-center">
              <p className="font-display font-semibold text-paper mb-1">No transactions yet</p>
              <p className="text-paper-muted text-sm">
                Payment transactions appear here after you subscribe or top up.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-ink-raised border border-ink-line rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-paper text-sm capitalize">
                      {(tx.transaction_type || 'payment').replace(/_/g, ' ')}
                    </p>
                    <p className="text-paper-faint text-xs mt-0.5">
                      {formatDate(tx.initiated_at || tx.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-paper">
                      Rs {Number(tx.amount_pkr || tx.amount || 0).toLocaleString()}
                    </p>
                    <span className={`text-xs border px-2 py-0.5 rounded-full ${
                      STATUS_COLORS[tx.status] || STATUS_COLORS.pending
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          invoices.length === 0 ? (
            <div className="bg-ink-raised border border-ink-line rounded-2xl p-12 text-center">
              <p className="font-display font-semibold text-paper mb-1">No invoices yet</p>
              <p className="text-paper-muted text-sm">
                Invoices are generated automatically after completed payments.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-ink-raised border border-ink-line rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-paper text-sm">
                      Invoice #{inv.invoice_number || inv.id?.slice(0, 8)}
                    </p>
                    <p className="text-paper-faint text-xs mt-0.5">
                      {formatDate(inv.issued_at || inv.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-paper">
                      Rs {Number(inv.total_pkr || inv.amount_pkr || 0).toLocaleString()}
                    </p>
                    <p className="text-paper-faint text-xs mt-0.5">
                      incl. {Number(inv.tax_pkr || 0).toLocaleString()} WHT
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}
