import type { NoteEvent } from "../../../sound/song/NoteEvent";
import type { Handler } from "../../../utils/handlers/Handler";
import { NoteMover } from "../../../utils/handlers/NoteMover";
import type { PatternEditor } from "../PatternEditor";

export namespace MoveSlide {

    export function start(options: {
        event: MouseEvent,
        editor: PatternEditor,
        note: NoteEvent,
    }): Handler | null {
        if (!options.note.slide)
            return null;

        options.event.stopPropagation()
        options.event.preventDefault()

        const slideNote = options.note.string.fret(options.note.slide.fret)

        const noteMover = new NoteMover({
            event: options.event,
            startNote: slideNote,
            string: options.note.string,
            transform: options.editor.noteTransform
        })

        noteMover.events.on('change', note => {
            options.editor.setNoteSlide(options.note.id, {
                fret: note.index - options.note.string.note.index,
                duration: options.note.slide!.duration,
                connect: options.note.slide!.connect
            })
        })

        return noteMover;
    }

}