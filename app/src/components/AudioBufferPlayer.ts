import { Component, Engine } from "@niloc/ecs";
import type { AudioPlayer } from "../core/AudioPlayer";
import { SoundEngine } from "../resources/SoundEngine";
import { Duration, Emitter } from "@niloc/utils";
import { Mixer } from "../resources/Mixer";
import type { GainSoundNode } from "../sound/node/GainSoundNode";
import type { AudioBufferSoundNode } from "../sound/node/AudioBufferSoundNode";
import { AudioData } from "../core/AudioData";

export class AudioBufferPlayer extends Component implements AudioPlayer {

    private _node: GainSoundNode
    private _scheduledPlay: ReturnType<typeof setTimeout> | null = null
    private _loaded = false
    private _audioBuffer: AudioBuffer | null = null
    private _audioNode: AudioBufferSoundNode | null = null
    private _trackId: string

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

    isLoading() {
        return !this._loaded
    }

    async load(): Promise<void> {
        console.log("loading buffer player", this.id)
        const audioData = await AudioData.fetch(this.engine, this._trackId)
        
        this._audioBuffer = audioData.audioBuffer
        
        this._audioNode = this.engine.getResource(SoundEngine)
        .createAudioBufferNode(this._audioBuffer);
        
        this._audioNode.connect(this._node);
        
        this._loaded = true
        console.log("buffer player loaded", this.id)
    }

    get loaded() {
        return this._loaded
    }

    play(): void {
        console.log('playing bufferplayer', this._audioNode)
        this._audioNode?.play();
    }

    pause(): void {
        this._audioNode?.pause();
    }

    getTime(): number {
        return this._audioNode?.getTime() ?? 0
    }

    seek(seconds: number): void {
        this._audioNode?.seek(seconds);
    }

    setSpeed(speed: number): void {
        this._audioNode?.setPlaybackRate(speed)
    }

    setVolume(volume: number): void {
        this.engine.getResource(Mixer).audio.setVolume(volume)
    }

    schedulePlay(playAfter: Duration): void {
        this.clearScheduledPlay()
        console.log('schedule play bufferplayer', Duration.seconds(playAfter))

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
        console.log("buffer player cleared", this.id)
        
        this.pause()
        
        if (this._audioNode) {
            this._audioNode.disconnect()
        }

        this._audioBuffer = null
        this._audioNode = null
        this._node.disconnect()

        this.destroy()
    }

}