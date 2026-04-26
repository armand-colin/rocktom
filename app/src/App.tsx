import { Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Register } from './pages/Register'
import { Login } from './pages/Login'
import { PopupManagerView } from './ui/popup/PopupManagerView'
import { ContextualMenuView } from './ui/contextualMenuView/ContextualMenuView'

function App() {
  return <>
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<Home />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  
    <PopupManagerView />
    <ContextualMenuView />
  </>
}

export default App
