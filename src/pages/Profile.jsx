// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Profile.jsx

import { useState } from 'react'
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

export default function Profile() {
  const { user, logout } = useAuth()

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [lang, setLang] = useState(user?.preferred_lang || 'en')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      await apiClient.patch('/users/me', {
        full_name: fullName,
        phone: phone || null,
        preferred_lang: lang,
      })
      setProfileSuccess('Profile updated successfully.')
    } catch (err) {
      setProfileError(getErrorMessage(err, 'Could not update profile.'))
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }

    setPasswordLoading(true)
    try {
      await apiClient.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setPasswordSuccess('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(getErrorMessage(err, 'Could not change password.'))
    } finally {
      setPasswordLoading(false)
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
          <span className="text-paper-muted text-sm">{user?.email}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-3xl font-semibold text-paper">
            Profile & Settings
          </h1>
          <p className="text-paper-muted mt-1">Manage your account details</p>
        </div>

        {/* Account info card */}
        <div className="bg-ink-raised border border-ink-line rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-signal/20 border border-signal/40 flex items-center justify-center shrink-0">
            <span className="font-display text-xl font-bold text-signal">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-display font-semibold text-paper">{user?.full_name}</p>
            <p className="text-paper-muted text-sm">{user?.email}</p>
            <p className="text-paper-faint text-xs mt-0.5 capitalize">
              Role: {user?.role} · Status: {user?.status}
            </p>
          </div>
        </div>

        {/* Profile form */}
        <div className="bg-ink-raised border border-ink-line rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg font-semibold text-paper mb-5">
            Personal information
          </h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper focus:outline-none focus:ring-2 focus:ring-signal transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 0000000"
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                Preferred language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper focus:outline-none focus:ring-2 focus:ring-signal transition"
              >
                <option value="en">English</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>

            {profileError && (
              <p className="text-danger text-sm" role="alert">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-success text-sm">{profileSuccess}</p>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="bg-signal hover:bg-signal/90 disabled:opacity-50 text-white font-display font-semibold px-6 py-2.5 rounded-lg transition"
            >
              {profileLoading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Password form */}
        <div className="bg-ink-raised border border-ink-line rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg font-semibold text-paper mb-5">
            Change password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper focus:outline-none focus:ring-2 focus:ring-signal transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper focus:outline-none focus:ring-2 focus:ring-signal transition"
              />
              <p className="text-paper-faint text-xs mt-1.5">
                Must include uppercase, lowercase and a number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink border border-ink-line text-paper focus:outline-none focus:ring-2 focus:ring-signal transition"
              />
            </div>

            {passwordError && (
              <p className="text-danger text-sm" role="alert">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-success text-sm">{passwordSuccess}</p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-gold hover:bg-gold/90 disabled:opacity-50 text-ink font-display font-semibold px-6 py-2.5 rounded-lg transition"
            >
              {passwordLoading ? 'Changing…' : 'Change password'}
            </button>
          </form>
        </div>

        {/* Quick links */}
        <div className="bg-ink-raised border border-ink-line rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg font-semibold text-paper mb-4">
            Account links
          </h2>
          <div className="space-y-3">
            <Link
              to="/subscription"
              className="flex items-center justify-between py-2 text-paper-muted hover:text-paper transition"
            >
              <span className="text-sm">Manage subscription</span>
              <span className="text-paper-faint">→</span>
            </Link>
            <div className="border-t border-ink-line" />
            <Link
              to="/topup"
              className="flex items-center justify-between py-2 text-paper-muted hover:text-paper transition"
            >
              <span className="text-sm">Top up points</span>
              <span className="text-paper-faint">→</span>
            </Link>
            <div className="border-t border-ink-line" />
            <Link
              to="/notifications"
              className="flex items-center justify-between py-2 text-paper-muted hover:text-paper transition"
            >
              <span className="text-sm">Notifications</span>
              <span className="text-paper-faint">→</span>
            </Link>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-ink-raised border border-danger/30 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-danger mb-2">
            Danger zone
          </h2>
          <p className="text-paper-muted text-sm mb-4">
            Logging out will clear your session on this device.
          </p>
          <button
            onClick={logout}
            className="border border-danger/40 text-danger hover:bg-danger/10 font-medium px-6 py-2.5 rounded-lg transition text-sm"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  )
}
