import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent, type TouchEvent } from "react"
import type { FormField } from "../../form/FormField"
import { useFormControl } from "../../hooks/useFormControl"
import { Slider } from "../../utils/Slider"
import { Icon } from "../icon/Icon"
import { UiSize } from "../UiSize"
import "./NumberInput.scss"

type Props = {
    name: string,
    value: number | null,
    field?: FormField<string, any>,
    step?: number,
    min?: number,
    max?: number,
    sensibility?: number,
    size?: UiSize,
    onChange: (value: number | null) => void,
    autoFocus?: boolean,
    onBlur?: () => void,
    disabled?: boolean,
    className?: string,
    inputClassName?: string,
    hideSlider?: boolean,
}

export function NumberInput(props: Props) {
    const [value, setValue] = useState(props.value === null ? "" : props.value.toString())
    const sliderRef = useRef<Slider | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useFormControl(props.field, {
        clear: () => {
            setValue("")
            props.onChange(null)
        },
        read: () => inputRef.current?.value ?? (props.value === null ? "" : props.value.toString()),
        focus: () => inputRef.current?.focus(),
    })

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        const text = e.target.value
        setValue(text)

        if (text === "") {
            props.onChange(null)
            return
        }

        const number = parseFloat(text)
        if (!isNaN(number))
            props.onChange(number)
    }

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Escape" || e.key === "Enter") {
            e.preventDefault()
            e.currentTarget.blur()
        }
    }

    function startSlider(event: MouseEvent | TouchEvent) {
        event.preventDefault()
        if (props.value === null)
            return

        const slider = new Slider({
            event: event.nativeEvent,
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
        setValue(props.value === null ? "" : props.value.toString())
    }, [props.value])

    return <div className={`NumberInput ${props.className ?? ""}`} data-size={props.size ?? UiSize.Medium}>
        <input
            ref={inputRef}
            type="number"
            name={props.field?.name ?? props.name}
            value={value}
            step={props.step}
            min={props.min}
            max={props.max}
            onChange={onChange}
            onBlur={props.onBlur}
            autoFocus={props.autoFocus}
            onKeyDown={onKeyDown}
            disabled={props.disabled}
            className={props.inputClassName}
            inputMode="numeric"
        />
        {
            !props.hideSlider && (
                <div className="slider" onMouseDown={startSlider} onTouchStart={startSlider}>
                    <Icon name="code" />
                </div>
            )
        }
    </div>
}
