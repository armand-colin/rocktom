import type { NoteEvent } from "../../../sound/song/NoteEvent";
import type { Handler } from "../../../utils/handlers/Handler";
import { TimeResizer } from "../../../utils/handlers/TimeResizer";
import { MouseButtons } from "../../../utils/MouseButtons";
import type { PatternEditor } from "../PatternEditor";

export namespace ResizeNoteDuration {

    export function start(options: {
        event: MouseEvent,
        editor: PatternEditor,
        note: NoteEvent,
    }): Handler | null {
        if (options.event.buttons !== MouseButtons.Left)
            return null;

        if (options.editor.selection.elements.length === 0)
            return null;

        const maxDurationNote = options.editor.selection.elements.reduce<NoteEvent | null>((max, note) => {
            if (!max || note.duration > max.duration)
                return note
            return max
        }, null)

        if (!maxDurationNote)
            return null;

        const deltas: Record<string, number> = {}
        for (const note of options.editor.selection.elements) {
            deltas[note.id] = note.duration - maxDurationNote.duration
        }

        const resizer = new TimeResizer({
            event: options.event,
            duration: maxDurationNote.duration,
            transform: options.editor.transform,
        })

        resizer.events.on("changed", duration => {
            for (const note of options.editor.selection.elements) {
                const delta = deltas[note.id]
                if (delta === undefined)
                    continue;

                options.editor.setNoteDuration(note.id, Math.max(duration + delta, 0))
            }
        })

        return resizer;
    }

}