import type { PatternEditorViewMouseAction } from "./PatternEditorMouseAction";

export const ClearSelection: PatternEditorViewMouseAction = {
    start(context) {
        context.editor.selection.clear()
        return null
    }
}
