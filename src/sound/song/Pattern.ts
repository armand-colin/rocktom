import type { String } from "../instrument/String"
import type { NoteEvent } from "./NoteEvent"

export class Pattern {

    readonly name: string
    readonly notes: NoteEvent[]
    readonly duration: number

    constructor(name: string, notes: NoteEvent[], duration: number) {
        this.name = name
        this.notes = notes
        this.duration = duration
    }

}


export class PatternBuilder {

    private _notes: NoteEvent[] = []
    private _time: number = 0
    private _name: string
    private _fingerPosition: number | null = null

    constructor(name: string) {
        this._name = name
    }

    fingerPosition(position: number): this {
        this._fingerPosition = position
        return this
    }
    
    silence(ticks: number): this {
        this._time += ticks
        return this
    }

    note(string: String, fret: number, duration: number, slide?: { fret: number, duration: number, connect: boolean }, offset?: number): this {
        this._notes.push({
            time: this._time,
            duration: duration,
            fret: fret,
            string: string,
            slide: slide ?? null,
            fingerPosition: this._fingerPosition ?? fret
        })

        this._time += duration

        if (offset)
            this._time += offset

        return this
    }

    noteRepeat(string: String, fret: number, duration: number, times: number, offset?: number): this {
        for (let i = 0; i < times; i++) {
            this._notes.push({
                time: this._time,
                duration: duration,
                fret: fret,
                string: string,
                fingerPosition: this._fingerPosition ?? fret,
                slide: null
            })

            this._time += duration
            if (offset)
                this._time += offset
        }

        return this
    }

    build(): Pattern {
        return new Pattern(this._name, this._notes, this._time)
    }

}