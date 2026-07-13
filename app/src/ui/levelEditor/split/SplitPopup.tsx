import { useState } from "react";
import type { PatternEditor } from "../../../components/editor/PatternEditor";
import { Popup } from "../../popup/Popup";
import { NumberInput } from "../../input/NumberInput";
import { Button } from "../../button/Button";
import type { NoteEvent } from "../../../sound/song/NoteEvent";

export function SplitPopup(props: { close: () => void, editor: PatternEditor, note: NoteEvent }) {
    const [count, setCount] = useState(1)

    function onConfirm() {
        if (count === 1) {
            props.close()
            return;
        }

        // Shall insert a new split in the pattern editor
        let offset = 0;
        for (let i = 0; i < count; i++) {
            const targetEnd = i === count ? props.note.duration :
                ((props.note.duration / count) * (i + 1)) | 0

            const duration = targetEnd - offset;

            const note = props.editor.addNote(
                props.note.string,
                props.note.fret,
                props.note.time + offset,
            )
            props.editor.setNoteDuration(note.id, duration)

            offset += duration;
        }

        // Finally remove original note
        props.editor.removeNote(props.note.id)

        props.close()
    }

    return <Popup.BaseContainer>
        <Popup.BaseTitle title="Split Note" />
        <NumberInput
            name="count"
            onChange={setCount}
            value={count}
            min={1}
            step={1}
        />
        <Button onClick={onConfirm}>
            Confirm
        </Button>
    </Popup.BaseContainer>
}