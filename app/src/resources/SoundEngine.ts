import { Engine, Resource } from "@niloc/ecs"
import { SoundTouchNode } from "@soundtouchjs/audio-worklet"
import processorUrl from "@soundtouchjs/audio-worklet/processor?url"
import type { AudioRange } from "../sound/AudioRange"
import { AudioBufferSoundNode } from "../sound/node/AudioBufferSoundNode"
import { AudioElementSoundNode } from "../sound/node/AudioElementSoundNode"
import { DestinationSoundNode } from "../sound/node/DestinationSoundNode"
import { GainSoundNode } from "../sound/node/GainSoundNode"
import { MediaStreamSoundNode } from "../sound/node/MediaStreamSoundNode"
import { OscillatorSoundNode } from "../sound/node/OscillatorSoundNode"
import { SoundAnalyserNode } from "../sound/node/SoundAnalyserNode"
import { SoundNode } from "../sound/node/SoundNode"

export class SoundEngine extends Resource {

    private _audioContext: AudioContext
    private _nodes: SoundNode[] = []
    private _soundTouchReady: Promise<void> | null = null
    private _soundTouchContext: AudioContext | null = null

    readonly output: DestinationSoundNode

    constructor(engine: Engine) {
        super(engine)

        this._audioContext = this._createAudioContext()

        this.output = new DestinationSoundNode(this._audioContext)
        this._nodes.push(this.output)

        this._audioContext.resume()
        this._audioContext.addEventListener('statechange', this._onStateChange)
    }

    get currentTime() {
        return this._audioContext.currentTime
    }

    private _onStateChange = () => { }

    private _createAudioContext() {
        return new AudioContext({ latencyHint: 'interactive' })
    }

    /**
     * Registers the local SoundTouch AudioWorklet processor for the current AudioContext.
     * Safe to call multiple times; re-registers after refresh() creates a new context.
     */
    ensureSoundTouchRegistered(): Promise<void> {
        if (this._soundTouchReady && this._soundTouchContext === this._audioContext)
            return this._soundTouchReady

        this._soundTouchContext = this._audioContext
        this._soundTouchReady = SoundTouchNode.register(this._audioContext, processorUrl)
        return this._soundTouchReady
    }

    refresh() {
        this._audioContext.removeEventListener('statechange', this._onStateChange)
        this._audioContext.close()

        this._audioContext = this._createAudioContext()
        this._audioContext.addEventListener('statechange', this._onStateChange)

        this._soundTouchReady = null
        this._soundTouchContext = null

        const context = this._audioContext
        void this.ensureSoundTouchRegistered().then(() => {
            if (this._audioContext !== context)
                return

            for (const node of this._nodes)
                node.setAudioContext(this._audioContext)

            for (const node of this._nodes)
                node.refreshConnections()
        })
    }

    disposeNode(node: SoundNode) {
        if (node === this.output)
            return

        const index = this._nodes.indexOf(node)
        if (index !== -1)
            this._nodes.splice(index, 1)
    }

    private _register(node: SoundNode) {
        SoundNode.setUnregister(node, () => this.disposeNode(node))
        this._nodes.push(node)
    }

    createAnalyserNode(range: AudioRange): SoundAnalyserNode {
        const node = new SoundAnalyserNode(this.engine, this._audioContext, range)
        this._register(node)
        return node
    }

    createMediaStreamNode(): MediaStreamSoundNode {
        const node = new MediaStreamSoundNode(this._audioContext)
        this._register(node)
        return node
    }

    createGainNode(): GainSoundNode {
        const node = new GainSoundNode(this._audioContext)
        this._register(node)
        return node
    }

    async createAudioBufferNode(buffer: AudioBuffer): Promise<AudioBufferSoundNode> {
        await this.ensureSoundTouchRegistered()
        const node = new AudioBufferSoundNode(this._audioContext, buffer)
        this._register(node)
        return node
    }

    createAudioElementNode(audio: HTMLAudioElement): AudioElementSoundNode {
        const node = new AudioElementSoundNode(this._audioContext, audio)
        this._register(node)
        return node
    }

    createAudioBuffer(buffer: ArrayBuffer) {
        return this._audioContext.decodeAudioData(buffer)
    }

    createOscillatorNode(): OscillatorSoundNode {
        const node = new OscillatorSoundNode(this._audioContext)
        this._register(node)
        return node
    }

    resume() {
        this._audioContext.resume()
    }

}
