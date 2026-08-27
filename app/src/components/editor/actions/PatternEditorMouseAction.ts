import type { Note } from "../../../sound/note/Note";
import type { NoteEvent } from "../../../sound/song/NoteEvent";
import type { Handler } from "../../../utils/handlers/Handler";
import type { PatternEditor } from "../PatternEditor";

export type PatternEditorMouseActionContext = {
    event: MouseEvent
    editor: PatternEditor
    note: NoteEvent
}

export type PatternEditorGridMouseActionContext = {
    event: MouseEvent
    editor: PatternEditor
    container: HTMLElement
}

export type PatternEditorViewMouseActionContext = {
    event: MouseEvent
    editor: PatternEditor
}

export type PatternEditorKeyboardMouseActionContext = {
    event: MouseEvent
    editor: PatternEditor
    note: Note
}

export interface PatternEditorMouseAction {
    start(context: PatternEditorMouseActionContext): Handler | null
}

export interface PatternEditorGridMouseAction {
    start(context: PatternEditorGridMouseActionContext): Handler | null
}

export interface PatternEditorViewMouseAction {
    start(context: PatternEditorViewMouseActionContext): Handler | null
}

export interface PatternEditorKeyboardMouseAction {
    start(context: PatternEditorKeyboardMouseActionContext): Handler | null
}
