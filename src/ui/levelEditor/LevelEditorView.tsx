import type { LevelEditor } from "../../components/LevelEditor";

export function LevelEditorView(props: { editor: LevelEditor }) {

    return <div className="LevelEditorView">
        {props.editor.id}
    </div>

}