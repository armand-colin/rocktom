import { Texture } from "three"
import { Rules } from "./Rules"

export class FretTexture extends Texture {

    static _instance: FretTexture

    static load(): FretTexture {
        if (this._instance)
            return this._instance

        this._instance = new FretTexture()
        return this._instance
    }

    constructor() {
        super()
        this._updateTexture()
        document.fonts.addEventListener('loadingdone', this._updateTexture)
    }

    private _updateTexture = () => {
        const spriteSize = 128
        const fontSize = (spriteSize * 0.75) | 0
        const strokeSize = (spriteSize * 0.25) | 0

        const canvas = document.createElement("canvas")
        const spriteCount = Rules.maxFret + 1
        canvas.width = spriteSize * spriteCount
        canvas.height = spriteSize

        const context = canvas.getContext("2d")!

        for (let fret = 0; fret <= Rules.maxFret; fret++) {
            context.fillStyle = "white"
            context.font = `${fontSize}px Stack`
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.strokeStyle = "black"
            context.lineWidth = strokeSize
            context.strokeText(fret.toString(), fret * spriteSize + spriteSize / 2, spriteSize / 2)
            context.fillText(fret.toString(), fret * spriteSize + spriteSize / 2, spriteSize / 2)
        }

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        this.image = imageData
        this.needsUpdate = true
    }

}