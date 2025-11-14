export interface AudioRange {
    silence: number,
    peak: number,
}

export const AudioRange = {
    default(): AudioRange {
        return {
            silence: -120,
            peak: 0,
        }
    }
}