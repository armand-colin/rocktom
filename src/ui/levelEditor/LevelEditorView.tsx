import { EngineContext, useComponent, useResource } from "@niloc/ecs-react";
import { useContext } from "react";
import type { EditorPlayer } from "../../components/editor/EditorPlayer";
import type { LevelEditor } from "../../components/editor/LevelEditor";
import { State } from "../../resources/State";
import { WindowManager } from "../../resources/WindowManager";
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
    const { engine } = useContext(EngineContext)
    const windowManager = engine.getResource(WindowManager)

    function onEdit(pattern: TimedPattern) {
        props.editor.player.seekTicks(pattern.time)
        props.editor.editPattern(pattern.pattern)
    }

    function onPopWindow() {
        windowManager.add("Test window", () => <div>
            <h1>Bonjour !</h1>
        </div>)
    }

    return <div className="SongEditorView">
        <Button onClick={onPopWindow}>PopWindow</Button>
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