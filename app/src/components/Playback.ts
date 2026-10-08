import { Component, type Engine } from "@niloc/ecs";
import { Coroutine, Duration } from "@niloc/utils";
import { AudioPlayer } from "../core/AudioPlayer";
import { AudioPlayerFactory } from "../core/AudioPlayerFactory";
import { Playback3DRenderer } from "../playback/Playback3DRenderer";
import type { PlaybackRenderer } from "../playback/PlaybackRenderer";
import { PlaybackTabRenderer } from "../playback/PlaybackTabRenderer";
import { PlaybackVisualMode } from "../playback/PlaybackVisualMode";
import { PlaybackPreferences } from "../resources/PlaybackPreferences";
import { type Level } from "../sound/Level";
import type { InstrumentTrack } from "../sound/song/InstrumentTrack";
import { Schedules } from "../Schedules";
import { DeltaTime } from "./DeltaTime";
import { Metronome } from "./Metronome";
import { Time } from "./Time";

export class Playback extends Component {

    readonly time: Time
    readonly visual: PlaybackRenderer

    private _metronome: Metronome
    private _speed = 1.0
    private _playingCoroutine: Coroutine | null = null
    private _loading = true

    private _audioPlayerVolume: number = 1.0
    private _audioPlayer: AudioPlayer
    private _instrumentTrack: InstrumentTrack

    readonly deltaTime: DeltaTime

    constructor(
        engine: Engine,
        readonly level: Level,
        trackIndex: number,
        visualMode: PlaybackVisualMode = PlaybackVisualMode.ThreeD,
    ) {
        super(engine)

        this.time = engine.createComponent(Time, level.tempoTrack.getTempoAt(0))
        this.deltaTime = engine.createComponent(DeltaTime)

        const preferences = engine.getResource(PlaybackPreferences)
        this._audioPlayer = AudioPlayerFactory.create(
            engine,
            level.audioTrack,
            () => this.time.seconds,
            () => {
                this._loading = false;
                this.changed();
            }
        )

        this._audioPlayerVolume = preferences.audioVolume
        this._audioPlayer.setVolume(this._audioPlayerVolume)

        this._metronome = engine.createComponent(Metronome, level.tempoTrack)

        this._instrumentTrack = level.instrumentTracks[trackIndex]

        this.visual = visualMode === PlaybackVisualMode.Tab
            ? new PlaybackTabRenderer()
            : new Playback3DRenderer(engine)
        this._setVisualTrack(this._instrumentTrack)
        this.visual.sync(this.time.ticks, this.time.seconds, true)

        Object.assign(window, { playback: this })
    }

    get loading() {
        return this._loading
    }

    get playing() {
        return this._playingCoroutine !== null
    }

    get noteTrack() {
        return this._instrumentTrack.noteTrack
    }

    get speed() {
        return this._speed
    }

    set speed(value: number) {
        this._speed = value
        this._audioPlayer.setSpeed(value)
        if (this.playing)
            this._metronome.sync(this.time.seconds, value)
        this.changed()
    }

    get audioVolume() {
        return this._audioPlayerVolume
    }

    set audioVolume(value: number) {
        this._audioPlayerVolume = value
        this.engine.getResource(PlaybackPreferences).audioVolume = value
        this._audioPlayer.setVolume(value)
        this.changed()
    }

    play() {
        if (this.playing)
            return

        this._playingCoroutine = this.startCoroutine(this._play())
        this._metronome.sync(this.time.seconds, this._speed)

        if (this.time.seconds >= this.level.audioTrack.time)
            this._audioPlayer.play()
        else
            this._audioPlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.time - this.time.seconds))

        this.changed()
    }

    seekTicks(ticks: number) {
        const seconds = this.level.tempoTrack.secondsFromTicks(ticks)
        this.time.set(seconds, ticks, this.level.tempoTrack.getTempoAt(ticks))
        this.visual.sync(ticks, seconds, true)

        const audioSeekTime = this.time.seconds - this.level.audioTrack.time
        if (audioSeekTime >= 0) {
            this._audioPlayer.seek(audioSeekTime)
        } else {
            this._audioPlayer.pause()
            this._audioPlayer.seek(0)
        }

        // Re-arm play/schedule after seek (cancel stale delay, start if in range).
        if (this.playing) {
            if (audioSeekTime >= 0)
                this._audioPlayer.play()
            else
                this._audioPlayer.schedulePlay(Duration.fromSeconds(-audioSeekTime))
            this._metronome.sync(seconds, this._speed)
        }
        this.changed()
    }

    setInstrumentTrack(track: InstrumentTrack) {
        console.log("setInstrumentTrack", {
            selected: track,
            current: this._instrumentTrack
        })

        if (track.id === this._instrumentTrack.id)
            return

        this._instrumentTrack = track
        this._setVisualTrack(track)
        this.visual.sync(this.time.ticks, this.time.seconds, true)
        this.changed()
    }

    private _setVisualTrack(track: InstrumentTrack) {
        this.visual.setTrack({
            instrument: track.noteTrack.instrument,
            notes: [...track.noteTrack.notes()],
            focusTrack: track.focusTrack,
            tempoTrack: this.level.tempoTrack,
        })
    }

    private *_play() {
        let lastUpdate = Date.now() / 1000
        while (true) {
            const now = Date.now() / 1000
            const deltaTime = now - lastUpdate
            this._update(deltaTime)
            lastUpdate = now
            yield Schedules.Frame
        }
    }

    private _update(deltaTime: number) {
        if (this.level.audioTrack.time <= this.time.seconds) {
            // Try to compensate for audio latency
            const audioDeltaTime = this.time.seconds - this._audioPlayer.getTime() - this.level.audioTrack.time
            this.deltaTime.setDeltaTime(audioDeltaTime)
            deltaTime -= audioDeltaTime / 24
        }

        deltaTime = deltaTime * this._speed

        const seconds = this.time.seconds + deltaTime
        const ticks = this.level.tempoTrack.ticksFromSeconds(seconds)
        this.time.set(seconds, ticks, this.level.tempoTrack.getTempoAt(ticks))

        this._metronome.update(ticks, this._speed)
        this.visual.sync(ticks, seconds)
    }

    pause() {
        if (!this.playing)
            return

        this._playingCoroutine?.cancel()
        this._playingCoroutine = null

        this._audioPlayer.pause()
        this._metronome.pause()
        this.changed()
    }

    reset() {
        this.time.set(0, 0, this.level.tempoTrack.getTempoAt(0))
        this._audioPlayer.pause()
        this._audioPlayer.seek(0)
        this.visual.sync(0, 0, true)

        this._metronome.reset()
        if (this.playing)
            this._metronome.sync(0, this._speed)

        if (this.playing)
            this._audioPlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.time))

        this.changed()
    }

    destroy() {
        this._audioPlayer.clear()
        this._metronome.destroy()
        this.visual.destroy()
    }

}
