import { Component, Engine } from "@niloc/ecs";

export class PlaybackTime extends Component {

    private _time: number = 0
    private _ticks: number = 0
    
    constructor(engine: Engine) {
        super(engine)
    }

    get time(): number {
        return this._time
    }
    
    get ticks(): number {
        return this._ticks
    }

    set(time: number, ticks: number): void {
        this._time = time
        this._ticks = ticks
        this.changed()
    }

}