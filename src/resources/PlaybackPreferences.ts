import { Engine, Resource } from "@niloc/ecs";

export class PlaybackPreferences extends Resource {

    private _audioVolume = 1.0

    constructor(engine: Engine) {
        super(engine)
    }

    get audioVolume() {
        return this._audioVolume
    }

    set audioVolume(volume: number) {
        this._audioVolume = volume
        this.changed()
        this.save()
    }

    save() {
        localStorage.setItem('PlaybackPreferences', JSON.stringify({
            audioVolume: this._audioVolume
        }))
    }

    recover() {
        const entry = localStorage.getItem('PlaybackPreferences')
        if (entry === null)
            return

        const { audioVolume } = JSON.parse(entry)

        this._audioVolume = audioVolume ?? 1.0
    }

}