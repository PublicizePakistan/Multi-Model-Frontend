// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Chat.jsx
// (REPLACE the existing file completely)

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBalance } from '../api/points'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'
import {
  createConversation, listConversations, getConversation,
  deleteConversation, sendMessage, titleFromMessage,
  listAvailableModels,
} from '../api/chat'
import { getMySubscription } from '../api/subscriptions'

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  return [theme, setTheme]
}

function BalanceArc({ pct, size = 40 }) {
  return (
    <div className="rounded-full balance-arc shrink-0"
      style={{ '--arc-pct': pct, width: size, height: size }} aria-hidden="true" />
  )
}

function ConversationRow({ conv, isActive, onClick, onDelete }) {
  return (
    <div className={`group flex items-center rounded-lg transition ${isActive ? 'bg-ink-line' : 'hover:bg-ink-line/50'}`}>
      <button onClick={onClick}
        className={`flex-1 text-left px-3 py-2.5 truncate text-sm min-w-0 ${isActive ? 'text-paper' : 'text-paper-muted hover:text-paper'}`}>
        {conv.title || 'New conversation'}
      </button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
        className="shrink-0 px-2.5 py-2.5 text-paper-faint opacity-0 group-hover:opacity-100 hover:text-danger transition text-xs">
        ✕
      </button>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser ? 'bg-signal text-white rounded-br-md' : 'bg-ink-raised border border-ink-line text-paper rounded-bl-md'
      }`}>
        {message.attached_file && (
          <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${isUser ? 'border-white/20' : 'border-ink-line'}`}>
            <span>{message.attached_file.type?.includes('pdf') ? '📕' : '🖼️'}</span>
            <span className="text-xs opacity-75 truncate">{message.attached_file.name}</span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content_text}</p>
        {!isUser && message.points_used > 0 && (
          <p className="text-[11px] text-paper-faint mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
            {message.points_used} pts
          </p>
        )}
      </div>
    </div>
  )
}

