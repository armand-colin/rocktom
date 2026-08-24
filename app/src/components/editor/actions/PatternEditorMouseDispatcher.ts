import type { NoteEvent } from "../../../sound/song/NoteEvent";
import type { Handler } from "../../../utils/handlers/Handler";
import { MouseButtons } from "../../../utils/MouseButtons";
import type { PatternEditor } from "../PatternEditor";
import { ChangeNoteString } from "./ChangeNoteString";
import { MoveNotes } from "./MoveNotes";
import { MoveSlide } from "./MoveSlide";
import type { PatternEditorMouseAction } from "./PatternEditorMouseAction";
import { RemoveNote } from "./RemoveNote";
import { ResizeNoteDuration } from "./ResizeNoteDuration";
import { ResizeNoteSlideDuration } from "./ResizeNoteSlideDuration";
import { SelectNote } from "./SelectNote";

export class PatternEditorMouseDispatcher {

    private _activeHandler: Handler | null = null

    private readonly _selectNote = new SelectNote()
    private readonly _removeNote = new RemoveNote()
    private readonly _changeNoteString = new ChangeNoteString()
    private readonly _moveNotes = new MoveNotes()
    private readonly _moveSlide = new MoveSlide()
    private readonly _resizeNoteDuration = new ResizeNoteDuration()
    private readonly _resizeNoteSlideDuration = new ResizeNoteSlideDuration()

    constructor(private readonly _editor: PatternEditor) { }

    onNoteMouseDown(event: MouseEvent, note: NoteEvent) {
        if (event.buttons === MouseButtons.Middle) {
            event.preventDefault()
            event.stopPropagation()
            this._start(this._changeNoteString, event, note)
            return
        }

        if (event.buttons === MouseButtons.Left) {
            event.preventDefault()
            event.stopPropagation()
            this._clearHandler()
            this._start(this._selectNote, event, note)
            this._start(this._moveNotes, event, note)
        }
    }

    onSlideMouseDown(event: MouseEvent, note: NoteEvent) {
        if (event.buttons === MouseButtons.Middle) {
            event.preventDefault()
            event.stopPropagation()
            this._start(this._changeNoteString, event, note)
            return
        }

        if (event.buttons === MouseButtons.Left) {
            event.preventDefault()
            event.stopPropagation()
            this._clearHandler()
            this._start(this._selectNote, event, note)
            this._start(this._moveSlide, event, note)
        }
    }

    onResizeDuration(event: MouseEvent, note: NoteEvent) {
        event.preventDefault()
        event.stopPropagation()
        this._clearHandler()
        this._start(this._selectNote, event, note)
        this._start(this._resizeNoteDuration, event, note)
    }

    onResizeSlideDuration(event: MouseEvent, note: NoteEvent) {
        event.preventDefault()
        event.stopPropagation()
        this._clearHandler()
        this._start(this._selectNote, event, note)
        this._start(this._resizeNoteSlideDuration, event, note)
    }

    onNoteContextMenu(event: MouseEvent, note: NoteEvent) {
        event.stopPropagation()
        event.preventDefault()
        this._start(this._removeNote, event, note)
    }

    onNoteMouseEnter(event: MouseEvent, note: NoteEvent) {
        if (event.buttons & MouseButtons.Right) {
            event.preventDefault()
            this._start(this._removeNote, event, note)
        }
    }

    destroy() {
        this._clearHandler()
    }

    private _clearHandler() {
        this._activeHandler?.destroy()
        this._activeHandler = null
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

}
