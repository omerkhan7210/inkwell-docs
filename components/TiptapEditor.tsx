'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import {
  TextB, TextItalic, TextUnderline, Link as LinkIcon,
  TextAlignLeft, TextAlignCenter, TextAlignRight,
  ListBullets, ListNumbers, Quotes, Code, ArrowCounterClockwise, ArrowClockwise,
  Minus, HighlighterCircle, PaintBucket, CaretDown, Check
} from '@phosphor-icons/react'

type Props = { content: string; onChange: (html: string) => void; editable?: boolean; focusMode?: boolean }

// Curated font list — quality over quantity (Google Docs problem: 100s of fonts, overwhelming)
const FONTS = [
  { label: 'Default', value: '' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
  { label: 'Helvetica', value: 'Helvetica Neue, sans-serif' },
  { label: 'Courier', value: 'Courier New, monospace' },
  { label: 'Plus Jakarta', value: '"Plus Jakarta Sans", sans-serif' },
  { label: 'Palatino', value: 'Palatino, serif' },
]

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48']

const TEXT_COLORS = [
  '#0f172a', '#1e293b', '#475569', '#94a3b8',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#ffffff',
]

const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff',
  '#fed7aa', '#fce7f3', '#cffafe', '#f0fdf4',
]

function Sep() {
  return <div className="w-px h-4 mx-0.5 flex-shrink-0" style={{ background: 'rgba(15,23,42,0.1)' }} />
}

function ToolBtn({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title?: string; children: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className="p-1.5 rounded-lg transition-colors duration-150 flex-shrink-0"
      style={{
        background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
        color: active ? '#6366f1' : 'rgba(15,23,42,0.5)',
        border: active ? '1px solid rgba(99,102,241,0.18)' : '1px solid transparent',
      }}
    >
      {children}
    </motion.button>
  )
}

