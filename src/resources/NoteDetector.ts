import { Component, Engine } from "@niloc/ecs";
import type { LiveInstrument } from "../components/LiveInstrument";
import { Schedules } from "../Schedules";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import { FineNote } from "../sound/note/Note";
import { SoundEngine } from "./SoundEngine";

export class NoteDetector extends Component {

    private _analyser: SoundAnalyserNode
    private _detectedNotes: FineNote[] = []

    constructor(engine: Engine, instrument: LiveInstrument) {
        super(engine)
        this._analyser = engine.getResource(SoundEngine).createAnalyserNode(instrument.range)
        this.startCoroutine(this._updateCoroutine())
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

    destroy(): void {
        super.destroy()
        this._analyser.destroy()
    }
}