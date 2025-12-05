import { Engine, Resource } from "@niloc/ecs";
import { Emitter, Vec2 } from "@niloc/utils";
import { nanoid } from "nanoid";
import type { ReactNode } from "react";
import type { Transform2D } from "../utils/Transform2D";

export type Window = {
    id: string,
    position: Vec2,
    size: Vec2,
    close(): void,
    content: ReactNode,
    name: string,
    events: Emitter<{ closed: void }>
}

export class WindowManager extends Resource {

    private _windows: Window[] = []
    private _windowSize: Vec2

    constructor(engine: Engine) {
        super(engine)
        this._windowSize = Vec2.create(window.innerWidth, window.innerHeight)

        window.addEventListener("resize", () => {
            this._windowSize = Vec2.create(window.innerWidth, window.innerHeight)
            this._constraintWindows()
            this.changed()
        })
    }

    get windows() {
        return this._windows
    }

    get windowSize() {
        return this._windowSize
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
            name,
            events: new Emitter()
        }

        this._windows.push(window)
        this.changed()
        return window
    }

    setPosition(id: string, position: Vec2) {
        const index = this._windows.findIndex(w => w.id === id)
        if (index === -1)
            return

        this._windows[index].position = position
        this.changed()
    }

    setTransform(id: string, transform: Transform2D) {
        const index = this._windows.findIndex(w => w.id === id)
        if (index === -1)
            return

        this._windows[index].position = transform.position
        this._windows[index].size = transform.size
        this.changed()
    }

    setContent(id: string, render: (close: () => void) => ReactNode) {
        const index = this._windows.findIndex(w => w.id === id)
        if (index === -1)
            return

        const window = this._windows[index]
        const close = window.close
        window.content = render(close)

        this.changed()
    }

    private _constraintWindows() {
        // TODO
    }

    private _close(id: string) {
        const index = this._windows.findIndex(w => w.id === id)
        if (index === -1)
            return

        const window = this._windows[index]
        this._windows.splice(index, 1)
        this.changed()
        window.events.emit('closed')
    }

}