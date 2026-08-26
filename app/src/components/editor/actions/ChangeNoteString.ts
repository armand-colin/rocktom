import type { PatternEditorMouseAction } from "./PatternEditorMouseAction";

export const ChangeNoteString: PatternEditorMouseAction = {
    start(context) {
        const { editor, note } = context

        editor.selectNote(note.id)
        editor.cycleNoteString(note.id, 1)

        return null
    }
}
