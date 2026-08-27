import { MouseActionHandler } from "../../../mouse/MouseActionHandler"
import type { MouseEventDispatcher } from "../../../mouse/MouseEventDispatcher"
import type { MouseTarget } from "../../../mouse/MouseTarget"
import { MouseButtons } from "../../../utils/MouseButtons"
import type { PatternEditor } from "../PatternEditor"
import { CycleActiveString } from "./CycleActiveString"

export class PatternCycleStringMouseDispatcher implements MouseEventDispatcher {

    constructor(private readonly _editor: PatternEditor) { }

    start(event: MouseEvent, target: MouseTarget | null): MouseActionHandler | null {
        if (!target || target.editor !== this._editor)
            return null

        if (event.type !== "mousedown")
            return null

        if (event.buttons !== MouseButtons.Middle)
            return null

        event.preventDefault()
        CycleActiveString.start({
            event,
            editor: this._editor
        })
        return MouseActionHandler.instant()
    }

}
