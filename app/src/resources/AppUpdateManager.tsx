import { Resource } from "@niloc/ecs";
import { ToastManager } from "./ToastManager";
import { Toast } from "../ui/toast/Toast";
import { registerSW } from "virtual:pwa-register";

type UpdateSW = (reloadPage?: boolean) => Promise<void>

export class AppUpdateManager extends Resource {

    private _needsRefresh = false
    private _updateSW: UpdateSW | null = null

    initialize() {
        const updateSW = registerSW({
            onNeedRefresh: () => {
                this._needsRefresh = true
                this.changed()

                this.engine.getResource(ToastManager).add((close) => <Toast.Simple
                    message="A new version is available !"
                    action={{
                        label: "Update",
                        onClick: () => {
                            close()
                            this.applyUpdate()
                        },
                    }}
                />, 60_000)
            },
        })

        this._updateSW = updateSW
    }

    get needsRefresh() {
        return this._needsRefresh
    }

    applyUpdate() {
        if (!this._updateSW)
            return

        void this._updateSW(true)
    }

}
