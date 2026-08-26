import { SoundTouchNode } from "@soundtouchjs/audio-worklet";
import { SoundNode } from "./SoundNode";

export class AudioBufferSoundNode extends SoundNode<SoundTouchNode> {

    private _buffer: AudioBuffer
    private _source: AudioBufferSourceNode

    private _playbackRate: number = 1
    private _playing = false
    private _playTime: number = 0
    private _seek = 0

    constructor(audioContext: AudioContext, buffer: AudioBuffer) {
        super(audioContext)
        this._buffer = buffer
        this.node = this.build()
        this._source = this._buildSource()
        this._source.connect(this.node)
    }

    protected build(): SoundTouchNode {
        const stretch = new SoundTouchNode({ context: this.audioContext })
        stretch.pitch.value = 1
        stretch.playbackRate.value = this._playbackRate
        return stretch
    }

    private _buildSource(): AudioBufferSourceNode {
        const source = this.audioContext.createBufferSource()
        source.buffer = this._buffer
        source.playbackRate.value = this._playbackRate
        return source
    }

    private _syncPlaybackRate() {
        this._source.playbackRate.value = this._playbackRate
        this.node.playbackRate.value = this._playbackRate
    }

    setPlaybackRate(rate: number) {
        this._playbackRate = rate
        this._syncPlaybackRate()
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
        this._seek = Math.max(0, time)

        if (this._playing) {
            this._source.onended = null
            this._source.stop();
            this._playing = false;
            this.play()
        }
    }

    play() {
        if (this._playing) {
            return;
        }

        // BufferSourceNode is one-shot: always use a fresh source so seek-then-play works.
        this.rebuild()
        this.refreshConnections()

        const offset = this._clampedOffset()
        this._seek = offset
        this._playing = true
        this._playTime = this.audioContext.currentTime

        this._source.start(this._playTime, offset)
        this._source.onended = () => {
            if (!this._playing)
                return

            this._seek = this._buffer.duration
            this._playing = false
            this.rebuild()
            this.refreshConnections()
        }
    }

    /** One-shot playback that bypasses pitch-preserving stretch (e.g. metronome). */
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
        this._source.onended = null
        this._source.stop()

        this.rebuild()
        this.refreshConnections()
    }

    rebuild(): void {
        try {
            this._source.disconnect()
        } catch {
            // already disconnected
        }

        this._source = this._buildSource()
        this._source.connect(this.node)
    }

    setAudioContext(audioContext: AudioContext): void {
        super.setAudioContext(audioContext)

        try {
            this.node.disconnect()
        } catch {
            // already disconnected
        }

        this.node = this.build()
        this.rebuild()
    }

    dispose(): void {
        this._playing = false
        this._source.onended = null
        try {
            this._source.stop()
        } catch {
            // not started or already stopped
        }
        try {
            this._source.disconnect()
        } catch {
            // already disconnected
        }

        super.dispose()
    }

    private _clampedOffset() {
        if (this._buffer.duration <= 0)
            return 0

        return Math.min(this._seek, Math.max(0, this._buffer.duration - 0.001))
    }

}
