'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import { motion } from 'framer-motion'
import {
  TextB, TextItalic, TextUnderline, Link as LinkIcon,
  TextAlignLeft, TextAlignCenter, TextAlignRight,
  ListBullets, ListNumbers, Quotes, Code, ArrowCounterClockwise, ArrowClockwise,
  Minus
} from '@phosphor-icons/react'

type Props = { content: string; onChange: (html: string) => void; editable?: boolean; focusMode?: boolean }

function Sep() {
  return <div className="w-px h-4 mx-0.5" style={{ background: 'rgba(15,23,42,0.12)' }} />
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
      className="p-1.5 rounded-lg transition-colors duration-200"
      style={{
        background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
        color: active ? '#6366f1' : 'rgba(15,23,42,0.55)',
        border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
      }}
    >
      {children}
    </motion.button>
  )
}

export default function TiptapEditor({ content, onChange, editable = true, focusMode = false }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline, TextStyle, Color,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
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
        <div className="flex flex-wrap items-center gap-0.5 px-4 py-2.5 sticky top-16 z-20"
          style={{
            background: 'rgba(255,255,255,0.92)',
            borderBottom: '1px solid rgba(15,23,42,0.07)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
            <ArrowCounterClockwise size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
            <ArrowClockwise size={14} weight="light" />
          </ToolBtn>
          <Sep />
          {[1,2,3].map(l => (
            <ToolBtn key={l}
              onClick={() => editor.chain().focus().toggleHeading({ level: l as 1|2|3 }).run()}
              active={editor.isActive('heading', { level: l })}
              title={`H${l}`}
            >
              <span className="text-[11px] font-bold" style={{ fontFamily: 'inherit' }}>H{l}</span>
            </ToolBtn>
          ))}
          <Sep />
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <TextB size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <TextItalic size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <TextUnderline size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
            <Code size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Link">
            <LinkIcon size={14} weight="light" />
          </ToolBtn>
          <Sep />
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Left">
            <TextAlignLeft size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">
            <TextAlignCenter size={14} weight="light" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Right">
            <TextAlignRight size={14} weight="light" />
          </ToolBtn>
          <Sep />
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
