// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\History.jsx
// (REPLACE the existing file completely)

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'

function Badge({ children, color = 'text-paper-muted border-ink-line' }) {
  return (
    <span className={`text-xs border px-2 py-0.5 rounded-full ${color}`}>
      {children}
    </span>
  )
}

export default function History() {
  const { user } = useAuth()
  const [topups, setTopups] = useState([])
  const [ledger, setLedger] = useState([])
  const [tab, setTab] = useState('topups')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [topupRes, ledgerRes] = await Promise.all([
        apiClient.get('/topups/history'),
        apiClient.get('/points/ledger'),
      ])
      setTopups(topupRes.data)
      // Backend returns { history: [...], limit, offset }
      setLedger(ledgerRes.data.history || ledgerRes.data.entries || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load history.'))
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
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
          <h1 className="font-display text-3xl font-semibold text-paper">History</h1>
          <p className="text-paper-muted text-sm mt-1">
            Your top-up purchases and points transactions
          </p>
        </div>

        {error && <p className="text-danger text-sm mb-6" role="alert">{error}</p>}

        {/* Tabs */}
        <div className="flex gap-1 bg-ink-raised border border-ink-line rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'topups', label: 'Top-Ups' },
            { key: 'ledger', label: 'Points Ledger' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.key
                  ? 'bg-signal text-white'
                  : 'text-paper-muted hover:text-paper'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-paper-muted text-center py-12">Loading…</p>
        ) : tab === 'topups' ? (
          topups.length === 0 ? (
            <div className="bg-ink-raised border border-ink-line rounded-2xl p-12 text-center">
              <p className="font-display font-semibold text-paper mb-1">No purchases yet</p>
              <p className="text-paper-muted text-sm mb-4">Top up your balance to get started.</p>
              <Link
                to="/topup"
                className="bg-gold hover:bg-gold/90 text-ink font-display font-semibold px-6 py-2.5 rounded-lg transition text-sm"
              >
                Top up now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topups.map((t) => (
                <div
                  key={t.id}
                  className="bg-ink-raised border border-ink-line rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-paper text-sm">
                      +{t.points_credited.toLocaleString()} pts
                    </p>
                    <p className="text-paper-faint text-xs mt-0.5">
                      {formatDate(t.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-semibold text-paper">
                      Rs {Number(t.price_pkr_paid).toLocaleString()}
                    </p>
                    <Badge color="text-success border-success/40">
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          ledger.length === 0 ? (
            <div className="bg-ink-raised border border-ink-line rounded-2xl p-12 text-center">
              <p className="font-display font-semibold text-paper">No transactions yet</p>
              <p className="text-paper-muted text-sm mt-1">
                Transactions appear here after you send messages or top up.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {ledger.map((entry, i) => (
                <div
                  key={entry.id || i}
                  className="bg-ink-raised border border-ink-line rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-paper text-sm capitalize">
                      {(entry.entry_type || '').replace(/_/g, ' ')}
                    </p>
                    {entry.note && (
                      <p className="text-paper-faint text-xs mt-0.5">{entry.note}</p>
                    )}
                    <p className="text-paper-faint text-xs mt-0.5">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-display font-bold ${
                      entry.delta > 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {entry.delta > 0 ? '+' : ''}{entry.delta} pts
                    </p>
                    <p className="text-paper-faint text-xs">
                      Balance: {entry.balance_after}
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
