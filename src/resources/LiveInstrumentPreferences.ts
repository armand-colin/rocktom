import { Engine, Resource } from "@niloc/ecs"
import type { AudioRange } from "../sound/AudioRange"

export class LiveInstrumentPreferences extends Resource {

    private _deviceId: string | null = null
    private _volume: number = 1.0
    private _range: AudioRange | null = null
    private _enablePlayback: boolean = true
    private _octaverEnabled: boolean = false

    constructor(engine: Engine) {
        super(engine)
    }

    get deviceId() {
        return this._deviceId
    }

    set deviceId(id: string | null) {
        this._deviceId = id
        this.save()
        this.changed()
    }

    get volume() {
        return this._volume
    }

    set volume(volume: number) {
        this._volume = volume
        this.save()
        this.changed()
    }

    get range() {
        return this._range
    }

    set range(range: AudioRange | null) {
        this._range = range
        this.save()
        this.changed()
    }

    get enablePlayback() {
        return this._enablePlayback
    }

    set enablePlayback(enable: boolean) {
        this._enablePlayback = enable
        this.save()
        this.changed()
    }

    get octaverEnabled() {
        return this._octaverEnabled
    }

    set octaverEnabled(enabled: boolean) {
        this._octaverEnabled = enabled
        this.save()
        this.changed()
    }

    getMediaStream(): Promise<MediaStream> {
        return navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: {
                    exact: this._deviceId ?? undefined
                },
                echoCancellation: false,
            }
        })
    }

    save() {
        localStorage.setItem('Instrument', JSON.stringify({
            octaverEnabled: this._octaverEnabled,
            deviceId: this._deviceId,
            volume: this._volume,
            range: this._range,
            enablePlayback: this._enablePlayback,
        }))
    }

    recover() {
        const entry = localStorage.getItem('Instrument')
        if (entry === null)
            return

        const { octaverEnabled, deviceId, volume, range, enablePlayback } = JSON.parse(entry)

        this._octaverEnabled = octaverEnabled ?? false
        this._deviceId = deviceId ?? null
        this._volume = volume ?? 1.0
        this._range = range ?? null
        this._enablePlayback = enablePlayback ?? true

        this.changed()
    }

}