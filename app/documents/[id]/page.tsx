import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { canAccessDocument, getDocumentById, initDB } from '@/lib/db'
import DocumentClient from './DocumentClient'

type Props = { params: Promise<{ id: string }> }

export default async function DocumentPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')
  await initDB()
  const canAccess = await canAccessDocument(id, session.user.email)
  if (!canAccess) redirect('/dashboard')
  const rawDoc = await getDocumentById(id)
  const doc = rawDoc as { id: string; title: string; content_html: string; owner_email: string; updated_at: string }
  const isOwner = doc.owner_email === session.user.email
  return (
    <DocumentClient
      doc={doc}
      isOwner={isOwner}
      userEmail={session.user.email}
    />
  )
}
