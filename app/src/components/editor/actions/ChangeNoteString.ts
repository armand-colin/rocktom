import type { PatternEditorMouseAction } from "./PatternEditorMouseAction";

export const ChangeNoteString: PatternEditorMouseAction = {
    start(context) {
        const { editor, note } = context

        editor.selectNote(note.id)

        const string = note.string
        const pitch = note.string.fret(note.fret)

        for (let i = 1; i < editor.pattern.instrument.strings.length; i++) {
            const index = (string.index + i) % editor.pattern.instrument.strings.length
            const newString = editor.pattern.instrument.strings[index]
            if (newString.canPlay(pitch)) {
                editor.setNoteString(note.id, newString)
                return null
            }
        }

        return null
    }
}
