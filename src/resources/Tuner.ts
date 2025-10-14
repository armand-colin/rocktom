import { Engine } from "../engine/Engine";
import { Resource } from "../engine/Resource";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import { Workspace } from "./Workspace";

export class Tuner extends Resource {

    private _analyser: SoundAnalyserNode

    private _detectedFrequency: number = 0

    constructor() {
        super()
        this._analyser = Engine.instance.resource(Workspace).analyser
        Engine.instance.coroutine(this._update())
    }

    get detectedFrequency() {
        return this._detectedFrequency
    }

    private *_update() {
        while (true) {
            this._detectedFrequency = this._analyser.getLowestPeakFrequency()
            this.changed()
            yield null
        }
    }

}