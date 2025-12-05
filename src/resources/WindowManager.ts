import { Engine, Resource } from "@niloc/ecs";
import type { Vec2 } from "@niloc/utils";
import { nanoid } from "nanoid";
import type { ReactNode } from "react";

export type Window = {
    id: string,
    position: Vec2,
    size: Vec2,
    close(): void,
    content: ReactNode,
    name: string
}

export class WindowManager extends Resource {

    private _windows: Window[] = []

    constructor(engine: Engine) {
        super(engine)
    }

    get windows() {
        return this._windows
    }

    add(name: string, render: (close: () => void) => ReactNode) {
        const id = nanoid()
        const close = () => this._close(id)
        const content = render(close)

        const window: Window = {
            id,
            position: { x: 100, y: 100 },
            size: { x: 400, y: 300 },
            close: () => {
                this._windows = this._windows.filter(w => w.id !== id)
                this.changed()
            },
            content,
            name
        }

        this._windows.push(window)
        this.changed()
        return window
    }

    private _close(id: string) {
        this._windows = this._windows.filter(w => w.id !== id)
        this.changed()
    }

}