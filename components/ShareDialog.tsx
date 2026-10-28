'use client'
import { useState, useEffect } from 'react'
import { X, Share2, Trash2, UserPlus } from 'lucide-react'

type Share = { shared_with_email: string; created_at: string }

export default function ShareDialog({
  documentId,
  onClose,
}: {
  documentId: string
  onClose: () => void
}) {
  const [shares, setShares] = useState<Share[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch(`/api/documents/${documentId}/share`)
    if (res.ok) setShares(await res.json())
  }

  useEffect(() => { load() }, [documentId])

  async function addShare(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Failed to share')
      return
    }
    setEmail('')
    load()
  }

  async function removeShare(sharedEmail: string) {
    await fetch(`/api/documents/${documentId}/share`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sharedEmail }),
    })
    setShares(prev => prev.filter(s => s.shared_with_email !== sharedEmail))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Share document</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={addShare} className="flex gap-2 mb-6">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <UserPlus size={14} />
              {loading ? '…' : 'Share'}
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          {shares.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Shared with</p>
              {shares.map(s => (
                <div key={s.shared_with_email} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-700">{s.shared_with_email}</span>
                  <button
                    onClick={() => removeShare(s.shared_with_email)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Not shared with anyone yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
