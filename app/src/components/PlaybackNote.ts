import { Component, Engine } from "@niloc/ecs";
import { Note3D } from "../3d/Note3D";
import type { Instrument } from "../sound/instrument/Instrument";
import type { NoteEvent } from "../sound/song/NoteEvent";

export class PlaybackNote extends Component {

    readonly note: NoteEvent
    private _object: Note3D

    constructor(engine: Engine, instrument: Instrument, note: NoteEvent) {
        super(engine)
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