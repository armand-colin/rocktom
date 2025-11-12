import { Component, Engine } from "@niloc/ecs";
import { SoundEngine } from "../resources/SoundEngine";
import type { GainSoundNode } from "../sound/node/GainSoundNode";
import type { MediaStreamSoundNode } from "../sound/node/MediaStreamSoundNode";

export class LiveInstrument extends Component {

    private _name: string
    private _mediaStream: MediaStream
    private _streamId: string

    private _streamNode: MediaStreamSoundNode
    private _gain: GainSoundNode
    private _volume: number = 1.0

    constructor(engine: Engine, stream: MediaStream, streamId: string, name: string) {
        super(engine)

        this._mediaStream = stream
        this._name = name
        this._streamId = streamId

        const soundEngine = engine.getResource(SoundEngine)
        this._streamNode = soundEngine.createMediaStreamNode()
        this._streamNode.setStream(this._mediaStream)

        this._gain = soundEngine.createGainNode()
        this._gain.gain = 1.0
        this._streamNode.connect(this._gain)
    }

    get volume() {
        return this._volume
    }

    set volume(value: number) {
        this._volume = value
        this._gain.gain = value
        this.changed()
    }

    get name() {
        return this._name
    }

    get streamId() {
        return this._streamId
    }

    get output() {
        return this._gain
    }

    destroy() {
        this._mediaStream.getTracks().forEach(track => track.stop())
        this._gain.disconnect()
    }

}