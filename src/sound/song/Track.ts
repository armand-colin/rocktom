import type { Instrument } from "../instrument/Instrument";
import { LinearizedTrack } from "../LinearizedTrack";
import { Tempo } from "../Tempo";
import type { FocusTrackBuilder } from "./FocusTrack";
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

    get time() {
        return this._time
    }

    pattern(pattern: Pattern): this {
        console.log("Adding pattern", pattern.name, "which spans", pattern.duration / Tempo.PPQ, "quarter notes")

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

    addFocus(focus: [number, number], track: FocusTrackBuilder, duration: number, forward: boolean = false): this {
        if (forward) {
            track.add(this._time, duration, focus)
        } else {
            track.add(this._time - duration, duration, focus)
        }

        return this
    }

    linearize(): LinearizedTrack {
        const notes = []

        for (const timedPattern of this._patterns) {
            for (const note of timedPattern.pattern.notes) {
                notes.push({
                    time: note.time + timedPattern.time,
                    duration: note.duration,
                    string: note.string,
                    fret: note.fret,
                    slide: note.slide,
                    fingerPosition: note.fingerPosition
                })
            }
        }

        return new LinearizedTrack(notes)
    }

}