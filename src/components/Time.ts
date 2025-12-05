import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../sound/Tempo";

export class Time extends Component {

    private _seconds: number = 0
    private _ticks: number = 0
    private _tempo: Tempo

    constructor(engine: Engine, tempo: Tempo) {
        super(engine)
        this._tempo = tempo
    }

    get seconds(): number {
        return this._seconds
    }

    get ticks(): number {
        return this._ticks
    }
    
    get tempo(): Tempo {
        return this._tempo
    }

    set(seconds: number, ticks: number, tempo: Tempo): void {
        this._seconds = seconds
        this._ticks = ticks
        this._tempo = tempo
        this.changed()
    }

}