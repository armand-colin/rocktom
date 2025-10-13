import type { Coroutine } from "./Coroutine";

export class Scheduler {

    private _frameCoroutines: Coroutine[] = []
    private _frameRequest: number | null = null

    add(coroutine: Coroutine) {
        this._handle(coroutine)
    }

    private _handle(coroutine: Coroutine) {
        const next = coroutine.next()
        if (next.done)
            return

        if (next.value === null) {
            this._frameCoroutines.push(coroutine)
            if (this._frameRequest === null) {
                this._frameRequest = requestAnimationFrame(() => {
                    this._handleFrame()
                })
            }
        } else
            next.value.then(() => this._handle(coroutine))
    }

    private _handleFrame() {
        this._frameRequest = null
        const coroutines = this._frameCoroutines
        this._frameCoroutines = []

        for (const coroutine of coroutines)
            this._handle(coroutine)
    }

}