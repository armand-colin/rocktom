import { Action, Engine, Resource } from "@niloc/ecs";

export enum Input {
    Play,
    Reset,
}

export class InputManager extends Resource {

    private _actions = new Map<Input, Action>()

    constructor(engine: Engine) {
        super(engine)

        window.addEventListener('keydown', (event) => {
            if (event.code === "Space") {
                this._trigger(Input.Play)
                event.preventDefault()
            }

            if (event.code === "KeyR" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
                this._trigger(Input.Reset)
                event.preventDefault()
            }
        })
    }

    register(input: Input, callback: () => void) {
        this.getAction(input).register(callback)
    }

    getAction(input: Input) {
        let action = this._actions.get(input)
        if (!action) {
            action = new Action()
            this._actions.set(input, action)
        }
        return action
    }

    private _trigger(input: Input) {
        const action = this._actions.get(input)
        if (action)
            action.publish()
    }

}