import { Note3D } from "../3d/Note3D"
import type { Instrument } from "../sound/instrument/Instrument"
import type { NoteEvent } from "../sound/song/NoteEvent"

export class PlaybackNote {

    readonly note: NoteEvent
    private _object: Note3D

    constructor(instrument: Instrument, note: NoteEvent) {
        this.note = note
        this._object = new Note3D(note, instrument)
    }

    get object() {
        return this._object
    }

    update(ticks: number) {
        this._object.update(ticks)
    }

}
