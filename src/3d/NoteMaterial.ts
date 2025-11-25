import { AddEquation, MeshBasicMaterial, Texture, TextureLoader } from "three"
import type { String } from "../sound/instrument/String"

import highlightTexture from "../assets/highlightTile.png"
import baseTexture from "../assets/tile.png"

export class NoteMaterial extends MeshBasicMaterial {

    static _loader = new TextureLoader()

    static _highlightTexture: Texture | null = null
    static _baseTexture: Texture | null = null

    static _baseMaterials: Map<String, NoteMaterial> = new Map()
    static _highlightMaterials: Map<String, NoteMaterial> = new Map()

    static load() {
        if (!this._highlightTexture)
            this._highlightTexture = this._loader.load(highlightTexture)

        if (!this._baseTexture)
            this._baseTexture = this._loader.load(baseTexture)
    }

    static base(string: String): NoteMaterial {
        if (!this._baseMaterials.has(string)) {
            if (this._baseTexture === null)
                this.load()

            const material = new NoteMaterial(string, this._baseTexture!)
            this._baseMaterials.set(string, material)
            return material
        }

        return this._baseMaterials.get(string)!
    }

    static highlight(string: String): NoteMaterial {
        if (!this._highlightMaterials.has(string)) {
            if (this._highlightTexture === null)
                this.load()

            const material = new NoteMaterial(string, this._highlightTexture!, true)
            this._highlightMaterials.set(string, material)
            return material
        }

        return this._highlightMaterials.get(string)!
    }

    private constructor(string: String, texture: Texture, emissive = false) {
        super({
            color: string.color,
            map: texture,
            blendEquation: emissive ? AddEquation : undefined,
        })
    }
}