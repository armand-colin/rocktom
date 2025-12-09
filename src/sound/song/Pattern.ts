import { nanoid } from "nanoid"
import { Instrument, type InstrumentType } from "../instrument/Instrument"
import type { String } from "../instrument/String"
import { NoteEvent, type NoteSlide, type SerializedNoteEvent } from "./NoteEvent"

export type SerializedTimedPattern = {
    id: string,
    time: number,
    patternId: string,
    duration: number
}

export class TimedPattern {

    readonly id: string
    time: number
    pattern: Pattern
    duration: number

    constructor(opts: {
        id?: string,
        time: number,
        pattern: Pattern,
        duration?: number
    }) {
        this.id = opts.id ?? nanoid()
        this.time = opts.time
        this.pattern = opts.pattern
        this.duration = opts.duration ?? this.pattern.duration
    }

    serialize(): SerializedTimedPattern {
        return {
            id: this.id,
            time: this.time,
            patternId: this.pattern.id,
            duration: this.duration
        }
    }

    static deserialize(data: SerializedTimedPattern, patterns: Map<string, Pattern>): TimedPattern {
        const pattern = patterns.get(data.patternId)
        if (!pattern)
            throw new Error(`Pattern with ID ${data.patternId} not found during TimedPattern deserialization`)

        return new TimedPattern({
            id: data.id,
            time: data.time,
            pattern: pattern,
            duration: data.duration
        })
    }

}

export type SerializedPattern = {
    id: string,
    name: string,
    notes: SerializedNoteEvent[],
    instrument: InstrumentType,
}

export class Pattern {

    readonly id: string
    readonly name: string
    readonly notes: NoteEvent[]
    readonly instrument: Instrument

    constructor(opts: { name: string, instrument: Instrument, notes: NoteEvent[], id?: string }) {
        this.id = opts.id ?? nanoid()
        this.name = opts.name
        this.notes = opts.notes
        this.instrument = opts.instrument
    }

    get duration() {
        if (this.notes.length === 0)
            return 0

        const lastNote = this.notes[this.notes.length - 1]
        return lastNote.time + lastNote.duration
    }

    remove(noteId: string) {
        const index = this.notes.findIndex(n => n.id === noteId)
        if (index === -1)
            return false

        this.notes.splice(index, 1)
        return true
    }

    add(note: NoteEvent) {
        // Sorted insert
        for (let i = 0; i < this.notes.length; i++) {
            if (this.notes[i].time > note.time) {
                this.notes.splice(i, 0, note)
                return
            }
        }
        this.notes.push(note)
    }

    serialize(): SerializedPattern {
        return {
            id: this.id,
            name: this.name,
            notes: this.notes.map(n => NoteEvent.serialize(n)),
            instrument: this.instrument.type
        }
    }

    static deserialize(data: SerializedPattern): Pattern {
        return new Pattern({
            id: data.id,
            name: data.name,
            instrument: Instrument.fromType(data.instrument),
            notes: data.notes.map(n => NoteEvent.deserialize(n, Instrument.fromType(data.instrument))),
        })
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
        })
    }

}