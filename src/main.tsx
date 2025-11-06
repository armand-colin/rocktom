import { Engine } from '@niloc/ecs'
import { EngineContext } from '@niloc/ecs-react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LiveInstrumentPreferences } from './resources/LiveInstrumentPreferences.ts'
import { NoteMeshes } from './resources/NoteMeshes.ts'
import { PlaybackPreferences } from './resources/PlaybackPreferences.ts'

const engine = new Engine()

engine.getResource(LiveInstrumentPreferences).recover()
engine.getResource(NoteMeshes).load()
engine.getResource(PlaybackPreferences).recover()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EngineContext.Provider value={{ engine }}>
      <App />
    </EngineContext.Provider>
  </StrictMode>,
)