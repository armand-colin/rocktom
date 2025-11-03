import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CurrentInstrument } from './resources/CurrentInstrument.ts'
import { EngineContext } from '@niloc/ecs-react'
import { Engine } from '@niloc/ecs'

const engine = new Engine()

engine.getResource(CurrentInstrument).recover()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EngineContext.Provider value={{ engine }}>
      <App />
    </EngineContext.Provider>
  </StrictMode>,
)