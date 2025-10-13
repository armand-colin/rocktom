import type { SoundAnalyserNode } from "./node/SoundAnalyserNode";

const THRESHOLD = -80

type Slope = {
    index: number,
    window: number[],
    indices: number[]
}
function getSlopePeak(frequencies: Float32Array, startIndex: number): Slope {
    if (startIndex === frequencies.length - 1)
        return {
            index: startIndex,
            window: [],
            indices: []
        }

    for (let i = startIndex + 1; i < frequencies.length - 1; i++) {
        if (frequencies[i + 1] < frequencies[i]) {
            // We are on peak, interpolate indices
            const beforeSlope = frequencies[i] - frequencies[i - 1]
            const afterSlope = frequencies[i] - frequencies[i + 1]
            const t = beforeSlope / (beforeSlope + afterSlope)
            return {
                index: i + (t * 2 - 1),
                window: [frequencies[i - 1], frequencies[i], frequencies[i + 1]],
                indices: [i - 1, i, i + 1]
            }
        }

        return {
            index: startIndex,
            window: [],
            indices: []
        }
    }
}

export class PitchDetector {

    private _analyser: SoundAnalyserNode
    private _frequency: number = 0
    private _slope: Slope | null = null

    constructor(analyser: SoundAnalyserNode) {
        this._analyser = analyser
        // @ts-ignore
        window["pitch"] = this
    }

    update() {
        this._analyser.compute()
        const frequencies = this._analyser.frequencies
        const frequencyStep = this._analyser.sampleRate * 0.5 / frequencies.length

        let maxFrequencyIndex = 0
        for (let i = 0; i < frequencies.length; i++) {
            if (frequencies[i] > frequencies[maxFrequencyIndex])
                maxFrequencyIndex = i
        }

        for (let i = 0; i < frequencies.length; i++) {
            if (frequencies[i] > THRESHOLD) {
                // Shall find center of slope
                const slope = getSlopePeak(frequencies, i)
                const frequency = frequencyStep * (slope.index + .0)
                this._slope = slope
                this._frequency = frequency
                return
            }
        }
    }

    get frequency() {
        return this._frequency
    }

}