import type { KeyboardEvent } from "react"
import "./StringInput.scss"
import type { FormField } from "../../form/FormField"
import { UiSize } from "../UiSize"

type Props = {
    name?: string,
    value?: string,
    field?: FormField<string, any>,
    onChange?: (value: string) => void,
    autoFocus?: boolean,
    type?: 'text' | 'email',
    size?: UiSize,
    placeholder?: string,
    onBlur?: () => void,
}

export function StringInput(props: Props) {
    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Escape" || e.key === "Enter") {
            e.preventDefault()
            e.currentTarget.blur()
        }
    }

    return <div className="StringInput" data-size={props.size ?? UiSize.M}>
        <input
            type={props.type ?? 'text'}
            value={props.value}
            onChange={e => props.onChange?.(e.target.value)}
            onBlur={props.onBlur}
            autoFocus={props.autoFocus}
            name={props.field?.name ?? props.name}
            placeholder={props.placeholder}
            onKeyDown={onKeyDown}
        />
    </div>
}