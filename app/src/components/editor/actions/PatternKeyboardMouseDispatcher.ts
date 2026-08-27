import type { MouseActionHandler } from "../../../mouse/MouseActionHandler"
import type { MouseEventDispatcher } from "../../../mouse/MouseEventDispatcher"
import type { MouseTarget } from "../../../mouse/MouseTarget"
import { MouseTargetType } from "../../../mouse/MouseTargetType"
import { MouseButtons } from "../../../utils/MouseButtons"
import type { PatternEditor } from "../PatternEditor"
import { PlayKeyboardNote } from "./PlayKeyboardNote"

export class PatternKeyboardMouseDispatcher implements MouseEventDispatcher {

    constructor(private readonly _editor: PatternEditor) { }

    start(event: MouseEvent, target: MouseTarget | null): MouseActionHandler | null {
        if (!target || target.type !== MouseTargetType.PatternEditorKeyboard)
            return null

        if (target.editor !== this._editor)
            return null

        if (event.type !== "mousedown" && event.type !== "mouseover")
            return null

        if (event.buttons !== MouseButtons.Left)
            return null

        if (event.type === "mousedown")
            event.preventDefault()

        return PlayKeyboardNote.start(this._editor, target.note)
    }

}
