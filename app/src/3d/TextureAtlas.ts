import { Component, type Engine } from "@niloc/ecs"
import { CanvasTexture, LinearFilter, MeshBasicMaterial, SRGBColorSpace, type BufferGeometry } from "three"
import highlightTileUrl from "../assets/highlightTile.png"
import stringUrl from "../assets/string.png"
import headUrl from "../assets/sprites/head.png"
import headHighlightUrl from "../assets/sprites/headHighlight.png"
import tailUrl from "../assets/sprites/tail.png"
import tailHighlightUrl from "../assets/sprites/tailHighlight.png"
import { Instance } from "../Instance"
import { AtlasPalette } from "./AtlasPalette"
import { Rules } from "./Rules"

const IMAGE_URLS = [
    headUrl,
    headHighlightUrl,
    tailUrl,
    tailHighlightUrl,
    stringUrl,
    highlightTileUrl,
]

export const TextureColorIndex = {
    String0: 0 as const,
    String1: 1 as const,
    String2: 2 as const,
    String3: 3 as const,
    String4: 4 as const,
    String5: 5 as const,
    Grey: 7 as const,
    White: 8 as const,
}

export type TextureColorIndex = (typeof TextureColorIndex)[keyof typeof TextureColorIndex]

export namespace AtlasSprite {
    export const Head = 0
    export const HeadHighlight = 1
    export const Tail = 2
    export const TailHighlight = 3
    export const String = 4
    export const HighlightTile = 5
    export const ImageCount = 6

    export function fret(n: number) {
        return ImageCount + n
    }

    export function columnCount() {
        return ImageCount + Rules.maxFret + 1
    }

    export function label(index: number): string {
        const names = ["head", "headHighlight", "tail", "tailHighlight", "string", "highlight"]
        if (index < ImageCount)
            return names[index]
        return `fret ${index - ImageCount}`
    }
}

export type AtlasUvRect = {
    u: number
    v: number
    w: number
    h: number
}

async function loadImage(url: string): Promise<ImageBitmap> {
    const response = await fetch(url)
    const blob = await response.blob()
    return createImageBitmap(blob)
}

export class TextureAtlas extends Component {

    static readonly cellSize = 128
    static readonly padding = 2
    static readonly stringTiles = 200

    static get stride() {
        return TextureAtlas.cellSize + 2 * TextureAtlas.padding
    }

    private static _instance: TextureAtlas | null = null

    static get(): TextureAtlas {
        if (!this._instance)
            throw new Error("TextureAtlas is not loaded")
        return this._instance
    }

    static load(engine: Engine = Instance.engine): TextureAtlas {
        if (this._instance)
            return this._instance

        this._instance = engine.createComponent(TextureAtlas)
        return this._instance
    }

    readonly canvas: HTMLCanvasElement
    readonly texture: CanvasTexture
    readonly material: MeshBasicMaterial
    readonly ready: Promise<void>

    isReady = false
    generation = 0

    private _sprites: (ImageBitmap | null)[] = IMAGE_URLS.map(() => null)
    private readonly _cellCanvas: HTMLCanvasElement
    private readonly _cellContext: CanvasRenderingContext2D
    private readonly _fretCanvas: HTMLCanvasElement
    private readonly _fretContext: CanvasRenderingContext2D

    constructor(engine: Engine) {
        super(engine)

        const columns = AtlasSprite.columnCount()
        const stride = TextureAtlas.stride
        this.canvas = document.createElement("canvas")
        this.canvas.width = columns * stride
        this.canvas.height = AtlasPalette.count * stride

        this._cellCanvas = document.createElement("canvas")
        this._cellCanvas.width = TextureAtlas.cellSize
        this._cellCanvas.height = TextureAtlas.cellSize
        this._cellContext = this._cellCanvas.getContext("2d")!

        this._fretCanvas = document.createElement("canvas")
        this._fretCanvas.width = TextureAtlas.cellSize
        this._fretCanvas.height = TextureAtlas.cellSize
        this._fretContext = this._fretCanvas.getContext("2d")!

        this.texture = new CanvasTexture(this.canvas)
        this.texture.colorSpace = SRGBColorSpace
        this.texture.generateMipmaps = false
        this.texture.minFilter = LinearFilter
        this.texture.magFilter = LinearFilter
        this.texture.needsUpdate = true

        this.material = new MeshBasicMaterial({
            map: this.texture,
            transparent: true,
        })

        this.ready = this._build()
        document.fonts.addEventListener("loadingdone", this._onFontsLoaded)
    }

    get columnCount() {
        return AtlasSprite.columnCount()
    }

    uvRect(sprite: number, colorIndex: number): AtlasUvRect {
        const stride = TextureAtlas.stride
        const padding = TextureAtlas.padding
        const size = TextureAtlas.cellSize
        const width = this.canvas.width
        const height = this.canvas.height

        const x0 = sprite * stride + padding + 0.5
        const y0 = colorIndex * stride + padding + 0.5
        const inner = size - 1

        return {
            u: x0 / width,
            v: 1 - (y0 + inner) / height,
            w: inner / width,
            h: inner / height,
        }
    }

    applyUvs(geometry: BufferGeometry, sprite: number, colorIndex: TextureColorIndex) {
        const rect = this.uvRect(sprite, colorIndex)
        const uv = geometry.attributes.uv
        for (let i = 0; i < uv.count; i++) {
            const u = uv.getX(i)
            const v = uv.getY(i)
            uv.setXY(i, u * rect.w + rect.u, v * rect.h + rect.v)
        }
        uv.needsUpdate = true
    }

