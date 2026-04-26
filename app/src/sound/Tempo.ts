export type SerializedTempo = {
    bpm: number
}

export class Tempo {

    public static PPQ = 96

    private _microsecondsPerBeat: number
    readonly bpm: number

    static bars(beats: number): number {
        return beats * 4 * Tempo.PPQ
    }

    static beats(beats: number) {
        return beats * Tempo.PPQ
    }

    static ticksFromQuarterNote(beats: number) {
        return beats * Tempo.PPQ
    }

    static fromTicksPerSecond(ticksPerSecond: number): Tempo {
        const beatsPerSecond = ticksPerSecond / Tempo.PPQ
        const bpm = beatsPerSecond * 60
        return new Tempo(bpm)
    }

    constructor(bpm: number) {
        this.bpm = bpm
        this._microsecondsPerBeat = 60_000_000 / bpm
    }

    secondsFromTicks(ticks: number) {
        const beats = ticks / Tempo.PPQ
        const microseconds = beats * this._microsecondsPerBeat
        return microseconds / 1_000_000
    }

    ticksFromSeconds(seconds: number) {
        const beat = (seconds * 1_000_000) / this._microsecondsPerBeat
        return (beat * Tempo.PPQ) | 0
    }

    serialize(): SerializedTempo {
        return {
            bpm: this.bpm
        }
    }

    static deserialize(data: SerializedTempo): Tempo {
        return new Tempo(data.bpm)
    }

}