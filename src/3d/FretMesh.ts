import { Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { Rules } from "./Rules";
import { FretTexture } from "./FretTexture";

export class FretMesh extends Mesh {

    static _geometries: (PlaneGeometry | null)[] = Array(Rules.maxFret + 1).fill(null)
    static _material: MeshBasicMaterial

    static createGeometry(fret: number): PlaneGeometry {
        const geometry = new PlaneGeometry(Rules.stringDistance * 0.6, Rules.stringDistance * 0.6)
        
        // Setting uvs to allow for a texture atlas
        const uv = geometry.attributes.uv
        for (let k = 0; k < uv.count; k++) {
            let u = uv.getX(k)
            const v = uv.getY(k)
            u = u * (1 / (Rules.maxFret + 1)) + (fret / (Rules.maxFret + 1))
            uv.setXY(k, u, v)
        }

        return geometry
    }

    static createMaterial() {
        if (this._material)
            return this._material

        this._material = new MeshBasicMaterial({
            map: FretTexture.load(),
            transparent: true
        })

        return this._material
    }

    static create(fret: number): FretMesh {
        if (fret < 0 || fret > Rules.maxFret)
            throw new Error(`Fret ${fret} is out of bounds`)


        let geometry = this._geometries[fret]

        if (!geometry) {
            geometry = this.createGeometry(fret)
            this._geometries[fret] = geometry
        }

        return new FretMesh(geometry, this.createMaterial())
    }

    constructor(geometry: PlaneGeometry, material: MeshBasicMaterial) {
        super(geometry, material)
    }

}