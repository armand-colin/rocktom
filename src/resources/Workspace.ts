import { Engine, Resource } from "@niloc/ecs";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import { SoundEngine } from "./SoundEngine";

export class Workspace extends Resource {

    private _analyser: SoundAnalyserNode

    constructor(engine: Engine) {
        super(engine)
        const soundEngine = this.engine.getResource(SoundEngine)
        this._analyser = soundEngine.createAnalyserNode()
    }

    get analyser() {
        return this._analyser
    }

    get output() {
        return this.engine.getResource(SoundEngine).output
    }

}