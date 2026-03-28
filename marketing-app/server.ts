/**
 * Elevate Marketing – Backend API Server
 *
 * Responsibilities:
 *  1. Proxies requests to the Anthropic Claude API (keeps API key server-side)
 *  2. Exposes a health-check endpoint
 *
 * Run: npm run server
 * The Vite dev server proxies /api → http://localhost:3001
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '2mb' }))

// ─────────────────────────────────────────────
// Anthropic client (lazy – only used when API key exists)
// ─────────────────────────────────────────────
let anthropic: Anthropic | null = null
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
} else {
  console.warn('[server] ANTHROPIC_API_KEY not set – Claude endpoint will return a placeholder response.')
}

// ─────────────────────────────────────────────
// GET /api/health
// ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    claudeAvailable: !!anthropic,
    timestamp: new Date().toISOString(),
  })
})

// ─────────────────────────────────────────────
// POST /api/claude
// Body: { systemPrompt: string, messages: { role: 'user' | 'assistant', content: string }[] }
// ─────────────────────────────────────────────
app.post('/api/claude', async (req, res) => {
  const { systemPrompt, messages } = req.body as {
    systemPrompt: string
    messages: { role: 'user' | 'assistant'; content: string }[]
  }

  if (!systemPrompt || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'systemPrompt and messages are required' })
  }

  // Placeholder when no API key is configured
  if (!anthropic) {
    return res.json({
      content: "I'm Claude, your AI marketing assistant. (This is a placeholder response — please add your ANTHROPIC_API_KEY to the .env file to enable real AI responses.)\n\nOnce configured, I'll have full access to your calendar, uploaded content, and account data to help you grow your digital marketing business.",
    })
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'Unexpected response type from Claude' })
    }

    return res.json({ content: content.text })
  } catch (err: unknown) {
    console.error('[/api/claude] Error:', err)
    const message = err instanceof Error ? err.message : 'Claude API error'
    return res.status(500).json({ error: message })
  }
})

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] Elevate Marketing API running on http://localhost:${PORT}`)
  console.log(`[server] Claude API: ${anthropic ? '✅ configured' : '⚠️  no API key (placeholder mode)'}`)
})
