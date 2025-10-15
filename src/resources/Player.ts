import { PlayerNotes } from "../components/PlayerNotes";
import type { Coroutine } from "../engine/Coroutine";
import { Engine } from "../engine/Engine";
import { Resource } from "../engine/Resource";
import { Schedule } from "../engine/Schedule";
import type { MidiEvent } from "../sound/MidiEvent";
import { MusicSheet } from "../sound/MusicSheet";
import { Workspace } from "./Workspace";

export class Player extends Resource {

    private _time: number = 0
    private _lastUpdate: number = 0

    private _sheet: MusicSheet | null = null
    private _playingCoroutine: Coroutine | null = null
    private _workspace: Workspace
    private _playerNotes: PlayerNotes | null = null

    constructor() {
        super()
        this._workspace = Engine.instance.resource(Workspace)
    }

    get playerNotes() {
        return this._playerNotes
    }

    bind(sheet: MusicSheet, instrument: MidiEvent.InstrumentType) {
        this._sheet = sheet

        this._playerNotes = new PlayerNotes(
            sheet.events.filter(event => event.instrument === instrument),
            instrument
        )

        this._time = Engine.instance.sound.currentTime
        this.changed()
    }

    play() {
        if (this._playingCoroutine !== null)
            return

        this._playingCoroutine = Engine.instance.coroutine(this._play())
    }

    private *_play() {
        this._lastUpdate = Engine.instance.sound.currentTime

        while (true) {
            this._update()
            this._lastUpdate = Engine.instance.sound.currentTime
            yield Schedule.Frame
        }
    }

    private _update() {
        const deltaTime = Engine.instance.sound.currentTime - this._lastUpdate

        if (deltaTime === 0) {
            return
        }

        this._time += deltaTime
        this.changed()
    }

}