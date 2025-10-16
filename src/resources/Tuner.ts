import type { Engine } from "../engine/Engine";
import { Resource } from "../engine/Resource";
import { Schedule } from "../engine/Schedule";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import { Workspace } from "./Workspace";

export class Tuner extends Resource {

    private _analyser: SoundAnalyserNode

    private _detectedFrequency: number = 0

    constructor(engine: Engine) {
        super(engine)
        this._analyser = this.engine.getResource(Workspace).analyser
        this.engine.coroutine(this._update())
    }

    get detectedFrequency() {
        return this._detectedFrequency
    }

    private *_update() {
        while (true) {
            this._detectedFrequency = this._analyser.getLowestFrequency()
            this.changed()
            yield Schedule.Frame
        }
    }

}