# Accordance Lite — Product Requirements Document

This document is the single source of truth for building Accordance Lite. It is written for Claude Code to follow as a build spec. Every section maps to implementation. No ambiguity, no optional interpretation.

---

## 1. What This Is

Accordance Lite is a single-user, full-stack web application. It is an AI-powered tax research assistant for tax professionals. It helps users ask nuanced tax questions and receive well-cited answers referencing authoritative sources (IRC sections, Treasury Regulations, IRS publications, court cases, revenue rulings).

**Tech stack:**
- Frontend: React + TypeScript
- Backend: Node.js + Express + TypeScript
- AI: Perplexity API (sonar model with citations)
- Styling: Tailwind CSS
- Database: SQLite via better-sqlite3 (file-based, no setup needed)

**No auth. Single user. No environment setup beyond `npm install` and an API key.**

---

## 2. Project Structure

```
accordance-lite/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # All React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript interfaces/types
│   │   ├── utils/           # Helper functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   ├── services/        # Business logic (Perplexity, file handling)
│   │   ├── db/              # SQLite setup and queries
│   │   ├── types/           # Shared TypeScript types
│   │   └── index.ts         # Express app entry point
│   ├── tsconfig.json
│   └── package.json
├── README.md
├── DESIGN.md
└── .env.example
```

---

## 3. Data Model (SQLite)

Three tables. Keep it simple.

### threads
```sql
CREATE TABLE threads (
  id TEXT PRIMARY KEY,          -- uuid
  title TEXT NOT NULL,          -- auto-generated from first user message (first 60 chars)
  created_at TEXT NOT NULL,     -- ISO 8601
  updated_at TEXT NOT NULL      -- ISO 8601, updated on every new message
);
```

### messages
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,          -- uuid
  thread_id TEXT NOT NULL,      -- FK to threads.id
  role TEXT NOT NULL,           -- 'user' | 'assistant'
  content TEXT NOT NULL,        -- message text (markdown for assistant)
  citations TEXT,               -- JSON string array of citation objects (assistant only)
  created_at TEXT NOT NULL,     -- ISO 8601
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);
```

### attachments
```sql
CREATE TABLE attachments (
  id TEXT PRIMARY KEY,          -- uuid
  message_id TEXT NOT NULL,     -- FK to messages.id
  filename TEXT NOT NULL,       -- original file name
  mime_type TEXT NOT NULL,      -- e.g. application/pdf, text/plain
  size INTEGER NOT NULL,        -- bytes
  storage_path TEXT NOT NULL,   -- path to stored file on disk
  created_at TEXT NOT NULL,     -- ISO 8601
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);
```

### Citation JSON shape (stored in messages.citations)
```json
[
  {
    "index": 1,
    "url": "https://www.law.cornell.edu/uscode/text/26/1031",
    "title": "26 U.S. Code § 1031 - Exchange of real property",
    "snippet": "No gain or loss shall be recognized..."
  }
]
```

---

## 4. API Endpoints

### Threads

**GET /api/threads**
- Returns all threads, sorted by `updated_at` descending
- Response: `{ threads: Thread[] }`

**POST /api/threads**
- Creates a new thread
- Body: `{ title: string }`
- Response: `{ thread: Thread }`

**GET /api/threads/:id**
- Returns a single thread with all its messages
- Response: `{ thread: Thread, messages: Message[] }`

**DELETE /api/threads/:id**
- Deletes a thread and all associated messages/attachments
- Response: `{ success: true }`

### Messages

**POST /api/threads/:threadId/messages**
- Sends a user message, triggers Perplexity API, returns the assistant response
- Body: `multipart/form-data` with fields:
  - `content` (string, required): the user's message
  - `files` (File[], optional): attached files
- Processing steps:
  1. Save user message to DB
  2. If this is the first message in the thread, update the thread title to the first 60 characters of the message
  3. Save any uploaded files to disk and create attachment records
  4. Build Perplexity API request with full conversation history from this thread
  5. Call Perplexity API
  6. Parse response and extract citations
  7. Save assistant message with citations to DB
  8. Return both the user message and assistant message
- Response: `{ userMessage: Message, assistantMessage: Message }`
- This endpoint should support streaming. Use Server-Sent Events (SSE). The frontend will read the stream and render tokens as they arrive. Final message (with citations) is saved to DB after stream completes.

### File Upload Details
- Store files in `server/uploads/` directory
- Max file size: 10MB
- Accepted types: `.pdf` only
- Files are read and their text content is included in the Perplexity prompt as context

---

## 5. Perplexity API Integration

### Model
Use `sonar-pro` (or `sonar` as fallback). These models return citations natively.

### System Prompt
```
You are Accordance, an expert AI tax research assistant built for tax professionals including CPAs, tax attorneys, and enrolled agents.

