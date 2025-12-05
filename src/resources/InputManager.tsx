import { Action, Engine, Resource } from "@niloc/ecs";
import { Emitter } from "@niloc/utils";
import { Icon } from "../ui/icon/Icon";
import type { ReactNode } from "react";
import { OS } from "../utils/OS";

export enum Input {
    Play,
    Reset,
}

abstract class Key extends Emitter<{ trigger: void }> {

    abstract icon: ReactNode

}

class KeyboardKey extends Key {

    private _keyCode: string
    private _ctrl: boolean = false
    private _alt: boolean = false
    private _shift: boolean = false
    private _label: string

    constructor(opts: {
        keyCode: string,
        label?: string,
        ctrl?: boolean,
        alt?: boolean,
        shift?: boolean,
    }) {
        super()
        this._keyCode = opts.keyCode.toLowerCase()
        this._ctrl = opts.ctrl ?? false
        this._alt = opts.alt ?? false
        this._shift = opts.shift ?? false
        this._label = opts.label ?? opts.keyCode

        window.addEventListener('keydown', (event) => {
            let ctrl = event.ctrlKey
            if (OS.isMacOS)
                ctrl = event.metaKey

            if (
                event.code.toLowerCase() === this._keyCode &&
                ctrl === this._ctrl &&
                event.altKey === this._alt &&
                event.shiftKey === this._shift
            ) {
                this.emit('trigger')
                event.preventDefault()
            }
        })
    }

    private _getKeyIcon(): ReactNode {
        if (this._keyCode === "space")
            return <Icon name="space_bar" />

        return <>{this._label}</>
    }

    get icon() {
        const parts = []
        if (this._ctrl)
            parts.push(<>Ctrl</>)

        if (this._alt)
            parts.push(<>Alt</>)

        if (this._shift)
            parts.push(<Icon name="shift" />)

        parts.push(this._getKeyIcon())

        const merged = parts.reduce((prev, curr, i) => {
            if (i === 0)
                return <>{curr}</>

            return <>
                {prev} + {curr}
            </>
        }, <></>)

        return merged
    }

}

type InputBinding = {
    key: Key,
    action: Action
}

export class InputManager extends Resource {

    private _bindings = new Map<Input, InputBinding>()

    constructor(engine: Engine) {
        super(engine)

        this._bind(Input.Play, new KeyboardKey({
            keyCode: "Space",
        }))

        this._bind(Input.Reset, new KeyboardKey({
            keyCode: "KeyR",
            ctrl: true,
            label: "R"
        }))
    }

    private _bind(input: Input, key: Key) {
        const action = new Action()
        key.on('trigger', () => action.publish())
        this._bindings.set(input, { key, action })
    }

    register(input: Input, callback: () => void) {
        this.getAction(input)?.register(callback)
    }

    unregister(input: Input, callback: () => void) {
        this.getAction(input)?.unregister(callback)
    }

    getAction(input: Input): Action {
        const bindings = this._bindings.get(input)

        if (!bindings)
            throw new Error(`No action registered for input ${Input[input]}`)

        return bindings.action
    }

    getKey(input: Input): Key {
        const bindings = this._bindings.get(input)

        if (!bindings)
            throw new Error(`No key registered for input ${Input[input]}`)

        return bindings.key
    }

}