import { nanoid } from "nanoid"
import type { Instrument } from "../instrument/Instrument"
import type { String } from "../instrument/String"
import { NoteEvent, type NoteSlide } from "./NoteEvent"

export class TimedPattern {

    readonly id: string
    time: number
    pattern: Pattern

    constructor(opts: { id?: string, time: number, pattern: Pattern }) {
        this.id = opts.id ?? nanoid()
        this.time = opts.time
        this.pattern = opts.pattern
    }
}

export class Pattern {

    readonly id: string
    readonly name: string
    readonly notes: NoteEvent[]
    readonly duration: number
    readonly instrument: Instrument

    constructor(opts: { name: string, instrument: Instrument, notes: NoteEvent[], duration: number, id?: string }) {
        this.id = opts.id ?? nanoid()
        this.name = opts.name
        this.notes = opts.notes
        this.duration = opts.duration
        this.instrument = opts.instrument
    }

    remove(noteId: string) {
        const index = this.notes.findIndex(n => n.id === noteId)
        if (index === -1)
            return false

        this.notes.splice(index, 1)
        return true
    }

}

export class PatternBuilder {

    private _notes: NoteEvent[] = []
    private _time: number = 0
    private _name: string
    private _fingerPosition: number | null = null
    private _instrument: Instrument

    constructor(name: string, instrument: Instrument) {
        this._name = name
        this._instrument = instrument
    }

    fingerPosition(position: number): this {
        this._fingerPosition = position
        return this
    }

    silence(ticks: number): this {
        this._time += ticks
        return this
    }

    note(string: String, fret: number, duration: number, slide?: NoteSlide, offset?: number): this {
        this._notes.push(NoteEvent.create({
            time: this._time,
            duration: duration,
            fret: fret,
            string: string,
            slide: slide,
            fingerPosition: this._fingerPosition ?? fret
        }))

        this._time += duration

        if (offset)
            this._time += offset

        return this
    }

    noteRepeat(string: String, fret: number, duration: number, times: number, offset?: number): this {
        for (let i = 0; i < times; i++) {
            this._notes.push(NoteEvent.create({
                time: this._time,
                duration: duration,
                fret: fret,
                string: string,
                fingerPosition: this._fingerPosition ?? fret,
                slide: null
            }))

            this._time += duration
            if (offset)
                this._time += offset
        }

        return this
    }

    build(): Pattern {
        return new Pattern({
            instrument: this._instrument,
            name: this._name,
            notes: this._notes,
            duration: this._time
        })
    }

}