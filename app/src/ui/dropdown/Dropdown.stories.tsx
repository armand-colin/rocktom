import { useState } from "react";
import { Dropdown } from "./Dropdown";
import { UiSize } from "../UiSize";
import { StringInput } from "../input/StringInput";
import { Popup } from "../popup/Popup";
import "../popup/Popup.scss";
import { usePopupManager } from "../../hooks/usePopupManager";
import { Button } from "../button/Button";

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
    const [popupValue, setPopupValue] = useState<Dropdown.Option | null>(null)
    const [placeholder, setPlaceholder] = useState<string>('Select an option')
    const popupManager = usePopupManager()

    function pop() {
        popupManager.add(close => <Popup.BaseContainer size="md">
            <Popup.BaseTitle title="Scrollable popup shell" close={close} />
            <Popup.BaseContent>
                <Dropdown<Dropdown.Option>
                    options={simpleOptions}
                    value={popupValue?.value ?? null}
                    onChange={setPopupValue}
                    placeholder={placeholder}
                />
            </Popup.BaseContent>
        </Popup.BaseContainer>)
    }

    return <div className="grid gap-2">
        <StringInput
            value={placeholder}
            onChange={setPlaceholder}
        />
        {
            UiSize.values.map(size => (
                <Dropdown<Dropdown.Option>
                    key={size}
                    options={simpleOptions}
                    value={simpleValue?.value ?? null}
                    onChange={setSimpleValue}
                    placeholder={placeholder}
                    size={size}
                    className="w-100"
                />
            ))
        }
        <Button onClick={pop}>Popup</Button>
    </div>
}