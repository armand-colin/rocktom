import { Component, Engine } from "@niloc/ecs";
import { OS } from "../../utils/OS";
import type { Instrument } from "../../sound/instrument/Instrument";
import { Rules } from "../../3d/Rules";
import { Note } from "../../sound/note/Note";

export class NoteTransform extends Component {

    private _offset: number = 0
    private _ratio: number = 26
    private _instrument: Instrument
    
    constructor(engine: Engine, instrument: Instrument) {
        super(engine)
        this._instrument = instrument
    }

    get offset() {
        return this._offset
    }

    get ratio() {
        return this._ratio
    }

    setOffset(offset: number) {
        this._offset = offset
        this.changed()
    }

    setRatio(ratio: number) {
        this._ratio = ratio
        this.changed()
    }

    handleWheel(event: WheelEvent) {
        if (!OS.isCtrl(event)) {
            this._handlePan(event)
        }
    }

    getNoteForMouse(event: MouseEvent, container: HTMLElement): Note {
        const rect = container.getBoundingClientRect()
        const offsetY = event.clientY - rect.top
        return this.getNoteForOffset(offsetY)
    }

    getNoteForOffset(offset: number): Note {
        const maxNote = this._instrument.highestString.fret(Rules.maxFret)
        const rawNoteIndex = (offset / this.ratio) + this.offset
        const noteIndex = maxNote.index - Math.ceil(rawNoteIndex)
        return Note.fromIndex(noteIndex)
    }

    private _handlePan(event: WheelEvent) {
        const delta = event.deltaY

        let offset = this.offset
        offset = offset + delta / this.ratio

        this._offset = offset
        this.changed()
    }

}