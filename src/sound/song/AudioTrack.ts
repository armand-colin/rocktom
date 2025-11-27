export enum AudioType {
    YouTube = 0,
    Url = 1
}

type AudioTrackPayload = {
    type: AudioType.YouTube,
    youtubeVideoId: string,
} | {
    type: AudioType.Url,
    url: string,
}

export class AudioTrack {

    readonly payload: AudioTrackPayload
    readonly startTime: number

    constructor(payload: AudioTrackPayload, startTime: number) {
        this.payload = payload
        this.startTime = startTime
    }

}
