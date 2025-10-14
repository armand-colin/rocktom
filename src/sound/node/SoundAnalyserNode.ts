import { Duration } from "@niloc/utils";
import { Time } from "../Time";
import { SoundNode } from "./SoundNode";

const FFT_SIZE = 16_384
const THRESHOLD = 0.5

function getPeakIndex(array: Float32Array, index: number): number {
    if (array[index + 1] < array[index]) {
        // TODO
        return index
    }

    for (let i = index + 1; i < array.length - 1; i++) {
        if (array[i + 1] < array[i]) {
            // We're at the right place, shall lerp
            const weightA = array[i] - array[i - 1]
            const weightB = array[i] - array[i + 1]
            const t = weightB / (weightA + weightB)
            return i + (t * 2 - 1)
        }
    }

    // TODO
    return index
}

export class SoundAnalyserNode extends SoundNode<AnalyserNode> {

    private _frequencies = new Float32Array(0)

    protected build(): AnalyserNode {
        const analyser = this.audioContext.createAnalyser()
        analyser.fftSize = FFT_SIZE
        analyser.smoothingTimeConstant = Duration.seconds(Time.audioInterval)
        return analyser
    }

    compute() {
        if (this._frequencies.length !== this.node.frequencyBinCount)
            this._frequencies = new Float32Array(this.node.frequencyBinCount)

        this.node.getFloatFrequencyData(this._frequencies)

        // Cleanup data
        for (let i = 0; i < this._frequencies.length; i++) {
            const raw = this._frequencies[i]
            const value = Math.max(Math.min(raw + 100, 100), 0) / 100
            this._frequencies[i] = value
        }
    }

    getLowestPeakFrequency(): number {
        for (let i = 0; i < this._frequencies.length; i++) {
            if (this._frequencies[i] > THRESHOLD) {
                const index = getPeakIndex(this._frequencies, i)
                const frequencyStep = this.node.context.sampleRate / (2.0 * this.node.frequencyBinCount)
                return (index + 0.5) * frequencyStep
            }
        }

        return 0
    }

}