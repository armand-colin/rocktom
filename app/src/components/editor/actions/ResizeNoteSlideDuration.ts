import type { NoteEvent } from "../../../sound/song/NoteEvent";
import type { Handler } from "../../../utils/handlers/Handler";
import { TimeResizer } from "../../../utils/handlers/TimeResizer";
import { MouseButtons } from "../../../utils/MouseButtons";
import type { PatternEditor } from "../PatternEditor";

export namespace ResizeNoteSlideDuration {

    export function start(options: {
        event: MouseEvent,
        editor: PatternEditor,
        note: NoteEvent,
    }): Handler | null {
        if (!options.note.slide || options.event.buttons !== MouseButtons.Left)
            return null;

        const resizer = new TimeResizer({
            event: options.event,
            duration: options.note.duration - options.note.slide.duration,
            transform: options.editor.transform,
        })

        resizer.events.on('changed', duration => {
            const slideDuration = Math.min(Math.max(options.note.duration - duration, 0), options.note.duration);

            options.editor.setNoteSlide(options.note.id, {
                fret: options.note.slide!.fret,
                duration: slideDuration,
                connect: options.note.slide!.connect
            })
        })

        return resizer;
    }

}