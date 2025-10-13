import { Emitter } from "@niloc/utils"

type Events = {
    change: void
}

export class Resource extends Emitter<Events> {

    changed() {
        this.emit('change')
    }

    async coroutine(coroutine: Iterator<unknown>) {
        while (true) {
            const result = coroutine.next()

            if (result.done)
                return

            await new Promise((resolve) => {
                setTimeout(resolve, 100)
            })
        }
    }

}