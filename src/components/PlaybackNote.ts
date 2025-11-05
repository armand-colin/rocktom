import { Component, Engine } from "@niloc/ecs";
import { Object3D } from "three";
import { Rules } from "../3d/Rules";
import { NoteMeshes } from "../resources/NoteMeshes";
import { Renderer } from "../resources/Renderer";
import type { Instrument } from "../sound/instrument/Instrument";
import type { NoteEvent } from "../sound/song/Pattern";

const TIME_RATIO = 0.05

export class PlaybackNote extends Component {

    readonly note: NoteEvent
    private _renderer: Renderer
    private _object: Object3D

    constructor(engine: Engine, instrument: Instrument, note: NoteEvent) {
        super(engine)
        this.note = note

        this._renderer = engine.getResource(Renderer)

        const noteMesh = engine.getResource(NoteMeshes).createMesh(note.string)
        const fretMesh = engine.getResource(NoteMeshes).createFretMesh(note.fret)
        fretMesh.position.z = 0.1

        const object = new Object3D()

        object.add(noteMesh)
        object.add(fretMesh)
        object.position.x = Rules.getX(note.fret)
        object.position.y = Rules.getY(instrument, note.string)
        object.position.z = 100 // hide it in the beginning
        if (note.duration > 0) {
            const tailGeometry = engine.getResource(NoteMeshes).createTailGeometry(note.string, note.duration)
            object.add(tailGeometry)
        }

        this._object = object
        this._renderer.add(object)
    }

    update(ticks: number) {
        // Update position based on time if needed
        const z = (ticks - this.note.time) * TIME_RATIO
        this._object.position.z = z
    }

}