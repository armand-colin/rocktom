import { useMemo, type CSSProperties } from "react"
import { Rules } from "../../../3d/Rules"
import type { PatternEditor } from "../../../components/editor/PatternEditor"
import type { String } from "../../../sound/instrument/String"
import { Note } from "../../../sound/note/Note"
import { MouseTarget } from "../../../mouse/MouseTarget"
import { MouseTargetType } from "../../../mouse/MouseTargetType"

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
    const target: MouseTarget.PatternEditorKeyboard = {
        type: MouseTargetType.PatternEditorKeyboard,
        editor: props.editor,
        note: props.note,
    }

    return <div
        className="KeyboardNoteView"
        data-mouse-target={MouseTargetType.PatternEditorKeyboard}
        data-available={props.note.index >= props.string.note.index && props.note.index <= props.string.fret(Rules.maxFret).index}
        style={{
            "--index": props.note.index,
            "--color": "#" + props.string.color.getHexString(),
            "--contrast": "#" + props.string.outlineColor.getHexString(),
        } as CSSProperties}
        {...MouseTarget.props(target)}
    >
        {props.note.name}{props.note.octave}
    </div>
}
