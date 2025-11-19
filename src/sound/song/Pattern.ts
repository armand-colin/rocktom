import type { String } from "../instrument/String"

export interface NoteEvent {
    time: number,
    duration: number,
    string: String,
    fret: number,
    slide?: {
        fret: number,
        duration: number,
        connect: boolean
    }
}

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

    constructor(name: string) {
        this._name = name
    }

    silence(ticks: number): this {
        this._time += ticks
        return this
    }

    note(string: String, fret: number, duration: number, slide?: { fret: number, duration: number, connect: boolean }): this {
        this._notes.push({
            time: this._time,
            duration: duration,
            fret: fret,
            string: string,
            slide: slide
        })

        this._time += duration
        return this
    }

    noteRepeat(string: String, fret: number, duration: number, times: number): this {
        for (let i = 0; i < times; i++) {
            this._notes.push({
                time: this._time + i * duration,
                duration: duration,
                fret: fret,
                string: string
            })
        }

        this._time += duration * times
        return this
    }

    build(): Pattern {
        return new Pattern(this._name, this._notes, this._time)
    }

}