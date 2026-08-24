import type { PatternEditorViewMouseAction } from "./PatternEditorMouseAction";

export const CycleActiveString: PatternEditorViewMouseAction = {
    start(context) {
        const { editor } = context
        const string = editor.string
        const index = (string.index + 1) % editor.pattern.instrument.strings.length
        const newString = editor.pattern.instrument.strings[index]

        if (newString)
            editor.setString(newString)

        return null
    }
}
