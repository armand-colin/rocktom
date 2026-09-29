import { Component, Engine } from "@niloc/ecs"
import { Tempo } from "../sound/Tempo"
import { TempoTrack } from "../sound/song/TempoTrack"
import { SoundEngine } from "../resources/SoundEngine"
import { Metronome } from "./Metronome"
import { MetronomeToolPreferences } from "../resources/MetronomeToolPreferences"

export class MetronomeTool extends Component {

    private readonly _tempoTrack: TempoTrack
    private readonly _metronome: Metronome
    private readonly _soundEngine: SoundEngine

    private _playing = false
    private _songSeconds = 0
    private _rafId: number | null = null
    private _lastFrameTime: number | null = null

    constructor(engine: Engine, bpm: number) {
        super(engine)

        this._soundEngine = engine.getResource(SoundEngine)
        this._tempoTrack = new TempoTrack(new Tempo(MetronomeToolPreferences.clamp(bpm)))
        this._metronome = engine.createComponent(Metronome, this._tempoTrack)
    }

    get playing() {
        return this._playing
    }

    get bpm() {
        return this._tempoTrack.initialTempo.bpm
    }

    get metronome() {
        return this._metronome
    }

    setBpm(bpm: number) {
        const clamped = MetronomeToolPreferences.clamp(bpm)
        this._tempoTrack.initialTempo = new Tempo(clamped)
        this._tempoTrack.events = []
        this._tempoTrack.refreshTime()

        if (this._playing) {
            this._metronome.sync(this._songSeconds, 1)
        }

        this.changed()
    }

    play() {
        if (this._playing)
            return

        this._soundEngine.resume()

        this._playing = true
        this._songSeconds = 0
        this._lastFrameTime = null
        this._metronome.sync(0, 1)
        this._rafId = requestAnimationFrame(this._tick)
        this.changed()
    }

    pause() {
        if (!this._playing)
            return

        this._playing = false
        this._lastFrameTime = null
        this._metronome.pause()

        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId)
            this._rafId = null
        }

        this.changed()
    }

    toggle() {
        if (this._playing)
            this.pause()
        else
            this.play()
    }

    click() {
        this._metronome.click()
    }

    destroy(): void {
        this.pause()
        this._metronome.destroy()
        super.destroy()
    }

    private _tick = (now: number) => {
        if (!this._playing)
            return

        if (this._lastFrameTime === null) {
            this._lastFrameTime = now
        } else {
            this._songSeconds += (now - this._lastFrameTime) / 1000
            this._lastFrameTime = now
        }

        const ticks = this._tempoTrack.ticksFromSeconds(this._songSeconds)
        this._metronome.update(ticks, 1)

        this._rafId = requestAnimationFrame(this._tick)
    }

}
