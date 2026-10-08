import type { NoteTransform } from "../../components/editor/NoteTransform"
import type { TimeTransform } from "../../components/editor/TimeTransform"
import type { Handler } from "./Handler"

type Point = {
    x: number
    y: number
}

export class TimeTransformPanner implements Handler {

    private _pointers = new Map<number, Point>()
    private _lastMidpoint: Point | null = null
    private _timeTransform: TimeTransform
    private _noteTransform: NoteTransform | undefined
    private _listening = false

    constructor(opts: {
        timeTransform: TimeTransform
        noteTransform?: NoteTransform
    }) {
        this._timeTransform = opts.timeTransform
        this._noteTransform = opts.noteTransform
    }

    get pointerCount() {
        return this._pointers.size
    }

    addPointer(event: PointerEvent) {
        if (event.pointerType !== "touch")
            return

        this._pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
        this._syncMidpoint()
        this._ensureListening()
    }

    destroy() {
        this._pointers.clear()
        this._lastMidpoint = null
        this._stopListening()
    }

    private _ensureListening() {
        if (this._listening)
            return

        this._listening = true
        window.addEventListener("pointermove", this._onPointerMove, { capture: true, passive: false })
        window.addEventListener("pointerup", this._onPointerUp, { capture: true })
        window.addEventListener("pointercancel", this._onPointerUp, { capture: true })
    }

    private _stopListening() {
        if (!this._listening)
            return

        this._listening = false
        window.removeEventListener("pointermove", this._onPointerMove, { capture: true })
        window.removeEventListener("pointerup", this._onPointerUp, { capture: true })
        window.removeEventListener("pointercancel", this._onPointerUp, { capture: true })
    }

    private _onPointerMove = (event: PointerEvent) => {
        if (!this._pointers.has(event.pointerId))
            return

        this._pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

        if (this._pointers.size < 2) {
            this._lastMidpoint = null
            return
        }

        event.preventDefault()

        const midpoint = this._getMidpoint()
        if (!midpoint)
            return

        if (this._lastMidpoint) {
            const dx = midpoint.x - this._lastMidpoint.x
            const dy = midpoint.y - this._lastMidpoint.y
            this._timeTransform.panByPixels(dx)
            this._noteTransform?.panByPixels(dy)
        }

        this._lastMidpoint = midpoint
    }

    private _onPointerUp = (event: PointerEvent) => {
        if (!this._pointers.has(event.pointerId))
            return

        this._pointers.delete(event.pointerId)
        this._syncMidpoint()

        if (this._pointers.size === 0)
            this._stopListening()
    }

    private _syncMidpoint() {
        this._lastMidpoint = this._pointers.size >= 2
            ? this._getMidpoint()
            : null
    }

    private _getMidpoint(): Point | null {
        if (this._pointers.size < 2)
            return null

        let x = 0
        let y = 0

        for (const point of this._pointers.values()) {
            x += point.x
            y += point.y
        }

        const count = this._pointers.size
        return {
            x: x / count,
            y: y / count,
        }
    }

}
