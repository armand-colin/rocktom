import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react"
import { Instance } from "../../../Instance"
import { PopupManager } from "../../../resources/PopupManager"
import { Handler } from "../../../utils/handlers/Handler"
import { NoteMover } from "../../../utils/handlers/NoteMover"
import { TimeMover } from "../../../utils/handlers/TimeMover"
import { MouseButtons } from "../../../utils/MouseButtons"
import { NoteEventPopup } from "../noteEvent/NoteEventPopup"
import { MoveSlide } from "../../../components/editor/actions/MoveSlide"
import { ResizeNoteSlideDuration } from "../../../components/editor/actions/ResizeNoteSlideDuration"
import { ResizeNoteDuration } from "../../../components/editor/actions/ResizeNoteDuration"
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
    const handler = useRef<Handler | null>(null)

    function onContextMenu(e: React.MouseEvent<HTMLDivElement>) {
        e.stopPropagation()
        e.preventDefault()
        props.editor.removeNote(props.id)
    }

    function onEnter(e: React.MouseEvent<HTMLDivElement>) {
        // if right click is pressed while entering
        if (e.buttons & MouseButtons.Right) {
            e.preventDefault()
            props.editor.removeNote(props.id)
        }
    }

    function onSelect(e: MouseEvent) {
        if (e.shiftKey) {
            props.editor.selection.add(props.note)
        } else {
            if (!props.editor.selection.has(props.note)) {
                props.editor.selection.set([props.note])
            }
        }
    }

    function onResizeDuration(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        const resizer = ResizeNoteDuration.start({
            event: e.nativeEvent,
            editor: props.editor,
            note: props.note
        })

        if (resizer) {
            handler?.current?.destroy()
            handler.current = resizer;
        }
    }

    function onResizeSlideDuration(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        const resizer = ResizeNoteSlideDuration.start({
            event: e.nativeEvent,
            editor: props.editor,
            note: props.note
        })

        if (resizer) {
            handler?.current?.destroy()
            handler.current = resizer;
        }
    }

    function onMiddleMouseDown(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        props.editor.selectNote(props.id)
        const string = props.string
        const note = props.string.fret(props.fret)

        for (let i = 1; i < props.editor.pattern.instrument.strings.length; i++) {
            const index = (string.index + i) % props.editor.pattern.instrument.strings.length
            const newString = props.editor.pattern.instrument.strings[index]
            if (newString.canPlay(note)) {
                props.editor.setNoteString(props.id, newString)
                return
            }
        }
    }

    function onSlideMouseDown(e: MouseEvent) {
        if (e.buttons === MouseButtons.Middle) {
            onMiddleMouseDown(e);
            return;
        }

        if (e.buttons === MouseButtons.Left) {
            e.preventDefault()
            e.stopPropagation()

            onSelect(e);

            const mover = MoveSlide.start({
                event: e.nativeEvent,
                editor: props.editor,
                note: props.note
            })

            if (mover) {
                handler.current?.destroy()
                handler.current = mover;
            }
        }
    }

    function onMainMouseDown(e: MouseEvent) {
        if (e.buttons === MouseButtons.Middle) {
            onMiddleMouseDown(e);
            return;
        }

        if (e.buttons === MouseButtons.Left) {
            e.preventDefault()
            e.stopPropagation()

            handler.current?.destroy()

            onSelect(e);

            const minTimeNote = props.editor.selection.elements.reduce<NoteEvent | null>((min, note) => {
                if (!min || note.time < min.time)
                    return note
                return min
            }, null)

            if (!minTimeNote) {
                return;
            }

            const baseTime = minTimeNote.time
            const deltas: Record<string, number> = {}

            for (const note of props.editor.selection.elements) {
                deltas[note.id] = note.time - baseTime
            }

            const handlers: Handler[] = []
            if (props.editor.selection.elements.length === 1) {
                // We can add note mover
                const noteMover = new NoteMover({
                    event: e.nativeEvent,
                    startNote: note,
                    transform: props.editor.noteTransform,
                    string: props.string
                })
                noteMover.events.on("change", note => props.editor.setNoteNote(props.id, note))
                handlers.push(noteMover)
            }

            const timeMover = new TimeMover({
                event: e.nativeEvent,
                startTicks: minTimeNote.time,
                transform: props.editor.transform,
                minTicks: 0
            })

            timeMover.events.on('change', time => {
                for (const note of props.editor.selection.elements) {
                    const delta = deltas[note.id]
                    if (delta === undefined)
                        continue;
                    props.editor.setNoteTime(note.id, time + delta)
                }
            })
            handlers.push(timeMover)

            handler.current = Handler.compose(handlers)
        }
    }

    function onDoubleClick(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        Instance.engine.getResource(PopupManager).add(close => <NoteEventPopup
            note={props.note}
            onUpdate={() => {
                // TODO: in case of render-changing updates, want to update printing
            }}
            close={close}
        />)
    }

    function onClick(e: MouseEvent) {
        e.stopPropagation()
    }

    useEffect(() => {
        return () => {
            handler.current?.destroy()
            handler.current = null
        }
    }, [])

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
        onContextMenu={onContextMenu}
        onMouseEnter={onEnter}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
    >
        <div
            className="main"
            onMouseDown={onMainMouseDown}
        >
            <p>{note.name}{note.octave}</p>
            <div className="fret-hint">{props.fret}</div>
            <div className="resizer-right" onMouseDown={e => {
                if (props.note.slide)
                    onResizeSlideDuration(e);
                else
                    onResizeDuration(e);
            }} />
        </div>

        {
            props.note.slide && <div
                className="slide"
                onMouseDown={onSlideMouseDown}
            >
                <p>{slideNote?.name}{slideNote?.octave}</p>
                <div className="fret-hint">{props.note.slide.fret}</div>
                <div className="resizer-right" onMouseDown={onResizeDuration}></div>
                <div className="resizer-left" onMouseDown={onResizeSlideDuration}></div>
            </div>
        }
    </div>
}