Your behavior:
- Answer tax questions with precision and depth appropriate for a professional audience
- Always cite authoritative sources: Internal Revenue Code (IRC) sections, Treasury Regulations, Revenue Rulings, Revenue Procedures, IRS Publications, IRS Notices, court cases (Tax Court, Circuit Courts, Supreme Court), and PLRs
- When citing, be specific: use exact section numbers (e.g., IRC §1031(a)(1)), regulation numbers (e.g., Treas. Reg. §1.1031(a)-1), and case names with citations
- Structure responses clearly: start with a direct answer, then provide analysis with supporting authorities
- When a question involves a grey area, present the competing positions and the weight of authority for each
- Flag when an area is unsettled or when the IRS position differs from court holdings
- If the user provides documents or context, reference them specifically in your analysis
- Use professional but accessible language. No unnecessary jargon, but do not oversimplify
- If you do not have enough information to give a definitive answer, say so and explain what additional facts would be needed
```

### Request Format
```typescript
{
  model: "sonar-pro",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    // full conversation history from the thread
    { role: "user", content: "..." },
    { role: "assistant", content: "..." },
    // latest user message, including any file content as context
    { role: "user", content: "..." }
  ],
  stream: true
}
```

### When files are attached
Prepend file content to the user message:
```
[Attached Document: filename.pdf]
---
{extracted text content}
---

