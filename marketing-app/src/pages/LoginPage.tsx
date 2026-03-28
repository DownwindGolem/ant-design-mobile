import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, Input, Toast, SpinLoading } from 'antd-mobile'
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import { login } from '../api/auth'
import { useStore } from '../store/useStore'
import { seedDemoData } from '../store/useStore'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const storeLogin = useStore((s) => s.login)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const result = await login(values.email, values.password)
      if (result.success && result.token && result.user) {
        storeLogin(result.token, result.user)
        seedDemoData(result.user.id)
        navigate('/calendar', { replace: true })
      } else {
        Toast.show({ content: result.error ?? 'Login failed', icon: 'fail' })
      }
    } catch {
      Toast.show({ content: 'Network error. Please try again.', icon: 'fail' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#1677ff" />
            <path d="M12 36L24 12L36 36" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 28H32" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="login-brand">Elevate Marketing</h1>
        <p className="login-tagline">Your social media command center</p>
      </div>

      <div className="login-card">
        <h2 className="login-heading">Sign In</h2>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          footer={
            <Button
              block
              type="submit"
              color="primary"
              size="large"
              loading={loading}
              className="login-submit-btn"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          }
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              placeholder="your@email.com"
              type="email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input
              placeholder="Enter your password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              suffix={
                <div onClick={() => setVisible(!visible)} className="eye-toggle">
                  {visible ? <EyeOutline /> : <EyeInvisibleOutline />}
                </div>
              }
            />
          </Form.Item>
        </Form>

        <div className="login-demo-hint">
          <p className="hint-title">Demo Credentials</p>
          <div className="hint-row">
            <span>sarah@techventures.com</span>
            <span className="hint-sep">/</span>
            <span>demo1234</span>
          </div>
          <div className="hint-row">
            <span>marcus@localbloom.co</span>
            <span className="hint-sep">/</span>
            <span>bloom2024</span>
          </div>
        </div>
      </div>
    </div>
  )
}
