import { Emitter, Vec2 } from "@niloc/utils";
import type { Transform2D } from "../Transform2D";
import type { Handler } from "./Handler";

export class Mover implements Handler {

    protected startMouse: Vec2
    protected startTransform: Transform2D
    protected windowSize: Vec2

    readonly events = new Emitter<{ changed: Vec2 }>()

    constructor(opts: {
        event: MouseEvent,
        size: Vec2,
        position: Vec2,
        windowSize: Vec2,
    }) {
        this.startMouse = Vec2.create(opts.event.clientX, opts.event.clientY)
        this.startTransform = {
            size: opts.size,
            position: opts.position,
        }
        this.windowSize = opts.windowSize

        window.addEventListener("mousemove", this._onMouseMove)
        window.addEventListener("mouseup", this._onMouseUp)
    }

    destroy(): void {
        window.removeEventListener("mousemove", this._onMouseMove)
        window.removeEventListener("mouseup", this._onMouseUp)
    }

    private _onMouseMove = (e: MouseEvent) => {
        const mouse = Vec2.create(e.clientX, e.clientY)
        const position = this.update(mouse)
        this.events.emit('changed', position)
    }

    private _onMouseUp = () => {
        this.destroy()
    }

    protected update(mouse: Vec2): Vec2 {
        const delta = Vec2.subtract(mouse, this.startMouse)
        const position = Vec2.add(this.startTransform.position, delta)
        return position
    }

}