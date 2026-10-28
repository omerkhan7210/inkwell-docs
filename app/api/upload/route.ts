import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createDocument, initDB } from '@/lib/db'

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^(?!<[h|u|o|l])(.*\S.*)$/gm, '<p>$1</p>')
    .replace(/\n\n/g, '')
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await initDB()

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['txt', 'md'].includes(ext || '')) {
    return NextResponse.json({ error: 'Only .txt and .md files are supported' }, { status: 400 })
  }

  const text = await file.text()
  const title = file.name.replace(/\.(txt|md)$/, '')
  const contentHtml = ext === 'md' ? markdownToHtml(text) : `<p>${text.split('\n').join('</p><p>')}</p>`

  const doc = await createDocument(title, session.user.email, contentHtml)
  return NextResponse.json(doc, { status: 201 })
}
