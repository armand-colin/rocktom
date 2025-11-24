import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../sound/Tempo";

export class PlaybackTime extends Component {

    private _time: number = 0
    private _ticks: number = 0
    private _tempo: Tempo

    constructor(engine: Engine, tempo: Tempo) {
        super(engine)
        this._tempo = tempo
    }

    get time(): number {
        return this._time
    }

    get ticks(): number {
        return this._ticks
    }
    
    get tempo(): Tempo {
        return this._tempo
    }

    set(time: number, ticks: number, tempo: Tempo): void {
        this._time = time
        this._ticks = ticks
        this._tempo = tempo
        this.changed()
    }

}