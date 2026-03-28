import type { User, ScheduledPost, ContentItem, ChatMessage, ChatConversation } from '../types'

export interface ClaudeContext {
  user: User
  posts: ScheduledPost[]
  content: ContentItem[]
  conversations: ChatConversation[]
}

function buildSystemPrompt(ctx: ClaudeContext): string {
  const upcomingPosts = ctx.posts
    .filter((p) => p.status === 'scheduled' || p.status === 'draft')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 10)

  const publishedPosts = ctx.posts.filter((p) => p.status === 'published').length
  const connectedPlatforms = ctx.user.socialAccounts
    .filter((s) => s.connected)
    .map((s) => `${s.platform} (${s.handle}, ${s.followers?.toLocaleString() ?? '?'} followers)`)
    .join(', ')

  const contentSummary = ctx.content
    .slice(-5)
    .map((c) => `${c.name} (${c.type}, ${(c.size / 1024).toFixed(0)} KB)`)
    .join(', ')

  return `You are the AI marketing assistant for Elevate Marketing, embedded directly in the client portal for ${ctx.user.name} at ${ctx.user.company}.

## Your Role
You are a strategic digital marketing AI with full context of this client's account. You help them:
- Plan and optimize their social media content calendar
- Write compelling captions, hooks, and hashtags
- Analyze their posting patterns and suggest improvements
- Identify automation opportunities to grow their business
- Answer questions about their campaigns, content, and results
- Design marketing workflows and automation sequences

## Client Profile
- **Name**: ${ctx.user.name}
- **Company**: ${ctx.user.company}
- **Plan**: ${ctx.user.plan} tier
- **Connected Platforms**: ${connectedPlatforms || 'None yet'}
- **Member Since**: ${new Date(ctx.user.createdAt).toLocaleDateString()}

## Current Content Calendar
- **Total Posts**: ${ctx.posts.length} (${publishedPosts} published, ${upcomingPosts.length} upcoming)
- **Upcoming Posts**:
${upcomingPosts.map((p) => `  - "${p.title}" on ${new Date(p.scheduledAt).toLocaleDateString()} via [${p.platforms.join(', ')}] — Status: ${p.status}`).join('\n') || '  None scheduled'}

## Uploaded Content Library
- **Total Files**: ${ctx.content.length}
- **Recent Uploads**: ${contentSummary || 'None yet'}

## Automation & Growth
You should proactively suggest automation workflows such as:
- Auto-repurposing content across platforms
- Triggered response sequences for DMs/comments
- Competitor monitoring and reporting
- Content performance analytics and A/B testing
- Lead capture and nurture sequences from social traffic

When the user shares goals or asks for strategy, provide specific, actionable recommendations tailored to their industry, plan tier, and current posting frequency.

Always be encouraging, professional, and data-informed. Keep responses concise for mobile reading — use bullet points and bold text for scannability.`
}

export async function sendClaudeMessage(
  userMessage: string,
  history: ChatMessage[],
  ctx: ClaudeContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(ctx)

  const messages = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  messages.push({ role: 'user', content: userMessage })

  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? `Server error ${response.status}`)
  }

  const data = await response.json()
  return data.content as string
}
