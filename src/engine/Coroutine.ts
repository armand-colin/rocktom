import { nanoid } from "nanoid"

export type CoroutineReturn = null | Promise<void>

export class Coroutine {

    readonly id = nanoid()

    private _iterator: Iterator<CoroutineReturn>

    constructor(iterator: Iterator<CoroutineReturn>) {
        this._iterator = iterator
    }

    next(): IteratorResult<CoroutineReturn> {
        return this._iterator.next()
    }

    cancel() {
        this._iterator.return?.()
    }

}