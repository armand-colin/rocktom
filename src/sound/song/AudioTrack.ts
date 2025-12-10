export enum AudioType {
    YouTube = 0,
    Url = 1,
    None = 2
}

export type AudioTrackPayload = {
    type: AudioType.YouTube,
    youtubeVideoId: string,
} | {
    type: AudioType.Url,
    url: string,
} | {
    type: AudioType.None,
}

export type SerializedAudioTrack = {
    payload: AudioTrackPayload,
    time: number,
    duration: number
}

export class AudioTrack {

    payload: AudioTrackPayload
    time: number
    duration: number

    constructor(payload: AudioTrackPayload, time: number, duration: number) {
        this.payload = payload
        this.time = time
        this.duration = duration
    }

    clone(): AudioTrack {
        return new AudioTrack({ ...this.payload }, this.time, this.duration)
    }

    serialize(): SerializedAudioTrack {
        return {
            payload: { ...this.payload },
            time: this.time,
            duration: this.duration
        }
    }

    static deserialize(data: SerializedAudioTrack): AudioTrack {
        return new AudioTrack(data.payload, data.time, data.duration)
    }

}
