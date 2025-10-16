import type { Engine } from "../engine/Engine";
import { Resource } from "../engine/Resource";
import { Schedule } from "../engine/Schedule";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import { Note } from "../sound/note/Note";
import { Workspace } from "./Workspace";

export class NoteDetector extends Resource {

    private _analyser: SoundAnalyserNode
    private _detectedNotes: Note[] = []

    constructor(engine: Engine) {
        super(engine)
        this._analyser = this.engine.getResource(Workspace).analyser
        this.engine.coroutine(this._updateCoroutine())
        Object.assign(window, { detector: this })
    }

    get detectedNotes() {
        return this._detectedNotes
    }

    private *_updateCoroutine() {
        while (true) {
            this._update()
            yield Schedule.Frame
        }
    }

    private _update() {
        const frequencies = this._analyser.getAllFrequencies()
        this._detectedNotes = frequencies.map(frequency => Note.closestFrequency(frequency))
        this.changed()
    }

}