function FontPicker({ editor }: { editor: any }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = FONTS.find(f => editor.isActive('textStyle', { fontFamily: f.value }))
  const label = current?.label || 'Default'

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o) }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
        style={{
          background: open ? 'rgba(99,102,241,0.08)' : 'rgba(15,23,42,0.04)',
          color: 'rgba(15,23,42,0.65)',
          border: '1px solid rgba(15,23,42,0.08)',
          minWidth: '90px',
        }}
      >
        <span style={{ fontFamily: current?.value || 'inherit' }}>{label}</span>
        <CaretDown size={10} weight="bold" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 rounded-xl overflow-hidden py-1"
          style={{
            background: '#fff',
            border: '1px solid rgba(15,23,42,0.1)',
            boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
            minWidth: '140px',
          }}
        >
          {FONTS.map(f => (
            <button key={f.label} type="button"
              onMouseDown={e => {
                e.preventDefault()
                if (f.value) editor.chain().focus().setFontFamily(f.value).run()
                else editor.chain().focus().unsetFontFamily().run()
                setOpen(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-indigo-50 transition-colors duration-100"
              style={{ fontFamily: f.value || 'inherit', color: 'rgba(15,23,42,0.8)' }}
            >
              {f.label}
              {label === f.label && <Check size={11} color="#6366f1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FontSizePicker({ editor }: { editor: any }) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('16')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o) }}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
        style={{
          background: open ? 'rgba(99,102,241,0.08)' : 'rgba(15,23,42,0.04)',
          color: 'rgba(15,23,42,0.65)',
          border: '1px solid rgba(15,23,42,0.08)',
          minWidth: '48px',
        }}
      >
        {custom}
        <CaretDown size={10} weight="bold" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 rounded-xl overflow-hidden py-1"
          style={{
            background: '#fff',
            border: '1px solid rgba(15,23,42,0.1)',
            boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
            width: '64px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {FONT_SIZES.map(s => (
            <button key={s} type="button"
              onMouseDown={e => {
                e.preventDefault()
                editor.chain().focus().setMark('textStyle', { fontSize: `${s}px` }).run()
                setCustom(s); setOpen(false)
              }}
              className="w-full text-center px-2 py-1.5 text-xs hover:bg-indigo-50 transition-colors duration-100"
              style={{ color: 'rgba(15,23,42,0.75)', fontWeight: custom === s ? 600 : 400 }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ColorPicker({ editor }: { editor: any }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = editor.getAttributes('textStyle').color || '#0f172a'

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o) }}
        title="Text color"
        className="flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors duration-150"
        style={{ color: 'rgba(15,23,42,0.5)', border: '1px solid transparent' }}
      >
        <PaintBucket size={14} weight="light" color={current} />
        <div className="w-3.5 h-0.5 rounded-full mt-0.5" style={{ background: current }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 rounded-xl p-3"
          style={{
            background: '#fff',
            border: '1px solid rgba(15,23,42,0.1)',
            boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
          }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wide mb-2" style={{ color: 'rgba(15,23,42,0.4)' }}>Text color</p>
          <div className="grid grid-cols-7 gap-1">
            {TEXT_COLORS.map(c => (
              <button key={c} type="button"
                onMouseDown={e => {
                  e.preventDefault()
                  editor.chain().focus().setColor(c).run()
                  setOpen(false)
                }}
                className="w-5 h-5 rounded-md border-2 transition-transform hover:scale-110"
                style={{ background: c, borderColor: current === c ? '#6366f1' : 'rgba(15,23,42,0.1)' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function HighlightPicker({ editor }: { editor: any }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = editor.isActive('highlight')

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o) }}
        title="Highlight"
        className="flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors duration-150"
        style={{
          background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
          border: isActive ? '1px solid rgba(99,102,241,0.18)' : '1px solid transparent',
        }}
      >
        <HighlighterCircle size={14} weight="light" color={isActive ? '#6366f1' : 'rgba(15,23,42,0.5)'} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 rounded-xl p-3"
          style={{
            background: '#fff',
            border: '1px solid rgba(15,23,42,0.1)',
            boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
          }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wide mb-2" style={{ color: 'rgba(15,23,42,0.4)' }}>Highlight</p>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {HIGHLIGHT_COLORS.map(c => (
              <button key={c} type="button"
                onMouseDown={e => {
                  e.preventDefault()
                  editor.chain().focus().setHighlight({ color: c }).run()
                  setOpen(false)
                }}
                className="w-6 h-6 rounded-md border-2 transition-transform hover:scale-110"
                style={{ background: c, borderColor: 'rgba(15,23,42,0.1)' }}
              />
            ))}
          </div>
          <button
            type="button"
            onMouseDown={e => {
              e.preventDefault()
              editor.chain().focus().unsetHighlight().run()
              setOpen(false)
            }}
            className="w-full text-[10px] py-1 rounded-lg text-center hover:bg-slate-50 transition-colors"
            style={{ color: 'rgba(15,23,42,0.5)' }}
          >
            Remove highlight
          </button>
        </div>
      )}
    </div>
  )
}

export default function TiptapEditor({ content, onChange, editable = true, focusMode = false }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing…  (tip: try the font and color options above)' }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'focus:outline-none min-h-[65vh] leading-relaxed' },
    },
  })

  if (!editor) return null

  const setLink = () => {
    const url = window.prompt('URL:', editor.getAttributes('link').href || '')
    if (url === null) return
    if (!url) editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="rounded-[1.5rem] overflow-hidden"
      style={{
        background: '#fff',
        boxShadow: focusMode ? 'none' : '0 4px 40px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.06)',
        border: focusMode ? 'none' : '1px solid rgba(15,23,42,0.07)',
      }}
    >
      {editable && !focusMode && (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 sticky top-16 z-20"
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderBottom: '1px solid rgba(15,23,42,0.07)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Undo / Redo */}
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
            <ArrowCounterClockwise size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
            <ArrowClockwise size={14} weight="light" />
          </ToolBtn>
          <Sep />

          {/* Font family — curated 7 fonts, not 1000 */}
          <FontPicker editor={editor} />
          <Sep />

          {/* Font size */}
          <FontSizePicker editor={editor} />
          <Sep />

          {/* Headings */}
          {[1,2,3].map(l => (
            <ToolBtn key={l}
              onClick={() => editor.chain().focus().toggleHeading({ level: l as 1|2|3 }).run()}
              active={editor.isActive('heading', { level: l })}
              title={`Heading ${l}`}
            >
              <span className="text-[11px] font-bold">H{l}</span>
            </ToolBtn>
          ))}
          <Sep />

          {/* Inline formatting */}
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (⌘B)">
            <TextB size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (⌘I)">
            <TextItalic size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (⌘U)">
            <TextUnderline size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
            <Code size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Link">
            <LinkIcon size={14} weight="light" />
          </ToolBtn>
          <Sep />

          {/* Color + Highlight — visible in toolbar, not buried in menus */}
          <ColorPicker editor={editor} />
          <HighlightPicker editor={editor} />
          <Sep />

          {/* Alignment */}
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
            <TextAlignLeft size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">
            <TextAlignCenter size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
            <TextAlignRight size={14} weight="light" />
          </ToolBtn>
          <Sep />

          {/* Lists + blocks */}
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
            <ListBullets size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
            <ListNumbers size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
            <Quotes size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
            <Minus size={14} weight="light" />
          </ToolBtn>
        </div>
      )}
      <div className="px-8 py-8 md:px-16 md:py-12">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
