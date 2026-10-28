'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { formatRelative } from '@/lib/utils'
import { FileText, Plus, Upload, LogOut, Share2, Trash2, Clock } from 'lucide-react'

type Doc = {
  id: string
  title: string
  updated_at: string
  owner_email: string
  share_count?: number
  shared_at?: string
}

export default function DashboardClient({ userEmail, userName }: { userEmail: string; userName: string }) {
  const router = useRouter()
  const [owned, setOwned] = useState<Doc[]>([])
  const [shared, setShared] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'mine' | 'shared'>('mine')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadDocs() {
    const res = await fetch('/api/documents')
    const data = await res.json()
    setOwned(data.owned || [])
    setShared(data.shared || [])
    setLoading(false)
  }

  useEffect(() => { loadDocs() }, [])

  async function createNew() {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Untitled' }),
    })
    const doc = await res.json()
    router.push(`/documents/${doc.id}`)
  }

  async function deleteDoc(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this document?')) return
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    setOwned(prev => prev.filter(d => d.id !== id))
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const doc = await res.json()
      router.push(`/documents/${doc.id}`)
    } else {
      const d = await res.json()
      alert(d.error || 'Upload failed')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const docs = tab === 'mine' ? owned : shared

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Inkwell</h1>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{userName || userEmail}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
          <div className="flex gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Upload size={16} />
              {uploading ? 'Importing…' : 'Import file'}
            </label>
            <button
              onClick={createNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> New document
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setTab('mine')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'mine' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My documents ({owned.length})
          </button>
          <button
            onClick={() => setTab('shared')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'shared' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Shared with me ({shared.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading…</div>
        ) : docs.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">
              {tab === 'mine' ? 'No documents yet' : 'Nothing shared with you yet'}
            </p>
            {tab === 'mine' && (
              <button
                onClick={createNew}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Create your first document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map(doc => (
              <div
                key={doc.id}
                onClick={() => router.push(`/documents/${doc.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <FileText size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  {tab === 'mine' && (
                    <button
                      onClick={e => deleteDoc(doc.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{doc.title || 'Untitled'}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatRelative(tab === 'mine' ? doc.updated_at : doc.shared_at || doc.updated_at)}
                  </span>
                  {tab === 'mine' && Number(doc.share_count) > 0 && (
                    <span className="flex items-center gap-1">
                      <Share2 size={11} />
                      {doc.share_count} shared
                    </span>
                  )}
                  {tab === 'shared' && (
                    <span className="text-gray-400">by {doc.owner_email.split('@')[0]}</span>
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
