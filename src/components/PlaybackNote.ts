import { Component, Engine } from "@niloc/ecs";
import { Note3D } from "../3d/Note3D";
import { NoteMeshes } from "../resources/NoteMeshes";
import { Renderer } from "../resources/Renderer";
import type { Instrument } from "../sound/instrument/Instrument";
import type { NoteEvent } from "../sound/song/Pattern";

export class PlaybackNote extends Component {

    readonly note: NoteEvent
    private _renderer: Renderer
    private _object: Note3D

    constructor(engine: Engine, instrument: Instrument, note: NoteEvent) {
        super(engine)
        this.note = note

        this._renderer = engine.getResource(Renderer)
        this._object = new Note3D(note, instrument, engine.getResource(NoteMeshes))
        this._renderer.add(this._object)
    }

    update(ticks: number) {
        this._object.update(ticks)
    }

    destroy() {
        this._renderer.remove(this._object)
    }

}