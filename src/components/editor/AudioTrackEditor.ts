import { Component, Engine } from "@niloc/ecs";
import { AudioType, type AudioTrack, type AudioTrackPayload } from "../../sound/song/AudioTrack";
import { AudioData } from "../../core/AudioData";

export class AudioTrackEditor extends Component {

    readonly track: AudioTrack

    private _audioData: AudioData | null = null

    constructor(engine: Engine, track: AudioTrack) {
        super(engine)
        this.track = track

        if (
            track.payload.type === AudioType.Url
            && track.payload.url
        )
            this._generateAudioData(track.payload.url)
    }

    get audioData() {
        return this._audioData?.id ?? null
    }

    private _generateAudioData(url: string) {
        this._audioData = null

        AudioData.fetch(this.engine, url)
            .then(data => {
                if (this.track.payload.type === AudioType.Url && this.track.payload.url === url) {
                    this._audioData = data
                    console.log('got audio data')
                    this.changed()
                }
            })
            .catch(e => console.error('Error fetching audioData', e))
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
        this._audioData = null
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

        this._generateAudioData(url)
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