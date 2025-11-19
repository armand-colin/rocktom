import { BufferGeometry, Float32BufferAttribute } from "three";
import type { NoteEvent } from "../sound/song/Pattern";
import { Rules } from "./Rules";

const EaseIn = (t: number) => t * t
const EaseInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

export class NoteTailGeometry extends BufferGeometry {

    static geometries: Map<string, NoteTailGeometry> = new Map()
    static slideStep = 10

    private _note: NoteEvent
    private _indices: number[] = []
    private _positions: number[] = []
    private _uvs: number[] = []

    static create(note: NoteEvent): NoteTailGeometry {
        // TODO: add hash that takes duration and slide offset into account
        return new NoteTailGeometry(note)
    }

    constructor(note: NoteEvent) {
        super()

        this._note = note

        this._indices = []
        this._positions = []
        this._uvs = []

        this._addStraightTail()
        this._addSlide()

        this.setIndex(this._indices)
        this.setAttribute('position', new Float32BufferAttribute(this._positions, 3))
        this.setAttribute('uv', new Float32BufferAttribute(this._uvs, 2))
    }

    private _addStraightTail() {
        // Create simple quad
        const slideDuration = this._note.slide ? this._note.slide.duration : 0
        const noteDuration = this._note.duration - slideDuration
        const length = noteDuration * Rules.timeRatio
        const tLength = noteDuration / this._note.duration
        console.log('Built note with duration', this._note.slide)

        // Four vertices
        this._positions.push(
            -Rules.fretWidth * 0.2, 0, 0,
            Rules.fretWidth * 0.2, 0, 0,
            -Rules.fretWidth * 0.2, 0, -length,
            Rules.fretWidth * 0.2, 0, -length,
        )

        this._uvs.push(
            0, 0,
            1, 0,
            0, tLength,
            1, tLength,
        )

        // Two triangles
        this._indices.push(
            0, 1, 2,
            2, 1, 3
        )
    }

    private _addSlide() {
        if (!this._note.slide)
            return

        const noteDuration = this._note.duration - this._note.slide.duration
        const length = this._note.slide.duration * Rules.timeRatio
        const offsetZ = noteDuration * Rules.timeRatio
        const tOffsetZ = noteDuration / this._note.duration
        const curve = this._note.slide.connect ? EaseInOut : EaseIn

        const startFretX = Rules.getX(this._note.fret)
        const endFretX = Rules.getX(this._note.slide.fret)
        const deltaX = endFretX - startFretX

        // Add to first vertices
        const baseIndex = this._positions.length / 3

        this._positions.push(
            -Rules.fretWidth * 0.2, 0, -offsetZ,
            Rules.fretWidth * 0.2, 0, -offsetZ,
        )

        this._uvs.push(
            0, tOffsetZ,
            1, tOffsetZ,
        )

        this._indices.push(
            baseIndex + 0, baseIndex + 1, 2 + 0,
            2 + 0, baseIndex + 1, 2 + 1
        )

        // Create slide steps
        for (let step = 1; step <= NoteTailGeometry.slideStep; step++) {
            const t = step / NoteTailGeometry.slideStep
            const xt = curve(t)
            const currentX = deltaX * xt
            const currentZ = -offsetZ - length * t
            const currentTU = tOffsetZ + (1 - tOffsetZ) * t

            const baseIndex = this._positions.length / 3

            this._positions.push(
                currentX - Rules.fretWidth * 0.2, 0, currentZ,
                currentX + Rules.fretWidth * 0.2, 0, currentZ,
            )

            this._uvs.push(
                0, currentTU,
                1, currentTU,
            )

            this._indices.push(
                baseIndex + 0, baseIndex - 2 + 0, baseIndex + 1,
                baseIndex - 2 + 0, baseIndex - 2 + 1, baseIndex + 1,
            )
        }
    }

}