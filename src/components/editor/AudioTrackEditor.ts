import { Component, Engine } from "@niloc/ecs";
import { AudioType, type AudioTrack, type AudioTrackPayload } from "../../sound/song/AudioTrack";
import { AudioWaveform } from "../../utils/AudioWaveform";

type Waveform = {
    audioUrl: string,
    audioWaveform: string | null
}

export class AudioTrackEditor extends Component {

    readonly track: AudioTrack
    private _audioWaveform: Waveform | null = null


    constructor(engine: Engine, track: AudioTrack) {
        super(engine)
        this.track = track

        if (
            track.payload.type === AudioType.Url
            && track.payload.url
        )
            this._generateWaveform(track.payload.url)
    }

    get audioWaveform() {
        return this._audioWaveform
    }

    private _generateWaveform(url: string) {
        this._audioWaveform = {
            audioUrl: url,
            audioWaveform: null
        }

        AudioWaveform.generate(url).then(dataUrl => {
            if (this._audioWaveform && this._audioWaveform.audioUrl === url) {
                this._audioWaveform.audioWaveform = dataUrl
                this.changed()
            }
        })
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
        this._audioWaveform = null

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
        this._generateWaveform(url)

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