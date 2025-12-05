import { Emitter, Vec2 } from "@niloc/utils";
import type { Transform2D } from "../Transform2D";
import type { Handler } from "./Handler";

export type ResizerOpts = {
    event: MouseEvent,
    minSize: Vec2,
    windowSize: Vec2,
    size: Vec2,
    position: Vec2,
}

export abstract class Resizer implements Handler {

    protected startMouse: Vec2
    protected startTransform: Transform2D

    protected minSize: Vec2
    protected windowSize: Vec2

    readonly events = new Emitter<{ changed: { size: Vec2, position: Vec2 } }>()

    constructor(opts: ResizerOpts) {
        this.startMouse = Vec2.create(opts.event.clientX, opts.event.clientY)
        this.startTransform = {
            size: opts.size,
            position: opts.position,
        }

        this.minSize = opts.minSize
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
        const transform = this.update(mouse)
        this.events.emit('changed', transform)
    }

    private _onMouseUp = () => {
        this.destroy()
    }

    protected abstract update(mouse: Vec2): Transform2D

}

export class EastResizer extends Resizer {

    static update(resizer: EastResizer, mouse: Vec2): Transform2D {
        let width = resizer.startTransform.size.x + (mouse.x - resizer.startMouse.x)
        width = Math.max(resizer.minSize.x, width)

        const transform: Transform2D = {
            size: Vec2.create(width, resizer.startTransform.size.y),
            position: resizer.startTransform.position,
        }

        return transform
    }

    protected update(mouse: Vec2): Transform2D {
        return EastResizer.update(this, mouse)
    }

}

export class SouthResizer extends Resizer {

    protected update(mouse: Vec2): Transform2D {
        let height = this.startTransform.size.y + (mouse.y - this.startMouse.y)
        height = Math.max(this.minSize.y, height)
        const transform: Transform2D = {
            size: Vec2.create(this.startTransform.size.x, height),
            position: this.startTransform.position,
        }
        return transform
    }

}

export class WestResizer extends Resizer {

    protected update(mouse: Vec2): Transform2D {
        let deltaX = mouse.x - this.startMouse.x
        let newWidth = this.startTransform.size.x - deltaX
        if (newWidth < this.minSize.x) {
            newWidth = this.minSize.x
            deltaX = this.startTransform.size.x - newWidth
        }
        const newX = this.startTransform.position.x + deltaX
        const transform: Transform2D = {
            size: Vec2.create(newWidth, this.startTransform.size.y),
            position: Vec2.create(newX, this.startTransform.position.y),
        }
        return transform
    }
}

export class NorthResizer extends Resizer {
    protected update(mouse: Vec2): Transform2D {
        let deltaY = mouse.y - this.startMouse.y
        let newHeight = this.startTransform.size.y - deltaY
        if (newHeight < this.minSize.y) {
            newHeight = this.minSize.y
            deltaY = this.startTransform.size.y - newHeight
        }
        const newY = this.startTransform.position.y + deltaY
        const transform: Transform2D = {
            size: Vec2.create(this.startTransform.size.x, newHeight),
            position: Vec2.create(this.startTransform.position.x, newY),
        }
        return transform
    }
}