    applyTiledUvs(geometry: BufferGeometry, sprite: number, colorIndex: TextureColorIndex) {
        const rect = this.uvRect(sprite, colorIndex)
        const uv = geometry.attributes.uv
        const stride = 6

        for (let i = 0; i + stride <= uv.count; i += stride) {
            let uMin = Infinity
            let uMax = -Infinity
            let vMin = Infinity
            let vMax = -Infinity

            for (let k = 0; k < stride; k++) {
                const u = uv.getX(i + k)
                const v = uv.getY(i + k)
                if (u < uMin) uMin = u
                if (u > uMax) uMax = u
                if (v < vMin) vMin = v
                if (v > vMax) vMax = v
            }

            const uSpan = uMax - uMin || 1
            const vSpan = vMax - vMin || 1

            for (let k = 0; k < stride; k++) {
                const u = (uv.getX(i + k) - uMin) / uSpan
                const v = (uv.getY(i + k) - vMin) / vSpan
                uv.setXY(i + k, u * rect.w + rect.u, v * rect.h + rect.v)
            }
        }

        uv.needsUpdate = true
    }

    destroy() {
        document.fonts.removeEventListener("loadingdone", this._onFontsLoaded)
        this.texture.dispose()
        this.material.dispose()
        if (TextureAtlas._instance === this)
            TextureAtlas._instance = null
        super.destroy()
    }

    private async _build() {
        await this._loadSprites()
        this._paint()
        this.isReady = true
        this.changed()
    }

    private async _loadSprites() {
        const loaded = await Promise.all(IMAGE_URLS.map(async (url) => {
            try {
                return await loadImage(url)
            } catch (error) {
                console.error("TextureAtlas: failed to load", url, error)
                return null
            }
        }))
        this._sprites = loaded
    }

    private _onFontsLoaded = () => {
        this._paint()
        this.changed()
    }

    private _paint() {
        const context = this.canvas.getContext("2d")!
        const stride = TextureAtlas.stride
        const padding = TextureAtlas.padding
        context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        for (let colorIndex = 0; colorIndex < AtlasPalette.count; colorIndex++) {
            const css = AtlasPalette.css(colorIndex)
            const y = colorIndex * stride + padding

            for (let sprite = 0; sprite < AtlasSprite.ImageCount; sprite++) {
                const image = this._sprites[sprite]
                if (!image)
                    continue
                const x = sprite * stride + padding
                this._blitTinted(context, image, x, y, css)
                this._extrude(context, x, y)
            }

            for (let fret = 0; fret <= Rules.maxFret; fret++) {
                const sprite = AtlasSprite.fret(fret)
                const x = sprite * stride + padding
                this._drawFretCell(fret)
                this._blitTinted(context, this._fretCanvas, x, y, css)
                this._extrude(context, x, y)
            }
        }

        this.texture.needsUpdate = true
        this.generation++
    }

    private _drawFretCell(fret: number) {
        const size = TextureAtlas.cellSize
        const context = this._fretContext
        context.clearRect(0, 0, size, size)

        const fontSize = (size * 0.75) | 0
        const strokeSize = (size * 0.25) | 0

        context.fillStyle = "white"
        context.font = `${fontSize}px Lexend`
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.strokeStyle = "black"
        context.lineWidth = strokeSize
        context.strokeText(fret.toString(), size / 2, size / 2)
        context.fillText(fret.toString(), size / 2, size / 2)
    }

    private _blitTinted(
        target: CanvasRenderingContext2D,
        source: CanvasImageSource,
        x: number,
        y: number,
        color: string
    ) {
        const size = TextureAtlas.cellSize
        const cell = this._cellContext
        cell.clearRect(0, 0, size, size)
        cell.globalCompositeOperation = "source-over"
        cell.drawImage(source, 0, 0, size, size)
        cell.globalCompositeOperation = "multiply"
        cell.fillStyle = color
        cell.fillRect(0, 0, size, size)
        cell.globalCompositeOperation = "destination-in"
        cell.drawImage(source, 0, 0, size, size)
        cell.globalCompositeOperation = "source-over"
        target.drawImage(this._cellCanvas, x, y)
    }

    private _extrude(target: CanvasRenderingContext2D, x: number, y: number) {
        const size = TextureAtlas.cellSize
        const pad = TextureAtlas.padding
        const source = this._cellCanvas
        target.imageSmoothingEnabled = false

        target.drawImage(source, 0, 0, 1, size, x - pad, y, pad, size)
        target.drawImage(source, size - 1, 0, 1, size, x + size, y, pad, size)
        target.drawImage(source, 0, 0, size, 1, x, y - pad, size, pad)
        target.drawImage(source, 0, size - 1, size, 1, x, y + size, size, pad)

        target.drawImage(source, 0, 0, 1, 1, x - pad, y - pad, pad, pad)
        target.drawImage(source, size - 1, 0, 1, 1, x + size, y - pad, pad, pad)
        target.drawImage(source, 0, size - 1, 1, 1, x - pad, y + size, pad, pad)
        target.drawImage(source, size - 1, size - 1, 1, 1, x + size, y + size, pad, pad)

        target.imageSmoothingEnabled = true
    }

}
