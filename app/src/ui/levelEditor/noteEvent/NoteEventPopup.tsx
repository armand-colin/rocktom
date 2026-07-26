import { useState } from "react"
import type { NoteEvent } from "../../../sound/song/NoteEvent"
import { NumberInput } from "../../input/NumberInput"
import { Popup } from "../../popup/Popup"
import { FormInputField } from "../../form/FormInputField"
import { Button } from "../../button/Button"
import { Rules } from "../../../3d/Rules"
import { Toggle } from "../../toggle/Toggle"

export function NoteEventPopup(props: {
    note: NoteEvent,
    onUpdate: () => void,
    close: () => void
}) {
    const [fingerPosition, setFingerPosition] = useState(props.note.fingerPosition)
    const [slideConnects, setSlideConnects] = useState(props.note.slide?.connect ?? false)

    function onSave() {
        props.note.fingerPosition = fingerPosition

        if (props.note.slide) {
            props.note.slide.connect = slideConnects
        }

        props.onUpdate()
        props.close()
    }

    return <Popup.BaseContainer className="w-[300px]">
        <Popup.BaseTitle title="Note Event" />

        <FormInputField label="Finger position">
            <NumberInput
                name="fingerPosition"
                onChange={setFingerPosition}
                value={fingerPosition}
                min={0}
                max={Rules.maxFret}
                step={1}
            />
        </FormInputField>
        {
            props.note.slide && <FormInputField label="Slide connects">
                <Toggle 
                    value={slideConnects}
                    onChange={setSlideConnects}
                />
            </FormInputField>
        }

        <Button type="submit" onClick={onSave}>Save</Button>
    </Popup.BaseContainer>
}