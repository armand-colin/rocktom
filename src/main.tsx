import { Engine } from '@niloc/ecs'
import { EngineContext } from '@niloc/ecs-react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LiveInstrumentPreferences } from './resources/LiveInstrumentPreferences.ts'
import { PlaybackPreferences } from './resources/PlaybackPreferences.ts'
import { FretTexture } from './3d/FretTexture.ts'
import { NoteMaterial } from './3d/NoteMaterial.ts'

const engine = new Engine()

engine.getResource(LiveInstrumentPreferences).recover()
FretTexture.load()
NoteMaterial.load()

engine.getResource(PlaybackPreferences).recover()

createRoot(document.getElementById('root')!).render(
  <EngineContext.Provider value={{ engine }}>
    <App />
  </EngineContext.Provider>
)