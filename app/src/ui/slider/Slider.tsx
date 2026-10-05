import { Emitter } from "@niloc/utils"
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react"
import "./Slider.scss"

export type SliderScale = {
    transform: (t: number) => number,
    inverse: (t: number) => number,
}

export const SliderScale = {
    identity: {
        transform: (t: number) => t,
        inverse: (t: number) => t,
    } as SliderScale,
    exponential: (exponent: number): SliderScale => ({
        transform: (t: number) => Math.pow(t, exponent),
        inverse: (t: number) => Math.pow(t, 1 / exponent),
    }),
    logarithmic: (base: number): SliderScale => ({
        transform: (t: number) => Math.log(1 + (base - 1) * t) / Math.log(base),
        inverse: (t: number) => (Math.pow(base, t) - 1) / (base - 1),
    }),
}

type Props = {
    value: number,
    onChange: (value: number) => void,
    min: number,
    max: number,
    step?: number,
    scale?: SliderScale,
    className?: string,
    disabled?: boolean,
}

type HandlerOpts = {
    event: PointerEvent,
    min: number,
    max: number,
    value: number,
    scale: SliderScale,
    container: HTMLElement,
    step?: number,
}

class SliderHandler extends Emitter<{ change: number, end: void }> {

    private _startX: number

    private _min: number
    private _max: number
    private _value: number
    private _scale: SliderScale
    private _container: HTMLElement
    private _step?: number
    private _pointerId: number

    static fromHarshTransition(opts: HandlerOpts) {
        // Shall get the knob to the pointer position immediately.
        const rect = opts.container.getBoundingClientRect()
        const deltaX = opts.event.clientX - rect.left
        const t = deltaX / rect.width
        let value = opts.scale.transform(t)
        value = opts.min + value * (opts.max - opts.min)

        if (opts.step !== undefined)
            value = Math.round(value / opts.step) * opts.step
        
        value = Math.max(opts.min, Math.min(opts.max, value))
        opts.value = value

        return new SliderHandler(opts)
    }

    constructor(opts: HandlerOpts) {
        super()
        this._startX = opts.event.clientX
        this._min = opts.min
        this._max = opts.max
        this._value = opts.value
        this._scale = opts.scale
        this._container = opts.container
        this._step = opts.step
        this._pointerId = opts.event.pointerId

        this._container.setPointerCapture(this._pointerId)

        window.addEventListener("pointermove", this._onPointerMove)
        window.addEventListener("pointerup", this._onPointerUp)
        window.addEventListener("pointercancel", this._onPointerUp)
    }

    get value() {
        return this._value
    }

    destroy() {
        if (this._container.hasPointerCapture(this._pointerId))
            this._container.releasePointerCapture(this._pointerId)

        window.removeEventListener("pointermove", this._onPointerMove)
        window.removeEventListener("pointerup", this._onPointerUp)
        window.removeEventListener("pointercancel", this._onPointerUp)
        this.removeAllListeners()
    }

    private _onPointerMove = (event: globalThis.PointerEvent) => {
        if (event.pointerId !== this._pointerId)
            return

        // Go from value to t: use scale.
        const deltaX = event.clientX - this._startX
        const rect = this._container.getBoundingClientRect()

        const currentT = this._scale.inverse(
            (this._value - this._min) / (this._max - this._min)
        )

        let nextT = currentT + deltaX / rect.width
        nextT = Math.max(0, Math.min(1, nextT))

        let value = this._scale.transform(nextT)
        value = this._min + value * (this._max - this._min)
        if (this._step !== undefined)
            value = Math.round(value / this._step) * this._step

        value = Math.max(this._min, Math.min(this._max, value))
        this.emit("change", value)
    }

    private _onPointerUp = (event: globalThis.PointerEvent) => {
        if (event.pointerId !== this._pointerId)
            return

        this.emit("end")
        this.destroy()
    }

}

export function Slider(props: Props) {
    const rawT = (props.value - props.min) / (props.max - props.min)
    const t = props.scale ? props.scale.inverse(rawT) : rawT
    const handler = useRef<SliderHandler | null>(null)
    const container = useRef<HTMLDivElement | null>(null)
    const [active, setActive] = useState(false)

    function onKnobPointerDown(event: PointerEvent) {
        event.stopPropagation()
        event.preventDefault()

        if (handler.current)
            handler.current.destroy()

        if (!container.current)
            return

        setActive(true)
        handler.current = new SliderHandler({
            event,
            min: props.min,
            max: props.max,
            value: props.value,
            scale: props.scale ?? SliderScale.identity,
            container: container.current,
            step: props.step
        })
        
        handler.current.on("change", props.onChange)
        handler.current.on("end", () => setActive(false))
    }
    
    function onPointerDown(event: PointerEvent) {
        event.stopPropagation()
        event.preventDefault()
        
        if (handler.current)
            handler.current.destroy()
        
        if (!container.current)
            return
        
        setActive(true)
        handler.current = SliderHandler.fromHarshTransition({
            event,
            min: props.min,
            max: props.max,
            value: props.value,
            scale: props.scale ?? SliderScale.identity,
            container: container.current,
            step: props.step
        })
        
        handler.current.on("change", props.onChange)
        handler.current.on("end", () => setActive(false))

        props.onChange(handler.current.value)
    }

    useEffect(() => {
        return () => {
            handler.current?.destroy()
            handler.current = null
        }
    }, [])

    return <div
        className={`Slider ${props.className}`}
        style={{
            "--t": t
        } as CSSProperties}
        ref={container}
        aria-disabled={props.disabled}
        data-active={active}
        onPointerDown={onPointerDown}
    >
        <div className="before"></div>
        <div
            className="knob"
            onPointerDown={onKnobPointerDown}
        ></div>
    </div>
}
