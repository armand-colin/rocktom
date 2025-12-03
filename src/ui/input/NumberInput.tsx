import { useEffect, useState, type ChangeEvent } from "react"
import "./NumberInput.scss"

type Props = {
    name: string,
    value: number,
    step?: number,
    min?: number,
    max?: number,
    onChange: (value: number) => void
}

export function NumberInput(props: Props) {
    const [value, setValue] = useState(props.value.toString())

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        setValue(e.target.value)
        const number = parseFloat(e.target.value)
        if (!isNaN(number))
            props.onChange(number)
    }

    useEffect(() => {
        setValue(props.value.toString())
    }, [props.value])

    return <input
        className="NumberInput"
        type="number"
        name={props.name}
        value={value}
        step={props.step}
        min={props.min}
        max={props.max}
        onChange={onChange}
    />
}