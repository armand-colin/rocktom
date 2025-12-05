import { useComponent } from "@niloc/ecs-react";
import type { NoteTrackEditor } from "../../components/editor/NoteTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { Pattern, TimedPattern } from "../../sound/song/Pattern";
import type { CSSProperties } from "react";
import "./NoteTrackEditorView.scss"
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";
import type { PlaybackTime } from "../../components/Time";

export function NoteTrackEditorView(props: {
    editor: NoteTrackEditor,
    transform: TimeTransform,
    time: PlaybackTime,
    onEdit: (pattern: TimedPattern) => void
}) {
    const { track } = useComponent(props.editor)

    return <TrackEditorView
        className="NoteTrackEditorView"
        transform={props.transform}
    >
        <TrackEditorHead>
            {track.instrument.name}
        </TrackEditorHead>
        <TrackEditorContent time={props.time}>
            {track.timedPatterns.map((pattern) => <TimedPatternView
                key={pattern.id}
                pattern={pattern.pattern}
                time={pattern.time}
                onEdit={() => props.onEdit(pattern)}
            />)}
        </TrackEditorContent>
    </TrackEditorView>
}

function TimedPatternView(props: { pattern: Pattern, time: number, onEdit: () => void }) {
    const minFret = props.pattern.notes.reduce((min, note) => {
        if (note.fret < min) 
            return note.fret
        return min
    }, 0)

    const maxFret = props.pattern.notes.reduce((max, note) => {
        if (note.fret > max) 
            return note.fret
        return max
    }, minFret)

    return <div
        className="TimedPatternView"
        style={{
            "--ticks": props.time,
            "--duration": props.pattern.duration,
            "--min-fret": minFret,
            "--max-fret": maxFret,
            "--fret-amplitude": maxFret - minFret + 1
        } as CSSProperties}
        onDoubleClick={props.onEdit}
    >
        <div className="head">
            {props.pattern.name}
        </div>
        <div className="notes">
            {props.pattern.notes.map(note => <div
                key={note.id}
                className="note"
                style={{
                    "--note-ticks": note.time,
                    "--note-duration": note.duration,
                    "--note-fret": note.fret,
                    "--color": "#" + note.string.color.getHexString()
                } as CSSProperties}
            />)}
        </div>
    </div>
}