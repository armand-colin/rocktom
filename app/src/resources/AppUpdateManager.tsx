import { Resource } from "@niloc/ecs";
import { ToastManager } from "./ToastManager";
import { registerSW } from "virtual:pwa-register";
import { AppUpdateToast } from "../ui/toast/update/AppUpdateToast";

type UpdateSW = (reloadPage?: boolean) => Promise<void>

export class AppUpdateManager extends Resource {

    private _needsRefresh = false
    private _updateSW: UpdateSW | null = null
    private _calledCheck = false
    private _checking = false

    private _url: string | null = null
    private _registration: ServiceWorkerRegistration | null = null

    initialize() {
        const updateSW = registerSW({
            onNeedRefresh: () => {
                this._needsRefresh = true
                this.changed()

                if (this._calledCheck) {
                    return;
                }

                this.engine.getResource(ToastManager).add((close) => <AppUpdateToast
                    close={close}
                    applyUpdate={() => this.applyUpdate()}
                />, 60_000)
            },
            onRegisteredSW: (url, registration) => {
                this._url = url ?? null
                this._registration = registration ?? null
            }
        })

        this._updateSW = updateSW
    }

    get needsRefresh() {
        return this._needsRefresh
    }
    
    get checking() {
        return this._checking
    }

    async check() {
        if (this._checking)
            return

        if (!this._url || !this._registration)
            return

        this._calledCheck = true
        this._checking = true
        this.changed()

        // Added min-time to avoid spamming the server
        await Promise.all([
            new Promise(resolve => setTimeout(resolve, 1000)),
            fetch(this._url, { cache: "no-store" })
        ])

        const registration = await this._registration.update()

        this._registration = registration ?? null
        this._checking = false
        this.changed()
    }

    async applyUpdate() {
        if (!this._updateSW)
            return

        return this._updateSW(true)
    }

}
