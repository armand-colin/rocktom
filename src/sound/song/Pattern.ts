import type { String } from "../instrument/String"

interface Note {
    time: number,
    duration: number,
    string: String,
    fret: number,
}

export class Pattern {

    readonly name: string
    readonly notes: Note[]
    readonly duration: number

    constructor(name: string, notes: Note[], duration: number) {
        this.name = name
        this.notes = notes
        this.duration = duration
    }

}


export class PatternBuilder {

    private _notes: Note[] = []
    private _time: number = 0
    private _name: string

    constructor(name: string) {
        this._name = name
    }

    silence(ticks: number): this {
        this._time += ticks
        return this
    }

    note(string: String, fret: number, duration: number): this {
        this._notes.push({
            time: this._time,
            duration: duration,
            fret: fret,
            string: string
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