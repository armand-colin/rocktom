import { SoundNode } from "./SoundNode";


export class MediaStreamSoundNode extends SoundNode<MediaStreamAudioSourceNode | null> {

    private _mediaStream: MediaStream | null = null

    constructor(audioContext: AudioContext) {
        super(audioContext)
        this.node = this.build()
    }

    setStream(mediaStream: MediaStream | null) {
        if (this._mediaStream) {
            // Shall kill stream
            this._mediaStream.getTracks().forEach(track => track.stop())
        }

        this._mediaStream = mediaStream
        this.node?.disconnect()
        this.node = this.build()
        this.refreshConnections()
    }

    protected build(): MediaStreamAudioSourceNode | null {
        if (this._mediaStream)
            return this.audioContext.createMediaStreamSource(this._mediaStream)

        return null
    }

    rebuild() {
        this.node = this.build()
    }

}