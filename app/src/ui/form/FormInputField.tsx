import { useContext, type ReactNode } from "react"
import type { FormField } from "../../form/FormField"
import "./FormInputField.scss"
import { FormContext } from "./FormContext"

type Props = {
    label?: ReactNode,
    field?: FormField<FormDataEntryValue, any>,
    error?: ReactNode,
    children?: ReactNode,
    className?: string,
    contentClassName?: string,
    disabled?: boolean,
    hideLabel?: boolean
}

export function FormInputField(props: Props) {
    const label = props.label ?? props.field?.name
    const { loading } = useContext(FormContext)

    return <div
        className={
            "FormInputField" +
            (props.className ? ` ${props.className}` : "")
        }
        data-has-error={Boolean(props.error)}
        data-disabled={props.disabled || loading}
    >
        {label && !props.hideLabel && <div className="label">{label}</div>}

        <div className={`content ${props.contentClassName ?? ""}`}>
            {props.children}
        </div>

        {
            props.error ?
                <div className="FormInputFieldError" aria-live="polite">
                    {props.error}
                </div> :
                null
        }
    </div>
}
