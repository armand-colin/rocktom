export type SerializedAudioTrack = {
    time: number,
    playbackId: string | null
}

export class AudioTrack {

    playbackId: string | null = null
    time: number

    constructor(options: { playbackId: string | null, time: number }) {
        this.playbackId = options.playbackId
        this.time = options.time
    }

    clone(): AudioTrack {
        return new AudioTrack({ playbackId: this.playbackId, time: this.time })
    }

    serialize(): SerializedAudioTrack {
        return {
            playbackId: this.playbackId,
            time: this.time,
        }
    }

    static deserialize(data: SerializedAudioTrack): AudioTrack {
        return new AudioTrack({ playbackId: data.playbackId, time: data.time })
    }

}
