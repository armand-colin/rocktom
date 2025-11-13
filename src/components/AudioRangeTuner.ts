import { Component, Engine } from "@niloc/ecs";
import { SoundEngine } from "../resources/SoundEngine";
import { Schedules } from "../Schedules";
import { AudioRange } from "../sound/AudioRange";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import type { LiveInstrument } from "./LiveInstrument";

export enum AudioRangeTunerMode {
    Silence,
    Peak,
    None
}

export class AudioRangeTuner extends Component {

    private _instrument: LiveInstrument
    private _analyser: SoundAnalyserNode
    private _mode: AudioRangeTunerMode = AudioRangeTunerMode.None

    private _samples: number[] = []
    private _average: number = 0
    private _analyserRange = AudioRange.default()

    private _range: AudioRange = {
        silence: 0,
        peak: Infinity,
    }

    constructor(engine: Engine, instrument: LiveInstrument) {
        super(engine)
        this._instrument = instrument
        const soundEngine = engine.getResource(SoundEngine)

        this._analyser = soundEngine.createAnalyserNode(this._analyserRange)
        this._instrument.rawOutput.connect(this._analyser)
        this.startCoroutine(this._update())
    }

    get mode() {
        return this._mode
    }

    set mode(value: AudioRangeTunerMode) {
        this._mode = value
        this._samples = []
        this._average = 0
        this.changed()
    }

    get volume() {
        switch (this._mode) {
            case AudioRangeTunerMode.Silence:
                return this._average
            case AudioRangeTunerMode.Peak:
                return this._average
            default:
                return 0
        }
    }

    get frequencies() {
        return this._analyser.frequencies.slice(0, 256)
    }

    save() {
        this._instrument.range = { ...this._range }
    }

    private *_update() {
        while (true) {
            switch (this._mode) {
                case AudioRangeTunerMode.Silence: {
                    this._udpateSilenceRange()
                    break
                }
                case AudioRangeTunerMode.Peak: {
                    this._updatePeakRange()
                    break
                }
            }
            yield Schedules.AudioProcessingSchedule
        }
    }

    private _updateVolume() {
        const volume = this._analyser.getVolume()

        this._samples.push(volume)

        if (this._samples.length > 100) {
            this._samples.shift()
        }

        this._average = this._samples.reduce((a, b) => a + b, 0) / this._samples.length
    }

    private _udpateSilenceRange() {
        this._updateVolume()
        const decibels = (this._analyserRange.peak - this._analyserRange.silence) * this._average + this._analyserRange.silence
        this._range.silence = decibels
        this.changed()
    }

    private _updatePeakRange() {
        this._updateVolume()
        const decibels = (this._analyserRange.peak - this._analyserRange.silence) * this._average + this._analyserRange.silence
        this._range.peak = decibels
        this.changed()
    }

    destroy() {
        super.destroy()
        this._analyser.destroy()
    }

}