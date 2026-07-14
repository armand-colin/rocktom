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

export type WindowPosition = {
    type: "fixed",
    position: Vec2,
} | {
    type: "centered",
}

export namespace WindowPosition {
    export function fixed(position: Vec2): WindowPosition {
        return {
            type: "fixed",
            position,
        }
    }

    export function centered(): WindowPosition {
        return { type: "centered" }
    }
}

export type WindowSize = {
    type: "fixed",
    size: Vec2,
} | {
    type: "relative",
    percentage: Vec2,
}

export namespace WindowSize {
    export function fixed(size: Vec2): WindowSize {
        return {
            type: "fixed",
            size,
        }
    }

    export function relative(percentage: number | Vec2): WindowSize {
        return {
            type: "relative",
            percentage: typeof percentage === "number" ? 
                Vec2.create(percentage, percentage) : 
                percentage,
        }
    }
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

    add(
        opts: {
            name: string,
            id?: string,
            position?: WindowPosition,
            size?: WindowSize
        },
        render: (close: () => void) => ReactNode
    ): Window {
        const index = opts.id ? this._windows.findIndex(w => w.id === opts.id) : -1
        if (index !== -1)
            return this._windows[index]

        const id = nanoid()
        const close = () => this._close(id)
        const content = render(close)

        const position = opts.position ?? WindowPosition.centered()
        const size = opts.size ?? WindowSize.relative(0.5)

        const realSize = size.type === "fixed" ?
            size.size :
            size.type === "relative" ?
            Vec2.create(this._windowSize.x * size.percentage.x, this._windowSize.y * size.percentage.y) :
            Vec2.create(0, 0);

        const realPosition = position.type === "fixed" ? 
            position.position :
            position.type === "centered" ?
            Vec2.create(this._windowSize.x / 2 - realSize.x / 2, this._windowSize.y / 2 - realSize.y / 2) :
            Vec2.create(0, 0);

        const window: Window = {
            id,
            position: realPosition,
            size: realSize,
            close,
            content,
            name: opts.name,
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