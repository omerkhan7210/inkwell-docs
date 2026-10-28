'use client'
import { useState, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import TiptapEditor from '@/components/TiptapEditor'
import ShareDialog from '@/components/ShareDialog'
import { formatRelative } from '@/lib/utils'
import {
  CaretLeft, ShareNetwork, Check, Clock, Lock, PencilSimpleLine,
  ArrowsOut, ArrowsIn, TextAlignLeft
} from '@phosphor-icons/react'

const EASE = [0.32, 0.72, 0, 1] as const

type Doc = {
  id: string; title: string; content_html: string; owner_email: string; updated_at: string
}

function getWordCount(html: string) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return 0
  return text.split(' ').filter(w => w.length > 0).length
}

function getReadingTime(words: number) {
  const mins = Math.ceil(words / 200)
  return mins < 1 ? '<1 min' : `${mins} min read`
}

export default function DocumentClient({
  doc, isOwner, userEmail,
}: {
  doc: Doc; isOwner: boolean; userEmail: string
}) {
  const [title, setTitle] = useState(doc.title)
  const [content, setContent] = useState(doc.content_html)
  const [saved, setSaved] = useState(true)
  const [lastSaved, setLastSaved] = useState(doc.updated_at)
  const [showShare, setShowShare] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const wordCount = useMemo(() => getWordCount(content), [content])
  const readingTime = useMemo(() => getReadingTime(wordCount), [wordCount])

  const save = useCallback(async (t: string, c: string) => {
    if (!isOwner) return
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await fetch(`/api/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t, content_html: c }),
      })
      setSaved(true)
      setLastSaved(new Date().toISOString())
    }, 800)
  }, [doc.id, isOwner])

  return (
    <div style={{ background: focusMode ? '#fafafa' : '#f8fafc', minHeight: '100dvh' }}>
      {/* Sticky top bar — hidden in focus mode */}
      <AnimatePresence>
        {!focusMode && (
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="sticky top-0 z-30 px-6 py-3"
            style={{
              background: 'rgba(248,250,252,0.88)',
              borderBottom: '1px solid rgba(15,23,42,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <Link href="/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.08, x: -2 }} whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="p-2 rounded-xl transition-colors duration-200"
                    style={{ color: 'rgba(15,23,42,0.45)' }}
                  >
                    <CaretLeft size={16} weight="light" />
                  </motion.div>
                </Link>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <PencilSimpleLine size={11} weight="light" color="#6366f1" />
                  </div>
                  <input
                    value={title}
                    onChange={e => { setTitle(e.target.value); save(e.target.value, content) }}
                    disabled={!isOwner}
                    className="text-sm font-semibold bg-transparent border-0 focus:outline-none min-w-0 truncate max-w-[160px] md:max-w-[320px] transition-all duration-200"
                    style={{ color: 'rgba(15,23,42,0.85)', cursor: isOwner ? 'text' : 'default' }}
                    placeholder="Untitled"
                  />
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Word count + reading time */}
                <div className="hidden md:flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(15,23,42,0.05)', color: 'rgba(15,23,42,0.4)' }}>
                  <TextAlignLeft size={10} weight="light" />
                  <span>{wordCount.toLocaleString()} words</span>
                  <span style={{ color: 'rgba(15,23,42,0.2)' }}>·</span>
                  <span>{readingTime}</span>
                </div>

                {/* Save status */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isOwner ? (saved ? 'saved' : 'saving') : 'readonly'}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="hidden sm:flex items-center gap-1.5 text-[11px] rounded-full px-3 py-1"
                    style={{
                      background: isOwner && saved ? 'rgba(16,185,129,0.1)' : 'rgba(15,23,42,0.06)',
                      color: isOwner && saved ? '#059669' : 'rgba(15,23,42,0.45)',
                    }}
                  >
                    {!isOwner ? (
                      <><Lock size={10} weight="light" /> Read-only</>
                    ) : saved ? (
                      <><Check size={10} weight="bold" /> Saved {formatRelative(lastSaved)}</>
                    ) : (
                      <><Clock size={10} weight="light" className="animate-spin" /> Saving…</>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Focus mode toggle */}
                <motion.button
                  onClick={() => setFocusMode(true)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="p-2 rounded-xl transition-colors duration-200"
                  style={{ color: 'rgba(15,23,42,0.4)' }}
                  title="Focus mode"
                >
                  <ArrowsOut size={14} weight="light" />
                </motion.button>

                {isOwner && (
                  <motion.button
                    onClick={() => setShowShare(true)}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                      boxShadow: '0 0 16px rgba(99,102,241,0.25)',
                    }}
                  >
                    <ShareNetwork size={12} weight="light" />
                    <span>Share</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Focus mode exit bar */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
          >
            <div className="flex items-center gap-4 px-5 py-3 rounded-full"
              style={{
                background: 'rgba(15,23,42,0.85)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <span className="text-xs text-white/50">{wordCount.toLocaleString()} words · {readingTime}</span>
              <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)' }} />
              <button
                onClick={() => setFocusMode(false)}
                className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors duration-200"
              >
                <ArrowsIn size={12} weight="light" />
                Exit focus
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor body */}
      <main className="max-w-4xl mx-auto px-4 py-8" style={{ paddingTop: focusMode ? '3rem' : undefined }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <TiptapEditor
            content={content}
            onChange={html => { setContent(html); save(title, html) }}
            editable={isOwner}
            focusMode={focusMode}
          />
        </motion.div>
      </main>

      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ShareDialog documentId={doc.id} onClose={() => setShowShare(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
