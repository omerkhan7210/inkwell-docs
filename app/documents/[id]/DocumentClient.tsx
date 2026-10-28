'use client'
import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TiptapEditor from '@/components/TiptapEditor'
import ShareDialog from '@/components/ShareDialog'
import { formatRelative } from '@/lib/utils'
import { ChevronLeft, Share2, Check, Clock, Lock } from 'lucide-react'

type Doc = {
  id: string
  title: string
  content_html: string
  owner_email: string
  updated_at: string
}

export default function DocumentClient({
  doc,
  isOwner,
  userEmail,
}: {
  doc: Doc
  isOwner: boolean
  userEmail: string
}) {
  const router = useRouter()
  const [title, setTitle] = useState(doc.title)
  const [content, setContent] = useState(doc.content_html)
  const [saved, setSaved] = useState(true)
  const [lastSaved, setLastSaved] = useState(doc.updated_at)
  const [showShare, setShowShare] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    async (newTitle: string, newContent: string) => {
      if (!isOwner) return
      setSaved(false)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        await fetch(`/api/documents/${doc.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle, content_html: newContent }),
        })
        setSaved(true)
        setLastSaved(new Date().toISOString())
      }, 800)
    },
    [doc.id, isOwner]
  )

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    save(e.target.value, content)
  }

  function handleContentChange(html: string) {
    setContent(html)
    save(title, html)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <input
            value={title}
            onChange={handleTitleChange}
            disabled={!isOwner}
            className="text-lg font-semibold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 w-64 truncate disabled:cursor-default"
            placeholder="Document title"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            {!isOwner ? (
              <><Lock size={12} /> Read-only</>
            ) : saved ? (
              <><Check size={12} className="text-green-500" /> Saved {formatRelative(lastSaved)}</>
            ) : (
              <><Clock size={12} className="animate-spin" /> Saving…</>
            )}
          </span>
          {isOwner && (
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Share2 size={14} /> Share
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <TiptapEditor
          content={content}
          onChange={handleContentChange}
          editable={isOwner}
        />
      </main>

      {showShare && (
        <ShareDialog documentId={doc.id} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
