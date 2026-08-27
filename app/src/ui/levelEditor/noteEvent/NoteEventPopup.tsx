import { useState } from "react"
import type { NoteEvent } from "../../../sound/song/NoteEvent"
import { NumberInput } from "../../input/NumberInput"
import { Popup } from "../../popup/Popup"
import { FormInputField } from "../../form/FormInputField"
import { Button } from "../../button/Button"
import { Rules } from "../../../3d/Rules"
import { Toggle } from "../../toggle/Toggle"

type Editable<T> = {
    value: T | null
    dirty: boolean
}

function initEditable<T>(values: T[]): Editable<T> {
    const first = values[0]
    const allEqual = values.every(value => value === first)
    return { value: allEqual ? first : null, dirty: false }
}

export function NoteEventPopup(props: {
    notes: NoteEvent[],
    onUpdate: () => void,
    close: () => void
}) {
    const notes = props.notes
    const allHaveSlide = notes.length > 0 && notes.every(note => note.slide !== null)

    const [fingerPosition, setFingerPosition] = useState<Editable<number>>(() =>
        initEditable(notes.map(note => note.fingerPosition))
    )
    const [slideConnects, setSlideConnects] = useState<Editable<boolean>>(() =>
        allHaveSlide
            ? initEditable(notes.map(note => note.slide!.connect))
            : { value: false, dirty: false }
    )

    function onSave() {
        for (const note of notes) {
            if (fingerPosition.dirty && fingerPosition.value !== null)
                note.fingerPosition = fingerPosition.value

            if (slideConnects.dirty && note.slide)
                note.slide.connect = slideConnects.value === true
        }

        props.onUpdate()
        props.close()
    }

    const title = notes.length === 1
        ? "Note Event"
        : `Note Events (${notes.length})`

    return <Popup.BaseContainer className="w-[300px]">
        <Popup.BaseTitle title={title} />

        <FormInputField label="Finger position">
            <NumberInput
                name="fingerPosition"
                onChange={value => setFingerPosition({ value, dirty: true })}
                value={fingerPosition.value}
                min={0}
                max={Rules.maxFret}
                step={1}
            />
        </FormInputField>
        {
            allHaveSlide && <FormInputField label="Slide connects">
                <Toggle
                    value={slideConnects.value}
                    onChange={value => setSlideConnects({ value, dirty: true })}
                />
            </FormInputField>
        }

        <Button type="submit" onClick={onSave}>Save</Button>
    </Popup.BaseContainer>
}
