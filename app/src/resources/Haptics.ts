import { Resource } from "@niloc/ecs"

const CLICK_DURATION_MS = 10

export class Haptics extends Resource {

    click() {
        if (typeof navigator.vibrate !== "function")
            return

        navigator.vibrate(CLICK_DURATION_MS)
    }

}
