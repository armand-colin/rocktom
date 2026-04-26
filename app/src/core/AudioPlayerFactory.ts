import type { Engine } from "@niloc/ecs";
import { UrlAudioPlayer } from "../components/UrlAudioPlayer";
import { YoutubePlayer } from "../resources/YoutubePlayer";
import { AudioType, type AudioTrack } from "../sound/song/AudioTrack";
import { AudioPlayer } from "./AudioPlayer";

function create(engine: Engine, track: AudioTrack, timeFunction: () => number, onLoad: () => void): AudioPlayer {

    switch (track.payload.type) {
        case AudioType.None: {
            onLoad()
            return AudioPlayer.mock(timeFunction)
        }
        case AudioType.YouTube: {
            const player = engine.getResource(YoutubePlayer)
            player.load(track.payload.youtubeVideoId)
                .then(onLoad)
            return player
        }
        case AudioType.Url: {
            const urlPlayer = engine.createComponent(UrlAudioPlayer, track.payload.url)
            if (urlPlayer.loaded)
                onLoad()
            else
                urlPlayer.events.on('loaded', () => {
                    onLoad()
                })
            return urlPlayer
        }
    }

}

export const AudioPlayerFactory = {
    create
}