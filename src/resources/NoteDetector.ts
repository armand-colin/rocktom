import { Engine, Resource } from "@niloc/ecs";
import { Schedules } from "../Schedules";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import { FineNote } from "../sound/note/Note";
import { Workspace } from "./Workspace";

export class NoteDetector extends Resource {

    private _analyser: SoundAnalyserNode
    private _detectedNotes: FineNote[] = []

    constructor(engine: Engine) {
        super(engine)
        this._analyser = this.engine.getResource(Workspace).analyser
        this.engine.scheduler.add(this._updateCoroutine())
        Object.assign(window, { detector: this })
    }

    get detectedNotes() {
        return this._detectedNotes
    }

    private *_updateCoroutine() {
        while (true) {
            this._update()
            yield Schedules.Frame
        }
    }

    private _update() {
        const frequencies = this._analyser.getAllFrequencies()
        this._detectedNotes = frequencies.map(frequency => FineNote.closestFrequency(frequency))
        this.changed()
    }

}