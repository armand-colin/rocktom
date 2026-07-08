import { Component, Engine } from "@niloc/ecs";
import type { Coroutine, Vec2 } from "@niloc/utils";
import { AudioData } from "../../core/AudioData";
import type { TimeTransform } from "./TimeTransform";
import { Schedules } from "../../Schedules";
import type { TempoTrackEditor } from "./TempoTrackEditor";
import type { AudioTrackEditor } from "./AudioTrackEditor";

const PEAK_BLOCK_SIZE = 128

type PeakLevel = {
    blockSize: number
    min: Float32Array
    max: Float32Array
}

type PeakCache = {
    audioId: string
    levels: PeakLevel[]
}

function sampleToY(sample: number, height: number): number {
    return Math.floor((1 - (sample + 1) / 2) * height)
}

function* buildPeakLevel0(array: Float32Array): Generator<typeof Schedules.Frame, PeakLevel> {
    const blockSize = PEAK_BLOCK_SIZE
    const count = Math.ceil(array.length / blockSize)
    const min = new Float32Array(count)
    const max = new Float32Array(count)
    let startTime = Date.now()

    for (let b = 0; b < count; b++) {
        const start = b * blockSize
        const end = Math.min(start + blockSize, array.length)
        let bMin = 1
        let bMax = -1

        for (let i = start; i < end; i++) {
            const v = array[i]
            if (v < bMin) bMin = v
            if (v > bMax) bMax = v
        }

        min[b] = bMin
        max[b] = bMax

        const now = Date.now()
        if (now - startTime > 10) {
            yield Schedules.Frame
            startTime = Date.now()
        }
    }

    return { blockSize, min, max }
}

function buildPeakMipLevels(level0: PeakLevel): PeakLevel[] {
    const levels = [level0]
    let prev = level0

    while (prev.min.length > 1) {
        const blockSize = prev.blockSize * 2
        const count = Math.ceil(prev.min.length / 2)
        const min = new Float32Array(count)
        const max = new Float32Array(count)

        for (let b = 0; b < count; b++) {
            const i0 = b * 2
            const i1 = b * 2 + 1
            min[b] = i1 < prev.min.length ? Math.min(prev.min[i0], prev.min[i1]) : prev.min[i0]
            max[b] = i1 < prev.max.length ? Math.max(prev.max[i0], prev.max[i1]) : prev.max[i0]
        }

        const level = { blockSize, min, max }
        levels.push(level)
        prev = level
    }

    return levels
}

function getPeakRange(
    levels: PeakLevel[],
    array: Float32Array,
    startSample: number,
    endSample: number,
): { min: number, max: number } {
    const sampleCount = array.length

    if (sampleCount === 0) {
        return { min: 0, max: 0 }
    }

    startSample = Math.max(0, startSample)
    endSample = Math.min(sampleCount, endSample)

    if (startSample >= endSample) {
        const idx = Math.min(startSample, sampleCount - 1)
        const v = array[idx]
        return { min: v, max: v }
    }

    const span = endSample - startSample

    if (span <= PEAK_BLOCK_SIZE) {
        let min = 1
        let max = -1

        for (let i = startSample; i < endSample; i++) {
            const v = array[i]
            if (v < min) min = v
            if (v > max) max = v
        }

        return { min, max }
    }

    let levelIdx = 0
    for (let i = levels.length - 1; i >= 0; i--) {
        if (levels[i].blockSize <= span) {
            levelIdx = i
            break
        }
    }

    const level = levels[levelIdx]
    const startBlock = Math.floor(startSample / level.blockSize)
    const endBlock = Math.floor((endSample - 1) / level.blockSize)
    let min = 1
    let max = -1

    for (let b = startBlock; b <= endBlock; b++) {
        if (b >= level.min.length) break
        if (level.min[b] < min) min = level.min[b]
        if (level.max[b] > max) max = level.max[b]
    }

    return { min, max }
}

export class AudioWaveformRenderer extends Component {

    private _canvas: HTMLCanvasElement
    private _context: CanvasRenderingContext2D
    private _tempoTrack: TempoTrackEditor
    private _audioTrack: AudioTrackEditor
    private _size: Vec2
    private _renderCoroutine: Coroutine | null = null
    private _transform: TimeTransform
    private _peakCache: PeakCache | null = null

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

        const audioData = this._audioTrack.loadedAudioData
        if (audioData)
            this._renderCoroutine = this.engine.scheduler.add(this._render(audioData))
    }

    private *_buildPeakCache(audioData: AudioData) {
        if (this._peakCache?.audioId === audioData.id)
            return

        const level0 = yield* buildPeakLevel0(audioData.array)

        this._peakCache = {
            audioId: audioData.id,
            levels: buildPeakMipLevels(level0),
        }
    }

    private *_render(audioData: AudioData) {
        yield* this._buildPeakCache(audioData)

        const peakCache = this._peakCache
        if (!peakCache)
            return

        const width = this._size.x * devicePixelRatio
        const height = this._size.y * devicePixelRatio
        const sampleCount = audioData.array.length
        const duration = audioData.duration

        this._canvas.width = width
        this._canvas.height = height

        this._context.fillStyle = "black"
        this._context.fillRect(0, 0, width, height)

        const startTicks = -this._transform.offset
        const endTicks = -this._transform.offset + this._size.x / this._transform.ratio
        const tickSpan = endTicks - startTicks
        const audioOffset = this._audioTrack.track.time

        this._context.fillStyle = "white"

        let startTime = Date.now()

        for (let i = 0; i < width; i += 1) {
            const ticksStart = tickSpan * (i / width) + startTicks
            const ticksEnd = tickSpan * ((i + 1) / width) + startTicks
            const secondsStart = this._tempoTrack.track.secondsFromTicks(ticksStart) - audioOffset
            const secondsEnd = this._tempoTrack.track.secondsFromTicks(ticksEnd) - audioOffset

            const visibleStart = Math.max(0, secondsStart)
            const visibleEnd = Math.min(duration, secondsEnd)

            if (visibleStart < visibleEnd) {
                const startSample = Math.floor((visibleStart / duration) * sampleCount)
                const endSample = Math.max(startSample + 1, Math.ceil((visibleEnd / duration) * sampleCount))
                const { min, max } = getPeakRange(peakCache.levels, audioData.array, startSample, endSample)
                const yMax = sampleToY(max, height)
                const yMin = sampleToY(min, height)
                this._context.fillRect(i, yMax, 1, Math.max(1, yMin - yMax))
            }

            const now = Date.now()

            if (now - startTime > 10) {
                yield Schedules.Frame
                startTime = Date.now()
            }
        }
    }

}
