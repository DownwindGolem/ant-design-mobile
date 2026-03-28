import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { TabBar } from 'antd-mobile'
import {
  AppOutline,
  UploadOutline,
  MessageFill,
  SmileOutline,
} from 'antd-mobile-icons'
import './AppShell.css'

const tabs = [
  { key: '/calendar', title: 'Calendar', icon: <AppOutline /> },
  { key: '/upload', title: 'Upload', icon: <UploadOutline /> },
  { key: '/chat', title: 'Chat', icon: <MessageFill /> },
  { key: '/account', title: 'Account', icon: <SmileOutline /> },
]

export default function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeKey = tabs.find((t) => location.pathname.startsWith(t.key))?.key ?? '/calendar'

  return (
    <div className="app-shell">
      <div className="app-content">
        <Outlet />
      </div>
      <div className="app-tabbar">
        <TabBar activeKey={activeKey} onChange={(key) => navigate(key)}>
          {tabs.map((tab) => (
            <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
          ))}
        </TabBar>
      </div>
    </div>
  )
}
