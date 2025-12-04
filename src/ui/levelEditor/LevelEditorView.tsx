import { useResource } from "@niloc/ecs-react";
import type { EditorPlayer } from "../../components/editor/EditorPlayer";
import type { LevelEditor } from "../../components/editor/LevelEditor";
import { Button } from "../button/Button";
import { AudioTrackEditorView } from "./AudioTrackEditorView";
import "./LevelEditorView.scss";
import { TempoTrackEditorView } from "./TempoTrackEditorView";
import { TimeTransformView } from "./TimeTransformView";
import { State } from "../../resources/State";
import { NoteTrackEditorView } from "./NoteTrackEditorView";

export function LevelEditorView(props: { editor: LevelEditor }) {
    const state = useResource(State)

    return <div className="LevelEditorView">
        <div className="head">
            <Button onClick={() => state.editLevel(null)}>Back</Button>
            {props.editor.level.name}
            <PlayerControls player={props.editor.player} />
        </div>
        <div className="time">
            <TimeTransformView
                transform={props.editor.timeTransform}
                time={props.editor.player.playbackTime}
                player={props.editor.player}
            />
        </div>
        <div className="audio">
            <AudioTrackEditorView
                time={props.editor.player.playbackTime}
                tempoTrack={props.editor.tempoTrack}
                transform={props.editor.timeTransform}
                editor={props.editor.audioTrack}
            />
        </div>
        <div className="tempo">
            <TempoTrackEditorView
                time={props.editor.player.playbackTime}
                transform={props.editor.timeTransform}
                editor={props.editor.tempoTrack}
            />
        </div>
        <div className="note">
            <NoteTrackEditorView
                time={props.editor.player.playbackTime}
                transform={props.editor.timeTransform}
                editor={props.editor.noteTrack}
            />
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