import { Instance } from "../../../Instance";
import { SelectionWindow } from "../SelectionWindow";
import type { PatternEditorGridMouseAction } from "./PatternEditorMouseAction";

export const StartSelectionWindow: PatternEditorGridMouseAction = {
    start(context) {
        const { event, editor, container } = context

        if (editor.selectionWindow)
            return null

        const selectionWindow = new SelectionWindow(Instance.engine, {
            notes: editor.pattern.notes,
            event,
            container,
            timeTransform: editor.transform,
            noteTransform: editor.noteTransform,
            editor
        })

        editor.setSelectionWindow(selectionWindow)

        selectionWindow.events.on("end", () => {
            // Delay so click handlers can detect an active / just-ended selection
            setTimeout(() => {
                if (editor.selectionWindow !== selectionWindow)
                    return

                selectionWindow.destroy()
                editor.setSelectionWindow(null)
            }, 50)
        })

        return null
    }
}
