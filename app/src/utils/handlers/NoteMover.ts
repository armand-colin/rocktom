import { Emitter } from "@niloc/utils";
import type { NoteTransform } from "../../components/editor/NoteTransform";
import { Note } from "../../sound/note/Note";
import type { Handler } from "./Handler";
import { Rules } from "../../3d/Rules";
import type { String } from "../../sound/instrument/String";

export class NoteMover implements Handler {

    readonly events = new Emitter<{ change: Note }>()

    private _startY: number
    private _startNote: Note
    private _transform: NoteTransform
    private _minNote: Note
    private _maxNote: Note

    constructor(opts: {
        event: MouseEvent,
        startNote: Note,
        string: String,
        transform: NoteTransform,
    }) {
        this._startY = opts.event.clientY
        this._startNote = opts.startNote
        this._transform = opts.transform
        this._minNote = opts.string.note
        this._maxNote = opts.string.fret(Rules.maxFret)

        window.addEventListener("mousemove", this._onMouseMove)
        window.addEventListener("mouseup", this._onMouseUp)
    }

    private _onMouseMove = (e: MouseEvent) => {
        e.preventDefault()

        const deltaY = e.clientY - this._startY
        const noteDelta = -deltaY / this._transform.ratio
        let newNoteIndex = Math.round(this._startNote.index + noteDelta)
        newNoteIndex = Math.max(this._minNote.index, Math.min(this._maxNote.index, newNoteIndex))
        const newNote = Note.fromIndex(newNoteIndex)

        this.events.emit("change", newNote)
    }   

    private _onMouseUp = (e: MouseEvent) => {
        e.preventDefault()
        this.destroy()
    }

    destroy() {
        window.removeEventListener("mousemove", this._onMouseMove)
        window.removeEventListener("mouseup", this._onMouseUp)   
    }

}