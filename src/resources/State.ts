import { Engine, Resource } from "@niloc/ecs";
import { LevelEditor } from "../components/editor/LevelEditor";
import { Level } from "../sound/Level";
import { SoundEngine } from "./SoundEngine";
import type { LiveInstrument } from "../components/LiveInstrument";
import type { Playback } from "../components/Playback";

export class State extends Resource {

    private _soundEngine: SoundEngine
    private _instrument: LiveInstrument | null = null

    private _editor: LevelEditor | null = null
    private _playback: Playback | null = null

    constructor(engine: Engine) {
        super(engine)
        this._soundEngine = this.engine.getResource(SoundEngine)
    }

    get editor() {
        return this._editor
    }

    get playback() {
        return this._playback
    }

    get instrument() {
        return this._instrument
    }

    editLevel(level: Level | null) {
        this._editor?.destroy()
        this._editor = null

        if (level) {
            const editor = this.engine.createComponent(LevelEditor, level)
            this._editor = editor
        }

        this.changed()
    }

    setInstrument(instrument: LiveInstrument | null) {
        if (this._instrument)
            this._instrument.destroy()

        this._instrument = instrument

        if (instrument)
            instrument.output.connect(this._soundEngine.output)

        this.changed()
    }

    setPlayback(playback: Playback | null) {
        if (this._playback)
            this._playback.destroy()

        this._playback = playback
        this.changed()
    }

}