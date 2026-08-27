import { MouseActionHandler } from "../../../mouse/MouseActionHandler"
import type { MouseEventDispatcher } from "../../../mouse/MouseEventDispatcher"
import { MouseTarget } from "../../../mouse/MouseTarget"
import { MouseTargetType } from "../../../mouse/MouseTargetType"
import type { NoteEvent } from "../../../sound/song/NoteEvent"
import { MouseButtons } from "../../../utils/MouseButtons"
import type { PatternEditor } from "../PatternEditor"
import { ChangeNoteString } from "./ChangeNoteString"
import { MoveNotes } from "./MoveNotes"
import { MoveSlide } from "./MoveSlide"
import { RemoveNote } from "./RemoveNote"
import { ResizeNoteDuration } from "./ResizeNoteDuration"
import { ResizeNoteSlideDuration } from "./ResizeNoteSlideDuration"
import { SelectNote } from "./SelectNote"

export class PatternNoteMouseDispatcher implements MouseEventDispatcher {

    constructor(private readonly _editor: PatternEditor) { }

    start(event: MouseEvent, target: MouseTarget | null): MouseActionHandler | null {
        if (!target || target.editor !== this._editor)
            return null

        const note = MouseTarget.noteEvent(target)
        if (!note)
            return null

        if (event.type === "contextmenu") {
            event.preventDefault()
            RemoveNote.start({ event, editor: this._editor, note })
            return MouseActionHandler.instant()
        }

        if (event.type === "mouseover") {
            if (!(event.buttons & MouseButtons.Right))
                return null

            event.preventDefault()
            RemoveNote.start({ event, editor: this._editor, note })
            return MouseActionHandler.instant()
        }

        if (event.type !== "mousedown")
            return null

        switch (target.type) {
            case MouseTargetType.NoteEvent:
                return this._onNoteMouseDown(event, note)
            case MouseTargetType.NoteSlide:
                return this._onSlideMouseDown(event, note)
            case MouseTargetType.NoteDurationEndResizer:
                return this._onResizeDuration(event, note)
            case MouseTargetType.NoteSlideDurationResizer:
                return this._onResizeSlideDuration(event, note)
            default:
                return null
        }
    }

    private _onNoteMouseDown(event: MouseEvent, note: NoteEvent) {
        if (event.buttons === MouseButtons.Middle || (event.buttons === MouseButtons.Left && event.altKey)) {
            event.preventDefault()
            ChangeNoteString.start({ event, editor: this._editor, note })
            return MouseActionHandler.instant()
        }

        if (event.buttons !== MouseButtons.Left)
            return null

        event.preventDefault()
        SelectNote.start({ event, editor: this._editor, note })
        return MouseActionHandler.fromHandler(MoveNotes.start({
            event,
            editor: this._editor,
            note
        })) ?? MouseActionHandler.instant()
    }

    private _onSlideMouseDown(event: MouseEvent, note: NoteEvent) {
        if (event.buttons === MouseButtons.Middle || (event.buttons === MouseButtons.Left && event.altKey)) {
            event.preventDefault()
            ChangeNoteString.start({ event, editor: this._editor, note })
            return MouseActionHandler.instant()
        }

        if (event.buttons !== MouseButtons.Left)
            return null

        event.preventDefault()
        SelectNote.start({ event, editor: this._editor, note })
        return MouseActionHandler.fromHandler(MoveSlide.start({
            event,
            editor: this._editor,
            note
        })) ?? MouseActionHandler.instant()
    }

    private _onResizeDuration(event: MouseEvent, note: NoteEvent) {
        event.preventDefault()
        SelectNote.start({ event, editor: this._editor, note })
        return MouseActionHandler.fromHandler(ResizeNoteDuration.start({
            event,
            editor: this._editor,
            note
        })) ?? MouseActionHandler.instant()
    }

    private _onResizeSlideDuration(event: MouseEvent, note: NoteEvent) {
        event.preventDefault()
        SelectNote.start({ event, editor: this._editor, note })
        return MouseActionHandler.fromHandler(ResizeNoteSlideDuration.start({
            event,
            editor: this._editor,
            note
        })) ?? MouseActionHandler.instant()
    }

}
