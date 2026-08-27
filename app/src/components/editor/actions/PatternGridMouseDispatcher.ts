import { MouseActionHandler } from "../../../mouse/MouseActionHandler"
import type { MouseEventDispatcher } from "../../../mouse/MouseEventDispatcher"
import type { MouseTarget } from "../../../mouse/MouseTarget"
import { MouseTargetType } from "../../../mouse/MouseTargetType"
import { MouseButtons } from "../../../utils/MouseButtons"
import type { PatternEditor } from "../PatternEditor"
import { AddNote } from "./AddNote"
import { ClearSelection } from "./ClearSelection"
import { StartSelectionWindow } from "./StartSelectionWindow"

export class PatternGridMouseDispatcher implements MouseEventDispatcher {

    constructor(private readonly _editor: PatternEditor) { }

    start(event: MouseEvent, target: MouseTarget | null): MouseActionHandler | null {
        if (!target || target.type !== MouseTargetType.PatternGrid)
            return null

        if (target.editor !== this._editor)
            return null

        if (event.type === "mousedown") {
            if (event.buttons === MouseButtons.Right) {
                event.preventDefault()
                ClearSelection.start({
                    event,
                    editor: this._editor
                })
                return MouseActionHandler.instant()
            }

            if (event.buttons === MouseButtons.Left) {
                StartSelectionWindow.start({
                    event,
                    editor: this._editor,
                    container: target.container
                })
                return null
            }

            return null
        }

        if (event.type === "click") {
            AddNote.start({
                event,
                editor: this._editor,
                container: target.container
            })
            return MouseActionHandler.instant()
        }

        return null
    }

}
