import { Engine, Resource } from "@niloc/ecs";
import { Material, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Texture, TextureLoader } from "three";
import { Rules } from "../3d/Rules";
import fretTexture from "../assets/numbers.png";
import tileTexture from "../assets/tile.png";

import type { String } from "../sound/instrument/String";
export class NoteMeshes extends Resource {

    private _materials: Map<String, MeshBasicMaterial> = new Map()
    private _highlightMaterials: Map<String, MeshBasicMaterial> = new Map()
    private _tailGeometry: PlaneGeometry

    private _geometry: PlaneGeometry
    private _fretGeometries: PlaneGeometry[] = []
    private _fretTexture: Texture
    private _fretMaterial: Material
    private _tileTexture: Texture

    constructor(engine: Engine) {
        super(engine)

        this._geometry = new PlaneGeometry(Rules.fretWidth * 0.6, Rules.stringDistance * 0.4)

        this._tailGeometry = new PlaneGeometry(Rules.fretWidth * 0.4, 1)
        this._tailGeometry.rotateX(-Math.PI / 2)
        this._tailGeometry.translate(0, 0, -0.5)

        this._fretTexture = new TextureLoader().load(fretTexture)
        this._tileTexture = new TextureLoader().load(tileTexture)

        for (let i = 0; i <= Rules.maxFret; i++) {
            const geometry = new PlaneGeometry(Rules.stringDistance * 0.4, Rules.stringDistance * 0.4)
            // Shall set uvs to allow for a texture atlas
            const uv = geometry.attributes.uv
            for (let k = 0; k < uv.count; k++) {
                let u = uv.getX(k)
                const v = uv.getY(k)
                u = u * (1 / (Rules.maxFret + 1)) + (i / (Rules.maxFret + 1))
                uv.setXY(k, u, v)
            }

            this._fretGeometries.push(geometry)
        }

        this._fretMaterial = new MeshBasicMaterial({ map: this._fretTexture, transparent: true })
    }

    private _getStringMaterial(string: String): MeshBasicMaterial {
        if (!this._materials.has(string)) {
            const material = new MeshBasicMaterial({
                color: string.color,
                map: this._tileTexture,
            })
            this._materials.set(string, material)
            return material
        }

        return this._materials.get(string)!
    }

    getStringHighlightMaterial(string: String): MeshBasicMaterial {
        if (!this._highlightMaterials.has(string)) {
            const material = new MeshBasicMaterial({
                color: string.highlightColor,
                map: this._tileTexture,
            })
            this._highlightMaterials.set(string, material)
            return material
        }
        return this._highlightMaterials.get(string)!
    }

    load() { }

    createTile(string: String) {
        const material = this._getStringMaterial(string)
        return new Mesh(this._geometry, material)
    }

    createTail(string: String, duration: number) {
        const length = duration * Rules.timeRatio
        const mesh = new Mesh(this._tailGeometry, this._getStringMaterial(string))
        mesh.scale.z = length
        return mesh
    }

    createFret(fret: number): Object3D {
        return new Mesh(this._fretGeometries[fret], this._fretMaterial)
    }

}