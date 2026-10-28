import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { canAccessDocument, getDocumentById, initDB } from '@/lib/db'
import DocumentClient from './DocumentClient'

type Props = { params: { id: string } }

export default async function DocumentPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')
  await initDB()
  const canAccess = await canAccessDocument(params.id, session.user.email)
  if (!canAccess) redirect('/dashboard')
  const doc = await getDocumentById(params.id)
  const isOwner = doc.owner_email === session.user.email
  return (
    <DocumentClient
      doc={doc}
      isOwner={isOwner}
      userEmail={session.user.email}
    />
  )
}
