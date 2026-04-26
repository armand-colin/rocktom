import { Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Register } from './pages/Register'
import { Login } from './pages/Login'
import { PopupManagerView } from './ui/popup/PopupManagerView'
import { ContextualMenuView } from './ui/contextualMenuView/ContextualMenuView'
import { useResource } from '@niloc/ecs-react'
import { AuthManager } from './resources/AuthManager'

function App() {
  const authManager = useResource(AuthManager)

  const { isAuthenticated } = authManager

  return <>
    <Routes>
      {
        isAuthenticated ?
          <>
            <Route path="/app" element={<Home />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </> :
          <>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
      }
    </Routes>

    <PopupManagerView />
    <ContextualMenuView />
  </>
}

export default App
