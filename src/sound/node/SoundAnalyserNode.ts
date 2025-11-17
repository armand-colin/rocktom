import type { Engine } from "@niloc/ecs";
import { Coroutine, Duration } from "@niloc/utils";
import { Schedules } from "../../Schedules";
import type { AudioRange } from "../AudioRange";
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

    return sum / amplitudeSum + 0.25
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

    static THRESHOLD = 0.3

    private _rawFrequencies = new Float32Array(0)
    private _frequencies = new Float32Array(0)
    private _coroutine: Coroutine
    private _range: AudioRange

    constructor(engine: Engine, audioContext: AudioContext, range: AudioRange) {
        super(audioContext)
        this.node = this.build()
        this._range = range
        this._coroutine = engine.scheduler.add(this._computeCoroutine())
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

    destroy() {
        this.disconnect()
        this._coroutine.cancel()
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
        if (this._frequencies.length !== this.node.frequencyBinCount) {
            this._frequencies = new Float32Array(this.node.frequencyBinCount)
            this._rawFrequencies = new Float32Array(this.node.frequencyBinCount)
        }

        this.node.getFloatFrequencyData(this._rawFrequencies)
        this._frequencies.set(this._rawFrequencies)

        // Map frequecies to 0 - 1 based on audio range
        const minDb = this._range.silence
        const maxDb = this._range.peak
        for (let i = 0; i < this._frequencies.length; i++) {
            this._frequencies[i] = (this._frequencies[i] - minDb) / (maxDb - minDb)
            this._frequencies[i] = Math.min(Math.max(this._frequencies[i], 0), 1)
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

    getAllFrequencies(): { frequency: number, amplitude: number }[] {
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

        return minimas.map(index => {
            return {
                frequency: this.frequencyStep * selfCorrelation(this._frequencies, index),
                amplitude: this._frequencies[index]
            }
        })
    }

    getStrongestFrequency(): number {
        const allFrequencies = this.getAllFrequencies()
        if (allFrequencies.length === 0) 
            return 0

        allFrequencies.sort((a, b) => b.amplitude - a.amplitude)

        return allFrequencies[0].frequency
    }

    getVolume() {
        let max = -Infinity
        for (let i = 0; i < this._frequencies.length; i++)
            max = Math.max(max, this._frequencies[i])

        return max
    }

}