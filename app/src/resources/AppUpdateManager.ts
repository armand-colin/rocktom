import { Resource } from "@niloc/ecs";

type UpdateSW = (reloadPage?: boolean) => Promise<void>

export class AppUpdateManager extends Resource {

    private _needsRefresh = false
    private _updateSW: UpdateSW | null = null

    get needsRefresh() {
        return this._needsRefresh
    }

    register(updateSW: UpdateSW) {
        this._updateSW = updateSW
    }

    setNeedsRefresh(value: boolean) {
        if (this._needsRefresh === value)
            return

        this._needsRefresh = value
        this.changed()
    }

    applyUpdate() {
        if (!this._updateSW)
            return

        void this._updateSW(true)
    }

}
