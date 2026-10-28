# AI Workflow Notes

## How I Used AI in This Assessment

### 1. Lovable (initial scaffolding attempt)
I started by prompting Lovable (an AI app builder) with the full feature spec. Lovable generated a landing page ("Inkwell — Documents that write well together") and scaffolded a Vite + React + Drizzle ORM project. However, I hit the free credit limit before the functional editor was built. The generated landing page confirmed the product direction and naming.

**Lesson:** AI app builders are great for rapid prototyping but require credits/API access for full builds. Having a manual fallback is essential in a timed assessment.

### 2. Claude Code (primary development)
The bulk of the app was built with Claude Code (Anthropic's CLI for Claude). I used it to:

- Generate all Next.js 14 App Router boilerplate (layout, providers, page structure)
- Write the Tiptap editor component with toolbar, all extensions wired up correctly
- Implement the NextAuth credentials flow with bcrypt
- Write all Neon Postgres queries in `lib/db.ts`
- Build the dashboard, share dialog, and auto-save logic
- Generate the `.gitignore`, README, and deployment docs

**How I directed it:** I described the full data model and feature set upfront, then let it write complete files. I reviewed each file for correctness rather than editing inline.

### 3. Design decisions made with AI assistance
- Debounce timing (800ms) — I asked for a recommendation between 500ms–1500ms; 800ms was suggested as the sweet spot between responsiveness and API load
- Using Neon instead of Supabase — I noted I already had Neon credentials; Claude confirmed the schema would be identical and documented the substitution clearly
- `IF NOT EXISTS` auto-migration — suggested as simpler than a dedicated migration file for a solo assessment project

### 4. What I wrote manually
- Product name "Inkwell" and tagline "Documents that write well together"
- The decision to use email-only auth (no OAuth) for simplicity
- The UX flow decisions: tabs for "My documents / Shared with me", inline delete on hover, the sticky header with auto-save indicator

## Takeaways

AI pair programming is most effective when you:
1. Have a clear spec before opening the chat
2. Generate complete files, not fragments
3. Review output as you would a junior engineer's PR
4. Keep the AI in the loop on context it doesn't have (existing infra, credentials already set up)
