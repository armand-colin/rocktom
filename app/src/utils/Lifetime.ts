import { Emitter } from "@niloc/utils";

export class Lifetime {

    private _unmounted = false

    readonly events = new Emitter<{ dismount: void }>()

    get unmounted() {
        return this._unmounted
    }

    unmount() {
        if (this._unmounted)
            return;

        this._unmounted = true
        this.events.emit('dismount')
        this.events.removeAllListeners()
    }

}