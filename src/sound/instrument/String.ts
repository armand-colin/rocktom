import { Note } from "../note/Note"
import type { Color } from "three"

export class String {

    readonly index: number
    readonly name: string
    readonly note: Note
    readonly color: Color
    
    constructor(index: number, name: string, note: Note, color: Color) {
        this.index = index
        this.name = name
        this.note = note
        this.color = color
    }

    fret(fret: number): Note {
        return Note.fromIndex(this.note.index + fret)
    }

}