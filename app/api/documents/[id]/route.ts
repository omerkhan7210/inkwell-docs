import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDocumentById, updateDocument, deleteDocument, canAccessDocument, initDB } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await initDB()
  const canAccess = await canAccessDocument(id, session.user.email)
  if (!canAccess) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const doc = await getDocumentById(id)
  return NextResponse.json(doc)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await initDB()
  const doc = await getDocumentById(id)
  if (!doc || doc.owner_email !== session.user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const updated = await updateDocument(id, body.title ?? doc.title, body.content_html ?? doc.content_html)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await initDB()
  const doc = await getDocumentById(id)
  if (!doc || doc.owner_email !== session.user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await deleteDocument(id)
  return NextResponse.json({ success: true })
}
