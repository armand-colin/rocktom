import { Shortcut, KeyCode } from "./Shortcut"

export namespace Shortcuts {

    export const Play = new Shortcut({ keyCode: KeyCode.Space })
    export const Reset = new Shortcut({ keyCode: KeyCode.R, ctrl: true })
    export const Save = new Shortcut({ keyCode: KeyCode.S, ctrl: true })

    export const Editor = {
        Split: new Shortcut({ keyCode: KeyCode.S, alt: true })
    }

}