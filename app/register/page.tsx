'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PencilSimpleLine, Envelope, Lock, User, ArrowRight, WarningCircle } from '@phosphor-icons/react'

const EASE = [0.32, 0.72, 0, 1] as const

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
    e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
    e.currentTarget.style.boxShadow = 'none'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }
    await signIn('credentials', { email, password, redirect: false })
    router.push('/dashboard'); router.refresh()
  }

  const inputClass = "w-full py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4"
      style={{
        background: '#050505',
        backgroundImage: `
          radial-gradient(ellipse 65% 45% at 70% 20%, rgba(139,92,246,0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 25% 80%, rgba(99,102,241,0.09) 0%, transparent 70%)
        `,
      }}
    >
      <motion.div className="fixed top-6 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Link href="/" className="flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)' }}
        >
          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
            <PencilSimpleLine size={10} weight="light" color="white" />
          </div>
          <span className="text-sm font-semibold text-white/80 tracking-tight">Inkwell</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="w-full max-w-[420px]"
      >
        <div className="p-[1.5px] rounded-[2rem]"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(255,255,255,0.06) 50%, rgba(99,102,241,0.2) 100%)' }}
        >
          <div className="rounded-[calc(2rem-1.5px)] px-8 py-9"
            style={{
              background: 'rgba(10,10,18,0.92)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.07)',
            }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create your account</h1>
              <p className="text-sm" style={{ color: 'rgba(248,250,252,0.45)' }}>Start writing with Inkwell today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.3, ease: EASE }}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                  >
                    <WarningCircle size={15} weight="fill" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {[
                { label: 'Name', icon: User, value: name, set: setName, type: 'text', ph: 'Your name', pl: 'pl-9' },
                { label: 'Email', icon: Envelope, value: email, set: setEmail, type: 'email', ph: 'you@example.com', pl: 'pl-9' },
                { label: 'Password', icon: Lock, value: password, set: setPassword, type: 'password', ph: '••••••••', pl: 'pl-9' },
              ].map(({ label, icon: Icon, value, set, type, ph, pl }) => (
                <div key={label}>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(248,250,252,0.5)' }}>{label}</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Icon size={14} weight="light" color="rgba(248,250,252,0.35)" />
                    </div>
                    <input
                      type={type}
                      value={value}
                      onChange={e => set(e.target.value)}
                      required
                      minLength={undefined}
                      className={`${inputClass} ${pl} pr-4`}
                      style={inputStyle}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                      placeholder={ph}
                    />
                  </div>
                </div>
              ))}

              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="group w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-semibold text-white mt-2 disabled:opacity-50"
                style={{ background: loading ? 'rgba(99,102,241,0.6)' : 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}
              >
                {loading ? 'Creating…' : 'Create account'}
                {!loading && (
                  <motion.div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.18)' }}
                    whileHover={{ x: 2, y: -1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    <ArrowRight size={10} weight="bold" color="white" />
                  </motion.div>
                )}
              </motion.button>
            </form>

            <p className="text-center text-xs mt-6" style={{ color: 'rgba(248,250,252,0.35)' }}>
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors duration-200">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
