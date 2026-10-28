'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  PencilSimpleLine, ArrowUpRight, UsersThree, FileArrowUp, LockSimple, TextT
} from '@phosphor-icons/react'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

const EASE = [0.32, 0.72, 0, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE, delay: i * 0.1 },
  }),
}

const features = [
  {
    icon: TextT,
    title: 'Rich text editing',
    desc: 'Full Tiptap editor — headings, lists, links, blockquotes, code blocks and more.',
    span: 'md:col-span-2 md:row-span-2',
    accent: 'from-indigo-500/20 to-violet-500/10',
  },
  {
    icon: UsersThree,
    title: 'Instant sharing',
    desc: 'Share any document with a collaborator by email. They get read access immediately.',
    span: '',
    accent: 'from-blue-500/15 to-cyan-500/10',
  },
  {
    icon: FileArrowUp,
    title: 'File import',
    desc: 'Upload .txt or .md files — parsed and saved as editable documents.',
    span: '',
    accent: 'from-violet-500/15 to-purple-500/10',
  },
  {
    icon: LockSimple,
    title: 'Auth & access control',
    desc: 'Email + password auth. Only owners can edit — viewers get a clean read-only view.',
    span: 'md:col-span-2',
    accent: 'from-emerald-500/15 to-teal-500/10',
  },
]

export default function LandingClient() {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: '#050505' }}>
      <ThreeBackground />

      {/* Radial glow orbs — CSS only */}
      <div className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 25% 25%, rgba(99,102,241,0.13) 0%, transparent 70%),
            radial-gradient(ellipse 50% 35% at 75% 75%, rgba(139,92,246,0.09) 0%, transparent 70%)
          `
        }}
      />

      {/* Floating glass pill navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-6 px-5 py-2.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 1px rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
              <PencilSimpleLine size={12} weight="light" color="white" />
            </div>
            <span className="text-sm font-semibold text-white/90 tracking-tight">Inkwell</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <Link href="/login" className="text-sm text-white/55 hover:text-white/90 transition-colors duration-300">Sign in</Link>
          <Link href="/register"
            className="text-sm font-medium text-white px-4 py-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95"
            style={{
              background: 'rgba(99,102,241,0.9)',
              boxShadow: '0 0 20px rgba(99,102,241,0.3)',
            }}
          >
            Get started
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-4 text-center pt-24 pb-32">
        {/* Eyebrow badge */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-indigo-300">
            Collaborative document editing
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="text-[clamp(3rem,10vw,8rem)] font-extrabold leading-[0.92] tracking-[-0.04em] text-white mb-8 max-w-4xl"
        >
          DOCUMENTS<br />
          <span style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            THAT THINK
          </span>
          <br />WITH YOU.
        </motion.h1>

        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="text-lg md:text-xl max-w-lg mb-12"
          style={{ color: 'rgba(248,250,252,0.5)', lineHeight: 1.6 }}
        >
          A lightweight collaborative editor with Tiptap, real-time sharing,
          and file import — beautifully designed.
        </motion.p>

        {/* CTA group */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          {/* Primary CTA — button-in-button architecture */}
          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="group flex items-center gap-3 px-6 py-3.5 rounded-full cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 40px rgba(99,102,241,0.4), inset 0 1px 1px rgba(255,255,255,0.15)',
              }}
            >
              <span className="text-sm font-semibold text-white">Get started free</span>
              <motion.div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                whileHover={{ x: 2, y: -1, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <ArrowUpRight size={13} weight="bold" color="white" />
              </motion.div>
            </motion.div>
          </Link>

          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full cursor-pointer text-sm font-medium"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(248,250,252,0.8)',
              }}
            >
              Sign in
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Feature bento */}
      <section className="relative z-10 px-4 pb-32 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] font-medium mb-4"
            style={{ color: 'rgba(99,102,241,0.8)' }}>
            Everything you need
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-white">
            Built for focus.
          </h2>
        </motion.div>

        {/* Asymmetric bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-[1.75rem] p-6 ${f.span}`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.07)',
              }}
            >
              {/* Inner highlight gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]`} />

              <div className="relative z-10">
                <div className="mb-4 w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}
                >
                  <f.icon size={18} weight="light" color="#818cf8" />
                </div>
                <h3 className="font-semibold text-white/90 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,252,0.45)' }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t text-center py-8 px-4"
        style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(248,250,252,0.3)' }}>
        <p className="text-xs">
          Built with Next.js · Tiptap · Neon Postgres · Three.js · Framer Motion
        </p>
      </footer>
    </div>
  )
}
