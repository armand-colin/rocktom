import { AudioElementSoundNode } from "./node/AudioElementSoundNode"
import { DestinationSoundNode } from "./node/DestinationSoundNode"
import { GainSoundNode } from "./node/GainSoundNode"
import { MediaStreamSoundNode } from "./node/MediaStreamSoundNode"
import { SoundAnalyserNode } from "./node/SoundAnalyserNode"
import type { SoundNode } from "./node/SoundNode"

export class SoundEngine {

    private _audioContext: AudioContext
    private _nodes: SoundNode[] = []

    readonly output: DestinationSoundNode

    constructor() {
        this._audioContext = new AudioContext()

        this.output = new DestinationSoundNode(this._audioContext)
        this._nodes.push(this.output)
    }

    get currentTime() {
        return this._audioContext.currentTime
    }

    refresh() {
        this._audioContext = new AudioContext()

        for (const node of this._nodes)
            node.refreshConnections()
    }

    createAnalyserNode(): SoundAnalyserNode {
        const node = new SoundAnalyserNode(this._audioContext)
        this._nodes.push(node)
        return node
    }

    createMediaStreamNode(): MediaStreamSoundNode {
        const node = new MediaStreamSoundNode(this._audioContext)
        this._nodes.push(node)
        return node
    }

    createGainNode(): GainSoundNode {
        const node = new GainSoundNode(this._audioContext)
        this._nodes.push(node)
        return node
    }

    createAudioElementNode(audio: HTMLAudioElement): AudioElementSoundNode {
        const node = new AudioElementSoundNode(this._audioContext, audio)
        this._nodes.push(node)
        return node
    }

    resume() {
        this._audioContext.resume()
    }

}