export type PitchDetection = {
    frequency: number
    clarity: number
}

const SMALL_CUTOFF = 0.5
const RMS_THRESHOLD = 0.005

/**
 * McLeod Pitch Method (NSDF). Better behaved than FFT peak-picking on bass,
 * where the fundamental is often weaker than the 2nd/3rd partial.
 */
export class McLeodPitchDetector {

    static readonly BUFFER_SIZE = 8192
    static readonly CUTOFF = 0.93

    private readonly _bufferSize: number
    private readonly _nsdf: Float32Array
    private readonly _window: Float32Array

    constructor(bufferSize: number = McLeodPitchDetector.BUFFER_SIZE) {
        this._bufferSize = bufferSize
        this._nsdf = new Float32Array(bufferSize)
        this._window = new Float32Array(bufferSize)
    }

    findPitch(
        samples: Float32Array,
        sampleRate: number,
        minFrequency: number,
        maxFrequency: number,
        cutoff: number = McLeodPitchDetector.CUTOFF
    ): PitchDetection | null {
        const window = this._fillWindow(samples)
        const n = window.length
        if (n < 4)
            return null

        if (this._rms(window) < RMS_THRESHOLD)
            return null

        const tauMin = Math.max(2, Math.floor(sampleRate / maxFrequency))
        const tauMax = Math.min(Math.floor(n / 2) - 1, Math.floor(sampleRate / minFrequency))
        if (tauMin >= tauMax)
            return null

        this._computeNsdf(window, tauMin, tauMax)

        const peaks = this._pickPeaks(tauMin, tauMax)
        if (peaks.length === 0)
            return null

        let highest = -Infinity
        const estimates: { tau: number, y: number }[] = []
        for (const tau of peaks) {
            if (this._nsdf[tau] < SMALL_CUTOFF)
                continue

            const estimate = this._interpolate(tau, tauMin, tauMax)
            estimates.push(estimate)
            if (estimate.y > highest)
                highest = estimate.y
        }

        if (estimates.length === 0 || highest <= 0)
            return null

        const actualCutoff = cutoff * highest
        const chosen = estimates.find(estimate => estimate.y >= actualCutoff)
        if (!chosen)
            return null

        return {
            frequency: sampleRate / chosen.tau,
            clarity: chosen.y
        }
    }

    private _fillWindow(samples: Float32Array): Float32Array {
        const size = this._bufferSize
        if (samples.length >= size) {
            this._window.set(samples.subarray(samples.length - size))
            return this._window
        }

        return samples
    }

    private _rms(samples: Float32Array): number {
        let sum = 0
        for (let i = 0; i < samples.length; i++)
            sum += samples[i] * samples[i]

        return Math.sqrt(sum / samples.length)
    }

    private _computeNsdf(samples: Float32Array, tauMin: number, tauMax: number) {
        const n = samples.length
        const nsdf = this._nsdf

        for (let tau = tauMin; tau <= tauMax; tau++) {
            let acf = 0
            let m = 0
            const limit = n - tau
            for (let i = 0; i < limit; i++) {
                const a = samples[i]
                const b = samples[i + tau]
                acf += a * b
                m += a * a + b * b
            }
            nsdf[tau] = m > 0 ? (2 * acf) / m : 0
        }
    }

    private _pickPeaks(tauMin: number, tauMax: number): number[] {
        const nsdf = this._nsdf
        const peaks: number[] = []

        for (let tau = tauMin + 1; tau < tauMax; tau++) {
            if (nsdf[tau] > nsdf[tau - 1] && nsdf[tau] >= nsdf[tau + 1] && nsdf[tau] > 0)
                peaks.push(tau)
        }

        return peaks
    }

    private _interpolate(tau: number, tauMin: number, tauMax: number): { tau: number, y: number } {
        if (tau <= tauMin || tau >= tauMax)
            return { tau, y: this._nsdf[tau] }

        const a = this._nsdf[tau - 1]
        const b = this._nsdf[tau]
        const c = this._nsdf[tau + 1]
        const bottom = c + a - 2 * b
        if (bottom === 0)
            return { tau, y: b }

        const delta = a - c
        return {
            tau: tau + delta / (2 * bottom),
            y: b - (delta * delta) / (8 * bottom)
        }
    }

}
