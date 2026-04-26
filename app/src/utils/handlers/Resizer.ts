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

    readonly startMouse: Vec2
    readonly startTransform: Transform2D

    readonly minSize: Vec2
    windowSize: Vec2

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

    static update(resizer: Resizer, mouse: Vec2): Transform2D {
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

    static update(resizer: Resizer, mouse: Vec2): Transform2D {
        let height = resizer.startTransform.size.y + (mouse.y - resizer.startMouse.y)
        height = Math.max(resizer.minSize.y, height)
        const transform: Transform2D = {
            size: Vec2.create(resizer.startTransform.size.x, height),
            position: resizer.startTransform.position,
        }
        return transform
    }

    protected update(mouse: Vec2): Transform2D {
        return SouthResizer.update(this, mouse)
    }

}

export class WestResizer extends Resizer {

    static update(resizer: Resizer, mouse: Vec2): Transform2D {
        let deltaX = mouse.x - resizer.startMouse.x
        let newWidth = resizer.startTransform.size.x - deltaX
        if (newWidth < resizer.minSize.x) {
            newWidth = resizer.minSize.x
            deltaX = resizer.startTransform.size.x - newWidth
        }
        const newX = resizer.startTransform.position.x + deltaX
        const transform: Transform2D = {
            size: Vec2.create(newWidth, resizer.startTransform.size.y),
            position: Vec2.create(newX, resizer.startTransform.position.y),
        }

        return transform
    }

    protected update(mouse: Vec2): Transform2D {
        return WestResizer.update(this, mouse)
    }

}

export class NorthResizer extends Resizer {

    static update(resizer: Resizer, mouse: Vec2): Transform2D {
        let deltaY = mouse.y - resizer.startMouse.y
        let newHeight = resizer.startTransform.size.y - deltaY

        if (newHeight < resizer.minSize.y) {
            newHeight = resizer.minSize.y
            deltaY = resizer.startTransform.size.y - newHeight
        }

        const newY = resizer.startTransform.position.y + deltaY
        const transform: Transform2D = {
            size: Vec2.create(resizer.startTransform.size.x, newHeight),
            position: Vec2.create(resizer.startTransform.position.x, newY),
        }

        return transform
    }

    protected update(mouse: Vec2): Transform2D {
        return NorthResizer.update(this, mouse)
    }

}

export class NorthEastResizer extends Resizer {

    protected update(mouse: Vec2): Transform2D {
        const eastTransform = EastResizer.update(this, mouse)
        const northTransform = NorthResizer.update(this, mouse)

        const transform: Transform2D = {
            size: Vec2.create(eastTransform.size.x, northTransform.size.y),
            position: Vec2.create(northTransform.position.x, northTransform.position.y),
        }

        return transform
    }

}

export class SouthEastResizer extends Resizer {

    protected update(mouse: Vec2): Transform2D {
        const eastTransform = EastResizer.update(this, mouse)
        const southTransform = SouthResizer.update(this, mouse)

        const transform: Transform2D = {
            size: Vec2.create(eastTransform.size.x, southTransform.size.y),
            position: Vec2.create(southTransform.position.x, southTransform.position.y),
        }

        return transform
    }

}

export class SouthWestResizer extends Resizer {

    protected update(mouse: Vec2): Transform2D {
        const westTransform = WestResizer.update(this, mouse)
        const southTransform = SouthResizer.update(this, mouse)

        const transform: Transform2D = {
            size: Vec2.create(westTransform.size.x, southTransform.size.y),
            position: Vec2.create(westTransform.position.x, southTransform.position.y),
        }

        return transform
    }

}

export class NorthWestResizer extends Resizer {

    protected update(mouse: Vec2): Transform2D {
        const westTransform = WestResizer.update(this, mouse)
        const northTransform = NorthResizer.update(this, mouse)

        const transform: Transform2D = {
            size: Vec2.create(westTransform.size.x, northTransform.size.y),
            position: Vec2.create(westTransform.position.x, northTransform.position.y),
        }

        return transform
    }

}