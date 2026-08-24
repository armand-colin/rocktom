import { NoteMover } from "../../../utils/handlers/NoteMover";
import type { PatternEditorMouseAction } from "./PatternEditorMouseAction";

export const MoveSlide: PatternEditorMouseAction = {
    start(context) {
        const { event, editor, note } = context

        if (!note.slide)
            return null

        const slideNote = note.string.fret(note.slide.fret)

        const noteMover = new NoteMover({
            event,
            startNote: slideNote,
            string: note.string,
            transform: editor.noteTransform
        })

        noteMover.events.on("change", pitch => {
            editor.setNoteSlide(note.id, {
                fret: pitch.index - note.string.note.index,
                duration: note.slide!.duration,
                connect: note.slide!.connect
            })
        })

        return noteMover
    }
}
