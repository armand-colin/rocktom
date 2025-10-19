import { Component } from "../engine/Component";
import type { Engine } from "../engine/Engine";
import type { Bass } from "../sound/Bass";
import { LevelEventType, type Level } from "../sound/Level";
import type { AudioBufferSoundNode } from "../sound/node/AudioElementSoundNode";

type PlaybackPlay = {
    time: number,
    string: Bass.String,
    noteNumber: number,
    duration: number,
    fret: number
}

export class Playback extends Component {

    private _time: number = 0
    private _plays: PlaybackPlay[]
    private _currentPlays: PlaybackPlay[]

    private _soundNode: AudioBufferSoundNode

    private _playingSong = false

    private _eventIndex = 0

    constructor(
        engine: Engine,
        readonly level: Level,
    ) {
        super(engine)

        this._soundNode = this.engine.sound.createAudioBufferNode(level.audioBuffer)
        this._soundNode.connect(this.engine.sound.output)

        this._plays = level.events
            .filter(event => event.type === LevelEventType.Note)
            .map(event => {
                return {
                    time: event.time,
                    string: event.note.string,
                    duration: event.note.duration,
                    fret: event.note.fret,
                    noteNumber: event.note.string.fret(event.note.fret),
                }
            })

        this._currentPlays = this._plays.slice(0, 30)
    }

    get plays() {
        return this._plays
    }

    get ticksPerSecond() {
        return this.level.timing.ticksPerSecond
    }

    private _isInWindow(play: PlaybackPlay) {
        const ticks = this._time * this.level.timing.ticksPerSecond
        const minDelta = -this.level.timing.seconds(1)
        const maxDelta = this.level.timing.seconds(3)
        const delta = play.time - ticks

        return delta >= minDelta && delta + play.duration <= maxDelta
    }

    private _getWindow() {
        return this._plays.filter(play => this._isInWindow(play))
    }

    private *_window() {
        // const minTicks = 
        // for (const play of this._plays) {

        // }
    }

    update(deltaTime: number) {
        // TODO: shall treat events that lies between time and time + deltaTime
        const previousTicks = this._time * this.ticksPerSecond

        this._time += deltaTime

        if (deltaTime === 0)
            return

        // Compute number of ticks to treat
        const ticks = this._time * this.ticksPerSecond

        // for (let i = 0; i < this._currentPlays.length; i++) {

        // }

        // for (const play of this._window(previousTicks)) {
        //     this._currentPlays.push(play)
        // }

        while (
            this._eventIndex < this.level.events.length &&
            this.level.events[this._eventIndex].time < ticks
        ) {
            const event = this.level.events[this._eventIndex]

            if (event.type === LevelEventType.AudioStart) {
                this._soundNode.play()
                this._playingSong = true
            }

            this._eventIndex += 1
        }
    }

    pause() {
        this._soundNode.pause()
        this._playingSong = false
    }

    reset() {
        this._time = 0
    }

}