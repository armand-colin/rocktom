import { useState } from "react"
import { FormInputField } from "../form/FormInputField"
import { StringInput } from "../input/StringInput"
import { UiSize } from "../UiSize"
import { Pill, PillTheme } from "./Pill"

export default {
    title: "UI/Pill",
    component: Pill,
}

export const Main = () => {
    const [label, setLabel] = useState("Label")

    return (
        <div className="grid gap-6" style={{ maxWidth: 480 }}>
            <FormInputField label="Label">
                <StringInput
                    name="label"
                    value={label}
                    onChange={setLabel}
                />
            </FormInputField>

            <div className="grid gap-3">
                <div
                    className="grid items-center gap-3"
                    style={{ gridTemplateColumns: "48px repeat(3, max-content)" }}
                >
                    <span />
                    {PillTheme.values.map(theme => (
                        <span key={theme} className="text-body-xs text-grey-300">
                            {theme}
                        </span>
                    ))}
                </div>
                {UiSize.values.map(size => (
                    <div
                        key={size}
                        className="grid items-center gap-3"
                        style={{ gridTemplateColumns: "48px repeat(3, max-content)" }}
                    >
                        <span className="text-body-xs text-grey-300">{size}</span>
                        {PillTheme.values.map(theme => (
                            <Pill
                                key={theme}
                                label={label}
                                size={size}
                                theme={theme}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
