import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../../sound/Tempo";

export class TimeTransform extends Component {

    private _ratio: number = 1
    private _offset: number = 0
    private _step: number | null = Tempo.beats(1)

    constructor(engine: Engine) {
        super(engine)
    }

    get ratio() {
        return this._ratio
    }

    get offset() {
        return this._offset
    }

    magnetize(ticks: number) {
        const step = this._step ?? 1

        const min = ticks - (ticks % step)
        const max = min + step

        if (ticks - min < max - ticks)
            return min
        else
            return max
    }

    setRatio(ratio: number) {
        this._ratio = ratio
        this.changed()
    }

    setOffset(offset: number) {
        this._offset = offset
        this.changed()
    }

}