import type { NoteEvent } from "../../../sound/song/NoteEvent";
import { TimeResizer } from "../../../utils/handlers/TimeResizer";
import { MouseButtons } from "../../../utils/MouseButtons";
import type { PatternEditorMouseAction } from "./PatternEditorMouseAction";

export const ResizeNoteDuration: PatternEditorMouseAction = {
    start(context) {
        const { event, editor } = context

        if (event.buttons !== MouseButtons.Left)
            return null

        if (editor.selection.elements.length === 0)
            return null

        const maxDurationNote = editor.selection.elements.reduce<NoteEvent | null>((max, selected) => {
            if (!max || selected.duration > max.duration)
                return selected
            return max
        }, null)

        if (!maxDurationNote)
            return null

        const deltas: Record<string, number> = {}
        for (const selected of editor.selection.elements) {
            deltas[selected.id] = selected.duration - maxDurationNote.duration
        }

        const resizer = new TimeResizer({
            event,
            duration: maxDurationNote.duration,
            transform: editor.transform,
        })

        resizer.events.on("changed", duration => {
            for (const selected of editor.selection.elements) {
                const delta = deltas[selected.id]
                if (delta === undefined)
                    continue

                editor.setNoteDuration(selected.id, Math.max(duration + delta, 0))
            }
        })

        return resizer
    }
}
