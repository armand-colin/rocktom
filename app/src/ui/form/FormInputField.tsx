import type { ReactNode } from "react"
import type { FormField } from "../../form/FormField"
import "./FormInputField.scss"

type Props = {
    label?: ReactNode,
    field?: FormField<FormDataEntryValue, any>,
    error?: ReactNode,
    children: ReactNode,
    className?: string,
}

export function FormInputField(props: Props) {
    const label = props.label ?? props.field?.name

    return <div
        className={
            "FormInputField" +
            (props.className ? ` ${props.className}` : "")
        }
        data-has-error={Boolean(props.error)}
    >
        {label && <div className="label">{label}</div>}
        <div className="control">
            {props.children}
        </div>
        {/* Error rendering is intentionally deferred, but the slot/API is ready. */}
        <div className="error-slot" aria-live="polite" />
    </div>
}
