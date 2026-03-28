export type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

export type ContentType = 'image' | 'video' | 'document'

export type Plan = 'starter' | 'growth' | 'enterprise'

export interface SocialAccount {
  platform: Platform
  handle: string
  connected: boolean
  followers?: number
}

export interface User {
  id: string
  name: string
  email: string
  company: string
  phone?: string
  avatar?: string
  plan: Plan
  socialAccounts: SocialAccount[]
  createdAt: string
}

export interface ScheduledPost {
  id: string
  userId: string
  title: string
  caption: string
  platforms: Platform[]
  scheduledAt: string
  status: PostStatus
  mediaUrls?: string[]
  hashtags?: string[]
  notes?: string
  createdAt: string
}

export interface ContentItem {
  id: string
  userId: string
  name: string
  type: ContentType
  url: string
  thumbnailUrl?: string
  size: number
  mimeType: string
  uploadedAt: string
  tags?: string[]
  description?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'agent'
  content: string
  timestamp: string
}

export interface ChatConversation {
  id: string
  userId: string
  type: 'claude' | 'agent'
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface AppData {
  user: User
  posts: ScheduledPost[]
  content: ContentItem[]
  conversations: ChatConversation[]
}
