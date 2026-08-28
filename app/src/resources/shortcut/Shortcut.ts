import { OS } from "../../utils/OS"

export enum KeyCode {
    C = "KeyC",
    D = "KeyD",
    V = "KeyV",
    S = "KeyS",
    R = "KeyR",
    X = "KeyX",
    N = "KeyN",
    Space = "Space",
    Tab = "Tab",
    Delete = "Delete",
    ArrowUp = "ArrowUp",
    ArrowDown = "ArrowDown",
}

export namespace KeyCode {

    export function toEventCode(code: KeyCode): string {
        if (code === KeyCode.Delete)
            return OS.deleteKeyCode
        return code
    }

    export function toString(code: KeyCode): string {
        switch (code) {
            case KeyCode.Space:
                return 'Space'
            case KeyCode.Tab:
                return 'Tab'
            case KeyCode.Delete:
                return OS.isMacOS ? 'Backspace' : 'Suppr'
            case KeyCode.ArrowUp:
                return '↑'
            case KeyCode.ArrowDown:
                return '↓'
            default:
                return code.slice(3)
        }
    }

}

export class Shortcut {

    readonly keyCode: KeyCode
    readonly ctrl: boolean
    readonly alt: boolean
    readonly shift: boolean

    constructor(opts: {
        keyCode: KeyCode,
        ctrl?: boolean,
        alt?: boolean,
        shift?: boolean,
    }) {
        this.keyCode = opts.keyCode
        this.ctrl = opts.ctrl ?? false
        this.alt = opts.alt ?? false
        this.shift = opts.shift ?? false
    }

}
