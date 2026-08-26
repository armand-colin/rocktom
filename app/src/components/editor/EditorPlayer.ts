import { Component, Engine } from "@niloc/ecs";
import { Duration, type Coroutine } from "@niloc/utils";
import { AudioPlayer } from "../../core/AudioPlayer";
import { AudioPlayerFactory } from "../../core/AudioPlayerFactory";
import { Schedules } from "../../Schedules";
import type { Level } from "../../sound/Level";
import { Metronome } from "../Metronome";
import { Time } from "../Time";
import type { VirtualBass } from "../VirtualBass";

export class EditorPlayer extends Component {

    readonly level: Level
    readonly time: Time
    readonly virtualBass: VirtualBass
    readonly metronome: Metronome

    private _updateCoroutine: Coroutine | null = null
    private _audioPlayer: AudioPlayer
    private _loaded: boolean = false
    private _previousSeek: number = 0
    private _speed = 1

    constructor(engine: Engine, level: Level, virtualBass: VirtualBass) {
        super(engine)
        this.level = level
        this.time = engine.createComponent(Time, level.tempoTrack.getTempoAt(0))
        this.virtualBass = virtualBass

        this.metronome = engine.createComponent(Metronome, level.tempoTrack)

        this._audioPlayer = AudioPlayerFactory.create(
            engine,
            level.audioTrack,
            () => this.time.seconds,
            () => {
                this._loaded = true
                this.changed()
            }
        )

        this._audioPlayer.load()
    }

    get playing() {
        return this._updateCoroutine !== null
    }

    get loaded() {
        return this._loaded && !this._audioPlayer.isLoading()
    }

    get speed() {
        return this._speed
    }

    set speed(value: number) {
        this._speed = value
        this._audioPlayer.setSpeed(value)
        if (this.playing)
            this.metronome.sync(this.time.seconds, value)
        this.changed()
    }

    play() {
        if (this.playing)
            return

        this._updateCoroutine = this.startCoroutine(this._update())
        this.metronome.sync(this.time.seconds, this._speed)

        this._playAudio()
        this.changed()
    }

    pause() {
        if (!this.playing)
            return

        this._updateCoroutine?.cancel()
        this._updateCoroutine = null
        this._audioPlayer.pause()
        this.changed()
    }

    seekToPreviousState() {
        this.seekTicks(this._previousSeek)
    }

    seekTicks(ticks: number) {
        this._previousSeek = ticks
        const seconds = this.level.tempoTrack.secondsFromTicks(ticks)
        this.time.set(seconds, ticks, this.level.tempoTrack.getTempoAt(ticks))
        const audioTime = seconds - this.level.audioTrack.time

        if (audioTime >= 0) {
            this._audioPlayer.seek(audioTime)
        } else {
            this._audioPlayer.pause()
            this._audioPlayer.seek(0)
        }

        // Re-arm play/schedule after seek so a pending initial delay is cancelled
        // and seeking into the audio region actually starts playback.
        if (this.playing) {
            this._playAudio()
            this.metronome.sync(seconds, this._speed)
        }
    }

    reset() {
        this.time.set(0, 0, this.level.tempoTrack.getTempoAt(0))
        this._audioPlayer.seek(0)
        this._audioPlayer.pause()
        this.metronome.reset()

        if (this._updateCoroutine !== null) {
            this.metronome.sync(0, this._speed)
            // Scheduling play
            this._playAudio()
        }
    }

    refreshAudioPlayer() {
        this._audioPlayer.clear()
        this._audioPlayer = AudioPlayerFactory.create(
            this.engine,
            this.level.audioTrack,
            () => this.time.seconds,
            () => {
                this._loaded = true
                this.changed()
            }
        )

        this._audioPlayer.load()
        this._audioPlayer.setSpeed(this._speed)

        if (this.playing)
            this._playAudio()
    }

    destroy() {
        super.destroy()
        this.pause()
        this._audioPlayer.clear()
        this.virtualBass.destroy()
    }


    private _playAudio() {
        if (this.time.seconds >= this.level.audioTrack.time) {
            this._audioPlayer.play()
        } else {
            const delaySeconds = (this.level.audioTrack.time - this.time.seconds) / this._speed
            this._audioPlayer.schedulePlay(Duration.fromSeconds(delaySeconds))
        }
    }

    private *_update() {
        let lastUpdate = Date.now() / 1000
        while (true) {
            const now = Date.now() / 1000
            let deltaTime = now - lastUpdate

            if (this.level.audioTrack.time <= this.time.seconds) {
                // Try to compensate for audio latency
                const audioDeltaTime = this.time.seconds - this._audioPlayer.getTime() - this.level.audioTrack.time
                deltaTime -= audioDeltaTime / 24
            }

            deltaTime = deltaTime * this._speed

            const seconds = this.time.seconds + deltaTime
            const ticks = this.level.tempoTrack.ticksFromSeconds(seconds)
            this.time.set(seconds, ticks, this.level.tempoTrack.getTempoAt(ticks))

            this.metronome.update(ticks, this._speed)

            lastUpdate = now

            yield Schedules.Frame
        }
    }

}