import type { NoteEvent } from "../../../sound/song/NoteEvent";
import type { Handler } from "../../../utils/handlers/Handler";
import type { PatternEditor } from "../PatternEditor";

export type PatternEditorMouseActionContext = {
    event: MouseEvent
    editor: PatternEditor
    note: NoteEvent
}

export interface PatternEditorMouseAction {
    start(context: PatternEditorMouseActionContext): Handler | null
}
