import { Component, Engine } from "@niloc/ecs";
import { LiveInstrumentPreferences } from "../resources/LiveInstrumentPreferences";
import { SoundEngine } from "../resources/SoundEngine";
import { AudioRange } from "../sound/AudioRange";
import type { GainSoundNode } from "../sound/node/GainSoundNode";
import type { MediaStreamSoundNode } from "../sound/node/MediaStreamSoundNode";

type Opts = {
    stream: MediaStream,
    streamId: string,
    name: string,
}

export class LiveInstrument extends Component {

    private _name: string
    private _mediaStream: MediaStream
    private _streamId: string

    private _streamNode: MediaStreamSoundNode
    private _gain: GainSoundNode

    private _volume: number
    private _range: AudioRange

    constructor(engine: Engine, opts: Opts) {
        super(engine)

        this._mediaStream = opts.stream
        this._name = opts.name
        this._streamId = opts.streamId

        const soundEngine = engine.getResource(SoundEngine)
        this._streamNode = soundEngine.createMediaStreamNode()
        this._streamNode.setStream(this._mediaStream)

        const preferences = engine.getResource(LiveInstrumentPreferences)
        this._range = preferences.range ?? AudioRange.default()
        this._volume = preferences.volume

        this._gain = soundEngine.createGainNode()
        this._gain.gain = this._volume
        this._streamNode.connect(this._gain)
    }

    get volume() {
        return this._volume
    }

    set volume(value: number) {
        this._volume = value
        this._gain.gain = value
        this.engine.getResource(LiveInstrumentPreferences).volume = value
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

    get rawOutput() {
        return this._streamNode
    }

    get range() {
        return this._range
    }

    set range(value: AudioRange) {
        this._range = value
        this.engine.getResource(LiveInstrumentPreferences).range = value
        this.changed()
    }

    destroy() {
        this._mediaStream.getTracks().forEach(track => track.stop())
        this._gain.disconnect()
    }

}