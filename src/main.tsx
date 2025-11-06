import { Engine } from '@niloc/ecs'
import { EngineContext } from '@niloc/ecs-react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LiveInstrument } from './resources/LiveInstrument.ts'
import { NoteMeshes } from './resources/NoteMeshes.ts'

const engine = new Engine()

engine.getResource(LiveInstrument).recover()
engine.getResource(NoteMeshes).load()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EngineContext.Provider value={{ engine }}>
      <App />
    </EngineContext.Provider>
  </StrictMode>,
)