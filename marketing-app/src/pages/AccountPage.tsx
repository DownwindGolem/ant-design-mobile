import { useState } from 'react'
import {
  NavBar,
  Avatar,
  Card,
  List,
  Button,
  Tag,
  Switch,
  Dialog,
  Toast,
  Popup,
  Form,
  Input,
} from 'antd-mobile'
import {
  UserOutline,
  AppOutline,
  SetOutline,
  CompassOutline,
  SoundOutline,
  RightOutline,
} from 'antd-mobile-icons'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom'
import type { Platform } from '../types'
import './AccountPage.css'

const PLATFORM_ICONS: Record<Platform, string> = {
  instagram: '📸',
  facebook: '👥',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
}

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: '#e1306c',
  facebook: '#1877f2',
  twitter: '#1da1f2',
  linkedin: '#0a66c2',
  tiktok: '#010101',
}

const PLAN_DETAILS = {
  starter: {
    label: 'Starter',
    color: '#52c41a',
    description: 'Up to 3 social accounts · 20 posts/mo · Basic analytics',
  },
  growth: {
    label: 'Growth',
    color: '#1677ff',
    description: 'Up to 10 social accounts · Unlimited posts · Advanced analytics · Priority support',
  },
  enterprise: {
    label: 'Enterprise',
    color: '#722ed1',
    description: 'Unlimited accounts · Unlimited posts · Custom reporting · Dedicated manager',
  },
}

export default function AccountPage() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const updateUser = useStore((s) => s.updateUser)
  const posts = useStore((s) => s.posts)
  const content = useStore((s) => s.content)

  const [showEditPopup, setShowEditPopup] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    company: user?.company ?? '',
  })
  const [notifications, setNotifications] = useState(true)

  if (!user) return null

  const plan = PLAN_DETAILS[user.plan]
  const publishedPosts = posts.filter((p) => p.status === 'published').length
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled').length

  const handleLogout = async () => {
    const confirmed = await Dialog.confirm({
      content: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
    })
    if (confirmed) {
      logout()
      navigate('/login', { replace: true })
    }
  }

  const handleSaveProfile = () => {
    if (!editForm.name.trim()) {
      Toast.show({ content: 'Name is required', icon: 'fail' })
      return
    }
    updateUser({
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      company: editForm.company.trim(),
    })
    setShowEditPopup(false)
    Toast.show({ content: 'Profile updated', icon: 'success' })
  }

  const togglePlatform = (platform: Platform) => {
    const updated = user.socialAccounts.map((acc) =>
      acc.platform === platform ? { ...acc, connected: !acc.connected } : acc
    )
    updateUser({ socialAccounts: updated })
  }

  return (
    <div className="account-page">
      <NavBar
        back={null}
        right={
          <Button color="primary" fill="none" onClick={() => setShowEditPopup(true)}>
            Edit
          </Button>
        }
      >
        Account
      </NavBar>

      <div className="account-body">
        {/* Profile Header */}
        <div className="profile-header">
          <Avatar
            src={user.avatar ?? ''}
            style={{ '--size': '80px', '--border-radius': '24px' } as React.CSSProperties}
          />
          <div className="profile-info">
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-company">{user.company}</p>
            <p className="profile-email">{user.email}</p>
          </div>
          <Tag
            className="plan-badge"
            style={{ background: plan.color, color: '#fff', border: 'none' }}
          >
            {plan.label}
          </Tag>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{posts.length}</span>
            <span className="stat-label">Total Posts</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{scheduledPosts}</span>
            <span className="stat-label">Scheduled</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{publishedPosts}</span>
            <span className="stat-label">Published</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{content.length}</span>
            <span className="stat-label">Assets</span>
          </div>
        </div>

        {/* Plan Card */}
        <Card className="plan-card">
          <div className="plan-card-header">
            <div>
              <span className="plan-name" style={{ color: plan.color }}>{plan.label} Plan</span>
              <p className="plan-description">{plan.description}</p>
            </div>
            <Button color="primary" size="small" fill="outline">
              Upgrade
            </Button>
          </div>
        </Card>

        {/* Connected Social Accounts */}
        <Card className="section-card">
          <h3 className="section-title">Social Accounts</h3>
          {user.socialAccounts.map((acc) => (
            <div key={acc.platform} className="social-account-row">
              <div className="social-account-left">
                <span
                  className="social-platform-icon"
                  style={{ background: `${PLATFORM_COLORS[acc.platform]}15` }}
                >
                  {PLATFORM_ICONS[acc.platform]}
                </span>
                <div className="social-account-info">
                  <span className="social-platform-name">
                    {acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1)}
                  </span>
                  <span className="social-handle">{acc.connected ? acc.handle : 'Not connected'}</span>
                  {acc.connected && acc.followers && (
                    <span className="social-followers">
                      {acc.followers.toLocaleString()} followers
                    </span>
                  )}
                </div>
              </div>
              <Switch
                checked={acc.connected}
                onChange={() => togglePlatform(acc.platform)}
                style={{ '--checked-color': PLATFORM_COLORS[acc.platform] } as React.CSSProperties}
              />
            </div>
          ))}
        </Card>

        {/* Settings */}
        <Card className="section-card">
          <h3 className="section-title">Settings</h3>
          <List>
            <List.Item
              prefix={<SoundOutline />}
              extra={
                <Switch
                  checked={notifications}
                  onChange={setNotifications}
                />
              }
            >
              Push Notifications
            </List.Item>
            <List.Item prefix={<SetOutline />} arrow extra={<RightOutline />}>
              Change Password
            </List.Item>
            <List.Item prefix={<CompassOutline />} arrow extra={<RightOutline />}>
              Timezone & Language
            </List.Item>
            <List.Item prefix={<AppOutline />} arrow extra={<RightOutline />}>
              Billing & Invoices
            </List.Item>
          </List>
        </Card>

        {/* Danger Zone */}
        <Button
          block
          color="danger"
          fill="outline"
          size="large"
          className="logout-btn"
          onClick={handleLogout}
        >
          Sign Out
        </Button>

        <p className="version-text">Elevate Marketing v0.1.0</p>
      </div>

      {/* Edit Profile Popup */}
      <Popup
        visible={showEditPopup}
        onMaskClick={() => setShowEditPopup(false)}
        bodyStyle={{ borderRadius: '20px 20px 0 0', padding: '16px 16px 40px' }}
        position="bottom"
      >
        <div className="popup-handle" />
        <h3 className="popup-title">Edit Profile</h3>

        <Form layout="vertical">
          <Form.Item label="Full Name" required>
            <Input
              placeholder="Your name"
              value={editForm.name}
              onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
            />
          </Form.Item>
          <Form.Item label="Company">
            <Input
              placeholder="Company name"
              value={editForm.company}
              onChange={(v) => setEditForm((f) => ({ ...f, company: v }))}
            />
          </Form.Item>
          <Form.Item label="Phone">
            <Input
              placeholder="+1 (555) 000-0000"
              type="tel"
              value={editForm.phone}
              onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))}
            />
          </Form.Item>
        </Form>

        <div className="popup-actions">
          <Button block color="default" onClick={() => setShowEditPopup(false)}>
            Cancel
          </Button>
          <Button block color="primary" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </div>
      </Popup>
    </div>
  )
}
