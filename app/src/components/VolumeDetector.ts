import { Component, Engine } from "@niloc/ecs"
import { SoundEngine } from "../resources/SoundEngine"
import { Schedules } from "../Schedules"
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode"
import { VolumeMeasurement } from "../sound/volume/VolumeMeasurement"
import type { LiveInstrument } from "./LiveInstrument"

export type VolumeDetectorOptions = {
    attackMs?: number
    releaseMs?: number
}

const DEFAULT_ATTACK_MS = 10
const DEFAULT_RELEASE_MS = 150

export class VolumeDetector extends Component {

    private _instrument: LiveInstrument
    private _analyser: SoundAnalyserNode
    private readonly _attackMs: number
    private readonly _releaseMs: number

    private _envelope = 0
    private _volume = 0

    constructor(engine: Engine, instrument: LiveInstrument, options: VolumeDetectorOptions = {}) {
        super(engine)
        this._instrument = instrument
        this._attackMs = options.attackMs ?? DEFAULT_ATTACK_MS
        this._releaseMs = options.releaseMs ?? DEFAULT_RELEASE_MS
        this._analyser = engine.getResource(SoundEngine).createAnalyserNode(instrument.range)
        instrument.rawOutput.connect(this._analyser)
        this.startCoroutine(this._update())
    }

    get volume() {
        return this._volume
    }

    reset() {
        this._envelope = 0
        this._volume = 0
        this.changed()
    }

    private *_update() {
        let lastUpdate = performance.now()

        while (true) {
            const now = performance.now()
            const deltaTimeSeconds = (now - lastUpdate) / 1000
            lastUpdate = now

            const instant = VolumeMeasurement.measure(
                this._analyser.getTimeDomainData(),
                this._instrument.range
            )
            this._envelope = this._smooth(instant, deltaTimeSeconds)
            this._volume = this._envelope
            this.changed()
            yield Schedules.Frame
        }
    }

    private _smooth(target: number, deltaTimeSeconds: number): number {
        const smoothingMs = target > this._envelope ? this._attackMs : this._releaseMs

        if (smoothingMs <= 0 || deltaTimeSeconds <= 0)
            return target

        const coefficient = 1 - Math.exp(-deltaTimeSeconds * 1000 / smoothingMs)
        return this._envelope + (target - this._envelope) * coefficient
    }

    destroy(): void {
        super.destroy()
        this._analyser.destroy()
    }

}
