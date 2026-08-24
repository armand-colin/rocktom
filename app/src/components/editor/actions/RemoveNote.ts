import type { PatternEditorMouseAction } from "./PatternEditorMouseAction";

export const RemoveNote: PatternEditorMouseAction = {
    start(context) {
        context.editor.removeNote(context.note.id)
        return null
    }
}
