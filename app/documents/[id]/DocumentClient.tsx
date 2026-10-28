'use client'
import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import TiptapEditor from '@/components/TiptapEditor'
import ShareDialog from '@/components/ShareDialog'
import { formatRelative } from '@/lib/utils'
import {
  CaretLeft, ShareNetwork, Check, Clock, Lock, PencilSimpleLine,
  ArrowsOut, ArrowsIn, TextAlignLeft, List, DownloadSimple, X
} from '@phosphor-icons/react'

const EASE = [0.32, 0.72, 0, 1] as const

type Doc = {
  id: string; title: string; content_html: string; owner_email: string; updated_at: string
}

type Heading = { level: 1 | 2 | 3; text: string; index: number }

function getWordCount(html: string) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return 0
  return text.split(' ').filter(w => w.length > 0).length
}

function getReadingTime(words: number) {
  const mins = Math.ceil(words / 200)
  return mins < 1 ? '<1 min' : `${mins} min read`
}

function parseHeadings(html: string): Heading[] {
  const headings: Heading[] = []
  const regex = /<h([123])[^>]*>([\s\S]*?)<\/h[123]>/gi
  let match
  let index = 0
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]) as 1 | 2 | 3
    const text = match[2].replace(/<[^>]*>/g, '').trim()
    if (text) headings.push({ level, text, index: index++ })
  }
  return headings
}

function exportMarkdown(title: string, html: string) {
  import('turndown').then(({ default: TurndownService }) => {
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
    const md = `# ${title}\n\n${td.turndown(html)}`
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'document'}.md`
    a.click()
    URL.revokeObjectURL(url)
  })
}

function OutlinePanel({ headings, onClose }: { headings: Heading[]; onClose: () => void }) {
  const scrollToHeading = (text: string) => {
    const editorEl = document.querySelector('.tiptap')
    if (!editorEl) return
    const allHeadings = editorEl.querySelectorAll('h1, h2, h3')
    for (const el of allHeadings) {
      if (el.textContent?.trim() === text) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="fixed left-4 top-20 z-30 w-56"
      style={{
        background: 'rgba(248,250,252,0.92)',
        border: '1px solid rgba(15,23,42,0.09)',
        borderRadius: '1.25rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(15,23,42,0.08)',
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2"
        style={{ borderBottom: '1px solid rgba(15,23,42,0.07)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em]"
          style={{ color: 'rgba(15,23,42,0.4)' }}>Outline</span>
        <button onClick={onClose}
          className="p-1 rounded-lg transition-colors duration-200"
          style={{ color: 'rgba(15,23,42,0.3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(15,23,42,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(15,23,42,0.3)')}
        >
          <X size={13} weight="light" />
        </button>
      </div>

      <div className="py-3 px-2 max-h-[60vh] overflow-y-auto">
        {headings.length === 0 ? (
          <p className="text-[11px] text-center py-4 px-2"
            style={{ color: 'rgba(15,23,42,0.35)' }}>
            Add headings to see an outline
          </p>
        ) : (
          headings.map(h => (
            <button
              key={h.index}
              onClick={() => scrollToHeading(h.text)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all duration-200 truncate block"
              style={{
                paddingLeft: `${(h.level - 1) * 12 + 8}px`,
                color: h.level === 1 ? 'rgba(15,23,42,0.8)' : h.level === 2 ? 'rgba(15,23,42,0.6)' : 'rgba(15,23,42,0.45)',
                fontWeight: h.level === 1 ? 600 : h.level === 2 ? 500 : 400,
                fontSize: h.level === 1 ? '12px' : h.level === 2 ? '11.5px' : '11px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#6366f1' }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = h.level === 1 ? 'rgba(15,23,42,0.8)' : h.level === 2 ? 'rgba(15,23,42,0.6)' : 'rgba(15,23,42,0.45)'
              }}
            >
              {h.text}
            </button>
          ))
        )}
      </div>
    </motion.div>
  )
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
  const [showOutline, setShowOutline] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const wordCount = useMemo(() => getWordCount(content), [content])
  const readingTime = useMemo(() => getReadingTime(wordCount), [wordCount])
  const headings = useMemo(() => parseHeadings(content), [content])

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

                {/* Outline toggle */}
                <motion.button
                  onClick={() => setShowOutline(v => !v)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="p-2 rounded-xl transition-all duration-200"
                  style={{
                    color: showOutline ? '#6366f1' : 'rgba(15,23,42,0.4)',
                    background: showOutline ? 'rgba(99,102,241,0.1)' : 'transparent',
                  }}
                  title="Document outline"
                >
                  <List size={14} weight="light" />
                </motion.button>

                {/* Export as Markdown */}
                <motion.button
                  onClick={() => exportMarkdown(title, content)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="p-2 rounded-xl transition-colors duration-200"
                  style={{ color: 'rgba(15,23,42,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(15,23,42,0.75)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(15,23,42,0.4)')}
                  title="Export as Markdown"
                >
                  <DownloadSimple size={14} weight="light" />
                </motion.button>

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

      {/* Outline panel */}
      <AnimatePresence>
        {showOutline && !focusMode && (
          <OutlinePanel headings={headings} onClose={() => setShowOutline(false)} />
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
                onClick={() => exportMarkdown(title, content)}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors duration-200"
              >
                <DownloadSimple size={12} weight="light" />
                Export
              </button>
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
