'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Users, Code, BookOpen, Note } from '@phosphor-icons/react'

const EASE = [0.32, 0.72, 0, 1] as const

export const TEMPLATES = [
  {
    id: 'blank',
    label: 'Blank',
    icon: FileText,
    desc: 'Start with a clean page',
    color: 'rgba(99,102,241,0.15)',
    border: 'rgba(99,102,241,0.2)',
    iconColor: '#818cf8',
    content: '',
  },
  {
    id: 'meeting',
    label: 'Meeting Notes',
    icon: Users,
    desc: 'Agenda, attendees, action items',
    color: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.2)',
    iconColor: '#34d399',
    content: `<h1>Meeting Notes</h1><p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p><p><strong>Attendees:</strong> </p><h2>Agenda</h2><ul><li><p>Item 1</p></li><li><p>Item 2</p></li><li><p>Item 3</p></li></ul><h2>Discussion</h2><p></p><h2>Action Items</h2><ul><li><p>[ ] Owner — Task</p></li></ul><h2>Next Meeting</h2><p></p>`,
  },
  {
    id: 'product',
    label: 'Product Brief',
    icon: Note,
    desc: 'Summary, goals, requirements',
    color: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.2)',
    iconColor: '#fbbf24',
    content: `<h1>Product Brief</h1><p><strong>Owner:</strong> &nbsp; <strong>Status:</strong> Draft &nbsp; <strong>Date:</strong> ${new Date().toLocaleDateString()}</p><h2>Summary</h2><p>One paragraph describing what this is and why it matters.</p><h2>Problem</h2><p>What user pain are we solving? What is the current workaround?</p><h2>Goals</h2><ul><li><p>Goal 1</p></li><li><p>Goal 2</p></li></ul><h2>Non-Goals</h2><ul><li><p>Out of scope: </p></li></ul><h2>Requirements</h2><p></p><h2>Success Metrics</h2><p></p>`,
  },
  {
    id: 'technical',
    label: 'Technical Doc',
    icon: Code,
    desc: 'Overview, setup, API reference',
    color: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.2)',
    iconColor: '#a78bfa',
    content: `<h1>Technical Documentation</h1><h2>Overview</h2><p>Brief description of what this does and the key design decisions.</p><h2>Prerequisites</h2><ul><li><p>Node.js ≥ 18</p></li><li><p>Postgres 15</p></li></ul><h2>Installation</h2><pre><code>npm install</code></pre><h2>Configuration</h2><p>Create a <code>.env.local</code> file:</p><pre><code>DATABASE_URL=\nNEXTAUTH_SECRET=</code></pre><h2>API Reference</h2><h3>Endpoints</h3><p></p><h2>Architecture</h2><p></p>`,
  },
  {
    id: 'essay',
    label: 'Essay',
    icon: BookOpen,
    desc: 'Title, intro, body, conclusion',
    color: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.18)',
    iconColor: '#f87171',
    content: `<h1>Essay Title</h1><p><em>By Author · ${new Date().toLocaleDateString()}</em></p><h2>Introduction</h2><p>Hook sentence. Background context. Thesis statement.</p><h2>Body</h2><h3>First Point</h3><p></p><h3>Second Point</h3><p></p><h3>Third Point</h3><p></p><h2>Conclusion</h2><p>Restate thesis. Summarise key points. Call to action or closing thought.</p>`,
  },
]

export default function TemplatePickerDialog({
  onSelect, onClose,
}: {
  onSelect: (template: typeof TEMPLATES[0]) => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(5,5,5,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="w-full max-w-[560px]"
      >
        <div className="p-[1.5px] rounded-[2rem]"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(255,255,255,0.07) 50%, rgba(139,92,246,0.2) 100%)' }}
        >
          <div className="rounded-[calc(2rem-1.5px)] overflow-hidden"
            style={{ background: 'rgba(10,10,18,0.97)', backdropFilter: 'blur(40px)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.07)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <h2 className="text-base font-semibold text-white/90">New document</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(248,250,252,0.4)' }}>
                  Choose a template to get started — or go blank
                </p>
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

            {/* Template grid */}
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TEMPLATES.map(t => (
                <motion.button
                  key={t.id}
                  onClick={() => onSelect(t)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex flex-col items-start p-4 rounded-2xl text-left transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = t.color
                    e.currentTarget.style.borderColor = t.border
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: t.color, border: `1px solid ${t.border}` }}>
                    <t.icon size={15} weight="light" color={t.iconColor} />
                  </div>
                  <p className="text-sm font-semibold text-white/85 tracking-tight">{t.label}</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(248,250,252,0.38)' }}>{t.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
