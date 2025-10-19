import { SoundNode } from "./SoundNode";

export class AudioBufferSoundNode extends SoundNode<AudioBufferSourceNode> {

    private _buffer: AudioBuffer

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

    play() {
        this.node.start()
    }

    pause() {
        this.node.stop()
    }

    rebuild(): void {
        this.node = this.build()
    }
}