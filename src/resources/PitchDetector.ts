import { Engine } from "../engine/Engine";
import { Resource } from "../engine/Resource";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import { Workspace } from "./Workspace";

export class PitchDetector extends Resource {

    private _analyser: SoundAnalyserNode

    constructor() {
        super()
        this._analyser = Engine.instance.resource(Workspace).analyser
    }

}