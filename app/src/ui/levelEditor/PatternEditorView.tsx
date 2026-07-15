import { useComponent } from "@niloc/ecs-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Rules } from "../../3d/Rules";
import type { EditorPlayer } from "../../components/editor/EditorPlayer";
import type { PatternEditor } from "../../components/editor/PatternEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { VirtualBass } from "../../components/VirtualBass";
import type { String } from "../../sound/instrument/String";
import { Note } from "../../sound/note/Note";
import type { Handler } from "../../utils/handlers/Handler";
import { TimeMover } from "../../utils/handlers/TimeMover";
import { TimeResizer } from "../../utils/handlers/TimeResizer";
import { MouseButtons } from "../../utils/MouseButtons";
import { Select } from "../select/Select";
import "./PatternEditorView.scss";
import { TimeTransformView } from "./timeTransform/TimeTransformView";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";
import { EditableText } from "../editableText/EditableText";
import type { NoteTransform } from "../../components/editor/NoteTransform";
import { NoteMover } from "../../utils/handlers/NoteMover";
import { Button } from "../button/Button";
import { PopupManager } from "../../resources/PopupManager";
import { SplitPopup } from "./split/SplitPopup";
import { Instance } from "../../Instance";
import type { NoteEvent } from "../../sound/song/NoteEvent";
import { NoteEventPopup } from "./noteEvent/NoteEventPopup";

