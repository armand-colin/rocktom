import { Mesh, type MeshBasicMaterial, PlaneGeometry } from "three"
import { AtlasPalette } from "./AtlasPalette"
import { Rules } from "./Rules"
import { AtlasSprite, TextureAtlas, TextureColorIndex } from "./TextureAtlas"

export class FretMesh extends Mesh {

    static _geometries: (PlaneGeometry | null)[] = Array(Rules.maxFret + 1).fill(null)

    static createGeometry(fret: number): PlaneGeometry {
        const geometry = new PlaneGeometry(Rules.stringDistance * 0.6, Rules.stringDistance * 0.6)
        TextureAtlas.get().applyUvs(geometry, AtlasSprite.fret(fret), AtlasPalette.Reserve as TextureColorIndex)
        return geometry
    }

    static create(fret: number): FretMesh {
        if (fret < 0 || fret > Rules.maxFret)
            throw new Error(`Fret ${fret} is out of bounds`)

        let geometry = this._geometries[fret]

        if (!geometry) {
            geometry = this.createGeometry(fret)
            this._geometries[fret] = geometry
        }

        return new FretMesh(geometry, TextureAtlas.get().material, fret)
    }

    constructor(geometry: PlaneGeometry, material: MeshBasicMaterial, fret: number) {
        super(geometry, material)
        this.name = "Fret " + fret
    }

}
