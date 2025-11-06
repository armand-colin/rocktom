import { Engine, Resource } from "@niloc/ecs";

export class PlaybackPreferences extends Resource {

    private _youtubeVolume = 1.0

    constructor(engine: Engine) {
        super(engine)
    }

    get youtubeVolume() {
        return this._youtubeVolume
    }

    set youtubeVolume(volume: number) {
        this._youtubeVolume = volume
        this.changed()
        this.save()
    }

    save() {
        localStorage.setItem('PlaybackPreferences', JSON.stringify({
            youtubeVolume: this._youtubeVolume
        }))
    }

    recover() {
        const entry = localStorage.getItem('PlaybackPreferences')
        if (entry === null)
            return

        const { youtubeVolume } = JSON.parse(entry)

        this._youtubeVolume = youtubeVolume
    }

}