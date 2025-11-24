import { Engine, Resource } from "@niloc/ecs";
import { type Coroutine, type CoroutineIterator } from "@niloc/utils";
import type { LiveInstrument } from "../components/LiveInstrument";
import type { Playback } from "../components/Playback";
import { Schedules } from "../Schedules";
import { Input, InputManager } from "./InputManager";
import { SoundEngine } from "./SoundEngine";

export class Player extends Resource {

    private _time: number = 0
    private _lastUpdate: number = 0

    private _playingCoroutine: Coroutine | null = null
    private _playback: Playback | null = null
    private _soundEngine: SoundEngine
    private _instrument: LiveInstrument | null = null

    constructor(engine: Engine) {
        super(engine)
        this._soundEngine = this.engine.getResource(SoundEngine)
        const inputManager = this.engine.getResource(InputManager)

        inputManager.register(Input.Play, () => {
            if (this.isPlaying)
                this.pause()
            else
                this.play()
        })

        inputManager.register(Input.Reset, () => {
            this.reset()
        })
    }

    get playback() {
        return this._playback
    }

    get time() {
        return this._time
    }

    get isPlaying() {
        return this._playingCoroutine !== null
    }

    get instrument() {
        return this._instrument
    }

    setInstrument(instrument: LiveInstrument | null) {
        if (this._instrument)
            this._instrument.destroy()

        this._instrument = instrument

        if (instrument) {
            const soundEngine = this.engine.getResource(SoundEngine)
            instrument.output.connect(soundEngine.output)
        }

        this.changed()
    }

    bind(playback: Playback) {
        this._playback = playback
        this._time = 0
        this.changed()
    }

    play() {
        if (this._playingCoroutine !== null)
            return

        if (this._playback && this._playback.loading)
            return
        
        this._playingCoroutine = this.engine.scheduler.add(this._play())
        this._playback?.play()
        this.changed()
    }

    pause() {
        if (this._playingCoroutine) {
            this._playingCoroutine.cancel()
            this._playingCoroutine = null
        }

        this._playback?.pause()
        this.changed()
    }

    reset() {
        this._time = 0
        this._lastUpdate = this._soundEngine.currentTime
        this._playback?.reset()
        this._update()
    }

    clear() {
        this.reset()
        this.pause()

        if (this._playback) {
            this._playback.destroy()
            this._playback = null
            this.changed()
        }
    }

    private *_play(): CoroutineIterator {
        this._lastUpdate = this._soundEngine.currentTime

        while (true) {
            this._update()
            this._lastUpdate = this._soundEngine.currentTime
            yield Schedules.Frame
        }
    }

    private _update() {
        const deltaTime = this._soundEngine.currentTime - this._lastUpdate
        this._playback?.update(deltaTime)
        this._time += deltaTime
    }

}