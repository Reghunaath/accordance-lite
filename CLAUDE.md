# CLAUDE.md — Accordance Lite

## 1. Tech Stack
- Frontend: React with TypeScript, Vite for bundling, TailwindCSS for styling.
- Backend: Node.js / Express with TypeScript.
- Database: SQLite via `better-sqlite3`. Single file, no external DB server.
- AI: Perplexity API (`sonar-pro` model) for responses and citations.
- File Parsing: `pdf-parse` for PDF text extraction.
- Markdown: `react-markdown` for rendering assistant responses.

## 2. Project Structure
- Monorepo. Single repo with `client/` and `server/` directories.
- No separate packages or workspaces unless needed for concurrency.
- `npm run dev` in root should start both client and server concurrently.
- Uploaded files stored in `server/uploads/` (gitignored, auto-created on server start).
- SQLite DB file stored in `server/` (gitignored).

## 3. PRD Is the Source of Truth
- The file `PRD.md` in the project root contains all product requirements.
- Follow the PRD exactly. Do not add features, screens, or UI elements not described in the PRD.
- **⚠️ IMPORTANT: If you need to deviate from the PRD for any reason (technical limitation, ambiguity, better approach), STOP and inform me in highlighted text before proceeding. Do not silently deviate.**
- **⚠️ IMPORTANT: If any requirement in the PRD is unclear or missing detail, ASK me a clarifying question before implementing. Do not guess.**

## 4. Code Quality
- All code must be TypeScript. No `.js` files.
- No `any` types unless absolutely necessary and documented with a comment explaining why.
- Use interfaces/types for all API request/response shapes, DB models, and component props.
- Keep components small and focused. One component per file.
- Use custom hooks for shared logic (API calls, streaming, etc.).
- Run `npm run lint` before considering any task done.
- Use concise variable names in dense logic but descriptive names for props, state, and functions.

## 5. UI/UX Rules
- Match the mockup screenshots exactly. The visual reference is the final authority on layout, spacing, and styling.
- Color palette: white (#FFFFFF) main background, light gray (#F9FAFB) sidebar, dark gray (#111827) primary text, medium gray (#6B7280) secondary text, light borders (#E5E7EB), blue (#135BEC) for primary buttons and citation badges.
- Font: Inter or system sans-serif stack.
- Generous whitespace. Do not crowd elements.
- Border radius: 6-8px on cards, inputs, badges.
- Minimal shadows. Prefer borders.
- Every screen must handle: loading state, error state, empty state, and populated state.
- Streaming responses must show a typing/loading indicator before tokens arrive, then render tokens in real-time.
- All interactive elements need hover and focus states.

## 6. API and Data
- All API routes prefixed with `/api/`.
- Use UUIDs for all primary keys.
- Store citations as JSON string in the messages table.
- File uploads via `multipart/form-data`. Max 10MB. PDF only.
- Streaming responses delivered via Server-Sent Events (SSE).
- Perplexity citations arrive in the final response object, not during streaming. Render the SOURCES section only after the stream completes.

## 7. Build Order
Follow this exact order. Complete each step fully before moving to the next.
**⚠️ IMPORTANT: After completing each step, restart the client and server, then STOP and inform me what was done. Wait for my approval before starting the next step. Do not proceed to the next step without my explicit go-ahead.**
**⚠️ IMPORTANT: After each step is coded and approved, commit all changes and push to GitHub.**

1. Project scaffolding (monorepo, deps, TS config, Tailwind, dev scripts)
2. Database setup (SQLite tables, query functions)
3. API routes (threads CRUD, message creation with mock responses)
4. Perplexity integration (streaming via SSE, citation parsing)
5. Frontend layout (sidebar, main content shell, no functionality)
6. Thread management (list, create, switch, delete)
7. Chat interface (message list, input, send, streaming render, markdown)
8. Citations UI (inline badges, SOURCES section, click-to-scroll)
9. File attachment (picker, preview chips, upload, PDF text extraction)
10. Polish (loading/error/empty states, transitions, responsive, typography)

## 8. Do NOT Build
- Authentication or login screens
- Projects, Library, or Prompt Library features
- "Improve Prompt" button
- Thread rename functionality
- Dark mode
- Settings page (gear icon in sidebar is a non-functional placeholder)
- Voice input or microphone features
- Share/export functionality

## 9. File Management
- Keep `README.md` updated with setup instructions, architecture overview, and tech choices.
- Include a `DESIGN.md` with design philosophy and key decisions.
- `.env.example` must list all required env vars with placeholder values.
- Gitignore: `node_modules/`, `server/uploads/`, SQLite DB file, `.env`.
