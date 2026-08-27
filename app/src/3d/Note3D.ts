import { Mesh, Object3D, type MeshBasicMaterial } from "three"
import type { Instrument } from "../sound/instrument/Instrument"
import type { NoteEvent } from "../sound/song/NoteEvent"
import { FretMesh } from "./FretMesh"
import { NoteHeadGeometry } from "./NoteHeadGeometry"
import { NoteTailGeometry } from "./NoteTailGeometry"
import { Rules } from "./Rules"
import { TextureAtlas } from "./TextureAtlas"

const TIME_RATIO = 0.05

export class Note3D extends Object3D {

    private _headGeometry: NoteHeadGeometry
    private _headHighlightGeometry: NoteHeadGeometry
    private _tailGeometry: NoteTailGeometry | null = null
    private _tailHighlightGeometry: NoteTailGeometry | null = null

    private _head: Mesh<NoteHeadGeometry, MeshBasicMaterial>
    private _tail: Mesh<NoteTailGeometry, MeshBasicMaterial> | null = null
    private _fret: FretMesh | null = null

    private _note: NoteEvent
    private _highlighted = false

    constructor(note: NoteEvent, instrument: Instrument) {
        super()

        this._note = note

        const material = TextureAtlas.get().material

        this._headGeometry = NoteHeadGeometry.create(note, false)
        this._headHighlightGeometry = NoteHeadGeometry.create(note, true)
        this._head = new Mesh(this._headGeometry, material)
        this.add(this._head)

        if (note.duration > 0) {
            this._tailGeometry = NoteTailGeometry.create(note, false)
            this._tailHighlightGeometry = NoteTailGeometry.create(note, true)
            this._tail = new Mesh(this._tailGeometry, material)
            this.add(this._tail)
        }

        if (note.fret > 0) {
            this._fret = FretMesh.create(note.fret)
            this._fret.position.z = 0.02
            this.add(this._fret)
        }

        this.position.x = Rules.getX(note.fret)
        if (note.fret === 0)
            this.position.x = Rules.getX(note.fingerPosition + 1.5)

        this.position.y = Rules.getStringY(instrument, note.string)
        this.position.z = (0 - this._note.time) * TIME_RATIO
    }

    update(ticks: number) {
        this.position.z = (ticks - this._note.time) * TIME_RATIO

        if (
            ticks > this._note.time &&
            ticks <= this._note.time + this._note.duration
        ) {
            if (this._highlighted)
                return

            this._highlighted = true
            this._head.geometry = this._headHighlightGeometry
            if (this._tail && this._tailHighlightGeometry)
                this._tail.geometry = this._tailHighlightGeometry
        } else {
            if (!this._highlighted)
                return

            this._highlighted = false
            this._head.geometry = this._headGeometry
            if (this._tail && this._tailGeometry)
                this._tail.geometry = this._tailGeometry
        }
    }

}
