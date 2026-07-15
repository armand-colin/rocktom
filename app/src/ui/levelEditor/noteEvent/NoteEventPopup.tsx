import { useState } from "react"
import type { NoteEvent } from "../../../sound/song/NoteEvent"
import { NumberInput } from "../../input/NumberInput"
import { Popup } from "../../popup/Popup"
import { FormInputField } from "../../form/FormInputField"
import { Button } from "../../button/Button"
import { Rules } from "../../../3d/Rules"

export function NoteEventPopup(props: {
    note: NoteEvent,
    onUpdate: () => void,
    close: () => void
}) {
    const [fingerPosition, setFingerPosition] = useState(props.note.fingerPosition)

    function onSave() {
        props.note.fingerPosition = fingerPosition
        props.onUpdate()
        props.close()
    }

    return <Popup.BaseContainer>
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

        <Button type="submit" onClick={onSave}>Save</Button>
    </Popup.BaseContainer>
}