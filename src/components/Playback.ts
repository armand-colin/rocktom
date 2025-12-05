import { Component, type Engine } from "@niloc/ecs";
import { Coroutine, Duration } from "@niloc/utils";
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
import { Time } from "./Time";
import { SoundEngine } from "../resources/SoundEngine";
import { Schedules } from "../Schedules";

export class Playback extends Component {

    readonly time: Time

    private _notes: PlaybackNote[] = []
    private _playingNotes: PlayingNotes3D

    private _soundEngine: SoundEngine
    private _rig: CameraRig
    private _metronome: Metronome
    private _speed = 1.0
    private _metronomeVolume = 0.2
    private _metronomeEnabled = false
    private _playingCoroutine: Coroutine | null = null
    private _renderer: Renderer
    private _loading = true

    private _window: NoteWindow

    private _audioPlayerVolume: number = 1.0
    private _audioPlayer: AudioPlayer

    constructor(
        engine: Engine,
        readonly level: Level,
    ) {
        super(engine)

        this.time = engine.createComponent(Time, level.tempoTrack.getTempoAt(0))

        const preferences = engine.getResource(PlaybackPreferences)
        this._soundEngine = engine.getResource(SoundEngine)
        this._audioPlayer = AudioPlayerFactory.create(
            engine,
            level.audioTrack,
            () => this.time.seconds,
            () => {
                this._loading = false
                this.changed()
            }
        )

        this._audioPlayerVolume = preferences.audioVolume
        this._audioPlayer.setVolume(this._audioPlayerVolume)

        this._rig = engine.createComponent(CameraRig, engine.getResource(Renderer).camera)
        this._metronome = engine.createComponent(Metronome, level.tempoTrack)


        this._renderer = engine.getResource(Renderer)

        const instrument = new Bass()
        const neck = NeckMesh.create(instrument)
        this._renderer.add(neck)

        this._playingNotes = new PlayingNotes3D(this.level.tempoTrack)
        this._renderer.add(this._playingNotes)

        this._notes = []

        for (const note of level.noteTrack.notes())
            this._notes.push(this.engine.createComponent(PlaybackNote, instrument, note))

        this._window = new NoteWindow(this._notes, this._renderer)
        this._updateWindow()

        this._rig.focus(level.focusTrack.initialFocus)

        Object.assign(window, { playback: this })
    }

    get loading() {
        return this._loading
    }

    get playing() {
        return this._playingCoroutine !== null
    }

    private _getTimeWindow() {
        let minTime = this.time.seconds - 2.0
        let maxTime = this.time.seconds + 10.0

        minTime = this.level.tempoTrack.ticksFromSeconds(minTime)
        maxTime = this.level.tempoTrack.ticksFromSeconds(maxTime)

        return { minTime, maxTime }
    }

    private _updateWindow() {
        const { minTime, maxTime } = this._getTimeWindow()
        const ticks = this.level.tempoTrack.ticksFromSeconds(this.time.seconds)

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

    play() {
        if (this.playing)
            return

        this._playingCoroutine = this.startCoroutine(this._play())

        if (this.time.seconds >= this.level.audioTrack.time)
            this._audioPlayer.play()
        else
            this._audioPlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.time - this.time.seconds))
    }

    seekTicks(ticks: number) {
        const seconds = this.level.tempoTrack.secondsFromTicks(ticks)
        this.time.set(seconds, ticks, this.level.tempoTrack.getTempoAt(ticks))
        this._updateWindow()

        // Find correct focus event
        const focusEvent = this.level.focusTrack.getEventAtTicks(ticks)
        if (!focusEvent) {
            this._rig.focus(this.level.focusTrack.initialFocus)
        } else {
            this._rig.transition(focusEvent.focus, focusEvent.time, focusEvent.duration)
        }
        this._rig.update(ticks)

        const audioSeekTime = Math.max(0, this.time.seconds - this.level.audioTrack.time)
        this._audioPlayer.seek(audioSeekTime)
        this._playingNotes.update(ticks)
    }

    private *_play() {
        let lastUpdate = this._soundEngine.currentTime
        while (true) {
            const deltaTime = this._soundEngine.currentTime - lastUpdate
            this._update(deltaTime)
            lastUpdate = this._soundEngine.currentTime
            yield Schedules.Frame
        }
    }

    private _update(deltaTime: number) {
        if (this.level.audioTrack.time <= this.time.seconds) {
            // Try to compensate for audio latency
            const audioDeltaTime = this.time.seconds - this._audioPlayer.getTime() - this.level.audioTrack.time
            deltaTime -= audioDeltaTime / 24
        }

        deltaTime = deltaTime * this._speed

        const beforeTicks = this.level.tempoTrack.ticksFromSeconds(this.time.seconds)
        const seconds = this.time.seconds + deltaTime
        const ticks = this.level.tempoTrack.ticksFromSeconds(seconds)
        this.time.set(seconds, ticks, this.level.tempoTrack.getTempoAt(ticks))
        
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
    }

    pause() {
        if (!this.playing)
            return

        this._playingCoroutine?.cancel()
        this._playingCoroutine = null

        this._audioPlayer.pause()
    }

    reset() {
        this.time.set(0, 0, this.level.tempoTrack.getTempoAt(0))
        this._audioPlayer.pause()
        this._audioPlayer.seek(0)
        this._rig.focus(this.level.focusTrack.initialFocus)
        this._rig.update(0)
        this._playingNotes.update(0)
        this._metronome.reset()

        this._updateWindow()

        if (this.playing)
            this._audioPlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.time))
    }

    destroy() {
        for (const note of this._notes)
            note.destroy()

        this._window.clear()
        this._audioPlayer.clear()
        this._rig.destroy()
        this._renderer.remove(this._playingNotes)
    }

}