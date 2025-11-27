import { AnimationCurve } from "@niloc/utils";
import { Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Texture, TextureLoader } from "three";
import { lerp } from "three/src/math/MathUtils.js";
import texture from "../assets/highlightTile.png";
import type { NoteEvent } from "../sound/song/NoteEvent";
import { Tempo } from "../sound/Tempo";
import { Rules } from "./Rules";

class PlayingNote3D extends Object3D {

    static _loader = new TextureLoader()
    static _texture: Texture | null = null

    static _geometry: PlaneGeometry = new PlaneGeometry(Rules.fretWidth * 0.6, Rules.stringDistance * 0.5)
    static _emptyGeometry: PlaneGeometry = new PlaneGeometry(Rules.fretWidth * 4, Rules.stringDistance * 0.3)

    static _scaleRatio = 0.2

    static get texture() {
        if (!this._texture)
            this._texture = this._loader.load(texture)
        return this._texture
    }

    private _ticks: number = 0
    private _event: NoteEvent
    private _duration: number

    private _material: MeshBasicMaterial
    private _mesh: Mesh

    constructor(event: NoteEvent) {
        super()
        this._event = event
        this._duration = Math.max(event.duration, Tempo.PPQ)
        this._material = new MeshBasicMaterial({
            color: event.string.color,
            map: PlayingNote3D.texture,
            transparent: true,
            opacity: 1.0
        })

        const geometry = event.fret === 0 ?
            PlayingNote3D._emptyGeometry :
            PlayingNote3D._geometry

        this._mesh = new Mesh(geometry, this._material)
        this.add(this._mesh)
        this._updatePosition()
    }

    get event() {
        return this._event
    }

    get finished() {
        return this._ticks < this._event.time ||
            this._ticks >= this._event.time + this._duration
    }

    update(ticks: number) {
        this._ticks = ticks
        const t = Math.max(0, Math.min(1, (ticks - this._event.time) / this._duration))
        const easedT = AnimationCurve.EaseOut.sample(t)
        this._material.opacity = 1.0 - easedT
        this.scale.setScalar(1 + easedT * PlayingNote3D._scaleRatio)

        // Handle slide
        if (this.event.slide) {
            const slideStartTicks = this.event.time + this.event.duration - this.event.slide.duration

            if (slideStartTicks > ticks)
                return

            const slideT = Math.max(0, Math.min(1, (ticks - slideStartTicks) / this.event.slide.duration))
            const curve = this.event.slide.connect ?
                AnimationCurve.EaseInOut :
                AnimationCurve.EaseIn

            console.log(slideT)

            const easedSlideT = curve.sample(slideT)

            const startX = Rules.getX(this.event.fret)
            const endX = Rules.getX(this.event.slide.fret)
            const x = lerp(startX, endX, easedSlideT)

            console.log(x)

            this.position.x = x
        }
    }

    set(event: NoteEvent) {
        this._event = event
        // update material
        this._material.color.set(event.string.color)

        const geometry = event.fret === 0 ?
            PlayingNote3D._emptyGeometry :
            PlayingNote3D._geometry

        this._mesh.geometry = geometry
        this._duration = Math.max(event.duration, Tempo.PPQ)

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

    constructor() {
        super()
    }

    play(event: NoteEvent) {
        for (const active of this._active) {
            if (active.event.fret === event.fret && active.event.string === event.string) {
                active.set(event)
                return
            }
        }

        if (this._pool.length === 0) {
            const note = new PlayingNote3D(event)
            this._active.add(note)
            this.add(note)
        } else {
            const note = this._pool.pop()!
            note.set(event)
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