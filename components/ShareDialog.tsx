'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShareNetwork, UserPlus, Trash, EnvelopeSimple } from '@phosphor-icons/react'

type Share = { shared_with_email: string; created_at: string }
const EASE = [0.32, 0.72, 0, 1] as const

export default function ShareDialog({
  documentId, onClose,
}: { documentId: string; onClose: () => void }) {
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
    e.preventDefault(); setError(''); setLoading(true)
    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return }
    setEmail(''); load()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(5,5,5,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="w-full max-w-[420px]"
      >
        {/* Outer bezel */}
        <div className="p-[1.5px] rounded-[1.75rem]"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(255,255,255,0.08) 50%, rgba(139,92,246,0.25) 100%)' }}
        >
          {/* Inner */}
          <div className="rounded-[calc(1.75rem-1.5px)] overflow-hidden"
            style={{
              background: 'rgba(10,10,18,0.96)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.07)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <ShareNetwork size={15} weight="light" color="#818cf8" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white/90">Share document</h2>
                  <p className="text-[11px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    Invite collaborators by email
                  </p>
                </div>
              </div>
              <button onClick={onClose}
                className="p-1.5 rounded-lg transition-colors duration-200"
                style={{ color: 'rgba(248,250,252,0.3)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(248,250,252,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,250,252,0.3)')}
              >
                <X size={16} weight="light" />
              </button>
            </div>

            <div className="px-6 py-5">
              {/* Email input */}
              <form onSubmit={addShare} className="flex gap-2 mb-5">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <EnvelopeSimple size={13} weight="light" color="rgba(248,250,252,0.3)" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="collaborator@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 0 16px rgba(99,102,241,0.25)' }}
                >
                  <UserPlus size={12} weight="light" />
                  {loading ? '…' : 'Invite'}
                </motion.button>
              </form>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    className="text-xs mb-4 px-3 py-2 rounded-lg"
                    style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Shares list */}
              {shares.length > 0 ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3"
                    style={{ color: 'rgba(248,250,252,0.3)' }}>
                    Shared with
                  </p>
                  <div className="space-y-1.5">
                    <AnimatePresence>
                      {shares.map(s => (
                        <motion.div
                          key={s.shared_with_email}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.25, ease: EASE }}
                          className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                              {s.shared_with_email[0].toUpperCase()}
                            </div>
                            <span className="text-xs" style={{ color: 'rgba(248,250,252,0.7)' }}>
                              {s.shared_with_email}
                            </span>
                          </div>
                          <button
                            onClick={() => removeShare(s.shared_with_email)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all duration-200"
                            style={{ color: 'rgba(248,250,252,0.35)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,250,252,0.35)')}
                          >
                            <Trash size={12} weight="light" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs py-4" style={{ color: 'rgba(248,250,252,0.3)' }}>
                  Not shared with anyone yet
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
