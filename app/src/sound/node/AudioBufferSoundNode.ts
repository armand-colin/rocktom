import { SoundNode } from "./SoundNode";

export class AudioBufferSoundNode extends SoundNode<AudioBufferSourceNode> {

    private _buffer: AudioBuffer

    private _startTime: number = 0
    private _offset: number = 0

    constructor(audioContext: AudioContext, buffer: AudioBuffer) {
        super(audioContext)
        this._buffer = buffer
        this.node = this.build()
    }

    protected build(): AudioBufferSourceNode {
        const source = this.audioContext.createBufferSource()
        source.buffer = this._buffer
        return source
    }

    setPlaybackRate(rate: number) {
        this.node.playbackRate.value = rate
    }

    getTime(): number {
        return this.audioContext.currentTime - his.node.currentTime + this._offset
    }
    play(time?: number, offset?: number) {
        this.node.start(time, offset)
    }

    pause() {
        this.node.stop()
    }

    rebuild(): void {
        this.node = this.build()
    }

}