import { Engine, Resource } from "@niloc/ecs"
import type { AudioRange } from "../sound/AudioRange"

export class LiveInstrumentPreferences extends Resource {

    private _octaver: number = 0
    private _deviceId: string | null = null
    private _volume: number = 1.0
    private _range: AudioRange | null = null

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
            octaver: this._octaver,
            deviceId: this._deviceId,
            volume: this._volume,
            range: this._range
        }))
    }

    recover() {
        const entry = localStorage.getItem('Instrument')
        if (entry === null)
            return

        const { octaver, deviceId, volume, range } = JSON.parse(entry)

        this._octaver = octaver ?? 0
        this._deviceId = deviceId ?? null
        this._volume = volume ?? 1.0
        this._range = range ?? null

        this.changed()
    }

}