import { EngineContext } from '@niloc/ecs-react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'
import { LiveInstrumentPreferences } from './resources/LiveInstrumentPreferences.ts'
import { PlaybackPreferences } from './resources/PlaybackPreferences.ts'
import { TextureAtlas } from './3d/TextureAtlas.ts'
import { Instance } from './Instance.ts'
import { AuthManager } from './resources/AuthManager.ts'
import { AuthInterceptor } from './resources/AuthInterceptor.ts'
import { ToastManager } from './resources/ToastManager.ts'
import { Toast } from './ui/toast/Toast.tsx'

Instance.engine.getResource(LiveInstrumentPreferences).recover()
Instance.engine.getResource(PlaybackPreferences).recover()

const authManager = Instance.engine.getResource(AuthManager)

Instance.queryClient.addInterceptor(AuthInterceptor.create(authManager))

Promise.all([
    authManager.restore(),
    TextureAtlas.load(Instance.engine).ready,
]).finally(() => {
    createRoot(document.getElementById('root')!).render(
        <EngineContext.Provider value={{ engine: Instance.engine }}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </EngineContext.Provider>
    )

    const updateSW = registerSW({
        onNeedRefresh() {
            Instance.engine.getResource(ToastManager).add((close) => <Toast.Simple
                message="Une nouvelle version est disponible."
                action={{
                    label: "Mettre à jour",
                    onClick: () => {
                        close()
                        void updateSW(true)
                    },
                }}
            />, 60_000)
        },
    })
})
