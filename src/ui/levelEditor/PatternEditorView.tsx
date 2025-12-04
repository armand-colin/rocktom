import { useComponent } from "@niloc/ecs-react";
import type { PatternEditor } from "../../components/editor/PatternEditor";
import { Button } from "../button/Button";

export function PatternEditorView(props: {
    editor: PatternEditor,
    onClose: () => void
}) {
    const { pattern } = useComponent(props.editor)

    return <div className="PatternEditorView">
        <div className="head">
            {pattern.name}
        </div>
        <Button onClick={props.onClose}>Close</Button>
    </div>
}