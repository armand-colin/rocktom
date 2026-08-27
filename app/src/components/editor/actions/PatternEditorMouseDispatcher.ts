import type { Note } from "../../../sound/note/Note";
import type { NoteEvent } from "../../../sound/song/NoteEvent";
import type { Handler } from "../../../utils/handlers/Handler";
import { MouseButtons } from "../../../utils/MouseButtons";
import type { PatternEditor } from "../PatternEditor";
import { AddNote } from "./AddNote";
import { ChangeNoteString } from "./ChangeNoteString";
import { ClearSelection } from "./ClearSelection";
import { CycleActiveString } from "./CycleActiveString";
import { MoveNotes } from "./MoveNotes";
import { MoveSlide } from "./MoveSlide";
import type { PatternEditorKeyboardMouseAction, PatternEditorMouseAction } from "./PatternEditorMouseAction";
import { PlayKeyboardNote } from "./PlayKeyboardNote";
import { RemoveNote } from "./RemoveNote";
import { ResizeNoteDuration } from "./ResizeNoteDuration";
import { ResizeNoteSlideDuration } from "./ResizeNoteSlideDuration";
import { SelectNote } from "./SelectNote";
import { StartSelectionWindow } from "./StartSelectionWindow";

export class PatternEditorMouseDispatcher {

    private _activeHandler: Handler | null = null
    private _keyboardHandler: Handler | null = null

    constructor(private readonly _editor: PatternEditor) { }

    onNoteMouseDown(event: MouseEvent, note: NoteEvent) {
        if (event.buttons === MouseButtons.Middle || (event.buttons === MouseButtons.Left && event.altKey)) {
            event.preventDefault()
            event.stopPropagation()
            this._start(ChangeNoteString, event, note)
            return
        }

        if (event.buttons === MouseButtons.Left) {
            event.preventDefault()
            event.stopPropagation()
            this._clearHandler()
            this._start(SelectNote, event, note)
            this._start(MoveNotes, event, note)
        }
    }

    onSlideMouseDown(event: MouseEvent, note: NoteEvent) {
        if (event.buttons === MouseButtons.Middle || (event.buttons === MouseButtons.Left && event.altKey)) {
            event.preventDefault()
            event.stopPropagation()
            this._start(ChangeNoteString, event, note)
            return
        }

        if (event.buttons === MouseButtons.Left) {
            event.preventDefault()
            event.stopPropagation()
            this._clearHandler()
            this._start(SelectNote, event, note)
            this._start(MoveSlide, event, note)
        }
    }

    onResizeDuration(event: MouseEvent, note: NoteEvent) {
        event.preventDefault()
        event.stopPropagation()
        this._clearHandler()
        this._start(SelectNote, event, note)
        this._start(ResizeNoteDuration, event, note)
    }

    onResizeSlideDuration(event: MouseEvent, note: NoteEvent) {
        event.preventDefault()
        event.stopPropagation()
        this._clearHandler()
        this._start(SelectNote, event, note)
        this._start(ResizeNoteSlideDuration, event, note)
    }

    onNoteContextMenu(event: MouseEvent, note: NoteEvent) {
        event.stopPropagation()
        event.preventDefault()
        this._start(RemoveNote, event, note)
    }

    onNoteMouseEnter(event: MouseEvent, note: NoteEvent) {
        if (event.buttons & MouseButtons.Right) {
            event.preventDefault()
            this._start(RemoveNote, event, note)
        }
    }

    onGridMouseDown(event: MouseEvent, container: HTMLElement) {
        if (event.buttons === MouseButtons.Right) {
            event.stopPropagation()
            event.preventDefault()
            ClearSelection.start({
                event,
                editor: this._editor
            })
            return
        }

        if (event.buttons === MouseButtons.Left) {
            StartSelectionWindow.start({
                event,
                editor: this._editor,
                container
            })
        }
    }

    onGridClick(event: MouseEvent, container: HTMLElement) {
        AddNote.start({
            event,
            editor: this._editor,
            container
        })
    }

    onViewMouseDown(event: MouseEvent) {
        if (event.buttons === MouseButtons.Middle) {
            event.preventDefault()
            event.stopPropagation()
            CycleActiveString.start({
                event,
                editor: this._editor
            })
        }
    }

    onKeyboardNoteMouseDown(event: MouseEvent, note: Note) {
        if (event.buttons === MouseButtons.Left)
            event.preventDefault()

        this._startKeyboard(PlayKeyboardNote, event, note)
    }

    onKeyboardNoteMouseEnter(event: MouseEvent, note: Note) {
        this._startKeyboard(PlayKeyboardNote, event, note)
    }

    onKeyboardNoteMouseLeave() {
        this._clearKeyboardHandler()
    }

    destroy() {
        this._clearHandler()
        this._clearKeyboardHandler()
    }

    private _clearHandler() {
        this._activeHandler?.destroy()
        this._activeHandler = null
    }

    private _clearKeyboardHandler() {
        this._keyboardHandler?.destroy()
        this._keyboardHandler = null
    }

    private _start(action: PatternEditorMouseAction, event: MouseEvent, note: NoteEvent) {
        const handler = action.start({
            event,
            editor: this._editor,
            note
        })

        if (handler) {
            this._clearHandler()
            this._activeHandler = handler
        }
    }

    private _startKeyboard(action: PatternEditorKeyboardMouseAction, event: MouseEvent, note: Note) {
        const handler = action.start({
            event,
            editor: this._editor,
            note
        })

        if (handler) {
            this._clearKeyboardHandler()
            this._keyboardHandler = handler
        }
    }

}
