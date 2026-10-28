'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  PencilSimpleLine, ArrowRight, UsersThree, FileArrowUp, LockSimple, TextT
} from '@phosphor-icons/react'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

const EASE = [0.32, 0.72, 0, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE, delay: i * 0.12 },
  }),
}

const features = [
  {
    icon: TextT,
    title: 'Rich text editing',
    desc: 'Full Tiptap editor — headings, lists, links, blockquotes, code blocks. Plus focus mode and live word count.',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    icon: UsersThree,
    title: 'Instant sharing',
    desc: 'Share any document by email. Collaborators get access immediately.',
    span: '',
  },
  {
    icon: FileArrowUp,
    title: 'File import',
    desc: 'Upload .txt or .md files — parsed and saved as editable documents.',
    span: '',
  },
  {
    icon: LockSimple,
    title: 'Postgres-native auth',
    desc: 'Passwords hashed inside Postgres via pgcrypto. Sessions are JWT-signed. Only owners can edit.',
    span: 'md:col-span-2',
  },
]

export default function LandingClient() {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden" style={{ background: '#050505' }}>
      <ThreeBackground />

      {/* Subtle radial glow */}
      <div className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 60%, rgba(99,102,241,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 75% 80%, rgba(139,92,246,0.06) 0%, transparent 70%)
          `
        }}
      />

      {/* ── Navbar ─────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50"
      >
        {/* Outer bezel */}
        <div className="p-[1px] rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
          }}
        >
          <div className="flex items-center gap-1 px-2 py-2 rounded-full"
            style={{
              background: 'rgba(8,8,16,0.85)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
            }}
          >
            {/* Logo */}
            <div className="flex items-center gap-2 pl-2 pr-4">
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 10px rgba(99,102,241,0.4)' }}>
                <PencilSimpleLine size={11} weight="light" color="white" />
              </div>
              <span className="text-sm font-semibold tracking-tight" style={{ color: 'rgba(248,250,252,0.9)' }}>Inkwell</span>
            </div>

            {/* Sign in — ghost */}
            <Link href="/login"
              className="text-xs font-medium px-4 py-2 rounded-full transition-all duration-300"
              style={{ color: 'rgba(248,250,252,0.5)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(248,250,252,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,250,252,0.5)')}
            >
              Sign in
            </Link>

            {/* Get started — filled pill */}
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                  boxShadow: '0 0 16px rgba(99,102,241,0.35)',
                }}
              >
                Get started
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                  <ArrowRight size={9} weight="bold" color="white" />
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center">
        {/* Eyebrow */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#818cf8' }} />
          <span className="text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: 'rgba(129,140,248,0.9)' }}>
            Collaborative document editing
          </span>
        </motion.div>

        {/* Headline — refined, mixed case, editorial */}
        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="font-bold tracking-[-0.035em] text-white mb-6"
          style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', lineHeight: 1.1, maxWidth: '820px' }}
        >
          The writing tool that{' '}
          <span style={{
            background: 'linear-gradient(135deg, #a5b4fc 0%, #c084fc 55%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            gets out of your way
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="text-base md:text-lg max-w-md mb-12 leading-relaxed"
          style={{ color: 'rgba(248,250,252,0.42)' }}
        >
          Real-time sharing, focus mode, word count, and file import.
          No bloat. Just your words.
        </motion.p>

        {/* CTA group */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center gap-3 flex-wrap justify-center"
        >
          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: '0 0 48px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="group flex items-center gap-3 px-6 py-3 rounded-full cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 32px rgba(99,102,241,0.35)',
              }}
            >
              <span className="text-sm font-semibold text-white">Start writing free</span>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                <ArrowRight size={11} weight="bold" color="white" />
              </div>
            </motion.div>
          </Link>

          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="px-6 py-3 rounded-full cursor-pointer text-sm font-medium"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(248,250,252,0.65)',
              }}
            >
              Sign in
            </motion.div>
          </Link>
        </motion.div>

        {/* Social proof line */}
        <motion.p custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="mt-10 text-[11px] tracking-wide"
          style={{ color: 'rgba(248,250,252,0.22)' }}
        >
          Built with Next.js · Tiptap · Neon · Three.js · Framer Motion
        </motion.p>
      </section>

      {/* ── Feature bento ───────────────────────────────── */}
      <section className="relative z-10 px-4 pb-32 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-14"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] font-medium mb-3"
            style={{ color: 'rgba(99,102,241,0.75)' }}>
            What's inside
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] text-white/90">
            Built for focus.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, ease: EASE, delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className={`group relative overflow-hidden rounded-[1.75rem] p-6 ${f.span}`}
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 30% 30%, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />

              <div className="relative z-10">
                <div className="mb-5 w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.18)' }}>
                  <f.icon size={17} weight="light" color="#818cf8" />
                </div>
                <h3 className="font-semibold text-white/85 mb-2 tracking-tight text-sm">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,252,0.4)' }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t text-center py-8 px-4"
        style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(248,250,252,0.25)' }}>
        <p className="text-xs">Inkwell — Ajaia assessment project · 2024</p>
      </footer>
    </div>
  )
}
