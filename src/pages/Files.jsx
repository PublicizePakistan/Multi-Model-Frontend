// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Files.jsx

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/errors'
import apiClient from '../api/client'

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function Files() {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInput = useRef(null)

  useEffect(() => { loadFiles() }, [])

  async function loadFiles() {
    setLoading(true)
    try {
      const res = await apiClient.get('/files/')
      setFiles(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load files.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    setSuccess('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess(`"${file.name}" uploaded successfully.`)
      await loadFiles()
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed. File must be PDF or image under 50MB.'))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function handleDelete(fileId, fileName) {
    if (!confirm(`Delete "${fileName}"?`)) return
    try {
      await apiClient.delete(`/files/${fileId}`)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete file.'))
    }
  }

  function getIcon(mimeType) {
    if (!mimeType) return '📄'
    if (mimeType.includes('pdf')) return '📕'
    if (mimeType.includes('image')) return '🖼️'
    return '📄'
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
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="font-display text-3xl font-semibold text-paper">Files</h1>
            <p className="text-paper-muted text-sm mt-1">Upload PDFs and images to use in chat</p>
          </div>
          <button
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="bg-signal hover:bg-signal/90 disabled:opacity-50 text-white font-display font-semibold text-sm px-4 py-2.5 rounded-lg transition"
          >
            {uploading ? 'Uploading…' : '+ Upload file'}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {error && <p className="text-danger text-sm mb-4" role="alert">{error}</p>}
        {success && <p className="text-success text-sm mb-4">{success}</p>}

        {/* Upload zone */}
        <div
          onClick={() => fileInput.current?.click()}
          className="border-2 border-dashed border-ink-line hover:border-signal rounded-2xl p-10 text-center cursor-pointer transition mb-6 group"
        >
          <p className="text-3xl mb-3">📁</p>
          <p className="font-display font-semibold text-paper group-hover:text-signal transition">
            Click to upload or drag and drop
          </p>
          <p className="text-paper-muted text-sm mt-1">PDF or image · Max 50MB</p>
        </div>

        {/* File list */}
        {loading ? (
          <p className="text-paper-muted text-center py-8">Loading…</p>
        ) : files.length === 0 ? (
          <div className="bg-ink-raised border border-ink-line rounded-2xl p-12 text-center">
            <p className="font-display font-semibold text-paper mb-1">No files yet</p>
            <p className="text-paper-muted text-sm">Upload a PDF or image to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-ink-raised border border-ink-line rounded-xl p-4 flex items-center gap-4"
              >
                <span className="text-2xl shrink-0">{getIcon(file.mime_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-paper text-sm truncate">{file.original_filename || file.filename}</p>
                  <p className="text-paper-faint text-xs mt-0.5">
                    {formatBytes(file.file_size)} · {formatDate(file.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(file.id, file.original_filename || file.filename)}
                  className="text-paper-faint hover:text-danger text-xs transition shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
