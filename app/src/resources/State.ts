import { Engine, Resource } from "@niloc/ecs";
import { LevelEditor } from "../components/editor/LevelEditor";
import type { LiveInstrument } from "../components/LiveInstrument";
import type { Playback } from "../components/Playback";
import { Level } from "../sound/Level";

export class State extends Resource {

    private _liveInstrument: LiveInstrument | null = null
    private _editor: LevelEditor | null = null
    private _playback: Playback | null = null

    constructor(engine: Engine) {
        super(engine)
    }

    get editor() {
        return this._editor
    }

    get playback() {
        return this._playback
    }

    get liveInstrument() {
        return this._liveInstrument
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

    cloneLevel(level: Level) {
        const cloned = level.clone()
        this.editLevel(cloned)
    }

    setInstrument(liveInstrument: LiveInstrument | null) {
        if (this._liveInstrument)
            this._liveInstrument.destroy()

        this._liveInstrument = liveInstrument

        this.changed()
    }

    setPlayback(playback: Playback | null) {
        if (this._playback)
            this._playback.destroy()

        this._playback = playback
        this.changed()
    }

}