import { useEffect, useRef } from "react";
import type { FormField } from "../form/FormField";

export function useFormControl<F extends FormDataEntryValue, T>(
    field: FormField<F, T> | undefined,
    control: FormField.Control,
) {
    const controlRef = useRef<FormField.Control>({})
    controlRef.current.clear = control.clear
    controlRef.current.read = control.read
    controlRef.current.focus = control.focus

    useEffect(() => {
        if (!field)
            return

        return field.attach(controlRef.current)
    }, [field])
}
