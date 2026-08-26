import type { CSSProperties, MouseEvent } from "react"
import { Instance } from "../../../Instance"
import { PopupManager } from "../../../resources/PopupManager"
import { NoteEventPopup } from "../noteEvent/NoteEventPopup"
import type { PatternEditor } from "../../../components/editor/PatternEditor"
import type { NoteEvent } from "../../../sound/song/NoteEvent"
import type { String } from "../../../sound/instrument/String"
import { Note } from "../../../sound/note/Note"
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
    const mouse = props.editor.mouse

    function dispatchNative(
        e: MouseEvent,
        action: (nativeEvent: globalThis.MouseEvent) => void
    ) {
        // React synthetic bubbling is separate from native stopPropagation —
        // must stop here so resizers don't also hit note/slide/grid handlers.
        e.preventDefault()
        e.stopPropagation()
        action(e.nativeEvent)
    }

    function onDoubleClick(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        const notes = props.editor.selection.has(props.note)
            ? [...props.editor.selection.elements]
            : [props.note]

        Instance.engine.getResource(PopupManager).add(close => <NoteEventPopup
            notes={notes}
            onUpdate={() => props.editor.changed()}
            close={close}
        />)
    }

    function onClick(e: MouseEvent) {
        e.stopPropagation()
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
        onContextMenu={e => dispatchNative(e, nativeEvent => mouse.onNoteContextMenu(nativeEvent, props.note))}
        onMouseEnter={e => mouse.onNoteMouseEnter(e.nativeEvent, props.note)}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
    >
        <div
            className="main"
            onMouseDown={e => dispatchNative(e, nativeEvent => mouse.onNoteMouseDown(nativeEvent, props.note))}
        >
            <p>{note.name}{note.octave}</p>
            <div className="fret-hint">{props.fret}</div>
            <div className="resizer-right" onMouseDown={e => dispatchNative(e, nativeEvent => {
                if (props.note.slide)
                    mouse.onResizeSlideDuration(nativeEvent, props.note)
                else
                    mouse.onResizeDuration(nativeEvent, props.note)
            })} />
        </div>

        {
            props.note.slide && <div
                className="slide"
                onMouseDown={e => dispatchNative(e, nativeEvent => mouse.onSlideMouseDown(nativeEvent, props.note))}
            >
                <p>{slideNote?.name}{slideNote?.octave}</p>
                <div className="fret-hint">{props.note.slide.fret}</div>
                <div className="resizer-right" onMouseDown={e => dispatchNative(e, nativeEvent => mouse.onResizeDuration(nativeEvent, props.note))}></div>
                <div className="resizer-left" onMouseDown={e => dispatchNative(e, nativeEvent => mouse.onResizeSlideDuration(nativeEvent, props.note))}></div>
            </div>
        }
    </div>
}