export function PatternEditorView(props: {
    editor: PatternEditor,
    player: EditorPlayer
}) {
    const { pattern, string } = useComponent(props.editor)
    const { elements: selection } = useComponent(props.editor.selection)

    const notesRef = useRef<HTMLDivElement | null>(null)
    const minNote = pattern.instrument.lowestString.fret(0)
    const maxNote = pattern.instrument.highestString.fret(Rules.maxFret)

    function stringUp() {
        const string = props.editor.string
        const index = (string.index + 1) % props.editor.pattern.instrument.strings.length
        const newString = props.editor.pattern.instrument.strings[index]

        if (newString)
            props.editor.setString(newString)
    }

    function onMouseDown(e: MouseEvent) {
        if (e.buttons === MouseButtons.Middle) {
            e.preventDefault()
            e.stopPropagation()
            stringUp()
        }
    }

    const notes = useMemo(() => {
        const notes = []
        for (let i = minNote.index; i <= maxNote.index; i++)
            notes.push(Note.fromIndex(i))

        return notes
    }, [minNote, maxNote])

    function onNotesClick(e: MouseEvent) {
        if (!notesRef.current)
            return

        if (e.buttons !== MouseButtons.Left)
            return

        // Shall find ticks and note
        const rect = notesRef.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const ticks = props.editor.transform.magnetize(mouseX / props.editor.transform.ratio - props.editor.transform.offset)
        const rawNoteIndex = (mouseY / props.editor.noteTransform.ratio) + props.editor.noteTransform.offset
        const noteIndex = maxNote.index - Math.ceil(rawNoteIndex)
        const note = Note.fromIndex(noteIndex)

        if (!string.canPlay(note)) {
            // Find first string that matches
            const strings = props.editor.pattern.instrument.strings
            for (const string of strings) {
                if (string.canPlay(note)) {
                    props.editor.addNote(
                        string, 
                        note.index - string.note.index, 
                        ticks
                    )
                    return
                }
            }
        } else {
            props.editor.addNote(
                string, 
                note.index - string.note.index, 
                ticks
            )
        }
    }

    function onSplit() {
        const selection = props.editor.selection.elements
        if (selection.length !== 1)
            return

        Instance.engine.getResource(PopupManager).add(close => <SplitPopup 
            close={close} 
            editor={props.editor} 
            notes={selection}
        />)
    }

    return <div
        className="PatternEditorView"
        onMouseDown={onMouseDown}
    >
        <div className="head">
            <EditableText
                value={pattern.name}
                onChange={name => props.editor.setName(name)}
            />
            <Select
                value={string.index ?? -1}
                onChange={index => props.editor.setString(props.editor.pattern.instrument.strings[index])}
                options={props.editor.pattern.instrument.strings.map(string => ({
                    label: string.name,
                    value: string.index
                }))}
            />
            <Button onClick={onSplit}>Split</Button>
        </div>
        <div
            className="body"
            style={{
                "--min-index": minNote.index,
                "--max-index": maxNote.index,
                "--index-range": maxNote.index - minNote.index,
            } as CSSProperties}
            onWheel={e => {
                props.editor.transform.handleWheel(e.nativeEvent, e.currentTarget);
                props.editor.noteTransform.handleWheel(e.nativeEvent);
            }}
            onContextMenu={e => {
                e.preventDefault()
                e.stopPropagation()
            }}
        >
            <TimeTransformView
                transform={props.editor.transform}
                player={props.player}
                time={props.player.time}
            />
            <TrackEditorView
                transform={props.editor.transform}
            >
                <TrackEditorHead
                    className="keyboard"
                    noPadding
                >
                    <NoteTransformView transform={props.editor.noteTransform}>
                        {
                            notes.map(note => <KeyboardNoteView
                                key={note.index}
                                note={note}
                                string={string}
                                instrument={props.editor.virtualBass}
                            />)
                        }
                    </NoteTransformView>
                </TrackEditorHead>
                <TrackEditorContent
                    time={props.player.time}
                    className="notes"
                    ref={notesRef}
                    onMouseDown={onNotesClick}
                >
                    <TimeMarkersView transform={props.editor.transform} />

                    <NoteTransformView transform={props.editor.noteTransform}>
                        {
                            notes.map(note => <div
                                className="shadow-note"
                                key={note.index}
                                style={{
                                    "--index": note.index,
                                } as CSSProperties}
                            />)
                        }
                        {
                            pattern.notes.map(note => <NoteView
                                key={note.id}
                                id={note.id}
                                string={note.string}
                                fret={note.fret}
                                time={note.time}
                                duration={note.duration}
                                editor={props.editor}
                                note={note}
                                selected={selection.includes(note)}
                            />)
                        }
                    </NoteTransformView>
                </TrackEditorContent>
            </TrackEditorView>
        </div>
    </div >
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

function NoteView(props: {
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

    function onResize(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        if (e.buttons === MouseButtons.Left) {
            handler.current?.destroy()

            const resizer = new TimeResizer({
                event: e.nativeEvent,
                duration: props.duration,
                transform: props.editor.transform,
            })

            resizer.events.on("changed", duration => props.editor.setNoteDuration(props.id, duration))

            handler.current = resizer
        }
    }

    function onMouseDown(e: MouseEvent) {
        if (e.buttons === MouseButtons.Middle) {
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

        if (e.buttons === MouseButtons.Left) {
            e.preventDefault()
            e.stopPropagation()
            handler.current?.destroy()

            props.editor.selectNote(props.id)

            const timeMover = new TimeMover({
                event: e.nativeEvent,
                startTicks: props.time,
                transform: props.editor.transform,
                minTicks: 0
            })

            const noteMover = new NoteMover({
                event: e.nativeEvent,
                startNote: note,
                transform: props.editor.noteTransform,
                string: props.string
            })

            noteMover.events.on("change", note => props.editor.setNoteNote(props.id, note))
            timeMover.events.on("change", time => props.editor.setNoteTime(props.id, time))

            const newHandler: Handler = {
                destroy() {
                    noteMover.destroy()
                    timeMover.destroy()
                }
            }

            handler.current = newHandler
        }
    }

    function onDoubleClick(e: MouseEvent) {
        Instance.engine.getResource(PopupManager).add(close => <NoteEventPopup
            note={props.note}
            onUpdate={() => {
                // TODO: in case of render-changing updates, want to update printing
            }}
            close={close}
        />)
    }

    useEffect(() => {
        return () => {
            handler.current?.destroy()
            handler.current = null
        }
    }, [])

    return <div
        className="NoteView"
        data-instant={props.duration === 0}
        data-selected={props.selected}
        style={{
            "--color": "#" + props.string.color.getHexString(),
            "--contrast": "#" + props.string.outlineColor.getHexString(),
            "--index": note.index,
            "--ticks": props.time,
            "--duration": props.duration,
        } as CSSProperties}
        onContextMenu={onContextMenu}
        onMouseEnter={onEnter}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
    >
        <p>{note.name}{note.octave}</p>
        <div className="fret-hint">{props.fret}</div>
        <div className="resizer" onMouseDown={onResize}></div>
    </div>
}

function TimeMarkersView(props: { transform: TimeTransform }) {
    const { offset, ratio } = useComponent(props.transform)
    const [width, setWidth] = useState(100)
    const ref = useRef<HTMLElement | null>(null)
    const observer = useRef<ResizeObserver | null>(null)

    function onRef(e: HTMLElement | null) {
        if (!observer.current) {
            observer.current = new ResizeObserver(() => {
                if (ref.current)
                    setWidth(ref.current.clientWidth)
            })
        }

        observer.current.disconnect()

        if (e) {
            ref.current = e
            observer.current.observe(e)
            setWidth(e.clientWidth)
        }
    }

    useEffect(() => {
        return () => {
            observer.current?.disconnect()
            observer.current = null
        }
    }, [])

    const markers = useMemo(() => {
        const markers = []

        for (const marker of props.transform.getMarkers(width, 20, 50)) {
            markers.push(<div
                className="marker"
                data-type={marker.type}
                style={{
                    "--ticks": marker.ticks
                } as CSSProperties}
            ></div>)
        }

        return markers
    }, [offset, ratio, width])

    return <div
        className="TimeMarkersView"
        ref={onRef}
    >
        {markers}
    </div>
}

function NoteTransformView(props: { transform: NoteTransform, children?: ReactNode }) {
    const { offset, ratio } = useComponent(props.transform)

    return <div
        className="NoteTransformView"
        style={{
            "--note-offset": offset,
            "--note-ratio": ratio
        } as CSSProperties}
    >
        {props.children}
    </div>
}