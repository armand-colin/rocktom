import { Note } from "../note/Note"

export class String {

    readonly index: number
    readonly name: string
    readonly note: Note

    constructor(index: number, name: string, note: Note) {
        this.index = index
        this.name = name
        this.note = note
    }

    fret(fret: number): Note {
        return Note.fromIndex(this.note.index + fret)
    }

}