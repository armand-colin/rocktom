import { Engine, Resource } from "@niloc/ecs"
import { AudioBufferSoundNode } from "../sound/node/AudioElementSoundNode"
import { DestinationSoundNode } from "../sound/node/DestinationSoundNode"
import { GainSoundNode } from "../sound/node/GainSoundNode"
import { MediaStreamSoundNode } from "../sound/node/MediaStreamSoundNode"
import { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode"
import type { SoundNode } from "../sound/node/SoundNode"

export class SoundEngine extends Resource {

    private _audioContext: AudioContext
    private _nodes: SoundNode[] = []

    readonly output: DestinationSoundNode

    constructor(engine: Engine) {
        super(engine)

        this._audioContext = new AudioContext()

        this.output = new DestinationSoundNode(this._audioContext)
        this._nodes.push(this.output)

        this._audioContext.resume()
        this._audioContext.addEventListener('statechange', this._onStateChange)
    }

    get currentTime() {
        return this._audioContext.currentTime
    }

    private _onStateChange = () => {
        console.log('on state change', this._audioContext.state)
    }

    refresh() {
        this._audioContext.removeEventListener('statechange', this._onStateChange)
        this._audioContext.close()

        this._audioContext = new AudioContext()
        this._audioContext.addEventListener('statechange', this._onStateChange)

        for (const node of this._nodes)
            node.setAudioContext(this._audioContext)

        for (const node of this._nodes)
            node.refreshConnections()
    }

    createAnalyserNode(): SoundAnalyserNode {
        const node = new SoundAnalyserNode(this.engine, this._audioContext)
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

    createAudioBufferNode(buffer: AudioBuffer): AudioBufferSoundNode {
        const node = new AudioBufferSoundNode(this._audioContext, buffer)
        this._nodes.push(node)
        return node
    }

    createAudioBuffer(buffer: ArrayBuffer) {
        return this._audioContext.decodeAudioData(buffer)
    }

    resume() {
        this._audioContext.resume()
    }

}