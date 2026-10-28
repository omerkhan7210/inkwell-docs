import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDocumentById, getDocumentShares, shareDocument, unshareDocument, initDB } from '@/lib/db'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await initDB()
  const doc = await getDocumentById(params.id)
  if (!doc || doc.owner_email !== session.user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const shares = await getDocumentShares(params.id)
  return NextResponse.json(shares)
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await initDB()
  const doc = await getDocumentById(params.id)
  if (!doc || doc.owner_email !== session.user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  if (email === session.user.email) {
    return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 })
  }
  const share = await shareDocument(params.id, email)
  return NextResponse.json(share, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await initDB()
  const doc = await getDocumentById(params.id)
  if (!doc || doc.owner_email !== session.user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { email } = await req.json()
  await unshareDocument(params.id, email)
  return NextResponse.json({ success: true })
}
