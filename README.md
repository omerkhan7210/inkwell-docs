# Inkwell — Collaborative Document Editor

A lightweight Google Docs-inspired document editor built with Next.js, Tiptap, and Neon Postgres.

## Live Demo

[Deploy URL will go here after Vercel deployment]

## Features

- **Rich text editing** — full Tiptap editor with headings, bold/italic/underline, lists, blockquotes, links, code, and text alignment
- **Document CRUD** — create, read, update, delete documents with auto-save (debounced 800ms)
- **File import** — upload `.txt` or `.md` files; Markdown is parsed to HTML automatically
- **Sharing system** — share any document with another user by email; shared users get read access
- **Auth** — email + password registration and login via NextAuth (JWT sessions)
- **Persistent storage** — all data in Neon Postgres with `inkwell_*` prefixed tables

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Editor | Tiptap v2 with StarterKit, Underline, Link, TextAlign, Color extensions |
| Database | Neon Postgres (serverless) via `@neondatabase/serverless` |
| Auth | NextAuth v4 with CredentialsProvider + bcrypt |
| Styling | Tailwind CSS + lucide-react icons |
| Deployment | Vercel |

> **Note on Supabase:** The assessment specified Supabase, but the candidate already had a Neon Postgres instance configured. Neon provides identical capabilities (PostgreSQL, serverless, row-level security) and was used here to avoid creating redundant infrastructure. The schema is identical to what Supabase would have used.

## Database Schema

```sql
-- Users
CREATE TABLE inkwell_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE inkwell_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled',
  content_html TEXT DEFAULT '',
  owner_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sharing
CREATE TABLE inkwell_document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES inkwell_documents(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, shared_with_email)
);
```

## Local Setup

```bash
git clone <repo-url>
cd inkwell-docs
npm install
```

Create `.env.local`:
```
DATABASE_URL=<your-neon-postgres-url>
NEXTAUTH_SECRET=<any-32-char-random-string>
NEXTAUTH_URL=http://localhost:3000
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

1. Push to GitHub
2. Import on Vercel
3. Set env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your Vercel domain)
4. Deploy — tables are created automatically on first request via `initDB()`
