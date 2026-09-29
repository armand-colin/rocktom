import { Engine, Resource } from "@niloc/ecs"

export class MetronomeToolPreferences extends Resource {

    static readonly minBpm = 40
    static readonly maxBpm = 240
    static readonly defaultBpm = 120

    private _bpm = MetronomeToolPreferences.defaultBpm

    constructor(engine: Engine) {
        super(engine)
    }

    get bpm() {
        return this._bpm
    }

    set bpm(bpm: number) {
        this._bpm = MetronomeToolPreferences.clamp(bpm)
        this.changed()
        this.save()
    }

    static clamp(bpm: number) {
        return Math.min(
            MetronomeToolPreferences.maxBpm,
            Math.max(MetronomeToolPreferences.minBpm, Math.round(bpm))
        )
    }

    save() {
        localStorage.setItem('MetronomeToolPreferences', JSON.stringify({
            bpm: this._bpm
        }))
    }

    recover() {
        const entry = localStorage.getItem('MetronomeToolPreferences')
        if (entry === null)
            return

        const { bpm } = JSON.parse(entry)
        this._bpm = MetronomeToolPreferences.clamp(bpm ?? MetronomeToolPreferences.defaultBpm)
        this.changed()
    }

}
