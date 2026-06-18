import { Component, Engine } from "@niloc/ecs";
import type { AudioPlayer } from "../core/AudioPlayer";
import { AudioElementSoundNode } from "../sound/node/AudioElementSoundNode";
import { SoundEngine } from "../resources/SoundEngine";
import { Duration, Emitter } from "@niloc/utils";
import { Mixer } from "../resources/Mixer";
import { DocumentQueries } from "../queries/document/DocumentQueries";
import { DocumentManager } from "../resources/DocumentManager";

const MIME_TYPES: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.webm': 'audio/webm',
}

export class UrlAudioPlayer extends Component implements AudioPlayer {

    private _audio: HTMLAudioElement
    private _node: AudioElementSoundNode
    private _scheduledPlay: ReturnType<typeof setTimeout> | null = null
    private _objectUrl: string | null = null
    private _loaded = false

    readonly events = new Emitter<{ loaded: void }>()

    constructor(engine: Engine, trackId: string) {
        super(engine)
        this._audio = new Audio()
        const soundEngine = engine.getResource(SoundEngine)
        this._node = soundEngine.createAudioElementNode(this._audio)

        const mixer = engine.getResource(Mixer)
        mixer.audio.connect(this._node)

        this._audio.addEventListener('loadeddata', () => {
            this._loaded = true
            this.events.emit('loaded')
        })

        this._load(trackId)

        Object.assign(window, { urlPlayer: this })
    }

    private async _load(trackId: string) {
        const [documentResult, downloadResult] = await Promise.all([
            DocumentQueries.get(trackId),
            this.engine.getResource(DocumentManager).download(trackId)
        ])

        if (!downloadResult.ok) {
            console.error('Failed to download audio', downloadResult.error)
            return
        }

        const mimeType = documentResult.ok
            ? (MIME_TYPES[documentResult.value.extension.toLowerCase()] ?? 'audio/mpeg')
            : 'audio/mpeg'

        const blob = new Blob([downloadResult.value], { type: mimeType })
        this._objectUrl = URL.createObjectURL(blob)
        this._audio.src = this._objectUrl
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