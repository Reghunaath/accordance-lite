# Accordance Lite

AI-powered tax research assistant for tax professionals. Ask nuanced tax questions and receive well-cited answers referencing authoritative sources (IRC sections, Treasury Regulations, IRS publications, court cases, revenue rulings).

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite via better-sqlite3 (file-based, no setup needed)
- **AI:** Perplexity API (sonar-pro model with native citations)
- **File Parsing:** pdf-parse for PDF text extraction

## Architecture

```
accordance-lite/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
├── server/          # Express backend
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── db/
│       └── types/
├── package.json     # Root — runs both via concurrently
└── .env.example
```

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd accordance-lite

# Install all dependencies
npm install
npm run install:all

# Set up environment
# Copy the example env file and fill in your own values
cp .env.example .env
# Then open .env and replace "your_key_here" with your actual Perplexity API key
# You can get one at https://docs.perplexity.ai/

# Start the app (client + server concurrently)
npm run dev
```

The client runs on `http://localhost:5173` and proxies API requests to the server on port `3001`.

## Environment Variables

The `.env.example` file lists all required environment variables with placeholder values. Copy it to `.env` and fill in your own values — the `.env` file is gitignored so your keys are never committed.

| Variable | Description | Required |
|----------|-------------|----------|
| `PERPLEXITY_API_KEY` | Your Perplexity API key for AI-powered responses | Yes |
| `PORT` | Server port (defaults to `3001`) | No |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client and server in dev mode |
| `npm run install:all` | Install dependencies for both client and server |
| `npm run lint` | Run ESLint across client and server |
| `npm run build` | Build both client and server for production |
