import { useComponent, useResource } from "@niloc/ecs-react";
import type { EditorPlayer } from "../../components/editor/EditorPlayer";
import type { LevelEditor } from "../../components/editor/LevelEditor";
import { State } from "../../resources/State";
import type { TimedPattern } from "../../sound/song/Pattern";
import { Button } from "../button/Button";
import { AudioTrackEditorView } from "./AudioTrackEditorView";
import "./LevelEditorView.scss";
import { NoteTrackEditorView } from "./NoteTrackEditorView";
import { PatternEditorView } from "./PatternEditorView";
import { TempoTrackEditorView } from "./TempoTrackEditorView";
import { TimeTransformView } from "./TimeTransformView";

export function LevelEditorView(props: { editor: LevelEditor }) {
    const state = useResource(State)
    const { pattern } = useComponent(props.editor)

    return <div className="LevelEditorView">
        <div className="head">
            <Button onClick={() => state.editLevel(null)}>Back</Button>
            {props.editor.level.name}
            <PlayerControls player={props.editor.player} />
            {
                pattern ?
                    <PatternEditorView
                        onClose={() => props.editor.editPattern(null)}
                        editor={pattern}
                    /> :
                    <SongEditorView editor={props.editor} />
            }
        </div>
    </div>
}


function PlayerControls(props: { player: EditorPlayer }) {
    return <div className="PlayerControls">
        <Button onClick={() => props.player.play()}>Play</Button>
        <Button onClick={() => props.player.pause()}>Pause</Button>
        <Button onClick={() => props.player.reset()}>Reset</Button>
    </div>
}

function SongEditorView(props: { editor: LevelEditor }) {

    function onEdit(pattern: TimedPattern) {
        props.editor.player.seekTicks(pattern.time)
        props.editor.editPattern(pattern.pattern)
    }

    return <div className="SongEditorView">
        <div className="time">
            <TimeTransformView
                transform={props.editor.timeTransform}
                time={props.editor.player.time}
                player={props.editor.player}
            />
        </div>
        <div className="audio">
            <AudioTrackEditorView
                time={props.editor.player.time}
                tempoTrack={props.editor.tempoTrack}
                transform={props.editor.timeTransform}
                editor={props.editor.audioTrack}
            />
        </div>
        <div className="tempo">
            <TempoTrackEditorView
                time={props.editor.player.time}
                transform={props.editor.timeTransform}
                editor={props.editor.tempoTrack}
            />
        </div>
        <div className="note">
            <NoteTrackEditorView
                onEdit={onEdit}
                time={props.editor.player.time}
                transform={props.editor.timeTransform}
                editor={props.editor.noteTrack}
            />
        </div>
    </div>
}