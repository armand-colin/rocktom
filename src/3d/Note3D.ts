import { BufferGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";
import type { NoteMeshes } from "../resources/NoteMeshes";
import type { Instrument } from "../sound/instrument/Instrument";
import type { NoteEvent } from "../sound/song/Pattern";
import { Rules } from "./Rules";
import { Bloom } from "./Bloom";

const TIME_RATIO = 0.05

export class Note3D extends Object3D {

    private _tail: Mesh<BufferGeometry, MeshBasicMaterial> | null = null
    private _highlightMaterial: MeshBasicMaterial
    private _baseMaterial: MeshBasicMaterial
    private _tile: Mesh<BufferGeometry, MeshBasicMaterial>

    private _note: NoteEvent

    constructor(note: NoteEvent, instrument: Instrument, noteMeshes: NoteMeshes) {
        super()

        this._note = note

        this._tile = noteMeshes.createTile(note.string)
        const fretMesh = noteMeshes.createFret(note.fret)
        fretMesh.position.z = 0.1

        this.add(this._tile)
        this.add(fretMesh)
        this.position.x = Rules.getX(note.fret)
        this.position.y = Rules.getY(instrument, note.string)
        this.position.z = (0 - this._note.time) * TIME_RATIO // hide it in the beginning
        this._highlightMaterial = noteMeshes.getStringHighlightMaterial(this._note.string)
        this._baseMaterial = this._tile.material

        if (this._note.duration > 0) {
            const tail = noteMeshes.createTail(this._note.string, this._note.duration)
            this._tail = tail
            this.add(tail)
        }
    }

    update(ticks: number) {
        // Update position based on time if needed
        this.position.z = (ticks - this._note.time) * TIME_RATIO

        if (
            ticks > this._note.time &&
            ticks <= this._note.time + this._note.duration
        ) {
            Bloom.enable(this)
        } else {
            Bloom.disable(this)
        }
    }

}