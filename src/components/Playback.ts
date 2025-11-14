import { Component, type Engine } from "@niloc/ecs";
import { Duration } from "@niloc/utils";
import { NeckMesh } from "../3d/NeckMesh";
import { NoteMeshes } from "../resources/NoteMeshes";
import { PlaybackPreferences } from "../resources/PlaybackPreferences";
import { Renderer } from "../resources/Renderer";
import { YoutubePlayer } from "../resources/YoutubePlayer";
import { Bass } from "../sound/instrument/Instrument";
import { type Level } from "../sound/Level";
import { CameraRig } from "./CameraRig";
import { PlaybackNote } from "./PlaybackNote";
import { Metronome } from "./Metronome";

export class Playback extends Component {

    private _time: number = 0
    private _notes: PlaybackNote[] = []
    private _youtubePlayer: YoutubePlayer
    private _rig: CameraRig
    private _metronome: Metronome
    private _speed = 1.0
    private _youtubeVolume = 1.0
    private _metronomeVolume = 0.2
    private _metronomeEnabled = false

    constructor(
        engine: Engine,
        readonly level: Level,
    ) {
        super(engine)

        const preferences = engine.getResource(PlaybackPreferences)
        this._youtubeVolume = preferences.youtubeVolume

        this._rig = engine.createComponent(CameraRig, engine.getResource(Renderer).camera)
        this._metronome = engine.createComponent(Metronome)

        this._youtubePlayer = this.engine.getResource(YoutubePlayer)
        const audioTrack = level.audioTrack

        this._youtubePlayer.setVolume(this._youtubeVolume)
        this._youtubePlayer.load(audioTrack.youtubeVideoId)

        const instrument = new Bass()
        const neck = NeckMesh.create(instrument, engine.getResource(NoteMeshes))
        const renderer = engine.getResource(Renderer)
        renderer.add(neck)

        Object.assign(window, { playback: this })

        this._notes = level.bassTrack.notes.map(note => {
            return this.engine.createComponent(PlaybackNote, instrument, note)
        })

        this._rig.focus(level.focusTrack.initialFocus)
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

        this._youtubePlayer.pause()
        this._rig.destroy()
    }

    update(deltaTime: number) {
        if (this.level.audioTrack.startTime <= this._time) {
            // Try to compensate for Youtube lag
            const deltaTimeYoutube = this._time - this._youtubePlayer.time - this.level.audioTrack.startTime
            deltaTime -= deltaTimeYoutube / 24
        }

        const tempo = this.level.tempoTrack.initialTempo
        const beforeTicks = tempo.ticksFromSeconds(this._time)

        deltaTime = deltaTime * this._speed
        this._time += deltaTime

        const ticks = tempo.ticksFromSeconds(this._time)
        
        if (this._metronomeEnabled) 
            this._metronome.update(ticks)

        for (const note of this._notes)
            note.update(ticks)

        const focusEvent = this.level.focusTrack.getEventBetweenTicks(beforeTicks, ticks)

        if (focusEvent) {
            const duration = Duration.fromSeconds(tempo.secondsFromTicks(focusEvent.duration))
            this._rig.transition(focusEvent.focus, duration)
        }
    }

    play() {
        if (this._time >= this.level.audioTrack.startTime)
            this._youtubePlayer.play()
        else
            this._youtubePlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.startTime - this._time))
    }

    pause() {
        this._youtubePlayer.pause()
    }

    reset() {
        this._time = 0
        this._youtubePlayer.clearScheduledPlay()
        this._youtubePlayer.pause()
        this._youtubePlayer.seek(0)
        this._rig.focus(this.level.focusTrack.initialFocus)
        this._metronome.reset()
    }

}