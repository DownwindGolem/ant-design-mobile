# Elevate Marketing – Client Portal

A full mobile web app for digital marketing clients built with React, TypeScript, and [Ant Design Mobile](https://mobile.ant.design/).

## Features

| Screen | Description |
|--------|-------------|
| **Login** | Secure sign-in with demo accounts included |
| **Social Calendar** | Month-view calendar with platform-coloured post dots, tap any day to see/manage posts, swipe to delete, add new scheduled posts |
| **Content Library** | Upload images, videos, and documents; filter by type; tag and describe each asset |
| **Account** | Profile details, connected social accounts with follower counts, plan badge, settings |
| **Chat – Claude AI** | Direct chat with Claude (claude-opus-4-6) with full context of the client's posts, content, and account |
| **Chat – Sales Agent** | Message your dedicated account manager (simulated in MVP) |

## Claude's Full Access

When a client chats with Claude, the AI receives a rich system prompt containing:
- Full client profile (company, plan, social accounts + follower counts)
- All scheduled and published posts with dates and platforms
- Uploaded content library summary
- Business context and plan tier

Claude can then suggest automations, write captions, build content calendars, analyse posting patterns, and outline growth workflows.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Ant Design Mobile 5 (mobile-first components)
- **State**: Zustand (persisted to localStorage)
- **Routing**: React Router v6
- **Backend**: Express (Claude API proxy only)
- **AI**: Anthropic claude-opus-4-6 via `@anthropic-ai/sdk`
- **Dates**: Day.js

## Getting Started

### 1. Install dependencies

```bash
cd marketing-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and add your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run (dev mode)

```bash
# Runs Vite frontend (port 5173) + Express backend (port 3001) concurrently
npm start
```

Or separately:
```bash
npm run dev     # Frontend only
npm run server  # Backend only
```

### 4. Demo login credentials

| Email | Password | Plan |
|-------|----------|------|
| sarah@techventures.com | demo1234 | Growth |
| marcus@localbloom.co | bloom2024 | Starter |

## Production Deployment

1. Build the frontend: `npm run build` → outputs to `dist/`
2. Deploy `dist/` to any static host (Vercel, Netlify, S3)
3. Deploy `server.ts` to a Node.js host (Railway, Render, Fly.io)
4. Update Vite proxy config (or set `VITE_API_URL`) to point to your production server
5. Set `ANTHROPIC_API_KEY` as a server-side environment variable (never in the frontend bundle)

## Architecture Diagram

```
┌──────────────────────────────────┐
│         Mobile Browser           │
│  ┌────────────────────────────┐  │
│  │  React SPA (antd-mobile)   │  │
│  │  ┌─────────────────────┐   │  │
│  │  │  Zustand Store      │   │  │
│  │  │  (localStorage)     │   │  │
│  │  └─────────────────────┘   │  │
│  │                             │  │
│  │  /calendar  /upload         │  │
│  │  /chat      /account        │  │
│  └──────────┬──────────────────┘  │
└─────────────┼────────────────────┘
              │ POST /api/claude
              ▼
┌─────────────────────────────────┐
│   Express Server (server.ts)    │
│   - Keeps API key server-side   │
│   - Builds context-aware calls  │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│   Anthropic API (Claude Opus)   │
│   claude-opus-4-6               │
└─────────────────────────────────┘
```

## Extending for Automation

Claude has access to all client data via the system prompt. Future automation hooks:

- **Webhook triggers**: POST to `/api/automation` when Claude suggests a workflow → trigger n8n/Zapier/Make
- **Scheduled digests**: Cron job calls Claude with weekly performance data → emails client summary
- **Auto-caption generation**: On content upload, call Claude to draft platform-specific captions
- **Competitor alerts**: Scheduled scraping + Claude analysis → push notification to client
- **DM response drafts**: Connect social API → Claude drafts responses to incoming DMs
