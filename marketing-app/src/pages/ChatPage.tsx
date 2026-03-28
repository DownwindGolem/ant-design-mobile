import { useState, useRef, useEffect, useCallback } from 'react'
import { NavBar, Tabs, TextArea, Toast, SpinLoading } from 'antd-mobile'
import { SendOutline } from 'antd-mobile-icons'
import dayjs from 'dayjs'
import { useStore } from '../store/useStore'
import { sendClaudeMessage } from '../api/claude'
import type { ChatConversation } from '../types'
import './ChatPage.css'

const AGENT_QUICK_REPLIES = [
  'Tell me about your Growth plan',
  'How do I add more social accounts?',
  'I need help with my content strategy',
  'What automation services do you offer?',
  "I'd like to schedule a strategy call",
]

const CLAUDE_QUICK_PROMPTS = [
  'Review my upcoming posts',
  'Write captions for Instagram',
  'Suggest a content strategy',
  'Analyze my posting frequency',
  'Create a 30-day content plan',
]

function TypingIndicator() {
  return (
    <div className="message-row message-row--assistant">
      <div className="message-bubble message-bubble--assistant typing-indicator">
        <span /><span /><span />
      </div>
    </div>
  )
}

function MessageBubble({
  role,
  content,
  timestamp,
}: {
  role: 'user' | 'assistant' | 'agent'
  content: string
  timestamp: string
}) {
  const isUser = role === 'user'
  return (
    <div className={`message-row message-row--${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className={`message-avatar message-avatar--${role}`}>
          {role === 'assistant' ? '🤖' : '👤'}
        </div>
      )}
      <div className="message-content-col">
        <div className={`message-bubble message-bubble--${isUser ? 'user' : 'assistant'}`}>
          {content.split('\n').map((line, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : '6px 0 0' }}>{line || <br />}</p>
          ))}
        </div>
        <span className={`message-time message-time--${isUser ? 'user' : 'assistant'}`}>
          {dayjs(timestamp).format('h:mm A')}
        </span>
      </div>
    </div>
  )
}

function ChatThread({
  conversation,
  isLoading,
  onSend,
  quickPrompts,
  placeholder,
}: {
  conversation: ChatConversation | null
  isLoading: boolean
  onSend: (text: string) => void
  quickPrompts: string[]
  placeholder: string
}) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const messages = conversation?.messages ?? []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    onSend(text)
  }

  return (
    <div className="chat-thread">
      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              {conversation?.type === 'claude' ? '🤖' : '👤'}
            </div>
            <p className="chat-empty-text">
              {conversation?.type === 'claude'
                ? 'Hi! I\'m your AI marketing assistant. I have full access to your account, posts, and content. How can I help you today?'
                : 'Hi there! Your account manager is here to help. Send a message and we\'ll get back to you shortly.'}
            </p>
            <div className="quick-prompts">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="quick-prompt-btn"
                  onClick={() => onSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <TextArea
          className="chat-input"
          placeholder={placeholder}
          value={input}
          onChange={setInput}
          rows={1}
          autoSize={{ minRows: 1, maxRows: 4 }}
          onEnterPress={(e) => {
            if (!e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <button
          className={`chat-send-btn${input.trim() && !isLoading ? ' active' : ''}`}
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? <SpinLoading color="white" style={{ '--size': '18px' }} /> : <SendOutline />}
        </button>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const user = useStore((s) => s.user)
  const posts = useStore((s) => s.posts)
  const content = useStore((s) => s.content)
  const conversations = useStore((s) => s.conversations)
  const getOrCreateConversation = useStore((s) => s.getOrCreateConversation)
  const addMessage = useStore((s) => s.addMessage)
  const isClaudeLoading = useStore((s) => s.isClaudeLoading)
  const isAgentLoading = useStore((s) => s.isAgentLoading)
  const setClaudeLoading = useStore((s) => s.setClaudeLoading)
  const setAgentLoading = useStore((s) => s.setAgentLoading)

  const [activeTab, setActiveTab] = useState('claude')

  const claudeConversation = conversations.find(
    (c) => c.type === 'claude' && c.userId === user?.id
  ) ?? null
  const agentConversation = conversations.find(
    (c) => c.type === 'agent' && c.userId === user?.id
  ) ?? null

  const handleClaudeSend = useCallback(async (text: string) => {
    if (!user) return
    const conv = getOrCreateConversation('claude')

    addMessage(conv.id, { role: 'user', content: text })
    setClaudeLoading(true)

    try {
      const replyText = await sendClaudeMessage(
        text,
        conv.messages,
        { user, posts, content, conversations }
      )
      addMessage(conv.id, { role: 'assistant', content: replyText })
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      Toast.show({
        content: `Claude is unavailable: ${errMsg}`,
        icon: 'fail',
        duration: 4000,
      })
      addMessage(conv.id, {
        role: 'assistant',
        content: "I'm temporarily unavailable. Please ensure the server is running and your API key is configured in `.env`.",
      })
    } finally {
      setClaudeLoading(false)
    }
  }, [user, posts, content, conversations, getOrCreateConversation, addMessage, setClaudeLoading])

  const handleAgentSend = useCallback(async (text: string) => {
    if (!user) return
    const conv = getOrCreateConversation('agent')

    addMessage(conv.id, { role: 'user', content: text })
    setAgentLoading(true)

    // Simulate agent response after a delay
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500))

    const agentResponses = [
      `Thanks for reaching out, ${user.name.split(' ')[0]}! I've noted your message and will follow up shortly. Is there a good time to schedule a call?`,
      "Great question! Let me pull up your account details and get back to you with a personalized recommendation.",
      "I'd love to help with that. Our team has been seeing great results for clients in your industry. Can you share a bit more about your goals?",
      "Absolutely! I'll have our strategy team review your current setup and prepare some tailored recommendations for you.",
      "Thanks for messaging! Your account is on our Growth plan which includes priority support. I'll make sure this gets handled today.",
    ]

    addMessage(conv.id, {
      role: 'agent',
      content: agentResponses[Math.floor(Math.random() * agentResponses.length)],
    })
    setAgentLoading(false)
  }, [user, getOrCreateConversation, addMessage, setAgentLoading])

  return (
    <div className="chat-page">
      <NavBar back={null}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ '--active-line-color': '#1677ff', '--active-title-color': '#1677ff' }}
        >
          <Tabs.Tab
            title={
              <span className="chat-tab-label">
                🤖 Claude AI
              </span>
            }
            key="claude"
          />
          <Tabs.Tab
            title={
              <span className="chat-tab-label">
                👤 Sales Agent
              </span>
            }
            key="agent"
          />
        </Tabs>
      </NavBar>

      {activeTab === 'claude' && (
        <ChatThread
          conversation={claudeConversation}
          isLoading={isClaudeLoading}
          onSend={handleClaudeSend}
          quickPrompts={CLAUDE_QUICK_PROMPTS}
          placeholder="Ask Claude about your marketing..."
        />
      )}

      {activeTab === 'agent' && (
        <ChatThread
          conversation={agentConversation}
          isLoading={isAgentLoading}
          onSend={handleAgentSend}
          quickPrompts={AGENT_QUICK_REPLIES}
          placeholder="Message your sales agent..."
        />
      )}
    </div>
  )
}
