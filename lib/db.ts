import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS inkwell_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS inkwell_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL DEFAULT 'Untitled',
      content_html TEXT DEFAULT '',
      owner_email TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS inkwell_document_shares (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID NOT NULL REFERENCES inkwell_documents(id) ON DELETE CASCADE,
      shared_with_email TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(document_id, shared_with_email)
    )
  `
}

export async function getUserByEmail(email: string) {
  const rows = await sql`SELECT * FROM inkwell_users WHERE email = ${email}`
  return rows[0] || null
}

export async function createUser(email: string, name: string, passwordHash: string) {
  const rows = await sql`
    INSERT INTO inkwell_users (email, name, password_hash)
    VALUES (${email}, ${name}, ${passwordHash})
    RETURNING *
  `
  return rows[0]
}

export async function getDocumentsByOwner(email: string) {
  return sql`
    SELECT d.*,
      (SELECT COUNT(*) FROM inkwell_document_shares WHERE document_id = d.id) as share_count
    FROM inkwell_documents d
    WHERE d.owner_email = ${email}
    ORDER BY d.updated_at DESC
  `
}

export async function getSharedDocuments(email: string) {
  return sql`
    SELECT d.*, s.created_at as shared_at
    FROM inkwell_documents d
    JOIN inkwell_document_shares s ON s.document_id = d.id
    WHERE s.shared_with_email = ${email}
    ORDER BY s.created_at DESC
  `
}

export async function getDocumentById(id: string) {
  const rows = await sql`SELECT * FROM inkwell_documents WHERE id = ${id}`
  return rows[0] || null
}

export async function createDocument(title: string, ownerEmail: string, contentHtml = '') {
  const rows = await sql`
    INSERT INTO inkwell_documents (title, owner_email, content_html)
    VALUES (${title}, ${ownerEmail}, ${contentHtml})
    RETURNING *
  `
  return rows[0]
}

export async function updateDocument(id: string, title: string, contentHtml: string) {
  const rows = await sql`
    UPDATE inkwell_documents
    SET title = ${title}, content_html = ${contentHtml}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0]
}

export async function deleteDocument(id: string) {
  await sql`DELETE FROM inkwell_documents WHERE id = ${id}`
}

export async function shareDocument(documentId: string, sharedWithEmail: string) {
  const rows = await sql`
    INSERT INTO inkwell_document_shares (document_id, shared_with_email)
    VALUES (${documentId}, ${sharedWithEmail})
    ON CONFLICT (document_id, shared_with_email) DO NOTHING
    RETURNING *
  `
  return rows[0]
}

export async function unshareDocument(documentId: string, sharedWithEmail: string) {
  await sql`
    DELETE FROM inkwell_document_shares
    WHERE document_id = ${documentId} AND shared_with_email = ${sharedWithEmail}
  `
}

export async function getDocumentShares(documentId: string) {
  return sql`
    SELECT shared_with_email, created_at
    FROM inkwell_document_shares
    WHERE document_id = ${documentId}
    ORDER BY created_at DESC
  `
}

export async function canAccessDocument(documentId: string, userEmail: string) {
  const doc = await getDocumentById(documentId)
  if (!doc) return false
  if (doc.owner_email === userEmail) return true
  const shares = await sql`
    SELECT 1 FROM inkwell_document_shares
    WHERE document_id = ${documentId} AND shared_with_email = ${userEmail}
  `
  return shares.length > 0
}
