import { useState } from "react";
import { Dropdown } from "./Dropdown";
import { UiSize } from "../UiSize";
import { StringInput } from "../input/StringInput";

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
    },
    {
        label: 'A very very long option to test text truncation even for xs size wich may need quite a lot of characters',
        value: 'option4'
    }
]

export const Default = () => {
    const [simpleValue, setSimpleValue] = useState<Dropdown.Option | null>(null)
    const [placeholder, setPlaceholder] = useState<string>('Select an option')

    return <div className="grid gap-2">
        <StringInput 
            value={placeholder}
            onChange={setPlaceholder}
        />
        {
            UiSize.values.map(size => (
                <Dropdown<Dropdown.Option>
                    options={simpleOptions}
                    value={simpleValue?.value ?? null}
                    onChange={setSimpleValue}
                    placeholder={placeholder}
                    size={size}
                    className="w-100"
                />
            ))
        }
    </div>
}