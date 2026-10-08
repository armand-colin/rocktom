import { EngineContext } from '@niloc/ecs-react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { EditorPreferences } from './resources/EditorPreferences'
import { GlobalPreferences } from './resources/GlobalPreferences'
import { LiveInstrumentPreferences } from './resources/LiveInstrumentPreferences'
import { MetronomeToolPreferences } from './resources/MetronomeToolPreferences'
import { Mixer } from './resources/Mixer'
import { PlaybackPreferences } from './resources/PlaybackPreferences'
import { Preferences } from './resources/Preferences'
import { SoundEngine } from './resources/SoundEngine'
import { TextureAtlas } from './3d/TextureAtlas'
import { Instance } from './Instance'
import { AuthManager } from './resources/AuthManager'
import { AuthInterceptor } from './resources/AuthInterceptor'
import { AppUpdateManager } from './resources/AppUpdateManager'

async function bootstrap() {
    // Eager init so iOS / PWA unlock listeners are armed before the first tap.
    Instance.engine.getResource(SoundEngine)

    const preferences = Instance.engine.getResource(Preferences)
    preferences.register(Instance.engine.getResource(GlobalPreferences))
    preferences.register(Instance.engine.getResource(LiveInstrumentPreferences))
    preferences.register(Instance.engine.getResource(MetronomeToolPreferences))
    preferences.register(Instance.engine.getResource(PlaybackPreferences))
    preferences.register(Instance.engine.getResource(EditorPreferences))
    preferences.register(Instance.engine.getResource(Mixer))
    preferences.initialize()

    const authManager = Instance.engine.getResource(AuthManager)
    const appUpdateManager = Instance.engine.getResource(AppUpdateManager)

    Instance.queryClient.addInterceptor(AuthInterceptor.create(authManager))

    await authManager.restore()
    await TextureAtlas.load(Instance.engine).ready

    appUpdateManager.initialize()

    createRoot(document.getElementById('root')!).render(
        <EngineContext.Provider value={{ engine: Instance.engine }}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </EngineContext.Provider>
    )
}

bootstrap()
    .catch(console.error)
