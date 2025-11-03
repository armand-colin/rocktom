import { Engine, Resource } from "@niloc/ecs";
import type { GainSoundNode } from "../sound/node/GainSoundNode";
import type { MediaStreamSoundNode } from "../sound/node/MediaStreamSoundNode";
import type { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode";
import { SoundEngine } from "./SoundEngine";

export class Workspace extends Resource {

    private _microphone: MediaStreamSoundNode
    private _feedbackGain: GainSoundNode
    private _analyser: SoundAnalyserNode

    constructor(engine: Engine) {
        super(engine)
        const soundEngine = this.engine.getResource(SoundEngine)

        this._microphone = soundEngine.createMediaStreamNode()
        this._feedbackGain = soundEngine.createGainNode()
        this._analyser = soundEngine.createAnalyserNode()

        this._microphone.connect(this._feedbackGain)
        this._microphone.connect(this._analyser)
        this._feedbackGain.connect(soundEngine.output)
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