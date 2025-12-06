import { useComponent } from "@niloc/ecs-react";
import { useMemo, type CSSProperties } from "react";
import { Rules } from "../../3d/Rules";
import type { EditorPlayer } from "../../components/editor/EditorPlayer";
import type { PatternEditor } from "../../components/editor/PatternEditor";
import type { String } from "../../sound/instrument/String";
import { Note } from "../../sound/note/Note";
import "./PatternEditorView.scss";
import { TimeTransformView } from "./timeTransform/TimeTransformView";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";

export function PatternEditorView(props: {
    editor: PatternEditor,
    player: EditorPlayer
}) {
    const { pattern, string } = useComponent(props.editor)

    const minNote = pattern.instrument.lowestString.fret(0)
    const maxNote = pattern.instrument.highestString.fret(Rules.maxFret)

    const notes = useMemo(() => {
        const notes = []
        for (let i = minNote.index; i <= maxNote.index; i++)
            notes.push(Note.fromIndex(i))

        return notes
    }, [minNote, maxNote])

    return <div className="PatternEditorView">
        <div className="head">
            {pattern.name}
        </div>
        <div
            className="body"
            style={{
                "--min-index": minNote.index,
                "--max-index": maxNote.index,
                "--index-range": maxNote.index - minNote.index,
            } as CSSProperties}
            onWheel={e => props.editor.transform.handleWheel(e.nativeEvent, e.currentTarget)}
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
                    {
                        notes.map(note => <KeyboardNoteView
                            key={note.index}
                            note={note}
                            string={string}
                        />)
                    }
                </TrackEditorHead>
                <TrackEditorContent
                    time={props.player.time}
                    className="notes"
                >
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
                        />)
                    }
                </TrackEditorContent>
            </TrackEditorView>
        </div>
    </div >
}

function KeyboardNoteView(props: { note: Note, string: String }) {
    return <div
        className="KeyboardNoteView"
        data-available={props.note.index >= props.string.note.index && props.note.index <= props.string.fret(Rules.maxFret).index}
        style={{
            "--index": props.note.index,
            "--color": "#" + props.string.color.getHexString(),
        } as CSSProperties}
    >
        {props.note.name}{props.note.octave}
    </div>
}

function NoteView(props: {
    id: string,
    string: String,
    fret: number,
    time: number,
    duration: number,
    editor: PatternEditor
}) {
    const note = props.string.fret(props.fret)

    function onContextMenu(e: React.MouseEvent<HTMLDivElement>) {
        e.stopPropagation()
        e.preventDefault()
        props.editor.removeNote(props.id)
    }

    function onEnter(e: React.MouseEvent<HTMLDivElement>) {
        // if right click is pressed while entering
        if (e.buttons & 2) {
            e.preventDefault()
            props.editor.removeNote(props.id)
        }
    }

    return <div
        className="NoteView"
        style={{
            "--color": "#" + props.string.color.getHexString(),
            "--index": note.index,
            "--ticks": props.time,
            "--duration": props.duration,
        } as CSSProperties}
        onContextMenu={onContextMenu}
        onMouseEnter={onEnter}
    >
        {note.name}{note.octave}
    </div>
}