import { Component, Engine } from "@niloc/ecs";
import type { AudioPlayer } from "../core/AudioPlayer";
import { GainSoundNode } from "../sound/node/GainSoundNode";
import { AudioElementSoundNode } from "../sound/node/AudioElementSoundNode";
import { SoundEngine } from "../resources/SoundEngine";
import { Duration, Emitter } from "@niloc/utils";

export class UrlAudioPlayer extends Component implements AudioPlayer {

    private _audio: HTMLAudioElement
    private _gain: GainSoundNode
    private _node: AudioElementSoundNode
    private _scheduledPlay: number | null = null
    private _loaded = false

    readonly events = new Emitter<{ loaded: void }>()

    constructor(engine: Engine, url: string) {
        super(engine)
        this._audio = new Audio(url)
        const soundEngine = engine.getResource(SoundEngine)
        this._gain = soundEngine.createGainNode()
        this._node = soundEngine.createAudioElementNode(this._audio)
        this._node.connect(this._gain)
        this._gain.connect(soundEngine.output)

        this._audio.addEventListener('loadeddata', () => {
            this._loaded = true
            this.events.emit('loaded')
        })

        Object.assign(window, { urlPlayer: this })
    }

    get loaded() {
        return this._loaded
    }

    play(): void {
        this._audio.play()
    }

    pause(): void {
        this.clearScheduledPlay()
        this._audio.pause()
    }

    getTime(): number {
        return this._audio.currentTime
    }

    seek(seconds: number): void {
        this._audio.currentTime = seconds
    }

    setSpeed(speed: number): void {
        this._audio.playbackRate = speed
    }

    setVolume(volume: number): void {
        this._gain.gain = volume
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
        this._audio.remove()
        this._node.disconnect()
        this._gain.disconnect()
        this.destroy()
    }

}