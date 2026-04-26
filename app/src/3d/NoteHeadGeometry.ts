import { BufferGeometry, Float32BufferAttribute } from "three";
import type { NoteEvent } from "../sound/song/NoteEvent";
import { Rules } from "./Rules";

export class NoteHeadGeometry extends BufferGeometry {

    static baseGeometry: NoteHeadGeometry
    static fretlessGeometry: NoteHeadGeometry

    static create(note: NoteEvent): NoteHeadGeometry {
        if (note.fret === 0) {
            if (!this.fretlessGeometry)
                this.fretlessGeometry = new NoteHeadGeometry(note)

            return this.fretlessGeometry
        }

        if (!this.baseGeometry)
            this.baseGeometry = new NoteHeadGeometry(note)

        return this.baseGeometry
    }

    private constructor(note: NoteEvent) {
        super()
        let width = Rules.fretWidth * 0.6
        let height = Rules.stringDistance * 0.4

        if (note.fret === 0) {
            width = Rules.fretWidth * 4
            height = Rules.stringDistance * 0.2
        }

        const halfWidth = width / 2
        const halfHeight = height / 2

        // Create plane aligned with y axis
        const positions = new Float32Array([
            -halfWidth, halfHeight, 0,
            halfWidth, halfHeight, 0,
            -halfWidth, -halfHeight, 0,
            halfWidth, -halfHeight, 0,
        ])

        const uvs = new Float32Array([
            0, 1,
            1, 1,
            0, 0,
            1, 0,
        ])

        this.setAttribute('position', new Float32BufferAttribute(positions, 3))
        this.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
        this.setIndex([
            0, 2, 1,
            2, 3, 1,
        ])
    }

}