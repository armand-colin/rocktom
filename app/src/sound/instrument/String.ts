import type { Color } from "three"
import { AtlasPalette } from "../../3d/AtlasPalette"
import { Rules } from "../../3d/Rules"
import { Note } from "../note/Note"
import type { TextureColorIndex } from "../../3d/TextureAtlas"

export class String {

    readonly index: number
    readonly t: number
    readonly name: string
    readonly note: Note
    readonly colorIndex: TextureColorIndex
    readonly color: Color
    readonly highlightColor: Color
    readonly outlineColor: Color

    constructor(
        index: number,
        t: number,
        name: string,
        note: Note,
        highlightColor: Color,
        outlineColor: Color
    ) {
        this.index = index
        this.t = t
        this.name = name
        this.note = note
        this.colorIndex = index as TextureColorIndex
        this.color = AtlasPalette.color(this.colorIndex).clone()
        this.highlightColor = highlightColor
        this.outlineColor = outlineColor
    }

    fret(fret: number): Note {
        return Note.fromIndex(this.note.index + fret)
    }

    canPlay(note: Note): boolean {
        return note.index >= this.note.index &&
            (note.index - this.note.index) <= Rules.maxFret
    }

}
