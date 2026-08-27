import type { CSSProperties, MouseEvent } from "react"
import { Instance } from "../../../Instance"
import { PopupManager } from "../../../resources/PopupManager"
import { NoteEventPopup } from "../noteEvent/NoteEventPopup"
import type { PatternEditor } from "../../../components/editor/PatternEditor"
import type { NoteEvent } from "../../../sound/song/NoteEvent"
import type { String } from "../../../sound/instrument/String"
import { Note } from "../../../sound/note/Note"
import { MouseTarget } from "../../../mouse/MouseTarget"
import { MouseTargetType } from "../../../mouse/MouseTargetType"
import "./PatternEditorNoteView.scss"

export function PatternEditorNoteView(props: {
    note: NoteEvent,
    id: string,
    string: String,
    fret: number,
    time: number,
    duration: number,
    editor: PatternEditor,
    selected: boolean
}) {
    const note = props.string.fret(props.fret)

    const noteTarget: MouseTarget.NoteEvent = {
        type: MouseTargetType.NoteEvent,
        editor: props.editor,
        noteEvent: props.note,
    }

    const slideTarget: MouseTarget.NoteSlide = {
        type: MouseTargetType.NoteSlide,
        editor: props.editor,
        noteEvent: props.note,
    }

    const durationEndTarget: MouseTarget.NoteDurationEndResizer = {
        type: MouseTargetType.NoteDurationEndResizer,
        editor: props.editor,
        noteEvent: props.note,
    }

    const slideDurationTarget: MouseTarget.NoteSlideDurationResizer = {
        type: MouseTargetType.NoteSlideDurationResizer,
        editor: props.editor,
        noteEvent: props.note,
    }

    function onDoubleClick(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        const notes = props.editor.selection.has(props.note)
            ? [...props.editor.selection.elements]
            : [props.note]

        Instance.engine.getResource(PopupManager).add(close => <NoteEventPopup
            notes={notes}
            onUpdate={() => props.editor.triggerChanged()}
            close={close}
        />)
    }

    const slideNote = props.note.slide ?
        Note.fromIndex(props.note.string.fret(props.note.slide.fret).index) :
        null;

    return <div
        className="PatternEditorNoteView"
        data-instant={props.duration === 0}
        data-selected={props.selected}
        style={{
            "--color": "#" + props.string.color.getHexString(),
            "--contrast": "#" + props.string.outlineColor.getHexString(),
            "--index": note.index,
            "--ticks": props.time,
            "--duration": props.duration,
            "--slide-duration": props.note.slide?.duration ?? 0,
            "--note-fret": props.note.fret,
            "--slide-fret": props.note.slide?.fret ?? 0,
        } as CSSProperties}
        {...MouseTarget.props(noteTarget)}
        onDoubleClick={onDoubleClick}
    >
        <div
            className="main"
            {...MouseTarget.props(noteTarget)}
        >
            <p>{note.name}{note.octave}</p>
            <div className="fret-hint">{props.fret}</div>
            <div
                className="resizer-right"
                {...MouseTarget.props(props.note.slide ? slideDurationTarget : durationEndTarget)}
            />
        </div>

        {
            props.note.slide && <div
                className="slide"
                {...MouseTarget.props(slideTarget)}
            >
                <p>{slideNote?.name}{slideNote?.octave}</p>
                <div className="fret-hint">{props.note.slide.fret}</div>
                <div
                    className="resizer-right"
                    {...MouseTarget.props(durationEndTarget)}
                />
                <div
                    className="resizer-left"
                    {...MouseTarget.props(slideDurationTarget)}
                />
            </div>
        }
    </div>
}
