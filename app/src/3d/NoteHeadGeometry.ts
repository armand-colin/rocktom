import { BufferGeometry, Float32BufferAttribute } from "three"
import type { NoteEvent } from "../sound/song/NoteEvent"
import { Rules } from "./Rules"
import { AtlasSprite, TextureAtlas } from "./TextureAtlas"

export class NoteHeadGeometry extends BufferGeometry {

    private static _cache = new Map<string, NoteHeadGeometry>()

    static create(note: NoteEvent, highlight = false): NoteHeadGeometry {
        const fretless = note.fret === 0
        const key = `${fretless ? 1 : 0}-${note.string.colorIndex}-${highlight ? 1 : 0}`
        let geometry = this._cache.get(key)
        if (!geometry) {
            geometry = new NoteHeadGeometry(fretless, note.string.colorIndex, highlight)
            this._cache.set(key, geometry)
        }
        return geometry
    }

    private constructor(fretless: boolean, colorIndex: number, highlight: boolean) {
        super()
        let width = Rules.fretWidth * 0.6
        let height = Rules.stringDistance * 0.4

        if (fretless) {
            width = Rules.fretWidth * 4
            height = Rules.stringDistance * 0.2
        }

        const halfWidth = width / 2
        const halfHeight = height / 2

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

        this.setAttribute("position", new Float32BufferAttribute(positions, 3))
        this.setAttribute("uv", new Float32BufferAttribute(uvs, 2))
        this.setIndex([
            0, 2, 1,
            2, 3, 1,
        ])

        TextureAtlas.get().applyUvs(
            this,
            highlight ? AtlasSprite.HeadHighlight : AtlasSprite.Head,
            colorIndex
        )
    }

}
