export class AudioTrack {

    audioBuffer: AudioBuffer
    startTime: number

    constructor(audioBuffer: AudioBuffer, startTime: number) {
        this.audioBuffer = audioBuffer
        this.startTime = startTime
    }

}
