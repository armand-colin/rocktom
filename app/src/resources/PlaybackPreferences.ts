import { Engine, Resource } from "@niloc/ecs";
import type { PreferencesScope } from "./PreferencesScope";

export class PlaybackPreferences extends Resource implements PreferencesScope {

    private _audioVolume = 1.0
    private _autoScroll = true

    constructor(engine: Engine) {
        super(engine)
    }

    get audioVolume() {
        return this._audioVolume
    }

    set audioVolume(volume: number) {
        this._audioVolume = volume
        this.save()
        this.changed()
    }

    get autoScroll() {
        return this._autoScroll
    }

    set autoScroll(value: boolean) {
        this._autoScroll = value
        this.save()
        this.changed()
    }

    save() {
        localStorage.setItem('PlaybackPreferences', JSON.stringify({
            audioVolume: this._audioVolume,
            autoScroll: this._autoScroll
        }))
    }

    recover() {
        const entry = localStorage.getItem('PlaybackPreferences')
        if (entry === null)
            return

        const { audioVolume, autoScroll } = JSON.parse(entry)

        this._audioVolume = audioVolume ?? 1.0
        this._autoScroll = autoScroll ?? true
    }

}