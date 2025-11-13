import { Component, Engine } from "@niloc/ecs";
import { SoundEngine } from "../resources/SoundEngine";
import { Schedules } from "../Schedules";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import type { LiveInstrument } from "./LiveInstrument";

export class Tuner extends Component {

    private _analyser: SoundAnalyserNode
    private _detectedFrequency: number = 0

    constructor(engine: Engine, instrument: LiveInstrument) {
        super(engine)
        this._analyser = engine.getResource(SoundEngine).createAnalyserNode(instrument.range)
        instrument.rawOutput.connect(this._analyser)
        this.startCoroutine(this._update())
        Object.assign(window, { tuner: this })
    }

    get detectedFrequency() {
        return this._detectedFrequency
    }

    get frequencies() {
        return this._analyser.frequencies.slice(0, 256)
    }

    get frequencyStep() {
        return this._analyser.frequencyStep
    }

    private *_update() {
        while (true) {
            // const instrument = this.engine.getResource(Player).instrument
            this._detectedFrequency = this._analyser.getLowestFrequency()
            this.changed()
            yield Schedules.Frame
        }
    }

    destroy(): void {
        super.destroy()
        this._analyser.destroy()
    }

}