import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { Register } from './pages/Register'
import { Login } from './pages/Login'
import { PopupManagerView } from './ui/popup/PopupManagerView'
import { ContextualMenuView } from './ui/contextualMenuView/ContextualMenuView'
import { useResource } from '@niloc/ecs-react'
import { AuthManager } from './resources/AuthManager'
import { LevelPage } from './pages/LevelPage'
import { WindowManagerView } from './ui/window/WindowManagerView'

function App() {
  const authManager = useResource(AuthManager)

  const { isAuthenticated } = authManager

  return <>
    <Routes>
      {
        isAuthenticated ?
          <>
            <Route path="/app/level/:id" element={<LevelPage />} />
            <Route path="/app" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </> :
          <>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
      }
    </Routes>

    <WindowManagerView />
    <PopupManagerView />
    <ContextualMenuView />
  </>
}

export default App
