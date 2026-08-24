import type { PatternEditorMouseAction, PatternEditorMouseActionContext } from "./PatternEditorMouseAction";

export class SelectNote implements PatternEditorMouseAction {

    start(context: PatternEditorMouseActionContext) {
        if (context.event.shiftKey) {
            context.editor.selection.add(context.note)
        } else {
            context.editor.selection.set([context.note])
        }

        return null
    }

}
