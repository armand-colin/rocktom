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

const UNLOCK_GESTURE_EVENTS = [
    'touchstart',
    'touchend',
    'pointerdown',
    'mousedown',
    'keydown',
    'click',
] as const

type AudioSessionNavigator = Navigator & {
    audioSession?: { type: string }
}

export class SoundEngine extends Resource {

    private _audioContext: AudioContext
    private _nodes: SoundNode[] = []
    private _soundTouchReady: Promise<void> | null = null
    private _soundTouchContext: AudioContext | null = null
    /** iOS may report "running" while still muted until a gesture unlock. */
    private _needsUnlock = true
    /**
     * Nested holds for mic capture. `playback` is restored only when this
     * reaches 0 — Safari rejects getUserMedia while the session is `playback`.
     */
    private _captureHolders = 0

    readonly output: DestinationSoundNode

    constructor(engine: Engine) {
        super(engine)

        this._audioContext = this._createAudioContext()

        this.output = new DestinationSoundNode(this._audioContext)
        this._nodes.push(this.output)

        this._audioContext.addEventListener('statechange', this._onStateChange)
        this.restorePlaybackSession(true)
        this._installUnlockListeners()
    }

    get currentTime() {
        return this._audioContext.currentTime
    }

    private _onStateChange = () => {
        if (this._audioContext.state !== 'running')
            this._needsUnlock = true
    }

    private _createAudioContext() {
        return new AudioContext({ latencyHint: 'interactive' })
    }

    private _setAudioSessionType(type: string) {
        try {
            const session = (navigator as AudioSessionNavigator).audioSession
            if (session)
                session.type = type
        } catch {
            // Unsupported browsers ignore audioSession.
        }
    }

    /**
     * Leave `playback` before getUserMedia. Must run before the request —
     * Safari iOS rejects capture while the session type is `playback`.
     */
    prepareForCapture() {
        this._captureHolders++
        this._setAudioSessionType('auto')
    }

    /** Prefer play-and-record once a mic stream will stay open with playback. */
    enterPlayAndRecordSession() {
        if (this._captureHolders > 0)
            this._setAudioSessionType('play-and-record')
    }

    /**
     * Drop one capture hold. Restores `playback` (silent-switch workaround)
     * when no mic is needed anymore; otherwise keeps play-and-record.
     */
    restorePlaybackSession(force = false) {
        if (force) {
            this._captureHolders = 0
            this._setAudioSessionType('playback')
            return
        }

        this._captureHolders = Math.max(0, this._captureHolders - 1)
        if (this._captureHolders === 0)
            this._setAudioSessionType('playback')
        else
            this._setAudioSessionType('play-and-record')
    }

    private _installUnlockListeners() {
        for (const event of UNLOCK_GESTURE_EVENTS) {
            document.addEventListener(event, this._onUnlockGesture, {
                capture: true,
                passive: true,
            })
        }

        document.addEventListener('visibilitychange', this._onVisibilityChange)
        window.addEventListener('pageshow', this._onPageShow)
    }

    private _onUnlockGesture = () => {
        if (this._needsUnlock || this._audioContext.state !== 'running')
            this.unlock()
    }

    private _onVisibilityChange = () => {
        if (document.hidden) {
            this._needsUnlock = true
            return
        }

        this._needsUnlock = true
        this.unlock()
    }

    private _onPageShow = () => {
        this._needsUnlock = true
        this.unlock()
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
        this._needsUnlock = true

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

    /**
     * Unlocks Web Audio on iOS / PWA: resume must happen in a user gesture, and a
     * real buffer must start during that same gesture or playback stays silent.
     */
    unlock() {
        this._playSilentUnlockBuffer()

        const resume = this._audioContext.resume()
        void resume.then(() => {
            if (this._audioContext.state === 'running')
                this._needsUnlock = false
        }).catch(() => {
            this._needsUnlock = true
        })
    }

    resume() {
        this.unlock()
    }

    private _playSilentUnlockBuffer() {
        try {
            const buffer = this._audioContext.createBuffer(1, 1, this._audioContext.sampleRate)
            const source = this._audioContext.createBufferSource()
            source.buffer = buffer
            source.connect(this._audioContext.destination)
            source.start(0)
        } catch {
            this._needsUnlock = true
        }
    }

}
