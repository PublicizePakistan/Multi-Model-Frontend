// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Teams.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'

export default function Teams() {
  const { user } = useAuth()
  const [team, setTeam] = useState(null)
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState('team')

  // Create team form
  const [teamName, setTeamName] = useState('')
  const [creatingTeam, setCreatingTeam] = useState(false)

  // API key form
  const [keyName, setKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)
  const [newRawKey, setNewRawKey] = useState(null)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [keysRes] = await Promise.all([
        apiClient.get('/teams/api-keys'),
      ])
      setApiKeys(keysRes.data)
      try {
        const teamRes = await apiClient.get('/teams/me')
        setTeam(teamRes.data)
      } catch {
        setTeam(null)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load team data.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTeam(e) {
    e.preventDefault()
    setCreatingTeam(true)
    setError('')
    try {
      const res = await apiClient.post('/teams/', { name: teamName, max_members: 10 })
      setTeam(res.data)
      setTeamName('')
      setSuccess('Team created successfully.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create team.'))
    } finally {
      setCreatingTeam(false)
    }
  }

  async function handleCreateKey(e) {
    e.preventDefault()
    setCreatingKey(true)
    setError('')
    setNewRawKey(null)
    try {
      const res = await apiClient.post('/teams/api-keys', {
        name: keyName,
        scopes: ['chat'],
        rate_limit_rpm: 60,
      })
      setNewRawKey(res.data.raw_key)
      setApiKeys((prev) => [res.data.api_key, ...prev])
      setKeyName('')
      setSuccess('API key created. Copy it now — it will not be shown again.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create API key.'))
    } finally {
      setCreatingKey(false)
    }
  }

  async function handleRevokeKey(keyId) {
    if (!confirm('Revoke this API key? This cannot be undone.')) return
    try {
      await apiClient.delete(`/teams/api-keys/${keyId}`)
      setApiKeys((prev) => prev.filter((k) => k.id !== keyId))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not revoke key.'))
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    if (!team) return
    setInviting(true)
    setError('')
    try {
      await apiClient.post(`/teams/${team.id}/invite`, { email: inviteEmail, role: 'member' })
      setSuccess(`Invitation sent to ${inviteEmail}.`)
      setInviteEmail('')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send invitation.'))
    } finally {
      setInviting(false)
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
          <h1 className="font-display text-3xl font-semibold text-paper">Teams & API Keys</h1>
          <p className="text-paper-muted text-sm mt-1">Manage your team workspace and developer access</p>
        </div>

        {error && <p className="text-danger text-sm mb-4" role="alert">{error}</p>}
        {success && <p className="text-success text-sm mb-4">{success}</p>}

        {/* Tabs */}
        <div className="flex gap-1 bg-ink-raised border border-ink-line rounded-xl p-1 mb-8 w-fit">
          {['team', 'api-keys'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t ? 'bg-signal text-white' : 'text-paper-muted hover:text-paper'
              }`}>
              {t === 'api-keys' ? 'API Keys' : 'Team'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-paper-muted text-center py-12">Loading…</p>
        ) : tab === 'team' ? (
          <div className="space-y-6">
            {!team ? (
              <div className="bg-ink-raised border border-ink-line rounded-2xl p-6">
                <h2 className="font-display text-lg font-semibold text-paper mb-1">Create a team</h2>
                <p className="text-paper-muted text-sm mb-5">
                  Teams let you share access with colleagues on the Business plan.
                </p>
                <form onSubmit={handleCreateTeam} className="flex gap-3">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    placeholder="Team name"
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition"
                  />
                  <button
                    type="submit"
                    disabled={creatingTeam}
                    className="bg-signal hover:bg-signal/90 disabled:opacity-50 text-white font-display font-semibold px-5 py-2.5 rounded-lg transition"
                  >
                    {creatingTeam ? 'Creating…' : 'Create'}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="bg-ink-raised border border-ink-line rounded-2xl p-6">
                  <h2 className="font-display text-lg font-semibold text-paper mb-1">{team.name}</h2>
                  <p className="text-paper-muted text-sm">
                    Slug: <span className="font-mono text-paper-faint">{team.slug}</span>
                    {' · '}Max {team.max_members} members
                  </p>
                </div>

                <div className="bg-ink-raised border border-ink-line rounded-2xl p-6">
                  <h2 className="font-display text-lg font-semibold text-paper mb-5">Invite a member</h2>
                  <form onSubmit={handleInvite} className="flex gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      placeholder="colleague@example.com"
                      className="flex-1 px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition"
                    />
                    <button
                      type="submit"
                      disabled={inviting}
                      className="bg-gold hover:bg-gold/90 disabled:opacity-50 text-ink font-display font-semibold px-5 py-2.5 rounded-lg transition"
                    >
                      {inviting ? 'Sending…' : 'Invite'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* New raw key alert */}
            {newRawKey && (
              <div className="bg-gold/10 border border-gold rounded-xl p-4">
                <p className="text-gold font-display font-semibold text-sm mb-2">
                  Copy your API key now — it will not be shown again
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-ink rounded-lg px-3 py-2 text-xs font-mono text-paper break-all">
                    {newRawKey}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(newRawKey)}
                    className="text-gold hover:underline text-xs font-medium shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Create key form */}
            <div className="bg-ink-raised border border-ink-line rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold text-paper mb-5">Create API key</h2>
              <form onSubmit={handleCreateKey} className="flex gap-3">
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                  placeholder="Production key"
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition"
                />
                <button
                  type="submit"
                  disabled={creatingKey}
                  className="bg-signal hover:bg-signal/90 disabled:opacity-50 text-white font-display font-semibold px-5 py-2.5 rounded-lg transition"
                >
                  {creatingKey ? 'Creating…' : 'Create'}
                </button>
              </form>
            </div>

            {/* Key list */}
            {apiKeys.length === 0 ? (
              <div className="bg-ink-raised border border-ink-line rounded-2xl p-8 text-center">
                <p className="text-paper-muted text-sm">No API keys yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="bg-ink-raised border border-ink-line rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-paper text-sm">{key.name}</p>
                      <p className="font-mono text-paper-faint text-xs mt-0.5">{key.key_prefix}</p>
                      <p className="text-paper-faint text-xs mt-0.5">
                        Scopes: {key.scopes?.join(', ')} · {key.rate_limit_rpm} rpm
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-danger hover:underline text-xs transition shrink-0"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
