import { Emitter } from "@niloc/utils"

export class Slider extends Emitter<{ change: number }> {

    private _startX: number = 0
    private _startValue: number = 0

    private _sensibility: number
    private _step: number
    private _min: number
    private _max: number

    constructor(opts: {
        event: MouseEvent | TouchEvent,
        value: number,
        step?: number,
        sensibility?: number
        min?: number,
        max?: number,
    }) {
        super()

        this._startX = getClientX(opts.event)
        this._startValue = 0

        this._sensibility = opts.sensibility ?? opts.step ?? 1
        this._step = opts.step ?? 0.01
        this._min = opts.min ?? -Infinity
        this._max = opts.max ?? Infinity
        this._startValue = opts.value

        window.addEventListener("mouseup", this._onEnd)
        window.addEventListener("mousemove", this._onMouseMove)
        window.addEventListener("touchend", this._onEnd)
        window.addEventListener("touchcancel", this._onEnd)
        window.addEventListener("touchmove", this._onTouchMove, { passive: false })
    }

    private _onMouseMove = (e: MouseEvent) => {
        this._update(e.clientX)
    }

    private _onTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const clientX = getClientX(e)
        this._update(clientX)
    }

    private _update(clientX: number) {
        const deltaX = clientX - this._startX
        let value = this._startValue + (deltaX * this._sensibility)

        value = Math.round(value / this._step) * this._step
        value = Math.min(this._max, Math.max(this._min, value))

        this.emit("change", value)
    }

    private _onEnd = () => {
        this.destroy()
    }

    destroy() {
        window.removeEventListener("mouseup", this._onEnd)
        window.removeEventListener("mousemove", this._onMouseMove)
        window.removeEventListener("touchend", this._onEnd)
        window.removeEventListener("touchcancel", this._onEnd)
        window.removeEventListener("touchmove", this._onTouchMove)
        this.removeAllListeners()
    }

}

function getClientX(event: MouseEvent | TouchEvent): number {
    if ("touches" in event) {
        return event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX ?? 0
    }
    return event.clientX
}
