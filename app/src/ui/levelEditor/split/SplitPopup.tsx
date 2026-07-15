import { useState } from "react";
import type { PatternEditor } from "../../../components/editor/PatternEditor";
import { Popup } from "../../popup/Popup";
import { NumberInput } from "../../input/NumberInput";
import { Button } from "../../button/Button";
import type { NoteEvent } from "../../../sound/song/NoteEvent";
import { FormInputField } from "../../form/FormInputField";

export function SplitPopup(props: {
    close: () => void,
    editor: PatternEditor,
    notes: NoteEvent[]
}) {
    const [count, setCount] = useState(1)
    const [durationRatio, setDurationRatio] = useState(1)

    function onConfirm() {
        if (count === 1) {
            props.close()
            return;
        }

        // Shall insert a new split in the pattern editor
        for (const note of props.notes) {
            let offset = 0;
            for (let i = 0; i < count; i++) {
                const targetEnd = i === count ? note.duration :
                    ((note.duration / count) * (i + 1)) | 0

                const duration = targetEnd - offset;

                const newNote = props.editor.addNote(
                    note.string,
                    note.fret,
                    note.time + offset,
                )
                props.editor.setNoteDuration(newNote.id, (duration * durationRatio) | 0)

                offset += duration;
            }

            // Finally remove original note
            props.editor.removeNote(note.id)
        }

        props.close()
    }

    return <Popup.BaseContainer>
        <Popup.BaseTitle title="Split Note" />

        <FormInputField label="Subdivisions count">
            <NumberInput
                name="count"
                onChange={setCount}
                value={count}
                min={1}
                step={1}
            />
        </FormInputField>

        <FormInputField label="Duration ratio">
            <NumberInput
                name="durationRatio"
                onChange={setDurationRatio}
                value={durationRatio}
                min={0}
                max={1}
                step={0.01}
            />
        </FormInputField>

        <Button onClick={onConfirm}>
            Confirm
        </Button>
    </Popup.BaseContainer>
}