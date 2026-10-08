import { Engine, Resource } from "@niloc/ecs"
import { PlaybackVisualMode } from "../playback/PlaybackVisualMode"
import type { PreferencesScope } from "./PreferencesScope"

export class GlobalPreferences extends Resource implements PreferencesScope {

    static readonly key = "GlobalPreferences"

    private _visualMode: PlaybackVisualMode = PlaybackVisualMode.ThreeD

    constructor(engine: Engine) {
        super(engine)
    }

    get visualMode() {
        return this._visualMode
    }

    set visualMode(mode: PlaybackVisualMode) {
        this._visualMode = mode
        this.save()
        this.changed()
    }

    save() {
        localStorage.setItem(GlobalPreferences.key, JSON.stringify({
            visualMode: this._visualMode
        }))
    }

    recover() {
        const entry = localStorage.getItem(GlobalPreferences.key)
        if (entry === null)
            return

        const { visualMode } = JSON.parse(entry)
        this._visualMode = PlaybackVisualMode.parseSafe(visualMode) ?? PlaybackVisualMode.ThreeD
        this.changed()
    }

}
