import { Component, Engine } from "@niloc/ecs";
import type { TempoTrackEditor } from "./TempoTrackEditor";
import type { AudioTrackEditor } from "./AudioTrackEditor";
import type { Coroutine, Vec2 } from "@niloc/utils";
import { AudioData } from "../../core/AudioData";
import type { TimeTransform } from "./TimeTransform";
import { Schedules } from "../../Schedules";

export class AudioWaveformRenderer extends Component {

    private _canvas: HTMLCanvasElement
    private _context: CanvasRenderingContext2D
    private _tempoTrack: TempoTrackEditor
    private _audioTrack: AudioTrackEditor
    private _size: Vec2
    private _renderCoroutine: Coroutine | null = null
    private _url: string | null = null
    private _audioData: AudioData | null = null
    private _transform: TimeTransform

    constructor(engine: Engine, opts: {
        tempoTrack: TempoTrackEditor,
        audioTrack: AudioTrackEditor,
        transform: TimeTransform
    }) {
        super(engine)

        this._tempoTrack = opts.tempoTrack
        this._audioTrack = opts.audioTrack
        this._canvas = document.createElement('canvas')
        const context = this._canvas.getContext('2d')
        if (!context)
            throw new Error('Could not get 2D context for AudioWaveformRenderer')

        this._context = context
        this._transform = opts.transform
        this._size = { x: 100, y: 50 }

        this._audioTrack.onChange(this._onChange)
        this._tempoTrack.onChange(this._onChange)
        this._transform.onChange(this._onChange)

        this._onChange()
    }

    get canvas() {
        return this._canvas
    }

    setSize(size: Vec2) {
        this._size = size
        this._onChange()
    }

    private _onChange = () => {
        if (this._renderCoroutine) {
            this._renderCoroutine.cancel()
            this._renderCoroutine = null
        }

        // TODO
        // const url = this._audioTrack.track.payload.type === AudioType.Url ?
        //     this._audioTrack.track.payload.url :
        //     null

        // if (this._url !== url) {
        //     this._audioData = null
        //     this._url = url

        //     if (url) {
        //         AudioData.fetch(this.engine, url)
        //             .then(data => {
        //                 if (this._url === url) {
        //                     this._audioData = data
        //                     this._onChange()
        //                 }
        //             })
        //     }
        // }

        // if (this._audioData)
        //     this._renderCoroutine = this.engine.scheduler.add(this._render(this._audioData))
    }

    private *_render(audioData: AudioData) {
        const width = this._size.x * devicePixelRatio
        const height = this._size.y * devicePixelRatio

        this._canvas.width = width
        this._canvas.height = height

        this._context.fillStyle = "black"
        this._context.fillRect(0, 0, width, height)

        const startTicks = -this._transform.offset
        const endTicks = -this._transform.offset + this._size.x / this._transform.ratio

        let startTime = Date.now()

        for (let i = 0; i < width; i += 1) {
            const ticks = (endTicks - startTicks) * (i / width) + startTicks
            const seconds = this._tempoTrack.track.secondsFromTicks(ticks)
            const audioSeconds = seconds - this._audioTrack.track.time
            let y = height * 0.5

            if (audioSeconds >= 0 && audioSeconds <= audioData.duration) {
                // We are in the range of the audio
                const audioT = audioSeconds / audioData.duration
                const sampleIndex = Math.floor(audioT * audioData.array.length)
                const sample = audioData.array[sampleIndex]
                y = Math.floor((1 - (sample + 1) / 2) * height)
            }

            if (i === 0) {
                this._context.moveTo(i, y)
            } else {
                this._context.lineTo(i, y)
            }

            const now = Date.now()

            if (now - startTime > 10) {
                yield Schedules.Frame
                startTime = Date.now()
            }
        }

        this._context.strokeStyle = "white"
        this._context.lineWidth = 1
        this._context.stroke()
        this._context.closePath()
    }

}