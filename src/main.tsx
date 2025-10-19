import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Engine } from './engine/Engine.ts'
import { Instrument } from './resources/Instrument.ts'

Engine.instance.getResource(Instrument).recover()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)