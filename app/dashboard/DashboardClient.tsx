'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { formatRelative } from '@/lib/utils'
import {
  PencilSimpleLine, Plus, UploadSimple, SignOut,
  FilePlus, Users, Clock, Trash, Files, ShareNetwork
} from '@phosphor-icons/react'
import TemplatePickerDialog, { TEMPLATES } from '@/components/TemplatePickerDialog'

type Doc = {
  id: string; title: string; updated_at: string
  owner_email: string; share_count?: number; shared_at?: string
}

const EASE = [0.32, 0.72, 0, 1] as const

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: EASE, delay: i * 0.06 },
  }),
}

export default function DashboardClient({ userEmail, userName }: { userEmail: string; userName: string }) {
  const router = useRouter()
  const [owned, setOwned] = useState<Doc[]>([])
  const [shared, setShared] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'mine' | 'shared'>('mine')
  const [uploading, setUploading] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadDocs() {
    const res = await fetch('/api/documents')
    const data = await res.json()
    setOwned(data.owned || []); setShared(data.shared || [])
    setLoading(false)
  }
  useEffect(() => { loadDocs() }, [])

  async function createFromTemplate(template: typeof TEMPLATES[0]) {
    setShowTemplatePicker(false)
    const title = template.id === 'blank' ? 'Untitled' : template.label
    const res = await fetch('/api/documents', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content_html: template.content }),
    })
    const doc = await res.json()
    router.push(`/documents/${doc.id}`)
  }

  function createNew() {
    setShowTemplatePicker(true)
  }

  async function deleteDoc(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this document?')) return
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    setOwned(prev => prev.filter(d => d.id !== id))
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) { const doc = await res.json(); router.push(`/documents/${doc.id}`) }
    else { const d = await res.json(); alert(d.error || 'Upload failed') }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const docs = tab === 'mine' ? owned : shared

  const initial = (userName || userEmail).charAt(0).toUpperCase()

  return (
    <div style={{ background: '#050505', minHeight: '100dvh' }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 20% 10%, rgba(99,102,241,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 90%, rgba(139,92,246,0.06) 0%, transparent 70%)
          `
        }}
      />

      {/* Floating glass header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="sticky top-0 z-40 px-6 py-4"
        style={{
          background: 'rgba(5,5,5,0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center"
              style={{ boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}>
              <PencilSimpleLine size={13} weight="light" color="white" />
            </div>
            <span className="text-sm font-semibold text-white/90 tracking-tight">Inkwell</span>
          </div>

          <div className="flex items-center gap-4">
            <input ref={fileRef} type="file" accept=".txt,.md" onChange={handleUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(248,250,252,0.65)',
              }}
            >
              <UploadSimple size={13} weight="light" />
              {uploading ? 'Importing…' : 'Import'}
            </label>

            <motion.button
              onClick={createNew}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                boxShadow: '0 0 20px rgba(99,102,241,0.3)',
              }}
            >
              <Plus size={13} weight="bold" /> New
            </motion.button>

            <div className="flex items-center gap-3 pl-3 border-l" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {initial}
              </div>
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 text-xs transition-colors duration-200"
                style={{ color: 'rgba(248,250,252,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(248,250,252,0.75)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,250,252,0.4)')}
              >
                <SignOut size={13} weight="light" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-10"
        >
          <p className="text-xs uppercase tracking-[0.2em] font-medium mb-3"
            style={{ color: 'rgba(99,102,241,0.7)' }}>
            Welcome back
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-white/90">
            {userName || 'Your workspace'}
          </h2>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="flex items-center gap-1 mb-8 p-1 rounded-2xl w-fit"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {(['mine', 'shared'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="relative px-5 py-2 rounded-xl text-sm font-medium transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ color: tab === t ? '#fff' : 'rgba(248,250,252,0.4)' }}
            >
              {tab === t && (
                <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.3)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {t === 'mine' ? <Files size={13} weight="light" /> : <Users size={13} weight="light" />}
                {t === 'mine' ? `My docs (${owned.length})` : `Shared (${shared.length})`}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-32 rounded-[1.5rem] animate-pulse"
                style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <FilePlus size={28} weight="light" color="#818cf8" />
            </div>
            <p className="text-white/60 text-sm mb-6">
              {tab === 'mine' ? 'No documents yet' : 'Nothing shared with you yet'}
            </p>
            {tab === 'mine' && (
              <motion.button onClick={createNew}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.25)' }}
              >
                <Plus size={14} weight="bold" /> Create first document
              </motion.button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {docs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  layout
                  onClick={() => router.push(`/documents/${doc.id}`)}
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="group relative overflow-hidden rounded-[1.5rem] p-5 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <PencilSimpleLine size={15} weight="light" color="#818cf8" />
                      </div>
                      {tab === 'mine' && (
                        <button
                          onClick={e => deleteDoc(doc.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                          style={{ color: 'rgba(248,250,252,0.35)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,250,252,0.35)')}
                        >
                          <Trash size={13} weight="light" />
                        </button>
                      )}
                    </div>

                    <h3 className="font-semibold tracking-tight mb-3 truncate"
                      style={{ color: 'rgba(248,250,252,0.9)' }}>
                      {doc.title || 'Untitled'}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
                      <span className="flex items-center gap-1.5">
                        <Clock size={10} weight="light" />
                        {formatRelative(tab === 'mine' ? doc.updated_at : doc.shared_at || doc.updated_at)}
                      </span>
                      {tab === 'mine' && Number(doc.share_count) > 0 && (
                        <span className="flex items-center gap-1.5">
                          <ShareNetwork size={10} weight="light" />
                          {doc.share_count} shared
                        </span>
                      )}
                      {tab === 'shared' && (
                        <span style={{ color: 'rgba(248,250,252,0.25)' }}>
                          by {doc.owner_email.split('@')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <AnimatePresence>
        {showTemplatePicker && (
          <TemplatePickerDialog
            onSelect={createFromTemplate}
            onClose={() => setShowTemplatePicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
