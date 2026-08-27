import { useMemo, type CSSProperties, type MouseEvent } from "react"
import { Rules } from "../../../3d/Rules"
import type { VirtualBass } from "../../../components/VirtualBass"
import type { String } from "../../../sound/instrument/String"
import { Note } from "../../../sound/note/Note"
import { MouseButtons } from "../../../utils/MouseButtons"

export function KeyboardNotesView(props: {
    string: String,
    instrument: VirtualBass,
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
        instrument={props.instrument}
    />)
}

function KeyboardNoteView(props: { note: Note, string: String, instrument: VirtualBass }) {
    function play(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        if (e.buttons === MouseButtons.Left)
            props.instrument.playNote(props.note)
    }

    function stop(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        props.instrument.stopNote(props.note)
    }

    return <div
        className="KeyboardNoteView"
        data-available={props.note.index >= props.string.note.index && props.note.index <= props.string.fret(Rules.maxFret).index}
        style={{
            "--index": props.note.index,
            "--color": "#" + props.string.color.getHexString(),
            "--contrast": "#" + props.string.outlineColor.getHexString(),
        } as CSSProperties}

        onMouseDown={play}
        onMouseUp={stop}
        onMouseLeave={stop}
        onMouseEnter={play}
    >
        {props.note.name}{props.note.octave}
    </div>
}
