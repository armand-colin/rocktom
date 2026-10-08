import type { Engine } from "@niloc/ecs"
import type { Object3D } from "three"
import { NeckMesh } from "../3d/NeckMesh"
import { PlayingNotes3D } from "../3d/PlayingNotes3D"
import { CameraRig } from "../components/CameraRig"
import { Renderer } from "../resources/Renderer"
import { NoteWindow } from "./NoteWindow"
import { PlaybackNote } from "./PlaybackNote"
import type { PlaybackRenderer } from "./PlaybackRenderer"
import type { Level } from "../sound/Level"
import type { InstrumentTrack } from "../sound/song/InstrumentTrack"

export class Playback3DRenderer implements PlaybackRenderer {

    private _renderer: Renderer
    private _rig: CameraRig
    private _playingNotes: PlayingNotes3D
    private _neck: Object3D | null = null
    private _notes: PlaybackNote[] = []
    private _window: NoteWindow | null = null

    private _lastTicks: number | null = null

    private _instrumentTrack: InstrumentTrack | null = null

    readonly level: Level

    constructor(engine: Engine, level: Level) {
        this.level = level

        this._renderer = engine.getResource(Renderer)
        this._rig = engine.createComponent(CameraRig, this._renderer.camera)
        this._playingNotes = new PlayingNotes3D(this.level.tempoTrack)
    }

    get canvas() {
        return this._renderer.element
    }

    setTrack(track: InstrumentTrack): void {
        this._clearTrack()

        this._instrumentTrack = track

        this._playingNotes.clear()

        this._neck = NeckMesh.create(track.instrument)
        this._renderer.add(this._neck)

        this._notes = [...track.noteTrack.notes()].map(note => new PlaybackNote(track.instrument, note))
        this._window = new NoteWindow(this._notes, this._renderer)

        this._lastTicks = null
    }

    sync(ticks: number, seconds: number, discontinuous = false): void {
        if (!this._window || !this._instrumentTrack)
            return

        const lastTicks = this._lastTicks
        const isDiscontinuous = discontinuous || lastTicks === null

        this._updateWindow(ticks, seconds)

        if (isDiscontinuous) {
            const focusEvent = this._instrumentTrack.focusTrack.getEventAtTicks(ticks)
            if (!focusEvent)
                this._rig.focus(this._instrumentTrack.focusTrack.initialFocus)
            else
                this._rig.transition(focusEvent.focus, focusEvent.time, focusEvent.duration)
        } else {
            for (const { note } of this._window.iter()) {
                if (note.note.time >= lastTicks && note.note.time < ticks)
                    this._playingNotes.play(note.note)
            }

            const focusEvent = this._instrumentTrack.focusTrack.getEventBetweenTicks(lastTicks, ticks)
            if (focusEvent)
                this._rig.transition(focusEvent.focus, focusEvent.time, focusEvent.duration)
        }

        this._rig.update(ticks)
        this._playingNotes.update(ticks)

        this._lastTicks = ticks
    }

    destroy(): void {
        this._clearTrack()

        this._renderer.remove(this._playingNotes)

        this._rig.destroy()
    }

    private _updateWindow(ticks: number, seconds: number) {
        if (!this._window || !this._instrumentTrack)
            return

        let minTime = seconds - 2.0
        let maxTime = seconds + 10.0

        minTime = this.level.tempoTrack.ticksFromSeconds(minTime)
        maxTime = this.level.tempoTrack.ticksFromSeconds(maxTime)

        this._window.update(ticks, minTime, maxTime)
    }

    private _clearTrack() {
        this._window?.clear()
        this._window = null
        this._notes = []
        this._playingNotes.clear()

        if (this._neck) {
            this._renderer.remove(this._neck)
            this._neck = null
        }

        this._instrumentTrack = null
        this._lastTicks = null
    }

}
