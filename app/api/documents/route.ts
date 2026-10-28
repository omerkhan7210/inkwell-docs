import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createDocument, getDocumentsByOwner, getSharedDocuments, initDB } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await initDB()
  const [owned, shared] = await Promise.all([
    getDocumentsByOwner(session.user.email),
    getSharedDocuments(session.user.email),
  ])
  return NextResponse.json({ owned, shared })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await initDB()
  const body = await req.json()
  const doc = await createDocument(
    body.title || 'Untitled',
    session.user.email,
    body.content_html || ''
  )
  return NextResponse.json(doc, { status: 201 })
}
