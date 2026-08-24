import type { PatternEditorMouseAction, PatternEditorMouseActionContext } from "./PatternEditorMouseAction";

export class RemoveNote implements PatternEditorMouseAction {

    start(context: PatternEditorMouseActionContext) {
        context.editor.removeNote(context.note.id)
        return null
    }

}
