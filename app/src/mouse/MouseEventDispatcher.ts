import type { MouseActionHandler } from "./MouseActionHandler"
import type { MouseTarget } from "./MouseTarget"

export interface MouseEventDispatcher {
    start(event: MouseEvent, target: MouseTarget | null): MouseActionHandler | null | undefined
}
