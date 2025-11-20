import { Mesh, Object3D } from "three";
import type { Instrument } from "../sound/instrument/Instrument";
import type { NoteEvent } from "../sound/song/NoteEvent";
import { Rules } from "./Rules";
import { NoteTailGeometry } from "./NoteTailGeometry";
import { NoteMaterial } from "./NoteMaterial";
import { NoteHeadGeometry } from "./NoteHeadGeometry";
import { FretMesh } from "./FretMesh";

const TIME_RATIO = 0.05

export class Note3D extends Object3D {

    private _baseMaterial: NoteMaterial
    private _highlightMaterial: NoteMaterial

    private _head: Mesh<NoteHeadGeometry, NoteMaterial>
    private _tail: Mesh<NoteTailGeometry, NoteMaterial> | null = null
    private _fret: FretMesh | null = null

    private _note: NoteEvent

    constructor(note: NoteEvent, instrument: Instrument) {
        super()

        this._note = note

        this._baseMaterial = NoteMaterial.base(note.string)
        this._highlightMaterial = NoteMaterial.highlight(note.string)

        this._head = new Mesh(NoteHeadGeometry.create(note), this._baseMaterial)
        this.add(this._head)

        if (note.duration > 0) {
            this._tail = new Mesh(NoteTailGeometry.create(note), this._baseMaterial)
            this.add(this._tail)
        }

        if (note.fret > 0) {
            this._fret = FretMesh.create(note.fret)
            this._fret.position.z = 0.1
            this.add(this._fret)
        }

        this.position.x = Rules.getX(note.fret)
        if (note.fret === 0)
            this.position.x = Rules.getX(note.fingerPosition + 1.5)

        this.position.y = Rules.getStringY(instrument, note.string)
        this.position.z = (0 - this._note.time) * TIME_RATIO // hide it in the beginning
    }

    update(ticks: number) {
        // Update position based on time if needed
        this.position.z = (ticks - this._note.time) * TIME_RATIO

        if (
            ticks > this._note.time &&
            ticks <= this._note.time + this._note.duration
        ) {
            // Setting highlight material
            this._head.material = this._highlightMaterial
            if (this._tail)
                this._tail.material = this._highlightMaterial
        } else {
            // Setting base material
            this._head.material = this._baseMaterial
            if (this._tail)
                this._tail.material = this._baseMaterial
        }
    }

}