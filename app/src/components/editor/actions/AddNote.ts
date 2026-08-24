import { Instance } from "../../../Instance";
import { MouseState } from "./MouseState";
import type { PatternEditorGridMouseAction } from "./PatternEditorMouseAction";

export const AddNote: PatternEditorGridMouseAction = {
    start(context) {
        const { event, editor, container } = context

        if (editor.selectionWindow?.enabled)
            return null

        if (Instance.engine.getResource(MouseState).clickPrevented)
            return null

        const rect = container.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top
        const ticks = editor.transform.magnetize(
            mouseX / editor.transform.ratio - editor.transform.offset
        )
        const note = editor.noteTransform.getNoteForOffset(mouseY)
        const activeString = editor.string

        if (!activeString.canPlay(note)) {
            for (const string of editor.pattern.instrument.strings) {
                if (string.canPlay(note)) {
                    editor.addNote(
                        string,
                        note.index - string.note.index,
                        ticks
                    )
                    return null
                }
            }
            return null
        }

        const noteEvent = editor.addNote(
            activeString,
            note.index - activeString.note.index,
            ticks
        )

        if (noteEvent)
            editor.selectNote(noteEvent.id)

        return null
    }
}
