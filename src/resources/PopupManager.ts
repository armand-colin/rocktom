import { Resource } from "@niloc/ecs";
import { nanoid } from "nanoid";
import type { ReactNode } from "react";

export type Popup = {
    id: string,
    close: () => void,
    state: "open" | "closing",
    content: ReactNode
}

const CLOSE_TIMEOUT = 1000

export class PopupManager extends Resource {

    private _popups: Popup[] = []

    get popups() {
        return this._popups
    }

    add(render: (close: () => void) => ReactNode): Popup {
        const id = nanoid()

        const close = () => this.close(id)

        const popup: Popup = {
            id,
            close: close,
            content: render(close),
            state: "open"
        }

        this._popups.push(popup)
        this.changed()
        return popup
    }

    close(id: string) {
        const index = this._popups.findIndex(p => p.id === id)
        if (index === -1 || this._popups[index].state !== "open")
            return

        const popup = this._popups[index]
        popup.state = "closing"
        this.changed()

        setTimeout(() => {
            const index = this._popups.findIndex(p => p.id === id)
            if (index === -1)
                return

            this._popups.splice(index, 1)
            this.changed()
        }, CLOSE_TIMEOUT)
    }

}