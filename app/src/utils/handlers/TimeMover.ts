import { Emitter } from "@niloc/utils";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { Handler } from "./Handler";

export class TimeMover implements Handler {

    private _startX: number
    private _startTicks: number
    private _transform: TimeTransform
    private _minTicks: number
    private _maxTicks: number

    readonly events = new Emitter<{ change: number }>()

    constructor(opts: {
        event: MouseEvent,
        startTicks: number,
        transform: TimeTransform,
        minTicks?: number,
        maxTicks?: number
    }) {
        this._startX = opts.event.clientX
        this._startTicks = opts.startTicks
        this._transform = opts.transform
        this._minTicks = opts.minTicks ?? 0
        this._maxTicks = opts.maxTicks ?? Infinity

        window.addEventListener("mousemove", this._onMouseMove)
        window.addEventListener("mouseup", this._onMouseUp)
    }

    private _onMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - this._startX
        const deltaTicks = deltaX / this._transform.ratio
        let ticks = this._startTicks + deltaTicks
        ticks = Math.max(this._minTicks, ticks)
        ticks = Math.min(this._maxTicks, ticks)
        ticks = this._transform.magnetize(ticks)

        this.events.emit('change', ticks)
    }

    private _onMouseUp = () => {
        this.destroy()
    }

    destroy() {
        window.removeEventListener("mousemove", this._onMouseMove)
        window.removeEventListener("mouseup", this._onMouseUp)
    }

}