import { Engine, Resource } from "@niloc/ecs"
import type { PreferencesScope } from "./PreferencesScope"

export class EditorPreferences extends Resource implements PreferencesScope {

    static readonly key = 'EditorPreferences'
    private _openInstrumentTracks: Record<string, boolean> = {}

    constructor(engine: Engine) {
        super(engine)
    }

    get openInstrumentTracks(): Readonly<Record<string, boolean>> {
        return this._openInstrumentTracks
    }

    setOpenInstrumentTrack(trackId: string, open: boolean) {
        this._openInstrumentTracks[trackId] = open
        this.save()
        this.changed()
    }

    save() {
        localStorage.setItem(EditorPreferences.key, JSON.stringify({
            openInstrumentTracks: this._openInstrumentTracks
        }))
    }

    recover() {
        const entry = localStorage.getItem(EditorPreferences.key)
        if (entry === null)
            return

        const { openInstrumentTracks } = JSON.parse(entry)

        this._openInstrumentTracks = openInstrumentTracks ?? {}

        this.changed()
    }

}
