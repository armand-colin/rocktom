import { Component, type Engine } from "@niloc/ecs";
import { Duration } from "@niloc/utils";
import { NeckMesh } from "../3d/NeckMesh";
import { PlaybackPreferences } from "../resources/PlaybackPreferences";
import { Renderer } from "../resources/Renderer";
import { YoutubePlayer } from "../resources/YoutubePlayer";
import { Bass } from "../sound/instrument/Instrument";
import { type Level } from "../sound/Level";
import { CameraRig } from "./CameraRig";
import { PlaybackNote } from "./PlaybackNote";
import { Metronome } from "./Metronome";
import { PlaybackTime } from "./PlaybackTime";

export class Playback extends Component {

    private _time: number = 0
    private _notes: PlaybackNote[] = []

    private _currentNotes: PlaybackNote[] = []

    private _youtubePlayer: YoutubePlayer
    private _rig: CameraRig
    private _metronome: Metronome
    private _speed = 1.0
    private _youtubeVolume = 1.0
    private _metronomeVolume = 0.2
    private _metronomeEnabled = false
    private _playing = false
    private _renderer: Renderer
    private _loading = true

    readonly playbackTime: PlaybackTime

    constructor(
        engine: Engine,
        readonly level: Level,
    ) {
        super(engine)

        const preferences = engine.getResource(PlaybackPreferences)
        this._youtubeVolume = preferences.youtubeVolume

        this.playbackTime = engine.createComponent(PlaybackTime, level.tempoTrack.getTempoAt(0))

        this._rig = engine.createComponent(CameraRig, engine.getResource(Renderer).camera)
        this._metronome = engine.createComponent(Metronome, level.tempoTrack)

        this._youtubePlayer = this.engine.getResource(YoutubePlayer)
        const audioTrack = level.audioTrack

        this._youtubePlayer.setVolume(this._youtubeVolume)
        this._youtubePlayer.load(audioTrack.youtubeVideoId)
            .then(() => {
                this._loading = false
                this.changed()
            })


        const instrument = new Bass()
        const neck = NeckMesh.create(instrument)
        this._renderer = engine.getResource(Renderer)
        this._renderer.add(neck)

        Object.assign(window, { playback: this })

        this._notes = level.bassTrack.notes.map(note => {
            return this.engine.createComponent(PlaybackNote, instrument, note)
        })

        this._updateWindow()

        this._rig.focus(level.focusTrack.initialFocus)
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

        for (let i = 0; i < this._currentNotes.length; i++) {
            const note = this._currentNotes[i]
            if (note.note.time + note.note.duration < minTime) {
                // Shall remove note
                this._renderer.remove(note.object)
                this._currentNotes.splice(i, 1)
                i--
            }

            if (note.note.time >= maxTime) {
                this._renderer.remove(note.object)
                this._currentNotes.splice(i, 1)
                i--
            }
        }

        for (const note of this._notes) {
            if (note.note.time + note.note.duration < minTime)
                continue

            if (note.note.time >= maxTime)
                continue // we're finished here

            if (this._currentNotes.length === 0) {
                this._currentNotes.push(note)
                this._renderer.add(note.object)
                note.update(ticks)
                continue
            }

            const firstNote = this._currentNotes[0]
            if (firstNote.note.time > note.note.time) {
                this._currentNotes.unshift(note)
                this._renderer.add(note.object)
                note.update(ticks)
                continue
            }

            const lastNote = this._currentNotes[this._currentNotes.length - 1]
            if (lastNote.note.time < note.note.time) {
                this._currentNotes.push(note)
                this._renderer.add(note.object)
                note.update(ticks)
                continue
            }
        }
    }

    get speed() {
        return this._speed
    }

    set speed(value: number) {
        this._speed = value
        this._youtubePlayer.setSpeed(value)
        this.changed()
    }

    get youtubeVolume() {
        return this._youtubeVolume
    }

    set youtubeVolume(value: number) {
        this._youtubeVolume = value
        this.engine.getResource(PlaybackPreferences).youtubeVolume = value
        this._youtubePlayer.setVolume(value)
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

        for (const note of this._currentNotes)
            this._renderer.remove(note.object)

        this._youtubePlayer.pause()
        this._rig.destroy()
    }

    seekTicks(ticks: number) {
        this._time = this.level.tempoTrack.secondsFromTicks(ticks)
        this._updateWindow()
        // TODO: update rig
        this.playbackTime.set(this._time, ticks, this.level.tempoTrack.getTempoAt(ticks))
        this._youtubePlayer.seek(this._time)
    }

    update(deltaTime: number) {
        if (this.level.audioTrack.startTime <= this._time) {
            // Try to compensate for Youtube lag
            const deltaTimeYoutube = this._time - this._youtubePlayer.time - this.level.audioTrack.startTime
            deltaTime -= deltaTimeYoutube / 24
        }

        const beforeTicks = this.level.tempoTrack.ticksFromSeconds(this._time)

        deltaTime = deltaTime * this._speed
        this._time += deltaTime

        const ticks = this.level.tempoTrack.ticksFromSeconds(this._time)

        if (this._metronomeEnabled)
            this._metronome.update(ticks)

        this._updateWindow()

        for (const note of this._currentNotes) {
            note.update(ticks)
            // if (note.note.time >= beforeTicks && note.note.time < ticks) {
            //     this._metronome.click()
            // }
        }

        const focusEvent = this.level.focusTrack.getEventBetweenTicks(beforeTicks, ticks)

        if (focusEvent) {
            const duration = Duration.fromSeconds(this.level.tempoTrack.ticksFromSeconds(focusEvent.duration))
            this._rig.transition(focusEvent.focus, duration)
        }

        this.playbackTime.set(this._time, ticks, this.level.tempoTrack.getTempoAt(ticks))
    }

    play() {
        if (this._playing)
            return

        this._playing = true
        if (this._time >= this.level.audioTrack.startTime)
            this._youtubePlayer.play()
        else
            this._youtubePlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.startTime - this._time))
    }

    pause() {
        this._youtubePlayer.pause()
        this._playing = false
    }

    reset() {
        this._time = 0
        this.playbackTime.set(0, 0, this.level.tempoTrack.getTempoAt(0))
        this._youtubePlayer.clearScheduledPlay()
        this._youtubePlayer.pause()
        this._youtubePlayer.seek(0)
        this._rig.focus(this.level.focusTrack.initialFocus)
        this._metronome.reset()

        for (const note of this._currentNotes)
            this._renderer.remove(note.object)
        this._currentNotes = []
        this._updateWindow()

        if (this._playing)
            this._youtubePlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.startTime))
    }

}