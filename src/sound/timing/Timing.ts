const MICROSECONDS_PER_MINUTE = 60_000_000

export class Timing {

    private _microsecondsPerBeat: number
    private _ticksPerBeat: number

    constructor(bpm: number, ticksPerBeat: number) {
        this._ticksPerBeat = ticksPerBeat
        this._microsecondsPerBeat = MICROSECONDS_PER_MINUTE / bpm
    }

    seconds(seconds: number) {
        const beat = (seconds * 1_000_000) / this._microsecondsPerBeat
        return (beat * this._ticksPerBeat) | 0
    }

    beats(beats: number) {
        return beats * this._ticksPerBeat
    }

    get ticksPerSecond() {
        return this._ticksPerBeat * 1_000_000 / this._microsecondsPerBeat
    }
}