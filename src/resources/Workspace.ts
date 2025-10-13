import { Engine } from "../engine/Engine";
import { Resource } from "../engine/Resource";
import type { GainSoundNode } from "../sound/node/GainSoundNode";
import type { MediaStreamSoundNode } from "../sound/node/MediaStreamSoundNode";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";

export class Workspace extends Resource {

    private _microphone: MediaStreamSoundNode
    private _feedbackGain: GainSoundNode
    private _analyser: SoundAnalyserNode

    constructor() {
        super()
        this._microphone = Engine.instance.sound.createMediaStreamNode()
        this._feedbackGain = Engine.instance.sound.createGainNode()
        this._analyser = Engine.instance.sound.createAnalyserNode()

        this._microphone.connect(this._feedbackGain)
        this._microphone.connect(this._analyser)
        this._feedbackGain.connect(Engine.instance.sound.output)
    }

    get analyser() {
        return this._analyser
    }

    get feedbackGain() {
        return this._feedbackGain.gain
    }

    set feedbackGain(value: number) {
        this._feedbackGain.gain = value
        this.changed()
    }

    setMicrophoneStream(stream: MediaStream | null) {
        this._microphone.setStream(stream)
    }

}