import { nanoid } from "nanoid";
import type { Instrument } from "../instrument/Instrument";
import { Tempo } from "../Tempo";
import type { FocusTrackBuilder } from "./FocusTrack";
import type { Marker } from "./Marker";
import type { Pattern } from "./Pattern";
import type { TempoTrack } from "./TempoTrack";

type TimedPattern = {
    time: number,
    pattern: Pattern
}

export class NoteTrack {

    readonly instrument: Instrument
    readonly patterns: { time: number, pattern: Pattern }[] = []
    readonly markers: Marker[] = []

    constructor(
        instrument: Instrument, 
        patterns: TimedPattern[],
        markers: Marker[]
    ) {
        this.instrument = instrument
        this.patterns = patterns
        this.markers = markers
    }

    get lastNote() {
        const lastPattern = this.patterns[this.patterns.length - 1]
        if (!lastPattern)
            return null

        const lastNoteInPattern = lastPattern.pattern.notes[lastPattern.pattern.notes.length - 1]
        if (!lastNoteInPattern)
            return null

        return {
            ...lastNoteInPattern,
            time: lastNoteInPattern.time + lastPattern.time
        }
    }

    *notes() {
        for (const { time, pattern} of this.patterns) {
            for (const note of pattern.notes) {
                yield {
                    ...note,
                    time: note.time + time
                }
            }
        }
    }

}

export class NoteTrackBuilder {

    private _time: number = 0
    private _patterns: { time: number, pattern: Pattern }[] = []
    private _instrument: Instrument
    private _markers: Marker[] = []

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
        this._patterns.push({
            time: this._time,
            pattern: pattern
        })

        this._time += pattern.duration
        return this
    }

    build(): NoteTrack {
        return new NoteTrack(
            this._instrument, 
            this._patterns,
            this._markers
        )
    }

    marker(name: string): this {
        this._markers.push({
            id: nanoid(),
            time: this._time,
            name: name
        })
        return this
    }

    addFocus(focus: [number, number], track: FocusTrackBuilder, duration: number, forward: boolean = false): this {
        if (forward) {
            track.add(this._time, duration, focus)
        } else {
            track.add(this._time - duration, duration, focus)
        }

        return this
    }

    addTempo(tempo: Tempo, tempoTrack: TempoTrack): this {
        tempoTrack.add(this._time, tempo)
        return this
    } 

}