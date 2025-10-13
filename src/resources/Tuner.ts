import { Engine } from "../engine/Engine";
import { Resource } from "../engine/Resource";
import { PitchDetector } from "../sound/PitchDetector";
import { Time } from "../sound/Time";
import { Workspace } from "./Workspace";

export class Tuner extends Resource {

    private _pitchDetector: PitchDetector
    private _detectedFrequency: number = 0

    constructor() {
        super()
        this._pitchDetector = new PitchDetector(Engine.instance.resource(Workspace).analyser)

        setInterval(this._update, Time.audioInterval.milliseconds, undefined)
    }

    get detectedFrequency() {
        return this._detectedFrequency
    }

    private _update = () => {
        this._pitchDetector.update()
        this._detectedFrequency = this._pitchDetector.frequency
        this.changed()
    }

}