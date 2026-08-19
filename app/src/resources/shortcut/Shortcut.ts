export enum KeyCode {
    C = "KeyC",
    S = "KeyS",
    R = "KeyR",
    X = "KeyX",
    N = "KeyN",
    Space = "Space",
}

export namespace KeyCode {

    export function toString(code: KeyCode): string {
        switch (code) {
            case KeyCode.Space:
                return 'Space'
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