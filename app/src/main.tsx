import { EngineContext } from '@niloc/ecs-react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { LiveInstrumentPreferences } from './resources/LiveInstrumentPreferences.ts'
import { PlaybackPreferences } from './resources/PlaybackPreferences.ts'
import { FretTexture } from './3d/FretTexture.ts'
import { NoteMaterial } from './3d/NoteMaterial.ts'
import { Instance } from './Instance.ts'
import { AuthManager } from './resources/AuthManager.ts'

Instance.engine.getResource(LiveInstrumentPreferences).recover()
FretTexture.load()
NoteMaterial.load()

Instance.engine.getResource(PlaybackPreferences).recover()

Instance.engine.getResource(AuthManager).restore()
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <EngineContext.Provider value={{ engine: Instance.engine }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </EngineContext.Provider>
    )
  })