{user's actual question}
```

### Citation Extraction
Perplexity returns citations in the response object. Parse the `citations` array from the API response. Each citation has a URL. Map these to the inline reference markers `[1]`, `[2]`, etc. that appear in the response text.

---

## 6. Frontend — Layout and Components

### Overall Layout
Two-column layout. Fixed left sidebar (280px width). Main content area fills remaining space.

**Color palette and visual style (match Accordance's aesthetic):**
- Background: white (`#FFFFFF`) for main area, very light gray (`#F9FAFB`) for sidebar
- Text: dark gray (`#111827`) for primary, medium gray (`#6B7280`) for secondary
- Borders: light gray (`#E5E7EB`)
- Accent/Primary: `#135bec` for interactive elements (buttons, citation badges, active states).
- Font: Inter or system font stack. Clean, professional.
- Generous whitespace. Do not crowd elements.
- Border radius: small (6-8px) on cards and inputs. Nothing too rounded.
- Shadows: minimal. Use borders more than shadows.

### Component Tree
```
<App>
  <Sidebar>
    <SidebarHeader />          // "Accordance Lite" branding with icon + subtitle "Tax Research Assistant"
    <NewThreadButton />        // "+ New Thread" outlined button, full sidebar width
    <ThreadList>               // scrollable list, preceded by "RECENT" label
      <ThreadItem />           // title (truncated) + relative timestamp. Delete icon on hover.
    </ThreadList>
    <UserFooter />             // avatar + "David Yue" + "dy@accordance.ai" + settings gear icon
  </Sidebar>
  <MainContent>
    <WelcomeScreen />          // shown when no thread is selected
    <ChatView>                 // shown when a thread is active
      <ChatHeader />           // thread title + "Last updated [timestamp]"
      <MessageList>            // scrollable message area
        <UserMessage />        // right-aligned, "You" label above, light background bubble
        <AttachmentChip />     // shown below user message if files attached (file icon + name + size)
        <AssistantMessage>     // left-aligned, "Accordance AI" label with icon above
          <MessageContent />   // markdown-rendered response with inline citation badges
          <SourcesList />      // "SOURCES" heading + source cards below the message
        </AssistantMessage>
        <StreamingIndicator /> // shown while assistant is generating
      </MessageList>
      <ChatInput>              // fixed at bottom of main area
        <AttachmentPreview />  // shows attached files as chips before sending
        <TextArea />           // auto-growing textarea with placeholder
        <AttachFileButton />   // paperclip icon, left side
        <SendButton />         // blue circular arrow button, right side
      </ChatInput>
      <Disclaimer />           // centered muted text below input: "Accordance Lite can make mistakes. Verify important tax information."
    </ChatView>
  </MainContent>
</App>
```

---

## 7. Frontend — Screen States and Behavior

### 7.1 Welcome Screen (no thread selected)
Displayed when the app loads with no active thread.

Content:
- Accordance AI icon centered above the greeting
- Greeting: "Good afternoon, David." in large bold text (time-based: morning/afternoon/evening)
- Subtitle below: "How can I be of service today?" in muted gray
- Below the greeting: an input card with subtle border, containing:
  - A textarea with placeholder: "How can Accordance help you today? e.g. 'Summarize the latest changes to Section 174 regarding R&E expenditures'"
  - Bottom row inside the card: paperclip icon + "Attach File" on the left, "Press Enter to send" hint in muted text center-right, blue "Ask Accordance →" button on the right
- Below the input card: disclaimer text centered in muted gray: "Accordance Lite may produce inaccurate information about people, places, or facts. Always verify important information."
- When the user submits a message from the welcome screen:
  1. Create a new thread via POST /api/threads
  2. Send the message via POST /api/threads/:id/messages
  3. Switch to ChatView for that thread
  4. Thread appears in sidebar

### 7.2 Chat View (active thread)
- Header at top shows thread title in bold + "Last updated [relative or absolute timestamp]" in muted text below it
- Messages scroll from top to bottom, newest at bottom
- User messages: right-aligned, light blue-gray background bubble. "You" label in muted text above the message, right-aligned.
- If the user message has attachments, show a file chip below the message bubble: file type icon (PDF icon for PDFs), filename, and file size (e.g. "client_property_schedule.pdf  2.4 MB"). Chip has a subtle border and rounded corners.
- Assistant messages: left-aligned, no background. "Accordance AI" label with the Accordance icon to its left, shown above the message.
- Assistant messages render markdown (bold, italic, lists, code blocks, headings)
- Inline citations in assistant messages appear as small superscript-style blue badges `[1]`, `[2]`, etc.
- Clicking a citation badge scrolls to or highlights the corresponding source in the Sources section below the message
- Below each assistant message with citations, render a "SOURCES" section (uppercase label, muted text)
- Each source card is a horizontal row with subtle border, containing: number badge on the left ([1], [2], [3]), source title in bold, domain in muted gray text to the right of the title, and a one-line snippet below the title. Title is clickable and opens the source URL.
- Chat input fixed at bottom: paperclip icon on the left, textarea in the center with placeholder "Ask a follow-up question or request a summary...", blue circular send button (arrow icon) on the right
- Below the input: disclaimer text centered in muted gray: "Accordance Lite can make mistakes. Verify important tax information."

### 7.3 Streaming Behavior
- When the user sends a message, immediately show the user message in the chat
- Show a typing/loading indicator for the assistant (subtle animated dots or a pulsing line)
- As tokens stream in, render them in real-time in the assistant message bubble
- After streaming completes, render the final citations below the message
- Disable the input while streaming. Re-enable on completion.

### 7.4 File Attachment Flow
- User clicks the attachment button (paperclip icon) or drags a file onto the input area
- Selected files appear as small chips/pills above the textarea showing filename and a remove (X) button
- Files are sent with the message as multipart form data
- In the message history, user messages with attachments show a small file indicator (icon + filename) above the message text

### 7.5 Loading States
- **App load:** Brief skeleton of sidebar and main area
- **Thread list loading:** Subtle shimmer/skeleton in sidebar
- **Sending message:** Input is disabled, send button shows a spinner
- **AI responding:** Animated typing indicator, then streaming text
- **Thread switching:** Brief fade or instant swap of message content

### 7.6 Error States
- **API failure:** Toast notification at the top-right. "Something went wrong. Please try again." with a retry option.
- **File upload failure:** Inline error below the attachment chip. "Failed to upload [filename]."
- **Empty thread list:** Subtle text in sidebar: "No conversations yet."
- **Network disconnection:** Banner at the top of the main area: "Connection lost. Reconnecting..."

### 7.7 Empty States
- **No thread selected:** Welcome screen (see 7.1)
- **No threads exist:** Sidebar shows "No conversations yet." Welcome screen is active.

---

## 8. Frontend — Interaction Details

### Sidebar
- Background: very light gray (#F9FAFB)
- Top: App icon + "Accordance Lite" in semi-bold + "Tax Research Assistant" subtitle in muted text below it
- Below header: "+ New Thread" button, outlined style (not filled), full sidebar width with a plus icon
- "RECENT" label in small uppercase muted text above the thread list
- Thread list sorted by `updated_at` descending (most recent at top)
- Each thread item shows: title (truncated to 1 line with ellipsis) and relative timestamp below it ("2 hours ago", "Yesterday", "2 days ago", "Last week", etc.)
- Clicking a thread loads its messages in the main area
- Active thread is highlighted with a subtle background color and a left border accent
- Threads show a delete icon on hover (small trash or X icon)
- "+ New Thread" button clears the chat view and shows the welcome screen. The thread is actually created when the first message is sent, not on button click.
- Bottom of sidebar: user avatar (circle with initials or image) + "David Yue" name + "dy@accordance.ai" email + settings gear icon. Settings icon is a non-functional placeholder.

### Chat Input
- Fixed at the bottom of the main content area, styled as a card with subtle border and rounded corners
- Welcome screen variant: paperclip icon + "Attach File" label on the left, "Press Enter to send" hint in muted text, blue filled "Ask Accordance →" button on the right
- Chat view variant: paperclip icon on the left, textarea in the center, blue circular send button (up arrow icon) on the right
- Auto-growing textarea. Starts at 1 row, grows up to 6 rows, then scrolls internally.
- Submit on Enter (without Shift). Shift+Enter for new line.
- Submit button is disabled when input is empty and no files are attached
- Welcome screen placeholder: "How can Accordance help you today? e.g. 'Summarize the latest changes to Section 174 regarding R&E expenditures'"
- Chat view placeholder: "Ask a follow-up question or request a summary..."
- Attach file button (paperclip icon) triggers file picker

### Citations
- In the assistant response text, citations appear as `[1]`, `[2]`, etc. rendered as small superscript-style blue badges
- Badge style: small, slightly rounded, blue text, clickable
- Below each assistant message with citations, render a "SOURCES" section with uppercase label in muted text
- Each source is a horizontal row with a subtle border, containing:
  - Number badge on the left matching the inline citation ([1], [2], [3])
  - Source title in bold (clickable, opens URL in new tab)
  - Domain name in muted gray text to the right of the title (e.g. "law.cornell.edu")
  - One-line snippet below the title in regular weight text
- Clicking an inline badge smooth-scrolls to the corresponding source row and briefly highlights it

### Markdown Rendering
- Use a markdown renderer (react-markdown or similar) for assistant messages
- Support: headings, bold, italic, lists (ordered and unordered), code blocks, inline code, blockquotes, tables
- Style the markdown output to match the overall design. Headings should not be too large. Lists should have proper spacing. Code blocks should have a subtle background.

---

## 9. Non-Functional Requirements

- **Performance:** Messages should appear instantly on send. Streaming should start within 1-2 seconds. Thread switching should feel instant (load from local cache or fetch quickly).
- **Responsive:** The app should work on desktop (primary) and tablet. On narrow screens (<768px), the sidebar collapses to a hamburger menu.
- **Accessibility:** Proper focus management on the input. Keyboard navigation for thread list. Semantic HTML. Sufficient color contrast.
- **File storage:** Uploaded files stored in `server/uploads/`. This directory should be gitignored. Create it on server start if it doesn't exist.

---

## 10. Environment and Setup

### .env.example
```
PERPLEXITY_API_KEY=your_key_here
PORT=3001
```

### Running the app
The README should document:
```bash
# Clone the repo
git clone <repo-url>
cd accordance-lite

# Install dependencies
npm install           # if using workspaces
# OR
cd server && npm install && cd ../client && npm install

# Set up environment
cp .env.example .env
# Add your Perplexity API key to .env

# Start the app
npm run dev           # should start both client and server concurrently
```

The app should be runnable in under 2 minutes. No Docker, no external databases, no complex setup.

---

## 11. Scope Summary

### In Scope
- Left sidebar with thread list (auto-created, delete-able)
- Welcome screen with time-based greeting and input
- Chat interface with streaming AI responses
- Inline citations with clickable badges
- Sources section below assistant messages
- File attachment (upload, preview, send as context)
- Loading states, error states, empty states
- Responsive layout (desktop + tablet)
- Markdown rendering in assistant messages
- SQLite persistence for threads, messages, attachments

### Out of Scope
- Authentication or multi-user
- Projects, Library, Prompt Library features
- "Improve Prompt" button
- Thread rename
- File preview/parsing UI beyond filename display
- Real-time collaboration
- Dark mode

---

## 12. Build Order

Follow this order. Complete each step fully before moving to the next.

1. **Project scaffolding:** Set up the monorepo structure, install dependencies, configure TypeScript, Tailwind, and dev scripts (concurrent client + server). ✅
2. **Database:** Set up SQLite with better-sqlite3. Create tables. Write query functions for threads and messages. ✅
3. **API routes:** Implement all Express endpoints (threads CRUD, message creation). Test with curl or Postman. No Perplexity integration yet — return mock assistant responses. ✅
4. **Frontend layout:** Build the two-column layout, sidebar, and main content shell. No functionality yet, just the visual structure.
5. **Thread management:** Connect sidebar to API. List threads, create new threads, switch between threads, delete threads.
6. **Chat interface:** Build the message list, chat input, send flow. Connect to mock SSE streaming endpoint. Render messages with markdown.
7. **Citations UI:** Render inline citation badges. Build the sources section. Wire up click-to-scroll.
8. **Perplexity integration:** Swap mock responses for real Perplexity API. Wire up streaming via SSE. Parse citations from the response.
9. **File attachment:** Build the file picker, attachment preview chips, multipart upload, and file indicator in sent messages.
10. **Polish:** Loading states, error states, empty states, transitions, responsive behavior, typography fine-tuning, spacing adjustments.
