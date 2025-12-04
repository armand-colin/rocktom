import { Component, Engine } from "@niloc/ecs";
import { Duration, type Coroutine } from "@niloc/utils";
import { AudioPlayer } from "../../core/AudioPlayer";
import { AudioPlayerFactory } from "../../core/AudioPlayerFactory";
import { Schedules } from "../../Schedules";
import type { Level } from "../../sound/Level";
import { Metronome } from "../Metronome";
import { PlaybackTime } from "../PlaybackTime";

export class EditorPlayer extends Component {

    readonly level: Level
    readonly playbackTime: PlaybackTime

    private _time: number = 0
    private _updateCoroutine: Coroutine | null = null
    private _audioPlayer: AudioPlayer
    private _loaded: boolean = false
    private _metronome: Metronome
    private _previousSeek: number = 0

    constructor(engine: Engine, level: Level) {
        super(engine)
        this.level = level
        this.playbackTime = engine.createComponent(PlaybackTime, level.tempoTrack.getTempoAt(0))

        this._metronome = engine.createComponent(Metronome, level.tempoTrack)
        this._audioPlayer = AudioPlayerFactory.create(
            engine,
            level.audioTrack,
            () => this._time,
            () => {
                this._loaded = true
                this.changed()
            }
        )
    }

    get playing() {
        return this._updateCoroutine !== null
    }

    get loaded() {
        return this._loaded
    }

    play() {
        if (this.playing)
            return

        this._updateCoroutine = this.startCoroutine(this._update())

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
        const time = this.level.tempoTrack.secondsFromTicks(ticks)
        this._time = time
        this.playbackTime.set(this._time, ticks, this.level.tempoTrack.getTempoAt(ticks))
        const audioTime = time - this.level.audioTrack.time

        if (audioTime >= 0) {
            this._audioPlayer.seek(audioTime)
        } else {
            this._audioPlayer.pause()
            this._audioPlayer.seek(0)
            if (this.playing)
                this._playAudio()
        }
    }

    reset() {
        this._time = 0
        this.playbackTime.set(0, 0, this.level.tempoTrack.getTempoAt(0))
        this._audioPlayer.seek(0)
        this._audioPlayer.pause()

        if (this._updateCoroutine !== null)
            // Scheduling play
            this._playAudio()
    }

    refreshAudioPlayer() {
        this._audioPlayer.clear()
        this._audioPlayer = AudioPlayerFactory.create(
            this.engine,
            this.level.audioTrack,
            () => this._time,
            () => {
                this._loaded = true
                this.changed()
            }
        )

        if (this.playing)
            this._playAudio()
    }


    private _playAudio() {
        if (this._time >= this.level.audioTrack.time) {
            this._audioPlayer.play()
        } else {
            this._audioPlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.time - this._time))
        }
    }

    private *_update() {
        let lastUpdate = Date.now() / 1000
        while (true) {
            const now = Date.now() / 1000
            let deltaTime = now - lastUpdate

            if (this.level.audioTrack.time <= this._time) {
                // Try to compensate for audio latency
                const audioDeltaTime = this._time - this._audioPlayer.getTime() - this.level.audioTrack.time
                deltaTime -= audioDeltaTime / 24
            }

            this._time += deltaTime
            const ticks = this.level.tempoTrack.ticksFromSeconds(this._time)
            lastUpdate = now

            this._metronome.update(ticks, 1)
            this.playbackTime.set(this._time, ticks, this.level.tempoTrack.getTempoAt(ticks))

            yield Schedules.Frame
        }
    }

}