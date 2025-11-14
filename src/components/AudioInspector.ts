import { Component, Engine } from "@niloc/ecs";
import { SoundEngine } from "../resources/SoundEngine";
import { Schedules } from "../Schedules";
import { AudioRange } from "../sound/AudioRange";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import type { SoundNode } from "../sound/node/SoundNode";

export class AudioInspector extends Component {

    private _node: SoundNode
    private _analyser: SoundAnalyserNode

    private _volume: number = 0

    constructor(engine: Engine, node: SoundNode, audioRange?: AudioRange) {
        super(engine)
        this._node = node
        this._analyser = engine.getResource(SoundEngine).createAnalyserNode(audioRange ?? AudioRange.default())
        this._node.connect(this._analyser)

        this.startCoroutine(this._update())
    }

    get volume() {
        return this._volume
    }

    private *_update() {
        while (true) {
            this._volume = this._analyser.getVolume()
            this.changed()
            yield Schedules.Frame
        }
    }

    destroy(): void {
        super.destroy()
        this._analyser.destroy()
    }

}