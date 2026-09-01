import { Component, Engine } from "@niloc/ecs";
import { SoundEngine } from "../resources/SoundEngine";
import { Schedules } from "../Schedules";
import { McLeodPitchDetector } from "../sound/pitch/McLeodPitchDetector";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import type { LiveInstrument } from "./LiveInstrument";
import type { String } from "../sound/instrument/String";

const BASS_MIN_FREQUENCY = 30
const BASS_MAX_FREQUENCY = 250
const TARGET_SEMITONE_WINDOW = 4
const CLARITY_THRESHOLD = 0.85
const SMOOTH_ALPHA = 0.35
const SNAP_SEMITONES = 1

export class Tuner extends Component {

    private _analyser: SoundAnalyserNode
    private _detector = new McLeodPitchDetector()
    private _detectedFrequency: number = 0
    private _clarity: number = 0
    private _locked: boolean = false
    private _targetString: String | null = null

    constructor(engine: Engine, instrument: LiveInstrument) {
        super(engine)
        this._analyser = engine.getResource(SoundEngine).createAnalyserNode(instrument.range)
        instrument.rawOutput.connect(this._analyser)
        this._targetString = instrument.instrument.lowestString
        this.startCoroutine(this._update())
        Object.assign(window, { tuner: this })
    }

    get detectedFrequency() {
        return this._detectedFrequency
    }

    get clarity() {
        return this._clarity
    }

    get locked() {
        return this._locked
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
            this._detect()
            this.changed()
            yield Schedules.Frame
        }
    }

    private _detect() {
        const { minFrequency, maxFrequency } = this._searchRange()
        const result = this._detector.findPitch(
            this._analyser.getTimeDomainData(),
            this._analyser.sampleRate,
            minFrequency,
            maxFrequency
        )

        if (!result || result.clarity < CLARITY_THRESHOLD) {
            this._clarity = result?.clarity ?? 0
            this._locked = false
            return
        }

        this._clarity = result.clarity
        this._locked = true
        this._detectedFrequency = this._smooth(result.frequency)
    }

    private _searchRange() {
        const targetFrequency = this._targetString?.note.frequency
        if (!targetFrequency) {
            return {
                minFrequency: BASS_MIN_FREQUENCY,
                maxFrequency: BASS_MAX_FREQUENCY
            }
        }

        const ratio = 2 ** (TARGET_SEMITONE_WINDOW / 12)
        return {
            minFrequency: Math.max(BASS_MIN_FREQUENCY, targetFrequency / ratio),
            maxFrequency: Math.min(BASS_MAX_FREQUENCY, targetFrequency * ratio)
        }
    }

    private _smooth(frequency: number) {
        if (this._detectedFrequency <= 0)
            return frequency

        const semitoneDelta = Math.abs(12 * Math.log2(frequency / this._detectedFrequency))
        if (semitoneDelta >= SNAP_SEMITONES)
            return frequency

        const mixed = (1 - SMOOTH_ALPHA) * Math.log2(this._detectedFrequency) + SMOOTH_ALPHA * Math.log2(frequency)
        return 2 ** mixed
    }

    destroy(): void {
        super.destroy()
        this._analyser.destroy()
    }

}
