import type { Engine } from "@niloc/ecs";
import { UrlAudioPlayer } from "../components/UrlAudioPlayer";
import { type AudioTrack } from "../sound/song/AudioTrack";
import { AudioPlayer } from "./AudioPlayer";

function create(engine: Engine, track: AudioTrack, timeFunction: () => number, onLoad: () => void): AudioPlayer {
    if (track.playbackId === null) {
        onLoad()
        return AudioPlayer.mock(timeFunction)
    }

    const urlPlayer = engine.createComponent(UrlAudioPlayer, track.playbackId)
    if (urlPlayer.loaded)
        onLoad()
    else
        urlPlayer.events.on('loaded', () => {
            onLoad()
        })

    return urlPlayer
}

export const AudioPlayerFactory = {
    create
}