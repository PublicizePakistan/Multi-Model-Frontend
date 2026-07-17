// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Admin.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'

function StatCard({ label, value, color = 'text-paper' }) {
  return (
    <div className="bg-ink-raised border border-ink-line rounded-xl p-5">
      <p className="text-paper-faint text-xs uppercase tracking-wide mb-2">{label}</p>
      <p className={`font-display text-2xl font-bold ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value ?? '—'}
      </p>
    </div>
  )
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState('metrics')
  const [metrics, setMetrics] = useState(null)
  const [users, setUsers] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [updatingUser, setUpdatingUser] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [metricsRes, usersRes, auditRes] = await Promise.all([
        apiClient.get('/admin/metrics'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/audit-log'),
      ])
      setMetrics(metricsRes.data)
      setUsers(usersRes.data.users || usersRes.data)
      setAuditLog(auditRes.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load admin data. Make sure you have admin access.'))
    } finally {
      setLoading(false)
    }
  }

  async function updateUserStatus(userId, newStatus) {
    setUpdatingUser(userId)
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { status: newStatus })
      setUsers((prev) => prev.map((u) =>
        u.id === userId ? { ...u, status: newStatus } : u
      ))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update user status.'))
    } finally {
      setUpdatingUser(null)
    }
  }

  const filteredUsers = users.filter((u) =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const STATUS_COLORS = {
    active: 'text-success',
    suspended: 'text-danger',
    deleted: 'text-paper-faint',
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-ink-line px-6 py-4 flex items-center justify-between">
        <Link to="/chat" className="text-paper-muted hover:text-paper text-sm transition">
          ← Back to chat
        </Link>
        <div className="flex items-center gap-2">
          <span className="bg-danger/20 text-danger text-xs font-medium px-2 py-1 rounded-full">
            Admin
          </span>
          <span className="text-paper-muted text-sm">{user?.full_name}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-3xl font-semibold text-paper">Admin Dashboard</h1>
          <p className="text-paper-muted text-sm mt-1">Platform management — Mind Changer (Pvt) Ltd</p>
        </div>

        {error && <p className="text-danger text-sm mb-6" role="alert">{error}</p>}

        {/* Tabs */}
        <div className="flex gap-1 bg-ink-raised border border-ink-line rounded-xl p-1 mb-8 w-fit">
          {['metrics', 'users', 'audit'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                tab === t ? 'bg-signal text-white' : 'text-paper-muted hover:text-paper'
              }`}
            >
              {t === 'audit' ? 'Audit Log' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-paper-muted text-center py-12">Loading…</p>
        ) : tab === 'metrics' ? (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total users" value={metrics?.total_users} color="text-signal" />
              <StatCard label="Active subscribers" value={metrics?.active_subscribers} color="text-gold" />
              <StatCard label="Total messages" value={metrics?.total_messages} />
              <StatCard label="Total conversations" value={metrics?.total_conversations} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Revenue (PKR)" value={`Rs ${Number(metrics?.total_revenue_pkr || 0).toLocaleString()}`} color="text-success" />
              <StatCard label="Points granted" value={metrics?.total_points_granted} />
              <StatCard label="Points used" value={metrics?.total_points_used} />
            </div>
          </div>
        ) : tab === 'users' ? (
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full px-4 py-2.5 rounded-lg bg-ink-raised border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition mb-4 text-sm"
            />
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-ink-raised border border-ink-line rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-paper text-sm">{u.full_name || '—'}</p>
                      <span className="text-xs text-paper-faint">{u.email}</span>
                      {u.role === 'admin' && (
                        <span className="text-xs bg-danger/20 text-danger px-2 py-0.5 rounded-full">admin</span>
                      )}
                    </div>
                    <p className="text-paper-faint text-xs mt-0.5">
                      Joined {formatDate(u.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-medium ${STATUS_COLORS[u.status] || 'text-paper-muted'}`}>
                      {u.status}
                    </span>
                    {u.status === 'active' ? (
                      <button
                        onClick={() => updateUserStatus(u.id, 'suspended')}
                        disabled={updatingUser === u.id}
                        className="text-xs text-danger hover:underline disabled:opacity-50 transition"
                      >
                        Suspend
                      </button>
                    ) : u.status === 'suspended' ? (
                      <button
                        onClick={() => updateUserStatus(u.id, 'active')}
                        disabled={updatingUser === u.id}
                        className="text-xs text-success hover:underline disabled:opacity-50 transition"
                      >
                        Activate
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-paper-muted text-center py-8 text-sm">No users found.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {auditLog.length === 0 ? (
              <div className="bg-ink-raised border border-ink-line rounded-2xl p-12 text-center">
                <p className="font-display font-semibold text-paper mb-1">No audit entries yet</p>
                <p className="text-paper-muted text-sm">Admin actions appear here.</p>
              </div>
            ) : (
              auditLog.map((entry) => (
                <div key={entry.id} className="bg-ink-raised border border-ink-line rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-paper text-sm font-medium">{entry.action}</p>
                      <p className="text-paper-faint text-xs mt-0.5">
                        {entry.entity_type} · {entry.actor_type} · {entry.ip_address}
                      </p>
                    </div>
                    <p className="text-paper-faint text-xs shrink-0">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
