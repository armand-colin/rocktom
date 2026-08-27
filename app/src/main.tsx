import { EngineContext } from '@niloc/ecs-react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { LiveInstrumentPreferences } from './resources/LiveInstrumentPreferences.ts'
import { PlaybackPreferences } from './resources/PlaybackPreferences.ts'
import { TextureAtlas } from './3d/TextureAtlas.ts'
import { Instance } from './Instance.ts'
import { AuthManager } from './resources/AuthManager.ts'

Instance.engine.getResource(LiveInstrumentPreferences).recover()
Instance.engine.getResource(PlaybackPreferences).recover()

Promise.all([
    Instance.engine.getResource(AuthManager).restore(),
    TextureAtlas.load(Instance.engine).ready,
]).finally(() => {
    createRoot(document.getElementById('root')!).render(
        <EngineContext.Provider value={{ engine: Instance.engine }}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </EngineContext.Provider>
    )
})
