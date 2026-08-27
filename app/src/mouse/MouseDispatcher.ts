import { Engine, Resource } from "@niloc/ecs"
import { MouseActionHandler } from "./MouseActionHandler"
import type { MouseEventDispatcher } from "./MouseEventDispatcher"
import { MouseTarget } from "./MouseTarget"

export class MouseDispatcher extends Resource {

    private _dispatchers: MouseEventDispatcher[] = []
    private _active: MouseActionHandler | null = null
    private _activeDispatcher: MouseEventDispatcher | null = null

    constructor(engine: Engine) {
        super(engine)

        document.body.addEventListener("mousedown", this._onMouseDown)
        document.body.addEventListener("click", this._onClick)
        document.body.addEventListener("contextmenu", this._onContextMenu)
        document.body.addEventListener("mouseover", this._onMouseOver)
        document.body.addEventListener("mouseout", this._onMouseOut)
        window.addEventListener("mousemove", this._onMouseMove)
        window.addEventListener("mouseup", this._onMouseUp)
    }

    push(dispatcher: MouseEventDispatcher) {
        this._dispatchers.push(dispatcher)
        return () => this.remove(dispatcher)
    }

    remove(dispatcher: MouseEventDispatcher) {
        const index = this._dispatchers.indexOf(dispatcher)
        if (index < 0)
            return

        this._dispatchers.splice(index, 1)

        if (this._activeDispatcher === dispatcher) {
            this._active?.dispose()
            this._active = null
            this._activeDispatcher = null
        }
    }

    private _start(event: MouseEvent) {
        const target = MouseTarget.get(event)

        for (const dispatcher of this._dispatchers) {
            const handler = dispatcher.start(event, target)
            if (!handler)
                continue

            if (handler.disposed)
                return

            this._active = handler
            this._activeDispatcher = dispatcher
            MouseActionHandler.onDispose(handler, () => {
                if (this._active === handler) {
                    this._active = null
                    this._activeDispatcher = null
                }
            })
            return
        }
    }

    private _handle(event: MouseEvent, method: "onMouseDown" | "onMouseUp" | "onClick" | "onContextMenu" | "onMouseMove" | "onMouseOver" | "onMouseOut") {
        const handler = this._active
        if (!handler) {
            this._start(event);
            return;
        }

        handler[method](event, MouseTarget.get(event))
    }

    private _onMouseDown = (event: MouseEvent) => {
        this._handle(event, "onMouseDown");
    }

    private _onMouseMove = (event: MouseEvent) => {
        this._handle(event, "onMouseMove");
    }

    private _onMouseUp = (event: MouseEvent) => {
        this._handle(event, "onMouseUp");
    }

    private _onClick = (event: MouseEvent) => {
        this._handle(event, "onClick");
    }

    private _onContextMenu = (event: MouseEvent) => {
        this._handle(event, "onContextMenu");
    }

    private _onMouseOver = (event: MouseEvent) => {
        this._handle(event, "onMouseOver");
    }

    private _onMouseOut = (event: MouseEvent) => {
        this._handle(event, "onMouseOut");
    }
    
}
