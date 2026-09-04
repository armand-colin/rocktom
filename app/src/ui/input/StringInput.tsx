import type { KeyboardEvent } from "react"
import "./StringInput.scss"
import type { FormField } from "../../form/FormField"
import { UiSize } from "../UiSize"
import { cn } from "../utils/cn"

type Props = {
    name?: string,
    value?: string,
    defaultValue?: string,
    field?: FormField<string, any>,
    onChange?: (value: string) => void,
    autoFocus?: boolean,
    type?: 'text' | 'email',
    size?: UiSize,
    placeholder?: string,
    onBlur?: () => void,
    center?: boolean,
    className?: string,
}

export function StringInput(props: Props) {
    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Escape" || e.key === "Enter") {
            e.preventDefault()
            e.currentTarget.blur()
        }
    }

    return <div
        className={cn("StringInput", props.className)}
        data-size={props.size ?? UiSize.M}
        data-center={!!props.center}
    >
        <input
            type={props.type ?? 'text'}
            value={props.value}
            defaultValue={props.defaultValue}
            onChange={e => props.onChange?.(e.target.value)}
            onBlur={props.onBlur}
            autoFocus={props.autoFocus}
            name={props.field?.name ?? props.name}
            placeholder={props.placeholder}
            onKeyDown={onKeyDown}
        />
    </div>
}