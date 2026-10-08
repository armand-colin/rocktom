import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { Register } from './pages/Register'
import { Login } from './pages/Login'
import { PopupManagerView } from './ui/popup/PopupManagerView'
import { ToastManagerView } from './ui/toast/ToastManagerView'
import { ContextualMenuView } from './ui/contextualMenuView/ContextualMenuView'
import { useResource } from '@niloc/ecs-react'
import { AuthManager } from './resources/AuthManager'
import { LevelPage } from './pages/LevelPage'
import { WindowManagerView } from './ui/window/WindowManagerView'
import { EditorPage } from './pages/EditorPage'
import "./App.css"
import { AcceptLevelSharePage } from './pages/AcceptLevelSharePage'
import { SettingsPage } from './pages/SettingsPage'
import { Routes } from './Routes'

function App() {
  const authManager = useResource(AuthManager)

  const { isAuthenticated } = authManager

  return <>
    <ReactRoutes>
      {
        isAuthenticated ?
          <>
            <Route path={Routes.Level.raw} element={<LevelPage />} />
            <Route path={Routes.Editor.raw} element={<EditorPage />} />
            <Route path={Routes.AcceptLevelShare.raw} element={<AcceptLevelSharePage />} />
            <Route path={Routes.Home.raw} element={<HomePage />} />
            <Route path={Routes.Settings.raw} element={<SettingsPage />} />
            <Route path="*" element={<Navigate to={Routes.Home.raw} replace />} />
          </> :
          <>
            <Route path={Routes.Register.raw} element={<Register />} />
            <Route path={Routes.Login.raw} element={<Login />} />
            <Route path="*" element={<Navigate to={Routes.Login.raw} replace />} />
          </>
      }
    </ReactRoutes>

    <WindowManagerView />
    <PopupManagerView />
    <ToastManagerView />
    <ContextualMenuView />
  </>
}

export default App
