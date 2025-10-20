import type { Instrument } from "../instrument/Instrument";
import type { LinearizedTrack } from "../LinearizedTrack";
import type { Pattern } from "./Pattern";

type TimedPattern = {
    time: number,
    pattern: Pattern
}

export class Track {

    readonly instrument: Instrument
    readonly patterns: { time: number, pattern: Pattern }[] = []

    constructor(instrument: Instrument, patterns: TimedPattern[]) {
        this.instrument = instrument
        this.patterns = patterns
    }

}

export class TrackBuilder {

    private _time: number = 0
    private _patterns: { time: number, pattern: Pattern }[] = []
    private _instrument: Instrument

    constructor(instrument: Instrument) {
        this._instrument = instrument
    }

    silence(ticks: number): this {
        this._time += ticks
        return this
    }

    pattern(pattern: Pattern): this {
        this._patterns.push({
            time: this._time,
            pattern: pattern
        })

        this._time += pattern.duration
        return this
    }

    build(): Track {
        return new Track(this._instrument, this._patterns)
    }

    linearize(): LinearizedTrack {
        const notes = []

        for (const timedPattern of this._patterns) {
            for (const note of timedPattern.pattern.notes) {
                notes.push({
                    time: note.time + timedPattern.time,
                    duration: note.duration,
                    string: note.string,
                    fret: note.fret
                })
            }
        }

        return new LinearizedTrack(notes)
    }

}