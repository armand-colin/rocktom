import { Action, Engine, Resource } from "@niloc/ecs";
import type { Shortcut } from "./Shortcut";
import { OS } from "../../utils/OS";

type ShortcutBinding = {
    shortcut: Shortcut,
    action: Action
}

export class ShortcutManager extends Resource {

    private _bindings = new Map<Shortcut, ShortcutBinding>()

    constructor(engine: Engine) {
        super(engine)

        window.addEventListener('keydown', (event) => {
            let ctrl = event.ctrlKey
            if (OS.isMacOS)
                ctrl = event.metaKey

            let prevented = false

            console.log([...this._bindings.values()].map(b => b.shortcut), {
                code: event.code,
                ctrl: event.ctrlKey,
                meta: event.metaKey,
                alt: event.altKey,
                shift: event.shiftKey,
            })

            for (const { shortcut, action } of this._bindings.values()) {
                if (
                    event.target instanceof HTMLInputElement ||
                    event.target instanceof HTMLTextAreaElement
                )
                    return

                if (
                    event.code === shortcut.keyCode &&
                    ctrl === shortcut.ctrl &&
                    event.altKey === shortcut.alt &&
                    event.shiftKey === shortcut.shift
                ) {
                    if (!prevented) {
                        prevented = true
                        event.preventDefault()
                    }

                    console.log('Matched', shortcut)

                    action.publish()
                }
            }
        })
    }
    private _bind(shortcut: Shortcut) {
        const action = new Action()
        this._bindings.set(shortcut, { shortcut, action })
    }

    register(shortcut: Shortcut, callback: () => void) {
        this.getAction(shortcut).register(callback)
    }

    unregister(shortcut: Shortcut, callback: () => void) {
        this.getAction(shortcut).unregister(callback)
    }

    getAction(shortcut: Shortcut): Action {
        if (!this._bindings.has(shortcut))
            this._bind(shortcut)

        return this._bindings.get(shortcut)!.action
    }

}