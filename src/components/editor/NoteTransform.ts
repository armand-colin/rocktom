import { Component, Engine } from "@niloc/ecs";
import { OS } from "../../utils/OS";

export class NoteTransform extends Component {

    private _offset: number = 0
    private _ratio: number = 1

    constructor(engine: Engine) {
        super(engine)
    }

    get offset() {
        return this._offset
    }

    get ratio() {
        return this._ratio
    }

    setOffset(offset: number) {
        this._offset = offset
        this.changed()
    }

    setRatio(ratio: number) {
        this._ratio = ratio
        this.changed()
    }

    handleWheel(event: WheelEvent) {
        if (!OS.isCtrl(event)) {
            this._handlePan(event)
        }
    }

    private _handlePan(event: WheelEvent) {
        const delta = event.deltaY

        let offset = this.offset
        offset = offset + delta / 26 / this.ratio

        this._offset = offset
        this.changed()
    }

}