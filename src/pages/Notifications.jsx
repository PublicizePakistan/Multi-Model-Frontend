// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Notifications.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'

function BalanceArc({ pct, size = 40 }) {
  return (
    <div
      className="rounded-full balance-arc shrink-0"
      style={{ '--arc-pct': pct, width: size, height: size }}
      aria-hidden="true"
    />
  )
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    setLoading(true)
    try {
      const [notifRes, countRes] = await Promise.all([
        apiClient.get('/notifications/'),
        apiClient.get('/notifications/unread-count'),
      ])
      setNotifications(notifRes.data)
      setUnreadCount(countRes.data.unread_count)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load notifications.'))
    } finally {
      setLoading(false)
    }
  }

  async function markRead(id) {
    try {
      await apiClient.patch(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // Non-fatal
    }
  }

  async function markAllRead() {
    try {
      await apiClient.patch('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not mark all as read.'))
    }
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-ink-line px-6 py-4 flex items-center justify-between">
        <Link to="/chat" className="text-paper-muted hover:text-paper text-sm transition">
          ← Back to chat
        </Link>
        <div className="flex items-center gap-2.5">
          <BalanceArc pct={50} size={24} />
          <span className="text-paper-muted text-sm">{user?.full_name}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="font-display text-3xl font-semibold text-paper">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-paper-muted text-sm mt-1">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-signal hover:underline text-sm font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {error && (
          <p className="text-danger text-sm mb-6" role="alert">{error}</p>
        )}

        {loading ? (
          <p className="text-paper-muted text-center">Loading…</p>
        ) : notifications.length === 0 ? (
          <div className="bg-ink-raised border border-ink-line rounded-2xl p-12 text-center">
            <p className="font-display text-lg font-semibold text-paper mb-2">
              No notifications yet
            </p>
            <p className="text-paper-muted text-sm">
              We'll notify you about account activity and updates here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`bg-ink-raised border rounded-xl p-4 cursor-pointer transition ${
                  n.is_read
                    ? 'border-ink-line opacity-60'
                    : 'border-signal/30 hover:border-signal/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {n.subject && (
                      <p className="font-display font-semibold text-paper text-sm mb-1">
                        {n.subject}
                      </p>
                    )}
                    <p className="text-paper-muted text-sm leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-paper-faint text-xs mt-2">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-signal shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
