import { Emitter } from "@niloc/utils";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { Handler } from "./Handler";

export class TimeResizer implements Handler {

    private _startX: number
    private _startDuration: number
    private _transform: TimeTransform

    readonly events = new Emitter<{ changed: number }>()

    constructor(opts: {
        event: MouseEvent,
        duration: number,
        transform: TimeTransform
    }) {
        this._startX = opts.event.clientX
        this._startDuration = opts.duration
        this._transform = opts.transform

        window.addEventListener("mousemove", this._onMouseMove)
        window.addEventListener("mouseup", this._onMouseUp)
    }

    private _onMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - this._startX
        const deltaTicks = deltaX / this._transform.ratio
        let duration = this._startDuration + deltaTicks
        duration = Math.max(0, duration)
        duration = this._transform.magnetize(duration)

        this.events.emit('changed', duration)
    }

    private _onMouseUp = () => {
        this.destroy()
    }

    destroy() {
        window.removeEventListener("mousemove", this._onMouseMove)
        window.removeEventListener("mouseup", this._onMouseUp)
    }

}