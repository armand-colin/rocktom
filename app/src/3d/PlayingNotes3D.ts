import { AnimationCurve } from "@niloc/utils"
import { Mesh, MeshBasicMaterial, Object3D, PlaneGeometry } from "three"
import { lerp } from "three/src/math/MathUtils.js"
import type { NoteEvent } from "../sound/song/NoteEvent"
import type { TempoTrack } from "../sound/song/TempoTrack"
import { Rules } from "./Rules"
import { AtlasSprite, TextureAtlas } from "./TextureAtlas"

class PlayingNote3D extends Object3D {

    private static _geometries = new Map<string, PlaneGeometry>()
    static _scaleRatio = 0.2

    private static geometry(event: NoteEvent): PlaneGeometry {
        const fretless = event.fret === 0
        const key = `${fretless ? 1 : 0}-${event.string.colorIndex}`
        let geometry = this._geometries.get(key)
        if (!geometry) {
            geometry = fretless
                ? new PlaneGeometry(Rules.fretWidth * 4, Rules.stringDistance * 0.3)
                : new PlaneGeometry(Rules.fretWidth * 0.6, Rules.stringDistance * 0.5)
            TextureAtlas.get().applyUvs(geometry, AtlasSprite.HighlightTile, event.string.colorIndex)
            this._geometries.set(key, geometry)
        }
        return geometry
    }

    private _ticks: number = 0
    private _event: NoteEvent
    private _fadeOutDuration: number
    private _material: MeshBasicMaterial
    private _mesh: Mesh

    constructor(event: NoteEvent, fadeOutDuration: number) {
        super()
        this._event = event
        this._fadeOutDuration = fadeOutDuration
        this._material = new MeshBasicMaterial({
            map: TextureAtlas.get().texture,
            transparent: true,
            opacity: 1.0,
        })

        this._mesh = new Mesh(PlayingNote3D.geometry(event), this._material)
        this.add(this._mesh)
        this._updatePosition()
    }

    get event() {
        return this._event
    }

    get finished() {
        const endTicks = this._event.time + this._event.duration + this._fadeOutDuration

        return this._ticks < this._event.time ||
            this._ticks >= endTicks
    }

    update(ticks: number) {
        this._ticks = ticks
        let t =
            ticks > this._event.time + this._event.duration ?
                (ticks - (this._event.time + this._event.duration)) / this._fadeOutDuration :
                0

        t = Math.max(0, Math.min(1, t))
        const easedT = AnimationCurve.EaseOut.sample(t)
        this._material.opacity = 1.0 - easedT
        this.scale.setScalar(1 + easedT * PlayingNote3D._scaleRatio)

        if (this.event.slide) {
            const slideStartTicks = this.event.time + this.event.duration - this.event.slide.duration

            if (slideStartTicks > ticks)
                return

            const slideT = Math.max(0, Math.min(1, (ticks - slideStartTicks) / this.event.slide.duration))
            const curve = this.event.slide.connect ?
                AnimationCurve.EaseInOut :
                AnimationCurve.EaseIn

            const easedSlideT = curve.sample(slideT)

            const startX = Rules.getX(this.event.fret)
            const endX = Rules.getX(this.event.slide.fret)
            const x = lerp(startX, endX, easedSlideT)

            this.position.x = x
            this.scale.x = 1 - easedSlideT
        }
    }

    set(event: NoteEvent, fadeOutDuration: number) {
        this._event = event
        this._fadeOutDuration = fadeOutDuration
        this._mesh.geometry = PlayingNote3D.geometry(event)
        this._updatePosition()
    }

    private _updatePosition() {
        const x = this._event.fret === 0 ?
            Rules.getX(this._event.fingerPosition + 1.5) :
            Rules.getX(this._event.fret)

        const y = Rules.getY(this._event.string.t)
        this.position.set(x, y, 0)
    }

}

export class PlayingNotes3D extends Object3D {

    private _pool: PlayingNote3D[] = []
    private _active: Set<PlayingNote3D> = new Set()
    private _tempoTrack: TempoTrack

    static fadeOutDurationInSeconds = 0.4

    constructor(tempoTrack: TempoTrack) {
        super()
        this._tempoTrack = tempoTrack
    }

    play(event: NoteEvent) {
        const fadeOutDurationTicks = this._tempoTrack.ticksFromSeconds(PlayingNotes3D.fadeOutDurationInSeconds, event.time + event.duration)

        for (const active of this._active) {
            if (active.event.fret === event.fret && active.event.string === event.string) {
                active.set(event, fadeOutDurationTicks)
                return
            }
        }

        if (this._pool.length === 0) {
            const note = new PlayingNote3D(event, fadeOutDurationTicks)
            this._active.add(note)
            this.add(note)
        } else {
            const note = this._pool.pop()!
            note.set(event, fadeOutDurationTicks)
            this._active.add(note)
            this.add(note)
        }
    }

    update(ticks: number) {
        const finished = []
        for (const note of this._active) {
            note.update(ticks)

            if (note.finished)
                finished.push(note)
        }

        for (const note of finished) {
            this._active.delete(note)
            this._pool.push(note)
            this.remove(note)
        }
    }

}
