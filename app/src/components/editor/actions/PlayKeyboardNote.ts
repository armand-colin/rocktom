import type { Note } from "../../../sound/note/Note";
import type { Handler } from "../../../utils/handlers/Handler";
import { MouseButtons } from "../../../utils/MouseButtons";
import type { PatternEditor } from "../PatternEditor";
import type { PatternEditorKeyboardMouseAction } from "./PatternEditorMouseAction";

export const PlayKeyboardNote: PatternEditorKeyboardMouseAction = {
    start(context) {
        const { event, editor, note } = context

        if (event.buttons !== MouseButtons.Left)
            return null

        if (editor.selectionWindow)
            return null

        editor.virtualBass.playNote(note)
        return new PlayKeyboardNoteHandler(editor, note)
    }
}

class PlayKeyboardNoteHandler implements Handler {

    private _destroyed = false

    constructor(
        private readonly _editor: PatternEditor,
        private readonly _note: Note
    ) {
        window.addEventListener("mouseup", this._onMouseUp)
    }

    private _onMouseUp = () => {
        this.destroy()
    }

    destroy() {
        if (this._destroyed)
            return

        this._destroyed = true
        window.removeEventListener("mouseup", this._onMouseUp)
        this._editor.virtualBass.stopNote(this._note)
    }

}
