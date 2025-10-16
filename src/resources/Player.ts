import type { Playback } from "../components/Playback";
import type { Coroutine } from "../engine/Coroutine";
import type { Engine } from "../engine/Engine";
import { Resource } from "../engine/Resource";
import { Schedule } from "../engine/Schedule";
import { Workspace } from "./Workspace";

export class Player extends Resource {

    private _time: number = 0
    private _lastUpdate: number = 0

    private _playingCoroutine: Coroutine | null = null
    private _workspace: Workspace
    private _playback: Playback | null = null

    constructor(engine: Engine) {
        super(engine)
        this._workspace = this.engine.getResource(Workspace)
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

        this._playingCoroutine = this.engine.coroutine(this._play())
    }

    pause() {
        if (this._playingCoroutine) {
            this._playingCoroutine.cancel()
            this._playingCoroutine = null
        }
    }

    reset() {
        this._time = 0
        this._lastUpdate = this.engine.sound.currentTime
        this._playback?.reset()
    }

    private *_play() {
        this._lastUpdate = this.engine.sound.currentTime

        while (true) {
            this._update()
            this._lastUpdate = this.engine.sound.currentTime
            yield Schedule.Frame
        }
    }

    private _update() {
        const deltaTime = this.engine.sound.currentTime - this._lastUpdate

        if (deltaTime === 0) {
            return
        }

        this._playback?.update(deltaTime)

        this._time += deltaTime
        this.changed()
    }

}