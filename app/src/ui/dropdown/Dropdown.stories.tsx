import { useState } from "react";
import { Dropdown } from "./Dropdown";
import { UiSize } from "../UiSize";

export default {
    title: 'Dropdown',
    component: Dropdown,
}

const simpleOptions: Dropdown.Option[] = [
    {
        label: 'Option 1',
        value: 'option1'
    },
    {
        label: 'Option 2',
        value: 'option2'
    },
    {
        label: 'Option 3',
        value: 'option3'
    }
]

export const Default = () => {
    const [simpleValue, setSimpleValue] = useState<Dropdown.Option | null>(null)

    return <div className="grid gap-2">
        <Dropdown<Dropdown.Option>
            options={simpleOptions}
            value={simpleValue?.value ?? null}
            onChange={setSimpleValue}
            placeholder="Select an option"
        />
        <Dropdown<Dropdown.Option>
            options={simpleOptions}
            value={simpleValue?.value ?? null}
            onChange={setSimpleValue}
            placeholder="Select an option"
            size={UiSize.S}
        />
    </div>
}