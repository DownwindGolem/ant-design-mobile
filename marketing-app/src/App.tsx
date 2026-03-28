import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import CalendarPage from './pages/CalendarPage'
import UploadPage from './pages/UploadPage'
import AccountPage from './pages/AccountPage'
import ChatPage from './pages/ChatPage'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/calendar" replace />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/calendar" replace />} />
      </Routes>
    </HashRouter>
  )
}
