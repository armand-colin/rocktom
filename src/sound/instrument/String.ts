import type { Color } from "three"
import { Rules } from "../../3d/Rules"
import { Note } from "../note/Note"

export class String {

    readonly index: number
    readonly t: number
    readonly name: string
    readonly note: Note
    readonly color: Color
    readonly highlightColor: Color
    readonly outlineColor: Color

    constructor(
        index: number,
        t: number,
        name: string,
        note: Note,
        color: Color,
        highlightColor: Color,
        outlineColor: Color
    ) {
        this.index = index
        this.t = t
        this.name = name
        this.note = note
        this.color = color
        this.highlightColor = highlightColor
        this.outlineColor = outlineColor
    }

    fret(fret: number): Note {
        return Note.fromIndex(this.note.index + fret)
    }

    canPlay(note: Note): boolean {
        return note.index >= this.note.index && this.note.index - note.index <= Rules.maxFret
    }

}