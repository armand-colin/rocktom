export class AudioTrack {

    readonly youtubeVideoId: string
    readonly startTime: number

    constructor(youtubeVideoId: string, startTime: number) {
        this.youtubeVideoId = youtubeVideoId
        this.startTime = startTime
    }

}
