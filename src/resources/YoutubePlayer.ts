import { Engine, Resource } from "@niloc/ecs";
import Player from "youtube-player"
import type { YouTubePlayer as PlayerInstance } from "youtube-player/dist/types";

export class YoutubePlayer extends Resource {

    private _player: PlayerInstance

    constructor(engine: Engine) {
        super(engine)

        const element = document.createElement("div")
        document.body.appendChild(element)

        this._player = Player(element, { playerVars: {
            start: 0,
            autoplay: 0
        }})

        this._player.on('error', (error) => {
            console.error('Youtube Player Error:', error)
        })

        this._player.on('ready', () => {
            console.log('ready')
        })

        Object.assign(window, { youtubePlayer: this })
    }

    load(videoId: string) {
        this._player.cueVideoById({ videoId })
    }

    play() {
        console.log("playing video")
        this._player.playVideo()
    }

    pause() {
        console.log("pausing video")
        this._player.pauseVideo()
    }

    seek(seconds: number) {
        console.log("seeking video")
        this._player.seekTo(seconds, true)
    }

}