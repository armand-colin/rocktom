import type { Handler } from "../../../utils/handlers/Handler";
import type { PatternEditorMouseAction, PatternEditorMouseActionContext } from "./PatternEditorMouseAction";

export class ChangeNoteString implements PatternEditorMouseAction {

    start(context: PatternEditorMouseActionContext): Handler | null {
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
