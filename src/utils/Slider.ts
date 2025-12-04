import { Emitter } from "@niloc/utils"

export class Slider extends Emitter<{ change: number }> {

    private _startX: number = 0
    private _startValue: number = 0

    private _sensibility: number
    private _step: number
    private _min: number
    private _max: number

    constructor(opts: {
        event: MouseEvent,
        value: number,
        step?: number,
        sensibility?: number
        min?: number,
        max?: number,
    }) {
        super()

        this._startX = opts.event.clientX
        this._startValue = 0

        this._sensibility = opts.sensibility ?? opts.step ?? 1
        this._step = opts.step ?? 0.01
        this._min = opts.min ?? -Infinity
        this._max = opts.max ?? Infinity
        this._startValue = opts.value

        window.addEventListener("mouseup", this._onMouseUp)
        window.addEventListener("mousemove", this._onMouseMove)
    }

    private _onMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - this._startX
        let value = this._startValue + (deltaX * this._sensibility)

        value = Math.round(value / this._step) * this._step
        value = Math.min(this._max, Math.max(this._min, value))

        this.emit("change", value)
    }

    private _onMouseUp = () => {
        this.destroy()
    }

    destroy() {
        window.removeEventListener("mouseup", this._onMouseUp)
        window.removeEventListener("mousemove", this._onMouseMove)
        this.removeAllListeners()
    }

}