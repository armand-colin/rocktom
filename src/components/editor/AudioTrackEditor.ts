import { Component, Engine } from "@niloc/ecs";
import { AudioType, type AudioTrack, type AudioTrackPayload } from "../../sound/song/AudioTrack";

export class AudioTrackEditor extends Component {

    readonly track: AudioTrack

    constructor(engine: Engine, track: AudioTrack) {
        super(engine)
        this.track = track
    }

    setType(type: AudioType) {
        let payload: AudioTrackPayload

        switch (type) {
            case AudioType.None: {
                payload = { type: AudioType.None }
                break
            }
            case AudioType.Url: {
                payload = {
                    type: AudioType.Url,
                    url: ""
                }
                break
            }
            case AudioType.YouTube: {
                payload = {
                    type: AudioType.YouTube,
                    youtubeVideoId: "",
                }
                break
            }
        }

        this.track.payload = payload
        this.changed()
    }

    setTime(time: number) {
        this.track.time = time
        this.changed()
    }

    setDuration(duration: number) {
        this.track.duration = duration
        this.changed()
    }

    setUrl(url: string) {
        if (this.track.payload.type !== AudioType.Url)
            return

        this.track.payload = {
            ...this.track.payload,
            url
        }
        this.changed()
    }

    setYouTubeVideoId(id: string) {
        if (this.track.payload.type !== AudioType.YouTube)
            return

        this.track.payload = {
            ...this.track.payload,
            youtubeVideoId: id
        }
        this.changed()
    }

}