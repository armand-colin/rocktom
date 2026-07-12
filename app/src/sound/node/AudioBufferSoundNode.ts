import { SoundNode } from "./SoundNode";

export class AudioBufferSoundNode extends SoundNode<AudioBufferSourceNode> {

    private _buffer: AudioBuffer

    private _playbackRate: number = 1
    private _playing = false
    private _playTime: number = 0
    private _seek = 0

    constructor(audioContext: AudioContext, buffer: AudioBuffer) {
        super(audioContext)
        this._buffer = buffer
        this.node = this.build()
    }

    protected build(): AudioBufferSourceNode {
        const source = this.audioContext.createBufferSource()
        source.buffer = this._buffer
        source.playbackRate.value = this._playbackRate
        return source
    }

    setPlaybackRate(rate: number) {
        this.node.playbackRate.value = rate
    }

    getTime(): number {
        if (this._playing) {
            const deltaTime = this.audioContext.currentTime - this._playTime;
            const advanced = deltaTime * this._playbackRate
            return this._seek + advanced
        } else {
            return this._seek
        }
    }

    seek(time: number) {
        this._seek = time

        if (this._playing) {
            this.node.stop();
            this._playing = false;

            this.rebuild()
            this.refreshConnections()

            this.play()
        }
    }

    play() {
        if (this._playing) {
            return;
        }

        this._playing = true
        this._playTime = this.audioContext.currentTime
        this.node.start(undefined, this._seek);
    }

    playAt(when: number): AudioBufferSourceNode {
        const source = this.audioContext.createBufferSource()
        source.buffer = this._buffer
        source.playbackRate.value = this._playbackRate
        this.connectToOutputs(source)
        source.onended = () => source.disconnect()
        source.start(Math.max(when, this.audioContext.currentTime))
        return source
    }

    pause() {
        if (!this._playing) {
            return;
        }

        this._seek = this.getTime()
        this._playing = false
        this.node.stop()

        this.rebuild()
        this.refreshConnections()
    }

    rebuild(): void {
        this.node = this.build()
    }

}