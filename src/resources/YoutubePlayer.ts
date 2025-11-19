import { Engine, Resource } from "@niloc/ecs";
import { Duration } from "@niloc/utils";
import Player from "youtube-player";
import type { YouTubePlayer as PlayerInstance } from "youtube-player/dist/types";

enum YouTubePlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
}

export class YoutubePlayer extends Resource {

    private _player: PlayerInstance
    readonly element: HTMLDivElement
    private _time: number = 0
    // private _volume: number = 1
    private _lagEstimate: Duration = Duration.fromSeconds(0)
    private _scheduledPlay: number | null = null

    private _state: YouTubePlayerState = YouTubePlayerState.UNSTARTED

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
            this._state = event.data
        })

        this._player.on('stateChange', async (event) => {
            if (event.data === YouTubePlayerState.BUFFERING) {
                const time = performance.now() / 1000
                await this._waitForState(YouTubePlayerState.PLAYING)
                const playTime = performance.now() / 1000
                this._lagEstimate = Duration.fromSeconds(playTime - time)
            }
        })
    }

    get lagEstimate() {
        return this._lagEstimate
    }

    async load(videoId: string) {
        await this._player.loadVideoById({ videoId })
        await this._waitForState(YouTubePlayerState.PLAYING)
        await this._player.pauseVideo()
        await this._waitForState(YouTubePlayerState.PAUSED)
        await this._player.seekTo(0, true)

        this._player.playVideo()
        await this._waitForState(YouTubePlayerState.PLAYING)
        this._player.pauseVideo()
        this._player.seekTo(0, true)
    }


    private _waitForState(state: YouTubePlayerState): Promise<void> {
        return new Promise(resolve => {
            if (this._state === state) {
                resolve()
                return
            }

            const update = (event: CustomEvent<unknown> & { data: number }) => {
                if (event.data === state) {
                    this._player.removeEventListener('stateChange', update as () => void)
                    resolve()
                }
            }

            this._player.on('stateChange', update)
        })
    }

    get time() {
        this._player.getCurrentTime().then(time => {
            this._time = time
        })

        return this._time
    }

    schedulePlay(playAfter: Duration) {
        if (this._scheduledPlay !== null) {
            clearTimeout(this._scheduledPlay)
            this._scheduledPlay = null
        }

        const timeout = Duration.subtract(playAfter, this._lagEstimate)

        this._scheduledPlay = setTimeout(() => {
            this.play()
        }, timeout.milliseconds)
    }

    clearScheduledPlay() {
        if (this._scheduledPlay !== null) {
            clearTimeout(this._scheduledPlay)
            this._scheduledPlay = null
        }
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
        // this._volume = volume
        this._player.setVolume(volume * 100)
    }

}