import { Component, Engine } from "@niloc/ecs";
import { lerp } from "three/src/math/MathUtils.js";
import { Tempo } from "../../sound/Tempo";
import { OS } from "../../utils/OS";

export type TimeMarker = {
    ticks: number,
    name: string,
    type: "bar" | "beat" | "other"
}

export class TimeTransform extends Component {

    private _ratio: number = 1
    private _offset: number = 0
    private _hardOffset: number = 0
    private _step: number | null = Tempo.beats(1 / 4)

    constructor(engine: Engine) {
        super(engine)
    }

    get ratio() {
        return this._ratio
    }

    get offset() {
        return this._offset
    }

    get hardOffset() {
        return this._hardOffset
    }

    magnetize(ticks: number) {
        const step = this._step ?? 1

        const min = ticks - (ticks % step)
        const max = min + step

        if (ticks - min < max - ticks)
            return min
        else
            return max
    }

    getTicksAt(ticks: number) {
        let targetTicks = ticks - this._offset - this._hardOffset
        targetTicks = this.magnetize(targetTicks)
        return targetTicks
    }

    *getMarkers(pixelWidth: number, minSpace: number = 150, maxSpace: number = 400): IterableIterator<TimeMarker> {
        let start = -this._offset
        let end = -this._offset + pixelWidth / this._ratio
        let step = Tempo.bars(1)

        while (step * this.ratio > maxSpace) {
            step /= 2
        }

        while (step * this.ratio < minSpace) {
            step *= 2
        }

        start = start - (start % step)
        end = end - (end % step) + step

        let i = start
        while (i < end) {
            yield {
                ticks: i,
                name: Math.trunc(i / Tempo.bars(1)).toString(),
                type: i % Tempo.bars(1) === 0 ? "bar" : i % Tempo.beats(1) === 0 ? "beat" : "other"
            }

            i += step
        }
    }

    setHardOffset(offset: number) {
        this._hardOffset = offset
        this.changed()
    }

    setRatio(ratio: number) {
        this._ratio = ratio
        this.changed()
    }

    setOffset(offset: number) {
        this._offset = offset
        this.changed()
    }

    handleWheel(event: WheelEvent, container: HTMLElement) {
        if (OS.isCtrl(event)) {
            this._handleZoom(event, container)
        } else {
            this._handlePan(event)
        }
    }

    private _handleZoom(event: WheelEvent, container: HTMLElement) {
        const delta = event.deltaY
        const percentChange = 1 - delta * 0.001

        const mouseX = event.clientX

        const rect = container.getBoundingClientRect()
        const offsetX = mouseX - rect.left

        // Shall zoom centered on ticksAtMouse
        let ratio = this.ratio
        ratio = ratio * percentChange
        ratio = Math.max(0.01, Math.min(10, ratio))

        // New offset to keep ticksAtMouse under the mouse
        const previousWidth = rect.width / this.ratio
        const width = rect.width / ratio
        const mouseT = offsetX / rect.width
        const offsetDelta = lerp(0, width - previousWidth, mouseT)

        let offset = this.offset + offsetDelta
        offset = Math.min(0, offset)

        this._offset = offset
        this._ratio = ratio
        this.changed()
    }

    private _handlePan(event: WheelEvent) {
        const delta = -event.deltaX

        let offset = this.offset
        offset = offset + delta / this.ratio
        offset = Math.min(0, offset)

        this._offset = offset
        this.changed()
    }

}