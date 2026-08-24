import type { PatternEditorMouseAction, PatternEditorMouseActionContext } from "./PatternEditorMouseAction";

export class SelectNote implements PatternEditorMouseAction {

    start(context: PatternEditorMouseActionContext) {
        const { event, editor, note } = context

        if (event.shiftKey) {
            editor.selection.add(note)
            return null
        }

        // Keep an existing multi-selection when dragging/resizing one of its notes
        if (editor.selection.has(note))
            return null

        editor.selection.set([note])
        return null
    }

}
