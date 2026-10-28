# Architecture Notes

## Overview

Inkwell is a server-first Next.js 14 app using the App Router. Authentication, database queries, and access control all happen on the server; the client receives rendered HTML and makes targeted API fetches.

## Key Design Decisions

### 1. Auto-save with debounce
The editor fires `onChange` on every keystroke. The document client debounces saves to 800ms — fast enough to feel real-time, slow enough not to flood the API. The save status indicator (clock → checkmark) gives clear feedback without being intrusive.

### 2. Server components + client islands
Pages are server components that verify auth and fetch initial data (zero client-side loading state for the first render). The interactive islands — editor, dashboard list, share dialog — are `'use client'` components that own their own state.

### 3. `initDB()` on every API route
Tables are created with `IF NOT EXISTS` on every cold start. This avoids a separate migration step and makes the app self-bootstrapping. The cost is negligible (a no-op DDL statement).

### 4. Sharing model
Sharing is additive: an owner adds email addresses to `inkwell_document_shares`. Shared users get read access only (the editor is non-editable and PATCH routes reject non-owners). There's no "can edit" permission tier — kept simple for the scope of this assessment.

### 5. File import
Uploaded `.txt`/`.md` files are parsed server-side (in the `/api/upload` route) into HTML before being stored. A minimal Markdown-to-HTML converter handles headings, bold, italic, code, and lists. For production, a library like `marked` or `remark` would be more robust.

## Data Flow

```
User types in TiptapEditor
  → onChange fires → debounce 800ms
  → PATCH /api/documents/[id]
  → Server verifies JWT session
  → Neon Postgres UPDATE
  → Response → setSaved(true)
```

```
User clicks Share
  → ShareDialog renders
  → GET /api/documents/[id]/share  (load existing shares)
  → User enters email → POST /api/documents/[id]/share
  → INSERT into inkwell_document_shares
  → Recipient can now see doc in "Shared with me" tab
```

## Limitations / Future Work

- No real-time collaboration (would need WebSockets / Supabase Realtime / Yjs)
- No version history
- No image upload within documents
- Sharing is by email only; public link sharing not implemented
- Markdown import is minimal — production would use `remark`
