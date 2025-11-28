import { MeshBasicMaterial, Texture, TextureLoader } from "three"
import type { String } from "../sound/instrument/String"

import headTexture from "../assets/sprites/head.png"
import headHighlightTexture from "../assets/sprites/headHighlight.png"
import tailTexture from "../assets/sprites/tail.png"
import tailHighlightTexture from "../assets/sprites/tailHighlight.png"

export class NoteMaterial extends MeshBasicMaterial {

    static _loader = new TextureLoader()

    static _headTexture: Texture | null = null
    static _headHighlightTexture: Texture | null = null
    static _tailTexture: Texture | null = null
    static _tailHighlightTexture: Texture | null = null

    static _headMaterials: Map<String, NoteMaterial> = new Map()
    static _headHighlightMaterials: Map<String, NoteMaterial> = new Map()
    static _tailMaterials: Map<String, NoteMaterial> = new Map()
    static _tailHighlightMaterials: Map<String, NoteMaterial> = new Map()

    static load() {
        if (!this._headHighlightTexture)
            this._headHighlightTexture = this._loader.load(headHighlightTexture)

        if (!this._headTexture)
            this._headTexture = this._loader.load(headTexture)

        if (!this._tailHighlightTexture)
            this._tailHighlightTexture = this._loader.load(tailHighlightTexture)

        if (!this._tailTexture)
            this._tailTexture = this._loader.load(tailTexture)
    }

    static head(string: String): NoteMaterial {
        if (!this._headMaterials.has(string)) {
            if (this._headTexture === null)
                this.load()

            const material = new NoteMaterial(string, this._headTexture!)
            this._headMaterials.set(string, material)
            return material
        }

        return this._headMaterials.get(string)!
    }

    static headHighlight(string: String): NoteMaterial {
        if (!this._headHighlightMaterials.has(string)) {
            if (this._headHighlightTexture === null)
                this.load()

            const material = new NoteMaterial(string, this._headHighlightTexture!)
            this._headHighlightMaterials.set(string, material)
            return material
        }

        return this._headHighlightMaterials.get(string)!
    }

    static tail(string: String): NoteMaterial {
        if (!this._tailMaterials.has(string)) {
            if (this._tailTexture === null)
                this.load()

            const material = new NoteMaterial(string, this._tailTexture!)
            this._tailMaterials.set(string, material)
        }
        return this._tailMaterials.get(string)!
    }

    static tailHighlight(string: String): NoteMaterial {
        if (!this._tailHighlightMaterials.has(string)) {
            if (this._tailHighlightTexture === null)
                this.load()

            const material = new NoteMaterial(string, this._tailHighlightTexture!)
            this._tailHighlightMaterials.set(string, material)
        }
        return this._tailHighlightMaterials.get(string)!
    }

    private constructor(string: String, texture: Texture) {
        super({
            color: string.color,
            map: texture,
            transparent: true,
        })
    }
}