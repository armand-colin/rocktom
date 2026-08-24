import type { NoteEvent } from "../../../sound/song/NoteEvent";
import { Handler } from "../../../utils/handlers/Handler";
import { NoteMover } from "../../../utils/handlers/NoteMover";
import { TimeMover } from "../../../utils/handlers/TimeMover";
import type { PatternEditorMouseAction } from "./PatternEditorMouseAction";

export const MoveNotes: PatternEditorMouseAction = {
    start(context) {
        const { event, editor, note } = context

        const minTimeNote = editor.selection.elements.reduce<NoteEvent | null>((min, selected) => {
            if (!min || selected.time < min.time)
                return selected
            return min
        }, null)

        if (!minTimeNote)
            return null

        const baseTime = minTimeNote.time
        const deltas: Record<string, number> = {}

        for (const selected of editor.selection.elements) {
            deltas[selected.id] = selected.time - baseTime
        }

        const handlers: Handler[] = []

        if (editor.selection.elements.length === 1) {
            const startNote = note.string.fret(note.fret)
            const noteMover = new NoteMover({
                event,
                startNote,
                transform: editor.noteTransform,
                string: note.string
            })
            noteMover.events.on("change", pitch => editor.setNoteNote(note.id, pitch))
            handlers.push(noteMover)
        }

        const timeMover = new TimeMover({
            event,
            startTicks: minTimeNote.time,
            transform: editor.transform,
            minTicks: 0
        })

        timeMover.events.on("change", time => {
            for (const selected of editor.selection.elements) {
                const delta = deltas[selected.id]
                if (delta === undefined)
                    continue
                editor.setNoteTime(selected.id, time + delta)
            }
        })
        handlers.push(timeMover)

        return Handler.compose(handlers)
    }
}
