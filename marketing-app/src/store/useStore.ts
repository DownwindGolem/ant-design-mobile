import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, ScheduledPost, ContentItem, ChatConversation, ChatMessage, Platform } from '../types'
import { v4 as uuidv4 } from 'uuid'

interface AppState {
  // Auth
  token: string | null
  user: User | null
  isAuthenticated: boolean

  // Data
  posts: ScheduledPost[]
  content: ContentItem[]
  conversations: ChatConversation[]

  // UI
  isClaudeLoading: boolean
  isAgentLoading: boolean

  // Auth actions
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void

  // Post actions
  addPost: (post: Omit<ScheduledPost, 'id' | 'userId' | 'createdAt'>) => ScheduledPost
  updatePost: (id: string, updates: Partial<ScheduledPost>) => void
  deletePost: (id: string) => void

  // Content actions
  addContent: (item: Omit<ContentItem, 'id' | 'userId' | 'uploadedAt'>) => ContentItem
  deleteContent: (id: string) => void

  // Chat actions
  getOrCreateConversation: (type: 'claude' | 'agent') => ChatConversation
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage
  setClaudeLoading: (loading: boolean) => void
  setAgentLoading: (loading: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      posts: [],
      content: [],
      conversations: [],
      isClaudeLoading: false,
      isAgentLoading: false,

      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      addPost: (postData) => {
        const post: ScheduledPost = {
          ...postData,
          id: uuidv4(),
          userId: get().user?.id ?? '',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ posts: [...state.posts, post] }))
        return post
      },

      updatePost: (id, updates) =>
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deletePost: (id) =>
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),

      addContent: (itemData) => {
        const item: ContentItem = {
          ...itemData,
          id: uuidv4(),
          userId: get().user?.id ?? '',
          uploadedAt: new Date().toISOString(),
        }
        set((state) => ({ content: [...state.content, item] }))
        return item
      },

      deleteContent: (id) =>
        set((state) => ({ content: state.content.filter((c) => c.id !== id) })),

      getOrCreateConversation: (type) => {
        const existing = get().conversations.find(
          (c) => c.type === type && c.userId === get().user?.id
        )
        if (existing) return existing

        const conversation: ChatConversation = {
          id: uuidv4(),
          userId: get().user?.id ?? '',
          type,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ conversations: [...state.conversations, conversation] }))
        return conversation
      },

      addMessage: (conversationId, messageData) => {
        const message: ChatMessage = {
          ...messageData,
          id: uuidv4(),
          timestamp: new Date().toISOString(),
        }
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }))
        return message
      },

      setClaudeLoading: (loading) => set({ isClaudeLoading: loading }),
      setAgentLoading: (loading) => set({ isAgentLoading: loading }),
    }),
    {
      name: 'elevate-marketing-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        posts: state.posts,
        content: state.content,
        conversations: state.conversations,
      }),
    }
  )
)

// Seed demo data for a fresh user
export function seedDemoData(userId: string) {
  const store = useStore.getState()
  if (store.posts.length > 0) return // Already seeded

  const platforms: Platform[] = ['instagram', 'facebook', 'linkedin']
  const now = new Date()

  const demoPosts = [
    {
      title: 'Summer Sale Announcement',
      caption: '☀️ Our biggest summer sale is HERE! Up to 50% off all services. Tag a friend who needs a glow-up this season! #SummerSale #DigitalMarketing',
      platforms: ['instagram', 'facebook'] as Platform[],
      scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0).toISOString(),
      status: 'scheduled' as const,
      hashtags: ['#SummerSale', '#DigitalMarketing', '#GrowYourBusiness'],
    },
    {
      title: 'Client Success Story',
      caption: '🎉 Thrilled to share that our client @TechStartupXYZ grew their social following by 300% in just 60 days! Real results, real growth. DM us to start your journey.',
      platforms: ['instagram', 'linkedin'] as Platform[],
      scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 14, 0).toISOString(),
      status: 'scheduled' as const,
      hashtags: ['#ClientWins', '#SocialMediaGrowth', '#DigitalSuccess'],
    },
    {
      title: 'Tips Tuesday',
      caption: '📱 5 content tips that tripled our engagement:\n1. Post consistently\n2. Use Reels/Shorts\n3. Engage in comments\n4. Collab with micro-influencers\n5. Track analytics weekly\nSave this post! 👆',
      platforms: ['instagram', 'facebook', 'twitter'] as Platform[],
      scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 9, 0).toISOString(),
      status: 'published' as const,
      hashtags: ['#TipsTuesday', '#ContentMarketing', '#SocialMediaTips'],
    },
    {
      title: 'Behind the Scenes',
      caption: 'A peek behind the curtain! 🎬 Our team brainstorming your next viral campaign. We live and breathe creative strategy.',
      platforms: ['instagram', 'tiktok'] as Platform[],
      scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8, 16, 0).toISOString(),
      status: 'draft' as const,
      hashtags: ['#BehindTheScenes', '#MarketingLife', '#CreativeTeam'],
    },
    {
      title: 'LinkedIn Thought Leadership',
      caption: 'The brands winning on social media in 2025 have one thing in common: they tell stories, not just sell products. Here\'s what that looks like in practice...',
      platforms: ['linkedin'] as Platform[],
      scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0).toISOString(),
      status: 'scheduled' as const,
      hashtags: ['#ThoughtLeadership', '#BrandStrategy', '#ContentFirst'],
    },
  ]

  demoPosts.forEach((postData) => {
    useStore.getState().addPost(postData)
  })
}
