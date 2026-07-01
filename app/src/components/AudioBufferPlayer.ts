import { Component, Engine } from "@niloc/ecs";
import type { AudioPlayer } from "../core/AudioPlayer";
import { AudioElementSoundNode } from "../sound/node/AudioElementSoundNode";
import { SoundEngine } from "../resources/SoundEngine";
import { Duration, Emitter } from "@niloc/utils";
import { Mixer } from "../resources/Mixer";
import { DocumentQueries } from "../queries/document/DocumentQueries";
import { DocumentManager } from "../resources/DocumentManager";
import type { GainSoundNode } from "../sound/node/GainSoundNode";
import type { AudioBufferSoundNode } from "../sound/node/AudioBufferSoundNode";

const MIME_TYPES: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.webm': 'audio/webm',
}

export class AudioBufferPlayer extends Component implements AudioPlayer {

    private _node: GainSoundNode
    private _scheduledPlay: ReturnType<typeof setTimeout> | null = null
    private _objectUrl: string | null = null
    private _loaded = false
    private _arrayBuffer: ArrayBuffer | null = null
    private _audioBuffer: AudioBuffer | null = null
    private _audioNode: AudioBufferSoundNode | null = null
    private _trackId: string

    private _speed: number = 1
    private _volume: number = 1
    private _seekTime: number = 0
    private _playing = false

    readonly events = new Emitter<{ loaded: void }>()

    constructor(engine: Engine, trackId: string) {
        super(engine)
        this._trackId = trackId
        const soundEngine = engine.getResource(SoundEngine)
        this._node = soundEngine.createGainNode()

        const mixer = engine.getResource(Mixer)
        mixer.audio.connect(this._node)

        Object.assign(window, { urlPlayer: this })
    }

    async load(): Promise<void> {
        const downloadResult = await this.engine.getResource(DocumentManager).download(this._trackId)

        if (!downloadResult.ok) {
            console.error('Failed to download audio', downloadResult.error)
            return
        }

        this._arrayBuffer = downloadResult.value

        const soundEngine = this.engine.getResource(SoundEngine)
        const audioBuffer = await soundEngine.createAudioBuffer(downloadResult.value)

        if (this._arrayBuffer !== downloadResult.value) {
            // Has been cancelled
            return;
        }

        this._audioBuffer = audioBuffer
        this._createAudioNode()

        this._loaded = true
    }

    private _createAudioNode() {
        if (!this._audioBuffer)
            return;

        const soundEngine = this.engine.getResource(SoundEngine)

        if (this._audioNode)
            this._audioNode.disconnect()
        
        this._audioNode = soundEngine.createAudioBufferNode(this._audioBuffer)
        this._audioNode.setPlaybackRate(this._speed)
        
        this._audioNode.connect(this._node);
    }

    get loaded() {
        return this._loaded
    }

    play(): void {
        this._playing = true;
        this._createAudioNode();
    }

    pause(): void {
        this._playing = false;
        this._audioNode?.pause();
    }

    getTime(): number {
        if (!this._audioNode)
            return this._seekTime;


        return this._audioNode.getTime()
    }

    seek(seconds: number): void {
        this._createAudioNode()
        if (!this._audioNode)
            return;

        this._audio.currentTime = seconds
    }

    setSpeed(speed: number): void {
        this._speed = speed

        if (this._audioNode)
            this._audioNode.setPlaybackRate(speed)
    }

    setVolume(volume: number): void {
        this.engine.getResource(Mixer).audio.setVolume(volume)
    }

    schedulePlay(playAfter: Duration): void {
        this.clearScheduledPlay()

        this._scheduledPlay = setTimeout(() => {
            this.play()
        }, Duration.milliseconds(playAfter))
    }

    clearScheduledPlay(): void {
        if (this._scheduledPlay !== null) {
            clearTimeout(this._scheduledPlay)
            this._scheduledPlay = null
        }
    }

    clear(): void {
        this.pause()
        if (this._objectUrl) {
            URL.revokeObjectURL(this._objectUrl)
            this._objectUrl = null
        }
        this._audio.remove()
        this._node.disconnect()
        this.destroy()
    }

}