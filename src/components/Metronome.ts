import { Component } from "../engine/Component";
import type { Engine } from "../engine/Engine";
import type { Midi } from "../sound/Midi";

export class Metronome extends Component {

    private _time: number = 0

    constructor(engine: Engine, tempo: Midi.Tempo) {
        super(engine)

    }

    reset() {
        this._time = 0
    }

    update(deltaTime: number) {
        
    }

}