import { Engine } from "./engine/Engine";
import { Schedule } from "./engine/Schedule";
import { Workspace } from "./resources/Workspace";
import { SoundAnalyserNode } from "./sound/node/SoundAnalyserNode";

export class CanvasAnalyser {

    private _analyser: SoundAnalyserNode
    private _canvas: HTMLCanvasElement
    private _context: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement) {
        this._analyser = Engine.instance.getResource(Workspace).analyser
        this._canvas = canvas
        this._context = canvas.getContext('2d')!

        Engine.instance.coroutine(this._draw())
    }

    private *_draw() {
        while (true) {
            const frequencies = this._analyser.getAllFrequencies()

            const array = this._analyser.frequencies.slice(0, 100)
            const width = this._canvas.width
            const height = this._canvas.height

            this._context.clearRect(0, 0, width, height)

            // Curve
            this._context.beginPath()
            this._context.moveTo(0, height)

            for (let i = 0; i < array.length; i++) {
                const x = i * (width / array.length)
                const y = height - (array[i] * height)
                this._context.lineTo(x, y)
            }

            this._context.lineTo(width, height)
            this._context.lineWidth = 1
            this._context.strokeStyle = "red"
            this._context.stroke()
            this._context.closePath()

            // Frequencies
            for (const frequency of frequencies) {
                const frequencySpan = this._analyser.frequencyStep * array.length
                const x = frequency / frequencySpan * width

                this._context.beginPath()
                this._context.moveTo(x, 0)
                this._context.lineTo(x, height)
                this._context.strokeStyle = "green"
                this._context.stroke()
                this._context.closePath()
            }

            // Threshold
            const y = height - (SoundAnalyserNode.THRESHOLD * height)
            this._context.beginPath()
            this._context.moveTo(0, y)
            this._context.lineTo(width, y)
            this._context.strokeStyle = "blue"
            this._context.stroke()
            this._context.closePath()

            yield Schedule.Frame
        }
    }

}