import { useComponent } from "@niloc/ecs-react";
import type { EditorPlayer } from "../../components/editor/EditorPlayer";
import type { PatternEditor } from "../../components/editor/PatternEditor";
import { TimeTransformView } from "./timeTransform/TimeTransformView";

export function PatternEditorView(props: {
    editor: PatternEditor,
    player: EditorPlayer
}) {
    const { pattern } = useComponent(props.editor)

    return <div className="PatternEditorView">
        <div className="head">
            {pattern.name}
        </div>
        <div className="body">
            <TimeTransformView
                transform={props.editor.transform}
                player={props.player}
                time={props.player.time}
            />
            <div className="keyboard">

            </div>
            <div className="notes">

            </div>
        </div>
    </div>
}