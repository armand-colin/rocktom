import { useMemo, type CSSProperties } from "react"
import { Rules } from "../../../3d/Rules"
import type { PatternEditor } from "../../../components/editor/PatternEditor"
import type { String } from "../../../sound/instrument/String"
import { Note } from "../../../sound/note/Note"

export function KeyboardNotesView(props: {
    string: String,
    editor: PatternEditor,
    minNote: Note,
    maxNote: Note,
}) {
    const notes = useMemo(() => {
        const notes = []
        for (let i = props.minNote.index; i <= props.maxNote.index; i++)
            notes.push(Note.fromIndex(i))

        return notes
    }, [props.minNote, props.maxNote])

    return notes.map(note => <KeyboardNoteView
        key={note.index}
        note={note}
        string={props.string}
        editor={props.editor}
    />)
}

function KeyboardNoteView(props: { note: Note, string: String, editor: PatternEditor }) {
    const mouse = props.editor.mouse

    return <div
        className="KeyboardNoteView"
        data-available={props.note.index >= props.string.note.index && props.note.index <= props.string.fret(Rules.maxFret).index}
        style={{
            "--index": props.note.index,
            "--color": "#" + props.string.color.getHexString(),
            "--contrast": "#" + props.string.outlineColor.getHexString(),
        } as CSSProperties}

        onMouseDown={e => mouse.onKeyboardNoteMouseDown(e.nativeEvent, props.note)}
        onMouseEnter={e => mouse.onKeyboardNoteMouseEnter(e.nativeEvent, props.note)}
        onMouseLeave={() => mouse.onKeyboardNoteMouseLeave()}
    >
        {props.note.name}{props.note.octave}
    </div>
}
