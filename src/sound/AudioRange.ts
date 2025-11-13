export interface AudioRange {
    silence: number,
    peak: number,
}

export const AudioRange = {
    default(): AudioRange {
        return {
            silence: -100,
            peak: -40,
        }
    }
}