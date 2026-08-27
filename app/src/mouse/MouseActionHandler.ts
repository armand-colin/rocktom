import type { Handler } from "../utils/handlers/Handler"
import type { MouseTarget } from "./MouseTarget"

export abstract class MouseActionHandler {
    private _onDispose: (() => void) | null = null
    private _disposed = false

    static onDispose(handler: MouseActionHandler, onDispose: () => void) {
        if (handler._disposed) {
            onDispose()
            return
        }

        const previous = handler._onDispose
        handler._onDispose = () => {
            previous?.()
            onDispose()
        }
    }

    static instant(): MouseActionHandler {
        const handler = new InstantMouseActionHandler()
        handler.dispose()
        return handler
    }

    static fromHandler(handler: Handler | null | undefined): MouseActionHandler | null {
        if (!handler)
            return null

        return new HandlerMouseActionHandler(handler)
    }

    get disposed() {
        return this._disposed
    }

    dispose() {
        if (this._disposed)
            return

        this._disposed = true
        this._onDispose?.()
        this._onDispose = null
    }

    onMouseDown(_event: MouseEvent, _target: MouseTarget | null) { }
    onMouseUp(_event: MouseEvent, _target: MouseTarget | null) { }
    onClick(_event: MouseEvent, _target: MouseTarget | null) { }
    onContextMenu(_event: MouseEvent, _target: MouseTarget | null) { }
    onMouseMove(_event: MouseEvent, _target: MouseTarget | null) { }
    onMouseOver(_event: MouseEvent, _target: MouseTarget | null) { }
    onMouseOut(_event: MouseEvent, _target: MouseTarget | null) { }
}

class InstantMouseActionHandler extends MouseActionHandler { }

class HandlerMouseActionHandler extends MouseActionHandler {
    constructor(handler: Handler) {
        super()
        MouseActionHandler.onDispose(this, () => handler.destroy())
    }

    override onMouseUp() {
        this.dispose()
    }
}
