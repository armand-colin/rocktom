const PPQ = 96
export class Tempo {

    private _microsecondsPerBeat: number
    readonly bpm: number

    constructor(bpm: number) {
        this.bpm = bpm
        this._microsecondsPerBeat = 60_000_000 / bpm
    }

    secondsFromTicks(ticks: number) {
        const beats = ticks / PPQ
        const microseconds = beats * this._microsecondsPerBeat
        return microseconds / 1_000_000
    }
    
    ticksFromSeconds(seconds: number) {
        const beat = (seconds * 1_000_000) / this._microsecondsPerBeat
        return (beat * PPQ) | 0
    }

    ticksFromBeats(beats: number) {
        return beats * PPQ
    }


}