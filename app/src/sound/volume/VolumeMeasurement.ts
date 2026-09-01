import type { AudioRange } from "../AudioRange"

export namespace VolumeMeasurement {

    export function measure(samples: Float32Array, range: AudioRange): number {
        if (samples.length === 0)
            return 0

        const span = range.peak - range.silence
        if (span <= 0)
            return 0

        const rms = _rms(samples)
        if (rms <= 0)
            return 0

        const db = 20 * Math.log10(rms)
        return Math.min(Math.max((db - range.silence) / span, 0), 1)
    }

    function _rms(samples: Float32Array): number {
        let sum = 0
        for (let i = 0; i < samples.length; i++)
            sum += samples[i] * samples[i]

        return Math.sqrt(sum / samples.length)
    }

}
