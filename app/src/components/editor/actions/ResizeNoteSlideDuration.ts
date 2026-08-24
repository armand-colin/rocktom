import { TimeResizer } from "../../../utils/handlers/TimeResizer";
import { MouseButtons } from "../../../utils/MouseButtons";
import type { PatternEditorMouseAction } from "./PatternEditorMouseAction";

export const ResizeNoteSlideDuration: PatternEditorMouseAction = {
    start(context) {
        const { event, editor, note } = context

        if (!note.slide || event.buttons !== MouseButtons.Left)
            return null

        const resizer = new TimeResizer({
            event,
            duration: note.duration - note.slide.duration,
            transform: editor.transform,
        })

        resizer.events.on("changed", duration => {
            const slideDuration = Math.min(Math.max(note.duration - duration, 0), note.duration)

            editor.setNoteSlide(note.id, {
                fret: note.slide!.fret,
                duration: slideDuration,
                connect: note.slide!.connect
            })
        })

        return resizer
    }
}
