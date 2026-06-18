import { Resource } from "@niloc/ecs";
import { nanoid } from "nanoid";
import type { ReactNode } from "react";

export type Toast = {
    id: string,
    close: () => void,
    state: "open" | "closing",
    content: ReactNode
}

const CLOSE_TIMEOUT = 300
const DEFAULT_DURATION = 4000

export class ToastManager extends Resource {

    private _toasts: Toast[] = []
    private _timeouts = new Map<string, ReturnType<typeof setTimeout>>()

    get toasts() {
        return this._toasts
    }

    add(render: (close: () => void) => ReactNode, duration = DEFAULT_DURATION): Toast {
        const id = nanoid()
        const close = () => this.close(id)

        const toast: Toast = {
            id,
            close,
            content: render(close),
            state: "open",
        }

        this._toasts.push(toast)
        this.changed()

        const timeout = setTimeout(close, duration)
        this._timeouts.set(id, timeout)

        return toast
    }

    close(id: string) {
        const timeout = this._timeouts.get(id)
        if (timeout) {
            clearTimeout(timeout)
            this._timeouts.delete(id)
        }

        const index = this._toasts.findIndex(t => t.id === id)
        if (index === -1 || this._toasts[index].state !== "open")
            return

        const toast = this._toasts[index]
        toast.state = "closing"
        this.changed()

        setTimeout(() => {
            const index = this._toasts.findIndex(t => t.id === id)
            if (index === -1)
                return

            this._toasts.splice(index, 1)
            this.changed()
        }, CLOSE_TIMEOUT)
    }

}
