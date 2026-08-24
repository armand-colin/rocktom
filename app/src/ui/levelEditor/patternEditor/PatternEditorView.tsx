import { useComponent } from "@niloc/ecs-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Rules } from "../../../3d/Rules";
import type { EditorPlayer } from "../../../components/editor/EditorPlayer";
import type { PatternEditor } from "../../../components/editor/PatternEditor";
import type { TimeTransform } from "../../../components/editor/TimeTransform";
import type { VirtualBass } from "../../../components/VirtualBass";
import type { String } from "../../../sound/instrument/String";
import { Note } from "../../../sound/note/Note";
import { MouseButtons } from "../../../utils/MouseButtons";
import "./PatternEditorView.scss";
import { TimeTransformView } from "../timeTransform/TimeTransformView";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "../TrackEditorView";
import type { NoteTransform } from "../../../components/editor/NoteTransform";
import { PopupManager } from "../../../resources/PopupManager";
import { SplitPopup } from "../split/SplitPopup";
import { Instance } from "../../../Instance";
import { useShortcut } from "../../../hooks/useShortcut";
import { Shortcuts } from "../../../resources/shortcut/Shortcuts";
import { SelectionWindowView } from "../SelectionWindowView";
import { Dropdown } from "../../dropdown/Dropdown";
import { Toolbar } from "../../toolbar/Toolbar";
import { PatternEditorNoteView } from "./PatternEditorNoteView";
import { FormInputField } from "../../form/FormInputField";
import { StringInput } from "../../input/StringInput";
import { UiSize } from "../../UiSize";
import { MagnetizationView } from "../magnetizationView/MagnetizationView";

const toolbarTabs: Toolbar.Tab[] = [
    Toolbar.Tab.create("Edit", [
        Toolbar.Item.section("Clipboard", [
            Toolbar.Item.shortcut("Copy", Shortcuts.Editor.Copy),
            Toolbar.Item.shortcut("Paste", Shortcuts.Editor.Paste),
        ]),
        Toolbar.Item.section("Notes", [
            Toolbar.Item.shortcut("Split", Shortcuts.Editor.Split),
            Toolbar.Item.shortcut("Slide", Shortcuts.Editor.Slide),
        ]),
    ]),
]

export function PatternEditorView(props: {
    editor: PatternEditor,
    player: EditorPlayer
}) {
    const { pattern, string, selectionWindow } = useComponent(props.editor)
    const { elements: selection } = useComponent(props.editor.selection)
    const mouse = props.editor.mouse

    useShortcut(Shortcuts.Editor.Copy, onCopy)
    useShortcut(Shortcuts.Editor.Paste, onPaste)
    useShortcut(Shortcuts.Editor.Split, onSplit)
    useShortcut(Shortcuts.Editor.Slide, onSlide)

    const notesRef = useRef<HTMLDivElement | null>(null)
    const minNote = pattern.instrument.lowestString.fret(0)
    const maxNote = pattern.instrument.highestString.fret(Rules.maxFret)

    const notes = useMemo(() => {
        const notes = []
        for (let i = minNote.index; i <= maxNote.index; i++)
            notes.push(Note.fromIndex(i))

        return notes
    }, [minNote, maxNote])

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

    function onCopy() {
        props.editor.copySelectionToClipboard()
    }

    function onPaste() {
        props.editor.pasteFromClipboardAtGlobalTime(props.player.time.ticks)
    }

    function onSlide() {
        const selection = props.editor.selection.elements
        if (selection.length !== 1)
            return

        const note = selection[0]
        if (note.slide) {
            props.editor.setNoteSlide(note.id, null)
        } else {
            props.editor.setNoteSlide(note.id, {
                fret: note.fret + 2,
                duration: (note.duration / 2) | 0,
                connect: false
            })
        }
    }

    return <div
        className="PatternEditorView"
        onMouseDown={e => {
            if (e.buttons === MouseButtons.Middle) {
                e.preventDefault()
                e.stopPropagation()
            }
            mouse.onViewMouseDown(e.nativeEvent)
        }}
    >
        <div className="head">
            <Toolbar tabs={toolbarTabs} />

            <div className="grid grid-cols-[200px_100px_180px] gap-3">

                <FormInputField label="Pattern name">
                    <StringInput
                        value={pattern.name}
                        onChange={name => props.editor.setName(name)}
                        size={UiSize.S}
                    />
                </FormInputField>

                <FormInputField label="String">
                    <Dropdown
                        size={UiSize.S}
                        value={string.index.toString()}
                        options={props.editor.pattern.instrument.strings.map(string => ({
                            label: string.name,
                            value: string.index.toString(),
                            index: string.index
                        }))}
                        onChange={value => {
                            if (!value)
                                return

                            props.editor.setString(props.editor.pattern.instrument.strings[value.index])
                        }}
                    />
                </FormInputField>

                <FormInputField label="Magnetization">
                    <MagnetizationView
                        transform={props.editor.transform}
                        size={UiSize.S}
                    />
                </FormInputField>
            </div>
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
                    onClick={e => {
                        if (!notesRef.current)
                            return
                        mouse.onGridClick(e.nativeEvent, notesRef.current)
                    }}
                    onMouseDown={e => {
                        if (!notesRef.current)
                            return
                        if (e.buttons === MouseButtons.Right) {
                            e.preventDefault()
                            e.stopPropagation()
                        }
                        mouse.onGridMouseDown(e.nativeEvent, notesRef.current)
                    }}
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
                            pattern.notes.map(note => <PatternEditorNoteView
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
                        {
                            selectionWindow && <SelectionWindowView
                                selectionWindow={selectionWindow}
                            />
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