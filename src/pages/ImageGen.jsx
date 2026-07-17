// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\ImageGen.jsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'

const IMAGE_MODELS = [
  { id: 'black-forest-labs/flux.2-pro',        name: 'FLUX.2 Pro',             provider: 'Black Forest Labs' },
  { id: 'black-forest-labs/flux.2-flex',       name: 'FLUX.2 Flex',            provider: 'Black Forest Labs' },
  { id: 'black-forest-labs/flux.2-klein',      name: 'FLUX.2 Klein',           provider: 'Black Forest Labs' },
  { id: 'google/gemini-3.1-flash-image',       name: 'Gemini 3.1 Flash Image', provider: 'Google' },
  { id: 'google/gemini-2.5-flash-image',       name: 'Gemini 2.5 Flash Image', provider: 'Google' },
  { id: 'bytedance-seed/seedream-4.5',         name: 'Seedream 4.5',           provider: 'ByteDance' },
  { id: 'openai/gpt-image-1',                  name: 'GPT Image 1',            provider: 'OpenAI' },
]

const SIZES = ['256x256', '512x512', '1024x1024', '1792x1024']
const QUALITIES = [
  { value: 'standard', label: 'Standard', pts: 50 },
  { value: 'hd',       label: 'HD',       pts: 100 },
]

export default function ImageGen() {
  const { user } = useAuth()
  const [prompt, setPrompt]               = useState('')
  const [size, setSize]                   = useState('1024x1024')
  const [quality, setQuality]             = useState('standard')
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0].id)
  const [loading, setLoading]             = useState(false)
  const [result, setResult]               = useState(null)
  const [error, setError]                 = useState('')
  const [history, setHistory]             = useState([])

  const currentModel = IMAGE_MODELS.find(m => m.id === selectedModel) || IMAGE_MODELS[0]
  const pts = quality === 'hd' ? 100 : 50

  async function handleGenerate(e) {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await apiClient.post('/images/generate', {
        prompt: prompt.trim(), size, quality, model_slug: selectedModel,
      })
      const img = {
        id: Date.now(), prompt: prompt.trim(),
        url: res.data.image_url, model: currentModel.name,
        size, quality, pts: res.data.points_deducted || pts,
      }
      setResult(img)
      setHistory(prev => [img, ...prev.slice(0, 7)])
    } catch (err) {
      setError(getErrorMessage(err, 'Image generation failed. Please try again.'))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-ink-line px-6 py-4 flex items-center justify-between">
        <Link to="/chat" className="text-paper-muted hover:text-paper text-sm transition">← Back to chat</Link>
        <span className="text-paper-muted text-sm">{user?.full_name}</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-3xl font-semibold text-paper">Image Generation</h1>
          <p className="text-paper-muted text-sm mt-1">Standard 50 pts · HD 100 pts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">Prompt</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                required rows={4} placeholder="A futuristic city in Pakistan at sunset, digital art…"
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink-raised border border-ink-line text-paper placeholder-paper-faint focus:outline-none focus:ring-2 focus:ring-signal transition resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">Model</label>
              <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-ink-raised border border-ink-line text-paper focus:outline-none focus:ring-2 focus:ring-signal transition">
                {IMAGE_MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name} — {m.provider}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">Size</label>
                <select value={size} onChange={e => setSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-ink-raised border border-ink-line text-paper focus:outline-none focus:ring-2 focus:ring-signal transition">
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-paper-muted mb-1.5 uppercase tracking-wide">Quality</label>
                <div className="flex gap-2">
                  {QUALITIES.map(q => (
                    <button key={q.value} type="button" onClick={() => setQuality(q.value)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition ${
                        quality === q.value ? 'bg-signal border-signal text-white' : 'border-ink-line text-paper-muted hover:text-paper'}`}>
                      {q.label}
                      <span className="block text-xs opacity-70">{q.pts} pts</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="text-danger text-sm" role="alert">{error}</p>}

            <button type="button" onClick={handleGenerate} disabled={loading || !prompt.trim()}
              className="w-full bg-gold hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed text-ink font-display font-semibold py-3 rounded-lg transition">
              {loading ? 'Generating…' : `Generate — ${pts} pts`}
            </button>

            {history.length > 0 && (
              <div>
                <p className="text-xs font-medium text-paper-muted uppercase tracking-wide mb-2">Recent</p>
                <div className="grid grid-cols-4 gap-2">
                  {history.map(img => (
                    <button key={img.id} onClick={() => setResult(img)}
                      className={`rounded-lg overflow-hidden border transition ${result?.id === img.id ? 'border-signal' : 'border-ink-line hover:border-paper-faint'}`}>
                      <img src={img.url} alt={img.prompt} className="w-full h-16 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {loading ? (
              <div className="bg-ink-raised border border-ink-line rounded-2xl aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full balance-arc mx-auto mb-4" style={{ '--arc-pct': 60 }} />
                  <p className="text-paper-muted text-sm">Generating with {currentModel.name}…</p>
                  <p className="text-paper-faint text-xs mt-1">This takes 5–15 seconds</p>
                </div>
              </div>
            ) : result ? (
              <div className="bg-ink-raised border border-ink-line rounded-2xl overflow-hidden">
                <img src={result.url} alt={result.prompt} className="w-full object-cover" />
                <div className="p-4">
                  <p className="text-paper-muted text-sm leading-relaxed">"{result.prompt}"</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-paper-faint text-xs">{result.model} · {result.size} · {result.pts} pts</p>
                    <a href={result.url} download target="_blank" rel="noreferrer"
                      className="text-signal hover:underline text-xs font-medium">Download</a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-ink-raised border border-ink-line rounded-2xl aspect-square flex items-center justify-center">
                <div className="text-center px-8">
                  <p className="text-4xl mb-4">🖼️</p>
                  <p className="font-display font-semibold text-paper mb-1">Your image will appear here</p>
                  <p className="text-paper-muted text-sm">Choose a model, write a prompt, click Generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
