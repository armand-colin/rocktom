import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from "react"
import { Slider } from "../../utils/Slider"
import { Icon } from "../icon/Icon"
import "./NumberInput.scss"

type Props = {
    name: string,
    value: number,
    step?: number,
    min?: number,
    max?: number,
    sensibility?: number,
    onChange: (value: number) => void,
    autoFocus?: boolean,
    onBlur?: () => void,
}

export function NumberInput(props: Props) {
    const [value, setValue] = useState(props.value.toString())
    const sliderRef = useRef<Slider | null>(null)

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        setValue(e.target.value)
        const number = parseFloat(e.target.value)
        if (!isNaN(number))
            props.onChange(number)
    }

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Escape" || e.key === "Enter") {
            e.preventDefault()
            e.currentTarget.blur()
        }
    }

    function onMouseDown(e: MouseEvent) {
        e.preventDefault()
        const slider = new Slider({
            event: e.nativeEvent,
            value: props.value,
            step: props.step,
            min: props.min,
            max: props.max,
            sensibility: props.sensibility,
        })

        if (sliderRef.current)
            sliderRef.current.destroy()

        sliderRef.current = slider

        slider.on("change", (value: number) => {
            props.onChange(value)
        })
    }

    useEffect(() => {
        return () => {
            sliderRef.current?.destroy()
            sliderRef.current = null
        }
    }, [])

    useEffect(() => {
        setValue(props.value.toString())
    }, [props.value])

    return <div className="NumberInput">
        <input
            type="number"
            name={props.name}
            value={value}
            step={props.step}
            min={props.min}
            max={props.max}
            onChange={onChange}
            onBlur={props.onBlur}
            autoFocus={props.autoFocus}
            onKeyDown={onKeyDown}
        />
        <div className="slider" onMouseDown={onMouseDown}>
            <Icon name="code" />
        </div>
    </div>
}