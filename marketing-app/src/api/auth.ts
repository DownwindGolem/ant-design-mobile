import type { User } from '../types'

// Demo users for MVP authentication
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 'user-001',
    name: 'Sarah Johnson',
    email: 'sarah@techventures.com',
    password: 'demo1234',
    company: 'Tech Ventures LLC',
    phone: '+1 (555) 012-3456',
    plan: 'growth',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    socialAccounts: [
      { platform: 'instagram', handle: '@techventures', connected: true, followers: 4820 },
      { platform: 'facebook', handle: 'TechVenturesLLC', connected: true, followers: 2100 },
      { platform: 'linkedin', handle: 'tech-ventures-llc', connected: true, followers: 1380 },
      { platform: 'twitter', handle: '@techventures_x', connected: false },
      { platform: 'tiktok', handle: '@techventures', connected: false },
    ],
    createdAt: '2024-06-15T10:00:00Z',
  },
  {
    id: 'user-002',
    name: 'Marcus Rivera',
    email: 'marcus@localbloom.co',
    password: 'bloom2024',
    company: 'Local Bloom Co.',
    phone: '+1 (555) 987-6543',
    plan: 'starter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    socialAccounts: [
      { platform: 'instagram', handle: '@localbloom', connected: true, followers: 892 },
      { platform: 'facebook', handle: 'LocalBloomCo', connected: true, followers: 430 },
      { platform: 'linkedin', handle: 'local-bloom', connected: false },
      { platform: 'twitter', handle: '@localbloom', connected: false },
      { platform: 'tiktok', handle: '@localbloom', connected: false },
    ],
    createdAt: '2024-09-01T08:00:00Z',
  },
]

export interface LoginResult {
  success: boolean
  token?: string
  user?: User
  error?: string
}

export async function login(email: string, password: string): Promise<LoginResult> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600))

  const match = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )

  if (!match) {
    return { success: false, error: 'Invalid email or password' }
  }

  const { password: _pw, ...user } = match
  const token = btoa(`${user.id}:${Date.now()}`)

  return { success: true, token, user }
}

export async function verifyToken(token: string): Promise<User | null> {
  await new Promise((r) => setTimeout(r, 100))
  try {
    const [userId] = atob(token).split(':')
    const match = DEMO_USERS.find((u) => u.id === userId)
    if (!match) return null
    const { password: _pw, ...user } = match
    return user
  } catch {
    return null
  }
}
