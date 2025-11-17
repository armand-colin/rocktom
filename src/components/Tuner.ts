import { Component, Engine } from "@niloc/ecs";
import { SoundEngine } from "../resources/SoundEngine";
import { Schedules } from "../Schedules";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import type { LiveInstrument } from "./LiveInstrument";
import type { String } from "../sound/instrument/String";

export class Tuner extends Component {

    private _analyser: SoundAnalyserNode
    private _detectedFrequency: number = 0
    private _instrument: LiveInstrument
    private _targetString: String | null = null

    constructor(engine: Engine, instrument: LiveInstrument) {
        super(engine)
        this._analyser = engine.getResource(SoundEngine).createAnalyserNode(instrument.range)
        this._instrument = instrument
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

    get targetString() {
        return this._targetString
    }

    set targetString(value: String | null) {
        this._targetString = value
        this.changed()
    }

    private *_update() {
        while (true) {
            let baseFrequency = this._analyser.getStrongestFrequency()
            if (this._instrument.octaverEnabled)
                baseFrequency /= 2

            this._detectedFrequency = baseFrequency

            const targetFrequency = this._targetString ? 
                this._targetString.note.frequency :
                0

            // Shall try powers of 2 to check if possible harmonic is closer to detected frequency
            for (let i = 1; i <= 3; i++) {
                const harmonic = baseFrequency / Math.pow(2, i)
                const currentDistance = Math.abs(this._detectedFrequency - targetFrequency)
                const distance = Math.abs(harmonic - targetFrequency)

                if (distance < currentDistance)
                    this._detectedFrequency = harmonic
            }

            this.changed()
            yield Schedules.Frame
        }
    }

    destroy(): void {
        super.destroy()
        this._analyser.destroy()
    }

}