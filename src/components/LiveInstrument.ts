import { Component, Engine } from "@niloc/ecs";
import { LiveInstrumentPreferences } from "../resources/LiveInstrumentPreferences";
import { SoundEngine } from "../resources/SoundEngine";
import { AudioRange } from "../sound/AudioRange";
import type { MediaStreamSoundNode } from "../sound/node/MediaStreamSoundNode";
import { Mixer } from "../resources/Mixer";

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

    private _range: AudioRange
    private _octaverEnabled: boolean

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
        this._octaverEnabled = preferences.octaverEnabled

        const mixer = engine.getResource(Mixer)
        mixer.feedback.connect(this._streamNode)
    }

    get name() {
        return this._name
    }

    get streamId() {
        return this._streamId
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

    get octaverEnabled() {
        return this._octaverEnabled
    }

    set octaverEnabled(value: boolean) {
        this._octaverEnabled = value
        this.engine.getResource(LiveInstrumentPreferences).octaverEnabled = value
        this.changed()
    }

    destroy() {
        this._mediaStream.getTracks().forEach(track => track.stop())
        this._streamNode.disconnect()
    }

}