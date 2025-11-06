import type { Engine } from "@niloc/ecs";
import { Duration } from "@niloc/utils";
import { Schedules } from "../../Schedules";
import { Time } from "../Time";
import { SoundNode } from "./SoundNode";

const FFT_SIZE = 16_384

function selfCorrelation(array: Float32Array, maximumIndex: number): number {
    let sum = 0
    let amplitudeSum = 0

    Object.assign(window, {
        snapshot: {
            index: maximumIndex,
            values: array.slice(maximumIndex - 2, maximumIndex + 3)
        }
    })
    for (let i = maximumIndex - 2; i <= maximumIndex + 2; i++) {
        if (i > 0 && i < array.length) {
            amplitudeSum += array[i]
            sum += i * array[i]
        }
    }

    if (amplitudeSum === 0)
        return maximumIndex

    return sum / amplitudeSum
}

function getPeakIndex(array: Float32Array, index: number): number {
    if (index === array.length - 1 || array[index] > array[index + 1])
        return selfCorrelation(array, index)

    // Find local maxima
    for (let i = index + 1; i < array.length - 1; i++) {
        if (array[i + 1] < array[i]) {
            return selfCorrelation(array, i)
        }
    }

    return selfCorrelation(array, array.length - 1)
}

export class SoundAnalyserNode extends SoundNode<AnalyserNode> {

    static THRESHOLD = 0.05

    private _frequencies = new Float32Array(0)

    constructor(engine: Engine, audioContext: AudioContext) {
        super(audioContext)
        this.node = this.build()
        engine.scheduler.add(this._computeCoroutine())
        Object.assign(window, { analyser: this })
    }

    get frequencyStep() {
        return this.audioContext.sampleRate / this.node.frequencyBinCount / 2
    }

    get frequencies() {
        return this._frequencies
    }

    protected build(): AnalyserNode {
        const analyser = this.audioContext.createAnalyser()
        analyser.fftSize = FFT_SIZE
        analyser.smoothingTimeConstant = Duration.seconds(Time.audioInterval)
        return analyser
    }

    rebuild(): void {
        this.node = this.build()
    }

    private *_computeCoroutine() {
        while (true) {
            this._compute()
            yield Schedules.AudioPreProcessingSchedule
        }
    }

    private _compute() {
        if (this._frequencies.length !== this.node.frequencyBinCount)
            this._frequencies = new Float32Array(this.node.frequencyBinCount)

        this.node.getFloatFrequencyData(this._frequencies)

        // Cleanup data
        for (let i = 0; i < this._frequencies.length; i++) {
            const raw = this._frequencies[i]
            const value = Math.max(Math.min(raw + 120, 100), 0) / 120
            this._frequencies[i] = value ** 2
        }
    }

    getLowestFrequency(): number {
        for (let i = 0; i < this._frequencies.length; i++) {
            if (this._frequencies[i] > SoundAnalyserNode.THRESHOLD) {
                const index = getPeakIndex(this._frequencies, i)
                const frequencyStep = this.node.context.sampleRate / (2.0 * this.node.frequencyBinCount)
                return index * frequencyStep
            }
        }

        return 0
    }

    getAllFrequencies(): number[] {
        // Shall detect all local maximas
        const minimas = []
        let upgoing = false

        for (let i = 1; i < this._frequencies.length; i++) {
            if (this._frequencies[i] <= SoundAnalyserNode.THRESHOLD) {
                upgoing = true
                continue
            }

            // We're on an upgoing ramp, keep building
            if (this._frequencies[i] < this._frequencies[i - 1] && upgoing) {
                minimas.push(i - 1)
                upgoing = false
            }

            if (this._frequencies[i] >= this._frequencies[i - 1]) {
                upgoing = true
            }
        }

        Object.assign(window, {
            indices: minimas,
            frequencies: minimas.map(index => this.frequencyStep * selfCorrelation(this._frequencies, index))
        })

        return minimas.map(index => this.frequencyStep * selfCorrelation(this._frequencies, index))
    }

    getVolume() {
        let max = 0
        for (let i = 0; i < this._frequencies.length; i++)
            max = Math.max(max, this._frequencies[i])

        return max
    }

}