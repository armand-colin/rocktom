import { Texture } from "three"
import { Rules } from "./Rules"

function generate() {
    const spriteSize = 128
    const fontSize = (spriteSize * 0.75) | 0
    const strokeSize = (spriteSize * 0.25) | 0

    const canvas = document.createElement("canvas")
    const spriteCount = Rules.maxFret + 1
    canvas.width = spriteSize * spriteCount
    canvas.height = spriteSize

    const context = canvas.getContext("2d")!

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const texture = new Texture(imageData)
    texture.needsUpdate = true

    document.fonts.addEventListener('loadingdone', () => {
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
        texture.image = imageData
        texture.needsUpdate = true
    })

    return texture
}

export const FretTexture = {
    generate
}