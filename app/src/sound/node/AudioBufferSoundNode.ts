import { SoundTouchNode } from "@soundtouchjs/audio-worklet";
import { SoundNode } from "./SoundNode";

/**
 * Default WSOLA look-ahead / processing delay.
 * SoundTouch auto sequenceMs is ~50–125ms; mid-range is a good starting point for sync.
 * Tune via setStretchLatency() (e.g. window.urlPlayer.setStretchLatency(0.1)).
 */
const DEFAULT_STRETCH_LATENCY_SECONDS = 0.08

/** WSOLA timing tuned to reduce stutter/doubling on drums at moderate slow-down ratios. */
const QUALITY_STRETCH_PARAMETERS = {
    quickSeek: true,
    sequenceMs: 100,
    seekWindowMs: 20,
    overlapMs: 12,
} as const

export class AudioBufferSoundNode extends SoundNode<SoundTouchNode> {

    private _buffer: AudioBuffer
    private _source: AudioBufferSourceNode

    private _playbackRate: number = 1
    private _playing = false
    private _playTime: number = 0
    private _seek = 0
    /** Buffer offset actually passed to AudioBufferSourceNode.start */
    private _sourceOffset = 0
    /** Latency frozen at play() for stable getTime during this run */
    private _activeLatency = 0
    private _stretchLatency = DEFAULT_STRETCH_LATENCY_SECONDS

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
        stretch.setStretchParameters({ ...QUALITY_STRETCH_PARAMETERS })
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

    /**
     * Base SoundTouch latency compensation in seconds (before metrics.framesBuffered).
     * Useful to calibrate sync against the metronome at speed 1.
     */
    setStretchLatency(seconds: number) {
        this._stretchLatency = Math.max(0, seconds)
        if (this._playing) {
            // Re-seek so start offset + getTime use the new latency immediately.
            this.seek(this.getTime())
        }
    }

    getStretchLatency() {
        return this._stretchLatency
    }

    private _computeLatency(): number {
        let latency = this._stretchLatency
        const metrics = this.node.metrics
        if (metrics && this.audioContext.sampleRate > 0)
            latency += metrics.framesBuffered / this.audioContext.sampleRate
        return latency
    }

    getTime(): number {
        if (this._playing) {
            const deltaTime = this.audioContext.currentTime - this._playTime
            const raw = this._sourceOffset + deltaTime * this._playbackRate
            return Math.max(0, raw - this._activeLatency)
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

        // Fresh stretch + source clears WSOLA/FIFO state so latency is predictable after seek.
        this._rebuildStretch()
        this.rebuild()
        this.refreshConnections()

        this._activeLatency = this._computeLatency()
        const logical = this._clampedSeek(this._seek)
        this._seek = logical
        this._sourceOffset = this._clampedSeek(logical + this._activeLatency)
        this._playing = true
        this._playTime = this.audioContext.currentTime

        this._source.start(this._playTime, this._sourceOffset)
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

    private _rebuildStretch() {
        try {
            this.node.disconnect()
        } catch {
            // already disconnected
        }

        this.node = this.build()
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

    private _clampedSeek(time: number) {
        if (this._buffer.duration <= 0)
            return 0

        return Math.min(Math.max(0, time), Math.max(0, this._buffer.duration - 0.001))
    }

}
