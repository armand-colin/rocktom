import { useContext, useEffect, useRef, useState, type KeyboardEvent, type Ref } from "react";
import type { FormField } from "../../../form/FormField";
import { cn } from "../../utils/cn";
import "./OTPInput.scss"
import { OS } from "../../../utils/OS";
import { RefUtils } from "../../../utils/RefUtils";
import { FormContext } from "../../form/FormContext";

export type OTPInputRef = {
    clear(): void
}

export function OTPInput(props: {
    className?: string,
    length: number,
    field?: FormField<string, string>,
    value?: string,
    onChange?: (value: string) => void,
    onComplete?: () => void,
    autoFocus?: boolean,
    ref?: Ref<OTPInputRef>
}) {
    const [value, setValue] = useState<string>(props.value ?? "")
    const { loading } = useContext(FormContext)

    useEffect(() => {
        setValue(props.value ?? "")
    }, [props.value])

    useEffect(() => {
        const input = inputRefs.current[Math.min(value.length, props.length - 1)]
        input?.focus()
    }, [value])

    useEffect(() => {
        if (
            value.length === props.length &&
            props.onComplete
        ) {
            console.log('onSubmit due to complete')
            props.onComplete()
        }
    }, [value.length, props.length, props.onComplete])

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    function onRef(index: number, element: HTMLInputElement | null) {
        inputRefs.current[index] = element
    }

    function onInputChange(index: number, inputValue: string) {
        // Remove all nont-digit chars
        const digits = inputValue.replace(/[^0-9]/g, "")

        if (digits.length === 0) {
            // handled by backspace
            return
        }

        const newValue = value.slice(0, index) + digits + value.slice(index + Math.max(digits.length, 1))

        if (props.onChange)
            props.onChange(newValue)
        else
            setValue(newValue)
    }

    function onKeyDown(_: number, event: KeyboardEvent<HTMLInputElement>) {
        if (event.key !== "Backspace") {
            return
        }

        let newValue: string

        if (OS.isCtrl(event.nativeEvent)) {
            newValue = ""
        } else {
            newValue = value.slice(0, value.length - 1)
        }

        if (props.onChange)
            props.onChange(newValue)
        else
            setValue(newValue)
    }

    RefUtils.forward(props.ref, {
        clear: () => {
            if (props.onChange)
                props.onChange("")
            else
                setValue("")
        }
    })

    const disabled = loading

    useEffect(() => {
        if (disabled) {
            for (let i = 0; i < props.length; i++) {
                const input = inputRefs.current[i]
                input?.blur()
            }
        }
    }, [disabled, props.length])

    return <div className={cn("OTPInput", props.className)}>
        <input type="hidden" name={props.field?.name} value={value} />
        {
            Array(props.length).fill(0).map((_, index) => {
                return <div
                    className="OTPInputItem"
                    key={index}
                >
                    <input
                        type="text"
                        ref={element => onRef(index, element)}
                        value={value?.[index] ?? ""}
                        onChange={e => onInputChange(index, e.target.value)}
                        onKeyDown={e => onKeyDown(index, e)}
                        placeholder="0"
                        inputMode="decimal"
                    />
                </div>
            })
        }
    </div>
}