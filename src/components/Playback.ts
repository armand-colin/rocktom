import { Component, type Engine } from "@niloc/ecs";
import { Duration } from "@niloc/utils";
import { NeckMesh } from "../3d/NeckMesh";
import { PlayingNotes3D } from "../3d/PlayingNotes3D";
import { AudioPlayer } from "../core/AudioPlayer";
import { AudioPlayerFactory } from "../core/AudioPlayerFactory";
import { NoteWindow } from "../core/NoteWindow";
import { PlaybackPreferences } from "../resources/PlaybackPreferences";
import { Renderer } from "../resources/Renderer";
import { Bass } from "../sound/instrument/Instrument";
import { type Level } from "../sound/Level";
import { CameraRig } from "./CameraRig";
import { Metronome } from "./Metronome";
import { PlaybackNote } from "./PlaybackNote";
import { PlaybackTime } from "./PlaybackTime";

export class Playback extends Component {

    private _time: number = 0
    private _notes: PlaybackNote[] = []
    private _playingNotes: PlayingNotes3D

    private _rig: CameraRig
    private _metronome: Metronome
    private _speed = 1.0
    private _metronomeVolume = 0.2
    private _metronomeEnabled = false
    private _playing = false
    private _renderer: Renderer
    private _loading = true

    readonly playbackTime: PlaybackTime
    private _window: NoteWindow

    private _audioPlayerVolume: number = 1.0
    private _audioPlayer: AudioPlayer

    constructor(
        engine: Engine,
        readonly level: Level,
    ) {
        super(engine)

        const preferences = engine.getResource(PlaybackPreferences)

        this._audioPlayer = AudioPlayerFactory.create(
            engine,
            level.audioTrack,
            () => this._time,
            () => {
                this._loading = false
                this.changed()
            }
        )

        this._audioPlayerVolume = preferences.audioVolume
        this._audioPlayer.setVolume(this._audioPlayerVolume)

        this.playbackTime = engine.createComponent(PlaybackTime, level.tempoTrack.getTempoAt(0))

        this._rig = engine.createComponent(CameraRig, engine.getResource(Renderer).camera)
        this._metronome = engine.createComponent(Metronome, level.tempoTrack)


        this._renderer = engine.getResource(Renderer)

        const instrument = new Bass()
        const neck = NeckMesh.create(instrument)
        this._renderer.add(neck)

        this._playingNotes = new PlayingNotes3D(this.level.tempoTrack)
        this._renderer.add(this._playingNotes)

        this._notes = []

        for (const note of level.bassTrack.notes())
            this._notes.push(this.engine.createComponent(PlaybackNote, instrument, note))

        this._window = new NoteWindow(this._notes, this._renderer)
        this._updateWindow()

        this._rig.focus(level.focusTrack.initialFocus)

        Object.assign(window, { playback: this })
    }

    get loading() {
        return this._loading
    }

    private _getTimeWindow() {
        let minTime = this._time - 2.0
        let maxTime = this._time + 10.0

        minTime = this.level.tempoTrack.ticksFromSeconds(minTime)
        maxTime = this.level.tempoTrack.ticksFromSeconds(maxTime)

        return { minTime, maxTime }
    }

    private _updateWindow() {
        const { minTime, maxTime } = this._getTimeWindow()
        const ticks = this.level.tempoTrack.ticksFromSeconds(this._time)

        this._window.update(ticks, minTime, maxTime)
    }

    get speed() {
        return this._speed
    }

    set speed(value: number) {
        this._speed = value
        this._audioPlayer.setSpeed(value)
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

    get metronomeVolume() {
        return this._metronomeVolume
    }

    set metronomeVolume(value: number) {
        this._metronomeVolume = value
        this._metronome.volume = value
        this.changed()
    }

    get metronomeEnabled() {
        return this._metronomeEnabled
    }

    set metronomeEnabled(value: boolean) {
        this._metronomeEnabled = value
        this.changed()
    }

    destroy() {
        for (const note of this._notes)
            note.destroy()

        this._window.clear()
        this._audioPlayer.clear()
        this._rig.destroy()
        this._renderer.remove(this._playingNotes)
    }

    seekTicks(ticks: number) {
        this._time = this.level.tempoTrack.secondsFromTicks(ticks)
        this._updateWindow()

        // Find correct focus event
        const focusEvent = this.level.focusTrack.getEventAtTicks(ticks)
        if (!focusEvent) {
            this._rig.focus(this.level.focusTrack.initialFocus)
        } else {
            this._rig.transition(focusEvent.focus, focusEvent.time, focusEvent.duration)
        }
        this._rig.update(ticks)

        this.playbackTime.set(this._time, ticks, this.level.tempoTrack.getTempoAt(ticks))
        const audioSeekTime = Math.max(0, this._time - this.level.audioTrack.time)
        this._audioPlayer.seek(audioSeekTime)
        this._playingNotes.update(ticks)
    }

    update(deltaTime: number) {
        if (this.level.audioTrack.time <= this._time) {
            // Try to compensate for audio latency
            const audioDeltaTime = this._time - this._audioPlayer.getTime() - this.level.audioTrack.time
            deltaTime -= audioDeltaTime / 24
            Object.assign(window, { latency: audioDeltaTime })
        }

        deltaTime = deltaTime * this._speed

        const beforeTicks = this.level.tempoTrack.ticksFromSeconds(this._time)
        this._time += deltaTime

        const ticks = this.level.tempoTrack.ticksFromSeconds(this._time)

        if (this._metronomeEnabled)
            this._metronome.update(ticks, this._speed)

        this._updateWindow()
        for (const { note } of this._window.iter()) {
            if (note.note.time >= beforeTicks && note.note.time < ticks) {
                this._playingNotes.play(note.note)
            }
        }

        const focusEvent = this.level.focusTrack.getEventBetweenTicks(beforeTicks, ticks)

        if (focusEvent)
            this._rig.transition(focusEvent.focus, focusEvent.time, focusEvent.duration)

        this._rig.update(ticks)
        this._playingNotes.update(ticks)

        this.playbackTime.set(this._time, ticks, this.level.tempoTrack.getTempoAt(ticks))
    }

    play() {
        if (this._playing)
            return

        this._playing = true
        if (this._time >= this.level.audioTrack.time)
            this._audioPlayer.play()
        else
            this._audioPlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.time - this._time))
    }

    pause() {
        this._audioPlayer.pause()
        this._playing = false
    }

    reset() {
        this._time = 0
        this.playbackTime.set(0, 0, this.level.tempoTrack.getTempoAt(0))
        this._audioPlayer.clearScheduledPlay()
        this._audioPlayer.pause()
        this._audioPlayer.seek(0)
        this._rig.focus(this.level.focusTrack.initialFocus)
        this._rig.update(0)
        this._playingNotes.update(0)
        this._metronome.reset()

        this._updateWindow()

        if (this._playing)
            this._audioPlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.time))
    }

}