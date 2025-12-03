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

export class AudioTrack {

    payload: AudioTrackPayload
    time: number
    duration: number

    constructor(payload: AudioTrackPayload, time: number, duration: number) {
        this.payload = payload
        this.time = time
        this.duration = duration
    }

}
