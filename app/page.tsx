import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Collaborative editing, real-time sharing
        </div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
          Inkwell
        </h1>
        <p className="text-xl text-blue-200 mb-10">Documents that write well together.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="bg-white text-slate-900 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="border border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            Sign in
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 text-center text-sm text-blue-300">
          <div>
            <div className="text-2xl mb-2">✍️</div>
            <div className="font-medium text-white">Rich Text Editor</div>
            <div>Tiptap-powered with full formatting</div>
          </div>
          <div>
            <div className="text-2xl mb-2">🔗</div>
            <div className="font-medium text-white">Easy Sharing</div>
            <div>Share docs with anyone by email</div>
          </div>
          <div>
            <div className="text-2xl mb-2">📁</div>
            <div className="font-medium text-white">File Import</div>
            <div>Import .txt and .md files instantly</div>
          </div>
        </div>
      </div>
    </main>
  )
}
