import { Engine, Resource } from "@niloc/ecs";
import { type Coroutine, type CoroutineIterator } from "@niloc/utils";
import type { Playback } from "../components/Playback";
import { Schedules } from "../Schedules";
import { SoundEngine } from "./SoundEngine";

export class Player extends Resource {

    private _time: number = 0
    private _lastUpdate: number = 0

    private _playingCoroutine: Coroutine | null = null
    private _playback: Playback | null = null
    private _soundEngine: SoundEngine

    constructor(engine: Engine) {
        super(engine)
        this._soundEngine = this.engine.getResource(SoundEngine)
    }

    get playback() {
        return this._playback
    }

    get time() {
        return this._time
    }

    bind(playback: Playback) {
        this._playback = playback
        this._time = 0
        this.changed()
    }

    play() {
        if (this._playingCoroutine !== null)
            return

        this._playingCoroutine = this.engine.scheduler.add(this._play())
        this._playback?.play()
    }

    pause() {
        if (this._playingCoroutine) {
            this._playingCoroutine.cancel()
            this._playingCoroutine = null
        }
        this._playback?.pause()
    }

    reset() {
        this._time = 0
        this._lastUpdate = this._soundEngine.currentTime
        this._playback?.reset()
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

        if (deltaTime === 0) {
            return
        }

        this._playback?.update(deltaTime)

        this._time += deltaTime
    }

}