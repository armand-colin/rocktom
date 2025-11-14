import { Engine, Resource } from "@niloc/ecs";
import Player from "youtube-player";
import type { YouTubePlayer as PlayerInstance } from "youtube-player/dist/types";

export class YoutubePlayer extends Resource {

    private _player: PlayerInstance
    readonly element: HTMLDivElement
    private _time: number = 0

    constructor(engine: Engine) {
        super(engine)

        this.element = document.createElement("div")
        this.element.className = "YoutubePlayer"
        document.body.append(this.element)

        this._player = Player(this.element, {
            playerVars: {
                start: 0,
                autoplay: 0
            }
        })

        this._player.on('error', (error) => {
            console.error('Youtube Player Error:', error)
        })

        this._player.on('ready', () => {
            console.log('ready')
        })

        this._player.on('stateChange', (event) => {
            console.log('stateChange', event)
        })
    }

    async load(videoId: string) {
        await this._player.loadVideoById({ videoId })
        await this._player.pauseVideo()
        await this._player.seekTo(0, true)
    }

    get time() {
        this._player.getCurrentTime().then(time => {
            this._time = time
        })

        return this._time
    }

    play() {
        this._player.playVideo()
    }

    pause() {
        this._player.pauseVideo()
    }

    seek(seconds: number) {
        this._time = seconds
        this._player.seekTo(seconds, true)
    }

    setSpeed(speed: number) {
        this._player.setPlaybackRate(speed)
    }

    setVolume(volume: number) {
        this._player.setVolume(volume * 100)
    }

}