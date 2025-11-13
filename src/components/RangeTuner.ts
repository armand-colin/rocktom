import { Component, Engine } from "@niloc/ecs";
import type { Coroutine } from "@niloc/utils";
import { SoundEngine } from "../resources/SoundEngine";
import { Schedules } from "../Schedules";
import type { AudioRange } from "../sound/AudioRange";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import type { LiveInstrument } from "./LiveInstrument";

export enum RangeTunerMode {
    Silence,
    Peak,
    None
}

export class RangeTuner extends Component {

    private _instrument: LiveInstrument
    private _analyser: SoundAnalyserNode
    private _mode: RangeTunerMode = RangeTunerMode.None
    private _updateCoroutine: Coroutine

    private _samples: number[] = []
    private _average: number = 0

    private _range: AudioRange = {
        silence: 0,
        peak: Infinity,
    }

    constructor(engine: Engine, instrument: LiveInstrument) {
        super(engine)
        this._instrument = instrument
        const soundEngine = engine.getResource(SoundEngine)

        this._analyser = soundEngine.createAnalyserNode()
        this._instrument.rawOutput.connect(this._analyser)
        this._updateCoroutine = engine.scheduler.add(this._update())
    }

    get mode() {
        return this._mode
    }

    set mode(value: RangeTunerMode) {
        this._mode = value
        this._samples = []
        this._average = 0
        this.changed()
    }

    get volume() {
        switch (this._mode) {
            case RangeTunerMode.Silence:
                return this._range.silence
            case RangeTunerMode.Peak:
                return this._range.peak
            default:
                return 0
        }
    }

    save() {
        this._instrument.range = { ...this._range }
    }

    private *_update() {
        while (true) {
            switch (this._mode) {
                case RangeTunerMode.Silence: {
                    this._udpateSilenceRange()
                    break
                }
                case RangeTunerMode.Peak: {
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
        this._range.silence = this._average
        this.changed()
    }

    private _updatePeakRange() {
        this._updateVolume()
        this._range.peak = this._average
        this.changed()
    }

    destroy() {
        this._updateCoroutine.cancel()
        this._analyser.destroy()
    }

}