import { Component, Engine } from "@niloc/ecs";
import type { NoteEvent } from "../sound/song/Pattern";
import { Renderer } from "../resources/Renderer";
import { NoteMeshes } from "../resources/NoteMeshes";
import { Object3D } from "three";
import type { Instrument } from "../sound/instrument/Instrument";
import { Rules } from "../3d/Rules";

const TIME_RATIO = 0.01

export class PlaybackNote extends Component {

    readonly note: NoteEvent
    private _renderer: Renderer
    private _object: Object3D 

    constructor(engine: Engine, instrument: Instrument, note: NoteEvent) {
        super(engine)
        this.note = note
        this._renderer = engine.getResource(Renderer)
        const mesh = engine.getResource(NoteMeshes).createMesh(note.string)
        const object = new Object3D()
        object.add(mesh)

        object.position.x = Rules.getX(note.fret)
        object.position.y = Rules.getY(instrument, note.string)

        this._object = object

        this._renderer.add(object)
    }

    update(ticks: number) {
        // Update position based on time if needed
        const z = (ticks - this.note.time) * TIME_RATIO
        this._object.position.z = z
    }

}