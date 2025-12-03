import type { LevelEditor } from "../../components/editor/LevelEditor";
import { TempoTrackEditorView } from "./TempoTrackEditorView";
import "./LevelEditorView.scss"
import { AudioTrackEditorView } from "./AudioTrackEditorView";

export function LevelEditorView(props: { editor: LevelEditor }) {
    return <div className="LevelEditorView">
        <div className="head">
            {props.editor.level.name}
        </div>
        <div className="audio">
            <AudioTrackEditorView
                tempoTrack={props.editor.tempoTrack}
                transform={props.editor.timeTransform}
                editor={props.editor.audioTrack}
            />
        </div>
        <div className="tempo">
            <TempoTrackEditorView
                transform={props.editor.timeTransform}
                editor={props.editor.tempoTrack}
            />
        </div>
    </div>
}