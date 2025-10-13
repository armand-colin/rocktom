import { Emitter } from "@niloc/utils"
import { nanoid } from "nanoid"

type Events = {
    change: void
}

export class Component extends Emitter<Events> {

    readonly id = nanoid()

    changed() {
        this.emit('change')
    }

}