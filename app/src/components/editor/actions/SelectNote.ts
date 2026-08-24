import type { PatternEditorMouseAction } from "./PatternEditorMouseAction";

export const SelectNote: PatternEditorMouseAction = {
    start(context) {
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
