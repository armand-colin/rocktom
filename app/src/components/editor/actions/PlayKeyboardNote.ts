import { MouseActionHandler } from "../../../mouse/MouseActionHandler"
import type { MouseTarget } from "../../../mouse/MouseTarget"
import { MouseTargetType } from "../../../mouse/MouseTargetType"
import type { Note } from "../../../sound/note/Note"
import type { PatternEditor } from "../PatternEditor"

export namespace PlayKeyboardNote {
    export function start(editor: PatternEditor, note: Note): MouseActionHandler | null {
        if (editor.selectionWindow)
            return null

        return new PlayKeyboardNoteHandler(editor, note)
    }
}

class PlayKeyboardNoteHandler extends MouseActionHandler {

    constructor(
        private readonly _editor: PatternEditor,
        private _note: Note
    ) {
        super()
        this._editor.virtualBass.playNote(this._note)
        MouseActionHandler.onDispose(this, () => {
            this._editor.virtualBass.stopNote(this._note)
        })
    }

    override onMouseUp() {
        this.dispose()
    }

    override onMouseOver(_event: MouseEvent, target: MouseTarget | null) {
        if (target?.type !== MouseTargetType.PatternEditorKeyboard)
            return

        if (target.editor !== this._editor)
            return

        if (target.note === this._note)
            return

        this._editor.virtualBass.stopNote(this._note)
        this._note = target.note
        this._editor.virtualBass.playNote(this._note)
    }

    override onMouseOut(event: MouseEvent) {
        const related = event.relatedTarget
        if (related instanceof Node) {
            const element = related instanceof Element ? related : related.parentElement
            if (element?.closest(`[data-mouse-target="${MouseTargetType.PatternEditorKeyboard}"]`))
                return
        }

        this.dispose()
    }

}