function UserMenu({ user, theme, setTheme, onClose, planName }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  function go(path) { navigate(path); onClose() }

  return (
    <div ref={ref}
      className="absolute bottom-full left-0 right-0 mb-2 bg-ink-raised border border-ink-line rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-ink-line">
        <p className="text-xs text-paper-faint truncate">{user?.email}</p>
        <p className="text-paper text-sm font-medium mt-0.5">{user?.full_name}</p>
        {planName && <p className="text-xs text-gold font-medium mt-0.5 capitalize">{planName} plan</p>}
      </div>
      <div className="px-4 py-2.5 border-b border-ink-line flex items-center justify-between">
        <span className="text-paper-muted text-sm">Appearance</span>
        <div className="flex items-center gap-1 bg-ink rounded-lg p-1">
          <button onClick={() => setTheme('dark')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${theme === 'dark' ? 'bg-ink-line text-paper' : 'text-paper-faint hover:text-paper-muted'}`}>
            🌙 Dark
          </button>
          <button onClick={() => setTheme('light')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${theme === 'light' ? 'bg-ink-line text-paper' : 'text-paper-faint hover:text-paper-muted'}`}>
            ☀️ Light
          </button>
        </div>
      </div>
      {[
        { icon: '👤', label: 'Profile & Settings', path: '/profile' },
        { icon: '💳', label: 'Manage plan', path: '/subscription' },
        { icon: '⚡', label: 'Top up points', path: '/topup' },
        { icon: '🔔', label: 'Notifications', path: '/notifications' },
        { icon: '🎨', label: 'Image generation', path: '/images' },
        { icon: '📊', label: 'History', path: '/history' },
        { icon: '💰', label: 'Payments', path: '/payments' },
        { icon: '🎧', label: 'Support', path: '/support' },
      ].map(item => (
        <button key={item.path} onClick={() => go(item.path)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-paper-muted hover:text-paper hover:bg-ink-line transition text-left">
          <span className="text-base w-5">{item.icon}</span>
          {item.label}
        </button>
      ))}
      {user?.role === 'admin' && (
        <button onClick={() => go('/admin')}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition text-left border-t border-ink-line">
          <span className="text-base w-5">🛡️</span>
          Admin dashboard
        </button>
      )}
      <div className="border-t border-ink-line">
        <button onClick={() => { logout(); onClose() }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-paper-muted hover:text-danger hover:bg-danger/5 transition text-left">
          <span className="text-base w-5">🚪</span>
          Log out
        </button>
      </div>
    </div>
  )
}

export default function Chat() {
  const { user } = useAuth()
  const [theme, setTheme] = useTheme()
  const [balance, setBalance] = useState(null)
  const [planName, setPlanName] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [webSearch, setWebSearch] = useState(false)
  const [sending, setSending] = useState(false)
  const [loadingConvo, setLoadingConvo] = useState(false)
  const [error, setError] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [attachedFile, setAttachedFile] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef(null)
  const modelPickerRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => { refreshBalance(); refreshConversations(); loadPlan() }, [])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])
  useEffect(() => {
    function handler(e) {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target))
        setShowModelPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function refreshBalance() {
    try { const d = await getBalance(); setBalance(d.balance) } catch {}
  }
  async function loadPlan() {
    try {
      const sub = await getMySubscription()
      setPlanName(sub?.plan_name || sub?.plan?.display_name || null)
    } catch {}
  }
  async function refreshConversations() {
    try { setConversations(await listConversations()) }
    catch { setError('Could not load conversations.') }
  }
  async function openConversation(id) {
    setActiveId(id); setLoadingConvo(true); setError('')
    try { const d = await getConversation(id); setMessages(d.messages) }
    catch (err) { setError(getErrorMessage(err, 'Could not load conversation.')) }
    finally { setLoadingConvo(false) }
  }
  async function handleNewChat() {
    try {
      const conv = await createConversation(null, selectedModel)
      setConversations(p => [conv, ...p]); setActiveId(conv.id); setMessages([]); setAttachedFile(null)
    } catch (err) { setError(getErrorMessage(err, 'Could not start chat.')) }
  }
  async function handleDelete(id) {
    try {
      await deleteConversation(id)
      setConversations(p => p.filter(c => c.id !== id))
      if (activeId === id) { setActiveId(null); setMessages([]); setAttachedFile(null) }
    } catch (err) { setError(getErrorMessage(err, 'Could not delete.')) }
  }
  async function loadModels() {
    if (models.length > 0) { setShowModelPicker(true); return }
    setLoadingModels(true)
    try { const d = await listAvailableModels(); setModels(d.models || []); setShowModelPicker(true) }
    catch { setError('Could not load models.') }
    finally { setLoadingModels(false) }
  }
  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFile(true); setError('')
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await apiClient.post('/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setAttachedFile({ name: file.name, type: file.type, fileId: res.data.file?.id || res.data.id || res.data.file_id })
    } catch (err) { setError(getErrorMessage(err, 'Upload failed.')) }
    finally { setUploadingFile(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }
  async function handleSend(e) {
    e.preventDefault()
    const content = input.trim()
    if ((!content && !attachedFile) || sending) return
    let cid = activeId
    const text = content || `Attached: ${attachedFile?.name}`
    if (!cid) {
      try {
        const conv = await createConversation(titleFromMessage(text), selectedModel)
        setConversations(p => [conv, ...p]); cid = conv.id; setActiveId(conv.id)
      } catch (err) { setError(getErrorMessage(err, 'Could not start chat.')); return }
    }
    const currentFile = attachedFile
    setInput(''); setAttachedFile(null); setSending(true); setError('')
    const opt = { id: `temp-${Date.now()}`, role: 'user', content_text: text, points_used: 0, attached_file: currentFile }
    setMessages(p => [...p, opt])
    try {
      const result = await sendMessage(cid, text, { webSearch, modelSlug: selectedModel, fileId: currentFile?.fileId || null })
      setMessages(p => [...p.filter(m => m.id !== opt.id), result.user_message, result.ai_message])
      setBalance(result.new_balance); refreshConversations()
    } catch (err) {
      setError(getErrorMessage(err, 'Message failed.'))
      setMessages(p => p.filter(m => m.id !== opt.id))
    } finally { setSending(false) }
  }

  const balancePct = balance != null ? Math.min(100, Math.round((balance / 2000) * 100)) : 0
  const selectedModelName = models.find(m => m.id === selectedModel)?.name || selectedModel.split('/')[1] || selectedModel
  const userInitials = (user?.full_name || user?.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="h-screen bg-ink flex overflow-hidden">
      <aside className={`border-r border-ink-line flex flex-col shrink-0 transition-all duration-300 relative ${sidebarOpen ? 'w-64' : 'w-14'}`}>
        <div className="p-3 border-b border-ink-line flex items-center gap-2">
          <button onClick={() => setSidebarOpen(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-line transition text-paper-muted hover:text-paper shrink-0">
            {sidebarOpen ? '◀' : '▶'}
          </button>
          {sidebarOpen && <span className="font-display font-semibold text-paper tracking-tight text-sm">Multi Model</span>}
        </div>
        <div className="p-2 border-b border-ink-line">
          {sidebarOpen ? (
            <button onClick={handleNewChat}
              className="w-full bg-signal hover:bg-signal/90 text-white font-medium text-sm py-2 rounded-lg transition">
              + New chat
            </button>
          ) : (
            <button onClick={handleNewChat} title="New chat"
              className="w-full h-9 flex items-center justify-center bg-signal hover:bg-signal/90 text-white rounded-lg transition text-base">+</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sidebarOpen ? (
            conversations.length === 0
              ? <p className="text-paper-faint text-xs text-center mt-8 px-2">No conversations yet.</p>
              : conversations.map(conv => (
                <ConversationRow key={conv.id} conv={conv} isActive={conv.id === activeId}
                  onClick={() => openConversation(conv.id)} onDelete={handleDelete} />
              ))
          ) : (
            conversations.slice(0, 12).map(conv => (
              <button key={conv.id} onClick={() => { setSidebarOpen(true); openConversation(conv.id) }}
                title={conv.title || 'New conversation'}
                className={`w-full h-8 flex items-center justify-center rounded-lg text-xs transition ${conv.id === activeId ? 'bg-ink-line text-paper' : 'text-paper-faint hover:bg-ink-line/50'}`}>
                💬
              </button>
            ))
          )}
        </div>
        <div className="border-t border-ink-line p-3 relative">
          {sidebarOpen ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <BalanceArc pct={balancePct} size={28} />
                  <div>
                    <p className="text-paper text-sm font-medium font-display leading-tight">
                      {balance != null ? balance.toLocaleString() : '—'} pts
                    </p>
                    {planName && <p className="text-gold text-xs font-medium capitalize leading-tight">{planName} plan</p>}
                  </div>
                </div>
                <Link to="/topup"
                  className="text-xs font-medium px-2.5 py-1 bg-gold/10 text-gold border border-gold/30 rounded-lg hover:bg-gold/20 transition shrink-0">
                  Top up
                </Link>
              </div>
              <button onClick={() => setShowUserMenu(v => !v)}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-ink-line transition group">
                <div className="w-8 h-8 rounded-full bg-signal/20 border border-signal/40 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-signal">{userInitials}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-paper text-sm font-medium truncate leading-tight">{user?.full_name}</p>
                  <p className="text-paper-faint text-xs truncate leading-tight">{user?.email}</p>
                </div>
                <span className="text-paper-faint text-xs">{showUserMenu ? '▾' : '▸'}</span>
              </button>
              {showUserMenu && (
                <UserMenu user={user} theme={theme} setTheme={setTheme}
                  planName={planName} onClose={() => setShowUserMenu(false)} />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <BalanceArc pct={balancePct} size={24} />
              <button onClick={() => { setSidebarOpen(true); setShowUserMenu(true) }} title={user?.full_name}
                className="w-8 h-8 rounded-full bg-signal/20 border border-signal/40 flex items-center justify-center hover:bg-signal/30 transition">
                <span className="text-xs font-bold text-signal">{userInitials}</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-ink-line px-4 py-2 flex items-center justify-between shrink-0">
          <div ref={modelPickerRef} className="relative">
            <button onClick={loadModels} disabled={loadingModels}
              className="flex items-center gap-2 text-xs text-paper-muted hover:text-paper border border-ink-line hover:border-paper-faint rounded-lg px-3 py-1.5 transition bg-ink-raised">
              <span>🤖</span>
              <span className="font-medium max-w-48 truncate">{selectedModelName}</span>
              <span className="text-paper-faint">{loadingModels ? '⏳' : '▾'}</span>
            </button>
            {showModelPicker && models.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-ink-raised border border-ink-line rounded-xl shadow-2xl shadow-black/60 z-50 max-h-72 overflow-y-auto">
                <div className="px-3 py-2 border-b border-ink-line">
                  <p className="text-xs text-paper-faint">{models.length} models available via OpenRouter</p>
                </div>
                {models.map(m => (
                  <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelPicker(false) }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-ink-line transition flex items-start justify-between gap-2 ${selectedModel === m.id ? 'bg-ink-line' : ''}`}>
                    <div className="min-w-0">
                      <p className="text-paper text-sm font-medium truncate">{m.name}</p>
                      {m.description && <p className="text-paper-faint text-xs truncate mt-0.5">{m.description}</p>}
                    </div>
                    <div className="shrink-0 text-right">
                      {m.supports_vision && <span className="block text-xs text-signal mt-0.5">👁 Vision</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-paper-faint text-xs">8 pts/msg</span>
        </div>

        {!activeId && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BalanceArc pct={72} size={56} />
              <h2 className="font-display text-xl font-semibold text-paper mt-4">Start a conversation</h2>
              <p className="text-paper-muted text-sm mt-1">Type a message, attach a file, or toggle web search</p>
            </div>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {loadingConvo
              ? <p className="text-paper-muted text-sm text-center">Loading…</p>
              : messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
            }
          </div>
        )}

        {error && <p className="text-danger text-sm px-6 pb-2" role="alert">{error}</p>}

        {attachedFile && (
          <div className="px-4 pb-2 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-signal/10 border border-signal/30 rounded-lg px-3 py-1.5">
              <span>{attachedFile.type?.includes('pdf') ? '📕' : '🖼️'}</span>
              <span className="text-xs text-signal font-medium truncate max-w-48">{attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)}
                className="text-signal/60 hover:text-danger text-xs ml-1 transition">✕</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="border-t border-ink-line p-4 flex items-end gap-2 shrink-0">
          <button type="button" onClick={() => setWebSearch(v => !v)} title="Web search (+5 pts)"
            className={`shrink-0 text-xs font-medium px-3 py-2.5 rounded-lg border transition ${
              webSearch ? 'bg-gold/10 border-gold text-gold' : 'border-ink-line text-paper-faint hover:text-paper-muted'}`}>
            🔍
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
            title="Attach PDF or image"
            className={`shrink-0 text-xs font-medium px-3 py-2.5 rounded-lg border transition ${
              attachedFile ? 'bg-signal/10 border-signal text-signal' : 'border-ink-line text-paper-faint hover:text-paper-muted'
            } disabled:opacity-50`}>
            {uploadingFile ? '⏳' : '📎'}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,image/*" onChange={handleFileSelect} className="hidden" />
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder={attachedFile ? 'Ask about the attached file…' : 'Message Multi Model…'}
            className="flex-1 px-4 py-2.5 rounded-lg bg-ink-raised border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition" />
          <button type="submit" disabled={sending || (!input.trim() && !attachedFile)}
            className="bg-signal hover:bg-signal/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition shrink-0">
            {sending ? '…' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  )
}
