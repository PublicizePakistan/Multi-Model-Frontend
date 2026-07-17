// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Support.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const STATUS_COLORS = {
  open: 'text-gold border-gold/40 bg-gold/10',
  in_progress: 'text-signal border-signal/40 bg-signal/10',
  resolved: 'text-success border-success/40 bg-success/10',
  closed: 'text-paper-faint border-ink-line bg-ink-line/40',
}

export default function Support() {
  const { user } = useAuth()

  const [tickets, setTickets] = useState([])
  const [activeTicket, setActiveTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [reply, setReply] = useState('')

  // New ticket form
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('technical')
  const [body, setBody] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    setLoading(true)
    try {
      const res = await apiClient.get('/support/tickets')
      setTickets(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load tickets.'))
    } finally {
      setLoading(false)
    }
  }

  async function openTicket(ticket) {
    setActiveTicket(ticket)
    setError('')
    try {
      const res = await apiClient.get(`/support/tickets/${ticket.id}`)
      setMessages(res.data.messages)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load ticket messages.'))
    }
  }

  async function handleCreateTicket(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await apiClient.post('/support/tickets', { subject, category, body })
      setSubject('')
      setCategory('technical')
      setBody('')
      setShowNewForm(false)
      await loadTickets()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create ticket.'))
    } finally {
      setCreating(false)
    }
  }

  async function handleReply(e) {
    e.preventDefault()
    if (!reply.trim() || !activeTicket) return
    setSending(true)
    setError('')
    try {
      const res = await apiClient.post(`/support/tickets/${activeTicket.id}/messages`, {
        body: reply,
      })
      setMessages((prev) => [...prev, res.data])
      setReply('')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send reply.'))
    } finally {
      setSending(false)
    }
  }

  async function handleClose(ticketId) {
    try {
      await apiClient.patch(`/support/tickets/${ticketId}/close`)
      await loadTickets()
      if (activeTicket?.id === ticketId) {
        setActiveTicket((t) => ({ ...t, status: 'closed' }))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not close ticket.'))
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

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-paper">Support</h1>
            <p className="text-paper-muted text-sm mt-1">Get help from our team</p>
          </div>
          <button
            onClick={() => { setShowNewForm(true); setActiveTicket(null) }}
            className="bg-signal hover:bg-signal/90 text-white font-display font-semibold text-sm px-4 py-2.5 rounded-lg transition"
          >
            + New ticket
          </button>
        </div>

        {error && (
          <p className="text-danger text-sm mb-4" role="alert">{error}</p>
        )}

        <div className="flex gap-6">
          {/* Ticket list */}
          <div className="w-72 shrink-0 space-y-2">
            {loading ? (
              <p className="text-paper-muted text-sm text-center py-8">Loading…</p>
            ) : tickets.length === 0 && !showNewForm ? (
              <div className="bg-ink-raised border border-ink-line rounded-xl p-6 text-center">
                <p className="text-paper font-display font-semibold mb-1">No tickets yet</p>
                <p className="text-paper-muted text-sm">Create one above if you need help.</p>
              </div>
            ) : (
              tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { openTicket(t); setShowNewForm(false) }}
                  className={`w-full text-left bg-ink-raised border rounded-xl p-4 transition ${
                    activeTicket?.id === t.id ? 'border-signal' : 'border-ink-line hover:border-paper-faint'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-sm text-paper truncate">{t.subject}</p>
                    <span className={`text-xs border px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[t.status] || STATUS_COLORS.closed}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-paper-faint text-xs">{t.ticket_ref} · {timeAgo(t.created_at)}</p>
                </button>
              ))
            )}
          </div>

          {/* New ticket form */}
          {showNewForm && (
            <div className="flex-1 bg-ink-raised border border-ink-line rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold text-paper mb-5">New support ticket</h2>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper focus:outline-none focus:ring-2 focus:ring-signal transition"
                  >
                    <option value="technical">Technical issue</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="feature">Feature request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="Briefly describe your issue"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    rows={6}
                    placeholder="Describe your issue in detail…"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-signal hover:bg-signal/90 disabled:opacity-50 text-white font-display font-semibold px-6 py-2.5 rounded-lg transition"
                  >
                    {creating ? 'Submitting…' : 'Submit ticket'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="border border-ink-line text-paper-muted hover:text-paper px-6 py-2.5 rounded-lg transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Ticket thread */}
          {activeTicket && !showNewForm && (
            <div className="flex-1 bg-ink-raised border border-ink-line rounded-2xl flex flex-col">
              <div className="p-5 border-b border-ink-line flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display font-semibold text-paper">{activeTicket.subject}</h2>
                  <p className="text-paper-faint text-xs mt-0.5">
                    {activeTicket.ticket_ref} · {activeTicket.category}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs border px-2 py-1 rounded-full ${STATUS_COLORS[activeTicket.status] || STATUS_COLORS.closed}`}>
                    {activeTicket.status}
                  </span>
                  {activeTicket.status !== 'closed' && (
                    <button
                      onClick={() => handleClose(activeTicket.id)}
                      className="text-paper-faint hover:text-danger text-xs transition"
                    >
                      Close ticket
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-96">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        m.sender_type === 'user'
                          ? 'bg-signal text-white rounded-br-md'
                          : 'bg-ink border border-ink-line text-paper rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className="text-[11px] opacity-60 mt-1.5">{timeAgo(m.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {activeTicket.status !== 'closed' && (
                <form onSubmit={handleReply} className="p-4 border-t border-ink-line flex gap-3">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply…"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="bg-signal hover:bg-signal/90 disabled:opacity-40 text-white font-medium px-5 py-2.5 rounded-lg transition shrink-0 text-sm"
                  >
                    {sending ? '…' : 'Send'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
