import { Emitter } from "@niloc/utils"
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react"
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
    event: MouseEvent,
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

    static fromHarshTransition(opts: HandlerOpts) {
        // Shall get the knob to the mouse position immediately.
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

        window.addEventListener("mousemove", this._onMouseMove)
        window.addEventListener("mouseup", this._onMouseUp)
    }

    get value() {
        return this._value
    }

    destroy() {
        window.removeEventListener("mousemove", this._onMouseMove)
        window.removeEventListener("mouseup", this._onMouseUp)
        this.removeAllListeners()
    }

    private _onMouseMove = (event: globalThis.MouseEvent) => {
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

    private _onMouseUp = () => {
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

    function onKnobMouseDown(event: MouseEvent) {
        event.stopPropagation()

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
    
    function onMouseDown(event: MouseEvent) {
        event.stopPropagation()
        
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
        onMouseDown={onMouseDown}
    >
        <div className="before"></div>
        <div
            className="knob"
            onMouseDown={onKnobMouseDown}
        ></div>
    </div>
}