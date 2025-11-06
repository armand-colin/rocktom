import { Engine, Resource } from "@niloc/ecs"

export class LiveInstrumentPreferences extends Resource {

    private _octaver: number = 0
    private _deviceId: string | null = null

    constructor(engine: Engine) {
        super(engine)
    }

    get deviceId() {
        return this._deviceId
    }

    set deviceId(id: string | null) {
        this._deviceId = id
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
            deviceId: this._deviceId
        }))
    }

    recover() {
        const entry = localStorage.getItem('Instrument')
        if (entry === null)
            return

        const { octaver, deviceId } = JSON.parse(entry)

        this._octaver = octaver
        this._deviceId = deviceId

        this.changed()
    }

}